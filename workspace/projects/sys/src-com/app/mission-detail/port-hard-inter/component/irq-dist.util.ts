import { Cat } from 'hyper';
import { HardIrqAffinity } from '../component/domain';

export type TieCoreState = 0 | 1;

/**
 * 工具类
 */
export class IrqDistUtil {
  /**
   * 切分数组
   * @param list 数组
   * @param num 切分数
   * @returns 被切数组
   */
  static groupByNum(list: any[], num: number): any[][] {
    if (num < 1) {
      num = 1;
    }

    const newList = new Array(...list);
    const merageList = [];
    while (newList.length > 0) {
      merageList.push(newList.splice(0, num));
    }
    return merageList;
  }

  static getIrqList(mask: string, defaultLen: number = 0): TieCoreState[] {
    return !Cat.isStr(mask) || mask.trim() === '--'
      ? new Array(defaultLen).fill(0)
      : this.listIrqInfo(mask);
  }

  static createIrqList(
    irqCountList: number[],
    irqAffinityList: number[],
    xpsAffinityList: number[],
    rpsAffinityList: number[]
  ): HardIrqAffinity[] {
    const coreNum = irqCountList.length;

    return Array.from(new Array(coreNum).keys()).map((index: number) => {
      return {
        coreId: index,
        hardIrq: {
          affinity: irqAffinityList[index],
          irqCount: irqCountList[index],
          color: irqCountList[index] > 0 ? '#ed4b4b' : void 0,
        },
        xps: {
          affinity: xpsAffinityList[index],
          irqCount: 0,
        },
        rps: {
          affinity: rpsAffinityList[index],
          irqCount: 0,
        },
      };
    });
  }

  static reduceArray(left: number[], right: number[]) {
    if (left == null) {
      throw new Error('argument is null');
    }

    return left.map((num, index) => num + (right?.[index] ?? 0));
  }

  // 处理数据
  private static listIrqInfo(mask: string): TieCoreState[] {
    const boxInfo: TieCoreState[][] = [];
    const cpuInfo = mask.split(',');
    cpuInfo.forEach((item: string) => {
      const arr = (item + '').split('');
      let arr1: any[] = [];
      arr.forEach((num: string) => {
        const decimal = parseInt(num + '', 16);
        let binary = decimal
          .toString(2)
          .split('')
          .map((b: string) => parseInt(b, 2));
        // 补零
        switch (binary.length) {
          case 1:
            binary = [0, 0, 0].concat(binary);
            break;
          case 2:
            binary = [0, 0].concat(binary);
            break;
          case 3:
            binary = [0].concat(binary);
            break;
          default:
            break;
        }
        arr1 = arr1.concat(binary);
      });
      boxInfo.push(arr1.reverse());
    });
    return boxInfo.reverse().flat();
  }
}
