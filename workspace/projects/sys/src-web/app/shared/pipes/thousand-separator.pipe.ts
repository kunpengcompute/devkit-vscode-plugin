import { Pipe, PipeTransform } from '@angular/core';
import * as Util from 'projects/sys/src-web/app/util';

@Pipe({
  name: 'thousandSeparator'
})
export class ThousandSeparatorPipe implements PipeTransform {

  transform(value: number | string): string {
    if (value === ''){ return '--'; }
    return Util.fixThouSeparator(value);
  }
}
