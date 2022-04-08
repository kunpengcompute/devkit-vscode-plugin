import { Pipe, PipeTransform } from '@angular/core';
import * as Util from 'projects/sys/src-web/app/util';

@Pipe({
  name: 'padStart'
})
export class PadStartPipe implements PipeTransform {

  transform(
    value: number | string, targetLen: number, padStr: string
  ): string {
    return Util.padStart(value, targetLen, padStr);
  }
}
