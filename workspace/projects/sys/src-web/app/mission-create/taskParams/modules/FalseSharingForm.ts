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

// --- 伪共享分析表单 ---
import { AllParams } from '../AllParams';
import { ConfigNodeForm } from '../ConfigNodeForm';

class FalseSharingForm extends ConfigNodeForm {
  public analysisObject: string;  // 分析对象

  constructor(i18n: any) {
    super();

    const displayOrder = [
      'samplingTime', 'samplingInterval_instructionsNum', 'delayCollectionTime', 'cpuToBeSamples', 'samplingRange',
      'symbolFilePath', 'c_source', 'kcore', 'filesize'
    ];
    const displayedElementList = [
      'samplingTime', 'cpuToBeSamples', 'samplingInterval_instructionsNum', 'samplingRange', 'delayCollectionTime',
      'symbolFilePath', 'c_source', 'kcore', 'filesize'
    ];
    const allParamsClone = this.deepClone(new AllParams().allParams);

    this.displayOrder = displayOrder;
    this.displayedElementList = displayedElementList;
    this.displayOrder.forEach(key => {
      this.form[key] = allParamsClone[key];
    });

    // 自定义form参数
    // 自定义采样时长
    this.form.samplingTime.value = 3;
    this.form.samplingTime.min = 1;
    this.form.samplingTime.max = 10;
    this.form.samplingTime.tip = undefined;
    this.form.samplingTime.tailPrompt = i18n.common_term_sign_left + '1~10' + i18n.common_term_sign_right;
    // 修改采样范围的默认值
    this.form.samplingRange.list.forEach((option: any) => {
      option.checked = option.value === 'user';
    });
    // 修改延迟采样时长
    this.form.delayCollectionTime.value = 0;

    // 接口映射
    this.interfaces = {
      taskname: {
        formKey: 'taskName',
      },
      'analysis-target': {
        formKeyList: ['analysisObject', 'analysisMode'],
        interFaceMapping: ({ operate, formControlValueList, setValue, params }: any) => {
          const analysisObjectMapping: any = {
            'Profile System': 'analysisObject_sys',
            analysisObject_sys: 'Profile System',
            analysisObject_app: 'analysisObject_app',
          };
          const analysisModeMapping: any = {
            app: 'Launch Application',
            'Launch Application': 'app',
            pid: 'Attach to Process',
            'Attach to Process': 'pid',
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
      appDir: {
        formKey: 'application',
      },
      appParameters: {
        formKey: 'applicationParams',
      },
      pid: {
        formKey: 'pid',
      },
      process_name: {
        formKey: 'process_name',
      },
      'analysis-type': {
        formKey: 'memAnalysisMode',
        interFaceMapping: ({ operate, formControlValue, setValue, params }: any) => {
          return 'falsesharing';
        },
      },
      task_param: {
        type: 'falsesharing',
        duration: 5,
        target: 'app',
        period: 1024,
      },
      duration: {
        formKey: 'samplingTime',
      },
      period: {
        formKey: 'samplingInterval_instructionsNum',
      },
      samplingSpace: {
        formKey: 'samplingRange',
        interFaceMapping: ({ operate, formControlValue, setValue, params }: any) => {
          const listMapping: any = {
            all: 'ALL',
            ALL: 'all',
            user: 'all-user',
            'all-user': 'user',
            kernel: 'all-kernel',
            'all-kernel': 'kernel',
          };

          if (operate === 'get') {
            return listMapping[formControlValue];
          } else if (operate === 'set') {
            return listMapping[setValue];
          }
        },
      },
      cpuMask: {
        formKey: 'cpuToBeSamples',
      },
      samplingDelay: {
        formKey: 'delayCollectionTime',
      },
      assemblyLocation: {
        formKey: 'symbolFilePath',
      },
      sourceLocation: {
        formKey: 'c_source',
      },
      kcore: {
        formKey: 'kcore',
      },
      filesize: {
        formKey: 'filesize',
      },
    };

    // 参数配置建议
    this.paramsConfigSuggestions = i18n.falsesharing.paramsConfigSuggestions;
  }

  /**
   * 不同模式参数不同
   *  暂时没有不同的
   * @param analysisObject 分析对象和模式的统称
   */
  public setAnalysisObject(analysisObject: 'analysisObject_sys' | 'app' | 'pid') {
    const needAddList: any = {};

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
      return ['cpuToBeSamples', 'symbolFilePath', 'c_source', 'filesize'];
    } else if (analysisObject === 'analysisObject_app') {
      if (analysisMode === 'app') {
        return ['application', 'applicationParams', 'switchState', 'user_name', 'password', 'cpuToBeSamples',
          'symbolFilePath', 'c_source', 'filesize'];
      } else if (analysisMode === 'pid') {
        return ['pid', 'process_name', 'cpuToBeSamples', 'symbolFilePath', 'c_source', 'filesize'];
      }
    }
  }
}

export { FalseSharingForm };
