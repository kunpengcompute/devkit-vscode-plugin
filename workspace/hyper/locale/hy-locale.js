"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyLocale = void 0;
const hy_global_locale_1 = require("./hy-global-locale");
const hy_locale_langs_enum_1 = require("./hy-locale-langs.enum");
const zh_CN_1 = require("./i18n/zh_CN");
const en_US_1 = require("./i18n/en_US");
/**
 * 可通过在启动模块中通过配置具体的国际化语种的方式设置组件的国际化，使用方式如下：
 *
 *      import {HyLocale} from 'hyper';
 *
 *      export class AppModule {
 *
 *          constructor() {
 *              HyLocale.setLocale(HyLocale.EN_US);
 *          }
 *      }
 */
class HyLocale {
}
exports.HyLocale = HyLocale;
HyLocale.EN_US = hy_locale_langs_enum_1.HyLocaleLangs.EN_US;
HyLocale.ZH_CN = hy_locale_langs_enum_1.HyLocaleLangs.ZH_CN;
/**
 * Typescript没有静态代码段，所以这样代替静态代码段
 */
HyLocale.staticCode = hy_global_locale_1.HyGlobalLocale.initWordsAndLocale('hyper', {
    'zh-CN': zh_CN_1.zh_CN,
    'en-US': en_US_1.en_US,
}, hy_locale_langs_enum_1.HyLocaleLangs.ZH_CN);
HyLocale.setWords = HyLocale.staticCode.setWords;
HyLocale.getWords = HyLocale.staticCode.getWords;
HyLocale.setLocale = HyLocale.staticCode.setLocale;
HyLocale.getLocale = HyLocale.staticCode.getLocale;
HyLocale.getCurrWds = HyLocale.staticCode.getCurrWds;
HyLocale.translate = HyLocale.staticCode.translate;
//# sourceMappingURL=hy-locale.js.map