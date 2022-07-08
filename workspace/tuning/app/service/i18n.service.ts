import { Injectable } from '@angular/core';
import { I18N_US } from '../../i18n/en-us';
import { I18N_ZH } from '../../i18n/zh-cn';


export const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

@Injectable({
    providedIn: 'root'
})
export class I18nService {

    public langType = {
        zh_cn: 'zh-cn',
        en: 'en'
    };
    public currLang: string;

    constructor() {
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
    }

    /** vscode判断界面语言类型的公共方法
     * 当界面语言为英文时，返回LANGUAGE_TYPE.EN
     * 当界面语言为非英文时，返回LANGUAGE_TYPE.ZH
     * 默认返回LANGUAGE_TYPE.ZH
     */
    public static getLang() {
        const language: string = ((self as any).webviewSession || {}).getItem('language');
        if (language) {
            return language.indexOf('en') !== -1 ? LANGUAGE_TYPE.EN : LANGUAGE_TYPE.ZH;
        } else {
            return LANGUAGE_TYPE.ZH;
        }
    }

    I18n(): any {
        const lang: string = ((self as any).webviewSession || {}).getItem('language');
        if (lang) {
            return lang.indexOf('en') !== -1 ? I18N_US : I18N_ZH;
        } else {
            return I18N_ZH;
        }
    }


    I18nReplace(i18nText: string, contentObj: any) {
        const matchedArr = i18nText.match(/\{\d+\}/g);
        let replaceStr = i18nText;
        if (matchedArr && matchedArr.length > 0) {
            const keys = Object.keys(contentObj || []);
            let i = 0;
            const len = Math.min(matchedArr.length, keys.length);
            while (i < len) {
                replaceStr = replaceStr.replace(/\{\d+\}/, contentObj[keys[i++]]);
            }
        }
        return replaceStr;
    }
}
