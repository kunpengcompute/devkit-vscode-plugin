import { Injectable } from '@angular/core';
import { i18n_US } from '../../i18n/en-us';
import { i18n_ZH } from '../../i18n/ch-zn';
import { LanguageType } from '../global/globalData';
import { LangType } from './interface/lang-type';
@Injectable({
  providedIn: 'root'
})
export class I18nService {

  public langType: LangType = {
    zh_cn: 'zh-cn',
    en_us: 'en-us'
  };
  public currLang: string;
  constructor() {
    this.currLang = sessionStorage.getItem('language');
  }

  I18n(): any {
    if (this.currLang) {
      return this.currLang === LanguageType.ZH_CN ? i18n_ZH : i18n_US;
    } else {
      return i18n_ZH;
    }
  }

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
