import { Injectable } from '@angular/core';
import { i18nUS } from 'projects/sys/src-ide/i18n/en-us';
import { i18nZH } from 'projects/sys/src-ide/i18n/zh-cn';

/**
 * 支持的国际化种类
 */
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

    constructor() { }

    /** vscode判断界面语言类型的公共方法
     * 当界面语言为英文时，返回LANGUAGE_TYPE.EN
     * 当界面语言为非英文时，返回LANGUAGE_TYPE.ZH
     * 默认返回LANGUAGE_TYPE.ZH
     */
    public static getLang() {
        const language: string = self.webviewSession.getItem('language');
        if (language) {
            return language.indexOf('en') !== -1 ? LANGUAGE_TYPE.EN : LANGUAGE_TYPE.ZH;
        } else {
            return LANGUAGE_TYPE.ZH;
        }
    }

    /**
     * I18n获取当前语言模板
     */
    I18n(): any {
        const lang: string = self.webviewSession.getItem('language');
        if (lang) {
            return lang === 'zh-cn' ? i18nZH : i18nUS;
        } else {
            return i18nZH;
        }
    }

    /**
     * 国际化占位符替换
     * @param i18nText 需要替换的本文
     * @param contentObj 替换的内容
     */
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
