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

import { HyGlobalLocale } from './hy-global-locale';
import { HyLocaleWords } from './hy-locale-words.type';
import { HyLocaleLangs } from './hy-locale-langs.enum';

import { zh_CN } from './i18n/zh_CN';
import { en_US } from './i18n/en_US';

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
export class HyLocale {
  static readonly EN_US: HyLocaleLangs = HyLocaleLangs.EN_US;
  static readonly ZH_CN: HyLocaleLangs = HyLocaleLangs.ZH_CN;

  /**
   * Typescript没有静态代码段，所以这样代替静态代码段
   */
  protected static staticCode = HyGlobalLocale.initWordsAndLocale<
    HyLocaleLangs,
    HyLocaleWords
  >(
    'hyper',
    {
      'zh-CN': zh_CN,
      'en-US': en_US,
    },
    HyLocaleLangs.ZH_CN
  );

  static setWords = HyLocale.staticCode.setWords;

  static getWords = HyLocale.staticCode.getWords;

  static setLocale = HyLocale.staticCode.setLocale;

  static getLocale = HyLocale.staticCode.getLocale;

  static getCurrWds = HyLocale.staticCode.getCurrWds;

  static translate = HyLocale.staticCode.translate;
}
