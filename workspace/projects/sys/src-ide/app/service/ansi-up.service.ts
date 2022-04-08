import { Injectable } from '@angular/core';

interface AUColor {
  rgb: number[];
  class_name: string;
}

// Represents the output of process_ansi(): a snapshot of the AnsiUp state machine
// at a given point in time, which wraps a fragment of text. This would allow deferred
// processing of text fragments and colors, if ever needed.
interface TextWithAttr {
  fg: AUColor;
  bg: AUColor;
  bold: boolean;
  text: string;
}

// Used internally when breaking up the raw text into packets
/**
 * Used internally when breaking up the raw text into packets
 */
enum PacketKind {
  EOS,
  Text,
  Incomplete,
  // An Incomplete ESC sequence
  ESC,
  // A single ESC char - random
  Unknown,
  // A valid CSI but not an SGR code
  SGR,
  // Select Graphic Rendition
  OSCURL,
  // Operating System Command
}

interface TextPacket {
  kind: PacketKind;
  text: string;
  url: string;
}

//
// PRIVATE FUNCTIONS
//

// ES5 template string transformer
function rgx(tmplObj, ...subst) {
  // Use the 'raw' value so we don't have to double backslash in a template string
  const regexText: string = tmplObj.raw[0];

  // Remove white-space and comments
  const wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
  const txt2 = regexText.replace(wsrgx, '');
  return new RegExp(txt2);
}

// ES5 template string transformer
// Multi-Line On
function rgxG(tmplObj, ...subst) {
  // Use the 'raw' value so we don't have to double backslash in a template string
  const regexText: string = tmplObj.raw[0];

  // Remove white-space and comments
  const wsrgx = /^\s+|\s+\n|\s*#[\s\S]*?\n|\n/gm;
  const txt2 = regexText.replace(wsrgx, '');
  return new RegExp(txt2, 'g');
}

@Injectable({
  providedIn: 'root'
})

export class AnsiUpService {
  // 256 Colors Palette
  // CSS RGB strings - ex. '255, 255, 255'
  private ansiColors: AUColor[][];
  private palette256: AUColor[];

  private fg: AUColor;
  private bg: AUColor;
  private bold: boolean;

  private useClasses: boolean;
  private escapeForHtml;

  private csiRegex: RegExp;

  private oscSt: RegExp;
  private oscRegex: RegExp;

  private urlWhitelist: {};

  private buffer: string;

  constructor() {
    // All construction occurs here
    this.setup_palettes();
    this.useClasses = false;
    this.escapeForHtml = true;

    this.bold = false;
    this.fg = this.bg = null;

    this.buffer = '';

    this.urlWhitelist = { http: 1, https: 1 };
  }

  set use_classes(arg: boolean) {
    this.useClasses = arg;
  }

  get use_classes(): boolean {
    return this.useClasses;
  }

  set escape_for_html(arg: boolean) {
    this.escapeForHtml = arg;
  }

  get escape_for_html(): boolean {
    return this.escapeForHtml;
  }

  set url_whitelist(arg: {}) {
    this.urlWhitelist = arg;
  }

  get url_whitelist(): {} {
    return this.urlWhitelist;
  }


