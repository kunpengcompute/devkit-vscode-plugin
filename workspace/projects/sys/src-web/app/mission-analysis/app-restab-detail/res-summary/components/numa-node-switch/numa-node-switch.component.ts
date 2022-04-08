import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef,
   Input, AfterViewInit, ViewChild, Output, EventEmitter, ViewChildren } from '@angular/core';
import { TiTableComponent, TiTableColumns, TiTableRowData, TiTableDataState, TiTableSrcData } from '@cloud/tiny3';

import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { InterfaceService as PublicInterfaceService } from '../../../service/interface.service';
import { PublicMethodService } from '../../../service/public-method.service';
import { InterfaceService } from './service/interface.service';

import { FilterItem } from './domain';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';

@Component({
  selector: 'app-numa-node-switch',
  templateUrl: './numa-node-switch.component.html',
  styleUrls: ['./numa-node-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumaNodeSwitchComponent implements OnInit, AfterViewInit {
  static readonly MAX_PID_TID_SELECTED = 100;

  @Input() taskId: number;
  @Input() nodeId: number;
  @Output() suggListArr = new EventEmitter<any>();

  @ViewChild('tableComponent') tableComponent: TiTableComponent;
  @ViewChild('numaNodeSwitchDetailsModal') numaNodeSwitchDetailsModal: any;
  @ViewChildren('numaSearchPop') numaSearchPop: any;

  public i18n: any;
  public language = 'zh';
  public isLoading = true;
  /** numa切换建议值 */
  public sugNum: number;

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
  public isDisabled: boolean;
  public searchWordsSave: {[key: string]: string} = {};

  constructor(
    private interfaceService: InterfaceService,
    private publicInterfaceService: PublicInterfaceService,
    private cdr: ChangeDetectorRef,
    public i18nService: I18nService,
    public publicMethodService: PublicMethodService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.language = sessionStorage.getItem('language') === 'en-us' ? 'en' : 'zh';
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
      {
        label: this.i18n.sys_res.threadName,
        prop: 'taskname',
        sortKey: 'taskname',
        searchKey: 'taskname',
        filter: { selected: [], list: [], allDisabled: false },
      },
      {
        label: this.i18n.common_term_task_crate_tid,
        prop: 'pid',
        sortKey: 'pid',
        searchKey: 'pid',
        filter: { selected: [], list: [], allDisabled: false },
      },
      {
        label: this.i18n.common_term_task_crate_pid,
        prop: 'ppid',
        sortKey: 'ppid',
        searchKey: 'ppid',
        filter: { selected: [], list: [], allDisabled: false },
      },
      {
        label: this.i18n.sys_res.numaColumn.swtich,
        prop: 'numa_switch_num',
        sortKey: 'numa_switch_num',
        sortStatus: 'desc',
      },
      { label: this.i18n.common_term_operate, prop: 'operate' },
    ];

    this.cdr.markForCheck();
    this.initFilterList();
  }

  /** 初始化筛选框的数据 */
  private initFilterList(): void {
    const filterList: FilterItem[] = [FilterItem.TasknameLis, FilterItem.PidLis, FilterItem.PpidLis];

    this.publicInterfaceService.getFilterList(this.taskId, this.nodeId, filterList).then(data => {
      const tasknameColumn = this.columns.find((column: any) => column.prop === 'taskname');
      const pidColumn = this.columns.find((column: any) => column.prop === 'pid');
      const ppidColumn = this.columns.find((column: any) => column.prop === 'ppid');

      tasknameColumn.filter.list = data.taskname_lis.map(item => ({
        label: this.publicMethodService.transformLabel(item),
        prop: item,
        disabled: true,
      }));
      pidColumn.filter.list = data.pid_lis.map(item => ({
        label: (this.publicMethodService.transformLabel(item)).toString(),
        prop: item,
        disabled: true,
      }));
      ppidColumn.filter.list = data.ppid_lis.map(item => ({
        label: (this.publicMethodService.transformLabel(item)).toString(),
        prop: item,
        disabled: true,
      }));

      tasknameColumn.filter.selected = [...tasknameColumn.filter.list];
      pidColumn.filter.selected = [...pidColumn.filter.list];
      ppidColumn.filter.selected = [...ppidColumn.filter.list];
      this.cdr.markForCheck();
    });
  }

  /**
   * 获取表格数据
   */
  private getTableData(ifInit?: boolean) {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.interfaceService.getTableData(this.taskId, this.nodeId, this.dataState, this.columns, ifInit)
    .then(({ sugg_threshold, list, total, sugg_list }) => {
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
      this.sugNum = sugg_threshold;
      this.suggListArr.emit(sugg_list);
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
      case 'taskname':
        this.singleSizeLimit(0, taskSelected);
        break;
      case 'pid':
        this.singleSizeLimit(1, tidSelected);
        break;
      case 'ppid':
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
    if (selected.length === (NumaNodeSwitchComponent.MAX_PID_TID_SELECTED - 1) && this.isDisabled) {
      this.isDisabled = false;
      this.columns[index].filter.list.forEach((item: any, i: any) => {
        this.columns[index].filter.list[i].disabled = false;
      });
    }
    if (selected.length === NumaNodeSwitchComponent.MAX_PID_TID_SELECTED) {
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
        case 'taskname':
          this.unban(0);
          break;
        case 'pid':
          this.unban(1);
          break;
        case 'ppid':
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

  /** 查看 NUMA节点切换 详情 */
  public viewSwitchDetails(row: any) {
    const tableData: any = [];
    const pathSwitchs: any = {};  // 切换路径相同的次数加一

    row.switches.forEach((switchItem: any) => {
      if (pathSwitchs[switchItem] === undefined) {
        const arr = switchItem.split('->');
        const pathSwitch = `NUMA${arr[0]}-->NUMA${arr[1]}`;
        tableData.push({
          index: tableData.length,
          pathSwitch,
          times: 1,
        });
        pathSwitchs[switchItem] = tableData.length - 1;
      } else {
        tableData[pathSwitchs[switchItem]].times++;
      }
    });

    this.cdr.markForCheck();
    this.numaNodeSwitchDetailsModal.open(tableData);
  }
  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  public onTableHeaderSearch(searchText?: any, column?: any) {
    this.displayed = [];
    this.isLoading = true;
    const target = this.columns[column.index];
    if (this.numaSearchPop._results?.length > column.index) {
        const curSearchPop: PopDirective = this.numaSearchPop._results[column.index];
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
