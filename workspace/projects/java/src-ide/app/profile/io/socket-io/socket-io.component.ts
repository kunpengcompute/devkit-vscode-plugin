import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { MytipService } from '../../../service/mytip.service';
import { Utils } from '../../../service/utils.service';
import { Router } from '@angular/router';
import { LibService } from '../../../service/lib.service';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import {
    TiTableColumns,
    TiTableComponent,
    TiTableRowData,
    TiTableSrcData,
    TiTreeNode,
    TiValidators,
    TiTreeUtil
} from '@cloud/tiny3';
import {
    FormBuilder,
    FormControl,
    FormGroup
} from '@angular/forms';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { VscodeService, COLOR_THEME } from '../../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
const conNum = {
    zeroApproximation: 0.001
};
/**
 * 定义TOP数据枚举
 */
const enum SELECTED_TOP_NUM {
    NUM_TOP05 = 0,
    NUM_TOP10 = 1,
    NUM_SELF_CONFIG = 2
}
@Component({
    selector: 'app-socket-io',
    templateUrl: './socket-io.component.html',
    styleUrls: ['./socket-io.component.scss']
})
export class SocketIoComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    @ViewChild('leftTableComp', { static: false }) leftTableComp: TiTableComponent;
    @ViewChild('rightTableComp', { static: false }) rightTableComp: TiTableComponent;
    socketIOWorker: Worker;
    @Input() snapShot: boolean;
    @Input() snapShotData: any;
    @Input() ideType: any;
    constructor(
        private stompService: StompService,
        private router: Router,
        public fb: FormBuilder,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        public vscodeService: VscodeService,
        private el: ElementRef,
        public mytip: MytipService,
        public utils: Utils,
        public regularVerify: RegularVerify,
        public libService: LibService,
        public sanitizer: DomSanitizer) {
        this.i18n = this.i18nService.I18n();
        this.echartsTitle = this.i18n.io.fileIo.socketIORate;
        this.tipStr = this.i18n.io.socketIoTip;
        this.socketIoBtnTip = this.i18n.io.btn_tip_socket;
        // 左侧外部
        this.columnsTable = [
            {
                title: '',
            },
            {
                title: this.i18n.io.fileIo.socketPath,
                width: '22.2%',
                sortKey: 'path'
            },
            {
                title: this.i18n.io.fileIo.totalTime,
                width: '13.5%',
                isSort: true,
                sortKey: 'duration'
            },
            {
                title: this.i18n.io.fileIo.count,
                width: '11.5%',
                isSort: true,
                sortKey: 'count'
            },
            {
                title: this.i18n.io.fileIo.readCount,
                width: '13.1%',
                isSort: true,
                sortKey: 'rCount'
            },
            {
                title: this.i18n.io.fileIo.writeCount,
                width: '13.1%',
                isSort: true,
                sortKey: 'wCount'
            },
            {
                title: this.i18n.io.fileIo.readByteCount,
                width: '13.3%',
                isSort: true,
                sortKey: 'rByte'
            },
            {
                title: this.i18n.io.fileIo.writeByteCount,
                width: '13.3%',
                isSort: true,
                sortKey: 'wByte'
            }
        ];
        this.columnsTableTime = [
            {
                title: this.i18n.io.fileIo.threadName,
                width: '14.5%',
                sortKey: 'threadName'
            },
            {
                title: this.i18n.io.fileIo.operateType,
                width: '16.5%',
                sortKey: 'type',
                filter: true,
                key: 'type',
                selected: [],
                options: [
                    { label: 'read' },
                    { label: 'write' },
                    { label: 'open' },
                    { label: 'close' }
                ],
                multiple: true,
                selectAll: true
            },
            {
                title: this.i18n.io.fileIo.operateTime,
                width: '19.8%',
                sortKey: 'start'
            },
            {
                title: this.i18n.io.fileIo.rAndWBytes,
                width: '18.9%',
                sortKey: 'byte',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.eventRate,
                width: '15.5%',
                sortKey: 'rate',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.duration,
                width: '14.5%',
                sortKey: 'duration',
                isSort: true,
            }
        ];
        this.socketIoBtnTip = this.i18n.io.btn_tip_socket;
        this.leftTable.searchOptions = [
            {
                label: this.i18n.plugins_perf_java_profiling_fileIO_address,
                value: 'ip'
            }
        ];
        this.rightTable.searchOptions = [
            {
                label: this.i18n.io.fileIo.threadName,
                value: 'threadName'
            }
        ];

        this.socketIOGroup = fb.group({
            socketIO_duration: new FormControl(256, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(10485760),
                ],
                updateOn: 'change',
            }),
        });
    }
    // sampling配置
    public socketIOGroup: FormGroup;
    public socketIOBlur: SpinnerBlurInfo;
    private seocnd = 1000 * 1000;
    private μs = 1000;
    private ms = Math.pow(1000, 2);
    public i18n: any;
    public echartsTitle: string;
    public tableListData: any[] = [];
    public tableListDataCopy: any[] = [];
    public beginFileIo = false;
    public Threshold = 1;
    public tipStr: string;
    public jvmId: any;
    public guardianId: any;
    public formatData = {};
    public ioData: any[] = [];
    public isStopFlag = true;
    public totalCount = 0;
    public currentEchartsFileName: string;
    public threshold = {
        label: '',
        min: 1,
        value: 256,
        format: 'N0',
        max: 10485760,
    };
    public filePath: any;
    public isDownload = false;
    public firstLevel: any;
    public filePathSelect: any;
    public clickFilePathSelect: any;
    public clickLeftData = false;
    public selectArr = ['', '', ''];
    public secondLevel: any;
    public socketHostSelect: any;
    public socketFdSelect: any;
    public rightTableSelected: any;
    // 栈
    public stackTranceData: Array<TiTreeNode> = [];
    selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
        this.stackTranceData,
        false,
        false
    );
    public totalCountMonitor: any;
    // echarts
    public chartId = Math.floor(window.crypto.getRandomValues(new Uint8Array(1))[0] * 0.001 * 10000000000);
    public echartsLabelTop: any;
    public echartsLabelBottom: any;
    public echartsOption: any;
    public echartsLegendData: any[] = [];
    public echartsData = {
        timeList: [] as any[],
        readSpeed: [] as any[],
        writeSpeed: [] as any[]
    };
    public xAxisData: any = [];
    public updateOptions: any = {};
    // 最大速率
    public maxYaxisValue = 0;


    // 左侧 表格部分
    public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataTable: TiTableSrcData;
    public columnsTable: Array<TiTableColumns> = [];
    public intOnecolumnsTable: Array<TiTableColumns> = [];
    public intTwocolumnsTable: Array<TiTableColumns> = [];
    public closeOtherDetails = true;
    public noDadaInfo = '';
    public thirdLevel = false;
    public expand = false;
    public selectTableIndex: any[] = [];
    public selectTable: any;
    public isDoSnapClick = true; // 防止重复点击
    // 右侧 表格
    public displayedTableTime: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataTableTime: TiTableSrcData;
    private dataTableTime: Array<TiTableRowData> = [];
    public columnsTableTime: Array<TiTableColumns> = [];
    public upEchartCount = 0;
    private limit = {
        times: 3,
        records: 5000
    };
    private threadsQueue: any[] = [];
    public startBtnDisabled = false;
    private isStopMsgSub: Subscription;
    public isSocketIoSub: Subscription;
    public tip1Context: any;
    public snapCount: number;
    public timeData: any[] = [];
    public echartsInstance: any = {};
    public socketIoBtnTip = '';

    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;

    public leftTable = {
        pageNo: 0,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
        searchOptions: [] as any[],
        searchWords: [] as any[],
        searchKeys: [] as any[]
    };
    public rightTable = {
        pageNo: 0,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
        searchOptions: [] as any[],
        searchWords: [] as any[],
        searchKeys: [] as any[]
    };
    private isAddEvent = false;
    private hotClassMap = {};
    public showLoading = false;
    public isBool = true;
    public clickName = '';
    public ipIndex = 0;
    public socketTimeout: any = null;
    public imgSrc = './assets/img/projects/expand-down.svg';
    public isStart = false;
    /**
     * ngOnInit
     */
    ngOnInit() {
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.socketIo;
        if (this.msgService) {
            this.msgService.clearProSocketMessage();
        }
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop'));
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        if (!this.snapShot) {
            this.tableListData = this.downloadService.downloadItems.pSocketIO.tableData;
        }
        this.snapCount = this.downloadService.downloadItems.pSocketIO.snapCount;
        this.srcDataTable = {
            data: this.tableListData,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.setSpinnerBlur();

        this.leftTable.total = this.srcDataTable.data.length;
        this.srcDataTableTime = {
            data: this.dataTableTime,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
        this.rightTable.total = this.srcDataTableTime.data.length;
        if (!this.snapShot) {
            this.isSocketIoSub = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'isSocketIo') {
                    this.doSnap('pSocketIO');
                }
            });
        }
        if (this.isDownload) {
            this.initXAxisData(this.limit.times * 60);
            this.tableListData = this.downloadService.downloadItems.pSocketIO.tableData;
            this.socketIOGroup.controls.socketIO_duration.setValue(
                this.downloadService.downloadItems.pSocketIO.threshold);
            this.currentEchartsFileName = this.downloadService.downloadItems.pSocketIO.currentEchartsFileName;
            this.echartsLabelTop = this.downloadService.downloadItems.pSocketIO.echartsLabelTop;
            this.echartsLabelBottom = this.downloadService.downloadItems.pSocketIO.echartsLabelBottom;
            this.stackTranceData = this.downloadService.downloadItems.pSocketIO.stackTranceData;
            this.echartsData.timeList = this.downloadService.downloadItems.pSocketIO.echarts.timeList;
            this.echartsData.readSpeed = this.downloadService.downloadItems.pSocketIO.echarts.readSpeed;
            this.echartsData.writeSpeed = this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed;
            this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
            this.timeData = this.downloadService.downloadItems.pSocketIO.echarts.timeData;
            this.fullStatisticHotClass();
        } else {
            this.isStart = true;
            this.beginFileIo = this.downloadService.dataSave.isSocketIOStart;
            if (!this.beginFileIo) {
                this.onStopFileIo();
            }
             // 设置初始化第一列 headfilter 的选中项
            this.columnsTableTime[1].selected = [
                this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
                this.columnsTableTime[1].options[2], this.columnsTableTime[1].options[3]
            ];
            this.tableListDataCopy = this.downloadService.downloadItems.pSocketIO.tableData;
            this.socketIOGroup.controls.socketIO_duration.setValue(
              this.downloadService.downloadItems.pSocketIO.threshold);
            this.currentEchartsFileName = this.downloadService.downloadItems.pSocketIO.currentEchartsFileName;
            this.filePathSelect = this.currentEchartsFileName;
            this.echartsData.timeList = this.downloadService.downloadItems.pSocketIO.echarts.timeList;
            this.echartsData.readSpeed = this.downloadService.downloadItems.pSocketIO.echarts.readSpeed;
            this.echartsData.writeSpeed = this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed;
            this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
            this.timeData = this.downloadService.downloadItems.pSocketIO.echarts.timeData;
            this.fullStatisticHotClass(this.tableListDataCopy);
            this.initXAxisData(this.limit.times * 60, this.echartsData.timeList);
        }
        this.stackTranceData = this.downloadService.downloadItems.pSocketIO.stackTranceData;
        this.tableListData.forEach(item => {
            if (item.ip === this.currentEchartsFileName) {
                this.handleRightTable(item, true);
            }
        });
        if (this.echartsData.timeList.length > 0) {
            const max1 = this.echartsData.readSpeed;
            const max2 = max1.concat(this.echartsData.writeSpeed);
            this.echartsLabelTop = this.libService.onChangeUnit(Number((Math.max(...max2) * 1024).toFixed(2)));
            this.echartsLabelBottom = 0;
        }
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'dataLimit' && msg.data.name === 'socket_io') {
                (this.limit as any)[msg.data.type] = msg.data.value;
                this.echartsData.readSpeed = [];
                this.echartsData.writeSpeed = [];
                this.initXAxisData(this.limit.times * 60);
                this.echartsData.timeList = [];
            }
            if (msg.type === 'isStopPro') {
                this.startBtnDisabled = true;
                this.beginFileIo = false;
                this.downloadService.dataSave.isSocketIOStart = false;
                this.clearSocketTimer();
            }
            if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.socketIo) {
                this.clearData();
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.snapCount = 0;
                }
                this.getWorkerData();
            }
        });
        if (this.snapShot) {
            this.isStart = true;
            // 设置初始化第一列 headfilter 的选中项
            this.columnsTableTime[1].selected = [
                this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
                this.columnsTableTime[1].options[2], this.columnsTableTime[1].options[3]
            ];
            return;
        }
        this.getWorkerData();
        this.limit.times = this.downloadService.dataLimit.socket_io.timeValue;
        this.limit.records = this.downloadService.dataLimit.socket_io.dataValue;
        this.stompService.socketIoSub = this.msgService.getSocketMessage().subscribe((msg) => {
            if (msg.type === 'psocketIO') {
                if (msg.data) {
                    this.clearSocketTimer();
                }
                if (this.socketIOWorker) {
                    this.socketIOWorker.postMessage({
                        type: 'socketIOWs',
                        data: msg.data
                    });
                    this.addToThreadsQueue(msg.data);
                    this.statisticHotClass(msg.data);
                    this.updateStackTreeCount(this.stackTranceData);
                    if (this.threadsQueue.length > this.limit.records) {
                        const outNumber = this.threadsQueue.length - this.limit.records;
                        this.socketIOWorker.postMessage({
                            type: 'dataLimit',
                            earliestTime: this.threadsQueue[outNumber]
                        });
                    } else {
                        this.socketIOWorker.postMessage({ type: 'dataLimit' });
                    }
                }
            }
        });
        this.stompService.updataSocketIOSub = this.msgService.getSocketUpdateMessage().subscribe((msg) => {
            if (msg.type === 'updata_socketIO') {
                this.upEchartCount++;
                this.upEchartData(msg.data);
            }
        });
        this.initEchart();
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.ideType = 'intellij';
        } else {
            this.ideType = 'other';
        }
        // 设置初始化第一列 headfilter 的选中项
        this.columnsTableTime[1].selected = [
            this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
            this.columnsTableTime[1].options[2], this.columnsTableTime[1].options[3]
        ];
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.socketIOBlur = {
            control: this.socketIOGroup.controls.socketIO_duration,
            min: 1,
            max: 10485760,
        };
    }

    /**
     * 微调器回填
     */
    public verifySpinnerValue(value: any) {
        this.regularVerify.setSpinnerInfo(value);
    }

    /**
     * 清除当前缓存数据
     */
    public clearData() {
        if (this.socketIOWorker) { this.socketIOWorker.terminate(); this.socketIOWorker = null; }
        this.srcDataTable.data = [];
        this.srcDataTableTime.data = [];
        this.stackTranceData = [];
        this.initXAxisData(this.limit.times * 60);
        this.echartsData.readSpeed = [];
        this.echartsData.writeSpeed = [];
        this.echartsData.timeList = [];
        this.echartsLabelTop = null;
        this.tableListData = [];
        this.handelClearCache();
        if (this.echartsInstance) {
            this.echartsInstance.clear();
            this.echartsInstance = null;
        }
    }

    /**
     * 获取新数据
     */
    public getWorkerData() {
        if (typeof Worker !== 'undefined') {
            // 为解决跨域调用问题，将脚本内嵌在index.html中，通过下述语句获取脚本内容并创建子线程
            const blob = new Blob([document.querySelector('#profile-socket-io-worker').textContent]);
            const url = window.URL.createObjectURL(blob);
            // 创建子线程
            this.socketIOWorker = new Worker(url);
            this.socketIOWorker.onmessage = ({ data }) => {
                this.handleAllData(data);
                this.handleTableListOpen();
                this.srcDataTable.data = this.tableListData;
                this.leftTable.total = this.srcDataTable.data.length;
                if (!this.currentEchartsFileName) {
                    this.srcDataTable.data[0].showDetails = true;
                    this.firstLevel = this.srcDataTable.data[0].ip;
                    this.onClickTableRow(this.srcDataTable.data[0], 0);
                } else {
                    if (this.clickLeftData) {
                        this.srcDataTable.data.forEach((el) => {
                            if (el.ip === this.clickFilePathSelect && this.clickLeftData) {
                                this.clickLeftData = !this.clickLeftData;
                                this.addTableBackgroundColor(el, 0);
                            }
                        });
                    }
                }
                this.updateDownloadItems();
                if (!this.isAddEvent) {
                    this.addTreeScrollEvent();
                }
                // 右侧实时刷新
                this.handleRightTable(this.srcDataTable.data[this.ipIndex], false);
            };
        }
    }

    /**
     * 清理缓存
     */
    public handelClearCache() {
        this.downloadService.downloadItems.pSocketIO.currentIpIndex = null;
        this.downloadService.downloadItems.pSocketIO.currentHostIndex = null;
        this.downloadService.downloadItems.pSocketIO.currentFdIndex = null;
        this.downloadService.downloadItems.pSocketIO.tableData = [];
        this.downloadService.downloadItems.pSocketIO.threshold =
            this.socketIOGroup.controls.socketIO_duration.value; // 256
        this.downloadService.downloadItems.pSocketIO.fileIPMap = {};
        this.downloadService.downloadItems.pSocketIO.isCurrentType = '';
        this.downloadService.downloadItems.pSocketIO.currentEchartsIPName = '';
        this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName = '';
        this.downloadService.downloadItems.pSocketIO.currentEchartsFdName = '';
        this.downloadService.downloadItems.pSocketIO.echartsLabelTop = '';
        this.downloadService.downloadItems.pSocketIO.echarts.timeList = new Array(180).fill('');
        this.downloadService.downloadItems.pSocketIO.echarts.readSpeed = [];
        this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed = [];
        this.downloadService.downloadItems.pSocketIO.stackTranceData = [];
        this.downloadService.downloadItems.pSocketIO.currentHostTableList = [];
        this.downloadService.downloadItems.pSocketIO.currentFdTableList = [];
        this.downloadService.downloadItems.pSocketIO.spinnerValue = 10;
        this.downloadService.downloadItems.pSocketIO.primaryTime = null;
        this.downloadService.downloadItems.pSocketIO.dataCount = 0;
    }

    /**
     * 添加线程开始时间到队列
     */
    private addToThreadsQueue(threads: any) {
        this.threadsQueue.push(...threads.map((item: { start_: any }) => (item.start_)));
    }

    /**
     * 监听滚动事件
     */
    ngAfterViewInit() {
        this.addTreeScrollEvent();
    }

    private updateDownloadItems() {
        this.downloadService.downloadItems.pSocketIO.tableData = this.tableListData;
        this.downloadService.downloadItems.pSocketIO.threshold =
            this.socketIOGroup.controls.socketIO_duration.value;
        this.downloadService.downloadItems.pSocketIO.echartsLabelTop = this.echartsLabelTop;
        this.downloadService.downloadItems.pSocketIO.currentEchartsFileName = this.currentEchartsFileName;
        this.downloadService.downloadItems.pSocketIO.echarts.timeList = this.echartsData.timeList;
        this.downloadService.downloadItems.pSocketIO.echarts.readSpeed = this.echartsData.readSpeed;
        this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed = this.echartsData.writeSpeed;
        this.downloadService.downloadItems.pSocketIO.echarts.timeData = this.timeData;
        this.downloadService.downloadItems.pSocketIO.stackTranceData = this.stackTranceData;
    }

    /**
     * 页面销毁
     */
    ngOnDestroy() {
        if (this.isDownload || this.snapShot) { return; }
        if (this.socketIOWorker) { this.socketIOWorker.terminate(); this.socketIOWorker = null; }
        if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
        if (this.isSocketIoSub) { this.isSocketIoSub.unsubscribe(); }
        if (this.stompService.socketIoSub) { this.stompService.socketIoSub.unsubscribe(); }
        if (this.stompService.updataSocketIOSub) { this.stompService.updataSocketIOSub.unsubscribe(); }
        this.downloadService.downloadItems.pSocketIO.stackTranceData = this.stackTranceData;
    }

    /**
     * 处理worker传来的数据
     * @param data 数据
     */
    private handleAllData(data: any) {
        if (this.tableListDataCopy.length !== 0) {
            this.tableListDataCopy.map((oldItem) => {
                data.filter((newItem: any, index: number) => {
                    if (newItem.ip === oldItem.ip) {
                        // 将相同的数据合并到就的数据中
                        oldItem.duration += newItem.duration;
                        oldItem.count += newItem.count;
                        oldItem.rCount += newItem.rCount;
                        oldItem.wCount += newItem.wCount;
                        oldItem.rByte += newItem.rByte;
                        oldItem.wByte += newItem.wByte;
                        // 处理host的值
                        this.mergeHostInfo(newItem.host, oldItem.host);
                        data.splice(index, 1);
                    }
                });
            });
        }
        this.tableListData = [...data, ...this.tableListDataCopy].sort((a, b) => {
            return b.count - a.count;
        });
    }

    /**
     * 合并Host下的数据
     * @param oldHost 切换页签前的数据
     * @param newHost 切换页签之后的数据
     */
    private mergeHostInfo(newHost: any, oldHost: any) {
        Object.keys(newHost).forEach((key) => {
            if (oldHost[key]) {
                oldHost[key].duration += newHost[key].duration;
                oldHost[key].count += newHost[key].count;
                oldHost[key].readByte += newHost[key].readByte;
                oldHost[key].readCount += newHost[key].readCount;
                oldHost[key].writeByte += newHost[key].writeByte;
                oldHost[key].writeCount += newHost[key].writeCount;
                this.mergeFdsInfo(newHost[key].fds, oldHost[key].fds);
            } else {
                oldHost[key] = newHost[key];
            }
        });
    }
    /**
     * 合并Fds下的数据
     * @param oldFds 切换页签前的数据
     * @param newFds 切换页签之后的数据
     */
    private mergeFdsInfo(newFds: any, oldFds: any) {
        Object.keys(newFds).forEach((key) => {
            if (oldFds[key]) {
                oldFds[key].duration += newFds[key].duration;
                oldFds[key].count += newFds[key].count;
                oldFds[key].rByte += newFds[key].rByte;
                oldFds[key].rCount += newFds[key].rCount;
                oldFds[key].wByte += newFds[key].wByte;
                oldFds[key].wCount += newFds[key].wCount;
            } else {
                oldFds[key] = newFds[key];
            }
        });
    }

    /**
     * 更新echarts数据
     */
    public updateEchartsData() {
        if (!this.echartsInstance) { return; }
        this.echartsInstance.setOption({
            yAxis: [
                {
                    max: this.echartsLabelTop
                }
            ],
            series: [
                {
                    data: this.echartsData.readSpeed
                },
                {
                    data: this.echartsData.writeSpeed
                }
            ],
            xAxis: [
                {
                    data: this.echartsData.timeList
                }
            ]
        });
    }

    /**
     * 点击按钮，判断开始分析、停止分析
     */
    public onControlAnalysis() {
        this.showLoading = true;
        if (this.snapShot) { return; }
        if (!this.beginFileIo) {
            this.onStartFileIo();
        } else {
            this.onStopFileIo();
            this.showLoading = false;
        }
        this.isStart = true;
        this.beginFileIo = !this.beginFileIo;
    }

    /**
     * 开始分析
     */
    public onStartFileIo() {
        this.isBool = true;
        this.ipIndex = 0;
        this.leftTable.searchWords[0] = '';
        this.rightTable.searchWords[0] = '';
        // 设置初始化第一列 headfilter 的选中项
        this.columnsTableTime[1].selected = [
            this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
            this.columnsTableTime[1].options[2], this.columnsTableTime[1].options[3]
        ];
        this.getWorkerData();
        if (this.startBtnDisabled) { return; }

        if (!this.socketIOGroup.controls.socketIO_duration.value) {
            const invalidEl = this.el.nativeElement.querySelector(
                `.fileIO-threshold.ng-invalid.ng-touched:not([tiFocused])`);
            if (invalidEl) {
                const inputEl = $(invalidEl).find('.ti3-spinner-input-box>.ti3-spinner-input')[0];
                inputEl.focus();
            }
            return;
        }
        this.isStopFlag = true;
        this.srcDataTable.data = [];
        this.srcDataTableTime.data = [];
        this.tableListData = [];
        this.tableListDataCopy = [];
        this.initXAxisData(this.limit.times * 60);
        this.echartsData.writeSpeed = [];
        this.echartsData.readSpeed = [];
        this.echartsLabelTop = null;
        this.stackTranceData = [];
        this.currentEchartsFileName = '';
        this.updateDataEchart();
        this.msgService.isClearProSocket = false;
        this.msgService.clearProSocketMessage();
        this.downloadService.downloadItems.pSocketIO.tableData = [];
        this.stompService.startStompRequest('/cmd/start-instrument-socket', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.socketIOGroup.controls.socketIO_duration.value
        });
        this.downloadService.dataSave.psocketThreshold = this.socketIOGroup.controls.socketIO_duration.value;
        this.downloadService.dataSave.isFileIOStart = false;
        this.downloadService.dataSave.isSocketIOStart = true;
        this.socketTimeout = setTimeout(() => {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.profileNodataTip.socketIo,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }, 30000);
        if (this.stompService.socketIOTimer) {
            clearInterval(this.stompService.socketIOTimer);
            this.stompService.socketIOTimer = null;
        }
        this.stompService.socketIOTimer = setInterval(() => {
            this.stompService.socketIOUpdata();
        }, this.stompService.fileIoStep);
    }
    private addTreeScrollEvent() {
        $('.ti3-tree-container').on('scroll', () => {
            this.isAddEvent = true;
            if ($('.ti3-tree-container').scrollTop() > 0) {
                $('.ti3-tree-container').addClass('ti-tree-box-shadow');
            } else {
                $('.ti3-tree-container').removeClass('ti-tree-box-shadow');
            }
        });
    }
    /**
     * 停止分析
     */
    public onStopFileIo() {
        this.stompService.startStompRequest('/cmd/stop-instrument-socket', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.socketIOGroup.controls.socketIO_duration.value
        });
        this.downloadService.dataSave.psocketThreshold =
            this.socketIOGroup.controls.socketIO_duration.value;
        this.downloadService.dataSave.isSocketIOStart = false;
        this.clearSocketTimer();
        if (!this.isStopFlag) {
            this.isStopFlag = true;
            return;
        }
        clearInterval(this.stompService.socketIOTimer);
        this.stompService.socketIOTimer = null;
        this.socketIOWorker = null;
        this.msgService.isClearProSocket = true;
        this.msgService.clearProSocketMessage();
    }

    /**
     * 初始化echarts的option
     */
    public initEchart() {
        const that = this;
        let back1;
        let legendTextColor;
        let axisLineColor;
        if (this.currTheme === COLOR_THEME.Light) {
            back1 = '#fff';
            legendTextColor = '#222';
            axisLineColor = '#E1E6EE';
        } else {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                back1 = '#313335';
                legendTextColor = '#e8e8e8';
                axisLineColor = '#484A4E';
            } else {
                back1 = '#1e1e1e';
                legendTextColor = '#e8e8e8';
                axisLineColor = '#484A4E';
            }
        }
        const option = {
            backgroundColor: back1,
            color: ['#2da46f', '#3d7ff3'],
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                borderRadius: 5,
                formatter: (params: any) => {
                    let html = '';
                    let read = null;
                    let write = null;
                    if (params.length === 1) {
                        let isRead = false;
                        if (params[0] && params[0].seriesName === this.i18n.io.fileIo.readRate) {
                            read = params[0].data === conNum.zeroApproximation ? 0 : params[0].data;
                            read = that.libService.onChangeUnit(read * 1024);
                            isRead = true;
                        }
                        if (params[0] && params[0].seriesName === this.i18n.io.fileIo.writeRate) {
                            write = params[0].data === conNum.zeroApproximation ? 0 : params[0].data;
                            write = that.libService.onChangeUnit(write * 1024);
                        }
                        html += `
                        <div style='padding:10px;'>
                            <div>${params[0].axisValueLabel}</div>
                            <div style='margin-top:5px'>
                                <span style="display:inline-block;margin-right: 8px;width: 8px;height: 8px;
                                background-color:${params[0].color};"></span>
                                <span style='width:80px;display:inline-block'>${params[0].seriesName}</span>
                                <span >${isRead ? read : write}/s</span>
                            </div>
                        </div>
                        `;
                    } else {
                        read = params[0].data === conNum.zeroApproximation ? 0 : params[0].data;
                        write = params[1].data === conNum.zeroApproximation ? 0 : params[1].data;
                        read = that.libService.onChangeUnit(read * 1024);
                        write = that.libService.onChangeUnit(write * 1024);
                        html += `
                        <div style='padding:10px;'><div>${params[0].axisValueLabel}</div>
                        <div style='margin-top:5px'>
                            <span style="display:inline-block;margin-right: 8px;width: 8px;
                            height: 8px;background-color:#2da46f;"></span>
                            <span style='width:80px;display:inline-block'>${this.i18n.io.fileIo.readRate}</span>
                            <span >${read}/s</span>
                        </div>
                        <div style='margin-top:5px'>
                            <span style="display:inline-block;margin-right: 8px;width: 8px;
                            height: 8px;background-color:#3d7ff3;"></span>
                            <span style='width:80px;display:inline-block'>${this.i18n.io.fileIo.writeRate}</span>
                            <span >${write}/s</span>
                        </div>
                        </div>
                        `;
                    }
                    return html;
                }
            },
            legend: {
                data: [this.i18n.io.fileIo.writeRate, this.i18n.io.fileIo.readRate],
                textStyle: {
                    color: legendTextColor,
                },
                icon: 'rect',
                right: 45,
                top: 25,
                selectedMode: true,
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 16,
            },
            grid: {
                left: 10,
                right: 25,
                bottom: '10%',
                containLabel: true
            },
            dataZoom: [{ type: 'inside' }],
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    position: 'bottom',
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: axisLineColor,
                            width: 1
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: legendTextColor,
                        },
                    },
                    axisTick: {
                        show: true,
                        alignWithLabel: true,
                    },
                    data: this.xAxisData,
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: true,
                    min: 0,
                    max: this.maxYaxisValue,
                    interval: this.maxYaxisValue,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'solid',
                            color: axisLineColor,
                        }
                    },
                    axisLabel: {
                        show: true,
                        color: legendTextColor,
                        formatter: (value: any) => {
                            return `${that.libService.onChangeUnit(value * 1024)}/s`;
                        }
                    },
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    id: 'series1',
                    name: this.i18n.io.fileIo.readRate,
                    type: 'line',
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: '#2da46f',
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(45,164,111,0.4)',
                                },
                            ],
                            globalCoord: false,
                        },
                        opacity: 0.5
                    },
                    data: this.echartsData.readSpeed
                },
                {
                    id: 'series2',
                    name: this.i18n.io.fileIo.writeRate,
                    type: 'line',
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: '#3d7ff3',
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(61,127,243,0.4)',
                                },
                            ],
                            globalCoord: false,
                        },
                        opacity: 0.5
                    },
                    data: this.echartsData.writeSpeed
                }
            ]
        };
        this.echartsOption = option;
    }
    /**
     * 更新echart图表的option
     */
    public updateDataEchart() {
        this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
        this.updateOptions = {
            series: [
                {
                    id: 'series1',
                    data: this.echartsData.readSpeed
                },
                {
                    id: 'series2',
                    data: this.echartsData.writeSpeed
                }
            ],
            xAxis: [
                {
                    data: this.xAxisData,
                }
            ],
            yAxis: [
                {
                    max: this.maxYaxisValue,
                    interval: this.maxYaxisValue
                },
            ],
        };
    }
    private upEchartData(data: any) {
        const readSpeed = data.rSpeed === 0 ? conNum.zeroApproximation : data.rSpeed;
        const writeSpeed = data.wSpeed === 0 ? conNum.zeroApproximation : data.wSpeed;
        const axisTime = this.handleTimeFormat(data.endTime);
        const index = this.xAxisData.findIndex((item: any) => {
            return item === '';
        });
        if (index !== -1) {
            this.xAxisData[index] = axisTime;
        } else {
            this.xAxisData.push(axisTime);
        }
        if (this.echartsData.timeList.length > this.limit.times * 60) {
            this.echartsData.timeList = this.echartsData.timeList.slice(-this.limit.times * 60);
            this.echartsData.timeList.push(this.handleTimeFormat(data.endTime));
        } else {
            this.echartsData.timeList.push(this.handleTimeFormat(data.endTime));
        }
        this.updateXAxisData();
        if (this.echartsData.readSpeed.length > this.limit.times * 60) {
            this.echartsData.readSpeed = this.echartsData.readSpeed.slice(-this.limit.times * 60);
            this.echartsData.writeSpeed = this.echartsData.writeSpeed.slice(-this.limit.times * 60);
            this.echartsData.readSpeed.push(readSpeed);
            this.echartsData.writeSpeed.push(writeSpeed);
        } else {
            this.echartsData.readSpeed.push(readSpeed);
            this.echartsData.writeSpeed.push(writeSpeed);
        }
        this.updateDataEchart();
        setTimeout(() => {
            this.buildTimeLine(this.echartsData.timeList);
        }, 0);
        const max1 = this.echartsData.readSpeed;
        const max2 = max1.concat(this.echartsData.writeSpeed);
        this.echartsLabelTop = this.libService.onChangeUnit(Number((Math.max(...max2) * 1024).toFixed(2)));
        this.echartsLabelBottom = 0;
    }

    /**
     * 初始化时间轴数据
     */
    public initXAxisData(num: any, timeArr?: any) {
        this.xAxisData = [];
        this.xAxisData = this.utils.getXAxis(num);
        if (timeArr && timeArr.length) {
            this.xAxisData.splice(0, timeArr.length);
            this.xAxisData = [...timeArr, ...this.xAxisData];
        }
    }

    /**
     * 更新x轴数据
     */
    public updateXAxisData() {
        if (this.xAxisData.length > (this.limit.times * 60)) {
            this.xAxisData.shift();
            this.echartsData.readSpeed.shift();
            this.echartsData.writeSpeed.shift();
            this.echartsData.timeList.shift();
        }
    }
    /**
     * 整理row.threads信息，返回可枚举的属性值数组
     * @param fileDatas fileDatas
     */
    public formatViewData(fileDatas: any) {
        return Object.values(fileDatas);
    }
    /**
     * 点击左侧表格某行
     * @param row row
     * @param arg arg
     */
    public onClickTableRow(row: any, ...arg: any) {
        this.clickLeftData = true;
        this.ipIndex = arg[0];
        let isClick: boolean;
        if (arg.length === SELECTED_TOP_NUM.NUM_TOP10) {
            this.clickFilePathSelect = row.ip;
            isClick = this.clickName !== row.ip;
        } else if (arg.length === SELECTED_TOP_NUM.NUM_SELF_CONFIG) {
            this.clickFilePathSelect = row.host;
            isClick = this.clickName !== row.host;
        } else {
            this.clickFilePathSelect = row.fd;
            isClick = this.clickName !== row.fd;
        }
        if (this.isBool || isClick) {
            this.isBool = false;
            if (arg.length === SELECTED_TOP_NUM.NUM_TOP10) {
                this.clickName = row.ip;
            } else if (arg.length === SELECTED_TOP_NUM.NUM_SELF_CONFIG) {
                this.clickName = row.host;
            } else {
                this.clickName = row.fd;
            }
            this.addTableBackgroundColor(row, arg);
            this.handleRightTable(row, true);

            this.handleIsNowData(row);
            this.stompService.pSocketIp = this.filePath;
            this.upEchartCount = 0;
            this.updateDataEchart();
            this.echartsLabelTop = 0;
        }

    }
    /**
     * 判断当前选中行是否已被选中
     * @param type 判断是当前选中是路径还是线程
     * @param name 当前选中行的name值
     */
    public handleIsNowData(row: any) {
        if (this.isDownload || this.snapShot || this.startBtnDisabled) {
            if (row.ip === this.downloadService.downloadItems.pSocketIO.currentEchartsFileName && !this.beginFileIo) {
                this.setEchart();
                return;
            }
        }
        if (row.ip === this.downloadService.downloadItems.pSocketIO.currentEchartsFileName && !this.beginFileIo) {
            this.setEchart();
        } else {
            this.echartsData.timeList = [];
            this.echartsData.readSpeed = [];
            this.echartsData.writeSpeed = [];
            this.initXAxisData(this.limit.times * 60);
            this.upEchartCount = 0;
        }
    }
    /**
     * 赋值echars
     * @param row row
     */
    public setEchart() {
        this.currentEchartsFileName = this.downloadService.downloadItems.pSocketIO.currentEchartsFileName;
        this.echartsData.timeList = this.downloadService.downloadItems.pSocketIO.echarts.timeList;
        this.echartsData.readSpeed = this.downloadService.downloadItems.pSocketIO.echarts.readSpeed;
        this.echartsData.writeSpeed = this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed;
        this.timeData = this.downloadService.downloadItems.pSocketIO.echarts.timeData;
        this.fullStatisticHotClass(this.tableListDataCopy);
        this.initXAxisData(this.limit.times * 60, this.echartsData.timeList);
    }
    private addTableBackgroundColor(row: any, arg: any) {
        this.filePathSelect = row.ip || row.host || row.fd;
        if (row && arg.length === 1) {
            this.currentEchartsFileName = row.ip;
            this.filePath = row.ip;
            this.selectArr[0] = row.ip;
            this.tableListData.forEach((item, index) => {
                item.isSelect = arg[0] === index;
                if (item.isSelect && item.host[this.socketHostSelect]) {
                    item.host[this.socketHostSelect].isSelect = false;
                    item.host[this.socketHostSelect].showDetails = false;
                    if (item.host[this.socketHostSelect].fds[this.socketFdSelect]) {
                        item.host[this.socketHostSelect].fds[this.socketFdSelect].isSelect = false;
                        item.host[this.socketHostSelect].fds[this.socketFdSelect].showDetails = false;
                    }
                }
            });
        } else if (row && arg.length === 2) {
            if (this.socketHostSelect && this.socketHostSelect !== row.host) {
                if (this.tableListData[arg[0]].host[this.socketHostSelect]) {
                    this.tableListData[arg[0]].host[this.socketHostSelect].isSelect = false;
                    this.tableListData[arg[0]].host[this.socketHostSelect].showDetails = false;
                    if (this.tableListData[arg[0]].host[this.socketHostSelect].fds[this.socketFdSelect]) {
                        this.tableListData[arg[0]].host[this.socketHostSelect].fds[this.socketFdSelect].
                            isSelect = false;
                    }
                }
            }
            this.socketHostSelect = row.host;
            this.selectArr[1] = row.host;
            this.currentEchartsFileName = this.selectArr[0] + ' ( ' + this.selectArr[1] + ' )';
            this.tableListData[arg[0]].host[row.host].isSelect = true;
        } else if (row && arg.length === 3) {
            if (this.socketFdSelect && this.socketFdSelect !== row.fd) {
                if (this.tableListData[arg[0]].host[this.socketHostSelect].fds[this.socketFdSelect]) {
                    this.tableListData[arg[0]].host[this.socketHostSelect].fds[this.socketFdSelect].isSelect = false;
                }
            }
            this.socketFdSelect = row.fd;
            this.selectArr[2] = row.fd;
            this.currentEchartsFileName = this.currentEchartsFileName
                = this.selectArr[0] + ' ( ' + this.selectArr[1] + ' [ ' + this.selectArr[2] + ' ] )';
            this.tableListData[arg[0]].host[this.socketHostSelect].fds[row.fd].isSelect = true;
        }
    }
    /**
     * 生成右边表格信息
     * @param row row
     * @param isExpand 判断是否收起栈跟踪数据
     */
    public handleRightTable(fdRow: any, isExpand: boolean) {
        const list: any[] = [];
        if (fdRow.ip) {
            this.formatViewData(fdRow.host).forEach((item: any) => {

                this.formatViewData(item.fds).forEach((thread: any) => {

                    thread.threads.forEach((itemLocal: any) => {
                        list.push(itemLocal);
                    });
                });
            });
        } else if (fdRow.fds) {
            this.formatViewData(fdRow.fds).forEach((thread: any) => {

                thread.threads.forEach((item: any) => {
                    list.push(item);
                });
            });
        } else {
            fdRow.threads.forEach((item: any) => {
                list.push(item);
            });
        }
        this.dataTableTime = list.map((item) => {
            item.isSelect = false;
            item.rate = +this.onChangeRate(item.byte, item.duration);
            return item;
        });
        this.srcDataTableTime.data = this.dataTableTime;
        this.rightTable.total = this.srcDataTableTime.data.length;
        this.onTypeSelect();
        if (isExpand) {
            this.onClickRightTable(this.dataTableTime[0], 0);
        }
    }
    /**
     * onClickRightTable
     * @param row row
     * @param index index
     */
    public onClickRightTable(row: any, index: number) {
        if (this.rightTableSelected > -1 && this.rightTableSelected !== index) {
            this.dataTableTime[this.rightTableSelected].isSelect = false;
        }
        this.rightTableSelected = index;
        this.dataTableTime[index].isSelect = true;
        this.stackTranceData = row.stackTrace.children;
        this.deExpandNode(row.stackTrace.children);
        this.stackTranceData = this.handleSelectedTreeData(row.stackTrace.children);
        this.updateStackTreeCount(this.stackTranceData);
    }
    /**
     * 处理树节点数据
     */
    handleSelectedTreeData(data: Array<any>) {
        data.forEach((item: any) => {
            if (item.children && item.children.length) {
                this.handleSelectedTreeData(item.children);
            } else {
                delete item.children;
            }
        });
        return data;
    }
    private deExpandNode(treeData: any): void {
        const data: Array<TiTreeNode> = treeData.concat();
        TiTreeUtil.traverse(data, traverseFn);

        function traverseFn(node: TiTreeNode): void {
            node.expanded = false;
        }
        this.stackTranceData = data;
    }
    /**
     * onSelect
     */
    public onSelect(): void {
        this.selectedData = TiTreeUtil.getSelectedData(
            this.stackTranceData,
            false,
            false
        );
    }
    /**
     * onClickExpand
     */
    public onClickExpand(): void {
        this.expand = !this.expand;
    }
    /**
     * 展开整个树
     * @param num num
     */
    public expandAllNode(row: TiTableRowData) {
        if (row.expanded) {
            return;
        }
        const data: Array<TiTreeNode> = this.stackTranceData.concat();
        TiTreeUtil.traverse(data, traverseFn);
        function traverseFn(node: TiTreeNode): void {
            node.expanded = true;
        }
        this.stackTranceData = data;
    }
    /**
     * io时间单位
     * @param time time
     */
    public onChangeTime(time: any): any {
        if (time < this.μs) {
            return time.toFixed(2) + 'μs';
        } else if (this.μs < time && time < this.ms) {
            return (time / this.μs).toFixed(2) + 'ms';
        } else if (this.ms < time) {
            return (time / this.ms).toFixed(2) + 's';
        }
    }
    /**
     * handleTimeFormat
     * @param time time
     */
    public handleTimeFormat(time: any) {
        const date = new Date(time);
        return `${date.getHours() < 10 ? '0' + date.getHours() :
            date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() :
                date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;
    }
    /**
     * onChangeRate
     * @param byte byte
     * @param dura dura
     */
    public onChangeRate(byte: any, dura: any) {
        if (byte === 0) {
            return 0;
        }
        if (dura === 0) {
            return 0;
        }
        const KB = (byte / 1024);
        let s;
        if (this.seocnd) {
            s = dura / this.seocnd;
        }
        return (KB / s).toFixed(2);
    }
    /**
     * beforeToggle
     * @param row row
     */
    public beforeToggle(row: TiTableRowData) {
        if (!this.firstLevel) {
            this.firstLevel = row.ip;
        } else {
            this.firstLevel = null;
        }
        row.showDetails = !row.showDetails;
        if (this.selectArr[1]) {
            row.host[this.selectArr[1]].showDetails = false;
        }
        return false;
    }
    /**
     * beforeToggleSecond
     * @param row row
     */
    public beforeToggleSecond(row: TiTableRowData) {
        if (!this.secondLevel) {
            this.secondLevel = row.host;
        } else {
            this.secondLevel = null;
        }
        row.showDetailsH = !row.showDetailsH;
    }
    /**
     * handleTableListOpen
     */
    public handleTableListOpen() {
        if (!this.firstLevel) {
            return;
        }
        this.tableListData.forEach((item) => {
            if (item.ip === this.firstLevel) {
                item.showDetails = true;
                if (this.secondLevel) {
                    item.host[this.secondLevel].showDetailsH = true;
                }
            }
        });
    }
    /**
     * 快照点击事件
     * @param property property
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
     * @param type 页面参数
     */
    public doSnap(type: any) {
        if (this.isDownload) { return; }
        if (this.isDoSnapClick) {
            this.isDoSnapClick = false;
            // 事件
            this.doSnapFn(type);
            // 定时器
            setTimeout(() => {
                this.isDoSnapClick = true;
            }, 1000); // 一秒内不能重复点击
        }
    }
    /**
     * 储存快照数据
     */
    public doSnapFn(type: any) {
        if (this.isDownload) { return; }
        if (this.srcDataTable.data.length < 1) {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.snapshot_analysis_noData,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
            return;
        }
        const snapCounts = 5;
        if (this.snapCount < snapCounts) {
            const tableTop = this.srcDataTable.data.sort(this.compare('count'));
            // 获取快照需要的数据格式
            tableTop.map((row1) => {
                if (row1.ip) {
                    this.formatViewData(row1.host).forEach((item: any) => {
                        item.children = this.formatViewData(item.fds);
                    });
                }
            });
            tableTop.map((item) => {
                item.children = this.formatViewData(item.host);
            });
            const nowTime = this.libService.getSnapTime();
            const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
                JSON.parse(this.downloadService.
                    downloadItems.snapShot.snapShotData) || {};
            if (!snapShot[type]) {
                snapShot[type] = {
                    label: this.i18n.protalserver_profiling_tab.socketIo,
                    type,
                    children: [],
                };
            }
            snapShot[type].children.push({
                label: nowTime,
                type,
                value: {
                    file: tableTop,
                    threshold: this.socketIOGroup.controls.socketIO_duration.value,
                    snapCount: this.snapCount + 1,
                    echarts: {
                        echartsLabelTop: this.echartsLabelTop,
                        currentEchartsIPName: this.currentEchartsFileName,
                        data: this.echartsData
                    },
                    stackTranceData: this.stackTranceData
                }
            });
            this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
            this.downloadService.downloadItems.snapShot.data = snapShot;
            this.downloadService.downloadItems.pSocketIO.snapCount = ++this.snapCount;
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.snapshot_success_alert, 'info', 'ioSnapshot');
            } else {
                this.showInfoBox(this.i18n.snapshot_success_alert, 'info');
            }
            this.msgService.sendMessage({
                type: 'getSnapShotCount'
            });
        } else {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.snapshot_analysis_alert,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }
    }
    /**
     * 快照导入数据
     */
    public importSnapData(snapShotData: any) {
        this.tableListData = snapShotData.file;
        this.srcDataTable.data = snapShotData.file;
        this.filePathSelect = snapShotData.echarts.currentEchartsIPName;
        this.echartsData.timeList = snapShotData.echarts.data.timeList;
        this.timeData = this.echartsData.timeList;
        this.currentEchartsFileName = snapShotData.echarts.currentEchartsIPName;
        this.echartsData.readSpeed = snapShotData.echarts.data.readSpeed;
        this.echartsData.writeSpeed = snapShotData.echarts.data.writeSpeed;
        this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
        this.downloadService.downloadItems.pSocketIO.currentEchartsFileName = this.currentEchartsFileName;
        this.downloadService.downloadItems.pSocketIO.echarts.timeList = this.echartsData.timeList;
        this.downloadService.downloadItems.pSocketIO.echarts.readSpeed = this.echartsData.readSpeed;
        this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed = this.echartsData.writeSpeed;
        this.downloadService.downloadItems.pSocketIO.echarts.timeData = this.timeData;

        this.socketIOGroup.controls.socketIO_duration.setValue(snapShotData.threshold);
        this.snapCount = snapShotData.snapCount;
        this.echartsLabelTop = snapShotData.echarts.echartsLabelTop;
        this.hotClassMap = {};
        this.initEchart();
        this.fullStatisticHotClass();
        this.dataTableTime = this.srcDataTable.data;
        this.tableListData.forEach(item => {
            if (item.ip === this.currentEchartsFileName) {
                this.handleRightTable(item, true);
            }
        });
    }

    /**
     * 计算echart最大速率
     */
    public computerMaxYaxisValue(readSpeed: any[], writeSpeed: any[]): number {
        const allData = readSpeed.concat(writeSpeed);
        let echartsLabelTop = Math.ceil(Math.max(...allData));
        if (echartsLabelTop % 2 > 0) {
            echartsLabelTop += 1;
        }
        return echartsLabelTop;
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
     * handleIsOverSize
     * @param data data
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
     * 弹出右下角提示消息
     * @param info info
     * @param type 提示类型
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
     * jumpToSnapShot
     */
    public jumpToSnapShot() {
        const jvmName = (self as any).webviewSession.getItem('currentSelectJvm');
        this.router.navigate([`/profiling/${jvmName}/snapshot`]);
    }
    private buildTimeLine(data: any) {
        const arr = [];
        const interval = this.echartsData.timeList.length < 11 ? 0 :
            Math.floor((this.echartsData.timeList.length / 11));
        for (let i = 0; i < 11; i++) {
            let index = (interval + 1) * i;
            if (index >= data.length) {
                index = data.length - 1;
            }
            arr.push(data[index]);
        }
        this.timeData = arr;
    }
    /**
     * 时间轴变化数据改变
     */
    public timeLineData(data: any) {
        this.echartsOption.dataZoom[0].start = data.start;
        this.echartsOption.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.echartsOption.dataZoom
        });
    }
    /**
     * 设置echarts实例
     */
    public onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 表格筛选
     */
    public onTypeSelect(): void {
        if (!this.columnsTableTime[1].selected.length) {
            this.srcDataTableTime.data = [];
            this.rightTable.total = 0;
            return;
        }
        this.srcDataTableTime.data = this.dataTableTime.filter((rowData: TiTableRowData): any => {
            const index: number = this.columnsTableTime[1].selected.findIndex((item: any) => {
                return item.label === rowData.type;
            });
            if (index >= 0) {
                return rowData;
            }
        });
        this.rightTable.total = this.srcDataTableTime.data.length;
    }
    /**
     * 搜索
     */
    public searchEvent(event: any, type: any): void {
        if (type === 'left') {
            this.leftTable.searchKeys[0] = event.key;
            this.leftTable.searchWords[0] = event.value;
            setTimeout(() => {
                const leftSearchData = this.leftTableComp.getSearchedResult();
                this.leftTable.total = leftSearchData.length;
            }, 10);
        } else {
            this.rightTable.searchKeys[0] = event.key;
            this.rightTable.searchWords[0] = event.value;
            setTimeout(() => {
                const rightSearchData = this.rightTableComp.getSearchedResult();
                this.rightTable.total = rightSearchData.length;
            }, 10);
        }
    }

    /**
     * 全量统计热点类调用次数
     */
    private fullStatisticHotClass(tableListData = this.tableListData) {
        const recursiveStackTrace = (stackTraces: Array<any>) => {
            stackTraces.forEach((item) => {
                (this.hotClassMap as any)[item.label] = ((this.hotClassMap as any)[item.label] || 0) + 1;
                if (item.children) {
                    recursiveStackTrace(item.children);
                }
            });
        };

        tableListData.forEach((host) => {
            Object.keys(host.host).forEach((portKey) => {
                const port = host.host[portKey];
                Object.keys(port.fds).forEach((fdKey) => {
                    const fd = port.fds[fdKey];
                    fd.threads.forEach((thread: { stackTrace: any }) => {
                        recursiveStackTrace(thread.stackTrace.children);
                    });
                });
            });
        });
    }

    /**
     * 增量统计热点类调用次数
     * @param data ws数据
     */
    private statisticHotClass(data: any) {
        data.forEach((item: any) => {
            item.allStackTraces_.forEach((stackTrace: any) => {
                const label = stackTrace.className_ + ' ' + stackTrace.methodName_ + '(' + stackTrace.lineNum_ + ')';
                (this.hotClassMap as any)[label] = ((this.hotClassMap as any)[label] || 0) + 1;
            });
        });
    }

    /**
     * 更新栈跟踪数据
     */
    private updateStackTreeCount(data: Array<any>, parentCount: number = 0) {
        data.forEach((item: any) => {
            item.count = (this.hotClassMap as any)[item.label] || 0;
            item.parentCount = parentCount || item.count;
            if (item.children) {
                this.updateStackTreeCount(item.children, item.count);
            }
        });
    }
    /**
     * 清除定时器
     */
    public clearSocketTimer() {
        clearTimeout(this.socketTimeout);
        this.socketTimeout = null;
    }
}
