import { Component, OnInit, ElementRef, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ValidationErrors,
  ValidatorFn, AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { TiValidators, TiLocale, TiValidationConfig, TiModalService, TiModalRef } from '@cloud/tiny3';
import { AxiosService, MytipService, I18nService, CommonService, LoginService, MessageService } from '../../service';
import { LoginApi } from '../../api';
import { VerifierUtil } from '../../../../../hyper';

enum Status {
  commonUserFirstLogin = '0x040301', // 普通用户首次登陆
  passwordExpired = '0x040302', // 密码过期
  passwordAboutToExpired = '0x040312', // 密码即将过期
  loginSuccess = '0x040300', // 登录成功
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
constructor(
  fb: FormBuilder,
  ff: FormBuilder,
  private elementRef: ElementRef,
  public Axios: AxiosService,
  public router: Router,
  public mytip: MytipService,
  public i18nService: I18nService,
  private commonService: CommonService,
  private tiModal: TiModalService,
  private loginService: LoginService,
  private loginApi: LoginApi,
  public messageServe: MessageService
) {
  this.i18n = this.i18nService.I18n();
  this.form = fb.group( {
    name: new FormControl('', [TiValidators.required]),
    pwd: new FormControl('', CustomValidators.isEqualTo(this.i18n)),
  });
  this.firstform = ff.group( {
    npwd: new FormControl('', [CustomValidators.password(this.i18n)]),
    Cpwd: new FormControl('', [this.userPwdConfirm])
  });
}

@ViewChild('pwdExpired', { static: false }) pwdExpired: TemplateRef<any>;
@ViewChild('firstCommanLogin', { static: true }) firstCommanLoginRef: TemplateRef<any>;
@Output() reLoad = new EventEmitter();
@Output() showMain = new EventEmitter();
form: FormGroup;
firstform: FormGroup;
public remember = false;
public i18n: any;
public isShow = false;
public msg: string;
public nameValidation: TiValidationConfig =  {
  type: 'blur',
  errorMessage: {
    required: ''
  }
};
public pwdValidation: TiValidationConfig =  {
  type: 'blur',
  errorMessage: {
    required: ''
  }
};
public CpwdValidation: TiValidationConfig =  {
  type: 'blur'
};
public firstLogin = false;
public adminName = '';
public confirmPwd: any;
public userPwd: FormGroup;
public userName: string; // 当前用户名
public label: any;
public validation: TiValidationConfig = {
  type: 'blur',
  errorMessage: {
    regExp: '',
    required: ''
  }
};

langSelected: any;
langOptions: Array < any >  = [
  {
    id: 'zh-cn',
    label: '简体中文'
  },
  {
    id: 'en-us',
    label: 'English'
  }
];
userPwdConfirm = (control: FormControl) => {
  if (!control.value) {
    return { required: true };
  } else if (control.value !== this.firstform.controls.npwd.value) {
    return { cpwd: {tiErrorMessage: this.i18n.common_term_no_samepwd } };
  }
  return {};
}
ngOnInit() {
  this.messageServe.sendMessage({ type: 'closeAdviceIcon' });
  // 查询用户是否首次登录
  this.Axios.axios.get('/users/admin/status/').then((data: any) =>  {
    if (this.commonService.handleStatus(data) === 0) {
      if (data.data.first_login === 1) {
        this.firstLogin = true;
      }
    } else {
      if (data.infochinese) {
        if (sessionStorage.getItem('language') === 'zh-cn') {
          this.mytip.alertInfo({ type: 'warn', content: data.infochinese, time: 10000 });
        } else {
          this.mytip.alertInfo({ type: 'warn', content: data.info, time: 10000 });
        }
      }
    }
  });
  // 登录界面隐藏VOC入口
  this.messageServe.sendMessage({ type: 'closeAdviceIcon' });
  this.userPwd = new FormGroup({
    userName: new FormControl(''),
    oldPwd: new FormControl('', [this.oldPwd]),
    pwd: new FormControl('', [this.updateInitPwdConfirm]),
    cpwd: new FormControl('', [this.expriedPwdConfirm])
  });
  this.confirmPwd = this.i18n.common_term_user_label.confirmPwd;
  this.langSelected = sessionStorage.getItem('language') === 'zh-cn'
    ? this.langOptions[0]
    : this.langOptions[1];
  this.nameValidation.errorMessage.required = this.i18n.common_term_valition_rule1;
  this.pwdValidation.errorMessage.required = this.i18n.common_term_no_password;
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
  }
  if (errors) {return false; } else {return true; }
}

chooseLangType(data: any) {
  if (
    this.commonService.handleStatus(data) !== 0
    && data.status !== 2
    && data.status !== 3
    && data.status !== 4
  ) { // 0表示登陆成功，2表示第一次登陆成功
    if (data.status === '0x040312') {
      setTimeout(() => {
        this.mytip.alertInfo({ type: 'error',
        content: sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info, time: 5000 });
      }, 300);
    } else {
      this.isShow = true;
      this.msg = sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info;
    }
  }
}
public setPwd(): any {
  const errors: ValidationErrors | null = TiValidators.check(this.firstform);
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
  if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .blur();
      return false;
    }
  const param = {
      new_password: this.firstform.get('npwd').value,
      confirm_password: this.firstform.get('Cpwd').value,
    };
  this.Axios.axios.post('/users/admin/configuration/', param).then((data: any) =>  {
    if (this.commonService.handleStatus(data) === 0) {
      this.firstLogin = false;
      this.adminName = 'portadmin';
    } else {
      this.firstform.reset();
      const content = sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info;
      this.mytip.alertInfo({ type: 'warn', content, time: 10000 });
    }
  });
}

