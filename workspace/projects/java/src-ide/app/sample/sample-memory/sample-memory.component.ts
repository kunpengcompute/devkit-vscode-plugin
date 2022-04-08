import { LibService } from './../../service/lib.service';
import { Component, OnInit, ElementRef, OnDestroy, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData
} from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { Utils } from '../../service/utils.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import * as echarts from 'echarts/core';

/**
 * series顺序
 */
const enum SERIES_INDEX {
    ZERO = 0,
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
    FOURTH = 4,
}
@Component({
    selector: 'app-sample-memory',
    templateUrl: './sample-memory.component.html',
    styleUrls: ['./sample-memory.component.scss']
})
export class SampleMemoryComponent implements OnInit, OnDestroy {
    @ViewChild('timeLine', { static: false }) timeLine: any;
    @ViewChild('suggestion', { static: false }) suggestion: any;
    constructor(
        private stompService: StompService,
        public i18nService: I18nService,
        private el: ElementRef,
        private downloadService: SamplieDownloadService,
        private msgService: MessageService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private libService: LibService,
        public utils: Utils,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.leftTable.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_memory_gc_activity.cause,
                value: 'cause'
            }
        ];
        this.rightTable.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_memory_pause.pause_phase,
                value: 'gcId'
            },
            {
                label: this.i18n.protalserver_sampling_memory_pause.name,
                value: 'name'
            }
        ];
    }
    public ideType: any;
    public currentLang: string;
    public activeData: any;
    public showEcharts = false;
    public noDataFlag = false;
    public recordId = '';
    public stompClient: any;
    i18n: any;
    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme: any;

    public baseConfig = [
        {
            label: 'young',
            keywords: 'youngCollector',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'old',
            keywords: 'oldCollector',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'concurrent_thread',
            keywords: 'concurrentGCThreads',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'parallel_thread',
            keywords: 'parallelGCThreads',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'concurrent_display',
            keywords: 'explicitGCConcurrent',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'display_disabled',
            keywords: 'explicitGCDisabled',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'use_thread',
            keywords: 'usesDynamicGCThreads',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'time_ratio',
            keywords: 'gcTimeRatio',
            value: '',
            msg: true,
            msgValue: ''
        }
    ];
    public heapConfig = [
        {
            label: 'initial',
            keywords: 'initialSize',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'min_size',
            keywords: 'minSize',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'max_size',
            keywords: 'maxSize',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'isuse',
            keywords: 'usesCompressedOops',
            value: '',
            msg: true,
            msgValue: ''
        },
        {
            label: 'compressed',
            keywords: 'compressedOopsMode',
            value: '',
            msg: true,
            msgValue: ''
        },
        {
            label: 'address_size',
            keywords: 'heapAddressBits',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'objects_alignment',
            keywords: 'objectAlignment',
            value: '',
            msg: true,
            msgValue: ''
        }
    ];
    public youngGenConfig = [
        {
            label: 'min_size',
            keywords: 'minSize',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'max_size',
            keywords: 'maxSize',
            value: '',
            msg: false,
            msgValue: ''
        },
        {
            label: 'new_ratio',
            keywords: 'newRatio',
            value: '',
            msg: false,
            msgValue: ''
        }
    ];
    public survivorConfig = [
        {
            label: 'initial_lifttime',
            keywords: 'initialTenuringThreshold',
            value: '',
            msg: true,
            msgValue: ''
        },
        {
            label: 'max_lifttime',
            keywords: 'maxTenuringThreshold',
            value: '',
            msg: true,
            msgValue: ''
        }
    ];
    public tlabConfig = [
        {
            label: 'used',
            keywords: 'usesTLABs',
            value: '',
            msg: true,
            msgValue: ''
        },
        {
            label: 'min_tlab_size',
            keywords: 'minTLABSize',
            value: '',
            msg: true,
            msgValue: ''
        },
        {
            label: 'waste_limit',
            keywords: 'tlabRefillWasteLimit',
            value: '',
            msg: true,
            msgValue: ''
        }
    ];
    public middleTable: any[] = [];

    // 表格部分
    public displayedActivity: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataActivity: TiTableSrcData;
    public columnsActivity: Array<TiTableColumns> = [];

    public displayedPhase: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataPhase: TiTableSrcData;
    public columnsPhase: Array<TiTableColumns> = [];
    public noDadaInfo = '';

    // echarts部分
    public overViewOption: any = {};
    public echartsInstance: any;
    public baseTop = 30;
    public gridHeight = 100;
    public uuid: any;
    public baseColor = '#e6ebf5';
    public ylabelColor = '#999';

    public getDataTimer: any = null;
    public dataLens = 0;
    public gcDatas: Array<any> = [];

    private gcStatisticAll: any[] = [];

    private wsFinishSub: Subscription;
    private importDataType = ['GC_STATISTIC', 'HEAP_STATISTICS', 'GC_CONFIGURATION', 'METASPACE_STATISTICS'];
    private GCEchartsCache: any[] = [];
    public timeData: any[] = [];
    private handleDataList = {
        GC_CONFIGURATION: (type: any) => {
            this.configsInit(type);
        },
        GC_STATISTIC: (type: any) => {
            this.gcActivityInit(type);
        },
        HEAP_STATISTICS: () => {
            this.initChart();
        },
        METASPACE_STATISTICS: () => {
            this.initChart();
        }
    };
    public finishGC = false;
    public storeTime: any[] = [];
    public unfold = true;
    public unfoldTable = true;
    public leftTable: any = {
        pageNo: 0,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
        searchOptions: [],
        searchWords: [],
        searchKeys: []
    };
    public rightTable: any = {
        searchOptions: [],
        searchWords: [],
        searchKeys: []
    };
    private gcEchartsMetaSpace: any[] = [];
    public showLoading = false;
    public suggestArr: any[] = [];
    public wsFinishSug: Subscription;

    public rightCurrentPage = 10;
    public rightTotalNumber = 0;
    public rightPageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };

    /**
     * 初始化
     */
    ngOnInit() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.ideType = 'intellij';
        } else {
            this.ideType = 'other';
        }
        this.baseConfig.forEach(item => {
            if (item.label === 'time_ratio') {
                item.msgValue = this.i18n.protalserver_sampling_memory_gc.time_ratio_msgValue;
            }
        });
        this.heapConfig.forEach(item => {
            if (item.label === 'isuse') {
                item.msgValue = this.i18n.protalserver_sampling_memory_heap.isuse_msgValue;
            }
            if (item.label === 'compressed') {
                item.msgValue = this.i18n.protalserver_sampling_memory_heap.compressed_msgValue;
            }
            if (item.label === 'objects_alignment') {
                item.msgValue = this.i18n.protalserver_sampling_memory_heap.objects_alignment_msgValue;
            }
        });
        this.survivorConfig[0].msgValue = this.i18n.protalserver_sampling_memory_generation.initial_lifttime_msgValue;
        this.survivorConfig[1].msgValue = this.i18n.protalserver_sampling_memory_generation.max_lifttime_msgValue;
        this.tlabConfig[0].msgValue = this.i18n.protalserver_sampling_memory_generation.used_msgValue;
        this.tlabConfig[1].msgValue = this.i18n.protalserver_sampling_memory_generation.min_tlab_size_msgValue;
        this.tlabConfig[2].msgValue = this.i18n.protalserver_sampling_memory_generation.waste_limit_msgValue;
        // 获取VSCode当前主题颜色
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.currentLang = (self as any).webviewSession.getItem('language');
        this.recordId = this.getRecordId();
        this.uuid = Utils.generateConversationId(12);
        this.srcDataActivity = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.srcDataPhase = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.columnsActivity = [
            {
                title: 'activity',
                width: '15%',
                isSort: true,
                sortKey: 'activity',
            },
            {
                title: 'cause',
                width: '30%'
            },
            {
                title: 'collector_name',
                width: '10%'
            },
            {
                title: 'before_memory',
                width: '15%',
                isSort: true,
                sortKey: 'before_memory'
            },
            {
                title: 'after_memory',
                width: '15%',
                isSort: true,
                sortKey: 'after_memory'
            },
            {
                title: 'longest_pause',
                width: '15%',
                isSort: true,
                sortKey: 'longest_pause'
            }
        ];
        this.columnsPhase = [
            {
                title: 'pause_phase',
                width: '30%'
            },
            {
                title: 'name',
                width: '30%'
            },
            {
                title: 'duration',
                width: '20%',
                isSort: true,
                sortKey: 'duration'
            },
            {
                title: 'start',
                width: '20%',
                isSort: true,
                sortKey: 'startTime'
            }
        ];
        if (this.currentLang === 'en-us') {
            this.middleTable = ['Heaps', 'GC Activities'];
        } else {
            this.middleTable = ['堆', 'GC活动'];
        }
        this.importCache();
        if (!this.finishGC) {
            this.getSamplingData('gc', this.recordId);
            this.showLoading = true;
        } else {
            this.getphase(this.srcDataActivity.data[0], 0);
            this.showEcharts = this.activeData.heapUsed.length > 0;
            this.noDataFlag = this.activeData.heapUsed.length === 0;
            this.overViewOption = this.setOptions();
            return;
        }
        this.wsFinishSub = this.msgService.getSampleGCMessage().subscribe((msg) => {
            if (msg.type === 'GC' && msg.content === 'FINISH_FLAG') {
                this.finishGC = true;
                this.showLoading = false;
                this.initChart();
            }
            if (this.importDataType.indexOf(msg.type) > -1) {
                switch (msg.type) {
                    case 'HEAP_STATISTICS':
                        this.GCEchartsCache.push(...msg.content);
                        break;
                    case 'METASPACE_STATISTICS':
                        this.gcEchartsMetaSpace.push(...msg.content);
                        break;
                    default:
                        (this.handleDataList as any)[msg.type](msg);
                        break;
                }
            }
        });
        this.wsFinishSug = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'GC') {
                this.suggestArr = this.downloadService.downloadItems.gc.suggestArr;
            }
        });
        if (this.suggestArr.length === 0) {
            this.suggestArr = this.downloadService.downloadItems.gc.suggestArr;
        }
        this.updateWebViewPage();
    }
    /**
     * 切换页签
     */
    ngOnDestroy(): void {
        this.downloadService.downloadItems.gc.isFinish = this.finishGC;
        this.downloadService.downloadItems.gc.baseConfig = this.baseConfig;
        this.downloadService.downloadItems.gc.heapConfig = this.heapConfig;
        this.downloadService.downloadItems.gc.youngGenConfig = this.youngGenConfig;
        this.downloadService.downloadItems.gc.survivorConfig = this.survivorConfig;
        this.downloadService.downloadItems.gc.tlabConfig = this.tlabConfig;
        this.downloadService.downloadItems.gc.activity = this.srcDataActivity.data;
        this.downloadService.downloadItems.gc.activeData = this.activeData;
        this.downloadService.downloadItems.gc.timeData = this.timeData;
        this.downloadService.downloadItems.gc.suggestArr = this.suggestArr;
        if (this.wsFinishSub) {
            this.wsFinishSub.unsubscribe();
        }
        if (this.wsFinishSug) {
            this.wsFinishSug.unsubscribe();
        }
    }
    /**
     * 初始化echarts
     */
    public initChart() {
        this.showLoading = false;
        const echartData = this.sortEchartsData(this.GCEchartsCache); // 将数据排序 asc
        const axiosData: any = {
            committedSize: [],
            heapUsed: [],
            pause: [],
            usedMetaSpace: [],
            commitedMetaSpace: [],
        };
        if (this.gcEchartsMetaSpace.length) {
            this.gcEchartsMetaSpace.forEach((item, index) => {
                const time = this.dateFormat(item.data[2], 'yyyy-MM-dd hh:mm:ss.S');
                axiosData.usedMetaSpace.push({
                    value: [time, item.data[1], item.data[2]]
                });
                axiosData.commitedMetaSpace.push({
                    value: [time, item.data[0], item.data[2]]
                });
            });
        }
        echartData.forEach((item, index) => {
            if (item.when === 'After GC') {
                const diffTime =
                    new Date(item.startTime).getTime() -
                    new Date(echartData[index - 1].startTime).getTime();
                const middleTime = this.dateFormat(
                    diffTime / 2 + new Date(echartData[index - 1].startTime).getTime(),
                    'yyyy-MM-dd hh:mm:ss.S'
                );
                const time = this.dateFormat(item.startTime, 'yyyy-MM-dd hh:mm:ss.S');
                const time2 = item.startTime;
                const middleCommiteedSize =
                    (item.committedSize - echartData[index - 1].committedSize) / 2 +
                    echartData[index - 1].committedSize;
                const middleHeapUsed =
                    (item.heapUsed - echartData[index - 1].heapUsed) / 2 +
                    echartData[index - 1].heapUsed;
                const middlePauseData =
                    new Date(item.startTime).getTime() -
                    new Date(echartData[index - 1].startTime).getTime();
                axiosData.committedSize.push(
                    {
                        value: [
                            middleTime,
                            middleCommiteedSize,
                            item.startTime,
                            item.when
                        ]
                    },
                    {
                        value: [time, item.committedSize, item.startTime, item.when]
                    }
                );
                axiosData.heapUsed.push(
                    {
                        value: [middleTime, middleHeapUsed, item.startTime, item.when]
                    },
                    {
                        value: [time, item.heapUsed, item.startTime, item.when]
                    }
                );
                axiosData.pause.push(
                    {
                        value: [middleTime, middlePauseData, item.startTime, item.when]
                    },
                    {
                        value: [time, 0, item.startTime, item.when]
                    }
                );
                this.storeTime.push(time2);
            } else {
                const time = this.dateFormat(item.startTime, 'yyyy-MM-dd hh:mm:ss.S');
                const time2 = item.startTime;
                axiosData.committedSize.push({
                    value: [time, item.committedSize, item.startTime, item.when]
                });
                axiosData.heapUsed.push({
                    value: [time, item.heapUsed, item.startTime, item.when]
                });
                axiosData.pause.push({
                    value: [time, 0, item.startTime, item.when]
                });
                this.storeTime.push(time2);
            }
        });
        this.showEcharts = axiosData.heapUsed.length > 0;
        this.noDataFlag = axiosData.heapUsed.length === 0;
        this.activeData = axiosData;
        const firtchild = new Date(this.storeTime[0]).getTime();
        const lastcghild = new Date(this.storeTime[this.storeTime.length - 1]).getTime();
        const gap = (lastcghild - firtchild) / 10;
        for (let i = 0; i < 11; i++) {
            this.timeData.push((this.dateFormat(firtchild + gap * i, 'yyyy-MM-dd hh:mm:ss.S')).substring(10, 19));
        }
        this.overViewOption = this.setOptions();
        this.updateWebViewPage();
    }

    /**
     * onChartInit
     * @param ec ec
     */
    onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.timeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }
    /**
     * chartClick
     * @param ec ec
     */
    chartClick(ec: any) {
        const when = ec.value[3];
        const startTime = ec.value[2];
        const key = when === 'Before GC' ? 'beforeGC' : 'afterGC';
        const currentGC = this.gcStatisticAll.find((item) => {
            return item[key].startTime === startTime;
        });
        let currentGCId = '';
        if (currentGC && currentGC[key].gcId) {
            currentGCId = currentGC[key].gcId;
            const acIndex = this.srcDataActivity.data.findIndex((active) => {
                return active.activity === currentGCId;
            });
            if (acIndex >= 0) {
                this.getphase(this.srcDataActivity.data[acIndex], acIndex);
                const that = this;
                setTimeout(() => {
                    const elTr = that.el.nativeElement.querySelector(`#gc_activity_body tr:nth-child(${acIndex + 1})`);
                    elTr.scrollIntoView();
                });
            }
        }
    }
    private setOptions() {
        const titleFontWeight = 400;
        let option = {};
        const textColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#E8E8E8';
        const bgColor = this.currTheme === COLOR_THEME.Light ? '#ffffff' : '#424242';
        const timeColor = this.currTheme === COLOR_THEME.Light ? '#616161' : '#aaaaaa';
        const axisLabelColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#aaa';
        option = {
            title: [
                {
                    text: this.i18n.plugins_perf_java_sampling_gcPauseTime,
                    textStyle: { color: textColor, fontSize: 16 , fontWeight: titleFontWeight},
                    top: this.baseTop
                },
                {
                    text: this.i18n.protalserver_profiling_overview.heap,
                    textStyle: { color: textColor, fontSize: 16 , fontWeight: titleFontWeight},
                    top: this.baseTop + this.gridHeight * 2
                },
                {
                    text: this.i18n.plugins_perf_java_sampling_gcChart.meta_space,
                    textStyle: { color: textColor, fontSize: 16 , fontWeight: titleFontWeight},
                    top: this.baseTop + this.gridHeight * 4
                }],
            legend: [
                {
                    data: [this.i18n.plugins_perf_java_sampling_gcPauseTime],
                    type: 'scroll',
                    icon: 'rect',
                    top: '8%',
                    algin: 'left',
                    right: 50,
                    width: '35%',
                    itemWidth: 8,
                    itemHeight: 8,
                    show: true,
                    textStyle: {
                        color: axisLabelColor
                    }
                },
                {
                    data: [
                        this.i18n.plugins_perf_java_sampling_gcChart.free_heap_size,
                        this.i18n.plugins_perf_java_sampling_gcChart.used_heap_size,
                    ],
                    type: 'scroll',
                    icon: 'rect',
                    top: this.baseTop + this.gridHeight * 2,
                    algin: 'left',
                    right: 50,
                    width: '35%',
                    itemWidth: 8,
                    itemHeight: 8,
                    show: true,
                    textStyle: {
                        color: axisLabelColor
                    }
                }, {
                    data: [
                        this.i18n.plugins_perf_java_sampling_gcChart.used_meta_space,
                        this.i18n.plugins_perf_java_sampling_gcChart.commited_meta_space,
                    ],
                    type: 'scroll',
                    icon: 'rect',
                    top: this.baseTop + this.gridHeight * 4,
                    algin: 'left',
                    right: 50,
                    width: '35%',
                    itemWidth: 8,
                    itemHeight: 8,
                    show: true,
                    textStyle: {
                        color: axisLabelColor
                    },

                }
            ],
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                borderColor: 'rgba(50,50,50,0)',
                padding: [12, 16, 12, 16],
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#478cf1',
                        width: 1.5
                    }
                },
                backgroundColor: bgColor,
                borderRadius: 5,
                boxShadow: 'rgba(0, 0, 0, 0.5)',
                textStyle: {
                    color: '#aaaaaa',
                    fontSize: 12
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                formatter: (params: any): any => {
                    if (params.length > 0) {
                        let html = ``;
                        const time = `<div style='color:${timeColor}'>${params[0].axisValueLabel}</div>`;
                        if (params[0].seriesIndex === SERIES_INDEX.FIRST ||
                           params[0].seriesIndex === SERIES_INDEX.SECOND) {
                            if (params[1] && params[1].seriesIndex === SERIES_INDEX.SECOND) {
                                html = `<div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:${params[0].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>${params[0].seriesName}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[0].data.value[1] -
                                       params[1].data.value[1])}</span></div>
                                    <div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:${params[1].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>${params[1].seriesName}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[1].data.value[1])}</span></div>
                                    <div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:linear-gradient(to right, ${params[0].color} ,
                                       ${params[1].color})'></span>
                                    <span style='margin-right:10px;display:inline-block'>
                                    ${this.i18n.plugins_perf_java_sampling_gcChart.committed_heap_size}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[0].data.value[1])}</span></div>`;
                            } else {
                                html = `<div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:${params[0].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>${params[0].seriesName}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[0].data.value[1])}</span></div>`;
                            }

                        } else if (params[0].seriesIndex === SERIES_INDEX.THIRD ||
                           params[0].seriesIndex === SERIES_INDEX.FOURTH) {
                            if (params[1] && params[1].seriesIndex === SERIES_INDEX.FOURTH) {
                                html = `<div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:${params[0].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>
                                    ${params[0].seriesName}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[0].data.value[1])}</span></div>
                                    <div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:${params[1].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>
                                    ${params[1].seriesName}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[1].data.value[1])}</span>
                                    </div>`;
                            } else {
                                html = `<div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;display:inline-block;
                                    background:${params[0].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>
                                    ${params[0].seriesName}</span>
                                    <span style='float:right;'>
                                    ${this.libService.onChangeUnit(params[0].data.value[1])}</span></div>`;
                            }
                        } else {
                            html = `<div style='margin-top:10px;color:${textColor}'>
                                    <span style='width:8px;height:8px;
                                    display:inline-block;background:${params[0].color}'></span>
                                    <span style='margin-right:10px;display:inline-block'>${params[0].seriesName}</span>
                                    <span style='float:right;'>${(params[0].value[1])}ms </span></div>`;
                        }

                        return time + html;
                    }
                }
            },
            axisPointer: {
                link: [{ xAxisIndex: 'all' }],
                snap: true
            },
            grid: [
                this.makeGrid(this.baseTop, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 2, {
                    show: false,
                    height: this.gridHeight,
                    z: 10
                }),
                this.makeGrid(this.baseTop + this.gridHeight * 4, {
                    show: false,
                    height: this.gridHeight,
                    z: 10
                }),
            ],
            xAxis: [
                this.makeXAxis(0, {
                    axisLabel: {
                        show: true,
                        color: axisLabelColor
                    }
                }),
                this.makeXAxis(1, {
                    axisLabel: {
                        show: true,
                        color: axisLabelColor,
                        interval: 0
                    }
                }),
                this.makeXAxis(2, {
                    axisLabel: {
                        show: true,
                        color: axisLabelColor
                    }
                }),
            ],
            yAxis: [
                this.makeYAxis(0, {}),
                this.makeYAxis(1, {
                    axisLabel: {
                        show: true,
                        color: axisLabelColor,
                        formatter(item: any) {
                            return Math.ceil(item / 1024 / 1024);
                        }
                    }
                }),
                this.makeYAxis(2, {
                    axisLabel: {
                        show: true,
                        color: axisLabelColor,
                        formatter(item: any) {
                            return Math.ceil(item / 1024 / 1024);
                        }
                    }
                }),
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1, 2],
                }
            ],
            series: [
                {
                    name: this.i18n.plugins_perf_java_sampling_gcPauseTime,
                    type: 'line',
                    symbol: 'circle',
                    step: 'start',
                    symbolSize: 2,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    itemStyle: {
                        normal: {
                            color: '#3d7ff3'
                        }
                    },
                    areaStyle: {
                        color: '#3d7ff3',
                        opacity: 0.2,
                    },
                    data: this.activeData.pause,
                },
                {
                    name: this.i18n.plugins_perf_java_sampling_gcChart.free_heap_size,
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    lineStyle: { color: '#276260' },
                    areaStyle: { color: '#276260', opacity: 1 },
                    itemStyle: {
                        normal: {
                            color: '#276260'
                        }
                    },
                    data: this.activeData.committedSize
                },
                {
                    name: this.i18n.plugins_perf_java_sampling_gcChart.used_heap_size,
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    lineStyle: { color: '#234645' },
                    areaStyle: { color: '#234645', opacity: 1 },
                    itemStyle: {
                        normal: {
                            color: '#234645'
                        }
                    },
                    data: this.activeData.heapUsed
                },
                {
                    name: this.i18n.plugins_perf_java_sampling_gcChart.used_meta_space,
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    lineStyle: { color: '#3D7FF3' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(61,127,243,0.3)',
                        }, {
                            offset: 1,
                            color: 'rgba(61,127,243,0.04)'
                        }])
                    },
                    itemStyle: {
                        normal: {
                            color: '#3D7FF3'
                        }
                    },
                    data: this.activeData.usedMetaSpace
                },
                {
                    name: this.i18n.plugins_perf_java_sampling_gcChart.commited_meta_space,
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    lineStyle: { color: '#298A5F' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(41,138,95,0.3)',
                        }, {
                            offset: 1,
                            color: 'rgba(41,138,95,0.04)'
                        }])
                    },
                    itemStyle: {
                        normal: {
                            color: '#298A5F'
                        }
                    },
                    data: this.activeData.commitedMetaSpace
                }
            ]
        };
        return option;
    }

    private makeXAxis(gridIndex: any, opt: any) {
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const options = {
            type: 'time',
            gridIndex,
            offset: 0,
            boundaryGap: ['20%', '20%'],
            axisLine: { onZero: false, lineStyle: { color: axisLineColor, width: 2 } },
            axisTick: { show: true }, // 坐标轴刻度相关设置
            splitLine: {
                show: false,
                lineStyle: { color: '#aaaaaa ' },
                interval: 0
            },
            axisPointer: {
                lineStyle: { show: true, color: '#7E8083' }
            }
        };
        if (opt) { Object.assign(options, opt); }
        return options;
    }
    /**
     * makeYAxis
     * @param gridIndex gridIndex
     * @param opt opt
     */
    makeYAxis(gridIndex: any, opt: any) {
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const axisLabelColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#aaa';
        const options = {
            type: 'value',
            show: true,
            gridIndex,
            nameLocation: 'middle',
            boundaryGap: false,
            nameGap: 30,
            nameRotate: 0,
            offset: 10,
            nameTextStyle: {
                color: axisLabelColor,
                fontSize: 16
            },
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { show: true, color: axisLabelColor }, // y轴值
            splitLine: {
                show: true, lineStyle: {
                    color: axisLineColor
                }
            },
            splitNumber: 2, // y轴刻度间隔
            min: 0
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }
    /**
     * makeGrid
     * @param top top
     * @param opt opt
     */
    makeGrid(top: any, opt: any) {
        const options = {
            top: top + 50,
            left: 60,
            right: 30,
            height: this.gridHeight
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }
    /**
     * timeLineData
     * @param data data
     */
    public timeLineData(data: any) {
        this.overViewOption.dataZoom[0].start = data.start;
        this.overViewOption.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.overViewOption.dataZoom
        });
    }
    /**
     * handleDatazoom
     * @param event event
     */
    public handleDatazoom(event: any) {
        this.timeLine.dataConfig({
            start: event.batch[0].start,
            end: event.batch[0].end,
        });
    }
    // echarts 排序数据
    private sortEchartsData(data: Array<any>) {
        const newData = data.sort((a, b) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
        return newData;
    }
    // GC活动
    private gcActivityInit(data: any) {
        if (data.type === 'GC_STATISTIC' && data.content.length) {
            this.srcDataActivity.data = [];
            this.leftTable.total = this.srcDataActivity.data.length;
            this.srcDataPhase.data = [];
            this.gcStatisticAll = this.gcStatisticAll.concat(data.content);
            const activitys: any[] = [];

            this.gcStatisticAll.forEach((gc, index) => {
                const phases: any[] = [];
                gc.phases.forEach((ph: any) => {
                    phases.push({
                        gcId: this.levelForamt(ph.level),
                        name: ph.name,
                        duration: ph.duration,
                        startTime: this.dateFormat(ph.starTime, 'yyyy/MM/dd hh:mm:ss')
                    });
                });
                activitys.push({
                    isSelect: index === 0,
                    activity: gc.gcStatistic.gcId,
                    cause: gc.gcStatistic.cause,
                    collector_name: gc.gcStatistic.name,
                    longest_pause: gc.gcStatistic.longestPause,
                    phases,
                    before_memory: gc.gcStatistic.beforeGcHeap,
                    after_memory: gc.gcStatistic.afterGcHeap,
                });
            });
            this.srcDataActivity.data.push(...activitys);
            this.leftTable.total = this.srcDataActivity.data.length;
            this.getphase(activitys[0], 0);
        }
        this.updateWebViewPage();
    }

    private levelForamt(level: string) {
        let str = '';
        switch (level) {
            case 'LEVEL_I':
                str = 'GC Pause Phase Level 1';
                break;
            case 'LEVEL_II':
                str = 'GC Pause Phase Level 2';
                break;
            case 'LEVEL_III':
                str = 'GC Pause Phase Level 3';
                break;
            case 'LEVEL_IV':
                str = 'GC Pause Phase Level 4';
                break;
            default:
                break;
        }
        return str;
    }
    /**
     * getphase
     * @param row row
     * @param idx idx
     */
    public getphase(row: any, idx: any) {
        this.srcDataPhase.data = [];
        this.srcDataPhase.data = row.phases;
        this.rightTotalNumber = this.srcDataPhase.data.length;
        this.srcDataActivity.data.forEach((item, index) => {
            item.isSelect = idx === index;
        });
    }
    // GC配置信息
    private configsInit(data: any) {
        const configs = data;
        if (configs.type === 'GC_CONFIGURATION' && configs.content.length) {
            const baseConfig = configs.content[0].basicConfig;
            const heapConfig = configs.content[0].heapConfig;
            const youngGenConfig = configs.content[0].youngGenConfig;
            const survivorConfig = configs.content[0].survivorConfig;
            const tlabConfig = configs.content[0].tlabConfig;
            this.baseConfig.forEach((item) => {
                item.value = baseConfig[item.keywords];
            });
            this.heapConfig.forEach((item, index) => {
                switch (index) {
                    case 0:
                    case 1:
                        item.value = this.libService.onChangeUnit(heapConfig[item.keywords]);
                        break;
                    case 2:
                        item.value = this.libService.onChangeUnit(heapConfig[item.keywords], false, 3);
                        break;
                    case 3:
                    case 4:
                        item.value = heapConfig[item.keywords];
                        break;
                    case 5:
                        item.value = heapConfig[item.keywords] + '-bit';
                        break;
                    case 6:
                        item.value = this.libService.onChangeUnit(heapConfig[item.keywords]);
                        break;
                    default:
                        break;
                }
            });
            this.youngGenConfig.forEach((item, index) => {
                switch (index) {
                    case 0:
                    case 1:
                        item.value = this.libService.onChangeUnit(youngGenConfig[item.keywords], false, 3);
                        break;
                    case 2:
                        item.value = item.keywords && youngGenConfig[item.keywords];
                        break;
                    default:
                        break;
                }
            });
            this.survivorConfig.forEach((item) => {
                item.value = item.keywords && survivorConfig[item.keywords];
            });
            this.tlabConfig.forEach((item, index) => {
                switch (index) {
                    case 0:
                        item.value = tlabConfig[item.keywords];
                        break;
                    case 1:
                        if (
                            (tlabConfig[item.keywords] / 1024).toString().indexOf('.') > -1
                        ) {
                            item.value =
                                (tlabConfig[item.keywords] / 1024).toFixed(3) + ' KiB';
                        } else {
                            item.value = tlabConfig[item.keywords] / 1024 + ' KiB';
                        }
                        break;
                    case 2:
                        if (tlabConfig[item.keywords].toString().indexOf('.') > -1) {
                            item.value = tlabConfig[item.keywords].toFixed(3) + ' B';
                        } else {
                            item.value = tlabConfig[item.keywords] + ' B';
                        }
                        break;
                    default:
                        break;
                }
            });
        }
        this.updateWebViewPage();
    }

    // 格式化时间格式
    private dateFormat(date: any, fmt: any) {
        const getDate = new Date(date);
        const o = {
            'M+': getDate.getMonth() + 1,
            'd+': getDate.getDate(),
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: getDate.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (getDate.getFullYear() + '').substr(4 - RegExp.$1.length)
            );
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1
                        ? (o as any)[k]
                        : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length)
                );
            }
        }
        return fmt;
    }
    private getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }
    /**
     * getSamplingData
     * @param type type
     * @param type type
     */
    private getSamplingData(type: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${encodeURIComponent(data)}/${encodeURIComponent(uuid)}/${type}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: type.toUpperCase(),
            uuid
        });
    }
    /**
     * importCache
     */
    public importCache() {
        this.baseConfig = this.downloadService.downloadItems.gc.baseConfig.length > 0
            ? this.downloadService.downloadItems.gc.baseConfig : this.baseConfig;
        this.heapConfig = this.downloadService.downloadItems.gc.heapConfig.length > 0
            ? this.downloadService.downloadItems.gc.heapConfig : this.heapConfig;
        this.youngGenConfig = this.downloadService.downloadItems.gc.youngGenConfig.length > 0
            ? this.downloadService.downloadItems.gc.youngGenConfig : this.youngGenConfig;
        this.survivorConfig = this.downloadService.downloadItems.gc.survivorConfig.length > 0
            ? this.downloadService.downloadItems.gc.survivorConfig : this.survivorConfig;
        this.tlabConfig = this.downloadService.downloadItems.gc.tlabConfig.length > 0
            ? this.downloadService.downloadItems.gc.tlabConfig : this.tlabConfig;
        this.srcDataActivity.data = this.downloadService.downloadItems.gc.activity;
        this.leftTable.total = this.srcDataActivity.data.length;
        this.activeData = this.downloadService.downloadItems.gc.activeData;
        this.finishGC = this.downloadService.downloadItems.gc.isFinish;
        // 时间轴
        this.timeData = this.downloadService.downloadItems.gc.timeData;
        this.suggestArr = this.downloadService.downloadItems.gc.suggestArr;
    }
    /**
     * 配置信息折叠
     */
    public clickTitle() {
        const item = document.getElementById('configData');
        this.unfold = !this.unfold;
        if (this.unfold) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    }
    /**
     * 点击图标折叠
     */
    public clickImg() {
        const item = document.getElementById('gcConfig');
        this.unfoldTable = !this.unfoldTable;
        if (this.unfoldTable) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    }

    /**
     * 搜索
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
     * 优化建议汇总弹窗
     */
    public openModal() {
        if (this.downloadService.downloadItems.gc.suggestArr[0]) {
            this.downloadService.downloadItems.gc.suggestArr[0].state = true;
        }
        this.suggestion.open();
    }
     /**
      * intellIj刷新webview页面
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
