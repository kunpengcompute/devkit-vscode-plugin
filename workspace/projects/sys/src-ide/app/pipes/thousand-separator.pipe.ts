import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'thousandSeparator',
})
export class ThousandSeparatorPipe implements PipeTransform {
    /**
     * 连续转换
     * @param value 被转换对象
     */
    transform(value: number | string): string {
        if (value === ''){ return '--'; }
        if (Array.isArray(value) && value.length === 1) {
            value = value[0];
        }
        if (+value === 0) { return '0'; }
        if (typeof value === 'number' || typeof value === 'string') {
            return this.numFormat(value.toString());
        } else {
            return value;
        }
    }

    /**
     * 插入千分隔符
     * @param numStr （有符号）整形、（有符号）浮点型的数字字符（可以带单位），如：'123324', '123324.12312', '-123324','123324ms', ...
     */
    private numFormat(numStr: string): string {
        const res = numStr.replace(/\d+/, (n) => {
            // 先提取整数部分
            return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
                return $1 + ',';
            });
        });
        return res;
    }
}
