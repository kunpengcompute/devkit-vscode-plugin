import { Injectable } from '@angular/core';
import { AxiosRequestConfig } from 'axios';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpService } from 'sys/src-com/app/service';
import { BatchNodeInfo, BatchOptEvent, BatchOptType } from '../domain';
import { DispatchInfo, StateBaseOpreation, StateController } from '../model';

const actionTypeMap = new Map<BatchOptType, string>([
  [BatchOptType.Import, 'add'],
  [BatchOptType.Delete, 'delete'],
]);

@Injectable({
  providedIn: 'root',
})
export class BackValidService implements StateBaseOpreation {
  batchOptType: BatchOptType;
  // 初始化完成
  inited = new BehaviorSubject<StateController>(null);
  // 派遣事件
  dispatch = new Subject<DispatchInfo>();

  constructor(private http: HttpService) {
    this.inited.next({
      action: (payLoad: BatchNodeInfo[]) => {
        this.validNodeInfo(payLoad);
      },
    });
  }

  /**
   * 验证节点指纹信息
   * @param nodeInfo 节点信息
   */
  private validNodeInfo(nodeInfo: BatchNodeInfo[]) {
    const url = '/nodes/fingers-print/';
    const prarm: any = {
      node_list: nodeInfo,
      action_type: actionTypeMap.get(this.batchOptType),
    };
    this.http
      .post(url, prarm, { showLoading: true, timeout: 360000 } as AxiosRequestConfig)
      .then((res: any) => {
        if (res?.code?.toLowerCase().includes('success')) {
          this.dispatch.next({
            event: BatchOptEvent.Success,
            payLoad: {
              nodeInfo,
              fingerPrint: res.data,
            },
          });
        } else {
          this.dispatch.next({
            event: BatchOptEvent.Fail,
            payLoad: res.data,
          });
        }
      })
      .catch((data: any = {}) => {
        if (data.code) {
          this.dispatch.next({
            event: BatchOptEvent.Fail,
            payLoad: data.data,
          });
        } else {
          this.dispatch.next({
            event: BatchOptEvent.Error,
            payLoad: data,
          });
        }
      });
  }
}
