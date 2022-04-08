import { Injectable } from '@angular/core';
import { i18nUS } from 'sys/locale/i18n/en-us';
import { i18nZH } from 'sys/locale/i18n/ch-zn';

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  public currLang: string;
  constructor() {
    this.currLang = sessionStorage.getItem('language');
  }
  I18n(): any {
    const lang: string = sessionStorage.getItem('language');
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
