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

// --- 分析类型表单【父级】 ---
import { AllParams } from '../AllParams';
import { BaseForm } from '../BaseForm';

class AnalysisTypeForm extends BaseForm {
    constructor() {
        super();

        const displayOrder = ['taskName', 'analysisObject', 'analysisMode', 'application', 'applicationParams',
            'switchState', 'user_name', 'password', 'process_name', 'pid', 'analysisType'];
        const displayedElementList = ['taskName', 'analysisObject', 'analysisType'];
        const switchingRulesForValueChanges = {
            // -- 系统流 --
            analysisObject_sys: { // 系统
                list: ['analysisType'],
            },

            // -- 应用流 --
            analysisObject_app: { // 应用
                list: ['analysisMode'],
            },
            // app
            app: {  // 应用-Launch Application
                parent: 'analysisObject_app',
                list: ['application', 'applicationParams', 'analysisType', 'switchState', 'user_name', 'password']
            },
            // pid
            pid: {  // 应用-Attach to Process
                parent: 'analysisObject_app',
                list: ['process_name', 'pid', 'analysisType']
            },
        };
        const allParamsClone = this.deepClone(new AllParams().allParams);

        this.displayOrder = displayOrder;
        this.displayedElementList = displayedElementList;
        this.switchingRulesForValueChanges = switchingRulesForValueChanges;
        this.displayOrder.forEach(key => {
            this.form[key] = allParamsClone[key];
        });
    }
}

export { AnalysisTypeForm };
