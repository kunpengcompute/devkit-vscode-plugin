import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MytipService {
    public a: any;
    constructor() {
        this.a = window.document.createElement('div');
        this.a.className = 'tip-box';
        this.a.innerHTML = '';
        window.document.querySelectorAll('body')[0].appendChild(this.a);
    }

    /**
     * 特殊字符转换
     * @param str 特殊字符
     */
    public escapeHtml(str: any) {
        const entityMap: any = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\"': '&quot;',
            '\'': '& #39;',
            '/': '&#x2F;'
        };
        return String(str).replace(/[&<>''\/]/g, (s) => {
            return entityMap[s];
        });
    }

    /**
     * 告警
     * @param options 告警类型
     */
    public alertInfo(options: any) {
        let img = '';
        let interval: any;
        switch (options.type) {
            case 'warn':
                img = ` <img src='./assets/img/tip/warn.svg' class='tip-icon' />`;
                break;
            case 'success':
                img = ` <img src='./assets/img/tip/ok.svg' class='tip-icon' />`;
                break;
            default:
                img = ` <img src='./assets/img/tip/ok.svg' class='tip-icon' />`;
                break;
        }
        let html = ``;
        if (options.detail !== undefined) {
            options.detail = this.escapeHtml(options.detail);
            html = `
      <div class='mytip'>
        <div class='tip-content'>
          ${img + options.content}
          <img src='./assets/img/header/select-right.png' onclick='' class='tip-toggle'>
          <div class='tip-detail' >${options.detail}</div>
        </div>
      </div>
    `;
        } else {
            html = `
      <div class='mytip'>
        <div class='tip-content'>
          ${img + options.content}
          <div class="tip-close">
            <img src='./assets/img/home/close.svg' class="tip-close-btn">
          </div>
        </div>
      </div>
      `;
        }

        this.a.innerHTML = html;
        this.a.style.display = 'block';
        interval = setTimeout(() => {
            this.a.style.display = 'none';
        }, options.time);
        $('.tip-toggle').on('click', (e) => {
            clearInterval(interval);
            if ($(e.target).hasClass('active')) {
                $('.tip-detail').removeClass('active');
                $('.tip-toggle').removeClass('active');

                interval = setTimeout(() => {
                    this.a.style.display = 'none';
                }, options.time);
            } else {
                $('.tip-detail').addClass('active');
                $('.tip-toggle').addClass('active');

                interval = setTimeout(() => {
                    this.a.style.display = 'none';
                }, 10000);
            }
        });

        $('.tip-close-btn').on('click', (e) => {
            clearInterval(interval);
            interval = null;
            this.a.style.display = 'none';
        });
    }
}
