// 资源调度分析_总览
import {
    Component,
    OnInit,
    Input,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
    NgZone,
    ViewChildren
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { TiTableColumns, TiTableRowData, TiTableDataState, TiTableComponent } from '@cloud/tiny3';
import { MytipService } from 'projects/sys/src-ide/app/service/mytip.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { InterfaceService } from '../../service/interface.service';
import { ViewDetailsService } from '../../service/view-details.service';
import { PopDirective } from '../../directives/pop/pop.directive';

@Component({
    selector: 'app-res-summury',
    templateUrl: './res-summury.component.html',
    styleUrls: ['./res-summury.component.scss']
})
export class ResSummuryComponent implements OnInit, AfterViewInit {
    @ViewChild('tableComponent') tableComponent: TiTableComponent;
    @ViewChildren('processSearchPop') processSearchPop: any;
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() isActive: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    i18n: any;
    public language = 'zh';
    public isSearch = false;
    public TPSwitchTable = {
        displayed: ([] as Array<TiTableRowData>),
        allData: [],
        srcData: {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        },
        dataState: (undefined as TiTableDataState),
        columns: ([] as Array<TiTableColumns>),
        currentPage: 1,
        pageSize: {
            options: [10, 20, 40, 80, 100],
            size: 10
        },
        total: 0,
    };
    public inputValue = '';

    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public showLoading = false;
    public searchWordsSave: {[key: string]: string} = {};

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public mytip: MytipService,
        public requestService: InterfaceService,
        private viewDetails: ViewDetailsService,
        private changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone
    ) {
        this.i18n = this.i18nService.I18n();
        this.TPSwitchTable.columns = [
            {
                label: this.i18n.sys_res.numaColumn.thread_name,
                prop: 'task',
                sortKey: 'task',
                searchKey: 'task',
                filter: {
                    selected: [],
                    list: []
                }
            },
            {
                label: 'TID',
                prop: 'tid',
                sortKey: 'pid',
                searchKey: 'pid',
                filter: { selected: [], list: [] }
            },
            {
                label: 'PID',
                prop: 'pid',
                sortKey: 'ppid',
                searchKey: 'ppid',
                filter: { selected: [], list: [] }
            },
            { label: this.i18n.sys_res.sum.running_time, prop: 'runtime', sortKey: 'runtime' },
            { label: this.i18n.sys_res.sum.switches, prop: 'switches', sortKey: 'switches', sortStatus: 'desc' },
            { label: this.i18n.sys_res.sum.average_delay, prop: 'avg_delay', sortKey: 'avg_delay' },
            { label: this.i18n.sys_res.sum.max_delay, prop: 'max_delay', sortKey: 'max_delay' },
            { label: this.i18n.sys_res.sum.max_delay_at, prop: 'max_delay_at', sortKey: 'max_delay_at' },
            { label: this.i18n.common_term_operate, prop: 'operate' },
        ];
        this.totalResults.Elapsed.label = this.i18n.common_term_task_tab_summary_other_time;
    }

    public totalResults: any = {
        Elapsed: {
            label: '',
            value: undefined,
            digitsInfo: undefined,
        },
        Cycles: '',
        Instructions: '',
        IPC: ''
    };

    public platformInfo: any = {
        system: '',
        name: '',
        size: '',
        startTime: '',
        endTime: ''
    };

    /**
     * 刷新统计数据
     */
    public refreshStatistics() {
        const paramSummary = {
            'node-id': this.nodeid,
            'nav-name': 'Summary'
        };
        let url = `/tasks/${this.taskid}/common/total-results/?`;
        url += Utils.converUrl(paramSummary);
        this.vscodeService.get({ url }, res => {
            if (res.data) {
                for (const [i] of res.data.entries()) {
                    if (res.data[i].metric === 'Elapsed Time(s)') {
                        this.totalResults.Elapsed.value = res.data[i].value;
                    }
                    if (res.data[i].metric === 'Cycles') {
                        this.totalResults.Cycles = res.data[i].value;
                    }
                    if (res.data[i].metric === 'Instructions') {
                        this.totalResults.Instructions = res.data[i].value;
                    }
                    if (res.data[i].metric === 'IPC') {
                        this.totalResults.IPC = res.data[i].value;
                    }
                }
            }
        });
    }

    /**
     * 刷新信息
     */
    public refreshInfo() {
        const paramSummary = {
            'node-id': this.nodeid,
            'nav-name': 'Summary'
        };
        let url = `/tasks/${this.taskid}/common/platform/?`;
        url += Utils.converUrl(paramSummary);
        this.vscodeService.get({ url }, res => {
            if (res.data) {
                this.platformInfo.system = res.data[0]['Operating System'];
                this.platformInfo.name = res.data[0]['Computer Name'];
                this.platformInfo.size = res.data[0]['Result Size'];
                this.platformInfo.startTime = res.data[0]['Collection start time'];
                this.platformInfo.endTime = res.data[0]['Collection end time'];
            }
            this.updateWebViewPage();
        });
        this.updateWebViewPage();
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

        // 语言切换
        this.language = I18nService.getLang() === 0 ? 'zh' : 'en';

        this.showLoading = true;

        // 总览-统计：launch application模式下是运行时长，其他模式是任务采集时长
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/common/configuration/?node-id=' + this.nodeid
        }, res => {
            const analysisTarget = res.data['analysis-target'];

            if (analysisTarget.indexOf('Launch') > -1) {
                this.totalResults.Elapsed.label = this.i18n.common_term_task_tab_summary_launch_time;
                this.totalResults.Elapsed.digitsInfo = '0.6-6';
            }
        });
    }

    ngAfterViewInit() {
        // 视图初始化之后给 dataState 赋值一次，就不用一直判断 dataState 可能为空
        this.TPSwitchTable.dataState = this.tableComponent.getDataState();
        this.initFilterList();
    }

    /**
     * 初始化筛选框的数据
     */
    private initFilterList() {
        this.requestService
            .getList(this.taskid, this.nodeid, ['pid_list', 'tid_list', 'task_list'])
            .subscribe((res: any) => {
                const tasklist = res.data.task_list.map(item => {
                    return {
                        label: Utils.transformLabel(item),
                        prop: item,
                    };
                });
                this.TPSwitchTable.columns[0].filter.list = tasklist;
                this.TPSwitchTable.columns[0].filter.selected = tasklist;

                const pidList = res.data.tid_list.map(item => {
                    return {
                        label: Utils.transformLabel(item),
                        prop: item,
                    };
                });
                this.TPSwitchTable.columns[1].filter.list = pidList;
                this.TPSwitchTable.columns[1].filter.selected = pidList;

                const ppidList = res.data.pid_list.map(item => {
                    return {
                        label: Utils.transformLabel(item),
                        prop: item,
                    };
                });
                this.TPSwitchTable.columns[2].filter.list = ppidList;
                this.TPSwitchTable.columns[2].filter.selected = ppidList;

                this.getTableData(true);
                this.viewDetails.tpswitchColumn = this.TPSwitchTable.columns.slice(0, -1);
            });
    }

    /**
     *  获取 进程/线程切换 数据
     */
    public getTableData(isInit?: boolean) {
        this.showLoading = true;
        let tasknameList: string;
        let TidList: string;
        let PidList: string;

        const threadNameColumn = this.TPSwitchTable.columns[0].filter.selected;
        const pidColumn = this.TPSwitchTable.columns[1].filter.selected;
        const ppidColumn = this.TPSwitchTable.columns[2].filter.selected;

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

            this.requestService
                .getTableData(this.taskid, this.nodeid, this.TPSwitchTable.dataState, this.TPSwitchTable.columns)
                .subscribe((res: any) => {
                    if (Object.keys(res.data).length !== 0) {
                        const resData = res.data.data.map((val: { [x: string]: any; }) => {
                            Object.keys(val).forEach(el => {
                                if (['task', 'tid', 'pid'].includes(el)) {
                                    val[el] = Utils.transformLabel(val[el]);
                                }
                            });
                            return val;
                        });

                        this.TPSwitchTable.displayed = resData;
                        this.TPSwitchTable.total = res.data.total_num;
                        if (isInit && res.data.data.length > 0) {
                            this.viewDetails.topList10 = res.data.data.map((item: any) => {
                                return item.tid;
                            });
                            this.viewDetails.tpswitchOriginData = JSON.parse(JSON.stringify(res.data.data));
                            this.viewDetails.tpswitchTotal = this.TPSwitchTable.total;
                            this.viewDetails.tpCurrentPage = this.TPSwitchTable.currentPage;
                            this.viewDetails.tpStatus = this.TPSwitchTable.dataState;
                            this.viewDetails.tpSize = this.TPSwitchTable.pageSize.size;
                        }
                    }

                    this.showLoading = false;
                    this.updateWebViewPage();
                });
        } else {
            this.TPSwitchTable.displayed = [];
            this.showLoading = false;
        }
        this.updateWebViewPage();
    }

    /** 表格的排序、搜索、分页参数发生了变化 */
    public onStateUpdate(tiTable: TiTableComponent): void {
        this.TPSwitchTable.dataState = tiTable.getDataState();
        setTimeout(() => {
            this.getTableData();
        }, 0);
        this.updateWebViewPage();
    }

    /**
     * 跳转到CPU调度最后一项
     */
    viewSwitchDetails(row: any) {

        this.viewDetails.tpswitchOriginData = JSON.parse(JSON.stringify(this.TPSwitchTable.displayed));
        this.viewDetails.tpswitchTotal = this.TPSwitchTable.total;
        this.viewDetails.tpCurrentPage = this.TPSwitchTable.currentPage;
        this.viewDetails.tpStatus = this.TPSwitchTable.dataState;
        this.viewDetails.tpSize = this.TPSwitchTable.pageSize.size;

        const message = ['tp', row];
        this.viewDetails.subject.next(message);
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
        this.TPSwitchTable.displayed = [];
        const target = this.TPSwitchTable.columns[column.index];
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
        this.TPSwitchTable.currentPage = 1;
        this.getTableData();
        this.updateWebViewPage();
    }
}
