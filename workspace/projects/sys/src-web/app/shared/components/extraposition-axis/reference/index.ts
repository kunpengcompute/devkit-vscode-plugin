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

export type TwoNumber = [number, number]; // 双数值类型

export type HotPercentDomain = [number, number]; // “热点区域” 的百分比范围

export type TickList = Array<number | string>; // 刻度列表

export type TickDomain = [number, number]; // 总的数值范围

export type Format = (d: number | string) => string; // 刻度值的格式化函数

export interface TicksAxisOption<T extends TickList | TickDomain> {
    tickData: T;
    format?: Format;
}

export interface ExtrapositionAxisOption<T extends TickList | TickDomain> {
    tickData: T;
    format?: Format;
    initHotDomain?: HotPercentDomain; // 初始的“热点区域”范围
}

