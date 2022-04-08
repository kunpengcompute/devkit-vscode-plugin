import {
    Component, OnInit, ViewChild, TemplateRef, OnDestroy, Input, ChangeDetectorRef, NgZone
} from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent, TiTableDataState } from '@cloud/tiny3';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { Router } from '@angular/router';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
import { createSvg } from '../../util';
import { Utils } from '../../service/utils.service';
@Component({
    selector: 'app-profile-memorydump',
    templateUrl: './profile-memorydump.component.html',
    styleUrls: ['./profile-memorydump.component.scss']
})

export class ProfileMemorydumpComponent implements OnInit, OnDestroy {
    @Input() snapShot: boolean;
    @Input() snapShotTag: boolean;
    @Input() snapShotData: any;
    // 是否为已保存的离线报告
    @Input() offlineHeapdump: boolean;
    @Input() offlineHeapdumpId: string;
    @ViewChild('cancalDump', { static: false }) cancalDump: any;
    constructor(
        private stompService: StompService,
        public sanitizer: DomSanitizer,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        private router: Router,
        public vscodeService: VscodeService,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone,
    ) {
        this.i18n = this.i18nService.I18n();
        this.searchValue.placeholder = this.i18nService.I18nReplace(
            this.i18n.protalserver_profiling_memoryDump.searchBox.info,
            {
                0: this.i18n.protalserver_profiling_memoryDump.class
            }
        );
    }
    @ViewChild('treeBody', { static: false }) treeBody: TemplateRef<any>;
    public i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public startBtnDisabled: any;
    public isStopMsgSub: any;
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    public noDadaInfo: string;
    public columns: Array<TiTableColumns> = [];
    public currentPage: any = 1;
    public totalNumber: any = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 20
    };
    public displayedTree: Array<TiTableRowData> = [];
    public srcDataTree: TiTableSrcData;
    public columnsTree: Array<TiTableColumns> = [];
    public totalNumberT: any = 0;
    public currentNumber: any = 0;
    public typeOptions: any = {};
    public typeSelected: any;
    public chartType = '';
    public guardianId: any;
    public jvmId: any;
    public recordId: any;
    public showLoading: any = false;
    public sortKey: any = '';
    public sortType: any = '';
    public sortKeyTree: any = '';
    public sortTypeTree: any = '';
    public predecessorId: any = -1;
    public currentTotal: any = 0;
    public currentTreeId: any = 0;
    public currentTreeDate: {};
    public currentNode: any = {
        childNum: 20,
        className: '',
        expand: true,
        id: 0,
        isOpen: false,
        level: 0,
        percentage: '',
        pid: -1,
        retainedHeap: 0,
        shallowHeap: 0,
        totalNum: 0
    };
    public sortList: any = [
        {
            id: 0,
            type: '',
            imgType: 'sort',
            show: true,
            left: '20%'
        },
        {
            id: 1,
            type: 'asc', // 升序
            imgType: 'sort-ascent',
            show: false,
            left: '32%'
        },
        {
            id: 2,
            type: 'desc', // 降序
            imgType: 'sort-descent',
            show: false,
            left: '28%'
        },
    ];
    public numOfInstanceSort: any[] = [];
    public shallowHeapSort: any[] = [];
    public retainedHeapSort: any[] = [];
    public retainedHeapTSort: any[] = [];
    public shallowHeapTSort: any[] = [];
    public percentageTSort: any[] = [];
    public treeList: any[] = [];

    public showNodate = true;
    public dumpState: any = '';
    public progress: any = 0;
    public showCancalBtn: any = false;
    public showProgress: any = true;
    public barLength: any = 0;
    public currentDumpState: any = '';
    public language: any;
    public nowRecordId: any;
    // 快照
    public tip1Context: any;
    public snapCount: number;
    public displayType = 'noProcessDisplay';
    public statusText: any;
    public hisSpans = false;
    public treeSpans = false;
    public treeHover: any;
    public showHistogramMore = '';
    public histogramShowRow: any;
    public histogramLogs: any = {
        needSoftRef: true,
        needWeakRef: false,
        needPhantomRef: false
    };
    public histogramOptions: Array<any> = [
        { label: 'soft Ref', englishname: 'soft Ref', val: 'needSoftRef' },
        { label: 'weak Ref', englishname: 'weak Ref', val: 'needWeakRef' },
        { label: 'phantom Ref ', englishname: 'phantom Ref', val: 'needPhantomRef' },
    ];
    public histogramSelecteds: any = [this.histogramOptions[0], this.histogramOptions[1], this.histogramOptions[2]];
    public histogramShowMore: any;
    public isDownload = false;
    public searchValue: any = {
        placeholder: 'please input search key',
        value: ''
    };
    public searchWords: Array<string> = [this.searchValue.value];
    public searchKeys: Array<string> = ['className'];
    public showSearch: any = true;
    public treeOnHoverMoreIdx: any;
    public objectWithGcRootsRouteObj: any;

    public dominantTreeOptions: Array<any> = [
        { label: 'soft Ref', englishname: 'soft Ref', val: 'needSoftRef' },
        { label: 'weak Ref', englishname: 'weak Ref', val: 'needWeakRef' },
        { label: 'phantom Ref ', englishname: 'phantom Ref', val: 'needPhantomRef' },
    ];
    public dominantTreeSelecteds: any = [this.dominantTreeOptions[0],
     this.dominantTreeOptions[1], this.dominantTreeOptions[2]];
    public dominantTreeLogs: any = {
        needSoftRef: true,
        needWeakRef: false,
        needPhantomRef: false
    };
    public generateID: any;
    public iscanSearch: any = true;
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    public shiftTarget = false;
    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.memoryDump;
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop') || 'false');
        this.language = (self as any).webviewSession.getItem('language') === 'en' ? false : true;
        this.showNodate = this.downloadService.downloadItems.heapDump.showNodate;
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');

        this.typeOptions = [
            {
                label: this.i18n.protalserver_profiling_memoryDump.dumpType.histogram,
                id: 'histogram'
            },
            {
                label: this.i18n.protalserver_profiling_memoryDump.dumpType.dominantTree,
                id: 'dominantTree'
            }
        ];
        this.typeSelected = this.typeOptions[0];
        this.chartType = this.typeOptions[0].id;
        this.numOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
        this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
        this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
        this.retainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
        this.shallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
        this.percentageTSort = JSON.parse(JSON.stringify(this.sortList));

        this.columns = [
            {
                title: this.i18n.protalserver_profiling_memoryDump.class,
                width: '55%',
                isSort: false,
                sortKey: ''
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.instance,
                width: '15%',
                isSort: true,
                sortKey: 'numOfInstance',
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.sHeap,
                width: '15%',
                isSort: true,
                sortKey: 'shallowHeap',
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.rHeap,
                width: '15%',
                isSort: true,
                sortKey: 'retainedHeap',
            }
        ];
        this.srcData = {
            data: [], // 源数据
            state: {
                searched: false,
                sorted: false,
                paginated: true
            }
        };
        this.columnsTree = [
            {
                title: this.i18n.protalserver_profiling_memoryDump.class,
                width: '55%',
                isSort: false,
                sortKey: ''
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.sHeap,
                width: '15%',
                isSort: true,
                sortKey: 'shallowHeap',
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.rHeap,
                width: '15%',
                isSort: true,
                sortKey: 'retainedHeap',
            },
            {
                title: this.i18n.protalserver_profiling_memoryDump.Percentage,
                width: '15%',
                isSort: true,
                sortKey: 'percentage',
            }
        ];
        this.srcDataTree = {
            data: [], // 源数据
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        if (this.offlineHeapdump) {
            this.startBtnDisabled = false;
            this.getHistogram(1, this.pageSize.size);
            this.getDomtree(0);
            return;
        }

        // 获取上次保存的数据，进行页面渲染
        this.recordId = this.downloadService.downloadItems.heapDump.newRecordId;
        this.chartType = 'histogram';
        for (const typeSelect of this.typeOptions) {
            if (typeSelect.id === this.chartType) {
                this.typeSelected = typeSelect;
                break;
            }
        }

        if (!this.snapShot) {
            // 切回内存转储页面时判断转储状态
            let dumpDataDetail = (self as any).webviewSession.getItem('dumpState');
            if (dumpDataDetail) {
                dumpDataDetail = JSON.parse(dumpDataDetail);
                const state = dumpDataDetail.jvmRecord.state;
                const fileSize = this.bytesToSize(dumpDataDetail.fileSize);
                const maxTime = dumpDataDetail.maxTime;
                const minTime = dumpDataDetail.minTime;
                if (state && this.recordId !== '') {
                    this.showLoading = true;
                    this.displayType = 'processDisplay';
                    this.generateID = Utils.generateConversationId(8);
                    const path = this.currTheme === COLOR_THEME.Dark ?
                     './assets/img/collecting/dark/loading-dark.json' :
                        './assets/img/collecting/light/loading-light.json';
                    setTimeout(() => {
                        createSvg('#' + this.generateID, path);
                    }, 0);
                    this.currentDumpState = state;
                    if (state === 'FAILED') {
                        this.showNodate = true;
                        this.showCancalBtn = false;
                        this.showLoading = false;
                    }
                    if (state === 'WARN') {
                        this.showNodate = true;
                        this.showCancalBtn = false;
                        this.showLoading = false;
                    }
                    if (state === 'STARTED') {
                        this.showCancalBtn = true;
                        this.dumpState = this.i18n.protalserver_profiling_memoryDump.dumpState;
                    }
                    if (state === 'DUMPED') {
                        this.showCancalBtn = true;
                        this.dumpState = this.i18nService.I18nReplace(
                            this.i18n.protalserver_profiling_memoryDump.dumpContent1,
                            { 0: fileSize }
                        );
                    }
                    if (state === 'TRANSFERRING') {
                        this.showCancalBtn = true;
                        this.progress = dumpDataDetail.percent;
                        this.barLength = `${dumpDataDetail.percent}%`;
                        this.dumpState = this.i18nService.I18nReplace(
                            this.i18n.protalserver_profiling_memoryDump.dumpContent1,
                            { 0: fileSize }
                        );
                    }
                    if (state === 'TRANSFER_COMPLETED' || state === 'DUMP_COMPLETED') {
                        this.showCancalBtn = true;
                        this.showProgress = true;
                        this.progress = dumpDataDetail.percent;
                        this.barLength = `${dumpDataDetail.percent}%`;
                        this.dumpState = this.i18nService.I18nReplace(
                            this.i18n.protalserver_profiling_memoryDump.dumpContent,
                            { 0: fileSize, 1: minTime, 2: maxTime }
                        );
                    }
                    if (state === 'PARSE_COMPLETED') {
                        this.dumpState = '';
                        this.showCancalBtn = false;
                        this.getHistogram(1, this.pageSize.size);
                        this.getDomtree(0);
                        this.shiftTarget = true;
                    }
                }
            }

            this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'isStopPro') {
                    this.startBtnDisabled = true;
                    if (this.srcData.data.length === 0) {
                        this.showNodate = true;
                    }
                    this.showLoading = false;
                    (self as any).webviewSession.removeItem('dumpState');
                }
                if (msg.type === 'errors') {
                    this.showNodate = true;
                    this.showLoading = false;
                }
                if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.memoryDump) {
                    this.downloadService.downloadItems.heapDump.histogram = [];
                    this.downloadService.downloadItems.heapDump.domtree = [];
                    this.downloadService.downloadItems.heapDump.histogramStatus.currentPage = 0;
                    this.downloadService.downloadItems.heapDump.histogramStatus.size = 20;
                    this.downloadService.downloadItems.heapDump.histogramStatus.totalNumber = 0;
                    this.downloadService.downloadItems.heapDump.domtreeStatus.currentTotal = 0;
                    this.downloadService.downloadItems.heapDump.domtreeStatus.totalNumberT = 0;
                    this.initData();
                    this.showNodate = true;
                    this.showLoading = false;
                    this.displayType = 'noProcessDisplay';
                    (self as any).webviewSession.removeItem('dumpState');
                }

                // 保存内存转储
                if (msg.type === 'savedHeapdumpReoprt') {
                    this.savedHeapdumpReport(msg.data);
                }
            });
            this.heapGetMessage();
        }

        if (this.snapShot) {
            this.currentPage = 1;
            this.showLoading = false;
            return;
        }
        this.srcData.data = this.downloadService.downloadItems.heapDump.histogram;
        this.srcDataTree.data = this.downloadService.downloadItems.heapDump.domtree;
        this.currentPage = this.downloadService.downloadItems.heapDump.histogramStatus.currentPage;
        this.pageSize.size = this.downloadService.downloadItems.heapDump.histogramStatus.size;
        if (this.startBtnDisabled) {
            this.totalNumber = this.srcData.data.length;
        } else {
            this.totalNumber = this.downloadService.downloadItems.heapDump.histogramStatus.totalNumber;
            this.currentTotal = this.downloadService.downloadItems.heapDump.domtreeStatus.currentTotal;
            this.totalNumberT = this.downloadService.downloadItems.heapDump.domtreeStatus.totalNumberT;
        }
        if (this.snapShot) { return; }
        this.handleSnapShotCount('memorydump');
        this.updateWebViewPage();
    }
    private heapGetMessage() {
        this.stompService.heapDump = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'heap') {
                if (msg.state === 'ERROR') {
                    this.showNodate = true;
                    this.showCancalBtn = false;
                    this.showLoading = false;
                    if (this.cancalDump) {
                        this.cancalDump.alert_close(); // 执行内存转储错误要关闭取消内存转储弹窗
                    }
                    (self as any).webviewSession.removeItem('dumpState');
                    return;
                }
                if (msg.data.errorMessage) {
                    this.showCancalBtn = false;
                    this.showInfoBox(msg.data.errorMessage, 'warn');
                }
                const heapInfo = msg.data.jvmRecord;
                this.recordId = heapInfo.id;
                this.downloadService.downloadItems.heapDump.newRecordId = this.recordId;

                if (heapInfo.state === 'FAILED') {
                    this.showNodate = true;
                    this.showLoading = false;
                    this.showCancalBtn = false;
                    if (this.cancalDump) {
                        this.cancalDump.alert_close(); // 执行内存转储失败要关闭取消内存转储弹窗
                    }
                    (self as any).webviewSession.removeItem('dumpState');
                    return;
                }
                if (heapInfo.state === 'STARTED') {
                    this.currentDumpState = 'STARTED';
                    this.showCancalBtn = true;
                    this.dumpState = this.i18n.protalserver_profiling_memoryDump.dumpState;
                }
                if (heapInfo.state === 'DUMPED') {
                    this.currentDumpState = 'DUMPED';
                    this.progress = 0;
                    this.barLength = '0px';
                    this.showCancalBtn = true;
                    const fileSize = this.bytesToSize(msg.data.fileSize);
                    this.dumpState = this.i18nService.I18nReplace(
                        this.i18n.protalserver_profiling_memoryDump.dumpContent1,
                        { 0: fileSize }
                    );
                }
                if (heapInfo.state === 'TRANSFERRING') {
                    this.currentDumpState = 'TRANSFERRING';
                    this.showProgress = false;
                    this.showCancalBtn = true;
                    this.progress = msg.data.percent;
                    this.barLength = `${msg.data.percent}%`;
                    const fileSize = this.bytesToSize(msg.data.fileSize);
                    this.dumpState = this.i18nService.I18nReplace(
                        this.i18n.protalserver_profiling_memoryDump.dumpContent1,
                        { 0: fileSize }
                    );
                }
                if (heapInfo.state === 'TRANSFER_COMPLETED') {
                    this.currentDumpState = 'TRANSFER_COMPLETED';
                    this.progress = msg.data.percent;
                    this.barLength = `${msg.data.percent}%`;
                    const maxTime = msg.data.maxTime;
                    this.showCancalBtn = true;
                    const minTime = msg.data.minTime;
                    const fileSize = this.bytesToSize(msg.data.fileSize);
                    this.dumpState = this.i18nService.I18nReplace(
                        this.i18n.protalserver_profiling_memoryDump.dumpContent,
                        { 0: fileSize, 1: minTime, 2: maxTime }
                    );
                    this.showProgress = true;
                }
                if (heapInfo.state === 'DUMP_COMPLETED') {
                    this.currentDumpState = 'DUMP_COMPLETED';
                    this.showCancalBtn = true;
                }
                if (heapInfo.state === 'PARSE_COMPLETED') {
                    this.currentDumpState = 'PARSE_COMPLETED';
                    this.dumpState = '';
                    if (this.cancalDump) {
                        this.cancalDump.alert_close(); // 解析文完成要关闭取消内存转储弹窗
                    }
                    this.showCancalBtn = false;
                    this.getHistogram(1, this.pageSize.size);
                    this.getDomtree(0);
                    this.updateDownloadItems();
                }
            }
        });
        setTimeout(() => {
           this.updateWebViewPage();
        }, 300);
    }

    /**
     * 直方图分页
     */
    public stateUpdate(tiTable: TiTableComponent): void {
        const dataState: TiTableDataState = tiTable.getDataState();
        this.getHistogram(dataState.pagination.currentPage, dataState.pagination.itemsPerPage, this.searchValue.value);
    }

    /**
     * 当前node的展开收起
     */
    async toggle(node: any) {
        node.firstAdd += 1;
        this.currentNode = node;
        this.predecessorId = node.id;
        node.isOpen = !node.isOpen;
        if (!node.isOpen) {
            if (document.getElementsByClassName(`${this.currentNode.id}load`)[0]) {
                const loadNode = document.getElementsByClassName(`${this.currentNode.id}load`)[0];
                loadNode.parentNode.removeChild(loadNode);
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    node.flag = 1;
                }
            }
        } else {
            this.creatLoadMore();
        }
        if (node.firstAdd > 1) {
            this.toggleChildren(this.srcDataTree.data, node.id, node.isOpen);  // 不是第一次展开，仅展开;
            this.updateWebViewPage();
            return;
        } else {
            await this.getDomtree(node.childNum);  // 若为第一次展开，请求数据;//若为第一次展开，请求数据;
        }
        this.updateWebViewPage();
    }

    // 父级收起展开时控制子树的展示与隐藏
    private toggleChildren(data: Array<any>, id: any, pExpand: boolean): void {
        for (const node of data) {
            if (node.pId === id) {
                node.isShow = pExpand; // 处理当前子节点
                if (pExpand === false) {// 折叠时递归处理当前节点的子节点
                    this.toggleChildren(data, node.id, false);
                } else {  // 展开时递归处理当前节点的子节点
                    if (node.isOpen === true) {
                        this.toggleChildren(data, node.id, true);
                    }
                }
            }
        }
    }

    /**
     * 初始化数据
     */
    public initData() {
        this.srcData.data = new Array();
        this.srcDataTree.data = new Array();
        this.displayed.length = 0;
        this.displayedTree.length = 0;
        this.currentTotal = 0;
        this.currentPage = 1;
        this.pageSize.size = 20;
        this.currentDumpState = '';
        this.dumpState = '';
        this.progress = 0;
        this.barLength = 0;
        this.currentNode.id = -1;
    }

    /**
     * 启动内存转储
     */
    public refreshData() {
        if (this.snapShot) { return; }
        this.currentTotal = 0;
        this.currentPage = 1;
        this.pageSize.size = 20;
        this.srcData.data = [];
        this.srcDataTree.data = [];
        this.displayed.length = 0;
        this.displayedTree.length = 0;
        this.currentPage = 1;
        this.currentNode.id = -1;
        this.predecessorId = -1;
        this.showNodate = false;
        this.showLoading = true;
        this.shiftTarget = false;
        this.showHistogramMore = '';
        this.treeOnHoverMoreIdx = '';
        this.currentDumpState = '';
        this.progress = 0;
        this.barLength = 0;
        this.stompService.startStompRequest(
            '/cmd/start-heap-dump',
            { jvmId: this.jvmId, guardianId: this.guardianId }
        );
        this.displayType = 'processDisplay';
        this.statusText = this.i18n.protalserver_profiling_memoryDump.loading;
        this.generateID = Utils.generateConversationId(8);
        const path = this.currTheme === COLOR_THEME.Dark ? './assets/img/collecting/dark/loading-dark.json' :
            './assets/img/collecting/light/loading-light.json';
        setTimeout(() => {
            createSvg('#' + this.generateID, path);
        }, 10);
    }

    /**
     * 确认取消内存转储弹窗
     */
    public openCancal() {
        this.cancalDump.type = 'warn';
        this.cancalDump.alert_show();
        this.cancalDump.title = this.i18n.protalserver_profiling_memoryDump.cancalTitle;
        this.cancalDump.content = this.i18n.protalserver_profiling_memoryDump.cancalTip;
    }

    /**
     * 取消内存转储
     */
    public confirmHandleStop(data: any) {
        if (data) {
            const option = {
                url: `/guardians/${this.guardianId}/stopHeapDump/${this.recordId}`,
            };
            this.vscodeService.post(option, (resp: any) => {
                if (resp.code === 0) {
                    this.showNodate = true;
                    this.showLoading = false;
                    this.currentTotal = 0;
                    this.srcData.data = new Array();
                    this.srcDataTree.data = new Array();
                    this.displayed.length = 0;
                    this.displayedTree.length = 0;
                    this.currentNode.id = -1;
                    this.currentDumpState = '';
                    this.progress = 0;
                    this.barLength = 0;
                    this.dumpState = '';
                    this.displayType = 'noProcessDisplay';
                    this.showInfoBox(this.i18n.protalserver_profiling_memoryDump.cancalSuccess, 'info');

                    (self as any).webviewSession.removeItem('dumpState');
                } else {

                    this.showInfoBox(resp.message, 'warn');
                }
            });
        }
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
    showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 获取直方图数据
     */
    public getHistogram(page: any, size: any, searchvalue?: any) {
        const params = {
            page,
            size,
            sortBy: this.sortKey,
            sort: this.sortType,
            filterClassName: searchvalue
        };
        let url = `/guardians/${this.guardianId}/jvms/${this.jvmId}/heaps/${this.recordId}/histogram`;
        if (this.offlineHeapdump) {
            url = `/heap/${this.offlineHeapdumpId}/query/histogram`;
        }
        const option = {
            url,
            params
        };
        this.vscodeService.post(option, (res: any) => {
            this.totalNumber = res.totalElements;
            this.srcData.data = res.members;
            this.showLoading = false;
            this.updateWebViewPage();
        });
    }
    /**
     * 根据当前node元素和其children个数获取剩余children
     */
    public getDomtree(currentTotal: any) {
        const params = {
            predecessorId: this.predecessorId, // 第一次初始化为 -1,后续请求数据为数据id
            currentTotal,
            size: 20,
            sortBy: this.sortKeyTree,
            sort: this.sortTypeTree
        };
        let url = '';
        if (this.offlineHeapdump) {
            url = `/heap/${this.offlineHeapdumpId}/query/domtree`;
        } else {
            url = `/guardians/${this.guardianId}/jvms/${this.jvmId}/heaps/${this.recordId}/domtree`;
        }
        const option = {
            url,
            params
        };
        this.vscodeService.post(option, (res: any) => {
            this.showLoading = false;
            res.members.forEach((item: any) => {
                item.level = this.predecessorId === -1 ? 0 : this.currentNode.level + 1;
                item.pId = this.predecessorId === -1 ? 'tiTableRoot' : this.predecessorId;
                item.isShow = this.predecessorId === -1 ? true : false;
                item.isOpen = false;
                item.firstAdd = 0;
                item.totalNum = 0;
                item.childNum = 0;
                item.flag = 0; // 0代表第一次展开，1代表点击查看更多
                item.percentage = (100 * item.percentage).toFixed(2);
            });

            // 合并树的数据
            if (this.predecessorId === -1) {
                this.srcDataTree.data.push.apply(this.srcDataTree.data, res.members);
                this.totalNumberT = res.totalElements;
            } else {
                const childList = this.srcDataTree.data.filter((item) => {
                    return item.pId === this.currentNode.id && item.level === this.currentNode.level + 1;
                });
                let insertId: any;
                if (childList.length > 0) {
                    const lastChildId = childList[childList.length - 1].id;
                    insertId = (e: any) => e.id === lastChildId;
                } else {
                    insertId = (e: any) => e.id === this.currentNode.id;
                }
                const cId = this.srcDataTree.data.findIndex(insertId); // 获取当前子树最后一个元素的索引
                this.srcDataTree.data.splice(cId + 1, 0, ...res.members);
            }
            this.toggleChildren(this.srcDataTree.data, this.currentNode.id, this.currentNode.isOpen);
            const rootTree = this.srcDataTree.data.filter((item) => {
                return item.level === 0;
            });
            this.currentTotal = rootTree.length; // 当前以获取的根节点数量
            // 内层子树的children以获取个数id
            if (this.predecessorId !== -1) {
                const childList = this.srcDataTree.data.filter((item) => {
                    return item.pId === this.currentNode.id && item.level === this.currentNode.level + 1;
                });
                this.currentNumber = childList.length;
                this.currentNode.totalNum = res.totalElements;
                this.currentNode.childNum = this.currentNumber;
                this.currentNode.lastChildId = childList[childList.length - 1].id;
                this.creatLoadMore();
            }
            this.updateWebViewPage();
        });
    }
    /**
     * tableRoot层级的查看更多
     */
    public loadMore(currentTotal: any) {
        this.predecessorId = -1;
        this.getDomtree(currentTotal);
    }
    /**
     * 创建 查看更多元素
     */
    public creatLoadMore() {
        if (document.getElementsByClassName(`${this.currentNode.id}load`)[0]) {
            const loadNode = document.getElementsByClassName(`${this.currentNode.id}load`)[0];
            loadNode.parentNode.removeChild(loadNode);
        }
        if (this.currentNode.childNum < this.currentNode.totalNum) {
            // 创建元素
            const load = document.createElement('tr');
            load.className = `${this.currentNode.id}load`;
            let colon = '';
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
              colon = ':';
            } else {
              colon = '：';
            }
            const html = `<td class="tdLoadMore" style='padding-left:${(this.currentNode.level + 1) * 36 + 10}px;
            display:flex;font-size: 14px; font-weight: 400;'>
            <span style="margin-left: 20px;color:#0067ff;cursor: pointer;">
            <span id='${this.currentNode.id}More'>${this.i18n.protalserver_profiling_memoryDump.loadMore}</span></span>
            <span style="margin-left: 10px;">${this.i18n.protalserver_profiling_memoryDump.currentShow}${colon}
            ${this.currentNode.childNum}</span>
            <span style="margin-left: 10px;">${this.i18n.protalserver_profiling_memoryDump.totalNum}${colon}
            ${this.currentNode.totalNum}</span>
            <span style="margin-left: 10px;">${this.i18n.protalserver_profiling_memoryDump.Remain}${colon}
            ${this.currentNode.totalNum - this.currentNode.childNum}</span></td><td></td><td></td><td></td>`;
            load.innerHTML = html;
            let parentDom: any;
            if (this.currentNode.flag === 1) {
                parentDom = document.getElementById(this.currentNode.nextSibling);  // 获取最后一个子树，插入loadmore
            } else {
                parentDom = document.getElementById(this.currentNode.id).nextSibling; // 第一次打开添加到下一个兄弟元素之前
                const nextId = parentDom.getAttribute('id');
                this.currentNode.nextSibling = nextId;
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.currentNode.flag = 1;
                }
            }
            setTimeout(() => {
                parentDom.parentNode.insertBefore(load, parentDom);
                const lookMore = document.getElementById(`${this.currentNode.id}More`);
                lookMore.addEventListener('click', (event) => {
                    this.currentNode.flag = 1;
                    const data: any = event.target;
                    const loadId = Number(data.id.replace(/[a-zA-Z]/g, ''));
                    const currentNode = this.srcDataTree.data.filter((item) => {
                        return item.id === loadId;
                    });
                    this.currentNode = currentNode[0];
                    this.predecessorId = this.currentNode.id;
                    this.getDomtree(this.currentNode.childNum);
                });
            }, 0);
        } else {
            return;
        }
    }
    /**
     * 表格层级偏移位置计算
     */
    public getLevelStyle(node: any): { 'padding-left': string } {
        return {
            'padding-left': `${node.level * 36 + 10}px` // 图标16px + 间距8px = 24px
        };
    }
    /**
     * 蓝色标记定位距离计算
     */
    public getbgLevelStyle(node: any, index: any): { 'left': string } {
        return {
            left: `${(index - 1) * 37}px` // 图标16px + 间距8px = 24px
        };
    }
    /**
     * 显示类型切换
     */
    public typeChange(data: any): void {
        if (data.id === 'dominantTree') {
            this.showSearch = false;
        } else {
            this.showSearch = true;
        }
        this.chartType = data.id;
        this.updateWebViewPage();
    }
    /**
     * 直方图排序
     */
    public getHistogramSort(idx: any, sortKey: any) {
        // normal
        this.numOfInstanceSort = JSON.parse(JSON.stringify(this.sortList));
        this.shallowHeapSort = JSON.parse(JSON.stringify(this.sortList));
        this.retainedHeapSort = JSON.parse(JSON.stringify(this.sortList));
        if (idx > 1) {
            idx = 0;
        } else {
            idx++;
        }
        if (sortKey === 'numOfInstance') {
            this.numOfInstanceSort.forEach((item) => {
                item.show = false;
            });
            this.numOfInstanceSort[idx].show = true;
        }
        if (sortKey === 'shallowHeap') {
            this.shallowHeapSort.forEach((item) => {
                item.show = false;
            });
            this.shallowHeapSort[idx].show = true;
        }
        if (sortKey === 'retainedHeap') {
            this.retainedHeapSort.forEach((item) => {
                item.show = false;
            });
            this.retainedHeapSort[idx].show = true;
        }
        this.sortType = this.sortList[idx].type;
        if (!this.sortType){
            this.sortKey = '';
        } else{
            this.sortKey = sortKey;
        }
        this.srcData.data = [];
        this.getHistogram(1, 20);
        this.updateDownloadItems();
    }
    /**
     * 支配树排序
     */
    public getDominantTreeSort(idx: any, sortKey: any) {
        // normal
        this.retainedHeapTSort = JSON.parse(JSON.stringify(this.sortList));
        this.shallowHeapTSort = JSON.parse(JSON.stringify(this.sortList));
        this.percentageTSort = JSON.parse(JSON.stringify(this.sortList));
        if (idx > 1) {
            idx = 0;
        } else {
            idx++;
        }
        if (sortKey === 'percentage') {
            this.percentageTSort.forEach((item) => {
                item.show = false;
            });
            this.percentageTSort[idx].show = true;
        }
        if (sortKey === 'shallowHeap') {
            this.shallowHeapTSort.forEach((item) => {
                item.show = false;
            });
            this.shallowHeapTSort[idx].show = true;
        }
        if (sortKey === 'retainedHeap') {
            this.retainedHeapTSort.forEach((item) => {
                item.show = false;
            });
            this.retainedHeapTSort[idx].show = true;
        }
        this.sortTypeTree = this.sortList[idx].type;
        if (!this.sortTypeTree){
            this.sortKeyTree = '';
        } else{
            this.sortKeyTree = sortKey;
        }
        this.srcDataTree.data = [];
        this.predecessorId = -1;
        this.getDomtree(0);
        this.updateDownloadItems();
    }

    /**
     * 更新数据到下载数据对象中
     */
    private updateDownloadItems() {
        this.downloadService.downloadItems.heapDump.recordId = this.recordId;
        this.downloadService.downloadItems.heapDump.newRecordId = this.recordId;
        this.downloadService.downloadItems.heapDump.chartType = this.chartType;
        this.downloadService.downloadItems.heapDump.histogramStatus.totalNumber = this.totalNumber;
        this.downloadService.downloadItems.heapDump.histogramStatus.currentPage = this.currentPage;
        this.downloadService.downloadItems.heapDump.histogramStatus.size = this.pageSize.size;
        this.downloadService.downloadItems.heapDump.domtreeStatus.currentTotal = this.currentTotal;
        this.downloadService.downloadItems.heapDump.domtreeStatus.totalNumberT = this.totalNumberT;
        this.downloadService.downloadItems.heapDump.histogram = this.srcData.data;
        this.downloadService.downloadItems.heapDump.domtree = this.srcDataTree.data;
        this.downloadService.downloadItems.heapDump.showNodate = this.showNodate;
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy(): void {
        if (this.snapShot) {
            return;
        }
        this.updateDownloadItems();
        if (this.stompService.heapDump) {
            this.stompService.heapDump.unsubscribe();
        }
        if (this.isStopMsgSub) {
            this.isStopMsgSub.unsubscribe();
        }
    }
    /**
     * 获取前面蓝色背景标记循环个数
     */
    public counter(level: number) {
        const arr = [];
        for (let i = 0; i <= level; i++) {
            arr.push(i);
        }
        return arr;
    }
    /**
     * 快照点击事件
     */
    public compare(property: any) {
        return (a: any, b: any) => {
            const value1 = a[property];
            const value2 = b[property];
            return value2 - value1;
        };
    }
    /**
     * doSnap
     */
    public doSnap(type: any) {
        if (this.snapShot) { return; }
        const snapCounts = 2;
        const topCounts = 5;
        if (this.snapCount < snapCounts) {
            const tableTop1 = this.srcData.data;
            const tableTree = this.srcDataTree.data;
            const nowTime = this.getSnapTime();
            const snapShot = (self as any).webviewSession.getItem('snapShot')
                && JSON.parse((self as any).webviewSession.getItem('snapShot')) || {};
            if (!snapShot[type]) {
                snapShot[type] = {
                    label: this.i18n.common_term_sampling_forms.threadDump,
                    type,
                    children: [],
                };
            }
            if (snapShot[type] && snapShot[type]?.children) {
                snapShot[type].children.push({
                    label: nowTime,
                    type,
                    value: {
                        file: tableTop1,
                        treeFile: tableTree,
                        snapCount: this.snapCount + 1,
                    }
                });
            }
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.snapshot_success_alert,
                    type: 'info'
                }
            };
            this.vscodeService.postMessage(message, null);
            const isOverSize = this.handleIsOverSize(JSON.stringify(snapShot));
            if (!isOverSize) { return; }
            (self as any).webviewSession.setItem('snapShot', JSON.stringify(snapShot));
        } else {
            this.showInfoBox(this.i18n.snapshot_analysis_alert, 'warn');
        }
        this.handleSnapShotCount(type);
    }

    /**
     * getSnapTime
     */
    public getSnapTime() {
        const date = new Date().toLocaleDateString();
        const hour = new Date().getHours() > 9 ? new Date().getHours() : '0' + new Date().getHours();
        const minute = new Date().getMinutes() > 9 ? new Date().getMinutes() : '0' + new Date().getMinutes();
        const seconds = new Date().getSeconds() > 9 ? new Date().getSeconds() : '0' + new Date().getSeconds();
        return `${date} ${hour}:${minute}:${seconds}`;
    }
    /**
     * 快照数据导入
     */
    public importSnapData(snapShotData: any, currentPage: any, recordId: any) {
        if (this.downloadService.downloadItems.heapDump.chartType.length > 0) {
            this.chartType = this.downloadService.downloadItems.heapDump.chartType;
        } else {
            this.chartType = 'histogram';
        }
        if (this.chartType === 'histogram') {
            this.typeSelected = this.typeOptions[0];
        } else if (this.chartType === 'dominantTree') {
            this.typeSelected = this.typeOptions[1];
        }
        this.recordId = recordId;
        this.srcData.data = [];
        this.srcDataTree.data = [];
        this.currentTotal = 0;
        this.currentNode.id = -1;
        this.totalNumber = snapShotData.totalNumber;
        this.pageSize.size = snapShotData.size;
        this.currentPage = currentPage;
        this.totalNumberT = 0;
        this.getHistogram(currentPage, this.pageSize.size);
        this.getDomtree(0);
    }
    /**
     * handleSnapShotCount
     */
    public handleSnapShotCount(type: any) {
        const snapShot = (self as any).webviewSession.getItem('snapShot')
            && JSON.parse((self as any).webviewSession.getItem('snapShot')) || {};
        if (snapShot[type] && snapShot[type]?.children.length) {
            this.snapCount = snapShot[type]?.children.length;
        } else {
            this.snapCount = 0;
        }
    }
    /**
     * jumpToSnapShot
     */
    public jumpToSnapShot() {
        const jvmName = (self as any).webviewSession.getItem('currentSelectJvm');
        this.router.navigate([`/profiling/${jvmName}/snapshot`]);
    }

    /**
     * handleIsOverSize
     */
    public handleIsOverSize(data: any) {
        const newDataSize = data.length;
        const obj = (self as any).webviewSession;
        const sessionSize = 5120 * 1024;
        let size = 0;
        for (const item in obj) {
            if (obj.hasOwnProperty(item)) {
                size += obj.getItem(item).length;
            }
        }
        if (newDataSize + size > sessionSize) {
            this.showInfoBox(this.i18n.snapshot_analysis_overSize, 'warn');
            return false;
        }
        return true;
    }
    /**
     * 从GC Roots到对象的最短共同路径
     * @param row row
     * @param idx idx
     * @param event event
     */
    public histogramOnMore(row?: any, idx?: any, event?: any) {
        const per = event.y / window.innerHeight;
        if (!this.snapShot) {
            if (per > .85) {
                this.hisSpans = false;
            } else {
                this.hisSpans = true;
            }
        } else {
            if (per > 0.8) {
                this.hisSpans = false;
            } else {
                this.hisSpans = true;
            }
        }
        this.treeHover = '';
        if (this.showHistogramMore === row.classId) {
            this.showHistogramMore = '';
        } else {
            this.histogramShowRow = row;
            this.showHistogramMore = row.classId;
        }
    }
    /**
     * 离开列表事件
     */
    public mouseleaveHistogramMore() {
        this.showHistogramMore = '';
    }
    /**
     * 最短共同路径
     */
    public getShortCommonRouteHeapWalker() {
        this.showHistogramMore = '';
        this.histogramSelecteds = [this.histogramOptions[0], this.histogramOptions[1], this.histogramOptions[2]];
        this.chartType = 'shortCommonRoute';
        this.histogramShowMore = 'null';
        this.updateWebViewPage();
    }
    /**
     * 所有对象
     */
    public allObject() {
        this.showHistogramMore = '';
        this.chartType = 'histogramAllObject';
        this.updateWebViewPage();
    }
    /**
     * onHoverList
     * @param label label
     */
    public onHoverList(label?: any) {
        this.treeHover = label;
    }
    /**
     * goHistogram
     */
    public goHistogram() {
        this.chartType = 'histogram';
        this.histogramLogs = {
            ...{
                needSoftRef: true,
                needWeakRef: false,
                needPhantomRef: false
            }
        };
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
          /*
           * tuning执行 Math.max.apply() 方法后,
           * 会导致 histogramOptions（格式为数组）为 [undefined, undefined, undefined] 后续执行会出错
           */
        } else {
          this.histogramOptions = Math.max.apply(null, this.histogramOptions);
        }
    }
    /**
     * 选择扩展内容
     * @param i index
     */
    public selectHistogramOptions(bool: boolean, i: number) {
        this.histogramLogs[this.histogramOptions[i].val] = !this.histogramLogs[this.histogramOptions[i].val];
        this.histogramLogs = { ...this.histogramLogs };
    }
    /**
     * 选择扩展内容
     * @param i index
     */
    public selectDominantTreeOptions(i: any) {
        this.dominantTreeLogs[this.histogramOptions[i].val] = !this.dominantTreeLogs[this.histogramOptions[i].val];
        this.dominantTreeLogs = { ...this.dominantTreeLogs };
    }

    /**
     * searchClear
     * @param value string
     */
    searchClear(value: string): void {
        this.srcData.data.length = 1;
        this.searchWords[0] = '';
        this.searchValue.value = '';
        this.pageSize.size = 20;
        this.currentPage = 1;
        this.getHistogram(1, 20);
        this.updateWebViewPage();
    }

    /**
     * searchChange
     * @param value string
     */
    searchChange(value: string): void {
        if ( value === '' || value === undefined || value === null ) {
            this.searchClear(value);
        }
    }
    /**
     * keySearch
     * @param value string
     */
    keySearch(value: string): void {
        this.searchWords[0] = value;
        this.searchValue.value = value;
        this.updateWebViewPage();
    }

    /**
     * 支配树
     * @param row row
     * @param idx idx
     * @param event event
     */
    public treeOnHoverMore(row?: any, idx?: any, event?: any) {
        const per = event.y / window.innerHeight;
        if (!this.snapShot) {
            if (per > 0.9) {
                this.treeSpans = false;
            } else {
                this.treeSpans = true;
            }
        } else {
            if (per > 0.85) {
                this.treeSpans = false;
            } else {
                this.treeSpans = true;
            }
        }
        this.treeHover = '';
        if (this.treeOnHoverMoreIdx === row.id) {
            this.treeOnHoverMoreIdx = '';
        } else {
            this.objectWithGcRootsRouteObj = row;
            this.treeOnHoverMoreIdx = row.id;
        }
    }
    /**
     * 移除列表
     */
    public mouseleaveTreeOnHoverMore() {
        this.treeOnHoverMoreIdx = '';
    }
    /**
     * objectWithGcRootsRoutePop
     */
    public objectWithGcRootsRoutePop() {
        this.treeOnHoverMoreIdx = '';
        this.dominantTreeSelecteds = [this.dominantTreeOptions[0],
        this.dominantTreeOptions[1], this.dominantTreeOptions[2]];
        this.chartType = 'objectWithGcRootsRoute';
        this.updateWebViewPage();
    }

    /**
     * 单位换算
     */
    public bytesToSize(bytes: any) {
        if (bytes === 0) { return '0 B'; }
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }
    /**
     * 返回
     */
    public goDominantTree() {
        this.chartType = 'dominantTree';
        this.dominantTreeLogs = {
            ...{
                needSoftRef: true,
                needWeakRef: false,
                needPhantomRef: false
            }
        };
        this.dominantTreeOptions = [...this.dominantTreeOptions];
    }

    /**
     * 保存内存转储
     */
    savedHeapdumpReport(data: any) {
        const params = {
            heapId: this.recordId,
            alias: data.reportName,
            source: 'SELF_COLLECTION',
            comments: data.reportRemark
        };
        const option = {
            url: `/guardians/${this.guardianId}/jvms/${this.jvmId}/heaps/${this.recordId}/save`,
            params
        };
        this.vscodeService.post(option, (res: any) => {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                if (res.code === 0) {
                    this.vscodeService.postMessage({
                        cmd: 'savedReportShowInfo', data: {
                            taskId: this.recordId,
                            type: 'heapdump'
                        }
                    }, null);
                    this.vscodeService.showTuningInfo(res.message, 'info', 'saveData');
                } else {
                    this.vscodeService.showTuningInfo(res.message, 'warn', 'saveData');
                }
            } else {
                if (res.code === 0) {
                    this.vscodeService.postMessage({
                        cmd: 'savedReportShowInfo', data: {
                            taskId: this.recordId,
                            type: 'heapdump'
                        }
                    }, null);
                } else {
                    this.showInfoBox(res.message, 'warn');
                }
            }
        });
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
