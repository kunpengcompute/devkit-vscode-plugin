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
     * 特殊符号转换
     * @param strings 特殊符号
     */
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

    /**
     * 告警
     */
    public alertInfo(options: any) {
        let img = ''; const alertCoin = '';
        let interval: any;
        switch (options.type) {
            case 'warn':
                img = ` <img src='./assets/img/tip/warn.svg' class="tip-icon" />`;
                options.time = 10000;
                break;
            case 'success':
                img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
                options.time = 4000;
                break;
            default:
                img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
                options.time = 4000;
                break;
        }
        let html = ``;
        options.content = this.escapeHtml(options.content);
        if (options.detail !== undefined) {
            options.detail = this.escapeHtml(options.detail);
            html = ` <div class='mytip'>
      <div class="tip-content" style=' z-index: 15000;display:inline-block'>`
                + img + options.content +
                `
          <img src='./assets/img/header/select-right.png' onclick='' class='tip-toggle'>
          <div class='tip-detail' >` + options.detail + `</div>
        </div>

    </div>
    `;
        } else {
            html = ` <div class='mytip'>
      <div class="tip-content" style=' z-index: 15000;display:inline-block'>`
                + img + options.content +
                `

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
    }
}
