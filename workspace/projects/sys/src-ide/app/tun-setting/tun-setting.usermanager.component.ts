import { ValidatorFn, AbstractControl, ValidationErrors, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TiValidators, TiTableSrcData } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { HTTP_STATUS_CODE, VscodeService } from '../service/vscode.service';
import { TunsetComponent } from './tun-setting.component';

/**
 * 自定义校验规则
 */
export class CustomValidators {

    /**
     * 校验必填输入不为空
     * @param i18n 国际化引入
     */
    public static isRequired(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return (control.value !== '') === false ? {
                iptTxt: {
                    tiErrorMessage: i18n.plugins_perf_tips_isRequired
                }
            } : undefined;
        };
    }

    /**
     * 校验旧密码是否输入
     * @param i18n 国际化引入
     */
    public static checkOldPwd(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return Boolean(control.value) === false ? {
                oldPwd: {
                    tiErrorMessage: i18n.plugins_perf_tips_oldPwdCheck
                }
            } : undefined;
        };
    }

    /**
     * 校验密码输入正确
     * @param i18n 国际化引入
     */
    public static checkPwd(i18n: any): ValidatorFn {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            return reg.test(control.value) === false ? {
                pwd: {
                    tiErrorMessage: i18n.plugins_perf_tips_passwordCheck
                }
            } : undefined;
        };
    }

    /**
     * 校验密码输入正确
     * @param i18n 国际化引入
     * @param pwdReverse 旧密码逆序
     */
    public static checkPwdReverse(i18n: any, pwdReverse: string): ValidatorFn {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            return reg.test(control.value) === false || control.value === pwdReverse ? {
                pwd: {
                    tiErrorMessage: i18n.plugins_perf_tips_reverseCheck
                }
            } : undefined;
        };
    }

    /**
     * 校验创建用户用户名输入正确
     * @param i18n 国际化引入
     */
    public static checkUserName(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            return reg.test(control.value) === false ? {
                pwd: {
                    tiErrorMessage: i18n.plugins_perf_tips_userNameCheck
                }
            } : undefined;
        };
    }

    /**
     * 校验确认密码
     * @param pwd 密码
     * @param i18n 国际化引入
     */
    public static checkConfirmPwd(pwd: string, i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return true ? {
                confirmPwd: {
                    tiErrorMessage: i18n.plugins_perf_tips_confirmPwdCheck + pwd
                }
            } : undefined;
        };
    }
}

/**
 * 用户管理
 */
export class UserManager {

    public static instance: UserManager;
    elementRef: any;

    // 静态实例常量
    constructor(
        public fb: FormBuilder,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        UserManager.instance = this;
        this.i18n = this.i18nService.I18n();
    }

    public userList: TiTableSrcData;

    // 定义创建用户变量
    public isCreateRole = false;

    // 定义重置密码变量
    public isResetPwd = false;
    public userId: string;

    i18n: any;

    // 定义修改密码变量
    public ischangePwd = false;
    public pwdReverse: string;

    // 定义删除用户变量
    public isdelRole = false;
    public userName: string;


