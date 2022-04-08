/**
 * myTip 提示的配置
 */
export interface MyTipOptions {

  /**
   * 提示类型: warn: 警告，success： 成功，error：错误，tip：提示，info：默认（用的是成功的图标）;
   */
  type: 'warn' | 'success' | 'error' | 'tip' | 'info';

  /**
   * 提示内容
   */
  content: string;

  /**
   * 提示显示延时, 单位为：ms, 一般会有默认值
   */
  time?: number;
}
