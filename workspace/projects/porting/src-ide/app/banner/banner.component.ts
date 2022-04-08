import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { UtilsService } from '../service/utils.service';

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
        kunpengdevpsVideo: '',
        kunpengptSixFour: '',
        kunpeng: '',
        kunpenexpert: '',
        kunpengptEnSixFour: '',
        kunpengEn: '',
        forumOne: ''
    };
    public bannerList: Array<any>;
    public bannerListEn: Array<any>;
    constructor(
        public router: Router,
        private route: ActivatedRoute,
        public sanitizer: DomSanitizer,
        private vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef,
        public i18nService: I18nService,
        public utils: UtilsService
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
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
            this.bannerList = [
                {
                    link: this.pluginUrlCfg.learnMapZn,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_learnMap
                },
                {
                    link: this.pluginUrlCfg.kunpengdevpsVideo,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_video
                },
                {
                    link: this.pluginUrlCfg.kunpengptSixFour,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_doc
                },
                {
                    link: this.pluginUrlCfg.forumOne,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_forum
                }
            ];
            this.bannerListEn = [
                {
                    link: this.pluginUrlCfg.learnMapEn,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_learnMap
                },
                {
                    link: this.pluginUrlCfg.kunpengEn,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_comm
                },
                {
                    link: this.pluginUrlCfg.kunpengptEnSixFour,
                    img: './assets/img/banner/icon_header_arrow_down.svg',
                    title: this.i18n.plugins_porting_message_doc
                },
            ];
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
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (this.intelliJFlagDef || this.intellijFlag) {
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
     * 改变图标颜色
     * @param index 下标索引
     * @param bool true: 移入  false: 移出
     */
    public changeBannerImgSrcZh(index: number, bool: boolean): void {
        if (this.currLang === 0) {
            this.bannerList[index].img = bool
                ? './assets/img/banner/icon_header_arrow_down_hover.svg'
                : './assets/img/banner/icon_header_arrow_down.svg';
        } else {
            this.bannerListEn[index].img = bool
                ? './assets/img/banner/icon_header_arrow_down_hover.svg'
                : './assets/img/banner/icon_header_arrow_down.svg';
        }
        if (this.intelliJFlagDef) {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

  /**
   * 打开建议反馈
   * @param urlString 路径
   */
  openAdvice(urlString: string) {
    if (this.intelliJFlagDef || this.intellijFlag) {
        // 打开服务器配置页面
        const cmdData = {
            cmd: 'showIntellijDialog',
            data: {
                intellijDialogType: 'noNetworkTipDialog',
            }
        };
        this.vscodeService.postMessage(cmdData, null);
        return;
    }
    this.utils.openVocAdvice(urlString);
  }
}
