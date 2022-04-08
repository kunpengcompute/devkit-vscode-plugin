import { Injectable } from '@angular/core';
import { i18nUS } from 'projects/user/src/i18n/en-us';
import { i18nZH } from 'projects/user/src/i18n/ch-zn';
@Injectable({
  providedIn: 'root'
})
export class I18nService {

  constructor() { }

  I18n(): any {
    const lang: string =  sessionStorage.getItem('language');
    if (lang) {
      return lang === 'zh-cn' ?  i18nZH : i18nUS;
    } else {
      return i18nZH;
    }
  }
}
