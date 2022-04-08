import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
import { HyIconLibServiceModule } from './hy-icon-lib.service.module';

@Injectable({
  providedIn: HyIconLibServiceModule
})
export class HySvgTransformService {

  constructor(
    @Optional() @Inject(DOCUMENT) private document: any,
  ) { }

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
