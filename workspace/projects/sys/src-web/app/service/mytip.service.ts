import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MyTip, MyTipOptions } from 'sys/model';
@Injectable({
  providedIn: 'root'
})
export class MytipService extends MyTip {
  private a: any;
  private interval: any;

  constructor(
    private domSanitizer: DomSanitizer
  ) {
    super();
    this.a = window.document.createElement('div');
    this.a.className = 'tip-box';
    this.a.innerHTML = '';
    window.document.querySelectorAll('body')[0].appendChild(this.a);
  }

  public alertInfo(options: MyTipOptions) {
    window.document.querySelectorAll('.tip-box')[0].innerHTML = '';
    let img = '';
    let imgClose = '';
    let html = '';
    const content = this.domSanitizer.sanitize(SecurityContext.HTML, options.content);
    switch (options.type) {
      case 'warn':
        img = ` <img src='./assets/img/tip/warn.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/warn_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-warn"><div>`
          + img + content + ` </div><div class="tip-close"
        style="margin-left: 10px;"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'success':
        img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/ok_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-success"><div>`
          + img + content + ` </div><div class="tip-close"
        style="margin-left: 10px;"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'error':
        img = ` <img src='./assets/img/tip/error.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/error_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-error"><div>`
          + img + content + ` </div><div class="tip-close"
        style="margin-left: 10px;"> ` + imgClose + ` </div></div></div>`;
        break;
      case 'tip':
        img = ` <img src='./assets/img/tip/tip.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/tip_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-tip"><div>`
          + img + content + ` </div><div class="tip-close"
        style="margin-left: 10px;"> ` + imgClose + ` </div></div></div>`;
        break;
      default:
        img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
        imgClose = ` <img src='./assets/img/tip/ok_close.svg' onclick='' class='tip-toggle'/>`;
        html = ` <div class='mytip'> <div class="tip-content tip-content-success"><div>`
          + img + content + ` </div><div class="tip-close"
        style="margin-left: 10px;"> ` + imgClose + ` </div></div></div>`;
        break;
    }
    this.a.innerHTML = html;
    this.a.style.display = 'block';

    $('.tip-toggle').on('click', (e) => {
      this.a.style.display = 'none';
    });

    this.tipDisplayManager(options.time || 3500);
  }

  public warn(content: string, time?: number): void {
    this.alertInfo({
      type: 'warn',
      content,
      time,
    });
  }

  public success(content: string, time?: number): void {
    this.alertInfo({
      type: 'success',
      content,
      time,
    });
  }

  public error(content: string, time?: number): void {
    this.alertInfo({
      type: 'error',
      content,
      time,
    });
  }

  public tip(content: string, time?: number): void {
    this.alertInfo({
      type: 'tip',
      content,
      time,
    });
  }

  private tipDisplayManager(delay: number) {
    clearInterval(this.interval);
    this.interval = setTimeout(() => {
      this.a.style.display = 'none';
    }, delay);

    $(this.a).on('mouseenter', () => {
      clearInterval(this.interval);
    });

    $(this.a).on('mouseleave', () => {
      // 重新计时
      clearInterval(this.interval);
      this.interval = setTimeout(() => {
        this.a.style.display = 'none';
      }, delay);
    });
  }

}
