import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'padStart'
})
export class PadStartPipe implements PipeTransform {
    /**
     * 返回给定长度的字符串
     * @param value 源对象
     * @param targetLength 目标长度
     * @param padString 填充的字符串
     */
    transform(value: any, targetLength, padString): any {
        if (['number', 'string'].includes(typeof value)) {
            if (!String.prototype.padStart) {
                String.prototype.padStart = function padStart(targetlength, padstring) {
                    padstring = String((typeof padstring !== 'undefined' ? padstring : ' '));
                    if (this.length > targetlength) {
                        return this.toString();
                    } else {
                        targetlength = targetlength - this.length;
                        if (targetlength > padstring.length) {
                            padstring = padstring + padstring.repeat(targetlength / padstring.length);
                        }
                        return padstring.slice(0, targetlength) + String(this);
                    }
                };
            }
            return value.toString().padStart(targetLength, padString);
        } else {
            return value;
        }
    }

}
