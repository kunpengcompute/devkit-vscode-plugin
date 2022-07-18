export class Color {

  private static hexReg = /^\#?[0-9a-zA-F]{6}$/;

  private constructor() { }

  /**
   * 得到hex颜色值为color的加深颜色值，level为加深的程度，限0-1之间
   * @param hex Hex 颜色值
   * @param level 深化程度
   * @returns Hex 颜色值
   */
  static darken(hex: string, level: number = 0): string {

    if (!Color.hexReg.test(hex)) {
      throw new Error('输入错误的hex颜色值');
    }

    const rgbc = Color.hexToRgb(hex);
    const darker = rgbc.map(item => Math.floor(item * (1 - level)));
    return Color.rgbToHex(darker);
  }

  /**
   * 得到hex颜色值为color的减淡颜色值，level为加深的程度，限0-1之间
   * @param hex Hex 颜色值
   * @param level 浅化程度
   * @returns Hex 颜色值
   */
  static lighten(hex: string, level: number = 0): string {

    if (!Color.hexReg.test(hex)) {
      throw new Error('输入错误的hex颜色值');
    }

    const rgbc = Color.hexToRgb(hex);
    const lighter = rgbc.map(item => Math.floor((255 - item) * level + item));
    return Color.rgbToHex(lighter);
  }

  /**
   * hex颜色转rgb颜色
   * @param hex Hex颜色值
   * @returns rgb 颜色值
   */
  private static hexToRgb(hex: string): number[] {

    hex = hex.replace('#', '');
    return hex.match(/../g).map(item => parseInt(item, 16));
  }

  /**
   * RGB颜色转Hex颜色
   * @param rgb 十进制
   * @returns Hex 颜色值
   */
  private static rgbToHex(rgb: number[]): string {

    const hexs = rgb.map(item => {
      const str = item.toString(16);
      return str.length === 1 ? '0' + str : str;
    });
    return '#' + hexs.join('');
  }
}
