import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { MytipService } from '../../../service/mytip.service';
import { Router } from '@angular/router';
import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData,
    TiDragService,
    TiTreeNode,
    TiTreeUtil
} from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { COLOR_THEME, VscodeService } from '../../../service/vscode.service';
import * as echarts from 'echarts/core';

@Component({
    selector: 'app-jdbcpool',
    templateUrl: './jdbcpool.component.html',
    styleUrls: ['./jdbcpool.component.scss']
})
export class JdbcpoolComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    @Input() snapShot: boolean;
    @Input() snapShotData: any;
    @ViewChild('draggable', { static: true }) private draggableEle: ElementRef;
    public suggestArr: any[] = [];
    public allSuggestArr: any = [];
    public sugtype = 1;
    constructor(
        private stompService: StompService,
        private router: Router,
        public i18nService: I18nService,
        private downloadService: ProfileDownloadService,
        private msgService: MessageService,
        public mytip: MytipService,
        private vscodeService: VscodeService,
        private dragService: TiDragService
    ) {
        this.i18n = this.i18nService.I18n();
        this.tipStr = this.i18n.jdbcpool.thresholdTip;
        this.tipStr2 = this.i18n.jdbcpool.moreThresholdTip;
        this.typeOptions = [{
            label: this.i18n.jdbcpool.wholeForm,
            value: 'form'
        }, {
            label: this.i18n.jdbcpool.queryView,
            value: 'view'
        }];
        this.typeSelected = {
            label: this.i18n.jdbcpool.wholeForm,
            value: 'form'
        };
    }
    @ViewChild('analysis', { static: false }) analysis: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public threshold = {
        label: '',
        max: 10000,
        min: 10,
        value: 50,
        rangeValue: [10, 10000],
        format: 'N0',
    };
    public tipStr: string;
    public tipStr2: string;
    public i18n: any;
    public beginFileIo = false; // 是否开始分析
    public Threshold: any; // 阈值
    public alertThreshold: any; // 报警阈值
    public typeOptions: any[] = [];
    public typeSelected: any = {};
    public jdbcpoolConfig: any[] = []; // 数据库连接池配置信息
    public isStopFlag = false;
    public connectDatas: any = {};
    public jvmId: any;
    public guardianId: any;
    public tip1Context: any;
    public startBtnDisabled = false;
    private isStopMsgSub: Subscription;
    private snapShotSub: Subscription;
    public isDownload = false;
    public configContext: any;
    public configTitle: any;
    public configTwoInstructions: any;
    // 左侧 表格部分
    public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataTable: TiTableSrcData = {
        data: [],
        state: {
            searched: false,
            sorted: false,
            paginated: false
        }
    };
    private tableData: Array<TiTableRowData> = [];
    public columnsTable: Array<TiTableColumns> = [
        {
            title: '',
        },
        {
            title: 'linkId',
            width: '20%',
            sortKey: 'linkId'
        },
        {
            title: 'linkChart',
            width: '20%',
            sortKey: 'linkChart'
        },
        {
            title: 'beginTime',
            width: '20%',
            sortKey: 'beginTime'
        },
        {
            title: 'endTime',
            width: '20%',
            sortKey: 'endTime'
        },
        {
            title: 'eventCount',
            width: '10%',
            isSort: true,
            sortKey: 'count'
        },
        {
            title: 'eventCostTime',
            width: '10%',
            isSort: true,
            sortKey: 'duration'
        },
    ];
    public closeOtherDetails = true;
    public noDadaInfo = '';
    public totalCount = 1000;
    public thirdLevel = false;
    public expand = false;
    public subrow: any;
    public language: any;
    public isExpandAll = false;
    // 栈
    public stackTranceData: Array<TiTreeNode> = [];
    // 连接池配置参数表格
    public configPoolDisplayed: Array<TiTableRowData> = [];
    public tableDataPool: Array<TiTableRowData> = [];
    public configPoolSrcData: TiTableSrcData;
    public configPoolColumns: Array<TiTableColumns> = [];
    // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
    selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
        this.stackTranceData,
        false,
        false
    );
    public totalCountMonitor: any;
    public stackTranceDataEnd: Array<TiTreeNode> = [];
    // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
    selectedDataEnd: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
        this.stackTranceDataEnd,
        false,
        false
    );
    public poolSuggest: any[] = [];
    public snapCount = 0;
    public snapCountTotal = 5;
    public tipContext: any;
    public spinner = {
        label: '',
        max: 10000,
        min: 0,
        rangeValue: [0, 10000],
        format: 'N0',
    };
    public spinnerValue = 3;
    public data: any[] = [];
    public dataCount = 10;
    public startTime: any = +new Date();
    public categories: any = [];
    public types: any[] = [];
    public seriesData: any = [];  // 原图表数据
    public seriesData1: any = [];  // 处理后的图表数据
    public startDate: any = [];
    public updateOptions: any;
    public connectOwnerThread: any;
    public echartsOption: any = {};

    public jdbcPoolBtnTip: string;
    public noDataMsg: string;
    public timeData: any[] = [];
    public timeData1: any[] = [];
    public indexStart: number;
    public indexEnd: number;
    public xAxisTimeList: any = [];
    public echartsInstance: any = {};
    public expandFlag = false;
    public filePathSelect = '';
    public scrollTop = 0;
    public msgDataLenth = 0;
    private recordsLimit = 50;
    private isAddStartEvent = false;
    private isAddEndEvent = false;
    private timer = 0;  // 获取连接池数据请求次数
    public suggestTimer: any;
    public isLoading: boolean;
    public currentFdTableList: Array<any> = [];
    public currentFdTableListTop: Array<any> = [];  // 展开行的数据
    public jbbcpoolTimeout: any = null;
    public noDataTip: any;
    /**
     * ngOnInit
     */
    ngOnInit() {
        // 获取VSCode当前主题颜色
        if (document.body.className.includes('vscode-light')) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.jdbcpool;
        this.noDataMsg = this.i18n.plugins_perf_java_profileNoData.jdbcPoolNoDataMsg;
        this.configTwoInstructions = this.i18n.jdbcpool.configTwoInstructions;
        this.jdbcPoolBtnTip = this.i18n.jdbcpool.btn_tip;
        this.types = [
            {
                name: this.i18n.jdbcpool.durationTime,
                color: '#75d874'
            },
            {
                name: this.i18n.jdbcpool.durationTime,
                color: '#f45c5e'
            }
        ];

        let backGroundColor;
        let legendTextColor;
        let axisLineColor;
        if (this.currTheme === COLOR_THEME.Light) {
            backGroundColor = '#ffffff';
            legendTextColor = '#222';
            axisLineColor = '#E1E6EE';
        } else {
            backGroundColor = '#424242';
            legendTextColor = '#e8e8e8';
            axisLineColor = '#484A4E';
        }
        this.echartsOption = {
            tooltip: {
                borderWidth: 0,
                position: (point: any, params: any, dom: any, rect: any, size: any) => {
                    // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
                    // 提示框位置
                    let x = 0; // x坐标位置
                    let y = 0; // y坐标位置

                    // 当前鼠标位置
                    const pointX = point[0];
                    const pointY = point[1];

                    // 提示框大小
                    const boxWidth = size.contentSize[0];
                    const boxHeight = size.contentSize[1];
                    const echartsBoxElement = document.querySelector('#boxEchartsId') as HTMLElement;
                    echartsBoxElement.addEventListener('scroll', () => {
                        // 计算滚动高度
                        this.scrollTop = echartsBoxElement.scrollTop;
                    });

                    // boxWidth > pointX 说明鼠标左边放不下提示框
                    if (boxWidth > pointX) {
                        x = pointX + 5;
                    } else { // 左边放的下
                        x = pointX - boxWidth - 5;
                    }

                    // boxHeight > pointY - this.scrollTop 说明鼠标上边放不下提示框
                    if (boxHeight > pointY - this.scrollTop) {
                        y = pointY + 5;
                    } else { // 上边放得下
                        y = pointY - boxHeight - 5;
                    }

                    return [x, y];
                },
                backgroundColor: backGroundColor,
                textStyle: {
                    color: legendTextColor,
                },
                borderRadius: 5,
                padding: [10, 20, 10, 20],
                formatter: (params: any) => {
                    this.onClickTableRow(params.data);
                    return `${params.name[0]}: ${params.value[3]}<br>${params.name[1]}:
                     ${params.data.connectOwnerThread}`;
                }
            },
            legend: {
                itemHeight: 10,
                itemWidth: 10,
                icon: 'rect'
            },
            dataZoom: [{
                type: 'inside',
            }],
            grid: {
                left: 100,
                top: 20,
                right: 60,
            },
            xAxis: [{
                scale: true,
                position: 'top',
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: axisLineColor,
                        width: 2
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: [axisLineColor],
                        width: 1
                    }
                },
                axisLabel: {
                    show: false,
                    formatter: (val: any) => {
                        const date = new Date(val);
                        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                        const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                        const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                        return `${hour}:${min}:${sec}`;
                    }
                }
            }, {
                scale: true,
                position: 'bottom',
                axisTick: {
                    show: false
                },
                axisLabel: {
                    margin: 20,
                    show: false,
                    textStyle: {
                        color: legendTextColor,
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: axisLineColor,
                        width: 2
                    }
                }
            }],
            yAxis: {
                data: this.categories,
                axisLabel: {
                    margin: 60,
                    align: 'center',
                    textStyle: {
                        color: legendTextColor,
                    }
                },
                axisLine: {
                    show: false,
                    color: [axisLineColor]
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: [axisLineColor],
                        width: 1
                    }
                }
            },
            series: [{
                type: 'custom',
                renderItem: this.renderItem,
                itemStyle: {
                    height: 15,
                    opacity: 0.8
                },
                encode: {
                    x: [1, 2],
                    y: 0
                },
                data: []
            }]
        };
        this.timer = 1;
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop'));
        if (!this.snapShot) {
            this.tableData = this.downloadService.downloadItems.jdbcpool.tableData;
            this.alertThreshold = this.downloadService.downloadItems.jdbcpool.alertThreshold;
            this.spinnerValue = this.downloadService.downloadItems.jdbcpool.spinnerValue;
            this.timer = this.downloadService.downloadItems.jdbcpool.time;
            if (this.tableData.length) {
                this.tableData.forEach((e) => {
                    e.showDetails = false;
                });
                setTimeout(() => {
                    this.getConnectDatas(this.tableData);
                }, 100);
            }
        }
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (this.isDownload) {
            this.threshold.value = this.downloadService.downloadItems.jdbcpool.threshold;
            this.alertThreshold = this.downloadService.downloadItems.jdbcpool.alertThreshold;
            this.spinnerValue = this.downloadService.downloadItems.jdbcpool.spinnerValue;
            this.tableData = this.downloadService.downloadItems.jdbcpool.tableData;
            this.startDate = this.downloadService.downloadItems.jdbcpool.monitor.startDate;
            this.jdbcpoolConfig = this.downloadService.downloadItems.jdbcpool.jdbcpoolConfig;
            this.configTitle = this.downloadService.downloadItems.jdbcpool.configTitle;

            const overviewArr: Array<any> = this.downloadService.downloadItems.overview.suggestArr ?
                this.downloadService.downloadItems.overview.suggestArr : [];
            const gcArr: Array<any> = this.downloadService.downloadItems.gc.suggestArr ?
                this.downloadService.downloadItems.gc.suggestArr : [];
            const gclogArr: Array<any> = this.downloadService.downloadItems.gclog.suggestArr ?
                this.downloadService.downloadItems.gclog.suggestArr : [];
            const jdbcpoolArr: Array<any> = this.downloadService.downloadItems.jdbcpool.suggestArr ?
                this.downloadService.downloadItems.jdbcpool.suggestArr : [];
            this.downloadService.downloadItems.profileInfo.allSuggestArr =
               [...overviewArr, ...gcArr, ...gclogArr, ...jdbcpoolArr];
            this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr ?
                this.downloadService.downloadItems.jdbcpool.suggestArr : [];
            this.noDataTip = this.i18n.common_term_task_nodata;
        } else {
            this.threshold.value = this.downloadService.dataSave.jdbcPoolThreshold;
            this.alertThreshold = this.downloadService.dataSave.jdbcPoolAlertThreshold;
            this.spinnerValue = this.downloadService.dataSave.jdbcPoolSpinnerValue;
            this.jdbcpoolConfig = this.downloadService.dataSave.jdbcpoolConfigData;
            this.configTitle = this.downloadService.dataSave.configTitle;
            this.noDataTip = this.i18n.plugins_perf_java_profileNoData.jdbcPoolNoDataMsg;
        }
        this.isExpandAll = this.downloadService.downloadItems.jdbcpool.isExpandAll;
        this.updateOptions = this.downloadService.downloadItems.jdbcpool.echartsData;
        if (this.updateOptions.series) {
            this.categories = this.updateOptions.yAxis.data;
            this.startTime = this.updateOptions.xAxis.data;
            this.seriesData = this.updateOptions.series[0].data;
        }
        if (this.isDownload) {
            this.timeData = this.downloadService.downloadItems.jdbcpool.timeData;
            this.timeData1 = this.timeData;
        }
        // 左侧
        this.configPoolColumns = [
            {
                title: 'key',
                width: '50%'
            },
            {
                title: 'value',
                width: '50%'
            }
        ];
        this.srcDataTable = {
            data: this.tableData,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        if (this.snapShot) {
            if (this.downloadService.downloadItems.jdbcpool.suggestArr.length > 0) {
                this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
                this.getSuggestTip();
            }
            return;
        }
        this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
        this.handleSnapShotCount('jdbcpool');

        this.beginFileIo = this.downloadService.dataSave.isjdbcPoolStart;
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.jvmId = (self as any).webviewSession.getItem('jvmId');
        this.guardianId = (self as any).webviewSession.getItem('guardianId');
        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'isStopPro') {
                this.startBtnDisabled = true;
                this.beginFileIo = false;
                this.clearJpoolTimer();
            }
        });
        // 订阅收集快照消息
        this.snapShotSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'getSnapShot') {
                // 收集快照
                this.doSnap('jdbcpool');
            }
        });
        this.recordsLimit = this.downloadService.dataLimit.pool_form.dataValue;
        setTimeout(() => {
            this.stompService.poolSub = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'dataLimit' && msg.data.name === 'pool_form') {
                    this.recordsLimit = msg.data.value;
                    this.connectDatas = {};
                }
                if (msg.type === 'pool') {
                    if (msg.data) {
                        this.clearJpoolTimer();
                    }
                    this.msgDataLenth = msg.data.length;
                    msg.data.forEach((item: any) => {
                        this.jdbcConnectHandle(item);
                        this.handlePoolData(this.connectDatas);
                    });
                    this.timer++;
                    this.updateDownloadItems();
                    if (!this.isAddStartEvent || !this.isAddEndEvent) {
                        this.addTreeScrollEvent();
                    }
                }
                if (msg.type === 'isRestart' || msg.type === 'isClear' || msg.type === 'isClearOne'
                    || msg.type === this.i18n.protalserver_profiling_tab.jdbcpool) {
                    if (msg.type === 'isRestart') {
                        this.alertThreshold = '';
                        this.startBtnDisabled = false;
                        this.snapCount = 0;
                        this.suggestArr = [];
                        this.clearJpoolTimer();
                    }
                    if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        this.snapCount = 0;
                    }
                    this.stackTranceData = [];
                    this.stackTranceDataEnd = [];
                    this.srcDataTable.data = [];
                    this.tableData = [];
                    this.connectDatas = {};
                }
            });
            this.stompService.updataJdbcSub = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'updata_pool') {
                }
            });
            this.stompService.jdbcPoolSuggest = this.msgService.getMessage().subscribe((msg) => {
                if (msg.type === 'connect-pool-suggest') {
                    this.poolSugg(msg.data);
                }
            });
        }, 1000);
        this.suggestTimer = setInterval(() => {
            if (this.downloadService.downloadItems.jdbcpool.suggestArr.length > 0) {
                this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
                this.getSuggestTip();
            }
        }, 500);
    }
    /**
     * 监听滚动事件
     */
    ngAfterViewInit() {
        this.addTreeScrollEvent();
        if (this.draggableEle && this.draggableEle.nativeElement) {
            this.dragService.create({
                helper: this.draggableEle.nativeElement
            });
        }
    }
    private addTreeScrollEvent() {
        $('.begin-tree .ti3-tree-container').on('scroll', () => {
            this.isAddStartEvent = true;
            if ($('.begin-tree .ti3-tree-container').scrollTop() > 0) {
                $('.begin-tree .ti3-tree-container').addClass('ti-tree-box-shadow');
            } else {
                $('.begin-tree .ti3-tree-container').removeClass('ti-tree-box-shadow');
            }
        });
        $('.end-tree .ti3-tree-container').on('scroll', () => {
            this.isAddEndEvent = true;
            if ($('.end-tree .ti3-tree-container').scrollTop() > 0) {
                $('.end-tree .ti3-tree-container').addClass('ti-tree-box-shadow');
            } else {
                $('.end-tree .ti3-tree-container').removeClass('ti-tree-box-shadow');
            }
        });
    }

    /**
     * 更新数据到导出数据对象
     */
    private updateDownloadItems() {
        this.downloadService.downloadItems.jdbcpool.tableData = this.srcDataTable.data;
        this.downloadService.downloadItems.jdbcpool.echartsData = this.updateOptions;
        this.downloadService.downloadItems.jdbcpool.threshold = this.threshold.value;
        this.downloadService.downloadItems.jdbcpool.alertThreshold = this.alertThreshold;
        this.downloadService.downloadItems.jdbcpool.spinnerValue = this.spinnerValue;
        this.downloadService.downloadItems.jdbcpool.timeData = this.timeData;
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy(): void {
        clearInterval(this.suggestTimer);
        if (this.isDownload || this.snapShot) { return; }
        if (this.snapShotSub) { this.snapShotSub.unsubscribe(); }
        $('.begin-tree .ti3-tree-container').off();
        $('.end-tree .ti3-tree-container').off();
    }

    /**
     * renderItem
     * @param params params
     * @param api api
     */
    public renderItem(params: any, api: any) {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;
        const duration = end[0] - start[0];
        const rectShape = echarts.graphic.clipRectByRect({
            x: start[0],
            y: start[1] - height / 2,
            width: duration > 0 ? duration + 10 : duration,
            height
        }, {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height
        });

        return rectShape && {
            type: 'rect',
            shape: rectShape,
            style: api.style()
        };
    }
    /**
     * handleEchartsHeight
     */
    public handleEchartsHeight() {
        return this.categories.length * 40;
    }
    /**
     * 开启连接池
     */
    public onStartPool() {
        this.isLoading = true;
        if (this.startBtnDisabled) { return; }
        this.beginFileIo = !this.beginFileIo;
        this.isStopFlag = true;
        // 开始接收pool的socket信息
        this.stompService.startStompRequest('/cmd/start-instrument-connect-pool', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.threshold.value * 1000
        });
        this.jbbcpoolTimeout = setTimeout(() => {
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info: this.i18n.profileNodataTip.jdbcpool,
                    type: 'warn'
                }
            };
            this.vscodeService.postMessage(message, null);
        }, 30000);
        this.downloadService.dataSave.jdbcPoolThreshold = this.threshold.value;
        this.downloadService.dataSave.jdbcPoolAlertThreshold = this.alertThreshold;
        this.downloadService.dataSave.jdbcPoolSpinnerValue = this.spinnerValue;
        this.downloadService.dataSave.isjdbcPoolStart = true;
        this.downloadService.dataSave.isAsyncDis = true;
        setTimeout(() => {
            clearInterval(this.stompService.poolTimer);
            this.stompService.poolTimer = null;
        }, this.stompService.poolStep);

        if (this.stompService.poolTimer) {
            this.isStopFlag = false;
            clearInterval(this.stompService.poolTimer);
            this.stompService.poolTimer = null;
        }
        setTimeout(() => {
            this.isLoading = false;  // 获取到链接池数据再执行
        }, 8000);
    }
    /**
     * 关闭连接池
     */
    public onStopPool() {
        this.beginFileIo = !this.beginFileIo;
        this.stompService.startStompRequest('/cmd/stop-instrument-connect-pool', {
            jvmId: this.jvmId,
            guardianId: this.guardianId,
            threshold: this.threshold.value
        });
        this.downloadService.dataSave.jdbcPoolThreshold = this.threshold.value;
        this.downloadService.dataSave.jdbcPoolAlertThreshold = this.alertThreshold;
        this.downloadService.dataSave.jdbcPoolSpinnerValue = this.spinnerValue;
        this.downloadService.dataSave.isjdbcPoolStart = false;
        this.downloadService.dataSave.isAsyncDis = false;
        this.downloadService.dataSave.isCheckAsync = false;
        this.clearJpoolTimer();
        setTimeout(() => {
            if (!this.isStopFlag) {
                this.isStopFlag = true;
                return;
            }
        }, this.stompService.jdbcStep * 2);
    }
    /**
     * 改变二级显示默认数量
     */
    public changeThreshold(value: any) {
        if (!value || value <= 0) {
            this.spinnerValue = 0;
        }
    }
    /**
     * 获取之前返回的数据
     * @param data this.tableData
     */
    getConnectDatas(data: any) {
        for (const item of data) {
            if (!this.connectDatas[item.linkId]) {
                this.connectDatas[item.linkId] = item;
            }
            if (this.categories.indexOf(item.linkId) === -1) {
                // 最新的数据放在数组后面
                this.categories.push(item.linkId);
            }
        }
        this.handlePoolData(this.connectDatas);
    }
    // 连接池计算
    private jdbcConnectHandle(data: any) {
        const connectDatas = JSON.parse(JSON.stringify(this.connectDatas));
        if (!data.connect_) { return; }
        const linkId = data.connect_.physicalsConnectId;
        const sessId = data.connect_.connectId;
        const connectOwnerThread = data.connect_.connectOwnerThread;
        const urlData = data.dbcp_ || data.druid_ || data.c3p0_ || data.hikari_;
        if (this.jdbcpoolConfig.length === 0) {
            this.configTitle = data.attributes_.poolType;
            this.downloadService.downloadItems.jdbcpool.configTitle = this.configTitle;
            this.downloadService.dataSave.configTitle = this.configTitle;
            this.configPool(urlData);
        }
        if (this.categories.indexOf(linkId) === -1) {
            // 最新的数据放在数组后面
            this.categories.push(linkId);
        }
        if (!connectDatas[linkId]) {
            connectDatas[linkId] = {
                linkId,
                sessId: linkId,
                url: urlData.url,
                startTime: '',
                endTime: '',
                count: 0,
                duration: 0,
                connectOwnerThread,
                sessions: {}
            };
        }
        const status = data.connect_.connectStatus;
        if (status === 'close') {
            connectDatas[linkId].count++;
        }
        if (status === 'connect') {
            this.startDate.push(this.handleTimeFormat(data.connect_.connectedTimeMillis));
        }

        const sessObj = connectDatas[linkId].sessions;
        if (!sessObj[sessId]) {
            sessObj[sessId] = {
                sessId,
                startTime: status === 'connect' ? data.connect_.connectedTimeMillis : '',
                endTime: status === 'close' ? data.connect_.connectedTimeMillis : '',
                url: urlData.url,
                count: 0,
                duration: 0,
                status: [],
                stackTraces: [],
                config: {}
            };
        }
        const endTime = sessObj[sessId].endTime;
        const startTime = sessObj[sessId].startTime;
        sessObj[sessId].config = urlData;
        sessObj[sessId].endTime = !endTime && status === 'close' ? data.connect_.connectedTimeMillis : endTime;
        sessObj[sessId].duration = (!sessObj[sessId].endTime || !startTime) ? 0 : sessObj[sessId].endTime - startTime;
        sessObj[sessId].count = status === 'close' ? 1 : 0;
        sessObj[sessId].status.push(status);

        const root = { label: 'root', status, children: [] as any[] };
        sessObj[sessId].stackTraces.push(this.trackFormat(data.allStackTraces_, root));
        connectDatas[linkId].duration += sessObj[sessId].duration;
        this.connectDatas = connectDatas;
    }
    /**
     * 处理连接池数据
     * @param connectDatas connectDatas
     */
    public handlePoolData(connectDatas: any) {
        this.tableData = Object.values(connectDatas);
        this.tableData.forEach((item) => {
            const tableDataValue = Object.values(item.sessions);
            const newTableArr = tableDataValue.slice(0, this.spinnerValue);
            const obj: any = {};
            for (const i of Object.keys(newTableArr)) {
                obj[(newTableArr as any)[i].sessId] = (newTableArr as any)[i];
            }
            item.sessions = obj;
        });
        if (this.categories.length > this.recordsLimit) {  // 取最新的this.recordsLimit条数据
            this.categories.splice(0, this.categories.length - this.recordsLimit);
        }
        if (this.tableData.length <= this.recordsLimit) {
            this.srcDataTable.data = this.tableData;
        } else { // 取最新的this.recordsLimit条数据
            const arr = [];
            for (const id of this.categories) {
                for (const obj of this.tableData) {
                    if (id === obj.linkId) {
                        arr.push(obj);
                        break;
                    }
                }
            }
            this.srcDataTable.data = arr;
        }
        this.seriesData.splice(0, this.seriesData.length);
        // 原表格数据
        (echarts as any).util.each(this.categories, (category: any, index: number) => {
            const physicalsConnectIds = Object.keys(connectDatas);  // linkId数组
            let sessionsArr: any[] = [];
            const sessions = 'sessions';
            if (physicalsConnectIds.indexOf(category) !== -1) {
                sessionsArr = Object.values(connectDatas[category][sessions]);
            }
            sessionsArr.forEach((item) => {
                const typeItem = this.types[0];
                const typeItem1 = this.types[1];
                const baseTime = +item.startTime;
                const endTime = +item.endTime;
                const duration = item.duration;
                const connectOwnerThread = 'connectOwnerThread';
                const connectOwner = connectDatas[category][connectOwnerThread];
                if (duration < this.alertThreshold) {
                    this.seriesData.push({
                        name: [this.i18n.jdbcpool.durationTime, this.i18n.jdbcpool.thread],
                        value: [
                            index,
                            baseTime,
                            endTime,
                            duration
                        ],
                        itemStyle: {
                            normal: {
                                color: typeItem.color
                            }
                        },
                        stackTraces: item.stackTraces,
                        connectOwnerThread: connectOwner
                    });
                } else {
                    this.seriesData.push({
                        name: [this.i18n.jdbcpool.durationTime, this.i18n.jdbcpool.thread],
                        value: [
                            index,
                            baseTime,
                            endTime,
                            duration
                        ],
                        itemStyle: {
                            normal: {
                              color: this.alertThreshold === null || this.alertThreshold === undefined
                                ? typeItem.color : typeItem1.color
                            }
                        },
                        stackTraces: item.stackTraces,
                        connectOwnerThread: connectOwner
                    });
                }
            });
        });

        this.seriesData1.splice(0, this.seriesData1.length);
        // 获取显示处理后的系列数据seriesData1
        (echarts as any).util.each(this.categories, (category: any, index: number) => {
            const physicalsConnectIds = Object.keys(connectDatas);  // linkId数组
            let sessionsArr: any[] = [];
            const sessions = 'sessions';
            if (physicalsConnectIds.indexOf(category) !== -1) {
                sessionsArr = Object.values(connectDatas[category][sessions]);
            }
            let time = 0;  // 同一行的矩形方块间隔
            sessionsArr.forEach((item, i) => {
                const typeItem = this.types[0];
                const typeItem1 = this.types[1];
                const duration = item.duration;
                let baseTime = 0;
                let endTime = 0;
                // 两个报警阈值发生时间间隔在100微秒以内，方块之间加time间隙，避免方块发生重叠
                if (i > 0 && duration > 0 && item.startTime - sessionsArr[i - 1].endTime < 100) {
                    baseTime = +item.startTime + time;
                    endTime = +item.endTime + time;
                } else {
                    baseTime = item.startTime;
                    endTime = item.endTime;
                }
                const connectOwnerThread = 'connectOwnerThread';
                const connectOwner = connectDatas[category][connectOwnerThread];
                if (duration < this.alertThreshold) {
                    this.seriesData1.push({
                        name: [this.i18n.jdbcpool.durationTime, this.i18n.jdbcpool.thread],
                        value: [
                            index,
                            baseTime,
                            endTime,
                            duration
                        ],
                        itemStyle: {
                            normal: {
                                color: typeItem.color
                            }
                        },
                        stackTraces: item.stackTraces,
                        connectOwnerThread: connectOwner
                    });
                } else {
                    this.seriesData1.push({
                        name: [this.i18n.jdbcpool.durationTime, this.i18n.jdbcpool.thread],
                        value: [
                            index,
                            baseTime,
                            endTime,
                            duration
                        ],
                        itemStyle: {
                            normal: {
                                color: this.alertThreshold === null || this.alertThreshold === undefined
                                  ? typeItem.color : typeItem1.color
                            }
                        },
                        stackTraces: item.stackTraces,
                        connectOwnerThread: connectOwner
                    });
                }
                if (duration > 0) {
                    time += this.timer * 100;
                }
            });
        });
        // 更新echarts参数
        const xAxis1 = {
            data: this.startTime,
            axisLabel: {
                interval: this.xAxisTimeList.length < 11 ? 0 : Math.floor((this.xAxisTimeList.length / 11))
            }
        };
        const yAxis1 = {
            data: this.categories
        };
        const series1 = [
            {
                data: this.seriesData1
            }
        ];
        this.updateOptions = {
            xAxis: xAxis1,
            yAxis: yAxis1,
            series: series1
        };
        this.downloadService.downloadItems.jdbcpool.echartsData = this.updateOptions;
        this.downloadService.downloadItems.jdbcpool.time = this.timer;
        const chart = document.getElementById('echartId');
        if (this.categories.length > 11) {
            chart.style.height = `${this.categories.length * 40}px`;
        }
        const timeNow = +new Date();
        this.xAxisTimeList.push(this.timeFormat(timeNow));
        this.getxAxisTimeList();
    }

    private getxAxisTimeList() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const nyr: string = now.getFullYear() + '-' + month + '-' + now.getDate() + ' ';
        const startTime: string = nyr + this.xAxisTimeList[0];
        const endTime: string = nyr + this.xAxisTimeList[this.xAxisTimeList.length - 1];
        const startTimestamp = new Date(startTime).getTime();
        const endTimestamp = new Date(endTime).getTime();
        // 时间跨度最大为10分钟
        if (endTimestamp - startTimestamp > 60 * 10 * 1000) {
            this.xAxisTimeList.splice(0, this.msgDataLenth - 1);  // 删除前面的数据
        }
        this.buildTimeLine(this.xAxisTimeList);
    }
    private trackFormat(stackTrack: any, theTree: any) {
        let node = theTree;
        stackTrack.forEach((item: any) => {
            node.children = node.children || [];
            const label = item.className_ + '.' + item.methodName_ + ' ' + item.lineNum_;
            const obj = {
                label,
                children: [] as any[]
            };
            node.children.push(obj);
            node = obj;
        });
        return JSON.parse(JSON.stringify(theTree));
    }
    /**
     * 展开行
     */
    public beforeToggle(row: TiTableRowData): void {
        this.srcDataTable.data.forEach((e) => {
            if (row.linkId !== e.linkId) {
                e.showDetails = false;
            }
        });
        this.currentFdTableList = [];
        this.currentFdTableListTop = [];
        const sessionsArr = Object.values(row.sessions);
        this.currentFdTableList = sessionsArr.sort((a: any, b: any) => {
            return b.count - a.count;
        });
        this.currentFdTableListTop = this.currentFdTableList.slice(0, this.spinnerValue);
        row.showDetails = !row.showDetails;
    }
    /**
     * 点击表格某行
     * @param row row
     */
    public onClickTableRow(row: any) {
        if (this.subrow) {
            this.subrow.isSelect = false;
        }
        this.subrow = row;
        this.subrow.isSelect = true;
        this.filePathSelect = row.sessId;
        this.stackTranceData = [];
        this.stackTranceDataEnd = [];
        row.stackTraces.forEach((stack: any) => {
            if (stack.status !== 'close') {
                this.stackTranceData = this.handleSelectedTreeData(stack.children);
            } else {
                this.stackTranceDataEnd = this.handleSelectedTreeData(stack.children);
            }
        });
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
    /**
     * 在展开整个树
     * @param row row
     */
    public expandAllNode(row: TiTableRowData, index: number) {
        if (row.expanded) {
            return;
        }
        let treeData;
        if (!index) {
            treeData = this.stackTranceData;
        } else {
            treeData = this.stackTranceDataEnd;
        }
        const data: Array<TiTreeNode> = treeData.concat();
        TiTreeUtil.traverse(data, traverseFn);
        function traverseFn(node: TiTreeNode): void {
            node.expanded = true;
        }
        if (!index) {
            this.stackTranceData = data;
        } else {
            this.stackTranceDataEnd = data;
        }
    }
    /**
     * configPool
     * @param values values
     */
    public configPool(values: any) {
        const data = [];
        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const element = values[key];
                const obj = {
                    label: key,
                    value: element || '--'
                };
                data.push(obj);
            }
        }
        this.jdbcpoolConfig = data;
        this.downloadService.downloadItems.jdbcpool.jdbcpoolConfig = this.jdbcpoolConfig;
        this.downloadService.dataSave.jdbcpoolConfigData = this.jdbcpoolConfig;
        this.updateJdbcpoolConfig();
    }

    /**
     * poolSugg
     * @param values values
     */
    public poolSugg(value: any) {
        if (value) {
            this.jdbcpoolConfig.forEach((item) => {
                if (value.configKey === item.label) {
                    item.expected = value.expected;
                    item.descInfo = value.descInfo;
                    const detailAll: any[] = [];
                    const detailArr = value.detail.split(';').slice(0, -1);
                    detailArr.forEach((itemLocal: any) => {
                        const keyArr = itemLocal.split(':');
                        detailAll.push({
                            key: keyArr[0],
                            value: keyArr[1]
                        });
                    });
                    item.detail = detailAll;
                }
            });
            this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
            this.updateJdbcpoolConfig();
        }
    }
    /**
     * 更新数据库连接池配置信息
     */
    private updateJdbcpoolConfig() {
        this.msgService.sendMessage({
            type: 'updateJdbcpoolConfig',
            config: {
                configTitle: this.configTitle,
                jdbcpoolConfig: this.jdbcpoolConfig
            }
        });
    }
    /**
     * onControlAnalysis
     * @param values values
     */
    public onControlAnalysis() {
        if (this.snapShot) { return; }
        if (!this.beginFileIo) {
            this.onStartPool();
        } else {
            this.onStopPool();
        }
    }
    /**
     * handleEventCount
     * @param values values
     */
    public handleEventCount(row: any) {
        let total = 0;
        if (row.children) {
            row.children.forEach((item: any) => {
                return total += +item.eventCount;
            });
        }
        return total;
    }
    /**
     * handleEventCostTime
     * @param row row
     */
    public handleEventCostTime(row: any) {
        let total = 0;
        if (row.children) {
            row.children.forEach((item: any) => {
                return total += +item.eventCostTime;
            });
        }
        return total;
    }

    /**
     * onSelect
     */
    public onSelect(): void {
        // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
        this.selectedData = TiTreeUtil.getSelectedData(
            this.stackTranceData,
            false,
            false
        );
    }

    /**
     * timeFormat
     * @param time time
     */
    public timeFormat(time: any) {
        const date = new Date(+time);
        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return `${hour}:${min}:${sec}`;
    }
    /**
     * handleTimeFormat
     * @param time time
     */
    public handleTimeFormat(time: any) {
        if (!time) {
            return '--';
        }
        const date = new Date(+time);
        const year = date.getFullYear();
        const month = +date.getMonth() + 1;
        const months = month < 10 ? '0' + month : month;
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        const misec = date.getMilliseconds();
        return `${year}:${months}:${day} ${hour}:${min}:${sec}.${misec}`;
    }
    /**
     * handleViewData
     * @param values values
     */
    public handleViewData(values: any) {
        return Object.values(values);
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
     * @param type type
     */
    public doSnap(type: any) {
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
        if (this.snapCount < this.snapCountTotal) {
            const tableTop = this.srcDataTable.data.sort(this.compare('count'));
            const nowTime = this.getSnapTime();
            const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
                JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
            if (!snapShot[type]) {
                snapShot[type] = {
                    label: this.i18n.protalserver_profiling_tab.jdbcpool,
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
                        config: this.jdbcpoolConfig,
                        snapCount: this.snapCount + 1,
                        threshold: this.threshold.value,
                        alertThreshold: this.alertThreshold,
                        spinnerValue: this.spinnerValue,
                        configTitle: this.configTitle,
                        allSuggestArr: this.allSuggestArr,
                        timeData: this.timeData,
                        timer: this.timer,  // 次数
                        updateOptions: this.updateOptions,
                        xAxis: {
                            data: this.startTime,
                            axisLabel: {
                                interval: this.xAxisTimeList.length < 11 ?
                                    0 : Math.floor((this.xAxisTimeList.length / 11))
                            }
                        },
                        yAxis: {
                            data: this.categories
                        },
                        series: [
                            {
                                data: this.seriesData
                            }
                        ]
                    }
                }
            );
            this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
            this.downloadService.downloadItems.snapShot.data = snapShot;
            this.downloadService.downloadItems.jdbcpool.snapCount = this.snapCount + 1;
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.vscodeService.showTuningInfo(this.i18n.snapshot_success_alert, 'info', 'ioSnapshot');
            } else {
                this.showInfoBox(this.i18n.snapshot_success_alert, 'info');
            }
        }
        this.handleSnapShotCount(type);
        // 更新快照次数
        this.msgService.sendMessage({
            type: 'getSnapShotCount',
        });
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
     * handleSnapShotCount
     * @param type type
     */
    public handleSnapShotCount(type: any) {
        this.snapCount = this.downloadService.downloadItems[type].snapCount;
    }
    /**
     * importSnapData
     * @param snapShotData snapShotData
     */
    public importSnapData(snapShotData: any) {
        this.snapCount = snapShotData.snapCount;
        this.threshold.value = snapShotData.threshold;
        this.alertThreshold = snapShotData.alertThreshold;
        this.spinnerValue = snapShotData.spinnerValue;
        this.srcDataTable.data = snapShotData.file;
        this.srcDataTable.data.forEach((e) => {
            e.showDetails = false;
        });
        this.jdbcpoolConfig = snapShotData.config;
        this.configTitle = snapShotData.configTitle;
        this.allSuggestArr = snapShotData.allSuggestArr;
        this.timeData = snapShotData.timeData;
        this.timeData1 = this.timeData;
        this.updateOptions = snapShotData.updateOptions;
        setTimeout(() => {
            const chart = document.getElementById('echartId');
            const categories = this.updateOptions.yAxis.data.length;
            if (categories > 11) {
                chart.style.height = `${categories * 40}px`;
            }
        }, 300);
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
    /**
     * 设置echarts实例
     */
    public onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.indexStart = params.batch[0].start;
            this.indexEnd = params.batch[0].end;
            this.getBottomTime(params.batch[0].start, params.batch[0].end);
            this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
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
        this.indexStart = data.start;
        this.indexEnd = data.end;
        this.getBottomTime(data.start, data.end);
    }
    private buildTimeLine(data: any) {
        const arr = [];
        const interval = this.updateOptions.xAxis.axisLabel.interval;
        for (let i = 0; i < 11; i++) {
            let index = (interval + 1) * i;
            if (index >= data.length) {
                index = data.length - 1;
            }
            arr.push(data[index]);
        }
        this.timeData = arr;
        this.getBottomTime(this.indexStart, this.indexEnd);
    }
    /**
     * 表格展开操作
     */
    public expandTable() {
        this.expandFlag = !this.expandFlag;
    }
    /**
     * 获取echarts底部的时间轴
     * @param start 时间轴开始位置
     * @param end 时间轴结束位置
     */
    private getBottomTime(start: number, end: number) {
        if (this.indexStart === undefined || this.indexEnd === undefined) {
            this.timeData1 = this.timeData;
            return;
        } else {
            const unit = 100 / 18;
            let indexStart: number;
            let indexEnd: number;
            if (start === 0) {
                indexStart = start;
            } else {
                indexStart = ((start / unit) + 1) / 2 + 1;
            }
            if (end === 100) {
                indexEnd = this.timeData.length;
            } else {
                indexEnd = ((end / unit) + 1) / 2 + 1;
            }
            this.timeData1 = this.timeData.slice(indexStart, indexEnd);
        }
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
    /**
     * 清除定时器
     */
    public clearJpoolTimer() {
        clearTimeout(this.jbbcpoolTimeout);
        this.jbbcpoolTimeout = null;
    }

}
