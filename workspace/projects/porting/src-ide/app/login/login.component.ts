import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidators, TiMessageService, TiValidationConfig } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import {
    MytipService, I18nService, VscodeService, UtilsService, MessageService, CustomValidators
} from '../service';
import { COLOR_THEME } from '../service/constant';
import { VerifierUtil } from '../../../../hyper';

// 证书状态
const enum CERT_STATE {
    STATE_VALID = '1',
    STATE_EXPIRING = '0',
    STATE_EXPIRED = '-1'
}
const enum LOGIN_STATUS {
    OK = 0,  // 普通登录
    NO_FIRST_LOGIN = '0x040300',
    FIRST_LOGIN = '0x040301',  // 首次登录
    EXIPIRED = '0x040302',  // 标识用户密码过期
    WILLEXIPIRED = '0x040312',  // 标识用户密码即将过期
}
const STATUS_SUCCESS = 0;
const HTTPS_STATUS_200 = 200;
const STATUS_TIMEOUT_10000 = 10000;  // 超时状态码
const STATUS_LOCKED_423 = 423;  // 超时状态码

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    form: FormGroup;
    firstform: FormGroup;
    @ViewChild('firstLogin', { static: false }) firstLogin: any;
    public nameValidation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public pwdValidation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public CpwdValidation: TiValidationConfig = {
        type: 'blur'
    };
    public autologin = true;
    public autodis = false;
    public valauto = false;
    public toolVersions: any[] = [];
    public isFirstLogin = false;
    public changeFristpwd = false;
    public tipIpt2: any;
    public confirmPwd: any;
    public remember = false;
    public i18n: any;
    public isShowLoginErrorMsg = false;  // 是否显示登录失败提示
    public isShowUpdatePwdErrorMsg = false;  // 是否显示修改密码错误提示
    public loginErrorMsg: string;  // 登录失败提示
    public updatePwdErrorMsg: string;  // 修改密码错误提示
    public userPwd: FormGroup;
    public pwdReverse: string;
    public label: any;
    public tipStr: string;
    public filePath = '';  // 用户右键源码迁移的文件路径
    public isAffinity = ''; // 区分右键扫描是否为亲和性扫描
    public fileName = '';
    public textType = {
        type1: 'password',
        type2: 'password',
        type3: 'password',
        type4: 'password',
        type5: 'password',
        type6: 'password',
    };

    // 记住密码自动登录
    public isSystem = false;
    public rememberPwd = false;
    public autoLogin = false;
    public configFlag = false;
    public autoUserFlag = false;
    public config: any;
    public autoLoginUser: string;
    public rememberConfig: boolean;
    public autoConfig: boolean;
    public autos: any;
    public showLoading = false;
    public btnDisable = false;

    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };
    public currentTheme = COLOR_THEME.Dark;
    public isSingle: boolean; // 右键传参: 是否是单文件
    public pluginUrlCfg: any = {
        faqThreeZn: '',
        faqThreeEn: ''
    };
    public userName: string; // 当前用户名
    public adminName = 'portadmin';
    public currLang: number;

    constructor(
        fb: FormBuilder,
        ff: FormBuilder,
        private elementRef: ElementRef,
        public timessage: TiMessageService,
        public router: Router,
        private activaedRoute: ActivatedRoute,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private messageServe: MessageService,
        public utils: UtilsService) {
        this.i18n = this.i18nService.I18n();
        this.validation.errorMessage.regExp = this.i18n.common_term_no_samepwd;
        this.validation.errorMessage.required = this.i18n.common_term_no_samepwd;
        this.form = fb.group({
            name: new FormControl('', [TiValidators.required]),
            pwd: new FormControl('', [TiValidators.required, CustomValidators.isEqualTo(this.i18n)]),
        });
        this.firstform = ff.group({
            npwd: new FormControl('', [CustomValidators.passwordAdm(this.i18n), this.compareCpwd]),
            Cpwd: new FormControl('', [this.firstPwdConfirm])
        });
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = msg.colorTheme;
        });
    }

    compareCpwd = (control: FormControl) => {
        if (!control.value) {
            return { required: true };
        } else if (this.firstform.controls.Cpwd.value) {
            this.firstform.get('Cpwd').updateValueAndValidity();
            return {};
        }
        return {};
    }

    // 首次管理员设置密码
    firstPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.firstform.controls.npwd.value) {
            return { Cpwd: { tiErrorMessage: this.i18n.common_term_no_samepwd } };
        }
        return {};
    }


    ngOnInit() {
        this.currLang = I18nService.getLang();
        if (document.body.className === 'vscode-light') {
            this.currentTheme = COLOR_THEME.Light;
        }
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        this.isSystem = true;
        this.readLoginConfig();
        // 判断当前页面是 用户登录
        this.activaedRoute.queryParams.subscribe((data) => {
            if (data.filePath) {
                this.filePath = data.filePath;
                this.fileName = data.fileName;
                this.isSingle = data.isSingle;
                this.isAffinity = data.isAffinity;
            }
        });
        this.label = {
            userName: this.i18n.common_term_login_name,
            newPwd: this.i18n.common_term_user_label.newPwd,
            Cpwd: this.i18n.common_term_user_label.confirmPwd,
            oldPwd: this.i18n.common_term_user_label.oldPwd
        };

        this.userPwd = new FormGroup({
            userName: new FormControl(''),
            oldPwd: new FormControl('', [this.oldPwd]),
            pwd: new FormControl('', [this.updateInitPwdConfirm]),
            cpwd: new FormControl('', [this.userPwdConfirm])
        });

        // 查询操作员是否首次登录
        const option = {
            url: '/users/admin/status/',
            noToken: true
        };
        this.vscodeService.get(option, (data: any) => {
            // 查询接口成功
            if (data.status === 0) {  // 0x040301
                // 当前是第一次登录
                if (data.data.first_login === 1) {
                    this.isFirstLogin = true;
                }
            } else {
                this.showInfoBox(data, 'warn');
            }
            this.showLoading = false;
        });
        this.confirmPwd = this.i18n.common_term_user_label.confirmPwd;
        this.nameValidation.errorMessage.required = this.i18n.common_term_valition_rule1;
        this.pwdValidation.errorMessage.required = this.i18n.common_term_no_password;
        this.tipStr = this.i18n.plugins_porting_message_passwordExpired;
        this.autos = [
            { labelName: this.i18n.plugins_porting_label_rememberPwd, checked: false },
            { labelName: this.i18n.plugins_porting_label_autoLogin, checked: false },
        ];
    }

    /**
     * 判断页面输入的用户是否配置了Auto
     */
    getAutoCofig() {
        this.textType.type3 = 'password';
        if (this.form.get('name').value === this.autoLoginUser) {
            this.autos[0].checked = this.rememberConfig;
            this.autos[1].checked = this.autoConfig;
            if (this.rememberConfig) {
                const msgData = {
                    cmd: 'saveConfig',
                    data: {
                        type: 'remember',
                        username: this.autoLoginUser,
                    }
                };
                this.vscodeService.postMessage(msgData, (data: any) => {
                    if (typeof data === 'object' && !this.valauto) {
                        this.showInfoBox(data, 'error');
                        this.autologin = true;
                        this.valauto = true;
                    }else {
                        this.autologin = false;
                        this.form.get('pwd').setValue(data);
                    }
                });
            }
        } else {
            const username = this.form.get('name').value;
            const msg = {
                cmd: 'getpwd',
                data: {
                    username
                }
            };
            this.autos[0].checked = false;
            this.autos[1].checked = false;
            this.vscodeService.postMessage(msg, (data: any) => {
                if (data) {
                    this.autos[0].checked = true;
                }
                this.autologin  = data ? false : true;
                this.form.get('pwd').setValue(data);
            });
        }
    }

    /**
     * 记住密码自动登录页面实现逻辑
     * @param item Auto
     * @param i 自动登录和记住密码标识
     */
    checkEvent(item: { checked: any; }, i: number) {
        // 如果勾选自动登录，则联动勾选记住密码
        if (i === 1) {
            if (item.checked) {
                this.autos.forEach((m: { checked: boolean; }) => { m.checked = true; });
            }
        } else {
            const res = this.autos.some((m: { checked: any; }) => {
                return !m.checked;
            });

            // 如果取消记住密码，则联动取消勾选自动登录
            if (res) {
                this.autos[1].checked = false;
            }
        }
    }

    /**
     * 获取自动登录配置信息
     */
    readLoginConfig() {
        this.configFlag = false;
        const msgData = { cmd: 'readConfig' };
        this.vscodeService.postMessage(msgData, (data: any) => {
            this.config = data;
            if (this.config.portAuto.length > 0) {
                this.autoLoginUser = this.config.portAuto[0].user;
                this.rememberConfig = this.config.portAuto[0].remember;
                this.autoConfig = this.config.portAuto[0].auto;
                this.form.get('name').setValue(this.autoLoginUser);
                this.getAutoCofig();
                this.configFlag = true;
            }
        });
    }

    /**
     * 将记住密码自动登录配置写入配置文件
     */
    saveConfig(userName: string, password: string) {
        this.rememberPwd = this.autos[0].checked;
        this.autoLogin = this.autos[1].checked;
        if (this.rememberPwd || this.autoLogin) {
            this.config.portAuto = [];
            this.config.portAuto.push({ user: userName, remember: this.rememberPwd, auto: this.autoLogin });
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                    pwd: password
                },
            }, null);
            this.configFlag = true;
        } else if (this.configFlag && this.autoLoginUser === userName) {
            this.config.portAuto = [];
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                },
            }, null);
            this.configFlag = false;
        }
    }


    checkGroup() {
        const errors: ValidationErrors | null = TiValidators.check(this.form);

        // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
        if (errors) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement.querySelector(`[formControlName = ${firstError}]`)
                .focus();
            this.elementRef.nativeElement.querySelector(`[formControlName = ${firstError}]`)
                .blur();
            return false;
        }

        return true;
    }
    // 发送消息给vscode, 右下角弹出提醒框
    showInfoBox(data: any, type: any) {
        let info: any;
        if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
            info = data.infochinese;
        } else {
            info = data.info;
        }
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    showErrMsg(data: any, type: number) {
        switch (type) {
            case 0:
                this.isShowLoginErrorMsg = true;
                if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                    this.loginErrorMsg = data.infochinese;
                } else {
                    this.loginErrorMsg = data.info;
                }
                break;
            case 1:
                this.isShowUpdatePwdErrorMsg = true;
                if (((self as any).webviewSession || {}).getItem('language') === 'zh-cn') {
                    this.updatePwdErrorMsg = data.infochinese;
                } else {
                    this.updatePwdErrorMsg = data.info;
                }
                break;
            default:
                break;
        }
    }

    public setPwd() {
        if (this.btnDisable) {
            return;
        }
        this.showLoading = true;
        this.btnDisable = true;
        const errors: ValidationErrors | null = TiValidators.check(this.firstform);
        // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
        if (errors) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                .focus();
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                .blur();
            this.btnDisable = false;
            this.showLoading = false;
            return;
        }
        const option = {
            url: '/users/admin/configuration/',
            params: {
                new_password: this.firstform.get('npwd').value,
                confirm_password: this.firstform.get('Cpwd').value
            }
        };
        this.vscodeService.post(option, (data: any) => {
            this.btnDisable = false;
            this.showLoading = false;
            if (data.status === 0) {
                this.isFirstLogin = false;
            } else {
                this.showInfoBox(data, 'warn');
            }
            setTimeout(() => {
                this.elementRef.nativeElement.querySelector(`[formControlName='pwd']`).focus();
            }, 0);
            this.form.get('name').setValue(this.adminName);
            this.firstform.reset();
            this.autodis = true;
        });
    }

    public async preLogin() {
        if (this.btnDisable) {
            return;
        }

        this.showLoading = true;
        this.btnDisable = true;
        if (!this.checkGroup()) {
            this.showLoading = false;
            this.btnDisable = false;
            return;
        }
        await this.login();
    }


    public async login() {
        ((self as any).webviewSession || {}).setItem('routerFile', 'false');
        const option = {
            url: '/users/login/',
            noToken: true,
            params: {
                username: this.form.get('name').value,
                password: this.form.get('pwd').value
            },
            timeout: 10000
        };

        this.vscodeService.post(option, (data: any) => {
            this.showLoading = false;
            this.btnDisable = false;
            if (data && data.httpsStatus === HTTPS_STATUS_200) {
                if (data.status === LOGIN_STATUS.OK || data.realStatus === LOGIN_STATUS.FIRST_LOGIN ||
                    data.realStatus === LOGIN_STATUS.EXIPIRED || data.realStatus === LOGIN_STATUS.WILLEXIPIRED) {
                    if (data.status === LOGIN_STATUS.OK) {
                        if ((this.autos[0].checked || this.autos[1].checked) && data.data.role === 'Admin') {
                            const message = {
                                cmd: 'showInfoBox',
                                data: {
                                    info: this.i18n.plugins_porting_label_adminAutoLoginTip,
                                    type: 'info'
                                }
                            };
                            this.vscodeService.postMessage(message, null);
                        } else {
                            this.saveConfig(data.data.username, this.form.get('pwd').value);
                        }
                    }

                    ((self as any).webviewSession || {}).setItem('role', data.data.role);
                    ((self as any).webviewSession || {}).setItem('username', data.data.username);
                    ((self as any).webviewSession || {}).setItem('loginId', data.data.id);
                    ((self as any).webviewSession || {}).setItem('workspace', data.data.workspace);
                    ((self as any).webviewSession || {}).setItem('isFirst', '0');
                    this.userName = data.data.username;
                    if (data.realStatus === LOGIN_STATUS.NO_FIRST_LOGIN && data.data.is_weak_password) {
                        this.utils.showTextMsg(this.i18n.weak_pwd_login_tip, 'warn');
                    }
                    // 标识用户初次登录
                    if (data.realStatus === LOGIN_STATUS.FIRST_LOGIN) {
                        ((self as any).webviewSession || {}).setItem('isFirst', '1');

                        this.changeFristpwd = true;
                        this.isShowLoginErrorMsg = false;
                        this.isShowUpdatePwdErrorMsg = false;
                        this.firstLogin.Open();
                        return;
                    }
                    // 标识用户密码过期
                    if (data.realStatus === LOGIN_STATUS.EXIPIRED) {
                        ((self as any).webviewSession || {}).setItem('isExpired', '1');
                        this.changeFristpwd = false;
                        this.isShowLoginErrorMsg = false;
                        this.isShowUpdatePwdErrorMsg = false;
                        this.firstLogin.Open();
                        return;
                    }
                    // 登录成功，发送消息给vscode,刷新左侧树
                    this.vscodeService.postMessage({ cmd: 'loginSuccess' }, null);

                    // 标识用户密码快过期
                    if (data.realStatus === LOGIN_STATUS.WILLEXIPIRED) {
                        this.showInfoBox(data, 'info');
                        this.changeFristpwd = true;
                    }
                    // 证书有效性检查
                    this.checkCert();

                    const param: any = {
                        queryParams: {
                            isLoginRouter: true
                        }
                    };
                    if (!this.autos[0].checked) {
                        const msg = {
                            cmd: 'deletePwd',
                            data: {
                                username: ((self as any).webviewSession || {}).getItem('username')
                            }
                        };
                        this.vscodeService.postMessage(msg, () => {});
                    }

                    if (this.filePath.length > 0) {
                        param.queryParams.filePath = this.filePath;
                        param.queryParams.fileName = this.fileName;
                        param.queryParams.isSingle = this.isSingle;
                        if (this.isAffinity === 'false') {
                          this.router.navigate(['home'], param);
                        } else {
                          this.router.navigate(['PortingPre-check'], param);
                        }
                    } else {
                        this.router.navigate(['migrationAppraise'], param);
                    }
                }
                if (data.status !== 0) {
                    this.showErrMsg(data, 0);
                    if (!this.autologin) {
                        this.autologin = true;
                        this.form.get('pwd').setValue('');
                    }
                }
                this.changeFristpwd = false;
            }
            if (data.httpsStatus === STATUS_TIMEOUT_10000) {  // 超时
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: this.i18n.login_timeout_tip,
                        type: 'error'
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
            if (data.httpsStatus === STATUS_LOCKED_423) {  // ip被锁
                this.showErrMsg(data, 0);
            }
        });
    }

    /**
     * 验证密码校验按钮
     */
    public setUserPwd() {
        if (this.btnDisable) {
            return;
        }
        this.btnDisable = true;
        this.showLoading = true;
        const errors: ValidationErrors | null = TiValidators.check(this.userPwd);
        // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
        if (errors) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                .focus();
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                .blur();
            this.btnDisable = false;
            this.showLoading = false;
            return;
        }

        const params = {
            old_password: this.userPwd.get('oldPwd').value,
            new_password: this.userPwd.get('pwd').value,
            confirm_password: this.userPwd.get('cpwd').value
        };
        const loginId = ((self as any).webviewSession || {}).getItem('loginId');
        this.vscodeService.post(
            { url: `/users/${encodeURIComponent(loginId)}/resetpassword/`, params },
            (data: any) => {
                this.btnDisable = false;
                this.showLoading = false;
                if (data.status === 0) {
                    this.userPwd.reset();
                    this.logOut();
                    this.firstLogin.Close();
                    this.form.get('pwd').setValue('');
                    this.isShowUpdatePwdErrorMsg = false;
                    this.showInfoBox(data, 'info');
                    this.elementRef.nativeElement.querySelector(`[formControlName='pwd']`).focus();
                } else {
                    this.showErrMsg(data, 1);
                }
            });
    }

    /**
     * 关闭修改密码弹框
     */
    public closeChangePwdMask() {
        this.firstLogin.Close();
        this.userPwd.reset();
        this.changeFristpwd = false;
    }

    public async logOut() {

        this.vscodeService.post({ url: '/users/logout/' }, async (data: any) => {
            if (data.status === 0) {
                ((self as any).webviewSession || {}).setItem('role', '');
                ((self as any).webviewSession || {}).setItem('username', '');
                ((self as any).webviewSession || {}).setItem('keepGoing', '1');

            }
        });
    }

    private async checkCert() {
        const certOption = {
            url: '/cert/',
            method: 'GET'
        };
        this.vscodeService.get(certOption, (resp: any) => {
            if (resp.status === STATUS_SUCCESS) {
                const status = resp.data.cert_flag;
                let warnMsg = '';
                let showWarnMsg = false;
                switch (status) {
                    case CERT_STATE.STATE_EXPIRED:
                        warnMsg = this.i18n.plugins_porting_cert_expired;
                        showWarnMsg = true;
                        break;
                    case CERT_STATE.STATE_EXPIRING:
                        const validTime = resp.data.cert_expired.replace('T', ' ');
                        warnMsg = this.i18nService
                          .I18nReplace(this.i18n.plugins_porting_cert_expiring, { 0: validTime });
                        showWarnMsg = true;
                        break;
                    default:
                        showWarnMsg = false;
                        break;
                }
                if (showWarnMsg) {
                    const message = {
                        cmd: 'showInfoBox',
                        data: {
                            info: warnMsg,
                            type: 'info'
                        }
                    };
                    this.vscodeService.postMessage(message, null);
                }
            }
        });
    }

    /**
     * 改变密文
     */
    changeType(type: any) {
        switch (type) {
            case 1:
                this.textType.type1 = 'password';
                break;
            case 2:
                this.textType.type2 = 'password';
                break;
            case 3:
                this.textType.type3 = 'password';
                break;
            case 4:
                this.textType.type4 = 'password';
                break;
            case 5:
                this.textType.type5 = 'password';
                break;
            case 6:
                this.textType.type6 = 'password';
                break;
            default:
                break;
        }
    }

    /**
     *  改变明文
     */
    changeType1(type: any) {
        switch (type) {
            case 1:
                this.textType.type1 = 'text';
                break;
            case 2:
                this.textType.type2 = 'text';
                break;
            case 3:
                this.textType.type3 = 'text';
                break;
            case 4:
                this.textType.type4 = 'text';
                break;
            case 5:
                this.textType.type5 = 'text';
                break;
            case 6:
                this.textType.type6 = 'text';
                break;
            default:
                break;
        }
    }
    handleChange(e: any) {
        this.isShowLoginErrorMsg = false;
        if (e === 'portadmin') {
            this.autodis = true;
            this.form.get('pwd').setValue('');
        }else {
            this.autodis = false;
        }
    }


    // 旧密码校验
    oldPwd = (control: FormControl) => {
        let newPwd = '';
        if (this.userPwd && this.userPwd.controls) {
            newPwd = this.userPwd.controls.pwd.value;
        }
        if (!control.value) {
            return { oldPwd: { tiErrorMessage: this.i18n.common_term_no_password } };
        } else if (newPwd) { // 如果新密码存在 则每次输入旧密码都去校验新密码规则
            this.userPwd.get('pwd').updateValueAndValidity();
            return null;
        }
        return null;
    }
    // 新密码校验
    updateInitPwdConfirm = (control: FormControl) => {
        let oldPwd = '';
        if (this.userPwd && this.userPwd.controls) {
            oldPwd = this.userPwd.controls.oldPwd.value;
        }
        if (!control.value) {
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
        } else if (control.value === oldPwd) { // 相同
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.different } };
        } else if (control.value === oldPwd.split('').reverse().join('')) { // 逆序
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.reverse } };
        } else if (!VerifierUtil.passwordVerification(control.value)) {
            return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.complex } };
        } else if (this.userPwd.controls.cpwd.value) {
            this.userPwd.get('cpwd').updateValueAndValidity();
            return {};
        }
        return {};
    }
    // 确认密码校验
    userPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
        } else if (control.value !== this.userPwd.controls.pwd.value) {
            return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
        }
        return {};
    }
}


