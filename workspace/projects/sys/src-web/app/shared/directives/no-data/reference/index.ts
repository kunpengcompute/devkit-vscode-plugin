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

/**
 * NoData 配置
 * - width: 图片的宽度，单位为px、%、vw 等；可选；默认为：198px。
 * - height: 图片的高度，单位为px、%、vh 等；可选；默认为空。
 * - text: 描述文字；可选；默认为： 无数据（zh）、 No Data(en)。
 */
export interface NoDataOption {
    width?: string;
    height?: string;
    text?: string;
}
