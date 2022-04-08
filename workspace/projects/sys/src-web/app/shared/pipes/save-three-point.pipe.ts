import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'saveThreePoint'
})
export class SaveThreePointPipe implements PipeTransform {

  transform(value: any, fix: number): any {
    const arr = value.split(' ');
    if (arr[1] === 0) {
      return arr[0] + '(' + arr[1] + ')';
    } else if (arr[1].indexOf('.') === -1 || arr[1].split('.')[1].length <= 3) {
      return arr[0] + '(' + arr[1] + '%)';
    } else {
      return arr[0] + '(' + Number(arr[1]).toFixed(fix) + '%)';
    }
  }

}
