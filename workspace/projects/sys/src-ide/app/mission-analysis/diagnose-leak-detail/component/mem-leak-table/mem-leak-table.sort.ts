export class MemLeakSizeSort {
  // 内存泄露大小排序
  static memLeakSizeCompareFn(a: any, b: any, predicate: string): number {
    const getNum = (obj: any, key: string) => {
      if (obj[key].includes('GB')) {
        return parseFloat(obj[key]) * 1024;
      } else if (obj[key].includes('MB')) {
        return parseFloat(obj[key]) * 1024;
      } else if (obj[key].includes('KB')) {
        return parseFloat(obj[key]) * 1024;
      } else {
        return parseFloat(obj[key]);
      }
    };
    const aNum: number = getNum(a, predicate);
    const bNum: number = getNum(b, predicate);

    return aNum - bNum;
  }
}
