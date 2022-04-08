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

import { HyGlobalLocale } from 'hyper';
import { SysLocaleWords } from './sys-locale-words.type';
import { SysLocaleLang } from './sys-locale-lang.enum';
import { setI18n, setTranslate } from './';

import { i18nZH } from './i18n/ch-zn';
import { i18nUS } from './i18n/en-us';

type SysLangWords = {
  [key in SysLocaleLang]: SysLocaleWords;
};

/**
 * 可通过在启动模块中通过配置具体的国际化语种的方式设置组件的国际化，使用方式如下：
 *
 *      export class AppModule {
 *
 *          constructor() {
 *              SysLocale.setLocale(SysLocale.EN_US);
 *          }
 *      }
 */
export class SysLocale {
  static readonly EN_US: SysLocaleLang = SysLocaleLang.EN_US;
  static readonly ZH_CN: SysLocaleLang = SysLocaleLang.ZH_CN;

  /**
   * Typescript没有静态代码段，所以这样代替静态代码段
   */
  protected static staticCode = (() => {
    const hyGlobalLocale = HyGlobalLocale.initWordsAndLocale<
      SysLocaleLang,
      SysLocaleWords
    >(
      'sys',
      {
        'zh-CN': i18nZH,
        'en-US': i18nUS as any,
      },
      SysLocaleLang.ZH_CN
    );
    setI18n(hyGlobalLocale.getCurrWds());
    setTranslate(hyGlobalLocale.translate);
    return hyGlobalLocale;
  })();

  static setWords(words: SysLangWords): void {
    SysLocale.staticCode.setWords(words);
  }

  static getWords(): SysLangWords {
    return SysLocale.staticCode.getWords();
  }

  static setLocale(locale: SysLocaleLang): void {
    SysLocale.staticCode.setLocale(locale);
    setI18n(SysLocale.getCurrWds());
  }

  static getLocale(): SysLocaleLang {
    return SysLocale.staticCode.getLocale();
  }

  static getCurrWds(): SysLocaleWords | undefined {
    return SysLocale.staticCode.getCurrWds();
  }

  static translate(keyValue: string, params?: Array<any>): string {
    return SysLocale.staticCode.translate(keyValue, params);
  }
}
