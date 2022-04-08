import { Pipe, PipeTransform } from '@angular/core';
import { padStart } from '../../util';

@Pipe({
  name: 'hyPadStart'
})
export class HyPadStartPipe implements PipeTransform {

  transform(
    value: number | string, targetLen: number, padStr: string
  ): string {
    return padStart(value, targetLen, padStr);
  }
}
