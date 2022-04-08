import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { MytipService } from '../../service/mytip.service';
import { TiTreeNode, TiValidators } from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import { I18nService } from '../../service/i18n.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { Router } from '@angular/router';
import { Utils } from './../../service/utils.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
import { KeyFunction } from '../../service/lib.service';
import { LibService } from '../../service/lib.service';
import { TreeGraph } from './tree';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import {
    FormBuilder,
    FormControl,
    FormGroup,
} from '@angular/forms';
@Component({
    selector: 'app-profile-http',
    templateUrl: './profile-http.component.html',
    styleUrls: ['./profile-http.component.scss']
})
export class ProfileHttpComponent implements OnInit, OnDestroy {
    @Input() snapShot: boolean;
    @Input() snapShotData: any;
    @ViewChild('requestEchart', { static: false }) requestEchart: any;
    @ViewChild('aveTimeEchart', { static: false }) aveTimeEchart: any;
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    constructor(
        private stompService: StompService,
        private msgService: MessageService,
        public i18nService: I18nService,
        private downloadService: ProfileDownloadService,
        public fb: FormBuilder,
        public regularVerify: RegularVerify,
        private router: Router,
        public mytip: MytipService,
        public vscodeService: VscodeService,
        public libService: LibService
    ) {
        this.i18n = this.i18nService.I18n();
        this.echartDatas.keys = [
            {
                label: this.i18n.protalserver_profiling_http.request,
                unit: this.i18n.common_term_jdbc_times
            },
            {
                label: this.i18n.protalserver_profiling_http.average_exec_time,
                unit: ' ms'
            }
        ];
        this.httpGroup = fb.group({
            http_threshold: new FormControl(50, {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(0),
                    TiValidators.maxValue(10000),
                ],
                updateOn: 'change',
            }),
        });
    }
    i18n: any;
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    // sampling配置
    public httpGroup: FormGroup;
    public httpBlur: SpinnerBlurInfo;
    public timeData: any[] = []; // 时间轴数据
    public timeLine = {
        start: 0,
        end: 100
    };
    public isDoSnapClick = true; // 防止重复点击
    public requestUpdateOptions: any = {};
    public aveTimeUpdateOptions: any = {};
    private groupId: any;
    public stompClient: any;
    public canInput = true;
    public jvmId = '';
    public guardianId = '';
    private isStopMsgSub: Subscription;
    private isHttpSnap: Subscription;
    public startBtnDisabled: boolean;
    // true为展开，false为折叠
    public unfoldedFlag = false;
    public tip1Context: any;
    public isStart = true;
    public currentTabName = '';
    public httpTreeData: Array<TiTreeNode> = [];
    public httpTabs = [
        {
            label: 'hot_spots',
            name: 'hot',
            selected: true
        },
        {
            label: 'real_time',
            name: 'real',
            selected: false
        }
    ];
    public treeHeight = '300px';
    public count = 1;
    public step = 3000;

    // echart表grid配置项
    public echartGridRight = 24;

    public updateOptions: any;
    public startDate = '';
    public echartItems = ['request', 'aveTime'];
    public echartDatas: any = {
        request: [],
        aveTime: [],
        keys: [],
        label: ['request', 'aveTime'],
        time: [],
        gridHeight: 100
    };
    public requestEchartDatas: any = {
        request: [],
        keys: [],
        label: ['request'],
        time: []
    };
    public aveTimeEchartDatas: any = {
        aveTime: [],
        keys: [],
        label: ['aveTime'],
        time: []
    };
    public threshold = {
        label: '',
        max: 10000,
        min: 0,
        value: 50,
        rangeValue: [0, 10000],
        format: 'N0',
    };

    public treeDataCached: Array<any> = [];
    public cachedTimer: any = null;

    private isStopFlag = true;

    public isDownload = false;
    public snapCount: number;
    public httpBtnTip = '';
    public httpThresholdTip = '';
    private keyFunction = new KeyFunction();

    public limitTime = 3;
    public httpTimeout: any = null;
    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        this.snapCount = this.downloadService.downloadItems.http.snapCount;
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.httpRequest;
        this.setSpinnerBlur();
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.requestEchartDatas.keys = [
            {
                label: this.i18n.protalserver_profiling_http.request,
                unit: this.i18n.common_term_jdbc_times
            }
        ];
        this.aveTimeEchartDatas.keys = [
            {
                label: this.i18n.protalserver_profiling_http.average_exec_time,
                unit: ' ms'
            }
        ];
        this.groupId = Utils.generateConversationId(12);
        this.threshold.label = this.i18n.protalserver_profiling_http_threshold;
        this.httpBtnTip = this.i18n.protalserver_profiling_http.btn_tip;
        this.httpThresholdTip = this.i18n.protalserver_profiling_http_threshold_tip;
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop'));
        this.httpTreeData.push({
            label: 'Hot URL',
            children: [],
            expanded: false
        });
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        this.getCurrentTab();
        if (this.snapShot) { return; }
        this.httpGroup.controls.http_threshold.setValue(this.downloadService.dataSave.httpThreshold);
        this.isStart = this.downloadService.dataSave.isHttpStart;

        this.isHttpSnap = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'isHttp') {
                this.doSnap('http');
            }
        });
        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'isStopPro') {
                this.isStart = false;
                this.startBtnDisabled = true;
                this.clearHttpTimer();
            }
        });

        if (this.isStart) {
            this.canInput = false;
        }

        if (this.downloadService.downloadItems.http.hotspot.length !== 0) {
            this.httpTreeData = this.downloadService.downloadItems.http.hotspot;
        }
        this.mapDownlaodEcharts(this.downloadService.downloadItems.http.monitor.data);

        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (this.isDownload) {
            this.httpGroup.controls.http_threshold.setValue(this.downloadService.downloadItems.http.threshold);
            this.startDate = this.downloadService.downloadItems.http.monitor.startDate;
            return;
        }

        let startTime = 0;
        setTimeout(() => {
            this.stompService.httpSub = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'http') {
                    if (msg.data) {
                        this.clearHttpTimer();
                    }
                    const tree = msg.data.tree;
                    this.treeDataCached = [tree];
                    if (this.httpTreeData[0].children.length === 0) {
                        this.httpTreeData[0].children = JSON.parse(JSON.stringify(this.treeDataCached));
                    }
                }
                if (msg.type === 'isRestart') {
                    this.startBtnDisabled = false;
                    this.httpGroup.controls.http_threshold.setValue(50);
                    this.snapCount = 0;
                    this.initData();
                }
                if (msg.type === 'isClear' || msg.type === 'isClearOne' ||
                    msg.type === this.i18n.protalserver_profiling_tab.httpRequest) {
                    if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        this.snapCount = 0;
                    }
                    this.initData();
                }
            });

            this.limitTime = this.downloadService.dataLimit.http.timeValue;
            this.stompService.updataHttpSub = this.msgService
                .getMessage()
                .subscribe((msg) => {
                    if (msg.type === 'updata_http') {
                        if (startTime === 0) {
                            startTime = msg.data.endTime;
                        }
                        this.updateData(msg.data);
                        this.updateDownloadItems();
                    }

                    if (msg.type === 'dataLimit' && msg.data.name === 'http') {
                        this.limitTime = msg.data.value;
                        Object.keys(this.requestEchartDatas).forEach((item) => {
                            this.requestEchartDatas[item] = [];
                        });
                        Object.keys(this.aveTimeEchartDatas).forEach((item) => {
                            this.aveTimeEchartDatas[item] = [];
                        });
                    }
                });
        }, 1000);
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.httpBlur = {
            control: this.httpGroup.controls.http_threshold,
            min: 0,
            max: 10000,
        };
    }

    /**
     * 微调器回填
     */
    public verifySpinnerValue(value: any) {
        this.regularVerify.setSpinnerInfo(value);
    }
    // 初始化
    private initData() {
        this.stompService.treeGraph = new TreeGraph(null);
        this.echartDatas.time = [];
        this.startDate = '';
        for (const key in this.requestEchartDatas) {
            if (Object.prototype.hasOwnProperty.call(this.requestEchartDatas, key)) {
                this.requestEchartDatas[key] = [];
            }
        }
        for (const key in this.aveTimeEchartDatas) {
            if (Object.prototype.hasOwnProperty.call(this.aveTimeEchartDatas, key)) {
                this.aveTimeEchartDatas[key] = [];
            }
        }
        this.stompService.httpSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'isClear') {
                this.downloadService.downloadItems.http = {
                    threshold: 50,
                    snapCount: 0,
                    hotspot: [],
                    monitor: {
                        startDate: '',
                        data: {}
                    },
                };
            }
            this.echartDatas.time = [];
            this.startDate = '';
            for (const key in this.requestEchartDatas) {
                if (Object.prototype.hasOwnProperty.call(this.requestEchartDatas, key)) {
                    this.requestEchartDatas[key] = [];
                }
            }
            for (const key in this.aveTimeEchartDatas) {
                if (Object.prototype.hasOwnProperty.call(this.aveTimeEchartDatas, key)) {
                    this.aveTimeEchartDatas[key] = [];
                }
            }
        });
        this.httpTreeData = [];
        this.httpTreeData.push({
            label: 'Hot URL',
            children: [],
            expanded: false
        });
        this.treeDataCached = [];
        this.httpTreeData[0].children = JSON.parse(JSON.stringify(this.treeDataCached));

        this.mapDownlaodEcharts(this.downloadService.downloadItems.http.monitor.data);
    }
    private mapDownlaodEcharts(data: any) {
        const keys = Object.keys(data);
        this.echartDatas.time = JSON.parse(JSON.stringify(keys));
        this.requestEchartDatas.time = JSON.parse(JSON.stringify(keys));
        this.aveTimeEchartDatas.time = JSON.parse(JSON.stringify(keys));
        this.timeData = this.echartDatas.time;
        keys.forEach((key) => {
            this.echartDatas.request.push(data[key].averCount);
            this.echartDatas.aveTime.push(data[key].averTime);
            this.requestEchartDatas.request.push(data[key].averCount);
            this.aveTimeEchartDatas.aveTime.push(data[key].averTime);
        });
        this.requestUpdateOptions = {
            series: [{ data: this.requestEchartDatas.request }],
            xAxis: [{ data: this.requestEchartDatas.time }],
            groupId: this.groupId,
        };
        this.aveTimeUpdateOptions = {
            series: [{ data: this.aveTimeEchartDatas.aveTime }],
            xAxis: [{ data: this.aveTimeEchartDatas.time }],
            groupId: this.groupId,
        };
    }

    private refreshTree() {
        this.cachedTimer = setInterval(() => {
            this.httpTreeData[0].children = JSON.parse(JSON.stringify(this.treeDataCached));
        }, 10000);
    }

    /**
     * 将数据更新到导出数据对象中
     */
    private updateDownloadItems() {
        this.downloadService.downloadItems.http.hotspot = JSON.parse(JSON.stringify(this.httpTreeData));
        this.downloadService.downloadItems.http.monitor.data = this.handleDownloadData();
        this.downloadService.downloadItems.http.monitor.startDate = this.startDate;
        this.downloadService.downloadItems.http.threshold = this.httpGroup.controls.http_threshold.value;
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy(): void {
        if (this.isDownload || this.snapShot) { return; }
        this.downloadService.dataSave.isHttpStart = this.isStart;

        if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
        if (this.isHttpSnap) { this.isHttpSnap.unsubscribe(); }
        if (this.stompService.httpSub) { this.stompService.httpSub.unsubscribe(); }
        if (this.stompService.updataHttpSub) { this.stompService.updataHttpSub.unsubscribe(); }
    }
    private updateData(data: any) {
        this.startDate = this.dateFormat(data.endTime, 'yyyy-MM-dd');
        const series: any[] = [];
        const xAxis: any[] = [];
        const requestSeries: any[] = [];
        const requestXAxis: any[] = [];
        const aveTimeSeries: any[] = [];
        const aveTimeXAxis: any[] = [];
        const endTime = this.dateFormat(data.endTime, 'hh:mm:ss');
        // 服务器每3秒推送一条数据，那么一分钟就是20条数据，限制数据条数到指定分钟内
        let outNumber = this.echartDatas.request.length - 20 * this.limitTime;
        if (outNumber > 0) { this.echartDatas.time.splice(0, outNumber); }
        this.echartDatas.time.push(endTime);
        this.timeData = this.echartDatas.time;
        if (this.timeLineDetail) {
            this.timeLineDetail.setTimeData(this.timeData);
        }
        outNumber = this.requestEchartDatas.request.length - 20 * this.limitTime;
        if (outNumber > 0) { this.requestEchartDatas.time.splice(0, outNumber); }
        this.requestEchartDatas.time.push(endTime);
        outNumber = this.aveTimeEchartDatas.aveTime.length - 20 * this.limitTime;
        if (outNumber > 0) { this.aveTimeEchartDatas.time.splice(0, outNumber); }
        this.aveTimeEchartDatas.time.push(endTime);

        this.echartItems.forEach((item) => {
            outNumber = this.echartDatas[item].length - 20 * this.limitTime;
            if (outNumber > 0) { this.echartDatas[item].splice(0, outNumber); }
            this.echartDatas[item].push(data[item]);

            series.push({
                data: this.echartDatas[item]
            });
            xAxis.push({
                data: this.echartDatas.time
            });
            if (this.requestEchartDatas[item]) {
                outNumber = this.requestEchartDatas[item].length - 20 * this.limitTime;
                if (outNumber > 0) {
                    this.requestEchartDatas[item].splice(0, outNumber);
                }
                this.requestEchartDatas[item].push(data[item]);
                requestSeries.push({
                    data: this.requestEchartDatas[item]
                });
                requestXAxis.push({
                    data: this.requestEchartDatas.time
                });
            }

            if (this.aveTimeEchartDatas[item]) {
                outNumber = this.aveTimeEchartDatas[item].length - 20 * this.limitTime;
                if (outNumber > 0) {
                    this.aveTimeEchartDatas[item].splice(0, outNumber);
                }
                this.aveTimeEchartDatas[item].push(data[item]);
                aveTimeSeries.push({
                    data: this.aveTimeEchartDatas[item]
                });
                aveTimeXAxis.push({
                    data: this.aveTimeEchartDatas.time
                });
            }
        });

        this.updateOptions = {
            series,
            xAxis
        };

        this.requestUpdateOptions = {
            series: requestSeries,
            xAxis: requestXAxis,
            groupId: this.groupId
        };
        this.aveTimeUpdateOptions = {
            series: aveTimeSeries,
            xAxis: aveTimeXAxis,
            groupId: this.groupId
        };
    }

    /**
     * 时间轴变化数据改变
     */
    public timeLineData(event: any) {
        this.timeLine = event;
        this.requestEchart.upDateTimeLine(event);
        this.aveTimeEchart.upDateTimeLine(event);
    }

    /**
     * 数据筛选时间轴改变
     */
    public dataZoom(e: any) {
        this.timeLineDetail.dataConfig(e);
    }

    /**
     * 启动分析HTTP请求
     */
    startHttp() {
        if (this.startBtnDisabled || this.snapShot) { return; }
        this.isStopFlag = true;
        this.stompService.startStompRequest(
            '/cmd/start-instrument-http',
            {
                jvmId: this.jvmId,
                guardianId: this.guardianId,
                threshold: this.httpGroup.controls.http_threshold.value * 1000
            }
        );
        this.stompService.handleStartHttp(
            '/cmd/start-instrument-http',
            {
                jvmId: this.jvmId,
                guardianId: this.guardianId,
                threshold: this.httpGroup.controls.http_threshold.value * 1000
            }
        );
        this.httpTimeout = setTimeout(() => {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.profileNodataTip.http,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }, 30000);
        this.isStart = true;
        this.canInput = false;
        this.downloadService.dataSave.httpThreshold = this.httpGroup.controls.http_threshold.value;
        this.downloadService.dataSave.isHttpStart = true;

        // 启动http分析时，将停止jdbc分析
        this.downloadService.dataSave.isJdbcStart = false;
        this.downloadService.dataSave.isCassStart = false;
        this.downloadService.dataSave.isHbaseStart = false;
        this.downloadService.dataSave.isMongodbStart = false;
        setTimeout(() => {
            clearInterval(this.stompService.jdbcTimer);
            this.stompService.jdbcTimer = null;
            clearInterval(this.stompService.cassTimer);
            this.stompService.cassTimer = null;
            clearInterval(this.stompService.hbaseTimer);
            this.stompService.hbaseTimer = null;
            clearInterval(this.stompService.mdbTimer);
            this.stompService.mdbTimer = null;
        }, this.stompService.jdbcStep);

        if (this.stompService.httpTimer) {
            this.isStopFlag = false;
            clearInterval(this.stompService.httpTimer);
            this.stompService.httpTimer = null;
        }
        this.refreshTree();
        this.stompService.httpTimer = setInterval(() => {
            this.stompService.httpUpdata();
        }, this.stompService.httpStep);
    }

    /**
     * 停止分析HTTP请求
     */
    stopHttp() {
        this.stompService.startStompRequest('/cmd/stop-instrument-http', {
            jvmId: this.jvmId,
            guardianId: this.guardianId
        });
        this.isStart = false;
        this.canInput = true;
        this.downloadService.dataSave.isHttpStart = false;
        this.clearHttpTimer();
        if (!this.isStopFlag) {
            this.isStopFlag = true;
            return;
        }
        clearInterval(this.stompService.httpTimer);
        this.stompService.httpTimer = null;
        clearInterval(this.cachedTimer);
        this.cachedTimer = null;

    }

    private handleDownloadData() {
        const downloadData: any = {};
        this.echartDatas.time.forEach((item: any, idx: number) => {
            downloadData[item] = {
                averTime: this.echartDatas.aveTime[idx],
                averCount: this.echartDatas.request[idx]
            };
        });
        return downloadData;
    }

    /**
     * toggleTab
     */
    toggleTab(index: any) {
        this.httpTabs.forEach((tab) => {
            tab.selected = false;
        });
        this.httpTabs[index].selected = true;
        this.getCurrentTab();
    }

    private getCurrentTab() {
        this.currentTabName = this.httpTabs.find((tab) => {
            return tab.selected;
        }).name;
    }

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
     * 快照点击事件
     */
    public doSnap(type: any) {
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
     * 快照执行函数
     */
    public doSnapFn(type: any) {
        if (this.isDownload) { return; }
        if (this.httpTreeData[0].children.length < 1) {
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
            const tableTop = this.httpTreeData[0].children;
            const nowTime = this.libService.getSnapTime();
            const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
                JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
            if (!snapShot[type]) {
                snapShot[type] = {
                    label: this.i18n.protalserver_profiling_tab.httpRequest,
                    type,
                    children: [],
                };
            }
            snapShot[type].children.push(
                {
                    label: nowTime,
                    type,
                    value: {
                        file: tableTop,
                        threshold: this.httpGroup.controls.http_threshold.value,
                        snapCount: this.snapCount + 1,
                        echarts: {
                            startDate: this.startDate,
                            data: this.handleDownloadData()
                        }
                    }
                }
            );
            this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
            this.downloadService.downloadItems.snapShot.data = snapShot;
            this.downloadService.downloadItems.http.snapCount = ++this.snapCount;
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.snapshot_success_alert, 'info', 'ioSnapshot');
            }
            this.showInfoBox(this.i18n.snapshot_success_alert, 'info');
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
     * 快照数据回填
     */
    public importSnapData(snapShotData: any) {
        this.httpTreeData[0].children = snapShotData.file;
        this.isStart = false;
        this.startDate = snapShotData.echarts.startDate;
        this.snapCount = snapShotData.snapCount;
        setTimeout(() => {
            this.httpGroup.controls.http_threshold.setValue(snapShotData.threshold);
        }, 200);
        this.mapDownlaodEcharts(snapShotData.echarts.data);
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
    /**
     * 点击展开和收起树节点
     */
    public operateTreeNode() {
        this.unfoldedFlag = !this.unfoldedFlag;
        if (this.unfoldedFlag) {
            this.treeHeight = '540px';
        } else {
            this.treeHeight = '300px';
        }
    }

    /**
     * 监听键盘事件，上下左右
     */
    public keybordFun() {
        this.keyFunction.keybordFun();
    }
    /**
     * 取消定时器
     */
    public clearHttpTimer() {
        clearTimeout(this.httpTimeout);
        this.httpTimeout = null;
    }

}
