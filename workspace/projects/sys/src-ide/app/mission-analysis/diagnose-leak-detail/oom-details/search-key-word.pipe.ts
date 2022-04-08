import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'searchKeyWord'
})
export class SearchKeyWordPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(val: string, keyword: string): any { // Angular 会调用它的 transform 方法，并把要绑定的值作为第一个参数传入，其它参数会依次从第二个参数的位置开始传入。
    const Reg = new RegExp(keyword);
    if (val) {
      const res = val.replace(Reg, `<a class="oomHighlightWord" style="color: #0067ff;">${keyword}</a>`); // 将匹配到的关键字替换
      return this.sanitizer.bypassSecurityTrustHtml(res);
    }
  }
}
