/**
 * 全局本地化引用
 */
export interface HyGlobalLocalRef<L extends string, W> {
  /**
   * Sets words
   * @param Words 全量的语言包，由语言名称：语言词条包组成。
   * @returns words
   */
  setWords(
    words: {
      [key in L]: W;
    }
  ): void;

  /**
   * Gets words
   * @returns words 全量的语言包，由语言名称：语言词条包组成。
   */
  getWords(): {
    [key in L]: W;
  };

  /**
   * 设置组件国际化语种
   * @param locale 国际化字符
   */
  setLocale(locale: L): void;

  /**
   * 设置组件国际化语种
   * @returns 国际化字符
   */
  getLocale(): L;

  /**
   * @ignore
   * 获取当前语言下，组件国际化语种对应的词条集合
   */
  getCurrWds(): W | undefined;

  /**
   * 获取单个词条的国际化文本/对象
   * @param keyValue 词条的定位属性
   * @param params 词条参数
   */
  translate(keyValue: string, params?: Array<any>): string;
}
