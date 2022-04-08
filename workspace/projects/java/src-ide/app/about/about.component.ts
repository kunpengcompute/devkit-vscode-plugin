import { Component, OnInit } from '@angular/core';
import { I18nService } from '../service/i18n.service';
@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
    public logoSrc: any = './assets/img/header/aboutLogo.png';
    public i18n: any;
    public gone = true;
    constructor(public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 关闭对话框
     */
    public close(): void {
        this.gone = !this.gone;
    }

    /**
     * 开启对话框
     */
    public open(): void {
        this.gone = false;
    }
}
