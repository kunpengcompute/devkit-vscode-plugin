import { PartialObserver, Subject } from 'rxjs';

/**
 * 当前显示的优化建议
 */
export enum CurrOptimization {
  sysCoreDetail,
  sysTreeSug,
  processDetail,
  processTreeSug,
}

export type TuningHelperRightDetail<T> = {
  type: CurrOptimization,
  data: T
};

/**
 * 右侧显示内容显示通知服务
 */
export class TuningHelperRightService {

  private subject = new Subject<any>();

  constructor() {}

  /**
   * 通用获取消息
   */
  subscribe<T>(observer: PartialObserver<TuningHelperRightDetail<T>>) {
    return this.subject.subscribe(observer);
  }

  /**
   * 通用的发送消息
   */
  sendMessage<T>(detail: TuningHelperRightDetail<T>) {
    this.subject.next(detail);
  }

}
