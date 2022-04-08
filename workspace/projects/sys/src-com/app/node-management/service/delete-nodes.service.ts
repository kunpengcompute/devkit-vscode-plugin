import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { I18n } from 'sys/locale';
import { HttpService, TipService } from 'sys/src-com/app/service';
import { BatchNodeInfo, BatchOptEvent } from '../domain';
import { DispatchInfo, StateBaseOpreation, StateController } from '../model';

@Injectable({
  providedIn: 'root',
})
export class DeleteNodesService implements StateBaseOpreation {
  // 初始化完成
  inited = new BehaviorSubject<StateController>(null);
  // 派遣事件
  dispatch = new Subject<DispatchInfo>();

  constructor(private http: HttpService, private tip: TipService) {
    this.inited.next({
      action: (payLoad: BatchNodeInfo[]) => {
        this.deleteNodes(payLoad);
      },
    });
  }

  /**
   * 批量删除节点
   * @param nodeInfo 节点信息
   */
  private deleteNodes(nodeInfo: BatchNodeInfo[]) {
    const url = `/nodes/batch-delete/`;
    this.http
      .delete(url, {
        data: { node_list: nodeInfo },
      })
      .then(() => {
        this.dispatch.next({
          event: BatchOptEvent.DeleteSuccess,
        });
        this.tip.success(I18n.nodeManagement.deleteBatchSuccess);
      })
      .catch((err: any) => {
        this.dispatch.next({
          event: BatchOptEvent.Error,
          payLoad: err,
        });
      });
  }
}
