/**
 * 添加千位分隔符
 * @param value （有符号）整形、（有符号）浮点型的数字字符（可以带单位）
 * @example
 * - setThouSeparator(123324) === '123,324'
 * - setThouSeparator(123324.12312) === '123,324.12312'
 * - setThouSeparator(-123324) === '-123,324'
 * - setThouSeparator('123324ms') === '123,324ms'
 */
export function setThouSeparator(value: string | number): string {
    const numFormat = (numStr: string): string => {
        const res = numStr.replace(/\d+/, (n) => { // 先提取整数部分
            return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
                return $1 + ',';
            });
        });
        return res;
    };
    if (Array.isArray(value) && value.length === 1) {
        value = value[0];
    }
    if (typeof (value) === 'number' || typeof (value) === 'string') {
        return numFormat(value.toString());
    } else {
        return value;
    }
}
