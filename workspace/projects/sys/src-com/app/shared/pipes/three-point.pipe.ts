import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'threePoint' })
export class ThreePoint implements PipeTransform {
  transform(value: any, fix: number) {
    if (Array.isArray(value) && value.length === 1) {
      value = value[0];
    }
    if ((value && Number(value)) || Number(value) === 0) {
      if (Number(value) === 0) {
        return 0;
      }
      value = Number(value).toFixed(fix);
      const res = value.replace(/\d+/, (n: any) => {
        // 先提取整数部分
        return n.replace(/(\d)(?=(\d{3})+$)/g, ($1: any) => {
          return $1 + ',';
        });
      });
      return res;
    } else {
      if (typeof value === 'string') {
        const res = value.replace(/\d+/, (n) => {
          // 先提取整数部分
          return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
            return $1 + ',';
          });
        });
        return res;
      } else {
        return value;
      }
    }
  }
}
