import { Injectable } from '@angular/core';
import {
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { HttpService } from './http.service';
import { I18nService } from '../service/i18n.service';
import { Observable } from 'rxjs';
import { I18n } from 'sys/locale';
import { TiValidationType } from '@cloud/tiny3';

export interface CustomValidationErrors {
  [key: string]: {
    tiErrorMessage: string,
    type: TiValidationType
  };
}
export type CustomValidatorFn = (control: AbstractControl) => CustomValidationErrors | null;

// 自定义校验规则
class CustomValidators {
  // 使用正则校验
  public static regValidate(reg: any, tip: any): CustomValidatorFn {
    return (control: AbstractControl): CustomValidationErrors | null => {
      if (control.value && !reg.test(control.value)) {
        return {
          res: {
            tiErrorMessage: tip,
            type: 'blur'
          }
        };
      } else {
        return null;
      }
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorsService {
  public i18n: any;

  public projectNameValidator: ValidatorFn;  // 工程名称校验
  public taskNameValidator: ValidatorFn;  // 任务名称校验
  public nodeNameValidator: ValidatorFn;  // 节点名称校验
  public userNameValidator: ValidatorFn;  // 操作系统用户名校验
  public csrCountryValidator: ValidatorFn; // CSR文件国家校验
  public csrAddressValidator: ValidatorFn; // CSR文件128个字符校验：省份、城市
  public csrOtherNameValidator: ValidatorFn; // CSR文件64个字符校验：公司、部门、常用名
  public applicationPathReg: any; // 应用路径校验一：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 3、不能以 / 结尾
  public lockFunctionValidator: ValidatorFn; // 自定义锁与等待校验
  public processNameValidator: ValidatorFn; // 进程分析模块-进程名校验
  public memProcessPidValidator: ValidatorFn; // 内存诊断PID校验

  constructor(
    public http: HttpService,
    public i18nService: I18nService
  ) {

    this.i18n = this.i18nService.I18n();

    this.projectNameValidator = CustomValidators.regValidate(
      new RegExp(/^[\w\@\#\$\%\^\&\*\(\)\[\]\<\>\.\-\!\~\+\s]{1,32}$/),
      this.i18n.common_term_projiect_name_tip
    );
    this.taskNameValidator = CustomValidators.regValidate(
      new RegExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$'),
      this.i18n.validata.task_name_rule
    );
    this.nodeNameValidator = CustomValidators.regValidate(
      new RegExp(/^[\w\@\#\$\%\^\&\*\(\)\[\]\<\>\.\-\!\~\+\s]{1,32}$/),
      I18n.nodeManagement.validation.nodeName
    );
    this.userNameValidator = CustomValidators.regValidate(
      new RegExp(/^.{1,32}$/),
      this.i18n.nodeManagement.validation.username
    );
    this.csrCountryValidator = CustomValidators.regValidate(
      new RegExp(/^[a-zA-Z]{2}$/),
      this.i18n.certificate.country_Verification_Tips
    );
    this.csrAddressValidator = CustomValidators.regValidate(
      new RegExp(/^[\s.\-_a-zA-Z0-9]{0,128}$/),
      this.i18n.certificate.common_city_province_Verification_Tips
    );
    this.csrOtherNameValidator = CustomValidators.regValidate(
      new RegExp(/^[\s.\-_a-zA-Z0-9]{0,64}$/),
      this.i18n.certificate.common_Verification_Tips
    );
    this.applicationPathReg = /^\/([^`\|;&$><\\!\s]*)+[^\/^`\|;&$><\\!\s]$/;
    this.lockFunctionValidator = CustomValidators.regValidate(
      new RegExp(/^([^\|<>#!])*$/),
      this.i18n.lock.form.custom_functions_validate
    );
    this.processNameValidator = CustomValidators.regValidate(
      new RegExp(/^([^$\|;&><`! ])*$/),
      this.i18n.common_term_process_name_tip
    );
    this.memProcessPidValidator = CustomValidators.regValidate(
      new RegExp(/^[1-9][0-9]*$/),
      this.i18n.mission_create.pid_valid_tip
    );
  }

  public lang: any = sessionStorage.getItem('language');

  // 异步表单验证
  public applicationCheck(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const params = {
      application: ctrl.value
    };

    if (ctrl.value !== '') {
      return this.http.get('/res-status/?type=application&application='
        + encodeURIComponent(ctrl.value))
        .then((data: any) => {
          if (data.data.status === 1) {

            return { aaa: { tiErrorMessage: this.i18n.application_not_exist } };

          } else if (data.data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_application_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => { });
    }
  }

  public CheckCpuMask(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const params = {
      cpumask: ctrl.value
    };
    if (ctrl.value) {
      return this.http.get('/res-status/?type=cpu_mask&cpu-mask=' + encodeURIComponent(ctrl.value))
        .then((data: any): any => {
          if (data.data.status === 1) {
            if (data.data.info.indexOf('out of device cpu range') > -1) {
              const maxRange = (data.data['CPU(S)'] - 1) + (this.lang === 'zh-cn' ? '。' : '.');
              return { aaa: { tiErrorMessage: this.i18n.cpu_mask_range + maxRange } };
            } else if (data.data.info.indexOf('data format error') > -1) {
              return { aaa: { tiErrorMessage: this.i18n.cpu_mask_format } };
            }
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => { });
    }
  }

  public CheckWorkingDirectory_c(
    ctrl: AbstractControl, file: any
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let filedname = '';
    let value = '';
    if (Object.prototype.hasOwnProperty.call(arguments[0], 'filedname')) {
      filedname = arguments[0].filedname;
      value = arguments[1].value;
    }
    const params = {
      field_name: filedname,
      working_directory: value
    };
    if (value) {
      return this.http.get('/res-status/?type=working_directory&field-name='
        + encodeURIComponent(filedname)
        + '&working-directory='
        + encodeURIComponent(value))
        .then((data: any) => {
          if (data.data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory } };
          } else if (data.data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => { });
    }
  }

  public CheckWorkingDirectory_java(
    ctrl: AbstractControl, file: any
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let filedname = '';
    let value = '';
    if (Object.prototype.hasOwnProperty.call(arguments[0], 'filedname')) {
      filedname = arguments[0].filedname;
      value = arguments[1].value;
    }
    const params = {
      field_name: filedname,
      working_directory: value
    };
    if (value) {
      return this.http.get('/res-status/?type=working_directory&field-name='
        + encodeURIComponent(filedname)
        + '&working-directory='
        + encodeURIComponent(value))
        .then((data: any) => {
          if (data.data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory } };
          } else if (data.data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => { });
    }
  }

  public CheckPid_Tid(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {

    const params = {
      pid: ctrl.value
    };
    if (ctrl.value) {
      return this.http.get('/res-status/?type=pid&pid=' + encodeURIComponent(ctrl.value))
        .then((data: any) => {
          if (data.data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.pid_not_exist } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => { });
    }
  }

  public CheckPid_Common_Der(
    ctrl: AbstractControl, file: any
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    let filedname = '';
    let value = '';
    if (Object.prototype.hasOwnProperty.call(arguments[0], 'filedname')) {
      filedname = arguments[0].filedname;
      value = arguments[1].value;
    }
    const params = {
      field_name: filedname,
      working_directory: value
    };
    if (value) {
      return this.http.get('/res-status/?type=working_directory&field-name='
        + encodeURIComponent(filedname)
        + '&working-directory='
        + encodeURIComponent(value))
        .then((data: any) => {
          if (data.data.status === 1) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_common } };
          } else if (data.data.status === 11) {
            return { aaa: { tiErrorMessage: this.i18n.invalid_directory_permisson } };
          } else {
            return null;
          }
        });
    } else {
      return Promise.resolve(() => { });
    }
  }
  public CheckPid(ctrl: AbstractControl) {
    if (!ctrl.value) {
      return { aaa: { tiErrorMessage: this.i18n.mission_create.modePidNotice } };
    }
    const val = ctrl.value;
    const reg = new RegExp('^([0]{1}|[1-9]+[0-9]*)$');
    const flag = reg.test(val);
    if (flag) {
      return null;
    } else {
      return { aaa: { tiErrorMessage: this.i18n.mission_create.modePidWarn } };
    }
  }
  public CheckApp(ctrl: AbstractControl) {
    if (!ctrl.value) {
      return { aaa: { tiErrorMessage: this.i18n.mission_create.modeAppPath } };
    }
    const val = ctrl.value;
    const reg = new RegExp('^\/([^\/]+\/?)*$');
    const flag = reg.test(val);
    if (flag) {
      return null;
    } else {
      return { aaa: { tiErrorMessage: this.i18n.mission_create.modeAppWarn } };
    }
  }
  public CheckAppParam(ctrl: AbstractControl): any {
    if (!ctrl.value) {
      return { aaa: { tiErrorMessage: this.i18n.mission_create.modeAppParams } };
    }
  }
  // 应用路径校验
  public pathValidator(): any {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === '') {
        return null;
      }
      if (this.pathMatch(control.value)) {
        return { appPathValid: { tiErrorMessage: this.i18n.mission_create.modeAppWarn } };
      } else {
        return null;
      }
    };
  }
  /**
   * 路径匹配
   * 匹配规则：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
   */
  public pathMatch(ipt: string): boolean {
    const reg = ['^', '`', '\\', '|', ';', '&', '$', '>', '<', '!', ' ', '//'];
    ipt = ipt ?? '';
    const isIncludes = (str: string) => ipt.includes(str);
    return reg.some(isIncludes)
      || ipt[0] !== '/'
      || ipt.charAt(ipt.length - 1) === '/';
  }
  public runUserNameValidator(): any {
    const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === '') {
        return null;
      }
      if (reg.test(control.value) === false) {
        return { userNameValid: { tiErrorMessage: this.i18n.tip_msg.system_setting_input_run_user_msg } };
      } else {
        return null;
      }
    };
  }
  // 正整数校验
  public checkInteger() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { errorMsg: { tiErrorMessage: this.i18n.tip_msg.system_setting_input_vaild_value } };
      }
      const val = control.value;
      const reg = /^[1-9]\d*$/;
      const flag = reg.test(val);
      if (flag) {
        return null;
      } else {
        return { errorMsg: { tiErrorMessage: this.i18n.tip_msg.system_setting_input_vaild_value } };
      }
    };
  }
  // 用户管理：用户名校验
  public checkUserName(): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { pwd: { tiErrorMessage: this.i18n.validata.name_req } };
      }
      if (!reg.test(control.value)) {
        return { pwd: { tiErrorMessage: this.i18n.validata.name_rule } };
      } else {
        return null;
      }
    };
  }
  // 用户管理：密码
  public checkPassword(target: any): ValidatorFn {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { pwd: { tiErrorMessage: this.i18n.validata.req } };
      }

      if (!reg.test(control.value) || (/[\u4E00-\u9FA5]/i.test(control.value))
        || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i)
          .test(control.value)) {
        return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule } };
      }

      const username = typeof target === 'object' ? target.value : target;
      if (username && (control.value === username || control.value === username.split('').reverse().join(''))) {
        return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule2 } };
      }

      return null;
    };
  }
  // 用户管理：确认密码
  public checkConfirmPassword(target: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { cpwd: { tiErrorMessage: this.i18n.validata.req } };
      } else if (target.editPwd.controls.cpwd.value !== target.editPwd.controls.pwd.value) {
        return { cpwd: { tiErrorMessage: this.i18n.validata.pwd_conf } };
      } else {
        return null;
      }
    };
  }
  // 非空校验
  public checkEmpty(tip = this.i18n.tip_msg.system_setting_input_empty_judge) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) {
        return { errorMsg: { tiErrorMessage: tip } };
      } else {
        return null;
      }
    };
  }

  /**
   * 数字微调器校验范围自定义提示
   */
  public checkRange(min?: number, max?: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (max && control.value > max) {
        return {
          errorMsg: {
            tiErrorMessage: this.i18nService.I18nReplace(this.i18n.common_term_input_greater, {
              0: max
            })
          }
        };
      } else if ((min && control.value < min) || (min === 0 && control.value < 0)) {
        return {
          errorMsg: {
            tiErrorMessage: this.i18nService.I18nReplace(this.i18n.common_term_input_less, {
              0: min
            })
          }
        };
      } else if (!control.value && control.value !== 0) {
        return { errorMsg: { tiErrorMessage: this.i18n.common_term_projiect_name_null } };
      } else {
        return null;
      }
    };
  }
  // 服务器文件路径校验
  public checkFilePath(tip = this.i18n.tip_msg.common_term_file_path_error): ValidatorFn {
    const reg = /^([\/][^\/]+)*$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = (control.value || '').toString().trim();
      if (tmpValue === '' || tmpValue == null) { return null; }

      return reg.test(tmpValue)
        ? null
        : { filePath: { tiErrorMessage: tip } };
    };
  }
  // 服务端CPU核校验
  public checkServerCPUMask() {
    const reg1 = /^\d+([\-]\d+)*$/;
    const reg2 = /^\d+\-\d+\-\d$/;

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return null; }

      return reg1.test(control.value) && !reg2.test(control.value)
        ? null
        : { errorMsg: { tiErrorMessage: this.i18n.ddr.cpuToBeSamples_validate } };
    };
  }
  // 采样CPU核校验
  public checkSampCPUMask() {
    const reg1 = /^\d+([\-,]\d+)*$/;
    const reg2 = /^\d+\-\d+\-\d$/;

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return null; }

      return reg1.test(control.value) && !reg2.test(control.value)
        ? null
        : { errorMsg: { tiErrorMessage: this.i18n.ddr.cpuToBeSamples_validate } };
    };
  }
  // OpenMP参数校验
  public checkOpenMPParam(): any {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) { return null; }
      let isValid = true;
      const params = control.value.split(' ');
      params.forEach((param: any) => {
        isValid = isValid && checkOMP(param);
      });
      return isValid ? null : {
        errorMsg: {
          tiErrorMessage: this.i18n.hpc.mission_create.openMpParams_validate
        }
      };
    };
    function checkOMP(data: any) {
      if (data) {
        const target = data.split('=');
        return (target[0].indexOf('OMP') || !target[1]) ? false : true;
      } else {
        return true;
      }
    }
  }
  public checkNetworkParam(labelName: string): any {
    const reg = new RegExp(/^[a-zA-Z0-9]{2,15}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      if (!reg.test(control.value)) {
        return { pwd: { tiErrorMessage: labelName + this.i18n.validata.networkPort } };
      } else {
        return null;
      }
    };
  }
  /**
   * 参数A的值跟参数B的值有大小关系
   *
   * 例一：延迟采样时长与采样时长加起来不能大于900s
   *  validTheSizeRelationship({
   *    relatedFormControlName: 'samplingTime',
   *    tip: '延迟采样时长与采样时长加起来不能大于900s',
   *    calcExpression: ([valueA, valueB]) => valueA + valueB * 1000 <= 900000,
   * });
   *
   * 例二：采样间隔应当小于或等于采样时长的1/2
   *  validTheSizeRelationship({
   *    relatedFormControlName: 'duration',
   *    tip: this.i18n.process.intervalTip,
   *    calcExpression: ([valueA, valueB]) => valueA <= valueB / 2,
   * })
   */
  public validTheSizeRelationship({ relatedFormControlName, tip, calcExpression }: {
    // 相关联的表单控件名称【必须在同一个fromGroup里面】
    relatedFormControlName?: string | string[],
    // 错误提示信息
    tip: string,
    // 校验表达式
    calcExpression: (args: any) => boolean
  }): ValidatorFn {
    let thisControl: any;
    let relatedFormControl: any;
    return (control: AbstractControl): ValidationErrors | any => {
      if (relatedFormControlName) {
        if (!control.parent) {
          return null;
        }
        if (!thisControl) {
          thisControl = control;
          // 兼容下传递单个值，方便后续扩展
          if (!Array.isArray(relatedFormControlName)) {
            relatedFormControlName = [relatedFormControlName];
          }
          relatedFormControl = relatedFormControlName.map(formControlName => {
            const formControl = control.parent.get(formControlName);
            if (!formControl) {
              throw new Error(`matchOtherValidator(): ${formControlName} control is not found in parent group`);
            }
            return formControl;
          });
          relatedFormControl.forEach((formControl: any) => {
            formControl.valueChanges.subscribe(() => {
              thisControl.updateValueAndValidity();
            });
          });
        }
      } else {
        throw new Error('matchOtherValidator(): related control is not found');
      }
      if (!calcExpression([
        control.value,
        ...(relatedFormControl as any).map((formControl: any) => formControl.value)
      ])) {
        // 当采样间隔未touch过的时候，修改采样时长的值不会触发采样间隔的错误提示，需要标记为touched才可以
        if (!thisControl.touched) {
          thisControl.markAsTouched();
        }
        return {
          pwd: {
            tiErrorMessage: tip,
            type: 'blur'
          }
        };
      }
    };
  }

  /**
   * 检查是否有中文
   * @param control 控制器
   * @returns 错误信息
   */
  public checkHasChinese(control: AbstractControl): CustomValidationErrors | null {
    const reg = /[\u4e00-\u9fa5]/;
    return control.value && reg.test(control.value) ? {
       res: {
        tiErrorMessage: I18n.nodeManagement.hasChineseTip,
        type: 'blur'
      }
    } : null;
  }

  // 内存io-逻辑盘名文件名校验
  public checkDriveName() {
    return (ctrl: AbstractControl) => {
      if (ctrl.value) {
        const arr = ctrl.value.split(';');
        const bool =
          arr.every((val: string) => (/^(\/[\w^]{1,120}){0,9}\/(\w[\.\w\-]{0,118})(\.)?[\w\-]{0,6}$/.test(val)));
        return bool ? null
          : { errorMsg: { tiErrorMessage: this.i18n.tip_msg.common_term_file_path_error }};
      } else {
        return Promise.resolve(() => { });
      }
    };
  }
  /**
   * ssh安全提示 校验checkout已勾选
   */
  public checkRead() {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value ? null : { errorMsg: { tiErrorMessage: '' } };
    };
  }
}