  private setup_palettes(): void {
    this.ansiColors =
      [
        // Normal colors
        [
          { rgb: [0, 0, 0], class_name: 'ansi-black' },
          { rgb: [187, 0, 0], class_name: 'ansi-red' },
          { rgb: [0, 187, 0], class_name: 'ansi-green' },
          { rgb: [187, 187, 0], class_name: 'ansi-yellow' },
          { rgb: [0, 0, 187], class_name: 'ansi-blue' },
          { rgb: [187, 0, 187], class_name: 'ansi-magenta' },
          { rgb: [0, 187, 187], class_name: 'ansi-cyan' },
          { rgb: [255, 255, 255], class_name: 'ansi-white' }
        ],

        // Bright colors
        [
          { rgb: [85, 85, 85], class_name: 'ansi-bright-black' },
          { rgb: [255, 85, 85], class_name: 'ansi-bright-red' },
          { rgb: [0, 255, 0], class_name: 'ansi-bright-green' },
          { rgb: [255, 255, 85], class_name: 'ansi-bright-yellow' },
          { rgb: [85, 85, 255], class_name: 'ansi-bright-blue' },
          { rgb: [255, 85, 255], class_name: 'ansi-bright-magenta' },
          { rgb: [85, 255, 255], class_name: 'ansi-bright-cyan' },
          { rgb: [255, 255, 255], class_name: 'ansi-bright-white' }
        ]
      ];

    this.palette256 = [];

    // Index 0..15 : Ansi-Colors
    this.ansiColors.forEach(palette => {
      palette.forEach(rec => {
        this.palette256.push(rec);
      });
    });

    // Index 16..231 : RGB 6x6x6
    const levels = [0, 95, 135, 175, 215, 255];
    for (let colorR = 0; colorR < 6; ++colorR) {
      for (let colorG = 0; colorG < 6; ++colorG) {
        for (let colorB = 0; colorB < 6; ++colorB) {
          const col = { rgb: [levels[colorR], levels[colorG], levels[colorB]], class_name: 'truecolor' };
          this.palette256.push(col);
        }
      }
    }

    // Index 232..255 : Grayscale
    let greyLevel = 8;
    for (let i = 0; i < 24; ++i, greyLevel += 10) {
      const gry = { rgb: [greyLevel, greyLevel, greyLevel], class_name: 'truecolor' };
      this.palette256.push(gry);
    }
  }

  private escape_txt_for_html(txt: string): string {
    return txt.replace(/[&<>]/gm, (str) => {
      if (str === '&') {
        return '&amp;';
      }
      if (str === '<') {
        return '&lt;';
      }
      if (str === '>') {
        return '&gt;';
      }
    });
  }

  private appendbuffer(txt: string) {

    const str = this.buffer + txt;
    this.buffer = str;
  }

