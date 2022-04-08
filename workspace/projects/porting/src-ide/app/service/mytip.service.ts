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
    public alertInfo(options: any) {
        let img = '';
        switch (options.type) {
            case 'warn':
                img = ` <img src='./assets/img/tip/warn.svg' class="tip-icon" />`;
                break;
            case 'success':
                img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
                break;
            default:
                img = ` <img src='./assets/img/tip/ok.svg' class="tip-icon" />`;
                break;
        }
        const html = `
    <div class='mytip'>
        <div class="tip-content">`
            + img + options.content +
            `
      </div>
    </div>
    `;

        this.a.innerHTML = html;
        this.a.style.display = 'block';
        setTimeout(() => {
            this.a.style.display = 'none';
        }, options.time);
    }
}
