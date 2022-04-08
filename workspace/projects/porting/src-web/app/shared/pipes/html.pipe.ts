import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'html'
})
export class HtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(style: any) {
    // 对传入的 html 绕过安全检查
    return this.sanitizer.bypassSecurityTrustHtml(style);
  }
}
