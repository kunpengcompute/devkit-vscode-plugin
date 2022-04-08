import { PartialObserver, Subject } from 'rxjs';
import { TopologyTreeMessageData } from './topology-tree-message-data.type';
import { TopologyTreeMessageDetail } from './topology-tree-message-detail.type';
import { TopologyTreeMessageType } from './topology-tree-message-type.enum';


/**
 * 任务详情消息服务
 */
export class TaskDetailMessageService {

  private subTreeMessege$ = new Subject<TopologyTreeMessageDetail<any>>();

  constructor() {}

  /**
   * 通用获取消息
   */
  getMessege<T>(observer: PartialObserver<TopologyTreeMessageDetail<T>>) {
    return this.subTreeMessege$.subscribe(observer);
  }

  /**
   * 通用的发送消息
   */
  sendMessage<T>(detail: TopologyTreeMessageDetail<T>) {
    this.subTreeMessege$.next(detail);
  }

  /**
   * 更新拓扑树图
   * @param type 消息类型
   * @param optimizationType 优化类型
   */
  updataTopologyTree(type: TopologyTreeMessageType, data: TopologyTreeMessageData ) {
    const message: TopologyTreeMessageDetail<TopologyTreeMessageData> = { type, data };
    this.sendMessage<TopologyTreeMessageData>(message);
  }
}
