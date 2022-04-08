import { Injectable } from '@angular/core';
import { i18nUS } from '../../i18n/en-us';
import { i18nZH } from '../../i18n/zh-cn';

@Injectable({
  providedIn: 'root'
})
export class CommonI18nService {

  constructor() { }

  /**
   * I18n
   */
  I18n(): any {
    const lang: string = sessionStorage.getItem('language') || (self as any).webviewSession.getItem('language');
    if (lang) {
      return lang === 'zh-cn' ? i18nZH : i18nUS;
    } else {
      return i18nZH;
    }
  }
  /**
   * I18nReplace
   * @param i18nText i18nText
   * @param contentObj contentObj
   */
  I18nReplace(i18nText: any, contentObj: any) {
    const matchedArr = i18nText.match(/\{\d+\}/g);
    let replaceStr = i18nText;
    if (matchedArr.length > 0) {
      const keys = Object.keys(contentObj);
      for (let i = 0; i < matchedArr.length; i++) {
        const value = contentObj[keys[i]];
        replaceStr = replaceStr.replace(/\{\d+\}/, value);
      }
    }
    return replaceStr;
  }
}
