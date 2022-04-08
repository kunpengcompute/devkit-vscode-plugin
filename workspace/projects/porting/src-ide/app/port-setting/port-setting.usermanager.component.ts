import { ValidationErrors, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TiMessageService, TiValidators, TiTableSrcData } from '@cloud/tiny3';
import { MytipService, I18nService, VscodeService, CustomValidators } from '../service';
import { PortsetComponent } from './port-setting.component';
import { SystemSettingComponent } from './system-setting/system-setting.component';

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

/**
 * 用户管理
 */
export class UserManager {

    public static instance: UserManager;

    // 静态实例常量
    constructor(
        public timessage: TiMessageService,
        public fb: FormBuilder,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        UserManager.instance = this;
    }

    public userList: TiTableSrcData;

    // 定义修改同时在线最大用户数变量
    public userInput = false;
    public userNumsFlag = false;
    public ispwdFlag = false;
    public finnaluserNum = 10;
    public pwdControl: FormControl;
    spinnerValue = 10;

    // 定义创建用户变量
    public isCreateRole = false;

    // 定义重置密码变量
    public isResetPwd = false;
    public userId: string;

    // 定义修改密码变量
    public ischangePwd = false;
    public pwdReverse: string;

    // 定义删除用户变量
    public isdelRole = false;
    public currLang: any;
    public currMessage: string;
    public currMessageRes: string;
    public currMessageDel: string;
    public currMessageUser: string;
    public currMessageEdt: string;



    /**
     * 查询用户列表
     */
    public getUserList() {
        const option = {
            url: '/users/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === 0) {
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
     * 修改最大用户数------获取当前最大用户数
     */
    public getUserNum() {
        const option = {
            url: `/users/loginlimit/`,
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === 0) {
                this.finnaluserNum = data.data.max_online_users;
            }
        });
    }

    /**
     * 创建用户------打开创建用户页面
     * @param portSet port-setting实例
     */
    public openUserCreate(portSet: PortsetComponent) {

        // 在编辑或创建框打开时无法再点击这个按钮
        if (portSet.CreateUserPage.myMask === true) {
            return false;
        }
        portSet.CreateUserPage.Open();
        portSet.createRoleForm.reset();
        portSet.createRoleForm.controls.name.enable();
        portSet.workspace = portSet.workspaceOnlyRead;
        portSet.createRoleForm.controls.workspace.setValue(portSet.workspace);
        return true;
    }

    /**
     * 创建用户------确认提交后台创建用户
     * @param portSet port-setting实例
     */
    public createUser(portSet: PortsetComponent) {
        this.isCreateRole = true;
        if (!this.checkGroup(portSet)) {
            return false;
        }
        const param = {
            username: portSet.createRoleForm.get('name').value || '',
            workspace: `${portSet.workspaceOnlyRead}${portSet.createRoleForm.get('name').value}/` || '',
            admin_password: portSet.createRoleForm.get('cadminPwd').value || '',
            password: portSet.createRoleForm.get('pwd').value || '',
            confirm_password: portSet.createRoleForm.get('cpwd').value || '',
            role: 'User'
        };
        const option = {
            url: '/users/',
            params: param
        };
        this.vscodeService.post(option, (data: any) => {
            this.currLang = I18nService.getLang();
            if (data && data.status === 0) {
                portSet.isDangerous = false;
                portSet.showCreateModal = false;
                portSet.CreateUserPage.Close();
                portSet.createRoleForm.reset();
                this.getUserList();
                const tips = this.i18nService.I18nReplace(portSet.createUserTips, {
                    0: param.username,
                });
                portSet.showInfoBox(tips, 'info');
            }
            if (this.currLang === LANGUAGE_TYPE.ZH) {
                this.currMessage = data.infochinese;
            } else {
                this.currMessage = data.info;
            }
            if (data.status === 1) {
                portSet.isDangerous = true;
                portSet.errorMessage = this.currMessage;
            }
            this.isCreateRole = false;
        });
        return true;
    }

    /**
     * 创建用户------取消创建用户
     * @param portSet port-setting实例
     */
    public closeUserCreate(portSet: PortsetComponent) {
        portSet.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        portSet.createRoleForm.reset();
        portSet.CreateUserPage.Close();
        this.isCreateRole = false;
    }

    /**
     * 根据输入的用户名获取workspace信息
     * @param portSet port-setting实例
     */
    public getWorkSpace(portSet: PortsetComponent) {
        if (portSet.createRoleForm.get('name').value) {
            portSet.workspace = `${portSet.workspaceOnlyRead}${portSet.createRoleForm.get('name').value}/`;
        }
    }

    /**
     * 修改密码------打开修改密码页面
     * @param portSet port-setting实例
     */
    public openPwdChange(portSet: PortsetComponent) {
        portSet.changePwdForm.reset({oldPwd: '', pwd: '', cpwd: ''});
        portSet.modifyPwdModal = portSet.tiModal.open(portSet.ModifyPwdPage, {
            id: 'modify-pwd-modal',
            modalClass: 'ucd-tiny3-modal-style',
            closeIcon: false,
            draggable: false
        });
    }

