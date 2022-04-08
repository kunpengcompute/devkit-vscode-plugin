import { Injectable } from '@angular/core';
import { i18nUS } from '../../i18n/en-us';
import { i18nZH } from '../../i18n/zh-cn';
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
        const language: string = ((self as any).webviewSession || {}).getItem('language');
        if (language) {
            return language.indexOf('en') !== -1 ? LANGUAGE_TYPE.EN : LANGUAGE_TYPE.ZH;
        } else {
            return LANGUAGE_TYPE.ZH;
        }
    }

  /**
   * I18n
   */
  I18n(): any {
    const lang: string = (self as any).webviewSession.getItem('language');
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
  /**
   * 根据元素宽度判断是否溢出
   * @param $element element
   * @param width width
   */
  isEleTextOverflow($element: any, width?: any) {
    if (!$element || $element.length < 1) {
      return false;
    }
    const $tempNode = $element.clone();
    $tempNode.css({
      overflow: 'visible',
      position: 'absolute',
      visibility: 'hidden',
      'max-width': 'none',
      width: 'auto'
    });
    $('body').append($tempNode);
    const tempNodeWidth = $tempNode.width();
    $tempNode.remove();
    if (width) {
      return tempNodeWidth > width;
    }
    return tempNodeWidth > $element.width();
  }
}
