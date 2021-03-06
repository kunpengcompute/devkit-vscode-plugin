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
 * 图形输入数据接口
 */
export interface NormalizeBlockData {
    time: string | number[];
    dev: string | number[];
    title: string | number[];
    data: { [key: string]: number[] };
}


/**
 * 感兴趣的色块的数据
 */
export interface POIBlockData {
    domRect: DOMRectReadOnly;
    data: {
      key: string,
      percent: number,
      value: number,
      time: number | string,
    };
}
