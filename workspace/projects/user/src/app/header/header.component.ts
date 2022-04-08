import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
} from '@cloud/tiny3';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../service/axios.service';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { TiLocale } from '@cloud/tiny3';
import { TranslateService } from '@ngx-translate/core'; // 国际化
import { CloseMaskService } from '../service/close-mask.service';
import { LoginGuard } from '../guard/login.guard';
import { MessageService } from '../service/message.service';
const hardUrl: any = require('../../assets/hard-coding/url.json');
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  constructor(
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public router: Router,
    private msgService: MessageService,
    public mytip: MytipService,
    public translate: TranslateService,
    public i18nService: I18nService,
    private closeMaskService: CloseMaskService,
    public loginGuard: LoginGuard
  ) {
    this.i18n = this.i18nService.I18n();
    this.validation2.errorMessage.required = this.i18n.validata.req;
  }
  @ViewChild('firstLogin') firstLogin: any;
  @ViewChild('mask3') mask3: any;
  @ViewChild('about') aboutMask: any;
  @ViewChild('logOutShow') logOutShow: any;
  @ViewChild('errorAlert', { static: false }) errorAlert: any;
  public refEyes = true; // 关闭弹窗之后,恢复密码小眼睛到关闭状态
  public leftState = true;
  public ifLeftMenuShow = false;
  public leftMenuList: any = []; // 展示的左侧菜单栏选项
  public leftMenuItem = ''; // 选择的配置选项
  public validation2: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public firstLoginUserPwd: FormGroup;
  public username: string;
  public role: string;
  public loginUserId: any; // 登录用户的相关信息
  public loginPwd: any; // 确认当前用户的密码
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public displayedLog: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public userList: TiTableSrcData;
  public logList: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public enterType: string;

  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>; size: number } = {
    options: [10, 20, 30, 40, 50],
    size: 20
  };
  public label = {
    Pwd: '',
    Cpwd: '',
    Role: '',
    Name: '',
    oldPwd: '',
    newPwd: '',
    managerPwd: ''
  };
  public create = true;
  public mask2Title = 'Create User';
  public RoleOptions: Array<any> = [];
  public userNumPwd: string;
  public spinnerValue = 10;
  public finnaluserNum = 10;
  public isInputPWD = false;
  public pwdTips = '';
  public passwordForm: FormGroup;
  public userInput = false;
  public editRole: FormGroup;
  public editPwd: FormGroup;
  public userPwd: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public setpwd = false;
  public userId: any;
  langSelected: any;
  i18n: any;

  public langOptions: Array<any> = [];

  // operation log
  public currentPageLog = 1;
  public totalNumberLog = 0;
  public pageSizeLog: { options: Array<number>; size: number } = {
    options: [10, 20, 30, 40, 50],
    size: 20
  };
  public year = new Date().getFullYear();
  public version: string;
  public time: string;
  public statusFormat(status: string): string {
    let statusClass = 'success-icon';
    switch (status) {
      case 'Successful':
        statusClass = 'success-icon';
        break;
      case 'Failed':
        statusClass = 'failed-icon';
        break;
      default:
        statusClass = 'success-icon';
    }
    return statusClass;
  }
  langChange(data: any): void {
    if (data.id === 'zh-cn') {
      TiLocale.setLocale(TiLocale.ZH_CN);
      sessionStorage.setItem('language', 'zh-cn');
    } else {
      TiLocale.setLocale(TiLocale.EN_US);
      sessionStorage.setItem('language', 'en-us');
    }
    window.location.reload();
  }
  public checkFirstLogin() {
    if (sessionStorage.getItem('isFirst') === '1') {
      this.firstLogin.Open();
    }
  }
  firstPassWord = (control: FormControl) => {
    const reg = new RegExp(
      /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/
    );

    if (!control.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.req } };
    }

    if (
      !reg.test(control.value) ||
      /[\u4E00-\u9FA5]/i.test(control.value) ||
      /[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i.test(
        control.value
      )
    ) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule } };
    }
    if (
      control.value === sessionStorage.getItem('username') ||
      control.value ===
      sessionStorage
        .getItem('username')
        .split('')
        .reverse()
        .join('')
    ) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule2 } };
    }
    if (
      control.value ===
      this.firstLoginUserPwd.controls.oldPwd.value
        .split('')
        .reverse()
        .join('')
    ) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule3 } };
    }
    if (control.value === this.firstLoginUserPwd.controls.oldPwd.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule4 } };
    }
    else {
      return null;
    }
  }

  firstLoginUserPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.firstLoginUserPwd.controls.pwd.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf
        }
      };
    }
    return {};
  }
  public setFirstLoginUserPwd(): any {
    const errors: ValidationErrors | null = TiValidators.check(
      this.firstLoginUserPwd
    );
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
    const params = {
      old_password: this.firstLoginUserPwd.get('oldPwd').value,
      new_password: this.firstLoginUserPwd.get('pwd').value,
      confirm_password: this.firstLoginUserPwd.get('cpwd').value
    };
    this.Axios.axios
      .put('/users/' + sessionStorage.getItem('loginId') + '/password/', params)
      .then((data: any) => {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.reset_pwd_ok,
          time: 3500
        });
        setTimeout(() => {
          this.firstLoginUserPwd.reset();
          sessionStorage.removeItem('isFirst');
          this.logOut('first');
          this.firstLogin.Close();
        }, 1000);
      })
      .catch((error: any) => {
      });
  }
  public closeSetFirstLogin() {
    this.firstLoginUserPwd.reset();
    sessionStorage.setItem('role', '');
    sessionStorage.setItem('token', '');
    sessionStorage.setItem('username', '');
    sessionStorage.setItem('loginId', '');
    sessionStorage.setItem('topState', '');
    window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
  }
  public closeSetUserPwd() {
    this.firstLogin.Close();
  }
  public updatefirstLoginConfirmValidator() {
    Promise.resolve().then(() => {
      this.firstLoginUserPwd.controls.cpwd.updateValueAndValidity();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkFirstLogin();
      this.version = sessionStorage.getItem('version');
      this.time = sessionStorage.getItem('time');
      this.enterType = sessionStorage.getItem('enterType');
    }, 100);
  }


  ngOnInit() {
    this.role = sessionStorage.getItem('role');
    this.closeMaskService.sub.subscribe(res => {
      if (res) {
        this.editPwd.reset();
        this.userPwd.reset();
      }
    });
    this.leftMenuList = [
      {
        title: this.i18n.common_term_admin_user,
        params: 'userManage',
        status: true,
        admin: true,
      },
      {
        title: this.i18n.passwordDic,
        params: 'weakPwd',
        status: false,
        admin: false
      },
      {
        title: this.i18n.sysSetting,
        params: 'sysSetting',
        status: false,
        admin: false
      },
      {
        title: this.role === 'Admin' ? this.i18n.commonLog : this.i18n.commonOperateLog,
        params: 'logManage',
        status: false,
        admin: false
      },
      {
        title: this.i18n.certificate.title,
        params: 'webServer',
        status: false,
        admin: false
      },
    ];
    // 输入密码校验
    this.passwordForm = new FormGroup({
      inputPassword: new FormControl('', [
        CustomValidators.cinputPassword(this.i18n)
      ]),
      userNum: new FormControl('', [TiValidators.required])
    });
    this.firstLoginUserPwd = new FormGroup({
      oldPwd: new FormControl('', [
        FirstLoginCustomValidators.oldPwd(this.i18n.validata.req)
      ]),
      pwd: new FormControl('', [this.firstPassWord]),
      cpwd: new FormControl('', [this.firstLoginUserPwdConfirm])
    });
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
      }
    ];


    this.RoleOptions = [
      {
        englishname: this.i18n.common_term_admin_user_normal,
        label: 'User'
      }
    ];

    this.label = {
      Name: this.i18n.common_term_user_label.name,
      Role: this.i18n.common_term_user_label.role,
      Pwd: this.i18n.common_term_user_label.password,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd,
      newPwd: this.i18n.common_term_user_label.newPwd,
      managerPwd: this.i18n.common_term_user_label.managerPwd
    };
    this.validation.errorMessage.required = this.i18n.validata.req;

    this.langOptions = [
      {
        id: 'zh-cn',
        label: this.i18n.common_term_lang_info[0]
      },
      {
        id: 'en-us',
        label: this.i18n.common_term_lang_info[1]
      }
    ];
    if (sessionStorage.getItem('language') === 'zh-cn') {
      this.langSelected = this.langOptions[0];
    } else {
      this.langSelected = this.langOptions[1];
    }
    this.username = sessionStorage.getItem('username');
    this.loginUserId = sessionStorage.getItem('loginId');
    this.editRole = new FormGroup({
      role: new FormControl('', [TiValidators.required]),
      name: new FormControl('', [
        CustomValidators.username(this.i18n.validata.name_rule)
      ])
    });
    this.editPwd = new FormGroup({
      managerPwd: new FormControl('', {
        validators: [TiValidators.required],
        updateOn: 'change'
      }),
      pwd: new FormControl('', [
        CustomValidators.password(this.i18n, this.editRole)
      ]),
      cpwd: new FormControl('', [this.confirmationValidator])
    });

    this.userPwd = new FormGroup({
      oldPwd: new FormControl('', [this.oldPassword]),
      pwd: new FormControl('', [this.resetPassword]),
      cpwd: new FormControl('', [this.userPwdConfirm])
    });
    this.userPwd.get('oldPwd').valueChanges.subscribe(() => {
      this.userPwd.get('pwd').updateValueAndValidity();
    });
  }
  public logOut(str = '') {
    const msg = this.i18n.logout_ok;
    const roleId = sessionStorage.getItem('loginId');
    const that = this;
    if (str === 'first') {
      that.Axios.axios.delete('/users/session/' + roleId + '/').then((data: any) => {
        that.mytip.alertInfo({ type: 'success', content: msg, time: 3500 });
        setTimeout(() => {
          sessionStorage.setItem('role', '');
          sessionStorage.setItem('token', '');
          sessionStorage.setItem('username', '');
          sessionStorage.setItem('loginId', '');
          this.msgService.sendMessage({ type: 'loginOut' });
          sessionStorage.setItem('topState', '');
          if (sessionStorage.getItem('statementStatus')) { sessionStorage.removeItem('statementStatus'); }
          that.router.navigate(['/login']);
        }, 1000);
      });
    } else {
      this.logOutShow.open();
    }

  }
  public feedback() {
    this.Axios.axios.get('/users/version/',
      { baseURL: '../user-management/api/v2.2', timeout: 3000 })
      .then((resp: any) => {
        window.open(hardUrl.hikunpengUrl, '_blank');
      }).catch((error: any) => {
        this.errorAlert.openWindow();
      });
  }
  public initData() { }
  public createRandomItem(id: number): TiTableRowData {
    const nameList: Array<string> = [
      'Pierre',
      'Pol',
      'Jacques',
      'Robert',
      'Elisa'
    ];
    const familyName: Array<string> = [
      'Dupont',
      'Germain',
      'Delcourt',
      'bjip',
      'Menez'
    ];
    const Name: string = nameList[Math.floor(Math.random() * 4)];
    const Role: string = familyName[Math.floor(Math.random() * 4)];

    return {
      Name,
      Role
    };
  }

  public changepwdbtn() {
    if (!this.create && !this.setpwd) {
      this.editPwd.controls.pwd.setValue('');
      this.editPwd.controls.cpwd.setValue('');
    }
  }
  public updateConfirmValidator() {
    Promise.resolve().then(() => {
      this.editPwd.controls.cpwd.updateValueAndValidity();
    });
  }
  public updateConfirmValidator2() {
    Promise.resolve().then(() => {
      this.userPwd.controls.cpwd.updateValueAndValidity();
    });
  }
  public setUserPwd(): any {
    const errors: ValidationErrors | null = TiValidators.check(this.userPwd);
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
    const params = {
      old_password: this.userPwd.get('oldPwd').value,
      new_password: this.userPwd.get('pwd').value,
      confirm_password: this.userPwd.get('cpwd').value
    };
    this.Axios.axios
      .put('/users/' + this.loginUserId + '/password/', params)
      .then((data: any) => {
        this.userPwd.reset();
        this.logOut();
        this.mask3.Close();
      })
      .catch((error: any) => {
      });
  }
  // 打开修改密码弹窗
  public updatePassward() {
    this.refEyes = true;
    this.userPwd.reset();
    this.mask3.Open();
  }
  public closeUserPwd() {
    this.userPwd.reset();
    this.mask3.Close();
    this.refEyes = false;
  }
  checkGroup(): any {
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

  confirmationValidator = (control: FormControl) => {
    if (!control.value) {
      return { required: true };
    } else if (
      this.editPwd.controls.cpwd.value !== this.editPwd.controls.pwd.value
    ) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf
        }
      };
    }
    return {};
  }
  resetPassword = (control: FormControl) => {
    const reg = new RegExp(
      /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/
    );
    if (!control.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.req } };
    }
    if (
      reg.test(control.value) === false ||
      /[\u4E00-\u9FA5]/i.test(control.value) ||
      /[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i.test(
        control.value
      )
    ) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule } };
    }
    if (this.userPwd.controls.oldPwd.value &&
      control.value ===
      this.userPwd.controls.oldPwd.value
        .split('')
        .reverse()
        .join('')
    ) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule3 } };
    }
    if (control.value === this.userPwd.controls.oldPwd.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule4 } };
    }
    if (
      control.value === sessionStorage.getItem('username') ||
      control.value ===
      sessionStorage
        .getItem('username')
        .split('')
        .reverse()
        .join('')
    ) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule2 } };
    }
    else {
      return null;
    }
  }
  oldPassword = (control: FormControl) => {
    if (!control.value) {
      return { oldPwd: { tiErrorMessage: this.i18n.validata.req } };
    }
    if (control.value === this.userPwd.controls.pwd.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule4 } };
    } else {
      return null;
    }
  }
  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.req
        }
      };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf
        }
      };
    }
    return {};
  }
  public test() {
    this.translate.setDefaultLang('zh');
  }

  public jumpLogin() {
    this.router.navigate(['login']);
  }

  // 用户配置页面
  public open() {
    this.ifLeftMenuShow = true;
  }
  public close() {
    this.ifLeftMenuShow = false;
  }

  public showAboutMask() {
    // user list
    this.aboutMask.Open();
  }
  public closeAbout() {
    this.aboutMask.Close();
  }
}

