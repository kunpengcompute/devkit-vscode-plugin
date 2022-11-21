import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { notificationType } from '../notification-box/notification-box.component';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';
import { ActivatedRoute} from '@angular/router';


const UNINSTALL_STATUS_START = -1;
const RUNNING = 0;
const SUCCESS = 1;
const FAILED = 2;

@Component({
    selector: 'app-uninstall',
    templateUrl: 'uninstall.component.html',
    styleUrls: ['uninstall.component.scss']
})
export class UnInstallComponent implements OnInit{

    private static CONFIG_RADIX = 10;

    @ViewChild('showDialog', {static: false}) showDialog: { Close: () => void; Open: () => void; };
    public validation: any = {
        type: 'blur',
        errorMessage: {
            required: ''
        }
    };
    @ViewChild('notificationBox') notificationBox: {setType: (type: notificationType) => void; show: () => void; };

    public i18n: any = this.i18nService.I18n();
    public tempIP: string;
    public tempPort = '22';
    public username = '';
    public pwd = '';
    public port: string;
    public webPort: string;
    public uninstallSteps: any[] = [];
    public uninstalling = UNINSTALL_STATUS_START;
    public ipCheckF = false;
    public tempPortCheckF = false;
    public usernameCheckNull = false;
    public pwdCheckNull = false;
    public uninstallType = 'password';
    public currTheme = COLOR_THEME.Dark;
    // 是否检测连接成功
    public connected = false;
    // 是否正在检测连接
    public connectChecking = false;
    // ssh连接方式
    public privateKey: string;
    public passphrase: string;  // 私钥密码
    public radioList: any[] = [];
    public sshType: any;
    public sshTypeSelected = 'usepwd';
    public sshUploadKey: any;
    public localfilepath: any;
    public sshkeyCheckNull = false;
    // 开始卸载的时间
    private startUninstallDatetime: Date;
    public pluginUrlCfg: any = {};
    public currLang: string;
    public showLoading = false;

    public dialogShowDetailText = '';
    public notificationMessage = ''; // 执行结果提示
    intelliJFlagDef = false;