    /**
     * 修改密码------确认提交后修改密码
     * @param portSet port-setting实例
     */
    public changePwd(portSet: PortsetComponent) {
        this.ischangePwd = true;
        if (!this.checkGroup(portSet)) {
            return false;
        }
        const param = {
            old_password: portSet.changePwdForm.get('oldPwd').value,
            new_password: portSet.changePwdForm.get('pwd').value,
            confirm_password: portSet.changePwdForm.get('cpwd').value
        };
        const option = {
            url: `/users/${encodeURIComponent(portSet.loginUserId)}/resetpassword/`,
            params: param
        };
        portSet.vscodeService.post(option, (data: any) => {
            this.currLang = I18nService.getLang();
            if (data && data.status === 0) {
                if (
                    portSet.changePwdForm.get('name').value !== 'Portadmin'
                    && portSet.rememberPwdSelect.selected.value !== 0
                ) {
                    const msg = {
                        cmd: 'setPwd',
                        data: {
                            username: portSet.changePwdForm.get('name').value,
                            pwd: param.new_password
                        }
                    };
                    this.vscodeService.postMessage(msg, () => {});
                }
                portSet.changePwdForm.reset();
                portSet.modifyPwdModal.dismiss();
                portSet.logOut();
                portSet.showInfoBox(portSet.resetPwdTips, 'info');
            }
            if (this.currLang === LANGUAGE_TYPE.ZH) {
                this.currMessageEdt = data.infochinese;
            } else {
                this.currMessageEdt = data.info;
            }
            if (data.status === 1) {
                portSet.isDangerousEdt = true;
                portSet.errorMessageEdt = this.currMessageEdt;
            }
            this.ischangePwd = false;
        });
        return true;
    }

    /**
     * 修改密码------取消修改密码
     * @param portSet port-setting实例
     */
    public closePwdChange(portSet: PortsetComponent) {
        portSet.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        portSet.changePwdForm.reset();
        portSet.modifyPwdModal.dismiss();
        this.ischangePwd = false;
    }

    /**
     * 修改密码------获取输入的密码
     * @param portSet port-setting实例
     */
    getPwd(portSet: PortsetComponent) {
        const oldPwd = portSet.changePwdForm.get('oldPwd').value;
        this.pwdReverse = oldPwd
            .split('')
            .reverse()
            .join('');
        portSet.changePwdForm = new FormGroup({
            oldPwd: new FormControl(oldPwd, [CustomValidators.checkPwd(portSet.i18n)]),
            pwd: new FormControl('', [CustomValidators.checkPwdReverse(portSet.i18n, this.pwdReverse)]),
            cpwd: new FormControl('', [portSet.userPwdConfirm])
        });
    }

    /**
     * 修改最大用户数------打开修改页面
     */
    public openNumChange() {
        this.userInput = true;
        this.spinnerValue = this.finnaluserNum;
    }

    /**
     * 修改最大用户数------提交确认修改最大用户数
     * @param portSet port-setting实例
     */
    public changeNum(portSet: SystemSettingComponent) {
        if (this.finnaluserNum === this.spinnerValue){
            portSet.showInfoBox(portSet.i18n.system_setting.info, 'warn');
            this.closeNumChange();
            return false;
        }
        if (this.userNumsFlag) {
            return false;
        }
        const param = {
            max_online_users: Number(this.spinnerValue),
        };
        const option = {
            url: `/users/loginlimit/`,
            params: param
        };
        portSet.vscodeService.post(option, (data: any) => {
            this.currLang = I18nService.getLang();
            if (data.status === 0) {
                this.finnaluserNum = this.spinnerValue;
                portSet.showInfoBox(portSet.changeNumsTips, 'info');
            }
            if (this.currLang === LANGUAGE_TYPE.ZH) {
                this.currMessageUser = data.infochinese;
            } else {
                this.currMessageUser = data.info;
            }
            if (data.status === 1) {
                portSet.isDangerousUser = true;
                portSet.errorMessageUser = this.currMessageUser;
            }
        });
        this.userInput = false;
        this.ispwdFlag = false;
        return true;
    }

    /**
     * 修改最大用户数------取消修改最大用户数
     */
    public closeNumChange() {
        this.userInput = false;
        this.userNumsFlag = false;
        this.ispwdFlag = false;
    }

