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

// --- 基础表单【定义公用的属性和方法】 ---
import {
  FormControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, AbstractControl, FormArray, Validators
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';

class BaseForm {
  public displayOrder: string[] = [];
  public displayedElementList: string[] = [];
  public switchingRulesForValueChanges: any = {};
  public form: any = {};
  public formGroup: any = {};
  public interfaces: any = {};
  public paramsConfigSuggestions: boolean | object = false;  // 参数配置建议

  constructor() {}

  /**
   * 深拷贝，类似于1.x中的angular.copy()【来着tiny3表格树表不确定】
   */
  public deepClone(obj: any): any  {
    if (typeof (obj) !== 'object' || obj === null) {
      return obj;
    }

    let clone: any;

    clone = Array.isArray(obj) ?  obj.slice() : {...obj};

    const keys: Array<string> = Object.keys(clone);

    for (const key of keys) {
      clone[key] = this.deepClone(clone[key]);
    }

    return clone;
  }

  /**
   * 生成表单元素验证
   */
  public generateFormGroup() {
    // 所有的表单元素验证
    const validation = {};
    function mapItems(items) {
      const selectedItems = items.filter((item) => item.checked).map((item) => item.value);
      return selectedItems.length ? selectedItems : null;
    }

    Object.keys(this.form).forEach(key => {
      const formItem = this.form[key];

      if (formItem.type === 'checkbox') {
        const checkboxGroup = new FormArray(formItem.list.map(option => new FormGroup({
          label: new FormControl(option.label),   // text of checkbox(show its value as checkbox's label)
          value: new FormControl(option.value),      // id of checkbox(only use its value and won't show in html)
          checked: new FormControl(option.checked)    // checkbox itself
        })));
        const hiddenControl = new FormControl(mapItems(checkboxGroup.value), formItem.required
          ? Validators.required : undefined);
        // update checkbox group's value to hidden formcontrol
        checkboxGroup.valueChanges.subscribe((v) => {
          hiddenControl.setValue(mapItems(v));
        });

        validation[key] = checkboxGroup;
        validation[`${key}_hiddenControl`] = hiddenControl;
      } else {
        const validators = [];

        if (formItem.required) {
          validators.push(TiValidators.required);
        }

        // 如果(是 inputNumber) || (是 spinner 且 correctable 为 false)，添加最下值最大值校验
        if ((formItem.type === 'inputNumber') || (formItem.type === 'spinner' && !formItem.correctable)) {
          if (typeof formItem.min === 'number') {
            validators.push(TiValidators.minValue(formItem.min));
          }
          if (typeof formItem.max === 'number') {
            validators.push(TiValidators.maxValue(formItem.max));
          }
        }

        if (formItem.customValidators) {
          validators.push(...formItem.customValidators);
        }

        validation[key] = new FormControl('', validators);
      }

      // 设置每个元素的disabledReason为{}；就不一一设置了
      if (!formItem.disabledReason) {
        formItem.disabledReason = {};
      }

      formItem.order = this.displayOrder.indexOf(key);
    });

    this.formGroup = new FormBuilder().group(validation);

    // 先给不在显示的元素全部加一次禁用【禁用表单验证】，switchingRulesForValueChanges会解开相关的禁用
    this.setElementDisabledState({
      list: this.displayOrder.filter(key => !this.displayedElementList.includes(key)),
      reason: {
        key: 'switchDisplay',
        des: '',
      },
      operate: 'add',
    });

    // 给 select 和 radio 元素添加change事件监听【目前只有这两个需要监听change事件】
    Object.keys(this.form).forEach(key => {
      const formItem = this.form[key];

      if (['select', 'radio'].includes(formItem.type)) {
        this.formGroup.get(key).valueChanges.subscribe(val => {
          if (formItem.type === 'select') {
            val = val.value;
          }

          if (val !== formItem.lastValue) {
            this.setDisplayedElementListWhenChange({ key, formItem, value: val });

            formItem.lastValue = val;
          }
        });
      }
    });
  }

  /**
   * 修改表单值 --> 修改显示列表
   */
  public setDisplayedElementListWhenChange({ key, formItem, value }) {
    // 计算列表【迭代children计算出总的列表】
    const calcList = targetRel => {
      const list = [];
      const addList = param => {
        if (Array.isArray(param.children)) {
          param.children.forEach(item => {
            addList(this.switchingRulesForValueChanges[item]);
          });
        }

        if (Array.isArray(param.list)) {
          list.push(...param.list);
        }
      };

      addList(targetRel);

      return list;
    };

    // 先去掉上个选项的列表
    const lastTarget = this.switchingRulesForValueChanges[formItem.lastValue];
    if (lastTarget) {
      const listToBeRemoved = calcList(lastTarget);

      if (this.displayedElementList.includes(key)) {
        this.setDisplayedElementList({ operate: 'reduce', list: listToBeRemoved });
      }

      if (lastTarget.parent) {
        const children = this.switchingRulesForValueChanges[lastTarget.parent].children;
        children.splice(children.indexOf(formItem.lastValue), 1);
      }
    }

    // 再加上这个选项的列表
    const target = this.switchingRulesForValueChanges[value];
    if (target) {
      const listToBeAdded = calcList(target);

      if (this.displayedElementList.includes(key)) {
        this.setDisplayedElementList({ operate: 'add', list: listToBeAdded });
      }

      if (target.parent) {
        const targetParent = this.switchingRulesForValueChanges[target.parent];
        if (targetParent.children && Array.isArray(targetParent.children)) {
          targetParent.children.push(value);
        } else {
          targetParent.children = [value];
        }
      }

      // 新加的选项没有初始化默认值时初始化下默认值
      if (!formItem.hasSetDefaultValueList.includes(value)) {
        if (listToBeAdded) {
          this.initDefaultValue({
            list: listToBeAdded,
          });
        }

        formItem.hasSetDefaultValueList.push(value);
      }
    }
  }

  /**
   * 初始化默认值
   * @param param0 初始化的列表
   */
  public initDefaultValue({ list }) {
    list.forEach(key => {
      const el = this.form[key];

      if (['select', 'radio'].includes(el.type)) {
        const option = el.list.find(item => item.checked);

        if (option) {
          this.formGroup.controls[key].setValue(el.type === 'select' ? option : option.value);
        }
      } else {
        if (el.value !== undefined) {
          this.formGroup.controls[key].setValue(el.value);
        }
      }
    });
  }

  /**
   * 修改 displayedElementList
   */
  public setDisplayedElementList({ operate, list }: {
    operate: 'add' | 'reduce';
    list: string[];
  }) {
    if (operate === 'add') {
      list.forEach(item => {
        if (!this.displayedElementList.includes(item)) {
          this.displayedElementList.push(item);
        }
      });
    } else if (operate === 'reduce') {
      list.forEach(item => {
        if (this.displayedElementList.includes(item)) {
          this.displayedElementList.splice(this.displayedElementList.indexOf(item), 1);
        }
      });
    }

    // 禁用不显示的选项 / 解禁需要显示的选项 【禁用选项可以禁用校验】
    this.setElementDisabledState({
      list,
      reason: {
        key: 'switchDisplay',
        des: '',
      },
      operate: operate === 'add' ? 'reduce' : 'add',
    });
  }

  /**
   * 设置表单禁用(禁用掉表单校验)
   */
  public setElementDisabledState({ list, reason, operate }: {
    list: string[];
    reason: {
      key: string;
      des: string;
    };
    operate: 'add' | 'reduce';
  }) {
    list.forEach(key => {
      const formItem = this.form[key];
      const disabledReason = formItem.disabledReason;

      if (operate === 'add') {
        disabledReason[reason.key] = reason.des;
      } else if (operate === 'reduce') {
        delete disabledReason[reason.key];
      }
      const status = Object.keys(disabledReason).length ? 'disable' : 'enable';
      this.formGroup.controls[key][status]();
      if (formItem.type === 'checkbox') {
        this.formGroup.controls[`${key}_hiddenControl`][status]();
      }
    });
  }


  // -- 导出参数【获取任务数据】 --
  /**
   * 获取任务数据
   */
  public getValues({ formEl, formElList }: {
    formEl?: any,
    formElList?: any[], // 由多个 formEl 组合来算值
  }) {
    // 如果传的是单个表单对象，转成数组，格式统一【保留 formEl 是因为兼容多种类型，方便后续修改】
    if (formEl && !formElList) {
      formElList = [formEl];
    }

    // 先根据 displayedElementList 计算出下发的值
    const values = {};
    formElList.forEach(formElItem => {
      Object.assign(
        values,
        this.getFormControlValue({
          formKeyList: formElItem.displayedElementList,
          formEl: formElItem,
        })
      );
    });

    return values;
  }

  /**
   * 返回表单元素发送给后端的接口值
   */
  public getFormControlValue({ formKey, formKeyList, type, formEl }: {
    formKey?: string, // 对应的表单元素key
    formKeyList?: string[], // 返回多个key的值
    type?: 'valueArray' | 'keyValuePair',
    formEl: any
  }) {
    // 默认formKey是返回值，formKeyList是返回键值对
    if (!type) {
      type = formKeyList ? 'keyValuePair' : 'valueArray';
    }

    const values = formEl.formGroup.getRawValue();

    const calcValue = key => {
      const formItem = formEl.form[key];

      if (formItem.type === 'checkbox') {
        return values[`${key}_hiddenControl`];
      } else if (formItem.type === 'select') {
        return values[key].value;
      } else if (formItem.type === 'inputNumber' && formItem.uploadMode === 'string') {
        return values[key] + '';
      } else {
        return values[key];
      }
    };

    if (type === 'valueArray') {
      if (formKey) {
        return calcValue(formKey);
      } else if (formKeyList) {
        return formKeyList.map(item => calcValue(item));
      }
    } else if (type === 'keyValuePair') {
      if (formKey) {
        return {
          formKey: calcValue(formKey),
        };
      } else if (formKeyList) {
        const res = {};
        formKeyList.forEach(item => {
          res[item] = calcValue(item);
        });
        return res;
      }
    }
  }

  /**
   * value 转换为接口发送的 params
   */
  public valuesToParams({ values, removeNulls, nullValue = ['', undefined, null] }: {
    values: any,
    removeNulls?: boolean,  // 是否去除空值【目前Miss事件空值不能下发】
    nullValue?: any[],  // 哪些值视为空值
  }) {
    const params = {};
    const setParams = (currentParams, interfaces) => {
      Object.keys(interfaces).forEach(key => {
        const item = interfaces[key];

        if (['string', 'number'].includes(typeof item)) { // string、number类型: 表单上没有但是后端需要的参数
          currentParams[key] = item;
        } else if (Object.prototype.toString.call(item) === '[object Object]') {
          if (item.formKey) { // formKey 表示对应表单的某个参数
            if (values.hasOwnProperty(item.formKey)) {
              let value = values[item.formKey];

              if (item.interFaceMapping) {  // 自定义参数计算方式
                value = item.interFaceMapping({
                  operate: 'get',
                  formControlValue: value,
                  params
                });
              }

              if (!removeNulls || !nullValue.includes(value)) {
                currentParams[key] = value;
              }
            }
          } else if (item.formKeyList) {  // formKeyList 表示值由多个表单元素合成而来
            const value = item.interFaceMapping({
              operate: 'get',
              formControlValueList: item.formKeyList.map(formKey => values[formKey]),
              params
            });

            if (!removeNulls || !nullValue.includes(value)) {
              currentParams[key] = value;
            }
          } else {  // formKey 和 formKeyList 决定该计算值了，否则表示接口的层级关系
            if (!currentParams[key]) {
              currentParams[key] = {};
            }
            setParams(currentParams[key], item);
          }
        } else {
        }
      });
    };

    setParams(params, this.interfaces);

    return params;
  }

  /**
   * 获取任务数据
   */
  public getTaskData({ formEl, formElList, removeNulls, nullValue = ['', undefined, null] }: {
    formEl?: any,
    formElList?: any[], // 由多个 formEl 组合来算值
    removeNulls?: boolean,  // 是否去除空值【目前Miss事件空值不能下发】
    nullValue?: any[],  // 哪些值视为空值
  }) {
    return this.valuesToParams({
      values: this.getValues({
        formEl,
        formElList,
      }),
      removeNulls,
      nullValue,
    });
  }


  // -- 导入参数 --
  /**
   * 接口值转换为表单值
   */
  public paramsToValues({ params }: {
    params: any,  // 接口返回的值
  }) {
    const values: any = {};
    const setParams = (currentValues, paramInterfaces) => {
      Object.keys(paramInterfaces).forEach(key => {
        const item = paramInterfaces[key];

        if (['string', 'number'].includes(typeof item)) { // string、number类型表单上没有但是后端需要的参数，不需要处理

        } else if (Object.prototype.toString.call(item) === '[object Object]') {
          if (item.formKey) { // formKey 表示对应表单的某个参数
            let value = currentValues[key];
            if (item.interFaceMapping) {  // 自定义参数计算方式
              value = item.interFaceMapping({
                operate: 'set',
                setValue: value,
                params: values
              });
            }

            values[item.formKey] = value;
          } else if (item.formKeyList) {  // formKeyList 表示值由多个表单元素合成而来
            const valueList = item.interFaceMapping({
              operate: 'set',
              setValue: currentValues[key],
              params: values
            });

            item.formKeyList.forEach((formKey, index) => {
              values[formKey] = valueList[index];
            });
          } else {  // formKey 和 formKeyList 决定该计算值了，否则表示接口的层级关系
            if (!currentValues[key]) {
              currentValues[key] = {};
            }
            setParams(currentValues[key], item);
          }
        } else {
        }
      });
    };

    setParams(params, this.interfaces);
    this.custemInterfaceValues({ values });

    return values;
  }

  /**
   * 添加上表单没发送的值【例如：访存统计分析的分析对象为系统，但是接口没发送】【没有具体实现，继承类重写这个函数】
   */
  public custemInterfaceValues({ values }) {}

  /**
   * 把 values 设置到表单上
   */
  public setValues({ values, formEl, type, i18n }: {
    values: any,
    formEl: any,
    type: 'form' | 'text',  // 文本表单还是普通表单
    i18n: any,
  }) {
    Object.keys(formEl.form).forEach(key => {
      formEl.setFormControlValue({
        formEl,
        type,
        formKey: key,
        value: values[key],
        i18n,
      });
    });
  }

  /**
   * 设置表单元素参数
   */
  public setFormControlValue({ formEl, type, formKey, value, i18n }: {
    formEl: any,
    type: 'form' | 'text',
    formKey: string, // 对应的表单元素key
    value: any,
    i18n?: any,
  }) {
    const formItem = formEl.form[formKey];

    if (['select', 'radio'].includes(formItem.type)) {
      let option;
      if (value) {
        option = formItem.list.find(item => item.value === value);
      } else {
        option = formItem.list.find(item => item.checked);
      }

      if (option) {
        formEl.formGroup.controls[formKey].setValue(formItem.type === 'select' ? option : value);
      }

      if (type === 'text') {
        formItem.text = option ? (option.text || option.label) : undefined;
      }
    } else if (['checkbox'].includes(formItem.type)) {
      formEl.formGroup.controls[formKey].controls.forEach(formGroup => {
        formGroup.controls.checked.setValue(Array.isArray(value) && value.includes(formGroup.controls.value.value));
      });

      if (type === 'text') {
        const list = [];
        formEl.formGroup.get(formKey).value.forEach(option => {
          if (option.checked) {
            list.push(option.label);
          }
        });

        formItem.text = list.join(i18n.ddr.douhao);
      }
    } else {
      if ([undefined, null].includes(value)) {
        formEl.formGroup.controls[formKey].setValue('');
      } else {
        formEl.formGroup.controls[formKey].setValue(value);
      }

      if (type === 'text' && value !== undefined) {
        if (formItem.type === 'switch') {
          formItem.text = value ? i18n.process.enable : i18n.process.disable;
        } else {
          formItem.text = value;
        }
      }
    }
  }

  /**
   * 导入参数
   */
  public importParams({ formEl, type, values, i18n }: {
    formEl: any,
    type: 'form' | 'text',  // 文本表单还是普通表单
    values: any,  // 接口返回的值
    i18n: any,
  }) {
    this.setValues({
      values: this.paramsToValues({ params: values }),
      formEl,
      type,
      i18n,
    });
  }
}

export { BaseForm };
