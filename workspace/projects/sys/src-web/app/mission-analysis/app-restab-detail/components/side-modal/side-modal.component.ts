import { Component, OnInit, AfterViewInit, Output, Input,
  ViewChild, EventEmitter, ChangeDetectorRef, ViewChildren } from '@angular/core';
import { TiTableDataState, TiTableComponent, TiTableRowData } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { InterfaceService as TpService } from '../../res-summary/components/tpswitch/service/interface.service';
import { InterfaceService as PublicInterfaceService } from '../../service/interface.service';
import { SummaryDataService } from '../../service/summary-data.service';
import { PublicMethodService } from '../../service/public-method.service';
@Component({
  selector: 'app-side-modal',
  templateUrl: './side-modal.component.html',
  styleUrls: ['./side-modal.component.scss']
})
export class SideModalComponent implements OnInit, AfterViewInit {
  @Input() type: string;
  @Input() taskId: number;
  @Input() nodeId: number;
  public tpItem: object|string|null;
  public timer: number;
  @Input()  // summary 页跳转来, 进程线程调度页面没有跳转,做特殊处理
  get item(): object|string|null { return this.tpItem; }
  set item(item) {
    this.tpItem = item;
    if (this.tpItem !== null) {
      if (this.timer) { clearTimeout(this.timer); }
      this.timer = window.setTimeout(() => {
        this.initItem();
      }, 200);

    }

  }
  @Output() confimSelect = new EventEmitter();
  @ViewChild('selectTaskModal') selectTaskModal: any;
  @ViewChild('tableComponent') tableComponent: TiTableComponent;
  @ViewChildren('processSearchPop') processSearchPop: any;
  // 侧滑框数据
  public isInit = false;
  public isLoading = false;
  public columns: { prop: any; filter: { list: any[]; selected: any[]} }[] = []; // 展示的表头
  // 默认显示的列
  public defaultColumns: any[] = [];
  // 可筛选的列
  public filterColumns: any[] = [];
  // 筛选列中已选中的列
  public filterColumnsCheckeds: any[] = [];
  public currentPage = 1;
  public beforeSwitchPage = 1;
  public selectedColumns: any[] = [];
  public totalNumber = 0;
  public originTotal = 0;
  public lastSelected: any;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  public checkedList: any[] = []; // 选中线程
  public preCheckList: Array<any> = []; // 暂存表格选中项以便取消时回填
  public displayed: Array<TiTableRowData> = [];
  public dataState: TiTableDataState;
  public srcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: true,
      sorted: true,
      paginated: true,
    }
  };

  public tagDisabled = false;
  public switchShow = true; // 侧滑框表格选中展示数据切换
  public headShow = false; // 表头下拉框显示隐藏
  public i18n: any;

  public originColumns: any[] = [];
  public originData: any;
  public typeService: any;
  public topList10: Array<any>; // 表格默认选中项
  public disabledArr = ['task', 'tid', 'pid'];
  public searchWordsSave: {[key: string]: string} = {};
  private checkListBak: any[] = [];

  constructor(public i18nService: I18nService,
              private publicInterfaceService: PublicInterfaceService,
              private tpService: TpService,
              private summaryData: SummaryDataService,
              public publicMethodService: PublicMethodService,
              private cdr: ChangeDetectorRef, ) {
    this.i18n = this.i18nService.I18n();
  }
  ngOnInit(): void {
    this.topList10 = this.publicInterfaceService.topList10;
  }

  ngAfterViewInit(): void {
    this.dataState = this.tableComponent.getDataState();
  }

  /**
   * 初始化选中项
   */
  public initItem() {
      this.originColumns = JSON.parse(JSON.stringify(this.summaryData.tpswitchColumn));
      this.originData = JSON.parse(JSON.stringify(this.summaryData.tpswitchOriginData));
      this.typeService = this.tpService;
      this.totalNumber = this.summaryData.tpswitchTotal;
      this.currentPage = this.summaryData.tpCurrentPage;
      this.dataState = JSON.parse(JSON.stringify(this.summaryData.tpStatus));
      this.pageSize.size = this.summaryData.tpSize;

      this.originColumns.forEach((ele: { filter: { selected: any[]; list: any; }; }) => {
        if (Object.prototype.hasOwnProperty.call(ele, 'filter')) {
          ele.filter.selected = [...ele.filter.list];
        }
      });
      this.defaultColumns = this.originColumns.filter((ele => this.disabledArr.includes(ele.prop)));
      this.filterColumns = this.originColumns.filter((ele => !this.disabledArr.includes(ele.prop)));
      this.columns = JSON.parse(JSON.stringify(this.defaultColumns.concat(this.filterColumns.slice(0, 2))));

      this.filterColumns.forEach((ele, index) => {
        if (index < 2) {
          this.filterColumnsCheckeds.push(ele);
        } else {
          ele.disabled = true;
        }
      });

      this.selectedColumns = JSON.parse(JSON.stringify(this.columns));
      this.originTotal = this.totalNumber;
      this.originData = this.originData.map((val: { [x: string]: boolean; }) => {
        val.disabled = false;
        return val;
      });
      this.srcData.data = this.originData;

    // 默认展示top10, 从总览跳转来展示item
      if (this.tpItem && this.tpItem !== 'numa') {
      this.checkedList = this.srcData.data.filter((val: { tid: any; }) => {
        return this.item === val.tid;
      });
    } else {
      this.checkedList = this.topList10.map(el => {
          return { tid: el };
      });
      this.topList10.forEach((el, idx) => {
        const item = this.srcData.data.find((val: { tid?: any; }) => {
          return el === val.tid;
        });
        if (item) {
          this.checkedList.splice(idx, 1, item);
        }
      });
    }
  }

  // 侧滑框 表头筛选
  public HeaderChange() {
    this.columns = this.defaultColumns.concat(this.filterColumnsCheckeds);
    const length = this.columns.length;
    const selected = this.columns.map((val: { prop: any; }) => {
      return val.prop;
    });
    this.filterColumns.forEach((el: { prop: any; disabled: boolean; }) => {
      // 为5条的时候不在表格列中的项禁用
      if (length > 4) {
        el.disabled = selected.indexOf(el.prop) === -1 ? true : false;
      } else {
        el.disabled = false;
      }
    });
  }

  /** 点击筛选弹框的确定按钮 */
  public confimModal() {
    this.tpItem = null;
    this.selectTaskModal.CloseIO();
    this.confimSelect.emit(this.checkedList);
  }

  /**
   * tag删除事件, 选中项同步
   */
  public deleteTag(taskItem: { prop: any; }){
    this.checkedList = this.checkedList.filter((item: { tid: any; }) => {
      return taskItem.prop !== item.tid;
    });
  }


  /**
   * 打开侧滑框
   */
  public open() {
    this.selectTaskModal.Open();
    this.preCheckList = [...this.checkedList];
  }

