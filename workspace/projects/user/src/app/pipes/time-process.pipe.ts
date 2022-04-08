import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeProcess'
})
export class TimeProcessPipe implements PipeTransform {

  transform(value: string): string {
    value = value.replace(/-/g, '/');
    return value;
  }

}