  private get_next_packet(): TextPacket {

    const pkt = {
      kind: PacketKind.EOS,
      text: '',
      url: ''
    };

    const len = this.buffer.length;
    if (len === 0) {
      return pkt;
    }

    const pos = this.buffer.indexOf('\x1B');

    // The most common case, no ESC codes
    if (pos === -1) {
      pkt.kind = PacketKind.Text;
      pkt.text = this.buffer;
      this.buffer = '';
      return pkt;
    }

    if (pos > 0) {
      pkt.kind = PacketKind.Text;
      pkt.text = this.buffer.slice(0, pos);
      this.buffer = this.buffer.slice(pos);
      return pkt;
    }

    // NOW WE HANDLE ESCAPES
    if (pos === 0) {

      if (len === 1) {
        // Lone ESC in Buffer, We don't know yet
        pkt.kind = PacketKind.Incomplete;
        return pkt;
      }

      const nextChar = this.buffer.charAt(1);

      // We treat this as a single ESC
      // Which effecitvely shows
      if ((nextChar !== '[') && (nextChar !== ']')) {
        // DeMorgan
        pkt.kind = PacketKind.ESC;
        pkt.text = this.buffer.slice(0, 1);
        this.buffer = this.buffer.slice(1);
        return pkt;
      }

      // OK is this an SGR or OSC that we handle

      // SGR CHECK
      if (nextChar === '[') {
        // We do this regex initialization here so
        // we can keep the regex close to its use (Readability)

        // All ansi codes are typically in the following format.
        // We parse it and focus specifically on the
        // graphics commands (SGR)
        //
        // CONTROL-SEQUENCE-INTRODUCER CSI             (ESC, '[')
        // PRIVATE-MODE-CHAR                           (!, <, >, ?)
        // Numeric parameters separated by semicolons  ('0' - '9', ';')
        // Intermediate-modifiers                      (0x20 - 0x2f)
        // COMMAND-CHAR                                (0x40 - 0x7e)
        //

        if (!this.csiRegex) {

          this.csiRegex = rgx`
                        ^                           # beginning of line
                                                    #
                                                    # First attempt
                        (?:                         # legal sequence
                          \x1b\[                      # CSI
                          ([\x3c-\x3f]?)              # private-mode char
                          ([\d;]*)                    # any digits or semicolons
                          ([\x20-\x2f]?               # an intermediate modifier
                          [\x40-\x7e])                # the command
                        )
                        |                           # alternate (second attempt)
                        (?:                         # illegal sequence
                          \x1b\[                      # CSI
                          [\x20-\x7e]*                # anything legal
                          ([\x00-\x1f:])              # anything illegal
                        )
                    `;
        }

        const match = this.buffer.match(this.csiRegex);

        // This match is guaranteed to terminate (even on
        // invalid input). The key is to match on legal and
        // illegal sequences.
        // The first alternate matches everything legal and
        // the second matches everything illegal.
        //
        // If it doesn't match, then we have not received
        // either the full sequence or an illegal sequence.
        // If it does match, the presence of field 4 tells
        // us whether it was legal or illegal.

        if (match === null) {
          pkt.kind = PacketKind.Incomplete;
          return pkt;
        }

        // match is an array
        // 0 - total match
        // 1 - private mode chars group
        // 2 - digits and semicolons group
        // 3 - command
        // 4 - illegal char

        if (match[4]) {
          // Illegal sequence, just remove the ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = this.buffer.slice(0, 1);
          this.buffer = this.buffer.slice(1);
          return pkt;
        }

        // If not a valid SGR, we don't handle
        if ((match[1] !== '') || (match[3] !== 'm')) {
          pkt.kind = PacketKind.Unknown;
        } else {
          pkt.kind = PacketKind.SGR;
        }

        pkt.text = match[2];
        // Just the parameters

        const rpos = match[0].length;
        this.buffer = this.buffer.slice(rpos);
        return pkt;
      }

      // OSC CHECK
      if (nextChar === ']') {
        if (len < 4) {
          pkt.kind = PacketKind.Incomplete;
          return pkt;
        }

        if ((this.buffer.charAt(2) !== '8')
          || (this.buffer.charAt(3) !== ';')) {
          // This is not a match, so we'll just treat it as ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = this.buffer.slice(0, 1);
          this.buffer = this.buffer.slice(1);
          return pkt;
        }

        // We do this regex initialization here so
        // we can keep the regex close to its use (Readability)

        // Matching a Hyperlink OSC with a regex is difficult
        // because Javascript's regex engine doesn't support
        // 'partial match' support.
        //
        // Therefore, we require the system to match the
        // string-terminator(ST) before attempting a match.
        // Once we find it, we attempt the Hyperlink-Begin
        // match.
        // If that goes ok, we scan forward for the next
        // ST.
        // Finally, we try to match it all and return
        // the sequence.
        // Also, it is important to note that we consider
        // certain control characters as an invalidation of
        // the entire sequence.

        // We do regex initializations here so
        // we can keep the regex close to its use (Readability)


        // STRING-TERMINATOR
        // This is likely to terminate in most scenarios
        // because it will terminate on a newline

        if (!this.oscSt) {

          this.oscSt = rgxG`
                        (?:                         # legal sequence
                          (\x1b\\)                    # ESC \
                          |                           # alternate
                          (\x07)                      # BEL (what xterm did)
                        )
                        |                           # alternate (second attempt)
                        (                           # illegal sequence
                          [\x00-\x06]                 # anything illegal
                          |                           # alternate
                          [\x08-\x1a]                 # anything illegal
                          |                           # alternate
                          [\x1c-\x1f]                 # anything illegal
                        )
                    `;
        }

        // VERY IMPORTANT
        // We do a stateful regex match with exec.
        // If the regex is global, and it used with 'exec',
        // then it will search starting at the 'lastIndex'
        // If it matches, the regex can be used again to
        // find the next match.
        this.oscSt.lastIndex = 0;


        {
          const result = this.oscSt.exec(this.buffer);

          if (result === null) {
            pkt.kind = PacketKind.Incomplete;
            return pkt;
          }

          // If an illegal character was found, bail on the result
          if (result[3]) {
            // Illegal sequence, just remove the ESC
            pkt.kind = PacketKind.ESC;
            pkt.text = this.buffer.slice(0, 1);
            this.buffer = this.buffer.slice(1);
            return pkt;
          }
        }



        // OK - we might have the prefix and URI
        // Lets start our search for the next ST
        // past this index

        {
          const result = this.oscSt.exec(this.buffer);

          if (result === null) {
            pkt.kind = PacketKind.Incomplete;
            return pkt;
          }

          // If an illegal character was found, bail on the result
          if (result[3]) {
            // Illegal sequence, just remove the ESC
            pkt.kind = PacketKind.ESC;
            pkt.text = this.buffer.slice(0, 1);
            this.buffer = this.buffer.slice(1);
            return pkt;
          }
        }

        // OK, at this point we should have a FULL match!
        //
        // Lets try to match that now

        if (!this.oscRegex) {

          this.oscRegex = rgx`
                        ^                           # beginning of line
                                                    #
                        \x1b\]8;                    # OSC Hyperlink
                        [\x20-\x3a\x3c-\x7e]*       # params (excluding ;)
                        ;                           # end of params
                        ([\x21-\x7e]{0,512})        # URL capture
                        (?:                         # ST
                          (?:\x1b\\)                  # ESC \
                          |                           # alternate
                          (?:\x07)                    # BEL (what xterm did)
                        )
                        ([\x21-\x7e]+)              # TEXT capture
                        \x1b\]8;;                   # OSC Hyperlink End
                        (?:                         # ST
                          (?:\x1b\\)                  # ESC \
                          |                           # alternate
                          (?:\x07)                    # BEL (what xterm did)
                        )
                    `;
        }

        const match = this.buffer.match(this.oscRegex);

        if (match === null) {
          // Illegal sequence, just remove the ESC
          pkt.kind = PacketKind.ESC;
          pkt.text = this.buffer.slice(0, 1);
          this.buffer = this.buffer.slice(1);
          return pkt;
        }

        // match is an array
        // 0 - total match
        // 1 - URL
        // 2 - Text

        // If a valid SGR
        pkt.kind = PacketKind.OSCURL;
        pkt.url = match[1];
        pkt.text = match[2];

        const rpos = match[0].length;
        this.buffer = this.buffer.slice(rpos);
        return pkt;
      }
    }
  }

