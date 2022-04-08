import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormGroup, ValidationErrors, FormControl, ValidatorFn,
  AbstractControl
} from '@angular/forms';
import {
  TiTableRowData, TiTableSrcData, TiTableColumns, TiValidators,
  TiValidationConfig
} from '@cloud/tiny3';
import {
  I18nService, CommonService, MytipService, LoginService
} from '../../../service';
import { UserApi } from '../../../api';
import { VerifierUtil } from '../../../../../../hyper';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @ViewChild('mask2', { static: false }) mask2: any;
  @ViewChild('updatePwdModal', { static: false }) updatePwdModal: any;
  @ViewChild('mask5', { static: false }) mask5: any;
  @ViewChild('delUserMask', { static: false }) delUserMask: any;

  constructor(
    private elementRef: ElementRef,
    public i18nService: I18nService,
    private commonService: CommonService,
    public mytip: MytipService,
    private loginService: LoginService,
    private userApi: UserApi
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any; // 国际化
  public currLang: string; // 当前语言

  public username: string;
  public pwdShow = true;

  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public columns: Array<TiTableColumns>;
  public userList: TiTableSrcData;

  public createRoleForm: FormGroup;
  public editPwd: FormGroup;
  public delRoleForm: FormGroup;
  public resetPwdForm: FormGroup;
  public changePwdForm: FormGroup;
  public isResetPwd = false;
  public isdelRole = false;
  public ischangePwd = false;

  public workspace = '';
  public workspaceOnlyRead = '';
  public isCreateRole = false;

  public userId: any;
  public loginUserId: any; // 登录用户的相关信息

  public label: any;
  public validation: TiValidationConfig = {
    // 失焦验证
    type: 'blur',
    errorMessage: {
      regExp: '',
      required: ''
    }
  };

  // 用户列表翻页
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 30, 40, 50],
    size: 10
  };

  public showGotoLink: boolean;

  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
    this.loginUserId = sessionStorage.getItem('loginId');

    this.userList = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.columns = [
      {
        title: this.i18n.common_term_user_label.name,
        width: '20%'
      },
      {
        title: this.i18n.common_term_user_label.role,
        width: '20%'
      },
      {
        title: this.i18n.common_term_user_label.workspace,
        width: '30%'
      },
      {
        title: this.i18n.common_term_operate,
        width: '30%'
      }
    ];
    this.showGotoLink = true;
    // 创建用户校验
    this.createRoleForm = new FormGroup({
      name: new FormControl('', [CustomValidators.newuser(this.i18n)]),
      workspace: new FormControl('', []),
      cadminPwd: new FormControl('', [CustomValidators.adminPwd(this.i18n)])
    });
    this.resetPwdForm = new FormGroup({
      radminPwd: new FormControl('', [CustomValidators.adminPwd(this.i18n)])
    });
    this.delRoleForm = new FormGroup({
      dadminPwd: new FormControl('', [CustomValidators.cinputPassword(this.i18n)])
    });
    // 修改密码校验
    this.changePwdForm = new FormGroup({
      userName: new FormControl('', []),
      oldPwd: new FormControl('', [this.regOldPwd]),
      pwd: new FormControl('', [this.updatePwdConfirm]),
      cpwd: new FormControl('', [this.userPwdConfirm])
    });
    // 创建 | 重置密码 校验
    this.editPwd = new FormGroup({
      pwd: new FormControl('', [this.editPwdConfirm]),
      cpwd: new FormControl('', [this.confirmationValidator])
    });

    this.label = {
      Name: this.i18n.common_term_user_label.name,
      Role: this.i18n.common_term_user_label.role,
      Setpwd: this.i18n.common_term_soinfo_reset,
      Pwd: this.i18n.common_term_user_label.password,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd,
      Workspace: this.i18n.common_term_user_label.workspace,
      AdminPwd: this.i18n.common_term_user_label.adminPwd,
      newPwd: this.i18n.common_term_user_label.newPwd,
      userPwd: this.i18n.common_term_userPwd_label
    };

    this.getUserList();
    this.requestCustomize();
  }

  public closeResetPwdOpt(e: any) {
    // reset pwd cancel button
    // 如果按下的不是鼠标左键 直接返回
    if (e.button !== 0) { return; }
    this.editPwd.reset();
    this.createRoleForm.reset();
    this.resetPwdForm.reset();
    this.mask5.Close();
    this.isResetPwd = false;
    this.pwdShow = false;
  }

  public setUserPwd(): boolean | void {
    // change pwd ok button
    this.ischangePwd = true;
    if (this.checkGroup() === false) {
      return false;
    }
    const params = {
      old_password: this.changePwdForm.get('oldPwd').value,
      new_password: this.changePwdForm.get('pwd').value,
      confirm_password: this.changePwdForm.get('cpwd').value
    };
    this.userApi.updatePwd(this.loginUserId, params).then((data: any) => {
      if (data && this.commonService.handleStatus(data) === 0) {
        this.changePwdForm.reset();
        this.updatePwdModal.Close();
        this.pwdShow = false;
        this.loginService.logout();
      }
      this.chooseLangType(data);
      this.ischangePwd = false;
    });
  }

  // 关闭修改密码弹框
  public closeUserPwd(e: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (e.button !== 0) { return; }
    this.changePwdForm.reset({oldPwd: '', pwd: '', cpwd: ''});
    $(`.change-password-modal`).find('ti-error-msg').remove();
    this.updatePwdModal.Close();
    this.pwdShow = false;
    this.ischangePwd = false;
  }

  public getUsrName() {
    if (this.createRoleForm.get('name').value) {
      this.workspace = `${this.workspaceOnlyRead}${this.createRoleForm.get('name').value}/`;
    }
  }

  public createUser(): boolean | void {
    // create button
    if (this.mask2.myMask === true) {
      return false;
    } // 在编辑或创建框打开时无法再点击这个按钮
    this.mask2.Open();
    this.mask5.Close();
    this.delUserMask.Close();
    this.createRoleForm.reset();
    this.editPwd.reset();
    this.createRoleForm.controls.name.enable();
    this.workspace = this.workspaceOnlyRead;
    this.createRoleForm.controls.workspace.setValue(this.workspace);
    this.pwdShow = true;
  }

  public userOpt(): boolean | void {
    // create ok button
    this.isCreateRole = true;
    if (this.checkGroup() === false) {
      return false;
    }
    const params = {
      username: this.createRoleForm.get('name').value || '',
      workspace: `${this.workspaceOnlyRead}${this.createRoleForm.get('name').value}/` || '',
      admin_password: this.createRoleForm.get('cadminPwd').value || '',
      password: this.editPwd.get('pwd').value || '',
      confirm_password: this.editPwd.get('cpwd').value || '',
      role: 'User'
    };
    this.userApi.createUser(params).then((data: any) => {
      if (data && this.commonService.handleStatus(data) === 0) {
        this.getUserList(params.username);
        this.mask2.Close();
        this.editPwd.reset();
        this.createRoleForm.reset();
        this.chooseLangType(data);
        this.pwdShow = false;
        this.isCreateRole = false;
      } else {
        this.chooseLangType(data);
      }
    });
  }

  // 关闭 创建用户 弹框
  public closeUserOpt(e: any) {
    // 如果按下的不是鼠标左键 直接返回
    if (e.button !== 0) { return; }
    this.editPwd.reset();
    this.createRoleForm.reset();
    this.mask2.Close();
    this.pwdShow = false;
    this.isCreateRole = false;
  }

  // 打开 update-pwd modal
  public updatePassword(row: any) {
    this.updatePwdModal.Open();
    this.pwdShow = true;
    this.changePwdForm.controls.userName.setValue(row.username);
  }

  /**
   * 打开 reset-pwd modal
   * @param row 点击行数据
   */
  public resetPwd(row: any) {
    this.mask5.Open();
    this.mask2.Close();
    this.delUserMask.Close();
    this.resetPwdForm.reset();
    this.editPwd.reset();
    this.userId = row.id;
    this.createRoleForm.controls.name.disable();
    this.createRoleForm.controls.name.setValue(row.username);
    setTimeout(() => {
        this.createRoleForm.controls.workspace.setValue(row.workspace);
    }, 0);
    this.pwdShow = true;
  }

  public resetPwdOpt(): boolean | void {
    // reset pwd ok button
    this.isResetPwd = true;
    if (this.checkGroup() === false) {
      return false;
    }
    const params = {
      admin_password: this.resetPwdForm.get('radminPwd').value || '',
      password: this.editPwd.get('pwd').value || '',
      confirm_password: this.editPwd.get('cpwd').value || ''
    };
    this.userApi.resetPwd(this.userId, params).then((data: any) => {
      if (data && this.commonService.handleStatus(data) === 0) {
        this.mask5.Close();
        this.editPwd.reset();
        this.createRoleForm.reset();
        this.resetPwdForm.reset();
        this.getUserList();
        this.pwdShow = false;
        this.chooseLangType(data);
        this.isResetPwd = false;
        this.username = sessionStorage.getItem('username');
      } else {
        this.chooseLangType(data);
      }
    });
  }

  // 获取用户自定义路径
  requestCustomize() {
    this.userApi.searchCustomize().then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        this.workspace = `${res.data.customize_path}/portadv/`;
        this.workspaceOnlyRead = `${res.data.customize_path}/portadv/`;
      }
    });
  }

  // 查询用户列表
  public getUserList(userName?: any) {
    this.userApi.seacrhUserList().then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (data.data.users.length) {
          data.data.users.map((user: any) => {
            user.role1 = user.role === 'Admin'
              ? this.i18n.common_term_user_manager
              : this.i18n.common_term_user_common_user;
          });
          this.userList.data = this.sortedUserList(data.data.users, userName);
          this.totalNumber = data.data.totalcounts;
        }
      }
    });
  }

  /**
   * 对用户列表进行排序
   * @param users 用户列表
   * @param addUser 新增用户
   */
  private sortedUserList(users: any, addUser?: string): Array<object> {
    let list = [];
    const adminUser = users.find((user: any) => user.role === 'Admin' );
    list.push(adminUser);
    if (addUser) {
      const adduserInfo = users.find((user: any) => user.username === addUser );
      if (adduserInfo && adduserInfo.username) { list.push(adduserInfo); }
    }
    let userList = users.filter((user: any) => user.role !== 'Admin' && user.username !== addUser);
    if (userList.length) {
      userList = userList.sort((a: any, b: any) => (a.username < b.username ? -1 : 1));
      list = list.concat(userList);
    }
    return list;
  }

  chooseLangType(data: any) {
    const type = this.commonService.handleStatus(data) === 0 ? 'success' : 'error';
    const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
    this.mytip.alertInfo({ type, content, time: 10000 });
  }

  checkGroup(): boolean | void {
    if (this.isCreateRole) {
      const errors: ValidationErrors | null = TiValidators.check(this.createRoleForm);
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
      const errorRstPwd: ValidationErrors | null = TiValidators.check(this.resetPwdForm);
      if (errorRstPwd) {
        const pwdError: any = Object.keys(errorRstPwd)[0];
        this.elementRef.nativeElement.querySelector(`[formControlName=${pwdError}]`).focus();
        this.elementRef.nativeElement.querySelector(`[formControlName=${pwdError}]`).blur();
        return false;
      }
    }

    if (this.isdelRole) {
      const errorDelRole: ValidationErrors | null = TiValidators.check(this.delRoleForm);
      if (errorDelRole) {
        const adminPwdError: any = Object.keys(errorDelRole)[0];
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
        return false;
      }
    }

    if (this.ischangePwd) {
      const errorchgPwd1: ValidationErrors | null = TiValidators.check(this.changePwdForm);
      if (errorchgPwd1) {
        // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
        const adminPwdError: any = Object.keys(errorchgPwd1)[0];
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
        return false;
      }
    }

    if (this.isCreateRole || this.isResetPwd) {
      const errorchgPwd2: ValidationErrors | null = TiValidators.check(this.editPwd);
      if (errorchgPwd2) {
        // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
        const adminPwdError: any = Object.keys(errorchgPwd2)[0];
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).focus();
        this.elementRef.nativeElement.querySelector(`[formControlName=${adminPwdError}]`).blur();
        return false;
      }
    }
  }

  /**
   * 打开 | 关闭 删除用户模态框
   * @param e  event参数
   * @param bool  是否为打开模态框
   * @param data 删除的具体用户数据
   */
  showDelUser(e: any, bool: boolean, data?: any): void {
    if (!bool) {
      // 如果按下的不是鼠标左键 直接返回
      if (e.button !== 0) { return; }
      this.pwdShow = false;
      this.isdelRole = false;
      this.delRoleForm.reset();
      this.delUserMask.Close();
      return;
    }
    this.pwdShow = true;
    this.userId = data.id;
    this.delRoleForm.reset({ dadminPwd: '' });
    this.delUserMask.Open();
    this.mask2.Close();
    this.mask5.Close();
  }

  // 请求删除用户
  public deleteUser(): boolean | void {
    this.isdelRole = true;
    if (this.checkGroup() === false) {
      return false;
    }
    const params = {
      admin_password: this.delRoleForm.controls.dadminPwd.value
    };
    this.userApi.delUser(this.userId, params).then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        this.isdelRole = false;
        this.getUserList();
        this.delUserMask.Close();
        this.pwdShow = false;
        this.delRoleForm.reset();
      }
      this.chooseLangType(res);
    });
    this.isdelRole = false;
  }

  public stopBack(e: any) {
    return this.commonService.stopBack(e);
  }

  confirmationValidator = (control: FormControl) => {
    if (!control.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (control.value !== this.editPwd.controls.pwd.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
  }

  // 重置 | 创建用户密码校验
  editPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (!VerifierUtil.passwordVerification(control.value)) {
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_valition_adminRule } };
    } else if (this.editPwd.controls.cpwd.value) {  // 如果旧密码存在 则每次输入旧密码都去校验旧密码规则
      this.editPwd.get('cpwd').updateValueAndValidity();
      return {};
    }
    return {};
  }

  // 旧密码校验
  regOldPwd = (control: FormControl) => {
    let newPwd = '';
    if (this.changePwdForm?.controls) {
      newPwd = this.changePwdForm.controls.pwd.value;
    }
    if (!control.value) {
      return { oldPwd: {tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (newPwd) { // 如果新密码存在 则每次输入旧密码都去校验新密码规则
      this.changePwdForm.get('pwd').updateValueAndValidity();
      return null;
    }
    return null;
  }
  // 修改密码校验
  updatePwdConfirm = (control: FormControl) => {
    let oldPwd = '';
    if (this.changePwdForm?.controls) {
      oldPwd = this.changePwdForm.controls.oldPwd.value;
    }
    if (!control.value) {
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (control.value === oldPwd) { // 相同
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.different } };
    } else if (control.value === oldPwd.split('').reverse().join('')) { // 逆序
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.reverse } };
    } else if (!VerifierUtil.passwordVerification(control.value)) { // 复杂度
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.complex } };
    } else if (this.changePwdForm.controls.cpwd.value) {
      this.changePwdForm.get('cpwd').updateValueAndValidity();
      return {};
    }
    return {};
  }
  // 确认密码校验
  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (control.value !== this.changePwdForm.controls.pwd.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
  }
}

// 自定义校验规则
export class CustomValidators {
  // 创建用户名校验
  public static newuser(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { name: { tiErrorMessage: i18n.common_term_valition_rule1 } };
      }
      return reg.test(control.value) === false ? { name: { tiErrorMessage: i18n.common_term_valition_rule3 } } : null;
    };
  }

  // 管理员密码校验
  public static adminPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Boolean(control.value) === false ? { oldPwd: { tiErrorMessage: i18n.common_term_password_check } } : null;
    };
  }

  public static cinputPassword(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value !== '') === false ? { pwd: { tiErrorMessage: i18n.common_term_password_check } } : null;
    };
  }
}
