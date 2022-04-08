import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MytipService {
  public a: any;
  public wsTip: any;
  public interval: any;
  constructor(
    public domSanitizer: DomSanitizer
  ) {
    this.a = window.document.createElement('div');
    this.a.className = 'tip-box';
    this.a.innerHTML = '';
    window.document.querySelectorAll('body')[0].appendChild(this.a);
    this.wsTip = window.document.createElement('div');
    this.wsTip.className = 'wsTip-box';
    this.wsTip.innerHTML = '';
    window.document.querySelectorAll('body')[0].appendChild(this.wsTip);
  }

  public escapeHtml(strings: any) {
    const entityMap: any = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#x2F;'
    };
    return String(strings).replace(/[&<>"'\/]/g, (s) => {
      return entityMap[s];
    });
  }

  public alertInfo(options: any) {
    let interval: any;
    window.document.querySelectorAll('.tip-box')[0].innerHTML = '';
    let img = '';
    let imgClose = '';
    let html = '';
    switch (options.type) {
      case 'warn':
        img = ` <img src='./assets/img/newSvg/warn.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/warn_close.svg' onclick='' class='tip-close-btn'/>`;
        html = ` <div class='mytip'>
          <div class="tip-content tip-content-warn"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
      case 'success':
        img = ` <img src='./assets/img/newSvg/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/ok_close.svg' onclick='' class='tip-close-btn'/>`;
        html = ` <div class='mytip'>
          <div class="tip-content tip-content-success"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
      case 'error':
        img = ` <img src='./assets/img/newSvg/error.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/error_close.svg' onclick='' class='tip-close-btn'/>`;
        html = ` <div class='mytip'>
          <div class="tip-content tip-content-error"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
      case 'tip':
        img = ` <img src='./assets/img/newSvg/tip.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/tip_close.svg' onclick='' class='tip-close-btn'/>`;
        html = ` <div class='mytip'>
          <div class="tip-content tip-content-tip"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
      default:
        img = ` <img src='./assets/img/newSvg/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/ok_close.svg' onclick='' class='tip-close-btn'/>`;
        html = ` <div class='mytip'>
          <div class="tip-content tip-content-success"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
    }
    html = `${html}`;
    if (this.wsTip.innerHTML === '') {
      this.a.style.top = '50px';
    } else {
      this.a.style.top = '100px';
    }
    this.a.innerHTML = html;
    this.a.style.display = 'block';
    interval = setTimeout(() => {
      this.a.style.display = 'none';
      this.wsTip.style.top = '50px';
    }, options.time);
    $('.tip-close-btn').on('click', (e) => {
      clearInterval(interval);
      interval = null;
      this.a.style.display = 'none';
    });
  }

  public wsErrorTip(options: any) {
    let img = '';
    let imgClose = '';
    let html = '';
    switch (options.type) {
      case 'warn':
        img = ` <img  src='./assets/img/newSvg/warn.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/warn_close.svg' class='tip-close-btn-ws'/>`;
        html = ` <div class='myWstip'>
          <div class="tip-content tip-content-warn"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
      default:
        img = ` <img src='./assets/img/newSvg/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/newSvg/ok_close.svg' onclick='' class='tip-close-btn'/>`;
        html = ` <div class='myWstip'>
          <div class="tip-content tip-content-success"><div>` + img +
           this.domSanitizer.sanitize(SecurityContext.HTML, options.content) +
          ` </div><div class="tip-close"> ` + imgClose + ` </div></div>
        </div>`;
        break;
    }
    html = `${html}`;
    if (this.a.style.display !== 'block') {
      this.wsTip.style.top = '50px';
    } else {
      this.wsTip.style.top = '100px';
    }
    this.wsTip.innerHTML = html;
    this.wsTip.style.display = 'block';
  }
  public clearWsTip() {
    this.wsTip.innerHTML = '';
    this.wsTip.style.display = 'none';
  }
}
