import { Pipe, PipeTransform } from '@angular/core';
import { HyLocale } from './hy-locale';

/**
 * @ignore
 */
@Pipe({
  name: 'hyTranslate'
})
export class HyTranslatePipe implements PipeTransform {
  transform(keyValue: string, params?: Array<any>): string {
    return HyLocale.translate(keyValue, params);
  }
}
