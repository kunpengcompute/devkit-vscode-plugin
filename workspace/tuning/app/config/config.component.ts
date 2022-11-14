import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';


@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
    @ViewChild('saveConfirmTip') saveConfirmTip: { Close: () => void; Open: () => void; };
    @ViewChild('showDialog', { static: false }) showDialog: { Close: () => void; Open: () => void; };
    @ViewChild('versionDialog', { static: false }) versionDialog: { Close: () => void; Open: () => void; };

    private static CONFIG_RADIX = 10;
    public i18n: any;
    public tempIP: string;
    public tempPort = '';
    public config: any;
    public ipCheck = false;
    public portCheck = false;
    public currLang: number;
    public currTheme = COLOR_THEME.Dark;
    public pluginUrlCfg: any = {};
    public showLoading = false;
    public showIfServerDialog = false; // 显示是否切换服务器
    public versionMismatch = ""

    constructor(
        private i18nService: I18nService,
        private elementRef: ElementRef, public vscodeService: VscodeService) {
    }

    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = { sysConfig_openFAQ1: resp.sysConfig_openFAQ1 };
        });
        // vscode颜色主题
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.vscodeService.regVscodeMsgHandler('showCustomDialog', (msg: any) => {
            this.showIfServerDialog = true;
            this.showDialog.Open();
        });
        // 设置国际化
        this.i18n = this.i18nService.I18n();
        this.currLang = I18nService.getLang();

        this.readConfig();
    }
    /**
     * 读取ip端口配置
     */
    readConfig() {
        this.vscodeService.postMessage({ cmd: 'readConfig' }, (data: any) => {
            this.config = data;
            if (this.config.tuningConfig.length > 0) {
                this.tempIP = this.config.tuningConfig[0].ip;
                this.tempPort = this.config.tuningConfig[0].port;
            }
        });
    }
    /**
     * ip校验
     *
     * @returns 校验结果
     */
    checkIP() {
        const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        const invalidIp = /0.0.0.0|255.255.255.255/;
        this.ipCheck = !reg.test(this.tempIP) || invalidIp.test(this.tempIP);
    }

    /**
     * port校验
     *
     * @returns 校验结果
     */
    checkPort() {
        if ((/^[1-9]\d*$/.test(this.tempPort)
            && 1024 <= parseInt(this.tempPort, ConfigComponent.CONFIG_RADIX)
            && parseInt(this.tempPort, ConfigComponent.CONFIG_RADIX) <= 65535)) {
            this.portCheck = false;
        } else {
            this.portCheck = true;
        }
    }

    /**
     * 登录时弹窗确认
     */
    saveConfirm() {
        this.save();
    }

    /**
     * 将ip port配置写入配置文件
     * @param openConfigServer 是否直接打开登录页面
     */
    save(openConfigServer: boolean = false) {
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (!this.ipCheck && !this.portCheck) {
            this.showLoading = true;
            this.config.tuningConfig = [];
            this.config.tuningConfig.push({
                ip: this.tempIP,
                port: this.tempPort

            });
            let data = {
                cmd: 'saveConfig', data: {
                    data: JSON.stringify(this.config),
                    showInfoBox: true,
                    openConfigServer,
                    openLogin: false
                }
            };
            this.vscodeService.postMessage(data, (res: any) => {
                this.showLoading = false;
                // 版本不匹配
                if (res.type === 'VERSIONMISMATCH') {
                    this.versionMismatch = this.i18nService.I18nReplace(this.i18n.plugins_tuning_message_versionCompatibility, {
                        0: res.configVersion,
                        1: res.serverVersion
                    })
                    this.versionDialog.Open()
                }
            });
        }
    }


    /**
     * 取消配置操作(关闭页面)
     */
    cancel() {
        const data = {
            cmd: 'closePanel',
            data: {
                panelId: 'tuningNonServerConfig',
            }
        };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 跳转install页面
     */
    openInstallPage() {
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'install',
                panelId: 'tuningInstall',
                viewTitle: this.i18n.common_install_panel_title,
                message: {}
            }
        };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 跳转免费试用远程服务页面
     */
    openFreeTrialRemoteEnv() {
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'freeTrialProcessEnvironment',
                panelId: 'tuningFreeTrialRemoteEnvironment',
                viewTitle: this.i18n.plugins_tuning_free_trial_remote_environment,
                message: {}
            }
        };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 切换服务器确认
     */
    public confirmDialogMsgTip() {
        this.showDialog.Close();
        this.save(true);
    }

    /**
     * 切换服务器取消
     */
    public cancelDiglogMsgTip() {
        this.showDialog.Close();
        this.showLoading = false;
    }
    /**
     * 版本不匹配取消
     */
    cancelVersionDiglogMsgTip() {
        this.versionDialog.Close()
    }
}
