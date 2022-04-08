import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpService } from '../../service';
import {
  BatchNodeInfo,
  BatchOptEvent,
  NodeFingerprint,
  ProjectNodesShip,
  ProjectNodesShipRaw,
} from '../domain';
import { DispatchInfo, StateBaseOpreation, StateController } from '../model';
import { Cat } from 'hyper';

@Injectable({
  providedIn: 'root',
})
export class QueryNodeProjectService implements StateBaseOpreation {
  // 初始化完成
  inited = new BehaviorSubject<StateController>(null);
  // 派遣事件
  dispatch = new Subject<DispatchInfo>();

  isNothing = (obj: any) => Cat.isNil(obj) || Cat.isEmpty(obj);

  constructor(private http: HttpService) {
    this.inited.next({
      action: (payLoad: {
        nodeInfo: BatchNodeInfo[];
        fingerPrint: NodeFingerprint[];
      }) => {
        const { nodeInfo, fingerPrint } = payLoad;
        this.queryNodeProject(nodeInfo, fingerPrint);
      },
    });
  }

  /**
   * 查询节点关联工程
   * @param nodeInfo 节点信息
   * @param fingerPrint 指纹信息
   */
  private async queryNodeProject(
    nodeInfo: BatchNodeInfo[],
    fingerPrint: NodeFingerprint[]
  ) {
    const nodeList = {
      node_list: nodeInfo.map((node) => node.ip).join(','),
    };
    const url = '/nodes/batch-projects/';

    let resData: ProjectNodesShipRaw;
    try {
      resData = (await this.http.post(url, nodeList)).data;
    } catch (error) {
      this.dispatch.next({
        event: BatchOptEvent.Error,
        payLoad: error,
      });
      return;
    }

    const projNodesList: ProjectNodesShip[] = Object.values(resData).reduce(
      (sum, next) => {
        return sum.concat(next);
      }
    );

    if (this.isNothing(projNodesList)) {
      this.dispatch.next({
        event: BatchOptEvent.NoRelation,
        payLoad: {
          nodeInfo,
          fingerPrint,
        },
      });
    } else {
      this.dispatch.next({
        event: BatchOptEvent.Relation,
        payLoad: {
          nodeInfo,
          fingerPrint,
          relation: resData,
        },
      });
    }
  }
}
