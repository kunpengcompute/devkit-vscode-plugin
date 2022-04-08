import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numFormat' })
export class NumFormat implements PipeTransform {
  transform(value: number, fix: number) {
    if (typeof value === 'number') {
      if (Number(value) === 0) { return 0; }
      return Number(value).toFixed(fix);
    } else {
      return value;
    }
  }
}
