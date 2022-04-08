import { I18nService, LANGUAGE_TYPE } from './../service/i18n.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { COLOR_THEME, VscodeService } from './../service/vscode.service';
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

    constructor(
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef,
        private route: ActivatedRoute,
        public sanitizer: DomSanitizer
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public intelliJFlagDef = false;
    ngOnInit() {
        // 获取当前语言
        this.currLang = I18nService.getLang();
        // vscode颜色主题适配
        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });

        this.route.queryParams.subscribe((data) => {
            this.intelliJFlagDef = (data.intelliJFlag) ? true : false;
        });
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
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
                    title: this.i18n.plugins_porting_remote_env.apply_remote_env,
                    info: this.i18n.plugins_porting_remote_env.apply_remote_env_info,
                    extensionInfo: '',
                    linkBtnText: this.i18n.plugins_porting_remote_env.immediately,
                    href: this.currLang === LANGUAGE_TYPE.ZH
                      ? this.pluginUrlCfg.freeTrialRemoteEnvZh
                      : this.pluginUrlCfg.freeTrialRemoteEnvEn
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
                    title: this.i18n.plugins_porting_remote_env.check_email,
                    info: this.i18n.plugins_porting_remote_env.check_email_info,
                    extensionInfo: '',
                    linkBtnText: '',
                    href: ''
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
                    title: this.i18n.plugins_porting_remote_env.config_serve,
                    info: this.i18n.plugins_porting_remote_env.config_serve_info,
                    extensionInfo: '',
                    linkBtnText: this.i18n.plugins_porting_remote_env.config_now,
                    href: ''
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
                    title: this.i18n.plugins_porting_remote_env.early_release_or_extended_use,
                    info: this.i18n.plugins_porting_remote_env.early_release_or_extended_use_info,
                    extensionInfo: '',
                    linkBtnText: '',
                    href: ''
                }
            ];
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }

    /**
     * 链接按钮点击事件
     * @param data 数据
     */
    clickLinkBtn(data: any) {
        if (this.intelliJFlagDef) {
            // 打开服务器配置页面
            const cmdData = {
                cmd: 'showIntellijDialog',
                data: {
                    intellijDialogType: 'portServerConfigDialog',
                }
            };
            this.vscodeService.postMessage(cmdData, null);
            return;
        }
        if (data.id === 'config_serve') {
            // 打开服务器配置页面
            const cmdData = {
                cmd: 'openNewPage',
                data: {
                    router: 'config',
                    panelId: 'portNonServerConfig',
                    viewTitle: this.i18n.plugins_porting_configure_remote_server,
                    message: {}
                }
            };
            this.vscodeService.postMessage(cmdData, null);
            // 关闭当前页面
            const message = {
                cmd: 'closePanel'
            };
            this.vscodeService.postMessage(message, null);
        }
    }

    /**
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (this.intelliJFlagDef) {
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

}
