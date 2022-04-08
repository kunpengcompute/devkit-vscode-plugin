import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, NgZone, ViewChildren } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableDataState, TiTableComponent, TiModalService } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { NumaNodeSwitchSortKey, SortStatus, InterfaceService } from '../../service/interface.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { PopDirective } from '../../directives/pop/pop.directive';

@Component({
    selector: 'app-numa-detail',
    templateUrl: './numa-detail.component.html',
    styleUrls: ['./numa-detail.component.scss']
})
export class NumaDetailComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() isActive: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @ViewChild('numaNodeSwitchDetailsModal', { static: false }) numaNodeSwitchDetailsModal;
    @ViewChildren('numaSearchPop') numaSearchPop: any;
    public sugNum;  // numa切换建议值
    public language = 'zh';
    public i18n: any;
    public numaNodeSwitchTable = {  // NUMA节点切换表格
        displayed: ([] as Array<TiTableRowData>),
        srcData: {
            data: [],
            state: {
                searched: false,
                sorted: true,
                paginated: true,
            }
        },
        dataState: (undefined as TiTableDataState),
        columns: ([] as Array<TiTableColumns>),
        selectedPidList: [],
        pidList: [],
        selectedPpidList: [],
        ppidList: [],
        sortBy: undefined,
        sortStatus: undefined,
        pageNo: 1,
        pageSize: {
            options: [10, 20, 40, 80, 100],
            size: 10
        },
        total: 0,
    };

    public numaNodeSwitchDetailsTable = {  // NUMA节点切换详情表格
        displayed: ([] as Array<TiTableRowData>),
        srcData: {
            data: [],
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        },
        columns: ([] as Array<TiTableColumns>),
        pageNo: 1,
        pageSize: {
            options: [10, 20, 40, 80, 100],
            size: 10
        },
        total: 0,
    };
    public columns: Array<TiTableColumns> = [];
    public displayedLog: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;

    public columsLog: Array<TiTableColumns> = [];

    public showLoading = false;
    public searchWordsSave: {[key: string]: string} = {};

    constructor(
        public mytip: MytipService,
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        private tiModal: TiModalService,
        public requestService: InterfaceService,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.i18n = this.i18nService.I18n();
        this.numaNodeSwitchTable.columns = [
            {
                label: this.i18n.sys_res.numaColumn.thread_name, prop: 'taskname', sortKey: 'taskname',
                searchKey: 'taskname', filter: { selected: [], list: [] },
                key: this.i18n.sys_res.numaColumn.thread_name
            },
            {
                label: this.i18n.common_term_task_crate_tid, prop: 'pid', sortKey: 'pid',
                searchKey: 'pid', filter: { selected: [], list: [] },
                key: this.i18n.common_term_task_crate_tid
            },
            {
                label: this.i18n.common_term_task_crate_pid, prop: 'ppid', sortKey: 'ppid',
                searchKey: 'ppid', filter: { selected: [], list: [] },
                key: this.i18n.common_term_task_crate_pid
            },
            {
                label: this.i18n.sys_res.numaColumn.swtich, prop: 'numa_switch_num',
                sortKey: 'numa_switch_num', sortStatus: 'desc'
            },
            { label: this.i18n.common_term_operate, prop: 'operate' },
        ];

        this.numaNodeSwitchDetailsTable.columns = [
            { label: this.i18n.sys_res.conversion, sortKey: 'pathSwitch' },
            { label: this.i18n.sys_res.frequency, sortKey: 'times' }
        ];
    }

    /**
     * 初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.columsLog = [
            {
                title: this.i18n.sys_res.conversion,
                width: '60%',
                sortKey: 'name'
            },
            {
                title: this.i18n.sys_res.frequency,
                width: '40%',
                sortKey: 'times'
            }
        ];

        this.showLoading = true;
        this.initFilterList();
        this.updateWebViewPage();
    }


    /**
     * 初始化筛选框的数据
     */
    private initFilterList() {
        this.requestService.getList(this.taskid, this.nodeid, ['taskname_lis', 'pid_lis', 'ppid_lis'])
            .subscribe((res: any) => {
            // NUMA节点切换
            const tasklist = res.data.taskname_lis.map(item => {
                return {
                    label: Utils.transformLabel(item),
                    prop: item,
                };
            });
            this.numaNodeSwitchTable.columns[0].filter.list = tasklist;
            this.numaNodeSwitchTable.columns[0].filter.selected = tasklist;

            const pidList = res.data.pid_lis.map(item => {
                return {
                    label: Utils.transformLabel(item),
                    prop: item,
                };
            });
            this.numaNodeSwitchTable.columns[1].filter.list = pidList;
            this.numaNodeSwitchTable.columns[1].filter.selected = pidList;

            const ppidList = res.data.ppid_lis.map(item => {
                return {
                    label: Utils.transformLabel(item),
                    prop: item,
                };
            });
            this.numaNodeSwitchTable.columns[2].filter.list = ppidList;
            this.numaNodeSwitchTable.columns[2].filter.selected = ppidList;

            this.getNumaNodeSwitchData({
                sortBy: 'numa_switch_num',
                sortStatus: 'desc',
            });
            this.updateWebViewPage();
        });
    }

    /**
     * 获取 NUMA节点切换 数据
     * @param param0 boolean
     */
    public getNumaNodeSwitchData({
        pageIndex = this.numaNodeSwitchTable.pageNo,
        pageSize = this.numaNodeSwitchTable.pageSize.size,
        sortBy,
        sortStatus,
    }: {
        pageIndex?: number,
        pageSize?: number,
        sortBy?: NumaNodeSwitchSortKey,
        sortStatus?: SortStatus,
    }) {
        let tasknameList: string;
        let TidList: string;
        let PidList: string;

        const threadNameColumn = this.numaNodeSwitchTable.columns[0].filter.selected;
        const pidColumn = this.numaNodeSwitchTable.columns[1].filter.selected;
        const ppidColumn = this.numaNodeSwitchTable.columns[2].filter.selected;

        if (threadNameColumn.length !== 0) {
            tasknameList = threadNameColumn.map(option => option.prop).join(',');
        }
        if (pidColumn.length !== 0) {
            TidList = pidColumn.map(option => option.prop).join(',');
        }
        if (ppidColumn.length !== 0) {
            PidList = ppidColumn.map(option => option.prop).join(',');
        }

        if (tasknameList && TidList && PidList) {
            this.requestService.getNumaNodeSwitchData({
                taskId: this.taskid,
                nodeId: this.nodeid,
                pageNo: pageIndex,
                pageSize,
                sortBy,
                sortStatus,
                tasknameList,
                TidList,
                PidList,
            }).subscribe((res: any) => {
                this.sugNum = res.data.sugg_threshold || 1000;
                res.data.list.forEach((item: { taskname: any; pid: any; ppid: any; }) => {
                    item.taskname = Utils.transformLabel(item.taskname);
                    item.pid = Utils.transformLabel(item.pid);
                    item.ppid = Utils.transformLabel(item.ppid);
                });

                this.numaNodeSwitchTable.srcData.data = res.data.list;
                this.numaNodeSwitchTable.total = res.data.total;

                this.showLoading = false;
                this.updateWebViewPage();
            });
        } else {
            this.numaNodeSwitchTable.displayed = [];
            this.showLoading = false;
        }
    }

    /**
     * 表格筛选
     */
    onSelect() {
        this.numaNodeSwitchTable.pageNo = 1;
        this.getNumaNodeSwitchData({});
    }

    /**
     * numa更新
     * @param tiTable table
     */
    public numaNodeSwitchTableStateUpdate(tiTable: TiTableComponent): void {
        this.numaNodeSwitchTable.displayed = [];
        this.showLoading = true;
        const dataState: TiTableDataState = tiTable.getDataState();
        const params: any = {
            pageIndex: dataState.pagination.currentPage,
            pageSize: dataState.pagination.itemsPerPage,
            sortBy: undefined,
            sortStatus: '',
        };
        if (dataState.sort.sortKey && (dataState.sort.asc !== null)) {
            params.sortBy = dataState.sort.sortKey;
            params.sortStatus = dataState.sort.asc ? 'asc' : 'desc';
        }

        this.getNumaNodeSwitchData(params);
    }

    /**
     * 展示弹窗
     * @param data 数据
     */
    public showSwitch(data, content) {
        const nameList = [];
        data.switches.forEach(item => {
            const arr = item.split('->');
            nameList.push('NUMA' + arr[0] + ',' + 'NUMA' + arr[1]);
        });
        const showlList = [];
        // 去重
        const resList = new Set([...nameList]);
        resList.forEach(item => {
            const name = item.replace(/,/g, '-->');
            showlList.push({
                Oname: item,
                name,
                times: 0
            });
        });
        nameList.forEach(item => {
            showlList.forEach(item2 => {
                if (item === item2.Oname) {
                    item2.times++;
                }
            });
        });
        this.numaNodeSwitchDetailsTable.total = showlList.length;
        this.numaNodeSwitchDetailsTable.srcData.data = showlList;

        this.tiModal.open(content, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'switchingTimes',
            draggable: false,
            closeIcon: false,
        });
        this.updateWebViewPage();
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
        this.numaNodeSwitchTable.displayed = [];
        this.showLoading = true;
        const target = this.numaNodeSwitchTable.columns[column.index];
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
        this.numaNodeSwitchTable.pageNo = 1;
        this.getNumaNodeSwitchData({});
        this.updateWebViewPage();
    }
}
