import {
    Component, OnInit, Output, Input, ViewChild, EventEmitter, ChangeDetectorRef, NgZone, ViewChildren
} from '@angular/core';
import { TiTableDataState, TiTableComponent, TiTableRowData, TiModalService } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { InterfaceService } from '../../../service/interface.service';
import { ViewDetailsService } from '../../../service/view-details.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
@Component({
    selector: 'app-side-modal',
    templateUrl: './side-modal.component.html',
    styleUrls: ['./side-modal.component.scss']
})
export class SideModalComponent implements OnInit {
    @Input() taskId: number;
    @Input() nodeId: number;
    public tpItem: object | string | null;
    public timer: number;
    // summary 页跳转来, 进程线程调度页面没有跳转,做特殊处理
    @Input()
    get item(): object | string | null { return this.tpItem; }
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
    @ViewChild('tableComponent', { static: false }) tableComponent: TiTableComponent;
    @ViewChild('selectCpuModal', { static: false }) public selectCpuModal: any;
    @ViewChildren('processSearchPop') processSearchPop: any;
    public timeChartConfigModal: any;
    // 侧滑框数据
    public isInit = false;
    public isLoading = false;
    public columns: { prop: any; filter: { list: any[]; selected: any[] } }[] = [];
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
    public srcNumber = 0;
    public originTotal = 0;
    public lastSelected: any;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 40, 80, 100],
        size: 10
    };
    public checkedList: any[] = [];
    public preCheckList: Array<any> = [];
    public displayed: Array<TiTableRowData> = [];
    public dataState: TiTableDataState;
    public srcData = {
        data: ([] as Array<TiTableRowData>),
        state: {
            searched: false,
            sorted: true,
            paginated: true,
        }
    };

    public tagDisabled = false;
    // 侧滑框表格选中展示数据切换
    public switchShow = true;
    // 表头下拉框显示隐藏
    public headShow = false;
    public i18n: any;

    public originColumns: any[] = [];
    public originData: any;
    public topList10: Array<any>;
    public disabledArr = ['task', 'tid', 'pid'];
    public searchWordsSave: { [key: string]: string } = {};
    private checkListBak: any = [];

    constructor(
        public i18nService: I18nService,
        private tpService: InterfaceService,
        public summaryData: ViewDetailsService,
        private cdr: ChangeDetectorRef,
        private tiModal: TiModalService,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone) {
        this.i18n = this.i18nService.I18n();
    }
    ngOnInit(): void {
        this.topList10 = this.summaryData.topList10;
    }

    /**
     * 初始化选中项
     */
    public initItem() {
        this.originColumns = this.summaryData.tpswitchColumn;
        this.originData = this.summaryData.tpswitchOriginData;
        this.totalNumber = this.summaryData.tpswitchTotal;
        this.srcNumber = this.totalNumber;
        this.currentPage = this.summaryData.tpCurrentPage;
        this.dataState = this.summaryData.tpStatus;
        this.pageSize.size = this.summaryData.tpSize;

        this.originColumns.forEach(
          (ele: { filter: { selected: any[]; list: any } }) => {
            if (Object.prototype.hasOwnProperty.call(ele, 'filter')) {
              ele.filter.selected = [...ele.filter.list];
            }
          }
        );
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
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
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
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        }
    }

    /** 点击筛选弹框的确定按钮 */
    public confimModal(context: { close: () => void; }) {
        this.tpItem = null;
        this.preCheckList = [];
        this.confimSelect.emit(this.checkedList);
        context.close();
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        }
    }
    /**
     * tag删除事件, 选中项同步
     */
    public deleteTag(taskItem: { prop: any; }) {
        this.checkedList = this.checkedList.filter((item: { tid: any; }) => {
            return taskItem.prop !== item.tid;
        });
    }


    /**
     * 打开侧滑框
     */
    public open() {
        this.timeChartConfigModal = this.tiModal.open(this.selectCpuModal, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'selectCpuModal',
            modalClass: 'timeChartConfigModal',
            draggable: false
        });
        // 若从总览跳转来, 取消弹框, 不会回填表格
        if (this.preCheckList.length > 0 && (!this.tpItem || this.tpItem === 'numa')) {
            this.checkedList = [...this.preCheckList];
        } else {
            this.preCheckList = [...this.checkedList];
            setTimeout(() => {
                this.tpItem = null;
            }, 300);
        }


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
                return { label: val.tid, prop: val.tid };
            });
            if (this.currentPage !== 1) {
                // 自动触发请求
                this.currentPage = 1;
            } else {
                this.getTableData(this.selectedColumns);
            }
            this.srcNumber = this.checkedList.length;
        } else {
            this.columns[0].filter.selected = this.columns[0].filter.list;
            this.columns[1].filter.selected = this.columns[1].filter.list;
            this.columns[2].filter.selected = this.columns[2].filter.list;
            if (this.currentPage === this.beforeSwitchPage) {
                this.getTableData();
            } else {
                this.currentPage = this.beforeSwitchPage;
            }
            this.totalNumber = this.originTotal;
            this.srcNumber = this.totalNumber;
        }

    }

    /** 获取表格数据 */
    private getTableData(col?: object[]) {
        this.isLoading = true;
        let columsTarget = this.columns;
        if (!this.switchShow) {
            columsTarget = this.selectedColumns;
        }
        this.tpService.getTableData(this.taskId, this.nodeId, this.dataState, columsTarget).subscribe(((res: any) => {
            if (Object.keys(res.data).length !== 0) {
                // 将线程名、pid、tid中值为 -1 的部分替换成 [unknown] 显示
                res.data.data.forEach((item: { task: string; tid: string; pid: string; }) => {
                    item.task = Utils.transformLabel(item.task);
                    item.tid = Utils.transformLabel(item.tid);
                    item.pid = Utils.transformLabel(item.pid);
                });
                this.srcData.data = res.data.data;
                if (this.switchShow) {
                    this.totalNumber = res.data.total_num;
                    this.srcNumber = this.totalNumber;
                } else {
                    this.srcNumber = res.data.total_num;
                }
                const originCheckList = this.checkedList.map((val: any) => val.tid);
                res.data.data.forEach((item: { tid: any; }) => {
                    let idx = -1;
                    idx = originCheckList.indexOf(item.tid);
                    // 应对后端分页, 请求完数据替换选中项,以保留选中状态
                    if (idx > -1) {
                        this.checkedList.splice(idx, 1, item);
                    }
                });
            }
            this.isLoading = false;
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }
            this.updateWebViewPage();
        }));
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
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
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
            this.updateWebViewPage();
        } else {
            this.srcNumber = 0;
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
                    check.prop = check[column.prop];
                }
                if (!this.searchWordsSave[column.searchKey]) {
                  return true;
                } else {
                  return check.prop ? JSON.stringify(check.prop).indexOf(this.searchWordsSave[column.searchKey]) >= 0
                        : false;
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
