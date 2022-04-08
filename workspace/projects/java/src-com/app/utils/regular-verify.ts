/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { I18nService } from '../../app/service/i18n.service';

@Injectable({
    providedIn: 'root'
})
export class RegularVerify {
    constructor(
        public i18nService: I18nService,
    ) {
    }
    /**
     * 保存报告自定义校验规则
     * @param validata 校验对象
     */
    public reportNameValid(validata: any): ValidatorFn {
        const reg = new RegExp(/^[a-zA-Z][\w\.\+\-\(\)\s]{5,127}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { name: { tiErrorMessage: validata.validata.req } };
            }
            if (!reg.test(control.value)) {
                return {
                    name: {
                        tiErrorMessage: validata.validata.report_name_rule,
                    },
                };
            }
            return null;
        };
    }

    /**
     * 保存报告备注自定义校验规则
     * @param validata 校验对象
     */
    public reportRemarkValid(validata: any): ValidatorFn {
        const reg = new RegExp(/^[\w\W]{0,300}$/);
        const warnText = this.i18nService.I18nReplace(validata.common_term_max_length_tip, {
            0: '300'
        });
        return (control: AbstractControl): ValidationErrors | null => {
            if (!reg.test(control.value)) {
                return {
                    name: {
                        tiErrorMessage: warnText,
                    },
                };
            }
            return null;
        };
    }

    /**
     * 用户密码自定义校验规则
     * @param validata 校验对象
     */
    public password(i18n: any, editRole: any): ValidatorFn {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.req } };
            }
            if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.pwd_rule } };
            }
            if (editRole.get('name').value && (control.value === editRole.get('name').value
                || control.value === editRole.get('name').value.split('').reverse().join(''))) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.pwd_rule2 } };
            } else {
                return null;
            }
        };
    }

    /**
     * 用户名自定义校验规则
     * @param validata 校验对象
     */
    public username(i18n: any): ValidatorFn {
        const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.name_req } };
            } else if (reg.test(control.value) === false) {
                return { pwd: { tiErrorMessage: i18n.newHeader.validata.name_rule } };
            } else {
                return null;
            }
        };
    }

    /**
     *   微调器回填
     */
    public setSpinnerInfo(info: any) {
        const { control, min, max } = info;
        const value = +control?.value; // number, NaN
        switch (true) {
            case value == null || isNaN(value):
                control.setValue(min);
                break;
            case value < min:
                control.setValue(min);
                break;
            case value > max:
                control.setValue(max);
                break;
            default:
        }
    }

    /**
     *   微调器回填
     */
     public setSpinnerDefaultInfo(info: any) {
      const { control, min, max , defaultValue } = info;
      const value = +control?.value; // number, NaN
      switch (true) {
          case value == null || isNaN(value):
              control.setValue(defaultValue);
              break;
          case value < min:
              control.setValue(min);
              break;
          case value > max:
              control.setValue(max);
              break;
          default:
      }
  }
}

