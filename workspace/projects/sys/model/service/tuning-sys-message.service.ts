import { Injectable } from '@angular/core';
import { Observable, PartialObserver, Subject } from 'rxjs';
import { TuningSysMessageDetail } from '.';

@Injectable({
  providedIn: 'root'
})
export class TuningSysMessageService {

  /** 当前active页签信息 */
  public currActiveTab: any;

  /** 调优助手到系统性能的任务通信 */
  public tuningSysTask$ = new Subject<TuningSysMessageDetail<any>>();


  constructor() { }

  /**
   * 发送消息
   * @param detail 消息详情
   */
  public sendMessage<T>(detail: TuningSysMessageDetail<T>) {
    this.tuningSysTask$.next(detail);
  }

  /**
   * 获取消息
   * @param observer 订阅者
   * @returns 消息详情
   */
  public getMessage<T>(observer: PartialObserver<TuningSysMessageDetail<T>>) {
    return this.tuningSysTask$.subscribe(observer);
  }
}
