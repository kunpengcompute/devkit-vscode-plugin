import { LibService } from './../../service/lib.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTableComponent } from '@cloud/tiny3';
import { MessageService } from '../../service/message.service';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import * as echarts from 'echarts/core';

const conNum = {
    zeroApproximation: 0.0000001
};
@Component({
    selector: 'app-gc',
    templateUrl: './gc.component.html',
    styleUrls: ['./gc.component.scss']
})
export class GcComponent implements OnInit, OnDestroy {
    @ViewChild('gcTimeLine', { static: false }) gcTimeLine: any;
    @ViewChild('table', { static: false }) table: TiTableComponent;
    constructor(
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private libService: LibService,
        private stompService: StompService,
        private elementRef: ElementRef,
    ) {
        this.i18n = this.i18nService.I18n();
        this.searchOptions = [
            {
                label: this.i18n.profikeGC.GCCause,
                value: 'gcCause'
            },
            {
                label: this.i18n.profikeGC.GarbageCollector,
                value: 'gcName'
            }
        ];
        this.searchKeys.push(this.searchOptions[0].value);
    }
    @ViewChild('analysis', { static: false }) analysis: any;
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public baseColor = '#484a4e';
    public textColor = '#222';
    public i18n: any;
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    public data: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public update: any = [];
    public timeOpt: any = [];
    public gridTop: any = 0;
    public gridHeight: any = 90;
    public gridLeft: any = 40;
    public assetZone: any = {};
    public oldgcActive: any[] = [];
    public gcactivename = '';
    public gcnewactivname = '';
    public newgcActive: any[] = [];
    public gcNameOne: any[] = [];
    public gcNameTwo: any[] = [];
    public gccommitaft: any = [];
    public gcusedaft: any = [];
    public gcCircle: any = [];
    public gcduration: any = [];
    public gcthredcount: any = [];
    public yGcact: any;
    public yGcstore: any;
    public ycGcback: any;
    public yGcpause: any;
    public yGcthread: any;
    public isDownload = false;
    public echarts: any;
    public gcTimeData: any = [];
    // 表格展开
    public expand = false;
    public darkColor: any = true;
    public searchWords: Array<string> = [];
    public searchKeys: Array<string> = [];
    public searchOptions: any[] = [];
    public page = {
        pageNo: 0,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
    };

    private limit = {
        times: 3,
        records: 300
    };

    private parseXAxis: Array<{ xAxis: string }> = [];
    // 是否在初始化后有接收到第一条数据
    private isFirstData = false;
    public suggestArr: Array<any> = [];
    public allSuggestArr: Array<any> = [];
    public sugtype = 1;

