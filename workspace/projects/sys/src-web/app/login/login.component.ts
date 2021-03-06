import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../service/axios.service';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { TiLocale } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { UserGuideService } from '../service/user-guide.service';
import { MessageService } from '../service/message.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  public remember = false;
  public version = '';
  langSelected: any;
  i18n: any;
  public year = new Date().getFullYear();
  constructor(
    fb: FormBuilder,
    private elementRef: ElementRef,
    private msgService: MessageService,
    public Axios: AxiosService,
    public timessage: MessageModalService,
    public router: Router,
    public i18nService: I18nService,
    public mytip: MytipService,
    public userGuide: UserGuideService
  ) {
    this.i18n = this.i18nService.I18n();
    this.form = fb.group({
      name: new FormControl('', [TiValidators.required]),
      pwd: new FormControl('', CustomValidators.isEqualTo(this.i18n.common_term_login_error_info[1]))
    });
  }
  public nameValidation: TiValidationConfig = {};
  public pwdValidation: TiValidationConfig = {};
  langOptions: Array<any> = [];
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
  ngOnInit() {
    // user-guide ???????????????
    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
      sessionStorage.setItem('sysStep', '');
      this.userGuide.hideMask();
    }
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
    if (sessionStorage.getItem('language') === 'zh-cn') {
      this.langSelected = this.langOptions[0];
    } else {
      this.langSelected = this.langOptions[1];
    }
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
    if (errors) { return false; } else { return true; }
  }
  public login(): any {
    if (!this.checkGroup()) { return false; }
    const params = {
      username: this.form.get('name').value,
      password: this.form.get('pwd').value
    };
    this.Axios.axios.post('/users/session/', params)
      .then((data: any) => {
        sessionStorage.setItem('role', data.data.role);
        sessionStorage.setItem('username', data.data.username);
        sessionStorage.setItem('loginId', data.data.id);
        if (data.data && data.data.id) {
          this.msgService.sendMessage({ type: 'getLoginId' });  // ??????????????????????????????
        }
        sessionStorage.setItem('isFirst', '0');
        this.router.navigate(['/home']);
      }).catch((error: any) => {
        // User ???????????????????????????????????????
        if (Object.keys(error.data).length > 0) {
          sessionStorage.setItem('role', error.data.role);
          sessionStorage.setItem('username', error.data.username);
          sessionStorage.setItem('loginId', error.data.id);
          sessionStorage.setItem('isFirst', '0');
          this.router.navigate(['/home']);
        }
        if (error.code.indexOf('FirstLogin') > -1) {
          sessionStorage.setItem('isFirst', '1'); // ????????????????????????
        } else if (error.code.indexOf('PwdExpired') > -1) {
          sessionStorage.setItem('isFirst', '1'); // ????????????????????????
        }
      });
  }
}
export class CustomValidators {
  // ?????????????????????
  public static isEqualTo(msg: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === '' ? { isEqualTo: { tiErrorMessage: msg } } : null;
    };
  }
}
