import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../service/vscode.service';
import { Router } from '@angular/router';
import { TiValidationConfig } from '@cloud/tiny3';

const UPGRADE_STATUS_START = -1;
const UPGRADE_STATUS_RUNNING = 0;
const UPGRADE_STATUS_SUCCESS = 1;
const UPGRADE_STATUS_ERROR = 2;

@Component({
    selector: 'app-upgrade',
    templateUrl: 'upgrade.component.html',
    styleUrls: ['upgrade.component.scss']
})
export class UpgradeComponent {

    private static CONFIG_RADIX = 10;

    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            required: ''
        }
    };
    public i18n: any = this.i18nService.I18n();
    public tempIP: string;
    public faultIP: string;
    public extraIP: string;
    public finalIP: string;
    public tempPort = '22';
    public username = '';
    public pwd = '';
    public port: string;
    public webPort: string;
    public upgradeSteps: any[] = [];
    public upgrading = UPGRADE_STATUS_START;
    public ipCheck = false;
    public extraIpCheck = false;
    public tempPortCheck = false;
    public usernameCheckNull = false;
    public pwdCheckNull = false;
    public uninstallType = 'password';
    public currTheme = COLOR_THEME.Dark;
    // 是否检测连接成功
    public connected = false;
    // 是否正在进行连接检测
    public connectChecking = false;
    public upgradeToolInfo: string;
    // ssh连接方式
    public privateKey: string;
    public passphrase: string;  // 私钥密码
    public passphraseType = 'password';
    public radioList: any[] = [];
    public sshType: any;
    public sshTypeSelected = 'usepwd';
    public sshUploadKey: any;
    public localfilepath: any;
    public sshkeyCheck = true;
    public sshkeyCheckNull = false;
    // ip选择
    public ipList: any[] = [];
    public ipSelected: any;
    public faultIPInfo: string;
    public SSHIPInfo: string;
    public selectIPInfo: string;
    // 是否已安装
    public isInstalled = true;
    // 升级IP是否相同
    public isSameIp = true;
    // 开始升级的时间
    private startUpgradeDatetime: Date;
    public showLoading = false;

    public pluginUrlCfg: any = {
        vscodeService_openFAQ1: '',
        vscodeService_openFAQ2: '',
        upgrade_openFAQ1: '',
        upgrade_openFAQ2: ''
    };

    constructor(
        private router: Router,
        private i18nService: I18nService,
        private elementRef: ElementRef,
        public vscodeService: VscodeService) {
        this.radioList = [{ key: 'usepwd', value: this.i18n.plugins_common_title_sshPwd },
        { key: 'usekey', value: this.i18n.plugins_common_title_sshKey }];
        this.sshUploadKey = this.i18n.plugins_common_message_sslKeyTip;
        // 设置国际化
        this.i18n = this.i18nService.I18n();
        this.validation.errorMessage = this.i18n.common_term_filename_tip;

        // vscode颜色主题
        this.currTheme = currentTheme();

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
            this.upgradeToolInfo = this.i18nService.I18nReplace(this.i18n.plugins_common_message_upgradeTool, {
                0: `<a href="${this.pluginUrlCfg.vscodeService_openFAQ2}">`,
                1: '</a>'
            });
        });


        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
    }

    /**
     * 安装后台服务器
     */
    upgrade() {
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
        if (!this.ipCheck && !this.tempPortCheck && !this.usernameCheckNull &&
            (!this.pwdCheckNull || !this.sshkeyCheck)) {
            this.upgradeSteps = [];
            const upgradeProgress = { data: 'Start connecting to server', flag: UPGRADE_STATUS_START };
            this.upgradeSteps.push(upgradeProgress);
            this.upgrading = UPGRADE_STATUS_RUNNING;
            const command = { cmd: 'readConfig' };
            this.vscodeService.postMessage(command, (configData: any) => {
                if (configData.sysPerfConfig.length <= 0) {
                    this.isInstalled = false;
                } else {
                    if (configData.sysPerfConfig[0].ip !== this.tempIP) {
                        this.isSameIp = false;
                    }
                }
                const option = {
                    cmd: 'loginOut',
                    data: {
                        info: 'loginOut',
                        isInstalled: this.isInstalled,
                        isSameIp: this.isSameIp,
                    }
                };
                // 执行登出操作
                this.vscodeService.postMessage(option, (msgData: any) => {
                    if (msgData.loginOut) {
                        this.startUpgradeDatetime = new Date();
                        const data = {
                            cmd: 'upgrade',
                            data: {
                                host: this.tempIP,
                                port: this.tempPort,
                                username: this.username,
                                password: this.pwd,
                                sshType: this.sshTypeSelected,
                                privateKey: this.privateKey,
                                passphrase: this.passphrase,
                                startUpgradeDatetime: this.startUpgradeDatetime,
                            }
                        };
                        this.vscodeService.postMessage(data, (msg: any) => {
                            this.processUpgradeInfo(msg);
                        });
                    }
                });
            });
        }
    }

    /**
     * 部署流程信息处理函数
     *
     * @param data 流程信息
     */
    processUpgradeInfo(data: any) {
        if (data === 'closeLoading') {
            this.showLoading = false;
        }
        if (this.upgrading !== UPGRADE_STATUS_RUNNING) { return; }
        if (data.search(/uploadErr/) !== -1) {
            this.upgrading = UPGRADE_STATUS_ERROR;
            this.vscodeService.showInfoBox(this.i18n.plugins_common_tips_uploadError, 'error');
            this.clearPwd();
        } else if (data.search(/Error:/) !== -1) {
            this.upgrading = UPGRADE_STATUS_ERROR;
            this.vscodeService.showInfoBox(this.i18n.plugins_common_tips_sshError, 'error');
            this.clearPwd();
        } else if (data.search(/listen/) !== -1) {
            const matchIpPort = /(\d{1,3}\.){3}\d{1,3}:\d+/;
            const matched = data.match(matchIpPort)[0].split(':');
            this.faultIP = matched[0];
            this.webPort = matched[1];
            this.selectIPInfo = this.i18nService.I18nReplace(this.i18n.plugins_common_title_ipSelectUpgrade, {
                0: this.faultIP,
                1: this.faultIP
            });
            this.faultIPInfo = this.i18nService.I18nReplace(this.i18n.plugins_common_tips_ipFault, {
                0: this.faultIP
            });
            this.SSHIPInfo = this.i18nService.I18nReplace(this.i18n.plugins_common_tips_ipSSH, {
                0: this.tempIP
            });
            this.ipList = [{ key: 0, value: this.SSHIPInfo },
            { key: 1, value: this.faultIPInfo },
            { key: 2, value: this.i18n.plugins_common_tips_ipExtra }];
            if (this.tempIP === this.faultIP) {
                this.ipList.splice(0, 1);
            }
            this.ipSelected = this.ipList[0].key;
            this.upgrading = UPGRADE_STATUS_SUCCESS;
        } else if (data.search(/failed/) !== -1) {
            this.upgrading = UPGRADE_STATUS_ERROR;
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
     * 保存ip与端口到配置文件与全局变量
     */
    saveConfig() {
        const command = { cmd: 'readConfig' };
        this.vscodeService.postMessage(command, (data: any) => {
            const config = [];
            config.push({ ip: this.finalIP, port: this.webPort });
            data.sysPerfConfig = config;
            const postData = { cmd: 'saveConfig', data: { data: JSON.stringify(data) } };
            this.vscodeService.postMessage(postData, () => {
                const data1 = { cmd: 'updatePanel' };
                this.vscodeService.postMessage(data1, null);
                this.router.navigate(['/login']);
            });
        });
    }

    /**
     * 跳转到登录页面
     */
    goLogin() {
        if (this.ipSelected === 0) {
            this.finalIP = this.tempIP;
            this.saveConfig();
        } else if (this.ipSelected === 1) {
            this.finalIP = this.faultIP;
            this.saveConfig();
        } else if (this.ipSelected === 2) {
            // 对输入的IP进行提交前校验
            this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
                element.focus();
                element.blur();
            });
            this.finalIP = this.extraIP;
            if (!this.extraIpCheck) {
                this.saveConfig();
            }
        }
    }

    /**
     * 重试
     */
    retry() {
        this.upgrading = UPGRADE_STATUS_START;
        this.upgradeSteps = [];
        this.connected = false;
        const data = { cmd: 'hideTerminal' };
        this.vscodeService.postMessage(data, null);
    }

    /**
     * tempip校验
     *
     * @returns 校验结果
     */
    checkIP() {
        const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        const invalidIp = /0.0.0.0|255.255.255.255/;
        this.ipCheck = !reg.test(this.tempIP) || invalidIp.test(this.tempIP);
    }

    /**
     * extraip校验
     *
     * @returns 校验结果
     */
    checkExtraIP() {
        const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        const invalidIp = /0.0.0.0|255.255.255.255/;
        this.extraIpCheck = !reg.test(this.extraIP) || invalidIp.test(this.extraIP);
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
    checkPort() {
        if ((/^[1-9]\d*$/.test(this.tempPort)
            && 1 <= parseInt(this.tempPort, UpgradeComponent.CONFIG_RADIX)
            && parseInt(this.tempPort, UpgradeComponent.CONFIG_RADIX) <= 65535)) {
            this.tempPortCheck = false;
        } else {
            this.tempPortCheck = true;
        }
    }

    /**
     * 检测ssh连接是否通畅
     */
    public checkConn() {
        // 对每个输入框进行提交前校验
        this.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        this.elementRef.nativeElement.querySelectorAll(`textarea`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        if (!this.ipCheck && !this.tempPortCheck && !this.usernameCheckNull &&
            (!this.pwdCheckNull || !this.sshkeyCheck)) {
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
                    passphrase: this.passphrase,
                }
            };
            this.vscodeService.postMessage(postData, (data: any) => {
                if (data.search(/SUCCESS/) !== -1) {
                    this.connected = true;
                    this.vscodeService.showInfoBox(this.i18n.plugins_common_tips_connOk, 'info');
                } else if (data.search(/USERAUTH_FAILURE/) !== -1) {
                    this.vscodeService.showInfoBox(this.i18n.plugins_common_tips_connFail, 'error');
                } else if (data.search(/host fingerprint verification failed/) !== -1) {
                    this.vscodeService.showInfoBox(this.i18n.plugins_common_tips_figerFail, 'error');
                } else if (data.search(/Timed out while waiting for handshake/) !== -1) {
                    this.vscodeService.showInfoBox(this.i18n.plugins_common_tips_timeOut, 'error');
                } else if (data.search(/Cannot parse privateKey/) !== -1) {
                    // 密码短语错误
                    this.connected = false;
                    this.vscodeService.showInfoBox(this.i18n.plugins_common_message_passphraseFail, 'error');
                }
                this.connectChecking = false;
            });
        }
    }

    /**
     * 导入私钥
     */
    uploadFile() {
        const localFile = this.elementRef.nativeElement.querySelector('#uploadFile').files[0];
        this.localfilepath = localFile.path.replace(/\\/g, '/');
        const size = localFile.size / 1024 / 1024;
        if (size > 10) {
            this.vscodeService.showInfoBox(this.i18n.plugins_common_message_sshkeyExceedMaxSize, 'warn');
            this.localfilepath = undefined;
            return;
        }
        this.privateKeyCheck();
        this.privateKey = this.localfilepath;
    }

    /**
     * 检查导入文件是否是私钥文件
     */
    privateKeyCheck() {
        const postData = {
            cmd: 'privateKeyCheck',
            data: {
                privateKey: this.localfilepath,
            }
        };
        this.vscodeService.postMessage(postData, (data: any) => {
            if (data !== true) {
                this.vscodeService.showInfoBox(this.i18n.plugins_common_message_sshkeyFail, 'warn');
                this.localfilepath = undefined;
                return;
            }
        });
    }

    /**
     * 上传私钥
     */
    fileUpload() {
        this.elementRef.nativeElement.querySelector('#uploadFile').value = '';
        this.elementRef.nativeElement.querySelector('#uploadFile').click();
    }

    /**
     * sshkey校验
     *
     * @returns 校验结果
     */
    checkShhKey() {
        if (this.privateKey === undefined || this.privateKey === '') {
            this.sshkeyCheckNull = true;
            this.sshkeyCheck = true;
        } else {
            this.sshkeyCheckNull = false;
            this.sshkeyCheck = false;
        }
    }

    /**
     * 改变密文
     */
    uninstallType0() {
        this.uninstallType = 'password';
    }

    /**
     *  改变明文
     */
    uninstallType1() {
        this.uninstallType = 'text';
    }

    /**
     * 改变密码明文或密文
     * @param type 明文或密文
     */
    public changInputType(type: string) {
        this.passphraseType = type;
    }
}
