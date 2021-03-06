import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../service/axios.service';
import { TiMessageService } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { TiLocale } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('changePassword') changePassword: any;
  constructor(
    fb: FormBuilder,
    ff: FormBuilder,
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public timessage: TiMessageService,
    public router: Router,
    private msgService: MessageService,
    public i18nService: I18nService,
    public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
    this.form = fb.group({
      name: new FormControl('', [TiValidators.required]),
      pwd: new FormControl('', CustomValidators.isEqualTo(this.i18n.common_term_login_error_info[1]))
    });
    this.firstform = ff.group({
      npwd: new FormControl('', [CustomValidators.password(this.i18n)]),
      Cpwd: new FormControl('', [this.userPwdConfirm])
    });
    this.firstform.get('npwd').valueChanges.subscribe(val => {
      this.firstform.get('Cpwd').updateValueAndValidity();
    });
  }
  form: FormGroup;
  firstform: FormGroup;
  public remember = false;
  public firstLogin = false;
  public confirmPwd: any;
  langSelected: any;
  i18n: any;
  public version: string;
  public year = new Date().getFullYear();
  public nameValidation: TiValidationConfig = {};
  public pwdValidation: TiValidationConfig = {};
  public CpwdValidation: TiValidationConfig = {};
  public enterType: '' | 'both' | 'java' | 'sys' = '';
  langOptions: Array<any> = [];
  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { cpwd: { tiErrorMessage: this.i18n.common_term_login_error_info[1] } };
    } else if (control.value !== this.firstform.controls.npwd.value) {
      return { cpwd: { tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
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
  public setPwd(): any {
    const errors: ValidationErrors | null = TiValidators.check(this.firstform);
    // ??????????????????????????????????????????????????????????????????????????????????????????
    if (errors) {
      // ??????????????????fb.group?????????FormControl??????????????????????????????dom??????????????????
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .blur();
      return false;
    }
    const param = {
      username: 'tunadmin',
      password: this.firstform.get('npwd').value,
      confirm_password: this.firstform.get('Cpwd').value,
    };
    this.Axios.axios.post('/users/admin-password/', param)
      .then((data: any) => {
        this.firstLogin = false;
        this.mytip.alertInfo({ type: 'success', content: data.message, time: 10000 });
      });
  }

  ngOnInit() {
    document.getElementById('advice-tip').style.display = 'none';
    setTimeout(() => {
      this.version = sessionStorage.getItem('version');
    }, 200);
    // ????????????????????????????????????,????????????????????????
    this.Axios.axios.get('/users/admin-status/')
      .then((data: any) => {
        if (data.data.is_firstlogin === true) {
          this.firstLogin = true;
        }
      });
    this.confirmPwd = this.i18n.common_term_user_label.confirmPwd;
    const interval = parseInt(sessionStorage.getItem('queryAnalysisListInterval'), 10);
    clearInterval(interval);
    $('.login-form-item').off('keydown').on('keydown', (e): any => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        // ??????false, ??????????????????copy??????
        return false;
      }
    });
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
    this.nameValidation = {
      type: 'blur',
      errorMessage: {
        required: this.i18n.common_term_login_error_info[0]
      }
    };
    this.pwdValidation = {
      type: 'blur',
      errorMessage: {
        required: this.i18n.common_term_login_error_info[1]
      }
    };
    this.CpwdValidation = {
      type: 'blur',
    };
    if (sessionStorage.getItem('language') === 'zh-cn') {
      this.langSelected = this.langOptions[0];
    } else {
      this.langSelected = this.langOptions[1];
    }

    window.onload = () => {
      // IE????????????????????????????????????????????????????????????
      (document.querySelector('.login-box .login-form input[name="loginname"]') as any).value = '';
    };

    this.getList();
  }
  ngOnDestroy() {
    const show = sessionStorage.getItem('language') === 'zh-cn' ? 'block' : 'none';
    document.getElementById('advice-tip').style.display = show;
  }

  checkGroup() {
    const errors: ValidationErrors | null = TiValidators.check(this.form);
    // ??????????????????????????????????????????????????????????????????????????????????????????
    if (errors) {
      // ??????????????????fb.group?????????FormControl??????????????????????????????dom??????????????????
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .blur();
    }
    if (errors) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * ????????????????????????
   */
  public getList() {
    this.Axios.axios.get('/users/install-info/')
      .then((res: any) => {
        const listType = res.data.data;
        let type: '' | 'both' | 'java' | 'sys' = '';
        switch (true) {
          case listType === 'all':
            type = 'both';
            break;
          case listType.indexOf('sys') > -1 && listType.indexOf('java') === -1:
            type = 'sys';
            break;
          case listType.indexOf('java') > -1 && listType.indexOf('sys') === -1:
            type = 'java';
            break;
          case listType.indexOf('sys') > -1 && listType.indexOf('java') > -1:
            type = 'both';
            break;
          default:
            type = 'both';
        }
        this.enterType = type;
        sessionStorage.setItem('enterType', this.enterType);
      });
  }

  public login(): any {
    if (!this.checkGroup()) { return false; }
    const params = {
      username: this.form.get('name').value,
      password: this.form.get('pwd').value
    };
    this.Axios.axios.post('/users/session/', params, { timeout: 10000 })
      .then((data: any) => {
        if (data.data.is_weak_password === 0) {
          this.mytip.alertInfo({ type: 'warn', content: this.i18n.common_weakPwd_tip, time: 5000 });
        }
        // Admin ???????????????catch
        // User ?????????????????????????????????????????????
        sessionStorage.setItem('role', data.data.role);
        sessionStorage.setItem('username', data.data.username);
        sessionStorage.setItem('loginId', data.data.id);
        if (data.data && data.data.id) {
          this.msgService.sendMessage({ type: 'getLoginId' });  // ??????????????????????????????
        }
        sessionStorage.setItem('isFirst', '0');
        if (sessionStorage.getItem('statementStatus')) { sessionStorage.removeItem('statementStatus'); }
        // user-guide todo
        if (data.data.role === 'Admin') {

        }
        // ???????????????????????????????????????????????????
        if (data.data.role === 'User') {

        }
        const loginFromStatus = sessionStorage.getItem('fromHomeLogin');
        this.Axios.axios.get('/users/user-extend/') // ????????????????????????;
          .then((res: any) => {
            sessionStorage.setItem('SYS_DISCLAIMER', res.data.SYS_DISCLAIMER);   // ????????????????????????????????????, '0'?????????, '1'?????????

            if (loginFromStatus) { // ???home?????????????????????????????????,????????????,????????????home???

              let userGuidStatus = '1';
              if (loginFromStatus === 'sys-perf') {
                userGuidStatus = res.data.SYS_GUIDE_FLAG;
              } else {
                userGuidStatus = res.data.JAVA_GUIDE_FLAG;
              }
              sessionStorage.setItem('userGuidStatus-' + loginFromStatus, userGuidStatus);

              window.location.href = window.location.origin + '/' + loginFromStatus + '/';
              sessionStorage.removeItem('fromHomeLogin');
            } else {
              this.router.navigate(['/home']);
            }
          });
      })
      .catch((error: any) => {
        // User ???????????????????????????????????????
        // ????????????
        if (Object.prototype.hasOwnProperty.call(error, 'config') && error.config) {
          this.mytip.alertInfo({ type: 'warn', content: this.i18n.common_term_login_timeout, time: 3500 });
          return;
        }
        if (Object.keys(error.data).length > 0) {
          sessionStorage.setItem('role', error.data.role);
          sessionStorage.setItem('username', error.data.username);
          sessionStorage.setItem('loginId', error.data.id);
          sessionStorage.setItem('isFirst', '0');
          if (error.code.indexOf('PwdExpired') === -1) {
            // ????????????????????????
            this.updatePassward();
          }
        }
        if (error.code.indexOf('FirstLogin') > -1) {
          sessionStorage.setItem('isFirst', '1'); // ????????????????????????
        } else if (error.code.indexOf('PwdExpired') > -1) {
          this.updatePassward(); // ???????????????, ????????????????????????

        } else if (error.code.indexOf('LoginInfoErr') > -1) {

        } else if (error.code.indexOf('Locked') > -1) {
        }
      });
  }
  // ????????????????????????
  public updatePassward() {
    this.changePassword.updatePassward();
  }

  /**
   * ????????????????????????????????????
   */
  public resetForm(str: string) {
    this.form.reset();

  }

}

export class CustomValidators {
  // ?????????????????????
  public static isEqualTo(msg: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === '' ? { isEqualTo: { tiErrorMessage: msg } } : null;
    };
  }
  public static password(i18n: any): ValidatorFn {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { pwd: { tiErrorMessage: i18n.common_term_login_error_info[1] } };
      } else if (!reg.test(control.value)) {
        return { pwd: { tiErrorMessage: i18n.common_term_valition_rule2 } };
      }
      return {};
    };
  }
}