    /**
     * 查询用户列表
     */
    public getUserList() {
        const option = {
            url: '/users/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                data.data.users.forEach(item => {
                    if (item.role === 'Admin') {
                        item.displayRole = this.i18n.plugins_perf_label_admin;
                    } else {
                        item.displayRole = this.i18n.plugins_perf_label_normal;
                    }
                });
                this.userList = {
                    data: data.data.users,
                    state: {
                        searched: false,
                        sorted: false,
                        paginated: false
                    }
                };
            } else {
                return;
            }
        });
    }

    /**
     * 创建用户------打开创建用户页面
     * @param tunSet tun-setting实例
     */
    public openUserCreate(tunSet: TunsetComponent) {

        // 在编辑或创建框打开时无法再点击这个按钮
        if (tunSet.CreateUserPage.myMask === true) {
            return false;
        }
        tunSet.isShow = false;
        tunSet.CreateUserPage.Open();
        tunSet.createRoleForm.reset();
        tunSet.editPwd.reset();
        tunSet.createRoleForm.controls.name.enable();
        tunSet.createRoleForm.controls.userRole.disable();
        tunSet.createRoleForm.controls.userRole.setValue(tunSet.createUserRole);
        return true;
    }

    /**
     * 创建用户------确认提交后台创建用户
     * @param tunSet tun-setting实例
     */
    public createUser(tunSet: TunsetComponent) {
        this.isCreateRole = true;
        if (!this.checkGroup(tunSet)) {
            return false;
        }
        const option = {
            url: '/users/',
            params: {
                username: tunSet.createRoleForm.get('name').value || '',
                admin_password: tunSet.createRoleForm.get('cadminPwd').value || '',
                password: tunSet.editPwd.get('pwd').value || '',
                confirm_password: tunSet.editPwd.get('cpwd').value || '',
                role: 'User'
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                tunSet.CreateUserPage.Close();
                tunSet.editPwd.reset();
                tunSet.createRoleForm.reset();
                this.getUserList();
                const tips = this.i18nService.I18nReplace(tunSet.createUserTips, {
                    0: data.data.username,
                });
                this.vscodeService.showInfoBox(tips, 'info');
            } else {
                tunSet.showErrMsg(data);
            }
            this.isCreateRole = false;
        });
        tunSet.isShow = false;
        return true;
    }

    /**
     * 创建用户------取消创建用户
     * @param tunSet tun-setting实例
     */
    public closeUserCreate(tunSet: TunsetComponent) {
        tunSet.editPwd.reset();
        tunSet.createRoleForm.reset();
        tunSet.CreateUserPage.Close();
        this.isCreateRole = false;
        tunSet.isShow = false;
    }

    /**
     * 修改密码------打开修改密码页面
     * @param tunSet tun-setting实例
     */
    public openPwdChange(tunSet: TunsetComponent) {
        tunSet.changePwdForm.reset();
        tunSet.isShow = false;
        tunSet.ModifyPwdPage.Open();
    }

    /**
     * 修改密码------确认提交后修改密码
     * @param tunSet tun-setting实例
     */
    public changePwd(tunSet: TunsetComponent) {
        this.ischangePwd = true;
        if (!this.checkGroup(tunSet)) {
            return false;
        }
        const option = {
            url: `/users/${encodeURIComponent(tunSet.loginUserId)}/password/`,
            params: {
                old_password: tunSet.changePwdForm.get('oldPwd').value,
                new_password: tunSet.changePwdForm.get('pwd').value,
                confirm_password: tunSet.changePwdForm.get('cpwd').value
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        tunSet.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                tunSet.changePwdForm.reset();
                tunSet.ModifyPwdPage.Close();
                tunSet.logOut();
                this.vscodeService.showInfoBox(tunSet.resetPwdTips, 'info');
            } else {
                tunSet.showErrMsg(data);
            }
            this.ischangePwd = false;
        });
        tunSet.isShow = false;
        return true;
    }

    /**
     * 修改密码------取消修改密码
     * @param tunSet tun-setting实例
     */
    public closePwdChange(tunSet: TunsetComponent) {
        tunSet.changePwdForm.reset();
        this.ischangePwd = false;
        tunSet.isShow = false;
        tunSet.ModifyPwdPage.Close();
    }

    /**
     * 修改密码------获取输入的密码
     * @param tunSet tun-setting实例
     */
    getPwd(tunSet: TunsetComponent) {
        const oldPwd = tunSet.changePwdForm.get('oldPwd').value;
        this.pwdReverse = oldPwd
            .split('')
            .reverse()
            .join('');
        tunSet.changePwdForm = new FormGroup({
            oldPwd: new FormControl(oldPwd, [CustomValidators.checkPwd(tunSet.i18n)]),
            pwd: new FormControl('', [CustomValidators.checkPwdReverse(tunSet.i18n, this.pwdReverse)]),
            cpwd: new FormControl('', [tunSet.userPwdConfirm])
        });
    }

    /**
     * 重置密码------打开重置密码页面
     * @param row 定位重置密码的用户
     * @param tunSet tun-setting实例
     */
    public openPwdReset(row: any, tunSet: TunsetComponent) {
        tunSet.isShow = false;
        tunSet.ResetPwdPage.Open();
        tunSet.CreateUserPage.Close();
        tunSet.editPwd.reset();
        this.userId = row.id;
        tunSet.createRoleForm.controls.name.disable();
        tunSet.createRoleForm.controls.name.setValue(row.username);
        tunSet.createRoleForm.controls.userRole.disable();
        tunSet.createRoleForm.controls.userRole.setValue(tunSet.createUserRole);
    }

    /**
     * 重置密码------确认提交后重置用户密码
     * @param tunSet tun-setting实例
     */
    public resetPwd(tunSet: TunsetComponent) {
        this.isResetPwd = true;
        if (!this.checkGroup(tunSet)) {
            return false;
        }
        const option = {
            url: `/users/${encodeURIComponent(this.userId)}/`,
            params: {
                username: tunSet.createRoleForm.get('name').value || '',
                admin_password: tunSet.resetPwdForm.get('radminPwd').value || '',
                password: tunSet.editPwd.get('pwd').value || '',
                confirm_password: tunSet.editPwd.get('cpwd').value || '',
                role: 'User'
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                tunSet.ResetPwdPage.Close();
                tunSet.editPwd.reset();
                tunSet.createRoleForm.reset();
                tunSet.resetPwdForm.reset();
                this.getUserList();
                this.vscodeService.showInfoBox(tunSet.changePwdTips, 'info');

            } else {
                tunSet.showErrMsg(data);
            }
            this.isResetPwd = false;
            tunSet.username = self.webviewSession.getItem('username');
        });
        tunSet.isShow = false;
        return true;
    }

    /**
     * 重置密码------取消重置用户密码
     * @param tunSet tun-setting实例
     */
    public closePwdReset(tunSet: TunsetComponent) {
        tunSet.editPwd.reset();
        tunSet.createRoleForm.reset();
        tunSet.resetPwdForm.reset();
        tunSet.ResetPwdPage.Close();
        this.isResetPwd = false;
        tunSet.isShow = false;
    }

    /**
     * 打开删除用户页面
     * @param row 删除的用户
     * @param tunSet tun-setting实例
     */
    public openUserDelete(row: any, tunSet: TunsetComponent) {
        tunSet.isShow = false;
        this.userId = row.id;
        this.userName = row.username;
        tunSet.DelUserPage.Open();
        tunSet.CreateUserPage.Close();
    }

    /**
     * 确认删除用户
     * @param tunSet tun-setting实例
     */
    public deleteUser(tunSet: TunsetComponent) {
        this.isdelRole = true;
        if (!this.checkGroup(tunSet)) {
            return false;
        }
        const option = {
            url: `/users/${encodeURIComponent(this.userId)}/`,
            params: {
                admin_password: tunSet.delRoleForm.controls.dadminPwd.value
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        tunSet.vscodeService.delete(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                tunSet.DelUserPage.Close();
                this.isdelRole = false;
                this.getUserList();
                tunSet.delRoleForm.reset();
                const tips = this.i18nService.I18nReplace(tunSet.deleteUserTips, {
                    0: this.userName,
                });
                this.vscodeService.showInfoBox(tips, 'info');
            } else {
                tunSet.showErrMsg(data);
            }
        });
        this.isdelRole = false;
        tunSet.isShow = false;
        return true;
    }

    /**
     * 取消删除用户
     * @param tunSet tun-setting实例
     */
    public closeUserDelete(tunSet: TunsetComponent) {
        this.isdelRole = false;
        tunSet.delRoleForm.reset();
        tunSet.DelUserPage.Close();
        tunSet.isShow = false;
    }

    /**
     * 确认提交用户管理后的参数校验
     * @param tunSet tun-setting实例
     */
    checkGroup(tunSet: TunsetComponent) {
        if (this.isCreateRole) {
            const errors: ValidationErrors | null = TiValidators.check(tunSet.createRoleForm);

            // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
            if (errors) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const firstError: any = Object.keys(errors)[0];
                this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).focus();
                this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).blur();
                return false;
            }
        }

        if (this.isResetPwd) {
            const errorRstPwd: ValidationErrors | null = TiValidators.check(tunSet.resetPwdForm);
            if (errorRstPwd) {
                const pwdError: any = Object.keys(errorRstPwd)[0];
                this.elementRef.nativeElement.querySelector(`[formControlName=${pwdError}]`).focus();
                this.elementRef.nativeElement.querySelector(`[formControlName=${pwdError}]`).blur();
                return false;
            }
        }

        if (this.isdelRole) {
            const errorDelRole: ValidationErrors | null = TiValidators.check(tunSet.delRoleForm);
            if (errorDelRole) {
                const adminPwdError: any = Object.keys(errorDelRole)[0];
                this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
                this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
                return false;
            }
        }

        if (this.ischangePwd) {
            const errorchgPwd1: ValidationErrors | null = TiValidators.check(tunSet.changePwdForm);
            if (errorchgPwd1) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const adminPwdError: any = Object.keys(errorchgPwd1)[0];
                this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
                this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
                return false;
            }
        }

        if (this.isCreateRole || this.isResetPwd) {
            const errorchgPwd2: ValidationErrors | null = TiValidators.check(tunSet.editPwd);
            if (errorchgPwd2) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const adminPwdError: any = Object.keys(errorchgPwd2)[0];
                this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
                this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
                return false;
            }
        }
        return true;
    }
}
