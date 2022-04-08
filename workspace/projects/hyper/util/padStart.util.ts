/**
 * 通过向头部补充字符，使得字符串达到预期长度
 *
 * @param value 需要补齐的字符串
 * @param targetLen 希望的补齐的后的长度
 * @param padStr 用于补齐的字符或字符串, 默认为一个空格：' '
 * @returns 目标字符串
 *
 * @example
 * - padStart('xxx', 2) === 'xxx'; // value的长度 大于 targetLen，返回原值
 * - padStart('xxx', 5) === '  xxx'; // 默认使用 ' ' 来填充
 * - padStart('xxx', 5, 'o') === 'ooxxx'
 */
export function padStart(
    value: number | string, targetLen: number, padStr = ' '
): string {

    // 值预处理
    const val = value.toString();
    const tagLen = +targetLen || 0;
    const pad = padStr?.toString() || ' '; // 防止 '' 的情况

    if (val.length >= tagLen) {
        return val;
    }

    const padLen = tagLen - val.length;
    const padStrRep = pad.repeat(Math.ceil(padLen / pad.length));

    return padStrRep.slice(0, padLen) + val;
}
