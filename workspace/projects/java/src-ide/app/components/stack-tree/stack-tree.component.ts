import { Component, OnInit, Input, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { TiTreeComponent, TiTreeNode } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { COLOR_THEME } from '../../service/vscode.service';
import { VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-stack-tree',
    templateUrl: './stack-tree.component.html',
    styleUrls: ['./stack-tree.component.scss']
})
export class StackTreeComponent implements OnInit, AfterViewInit, OnDestroy {

    constructor(
        public Axios: AxiosService,
        public i18nService: I18nService,
        public myTip: MytipService,
        public vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.i18n = this.i18nService.I18n();
        this.moreLabel = this.i18n.plugins_perf_java_sampling_strackTrace.more;
        this.checkAll = this.i18n.plugins_perf_java_sampling_strackTrace.checkAll;
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
    }
    @Input() recordId: string;
    @Input() eventType: EventType;
    @Input() ideType: any;
    @Input() eventTrackType: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public i18n: any;
    public tree: Array<TiTreeNode> = [];
    public moreLabel: any;
    public checkAll: any;
    public expectedNum = 5;
    public params: StackTrace;
    public strackTraceMap: any = {};
    public isNodata = true;
    public showLoading = false;
    public allStackData: any = {};
    public isExpandAll = false; // 是否一键展开
    // 栈
    public stackTranceData: Array<TiTreeNode> = [];
    public firstRowNames: any[] = [];
    public nodeId = '';

