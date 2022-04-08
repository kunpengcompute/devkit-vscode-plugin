import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  /**
   * 点击复制下载链接
   * @param url 链接地址
   */
  onCopyLink(url: string): void {
    const aInp: HTMLInputElement = document.createElement('input');
    aInp.style.opacity = '0';
    aInp.value = url;
    document.body.appendChild(aInp);
    aInp.select();
    document.execCommand('copy', false, null); // 执行浏览器复制命令
    document.body.removeChild(aInp);
  }
}
