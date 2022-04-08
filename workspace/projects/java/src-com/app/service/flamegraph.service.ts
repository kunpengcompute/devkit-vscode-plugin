import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class Flamegraph {

  /**
   * 获取火焰图类型
   * @param d 火焰图单条信息
   * @returns 返回libtype
   */
  public getLibtype(d: { data: { l: any; libtype: any; }; }) {
    return d.data.l || d.data.libtype;
  }
  /**
   * 获取火焰图名称
   * @param d 火焰图单条信息
   * @returns 返回name
   */
  public getName(d: { data: { n: any; name: any; }; }) {
    return d.data.n || d.data.name;
  }
  /**
   * 设置火焰图颜色
   * @param name 火焰图名称
   * @param libtype 火焰图类型
   * @returns 返回单条火焰图颜色值
   */
  public colorHash(name: any, libtype: any) {
    let r;
    let g;
    let b;
    r = 255;
    g = 120;
    b = 117;

    if (!(typeof libtype === 'undefined' || libtype === '')) {
      // red
      r = 255;
      g = 120;
      b = 117;
      if (libtype === 1) {
        // green
        r = 183;
        g = 235;
        b = 143;
      } else if (libtype === 2) {
        // orange
        r = 212;
        g = 177;
        b = 6;
      } else if (libtype === 3) {
        // blue
        r = 255;
        g = 192;
        b = 105;
      } else if (libtype === 4) {
        // yellow
        r = 135;
        g = 232;
        b = 222;
      }
    }

    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  public generateHash(name: any) {
    const MAX_CHAR = 6;

    let hash = 0;
    let maxHash = 0;
    let weight = 1;
    const mod = 10;

    if (name) {
      for (let i = 0; i < name.length; i++) {
        if (i > MAX_CHAR) { break; }
        hash += weight * (name.charCodeAt(i) % mod);
        maxHash += weight * (mod - 1);
        weight *= 0.70;
      }
      if (maxHash > 0) { hash = hash / maxHash; }
    }
    return hash;
  }
}