  /**
   * main
   * @param txt txt文本
   * @param withTag 是否携带标签，复制文本和下载不需要携带标签
   */
  ansi_to_html(txt: string, withTag = true): string {

    this.appendbuffer(txt);

    const blocks: string[] = [];

    while (true) {
      const packet = this.get_next_packet();

      if ((packet.kind === PacketKind.EOS) || (packet.kind === PacketKind.Incomplete)) {
        break;
      }

      // Drop single ESC or Unknown CSI
      if ((packet.kind === PacketKind.ESC) || (packet.kind === PacketKind.Unknown)) {
        continue;
      }

      if (packet.kind === PacketKind.Text) {
        blocks.push(this.transform_to_html(this.with_state(packet), withTag));
      } else {
        if (packet.kind === PacketKind.SGR) {
          this.process_ansi(packet);
        } else {
          if (packet.kind === PacketKind.OSCURL) {
            blocks.push(this.process_hyperlink(packet));
          }
        }
      }
    }

    return blocks.join('');
  }

  private with_state(pkt: TextPacket): TextWithAttr {
    return { bold: this.bold, fg: this.fg, bg: this.bg, text: pkt.text };
  }

  private process_ansi(pkt: TextPacket) {
    // Ok - we have a valid 'SGR' (Select Graphic Rendition)

    const sgrCmds = pkt.text.split(';');

    // Each of these params affects the SGR state

    // Why do we shift through the array instead of a forEach??
    // ... because some commands consume the params that follow !
    while (sgrCmds.length > 0) {
      const sgrCmdStr = sgrCmds.shift();
      const num = parseInt(sgrCmdStr, 10);

      if (isNaN(num) || num === 0) {
        this.fg = this.bg = null;
        this.bold = false;
      } else if (num === 1) {
        this.bold = true;
      } else if (num === 22) {
        this.bold = false;
      } else if (num === 39) {
        this.fg = null;
      } else if (num === 49) {
        this.bg = null;
      } else if ((num >= 30) && (num < 38)) {
        this.fg = this.ansiColors[0][(num - 30)];
      } else if ((num >= 40) && (num < 48)) {
        this.bg = this.ansiColors[0][(num - 40)];
      } else if ((num >= 90) && (num < 98)) {
        this.fg = this.ansiColors[1][(num - 90)];
      } else if ((num >= 100) && (num < 108)) {
        this.bg = this.ansiColors[1][(num - 100)];
      } else if (num === 38 || num === 48) {

        // extended set foreground/background color

        // validate that param exists
        if (sgrCmds.length > 0) {
          // extend color (38=fg, 48=bg)
          const isForeground = (num === 38);

          const modeCmd = sgrCmds.shift();

          // MODE '5' - 256 color palette
          if (modeCmd === '5' && sgrCmds.length > 0) {
            const paletteIndex = parseInt(sgrCmds.shift(), 10);
            if (paletteIndex >= 0 && paletteIndex <= 255) {
              if (isForeground) {
                this.fg = this.palette256[paletteIndex];
              } else {
                this.bg = this.palette256[paletteIndex];
              }
            }
          }

          // MODE '2' - True Color
          if (modeCmd === '2' && sgrCmds.length > 2) {
            const r = parseInt(sgrCmds.shift(), 10);
            const g = parseInt(sgrCmds.shift(), 10);
            const b = parseInt(sgrCmds.shift(), 10);

            if ((r >= 0 && r <= 255) && (g >= 0 && g <= 255) && (b >= 0 && b <= 255)) {
              const c = { rgb: [r, g, b], class_name: 'truecolor' };
              if (isForeground) {
                this.fg = c;
              } else {
                this.bg = c;
              }
            }
          }
        }
      }
    }
  }

