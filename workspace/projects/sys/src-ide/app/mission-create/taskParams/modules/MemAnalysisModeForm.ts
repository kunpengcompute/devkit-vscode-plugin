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

// --- 访存分析类型表单 ---
import { AllParams } from '../AllParams';
import { BaseForm } from '../BaseForm';
import { AnalysisTypeForm } from './AnalysisTypeForm';

class MemAnalysisModeForm extends BaseForm {
    constructor() {
        super();

        const allParamsClone = this.deepClone(new AllParams().allParams);

        const analysisTypeForm = new AnalysisTypeForm();

        const displayOrder = [
            ...analysisTypeForm.displayOrder,
            'memAnalysisMode',
        ];
        const displayedElementList = [...analysisTypeForm.displayedElementList, 'memAnalysisMode'];
        const switchingRulesForValueChanges = {
            memAnalysis: {
                list: ['memAnalysisMode'],
            },

            ...analysisTypeForm.switchingRulesForValueChanges,
        };

        this.displayOrder = displayOrder;
        this.displayedElementList = displayedElementList;
        this.switchingRulesForValueChanges = switchingRulesForValueChanges;
        this.form = {
            ...analysisTypeForm.form,
            memAnalysisMode: allParamsClone.memAnalysisMode,
        };
    }

    /**
     * 自定义 表单 的 change 事件
     */
    public customForm({ formEl }: { formEl: any }) {
        // 监听 analysisObject 的变化，访存分析类型的 list 需要根据此值动态变化
        formEl.formGroup.get('analysisObject').valueChanges.subscribe(val => {
            const memAnalysisMode = formEl.form.memAnalysisMode;

            memAnalysisMode.list = val === 'analysisObject_sys'
                ? memAnalysisMode.systemList : memAnalysisMode.applicationList;

            const checkedOption = memAnalysisMode.list.find(item => item.checked);
            formEl.formGroup.get('memAnalysisMode').setValue(checkedOption ? checkedOption.value : null);
        });
    }
}

export { MemAnalysisModeForm };
