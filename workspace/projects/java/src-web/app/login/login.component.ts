import { Component, OnInit, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../service/axios.service';
import { TiMessageService } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { MessageService } from '../service/message.service';
import { TiLocale } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { UserGuideService } from '../service/user-guide.service';
import { disableCtrlZ } from '../service/lib.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  public remember = false;
  langSelected: any;
  i18n: any;
  constructor(
    fb: FormBuilder,
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public timessage: TiMessageService,
    public router: Router,
    public i18nService: I18nService,
    public mytip: MytipService,
    public userGuide: UserGuideService,
    private msgService: MessageService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.form = fb.group({
      name: new FormControl('', [TiValidators.required]),
      pwd: new FormControl(
        '',
        CustomValidators.isEqualTo(this.i18n.common_term_login_error_info[1])
      ),
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
    // user-guide 登录页重置
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      sessionStorage.setItem('javaStep', '');
      this.userGuide.hideMask();
    }
    // $('.login-form-item')
    //   .unbind('keydown')
    //   .bind('keydown', (e) => {
    //     if (e.ctrlKey && e.keyCode === 90) {
    //       e.preventDefault();
    //       // 返回false, 防止重复触发copy事件
    //       return false;
    //     }
    //   });
    this.langOptions = [
      {
        id: 'zh-cn',
        label: this.i18n.common_term_lang_info[0],
      },
      {
        id: 'en-us',
        label: this.i18n.common_term_lang_info[1],
      },
    ];
    this.nameValidation = {
      type: 'blur',
      errorMessage: {
        required: this.i18n.common_term_login_error_info[0],
      },
    };
    this.pwdValidation = {
      type: 'blur',
      errorMessage: {
        required: this.i18n.common_term_login_error_info[1],
      },
    };
    if (sessionStorage.getItem('language') === 'zh-cn') {
      this.langSelected = this.langOptions[0];
    } else {
      this.langSelected = this.langOptions[1];
    }
  }
  checkGroup() {
    const errors: ValidationErrors | null = TiValidators.check(this.form);
    // const errors = false;
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
    }
    if (errors) {
      return false;
    } else {
      return true;
    }
  }

  public login(): any {

    if (!this.checkGroup()) {
      return false;
    }
    const params = {
      username: this.form.get('name').value,
      password: this.form.get('pwd').value,
    };
    const envUrl = window.location.host + window.location.pathname;
    const localIP = '***********';
    if (this.msgService.onlineDev) {
      // 用于后端本地联调
      this.Axios.axios.post('/users/session/', params, { baseURL: '/api/v2.2/' }).then((resp: any) => {
        sessionStorage.setItem('role', resp.data.role);
        sessionStorage.setItem('username', resp.data.username);
        sessionStorage.setItem('loginId', resp.data.id);
        sessionStorage.setItem('isFirst', '0');
        this.router.navigate(['/home']);
      });
    } else {
      if (envUrl.indexOf('localhost') >= 0 || envUrl.indexOf(localIP) >= 0) {
        this.Axios.axios.post('/login/', params, { baseURL: 'api/' }).then((resp: any) => {
          sessionStorage.setItem('token', resp.token);
          sessionStorage.setItem('isFirst', '0');
          this.getUserInfo();
        });
      } else {
        this.Axios.axios.post('/users/session/', params, { baseURL: '/api/v2.2/' }).then((resp: any) => {
          sessionStorage.setItem('role', resp.data.role);
          sessionStorage.setItem('username', resp.data.username);
          sessionStorage.setItem('loginId', resp.data.id);
          sessionStorage.setItem('isFirst', '0');
          this.router.navigate(['/home']);
        });
      }
    }


  }
  public getUserInfo() {
    this.Axios.axios.get('/session').then((res: any) => {
      sessionStorage.setItem('role', '');
      res.username === 'admin'
        ? sessionStorage.setItem('role', 'Admin')
        : sessionStorage.setItem('role', 'user');
      sessionStorage.setItem('username', res.username);
      sessionStorage.setItem('loginId', res.id);
      this.router.navigate(['/home']);
    });
  }
  public disableCtrlZ(event: any) {
    return disableCtrlZ(event);
  }
}

export class CustomValidators {
  // 自定义校验规则
  public static isEqualTo(msg: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === ''
        ? { isEqualTo: { tiErrorMessage: msg } }
        : null;
    };
  }
}
