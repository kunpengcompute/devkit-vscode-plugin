import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MytipService {
  public a: any;
  public interval: any;
  constructor() {
    this.a = window.document.createElement('div');
    this.a.className = 'tip-box';
    this.a.innerHTML = '';
    window.document.querySelectorAll('body')[0].appendChild(this.a);
  }
  public alertInfo(options: any) {
    clearTimeout(this.interval);
    window.document.querySelectorAll('.tip-box')[0].innerHTML = '';
    let img = '';
    let imgClose = '';
    let html = '';
    switch (options.type) {
      case 'warn':
        img = ` <img src='./assets/img/tip/warn.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/warn_close.svg' onclick='' class='tip-toggle'/>`;
        html = `<div class='mytip'> <div class="tip-content tip-content-warn"><div>` +
        img + options.content +
        ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'success':
        img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/ok_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-success"><div>`
        + img + options.content + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'error':
        img = ` <img src='./assets/img/tip/error.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/error_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-error"><div>`
        + img + options.content + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'tip':
        img = ` <img src='./assets/img/tip/tip.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/tip_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-tip"><div>`
        + img + options.content + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
      default:
        img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/ok_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-success"><div>`
        + img + options.content + ` </div><div class="tip-close"> ` + imgClose + ` </div></div></div>`;
        break;
    }
    this.a.innerHTML = html;
    this.a.style.display = 'block';
    this.interval = setTimeout(() => {
      this.a.style.display = 'none';
    }, options.time);
    $('.tip-toggle').on('click', (e) => {
      this.a.style.display = 'none';
    });
  }
}
