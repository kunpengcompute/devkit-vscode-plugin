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

import { I18n } from 'sys/locale';

/**
 * 根据value特定数据结构返回符合ucd显示的文字
 *
 * @param value [string | number, string | number, boolean]
 * @returns ex: `相同，128` or `2600MHz ｜ 2200MHZ`
 */
export function getCompareValue(value: Array<string | number | boolean>) {
  return value[2] ?
    `${I18n.tuninghelper.compare.same}，${getRealValue(value[0])}`
    : `${getRealValue(value[0])} ｜ ${getRealValue(value[1])}`;
}

function getRealValue(value: any) {
  // undefined ->  '--'  '' -> '--'  0 -> 0
  if (value !== undefined && value !== '') {
    return value;
  } else {
    return '--';
  }
}
