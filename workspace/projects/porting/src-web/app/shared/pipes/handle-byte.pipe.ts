import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'handleByte'
})
export class HandleBytePipe implements PipeTransform {
  // 对字节大小 进行处理
  transform(value: number): string {
    const sizeMB = value / 1024 / 1024;
    const sizeGB = sizeMB / 1024;
    if (sizeGB >= 1) {
      return sizeGB.toFixed(0) + 'GB';
    } else if (sizeMB >= 1) {
      return sizeMB.toFixed(0) + 'MB';
    } else {
      return (value / 1024).toFixed(0) + 'KB';
    }
  }
}