  private transform_to_html(fragment: TextWithAttr, withTag: boolean): string {
    let txt = fragment.text;

    if (txt.length === 0 || !withTag) {
      return txt;
    }

    if (this.escapeForHtml) {
      txt = this.escape_txt_for_html(txt);
    }

    // If colors not set, default style is used
    if (!fragment.bold && fragment.fg === null && fragment.bg === null) {
      return txt;
    }

    const styles: string[] = [];
    const classes: string[] = [];

    if (fragment.bold) {
      styles.push('font-weight:bold');
    }

    if (!this.useClasses) {
      if (fragment.fg) {
        styles.push(`color: rgb(${fragment.fg.rgb.join(',')})`);
      }
      if (fragment.bg) {
        styles.push(`background-color: rgb(${fragment.bg.rgb})`);
      }
    } else {
      // USE CLASSES
      if (fragment.fg) {
        if (fragment.fg.class_name !== 'truecolor') {
          classes.push(`${fragment.fg.class_name}-fg`);
        } else {
          styles.push(`color: rgb(${fragment.fg.rgb.join(',')})`);
        }
      }
      if (fragment.bg) {
        if (fragment.bg.class_name !== 'truecolor') {
          classes.push(`${fragment.bg.class_name}-bg`);
        } else {
          styles.push(`background-color: rgb(${fragment.bg.rgb.join(',')})`);
        }
      }
    }

    let classString = '';
    let styleString = '';

    if (classes.length) {
      classString = ` class='${classes.join(' ')}'`;
    }

    if (styles.length) {
      styleString = ` style='${styles.join(';')}'`;
    }

    return `<span${styleString}${classString}>${txt}</span>`;
  }

  private process_hyperlink(pkt: TextPacket): string {
    // Check URL scheme
    const parts = pkt.url.split(':');
    if (parts.length < 1) {
      return '';
    }

    if (!this.urlWhitelist[parts[0]]) {
      return '';
    }

    const result = `<a href='${this.escape_txt_for_html(pkt.url)}'>${this.escape_txt_for_html(pkt.text)}</a>`;
    return result;
  }
}
