import { Component, ElementRef, OnInit } from '@angular/core';
import {
    I18nService, UtilsService, COLOR_THEME, VscodeService, MessageService, CustomValidators
} from '../service';
import { FormControl, FormGroup } from '@angular/forms';
import { fileSize } from '../global/globalData';
const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2,
    MAXIMUM_TASK = '0x010125', // 文件上传任务已达到上限
}

const enum WHITELISTMANAGEMENT {
    RECOVERY = 1,
    UPDATE = 2
}

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}



@Component({
    selector: 'app-passinglist-management',
    templateUrl: './passinglist-management.component.html',
    styleUrls: ['./passinglist-management.component.scss']
})
export class PassingListManagementComponent implements OnInit {

    public i18n: any;
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private elementRef: ElementRef,
        public utilsService: UtilsService,
        private msgService: MessageService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = msg.colorTheme;
        });
    }
    public userPwdBackUp: FormGroup;
    public userPwdUpgrade: FormGroup;
    public userPwdRecovery: FormGroup;
    // 升级操作密码输入框属性值
    public pwdUpgrade: any;
    // 恢复操作密码输入框属性值
    public pwdRecovery: any;
    // 升级操作密码输入框下是否展示密码校验错误提示信息标志
    public errorPwdUpgradeFlag = false;
    // 恢复操作密码输入框下是否展示密码校验错误提示信息标志
    public errorPwdRecoveryFlag = false;
    // 升级操作密码输入框下展示的密码校验错误提示信息
    public errorPwdUpgradeInfo: any;
    // 恢复操作密码输入框下展示的密码校验错误提示信息
    public errorPwdRecoveryInfo: any;
    // 是否展示升级操作页面标志
    public isShowUpgrade = false;
    // 是否展示恢复操作页面标志
    public isShowRecovery = false;
    // 当前所属语言标志
    public currLang: any;
    // 上传依赖字典压缩包的路径输入框提示信息
    public uploadPrompt: string;
    // 用户空间信息
    public userPath: string;
    // 上传依赖字典压缩包的路径
    public uploadPath: string;
    // 是否正在上传标志
    public isUploading = false;
    // 依赖字典管理备份，升级，恢复任务是否正在执行标志
    public isProcessing = false;
    public packpath = '';
    public currentTheme = 1;
    public portType = {
        type1: 'password',
        type2: 'password',
        type3: 'password'
    };
    public pluginUrlCfg: any = {
        portingPackages: ''
    };
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        if (document.body.className === 'vscode-light') {
            this.currentTheme = COLOR_THEME.Light;
        }
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'upgradeCanceled') {
                this.isUploading = false;
            }
        });
        this.userPwdBackUp = new FormGroup({
            pwd: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
        });
        this.userPwdUpgrade = new FormGroup({
            pwd: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
            packpath: new FormControl('', [])
        });
        this.userPwdRecovery = new FormGroup({
            pwd: new FormControl('', [CustomValidators.isRequired(this.i18n)]),
        });
        this.currLang = I18nService.getLang();
        setTimeout(() => {
            this.getWorkSpace();
        }, 4000);
    }

    // 获取用户空间
    public getWorkSpace() {
        this.vscodeService.get({ url: '/customize/' }, (resp: any) => {
            if (resp.status === 0) {
                this.userPath =
                  `${resp.data.customize_path}/portadv/${((self as any).webviewSession || {}).getItem('username')}/`;
                this.uploadPrompt =
                  this.i18nService.I18nReplace(
                      this.i18n.plugins_porting_tips_whiteListManagement_uploadPath, { 0: this.userPath }
                  );
            }
        });
    }

    /**
     * 改变密文
     */
    portType0(type: any) {
        if (type === 1) {
            this.portType.type1 = 'password';
        } else if (type === 2) {
            this.portType.type2 = 'password';
        } else {
            this.portType.type3 = 'password';
        }
    }

    /**
     *  改变明文
     */
    portType1(type: any) {
        if (type === 1) {
            this.portType.type1 = 'text';
        } else if (type === 2) {
            this.portType.type2 = 'text';
        } else {
            this.portType.type3 = 'text';
        }
    }

    beginUpgrade() {
        this.isShowUpgrade = true;
        this.isProcessing = true;
        this.isUploading = false;
    }

    cancelUpgrade() {
        this.pwdUpgrade = '';
        this.isShowUpgrade = false;
        this.errorPwdUpgradeInfo = '';
        this.errorPwdUpgradeFlag = false;
        this.uploadPath = '';
        this.isProcessing = false;
    }

    upgrade() {
        const operation = WHITELISTMANAGEMENT.UPDATE;
        if (!this.pwdUpgrade) {
            this.errorPwdUpgradeFlag = true;
            this.errorPwdUpgradeInfo = this.i18n.common_term_no_password;
            return;
        }
        this.whitelistManagement(operation, this.pwdUpgrade);
    }

    getPwdUpgrade() {
        this.errorPwdUpgradeFlag = false;
    }

    beginRecovery() {
        this.isShowRecovery = true;
        this.isProcessing = true;
    }

    cancelRecovery() {
        this.pwdRecovery = '';
        this.isShowRecovery = false;
        this.errorPwdRecoveryInfo = '';
        this.errorPwdRecoveryFlag = false;
        this.isProcessing = false;
    }

    recovery() {
        const operation = WHITELISTMANAGEMENT.RECOVERY;
        if (!this.pwdRecovery) {
            this.errorPwdRecoveryFlag = true;
            this.errorPwdRecoveryInfo = this.i18n.common_term_no_password;
            return;
        }
        this.whitelistManagement(operation, this.pwdRecovery);
    }

    getPwdRecovery() {
        this.errorPwdRecoveryFlag = false;
    }

    whitelistManagement(operation: any, pswd: any) {
        const params = {
            password: pswd,
            option: operation
        };
        const option = {
            url: '/portadv/tasks/dependency_dictionary_manage/',
            params
        };
        this.vscodeService.post(option, (data: any) => {
            if (data) {
                if (data.status === STATUS.SUCCESS) {
                    this.cancelUpgrade();
                    this.cancelRecovery();
                    this.isProcessing = true;
                    this.whitelistManagementProcess(data.data.task_name, operation);
                } else if (data.status === STATUS.INSUFFICIENT_SPACE) {
                    this.utilsService.sendDiskAlertMessage();
                } else {
                    if (this.operWhitelistErrorInfo(data, operation)) {
                        this.showMessageByLang(data, 'error');
                    }
                }
            }
        });
    }

    whitelistManagementProcess(taskName: any, option: any) {
        const message = {
            cmd: 'whitelistManagementProcess',
            data: {
                taskId: taskName,
                option
            }
        };
        // 创建task成功，发送消息给vscode,弹出刷新进度条框
        this.vscodeService.postMessage(message, (data: any) => {
            this.isProcessing = false;
        });
    }

    // 用户密码校验失败提示信息需要展示在输入框下方，单独处理
    operWhitelistErrorInfo(data: any, operation: any) {
        let errorpwdinfo = '';
        if (LANGUAGE_TYPE.ZH === this.currLang) {
            if (-1 !== data.infochinese.indexOf('当前用户密码错误或用户已锁定')) {
                errorpwdinfo = data.infochinese;
            }

        } else {
            if (-1 !== data.info.indexOf(
                'The password of the current user is incorrect or the user has been locked.')) {
                errorpwdinfo = data.info;
            }
        }
        if (errorpwdinfo) {
            switch (operation) {
                case WHITELISTMANAGEMENT.UPDATE:
                    this.errorPwdUpgradeInfo = errorpwdinfo;
                    this.errorPwdUpgradeFlag = true;
                    break;
                case WHITELISTMANAGEMENT.RECOVERY:
                    this.errorPwdRecoveryInfo = errorpwdinfo;
                    this.errorPwdRecoveryFlag = true;
                    break;
                default:
                    break;
            }
            return false;
        }
        return true;
    }



    // 发送消息给vscode, 右下角弹出提醒框
    showMessageByLang(data: any, type: any) {
        if (LANGUAGE_TYPE.ZH === this.currLang) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }

    // 发送消息给vscode, 右下角弹出提醒框
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

    zipUpload() {
        this.elementRef.nativeElement.querySelector('#depzipload').value = '';
        this.elementRef.nativeElement.querySelector('#depzipload').click();
    }

    uploadFile() {
        this.isUploading = true;
        const file = this.elementRef.nativeElement.querySelector('#depzipload').files[0];
        const size = file.size / 1024 / 1024;
        if (size > fileSize) {
            this.isUploading = false;
            this.showInfoBox(this.i18n.plugins_porting_message_fileExceedMaxSize, 'warn');
            return;
        }
        const getUrl = '/portadv/tasks/dependency_dictionary/package/?filename=' + encodeURIComponent(file.name)
            + '&filesize=' + encodeURIComponent(file.size);
        this.vscodeService.get({ url: getUrl }, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                const uploadMsg = {
                    cmd: 'uploadProcess',
                    data: {
                        msgID: 'uploadFile',
                        url: '/portadv/tasks/dependency_dictionary/package/',
                        fileUpload: 'true',
                        filePath: file.path,
                        fileSize: file.size,
                        need_unzip: false,
                        fileName: file.name,
                        needHeaderFileName: true,
                        uploadPrefix: this.i18n.plugins_porting_uploadPrefix_whiteListPack,
                        whiteListOpt: true
                    }
                };
                this.vscodeService.postMessage(uploadMsg, (resp: any) => {
                    this.isUploading = false;
                    if (resp.status === STATUS.SUCCESS) {
                        this.uploadPath = file.name;
                        this.showMessageByLang(resp, 'info');
                    } else if (resp.realStatus === STATUS.MAXIMUM_TASK) { // 等待上传中
                        this.isUploading = true;
                        this.handleUploadWaiting(uploadMsg, resp);
                    } else if (resp.status === STATUS.FAIL) {
                        this.uploadPath = '';
                        this.showMessageByLang(resp, 'error');
                    } else if (resp.status === STATUS.INSUFFICIENT_SPACE) {
                        this.uploadPath = '';
                        this.utilsService.sendDiskAlertMessage();
                    }
                    if (resp === 'timeout') {
                        this.uploadPath = '';
                        this.showInfoBox(this.i18n.common_term_report_500, 'warn');
                    }
                });
            } else if (data.status === STATUS.FAIL && data.data.status === STATUS.FAIL) {
                this.isUploading = false;
                const message = {
                    cmd: 'uploadMigrateFile',
                    data: { info: (this.currLang === LANGUAGE_TYPE.ZH) ? data.infochinese : data.info }
                };
                this.vscodeService.postMessage(message, (res: any) => {
                    if (res.status === STATUS.SUCCESS) {
                        const option = {
                            url: '/portadv/tasks/delete/dependency_dictionary/package/',
                        };
                        this.vscodeService.post(option, (response: any) => {
                            this.showMessageByLang(response, 'info');
                        });
                    }
                    this.uploadPath = '';
                });
            } else if (data.status === STATUS.INSUFFICIENT_SPACE) {
                this.utilsService.sendDiskAlertMessage();
                this.isUploading = false;
            } else {
                this.showMessageByLang(data, 'error');
                this.isUploading = false;
            }
        });
    }

    // 处理等待上传中
    handleUploadWaiting(uploadMsg: any, resp: any) {
        const newMsg = Object.assign({}, uploadMsg, { cmd: 'waitingUploadTask' });
        this.vscodeService.postMessage(newMsg, (res: any) => {
          this.isUploading = false;
          // 轮询达到最大次数
          if (res) {
            this.showMessageByLang(resp, 'error');
          }
        });
    }
}

