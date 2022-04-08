import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  /**
   * 点击下载链接下载
   * @param url 地址
   */
  downloadLink(url: string): void {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
