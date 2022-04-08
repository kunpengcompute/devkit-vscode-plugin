/**
 * 添加千位分隔符
 * @param value （有符号）整形、（有符号）浮点型的数字字符（可以带单位），如：'123324', '123324.12312', '-123324','123324ms', ...
 */
export function setThousandSeparator(value: string | number): string {
    function numFormat(numStr: string): string {
        const res = numStr.replace(/\d+/, n => {
            return n.replace(/(\d)(?=(\d{3})+$)/g, $1 => {
                return $1 + ',';
            });
        });
        return res;
    }
    if (Array.isArray(value) && value.length === 1) {
        value = value[0];
    }
    if (typeof (value) === 'number' || typeof (value) === 'string') {
        return numFormat(value.toString());
    } else {
        return value;
    }
}
