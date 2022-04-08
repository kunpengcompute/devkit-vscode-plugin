
/**
 * 通过向头部补充字符，使得字符串达到预期长度
 *
 * @param value 需要补齐的字符串
 * @param targetLen 希望的补齐的后的长度
 * @param padStr 用于补齐的字符或字符串
 * @returns 目标字符串
 *
 * @example
 * - padStart('xxx', 2) ---> 'xxx'; // value的长度 大于 targetLen，返回原值
 * - padStart('xxx', 5) ---> '  xxx'; // 默认使用 ' ' 来填充
 * - padStart('xxx', 5, 'o') ---> 'ooxxx'
 */
export function padStart(
    value: number | string, targetLen: number, padStr = ' '
): string {

    // 值预处理
    value = value.toString();
    targetLen = +targetLen || 0;
    padStr = padStr?.toString() || ' '; // 防止 '' 的情况

    if (value.length >= targetLen) {
        return value;
    }

    const padLen = targetLen - value.length;
    const padStrRep = padStr.repeat(Math.ceil(padLen / padStr.length));

    return padStrRep.slice(0, padLen) + value;
}
