import { Component, Input, OnInit, ViewChild , ComponentRef} from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTipDirective } from '@cloud/tiny3';
import { WebviewPanelService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';
import { INetLoadRawData } from '../../domain';

@Component({
  selector: 'app-load-io-statistics',
  templateUrl: './load-io-statistics.component.html',
  styleUrls: ['./load-io-statistics.component.scss'],
})
export class LoadIoStatisticsComponent implements OnInit {
  @Input() netIODetail: string[][];
  @Input() netLoadData: INetLoadRawData;
  @Input() nodeId: number;
  @Input() taskId: number;

  @ViewChild('searchPop') searchPop: TiTipDirective;

  public inputValue: any;
  public oneWordSearch: any;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };


  constructor(private panelService: WebviewPanelService) { }

  private searchPopInstance: ComponentRef<any>;
  searchWord = '';
  searchWords = [''];

  public setOneWordSearch(value: string): void {
    this.oneWordSearch.searchWords[0] = value;
  }

  /**
   * 显示搜索 tip 框
   * @param searchPop tip 模板变量
   */
  showSearchPop(searchPop: TiTipDirective) {
    this.searchPop = this.searchPop || searchPop;
    if (this.searchPopInstance) {
      this.searchPop.hide();
      this.searchPopInstance.destroy();
      this.searchPopInstance = null;
    } else {
      this.searchPopInstance = this.searchPop.show();
      const searchPopDom = this.searchPopInstance.location.nativeElement as HTMLDivElement;
      searchPopDom.classList.add('search-io-pop');
    }
  }
    /**
     * 搜索框值改变事件
     * @param value 输入值
     */
     searchValueChange(value: string) {
      this.searchWords[0] = value;
    }

    // 搜索框 失焦 事件
    onSearchBoxBlur() {
      this.searchPop.hide();
      this.searchPopInstance.destroy();
      this.searchPopInstance = null;
    }

  ngOnInit(): void {
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    };

    this.initColumns();
    const netData: any[] = [];
    this.netIODetail.forEach((data: string[]) => {
      netData.push(this.handleNetIOData(data));
    });
    this.srcData.data = netData;
    this.totalNumber = this.srcData.data.length;
  }

  // 前往网口详情页
  onIfaceClick(row: any) {
    this.panelService.addPanel({
      viewType: 'netPortDetail',
      title: row.iface,
      message: {
        bindName: row.bindName,
        title: row.iface,
        nodeId: this.nodeId,
        taskId: this.taskId,
      }
    });
  }

  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: 'IFACE', showIcon: true, searchShow: true , tip: I18n.net_io.io_statistics_tip.iface_tip},
      { title: 'rx（pck/s）', sortKey: 'rxPck', showIcon: true , tip: I18n.net_io.io_statistics_tip.rxpck},
      { title: 'tx（pck/s）', sortKey: 'txPck', showIcon: true , tip: I18n.net_io.io_statistics_tip.txpck},
      { title: 'rx（KB/s）', sortKey: 'rxKB', showIcon: true , tip: I18n.net_io.io_statistics_tip.rxkbs},
      { title: 'tx（KB/s）', sortKey: 'txKB', showIcon: true , tip: I18n.net_io.io_statistics_tip.txkbs},
    ];
  }

  // 获取 cpu 负载表格数据
  private handleNetIOData(netIOData: string[]) {
    const [iface, rxPck, txPck, rxKB, txKB, bindName] = netIOData;

    return {
      iface,
      rxPck,
      txPck,
      rxKB,
      txKB,
      bindName,
    };
  }

  // 对表格进行排序
  public compareFn(a: any, b: any, predicate: string) {
    return Number(a[predicate]) - Number(b[predicate]);
  }
}
