import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, } from '@cloud/tiny3';
import { HttpService, I18nService, UrlService } from 'sys/src-com/app/service';

// columns 的接口
interface TableColumn extends TiTableColumns {
  prop: string;
  title: string;
}

@Component({
  selector: 'app-server-table',
  templateUrl: './server-table.component.html',
  styleUrls: ['./server-table.component.scss']
})
export class ServerTableComponent implements OnInit {
  @Input() hasPagination = false;
  @Input()
  set nodeList(value: any) {
    if (value.length) {
      this.srcData.data = this.formatNodeList(value);
    } else {
      this.getNodes(true);
    }
  }
  @Input() nodeNumLimit = 10;
  @Input() tableWidth: string;
  @Output() selectedNodeIdsChange = new EventEmitter();
  @Output() openNodeConfigPop = new EventEmitter();
  public role = sessionStorage.getItem('role');
  public i18n: any;
  public destroy = false;
  public obtainingTableData = false;
  public columns: Array<TableColumn> = [];
  public srcData: TiTableSrcData;
  public displayed: Array<TiTableRowData> = [];
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50],
    size: 10
  };
  private url: any;
  public nodeStatusList: any = {};
  public getNodesTimeout: any;

  constructor(
    public i18nService: I18nService,
    private http: HttpService,
    private urlService: UrlService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: true
      }
    };
  }

  ngOnInit() {
    this.columns = [
      { prop: 'nickName', title: this.i18n.nodeManagement.nodeName },
      { prop: 'nodeIp', title: this.i18n.nodeConfig.node },
      { prop: 'status', title: this.i18n.nodeConfig.status },
      { prop: 'action', title: this.i18n.nodeConfig.action },
    ];
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
    const params = {
      'auto-flag': 'on',
      page: this.currentPage,
      'per-page': this.pageSize.size,
    };

    this.obtainingTableData = showLoading;
    this.http.get(`/nodes/?analysis-type=optimization`, { params }).then((res: any) => {
      const data = res.data;
      this.srcData.data = this.formatNodeList(data.nodeList);
      this.totalNumber = data.totalCounts;
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
}