    /**
     * 修改最大用户数------校验最大用户数是否输入正确
     */
    checkNums() {
        const spinnerValueTemp: any = this.spinnerValue;
        const reg = new RegExp(/^([1][0-9]|20|[1-9])$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }

    /**
     * 重置密码------打开重置密码页面
     * @param row 定位重置密码的用户
     * @param portSet port-setting实例
     */
    public openPwdReset(row: any, portSet: PortsetComponent) {
        portSet.ResetPwdPage.Open();
        portSet.CreateUserPage.Close();
        this.userId = row.id;
        setTimeout(() => {
            portSet.resetPwdForm.controls.workspace.setValue(row.workspace);
        }, 0);
    }

    /**
     * 重置密码------确认提交后重置用户密码
     * @param portSet port-setting实例
     */
    public resetPwd(portSet: PortsetComponent) {
        this.isResetPwd = true;
        if (!this.checkGroup(portSet)) {
            return false;
        }
        const param = {
            admin_password: portSet.resetPwdForm.get('radminPwd').value || '',
            password: portSet.resetPwdForm.get('pwd').value || '',
            confirm_password: portSet.resetPwdForm.get('cpwd').value || ''
        };
        const option = {
            url: `/users/${encodeURIComponent(this.userId)}/`,
            params: param
        };
        this.vscodeService.post(option, (data: any) => {
            this.currLang = I18nService.getLang();
            if (data && data.status === 0) {
                portSet.isDangerousRes = false;
                portSet.showResetModal = false;
                portSet.ResetPwdPage.Close();
                portSet.createRoleForm.reset();
                portSet.resetPwdForm.reset();
                this.getUserList();
                portSet.showInfoBox(portSet.changePwdTips, 'info');
            }
            if (this.currLang === LANGUAGE_TYPE.ZH) {
                this.currMessageRes = data.infochinese;
            } else {
                this.currMessageRes = data.info;
            }
            if (data.status === 1) {
                portSet.isDangerousRes = true;
                portSet.errorMessageRes = this.currMessageRes;
            }

            this.isResetPwd = false;
            portSet.username = ((self as any).webviewSession || {}).getItem('username');
        });
        return true;
    }

    /**
     * 重置密码------取消重置用户密码
     * @param portSet port-setting实例
     */
    public closePwdReset(portSet: PortsetComponent) {
        portSet.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        portSet.createRoleForm.reset();
        portSet.resetPwdForm.reset();
        portSet.ResetPwdPage.Close();
        this.isResetPwd = false;
    }

    /**
     * 打开删除用户页面
     * @param row 删除的用户
     * @param portSet port-setting实例
     */
    public openUserDelete(row: any, portSet: PortsetComponent) {
        portSet.DelUserPage.Open();
        portSet.CreateUserPage.Close();
        this.userId = row.id;
    }

    /**
     * 确认删除用户
     * @param portSet port-setting实例
     */
    public deleteUser(portSet: PortsetComponent) {
        this.isdelRole = true;
        if (!this.checkGroup(portSet)) {
            return false;
        }
        const param = {
            admin_password: portSet.delRoleForm.controls.dadminPwd.value
        };
        const option = {
            url: `/users/${encodeURIComponent(this.userId)}/`,
            params: param
        };
        portSet.vscodeService.delete(option, (data: any) => {
            this.currLang = I18nService.getLang();
            if (data && data.status === 0) {
                portSet.DelUserPage.Close();
                this.isdelRole = false;
                this.getUserList();
                portSet.delRoleForm.reset();
                portSet.showDeleteModal = false;
            }
            if (this.currLang === LANGUAGE_TYPE.ZH) {
                this.currMessageDel = data.infochinese;
            } else {
                this.currMessageDel = data.info;
            }
            if (data.status === 1) {
                portSet.isDangerousDel = true;
                portSet.errorMessageDel = this.currMessageDel;
            } else {
                portSet.modifyDepParaSuc(data);
            }
        });
        this.isdelRole = false;
        return true;
    }

    /**
     * 取消删除用户
     * @param portSet port-setting实例
     */
    public closeUserDelete(portSet: PortsetComponent) {
        portSet.elementRef.nativeElement.querySelectorAll(`input`).forEach((element: any) => {
            element.focus();
            element.blur();
        });
        this.isdelRole = false;
        portSet.delRoleForm.reset();
        portSet.DelUserPage.Close();
    }

    /**
     * 确认提交用户管理后的参数校验
     * @param portSet port-setting实例
     */
    checkGroup(portSet: PortsetComponent) {
        if (this.isCreateRole) {
            const errors: ValidationErrors | null = TiValidators.check(portSet.createRoleForm);
            // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
            if (errors) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const firstError: any = Object.keys(errors)[0];
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).focus();
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).blur();
                return false;
            }
        }

        if (this.isResetPwd) {
            const errorRstPwd: ValidationErrors | null = TiValidators.check(portSet.resetPwdForm);
            if (errorRstPwd) {
                const pwdError: any = Object.keys(errorRstPwd)[0];
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${pwdError}]`).focus();
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${pwdError}]`).blur();
                return false;
            }
        }

        if (this.isdelRole) {
            const errorDelRole: ValidationErrors | null = TiValidators.check(portSet.delRoleForm);
            if (errorDelRole) {
                const adminPwdError: any = Object.keys(errorDelRole)[0];
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
                return false;
            }
        }

        if (this.ischangePwd) {
            const errorchgPwd1: ValidationErrors | null = TiValidators.check(portSet.changePwdForm);
            if (errorchgPwd1) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const adminPwdError: any = Object.keys(errorchgPwd1)[0];
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
                return false;
            }
        }

        if (this.isResetPwd) {
            const errorchgPwd2: ValidationErrors | null = TiValidators.check(portSet.resetPwdForm);
            if (errorchgPwd2) {
                // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
                const adminPwdError: any = Object.keys(errorchgPwd2)[0];
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
                portSet.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
                return false;
            }
        }
        return true;
    }
}
