import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  Input,
  ChangeDetectorRef, NgZone
} from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { I18nService } from '../../service/i18n.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
import { TiTreeNode, TiModalService, TiTreeUtil, TiDragService, TiValidationConfig } from '@cloud/tiny3';
import { Utils } from '../../service/utils.service';
import { EventManager } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import * as echarts from 'echarts/core';

@Component({
    selector: 'app-profile-thread',
    templateUrl: './profile-thread.component.html',
    styleUrls: ['./profile-thread.component.scss'],
})
export class ProfileThreadComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() offlineThreadDump: boolean; // 是否是从离线报告，内存转储进入
    @Input() offlineThreadDumpId: string;
    constructor(
        private stompService: StompService,
        public i18nService: I18nService,
        public regularVerify: RegularVerify,
        private msgService: MessageService,
        private el: ElementRef,
        public profileDownload: ProfileDownloadService,
        public vscodeService: VscodeService,
        private tiModal: TiModalService,
        private downloadService: ProfileDownloadService,
        public utils: Utils,
        private dragService: TiDragService,
        private renderer2: Renderer2,
        private eventManager: EventManager,
        private route: ActivatedRoute,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone,
    ) {
        this.i18n = this.i18nService.I18n();
        this.obersverOptions = [
            { label: this.i18n.newLockGraph.lock, value: 'lock' },
            { label: this.i18n.newLockGraph.thread, value: 'thread' }
        ];
        this.obersverSelect = this.obersverOptions[0];
        this.viewModel = this.obersverOptions[0].label;
        this.threadSelectorOptions = [
            { key: 'VARIOUS', label: this.i18n.protalserver_profiling_thread.selector.options.various },
            { key: 'RUNNABLE', label: this.i18n.protalserver_profiling_thread.selector.options.runnable },
            { key: 'WAITING', label: this.i18n.protalserver_profiling_thread.selector.options.waiting },
            { key: 'BLOCKED', label: this.i18n.protalserver_profiling_thread.selector.options.blocked },
        ];
        this.threadSelectons = [
            this.threadSelectorOptions[0],
            this.threadSelectorOptions[1],
            this.threadSelectorOptions[2],
            this.threadSelectorOptions[3],
        ];
        this.threadSearchOptions = [{
            label: this.i18n.io.fileIo.threadName,
            value: 'threadName'
        }];
        this.reportNameControl = new FormControl('', this.regularVerify.reportNameValid(this.i18n));
        this.reportRemarkControl = new FormControl('', this.regularVerify.reportRemarkValid(this.i18n));
    }
    @ViewChild('diffIns', { static: false }) diffIns: any;
    @ViewChild('lockGraph', { static: false }) lockGraph: any;
    @ViewChild('lockGraph2', { static: false }) lockGraph2: any;
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    @ViewChild('deleteThread', { static: false }) deleteThread: any;
    @ViewChild('draggable', { static: false }) draggableEl: ElementRef;
    @ViewChild('showFullEl', { static: false }) showFullEl: ElementRef;
    @ViewChild('saveThreadDump') saveThreadDump: any;

    i18n: any;
    public currTheme = COLOR_THEME.Dark;

    public currentTabName = '';
    public threadTabs: any[] = [];
    public echartsInstance: any;
    public updateOptions: any;
    public echartsContainerHeight: number;
    public xLabels: Array<string> = [];
    private initChartFlag = true;
    public timeChartBox: number;
    public tableData: any;
    public baseTop = 0;
    public gridHeight = 16;
    public gridInertvalHeight = 32;
    public startTime = 0;
    public endTime = 0;
    public uuid: any;
    public sData = {};
    public fake: any[] = [];
    public multiple = false;
    public delItem: any[] = [];
    public selectCount: any = true;
    public arr: Array<TiTreeNode>;
    public getDatas: any = {
        spec: [],
        values: {},
    };
    public timeData: any[] = [];
    // datazoom刻度
    public timeLine = {
        start: 0,
        end: 100
    };

    public currentFile: any;
    public activeFile = 0;
    public fileList: Array<any> = [];
    public activeGraph = -1;

    // graph部分
    public currentGraphFile: any;
    public graphOption: any;
    public echartsIntance: any;
    public graphData: any;
    public graphLinks: any;
    private selGraphLinks: any[] = [];
    public graphDescs: Array<any> = [];
    public deadlockNum = 0;

    private symbol = 'rect'; // 关系图节点标记的形状

    public getDataTimer: any = null;
    public dataLens = 0;

    private isStopMsgSub: Subscription;
    public startBtnDisabled = false;
    public threadWorker: any = null;
    private defaultOptions: any[] = [];

    public activeFileBak = -1;

    public preSelectedId = '';

    public relateIdx = 1;
    public fileIdx = 1;
    public sourceX = 150;
    public targetX = 550;

    public option: any = {
        legend: {
            data: [],
            type: 'scroll',
            icon: 'circle',
            top: this.baseTop,
            algin: 'left',
            right: 50,
        },
        tooltip: {},
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            snap: true,
        },
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
    };
    public isDownload = false;
    private downloadWorker: any = null;

    public obersverSwitch = false;
    public obersverOptions: any[] = [];
    public obersverSelect: any;
    public compareSwitch = false;
    public compareOptions: any[] = [];
    public compareSelect: any;
    public compareSelectIndex: any;
    public currentThreadTime: string;
    public compareThreadTime: string;
    public dumpTimes = 0;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    // 线程过滤选择器选项
    public threadSelectorOptions: Array<any>;
    public threadSelectons: any;
    public threadSearchOptions: any;
    private threadSearchValue = '';

    // 线程列表-当前显示全部数据
    private threadListAllData: any;
    // 线程列表-上一次页面缓存数据
    private threadListCacheData: any;
    public innerData: Array<TiTreeNode> = [];
    public treeInnerData: any;
    // getDatas的备份数据，仅在导入数据时使用
    private getDatasBackup: any;

    public threadListShowLoading = false;
    public showLoading = false;
    public leftState = false;
    public deleteDump = false;
    public wheelShowScale = 1;
    public datatype: any[] = [];
    public selectedType: any;
    private isFullScreen = false;

    // 保存报告
    public threadDumpList: number;
    public hoverClose = '';
    public sugReport = true;
    public saveRecordOptions: Array<any> = [];
    public saveRecordSelecteds: any = [];
    public reportNameHolder: string;
    public saveThreaddumpId: string;
    public saveReport = false;
    public tipActive = true;
    // 表单验证部分
    public reportNameValidation: TiValidationConfig = {
        type: 'blur',
    };
    public reportRemarkValidation: TiValidationConfig = {
        type: 'blur',
    };
    public reportNameControl: FormControl;
    public reportRemarkControl: FormControl;
    public reportName: string;
    public reportRemarks: string;
    public guardianId: any;
    public jvmId: any;
    public startTimes: Array<any> = [];
    // 报告保存按钮能否使用
    public saveBtnDisable: any;
    public saveBtnTip: string;
    public maxThreadDumpCount: number;
    public threadReportNum: number;
    public threaddumpSaved = false;
    public treeValue: number;
    public treeStartTime: any;
    public saveReportTip: string;
    public startTimesBtnDisable = false;
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    public viewModel: string;
    public compareModel: string;
    public viewDownFlag = false;
    public compareDownFlag = false;

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop') || 'false');
        this.treeValue = 0; // 默认点击树的第一个
        // 报存报告
        if (this.profileDownload.downloadItems.report) {
            this.threadDumpList = this.profileDownload.downloadItems.report.threaddumpList;
        }
        // 报告输入提示语
        this.reportNameHolder = this.i18n.plugins_common_report.saveThreadDump.reportNameHolder;
        this.eventManager.addGlobalEventListener('window', 'keyup.esc',
            () => { this.onZoomStatus(false, 'keyupEsc'); });
        this.threadListShowLoading = true;

        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.thread;
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        // 监听内存转储数量阈值变换
        this.vscodeService.regVscodeMsgHandler('updateThreadReportConfig', (msgData: any) => {
            if (msgData.maxThreadDumpCount && msgData.threadReportNum) {
                this.threadReportNum = Number(msgData.threadReportNum);
                this.maxThreadDumpCount = Number(msgData.maxThreadDumpCount);
                (self as any).webviewSession.setItem('maxThreadDumpCount', msgData.maxThreadDumpCount);
                (self as any).webviewSession.setItem('threadReportNum', msgData.threadReportNum);
                this.checkThreaddumpReportNum();
            }
        });
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.messageHandler.sendThreaddumpReport = (data: any) => {
                this.threadReportNum = Number(data.data.threadReportNum);
                this.maxThreadDumpCount = Number(data.data.maxThreadDumpCount);
                (self as any).webviewSession.setItem('maxThreadDumpCount', data.data.maxThreadDumpCount);
                (self as any).webviewSession.setItem('threadReportNum', data.data.threadReportNum);
                this.checkThreaddumpReportNum();
            };
        }
        this.maxThreadDumpCount = (self as any).webviewSession.getItem('maxThreadDumpCount');
        this.threadReportNum = (self as any).webviewSession.getItem('threadReportNum');
        this.treeInnerData = [{
            name: this.i18n.plugins_perf_java_profiling_export.all,
            expanded: true,
            children: []
        }];

        // 读取缓存数据
        this.fileList = this.profileDownload.downloadItems.thread.threadDump;
        this.treeInnerData[0].children = this.initInnerData(this.fileList);
        if (this.fileList.length > 0) {
            this.currentFile = this.fileList[0];
        }
        // 获取线程列表上一次缓存数据
        if (this.profileDownload.downloadItems.thread.threadListData
            && Object.keys(this.profileDownload.downloadItems.thread.threadListData).length > 0) {
            this.threadListCacheData = this.profileDownload.downloadItems.thread.threadListData;
        }

        this.datatype = [
            { label: this.i18n.protalserver_profiling_thread.graph, id: 'graph' },
            { label: this.i18n.protalserver_profiling_thread.raw, id: 'dump' }
        ];
        this.selectedType = this.datatype[0];

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            if (this.isFullScreen) {
                const backgroundColor = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
                  ? '#313335' : '#272727';
                this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color',
                      this.currTheme === this.ColorTheme.Dark ? backgroundColor : '#fff');
            }
        });
        this.graphDescs = [
            {
                label: 'Locked',
                src: './assets/img/home/solid-line.svg',
            },
            {
                label: 'Blocked On',
                src: './assets/img/home/dotted-line.svg',
            },
        ];

        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            setTimeout(() => {
                if (msg.type === 'isStopPro') {

                    this.startBtnDisabled = msg.isStop;
                    if (this.threadWorker) { this.threadWorker.terminate(); }
                }
            }, 500);
            if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.thread) {
                if (this.echartsInstance) {
                    this.echartsInstance.clear();
                }
                this.xLabels = [];
                this.getDatas.spec = [];
                if (this.threadWorker) { this.threadWorker.terminate(); }
                this.getWorkerData();
            } else if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_thread.dump) {
                this.fileList = [];
                this.treeInnerData[0].children = [];
                this.activeFile = -1;
            }
        });
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (this.isDownload) {
            this.profileDownload.downloadItems.tabs.forEach((tab: any) => {
                if (tab.parentTabName === 'cpu') {
                    this.threadTabs.push({ label: tab.tabName, selected: false });
                }
            });
            if (this.threadTabs.length > 0) {
                this.threadTabs[0].selected = true;
                this.currentTabName = this.threadTabs[0].label;
            }
            // 导入线程列表数据
            this.handleDownloadData();
            this.getDatasBackup = JSON.parse(JSON.stringify(this.getDatas));
            if (typeof Worker !== 'undefined') {
                // 为解决跨域调用问题，将脚本内嵌在index.html中，通过下述语句获取脚本内容并创建子线程
                const blob = new Blob([document.querySelector('#profile-thread-worker').textContent]);
                const url = window.URL.createObjectURL(blob);
                // 创建子线程
                this.downloadWorker = new Worker(url);
                // 监听处理子线程返回数据
                this.downloadWorker.onmessage = (res: any) => {
                    const { data } = res;
                    const filterGetDatas = JSON.parse(JSON.stringify(this.getDatasBackup));
                    if (data.type === 'normal') {
                        this.filterData({
                            parsed: filterGetDatas,
                            opts: data.body
                        });
                        this.updateOptions = this.tableData = data.body;
                        this.getDatas = filterGetDatas;
                    }
                };
                this.downloadWorker.postMessage({
                    type: 'download',
                    data: this.getDatasBackup
                });
            }
            // 导入线程转储和锁分析图数据
            this.fileList = this.profileDownload.downloadItems.thread.threadDump;
            this.treeInnerData[0].children = this.initInnerData(this.fileList);
            return;
        } else {
            this.threadTabs = [
                { label: 'list', selected: true },
                { label: 'dump', selected: false }
            ];
        }
        this.getCurrentTab();
        if (this.offlineThreadDump) {
            this.fileList = [];
            this.currentTabName = 'graph';
            this.getThreadDumpReportData();
            this.selectedType = this.datatype[0];
            let tempTimer = setInterval(() => {
                this.selectTreeNode(0);
                this.fileList[0].checked = true;
                this.treeInnerData[0].children = this.initInnerData(this.fileList);
                this.changeParseSel(this.fileList[0], 0);
                if (this.fileList.length) {
                    clearInterval(tempTimer);
                    tempTimer = null;
                }
            }, 200);
        }
        // 处理内存转储数量
        this.checkThreaddumpReportNum();
        this.getWorkerData();
    }

    /**
     * 获取work数据
     */
    public getWorkerData() {
        if (typeof Worker !== 'undefined') {
            const blob = new Blob([document.querySelector('#profile-thread-worker').textContent]);
            const url = window.URL.createObjectURL(blob);
            this.threadWorker = new Worker(url);
            this.threadWorker.onmessage = (res: any) => {
                const { data } = res;
                setTimeout(() => {
                    if (data.type === 'normal') {
                        this.threadListAllData = data.body;
                        this.xLabels = this.sliceXLabels(this.threadListAllData.xLabels);
                        this.timeData = this.threadListAllData.xLabels;
                        this.updateDownloadItems(this.threadListAllData);
                        this.filterData(this.threadListAllData);
                        this.tableData = this.threadListAllData.opts;
                        this.updateOptions = this.threadListAllData.opts;
                        this.getDatas = { ...this.threadListAllData.parsed };
                        this.echartsContainerHeight =
                            this.getDatas.spec.length * this.gridHeight +
                            (this.getDatas.spec.length + 1) * this.gridInertvalHeight;
                        this.timeChartBox =
                            this.getDatas.spec.length * this.gridHeight +
                            (this.getDatas.spec.length + 1) * this.gridInertvalHeight +
                            this.baseTop * 2;
                    }

                    if (data.type === 'timeUpdate') {
                        this.echartsInstance.setOption({
                            dataZoom: data.body
                        });
                    }
                }, 500);

                if (this.initChartFlag) { this.initChart(this.updateOptions); }
            };
        }
    }

    /**
     * 初始化innerData
     */
    private initInnerData(fileList: Array<any>) {
        const innerData = JSON.parse(JSON.stringify(fileList));
        innerData.forEach((item: any) => {
            item.id = 'all';
            item.expanded = false;
            if (this.currentTabName !== 'graph') {
                item.children = item.files.map((file: any) => {
                    file.id = item.name;
                    file.name = file.fileName;
                    return file;
                });
            }

        });
        return innerData;
    }

    private filterData(dataLocal: any) {

        /**
         * 删除某一项echarts数据
         *
         * @param index 索引
         * @param threadId 线程id
         */
        function deleteEchartsData(index: any, threadId: any) {
            dataLocal.parsed.spec.splice(index, 1);
            delete dataLocal.parsed.values[threadId];
            // 因为dataLocal.opts里面的数据是dataLocal.parsed里面数据的两倍(不要问我为什么是两倍，这个数据不是我设定的，我也不知道)，
            // 并且索引1-2相对应，故删除的时候dataLocal.parsed里面删1个，dataLocal.opts删两个
            dataLocal.opts.grid.pop();
            dataLocal.opts.grid.pop();
            dataLocal.opts.series.splice(index * 2, 2);
            dataLocal.opts.xAxis.splice(index * 2, 2);
            dataLocal.opts.xAxisIndexArr.splice(index * 2, 2);
            dataLocal.opts.yAxis.splice(index * 2, 2);
        }

        // 搜索过滤
        for (let i = 0; i < dataLocal.parsed.spec.length; i++) {
            const item = dataLocal.parsed.spec[i];
            if (item.name.search(this.threadSearchValue) === -1) {
                deleteEchartsData(i, item.id);
                i--;
            }
        }
        // 选择过滤
        if (this.threadSelectons.length === 0) {
            dataLocal.opts.grid = [];
            dataLocal.opts.series = [];
            dataLocal.opts.xAxis = [];
            dataLocal.opts.xAxisIndexArr = [];
            dataLocal.opts.yAxis = [];
            dataLocal.parsed.spec = [];
            dataLocal.parsed.values = {};
        } else if (this.threadSelectons.length < 4) {
            // 处理选中项
            const selectionKeys = this.threadSelectons.map((item: any) => (item.key));
            if (selectionKeys.includes('WAITING')) {
                selectionKeys.push('TIMED_WAITING');
            }
            for (let i = 0; i < dataLocal.parsed.spec.length; i++) {
                const thread = dataLocal.parsed.spec[i];
                const threadValueArr = dataLocal.parsed.values[thread.id];
                const statusSet = new Set<string>();
                threadValueArr.forEach((spanItem: any) => {
                    statusSet.add(spanItem.status);
                });
                const status = [...statusSet][0];
                if (statusSet.size > 1) {
                    if (!selectionKeys.includes('VARIOUS')) {
                        // 如果数据有多种状态并且过滤项没有选择显示多种状态的数据
                        deleteEchartsData(i, thread.id);
                        i--;
                    }
                } else if (!selectionKeys.includes(status)) {
                    // 过滤项中没有选中这种状态
                    deleteEchartsData(i, thread.id);
                    i--;
                }
            }
        }
        // 重建索引，修复echarts显示数据
        for (let i = 0; i < dataLocal.opts.grid.length; i++) {
            dataLocal.opts.series[i].xAxisIndex = i;
            dataLocal.opts.series[i].yAxisIndex = i;
            dataLocal.opts.xAxis[i].gridIndex = i;
            dataLocal.opts.xAxisIndexArr[i] = i;
            dataLocal.opts.yAxis[i].gridIndex = i;
        }
    }

    private handleDownloadData() {
        const datas = this.profileDownload.downloadItems.thread.threadList;
        if (Object.keys(datas).length === 0) {
            this.threadListShowLoading = false;
            return;
        }
        const downloadData = datas.data;
        const keys = downloadData && Object.keys(downloadData);
        if (keys && !keys.length) { return; }

        this.xLabels = this.sliceXLabels(datas.xLabels);

        this.getDatas = {
            spec: [],
            values: {},
        };
        for (const key of keys) {
            const keyArr = key.split('(');
            const id = keyArr[1].slice(0, -1);
            this.getDatas.values[id] = downloadData[key];
            this.getDatas.spec.push({
                name: keyArr[0],
                id
            });
        }

        this.echartsContainerHeight = this.getDatas.spec.length * this.gridHeight +
            (this.getDatas.spec.length + 1) * this.gridInertvalHeight;
        this.timeChartBox = this.getDatas.spec.length * this.gridHeight +
            (this.getDatas.spec.length + 1) * this.gridInertvalHeight + this.baseTop * 2;
    }

    /**
     * AfterViewInit方法
     */
    ngAfterViewInit() {
        this.stompService.threadListSub = this.msgService
            .getMessage()
            .subscribe((data) => {
                if (data.type === 'updata_thread') {
                    const newData = data.data;
                    this.startTime = 0;
                    this.endTime = data.endTime + 1000;
                    if (this.threadWorker) {
                        this.threadWorker.postMessage({
                            type: 'ws',
                            data: newData
                        });
                    }
                }
            });
        if (this.isDownload) {
            if (this.fileList.length) {
                this.currentFile = this.fileList[0];
                this.selectTreeNode(0);
                setTimeout(() => {
                    this.changeParseSel(this.fileList[0], 0);
                }, 500);
            }
        }
        let tempDraggable = setInterval(() => {
            if (this.draggableEl) {
                this.onSetDraggable();
                clearInterval(tempDraggable);
                tempDraggable = null;
            }
        }, 200);
    }

    /**
     * 更新数据到导出数据对象
     */
    private updateDownloadItems(threadListAllData = this.threadListAllData) {
        const downloadEchartData: any = {
            xLabels: [],
            data: {}
        };

        for (const spec of threadListAllData.parsed.spec) {
            for (const key in threadListAllData.parsed.values) {
                if (key && parseInt(key, 10) === spec.id) {
                    downloadEchartData.data[`${spec.name}(${spec.id})`] = threadListAllData.parsed.values[key].slice();
                }
            }
        }
        downloadEchartData.xLabels = this.xLabels;
        this.profileDownload.downloadItems.thread.threadList = downloadEchartData;
        this.profileDownload.downloadItems.thread.threadListData = threadListAllData ? threadListAllData : {};
        this.profileDownload.downloadItems.thread.threadTabs = this.threadTabs;
    }

    /**
     * ngOnDestroy方法
     */
    ngOnDestroy(): void {
        this.startTimesBtnDisable = false;
        if (this.isDownload) { return; }
        if (this.echartsInstance) { this.echartsInstance.clear(); }
        if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
        if (this.downloadWorker) { this.downloadWorker.terminate(); }
    }

    /**
     * ThreadDump处理方法
     */
    public dumpHandle() {
        if (this.startBtnDisabled) { return; }
        this.fileList.forEach((item) => {
            item.isOpen = false;
        });

        const guardianId = (self as any).webviewSession.getItem('guardianId');
        const params = {
            jvmId: (self as any).webviewSession.getItem('jvmId'),
        };
        this.showLoading = true;
        const option = {
            url: `/guardians/${guardianId}/cmds/dump-thread`,
            params
        };
        this.vscodeService.post(option, (resp: any) => {
            this.showLoading = false;
            this.getFiles(resp);
            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
              this.vscodeService.showTuningInfo(resp.message, 'info', 'dumpHandle');
            }
        });
    }
    /**
     * 线程转储
     */
    public getThreadDumpReportData() {
        this.showLoading = true;
        const option = {
            url: `/threadDump/${this.offlineThreadDumpId}`,
        };
        this.vscodeService.post(option, (resp: any) => {
            if (resp.data.length > 0) {
                resp.data.forEach((item: any) => {
                    this.getFiles(item);
                });
                if (this.fileList.length) {
                    this.showLoading = false;
                }
            }
        });
    }

    /**
     * 线程转储数据处理方法
     */
    public getFiles(resp: any) {
        const itemFile: any = {};
        itemFile.name = this.dateFormat(resp.startTime, 'yyyy/MM/dd hh:mm:ss');
        itemFile.startTime = resp.startTime;
        itemFile.isOpen = false;
        itemFile.expanded = true;
        itemFile.files = [];
        itemFile.deadlockNum = 0;
        itemFile.content = resp.content;
        const content = resp.content;
        const files = content.split('\n\n');
        const deadlockReg = /Found\s+\d+\s+deadlock./;
        const deadLockStrIdx = files.findIndex((item: any) => {
            return deadlockReg.test(item);
        });
        if (deadLockStrIdx >= 0) {
            const deadlock = files[deadLockStrIdx].match(/\d+/);
            itemFile.deadlockNum = deadlock[0];
        }
        const reg = /\s+#\d+\s+/;
        const deadLockThreads: any[] = [];
        const deadLockStrReg = /Found one Java-level deadlock:/;
        files.forEach((file: any) => {
            const matchObj = file.match(reg);
            if (matchObj) {
                itemFile.files.push({
                    fileName: file.slice(1, matchObj.index - 1),
                    content: file.slice(matchObj.index + matchObj[0].length),
                    isActive: itemFile.files.length === 0,
                });
            }
            if (deadLockStrReg.test(file)) {
                const threads = file.split('\n');
                threads.forEach((item: any) => {
                    if (deadLockStrReg.test(item)) { return; }
                    const idx = item.indexOf(':');
                    if (idx >= 0) {
                        deadLockThreads.push({
                            type: 'deadLockThread',
                            name: item.slice(1, idx - 1),
                        });
                    }
                });
            }
        });
        itemFile.files = itemFile.files.concat(deadLockThreads);
        itemFile.label = itemFile.name;
        itemFile.value = this.fileList.length;
        this.fileList.push(itemFile);
        this.currentFile = this.fileList[0];
        // 执行线程转储后进行初始化
        this.activeFile = -1;
        this.handleCompareList(0);
        setTimeout(() => {
            this.diffIns.diff(this.currentFile);
        }, 500);
        if (!this.offlineThreadDump) {
            this.profileDownload.downloadItems.thread.threadDump = JSON.parse(JSON.stringify(this.fileList));
            this.treeInnerData[0].children = this.initInnerData(this.fileList);
            this.dumpTimes += 1;
            this.utils.showInfoBox(this.i18n.protalserver_sampling_tab.dumpSuccess, 'info');
        }

    }

    /**
     * 弹出删除选项
     */
    public onDeleteThread() {
        this.multiple = true;
        this.delItem = [];
        this.selectCount = true;
        this.treeInnerData[0].checked = false;
        this.treeInnerData[0].children.forEach((item: any) => {
            item.checked = false;
        });
    }

    /**
     * 控制checkbox显示
     */
    public onCancel() {
        this.multiple = false;
    }
    /**
     * 打开删除弹框
     */
    public onConfirmPopDelete() {
        this.tiModal.open(this.deleteThread, {
            id: 'Thread',
        });
    }

    /**
     * 监听选中数据
     */
    public changeFn(e: any) {
        this.treeStartTime = e.startTime;
        if (e.checked) {
            this.delItem.push(e);
        } else if (!e.checked) {
            this.delItem.forEach((item, index) => {
                if (item.name === e.name) {
                    this.delItem.splice(index, 1);
                }
            });
        }
        const checkedFile = this.delItem.filter((item) => {
            return item.checked;
        });
        this.selectCount = checkedFile.length > 0 ? false : true;
    }

    /**
     * 删除线程转储
     */
    public onConfirmDelete(context: any) {
        this.delItem = this.treeInnerData[0].children.filter((item: any) => {
            return item.checked;
        });
        for (const item of this.delItem) {
            TiTreeUtil.removeNode(this.treeInnerData[0].children, item);
        }
        this.delItem.forEach((file) => {
            this.fileList.forEach((item, index) => {
                if (file.id === item.name) {
                    this.fileList[index].files.forEach((delFile: any, i: number) => {
                        if (file.name === delFile.fileName) {
                            this.fileList[index].files.splice(i, 1);
                        }
                    });
                }
                if (file.id === 'all' && file.name === item.name) {
                    this.fileList.splice(index, 1);
                }
            });
            this.profileDownload.downloadItems.thread.threadDump.forEach((item: any, index: number) => {
                if (file.id === item.name) {
                    this.profileDownload.downloadItems.thread.threadDump[index].files.forEach(
                      (delFile: any, i: number) => {
                        if (file.name === delFile.fileName) {
                            this.profileDownload.downloadItems.thread.threadDump[index].files.splice(i, 1);
                        }
                    });
                }
                if (file.id === 'all' && file.name === item.name) {
                    this.profileDownload.downloadItems.thread.threadDump.splice(index, 1);
                }
            });
        });
        if (this.fileList.length > 0) {
            this.activeFile = 0;
            const currentFile = this.fileList[0];
            this.diffIns.diff(currentFile);
            this.activeGraph = 0;
            this.changeParseSel(this.fileList[0], 0);
            this.selectTreeNode(0);
            if (this.selectedType.id === 'dump') {
                this.deleteDump = true;
            }
        }
        this.multiple = false;
        this.delItem = [];
        this.selectCount = true;
        context.close();
    }

    /**
     * 打开折叠列表
     * @param index 序号
     */
    public openfilesToggle(index: any) {
        const rootFile = this.fileList[index];
        rootFile.isOpen = !rootFile.isOpen;
        this.fileList.forEach((item, idx) => {
            if (index !== idx) { item.isOpen = false; }
        });

        if (rootFile.isOpen) {
            this.activeFileBak = index;
            this.currentFile = rootFile.files.find((file: any) => {
                return file.isActive;
            });
            this.diffIns.diff(this.currentFile);
        }
        this.activeFile = -1;
    }

    /**
     * 获取文件内容
     * @param file 文件
     * @param idx 序号
     */
    public getAllContent(file: any, idx: any) {
        this.activeFile = idx;
        this.diffIns.diff(file);
        this.fileList.forEach((item) => {
            item.isOpen = false;
        });
    }

    /**
     * 获取选中文件内容
     * @param file 文件
     */
    public getContent(file: any) {
        this.diffIns.diff(file);
    }

    /**
     * 获取当前文件
     * @param file 文件
     * @param fileIndex 文件序号
     * @param index 序号
     */
    public getCurrentFile(file: any, fileIndex: any, index: any) {
        this.currentFile = file.files[fileIndex];
        this.fileList[index].files.forEach((item: any) => {
            item.isActive = false;
        });
        this.fileList[index].files[fileIndex].isActive = true;
        this.diffIns.diff(this.currentFile);
    }

    /**
     * 页签折叠
     * @param index 序号
     */
    public toggleTab(index: any) {
        this.threadTabs.forEach((tab) => {
            tab.selected = false;
        });
        this.threadTabs[index].selected = true;
        this.getCurrentTab();
        this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.thread;
        this.downloadService.clearTabs.currentTabPage = index === 0 ? this.i18n.protalserver_profiling_tab.thread
            : this.i18n.protalserver_profiling_thread.dump;
        this.leftState = false;
        this.multiple = false;
    }

    /**
     * 获取当前选中的tab页签
     */
    private getCurrentTab() {
        const currentTab = this.threadTabs.find((tab) => {
            return tab.selected;
        });
        this.currentTabName = currentTab.label;
        if (this.currentTabName === 'dump') {
            if (this.fileList.length) {
                this.typeChange(this.selectedType);
            }
            if (this.selectedType.id === 'graph') {
                if (this.draggableEl) {
                    this.onSetDraggable();
                }
            }
        }
    }

    /**
     * 更换类型
     * @param data 数据
     */
    public typeChange(data: any) {
        this.currentTabName = data.id;
        this.multiple = false;
        this.treeInnerData[0].children = this.initInnerData(this.fileList);
        if (this.deleteDump && data.id === 'graph') {
            this.deleteDump = false;
            this.changeParseSel(this.fileList[0], 0);
        }
        if (this.activeFile !== -1 && this.activeFile === this.activeGraph) {
            if (data.id === 'graph' && this.activeGraph >= 0) {
                this.changeParseSel(this.fileList[this.activeGraph], this.activeGraph);
            }
            if (data.id === 'dump' && this.activeFile >= 0) {
                this.getAllContent(this.fileList[this.activeFile], this.activeFile);
            }
            return;
        }
        if (data.id === 'dump') {
            if (!this.isDownload) {
                this.activeFile = this.activeGraph >= 0 ? this.activeGraph : 0;
            } else {
                this.activeFile = 0;
            }
            this.getAllContent(this.fileList[this.activeFile], this.activeFile);
            this.selectTreeNode(this.activeFile);
        } else if (data.id === 'graph') {
            this.activeGraph = this.activeFile !== -1 ? this.activeFile : 0;
            this.changeParseSel(this.fileList[this.activeGraph], this.activeGraph);
            this.selectTreeNode(this.activeGraph);
        }
    }

    /**
     * 修改解析
     * @param file 文件
     * @param idx 序号
     */
    public changeParseSel(file: any, idx: any) {
        if (idx < 0) { return; }
        this.currentGraphFile = file.files;
        this.deadlockNum = file.deadlockNum;
        this.activeGraph = idx;
        this.currentThreadTime = file.name;
        this.handleCompareList(idx);
        this.handleFileNewData(file);
    }
    private parseLock(files: any, selIdx: any) {
        this.graphData = [];
        this.graphLinks = [];
        this.selGraphLinks = [];
        this.relateIdx = 1;
        this.fileIdx = 1;
        const links: any[] = [];
        const graphData: any[] = [];
        const reg = /- waiting to lock|- locked/g;
        const relationIdReg = /<\w+>/;
        const echartsElement = this.el.nativeElement.querySelector('#graph_echarts');
        const deadLockThreads = files.filter((item: any) => {
            return item.type === 'deadLockThread';
        });
        deadLockThreads.forEach((thr: any) => {
            const idx = files.findIndex((item: any) => {
                return item.fileName === thr.name;
            });
            if (idx > 0) {
                const tar = files.splice(idx, 1);
                files.unshift(tar[0]);
            }
        });
        const graphFiles = files.filter((item: any) => {
            return item.content;
        });
        graphFiles.forEach((file: any, index: number) => {
            const content = file.content;
            const matched = content && content.match(reg);
            if (matched) {
                this.graphDatas(
                    graphData,
                    file.fileName,
                    selIdx,
                    index,
                    false,
                    this.sourceX,
                    null
                );

                const lines = content.split('\n\t');
                lines.forEach((line: any) => {
                    let lockedCount = 1;
                    if (
                        line.indexOf('- waiting to lock') !== -1 &&
                        line.indexOf('no object reference available') === -1
                    ) {
                        const target = line.match(relationIdReg);
                        this.graphDatas(
                            graphData,
                            target[0],
                            selIdx,
                            index,
                            false,
                            null,
                            this.targetX
                        );
                        this.graphLinksFn(
                            links,
                            file.fileName,
                            target[0],
                            selIdx,
                            index,
                            false,
                            graphData
                        );
                    }
                    if (line.indexOf('- locked') !== -1) {
                        const target = line.match(relationIdReg);
                        this.graphDatas(
                            graphData,
                            target[0],
                            selIdx,
                            index,
                            true,
                            null,
                            this.targetX
                        );
                        this.graphLinksFn(
                            links,
                            file.fileName,
                            target[0],
                            selIdx,
                            index,
                            true,
                            graphData
                        );
                        lockedCount++;
                    }
                });
            }
        });

        if (graphData.length <= 3) {
            graphData.forEach((item, idx) => {
                if (item.x === this.targetX) {
                    graphData[idx].symbolOffset = [0, 0];
                }
            });
        }
        this.graphData = graphData;

        this.graphLinks = links;
        echartsElement.style.height = Math.max(this.fileIdx, this.relateIdx) * 100 + 'px';
        this.graphOption = this.setOptions();
        if (this.echartsIntance) {
            this.echartsIntance.clear();
            this.echartsIntance.setOption(this.graphOption, true);
        }
    }

    /**
     * 处理点击事件
     * @param tar 对象
     */
    public handleClick(tar: any) {
        const selNode = tar.data;
        const fileIdx = this.currentGraphFile.findIndex((file: any) => {
            return file.fileName === selNode.name;
        });
        const delFile = this.currentGraphFile.splice(fileIdx, 1);
        this.currentGraphFile.unshift(delFile[0]);
        this.parseLock(this.currentGraphFile, 0);
    }

    private graphLinksFn(links: any, sourceName: any, targetName: any,
                         selIdx: any, index: any, isLock: any, graphData?: any) {
        const linkIdx = links.findIndex((item: any) => {
            return item.source === sourceName && item.target === targetName;
        });
        let lineColor = '#d4d9e6';
        if (graphData && graphData.length) {
            const idx = graphData.findIndex((item: any) => {
                return item.name === sourceName;
            });
            if (idx >= 0) {
                if (!isLock) {
                    graphData[idx].itemStyle.color = 'rgba(244, 92, 94, 0.2)';
                }
                if (selIdx === index) {
                    this.selGraphLinks = graphData.slice();
                    const filterLockedLen = this.selGraphLinks.filter((item) => {
                        return item.name !== sourceName && item.isLock;
                    }).length;
                    lineColor = filterLockedLen !== (this.selGraphLinks.length - 1) ? '#f45c5e' : '#08cc24';
                    if (filterLockedLen !== this.selGraphLinks.length) {

                    }
                    graphData[idx].itemStyle.color = lineColor;
                }
            }
        }
        if (linkIdx === -1) {
            links.push({
                source: sourceName,
                target: targetName,
                lineStyle: {
                    color: lineColor,
                    type: isLock ? 'solid' : 'dash',
                },
            });
        }
    }

    private graphDatas(graphData: any, name: any, selIdx: any, index: any, isLock?: any, sourceX?: any, targetX?: any) {
        const gpIdx = graphData.findIndex((data: any) => {
            return data.name === name;
        });
        let color = '';
        let labelColor = '';
        let y = 0;

        if (sourceX) {
            color = selIdx === index ? '#F45C5E' : '#E4F9EC';
            labelColor = selIdx === index ? '#fff' : '#333';
            y = this.fileIdx * 100;
        } else {
            color = '#838A9B';
            labelColor = '#fff';
            y = this.relateIdx * 100;
        }

        if (gpIdx === -1) {
            graphData.push({
                name,
                x: sourceX || targetX,
                y,
                value: 4,
                symbol: this.symbol,
                symbolSize: [name.length * 8, 42],
                symbolOffset: sourceX ? ['-50%', 0] : ['35%', 0],
                itemStyle: {
                    color,
                },
                label: {
                    color: labelColor,
                },
                isLock
            });
            if (sourceX) { this.fileIdx++; }
            if (targetX) { this.relateIdx++; }
        }
    }

    private setOptions() {
        const option = {
            tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',

            label: {
                fontSize: 13,
            },
            series: [
                {
                    type: 'graph',
                    layout: 'none',
                    left: 'center',
                    top: 100,
                    roam: 'move',
                    label: {
                        normal: {
                            show: true,
                        },
                    },
                    edgeSymbol: ['none', 'arrow'],
                    edgeSymbolSize: [4, 10],
                    edgeLabel: {
                        normal: {
                            textStyle: {
                                fontSize: 20,
                            },
                        },
                    },
                    // 所有节点数据
                    data: this.graphData,
                    links: this.graphLinks,
                    lineStyle: {
                        normal: {
                            opacity: 0.9,
                            width: 2,
                            curveness: 0,
                        },
                    },
                },
            ],
        };
        return option;
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
            S: getDate.getMilliseconds(),
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
     * 生成X轴
     * @param gridIndex 图表序列
     * @param opt 选项
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const that = this;
        return (echarts as any).util.merge(
            {
                type: 'time',
                gridIndex,
                axisLine: { onZero: false, lineStyle: { color: '#ddd' } },
                axisTick: { show: false },
                axisLabel: {
                    show: false,
                    interval: 0,
                    formatter(value: any) {
                        const label = that.formatLabel(value / 1000);
                        return label;
                    },
                },
                splitLine: { show: false, lineStyle: { color: '#ddd' } },
                min: this.startTime,
                max: this.endTime,
            },
            opt || {},
            true
        );
    }
    private formatLabel(time: any) {
        let str = '';
        let h: any = Math.floor(time / 3600);
        let m: any = Math.floor((time - h * 3600) / 60);
        let s: any = Math.floor(time - h * 3600 - m * 60);
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        str = h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
        return str;
    }

    /**
     * 生成Y轴
     * @param gridIndex 图表序列
     * @param opt 选项
     */
    public makeYAxis(gridIndex: any, opt: any) {
        return (echarts as any).util.merge(
            {
                type: 'value',
                offset: 30,
                gridIndex,
                nameLocation: 'middle',
                nameTextStyle: {
                    color: '#333',
                },
                show: false,
                boundaryGap: ['30%', '30%'],
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: { show: false },
                splitLine: { show: false },
            },
            opt || {},
            true
        );
    }

    /**
     * 生成图表
     * @param top 顶部
     * @param opt 选项
     */
    public makeGrid(top: any, opt: any) {
        return (echarts as any).util.merge(
            {
                top,
                left: 0,
                right: 60,
                height: this.gridHeight,
            },
            opt || {},
            true
        );
    }

    /**
     * 初始化图表
     * @param initOpts 初始化选项
     */
    public initChart(initOpts: any) {
        if (!initOpts) { return; }
        this.defaultOptions = JSON.parse(JSON.stringify(this.getDatas.spec));
        if (this.threadWorker) {
            this.threadWorker.postMessage({
                type: 'default',
                data: this.defaultOptions
            });
        }

        this.option.grid = initOpts.grid;
        this.option.series = initOpts.series;
        this.option.xAxis = initOpts.xAxis;
        this.option.yAxis = initOpts.yAxis;
        this.initChartFlag = false;

        this.timeChartBox = this.echartsContainerHeight + this.baseTop * 2;
        $('#time-echart .right').css({ height: this.timeChartBox + 'px' });
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }
        }, 100);

        this.threadListShowLoading = false;
    }

    /**
     * 图表初始化
     * @param e 数据
     */
    public onChartInit(e: any) {
        this.echartsInstance = e;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 处理文件新数据
     * @param file 文件
     */
    public handleFileNewData(file: any) {
        this.lockGraph.handleFileNewData(file);
    }

    /**
     * 监测选择和修改
     * @param obersver 观察对象
     */
    public obersverSelectChange(obersver: any) {
        if ( (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
          this.obersverSelect = obersver.value;
          this.viewModel = obersver.label;
          $('.obersver .menuList').css('display', 'none');
          this.viewDownFlag = false;
        }
        this.lockGraph.currentTypeChange(obersver.value);
        if (this.compareSwitch) {
            this.obersverSelectChange2(obersver);
        }
    }

    /**
     * 监测选择和修改
     * @param obersver 监测对象
     */
    public obersverSelectChange2(obersver: any) {
        if (obersver.value === 'lock') {
            this.lockGraph2.currentTypeChange('thread');
        } else {
            this.lockGraph2.currentTypeChange('lock');
        }
    }

    /**
     * 比较视图变更
     */
    public compareSwitchChange() {
        const len = this.fileList.length;
        const index = this.compareSelectIndex === (len - 1) ? this.compareSelectIndex - 1 : this.compareSelectIndex + 1;
        this.compareSelect = this.fileList[index];
        this.compareModel = this.fileList[index];
        setTimeout(() => {
            return this.compareSelectChange(this.compareSelect);
        }, 0);
    }

    /**
     * 比较视图选择变更
     * @param compare 对比对象
     */
    public compareSelectChange(compare: any) {
        if ( (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
          this.compareModel = compare.label;
          $('.compare .menuList').css('display', 'none');
          this.compareDownFlag = false;
        }
        if (this.compareSwitch) {
            const file = this.fileList[compare.value];
            this.compareThreadTime = compare.label;
            this.lockGraph2.handleFileNewData(file);
            this.obersverSelectChange2(this.obersverSelect);
        }
    }

    /**
     * 处理比较列表
     * @param idx 序列
     */
    public handleCompareList(idx: any) {
        this.compareOptions = this.fileList.filter((item, index) => {
            return index !== idx;
        });
        if (!this.compareSelect) {
            this.compareSelect = this.fileList[idx];
            this.compareThreadTime = this.compareSelect.name;
            this.compareSelectIndex = idx;
        }
    }

    /**
     * 时间轴筛选
     */
    public timeLineData(e: any) {
        this.timeLine = e;
        if (this.threadWorker) {
            const newData = { msg: this.timeLine };
            this.threadWorker.postMessage({
                type: 'updateDataZoom',
                data: newData
            });
        }
    }

    /**
     * 裁剪xLabels显示
     * data xLabels数组
     */
    public sliceXLabels(data: any) {
        const startIndex = Math.ceil(this.timeLine.start * data.length / 100);
        const endIndex = this.timeLine.end * data.length / 100 > data.length ?
            data.length : Math.floor(this.timeLine.end * data.length / 100);
        return data.slice(startIndex, endIndex);
    }

    /**
     * 线程名称搜索事件
     */
    public threadSearchEvent(searchEvent: any) {
        const { value } = searchEvent;
        this.threadSearchValue = value;

        if (this.isDownload) {
            this.downloadWorker.postMessage({
                type: 'download',
                data: this.getDatasBackup
            });
        }
    }

    /**
     * 线程列表下拉框事件
     */
    public onNgModelChange() {
        if (this.isDownload) {
            this.downloadWorker.postMessage({
                type: 'download',
                data: this.getDatasBackup
            });
        }
    }
    /**
     * 展开列表
     */
    public toggleLeft() {
        this.leftState = !this.leftState;
    }
    /**
     * 左侧树点击事件
     */
    public selectThread(item: any, index: any) {
        if (this.selectedType.id === 'graph') {
            this.changeParseSel(item, index);
        } else {
            this.activeFile = index;
            this.getContent(item);
        }
    }
    /**
     * 选中节点
     * @param index 位置
     */
    public selectTreeNode(index: number) {
        const treeData: Array<TiTreeNode> = this.initInnerData(this.fileList);
        TiTreeUtil.expandNode(treeData, treeData[index]);
        TiTreeUtil.selectNode(treeData, treeData[index], true);
        this.treeInnerData[0].children = treeData;
    }
    /**
     * 设置可拖拽以及鼠标滚轮事件
     */
    public onSetDraggable() {
        this.dragService?.create({
            helper: this.draggableEl?.nativeElement
        });
        // 绑定鼠标滑轮
        this.renderer2.listen(this.draggableEl?.nativeElement, 'wheel', this.onScrollZoom);
    }
    /**
     * 鼠标滚轮放大缩小
     */
    public onWheelShowZoom(num: number) {
        this.wheelShowScale *= num;
        // 绑定鼠标滑轮
        this.renderer2.setStyle(this.draggableEl?.nativeElement, 'transform', `scale(${this.wheelShowScale})`);
    }
    /**
     * 鼠标滚轮放大缩小事件
     */
    public onScrollZoom = (e: any) => {
        e.wheelDelta > 0 || e.detail > 0 ? this.onWheelShowZoom(1.1) : this.onWheelShowZoom(0.9);
    }
    /**
     * 放大缩小按钮返回的数据
     */
    public onZoomParam(num: number) {
        this.wheelShowScale = num;
    }
    /**
     * 是否全屏状态
     */
    public onZoomStatus(status: boolean, type?: string) {
        if (status) { // 放大缩小状态
            if (this.currTheme === this.ColorTheme.Dark) {
                const backgroundColor = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
                  ? '#313335' : '#272727';
                this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', backgroundColor);
            } else {
                this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', '#fff');
            }
            this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px 48px');
            $('.leftListHeader').css('display', 'none');
            $('.list-content').css('padding-top', '26px');
            $('.thread-tabs').css('display', 'none');
            $('.profile-tabs').css('display', 'none');
            $('.btns-box').css('display', 'none');
            $('.pro-main-container').css('padding', '0px');
            $('.method-box').css('padding', '0px');
            if (this.offlineThreadDump) {
                $('#savedThreaddump').css('padding', '0px');
                $('.ti3-tabs-container1').css('display', 'none');
                $('.tab-content').css('height', '970px');
            }
            if (this.isIntellij){
              $('#after-dump-file').css('height', 'calc(100%)');
              $('.lock-graph').css('height', 'calc(100% - 10px)');
              $('.split-line-toggle').css('height', 'calc(100% - 10px)');
              this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px 32px');
            }
            this.leftState = true;
            this.isFullScreen = true;
            this.onSetFullScreen(document);
        } else {
            this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color', 'initial');
            this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
            $('.leftListHeader').css('display', 'flex');
            $('.list-content').css('padding-top', '0px');
            $('.thread-tabs').css('display', 'flex');
            $('.profile-tabs').css('display', 'block');
            $('.btns-box').css('display', 'flex');
            $('.pro-main-container').css('padding', '40px 56px 0 80px');
            if (this.offlineThreadDump) {
                $('#savedThreaddump').css('padding', '40px 80px 0 80px');
                $('.ti3-tabs-container1').css('display', 'block');
                $('.tab-content').css('height', '860px');
            }
            if (this.isIntellij){
              $('.pro-main-container').css('padding', '23px 32px');
              if (this.offlineThreadDump) {
                $('#savedThreaddump').css('padding', '23px 32px');
              }
              $('#after-dump-file').css('height', 'calc(100% - 20px)');
              $('.lock-graph').css('height', 'calc(100% - 20px)');
              $('.split-line-toggle').css('height', 'calc(100% - 20px)');
            }
            this.leftState = false;
            this.isFullScreen = false;
            if (this.isIntellij && type === 'keyupEsc') {
              this.renderer2.setStyle(this.showFullEl.nativeElement, 'background-color',
                this.currTheme === this.ColorTheme.Dark ? '#313335' : '#fff');
              this.renderer2.setStyle(this.showFullEl.nativeElement, 'padding', '0px');
              $('.leftListHeader').css('display', 'flex');
              $('.list-content').css('padding-top', '0px');
              $('.thread-tabs').css('display', 'flex');
              $('.profile-tabs').css('display', 'block');
              $('.btns-box').css('display', 'flex');
              $('.pro-main-container').css('padding', '0px');
              $('.pro-main-container').css('padding', '23px 32px');
              if (this.offlineThreadDump) {
                $('#savedThreaddump').css('padding', '23px 32px');
                $('.ti3-tabs-container1').css('display', 'block');
                $('.tab-content').css('height', '860px');
              }
              $('#after-dump-file').css('height', 'calc(100% - 20px)');
              $('.lock-graph').css('height', 'calc(100% - 20px)');
              $('.split-line-toggle').css('height', 'calc(100% - 20px)');
              this.leftState = false;
              this.isFullScreen = false;
              this.onExitFullScreen(document);
            }
        }
        this.updateWebViewPage();
    }

    /**
     * 退出全屏
     * @param element dom
     */
    private onExitFullScreen(element: any) {
      if (element.exitFullscreen) {
        element.exitFullscreen();
      } else if (element.webkitExitFullscreen) {
        element.webkitExitFullscreen();
      } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      }
    }
    /**
     * 设置全屏
     * @param element dom
     */
    private onSetFullScreen(element: any) {
      if (element.requestFullScreen) {
        element.requestFullScreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.oRequestFullScreen) {
        element.oRequestFullScreen();
      } else if (element.msRequestFullScreen) {
        element.msRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
    /**
     * 显示类型切换
     */
    public datatypeChange(data: any): void {
        this.typeChange(data);
    }
    /**
     * 打开保存报告弹框
     */
    public openSaveReport() {
        this.saveReportTip =
         this.i18nService.I18nReplace(this.i18n.plugins_common_report.saveThreadDump.saveReportTip, {
            0: this.i18n.plugins_common_report.threaddumpReport,
        });
        if (!this.saveBtnDisable) {
            const currentSelectJvm = this.profileDownload.downloadItems.profileInfo.jvmName.split('/');
            this.reportName = currentSelectJvm[currentSelectJvm.length - 1];
            const saveRecordList: any = [];
            this.fileList.forEach((item, index) => {
                const saveRecordItem: any = {};
                saveRecordItem.label = item.name;
                saveRecordItem.startTime = item.startTime;
                if (this.treeStartTime === item.startTime) {
                    this.treeValue = index;
                }
                saveRecordList.push(saveRecordItem);
            });
            this.saveRecordOptions = saveRecordList;
            this.saveRecordSelecteds = [this.saveRecordOptions[this.treeValue]];
            this.saveThreadDump.open();
        }
    }
    /**
     * 取消线程转储
     */
    public onCloseThreadDumpReport() {
        this.startTimesBtnDisable = false;
        this.saveThreadDump.close();
    }
    public onStartTimesChange(event: any) {
        this.startTimesBtnDisable = this.saveRecordSelecteds.length > 0 ? false : true;
    }
    /**
     * 保存线程转储
     */
    public onSaveThreadDumpReport() {
        this.startTimes = [];
        this.saveRecordSelecteds.forEach((item: { startTime: string; }) => {
            this.startTimes.push(item.startTime);
        });
        const params = {
            startTimes: this.startTimes,
            reportName: this.reportName,
            comment: this.reportRemarks,
        };
        const guardianId = (self as any).webviewSession.getItem('guardianId');
        const jvmId = (self as any).webviewSession.getItem('jvmId');
        const option = {
            url: `/guardians/${guardianId}/jvms/${jvmId}/threadDump`,
            params
        };
        this.vscodeService.post(option, (res: any) => {
            if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                if (res.code === 0) {
                    this.threaddumpSaved = true;
                    this.vscodeService.postMessage({
                        cmd: 'savedReportShowInfo', data: {
                            taskId: res.data,
                            type: 'threaddump'
                        }
                    }, null);
                    this.vscodeService.showTuningInfo(res.message, 'info', 'saveData');
                } else {
                    this.vscodeService.showTuningInfo(res.message, 'warn', 'saveData');
                }
            } else {
                if (res.code === 0) {
                    this.threaddumpSaved = true;
                    this.vscodeService.postMessage({
                        cmd: 'savedReportShowInfo', data: {
                            taskId: res.data,
                            type: 'threaddump'
                        }
                    }, null);
                } else {
                    this.showInfoBox(res.message, 'warn');
                }
            }
        });
        this.saveThreadDump.close();
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
     * 处理内存转储数量
     */
    checkThreaddumpReportNum() {
        if (Number(this.threadReportNum) >= Number(this.maxThreadDumpCount)) {
            this.saveBtnDisable = true;
            this.saveBtnTip = this.i18nService.I18nReplace(this.i18n.plugins_common_report.heapdump_tips_content, {
                0: this.threadReportNum,
                1: this.maxThreadDumpCount
            });
            if (this.threaddumpSaved) {
                this.threaddumpSaved = false;
            }
        } else {
            this.saveBtnTip = this.i18n.plugins_common_report.saved_report;
            this.saveBtnDisable = false;
        }
    }
    public getImgStatus(item: any) {
        if (this.multiple) {
            return !item.children;
        } else {
            return this.currentTabName === 'graph' || !item.children;
        }
    }

    /**
     * 展示下拉框
     */
    showMenuList(){
      this.obersverOptions.map(item => {
        if (item.label === this.viewModel){
          item.isChecked = true;
        } else {
          item.isChecked = false;
        }
      });
      if (this.viewDownFlag){
        $('.obersver .menuList').css('display', 'none');
        this.viewDownFlag = false;
      } else {
        $('.obersver .menuList').css('display', 'block');
        this.viewDownFlag = true;
      }
    }

    /**
     * 比较下拉框
     */
    compareMenuList(){
      this.compareOptions.map(item => {
        if (item.label === this.compareModel){
          item.isChecked = true;
        } else {
          item.isChecked = false;
        }
      });
      if (this.compareDownFlag){
        $('.compare .menuList').css('display', 'none');
        this.compareDownFlag = false;
      } else {
        $('.compare .menuList').css('display', 'block');
        this.compareDownFlag = true;
      }
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
