export class BaseUtil {
  /**
   * 注意，基于JOSN.parse 和 JSON.stringify
   * @param obj 传参
   * @param replaceValue null 的替换值
   * @returns 传化后的原对象
   */
  static nullReplacer<T>(obj: T, replaceValue: any): T {
    const replacer = (key: any, value: any) => {
      if (value === null) {
        return replaceValue;
      }
      return value;
    };

    return JSON.parse(JSON.stringify(obj, replacer));
  }
}
