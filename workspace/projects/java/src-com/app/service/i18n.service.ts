import { Injectable } from '@angular/core';
import { i18nUS } from '../../i18n/en-us';
import { i18nZH } from '../../i18n/zh-cn';
@Injectable({
  providedIn: 'root'
})
export class I18nService {

  constructor() { }

  I18n(): any {
    const lang: string = sessionStorage.getItem('language');
    if (lang) {
      return lang === 'zh-cn' ? i18nZH : i18nUS;
    } else {
      return i18nZH;
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
  // 根据元素宽度判断是否溢出
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
  GetCurrentStrWidth(text: any, font: any) {
    const currentObj = $('<span>').hide().appendTo(document.body);
    $(currentObj).html(text).css('font', font);
    const width = currentObj.width();
    currentObj.remove();
    return width;
  }
}
