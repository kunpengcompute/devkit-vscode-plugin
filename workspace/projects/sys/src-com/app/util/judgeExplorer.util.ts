
import { ExplorerType } from 'sys/src-com/app/domain';

declare const InstallTrigger: any;

export function judgeExplorer(): ExplorerType | undefined {
  // Opera 8.0+
  const isOpera =
    !!(window as any)?.opr?.addons
    || !!(window as any).opera
    || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+
  const isSafari =
    /constructor/i.test((window as any).HTMLElement)
    || ((p): boolean => {
      return p.toString() === '[object SafariRemoteNotification]';
    })(
      !(window as any).safari
      || (window as any)?.safari?.pushNotification
    );

  // Internet Explorer 6-11
  const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;

  // Edge 20+
  const isEdge = !isIE && !!(window as any).StyleMedia;

  // Chrome 1 - 79
  const isChrome = !!(window as any)?.chrome?.webstore || !!(window as any)?.chrome?.runtime;

  // Edge (based on chromium) detection
  const isEdgeChromium =
    isChrome
    && (navigator.userAgent.indexOf('Edg') !== -1);

  // Blink engine detection
  const isBlink = (isChrome || isOpera) && !!window.CSS;

  let explorerType: ExplorerType;
  switch (true) {
    case isOpera:
      explorerType = ExplorerType.Opera;
      break;
    case isSafari:
      explorerType = ExplorerType.Safari;
      break;
    case isFirefox:
      explorerType = ExplorerType.Firefox;
      break;
    case isIE:
      explorerType = ExplorerType.IE;
      break;
    case isEdge:
      explorerType = ExplorerType.Edge;
      break;
    case isChrome:
      explorerType = ExplorerType.Chrome;
      break;
    case isEdgeChromium:
      explorerType = ExplorerType.EdgeChromium;
      break;
    case isBlink:
      explorerType = ExplorerType.Blink;
      break;
    default:
  }

  return explorerType;
}
