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
import { TiValidators } from '@cloud/tiny3';
import { AllParams, CustomValidators } from '../AllParams';
import { ConfigNodeForm } from '../ConfigNodeForm';

class FalseSharingForm extends ConfigNodeForm {
    constructor(i18n: any, customValidatorsService: any) {
        super();

        const displayOrder = [
            'samplingTime', 'samplingInterval_instructionsNum', 'delayCollectionTime', 'cpuToBeSamples',
            'samplingRange', 'symbolFilePath', 'c_source', 'kcore', 'filesize'
        ];
        const displayedElementList = [
            'samplingTime', 'cpuToBeSamples', 'samplingInterval_instructionsNum', 'samplingRange',
            'delayCollectionTime', 'symbolFilePath', 'c_source', 'filesize', 'kcore'
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
        this.form.samplingTime.tailPrompt = '(1~10)';
        this.form.samplingTime.customValidators = [
            TiValidators.minValue(1),
            TiValidators.maxValue(10),
        ];
        this.form.samplingInterval_instructionsNum.customValidators = [
            TiValidators.minValue(1024),
            TiValidators.maxValue(Math.pow(2, 32) - 1),
        ];
        this.form.filesize.customValidators = [
            TiValidators.minValue(1),
            TiValidators.maxValue(1024),
        ];
        this.form.symbolFilePath.customValidators = [
            customValidatorsService.checkFilePath()
        ];
        this.form.c_source.customValidators = [
            customValidatorsService.checkFilePath()
        ];
        this.form.cpuToBeSamples.customValidators = [
            customValidatorsService.checkSampCPUMask()
        ];

        // 修改采样范围的默认值
        this.form.samplingRange.list.forEach(option => {
            option.checked = option.value === 'user';
        });
        // 修改延迟采样时长
        this.form.delayCollectionTime.value = 0;
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
        this.form.delayCollectionTime.customValidators.push(TiValidators.minValue(0));
        // 接口映射
        this.interfaces = {
            taskname: {
                formKey: 'taskName',
            },
            'analysis-target': {
                formKeyList: ['analysisObject', 'analysisMode'],
                interFaceMapping: ({ operate, formControlValueList, setValue, params }) => {
                    const analysisObjectMapping = {
                        'Profile System': 'analysisObject_sys',
                        analysisObject_sys: 'Profile System',
                        analysisObject_app: 'analysisObject_app',
                    };
                    const analysisModeMapping = {
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
            process_name: {
                formKey: 'process_name',
            },
            pid: {
                formKey: 'pid',
            },
            'analysis-type': {
                formKey: 'memAnalysisMode',
                interFaceMapping: ({ operate, formControlValue, setValue, params }) => {
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
                interFaceMapping: ({ operate, formControlValue, setValue, params }) => {
                    const listMapping = {
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
            filesize: {
                formKey: 'filesize',
            },
            kcore: {
                formKey: 'kcore',
            },
        };

        // 参数配置建议
        this.paramsConfigSuggestions = i18n.falsesharing.paramsConfigSuggestions;
    }

    /**
     * 添加上表单没发送的值
     */
    public custemInterfaceValues({ values }) {
        values.analysisType = 'memAnalysis';
    }

    /**
     * 获取配置节点参数可配置的列表
     */
    public getNodeConfigKeys({ analysisObject, analysisMode }) {
        if (analysisObject === 'analysisObject_sys') {
            return ['cpuToBeSamples', 'symbolFilePath', 'c_source', 'filesize'];
        } else if (analysisObject === 'analysisObject_app') {
            if (analysisMode === 'app') {
                return ['application', 'applicationParams', 'switchState', 'user_name', 'password',
                    'cpuToBeSamples', 'symbolFilePath', 'c_source', 'filesize'];
            } else if (analysisMode === 'pid') {
                return ['process_name', 'pid', 'cpuToBeSamples', 'symbolFilePath', 'c_source', 'filesize'];
            }
        }
    }
}

export { FalseSharingForm };
