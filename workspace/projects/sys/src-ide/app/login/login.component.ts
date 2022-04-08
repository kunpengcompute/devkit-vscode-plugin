import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { MytipService } from '../service/mytip.service';
import { VscodeService, COLOR_THEME, HTTP_STATUS_CODE, currentTheme } from '../service/vscode.service';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import { MessageService } from '../service/message.service';
/**
 *  自定义校验规则
 */
export class CustomValidators {
    /**
     * 校验必填输入不为空
     * @param i18n 国际化引入
     */
    public static isEqualTo(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return control.value === '' ? { isEqualTo: { tiErrorMessage: i18n.plugins_perf_tips_isRequired } } : null;
        };
    }

    /**
     * 校验密码输入正确
     * @param i18n 国际化引入
     */
    public static password(i18n: any): ValidatorFn {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            return reg.test(control.value) === false
                ? { pwd: { tiErrorMessage: i18n.plugins_perf_tips_passwordCheck } } : null;
        };
    }

    /**
     * 校验密码输入正确
     * @param i18n 国际化引入
     * @param pwdReverse 旧密码逆序
     */
    public static passwordReverse(i18n: any, pwdReverse: any): ValidatorFn {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            return reg.test(control.value) === false || control.value === pwdReverse ?
                { pwd: { tiErrorMessage: i18n.plugins_perf_tips_reverseCheck } } : null;
        };
    }

    /**
     * 校验旧密码是否输入
     * @param i18n 国际化引入
     */
    public static oldPwd(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return Boolean(control.value) === false ? {
                oldPwd: {
                    tiErrorMessage: i18n.plugins_perf_tips_oldPwdCheck
                }
            } : undefined;
        };
    }

    /**
     * 校验确认密码
     * @param pwd 密码
     * @param i18n 国际化引入
     */
    public static confirmPwd(pwd: any, i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return true ? { confirmPwd: { tiErrorMessage: i18n.plugins_perf_tips_confirmPwdCheck + pwd } } : null;
        };
    }

}

/**
 * 后台返回的登录请求响应
 */
