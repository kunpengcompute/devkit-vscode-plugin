import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
const hardUrl: any = require('../../assets/hard-coding/url.json');
@Injectable({
  providedIn: 'root'
})
export class MytipService {
  public a: any;
  public interval: any;
  constructor(private domSanitizer: DomSanitizer) {
    this.a = window.document.createElement('div');
    this.a.className = 'tip-box';
    this.a.innerHTML = '';
    window.document.querySelectorAll('body')[0].appendChild(this.a);
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
    clearInterval(this.interval);
    window.document.querySelectorAll('.tip-box')[0].innerHTML = '';
    let img = '';
    let imgClose = '';
    let html = '';
    const type = this.domSanitizer.sanitize(SecurityContext.HTML, options.type);
    switch (type) {
      case 'warn':
        img = ` <svg class="tip-icon" width="16px" height="16px" viewBox="0 0 16 16" version="1.1"
         xmlns="${hardUrl.w3cUrl}" xmlns:xlink="${hardUrl.xlinkUrl}">
        <title>告警16*16</title>
        <defs>
            <path d="M8.43574674,1.29374503 L15.9092204,14.5799204 C16.0446023,14.8205994 15.9592422,
            15.1254569 15.7185633,15.2608388 C15.6437224,15.3029368 15.5593011,15.3250511 15.4734326,
            15.3250511 L0.5264853,15.3250511 C0.250342925,15.3250511 0.0264853004,15.1011934 0.0264853004,
            14.8250511 C0.0264853004,
            14.7391826 0.04859957,14.6547613 0.0906975319,14.5799204 L7.5641712,1.29374503 C7.6995531,
            1.05306609 8.00441065,
            0.967705976 8.24508959,1.10308788 C8.32490184,1.14798227 8.39085235,1.21393278 8.43574674,
            1.29374503 Z" id="path-1"></path>
        </defs>
        <g id="告警16*16" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <mask id="mask-2" fill="white">
                <use xlink:href="#path-1"></use>
            </mask>
            <use id="蒙版" fill="#FF9B00" xlink:href="#path-1"></use>
            <path d="M8.703125,7.825 L8.9765625,13.7 L7.5,13.7 L7.71875,7.825 L8.703125,7.825 Z M8.921875,5.2 L8.921875,
            6.6765625 L7.5546875,6.6765625 L7.5546875,5.2 L8.921875,5.2 Z" id="形状结合" fill="#FFFFFF"
             fill-rule="nonzero" transform="translate(8.238281, 9.450000) scale(1, -1)
             translate(-8.238281, -9.450000) "></path>
        </g>
    </svg>`;
        imgClose = `<svg onclick='' class='tip-toggle' width="16px" height="16px" viewBox="0 0 16 16" version="1.1"
         xmlns="${hardUrl.w3cUrl}" xmlns:xlink="${hardUrl.xlinkUrl}">
        <title>关闭16*16</title>
        <defs>
            <path d="M12.4194174,3.58058262 C12.5929837,3.75414897 12.6122689,4.02357337 12.4772728,
            4.21844151 L12.4194174,
            4.2876894 L8.70710678,8 L12.4194174,11.7123106 C12.6146795,11.9075727 12.6146795,
            12.2241552 12.4194174,12.4194174 C12.245851,12.5929837 11.9764266,12.6122689 11.7815585,
            12.4772728 L11.7123106,12.4194174 L8,8.70710678 L4.2876894,12.4194174 C4.09242725,
            12.6146795 3.77584476,12.6146795 3.58058262,12.4194174 C3.40701627,12.245851 3.38773112,
            11.9764266 3.52272717,11.7815585 L3.58058262,11.7123106 L7.29289322,8 L3.58058262,
            4.2876894 C3.38532047,4.09242725 3.38532047,3.77584476 3.58058262,3.58058262 C3.75414897,
            3.40701627 4.02357337,3.38773112 4.21844151,3.52272717 L4.2876894,3.58058262 L8,
            7.29289322 L11.7123106,3.58058262 C11.9075727,3.38532047 12.2241552,3.38532047 12.4194174,
            3.58058262 Z" id="path-2"></path>
        </defs>
        <g id="关闭16*16" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <mask id="mask-2" fill="white">
                <use xlink:href="#path-2"></use>
            </mask>
            <use id="蒙版" fill="#FF9B00" fill-rule="nonzero" xlink:href="#path-2"></use>
        </g>
    </svg>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-warn"><div>` + img + options.content
        + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'success':
        img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/ok_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-success"><div>` + img + options.content
         + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'error':
        img = ` <img src='./assets/img/tip/error.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/error_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-error"><div>` + img + options.content
         + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'tip':
        img = ` <img src='./assets/img/tip/tip.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/tip_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-tip"><div>` + img + options.content
         + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      default:
        img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/ok_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-success"><div>` + img + options.content
         + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
    }
    this.a.innerHTML = html;
    this.a.style.display = 'block';
    const that = this;
    this.interval = setTimeout(() => {
      this.a.style.display = 'none';
    }, options.time);
    $('.tip-toggle').on('click', (e) => {
      this.a.style.display = 'none';
    });
  }
}