    /**
     * 初始化
     */
    ngOnInit() {
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.ideType = 'intellij';
          } else {
            this.ideType = 'other';
          }
    }

    /**
     * 页面销毁
     */
    ngOnDestroy() {
        $('.ti3-tree-container').off();
    }

    /**
     * 监听滚动事件
     */
    ngAfterViewInit() {
        $('.ti3-tree-container').on('scroll', () => {
            if ($('.ti3-tree-container').scrollTop() > 0) {
                $('.ti3-tree-container').addClass('ti-tree-box-shadow');
            } else {
                $('.ti3-tree-container').removeClass('ti-tree-box-shadow');
            }
        });
    }
    /**
     * 首次栈请求
     * @param index 请求栈称
     */
    public async getStraceTraceData(index: string) {
        this.eventTrackType = this.eventType;
        this.params = {
            recordId: this.recordId,
            eventType: this.eventType,
            index,
            nodeId: 0,
            count: 0,
            currentTotal: 0,
            expectedNum: this.expectedNum,
        };

        const allData: any = await this.getStrakData(this.params, true);
        this.allStackData = { ...allData.data };
        const firstRowData: Array<any> = this.allStackData['0||'];
        firstRowData.forEach(item => {
            this.firstRowNames.push(item.label);
        });
        this.tree = this.recursiveCreateNodes(firstRowData, 1);
        this.updateWebViewPage();
    }
    /**
     * 异步请求数据后插入当前节点并展开
     * @param TreeCom TiTreeComponent 当前节点
     */
    beforeExpand(TreeCom: TiTreeComponent): void {
        const item: TiTreeNode = TreeCom.getBeforeExpandNode();
        if (!item.children) { return; }
        if (!item.children.length) {
            this.mountedChildren(0, item);
        } else {
            item.expanded = !item.expanded;
        }
    }

    /**
     * 获取栈数据
     * @param params 接口参数
     */
    private async getStrakData(params?: StackTrace, isGetAll?: boolean): Promise<object> {
        const recordId = `recordId=${params.recordId}&`;
        const eventType = `eventType=${params.eventType}&`;
        const index = `index=${params.index}&`;
        const nodeId = `nodeId=${params.nodeId}&`;
        const count = `count=${params.count}&`;
        const currentTotal = `currentTotal=${params.currentTotal}&`;
        const expectedNum = `expectedNum=${params.expectedNum}`;
        const linkurl = isGetAll ? '/records/actions/stacktrace/v2?' : '/records/actions/parse-stacktrace?';
        const option = {
            url: `${linkurl}${recordId}${eventType}${index}${nodeId}${count}${currentTotal}${expectedNum}`,
            params
        };
        this.showLoading = true;
        return new Promise((resolve) => {
            this.vscodeService.get(option, (res: any) => {
                this.showLoading = false;
                if (res.code === -1) {
                    this.isNodata = true;
                } else {
                    this.isNodata = false;
                }
                resolve(res);
            });
        });
    }
    /**
     * 将获取的数据挂载到当前节点
     * @param node 当前节点数据
     */
    private async mountedChildren(current: number, node: TiTreeNode): Promise<any> {
        this.params.nodeId = +node.label;
        this.params.count = +node.count;
        this.params.currentTotal = current;
        const gotData: object = await this.getStrakData(this.params, false);
        const getDataPromise: any = this.handleStrackTreeData(node, gotData);
        node.children.pop();
        node.children.push(Math.max.apply(null, getDataPromise));
        node.expanded = true;
        return node;
    }
    /**
     * 处理获取的当前数据
     * @param nodes 当前节点引用
     * @param data 获取的数据
     */
    private handleStrackTreeData(nodes: any, data: any): Array<TiTreeNode> | any {
        const node = data.data;
        if (node.length === 0) {
            this.tree = [];
            return;
        }
        const total = node.shift();
        const length = nodes.children.length;
        const nodeId = nodes.label;
        const count = nodes.count;
        const treeData: Array<TiTreeNode> = [];
        while (node.length) {
            const label = node.shift();
            const counts = node.shift();
            const hasChild = node.shift();
            const newNode: any = {
                label,
                count: counts,
                parentCount: nodes.count || counts,
            };
            if (hasChild) {
                newNode.children = [];
            } else {
                delete newNode.children;
            }
            treeData.push(newNode);
        }
        const current = length > 0 ? length + treeData.length - 1 : length + treeData.length;
        const rest = total - current;
        const info = this.i18nService.I18nReplace(
            this.i18n.plugins_perf_java_sampling_strackTrace.moreInfo,
            {
                0: current,
                1: total,
                2: rest
            });
        if (current < total && nodes.label !== 'root') {
            treeData.push({
                label: this.moreLabel,
                info,
                current,
                count,
                nodeId,
                rest,
                nodes
            });
        }
        return treeData;
    }
    /**
     * 展开整个树
     */
    public expandAllNode(row: TiTreeNode) {
        if (row.expanded) {
            return;
        }
        const rowId = this.strackTraceMap[row.label];
        row.nodeId = rowId;
        row.expanded = true;
        this.addTreeNodeid(row.children, rowId);
        this.stackTranceData = row.children;
        this.toggleAllChildren(this.stackTranceData, row.nodeId);
    }
    /**
     * 构建节点id
     */
    public addTreeNodeid(node: Array<TiTreeNode>, rowId: any) {
        node.forEach((item) => {
            const newkey = ' ' + item.label + '|' + item.count;
            rowId = rowId + newkey;
            item.nodeId = rowId;
            if (item.children && item.children.length) {
                this.addTreeNodeid(item.children, rowId);
            }
        });
    }
    /**
     * 递归展开所有子节点
     */
    private toggleAllChildren(data: Array<any>, pId: any): void {
        for (const node of data) {
            if (node.nodeId.indexOf(pId) !== -1) {
                node.expanded = true;
                if (node.children && node.children.length) {
                    this.toggleAllChildren(node.children, node.nodeId);
                } else {
                    delete node.children;
                }
            }
        }
    }


    /**
     * 递归构建节点
     */
    private recursiveCreateNodes(data: any, index?: number) {
        const treeData: Array<TiTreeNode> = [];
        while (data.length) {
            const label = data.shift();
            const counts = data.shift();
            const hasChild = data.shift();
            const labelName = label + '|' + counts;
            const newNode: any = {
                label,
                count: counts,
                parentCount: data.count || counts,
                expanded: false,
                level: index,
            };
            if (hasChild) {
                index++;
                for (const key in this.allStackData) {
                    if (Object.prototype.hasOwnProperty.call(this.allStackData, key)) {
                        const newkey = key.substr(0, key.lastIndexOf('|'));
                        if (labelName === newkey) {
                            const newdata: Array<any> = this.recursiveCreateNodes(this.allStackData[key]);
                            if (newdata.length) {
                                newNode.children = newdata;
                            }
                        }
                    }
                }
            } else {
                delete newNode.children;
            }
            treeData.push(newNode);
        }
        return treeData;
    }

    /**
     * 获取更多数据
     * @param nodes 当前父节点
     * @param current 当前已经展开
     */
    public getMoreData(current: number, nodes: TiTreeNode) {
        this.mountedChildren(current, nodes);
    }
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
/**
 * 请求栈数据参数接口
 */
interface StackTrace {
    recordId: string;
    eventType: EventType;
    index: string;
    count: number;
    nodeId: number;
    currentTotal: number;
    expectedNum: number;
}
/**
 * 使用栈跟踪组件的类型
 */
enum type {
    LOCK,
    OBJECT,
    FILE_IO,
    SOCKET_IO
}
interface EventType {
    eventType: type;
}