/**
 * 侧滑框取消按钮
 * @param str 点击遮罩层或者取消按钮
 */
   public onSelectCancel(str?: string) {
    if (str !== 'mask') {
      this.selectTaskModal.CloseIO();
    }
    this.checkedList = [...this.preCheckList];
  }

  // 切换选中展示 开关
  public switchData(e: any) {
    this.switchShow = !this.switchShow;
    this.searchWordsSave = {};
    if (!this.switchShow) {
      this.beforeSwitchPage = this.currentPage;
      this.checkListBak = this.checkedList.length > 0 ? JSON.parse(JSON.stringify(this.checkedList)) : [];
      this.selectedColumns[0].filter.selected = this.selectedColumns[0].filter.list;
      this.selectedColumns[2].filter.selected = this.selectedColumns[2].filter.list;
      this.selectedColumns[1].filter.selected = this.checkedList.map((val) => {
          return {label: val.tid, prop: val.tid};
      });
      if (this.currentPage !== 1){
        this.currentPage = 1; // 自动触发请求
      }else {
        this.getTableData(this.selectedColumns);
      }

    } else {
      this.columns[0].filter.selected = this.columns[0].filter.list;
      this.columns[1].filter.selected = this.columns[1].filter.list;
      this.columns[2].filter.selected = this.columns[2].filter.list;
      if (this.currentPage === this.beforeSwitchPage){
        this.getTableData();
      }else {
        this.currentPage = this.beforeSwitchPage;
      }
    }

  }

  /** 获取表格数据 */
  private getTableData(col?: object[]) {
    this.isLoading = true;
    this.cdr.markForCheck();
    let columsTarget = this.columns;
    if (!this.switchShow){
      columsTarget = this.selectedColumns;
    }

    this.typeService.getTableData(this.taskId, this.nodeId, this.dataState, columsTarget, false).then((res: any) => {
      this.srcData.data = res.list;
      this.totalNumber = res.total;
      const originCheckList = this.checkedList.map((val: any) => val.tid);
      res.list.forEach((item: { tid: any; }) => {
        let idx = -1;
        idx = originCheckList.indexOf(item.tid);
        // 应对后端分页, 请求完数据替换选中项,以保留选中状态
        if (idx > -1) {
          this.checkedList.splice(idx, 1, item);
        }
      });


    }).finally(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  /**
   * 表格的排序、搜索、分页参数发生了变化
   * 由于summary页面pagesize等发生变化, 导致该处会有重复请求
   */
  public onStateUpdate(tiTable: TiTableComponent): void {
    this.dataState = tiTable.getDataState();
    setTimeout(() => {
      this.getTableData();
    }, 0);
  }

  /** 筛选表格数据 */
  public filterTableData() {
    /**
     * 筛选数据时，重置页码为1
     *  不是第一页时修改分页会自动触发 stateUpdate
     *  当前页码是第一页的时候，需要手动调用接口获取数据；
     */
    if (this.currentPage === 1) {
      setTimeout(() => {
        this.getTableData();
      }, 0);
    } else {
      this.currentPage = 1;
    }
  }
  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  public onTableHeaderSearch(searchText?: any, column?: any) {
    this.srcData.data = [];
    this.searchWordsSave[column.key] = searchText ?? '';
    const pop = document.getElementsByClassName('side-modal-pop')[0] as HTMLElement;
    if (pop) {
      pop.style.display = 'none';
    }
    const isSelect = this.handleSelectedData();
    this.currentPage = 1;
    if (isSelect) {
      this.getTableData();
    } else {
      this.totalNumber = 0;
    }
  }
  private handleSelectedData() {
    let isSelect = true;
    const columns = this.switchShow ? this.columns : this.selectedColumns;
    columns.forEach((column: any) => {
      if (column.searchKey) {
        const target = this.switchShow ? column.filter.list : JSON.parse(JSON.stringify(this.checkListBak));
        column.filter.selected = target.filter((check: any) => {
          if (!this.switchShow) {
            check.prop = check[column.prop] === '[unknown]' ? '-1' : check[column.prop];
          }
          if (!this.searchWordsSave[column.searchKey]) {
            return true;
          } else {
            return check.prop ? JSON.stringify(check.prop).indexOf(this.searchWordsSave[column.searchKey]) >= 0 : false;
          }
        });
        if (column.filter.selected.length === 0) {
          isSelect = false;
        }
      }
    });
    return isSelect;
  }
}
