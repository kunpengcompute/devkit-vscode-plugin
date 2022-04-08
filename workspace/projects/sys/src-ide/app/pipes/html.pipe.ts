import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'html'
})
export class HtmlPipe implements PipeTransform {
    constructor(private san: DomSanitizer) { }
    /**
     * transform
     * @param style style
     */
    transform(style) {
        return this.san.bypassSecurityTrustHtml(style);
    }
}
