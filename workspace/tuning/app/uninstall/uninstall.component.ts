import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
    @ViewChild('fingerDialog', { static: false }) fingerDialog: { Close: () => void; Open: () => void; };
    @ViewChild('notificationBox') notificationBox: {setType: (type: notificationType) => void; show: () => void; };
    @ViewChild('serverErrorBox') serverErrorBox: {setType: (type: notificationType) => void; show: () => void; close: () => void; };

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
    public tempFinger: string; // 读取的finger，用于发送保存finger

    public dialogShowDetailText = '';
    public fingerDialogTitle = ''; // 指纹弹框标题
    public fingerLoseText = ''; // 指纹弹框消息内容
    public notificationMessage = ''; // 执行结果提示
    intelliJFlagDef = false;
    closeAll=false;

    constructor(
        public i18nService: I18nService,
        private route: ActivatedRoute,
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
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
     * 检测指纹，检测连接前调用
     */
      public checkFinger() {
        console.log("checking finger");
        const postData = {
            cmd: 'readFinger',
            data: {
                host: this.tempIP,
                port: this.tempPort,
                username: this.username,
                password: this.pwd,
                sshType: this.sshTypeSelected,
                privateKey: this.privateKey,
                passphrase: this.passphrase
            }
        }
        this.vscodeService.postMessage(postData, (data: any) => {
            console.log("data:"+data)
            console.log("finger read get: ", data);
            if (data.search(/no matching/) !== -1) {
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_message_sshAlgError);
            }
            if (data.search(/sshClientCheck/) !== -1) {
                this.connectChecking = false;
                this.setNotificationBox(notificationType.warn, this.i18n.plugins_common_message_sshClientCheck);
            } else if (data === "noFirst") {
                // 可以直接checkConn
                this.tempFinger = "noFirst";
                this.realCheckConn();
            } else if (data.search(/host fingerprint verification failed/) !== -1) {
                // 读取指纹出错
                this.connectChecking = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_figerFail);
            } else if (data.search(/TIMEOUT/) !== -1) {
                // 连接超时
                this.connectChecking = false;
                this.serverErrorBox.setType(notificationType.error);
                this.serverErrorBox.show();
            } else if (data.search(/Cannot parse privateKey/) !== -1) {
                // 密码短语错误
                this.connectChecking = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_message_passphraseFail);
            } else if (data.search(/USERAUTH_FAILURE/) !== -1) {
                this.connectChecking = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_tips_connFail);
            } else {
                // 首次连接
                this.tempFinger = data;
                this.fingerLoseText = this.i18nService.I18nReplace(this.i18n.plugins_common_message_figerLose, {
                    0: this.tempIP,
                    1: this.tempFinger
                });
                this.fingerDialogTitle = this.i18n.plugins_tuning_title_finger_confirm;
                this.fingerDialog.Open();
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
    }

    /**
     * 点击检测连接按钮后
     */
    public checkConn() {
        if (this.connectChecking) {
            return;
        }
        this.connectChecking = true;
        this.checkFinger();
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
    }


    /**
     * 实际执行检测ssh连接
     */
     public realCheckConn() {
        console.log("finally checking ssh connection!");
        console.log("tempFinger is ", this.tempFinger);
        const postData = {
            cmd: 'checkConn',
            data: {
                host: this.tempIP,
                port: this.tempPort,
                username: this.username,
                password: this.pwd,
                sshType: this.sshTypeSelected,
                privateKey: this.privateKey,
                passphrase: this.passphrase,
                finger: this.tempFinger,
            }
        };
        this.vscodeService.postMessage(postData, (data: any) => {
            if (data.search(/SUCCESS/) !== -1) {
                this.connected = true;
                this.setNotificationBox(notificationType.success, this.i18n.plugins_common_tips_connOk + this.i18n.plugins_common_tips_start_uninstall);
            } else if (data.search(/Cannot parse privateKey/) !== -1) {
                // 密码短语错误
                this.connected = false;
                this.setNotificationBox(notificationType.error, this.i18n.plugins_common_message_passphraseFail);
            }
            this.connectChecking = false;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
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
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
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
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
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
            const tmp_data = {
                ip: this.tempIP
            };
            const postData = { cmd: 'cleanConfig', data: { data: JSON.stringify(tmp_data) } };
            this.vscodeService.postMessage(postData, (res:any) => {
                this.closeAll=res
                this.uninstalling = SUCCESS;
            });
        });
    }

    /**
     * 退出
     */
    exit() {
        const data = { cmd: 'closeAllPanel', data: { closeAll:this.closeAll } };
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
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
            return;
        }
        this.privateKeyCheck();
        this.privateKey = this.localfilepath;
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
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
        if (this.intelliJFlagDef) {
            const postData = {
                cmd: 'uploadPrivateKey',
            };
            this.vscodeService.postMessage(postData, (data: any) => {
                if (data.checkPrivateKey == "true") {
                    this.localfilepath = data.localfilepath.replace(/\\/g, '/');
                    this.privateKey = this.localfilepath;
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
                else{
                    this.setNotificationBox(notificationType.warn, this.i18n.plugins_common_message_sshkeyFail);
                    this.localfilepath = '';
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                    return;
                }
            });
        }
        else {
            this.elementRef.nativeElement.querySelector('#uploadFile').value = '';
            this.elementRef.nativeElement.querySelector('#uploadFile').click();
        }
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


    /**
     * 指纹弹框确认连接
     */
     public confirmFingerDialog() {
        this.fingerDialog.Close();
        const postData = {
            cmd: 'saveFinger',
            data: {
                ip: this.tempIP,
                finger: this.tempFinger
            }
        }
        this.vscodeService.postMessage(postData, (data: any) => {
            console.log(data);
            if(data.search(/oversize/)!==-1){
                this.setNotificationBox(notificationType.warn, this.i18n.plugins_common_message_figerWarn);
            }
            if (data === "SUCCESS") {
                // 保存指纹成功，可检测连接

            } else {
                // 保存失败，但不应该影响连接
                this.setNotificationBox(notificationType.warn, "host fingerprint saved failed");
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
        this.realCheckConn();
    }

    /**
     * 指纹弹框取消连接
     */
    public cancelFingerDialog() {
        this.connectChecking = false;
        this.fingerDialog.Close();
    }

    /**
     * 打开错误指示页面
     */
    openErrorInstruction() {
        console.log("opening error instruction page from install");
        const data = {
            cmd: 'openNewPage',
            data: {
                router: 'errorInstruction',
                panelId: 'tuningErrorInstruction',
                viewTitle: this.i18n.plugins_common_title_errorInstruction,
                // 检测连接的错误指示页面不需要ip和port值
                message: { ip: '', port: '', deployIP: this.tempIP },
            }
        };
        this.vscodeService.postMessage(data, null);
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
