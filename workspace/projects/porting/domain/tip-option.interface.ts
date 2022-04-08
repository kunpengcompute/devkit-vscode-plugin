/**
 * myTip 提示的配置
 */
export interface MyTipOptions {
  type: 'warn' | 'success' | 'error' | 'tip';
  content: string;
  time?: number;
}
