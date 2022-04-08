import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TiPageSizeConfig, TiTableColumns, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { TaskStatus } from 'sys/src-com/app/domain';

type NodeId = number;

type SelectNodeInfo = {
  id: number;
  nodeIp: string;
  nodeStatus: TaskStatus;
  nickName: string;
  selected?: boolean;
  disabled?: boolean;
};

@Component({
  selector: 'app-nodes-select',
  templateUrl: './nodes-select.component.html',
  styleUrls: ['./nodes-select.component.scss'],
})
export class NodesSelectComponent implements OnInit {
  @Input() set nodeList(val: SelectNodeInfo[]) {
    if (null == val) {
    }
    this.srcData.data = val ?? [];
  }
  @Input()
  set selectedNodes(idList: NodeId[]) {
    this.selectedNodesStash = idList;
  }
  get selectedNodes() {
    return this.selectedNodesStash;
  }
  @Input() selectDisable: boolean;
  @Output() ngModelChange = new EventEmitter<NodeId[]>();

  displayed: Array<SelectNodeInfo> = [];
  srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
  };
  columns = this.getColumns();
  currentPage = 1;
  pageSize: TiPageSizeConfig = {
    options: [10, 20, 50, 100],
    size: 10,
  };
  totalNumber: number;

  isShowAll: boolean;
  checkedList: SelectNodeInfo[] = [];
  taskStatusEnum = TaskStatus;
  private selectedNodesStash: NodeId[];
  constructor() {}

  ngOnInit(): void {}

  onCheckedsChange() {}

  /**
   * 设置节点选择状态
   * @param nodelist 节点列表
   * @param idList id列表
   * @param selected 是否被选择
   */
  private setNodeSelectStatus(
    nodelist: SelectNodeInfo[],
    idList: NodeId[],
    selected: boolean
  ): SelectNodeInfo[] {
    return nodelist.map((node) => {
      return idList.includes(node.id) ? { ...node, selected } : { ...node };
    });
  }

  /**
   * 设置节点选择能力
   * @param nodelist 节点列表
   * @param idList id列表
   * @param disabled 是否失能
   */
  private setNodeSelectAble(
    nodelist: SelectNodeInfo[],
    idList: NodeId[],
    disabled: boolean
  ): SelectNodeInfo[] {
    return nodelist.map((node) => {
      return idList.includes(node.id) ? { ...node, disabled } : { ...node };
    });
  }

  /**
   * 设置所有节点的选择能力
   * @param nodelist 节点列表
   * @param idList id列表
   * @param disabled 是否失能
   */
  private setAllNodeSelectAble(
    nodelist: SelectNodeInfo[],
    disabled: boolean
  ): SelectNodeInfo[] {
    return this.setNodeSelectAble(
      nodelist,
      nodelist.map((node) => node.id),
      disabled
    );
  }

  private getColumns(): Array<TiTableColumns> {
    return [
      {
        title: I18n.nodeManagement.nodeName,
        width: '30%',
        multiple: true,
        showFilter: false,
        showSearch: true,
        searchKey: 'nickName',
      },
      {
        title: I18n.node.status,
        width: '30%',
        multiple: true,
        showFilter: true,
        showSearch: false,
      },
      {
        title: I18n.nodeConfig.node,
        width: '30%',
        multiple: true,
        showFilter: false,
        showSearch: true,
        searchKey: 'node',
      },
    ];
  }

  trackByFn(_: number, item: SelectNodeInfo) {
    return item.id;
  }
}
