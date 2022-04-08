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

import * as vscode from 'vscode';
import { I18N_ZH } from './i18n/zh-cn';
import { I18N_EN } from './i18n/en-us';

/**
 * 语言类型
 */
export const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

export class I18nService {

    constructor() { }

    /** vscode判断界面语言类型的公共方法
     * 当界面语言为英文时，返回LANGUAGE_TYPE.EN
     * 当界面语言为非英文时，返回LANGUAGE_TYPE.ZH
     * 默认返回LANGUAGE_TYPE.ZH
     */
    public static getLang() {
        const language: string = vscode.env.language;
        if (language) {
            return language.indexOf('en') !== -1 ? LANGUAGE_TYPE.EN : LANGUAGE_TYPE.ZH;
        } else {
            return LANGUAGE_TYPE.ZH;
        }
    }

    /** 获取i18n资源文件的公共方法
     * 当界面语言为英文时，返回英文资源文件
     * 当界面语言为非英文时，返回中文资源文件
     * 默认返回中文资源文件
     */
    public static I18n() {
        const i18n: any = vscode.env.language;
        if (i18n) {
            return i18n.indexOf('en') !== -1 ? I18N_EN : I18N_ZH;
        } else {
            return I18N_ZH;
        }
    }

    /** 替换i18n资源文件中{}的公共方法
     * @param i18nText 原始i18n资源文件内容
     * @param contentObj 将i18n资源文件中{}的内容替换为contentObj中的内容
     * @return 返回替换了{}之后的i18n资源文件
     */
    public static I18nReplace(i18nText: any, contentObj: any) {
        const matchedArr = i18nText.match(/\{\d+\}/g);
        let replaceStr = i18nText;
        if (matchedArr && matchedArr.length > 0) {
            const keys = Object.keys(contentObj);
            for (let i = 0; i < matchedArr.length; i++) {
                const value = contentObj[keys[i]];
                replaceStr = replaceStr.replace(/\{\d+\}/, value);
            }
        }
        return replaceStr;
    }
}
