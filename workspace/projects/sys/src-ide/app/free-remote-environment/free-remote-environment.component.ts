import { Component, OnInit } from '@angular/core';
import {VscodeService, COLOR_THEME, currentTheme} from './../service/vscode.service';
import { I18nService } from './../service/i18n.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-free-remote-environment',
    templateUrl: './free-remote-environment.component.html',
    styleUrls: ['./free-remote-environment.component.scss'],
})
export class FreeRemoteEnvironmentComponent implements OnInit {
    public i18n: any;
    public introduceList: any;
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
        public sanitizer: DomSanitizer
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
            this.introduceList = [
                {
                    id: 'apply_remote_env',
                    icon: {
                        dark: './assets/img/remote-env/apply-remote-env-dark.svg',
                        light: './assets/img/remote-env/apply-remote-env-light.svg'
                    },
                    title: this.i18n.plugins_common_remote_env.apply_remote_env,
                    info: this.i18n.plugins_common_remote_env.apply_remote_env_info,
                    extensionInfo: '',
                    linkBtnText: this.i18n.plugins_common_remote_env.immediately,
                    href: this.pluginUrlCfg.freeTrialRemoteEnv
                },
                {
                    id: 'check_email',
                    icon: {
                        dark: './assets/img/remote-env/check-email-dark.svg',
                        light: './assets/img/remote-env/check-email-light.svg'
                    },
                    title: this.i18n.plugins_common_remote_env.check_email,
                    info: this.i18n.plugins_common_remote_env.check_email_info,
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
                    title: this.i18n.plugins_common_remote_env.config_serve,
                    info: this.i18n.plugins_common_remote_env.config_serve_info,
                    extensionInfo: '',
                    linkBtnText: this.i18n.plugins_common_remote_env.config_now,
                    href: ''
                },
                {
                    id: 'early_release_or_extended_use',
                    icon: {
                        dark: './assets/img/remote-env/release-env-dark.svg',
                        light: './assets/img/remote-env/release-env-light.svg'
                    },
                    title: this.i18n.plugins_common_remote_env.early_release_or_extended_use,
                    info: this.i18n.plugins_common_remote_env.early_release_or_extended_use_info,
                    extensionInfo: '',
                    linkBtnText: '',
                    href: ''
                }
            ];
        });
    }

    /**
     * 链接按钮点击事件
     * @param data 数据
     */
    clickLinkBtn(data: any) {
        if (data.id === 'config_serve') {
            // 打开服务器配置页面
            const cmdData = {
                cmd: 'openNewPage',
                data: {
                    router: 'config',
                    panelId: 'perfNonServerConfig',
                    viewTitle: this.i18n.plugins_common_configure_remote_server,
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
}
