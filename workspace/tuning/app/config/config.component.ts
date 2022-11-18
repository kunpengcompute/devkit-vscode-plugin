import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { notificationType } from '../notification-box/notification-box.component';
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
    @ViewChild('saveModifyDialog', { static: false}) saveModifyDialog: { Close: () => void; Open: () => void; setContentBoxWidth: (width: string) => void};
    @ViewChild('versionDialog', { static: false }) versionDialog: { Close: () => void; Open: () => void; };
    @ViewChild('notificationBox') notificationBox: {setType: (type: notificationType) => void; show: () => void; };
    @ViewChild('notificationWithActionBox') notificationWithActionBox: {setType: (type: notificationType) => void; show: () => void; };

    private static CONFIG_RADIX = 10;
    public i18n: any;
    public tempIP: string;
    public tempPort = '';
    public config: any;
    public hasConfig = false;
    public firstConfig = true;
    public ipCheck = false;
    public portCheck = false;
    public currLang: number;
    public currTheme = COLOR_THEME.Dark;
    public pluginUrlCfg: any = {};
    public showLoading = false;
    public showIfServerDialog = false; // 显示是否切换服务器
    public versionMismatch = "";
    public notificationMessage = ""; // 配置远端服务器执行结果提示
    public isModify = false; // 是否为修改配置状态

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
        if (document.body.className === 'vscode-light intellij-light') {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // TODO 
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
                this.hasConfig = true;
                this.firstConfig = false;
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
        console.log("=========this is saveConfig =============");
        // TODO 如果是修改模式，点击保存时弹框提示是否确认保存配置
        if (this.isModify) {
            // 单独设置保存修改配置对话框宽度
            this.saveModifyDialog.setContentBoxWidth('400px');
            this.saveModifyDialog.Open();
        } else {
            this.save();
        }
    }

    setNotificationBox(type: notificationType, info: string) {
        this.notificationBox.setType(type);
        this.notificationMessage = info;
        this.notificationBox.show();
    }

    /**
     * 将ip port配置写入配置文件
     * @param openConfigServer 是否直接打开登录页面 ?有True的时候吗
     */
    save(openConfigServer: boolean = false) {
        console.log("============this is save ==============");
        console.log("ip is ", this.tempIP);
        console.log("port is ", this.tempPort);
        console.log("this.config is ", this.config);
        // this.config赋值
        this.config = {}; // 
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (!this.ipCheck && !this.portCheck) {
            this.showLoading = true;
            this.config.tuningConfig = {
                ip: this.tempIP,
                port: this.tempPort
            };
            let data = {
                cmd: 'saveConfig', data: {
                    data: JSON.stringify(this.config.tuningConfig),
                    showInfoBox: true,
                    openConfigServer
                }
            };
            this.vscodeService.postMessage(data, (res: any) => {
                // TODO 页面元素更新缓慢，无法及时更新
                this.showLoading = false;
                console.log(res);
                // 版本不匹配
                if (res.type === 'VERSIONMISMATCH') {
                    console.log("version mismatch");
                    this.versionMismatch = this.i18nService.I18nReplace(this.i18n.plugins_tuning_message_versionCompatibility, {
                        0: res.configVersion,
                        1: res.serverVersion
                    });
                    this.versionDialog.Open();
                } else if (res.type === 'FAIL') {
                    this.setNotificationBox(notificationType.error, '配置服务器失败');
                    console.log("save config error");
                } else {
                    console.log("save config success!!!");
                    this.setNotificationBox(notificationType.success, this.i18n.plugins_tuning_message_config_server_success);
                    this.notificationWithActionBox.show();
                    this.hasConfig = true;
                }
            });
        }
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
     * 跳转登录页面
     */
    openLogin() {
        // TODO vscode端的打开登录页面逻辑
        // intellij：调用postMessage打开页面
        console.log("open login page");
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'login'
            }
        }
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
     * 修改服务器配置确认保存
     */
    public confirmModifyConfigDialog() {
        this.save();
    }

    /**
     * 修改服务器配置取消保存
     */
    public cancelModifyConfigDialog() {
        this.saveModifyDialog.Close();
    }

    /**
     * 版本不匹配取消
     */
    cancelVersionDiglogMsgTip() {
        this.versionDialog.Close()
    }

    /**
     * 已经配置服务器成功后点击修改
     */
    modifyConfig() {
        console.log("going to modify config");
        this.isModify = true;

    }

    /**
     * 取消修改操作
     */
     cancel() {
        console.log("cancel modify config");
        this.isModify = false;
    }
}
