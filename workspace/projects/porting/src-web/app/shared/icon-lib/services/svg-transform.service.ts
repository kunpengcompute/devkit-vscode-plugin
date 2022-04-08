import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
const hardUrl: any = require('../../../../assets/hard-coding/url.json');

@Injectable({
  providedIn: 'root'
})
export class SvgTransformService {

  constructor(
    @Optional() @Inject(DOCUMENT) private document: any,
  ) { }

  /**
   * 将SVG脚本字符串转换成SVG元素
   * @param svgStr SVG脚本字符串
   * @returns SVG元素
   */
  getSvgBySvgStr(svgStr: string): Element {
    const div: Element = this.document.createElement('DIV');
    div.innerHTML = svgStr;
    return div.querySelector('svg')
      || this.document.createElementNS(hardUrl.svgAddress, 'path');
  }

  /**
   * 将SVG脚本字符串转换成IMG元素
   * @param svgStr SVG脚本字符串
   * @returns SVG元素
   */
  getImgBySvgStr(svgStr: string): Element {
    const img: any = this.document.createElement('IMG');
    const svg64 = btoa(unescape(encodeURIComponent(svgStr.trim())));
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;
    img.src = image64;
    // 禁用拖拽
    img.ondragstart = () => {
      return false;
    };
    return img;
  }
}
