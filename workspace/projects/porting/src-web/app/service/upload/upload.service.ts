import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() { }

  /**
   * 判断上传的软件包中是否有 aarch64 与 arm64
   * @param fileName 文件名
   */
  isIncludeAarch64(fileName: string | Array<object>): boolean | void {
    const reg = /(aarch64)|(arm64)/ig;
    if (typeof(fileName) === 'string') {
      return reg.test(fileName);
    }
  }
}
