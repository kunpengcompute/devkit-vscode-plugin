import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, HTTP_STATUS_CODE } from '../../service/vscode.service';
const hardUrl: any = require('projects/java/src-com/assets/hard-coding/url.json');

/**
 * 多语言
 */
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
export class BannerComponent implements OnInit {

    public i18n: any;
    public currLang: any;
    public adviceUrl: any;
    constructor(
        public router: Router,
        public i18nService: I18nService,
        public vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public pluginUrlCfg: any = {
        banner_openFAQ3: '',
        banner_openFAQ4: '',
        banner_openFAQ5: '',
        banner_openFAQ_java: '',
        banner_openFAQ8: '',
        banner_openFAQ_Growth: '',
        banner_openFAQ_GrowthEn: ''
    };
    public isIntellij = ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner';
    /**
     * 组件初始化
     */
    ngOnInit() {
        this.currLang = I18nService.getLang();

        this.adviceUrl = hardUrl.hikunpengUrl;

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
    }
    /**
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
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
     * 打开建议反馈
     * @param url 路径
     */
    openAdvice(urlString: string) {
        const option = {
            url: '/users/admin-status/',
            noToken: true,
            timeout: 3000,
            moduleType: 'javaPerf',
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
