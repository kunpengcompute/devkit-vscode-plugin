import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { Utils } from '../service/utils.service';
import { VscodeService, HTTP_STATUS_CODE } from '../service/vscode.service';
const hardUrl: any = require('projects/sys/src-ide/assets/hard-coding/url.json');


@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, AfterViewInit {

    public i18n: any;
    public currLang: any;
    constructor(
        public router: Router,
        public vscodeService: VscodeService,
        public sanitizer: DomSanitizer,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public pluginUrlCfg: any = {
        banner_openFAQ6: '',
        banner_openFAQ7: '',
        banner_openFAQ8: '',
        banner_openFAQ9: '',
        banner_openFAQ4: '',
        banner_openFAQ_sys: ''
    };

    public imgSrc: any = {
        tool: './assets/img/banner/arrow.svg',
        info: './assets/img/banner/arrow.svg',
        advisory: './assets/img/banner/arrow.svg',
        growth: './assets/img/banner/arrow.svg',
    };
    public adviceUrl: any;
    public isIntellij = self.webviewSession.getItem('tuningOperation') === 'hypertuner';

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.adviceUrl = hardUrl.hikunpengUrl;
        this.currLang = I18nService.getLang() === 0 ? 'zh' : 'en';
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
    }

    /**
     * 组件初始化完成后
     */
    ngAfterViewInit() {
        Utils.createSvg('#animation-case', './assets/img/banner/wenhao.json');
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

    /**
     * 打开超链接
     * @param url 路径
     */
    openUrl(url1: any, url2: any) {
        let url = '';
        if (url2 === '') {
            url = url1;
        } else {
            url = this.currLang === 'zh' ? url1 : url2;
        }
        // intellij走该逻辑
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
    /**
     * 点击建议反馈图标
     */
    public openAdvice(urlString: any) {
        const option = {
            url: '/users/admin-status/',
            noToken: true,
            timeout: 3000,
            moduleType: 'sysPerf',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                const a = document.createElement('a');
                a.setAttribute('href', urlString);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    }
}
