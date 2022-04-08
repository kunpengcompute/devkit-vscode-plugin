import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { MytipService } from '../../../service/mytip.service';
import { Utils } from '../../../service/utils.service';
import { Router } from '@angular/router';
import { LibService } from '../../../service/lib.service';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
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
import { COLOR_THEME, VscodeService } from '../../../service/vscode.service';
const conNum = {
    zeroApproximation: 0.001
};
@Component({
    selector: 'app-file-io',
    templateUrl: './file-io.component.html',
    styleUrls: ['./file-io.component.scss']
})
export class FileIoComponent implements OnInit, OnDestroy {
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    @ViewChild('leftTableComp', { static: false }) leftTableComp: TiTableComponent;
    @ViewChild('rightTableComp', { static: false }) rightTableComp: TiTableComponent;
    fileIOWorker: Worker;
    @Input() snapShot: boolean;
    @Input() snapShotData: any;
    @Input() ideType: any;
    constructor(
        private stompService: StompService,
        private router: Router,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        public vscodeService: VscodeService,
        private el: ElementRef,
        public regularVerify: RegularVerify,
        public utils: Utils,
        public mytip: MytipService,
        public fb: FormBuilder,
        public libService: LibService
    ) {
        this.i18n = this.i18nService.I18n();
        this.echartsTitle = this.i18n.io.fileIo.fileIORate;
        this.tipStr = this.i18n.io.fileIoTip;
        this.fileIoBtnTip = this.i18n.io.btn_tip_file;
        // 左侧外部
        this.columnsTable = [
            {
                title: '',
            },
            {
                title: this.i18n.io.fileIo.path,
                width: '28%',
                sortKey: 'path'
            },
            {
                title: this.i18n.io.fileIo.totalTime,
                width: '12%',
                isSort: true,
                sortKey: 'duration'
            },
            {
                title: this.i18n.io.fileIo.count,
                width: '12%',
                isSort: true,
                sortKey: 'count'
            },
            {
                title: this.i18n.io.fileIo.readCount,
                width: '12%',
                isSort: true,
                sortKey: 'rCount'
            },
            {
                title: this.i18n.io.fileIo.writeCount,
                width: '12%',
                isSort: true,
                sortKey: 'wCount'
            },
            {
                title: this.i18n.io.fileIo.readByteCount,
                width: '12%',
                isSort: true,
                sortKey: 'rByte'
            },
            {
                title: this.i18n.io.fileIo.writeByteCount,
                width: '12%',
                isSort: true,
                sortKey: 'wByte'
            }
        ];
        // 左侧内部
        this.intcolumnsTable = [
            {
                title: this.i18n.io.fileIo.path,
                width: '28%',
                sortKey: 'path'
            },
            {
                title: this.i18n.io.fileIo.totalTime,
                width: '12%',
                sortKey: 'duration'
            },
            {
                title: this.i18n.io.fileIo.count,
                width: '12%',
                sortKey: 'count'
            },
            {
                title: this.i18n.io.fileIo.readCount,
                width: '12%',
                sortKey: 'rCount'
            },
            {
                title: this.i18n.io.fileIo.writeCount,
                width: '12%',
                sortKey: 'wCount'
            },
            {
                title: this.i18n.io.fileIo.readByteCount,
                width: '12%',
                sortKey: 'rByte'
            },
            {
                title: this.i18n.io.fileIo.writeByteCount,
                width: '12%',
                sortKey: 'wByte'
            }
        ];
        this.columnsTableTime = [{
            title: this.i18n.io.fileIo.threadName,
            width: '14.5%',
            sortKey: 'threadName'
        },
        {
            title: this.i18n.io.fileIo.operateType,
            width: '14.5%',
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
            width: '18.8%',
            sortKey: 'start'
        },
        {
            title: this.i18n.io.fileIo.rAndWBytes,
            width: '16.9%',
            isSort: true,
            sortKey: 'byte'
        },
        {
            title: this.i18n.io.fileIo.eventRate,
            width: '19.8%',
            isSort: true,
            sortKey: 'rate'
        },
        {
            title: this.i18n.io.fileIo.duration,
            width: '15.5%',
            isSort: true,
            sortKey: 'duration'
        }];
        this.leftTable.searchOptions = [
            {
                label: this.i18n.plugins_perf_java_profiling_fileIO_path,
                value: 'filePath'
            }
        ];
        this.rightTable.searchOptions = [
            {
                label: this.i18n.io.fileIo.threadName,
                value: 'threadName'
            }
        ];

        this.fileIOGroup = fb.group({
            fileIO_duration: new FormControl(1024, {
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
    public fileIOGroup: FormGroup;
    public fileIOBlur: SpinnerBlurInfo;
    private μs = 1000;
    private ms = Math.pow(1000, 2);
    public i18n: any;
    public echartsTitle: string;
    public tableListData: any[] = [];
    public tableListDataCopy: any[] = [];
    // 按钮显示
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
        value: 1024,
        format: 'N0',
        max: 10485760,
    };
    public filePath: any;
    public isDownload = false;
    public firstLevel: any;
    public selected: any;
    public filePathSelect: any;
    public fileFdSelected: any;
    public rightTableSelected: any;
    // 栈
    public stackTranceData: Array<TiTreeNode> = [];
    selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
        this.stackTranceData,
        false,
        false
    );
    public currentStacktrace: any = [];
    public totalCountMonitor: any;
    // echarts
    public chartId = Math.floor(window.crypto.getRandomValues(new Uint8Array(1))[0] * 0.001 * 10000000000);
    public echartsLabelTop: any;
    public echartsLabelBottom: any;
    public echartsOption: any;
    public echartsLegendData: any[] = [];
    public xAxisData: any = [];
    public echartsData = {
        timeList: [] as any[],
        readSpeed: [] as any[],
        writeSpeed: [] as any[]
    };
    public updateOptions: any = {};
    // 最大速率
    public maxYaxisValue = 0;

    public fileIoBtnTip = '';

    // 左侧 表格部分
    public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataTable: TiTableSrcData;
    public columnsTable: Array<TiTableColumns> = [];
    public intcolumnsTable: Array<TiTableColumns> = [];
    public closeOtherDetails = true;
    public noDadaInfo = '';
    public thirdLevel = false;
    public expand = false;
    public selectTableIndex: any[] = [];
    public selectTable: any;
    // 右侧 表格
    public displayedTableTime: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataTableTime: TiTableSrcData;
    private dataTableTime: Array<TiTableRowData> = [];
    public columnsTableTime: Array<TiTableColumns> = [];
    public isDoSnapClick = true; // 防止重复点击
    // echart更新次数
    public upEchartCount = 0;
    private limit = {
        times: 3,
        records: 5000
    };
    private optionsQueue: any[] = [];
    public startBtnDisabled = false;
    private isStopMsgSub: Subscription;
    public isPfileIoSub: Subscription;
    public tip1Context: any;
    public snapCount: number;
    public timeData: any[] = [];
    public echartsInstance: any = {};
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
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    private hotClassMap = {};
    public fileNameMap = {};
    public showLoading = false;
    public isBool = true;
    public clickName = '';
    public ipIndex = 0;
    public fileIoTimeout: any = null;
    public isStart = false;
    /**
     * ngOnInit
     */
    ngOnInit() {
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.fileIo;
        if (this.msgService) {
            this.msgService.clearProFileMessage();
        }
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop'));
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        if (!this.snapShot) {
            this.tableListData = this.downloadService.downloadItems.pFileIO.tableData;
        }

        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }

        this.setSpinnerBlur();

        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.snapCount = this.downloadService.downloadItems.pFileIO.snapCount;
        this.srcDataTable = {
            data: this.tableListData,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
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
            this.isPfileIoSub = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'isFileIo') {
                    this.doSnap('pFileIO');
                }
            });
        }
        if (this.isDownload) {
            this.initXAxisData(this.limit.times * 60);
            this.tableListData = this.downloadService.downloadItems.pFileIO.tableData;
            this.threshold.value = this.downloadService.downloadItems.pFileIO.threshold;
            this.currentEchartsFileName = this.downloadService.downloadItems.pFileIO.currentEchartsFileName;
            this.echartsLabelTop = this.downloadService.downloadItems.pFileIO.echartsLabelTop;
            this.echartsLabelBottom = this.downloadService.downloadItems.pFileIO.echartsLabelBottom;
            this.echartsData.timeList = this.downloadService.downloadItems.pFileIO.echarts.timeList;
            this.echartsData.readSpeed = this.downloadService.downloadItems.pFileIO.echarts.readSpeed;
            this.echartsData.writeSpeed = this.downloadService.downloadItems.pFileIO.echarts.writeSpeed;
            this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
            this.timeData = this.downloadService.downloadItems.pFileIO.echarts.timeData;
            this.fullStatisticHotClass();
        } else {
            // 页面之间切换
            this.isStart = true;
            this.beginFileIo = this.downloadService.dataSave.isFileIOStart;
            if (!this.beginFileIo) {
                this.onStopFileIo();
            }
            // 设置初始化第一列 headfilter 的选中项
            this.columnsTableTime[1].selected = [
                this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
                this.columnsTableTime[1].options[2], this.columnsTableTime[1].options[3]
            ];
            this.tableListDataCopy = this.downloadService.downloadItems.pFileIO.tableData;
            this.fileIOGroup.controls.fileIO_duration.setValue(
                this.downloadService.downloadItems.pFileIO.threshold);
            this.currentEchartsFileName = this.downloadService.downloadItems.pFileIO.currentEchartsFileName;
            this.echartsData.timeList = this.downloadService.downloadItems.pFileIO.echarts.timeList;
            this.echartsData.readSpeed = this.downloadService.downloadItems.pFileIO.echarts.readSpeed;
            this.echartsData.writeSpeed = this.downloadService.downloadItems.pFileIO.echarts.writeSpeed;
            this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
            this.timeData = this.downloadService.downloadItems.pFileIO.echarts.timeData;
            this.fullStatisticHotClass(this.tableListDataCopy);
            this.initXAxisData(this.limit.times * 60, this.echartsData.timeList);
        }
        this.stackTranceData = this.downloadService.downloadItems.pFileIO.stackTranceData;
        this.tableListData.forEach(item => {
            if (item.filePath === this.currentEchartsFileName) {
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
            if (msg.type === 'dataLimit' && msg.data.name === 'file_io') {
                (this.limit as any)[msg.data.type] = msg.data.value;
                this.echartsData.readSpeed = [];
                this.echartsData.writeSpeed = [];
                this.initXAxisData(this.limit.times * 60);
                this.echartsData.timeList = [];
            }
            if (msg.type === 'isStopPro') {
                this.startBtnDisabled = true;
                this.beginFileIo = false;
                this.downloadService.dataSave.isFileIOStart = false;
                this.fileIoTimer();
            }
            if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.fileIo) {
                this.clearData();
                if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.snapCount = 0;
                }
                this.getWorkerData();
            }
        });
        // 判断是否是快照
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
        this.limit.times = this.downloadService.dataLimit.file_io.timeValue;
        this.limit.records = this.downloadService.dataLimit.file_io.dataValue;
        // 表格信息更新
        this.stompService.fileIoSub = this.msgService.getFileMessage().subscribe((msg) => {
            if (msg.type === 'pfileIO') {
                if (msg.data) {
                    this.fileIoTimer();
                }
                if (this.fileIOWorker) {
                    this.fileIOWorker.postMessage({
                        type: 'fileIOWs',
                        data: msg.data
                    });
                    this.addToOptionsQueue(msg.data);
                    this.statisticHotClass(msg.data);
                    this.updateStackTreeCount(this.stackTranceData);
                    if (this.optionsQueue.length > this.limit.records) {
                        const outNumber = this.optionsQueue.length - this.limit.records;
                        this.fileIOWorker.postMessage({
                            type: 'dataLimit',
                            earliestTime: this.optionsQueue[outNumber]
                        });
                    } else {
                        this.fileIOWorker.postMessage({ type: 'dataLimit' });
                    }
                }
            }
        });
        // echarts 更新
        this.stompService.updataFileIOSub = this.msgService.getFileUpdateMessage().subscribe((msg) => {
            if (msg.type === 'updata_fileIO') {
                this.upEchartCount++;
                this.upEchartData(msg.data);
            }
        });
        this.initEchart();
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
        this.fileIOBlur = {
            control: this.fileIOGroup.controls.fileIO_duration,
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
     * 数据清除
     */
    public clearData() {
        if (this.fileIOWorker) { this.fileIOWorker.terminate(); this.fileIOWorker = null; }
        this.srcDataTable.data = [];
        this.srcDataTableTime.data = [];
        this.stackTranceData = [];
        this.echartsData.readSpeed = [];
        this.echartsData.writeSpeed = [];
        this.initXAxisData(this.limit.times * 60);
        this.echartsData.timeList = [];
        this.echartsLabelTop = null;
        this.tableListData = [];
        this.tableListDataCopy = [];
        this.handelClearCache();
        this.dataTableTime = [];
        this.columnsTableTime = [];
        this.fileNameMap = {};
        if (this.echartsInstance) {
            this.echartsInstance.clear();
            this.echartsInstance = null;
        }
    }
    /**
     * 数据排序
     */
    public compare(property: any) {
        return function func(a: any, b: any) {
            const value1 = a[property];
            const value2 = b[property];
            return value2 - value1;
        };
    }
    /**
     * 快照
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
            const tableTop1 = this.srcDataTable.data.sort(this.compare('count'));
            tableTop1.map((item) => {
                item.children = Object.values(item.threads);
            });
            const nowTime = this.libService.getSnapTime();
            const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
                JSON.parse(this.downloadService.
                    downloadItems.snapShot.snapShotData) || {};
            if (!snapShot[type]) {
                snapShot[type] = {
                    label: this.i18n.protalserver_profiling_tab.fileIo,
                    type,
                    children: [],
                };
            }
            snapShot[type].children.push({
                label: nowTime,
                type,
                value: {
                    file: tableTop1,
                    threshold: this.fileIOGroup.controls.fileIO_duration.value,
                    snapCount: this.snapCount + 1,
                    echarts: {
                        currentEchartsFileName: this.currentEchartsFileName,
                        echartsLabelTop: this.echartsLabelTop,
                        data: this.echartsData
                    }
                }
            });
            this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
            this.downloadService.downloadItems.snapShot.data = snapShot;
            this.downloadService.downloadItems.pFileIO.snapCount = ++this.snapCount;
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
     * 导入快照
     * @param snapShotData 数据
     */
    public importSnapData(snapShotData: any) {
        if (!snapShotData) { return; }
        this.tableListData = snapShotData.file;
        this.srcDataTable.data = snapShotData.file;
        this.echartsLabelTop = snapShotData.echarts.echartsLabelTop;
        this.currentEchartsFileName = snapShotData.echarts.currentEchartsFileName;
        this.echartsData.timeList = snapShotData.echarts.data.timeList;
        this.timeData = this.echartsData.timeList;
        this.echartsData.readSpeed = snapShotData.echarts.data.readSpeed;
        this.echartsData.writeSpeed = snapShotData.echarts.data.writeSpeed;
        this.maxYaxisValue = this.computerMaxYaxisValue(this.echartsData.readSpeed, this.echartsData.writeSpeed);
        this.fileIOGroup.controls.fileIO_duration.setValue(snapShotData.threshold);
        this.snapCount = snapShotData.snapCount;
        this.downloadService.downloadItems.pFileIO.currentEchartsFileName = this.currentEchartsFileName;
        this.downloadService.downloadItems.pFileIO.echarts.timeList = this.echartsData.timeList;
        this.downloadService.downloadItems.pFileIO.echarts.readSpeed = this.echartsData.readSpeed;
        this.downloadService.downloadItems.pFileIO.echarts.writeSpeed = this.echartsData.writeSpeed;
        this.downloadService.downloadItems.pFileIO.echarts.timeData = this.timeData;
        this.leftTable.total = this.srcDataTable.data.length;
        this.hotClassMap = {};
        this.fullStatisticHotClass();
        if (this.srcDataTable.data.length !== 0) {
            this.initEchart();
            this.handleRightTable(this.srcDataTable.data[0], true);
        }
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
     * 获取新数据
     */
    public getWorkerData() {
        if (typeof Worker !== 'undefined') {
            const blob = new Blob([document.querySelector('#profile-file-io-worker').textContent]);
            const url = window.URL.createObjectURL(blob);
            this.fileIOWorker = new Worker(url);
            this.fileIOWorker.onmessage = ({ data }) => {
                this.handleAllData(data);
                this.handleTableListOpen();
                this.srcDataTable.data = this.tableListData;
                this.leftTable.total = this.srcDataTable.data.length;
                if (!this.currentEchartsFileName) {
                    this.srcDataTable.data[0].showDetails = true;
                    this.firstLevel = this.srcDataTable.data[0].filePath;
                    this.onClickTableRow(this.srcDataTable.data[0], 0);
                } else {
                    this.addTableBackgroundColor(this.srcDataTable.data[0], 0);
                }
                this.updateDownloadItems();
                // 右侧表格实时刷新
                this.handleRightTable(this.srcDataTable.data[this.ipIndex], false);
            };
        }
    }

    /**
     * 清理缓存
     */
    public handelClearCache() {
        this.downloadService.downloadItems.pFileIO.currentFdTableList = [];
        this.downloadService.downloadItems.pFileIO.tableData = [];
        this.downloadService.downloadItems.pFileIO.threshold =
            this.fileIOGroup.controls.fileIO_duration.value;
        this.downloadService.downloadItems.pFileIO.currentEchartsFileName = '';
        this.downloadService.downloadItems.pFileIO.currentEchartsFdName = '';
        this.downloadService.downloadItems.pFileIO.echartsLabelTop = null;
        this.downloadService.downloadItems.pFileIO.stackTranceData = [];
        this.downloadService.downloadItems.pFileIO.echarts.timeList = [];
        this.downloadService.downloadItems.pFileIO.echarts.readSpeed = [];
        this.downloadService.downloadItems.pFileIO.echarts.writeSpeed = [];
        this.downloadService.downloadItems.pFileIO.fileNameMap = {};
        this.downloadService.downloadItems.pFileIO.spinnerValue = 10;
        this.downloadService.downloadItems.pFileIO.primaryTime = null;
        this.downloadService.downloadItems.pFileIO.dataCount = 0;
    }

    private updateDownloadItems() {
        this.downloadService.downloadItems.pFileIO.tableData = this.tableListData;
        this.downloadService.downloadItems.pFileIO.threshold =
            this.fileIOGroup.controls.fileIO_duration.value;
        this.downloadService.downloadItems.pFileIO.currentEchartsFileName = this.currentEchartsFileName;

        this.downloadService.downloadItems.pFileIO.echartsLabelTop = this.echartsLabelTop;
        this.downloadService.downloadItems.pFileIO.echartsLabelBottom = this.echartsLabelBottom;
        this.downloadService.downloadItems.pFileIO.stackTranceData = this.stackTranceData;
        this.downloadService.downloadItems.pFileIO.echarts.timeList = this.echartsData.timeList;
        this.downloadService.downloadItems.pFileIO.echarts.readSpeed = this.echartsData.readSpeed;
        this.downloadService.downloadItems.pFileIO.echarts.writeSpeed = this.echartsData.writeSpeed;
        this.downloadService.downloadItems.pFileIO.echarts.timeData = this.timeData;
    }

    /**
     * 页面销毁
     */
    ngOnDestroy() {
        if (this.isDownload || this.snapShot) { return; }
        if (this.fileIOWorker) { this.fileIOWorker.terminate(); this.fileIOWorker = null; }
        if (this.fileIOWorker) { this.fileIOWorker.terminate(); this.fileIOWorker = null; }
        if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
        if (this.isPfileIoSub) { this.isPfileIoSub.unsubscribe(); }
        if (this.stompService.fileIoSub) { this.stompService.fileIoSub.unsubscribe(); }
        if (this.stompService.updataFileIOSub) { this.stompService.updataFileIOSub.unsubscribe(); }
        this.downloadService.downloadItems.pFileIO.stackTranceData = this.stackTranceData;
    }

    /**
     * 添加操作开始时间到队列
     *
     * @param options 操作数据
     */
    private addToOptionsQueue(options: any) {
        this.optionsQueue.push(...options.map((item: { start_: any }) => (item.start_)));
    }

    /**
     * 处理worker传来的数据
     * @param data 数据
     */
    private handleAllData(data: any) {
        if (this.tableListDataCopy.length !== 0) {
            this.tableListDataCopy.map((oldItem) => {
                data.filter((newItem: any, index: number) => {
                    if (newItem.filePath === oldItem.filePath) {
                        // 将相同的数据合并到就的数据中
                        oldItem.duration += newItem.duration;
                        oldItem.count += newItem.count;
                        oldItem.rCount += newItem.rCount;
                        oldItem.wCount += newItem.wCount;
                        oldItem.rByte += newItem.rByte;
                        oldItem.wByte += newItem.wByte;
                        // 处理threads的值
                        this.mergeThreadsInfo(newItem.threads, oldItem.threads);
                        data.splice(index, 1);
                    }
                });
            });
            this.tableListData = [...data, ...this.tableListDataCopy].sort((a, b) => {
                return b.count - a.count;
            });
        } else {
            this.tableListData = data;
        }
    }

    /**
     * 合并Threads下的数据
     * @param oldItem 切换页签前的数据
     * @param newItem 切换页签之后的数据
     */
    private mergeThreadsInfo(newThreads: any, oldThreads: any) {
        Object.keys(newThreads).forEach((key) => {
            if (oldThreads[key]) {
                oldThreads[key].duration += newThreads[key].duration;
                oldThreads[key].count += newThreads[key].count;
                oldThreads[key].readByte += newThreads[key].readByte;
                oldThreads[key].readCount += newThreads[key].readCount;
                oldThreads[key].writeByte += newThreads[key].writeByte;
                oldThreads[key].writeCount += newThreads[key].writeCount;
            } else {
                oldThreads[key] = newThreads[key];
            }
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
        this.leftTable.searchWords[0] = '';
        this.rightTable.searchWords[0] = '';
        // 设置初始化第一列 headfilter 的选中项
        this.columnsTableTime[1].selected = [
            this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1],
            this.columnsTableTime[1].options[2], this.columnsTableTime[1].options[3]
        ];
        this.getWorkerData();
        if (this.startBtnDisabled) { return; }

        if (!this.fileIOGroup.controls.fileIO_duration.value) {
            const invalidEl =
                this.el.nativeElement.querySelector(`.fileIO-threshold.ng-invalid.ng-touched:not([tiFocused])`);
            if (invalidEl) {
                const inputEl = $(invalidEl).find('.ti3-spinner-input-box>.ti3-spinner-input')[0];
                inputEl.focus();
            }
            return;
        }

        this.isStopFlag = true;
        this.srcDataTableTime.data = [];
        this.srcDataTable.data = [];
        this.tableListData = [];
        this.tableListDataCopy = [];
        this.initXAxisData(this.limit.times * 60);
        this.echartsData.writeSpeed = [];
        this.echartsData.readSpeed = [];
        this.echartsLabelTop = null;
        this.stackTranceData = [];
        this.updateDataEchart();
        this.msgService.isClearProfile = false;
        this.msgService.clearProFileMessage();
        this.stompService.startStompRequest('/cmd/start-instrument-file', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.fileIOGroup.controls.fileIO_duration.value
        });
        this.downloadService.downloadItems.pFileIO.tableData = [];
        this.downloadService.dataSave.pfileIOThreshold =
            this.fileIOGroup.controls.fileIO_duration.value;
        this.downloadService.dataSave.isSocketIOStart = false;
        this.downloadService.dataSave.isFileIOStart = true;
        this.fileIoTimeout = setTimeout(() => {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.profileNodataTip.fileIo,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }, 30000);
        if (this.stompService.fileIOTimer) {
            clearInterval(this.stompService.fileIOTimer);
            this.stompService.fileIOTimer = null;
        }
        this.stompService.fileIOTimer = setInterval(() => {
            this.stompService.fileIOUpdata();
        }, this.stompService.fileIoStep);
    }
    /**
     * 停止分析
     */
    public onStopFileIo() {
        this.stompService.startStompRequest('/cmd/stop-instrument-file', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.fileIOGroup.controls.fileIO_duration.value
        });
        this.downloadService.dataSave.pfileIOThreshold =
            this.fileIOGroup.controls.fileIO_duration.value;
        this.downloadService.dataSave.isFileIOStart = false;
        this.fileIoTimer();
        if (!this.isStopFlag) {
            this.isStopFlag = true;
            return;
        }
        clearInterval(this.stompService.fileIOTimer);
        this.stompService.fileIOTimer = null;
        this.fileIOWorker = null;
        this.msgService.isClearProfile = true;
        this.msgService.clearProFileMessage();
    }

    /**
     * 初始化ecahrts的option
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
                trigger: 'axis',
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                borderRadius: 5,
                borderWidth: 0,
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
    /**
     * 展开整个树
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
     * 更新echart图表信息
     */
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
        this.updateXAxisData();
        this.echartsData.timeList.push(this.handleTimeFormat(data.endTime));
        this.echartsData.readSpeed.push(readSpeed);
        this.echartsData.writeSpeed.push(writeSpeed);
        this.updateDataEchart();
        setTimeout(() => {
            this.buildTimeLine(this.echartsData.timeList);
        }, 0);
        const max1 = this.echartsData.readSpeed;
        const max2 = max1.concat(this.echartsData.writeSpeed);
        this.echartsLabelTop = this.libService.onChangeUnit(Number((Math.max(...max2) * 1024).toFixed(2)));
        this.echartsLabelBottom = 0;
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
     * @param fileDatas row.threads信息
     */
    public formatViewData(fileDatas: any) {
        return Object.values(fileDatas);
    }
    private addTableBackgroundColor(row: any, arg: any) {
        this.filePathSelect = '';
        if ('fd' in row) {
            this.filePathSelect = row.fd;
        } else if ('filePath' in row) {
            this.filePathSelect = row.filePath;
        }
        if (row && arg.length === 1) {
            // 点击主表格
            this.currentEchartsFileName = row.filePath;
            if (this.stompService.pFileIOpath !== row.filePath) {
                this.stompService.pFileIOpath = row.filePath;
            }
            if (this.filePathSelect !== arg[0] && this.tableListData[this.filePathSelect]) {
                this.tableListData[this.filePathSelect].isSelect = false;
                if (this.tableListData[this.filePathSelect].threads[this.fileFdSelected]) {
                    this.tableListData[this.filePathSelect].threads[this.fileFdSelected].isSelect = false;
                }
            }
            this.tableListData[arg[0]].isSelect = true;
        } else if (row && arg.length === 2) {
            if (this.fileFdSelected && this.fileFdSelected !== row.fd) {
                if (this.tableListData[arg[0]].threads[this.fileFdSelected]) {
                    this.tableListData[arg[0]].threads[this.fileFdSelected].isSelect = false;
                }
            }
            this.tableListData[arg[0]].threads[row.fd].isSelect = true;
            this.fileFdSelected = row.fd;
            this.currentEchartsFileName = this.currentEchartsFileName.split(' ')[0] + ' [ ' + row.fd + ' ]';
        }
    }

    /**
     * 是否激活状态
     */
    public isSubActive(fd: any): boolean {
        const echartsNameArr = this.currentEchartsFileName.split(' ');
        if (echartsNameArr.length < 3) {
            return false;
        }
        return echartsNameArr[2] === fd;
    }

    /**
     * 点击左侧表格某行
     * @param row row
     * @param arg arg
     */
    public onClickTableRow(row: any, ...arg: any) {
        this.ipIndex = arg[0];
        const isClick = arg.length === 1 ? (this.clickName !== row.filePath) : (this.clickName !== row.fd);
        // 判断点击后是否需要更换数据
        if (this.isBool || isClick) {
            this.isBool = false;
            this.clickName = arg.length === 1 ? row.filePath : row.fd;
            this.filePath = this.stompService.pFileIOpath;
            // 点击变色
            this.addTableBackgroundColor(row, arg);
            if (row) {
                this.handleRightTable(row, true);
            }
            this.handleIsNowData(row);
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
            if (row.filePath === this.downloadService.downloadItems.pFileIO.currentEchartsFileName &&
                !this.beginFileIo) {
                this.setEchart();
                return;
            }
        }
        if (row.filePath === this.downloadService.downloadItems.pFileIO.currentEchartsFileName && !this.beginFileIo) {
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
        this.currentEchartsFileName = this.downloadService.downloadItems.pFileIO.currentEchartsFileName;
        this.echartsData.timeList = this.downloadService.downloadItems.pFileIO.echarts.timeList;
        this.echartsData.readSpeed = this.downloadService.downloadItems.pFileIO.echarts.readSpeed;
        this.echartsData.writeSpeed = this.downloadService.downloadItems.pFileIO.echarts.writeSpeed;
        this.timeData = this.downloadService.downloadItems.pFileIO.echarts.timeData;
        this.fullStatisticHotClass(this.tableListDataCopy);
        this.initXAxisData(this.limit.times * 60, this.echartsData.timeList);
    }
    /**
     * 生成右边表格信息
     * @param row row
     * @param isExpand 判断是否收起栈跟踪数据
     */
    public handleRightTable(row: any, isExpand: boolean) {
        let data = [];
        const list: any[] = [];
        if (row.threads) {
            data = Object.values(row.threads);
        } else {
            data.push(row);
        }
        data.forEach((item) => {
            item.options.forEach((thread: any) => {
                thread.isSelect = false;
                list.push(thread);
            });
        });
        this.dataTableTime = list;
        this.srcDataTableTime.data = this.dataTableTime;
        this.rightTable.total = this.srcDataTableTime.data.length;
        this.onTypeSelect();
        if (isExpand) {
            const firstThread = this.dataTableTime[0];
            this.onClickRightTable(firstThread, 0);
        }
    }
    /**
     * 右边表格点击事件
     * @param row row
     * @param index index
     */
    public onClickRightTable(row: any, index: number) {
        if (!row.stackTrace) {
            return;
        }
        if (this.rightTableSelected > -1 && this.rightTableSelected !== index) {
            this.dataTableTime[this.rightTableSelected].isSelect = false;
        }
        this.rightTableSelected = index;
        this.dataTableTime[index].isSelect = true;
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
     * onChangeTime
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
            date.getHours()}:${date.getMinutes() < 10 ?
                '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ?
                    '0' + date.getSeconds() : date.getSeconds()}`;
    }
    /**
     * beforeToggle
     * @param row row
     */
    public beforeToggle(row: TiTableRowData): void {
        if (this.firstLevel !== row.filePath) {
            this.firstLevel = row.filePath;
        } else {
            this.firstLevel = null;
        }
        row.showDetails = !row.showDetails;
    }
    /**
     * handleTableListOpen
     */
    public handleTableListOpen() {
        if (!this.firstLevel) {
            return;
        }
        this.tableListData.forEach((item) => {
            item.showDetails = item.filePath === this.firstLevel;
        });
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
        this.echartsInstance.on('datazoom', (params: { batch: any[] }) => {  // 放大缩小时调用接口
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
                this.leftTable.total = this.leftTableComp.getSearchedResult().length;
            }, 10);
        } else {
            this.rightTable.searchKeys[0] = event.key;
            this.rightTable.searchWords[0] = event.value;

            setTimeout(() => {
                this.rightTable.total = this.rightTableComp.getSearchedResult().length;
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

        tableListData.forEach((file) => {
            Object.keys(file.threads).forEach((fdKey) => {
                const fd = file.threads[fdKey];
                fd.options.forEach((option: { stackTrace: any }) => {
                    recursiveStackTrace(option.stackTrace.children);
                });
            });
        });
    }

    /**
     * 增量统计热点类调用次数
     * @param data ws数据
     */
    private statisticHotClass(data: any) {
        data.forEach((item: { allStackTraces_: any[] }) => {
            item.allStackTraces_.forEach((stackTrace) => {
                const label = stackTrace.className_ + ' ' + stackTrace.methodName_ + '(' + stackTrace.lineNum_ + ')';
                (this.hotClassMap as any)[label] = ((this.hotClassMap as any)[label] || 0) + 1;
            });
        });
    }

    /**
     * 更新栈跟踪数据
     */
    private updateStackTreeCount(data: Array<any>, parentCount: number = 0) {
        data.forEach((item) => {
            item.count = (this.hotClassMap as any)[item.label] || 0;
            item.parentCount = parentCount || item.count;
            if (item.children) {
                this.updateStackTreeCount(item.children, item.count);
            } else {
                delete item.children;
            }
        });
    }
    /**
     * 清除定时器
     */
    public fileIoTimer() {
        clearTimeout(this.fileIoTimeout);
        this.fileIoTimeout = null;
    }

}
