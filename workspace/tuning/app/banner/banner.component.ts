import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

export const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
    @Input() intellijFlag = false;
    public i18n: any;
    public currLang: any;
    intelliJFlagDef = false;
    public cloudIdeInterval: any;
    public pluginUrlCfg: any = {
        banner_openFAQ6: '',
        banner_openFAQ7: '',
        banner_openFAQ8: '',
        banner_openFAQ9: '',
        banner_openFAQ4: '',
        banner_openFAQ_sys: ''
    };

    public imgSrc: any = {
        tool: './assets/img/banner/arrow1.svg',
        info: './assets/img/banner/arrow1.svg',
        advisory: './assets/img/banner/arrow1.svg',
        growth: './assets/img/banner/arrow1.svg',
    };
    public bannerList: Array<any>;
    public bannerListEn: Array<any>;
    constructor(
        public router: Router,
        private route: ActivatedRoute,
        public sanitizer: DomSanitizer,
        private vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    ngOnInit() {
        this.cloudIdeInterval = setInterval(() => {
            navigator.serviceWorker.ready.then((registration: any) => {
                if (registration.active) {
                    registration.active.postMessage({ channel: 'keepalive' });
                }
            });
        }, 20000);
        // 获取全局url配置数据(readUrlConfig => readURLConfig)
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
        this.currLang = I18nService.getLang();
        this.route.queryParams.subscribe((data) => {
            if (data.intelliJFlag === undefined) {
                this.intelliJFlagDef = data.intellijFlag === 'true';
            } else {
                this.intelliJFlagDef = data.intelliJFlag === 'true';
            }
        });

    }

    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        clearInterval(this.cloudIdeInterval);
    }
    /**
     * 打开超链接
     * @param url 路径
     */
    openUrl(url1: any, url2: any) {
        let url = '';
        if (url2 === '') {
            url = url1;
        } else {
            url = this.currLang === 0 ? url1 : url2;
        }
        const a = document.createElement('a');
        a.setAttribute('href', url);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    /**
     * 监听 mouseenter 事件
     */
    public mouseenterChange(key: string) {
        this.imgSrc[key] = './assets/img/banner/arrow-hover.svg';
    }
    /**
     * 监听 mouseleave 事件
     */
    public mouseleaveChange(key: string) {
        this.imgSrc[key] = './assets/img/banner/arrow.svg';
    }
}
