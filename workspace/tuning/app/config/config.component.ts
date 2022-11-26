import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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
    @ViewChild('saveModifyDialog', { static: false}) saveModifyDialog: { Close: () => void; Open: () => void; };
    @ViewChild('versionDialog', { static: false }) versionDialog: { Close: () => void; Open: () => void; };
    @ViewChild('notificationBox') notificationBox: {setType: (type: notificationType) => void; show: () => void; };
    @ViewChild('canLoginBox') canLoginBox: {setType: (type: notificationType) => void; show: () => void; close: () => void; };
    @ViewChild('serverErrorBox') serverErrorBox: {setType: (type: notificationType) => void; show: () => void; close: () => void; };


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
    public errorMessage = ""; // 右下角错误提示弹框提示信息
    public isModify = false; // 是否为修改配置状态
    public savedIp: string; // 已成功保存的IP，便于cancel时恢复
    public savedPort: string; // 已成功保存的Port

    constructor(
        private i18nService: I18nService,
        private changeDetectorRef: ChangeDetectorRef,
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
        // this.vscodeService.regVscodeMsgHandler('showCustomDialog', (msg: any) => {
        //     this.showIfServerDialog = true;
        //     this.showDialog.Open();
        // });
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
            console.log("read config data is: ", data);
            this.config = data;
            if (this.config.portConfig.length > 0 && this.config.portConfig[0].ip != "") {
                this.hasConfig = true;
                this.firstConfig = false;
                this.savedIp = this.config.portConfig[0].ip;
                this.savedPort = this.config.portConfig[0].port;
                this.tempIP = this.config.portConfig[0].ip;
                this.tempPort = this.config.portConfig[0].port;
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
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
     * 保存服务器配置
     */
    saveConfirm() {
        console.log("=========this is saveConfig =============");
        // 如果是修改模式，点击保存时弹框提示是否确认保存配置
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (this.isModify && !this.ipCheck && !this.portCheck) {
            // 单独设置保存修改配置对话框宽度
            this.saveModifyDialog.Open();
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
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
     * @param openConfigServer 是否直接打开登录页面
     */
    save(openConfigServer: boolean = false) {
        console.log("============this is save ==============");
        console.log("ip is ", this.tempIP);
        console.log("port is ", this.tempPort);
        console.log("this.config is ", this.config);
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (!this.ipCheck && !this.portCheck) {
            this.showLoading = true;
            this.config.portConfig = [];
            this.config.portConfig.push({
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
                    // TODO 打开右下角错误提示弹框，res需要带错误提示信息
                    // this.setNotificationBox(notificationType.error, this.i18n.plugins_tuning_message_config_server_failed);
                    // this.errorMessage = res.message;
                    this.canLoginBox.close();
                    this.serverErrorBox.setType(notificationType.error);
                    this.serverErrorBox.show();
                    console.log("save config error");
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                } else {
                    console.log("save config success!!!");
                    this.setNotificationBox(notificationType.success, this.i18n.plugins_tuning_message_config_server_success);
                    this.canLoginBox.show();
                    this.savedIp = this.tempIP;
                    this.savedPort = this.tempPort;
                    this.hasConfig = true;
                    this.isModify = false;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
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
        console.log("open login page");
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'login'
            }
        };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 跳转错误指示页面
     */
    openErrorInstruction() {
        console.log("opening error instruction page from server config");
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'errorInstruction',
                panelId: 'tuningErrorInstruction',
                viewTitle: this.i18n.plugins_common_title_errorInstruction,
                message: { ip: this.tempIP, port: this.tempPort },
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
     * 修改服务器配置确认保存
     */
    public confirmModifyConfigDialog() {
        this.saveModifyDialog.Close();
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
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    }

    /**
     * 取消修改操作
     */
     cancelModify() {
        console.log("cancel modify config");
        this.isModify = false;
        this.tempIP = this.savedIp;
        this.tempPort = this.tempPort;
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    }
}
