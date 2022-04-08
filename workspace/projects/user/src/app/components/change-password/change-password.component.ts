import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { TiMessageService } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { PopMaskComponent } from '../pop-mask/pop-mask.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  constructor(
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public timessage: TiMessageService,
    public router: Router,
    public i18nService: I18nService,
    public mytip: MytipService) {
    this.i18n = this.i18nService.I18n();
    this.userPwd = new FormGroup({
      oldPwd: new FormControl('', [this.oldPassword]),
      pwd: new FormControl('', [this.resetPassword]),
      cpwd: new FormControl('', [this.reUserPwdConfirm])
    });
  }
  i18n: any;
  public year = new Date().getFullYear();

  public refEyes = true; // 关闭弹窗之后,恢复密码小眼睛到关闭状态
  public userPwd: FormGroup;
  @ViewChild('mask3') mask3: PopMaskComponent;
  @Output() private closeMask = new EventEmitter<any>();
  public label = {
    Pwd: '',
    Cpwd: '',
    Role: '',
    Name: '',
    oldPwd: '',
    newPwd: '',
    managerPwd: ''
  };
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  ngOnInit(): void {
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
  }

  // 新密码校验
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
  // 旧密码校验
  oldPassword = (control: FormControl) => {
    if (!control.value) {
      return { oldPwd: { tiErrorMessage: this.i18n.validata.req } };
    }
    this.userPwd.get('pwd').updateValueAndValidity();
    return null;
  }
  // 确认密码校验
  reUserPwdConfirm = (control: FormControl) => {
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
      .put('/users/' + sessionStorage.getItem('loginId') + '/password/', params)
      .then((data: any) => {
        this.userPwd.reset();
        this.mask3.Close();
        this.router.navigate(['/login']);
        this.closeMask.emit('reset');
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.reset_pwd_ok,
          time: 3500
        });
      })
      .catch((error: any) => {
      });
  }
}
