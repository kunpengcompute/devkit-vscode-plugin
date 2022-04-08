import { Injectable } from '@angular/core';
import { TwoNumber } from '../reference';

@Injectable({
  providedIn: 'root'
})
export class ExtrapositionAxisService {
  constructor() { }

  /**
   * 计算并返回一段文本在dom中的宽度
   * @param text 文本
   * @param font 文本样式
   */
  public calculateTextWidth(text: string, font: { fontSize?: string, fontFamily?: string, }): number {
    const element = document.createElement('div');
    const textNode = document.createTextNode(text);

    element.appendChild(textNode);
    element.style.fontSize = font.fontSize || '14px';
    element.style.fontFamily = font.fontFamily || 'unset';
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.height = 'auto';
    element.style.left = '-999px';
    element.style.top = '-999px';

    document.body.appendChild(element);
    const textWidth = element.offsetWidth;
    element.parentNode.removeChild(element);
    return textWidth;
  }

  /**
   * 计算一组较优的tick列表
   * @param domain tick 数值的取值范围
   * @param limit tick 之间的参数的绝对值的范围
   */
  public calcOptimalTickList(domain: TwoNumber, limit: TwoNumber): number[] {
    const tickList: any = [];

    let stepLen;
    try {
      stepLen = this.getOptimalIntegral(limit);
    } catch (error) {
      console.error(error);
      return tickList;
    }

    // 计算一个能与 stepLen 的整数倍同步的数, 其总是大于domain[1]
    const rawOrigin = domain[0];
    const comOrigin = rawOrigin - (rawOrigin % stepLen) + stepLen;

    let tick = comOrigin;
    while (tick < domain[1]) {
      tickList.push(tick);
      tick += stepLen;
    }
    return tickList;
  }

  /**
   * @description 求取最大值和最小值之间的“整度”较高的“整值”。
   * @param limit 数值范围
   * @returns 数值范围之间的一个整值
   *
   * @throws The getOptimalIntegral function is running with error
   */
  private getOptimalIntegral(limit: TwoNumber): number {
    const minNum = Math.min(...limit);
    const maxNum = Math.max(...limit);

    const middle = (minNum + maxNum) / 2;

    let integralList: number[];
    try {
      integralList = this.calcIntegralList(middle);
    } catch (error) {
      console.error(error);
      throw Error('The getOptimalIntegral function is running with error');
    }

    const optInt: number | undefined = integralList.find(inte => {
      return inte >= minNum && inte <= maxNum;
    });

    return optInt == null ? middle : optInt;
  }

  /**
   * @description
   * 计算一个数值的周围的“整值”的有限分布。计算出的“整值”，其“整度”呈递减的趋势。
   * - 整值——期望的数值为整数时，其整数部分的最后几位尽可能为0，次之，最后一位为5。
   *   期望的数值有小数时，希望其小数位尽可能少，次之，小数的最后一位为5。
   * - 整度——整值的期望递减，整度递减。
   * - 整度最低——当整值与输入数值相等时。
   *
   * @param val 输入数值
   * @param DIVISOR
   * 取整因子——输入数值的乘以DIVISOR后，再取整，DIVISOR便为其因子，简成为： 输入数值的"取整因子"，默认值为：1000000。
   * 总是期望为10的n次方，且n >= 1（在必要条件下n可取整数, 且n !== 0）。
   *
   * @example
   * 1234————[2000, 1000, 1500, 1300, 1200, 1250, 1240, 1230, 1235, 1234]
   * 0.1234————[0.2, 0.1, 0.15, 0.13, 0.12, 0.125, 0.124, 0.123, 0.1235, 0.1234]
   *
   * @returns “整值”列表
   *
   * @usageNotes
   * 输入数值的整度最低的整值的取得与否，由取整因子决定。取整因子的位数越大，输入数值的整度最低的整值越有可能取得，反之。 FIXME 描述不清晰
   *
   * @throws Invalid argument
   */
  private calcIntegralList(val: number, DIVISOR: number = 1000000): number[] {
    if (DIVISOR === 0) {
      throw new Error('Invalid argument: DIVISOR is expected to be non-zero');
    }
    if (val * DIVISOR < 10) {
      throw new Error('Invalid argument: DIVISOR is too small');
    }

    const num = Math.round(val * DIVISOR);

    const len = num.toString().length;

    const comSet = new Set<number>();

    for (let i = len - 1; i > 0; i--) {
      const base = Math.pow(10, i);
      const ceil = Math.ceil(num / base) * base;
      const floor = Math.floor(num / base) * base;
      const average = Math.round((ceil + floor) / 2);

      const prevSize = comSet.size;
      comSet.add(ceil / DIVISOR)
        .add(floor / DIVISOR)
        .add(average / DIVISOR);
      if (comSet.size - prevSize < 1) { break; }
    }
    return Array.from(comSet);
  }
}
