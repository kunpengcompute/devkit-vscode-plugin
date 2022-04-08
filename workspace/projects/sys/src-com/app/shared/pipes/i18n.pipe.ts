import { Pipe, PipeTransform } from '@angular/core';
import { SysLocale } from 'sys/locale/sys-locale';

@Pipe({
  name: 'i18n',
})
export class I18nPipe implements PipeTransform {
  transform(keyValue: string, ...params: any): string {
    return SysLocale.translate(keyValue, params);
  }
}
