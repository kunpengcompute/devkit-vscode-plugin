import { ChangeDetectionStrategy, Component, OnInit,
  ChangeDetectorRef, Input, AfterViewInit, ViewChild, ViewChildren } from '@angular/core';
import { TiTableComponent, TiTableColumns, TiTableRowData, TiTableDataState, TiTableSrcData } from '@cloud/tiny3';

import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { InterfaceService as PublicInterfaceService } from '../../../service/interface.service';
import { PublicMethodService } from '../../../service/public-method.service';
import { InterfaceService } from './service/interface.service';
import { ViewDetailsService } from '../../../service/view-details.service';
import { FilterItem } from './domain';
import { SummaryDataService } from '../../../service/summary-data.service';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';

@Component({
  selector: 'app-tpswitch',
  templateUrl: './tpswitch.component.html',
  styleUrls: ['./tpswitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TPSwitchComponent implements OnInit, AfterViewInit {
  static readonly MAX_PID_TID_SELECTED = 100;

  @Input() taskId: number;
  @Input() nodeId: number;

  @ViewChild('tableComponent') tableComponent: TiTableComponent;
  @ViewChildren('processSearchPop') processSearchPop: any;

  public i18n: any;
  public isLoading = true;

  public columns: Array<TiTableColumns> = [];
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: true,
      sorted: true,
      paginated: true,
    }
  };
  public pageNo = 1;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  public total = 0;
  public dataState: TiTableDataState;
  public topList10: any = [];
  public isDisabled: boolean;
  public searchWordsSave: {[key: string]: string} = {};

  constructor(
    private interfaceService: InterfaceService,
    private publicInterfaceService: PublicInterfaceService,
    private cdr: ChangeDetectorRef,
    public i18nService: I18nService,
    public publicMethodService: PublicMethodService,
    private viewDetails: ViewDetailsService,
    private summaryData: SummaryDataService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.initColumns();
  }

  ngAfterViewInit() {
    // 视图初始化之后给 dataState 赋值一次，就不用一直判断 dataState 可能为空
    this.dataState = this.tableComponent.getDataState();

    this.getTableData(true);
  }

  /** 初始化 columns */
  private initColumns(): void {
    this.columns = [
      { label: this.i18n.sys_res.threadName, prop: 'task', sortKey: 'task',
        searchKey: 'task', filter: { selected: [], list: [] }, allDisabled: false },
      { label: this.i18n.common_term_task_crate_tid, prop: 'tid', sortKey: 'pid',
        searchKey: 'pid', filter: { selected: [], list: [] }, allDisabled: false },
      { label: this.i18n.common_term_task_crate_pid, prop: 'pid', sortKey: 'ppid',
        searchKey: 'ppid', filter: { selected: [], list: [] }, allDisabled: false },
      { label: `${this.i18n.sys_res.runningTime} (ms)`, prop: 'runtime', sortKey: 'runtime' },
      { label: this.i18n.sys_res.sum.switches, prop: 'switches', sortKey: 'switches', sortStatus: 'desc' },
      { label: `${this.i18n.sys_res.sum.average_delay} (ms)`, prop: 'avg_delay', sortKey: 'avg_delay' },
      { label: `${this.i18n.sys_res.sum.max_delay} (ms)`, prop: 'max_delay', sortKey: 'max_delay' },
      { label: `${this.i18n.sys_res.sum.max_delay_at} (s)`, prop: 'max_delay_at', sortKey: 'max_delay_at' },
      { label: this.i18n.common_term_operate, prop: 'operate' },
    ];

    this.cdr.markForCheck();
    this.initFilterList();
  }

  /** 初始化筛选框的数据 */
  private initFilterList(): void {
    const filterList: FilterItem[] = [FilterItem.PidList, FilterItem.TidList, FilterItem.TaskList];

    this.publicInterfaceService.getFilterList(this.taskId, this.nodeId, filterList).then(data => {
      const taskColumn = this.columns.find((column: any) => column.prop === 'task');
      const pidColumn = this.columns.find((column: any) => column.prop === 'pid');
      const tidColumn = this.columns.find((column: any) => column.prop === 'tid');

      taskColumn.filter.list = data.task_list.map(item => ({
        label: this.publicMethodService.transformLabel(item),
        prop: item,
        disabled: true,
      }));
      pidColumn.filter.list = data.pid_list.map(item => ({
        label: (this.publicMethodService.transformLabel(item)).toString(),
        prop: item,
        disabled: true,
      }));
      tidColumn.filter.list = data.tid_list.map(item => ({
        label: (this.publicMethodService.transformLabel(item)).toString(),
        prop: item,
        disabled: true,
      }));

      taskColumn.filter.selected = [...taskColumn.filter.list];
      pidColumn.filter.selected = [...pidColumn.filter.list];
      tidColumn.filter.selected = [...tidColumn.filter.list];

      this.summaryData.tpswitchColumn = this.columns.slice(0, -1);
      this.cdr.markForCheck();
    });
  }

  /** 获取表格数据 */
  private getTableData(ifInit?: boolean) {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.interfaceService.getTableData(this.taskId, this.nodeId, this.dataState, this.columns, ifInit)
    .then(({ list, total }) => {
      if (ifInit) {
        this.srcData.data = list;
        this.total = total;
      } else {
        if (this.columns[0].filter.selected.length === 0 || this.columns[1].filter.selected.length === 0 ||
           this.columns[2].filter.selected.length === 0) {
          this.srcData.data = [];
          this.total = 0;
        } else {
          this.srcData.data = list;
          this.total = total;
        }
      }

      if (this.pageNo === 1 && list.length > 0) {
        this.topList10 = list.map((item: any) => {
          return item.tid;
        });
        this.publicInterfaceService.topList10 = this.topList10;
      }

      if (ifInit) {
        this.summaryData.tpswitchOriginData = JSON.parse(JSON.stringify(this.srcData.data));
        this.summaryData.tpswitchTotal = this.total;
        this.summaryData.tpCurrentPage = this.pageNo;
        this.summaryData.tpStatus = this.dataState;
        this.summaryData.tpSize = this.pageSize.size;
      }
    }).finally(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  /** 表格的排序、搜索、分页参数发生了变化 */
  public onStateUpdate(tiTable: TiTableComponent): void {
    this.dataState = tiTable.getDataState();

    setTimeout(() => {
      this.getTableData();
    }, 0);
  }

  /** 筛选表格数据 */
  public filterTableData(prop: string) {
    this.sizeLimit(prop);

    /**
     * 筛选数据时，重置页码为1
     *  不是第一页时修改分页会自动触发 stateUpdate
     *  当前页码是第一页的时候，需要手动调用接口获取数据；
     */
    if (this.pageNo === 1) {
      setTimeout(() => {
        this.getTableData();
      }, 0);
    } else {
      this.pageNo = 1;
    }
  }

  /**
   * 限制筛选大小,最多100个
   */
  private sizeLimit(prop: string) {
    const taskSelected = this.columns[0].filter.selected.map((item: any) => item.label);
    const tidSelected = this.columns[1].filter.selected.map((item: any) => item.label);
    const pidSelected = this.columns[2].filter.selected.map((item: any) => item.label);

    switch (prop) {
      case 'task':
        this.singleSizeLimit(0, taskSelected);
        break;
      case 'tid':
        this.singleSizeLimit(1, tidSelected);
        break;
      case 'pid':
        this.singleSizeLimit(2, pidSelected);
        break;
    }
  }

  /**
   * 单个大小限制
   */
  private singleSizeLimit(
    index: number,
    selected: {
      label: string,
      prop: string,
      disabled: boolean,
    }[],
  ) {
    if (selected.length === (TPSwitchComponent.MAX_PID_TID_SELECTED - 1) && this.isDisabled) {
      this.isDisabled = false;
      this.columns[index].filter.list.forEach((item: any, i: any) => {
        this.columns[index].filter.list[i].disabled = false;
      });
    }
    if (selected.length === TPSwitchComponent.MAX_PID_TID_SELECTED) {
      this.isDisabled = true;
      this.columns[index].filter.list.forEach((item: any, i: any) => {
        this.columns[index].filter.list[i].disabled = !selected.includes(item.label);
      });
    }
  }

  /**
   * 首次点击全选按钮
   */
  public onClickAllCheck(prop: string, AllDisabled: boolean) {
    if (!AllDisabled) {
      switch (prop) {
        case 'task':
          this.unban(0);
          break;
        case 'tid':
          this.unban(1);
          break;
        case 'pid':
          this.unban(2);
          break;
      }
    }
  }

  /**
   * 解除禁用所有按钮,禁用全选按钮
   */
  private unban(index: number) {
    this.columns[index].allDisabled = true;
    this.columns[index].filter.list = this.columns[index].filter.list.map((item: any) => ({
      label: item.label,
      prop: item.prop,
      disabled: false,
    }));
    this.columns[index].filter.selected = [];
  }

  /**
   * 跳转到CPU调度最后一项
   */
  viewSwitchDetails(row: any) {
    this.summaryData.tpswitchOriginData = JSON.parse(JSON.stringify(this.srcData.data));
    this.summaryData.tpswitchTotal = this.total;
    this.summaryData.tpCurrentPage = this.pageNo;
    this.summaryData.tpStatus = this.dataState;
    this.summaryData.tpSize = this.pageSize.size;

    const message = ['tp', row];
    this.viewDetails.subject.next(message);
  }
  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  public onTableHeaderSearch(searchText?: any, column?: any) {
  this.displayed = [];
  const target = this.columns[column.index];
  if (this.processSearchPop._results?.length > column.index) {
      const curSearchPop: PopDirective = this.processSearchPop._results[column.index];
      curSearchPop.hide();
  }
  if (searchText) {
      this.searchWordsSave[column.key] = searchText;
      target.filter.selected = target.filter.list.filter((item: any) => {
          return item.prop ? JSON.stringify(item.prop).indexOf(searchText) >= 0 : false;
      });
  } else {
      this.searchWordsSave[column.key] = '';
      target.filter.selected = target.filter.list;
  }
  this.pageNo = 1;
  this.getTableData();
  }
}
