/**
 * 填充字符串的占位符
 * 例如：'{0}事件所占总事件比例为{1}%'.format(a, b) => a事件所占总事件比例为b%
 * @param targetString 要替换的字符串
 * @param actualContent 实际内容
 */
export function fillPlaceholder(targetString: string, ...actualContent: string[]) {
    for (let i = 0; i < actualContent.length; i++) {
        targetString = targetString.replace(new RegExp(`\\{${i}\\}`, 'g'), actualContent[i]);
    }
    return targetString;
}
