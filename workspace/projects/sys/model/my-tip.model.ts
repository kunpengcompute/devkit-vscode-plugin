import { MyTipOptions } from './domain';

type MyTipContent = MyTipOptions['content'];
type MyTipDelayTime = MyTipOptions['time'];

/**
 * tip 公共接口
 */
export abstract class MyTip {

  /**
   * MyTip 原始方法
   * @param options MyTip 配置
   */
  abstract alertInfo(options: MyTipOptions): void;

  /**
   * 警告
   * @param content MyTip 内容
   * @param time 延时
   */
  abstract warn(content: MyTipContent, time?: MyTipDelayTime): void;

  /**
   * 成功
   * @param content MyTip 内容
   * @param time 延时
   */
  abstract success(content: MyTipContent, time?: MyTipDelayTime): void;

  /**
   * 错误
   * @param content MyTip 内容
   * @param time 延时
   */
  abstract error(content: MyTipContent, time?: MyTipDelayTime): void;

  /**
   * 提示
   * @param content MyTip 内容
   * @param time 延时
   */
  abstract tip(content: MyTipContent, time?: MyTipDelayTime): void;
}
