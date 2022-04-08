/**
 * 计算并返回一段文本在dom中的宽度
 * @param text 文本
 * @param font 文本样式
 */
export function calcTextWidth(
  text: string, font: {
    fontSize?: string, fontFamily?: string,
  }): number {

  const element = document.createElement('div');
  const textNode = document.createTextNode(text);

  element.appendChild(textNode);
  element.style.fontSize = font.fontSize || '14px';
  element.style.fontFamily = font.fontFamily || 'unset';
  element.style.position = 'absolute';
  element.style.visibility = 'hidden';
  element.style.height = 'auto';
  element.style.left = '-999px';
  element.style.top = '-999px';

  document.body.appendChild(element);
  const textWidth = element.offsetWidth;
  element.parentNode.removeChild(element);

  return textWidth;
}