    /**
     * 组件初始化
     */
    ngOnInit() {
        // 颜色主题适配
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
            this.baseColor = '#d4d9e6';
            this.textColor = '#222';
            this.darkColor = true;
        } else {
            this.baseColor = '#484a4e';
            this.textColor = '#e8e8e8';
            this.darkColor = false;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.baseColor = this.currTheme === COLOR_THEME.Light ? '#d4d9e6' : '#484a4e';
            this.textColor = this.currTheme === COLOR_THEME.Light ? '#222' : '#e8e8e8';
        });
        // 获取gc图数据
        // 设置表头
        this.columns = [
            {
                title: this.i18n.profikeGC.Timestamp,
                width: '10%',
                isSort: true,
                sortKey: 'startTime'
            },
            {
                title: this.i18n.profikeGC.GCCause,
                width: '15%',
            },
            {
                title: this.i18n.profikeGC.GarbageCollector,
                width: '15%'
            },
            {
                title: this.i18n.profikeGC.MemoryAppliedforGC,
                width: '10%',
                isSort: true,
                sortKey: 'gcCommit'
            },
            {
                title: this.i18n.profikeGC.MemoryBeforeGC,
                width: '10%',
                isSort: true,
                sortKey: 'gccommitbefore'
            },
            {
                title: this.i18n.profikeGC.MemoryAfterGC,
                width: '10%',
                isSort: true,
                sortKey: 'gccommitafter'
            },
            {
                title: this.i18n.profikeGC.GCCircle,
                width: '10%',
                isSort: true,
                sortKey: 'gcCircle'
            },
            {
                title: this.i18n.profikeGC.GCThreads,
                width: '10%',
                isSort: true,
                sortKey: 'gcThreadCount'
            },
            {
                title: this.i18n.profikeGC.PauseTime,
                width: '10%',
                isSort: true,
                sortKey: 'gcDuration'
            }
        ];

        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.gcAnalysis;
        this.handleDownload();
        this.echartsInit();
        this.getupTable();
        this.handleDataLimit();
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (this.downloadService.downloadItems.gc.suggestArr) {
            this.suggestArr = this.downloadService.downloadItems.gc.suggestArr;
            this.getSuggestTip();
        }
        if (this.isDownload) {
            const overviewArr: Array<any> = this.downloadService.downloadItems.overview.suggestArr ?
                this.downloadService.downloadItems.overview.suggestArr : [];
            const gcArr: Array<any> = this.downloadService.downloadItems.gc.suggestArr ?
                this.downloadService.downloadItems.gc.suggestArr : [];
            const gclogArr: Array<any> = this.downloadService.downloadItems.gclog.suggestArr ?
                this.downloadService.downloadItems.gclog.suggestArr : [];
            const jdbcpoolArr: Array<any> = this.downloadService.downloadItems.jdbcpool.suggestArr ?
                this.downloadService.downloadItems.jdbcpool.suggestArr : [];
            const allSuggestArr: Array<any> = overviewArr.concat(gcArr, gclogArr, jdbcpoolArr);
            this.downloadService.downloadItems.profileInfo.allSuggestArr =
            allSuggestArr.length > 0 ? allSuggestArr : [];
            this.suggestArr = this.downloadService.downloadItems.gc.suggestArr ?
            this.downloadService.downloadItems.gc.suggestArr : [];
        }
        if ((self as any).webviewSession.getItem('isProStop') === 'false') {
            this.stompService.gcState = this.msgService.getMessage()
                .subscribe((msg) => {
                    if (msg.type === 'dataLimit' && msg.data.name === 'gc') {
                        // 如果是图的限定时间改小
                        if (msg.data.type === 'times' && this.limit.times > msg.data.value) {
                            this.spliceEarlierData(msg.data.value);
                        }
                        (this.limit as any)[msg.data.type] = msg.data.value;
                    }

                    if (msg.type === 'gcState') {
                        this.timeOpt.push(this.dataFormat(msg.data.startTime + msg.data.duration, 'hh:mm:ss.S'));
                        if (msg.data.gcName !== '') {
                            if (this.gcactivename === '' && this.gcnewactivname === '') {
                                this.gcactivename = msg.data.gcName;
                                this.oldgcActive.push(msg.data.duration / 1000);
                                this.newgcActive.push(conNum.zeroApproximation);
                            } else if (this.gcactivename !== msg.data.gcName) {
                                this.gcnewactivname = msg.data.gcName;
                                this.newgcActive.push(msg.data.duration / 1000);
                                this.oldgcActive.push(conNum.zeroApproximation);
                            } else {
                                this.oldgcActive.push(msg.data.duration / 1000);
                                this.newgcActive.push(conNum.zeroApproximation);
                            }
                        } else {
                            this.newgcActive.push(conNum.zeroApproximation);
                            this.oldgcActive.push(conNum.zeroApproximation);
                        }
                        if (this.oldgcActive.some((item) => {
                            return item !== conNum.zeroApproximation;
                        })) {
                            this.gcNameOne = this.oldgcActive;
                        }
                        if (this.newgcActive.some((item) => {
                            return item !== conNum.zeroApproximation;
                        })) {
                            this.gcNameTwo = this.newgcActive;
                        }
                        let newarr: any[] = [];
                        newarr = newarr.concat(this.newgcActive, this.oldgcActive);
                        // gc活动
                        this.yGcact = ((this.maxData(newarr))).toLocaleString() + '%';
                        // 内存数据 --1.used size，2.commited size
                        msg.data.committedAfterGc = msg.data.committedAfterGc ===
                            0 ? conNum.zeroApproximation : msg.data.committedAfterGc;
                        this.gccommitaft.push(msg.data.committedAfterGc);
                        msg.data.usedAfterGc = msg.data.usedAfterGc === 0 ?
                        conNum.zeroApproximation : msg.data.usedAfterGc;
                        this.gcusedaft.push(msg.data.usedAfterGc);
                        this.yGcstore = (Math.max(...this.gccommitaft) / 1024 / 1024).toFixed(2) + ' MiB';
                        // gc回收
                        let gccircledata = msg.data.usedBeforeGc - msg.data.usedAfterGc;
                        gccircledata = gccircledata === 0 ? conNum.zeroApproximation : gccircledata;
                        this.gcCircle.push(gccircledata);
                        this.ycGcback = ((Math.max(...this.gcCircle)) / 1024 / 1024).toFixed(2) + ' MiB';
                        // gc暂停时间
                        msg.data.pauseTime = msg.data.pauseTime === 0 ? conNum.zeroApproximation : msg.data.pauseTime;
                        this.gcduration.push((msg.data.pauseTime / 1000).toFixed(3));
                        this.yGcpause = (Math.max(...this.gcduration).toLocaleString()) || 1;
                        // gc线程数
                        if (msg.data.gcThreadCount === -1) {
                            this.gcthredcount.push(conNum.zeroApproximation);
                        } else {
                            msg.data.gcThreadCount = msg.data.gcThreadCount === 0 ?
                            conNum.zeroApproximation : msg.data.gcThreadCount;
                            this.gcthredcount.push(msg.data.gcThreadCount);
                            this.yGcthread = (Math.max(...this.gcthredcount)).toLocaleString() || 1;
                        }
                        // table表格数据
                        if (msg.data.gcId !== -1) {
                            this.data.push(this.tableFormat(msg));
                            this.getupTable();
                        }
                        // 更新数据
                        this.getUpdate();
                        this.handleDownloadSave();

                    }
                    if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.gcAnalysis) {
                        this.downloadService.downloadItems.gc = {
                            tableData: [],
                            startDate: {},
                            maxValue: {
                                yGcact: '',
                                yGcstore: '',
                                ycGcback: '',
                                yGcpause: '',
                                yGcthread: ''
                            }
                        };
                        this.gcDataInit();
                    }
                    if (msg.type === 'suggest') {
                        this.suggestArr = msg.data.filter((item: any) => {
                            return item.label === 2;
                        });
                        this.downloadService.downloadItems.gc.suggestArr = this.suggestArr;
                        this.getSuggestTip();
                    }
                });
        }
    }

    private handleDataLimit() {
        this.limit.times = this.downloadService.dataLimit.gc.timeValue;
        this.limit.records = this.downloadService.dataLimit.gc.dataValue;
        const pauseEndTimes = Object.keys(this.downloadService.dataLimit.pauseTimes.gc);
        this.parseXAxis.push(...pauseEndTimes.map((item) => ({ xAxis: item })));
    }

    /**
     * 数据初始化
     */
    public gcDataInit() {
        this.data = [];
        this.srcData.data = [];
        this.displayed = [];
        this.timeOpt = [];
        this.oldgcActive = [];
        this.gcNameOne = [];
        this.newgcActive = [];
        this.gcNameTwo = [];
        this.gccommitaft = [];
        this.gcusedaft = [];
        this.gcCircle = [];
        this.gcduration = [];
        this.gcthredcount = [];
        this.echartsInit();
    }

    /**
     * gc导入导出
     * handleDownload
     */
    public handleDownload() {
        this.data = this.downloadService.downloadItems.gc.tableData;
        this.yGcact = this.downloadService.downloadItems.gc.maxValue.yGcact;
        this.yGcstore = this.downloadService.downloadItems.gc.maxValue.yGcstore;
        this.ycGcback = this.downloadService.downloadItems.gc.maxValue.ycGcback;
        this.yGcpause = this.downloadService.downloadItems.gc.maxValue.yGcpause;
        this.yGcthread = this.downloadService.downloadItems.gc.maxValue.yGcthread;
        if (Object.keys(this.downloadService.downloadItems.gc.startDate).length) {
            this.timeOpt = this.downloadService.downloadItems.gc.startDate.xAxis[0].data;
            this.gcTimeData = this.timeOpt;
            this.oldgcActive = this.downloadService.downloadItems.gc.startDate.series[0].data;
            this.gcactivename = this.downloadService.downloadItems.gc.startDate.series[0].name;
            this.newgcActive = this.downloadService.downloadItems.gc.startDate.series[1].data;
            this.gcnewactivname = this.downloadService.downloadItems.gc.startDate.series[1].name;
            this.gcusedaft = this.downloadService.downloadItems.gc.startDate.series[2].data;
            this.gccommitaft = this.downloadService.downloadItems.gc.startDate.series[3].data;
            this.gcCircle = this.downloadService.downloadItems.gc.startDate.series[4].data;
            this.gcduration = this.downloadService.downloadItems.gc.startDate.series[5].data;
            this.gcthredcount = this.downloadService.downloadItems.gc.startDate.series[6].data;
            if (this.oldgcActive.some((item) => {
                return item !== 0;
            })) {
                this.gcNameOne = this.oldgcActive;
            }
            if (this.newgcActive.some((item) => {
                return item !== 0;
            })) {
                this.gcNameTwo = this.newgcActive;
            }
            this.assetZone = this.downloadService.downloadItems.gc.startDate;
        }
    }

    /**
     * echarts数据更新
     */
    public getUpdate() {
        if (!this.isFirstData) {
            this.isFirstData = true;
            if (this.timeOpt.length > 1) {
                const pauseEndTime = this.timeOpt[this.timeOpt.length - 1];
                const pauseStartTime = this.timeOpt[this.timeOpt.length - 2];
                (this.downloadService as any).dataLimit.pauseTimes.gc[pauseEndTime] = pauseStartTime;
                this.parseXAxis.push({
                    xAxis: this.timeOpt[this.timeOpt.length - 1]
                });
            }
        }
        this.assetZone.series[0].data = this.gcNameOne;
        this.assetZone.series[1].data = this.gcNameTwo;
        this.gcTimeData = this.timeOpt;
        this.gcTimeLine.setTimeData(this.gcTimeData);
        this.assetZone.xAxis[0] = this.makeaXAxis(0, {
            axisLabel: { show: false },
            axisTick: { show: false },
            axisPointer: { show: Boolean(this.gcactivename) }
        });
        this.assetZone.series[0] = {
            type: 'line',
            name: this.gcactivename,
            smooth: false,
            xAxisIndex: 0,
            yAxisIndex: 0,
            showSymbol: false,
            symbolSize: 2,
            lineStyle: { color: this.baseColor },
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
            itemStyle: {
                color: '#3d7ff3'  // 拐点颜色
            },
            data: this.gcNameOne
        };
        this.assetZone.series[1] = {
            type: 'line',
            name: this.gcnewactivname,
            smooth: false,
            xAxisIndex: 0,
            yAxisIndex: 0,
            showSymbol: false,
            symbolSize: 2,
            lineStyle: { color: '#2da46f' },
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
            itemStyle: {
                color: '#2da46f'  // 拐点颜色
            },
            data: this.gcNameTwo
        };
        const timeDelta = this.getTimeDelta(this.timeOpt[0], this.timeOpt[this.timeOpt.length - 1]);
        if (timeDelta > (this.limit.times * 60 * 1000)) {
            this.timeOpt.shift();
            this.gcNameOne.shift();
            this.gcNameTwo.shift();
            // 内存
            this.gccommitaft.shift();
            this.gcusedaft.shift();

            // gc回收
            this.gcCircle.shift();
            // gc暂停时间
            this.gcduration.shift();
            // gc进程数
            this.gcthredcount.shift();
        }
        this.echarts = echarts.init(this.elementRef.nativeElement.querySelector('#myEchart'));
        this.echarts.setOption(this.assetZone, { notMerge: false, lazyUpdate: true, silent: false });
        window.onresize = this.echarts.resize;
        this.echarts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.gcTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 削掉早于限定时间的数据
     *
     * @param newLimitTimes 新限定时间
     */
    private spliceEarlierData(newLimitTimes: number) {
        // 固定日期，用于制造Date对象可读的时间格式，无实际意义
        const date = '2020/11/19 ';
        const lastDate = new Date(date + this.timeOpt[this.timeOpt.length - 1]);
        // 计算可保留数据的最早时间戳
        const earliestTimestamp = lastDate.getTime() - newLimitTimes * 60 * 1000;

        let outNumber = 0;
        for (const item of this.timeOpt) {
            const theTime = new Date(date + item);
            if (theTime.getTime() < earliestTimestamp) {
                outNumber++;
            } else {
                break;
            }
        }

        this.timeOpt.splice(0, outNumber);
        this.gcNameOne.splice(0, outNumber);
        this.gcNameTwo.splice(0, outNumber);
        this.gccommitaft.splice(0, outNumber);
        this.gcusedaft.splice(0, outNumber);
        this.gcCircle.splice(0, outNumber);
        this.gcduration.splice(0, outNumber);
        this.gcthredcount.splice(0, outNumber);
    }

    /**
     * 计算两个时间点的间隔，单位毫秒
     *
     * @param time1 'hh:mm:ss.S'格式的时间
     * @param time2 'hh:mm:ss.S'格式的时间
     */
    private getTimeDelta(time1: string, time2: string) {
        // 获取各时间的数字格式
        const time1Millisecond = Number(time1.split('.')[1]);
        const [time1Hour, time1Minute, time1Second] = time1.split('.')[0].split(':').map((item) => Number(item));
        const time2Millisecond = Number(time2.split('.')[1]);
        const [time2Hour, time2Minute, time2Second] = time2.split('.')[0].split(':').map((item) => Number(item));

        // 以毫秒为单位计算各时间差
        const hourDeltaByMillisecond = (time2Hour - time1Hour) * 3600 * 1000;
        const minuteDeltaByMillisecond = (time2Minute - time1Minute) * 60 * 1000;
        const secondDeltaByMillisecond = (time2Second - time1Second) * 1000;
        const millisecondDelta = time2Millisecond - time1Millisecond;

        return hourDeltaByMillisecond + minuteDeltaByMillisecond + secondDeltaByMillisecond + millisecondDelta;
    }

    /**
     * echartsInit
     */
    public echartsInit() {
        this.setData();
        const series = [
            {
                type: 'line',
                name: this.gcactivename,
                smooth: false,
                xAxisIndex: 0,
                yAxisIndex: 0,
                showSymbol: false,
                symbolSize: 2,
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
                itemStyle: {
                    color: '#3d7ff3'  // 拐点颜色
                },
                data: this.gcNameOne
            },
            {
                type: 'line',
                name: this.gcnewactivname,
                smooth: false,
                xAxisIndex: 0,
                yAxisIndex: 0,
                showSymbol: false,
                symbolSize: 2,
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
                itemStyle: {
                    color: '#2da46f'  // 拐点颜色
                },
                data: this.gcNameTwo
            },
            {
                type: 'line',
                name: 'used  size',
                smooth: false,
                xAxisIndex: 1,
                yAxisIndex: 1,
                showSymbol: false,
                symbolSize: 2,
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
                itemStyle: {
                    color: '#3d7ff3 '  // 拐点颜色
                },
                data: this.gcusedaft
            },
            {
                type: 'line',
                name: 'committed size',
                smooth: false,
                xAxisIndex: 1,
                yAxisIndex: 1,
                showSymbol: false,
                symbolSize: 2,
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
                itemStyle: {
                    color: '#2da46f'  // 拐点颜色
                },
                data: this.gccommitaft
            },
            {
                type: 'line',
                name: 'GC',
                smooth: false,
                xAxisIndex: 2,
                yAxisIndex: 2,
                showSymbol: false,
                symbolSize: 2,
                lineStyle: {
                    width: 2
                },
                areaStyle: {
                    color: '#3d7ff3',
                    opacity: 0.2,
                },
                itemStyle: {
                    color: '#3d7ff3'  // 拐点颜色
                },
                data: this.gcCircle
            },
            {
                type: 'line',
                name: this.i18n.profikeGC.PauseTime,
                smooth: false,
                xAxisIndex: 3,
                yAxisIndex: 3,
                showSymbol: false,
                symbolSize: 2,
                lineStyle: {
                    width: 2
                },
                areaStyle: {
                    color: '#3d7ff3',
                    opacity: 0.2,
                },
                itemStyle: {
                    color: '#3d7ff3'  // 拐点颜色
                },
                data: this.gcduration
            },
            {
                type: 'line',
                name: this.i18n.profikeGC.GCThreads,
                smooth: false,
                showSymbol: false, // 只有hover时显示
                xAxisIndex: 4,
                yAxisIndex: 4,
                symbolSize: 2,
                lineStyle: {
                    width: 2
                },
                areaStyle: {
                    color: '#3d7ff3',
                    opacity: 0.2,
                },
                itemStyle: {
                    color: '#3d7ff3 '  // 拐点颜色
                },
                data: this.gcthredcount
            }
        ];
        this.assetZone.series = series;
        this.echarts = (echarts as any).init(document.getElementById('myEchart'));
        this.echarts.setOption(this.assetZone, { notMerge: false, lazyUpdate: true, silent: false });
        window.onresize = this.echarts.resize;
        this.echarts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.gcTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }
    /**
     * setData
     */
    public setData() {
        this.assetZone = {
            grid: [
                this.makeGrid(0, {}),
                this.makeGrid(this.gridTop + this.gridHeight, {}),
                this.makeGrid(this.gridTop + this.gridHeight * 2, {}),
                this.makeGrid(this.gridTop + this.gridHeight * 3, {}),
                this.makeGrid(this.gridTop + this.gridHeight * 4, {})
            ],
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                borderRadius: 5,
                boxShadow: 'rgba(0, 0, 0, 0.5)',
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                padding: [0, 16, 12, 16],
                axisPointer: {
                    show: true,
                    z: 0,
                    lineStyle: {
                        color: '#7E8083'
                    }
                },
                formatter: (params: any) => {
                    let pauseTip = '';
                    if (Object.keys(this.downloadService.dataLimit.pauseTimes.gc).includes(params[0].axisValue)) {
                        pauseTip = this.i18nService.I18nReplace(
                            this.i18n.plugins_perf_java_profiling_limitation.pauseTip,
                            {
                                0: (this.downloadService as any).dataLimit.pauseTimes.gc[params[0].axisValue],
                                1: params[0].axisValue,
                            }
                        );
                    }
                    let html = `
                  <div>
                    <p style="font-size:12px;margin:12px 0;
                    [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                    ${params[0].axisValue}${pauseTip}</p>
                  </div>
                `;
                    let comitsize: any;
                    let usedsize: any;
                    let freesize;
                    params.forEach((item: any) => {
                        item.data = item.data === conNum.zeroApproximation ? 0 : item.data;
                        if (item.seriesName === 'committed size') {
                            comitsize = item.data;
                        } else if (item.seriesName === 'used  size') {
                            usedsize = item.data;
                        }
                    });
                    freesize = ((comitsize - usedsize) / 1024 / 1024).toFixed(2) + ' MiB';
                    if (params[0].axisIndex === 0) {
                        params[0].data += '%';
                        if (params[0].seriesIndex === 0 && params[1].seriesIndex === 1) {
                            html += `
                  <div style="font-size:12px; display:flex;justify-content: space-between;
                   align-items: center; margin-bottom:10px">
                    <div style="float : left;>
                      <span style="width:8px;height:8px;display:inline-block;background: ${params[1].color};"></span>
                      <span style="margin-left:7px">${params[1].seriesName}</span>
                    </div>
                    <span>&nbsp;&nbsp;&nbsp;${params[1].data}%</span>
                  </div>
                 `;
                        }
                    }
                    if (params[0].axisIndex === 1) {
                        params[0].data = (params[0].data / 1024 / 1024).toFixed(2) + ' MiB';
                        params[0].color = '#3d7ff3';
                        html += `
                            <div style="font-size:12px; display:flex;justify-content: space-between;
                             align-items: center;
                            margin-bottom:10px">
                            <div style="float : left;">
                              <span style="width:8px;height:8px;display:inline-block;background:#38C1BC;"></span>
                              <span style="margin-left:7px">free size</span>
                            </div>
                            <span>&nbsp;&nbsp;&nbsp;${freesize}</span>
                          </div>
                           `;
                        html += `
                           <div style="font-size:12px; display:flex;justify-content: space-between; align-items: center;
                           margin-bottom:10px">
                           <div style="float : left;">
                             <span style="width:8px;height:8px;display:inline-block;
                             background:#2da46f"></span>
                             <span style="margin-left:7px">committed size</span>
                           </div>
                           <span>&nbsp;&nbsp;&nbsp;${(comitsize / 1024 / 1024).toFixed(2)}&nbsp;&nbsp;MiB</span>
                         </div>
                          `;
                    } else if (params[0].axisIndex === 2) {
                        params[0].data = (params[0].data / 1024 / 1024).toFixed(2) + ' MiB';
                    } else if (params[0].axisIndex === 3 || params[0].axisIndex === 4) {
                        params[0].data = params[0].data.toLocaleString();
                    }
                    html += `
                    <div style="font-size:12px;display:flex;justify-content: space-between;
                     align-items: center;margin-bottom:10px">
                      <div>
                        <span style="width:8px;height:8px;display:inline-block;background:${params[0].color};"></span>
                        <span style="margin-left:7px">${params[0].seriesName}</span>
                      </div>
                      <span>&nbsp;&nbsp;&nbsp;${params[0].data}</span>
                    </div>
                  `;
                    return html;
                }
            },
            axisPointer: {
                link: { xAxisIndex: [0, 1, 2, 3, 4] },
                snap: true
            },
            // 区域缩放组件
            dataZoom: [
                {
                    show: false,
                    type: 'slider',
                    realtime: true,
                    xAxisIndex: [0, 1, 2, 3, 4],
                    top: 0,
                    showDataShadow: true, // 是否显示背景
                    height: 32,
                    dataBackground: {
                        areaStyle: {
                            color: 'rgba(230,233,240,0.6)' // 滑块背景阴影的填充样式
                        },
                        lineStyle: {
                            opacity: 0.8,
                            color: 'rgb(230,233,240)' // 滑块背景的边线颜色
                        }
                    },
                    fillerColor: 'rgba(108, 146, 250, 0.15)', // 选中的区域背景色
                    textStyle: {
                        color: 'rgba(40, 43, 51, 0)'  // 选中区域两边的边界值样式  不显示
                    },
                    handleStyle: {   // 边界图标样式设置
                        color: 'rgba(108, 146, 250, 1)',
                        borderType: 'solid',
                        borderWidth: '10',
                    }
                },
                {
                    type: 'inside',
                    realtime: true,
                    xAxisIndex: [0, 1, 2, 3, 4],
                    showDataShadow: false   // 是否显示数据阴影
                }
            ],
            xAxis: [
                this.makeaXAxis(0, {
                    axisLabel: { show: false },
                    axisTick: { show: false },
                    axisPointer: { show: Boolean(this.gcactivename) }
                }),
                this.makeaXAxis(1, { axisLabel: { show: false },
                   axisTick: { show: false }, axisPointer: { show: true } }),
                this.makeaXAxis(2, { axisLabel: { show: false },
                   axisTick: { show: false }, axisPointer: { show: true } }),
                this.makeaXAxis(3, { axisLabel: { show: false },
                   axisTick: { show: false }, axisPointer: { show: true } }),
                this.makeaXAxis(4,
                    { axisLabel: { show: true, color: this.textColor },
                     axisTick: { show: true }, axisPointer: { show: true } }),
            ],
            yAxis: [
                this.makeYAxis(0,
                    { max(value: any): any { return value.max + 1 / 4 * (value.max); } }),
                this.makeYAxis(1, {}),
                this.makeYAxis(2, {}),
                this.makeYAxis(3, {}),
                this.makeYAxis(4, {}),
            ],
            series: []
        };
    }
    /**
     * makeGrid
     * @param top top
     * @param opt opt
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top,
            height: this.gridHeight,
            left: 35,
            right: 35
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * makeaXAxis
     * @param gridIndex gridIndex
     * @param opt opt
     */
    public makeaXAxis(gridIndex: any, opt: any) {
        const options = {
            type: 'category',
            splitLine: { show: false, },  // x轴grid分割线
            position: 'bottom',   // 轴线位置
            gridIndex,
            boundaryGap: false,   // 要主动设，从0开始
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: this.baseColor,
                    width: 1
                }
            },  // 轴线颜色
            data: this.timeOpt
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * makeYAxis
     * @param gridIndex gridIndex
     * @param opt opt
     */
    public makeYAxis(gridIndex: any, opt: any) {
        const options = {
            show: true,
            gridIndex,
            type: 'value',
            splitLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: this.baseColor,
                    width: 1
                }
            },  // 轴线颜色
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * makeSeries
     * @param xAxisIndex xAxisIndex
     * @param yAxisIndex yAxisIndex
     * @param opt opt
     */
    public makeSeries(xAxisIndex: any, yAxisIndex: any, opt: any) {
        const options: any = {
            type: 'line',
            xAxisIndex,
            smooth: false,
            yAxisIndex,
            showSymbol: false,
            data: []
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * table表格数据更新
     */
    public getupTable() {
        const outNumber = this.data.length - this.limit.records;
        if (outNumber > 0) {
            this.data.splice(0, outNumber);
        }
        this.srcData = {
            data: this.data,   // 元数据
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
        this.page.total = this.data.length;
    }
    /**
     * gc时间轴筛选事件
     * @param event 时间轴开始和结束百分比数值
     */
    public timeLineData(data: any) {
        this.assetZone.dataZoom[0].start = data.start;
        this.assetZone.dataZoom[0].end = data.end;
        this.echarts.setOption({
            dataZoom: this.assetZone.dataZoom
        });
    }
    /**
     * 表格展开
     */
    public onClickExpand(): void {
        this.expand = !this.expand;
    }
    /**
     * table表格数据处理
     * @param msg msg
     */
    public tableFormat(msg: { data: any; }) {
        const tabledata = msg.data;
        const startTime = this.dataFormat(tabledata.startTime, 'hh:mm:ss');
        const gcCause = tabledata.gcCause;
        const gcName = tabledata.gcName;
        const gcCommit = this.libService.onChangeUnit(tabledata.committedAfterGc);
        const gccommitbefore = this.libService.onChangeUnit(tabledata.usedBeforeGc);
        const gccommitafter = this.libService.onChangeUnit(tabledata.usedAfterGc);
        const gcCircle = this.libService.onChangeUnit(tabledata.usedBeforeGc - tabledata.usedAfterGc);
        const gcThreadCount = tabledata.gcThreadCount;
        const gcDuration = tabledata.duration;
        return {
            startTime,
            gcCause,
            gcName,
            gcCommit,
            gccommitbefore,
            gccommitafter,
            gcCircle,
            gcThreadCount,
            gcDuration
        };
    }
    /**
     * 日期格式化
     * @param date date
     * @param fmt fmt
     */
    public dataFormat(date: string, fmt: string): any {
        const getDate = new Date(parseInt(date, 10));
        const o = {
            'h+': getDate.getHours(),
            'm+': getDate.getMinutes(),
            's+': getDate.getSeconds(),
            'q+': Math.floor((getDate.getMonth() + 3) / 3),
            S: this.checkTime(getDate.getMilliseconds())
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

    /**
     * checkTime
     * @param i i
     */
    public checkTime(i: string | number) {
        if (i < 100 && i > 9) {
            i = '0' + i;
        }
        if (i < 10) {
            i = '00' + i;
        }
        return i;
    }

    /**
     * maxData
     * @param data data
     */
    public maxData(data: any[]) {
        if (!data || !data.length) { return 0; }
        return data.sort((a: number, b: number) => b - a)[0];
    }

    /**
     * handleDownload保存数据
     */
    public handleDownloadSave() {
        this.downloadService.downloadItems.gc.tableData = this.data;
        this.downloadService.downloadItems.gc.maxValue.yGcact = this.yGcact;
        this.downloadService.downloadItems.gc.maxValue.yGcstore = this.yGcstore;
        this.downloadService.downloadItems.gc.maxValue.ycGcback = this.ycGcback;
        this.downloadService.downloadItems.gc.maxValue.yGcpause = this.yGcpause;
        this.downloadService.downloadItems.gc.maxValue.yGcthread = this.yGcthread;
        this.downloadService.downloadItems.gc.startDate = this.assetZone;
    }

    /**
     * 组件销毁
     */
    ngOnDestroy(): void {
        this.downloadService.downloadItems.gc.suggestArr = this.suggestArr;
        if (this.isDownload) { return; }
        this.handleDownloadSave();
        this.echarts.clear();
        (this.stompService as any).gcState.unsubscribe();
    }
    /**
     * 搜索
     */
    public searchEvent(event: any): void {
        this.searchKeys[0] = event.key;
        this.searchWords[0] = event.value;

        setTimeout(() => {
            const searchData = this.table.getSearchedResult();
            this.page.total = searchData.length;
        }, 10);
    }
    /**
     * 开启弹框
     */
    public openSuggest() {
        this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
        this.analysis.setTypeTab();
        this.analysis.openSetType();
        this.analysis.show();
    }
    /**
     * 获取当前页面优化建议的Tip数
     */
    public getSuggestTip() {
        this.allSuggestArr = this.downloadService.downloadItems.profileInfo.allSuggestArr;
    }
}
