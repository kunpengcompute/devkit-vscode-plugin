import { Component, OnInit, Input } from '@angular/core';
import { TiTreeComponent, TiTreeNode } from '@cloud/tiny3';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
@Component({
  selector: 'app-stack-tree',
  templateUrl: './stack-tree.component.html',
  styleUrls: ['./stack-tree.component.scss']
})
export class StackTreeComponent implements OnInit {

  constructor(public Axios: AxiosService, public i18nService: I18nService, public myTip: MytipService) {
    this.i18n = this.i18nService.I18n();
    this.moreLabel = this.i18n.strackTrace.more;
    this.checkAll = this.i18n.strackTrace.checkAll;
  }
  @Input() recordId: string;
  @Input() eventType: EventType;
  public i18n: any;
  public tree: Array<TiTreeNode> = [];
  public moreLabel: any;
  public checkAll: any;
  public expectedNum = 5;
  public params: StackTrace;
  public strackTraceMap: any = {};
  public isNodata = true;
  public isLoading: any = false;
  public loadingHeight: any = '20vh';
  public allStackData: any = {};
  public treeData: Array<TiTreeNode> = [];
  public isExpandAll = false; // 是否一键展开
  // 栈
  public stackTranceData: Array<TiTreeNode> = [];
  public nodeId = '';
  ngOnInit() { }
  public async getStraceTraceData(index: string) {
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

    this.tree = this.recursiveCreateNodes(firstRowData);
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
  private async getStrakData(params: StackTrace, isGetAll: boolean): Promise<object> {
    const linkurl = isGetAll ? '/records/actions/stacktrace/v2?' : '/records/actions/parse-stacktrace?';
    this.showLoding();
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(linkurl, { params }).then((res: any) => {
        this.closeLoding();
        if (res.code === -1) {
          this.isNodata = true;
        } else {
          this.isNodata = false;
        }
        resolve(res);
      }).catch(() => {
        this.closeLoding();
      });
    });
  }
  private showLoding() {
    document.getElementById('loadingStack').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('loadingStack').style.display = 'none';
  }
  /**
   * 将获取的数据挂载到当前节点
   * @param node 当前节点数据
   */
  private async mountedChildren(current: number, node: TiTreeNode): Promise<void> {
    this.params.nodeId = +node.label;
    this.params.count = +(node.newCount || node.count);
    this.params.currentTotal = current;
    const gotData: object = await this.getStrakData(this.params, false);
    const getDataPromise: any = this.handleStrackTreeData(node, gotData);
    node.children.pop();
    node.children.push(Math.max.apply(null, getDataPromise));
    node.expanded = true;
  }
  /**
   * 处理获取的当前数据
   * @param nodes 当前节点引用
   * @param data 获取的数据
   */
  private handleStrackTreeData(nodes: any, data: any): any {
    const node: any = data.data;
    if (!node) {
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
      const newCount = node.shift();
      const hasChild = node.shift();
      const newNode: any = {
        label,
        newCount,
        parentCount: nodes.count || count,
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
      this.i18n.strackTrace.moreInfo,
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
  private recursiveCreateNodes(data: any) {
    const treeData: Array<TiTreeNode> = [];
    while (data?.length) {
      const label = data.shift();
      const counts = data.shift();
      const hasChild = data.shift();
      const labelName = label + '|' + counts;
      const newNode: any = {
        label,
        count: counts,
        parentCount: data.count || counts,
        expanded: false,
        nodeId: '',
        level: 0,
      };
      if (hasChild) {
        for (const key in this.allStackData) {
          if (Object.prototype.hasOwnProperty.call(this.allStackData, key)) {
            const newkey = key.substr(0, key.lastIndexOf('|'));
            if (labelName === newkey) {
              newNode.level++;
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
enum type {
  LOCK,
  OBJECT,
  FILE_IO,
  SOCKET_IO
}
interface EventType {
  eventType: type;
}
