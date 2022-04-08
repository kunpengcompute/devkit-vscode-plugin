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

import { SvgElementInfo } from './svg-element-info';
import { ElementRef } from '@angular/core';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';

export class PanoramaAnalysisSvgElementInfo extends SvgElementInfo {
    public fenceSelection: JQuery; // “围栏”选择器
    public fenceId: string;
    public textSelection: JQuery; // 文字（描述）选择器
    public textId: string;
    public pcieSelection: JQuery; // 总线（连线）选择器
    public pcieId: string;

    constructor() {
        super();
        this.fenceId = Utils.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
        this.textId = Utils.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
        this.pcieId = Utils.generateConversationId(SvgElementInfo.RADOM_ID_LEN);
    }

    /**
     * 通过ID选择
     * @param el 数据
     */
    public initSelectionById(el: ElementRef) {
        super.initSelectionById(el);
        this.fenceSelection = $(el.nativeElement.querySelector('#' + this.fenceId));
        this.textSelection = $(el.nativeElement.querySelector('#' + this.textId));
        this.pcieSelection = $(el.nativeElement.querySelector('#' + this.pcieId));
    }
}
