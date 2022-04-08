import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { WebviewPanelService } from 'sys/src-com/app/service';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';
@Component({
  selector: 'app-runing-process-thread',
  templateUrl: './runing-process-thread.component.html',
  styleUrls: ['./runing-process-thread.component.scss']
})
export class RuningProcessThreadComponent implements OnInit {
  @Input() taskId: any;
  @Input() nodeid: any;
  @Input()
  set allProcessThreads(value: any) {
    if (value) {
      this.srcData.data = value;
      this.totalNumber = this.srcData.data.length;
      this.initTableSearchKey();
    }
  }
  constructor(private panelService: WebviewPanelService) { }
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
  /** 搜索组件 */
  @ViewChildren('processSearchPop') processSearchPop: any;
  public searchWords: Array<any> = [];
  public searchKeys: Array<string> = []; // 设置过滤字段
  public searchWordsSave: { [key: string]: string } = {};
  ngOnInit(): void {
    this.columns = [
      {
        title: '',
        width: '4%'
      },
      {
        title: 'CPU core',
        width: '10%',
        searchKey: 'CPU core'
      },
      {
        title: I18n.tuninghelper.taskDetail.process_num,
        width: '86%',
        sortKey: 'pid_tid_count'
      },
    ];
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }
  /**
   * 初始化表格searchKeys
   */
  public initTableSearchKey() {
    this.searchKeys = [];
    this.searchWords = [];
    this.columns.forEach((column: any) => {
      if (column.searchKey) {
        if (this.searchKeys.indexOf(column.searchKey) === -1) {
          this.searchKeys.push(column.searchKey);
          this.searchWordsSave[column.searchKey] = '';
          this.searchWords.push(this.searchWordsSave[column.searchKey]);
        }
      }
    });
  }

  /**
   * 表头搜索
   */
  public onTableHeaderSearch(searchText: any, column: any) {
    const index = this.searchKeys.indexOf(column.searchKey);
    if (index > -1 && this.searchWords.length > index) {
      this.searchWordsSave[column.searchKey] = searchText ?? '';
      this.searchWords[index] = this.searchWordsSave[column.searchKey];
    }
    if (index > -1 && this.processSearchPop._results?.length > index) {
      const curSearchPop: PopDirective = this.processSearchPop._results[index];
      curSearchPop.hide();
    }
  }
  public viewThreadsData(thread: string) {
    this.panelService.addPanel({
      viewType: 'tuninghelperProcessPidDetailsysPerf',
      title: `${thread}${I18n.tuninghelper.treeDetail.detail}`,
      id: `TuninghelperProcessPidDetail-${this.taskId}-${this.nodeid}-${thread}`,
      router: 'tuninghelperProcessPidDetail',
      message: {
        nodeId: this.nodeid,
        taskId: this.taskId,
        pid: +thread.split('PID')[1].split(')')[0],
        showIndicatorInfo: true
      }
    });
  }
}
