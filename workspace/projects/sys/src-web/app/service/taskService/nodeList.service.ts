import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {

  // 开启，关闭
  public isOpen = new BehaviorSubject<string>('');
  // 传递节点名
  public nodeTitle = new BehaviorSubject<string>('');
  // 承接数据
  public params = new BehaviorSubject<object>({});
  // 返回数据
  public formData = new BehaviorSubject<object>({});

  // 控制是否显示配置节点参数
  public nodeList = new BehaviorSubject<boolean>(false);
  // 控制开关
  handleOpen(taskName: string): void {
    this.isOpen.next(taskName);
  }
  handleClose(): void {
    this.isOpen.next('');
  }
  handleNodeName(params: string): void {
    if (params) {
      this.nodeTitle.next(params);
    }
  }
  // 传递数据
  handleTaskParams(params: object): void {
    if (Object.keys(params).length !== 0 ) {
      this.params.next(params);
    }
  }
  // 传递数据
  handleBackParams(params: object): void {
    if (Object.keys(params).length !== 0 ) {
      this.formData.next(params);
    }
  }
  handleVisiableNode(show: boolean) {
    this.nodeList.next(show);
  }
}
