import { Component, OnInit, OnDestroy, ViewChild , NgZone, ChangeDetectorRef } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData,
    TiTreeNode,
    TiTreeUtil
} from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { Utils } from '../../service/utils.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';

@Component({
    selector: 'app-sample-lock',
    templateUrl: './sample-lock.component.html',
    styleUrls: ['./sample-lock.component.scss']
})
export class SampleLockComponent implements OnInit, OnDestroy {
    constructor(
        private stompService: StompService,
        public i18nService: I18nService,
        private downloadService: SamplieDownloadService,
        private msgService: MessageService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.columnsMonitor = [
            {
                title: 'name',
                width: '34%',
                sortKey: ''
            },
            {
                title: 'total_block_time',
                width: '20%',
                sortKey: 'totalDuration'
            },
            {
                title: 'thread',
                width: '20%',
                sortKey: 'diffThreads'
            },
            {
                title: 'count',
                width: '25%',
                sortKey: 'count'
            }
        ];
        this.columnsThread = [
            {
                title: 'name',
                width: '40%',
                sortKey: ''
            },
            {
                title: 'total_block_time',
                width: '30%',
                sortKey: 'totalDuration'
            },
            {
                title: 'count',
                width: '30%',
                sortKey: 'count'
            }
        ];
        this.leftTable.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_lock_monitor.name,
                value: 'className'
            }
        ];
        this.rightTable.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_lock_thread.name,
                value: 'threadName'
            }
        ];
    }
    @ViewChild('stackTrace', { static: false }) stackTrace: any;

    public recordId = '';
    public topicUrl = '';
    public stompClient: any;
    public ??s = 1000;
    public ms = 1000000;
    public second = 1000000000;
    i18n: any;

    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    // ????????????
    public displayedMonitor: Array<TiTableRowData> = []; // ????????????????????????????????????????????????????????????[]?????????
    public srcDataMonitor: TiTableSrcData;
    public columnsMonitor: Array<TiTableColumns> = [];
    public closeOtherDetails = true;
    public noDadaInfo = '';
    public displayedThread: Array<TiTableRowData> = []; // ????????????????????????????????????????????????????????????[]?????????
    public srcDataThread: TiTableSrcData;
    public columnsThread: Array<TiTableColumns> = [];

    public totalCountMonitor = 0;
    public totalCountThr = 0;
    public totalCountStackTrace = 0;
    // stack trace??????
    public stackTranceData: Array<TiTreeNode> = [];

    public getDataTimer: any = null;
    public dataLens = 0;
    public monitorDatas: Array<any> = [];

    public stackTraceDataAll: any[] = [];

    // ??????????????????????????????????????????????????????????????????????????????????????????????????????
    selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
        this.stackTranceData,
        false,
        false
    );

    private wsFinishSub: Subscription;
    public finishLock = false;
    public lockClass: any[] = [];
    public lockThread: any[] = [];
    public lockInstances: any[] = [];
    public currentInstances: any[] = [];
    public currentThreads: any[] = [];
    public stackTraceMap = {};
    public currentStackTrace: any[] = [];
    public isSelectedClass = '';
    public isSelectedInstance = '';
    public isSelectedThread = '';
    public onSelectedClass = 'class';
    public onSelectedInstance = 'instance';
    public onSelectedThread = 'thread';
    public eventType = 'LOCK';
    public index = '';
    public currTheme: any;
    private lockStrategy = {
        MONITOR_CLASS: (data: any) => {
            this.handleLockClass(data);
        },
        MONITOR_THREAD: (data: any) => {
            this.handleLockThread(data);
        },
        MONITOR_INSTANCE: (data: any) => {
            this.handleLockInstancs(data);
        },
        MONITOR_MAP: (data: any) => {
            this.handleLockStacktraceMap(data);
        }
    };
    public leftTable: any = {
        searchOptions: [],
        searchWords: [],
        searchKeys: []
    };
    public rightTable: any = {
        searchOptions: [],
        searchWords: [],
        searchKeys: []
    };
    public showLoading = false;

    // ????????????
    public leftCurrentPage = 1;
    public leftTotalNumber = 0;
    public leftPageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public rightCurrentPage = 1;
    public rightTotalNumber = 0;
    public rightPageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };

    /**
     * ngOnInit ???????????????
     */
    ngOnInit() {

        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.recordId = this.getRecordId();
        this.topicUrl = `/user/queue/sample/records/${this.recordId}`;
        this.srcDataMonitor = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.srcDataThread = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        // ??????VSCode??????????????????
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // VSCode???????????????????????????
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.importCache();
        if (!this.finishLock) {
            this.getSamplingData('lock', this.recordId);
            this.showLoading = true;
        } else {
            const firstRow = this.srcDataMonitor.data[0];
            this.getThreadByClass(firstRow);
            setTimeout(() => {
                this.onSelected(this.onSelectedClass, firstRow.className);
            }, 0);
        }
        this.wsFinishSub = this.msgService.getSampleLockMessage().subscribe((msg) => {
            this.showLoading = false;
            if (msg.type === 'LOCK') {
                this.finishLock = true;
                this.getThreadByClass(this.lockClass[0]);
                this.onSelected(this.onSelectedClass, this.lockClass[0].className);
                return;
            }
            (this.lockStrategy as any)[msg.type](msg.content);
        });

        this.updateWebViewPage();
    }
    /**
     * ngOnDestroy ????????????
     */
    ngOnDestroy() {
        clearTimeout(this.getDataTimer);
        this.getDataTimer = null;
        this.downloadService.downloadItems.lock.isFinish = this.finishLock;
        this.downloadService.downloadItems.lock.data = this.srcDataMonitor.data;
        this.downloadService.downloadItems.lock.instances = this.lockInstances;
        this.downloadService.downloadItems.lock.stackTraceMap = this.stackTraceMap;
        this.downloadService.downloadItems.lock.lockThread = this.lockThread;
        if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    }
    /**
     * ???????????????????????????
     */
    public handleLockClass(data: any) {
        data.forEach((item: any) => {
            this.totalCountMonitor += item.count;
        });
        this.lockClass = data;
        this.srcDataMonitor.data = data;
        this.leftTotalNumber = this.srcDataMonitor.data.length;
    }
    /**
     * ????????????????????????
     */
    public handleLockThread(data: any) {
        this.lockThread = this.lockThread.concat(data);
    }
    /**
     * ??????????????????????????????
     */
    public handleLockInstancs(data: any) {
        this.lockInstances.push.apply(this.lockInstances, data);
    }
    /**
     * ?????????????????????
     */
    public handleLockStacktraceMap(data: any) {
        data.forEach((item: any) => {
            this.stackTraceMap = Object.assign(this.stackTraceMap, item);
        });
    }

    /**
     * ????????????????????????
     */
    public getThreadList(ins: any, cIdx: any, InsIdx: any) {
        this.totalCountThr = ins.count;
        this.srcDataThread.data = ins.diffThreads;
        this.rightTotalNumber = this.srcDataThread.data.length;
        this.updateWebViewPage();
    }
    /**
     * ????????????????????????????????????
     */
    public getThreadByClass(row: any) {
        // row ?????????undefined
        if (row) {
            let instance: any[] = [];
            let thread: any[] = [];
            this.lockInstances.forEach((item) => {
                if (item.className === row.className) {
                    instance = instance.concat(item.instances);
                }
            });
            this.lockThread.map((item) => {
                if (item.className === row.className) {
                    thread = thread.concat(item.diffThreadList);
                }
            });
            this.currentInstances = instance;
            this.totalCountThr = row.count;
            this.srcDataThread.data = thread;
            this.rightTotalNumber = this.srcDataThread.data.length;
            this.beforeToggle(1, row);
        }
        this.updateWebViewPage();
    }

    /**
     * ????????????????????????
     */
    public beforeToggle(level: any, row: TiTableRowData): void {
        if (level === 2) {
            return;
        }
        row.showDetails = !row.showDetails;
    }

    private getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }

    /**
     * ????????????????????????
     * @param type ??????????????????
     * @param data recordId
     */
    public getSamplingData(type: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: type.toUpperCase(),
            uuid
        });
        this.updateWebViewPage();
    }

    /**
     * ?????????????????????????????????????????????
     */
    public importCache() {
        this.finishLock = this.downloadService.downloadItems.lock.isFinish;
        this.srcDataMonitor.data = this.downloadService.downloadItems.lock.data;
        this.lockThread = this.downloadService.downloadItems.lock.lockThread;
        this.lockInstances = this.downloadService.downloadItems.lock.instances;
        this.stackTraceMap = this.downloadService.downloadItems.lock.stackTraceMap;
        this.srcDataMonitor.data.forEach((item) => {
            this.totalCountMonitor += item.count;
        });
        this.leftTotalNumber = this.srcDataMonitor.data.length;
    }
    /**
     * ???????????????????????????????????????????????????
     * @param type ??????????????????
     * @param name ??????????????????
     */
    public onSelected(type: string, name: any) {
        switch (type) {
            case 'class':
                this.isSelectedClass = name;
                this.isSelectedInstance = '';
                this.isSelectedThread = '';
                break;
            case 'instance':
                this.isSelectedInstance = name;
                this.isSelectedThread = '';
                break;
            default:
                this.isSelectedThread = name;
        }
        this.getStraceTraceData();
    }
    /**
     * ??????????????????????????????
     */
    public getStraceTraceData() {
        const selectclass = this.isSelectedClass ? `${this.isSelectedClass}` : '';
        const instances = this.isSelectedInstance ? `#${this.isSelectedInstance}` : '';
        const threads = this.isSelectedThread ? `#${this.isSelectedThread}` : '';
        this.index = encodeURIComponent(`${selectclass}${instances}${threads}`);
        if (!Object.keys(this.stackTrace.strackTraceMap).length) {
            this.stackTrace.strackTraceMap = this.stackTraceMap;
        }
        this.stackTrace.getStraceTraceData(this.index);
    }

    /**
     * io????????????
     * @param time time
     */
    public onChangeTime(timeLocal: any): any {
        if (timeLocal < this.??s) {
            return timeLocal.toFixed(2) + 'ns';
        } else if (this.??s < timeLocal && timeLocal < this.ms) {
            return (timeLocal / this.??s).toFixed(2) + '??s';
        } else if (this.ms < timeLocal && timeLocal < this.second) {
            return (timeLocal / this.ms).toFixed(2) + 'ms';
        } else if (this.second < timeLocal) {
            return (timeLocal / this.second).toFixed(2) + 's';
        }
    }

    /**
     * ??????
     */
    public searchEvent(event: any, type: any): void {
        if (type === 'left') {
            this.leftTable.searchKeys[0] = event.key;
            this.leftTable.searchWords[0] = event.value;
        } else {
            this.rightTable.searchKeys[0] = event.key;
            this.rightTable.searchWords[0] = event.value;
        }
    }
     /**
      * intellIj??????webview??????
      */
      public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner'){
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}
