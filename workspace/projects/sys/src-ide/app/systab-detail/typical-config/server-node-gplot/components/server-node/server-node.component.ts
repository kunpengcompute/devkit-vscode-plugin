import { Component, HostListener, ElementRef, Input, Output, EventEmitter ,  OnInit } from '@angular/core';
import { EventType, NodeStatus, NodeColorEnum, LightNodeColorEnum } from './server-node.component.helper';
import { GplotNodeInfo, GplotNodeData, GplotNodeTypeEnum } from '../../classes/reference';
import { I18nService } from '../../../../../service/i18n.service';
import {COLOR_THEME, currentTheme, VscodeService} from '../../../../../service/vscode.service';

@Component({
    selector: 'app-server-node',
    templateUrl: './server-node.component.html',
    styleUrls: ['./server-node.component.scss'],
})
export class ServerNodeComponent implements OnInit {
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
        if (this.currTheme === this.ColorTheme.Dark) {  // 深色主题
            this.nodeColor = NodeColorEnum[status];
            if (status === 'HOVER') {
                this.fillColor = NodeColorEnum.FILL_HOVER;
            } else {
                this.fillColor = NodeColorEnum.FILL_NORMAL;
            }
        } else if (this.currTheme === this.ColorTheme.Light) {  // 浅色主题
            this.nodeColor = LightNodeColorEnum[status];
            if (status === 'HOVER') {
                this.fillColor = LightNodeColorEnum.FILL_HOVER;
            } else {
                this.fillColor = LightNodeColorEnum.FILL_NORMAL;
            }
        }
    }
    get nodeStatus() {
        return this.nodeStatusCopy;
    }
    private nodeStatusCopy: NodeStatus;

    // 节点的颜色
    public nodeColor: string;
    public fillColor: string;

    // 节点是否处于 mouseenter 和 click 状态
    private atMouseenterStatus: boolean;
    private atCilckStatus: boolean;

    // 其他
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    // 节点类型
    public NodeType = {
        NameNode: GplotNodeTypeEnum.NAMENODE,
        DataNode: GplotNodeTypeEnum.DATANODE
    };
    /**
     * 处理鼠标事件
     */
    @HostListener('mouseleave', ['$event'])
    @HostListener('mousedown', ['$event'])
    @HostListener('mouseenter', ['$event'])
    @HostListener('document:mouseup', ['$event'])
    onMouseEvent(event) {
        this.onChangeNode(event);
    }
    /**
     * 鼠标松开事件
     */
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
        public vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
        this.nodeStatus = 'NORMAL';
    }
    /**
     * 初始化
     */
    ngOnInit() {
        if (this.isFocusNode) {
            this.nodeStatus = 'CLICK';
        } else {
            this.nodeStatus = 'NORMAL';
        }
        // 获取VSCode当前主题颜色
        this.currTheme = currentTheme();
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            if (this.isFocusNode) {
                this.nodeStatus = 'CLICK';
            }
        });
    }

    /**
     * 点击回调事件
     */
    public nodeClickCb() { }

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
    private onChangeNode(event) {
        const eventType: EventType = event.type;
        if (eventType === 'mouseenter') {
            this.atMouseenterStatus = true;
            this.nodeStatus = this.nodeStatus = this.atCilckStatus ? 'CLICK' : 'HOVER';
        } else if (eventType === 'mouseleave') {
            if (this.isFocusNode) {
                this.nodeStatus = 'CLICK';
            } else {
                this.atMouseenterStatus = false;
                this.nodeStatus = this.atCilckStatus ? 'CLICK' : 'NORMAL';
            }
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
