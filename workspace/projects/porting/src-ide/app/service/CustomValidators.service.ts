import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { VerifierUtil } from 'hyper';

export class CustomValidators {
  // 自定义校验规则

  public static pathStrLimit = 1024; // 仅软件迁移评估的已安装软件包用
  public static commandStrLimit = 1024; // 仅内存一致性的命令长度限制用
  public static MAXFILENAMELENGTH = 255; // 文件名最长为255

  /**
   * 必填项校验规则，为空校验控制器
   * @param i18n 国际化资源
   */
  public static isRequired(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value !== '') === false
        ? { iptTxt: { tiErrorMessage: i18n.common_term_required_tip } }
        : null;
    };
  }

  /**
   * 上传文件名校验控制器，
   * @param i18n 国际化
   */
  public static confirmNewName(i18n: any): ValidatorFn {
    const reg = /^[\w-+()][\w-\.+()]{0,63}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { confirmNewName: { tiErrorMessage: i18n.common_term_required_tip } };
      }
      return reg.test(control.value) === false
        ? { confirmNewName: { tiErrorMessage: i18n.plugins_common_message_fileName } }
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
   * 多文件输入框限制校验控制器，是否超长，
   * @param i18n 国际化
   */
  public static multifilenameLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filenames = control.value.trim();
      if (!filenames.includes(',')) {
        return filenames.length > CustomValidators.MAXFILENAMELENGTH
          ? { multifilenameLength: { tiErrorMessage: i18n.plugins_common_message_fileName_length } }
          : null;
      } else {
        const arr = filenames.split(',');
        for (const item of arr) {
          if (item.length > CustomValidators.MAXFILENAMELENGTH) {
            return {multifilenameLength: { tiErrorMessage: i18n.plugins_common_message_fileName_length } };
          }
        }
        return null;
      }
    };
  }

  /**
   * 单文件输入框限制校验控制器，限长255，
   * @param i18n 国际化资源
   */
  public static filenameLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filenames = control.value.trim();
      return filenames.length > CustomValidators.MAXFILENAMELENGTH
        ? { filenameLength: { tiErrorMessage: i18n.plugins_common_message_fileName_length } }
        : null;
    };
  }

  /**
   * 内存一致性命令输入框限制校验控制器，限长1024，
   * @param i18n 国际化资源
   */
  public static commandLength(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const filenames = control.value.trim();
      return filenames.length > CustomValidators.commandStrLimit
        ? { commandLength: { tiErrorMessage: i18n.plugins_common_message_command_length } }
        : null;
    };
  }

  /**
   * 输入框路径校验器接口，多路径分开走multiPathLength
   * @param i18n 国际化资源
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

  /**
   * 输入框路径校验控制器
   * @param i18n 国际化资源
   */
  public static pathLength(i18n: any, pathName: any){
    if (!pathName.includes('/')) {
      return { multipathLength: { tiErrorMessage: i18n.common_term_valition_realpath } };
    }
    if (pathName.length > this.pathStrLimit) {
      return { multipathLength: { tiErrorMessage: i18n.common_term_valition_path_length } };
    }
    const arr = pathName.split('/');
    for (const item of arr) {
      if (item.length > CustomValidators.MAXFILENAMELENGTH) {
        return {multipathLength: { tiErrorMessage: i18n.plugins_common_message_fileName_length } };
      }
    }
    return null;
  }

  /**
   * 源码迁移 编译命令控制器
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
        return { commandControlForByte: { tiErrorMessage: i18n.common_term_filename_tip } };
      } else if (that.regService.commonReg(control.value, pattern)) {
        const reg = new RegExp(/^\s*\bc?make\b\s*/);
        return !that.regService.commonReg(control.value, reg)
          ? { commandControlForByte: { tiErrorMessage: i18n.common_term_valition_rule6 } }
          : null;
      } else {
        return { commandControl: { tiErrorMessage: i18n.common_term_valition_rule5 } };
      }
    };
  }

  /**
   * 校验创建用户用户名输入正确
   * @param i18n 国际化引入
   */
  public static checkUserName(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { name: { tiErrorMessage: i18n.common_term_valition_rule1 } };
      }
      return reg.test(control.value) === false
        ? { name: { tiErrorMessage: i18n.common_term_valition_rule3 } }
        : undefined;
    };
  }
  /**
   * 输入扫描设置参数校验
   * @param i18n 国际化引入
   */
  public static configVal(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[1-9]\d{0,4}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { configVal: { tiErrorMessage: i18n.common_term_config_valid } }
        : undefined;
    };
  }

  /**
   * 校验最大同时在线用户数输入正确
   * @param i18n 国际化引入
   */
  public static checkUserNum(i18n: any): ValidatorFn {
    const reg = new RegExp(/^([1][0-9]|20|[1-9])$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_userNum } }
        : undefined;
    };
  }

  /**
   * 密码校验
   * @param i18n 国际化资源
   */
  public static password(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return VerifierUtil.passwordVerification(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_rule2 } }
        : null;
    };
  }

  /**
   * 校验管理员密码是否输入
   * @param i18n 国际化引入
   */
  public static checkAdminPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Boolean(control.value) === false
        ? { oldPwd: { tiErrorMessage: i18n.common_term_adminpwd_check } }
        : undefined;
    };
  }

  /**
   * 校验旧密码是否输入
   * @param i18n 国际化引入
   */
  public static checkOldPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Boolean(control.value) === false
        ? { oldPwd: { tiErrorMessage: i18n.common_term_oldpwd_check } }
        : undefined;
    };
  }

  /**
   * 校验密码输入正确
   * @param i18n 国际化引入
   */
  public static checkPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { pwd: { tiErrorMessage: i18n.common_term_no_password } };
      }
      return VerifierUtil.passwordVerification(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_password } }
        : undefined;
    };
  }

  /**
   * 校验密码输入正确
   * @param i18n 国际化引入
   * @param pwdReverse 旧密码逆序
   */
  public static checkPwdReverse(i18n: any, pwdReverse: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return VerifierUtil.passwordVerification(control.value) === false || control.value === pwdReverse
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_rule2 } }
        : undefined;
    };
  }

  /**
   * 校验确认密码
   * @param pwd 密码
   * @param i18n 国际化引入
   */
  public static checkConfirmPwd(pwd: string, i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return true
        ? { confirmPwd: { tiErrorMessage: i18n.common_term_no_samepwd + pwd } }
        : undefined;
    };
  }


  // 密码必填为空校验
  public static isEqualTo(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === '' ? { isEqualTo: { tiErrorMessage: i18n.common_term_no_password } } : null;
    };
  }

  // 密码校验规则
  public static passwordAdm(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return VerifierUtil.passwordVerification(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_password } }
        : null;
    };
  }

  public static passwordReverse(i18n: any, pwdReverse: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return VerifierUtil.passwordVerification(control.value) === false || control.value === pwdReverse
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_rule2 } }
        : null;
    };
  }

  public static oldPwd(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return VerifierUtil.passwordVerification(control.value) === false
        ? { pwd: { tiErrorMessage: i18n.common_term_valition_password } }
        : undefined;
    };
  }

  public static confirmPwd(pwd: any, i18n: any): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
          return true ? { confirmPwd: { tiErrorMessage: i18n.common_term_no_samepwd + pwd } } : null;
      };
  }

  public static resetPassword(i18n: any): any {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return { pwd: { tiErrorMessage: i18n.common_term_required_tip } }; }
      const reg1 = /[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018]/i;
      const reg2 = /[\u2019\uff08\uff09\u300a\u300b\u3008\u3009]/i;
      const reg3 = /[\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i;
      if (VerifierUtil.passwordVerification(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value))
        || reg1.test(control.value)
        || reg2.test(control.value)
        || reg3.test(control.value)
      ) {
          return { pwd: { tiErrorMessage: i18n.plugins_porting_weakPassword.pwd_rule } };
      } else {
          return null;
      }
    };
  }
}
