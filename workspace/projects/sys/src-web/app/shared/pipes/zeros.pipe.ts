import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zeros'
})
export class ZerosPipe implements PipeTransform {

  transform(value: number): string | number {
    let num: string | number = value + 1;
    if (num < 10) {
      num = '00' + num;
    } else if (num < 100) {
      num = '0' + num;
    } else {
      num = num;
    }
    return num;
  }

}
