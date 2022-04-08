/**
 * 数组的flat方法
 * 因为ie那边不支持flat，flat的polyfill暂时不宜引入
 * 故在此自定义实现
 */
export function flat(arr: Array<any>): Array<any> {
  return arr.reduce(
    (acc, item) => acc.concat(
      Array.isArray(item) ? flat(item) : item
    ), []);
}