export class CustomValidators {
  // 自定义校验规则

  public static password(i18n: any, editRole: any): ValidatorFn {
    const reg = new RegExp(
      /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/
    );
    return (control: AbstractControl): ValidationErrors | null => {
      if (
        reg.test(control.value) === false ||
        /[\u4E00-\u9FA5]/i.test(control.value) ||
        /[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i.test(
          control.value
        )
      ) {
        return { pwd: { tiErrorMessage: i18n.validata.pwd_rule } };
      }

      if (
        control.value === editRole.get('name').value ||
        control.value ===
        editRole
          .get('name')
          .value.split('')
          .reverse()
          .join('')
      ) {
        return { pwd: { tiErrorMessage: i18n.validata.pwd_rule2 } };
      } else {
        return null;
      }
    };
  }
  public static cinputPassword(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value !== '') === false
        ? { pwd: { tiErrorMessage: i18n.common_term_password_check } }
        : null;
    };
  }
  public static oldPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !control.value ? { oldPwd: { tiErrorMessage: i18n } } : null;
    };
  }
  public static username(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { oldPwd: { tiErrorMessage: i18n } }
        : null;
    };
  }
}

export class FirstLoginCustomValidators {
  public static oldPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !control.value ? { oldPwd: { tiErrorMessage: i18n } } : null;
    };
  }
}
