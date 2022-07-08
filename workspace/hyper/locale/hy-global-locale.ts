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

import { Cat } from '../util';
import { HyGlobalLocalRef } from './hy-global-locale-ref.interface';

export class HyGlobalLocale {
  static initWordsAndLocale<L extends string, W>(
    storeId: string,
    langWords: {
      [key in L]: W;
    },
    initLang: L
  ): HyGlobalLocalRef<L, W> {
    type LangWords = {
      [key in L]: W;
    };

    const GlobalLocale = class {
      setWords(words: LangWords): void {
        (window as any)['hyWords_' + storeId] = words;
      }

      getWords(): LangWords {
        return (window as any)['hyWords_' + storeId];
      }

      setLocale(locale: L): void {
        (window as any)['hyLocale_' + storeId] = locale;
      }

      getLocale(): L {
        return (window as any)['hyLocale_' + storeId];
      }

      getCurrWds = (): W | undefined => {
        return this.getWords()?.[this.getLocale()];
      }

      translate = (keyValue: string, params?: Array<any>): string => {
        const keyArr: Array<string> = keyValue.split('.');
        let value: any = this.getCurrWds();
        keyArr.forEach((key: string) => {
          value = value[key];
        });

        return HyGlobalLocale.formatEntry(value, params);
      }
    };

    const localEntity: HyGlobalLocalRef<L, W> = new GlobalLocale();

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
  static formatEntry(source: string, params: Array<any>): string {
    let formatSource: string = source;
    if (!Cat.isArr(params) || formatSource === '') {
      return formatSource;
    }
    params.forEach((param: any, i: number) => {
      formatSource = formatSource.replace(new RegExp(`\\{${i}\\}`, 'g'), () => {
        return param;
      });
    });

    return formatSource;
  }
}