    constructor(
        public i18nService: I18nService,
        private route: ActivatedRoute,
        private elementRef: ElementRef,
        public vscodeService: VscodeService) {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            const resJSON = {
                uninstall_openFAQ1: resp.uninstall_openFAQ1,
                uninstall_openFAQ2: resp.uninstall_openFAQ2,

                checkConn_openFAQ1: resp.uninstall_checkConn_openFAQ1,
                checkConn_openFAQ2: resp.checkConn_openFAQ2
            };
            this.pluginUrlCfg = resJSON;
        });
        this.radioList = [
            { key: 'usepwd', value: this.i18n.plugins_common_title_sshPwd },
            { key: 'usekey', value: this.i18n.plugins_common_title_sshKey }
        ];
        this.sshUploadKey = this.i18n.plugins_common_message_sslKeyTip;
        // 设置国际化
        this.i18n = this.i18nService.I18n();
        this.validation.errorMessage = this.i18n.common_term_filename_tip;

        // vscode颜色主题
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
    }

    ngOnInit() {
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
        this.route.queryParams.subscribe((data) => {
            this.intelliJFlagDef = data.intellijFlag === 'true';
        });
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    setNotificationBox(type: notificationType, info: string) {
        this.notificationBox.setType(type);
        this.notificationMessage = info;
        this.notificationBox.show();
    }

    private getCheckResult() {
        if (!this.ipCheckF && !this.tempPortCheckF && !this.usernameCheckNull &&
            ((this.sshTypeSelected === 'usepwd' && !this.pwdCheckNull) ||
            (this.sshTypeSelected === 'usekey' && this.localfilepath))) {
            return true;
        }
        return false;
    }
    /**
     * 检测ssh连接的弹框提示
     */
     public checkConnBefore() {
        // 对每个输入框进行提交前校验
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        this.elementRef.nativeElement.querySelectorAll(`textarea`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (!this.getCheckResult()) {
            return;
        }
        if (this.username.toLocaleLowerCase() === 'root') {
            this.dialogShowDetailText = this.i18n.plugins_common_tips_checkConn_root;
        } else {
            this.dialogShowDetailText = this.i18n.plugins_common_tips_checkConn_noroot.replace(/\{0\}/g, this.username);
        }
        this.showDialog.Open();
    }
    /**
     * 检测ssh连接是否通畅
     */
    public checkConn() {
        if (this.connectChecking) {
            return;
        }
        this.connectChecking = true;
        const postData = {
            cmd: 'checkConn',
            data: {
                host: this.tempIP,
                port: this.tempPort,
                username: this.username,
                password: this.pwd,
                sshType: this.sshTypeSelected,
                privateKey: this.privateKey,
                passphrase: this.passphrase
            }
        };
        this.vscodeService.postMessage(postData, (data: any) => {
            if (data.search(/SUCCESS/) !== -1) {
                this.connected = true;
                this.setNotificationBox(notificationType.success, this.i18n.plugins_common_tips_connOk);
                // this.showInfoBox(this.i18n.plugins_common_tips_connOk, 'info');
            } else if (data.search(/USERAUTH_FAILURE/) !== -1) {
                this.connected = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_connFail);
                // this.showInfoBox(this.i18n.plugins_common_tips_connFail, 'error');
            } else if (data.search(/host fingerprint verification failed/) !== -1) {
                this.connected = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_figerFail);
                // this.showInfoBox(this.i18n.plugins_common_tips_figerFail, 'error');
            } else if (data.search(/Timed out while waiting for handshake/) !== -1) {
                this.connected = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_timeOut);
                // this.showInfoBox(this.i18n.plugins_common_tips_timeOut, 'error');
            } else if (data.search(/Cannot parse privateKey/) !== -1) {
                // 密码短语错误
                this.connected = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_message_passphraseFail);
                // this.showInfoBox(this.i18n.plugins_common_message_passphraseFail, 'error');
            }
            this.connectChecking = false;
        });
    }


    /**
     * 卸载后台服务器
     */
    uninstall() {
        this.showLoading = true;
        // 对每个输入框进行提交前校验
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        this.elementRef.nativeElement.querySelectorAll(`textarea`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        const isCheckS = this.getCheckResult();
        if (isCheckS) {
            this.uninstallSteps = [];
            const uninstallProgress = { data: 'Start connecting to server', flag: UNINSTALL_STATUS_START };
            this.uninstallSteps.push(uninstallProgress);
            this.uninstalling = RUNNING;
            this.startUninstallDatetime = new Date();
            const data = {
                cmd: 'uninstall',
                data: {
                    host: this.tempIP,
                    port: this.tempPort,
                    username: this.username,
                    password: this.pwd,
                    sshType: this.sshTypeSelected,
                    privateKey: this.privateKey,
                    passphrase: this.passphrase,
                    startUninstallDatetime: this.startUninstallDatetime,
                }
            };
            this.vscodeService.postMessage(data, (msg: any) => {
                this.processUninstallInfo(msg);
            });
        }
    }

    /**
     * 部署流程信息处理函数
     *
     * @param data 流程信息
     */
    processUninstallInfo(data: any) {
        if (data === 'closeLoading') {
          this.showLoading = false;
        }
        if (this.uninstalling !== RUNNING) { return; }
        if (data.search(/uploadErr/) !== -1) {
            this.uninstalling = FAILED;
            this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_uploadError);
            // this.showInfoBox(this.i18n.plugins_common_tips_uploadError, 'error');
            this.clearPwd();
        } else if (data.search(/Error:/) !== -1) {
            this.uninstalling = FAILED;
            this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_sshError);
            // this.showInfoBox(this.i18n.plugins_common_tips_sshError, 'error');
            this.clearPwd();
        } else if (data.search(/success/) !== -1) {
            this.cleanConfig();
        } else if (data.search(/failed/) !== -1) {
            this.uninstalling = FAILED;
        }
    }

    /**
     * 清理口令
     */
    clearPwd() {
        this.pwd = '';
        this.privateKey = '';
        this.passphrase = '';
    }

    /**
     * 清理配置文件
     */
    cleanConfig() {
        const command = { cmd: 'readConfig' };
        this.vscodeService.postMessage(command, (data: any) => {
            data.tuningConfig = [];
            const postData = { cmd: 'cleanConfig', data: { data: JSON.stringify(data) } };
            this.vscodeService.postMessage(postData, () => {
                this.uninstalling = SUCCESS;
            });
        });
    }

    /**
     * 退出
     */
    exit() {
        const data = { cmd: 'closeAllPanel' };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * ip校验
     *
     * @returns 校验结果
     */
    checkIP() {
        const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        const invalidIp = /0.0.0.0|255.255.255.255/;
        this.ipCheckF = !reg.test(this.tempIP) || invalidIp.test(this.tempIP);
    }

    /**
     * 检查是否为非root用户
     *
     * @returns 校验结果
     */
    checkUsername() {
        if (this.username === '' || this.username === undefined) {
            this.usernameCheckNull = true;
        } else {
            this.usernameCheckNull = false;
        }
    }

    /**
     * 检查密码非空
     *
     * @returns 校验结果
     */
    checkPwd() {
        if (this.pwd === '' || this.pwd === undefined) {
            this.pwdCheckNull = true;
        } else {
            this.pwdCheckNull = false;
        }
    }

    /**
     * port校验
     *
     * @returns 校验结果
     */
    checkTempPort() {
        if ((/^[1-9]\d*$/.test(this.tempPort)
            && 1 <= parseInt(this.tempPort, UnInstallComponent.CONFIG_RADIX)
            && parseInt(this.tempPort, UnInstallComponent.CONFIG_RADIX) <= 65535)) {
            this.tempPortCheckF = false;
        } else {
            this.tempPortCheckF = true;
        }
    }

    /**
     * 重试
     */
    retry() {
        this.uninstalling = UNINSTALL_STATUS_START;
        this.uninstallSteps = [];
        this.connected = false;
        const data = { cmd: 'hideTerminal' };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * 导入私钥
     */
    uploadFile() {
        const localFile = this.elementRef.nativeElement.querySelector('#uploadFile').files[0];
        this.localfilepath = localFile.path.replace(/\\/g, '/');
        const size = localFile.size / 1024 / 1024;
        if (size > 10) {
            this.setNotificationBox(notificationType.warn, this.i18n.plugins_common_message_sshkeyExceedMaxSize);
            // this.showInfoBox(this.i18n.plugins_common_message_sshkeyExceedMaxSize, 'warn');
            this.localfilepath = undefined;
            return;
        }
        this.privateKeyCheck();
        this.privateKey = this.localfilepath;
    }

    // 检查导入文件是否是私钥文件
    privateKeyCheck() {
        const postData = {
            cmd: 'privateKeyCheck',
            data: {
                privateKey: this.localfilepath,
            }
        };
        this.vscodeService.postMessage(postData, (data: any) => {
            if (data !== true) {
                this.setNotificationBox(notificationType.warn, this.i18n.plugins_common_message_sshkeyFail);
                // this.showInfoBox(this.i18n.plugins_common_message_sshkeyFail, 'warn');
                this.localfilepath = undefined;
                return;
            }
        });
    }

    fileUpload() {
        this.elementRef.nativeElement.querySelector('#uploadFile').value = '';
        this.elementRef.nativeElement.querySelector('#uploadFile').click();
    }

    /**
     * 选择密码或秘钥
     * @param item 密码或秘钥
     */
     public checkChange(item: any) {
        this.sshTypeSelected = item.key;
        this.uninstallType = 'password';
    }
    /**
     * 改变密码明文或密文
     * @param type 明文或密文
     */
    public changInputType(type: string) {
        this.uninstallType = type;
    }

    /**
     * 打开FAQ
     */
     public openFAQ() {
        let url = this.pluginUrlCfg.checkConn_openFAQ1;
        if (this.username.toLocaleLowerCase() !== 'root') {
            url = this.pluginUrlCfg.checkConn_openFAQ2;
        }
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
        this.showDialog.Close();
    }
    /**
     * 确认
     */
    public confirmDialogMsgTip() {
        this.showDialog.Close();
        this.checkConn();
    }

    /**
     * 取消
     */
    public cancelDiglogMsgTip() {
        this.showDialog.Close();
    }

    public clickFAQ(url:any) {
        console.log(url)
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
