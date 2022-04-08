import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { I18n } from 'sys/locale';
import { HttpService, TipService } from 'sys/src-com/app/service';
import {
  BatchNodeInfo,
  BatchOptEvent,
  NodeFingerprint,
  ProjectNodesShipRaw,
} from '../domain';
import { DispatchInfo, StateBaseOpreation, StateController } from '../model';

@Injectable({
  providedIn: 'root',
})
export class DeleteNodeProjectService implements StateBaseOpreation {
  // 初始化完成
  inited = new BehaviorSubject<StateController>(null);
  // 派遣事件
  dispatch = new Subject<DispatchInfo>();

  constructor(private http: HttpService, private tip: TipService) {
    this.inited.next({
      action: (payLoad: {
        nodeInfo: BatchNodeInfo[];
        fingerPrint: NodeFingerprint[];
        relation: ProjectNodesShipRaw;
      }) => {
        const { nodeInfo, fingerPrint, relation } = payLoad;
        this.deleteNodeProject(nodeInfo, fingerPrint, relation);
      },
    });
  }

  /**
   * 删除节点关联工程
   * @param nodeInfo 节点信息
   * @param fingerPrint 指纹信息
   * @param relation 节点关联工程信息
   */
  private deleteNodeProject(
    nodeInfo: BatchNodeInfo[],
    fingerPrint: NodeFingerprint[],
    relation: ProjectNodesShipRaw
  ) {
    const url = '/projects/multi-manage/';
    this.http
      .put(url, relation)
      .then(() => {
        this.dispatch.next({
          event: BatchOptEvent.Success,
          payLoad: {
            nodeInfo,
            fingerPrint,
          },
        });
        this.tip.success(I18n.nodeManagement.deleteNodeProjectSuccess);
      })
      .catch((err: any) => {
        this.dispatch.next({
          event: BatchOptEvent.Error,
          payLoad: err,
        });
      });
  }
}
