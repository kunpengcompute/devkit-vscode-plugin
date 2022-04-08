import { query } from '@angular/animations';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, TiTipDirective } from '@cloud/tiny3';
import { element } from 'protractor';
import { HttpService, I18nService, UrlService } from 'sys/src-com/app/service';

// columns 的接口
interface TableColumn extends TiTableColumns {
  prop: string;
  title: string;
}

@Component({
  selector: 'app-node-table-info',
  templateUrl: './node-table-info.component.html',
  styleUrls: ['./node-table-info.component.scss']
})
export class NodeTableInfoComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectMode: 'checkbox' | 'none' = 'checkbox';
  @Input() nodeList: Array<any>;
  @Input() selectedNodeIds: number[];
  @Input() nodeNumLimit = 10;
  @Input() tableWidth: string;
  @Input() currentNode: string;
  @Input() alertTipBox: string;
  @Input() projectId: number = +sessionStorage.getItem('projectId');
  @Output() selectedNodeIdsChange = new EventEmitter();
  @Output() openNodeConfigPop = new EventEmitter();
  public role = sessionStorage.getItem('role');
  public i18n: any;
  public destroy = false;
  public obtainingTableData = false;
  public columns: Array<TableColumn> = [];
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public originTotal = 0;
  private originNodeList: Array<TiTableRowData>;
  public searchKeys = ['nickName', 'nodeStatus', 'nodeIP'];
  public searchWords = ['', '', ''];
  public searchIdx: number;
  public tiSearch: TiTipDirective;
  public isSelected = false;
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50],
    size: 10
  };
  private url: any;
  public nodeStatusList: any = {};
  public getNodesTimeout: any;
  public allNodeIds: any = [];
  constructor(
    public i18nService: I18nService,
    private http: HttpService,
    private urlService: UrlService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.nodeStatusList = {
      on: { // 在线
        text: this.i18n.node.online,
        color: '#61d274',
      },
      off: {  // 离线
        text: this.i18n.node.offline,
        color: '#ccc',
      },
      init: { // 添加中
        text: this.i18n.nodeManagement.adding,
      },
      lock: { // 删除中
        text: this.i18n.nodeManagement.deleting,
      },
      update: { // 更新中
        text: this.i18n.nodeManagement.updating,
      },
      mismatch: { // 版本不匹配
        text: this.i18n.nodeManagement.mismatch, color: '#F45C5E',
      },
      failed: { // 失败
        text: this.i18n.status_Failed, color: '#F45C5E',
      },
    };
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }

  ngOnInit() {
    this.columns = [
      { prop: 'nickName', title: this.i18n.nodeManagement.nodeName, search: true, searchIndex: 0 },
      {
        prop: 'nodeStatus', title: this.i18n.common_term_node_status,
        options: Object.keys(this.nodeStatusList).map(key => {
          const label = this.nodeStatusList[key].text;
          return { key, label };
        }),
        multiple: true,
        selected: [],
      },
      { prop: 'nodeIp', title: this.i18n.nodeConfig.node, search: true, searchIndex: 1 },
    ];
    if (this.nodeList && this.nodeList?.length) {
      this.srcData.data = this.formatNodeList(this.nodeList);
    } else {
      this.getNodes(true);
    }
  }
  ngOnChanges() {
    if (this.nodeList) {
      this.srcData.data = this.formatNodeList(this.nodeList);
    }
  }

  ngOnDestroy() {
    this.destroy = true;
    if (this.getNodesTimeout) {
      clearTimeout(this.getNodesTimeout);
      this.getNodesTimeout = null;
    }
  }

  public formatNodeList(nodeList: any) {
    return nodeList.map((item: any) => {
      return {
        id: item.id,
        nickName: item.nickName,
        nodeStatus: item.nodeStatus,
        nodeIp: item.nodeIp,
        status: item.status
      };
    });
  }

  public getNodes(showLoading = false) {
    this.obtainingTableData = showLoading;
    const isReanalyze = this.selectMode === 'checkbox';
    const urlTask = `/projects/${encodeURIComponent(this.projectId)}/info/`;
    const urlPro =
      `/nodes/?analysis-type=optimization&auto-flag=on&page=1&per-page=101`;
    const url = isReanalyze ? urlPro : urlTask;
    this.http.get(url, { headers: { showLoading: false } }).then((res: any) => {
      const data = res.data;
      if (this.currentNode && this.currentNode !== '') {
        this.nodeList = data.nodeList.filter((item: any) => {
          return item.nodeIp === this.currentNode;
        });
      } else {
        this.nodeList = data.nodeList;
      }
      this.srcData.data = this.formatNodeList(this.nodeList);
      this.originNodeList = JSON.parse(JSON.stringify(this.srcData.data));
      this.totalNumber = this.originTotal = data.totalCounts;
      this.allNodeIds = this.srcData.data.map(item => item.id);
      this.onNodeStatusSelect(this.isSelected);
      if (!this.destroy && isReanalyze) {
        this.getNodesTimeout = setTimeout(() => {
          this.getNodes();
        }, 5000);
      }
    }).catch((e: any) => {
      if (!this.destroy && isReanalyze) {
        this.getNodesTimeout = setTimeout(() => {
          this.getNodes();
        }, 5000);
      }
    }).finally(() => {
      this.obtainingTableData = false;
    });
  }

  public stateUpdate(tiTable: TiTableComponent): void {
    this.getNodes(true);
  }

  public trackByFn(index: number, item: any): number {
    return item.id;
  }

  public statusFormat(status: boolean): string {
    let statusClass = '';
    switch (status) {
      case true:
        statusClass = 'success-icon';
        break;
      default:
        statusClass = 'reserve-icon';
        break;
    }
    return statusClass;
  }
  /**
   * 筛选切换
   * @param bool 是否切换选中
   */
  onNodeStatusSelect(bool: boolean, idx?: number, val?: string) {
    this.isSelected = bool;
    // 从每一行进行过滤筛选
    this.srcData.data = this.originNodeList.filter((rowData: TiTableRowData) => {
      // 遍历所有列
      for (const columnData of this.columns) {
        // 只有筛选列有选中项时进行筛选，如果某一筛选列选中项不包含当前行数据，则跳出循环
        if (columnData.selected && columnData.selected.length) {
          const index: number = columnData.selected.findIndex((item: any) => {
            return item.key === rowData[columnData.prop];
          });
          if (index < 0) {
            return false;
          }
        }
      }

      return true;
    });
    this.searchOut(idx, val);
    if (bool) {
      this.srcData.data = this.srcData.data.filter(node => {
        return this.selectedNodeIds.some(item => {
          return item === node.id;
        });
      });
    }
    this.totalNumber = this.srcData.data.length;
  }
  public searchClick(tiSearch: TiTipDirective, i: number) {
    this.tiSearch = tiSearch;
    const ref = tiSearch.show();
    const searchBox = ref.location.nativeElement.querySelector('input') as HTMLElement;
    searchBox.focus();
    this.searchIdx = i;
  }
  public searchOut(idx?: number, val?: string) {
    if (idx < this.searchWords.length) {
      this.searchWords[idx] = val;
    }
    this.srcData.data = this.srcData.data.filter((item) => {
      return this.columns.every((column, i) => {
        let bool = false;
        if (column.search) {
          bool = item[column.prop].includes(this.searchWords[i] || '');
        } else {
          bool = true;
        }
        return bool;
      });
    });
  }
  public searchHide() {
    this.tiSearch.hide();
  }
  public clearOut(idx: number) {
    this.searchWords[idx] = '';
    this.searchOut(idx);
  }
}

