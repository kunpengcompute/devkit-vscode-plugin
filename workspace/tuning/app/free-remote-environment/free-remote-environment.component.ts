import { I18nService, LANGUAGE_TYPE } from '../service/i18n.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { COLOR_THEME, VscodeService , currentTheme} from '../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-free-remote-environment',
    templateUrl: './free-remote-environment.component.html',
    styleUrls: ['./free-remote-environment.component.scss'],
})
export class FreeRemoteEnvironmentComponent implements OnInit {
    public i18n: any;
    public introduceList: any;
    public currLang: any;
    // 主题颜色
    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public pluginUrlCfg: any = {
        freeTrialRemoteEnv: ''
    };

    intelliJFlagDef = false;

    constructor(
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef,
        private route: ActivatedRoute,
        public sanitizer: DomSanitizer
    ) {
        this.i18n = this.i18nService.I18n();
    }
    ngOnInit() {
        // 获取当前语言
        this.currLang = I18nService.getLang();
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            const res = {
                freeTrialRemoteEnvZh: resp.freeTrialRemoteEnvZh,
                freeTrialRemoteEnvEn: resp.freeTrialRemoteEnvEn
            };
            this.pluginUrlCfg = res;
            this.initIntroduceList();
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
        // this.initIntroduceList()

        // 判断是不是intellij
        this.route.queryParams.subscribe((data) => {
            if (data.intelliJFlag === undefined) {
                this.intelliJFlagDef = data.intellijFlag === 'true';
            } else {
                this.intelliJFlagDef = data.intelliJFlag === 'true';
            }
        });
    }

    private initIntroduceList() {
        this.introduceList = [
            {
                id: 'apply_remote_env',
                icon: {
                    dark: './assets/img/remote-env/apply-remote-env-dark.svg',
                    light: './assets/img/remote-env/apply-remote-env-light.svg'
                },
                intellij_icon: {
                    dark: `./assets/img/remote-env/intellij-apply-remote-env-dark.svg`,
                    light: './assets/img/remote-env/intellij-apply-remote-env-light.svg'
                },
                title: this.i18n.plugins_common_remote_env.apply_remote_env,
                info: this.i18n.plugins_common_remote_env.apply_remote_env_info,
                extensionInfo: '',
                linkBtnText: this.i18n.plugins_common_remote_env.immediately,
                href: this.currLang === LANGUAGE_TYPE.ZH
                  ? this.pluginUrlCfg.freeTrialRemoteEnvZh
                  : this.pluginUrlCfg.freeTrialRemoteEnvEn,
                extensionInfoLength: 0,
                linkBtnTextLength: 1,
                hrefLength: 1
            },
            {
                id: 'check_email',
                icon: {
                    dark: './assets/img/remote-env/check-email-dark.svg',
                    light: './assets/img/remote-env/check-email-light.svg'
                },
                intellij_icon: {
                    dark: `./assets/img/remote-env/intellij-check-email-dark.svg`,
                    light: './assets/img/remote-env/intellij-check-email-light.svg'
                },
                title: this.i18n.plugins_common_remote_env.check_email,
                info: this.i18n.plugins_common_remote_env.check_email_info,
                extensionInfo: '',
                linkBtnText: '',
                href: '',
                extensionInfoLength: 0,
                linkBtnTextLength: 0,
                hrefLength: 0
            },
            {
                id: 'config_serve',
                icon: {
                    dark: './assets/img/remote-env/config-serve-dark.svg',
                    light: './assets/img/remote-env/config-serve-light.svg'
                },
                intellij_icon: {
                    dark: `./assets/img/remote-env/intellij-config-serve-dark.svg`,
                    light: './assets/img/remote-env/intellij-config-serve-light.svg'
                },
                title: this.i18n.plugins_common_remote_env.config_serve,
                info: this.i18n.plugins_common_remote_env.config_serve_info,
                extensionInfo: '',
                linkBtnText: this.i18n.plugins_common_remote_env.config_now,
                href: '',
                extensionInfoLength: 0,
                linkBtnTextLength: 1,
                hrefLength: 0
            },
            {
                id: 'early_release_or_extended_use',
                icon: {
                    dark: './assets/img/remote-env/release-env-dark.svg',
                    light: './assets/img/remote-env/release-env-light.svg'
                },
                intellij_icon: {
                    dark: `./assets/img/remote-env/intellij-release-env-dark.svg`,
                    light: './assets/img/remote-env/intellij-release-env-light.svg'
                },
                title: this.i18n.plugins_common_remote_env.early_release_or_extended_use,
                info: this.i18n.plugins_common_remote_env.early_release_or_extended_use_info,
                extensionInfo: '',
                linkBtnText: '',
                href: '',
                extensionInfoLength: 0,
                linkBtnTextLength: 0,
                hrefLength: 0
            }
        ];
    }

    /**
     * 链接按钮点击事件(立即配置)
     * @param data 数据
     */
    clickLinkBtn(data: any) {
        // 打开服务器配置页面
        const cmdData = {
            cmd: 'openNewPage',
            data: {
                router: 'config',
                panelId: 'tuningNonServerConfig',
                viewTitle: this.i18n.plugins_tuning_configure_remote_server,
                message: {},
                closePage:"true"
            }
        };
        this.vscodeService.postMessage(cmdData, null);
        // 关闭当前页面
        const message = {
            cmd: 'closePanel'
        };
        if(!this.intelliJFlagDef){
            this.vscodeService.postMessage(message, null);
        }
    }

    /**
     * 下载缺失包(立即申请)
     * @param url 路径
     */
    openUrl(url: string) {
        const postData = {
            cmd: 'openUrlInBrowser',
            data: {
                url: url,
            }
        };
        if(this.intelliJFlagDef){
            // 如果是intellij就调用java方法唤起默认浏览器打开网页
            this.vscodeService.postMessage(postData, null);
        }
        else{
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

}
