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

import { SysLocaleWords } from './sys-locale-words.type';

export { i18nZH } from './i18n/ch-zn';
export { i18nUS } from './i18n/en-us';
export { SysLocaleLang } from './sys-locale-lang.enum';
export { SysLocaleWords };
export let I18n: SysLocaleWords = {} as any;
export let translate: (keyValue: string, params?: Array<any>) => string;

export const setI18n = (i18nLang: SysLocaleWords) => {
  I18n = i18nLang;
};

export const setTranslate = (trans: any) => {
  translate = trans;
};
