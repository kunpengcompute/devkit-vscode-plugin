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

// --- Miss事件表单 ---
import { AllParams, CustomValidators } from '../AllParams';
import { ConfigNodeForm } from '../ConfigNodeForm';
import { I18nService } from '../../../service/i18n.service';

class MissEventForm extends ConfigNodeForm {
  public analysisObject: string;  // 分析对象

  constructor() {
    super();
    const i18n = new I18nService().I18n();

    const displayOrder = [
      'samplingTime', 'samplingInterval_instructionsNum', 'delayCollectionTime', 'indicatorType', 'minimumDelay',
      'cpuToBeSamples', 'samplingRange', 'c_source', 'kcore', 'perfDataLimit'
    ];
    const displayedElementList = [
      'samplingTime', 'indicatorType', 'samplingInterval_instructionsNum', 'samplingRange', 'delayCollectionTime',
      'c_source', 'kcore', 'perfDataLimit'
    ];
    const switchingRulesForValueChanges = {
      longLatencyLoad: {  // 指标类型为 longLatencyLoad 时显示最小延时
        list: ['minimumDelay']
      },
    };
    const allParamsClone = this.deepClone(new AllParams().allParams);

    this.displayOrder = displayOrder;
    this.displayedElementList = displayedElementList;
    this.switchingRulesForValueChanges = switchingRulesForValueChanges;
    this.displayOrder.forEach(key => {
      this.form[key] = allParamsClone[key];
    });

    // 自定义采样时长
    this.form.samplingTime.value = 5;
    // 自定义采样间隔
    this.form.samplingInterval_instructionsNum.value = 8192;
    // 延迟采样时长与采样时长加起来不能大于900s
    const delayCollectionTimeValidator = CustomValidators.validTheSizeRelationship({
      relatedFormControlName: 'samplingTime',
      tip: i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
      calcExpression: ([valueA, valueB]) => valueA + valueB * 1000 <= 900000,
    });
    if (Array.isArray(this.form.delayCollectionTime.customValidators)) {
      this.form.delayCollectionTime.customValidators.push(delayCollectionTimeValidator);
    } else {
      this.form.delayCollectionTime.customValidators = [delayCollectionTimeValidator];
    }

    // 接口映射
    this.interfaces = {
      taskname: {
        formKey: 'taskName',
      },

      task_param: {
        config: 'spe',
        type: 'summary',
        target: {
          formKeyList: ['analysisObject', 'analysisMode'],
          interFaceMapping: ({ operate, formControlValueList, setValue, params }: any) => {
            const analysisObjectMapping: any = {
              sys: 'analysisObject_sys',
              analysisObject_sys: 'sys',
              analysisObject_app: 'analysisObject_app',
            };
            const analysisModeMapping: any = {
              app: 'app',
              pid: 'pid',
            };

            if (operate === 'get') {
              if (formControlValueList[0] === 'analysisObject_sys') {
                return analysisObjectMapping[formControlValueList[0]];
              } else {
                return analysisModeMapping[formControlValueList[1]];
              }
            } else if (operate === 'set') {
              if (analysisObjectMapping[setValue] === 'analysisObject_sys') {
                return [analysisObjectMapping[setValue], undefined];
              } else {
                return ['analysisObject_app', analysisModeMapping[setValue]];
              }
            }
          },
        },
        app: {
          formKey: 'application',
        },
        appArgs: {
          formKey: 'applicationParams',
        },
        pid: {
          formKey: 'pid',
        },
        process_name: {
          formKey: 'process_name',
        },
        period: {
          formKey: 'samplingInterval_instructionsNum',
        },
        metrics: {
          formKey: 'indicatorType',
          interFaceMapping: ({ operate, formControlValue, setValue, params }: any) => {
            const listMapping: any = {
              llcMiss: 'llcMiss',
              tlbMiss: 'tlbMiss',
              remoteAccess: 'remoteAccess',
              longLatencyLoad: 'longLatencyLoad',
            };

            if (operate === 'get') {
              return listMapping[formControlValue];
            } else if (operate === 'set') {
              return listMapping[setValue];
            }
          },
        },
        minLatency: {
          formKey: 'minimumDelay',
        },
        duration: {
          formKey: 'samplingTime',
        },
        cpu: {
          formKey: 'cpuToBeSamples',
        },
        space: {
          formKey: 'samplingRange',
          interFaceMapping: ({ operate, formControlValue, setValue, params }: any) => {
            const listMapping: any = {
              all: 'all',
              kernel: 'kernel',
              user: 'user',
            };

            if (operate === 'get') {
              return listMapping[formControlValue];
            } else if (operate === 'set') {
              return listMapping[setValue];
            }
          },
        },
        startDelay: {
          formKey: 'delayCollectionTime',
        },
        srcDir: {
          formKey: 'c_source',
        },
        kcore: {
          formKey: 'kcore',
        },
        perfDataLimit: {
          formKey: 'perfDataLimit',
        }
      },

      'analysis-type': {  // 分析类型依赖于分析对象，放到分析对象后面计算值
        formKey: 'memAnalysisMode',
        interFaceMapping: ({ operate, formControlValue, setValue, params }: any) => {
          return 'miss_event';
        },
      },
    };
  }

  /**
   * 不同模式参数不同
   *  1、系统模式需要额外添加待采样CPU核
   * @param analysisObject 分析对象和模式的统称
   */
  public setAnalysisObject(analysisObject: 'analysisObject_sys' | 'app' | 'pid') {
    const needAddList: any = {
      analysisObject_sys: ['cpuToBeSamples'],
    };
    if (this.analysisObject) {
      this.setDisplayedElementList({
        operate: 'reduce',
        list: needAddList[this.analysisObject] || [],
      });
    }

    this.setDisplayedElementList({
      operate: 'add',
      list: needAddList[analysisObject] || [],
    });

    this.analysisObject = analysisObject;
  }

  public custemInterfaceValues({ values }: any) {
    values.analysisType = 'memAnalysis';
  }

  public getNodeConfigKeys({ analysisObject, analysisMode }: any): any {
    if (analysisObject === 'analysisObject_sys') {
      return ['cpuToBeSamples', 'c_source'];
    } else if (analysisObject === 'analysisObject_app') {
      if (analysisMode === 'app') {
        return ['application', 'applicationParams', 'switchState', 'user_name', 'password', 'c_source'];
      } else if (analysisMode === 'pid') {
        return ['pid', 'process_name', 'c_source'];
      }
    }
  }
}

export { MissEventForm };
