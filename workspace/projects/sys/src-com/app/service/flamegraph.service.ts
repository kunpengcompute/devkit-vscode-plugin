
export class FlamegraphService {
  private chart: any;
  private maxDelta = 0;

  constructor(chart: any, sourceData: any){
    this.chart = chart;
    this.getMaxDelta([sourceData]);
  }

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
   * 获取火焰图数值
   * @param d 火焰图单条信息
   * @returns 返回delta
   */
  public getDelta(d: any) {
    if ('d' in d.data) {
      return d.data.d;
    } else {
      return d.data.delta;
    }
  }
  /**
   * 设置火焰图颜色
   * @param name 火焰图名称
   * @param libtype 火焰图类型
   * @param delta 火焰图数值
   * @returns 返回单条火焰图颜色值
   */
  public colorHash(d: any) {
    let name = this.getName(d);
    const libtype = this.getLibtype(d);
    let delta = this.getDelta(d);
    const elided = this.chart.elided;

    let r;
    let g;
    let b;

    if (this.chart.differential) {
      r = 220;
      g = 220;
      b = 220;

      if (!delta) {
        delta = 0;
      }

      if (delta > 0) {
        b = Math.round(210 * (this.maxDelta - delta) / this.maxDelta);
        g = b;
      } else if (delta < 0) {
        r = Math.round(210 * (this.maxDelta + delta) / this.maxDelta);
        g = r;
      }
    } else {
      let typeColor = elided ? 'cold' : 'warm';

      if (!elided && !(typeof libtype === 'undefined' || libtype === '')) {
        typeColor = 'red';
        if (typeof name !== 'undefined' && name && name.match(/::/)) {
          typeColor = 'yellow';
        }
        if (libtype === 'kernel') {
          typeColor = 'orange';
        } else if (libtype === 'jit') {
          typeColor = 'green';
        } else if (libtype === 'inlined') {
          typeColor = 'aqua';
        }
      }

      let vectorVal = 0;
      if (name) {
        const nameArray = name.split('`');
        if (nameArray.length > 1) {
          name = nameArray[nameArray.length - 1];
        }
        name = name.split('(')[0];
        vectorVal = this.generateHash(name);
      }
      if (typeColor === 'red') {
        r = 200 + Math.round(55 * vectorVal);
        g = 50 + Math.round(80 * vectorVal);
        b = g;
      } else if (typeColor === 'orange') {
        r = 190 + Math.round(65 * vectorVal);
        g = 90 + Math.round(65 * vectorVal);
        b = 0;
      } else if (typeColor === 'yellow') {
        r = 175 + Math.round(55 * vectorVal);
        g = r;
        b = 50 + Math.round(20 * vectorVal);
      } else if (typeColor === 'green') {
        r = 50 + Math.round(60 * vectorVal);
        g = 200 + Math.round(55 * vectorVal);
        b = r;
      } else if (typeColor === 'aqua') {
        r = 50 + Math.round(60 * vectorVal);
        g = 165 + Math.round(55 * vectorVal);
        b = g;
      } else if (typeColor === 'cold') {
        r = 0 + Math.round(55 * (1 - vectorVal));
        g = 0 + Math.round(230 * (1 - vectorVal));
        b = 200 + Math.round(55 * vectorVal);
      } else {
        r = 200 + Math.round(55 * vectorVal);
        g = 0 + Math.round(230 * (1 - vectorVal));
        b = 0 + Math.round(55 * (1 - vectorVal));
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

  /**
   * 计算最大子代等级
   * @param data 原始数据
   * @param depth 初始等级
   */
   public getMaxDelta(data: any) {
    for (const node of data) {
      const delta = Math.abs(node.delta);
      if (this.maxDelta < delta) {
        this.maxDelta = delta;
      }
      if (node.hasOwnProperty('children') && node.children.length) {
        this.getMaxDelta(node.children);
      }
    }
  }
}
