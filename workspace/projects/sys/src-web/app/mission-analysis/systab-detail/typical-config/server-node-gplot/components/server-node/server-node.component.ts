import { Component, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { EventType, NodeStatus, NodeColorEnum } from './server-node.component.types';
import { GplotNodeInfo, GplotNodeData } from '../../classes/reference';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-server-node',
  templateUrl: './server-node.component.html',
  styleUrls: ['./server-node.component.scss'],
})
export class ServerNodeComponent {
  // 节点信息
  @Input()
  set nodeInfo(val: GplotNodeInfo) {
    this.nodeInfoCopy = val;
    if (this.nodeInfoCopy != null) {
      this.nodeData = val.nodeData;
      this.isFocusNode = val.isFocusNode;
      this.isBigData = val.isBigData;
    }
  }
  get nodeInfo() {
    return this.nodeInfoCopy;
  }
  public nodeInfoCopy: GplotNodeInfo;

  @Output() nodeClick = new EventEmitter<string>();

  // 节点的数据
  public nodeData: GplotNodeData;
  public isFocusNode = false;
  public isBigData = false;

  // 节点的状态
  set nodeStatus(status: NodeStatus) {
    this.nodeStatusCopy = status;
    this.nodeColor = NodeColorEnum[status];
  }
  get nodeStatus() {
    return this.nodeStatusCopy;
  }
  private nodeStatusCopy: NodeStatus;

  // 节点的颜色
  public nodeColor: string;

  // 节点是否处于 mouseenter 和 click 状态
  private atMouseenterStatus: boolean;
  private atCilckStatus: boolean;

  // 其他
  public i18n: any;

  // 处理鼠标事件
  @HostListener('mouseleave', ['$event'])
  @HostListener('mousedown', ['$event'])
  @HostListener('mouseenter', ['$event'])
  @HostListener('document:mouseup', ['$event'])
  onMouseEvent(event: any) {
    this.onChangeNode(event);
  }
  @HostListener('mouseup')
  onMouseupEvent() {
    if (this.atCilckStatus) {
      this.nodeClick.emit(this.nodeData.IP);
    }
  }

  /**
   * 初始化节点状态等
   * @param elementRef Element引用
   */
  constructor(
    public elementRef: ElementRef,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.nodeStatus = 'NORMAL';
  }

  /**
   * 获取组件在 视图 中的位置
   * @param direction 哪个方向上的位置
   */
  public getComponentPos(direction: 'top' | 'bottom' | 'right' | 'left'): [number, number] {
    const { left, top, right, bottom } = this.elementRef.nativeElement.getBoundingClientRect();
    let pos: [number, number] = [0, 0];
    switch (direction) {
      case 'top':
        pos = [(right + left) / 2, top];
        break;
      case 'bottom':
        pos = [(right + left) / 2, bottom];
        break;
      case 'right':
        pos = [right, (top + bottom) / 2];
        break;
      case 'left':
        pos = [left, (top + bottom) / 2];
        break;
      default:
    }
    return pos;
  }

  /**
   * 更根据参数事件类型（eventType）和节点视图所处的状态（atMouseenterStatus， atCilckStatus），设置节点的状态（nodeStatus）
   * @param eventType 事件类型
   */
  private onChangeNode(event: any) {
    const eventType: EventType = event.type;
    if (eventType === 'mouseenter') {
      this.atMouseenterStatus = true;
      this.nodeStatus = this.nodeStatus = this.atCilckStatus ? 'CLICK' : 'HOVER';
    } else if (eventType === 'mouseleave') {
      this.atMouseenterStatus = false;
      this.nodeStatus = this.atCilckStatus ? 'CLICK' : 'NORMAL';
    } else if (eventType === 'mousedown') {
      this.atCilckStatus = true;
      this.nodeStatus = 'CLICK';
    } else if (eventType === 'mouseup') {
      this.atCilckStatus = false;
      this.nodeStatus = this.atMouseenterStatus ? 'HOVER' : 'NORMAL';
    } else {
      this.nodeStatus = 'NORMAL';
    }
  }
}
