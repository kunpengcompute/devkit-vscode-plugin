import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * 为在组件之外开启同工程且同任务下另一个节点提供服务
 *
 * @publicApi importTpl 导入的发布方法
 */
@Injectable({
  providedIn: 'root'
})
export class ImportTemplateService {

  constructor() { }

  /** 订阅源 */
  private importListerSource = new Subject<any>();

  /** 开启节点的通知订阅流 */
  public importLister$ = this.importListerSource.asObservable();

  /**
   * 导入的发布方法
   * @param taskData 任务信息
   */
  public importTpl(taskData) {
    this.importListerSource.next(taskData);
  }
}
