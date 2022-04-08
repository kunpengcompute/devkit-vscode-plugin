import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { OpenNodeInfo } from '../domain';
import { TiTreeNode, } from '@cloud/tiny3';

/**
 * 为在组件之外开启同工程且同任务下另一个节点提供服务
 *
 * @publicApi openNode 开启节点的发布方法
 * @publicApi setTheNodeChecked 将选中节点的 checked 的属性值设为 true
 * @publicApi setAllNodeCheckout 将所有节点的 checked 的属性值设为 false
 */
@Injectable({
  providedIn: 'root'
})
export class OpenNodeService {

  constructor() { }

  /** 订阅源 */
  private openNodeListerSource = new Subject<OpenNodeInfo>();

  /** 开启节点的通知订阅流 */
  public openNodeLister$ = this.openNodeListerSource.asObservable();

  /**
   * 开启节点的发布方法
   * @param nodeInfo 节点信息
   */
  public openNode(nodeInfo: OpenNodeInfo) {
    this.openNodeListerSource.next(nodeInfo);
  }

  /**
   * 将选中节点的 checked 的属性值设为 true
   * @param nodeList 节点列表
   * @param param1 工程Id, 任务Id, 节点IP
   */
  public setTheNodeChecked(nodeList: TiTreeNode[], { projectId, taskId, nodeIp }: any) {
    for (const node of nodeList) {
      switch (node.level) {
        case 'project':
          if (node.projectId === projectId) {
            this.setTheNodeChecked(node.children, { projectId, taskId, nodeIp });
            node.checked = 'indeterminate';
          }
          break;
        case 'task':
          if (node.id === taskId) {
            this.setTheNodeChecked(node.children, { projectId, taskId, nodeIp });
            node.checked = 'indeterminate';
          }
          break;
        case 'node':
          if (node.nodeIP === nodeIp) {
            node.checked = true;
            return;
          }
          break;
        default:
      }
    }
  }

  /**
   * 将所有节点的 checked 的属性值设为 false
   * @param nodeList 节点列表
   */
  public setAllNodeCheckout(nodeList: TiTreeNode[]) {
    for (const node of nodeList) {
      if (node.level === 'node') {
        node.checked = false;
      } else {
        this.setAllNodeCheckout(node.children);
      }
    }
  }
}
