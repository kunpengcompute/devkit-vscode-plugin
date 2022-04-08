import { Pipe, PipeTransform } from '@angular/core';
import { setThouSeparator } from '../../util';

@Pipe({
  name: 'hyThouSeparator'
})
export class HyThouSeparatorPipe implements PipeTransform {

  transform(value: number | string): string {
    return setThouSeparator(value);
  }
}
