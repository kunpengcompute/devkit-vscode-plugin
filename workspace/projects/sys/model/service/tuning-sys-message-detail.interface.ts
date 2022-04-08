import { TuningSysMessageType } from '.';

/** com - sys消息详情 */
export interface TuningSysMessageDetail<T> {
  type: TuningSysMessageType;  // 消息类型
  data: T;  // 详细数据
}
