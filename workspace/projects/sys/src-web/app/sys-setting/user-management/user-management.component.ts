import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableDataState } from '@cloud/tiny3';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { CustomValidatorsService } from '../../service';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  constructor(
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public mytip: MytipService,
    public i18nService: I18nService,
    public customValidatorsService: CustomValidatorsService
    ) {
    this.i18n = this.i18nService.I18n();
  }
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 50, 100],
    size: 20,
  };
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public userList: TiTableSrcData;
  public label = {
    Pwd: '',
    Role: '',
    Cpwd: '',
    Name: '',
    oldPwd: '',
    newPwd: '',
    managerPwd: '',
  };
  public columns: Array<TiTableColumns> = [];
  public loginPwd: any; // 确认当前用户的密码
  public i18n: any;
  public create = true;
  public mask2Title = 'New User';
  public RoleOptions: any = [];
  public editRole: FormGroup;
  public editPwd: FormGroup;
  public userPwd: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  public setpwd = false;
  public userId: any;
  public showPreBtn = false;
  public username: string;
  public role: string;
  public msg: any;
  public delRow: any = '';
  public managementPwd: any = '';
  public pwdTrue: any = true;
  public roleEdit = false;
  public isLoading: any = false;
  public refEyes1 = true; // 关闭弹窗之后,恢复密码小眼睛到关闭状态
  public refEyes2 = true; // 关闭弹窗之后,恢复密码小眼睛到关闭状态
  public language: 'zh-cn' | 'en-us' | string;
  @ViewChild('mask2') mask2: any;
  @ViewChild('userListTable') userListTable: any;
  @ViewChild('deleteMessageContent') deleteMessageContent: any;
  ngOnInit() {
    this.columns = [
      {
        title: this.i18n.common_term_admin_user_name,
        width: '25%',
      },
      {
        title: this.i18n.common_term_admin_user_role,
        width: '25%',
      },
      {
        title: this.i18n.common_term_operate,
        width: '25%',
      },
    ];
    this.label = {
      Name: this.i18n.common_term_user_label.name,
      Role: this.i18n.common_term_user_label.role,
      Pwd: this.i18n.common_term_user_label.password,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd,
      newPwd: this.i18n.common_term_user_label.newPwd,
      managerPwd: this.i18n.common_term_user_label.managerPwd,
    };
    this.userList = {
      data: [],
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: true // 源数据未进行分页处理
      }
    };
    this.language = sessionStorage.getItem('language');
    this.username = sessionStorage.getItem('username');
    this.role = sessionStorage.getItem('role');
    this.editRole = new FormGroup({
      role: new FormControl({
        englishname: this.i18n.common_term_admin_user_normal,
        label: 'User',
      }),
      name: new FormControl('', [
        this.customValidatorsService.checkUserName(),
      ])
    });
    this.editPwd = new FormGroup({
      managerPwd: new FormControl('', {
        validators: [this.confirmationValidatorManage],
        updateOn: 'change'
      }),
      pwd: new FormControl('', [
        this.customValidatorsService.checkPassword(this.editRole.get('name')),
      ]),
      cpwd: new FormControl('', [this.confirmationValidatorCpwd]),
    });
    this.RoleOptions = [
      {
        englishname: this.i18n.common_term_admin_user_normal,
        label: 'User',
      },
    ];
    this.getUserList(this.currentPage, this.pageSize.size, 1);
  }
  // 从user-magement组件返回事件
  public userManage(strings: any) {
    if (strings === 'create') {
      this.createUser();
    }
  }

  public createUser(e?: any): any {
    this.refEyes1 = true;
    if (e) { e.target.blur(); }
    if (this.mask2.myMask === true) {
      return false;
    } // 在编辑或创建框打开时无法再点击这个按钮
    this.mask2.Open();
    this.editPwd.reset();
    this.editRole.reset();
    this.create = true;
    this.setpwd = false;
    this.mask2Title = this.i18n.common_term_admin_user_create_title;
    this.editRole.controls.name.enable();
    this.editRole.controls.role.setValue(this.RoleOptions[0]);
  }
  public doEditUser(row: any) {
    this.refEyes1 = true;
    this.mask2.Open();
    this.create = false;
    this.mask2Title = this.i18n.common_term_admin_user_edit_user;
    this.userId = row.id;
    this.editRole.controls.name.disable();
    this.editRole.controls.name.setValue(row.username);
    this.setpwd = true;
    this.editRole.controls.role.setValue(this.RoleOptions[0]);
    if (!this.create && !this.setpwd) {
      this.editPwd.controls.pwd.setValue('');
      this.editPwd.controls.cpwd.setValue('');
    }
  }
  public deleteUser(row: any): void {
    this.refEyes2 = true;
    const self = this;
    this.delRow = row;
    this.deleteMessageContent.Open();
  }
  confirmationValidatorManage = (control: FormControl) => {
    if (!control.value) {
      return {
        managerPwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.req,
        },
      };
    } else {
      return null;
    }
  }
  confirmationValidatorCpwd = (control: FormControl) => {
    if (!control.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.req,
        },
      };
    } else if (
      this.editPwd.controls.cpwd.value !== this.editPwd.controls.pwd.value
    ) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf,
        },
      };
    }
    return {};
  }

  public getUserList(
    currentPage = this.currentPage,
    pageSize = this.pageSize.size,
    num: any
  ) {
    this.isLoading = true;
    if (
      +this.totalNumber % +pageSize === 1 &&
      currentPage === Math.ceil(this.totalNumber / pageSize) &&
      num === 0
    ) {
      currentPage = currentPage - 1;
    }
    !currentPage ? (currentPage = 1) : (currentPage = currentPage);
    this.Axios.axios
      .get(
        '/users/?page=' +
        currentPage +
        '&per-page=' +
        pageSize +
        '&include-admin=false', {
        baseURL: '../user-management/api/v2.2',
        headers: {
          showLoading: false
        }
      })
      .then((data: { data: { users: any[]; totalCounts: number; }; }) => {
        data.data.users = data.data.users.filter((item: any) => {
          return item.role !== 'Admin';
        });
        data.data.users.forEach((item: any) => {
          if (item.role === 'Guest') {
            item.displayRole = this.i18n.common_term_admin_user_guest;
          } else if (item.role === 'User') {
            item.displayRole = this.i18n.common_term_admin_user_normal;
          }
        });
        this.userList.data = data.data.users;
        this.totalNumber = data.data.totalCounts;
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      });
  }
  public closeUserOpt() {
    this.editPwd.reset();
    this.editRole.reset();
    this.mask2.Close();
    this.refEyes1 = false;
  }

  // 关闭删除model框
  public deleteClose() {
    this.managementPwd = '';
    this.deleteMessageContent.Close();
    this.refEyes2 = false;
  }

  // 删除用户操作
  public toDeleteUser(): void {
    this.Axios.axios
      .delete(`/users/${this.delRow.id}/`, {
        data: { admin_password: this.managementPwd }, baseURL: '../user-management/api/v2.2'
      })
      .then((data: any) => {
        this.managementPwd = '';
        this.userListUpdate(this.userListTable, 0);
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.delete_ok,
          time: 3500
        });
      })
      .catch((error: any) => {
        this.managementPwd = '';
      })
      .finally(() => {
        this.deleteMessageContent.Close();
        this.refEyes2 = false;
      });
  }
  public userOpt() {
    const self = this;
    this.doUserOpt();
  }
  userListUpdate(e: any, num: any) {
    const dataState: TiTableDataState = e.getDataState();
    // num:状态标志,删除为0
    this.getUserList(
      dataState.pagination.currentPage,
      dataState.pagination.itemsPerPage,
      num
    );
  }
  public doUserOpt(): any {
    let url = '';
    let method = 'post';
    let okmasg = this.i18n.tip_msg.add_ok;
    if (this.checkGroup() === false) {
      return false;
    }
    const params = {
      role: this.editRole.get('role').value.label,
      username: this.editRole.get('name').value || '',
      password: this.editPwd.get('pwd').value || '',
      confirm_password: this.editPwd.get('cpwd').value || '',
      admin_password: this.editPwd.get('managerPwd').value || ''
    };
    if (this.create) {
      url = '/users/';
      okmasg = this.i18n.tip_msg.add_ok;
      const errormsg = this.i18n.tip_msg.add_error;
      method = 'post';
    } else {
      url = '/users/' + this.userId + '/';
      okmasg = this.i18n.tip_msg.edite_ok;
      const errormsg = this.i18n.tip_msg.edite_error;
      method = 'put';
    } // 修改用户
    this.Axios.axios[method](url, params, { baseURL: '../user-management/api/v2.2' })
      .then((data: any) => {
        this.loginPwd = '';
        this.editPwd.reset();
        this.editRole.reset();
        this.mask2.Close();
        this.userListUpdate(this.userListTable, 1);
        this.mytip.alertInfo({ type: 'success', content: okmasg, time: 3500 });
        this.refEyes1 = false;
      })
      .catch((error: any) => {
        this.loginPwd = '';
      });
  }
  checkGroup(): boolean | void {
    const errors: ValidationErrors | null = TiValidators.check(this.editRole);
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement
        .querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement
        .querySelector(`[formControlName=${firstError}]`)
        .blur();
      return false;
    }
    if (this.create || this.setpwd) {
      const errorPwd: ValidationErrors | null = TiValidators.check(
        this.editPwd
      );
      if (errorPwd) {
        // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
        const pwdError: any = Object.keys(errorPwd)[0];
        this.elementRef.nativeElement
          .querySelector(`[formControlName=${pwdError}]`)
          .focus();
        this.elementRef.nativeElement
          .querySelector(`[formControlName=${pwdError}]`)
          .blur();
        return false;
      }
    }

  }
  public updateConfirmValidator() {
    Promise.resolve().then(() => {
      this.editPwd.controls.cpwd.updateValueAndValidity();
    });
  }
  public updatePwdValidator() {
    Promise.resolve().then(() => {
      this.editPwd.controls.pwd.updateValueAndValidity();
    });
  }
  public msgInputPwd() {
    if (this.managementPwd.length > 0) {
      this.pwdTrue = false;
    } else {
      this.pwdTrue = true;
    }
  }
}
export class CustomValidators {
  // 自定义校验规则

  public static password(i18n: any, editRole: any): ValidatorFn {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { pwd: { tiErrorMessage: i18n.validata.req } };
      }

      if (!reg.test(control.value) || (/[\u4E00-\u9FA5]/i.test(control.value))
        || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i)
          .test(control.value)) {
        return { pwd: { tiErrorMessage: i18n.validata.pwd_rule } };
      }

      if (editRole.get('name').value && (control.value === editRole.get('name').value
        || control.value === editRole.get('name').value.split('').reverse().join(''))) {
        return { pwd: { tiErrorMessage: i18n.validata.pwd_rule2 } };
      }
      else {
        return null;
      }
    };
  }
  public static cinputPassword(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value !== '') === false ? { pwd: { tiErrorMessage: i18n.common_term_password_check } } : null;
    };
  }
  public static oldPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !control.value ? { oldPwd: { tiErrorMessage: i18n } } : null;
    };
  }
}