public dblClick_login() {
  return false;
}

public login(): any {
  sessionStorage.setItem('routerFile', 'false');
  if ( ! this.checkGroup()) { return false; }
  const params =  {
    username: this.form.get('name').value,
    password: this.form.get('pwd').value
  };
  this.loginApi.login(params).then((data: any) => {
    if (data) {
      if (this.commonService.handleStatus(data) === 0 || data.status === Status.commonUserFirstLogin
      || data.status === Status.passwordExpired || data.status === Status.passwordAboutToExpired) {
        sessionStorage.setItem('role', data.data.role);
        sessionStorage.setItem('username', data.data.username);
        sessionStorage.setItem('loginId', data.data.id);
        sessionStorage.setItem('workspace', data.data.workspace);
        sessionStorage.setItem('isFirst', '0');
        sessionStorage.setItem('isExpired', '0');
        sessionStorage.setItem('isWillExpired', '0');
        sessionStorage.setItem('ifLeftMenuShow', 'false');
        sessionStorage.setItem('leftMenuItem', '');
        sessionStorage.setItem('bannerShow', 'true');
        this.userName = sessionStorage.getItem('username');
        this.label = {
          userName: this.i18n.common_term_login_name,
          Pwd: this.i18n.common_term_user_label.newPwd,
          Cpwd: this.i18n.common_term_user_label.confirmPwd,
          oldPwd: this.i18n.common_term_user_label.oldPwd
        };
        if (data.status !== Status.commonUserFirstLogin && data.status !== Status.passwordExpired) {
          this.messageServe.sendMessage({ type: 'getLoginId' });
        }
        if (data.status === Status.loginSuccess && data.data.is_weak_password) {
            setTimeout(() => {
                this.mytip.alertInfo({ type: 'warn', content: this.i18n.weak_pwd_login_tip, time: 10000 });
            }, 500);
        }
        if (data.status === Status.commonUserFirstLogin) {
          sessionStorage.setItem('isFirst', '1'); // 标识用户初次登录
          sessionStorage.setItem('isExpired', '0');
          sessionStorage.setItem('isWillExpired', '0');
          sessionStorage.setItem('info', '');
        }
        if (data.status === Status.passwordExpired) {
          sessionStorage.setItem('isExpired', '1'); // 标识用户密码过期
          sessionStorage.setItem('isFirst', '0');
          sessionStorage.setItem('isWillExpired', '0');
          sessionStorage.setItem('info', '');
        }
        if (data.status === Status.commonUserFirstLogin || data.status === Status.passwordExpired) {
          this.tiModal.open(data.status === Status.commonUserFirstLogin
                            ? this.firstCommanLoginRef
                            : this.pwdExpired, {
            modalClass: 'modal560',
            context: {
              title: data.status === Status.commonUserFirstLogin
              ? this.i18n.common_term_change_initial1
              : this.i18n.common_term_change_initial
            },
            beforeClose: (modalRef: TiModalRef, reason: boolean): void => {
              if (reason) {
                this.setUserPwd(modalRef);
              } else {
                const language = sessionStorage.getItem('language');
                sessionStorage.clear();
                sessionStorage.setItem('language', language);
                modalRef.destroy(false);
                this.clearForm();
              }
            }
          });
          return;
        }
        if (data.status === '0x040312') {
          sessionStorage.setItem('isWillExpired', '1'); // 标识用户密码即将过期
          sessionStorage.setItem('expiredInfochinese', data.infochinese);
          sessionStorage.setItem('expiredInfo', data.info);
          sessionStorage.setItem('isExpired', '0');
          sessionStorage.setItem('isFirst', '0');
        }
        let chooseTab: string;
        if (sessionStorage.getItem('chooseTab')) {
          chooseTab = 'homeNew/' + sessionStorage.getItem('chooseTab');
        } else {
          chooseTab = 'homeNew/porting-workload';
        }
        this.reLoad.emit();
        this.showMain.emit();
        setTimeout(() => {
          const tabType = sessionStorage.getItem('tabType');
          if (tabType) {
            this.router.navigate(['homeNew/migrationCenter'], { queryParams: { type: tabType } });
          } else {
            this.router.navigate([chooseTab]);
          }
        }, 200);
      }
      this.chooseLangType(data);
    }
  });
}
  // 清除普通首次登录弹窗输入框的内容
  clearForm() {
    this.userPwd.get('pwd').setValue('');
    this.userPwd.get('oldPwd').setValue('');
    this.userPwd.get('cpwd').setValue('');
    this.userPwd.get('pwd').reset(undefined);
    this.userPwd.get('oldPwd').reset(undefined);
    this.userPwd.get('cpwd').reset(undefined);
  }
  // 前往联机帮助
  goHelp() {
    this.commonService.goHelp();
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

  public setUserPwd(modalRef: TiModalRef): boolean | void {
    const errors: ValidationErrors | null = TiValidators.check(this.userPwd);
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).focus();
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).blur();
      return false;
    }
    const params = {
      old_password: this.userPwd.get('oldPwd').value,
      new_password: this.userPwd.get('pwd').value,
      confirm_password: this.userPwd.get('cpwd').value
    };
    const that = this;
    this.Axios.axios.post('/users/' + encodeURIComponent(sessionStorage.getItem('loginId')) + '/resetpassword/', params)
    .then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        that.form.get('pwd').setValue('');
        that.elementRef.nativeElement.querySelector(`[formControlName='pwd']`).focus();
        modalRef.destroy(true);
        this.mytip.alertInfo({ type: 'success', content: this.i18n.reset_pwd_ok, time: 10000 });
        this.clearForm();
      } else {
        const content  = sessionStorage.getItem('language') === 'zh-cn' ? data.infochinese : data.info;
        this.mytip.alertInfo({ type: 'warn', content, time: 10000 });
      }
    });
  }

  // 旧密码校验
  oldPwd = (control: FormControl) => {
    let newPwd = '';
    if (this.userPwd?.controls) {
      newPwd = this.userPwd.controls.pwd.value;
    }
    if (!control.value) {
      return { oldPwd: {tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (newPwd) { // 如果新密码存在 则每次输入旧密码都去校验新密码规则
      this.userPwd.get('pwd').updateValueAndValidity();
      return null;
    }
    return null;
  }
  // 新密码校验
  updateInitPwdConfirm = (control: FormControl) => {
    let oldPwd = '';
    if (this.userPwd?.controls) {
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
  expriedPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_required_tip } };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
  }
}

export class CustomValidators {
// 自定义校验规则
public static isEqualTo(i18n: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>  {
    return control.value === '' ? {isEqualTo: {tiErrorMessage: i18n.common_term_no_password}} : null;
  };
}
public static password(i18n: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return VerifierUtil.passwordVerification(control.value) === false
      ? { pwd: { tiErrorMessage: i18n.common_term_valition_adminRule } } : null;
  };
}

}
