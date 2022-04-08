import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidatorUtil {

  // 自定义校验规则
  static guarNameValid(validata: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return { add_uname: { tiErrorMessage: validata.name_req } }; }
      return null;
    };
  }

  static password(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return { add_upwd: { tiErrorMessage: i18n } }; }
      return null;
    };
  }

  static oldPwd(i18n: any): ValidatorFn {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{6,32}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { oldPwd: { tiErrorMessage: i18n } }
        : null;
    };
  }

  static checkIp(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return { add_ip: { tiErrorMessage: i18n } }; }
      return null;
    };
  }

  static checkPort(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return { add_port: { tiErrorMessage: i18n } }; }
      return null;
    };
  }

  static deleteUserCheck(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return { delete_uname: { tiErrorMessage: i18n } }; }
      return null;
    };
  }
}
