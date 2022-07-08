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
exports.HyGlobalLocale = void 0;
const util_1 = require("../util");
class HyGlobalLocale {
    static initWordsAndLocale(storeId, langWords, initLang) {
        const GlobalLocale = class {
            constructor() {
                this.getCurrWds = () => {
                    return this.getWords()?.[this.getLocale()];
                };
                this.translate = (keyValue, params) => {
                    const keyArr = keyValue.split('.');
                    let value = this.getCurrWds();
                    keyArr.forEach((key) => {
                        value = value[key];
                    });
                    return HyGlobalLocale.formatEntry(value, params);
                };
            }
            setWords(words) {
                window['hyWords_' + storeId] = words;
            }
            getWords() {
                return window['hyWords_' + storeId];
            }
            setLocale(locale) {
                window['hyLocale_' + storeId] = locale;
            }
            getLocale() {
                return window['hyLocale_' + storeId];
            }
        };
        const localEntity = new GlobalLocale();
        if (!localEntity.getWords()) {
            // 默认所有语言都打包进来
            localEntity.setWords(langWords);
        }
        if (!localEntity.getLocale()) {
            localEntity.setLocale(initLang);
        }
        return localEntity;
    }
    /**
     * 使用固定参数值格式化填充字串
     * @param source 源字串,其中使用{N}代表需要匹配的参数次序,N从0开始
     * @param params Array 参数数组
     */
    static formatEntry(source, params) {
        let formatSource = source;
        if (!util_1.Cat.isArr(params) || formatSource === '') {
            return formatSource;
        }
        params.forEach((param, i) => {
            formatSource = formatSource.replace(new RegExp(`\\{${i}\\}`, 'g'), () => {
                return param;
            });
        });
        return formatSource;
    }
}
exports.HyGlobalLocale = HyGlobalLocale;
//# sourceMappingURL=hy-global-locale.js.map