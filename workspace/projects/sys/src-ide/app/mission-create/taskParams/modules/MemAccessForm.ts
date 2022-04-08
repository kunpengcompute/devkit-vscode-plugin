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

// --- 访存统计分析表单 ---
import { AllParams, CustomValidators } from '../AllParams';
import { BaseForm } from '../BaseForm';
import { I18nService } from '../../../service/i18n.service';
import { TiValidators } from '@cloud/tiny3';

class MemAccessForm extends BaseForm {
  constructor() {
    super();
    const i18n = new I18nService().I18n();

    const displayOrder = ['samplingTime', 'samplingInterval', 'samplingType'];
    const displayedElementList = ['samplingTime', 'samplingInterval', 'samplingType'];
    const allParamsClone = this.deepClone(new AllParams().allParams);

    this.displayOrder = displayOrder;
    this.displayedElementList = displayedElementList;
    this.displayOrder.forEach(key => {
      this.form[key] = allParamsClone[key];
    });

    // 自定义form参数
    // 自定义采样间隔的范围
    const samplingInterval = this.form.samplingInterval;
    const samplingIntervalValidator = CustomValidators.validTheSizeRelationship({
      relatedFormControlName: 'samplingTime',
      tip: i18n.process.intervalTip,
      calcExpression: ([valueA, valueB]) => valueA.value <= valueB / 2 * 1000,
    });
    if (Array.isArray(samplingInterval.customValidators)) {
      samplingInterval.customValidators.push(samplingIntervalValidator);
    } else {
      samplingInterval.customValidators = [samplingIntervalValidator];
    }

    this.form.samplingTime.customValidators = [
      TiValidators.minValue(1),
      TiValidators.maxValue(300),
    ];

    this.interfaces = {
      'analysis-type': {
        formKey: 'memAnalysisMode',
        interFaceMapping: ({ operate, formControlValue, setValue, params }) => {
          return 'mem_access';
        },
      },
      taskname: {
        formKey: 'taskName',
      },
      duration: {
        formKey: 'samplingTime',
      },
      interval: {
        formKey: 'samplingInterval',
        interFaceMapping: ({ operate, formControlValue, setValue, params }) => {
          if (operate === 'get') {
            return formControlValue + '';
          } else if (operate === 'set') {
            return +setValue;
          }
        },
      },

      task_param: {
        type: {
          formKey: 'samplingType',
          interFaceMapping: ({ operate, formControlValue, setValue, params }) => {
            const listMapping = {
              cache_access: 'cache_access',
              ddr_access: 'ddr_access',
            };

            if (operate === 'get') {
              return formControlValue.map(item => listMapping[item]);
            } else if (operate === 'set') {
              return setValue.map(item => listMapping[item]);
            }
          },
        },
      },
    };
  }

  /**
   * 添加上表单没发送的值
   */
  public custemInterfaceValues({ values }) {
    values.analysisObject = 'analysisObject_sys';
    values.analysisType = 'memAnalysis';
  }
}

export { MemAccessForm };
