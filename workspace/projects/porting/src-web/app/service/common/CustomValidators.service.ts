import { Injectable } from '@angular/core';
import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { MAXFILENAMELENGTH } from '../../global/globalData';
import { VerifierUtil } from '../../../../../hyper';

@Injectable({
  providedIn: 'root'
})

// 自定义校验规则的校验器
export class CustomValidators {
  public static pathStrLimit = 1024; // 仅软件迁移评估用
  public static commandStrLimit = 1024; // 仅内存一致性用

  public static password(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return VerifierUtil.passwordVerification(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_rule } }
        : null;
    };
  }

  /**
   *  编译命令 排除部分特殊字符，如 < , >
   * @param i18n 国际化
   * @param that this指向
   */
  public static commandControl(i18n: any, that: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^[a-zA-Z0-9-+_/\s\"\':=~!,@\^\?\.\+\*\$\{\}\[\]\(\)]+$/g;
      if (!control.value) {
        return { commandControl: { tiErrorMessage: i18n.common_term_filename_tip } };
      } else if (that.regService.commonReg(control.value, pattern)) {
        return !that.regService.commandReg(control.value)
          ? { commandControl: { tiErrorMessage: i18n.common_term_valition_rule4 } }
          : null;
      } else {
        return { commandControl: { tiErrorMessage: i18n.common_term_valition_rule5 } };
      }
    };
  }

  /**
   *  编译命令 字节对齐用
   * @param i18n 国际化
   * @param that this指向
   */
  public static commandControlForByte(i18n: any, that: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^[a-zA-Z0-9-+_/\s\"\':=~!,@\^\?\.\+\*\$\{\}\[\]\(\)]+$/g;
      if (!control.value) {
        return { commandControl: { tiErrorMessage: i18n.common_term_filename_tip } };
      } else if (that.regService.commonReg(control.value, pattern)) {
        const reg = new RegExp(/^\s*\bc?make\b\s*/);
        return !that.regService.commonReg(control.value, reg)
          ? { commandControl: { tiErrorMessage: i18n.common_term_valition_rule6 } }
          : null;
      } else {
        return { commandControl: { tiErrorMessage: i18n.common_term_valition_rule5 } };
      }
    };
  }

  public static oldPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value == null || control.value === '')
      ? { oldPwd: { tiErrorMessage: i18n.common_term_no_password } }
      : null;
    };
  }
  public static confirmPwd(pwd: any, i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return true ? { confirmPwd: { tiErrorMessage: i18n.common_term_no_samepwd + pwd } } : null;
    };
  }

  // 密码验证规则，返回一个表单控制器，对应出有调用校验结果
  public static resetPassword(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) { return { pwd: { tiErrorMessage: i18n.common_term_required_tip } }; }
    const pattern1 = /[\u4E00-\u9FA5]/i;
    const pattern2 = /[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i;
    if (
      VerifierUtil.passwordVerification(control.value) === false
      || (pattern1.test(control.value))
      || (pattern2.test(control.value))) {
      return { pwd: { tiErrorMessage: i18n.weakPassword.pwd_rule } };
    } else {
      return null;
      }
    };
  }

  /**
   * 文件名校验，上传文件名
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static confirmNewName(i18n: any): ValidatorFn {
    const reg = /^[\w-()]{1}[\w-\.+()]{0,63}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { confirmNewName: { tiErrorMessage: i18n.common_term_required_tip } };
      }
      return reg.test(control.value) === false
        ? { confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename } }
        : null;
    };
  }

  /**
   * 文件名校验，限制单文件名上传，输入框中文件名不能包含中文、空格及^`/|;&$><\!
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static filenameCheck(i18n: any): ValidatorFn {
    let filename;
    const reg = /[\u4e00-\u9fff\s^`|;&$><!?]/;
    return (control: AbstractControl): ValidationErrors | null => {
      const inputStr = control.value;
      if (inputStr.search(/\//) === -1) {
        filename = inputStr;
      } else {
        filename = inputStr.split('/').pop();
      }
      return reg.test(filename) === true
        ? { confirmNewName: { tiErrorMessage: i18n.common_term_valition_input } }
        : null;
    };
  }

  /**
   * 输入框校验，多文件名长度校验，限制255个字符/文件名，以","为分割
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static multifilenameLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filenames = control.value.trim();
      if (!filenames.includes(',')) {
        return filenames.length > MAXFILENAMELENGTH
          ? { confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename_length } }
          : null;
      } else {
        const arr = filenames.split(',');
        for (const item of arr) {
          if (item.length > MAXFILENAMELENGTH) {
            return {confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename_length } };
          }
        }
        return null;
      }
    };
  }

  /**
   * 输入框校验，单文件名长度校验，限制255个字符/文件名
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static filenameLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filenames = control.value.trim();
      return filenames.length > MAXFILENAMELENGTH
          ? { confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename_length } }
          : null;
    };
  }

  /**
   * 输入框校验，命令长度校验，限制1024个字符
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static commandLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filenames = control.value.trim();
      return filenames.length > CustomValidators.commandStrLimit
          ? { confirmNewName: { tiErrorMessage: i18n.common_term_valition_command_length } }
          : null;
    };
  }

  /**
   * 输入框校验，多路径长度校验，以","为分割
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static multipathLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pathName = control.value.trim();
      if (!pathName.includes(',')) {
        return CustomValidators.pathLength(i18n, pathName);
      } else {
        const arrPath = pathName.split(',');
        for (const arr of arrPath) {
          return CustomValidators.pathLength(i18n, arr);
        }
      }
      return null;
    };
  }

  public static pathLength(i18n: any, pathName: any){
    if (!pathName.includes('/')) {
      return { confirmNewName: { tiErrorMessage: i18n.common_term_valition_realpath } };
    }
    if (pathName.length > this.pathStrLimit) {
      return { confirmNewName: { tiErrorMessage: i18n.common_term_valition_path_length } };
    }
    const arr = pathName.split('/');
    for (const item of arr) {
      if (item.length > MAXFILENAMELENGTH) {
        return {confirmNewName: { tiErrorMessage: i18n.common_term_valition_filename_length } };
      }
    }
    return null;
  }

  /**
   * 输入框校验，后缀校验.rpm和.deb
   * @param i18n 国际化
   * @returns 一个校验器，校验器返回校验错误，或者null
   */
  public static checksuffix(i18n: any){
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value){
        const filename = control.value.trim();
        if (!filename.endsWith('.rpm') && !filename.endsWith('.deb')) {
          return { confirmNewName: { tiErrorMessage: i18n.common_term_filename_tip2 } };
        }
      }
      return null;
    };
  }
}
