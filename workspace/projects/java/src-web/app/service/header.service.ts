import { Injectable } from '@angular/core';
import { PartialObserver, Subject } from 'rxjs';

export type HeaderMsgDetail<T> = {
  cmd: string,
  data?: T
};

/**
 * 内容组件中通知头部操作的服务
 */
@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private subject = new Subject<any>();

  private constructor() {}

  /**
   * 订阅消息
   */
  public subscribe<T>(observer: PartialObserver<HeaderMsgDetail<T>>) {
    return this.subject.subscribe(observer);
  }

  /**
   * 发送消息
   */
  public sendMessage<T>(detail: HeaderMsgDetail<T>) {
    this.subject.next(detail);
  }

}