const enum LOGIN_STATUS {
    FIRST_LOGIN = 'UserManage.session.Post.FirstLogin',
    WILLEXIPIRED = 'UserManage.session.Post.PwdWillExpired',
    PWD_EXIPIRED = 'UserManage.session.Post.PwdExpired',
}

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
            required: ''
        }
    };
    public pwdValidation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            required: ''
        }
    };
    public CpwdValidation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            required: ''
        }
    };

    public autologin = true;
    public autodis = false;
    public valauto = false;

    public toolVersions: any[] = [];
    public currTheme = COLOR_THEME.Dark;
    public isFirstLogin = false;
    public loginUserId: string;
    public adminUserName = 'tunadmin';
    public changeFristpwd = false;
    public tipIpt2: any;
    public confirmPwd: any;
    public remember = false;
    public i18n: any;
    public isShow = false;
    public isPwdShow = false;
    public msg: string;
    public userPwd: FormGroup;
    public pwdReverse: string;
    public changeFirstpwd = false;
    public label: any;
    public tipStr: string;
    public textType = {
        type1: 'password',
        type2: 'password',
        type3: 'password',
        type4: 'password',
        type5: 'password',
        type6: 'password',
    };
    public showEye = false;
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
    public panelId: any;  // login页panelId
    public showLoading = false;
    public btnDisable = false;
    public currLoginId = 0;

    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {
            regExp: '',
            required: ''
        }
    };


    public pluginUrlCfg: any = {
        sysLogin_openFAQ1: '',
        sysLogin_openFAQ2: '',
    };

    constructor(
        fb: FormBuilder,
        ff: FormBuilder,
        private elementRef: ElementRef,
        public router: Router,
        private msgService: MessageService,
        private activaedRoute: ActivatedRoute,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public customValidatorsService: CustomValidatorsService) {
        this.i18n = this.i18nService.I18n();
        this.validation.errorMessage.regExp = this.i18n.plugins_perf_tips_confirmPwdCheck;
        this.validation.errorMessage.required = this.i18n.plugins_perf_tips_confirmPwdCheck;
        this.form = fb.group({
            name: new FormControl('', [TiValidators.required, CustomValidators.isEqualTo(this.i18n)]),
            pwd: new FormControl('', [TiValidators.required, CustomValidators.isEqualTo(this.i18n)]),
        });
        this.firstform = ff.group({
            npwd: new FormControl('', [CustomValidators.password(this.i18n)]),
            Cpwd: new FormControl('', [this.userPwdConfirm])
        });
    }

    userPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.firstform.controls.npwd.value) {
            return { cpwd: { tiErrorMessage: this.i18n.plugins_perf_tips_confirmPwdCheck } };
        }
        return {};
    }
    pwdValidator = (control: FormControl) => {
        if (this.userPwd && this.userPwd.controls.oldPwd.value) {
            if (control.value === this.userPwd.controls.oldPwd.value) {
                return {
                    cpwd: {
                        confirm: true,
                        error: true,
                        tiErrorMessage: this.i18n.validata.pwd_rule4
                    }
                };
            } else if (control.value === this.userPwd.controls.oldPwd.value.split('').reverse().join('')) {
                return {
                    cpwd: {
                        confirm: true,
                        error: true,
                        tiErrorMessage: this.i18n.validata.pwd_rule3
                    }
                };
            }
        }
        return null;
    }
    userFirstPwdConfirm = (control: FormControl) => {
        if (!control.value) {
            return { cpwd: { tiErrorMessage: this.i18n.common_term_login_error_info[1] } };
        } else if (control.value !== this.userPwd.controls.pwd.value) {
            return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.validata.pwd_conf } };
        }
        return {};
    }

    /**
     * 组件初始化
     */
    ngOnInit() {

        this.isSystem = true;
        this.readLoginConfig();

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });

        // 判断当前页面是 用户登录 还是 切换用户
        this.activaedRoute.queryParams.subscribe((data) => {
            this.panelId = data.panelId;
        });

        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });


        // 查询是否安装后首次登录
        const option = {
            url: '/users/admin-status/',
            noToken: true,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                if (data.data.is_firstlogin === true) {
                    this.isFirstLogin = true;
                }
            } else {
                if (self.webviewSession.getItem('language') === 'zh-cn') {
                    this.vscodeService.showInfoBox(data.message, 'warn');
                } else {
                    this.vscodeService.showInfoBox(data.code, 'warn');
                }
            }
            this.showLoading = false;
        });

        this.label = {
            Pwd: this.i18n.plugins_perf_label_userManager.password,
            Cpwd: this.i18n.plugins_perf_label_userManager.confirmPwd,
            oldPwd: this.i18n.plugins_perf_label_userManager.oldPwd
        };
        this.userPwd = new FormGroup({
            oldPwd: new FormControl('', [
                this.customValidatorsService.checkEmpty(this.i18n.common_term_login_error_info[1])
            ]),
            pwd: new FormControl('', [
                this.pwdValidator,
                this.customValidatorsService.checkPassword(this.form.get('name'))
            ]),
            cpwd: new FormControl('', [this.userFirstPwdConfirm])
        });
        this.confirmPwd = this.i18n.plugins_perf_label_userManager.confirmPwd;
        this.nameValidation.errorMessage.required = this.i18n.common_term_login_error_info[0];
        this.pwdValidation.errorMessage.required = this.i18n.common_term_login_error_info[1];
        this.tipStr = this.i18n.pwd_guoqi;
        this.loginUserId = self.webviewSession.getItem('loginId');
        this.autos = [
            { labelName: this.i18n.plugins_perf_label_rememberPwd, checked: false },
            { labelName: this.i18n.plugins_perf_label_autoLogin, checked: false },
        ];
    }

    /**
     * 关闭修改密码页面
     */
    public closePwdReset() {
        this.firstLogin.Close();
        this.changeFirstpwd = true;
        this.isPwdShow = false;
        this.userPwd.reset();
        this.btnDisable = false;
        setTimeout(() => {
            this.form.get('pwd').setValue(null);
            document.getElementById('userloginpwd').focus();
        }, 500);
    }

    /**
     * 判断页面输入的用户是否配置了Auto
     */
    getAutoCofig() {
        if (this.form.get('name').value === this.autoLoginUser) {
            this.autos[0].checked = this.rememberConfig;
            this.autos[1].checked = this.autoConfig;
            if (this.rememberConfig) {
                const msgData = {
                    cmd: 'saveConfig',
                    data: {
                        username: this.autoLoginUser,
                        type: 'remember'
                    }
                };
                this.vscodeService.postMessage(msgData, (data: any) => {
                    if (typeof data === 'object' && !this.valauto) {
                        if (self.webviewSession.getItem('language') === 'zh-cn') {
                            this.vscodeService.showInfoBox(data.infochinese, 'error');
                        } else {
                            this.vscodeService.showInfoBox(data.info, 'error');
                        }
                        this.autologin = true;
                        this.valauto = true;
                    } else {
                        this.form.get('pwd').setValue(data);
                        this.autologin = false;
                    }
                });
            }
        } else { // 获取密码
            const username = this.form.get('name').value;
            const msg = {
                cmd: 'getpwd',
                data: {
                    username
                }
            };
            this.vscodeService.postMessage(msg, (data: any) => {
                this.autologin = !data ? true : false;
                this.form.get('pwd').setValue(data);
                this.autos[0].checked = data ? true : false;
                this.autos[1].checked = data ? true : false;
            });
        }
    }

    handleChange(e: any) {
        if (e === 'tunadmin') {
            this.autodis = true;
            this.form.get('pwd').setValue('');
        } else {
            this.autodis = false;
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
                this.autos.forEach((m: { checked: boolean }) => { m.checked = true; });
            }
        } else {
            const res = this.autos.some((m: { checked: boolean }) => {
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
            if (this.config.autoLoginConfig.length > 0) {
                this.autoLoginUser = this.config.autoLoginConfig[0].user;
                this.rememberConfig = this.config.autoLoginConfig[0].remember;
                this.autoConfig = this.config.autoLoginConfig[0].auto;
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
            this.config.autoLoginConfig = [];
            this.config.autoLoginConfig.push({ user: userName, remember: this.rememberPwd, auto: this.autoLogin });
            this.vscodeService.postMessage({
                cmd: 'saveConfig',
                data: {
                    data: JSON.stringify(this.config),
                    type: 'auto',
                    pwd: password
                },
            }, null);
            this.configFlag = true;
        } else if (this.configFlag) {
            this.config.autoLoginConfig = [];
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

    /**
     * 点击登录按钮，触发登录或者切换用户
     */
    public async preLogin() {
        if (this.btnDisable) {
            return false;
        }
        if (!this.checkGroup()) {
            return false;
        }
        await this.login();

        return true;
    }

    /**
     * 用户登录
     */
    public async login() {
        this.showLoading = true;
        this.btnDisable = true;
        this.currLoginId = new Date().getTime() + Math.round(Math.random() * 1000);
        const option = {
            url: '/users/session/',
            noToken: true,
            params: {
                username: this.form.get('name').value,
                password: this.form.get('pwd').value
            },
            timeout: 10000,
            cancelId: this.currLoginId,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };

        this.isShow = false;
        this.vscodeService.post(option, (data: any) => {
            if (data.cancel) {
                this.showLoading = false;
                this.btnDisable = false;
                this.vscodeService.showInfoBox(this.i18n.tip_msg.common_term_timeout, 'error');
                return;
            }
            if (data) {
                if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS || data.code === LOGIN_STATUS.FIRST_LOGIN ||
                    data.code === LOGIN_STATUS.WILLEXIPIRED || data.code === LOGIN_STATUS.PWD_EXIPIRED) {
                    if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                        // 管理员用户 并且 选择了自动登录或保存密码
                        if ((this.autos[0].checked || this.autos[1].checked) && data.data.role === 'Admin') {
                            const message = {
                                cmd: 'showInfoBox',
                                data: {
                                    info: this.i18n.plugins_porting_label_adminAutoLoginTip,
                                    type: 'info'
                                }
                            };
                            this.vscodeService.postMessage(message, null);
                        } else { // 普通用户
                            this.saveConfig(data.data.username, this.form.get('pwd').value);
                        }
                        this.changeFirstpwd = true;
                    }
                    self.webviewSession.setItem('role', data.data.role);
                    self.webviewSession.setItem('username', data.data.username);
                    self.webviewSession.setItem('loginId', data.data.id);
                    self.webviewSession.setItem('isFirst', '0');
                    this.form.get('pwd').setValue('0000000000');
                    this.form.get('pwd').setValue('0000000000');
                    this.form.get('pwd').setValue('0000000000');
                    if (data.data && data.data.id) {
                        this.msgService.sendMessage({ type: 'getLoginId' });  // 登录成功之后发送事件
                    }
                    // 标识用户初次登录
                    if (data.code === LOGIN_STATUS.FIRST_LOGIN) {
                        this.showLoading = false;
                        self.webviewSession.setItem('isFirst', '1');
                        this.changeFirstpwd = true;
                        this.isPwdShow = false;
                        this.firstLogin.Open();
                        return;
                    }
                    // 标识用户密码已过期
                    if (data.code === LOGIN_STATUS.PWD_EXIPIRED) {
                        this.showLoading = false;
                        self.webviewSession.setItem('isExpired', '1');
                        this.changeFirstpwd = false;
                        this.firstLogin.Open();
                        return;
                    }
                    // 标识用户密码快过期
                    if (data.code === LOGIN_STATUS.WILLEXIPIRED) {
                        this.vscodeService.showInfoBox(data.message, 'info');
                        this.changeFirstpwd = true;
                    }
                    // 登录成功，发送消息给vscode,刷新左侧树
                    this.vscodeService.postMessage({ cmd: 'loginSuccess' }, () => {
                        const param = {
                            queryParams: {
                                isLoginRouter: true,
                                panelId: this.panelId
                            }
                        };
                        this.router.navigate(['mainHome'], param);
                        this.showLoading = false;
                    });
                } else {
                    this.showLoading = false;
                    this.btnDisable = false;
                }
                if (!this.changeFirstpwd) {
                    this.showErrMsg(data);
                    this.btnDisable = false;
                }
                this.changeFirstpwd = false;
            }
        });
    }

    /**
     * 用户登出
     */
    public async logOut(loginId: any) {
        const option = {
            url: '/users/session/'.concat(loginId).concat('/'),
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.delete(option, async (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                self.webviewSession.setItem('role', '');
                self.webviewSession.setItem('token', '');
                self.webviewSession.setItem('username', '');
                self.webviewSession.setItem('loginId', '');
                self.webviewSession.setItem('keepGoing', '1');
            }
        });
    }

    /**
     * 管理员首次登录设置密码
     */
    public setPwd() {
        if (this.btnDisable) {
            return false;
        }
        this.showLoading = true;
        this.btnDisable = true;
        this.isShow = false;
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
            return false;
        }
        const option = {
            url: '/users/admin-password/',
            params: {
                username: this.adminUserName,
                password: this.firstform.get('npwd').value,
                confirm_password: this.firstform.get('Cpwd').value
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.post(option, (data: any) => {
            this.btnDisable = false;
            this.showLoading = false;
            if (data.data.status === 0) {
                this.isFirstLogin = false;

            } else {
                if (self.webviewSession.getItem('language') === 'zh-cn') {
                    this.vscodeService.showInfoBox(data.message, 'warn');
                } else {
                    this.vscodeService.showInfoBox(data.code, 'warn');
                }
            }
            this.firstform.reset();
        });
        return true;
    }

    /**
     *  修改用户首次登陆密码
     */
    public setUserPwd() {
        this.showLoading = true;
        const errorsPwd: ValidationErrors | null = TiValidators.check(this.userPwd);
        if (errorsPwd) {
            const firstError: any = Object.keys(errorsPwd)[0];
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).focus();
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).blur();
            this.btnDisable = false;
            this.showLoading = false;
            return false;
        }
        const loginId = self.webviewSession.getItem('loginId');
        const option = {
            url: '/users/'.concat(loginId).concat('/password/'),
            params: {
                old_password: this.userPwd.get('oldPwd').value,
                new_password: this.userPwd.get('pwd').value,
                confirm_password: this.userPwd.get('cpwd').value
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.put(option, (data: any) => {
            this.btnDisable = false;
            this.showLoading = false;
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.userPwd.reset();

                this.firstLogin.Close();
                this.form.get('pwd').setValue(null);
                document.getElementById('userloginpwd').focus();
                this.isPwdShow = false;
                const msg = {
                    message: this.i18n.reset_pwd_ok,
                };
                this.vscodeService.showInfoBox(msg.message, 'info');
            } else {
                this.showPwdErrMsg(data);
            }
        });
        return true;
    }

    /**
     * 重置密码校验
     */
    public resetConfirmValidator(pwd: any) {
        Promise.resolve().then(() => {
            pwd.updateValueAndValidity();
        });
    }
    /**
     * 获取输入的密码
     */
    getPwd() {
        const oldPwd = this.userPwd.get('oldPwd').value;
        this.pwdReverse = oldPwd.split('').reverse().join('');
        this.userPwd = new FormGroup({
            oldPwd: new FormControl(oldPwd, [CustomValidators.oldPwd(this.i18n)]),
            pwd: new FormControl('', [CustomValidators.passwordReverse(this.i18n, this.pwdReverse)]),
            cpwd: new FormControl('', [this.userFirstPwdConfirm])
        });
    }

    /**
     * 调用后台接口前校验
     */
    checkGroup() {
        const errors: ValidationErrors | null = TiValidators.check(this.form);

        // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
        if (errors) {
            // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
            const firstError: any = Object.keys(errors)[0];
            this.elementRef.nativeElement.querySelector(`[formControlName = ${firstError}]`)
                .focus();
            this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
                .blur();
            return false;
        }
        return true;
    }

    /**
     * 错误提示处理
     * @param data 错误信息
     */
    showErrMsg(data: any) {
        this.isShow = true;
        this.msg = data.message;
    }

    /**
     * 错误提示处理
     * @param data 错误信息
     */
    showPwdErrMsg(data: any) {
        this.isPwdShow = true;
        this.msg = data.message;
    }

    /**
     * 改变密文
     */
    changeType(type: number) {
        (this.textType as any)['type' + type] = 'password';
    }

    /**
     *  改变明文
     */
    changeType1(type: number) {
        (this.textType as any)['type' + type] = 'text';
    }
}
