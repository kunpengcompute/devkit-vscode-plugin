import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { I18n } from 'sys/locale';
import { HttpService, TipService } from 'sys/src-com/app/service';
import { BatchNodeInfo, BatchOptEvent } from '../domain';
import { DispatchInfo, StateBaseOpreation, StateController } from '../model';

@Injectable({
  providedIn: 'root',
})
export class AddNodesService implements StateBaseOpreation {
  // 初始化完成
  inited = new BehaviorSubject<StateController>(null);
  // 派遣事件
  dispatch = new Subject<DispatchInfo>();

  constructor(private http: HttpService, private tip: TipService) {
    this.inited.next({
      action: (payLoad: BatchNodeInfo[]) => {
        this.pushNodeInfo(payLoad);
      },
    });
  }

  /**
   * 批量添加节点
   * @param nodeInfo 节点信息
   */
  private pushNodeInfo(nodeInfo: BatchNodeInfo[]) {
    const url = '/nodes/batch/';
    this.http
      .post(url, nodeInfo)
      .then(() => {
        this.dispatch.next({
          event: BatchOptEvent.ImportSuccess,
        });
        this.tip.success(I18n.nodeManagement.importBatchSuccess);
      })
      .catch((err: any) => {
        this.dispatch.next({
          event: BatchOptEvent.Error,
          payLoad: err,
        });
      });
  }
}
