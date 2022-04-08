import {Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, NgZone} from '@angular/core';
import {StompService} from '../../service/stomp.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { COLOR_THEME } from '../../service/vscode.service';
import { Utils } from '../../service/utils.service';
import { LibService } from '../../service/lib.service';
@Component({
    selector: 'app-sample-objects',
    templateUrl: './sample-objects.component.html',
    styleUrls: ['./sample-objects.component.scss']
})
export class SampleObjectsComponent implements OnInit, OnDestroy {
    constructor(
        private stompService: StompService,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: SamplieDownloadService,
        private libService: LibService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
    ) {
        this.i18n = this.i18nService.I18n();
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        } else {
            this.currTheme = COLOR_THEME.Dark;
        }
        this.leftTable.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_object_class.name,
                value: 'name'
            }
        ];
    }
    @ViewChild('stackTrace', { static: false }) stackTrace: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public stompClient: any;
    public recordId = (self as any).webviewSession.getItem('recordId');
    public topicUrl = '';
    public typeOptions: any[] = [];
    public typeSelected = {};
    public objectTlabs: any[] = [];

    // 表格部分
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public columns: Array<TiTableColumns> = [];
    public noDadaInfo = '';

    public memChart: any;
    public echartsInstance: any;
    public xLabels: any[] = [];
    public xLabelTime: any[] = [];
    public seriesData: any[] = [];
    public lineColor: any;
    public stepXlabel = 0;
    public yearsInfo = '';
    i18n: any;

    public dataLens = 0;
    public objDatas: Array<any> = [];

    // stack trace部分
    public stackTranceData: Array<TiTreeNode> = [];
    public stackTotalCount = 0;

    private currentSelClass: any;

    private wsFinishSub1: any;
    private wsFinishSub2: any;
    public stackTraceCache = {};
    public isFileFinish = false;
    public isStackFinish = false;
    public newStackTrace: any[] = [];
    public curentStacktrace: any[] = [];
    public newStackTraceMap = {};
    public eventType = 'OBJECT'; // 栈跟踪类型
    public index = ''; // 栈跟踪请求数据需要
    public stackTraceTime: any;
    public leftTable: any = {
        searchOptions: [],
        searchWords: [],
        searchKeys: []
    };
    public showLoading = false;
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };

    /**
     * showClassMemory
     * @param row row
     * @param index index
     */
    public showClassMemory(row: any, index: any) {
        this.srcData.data.forEach((item, idx) => { item.isSelect = index === idx; });
        this.seriesData = row.echartDatas.seriesData;
        this.xLabels = row.echartDatas.xLabels;
        this.yearsInfo = this.dateFormat(row.echartDatas.time[0], 'yyyy-MM-dd');
        this.stepXlabel = row.echartDatas.stepXlabel;
        this.handleStackTraceShow(row);
        this.currentSelClass = row;
        this.stackTraceTime = '';
        if (this.isStackFinish && this.isFileFinish) {
            this.getStraceTraceData();
        }
        this.initMem();
    }
    /**
     * handleStackTraceShow
     * @param row row
     */
    public handleStackTraceShow(row: any) {
        this.stackTotalCount = 0;
        this.curentStacktrace = [];
        this.stackTranceData = [];
        if (!this.newStackTrace.length) { return; }
        const currentStack = this.newStackTrace.find((item) => {
            return item.className === row.name;
        });
        if (!currentStack) { return; }
        this.curentStacktrace = currentStack.stackNode.children;
        this.curentStacktrace.forEach((item) => {
            this.stackTotalCount += item.count;
            this.stackTranceData.push({
                label: item.label,
                count: item.count,
                children: []
            });
        });
    }
    private getObject(data: any) {
        if (data.type === 'OBJECT') {
            this.srcData.data = [];
            this.objectTlabs = this.objectTlabs.concat(data.content);
            const srcDatas: any[] = [];
            this.objectTlabs.forEach((obj, idx) => {
                const echartDatas: any = {
                    xLabels: [],
                    time: [],
                    stepXlabel: 0,
                    seriesData: [],
                };
                const sortedSegMents = this.sortObjects(obj.segments);
                sortedSegMents.forEach((seg: any) => {
                    echartDatas.stepXlabel = seg.durationSec;
                    const xlabel = this.dateFormat(seg.startTimeMilliSec, 'hh:mm:ss');
                    echartDatas.xLabels.push(xlabel);
                    echartDatas.time.push(seg.startTimeMilliSec);
                    const estimatedSize = seg.estimatedSize ?
                     Math.floor(seg.estimatedSize / 1024 / 1024 * 1000) / 1000 : 0;
                    echartDatas.seriesData.push(estimatedSize);
                });
                srcDatas.push({
                    name: obj.className,
                    isSelect: idx === 0,
                    tlabSize: obj.estimatedSize,
                    formatSize: this.libService.onChangeUnit(obj.estimatedSize),
                    maxRealCount: obj.maxInstanceCount,
                    maxRealSize: obj.maxSize ? Math.floor(obj.maxSize * 1000 / 1024 / 1024) / 1000 : '',
                    stackTrace: [],
                    echartDatas
                });
            });
            this.srcData.data = srcDatas;
            this.totalNumber = this.srcData.data.length;
            this.showClassMemory(srcDatas[0], 0);
        }
    }

    /**
     * 页面初始化
     */
    ngOnInit() {
        this.noDadaInfo = this.i18n.common_term_task_nodata;

        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.columns = [
            {
                title: 'Class',
                sortKey: 'name',
                width: '30%'
            },
            {
                title: 'Maximum Real Time Count',
                sortKey: 'maxRealCount',
                width: '20%'
            },
            {
                title: 'Maximum Real Time Size',
                sortKey: 'maxRealSize',
                width: '20%'
            },
            {
                title: 'Total Allocation',
                sortKey: 'tlabSize',
                width: '20%'
            }
        ];
        this.recordId = this.getRecordId();

        this.msgService.sampleObjectIsLock = false;
        this.msgService.sampleObjectStackIsLock = false;
        this.handleImportCache();
        if (this.srcData.data.length === 0) {
            this.getSamplingData('object', this.recordId);
            this.getSamplingData('object_stacktrace', this.recordId);
            this.showLoading = true;
        } else {
            if (!this.isFileFinish || !this.isStackFinish) {
                this.msgService.handleSampleObjectResend();
            }
            setTimeout(() => {
                this.showClassMemory(this.srcData.data[0], 0);
            }, 0);
        }

        this.wsFinishSub1 = this.msgService.getSampleObjectMessage().subscribe((msg) => {
            if (msg.type === 'OBJECT') {
                if (msg.content === 'FINISH_FLAG') {
                    this.isFileFinish = true;
                    this.showLoading = false;
                    if (this.isStackFinish && this.isFileFinish) {
                        this.getStraceTraceData();
                    }
                    return;
                }
                this.getObject(msg);
            }
            if (msg.type === 'OBJECT_FRAMES_MAP') {
                this.handleObjectStackTracesMap(msg);
            }
        });
        this.wsFinishSub2 = this.msgService.getSampleObjectStacktraceMessage().subscribe((msg) => {
            if (msg.type === 'OBJECT_STACKTRACE') {
                if (msg.content === 'FINISH_FLAG') {
                    this.showLoading = false;
                    this.isStackFinish = true;
                    if (this.isStackFinish && this.isFileFinish) {
                        this.getStraceTraceData();
                    }
                    return;
                }
            }
        });
        this.updateWebViewPage();
    }

    /**
     * 切换页签
     */
    ngOnDestroy() {
        if (!this.isFileFinish || !this.isStackFinish) {
            this.msgService.sampleObjectIsLock = false;
            this.msgService.sampleObjectStackIsLock = false;
        }
        this.handleSaveCache();
        if (this.wsFinishSub1) { this.wsFinishSub1.unsubscribe(); }
        if (this.wsFinishSub2) { this.wsFinishSub2.unsubscribe(); }
        this.updateWebViewPage();
    }
    /**
     * handleStaceTrace
     * @param msg msg
     */
    public handleStaceTrace(msg: any) {
        this.newStackTrace = this.newStackTrace.concat(msg.content);
    }
    /**
     * handleObjectStackTracesMap
     * @param msg msg
     */
    public handleObjectStackTracesMap(msg: any) {
        this.newStackTraceMap = Object.assign(this.newStackTraceMap, msg.content);
    }
    /**
     * initMem
     */
    public initMem() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.lineColor = '#335fad';
        } else {
            this.lineColor = '#1f5dc8';
        }
        const that = this;
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const axisLabelColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#aaa';
        const option = {
            color: ['#1D55B6'],
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                },
                backgroundColor: this.currTheme === this.ColorTheme.Dark ? '#2a2a2a' : '#ffffff',
                borderRadius: 5,
                padding: [12, 16, 12, 16],
                boxShadow: 'rgba(0, 0, 0, 0.5)',
                textStyle: {
                    color: '#000000',
                    fontSize: 12
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                formatter: (params: any): any => {
                    if (!params.length) { return; }
                    let html = '';
                    params.forEach((item: any) => {
                        if (item.seriesName === that.i18n.protalserver_sampling_object_memory) {
                            const currentEData = this.currentSelClass.echartDatas;
                            const stepXlabel = currentEData.stepXlabel;
                            const idx = currentEData.xLabels.indexOf(item.name);
                            const time = currentEData.time[idx];
                            const year = that.dateFormat(currentEData.time[idx], 'yyyy-MM-dd');
                            if (this.currTheme === this.ColorTheme.Dark) {
                                html += `
                            <div style='color:#aaa'>
                                <div>
                                <span>At ${year + ' ' + that.dateFormat(time - stepXlabel * 1000,
                                   'hh:mm:ss')} - ${item.axisValue}</span>
                                </div>
                                <div style='margin-top:10px'>
                                <span style='width:8px;height:8px;display:inline-block;background:#3398DB;'></span>
                                <span >${that.i18n.protalserver_sampling_object_memory}[${stepXlabel}s] =
                                 ${item.data} MiB</span>
                                </div>
                            </div>
                            `;
                            }
                            if (this.currTheme === this.ColorTheme.Light) {
                                html += `
                            <div >
                                <div>
                                <span>At ${year + ' ' + that.dateFormat(time - stepXlabel * 1000,
                                   'hh:mm:ss')} - ${item.axisValue}</span>
                                </div>
                                <div style='margin-top:10px'>
                                <span style='width:8px;height:8px;display:inline-block;background:#3398DB'></span>
                                <span>${that.i18n.protalserver_sampling_object_memory}[${stepXlabel}s] =
                                 ${item.data} MiB</span>
                                </div>
                            </div>
                            `;
                            }
                        }
                    });
                    return html;
                }
            },
            grid: {
                top: '2%',
                left: '1%',
                right: '4%',
                bottom: '2%',
                containLabel: true,
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.xLabels,
                    axisTick: {
                        alignWithLabel: true,
                        lineStyle: {
                            color: axisLineColor
                        }
                    },
                    axisLine: {
                        lineStyle: { show: true, color: axisLineColor }
                    },
                    axisLabel: {
                        show: true,
                        interval: 'auto', // 坐标轴刻度标签的相关设置
                        textStyle: {
                            color: axisLabelColor
                        }
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',

                    axisLabel: {
                        formatter: '{value} MiB',
                        textStyle: {
                            color: axisLabelColor
                        }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: axisLineColor
                        }
                    },
                    axisLine: {
                        lineStyle: { show: true, color: axisLineColor }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'solid',
                            color: axisLineColor
                        }
                    }
                }
            ],
            series: [
                {
                    name: this.i18n.protalserver_sampling_object_memory,
                    type: 'bar',
                    barWidth: '35%',
                    data: this.seriesData,
                    itemStyle: {
                        normal: {
                            color: this.lineColor,
                        }
                    }
                }
            ]
        };
        this.memChart = option;
        setTimeout(() => {
            if (this.echartsInstance) {
                this.echartsInstance.setOption(this.memChart, true);
            }
        }, 200);
        this.updateWebViewPage();
    }
    /**
     * chartClick
     * @param e e
     */
    public chartClick(e: any) {
        if (this.currentSelClass) {
            this.stackTotalCount = 0;
            this.stackTranceData = [];
            this.curentStacktrace = [];
            const startTime = this.currentSelClass.echartDatas.time[e.dataIndex] / 1000;
            this.stackTraceTime = startTime;
            if (this.isStackFinish && this.isFileFinish) {
                this.getStraceTraceData();
            }
        }
    }

    /**
     * onChartInit
     * @param e e
     */
    public onChartInit(e: any) {
        this.echartsInstance = e;
        this.echartsInstance.on('click', () => {
        });
    }
    private sortObjects(objects: any) {
        const sortedObjs = objects.sort((a: any, b: any) => {
            return a.startTimeMilliSec - b.startTimeMilliSec;
        });
        return sortedObjs;
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
     * classDetail
     * @param name name
     */
    public classDetail(name: any) {
        if (name[0] === '[') {
            const newName = name.replace('[', '').replace(';', '') + '[]';
            return newName;
        } else {
            return name;
        }
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
    private getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }
    /**
     * 获取点击某行的栈信息
     */
    public getStraceTraceData() {
        const currentSelClass = this.currentSelClass ? `${this.currentSelClass.name}` : '';
        const stackTraceTime = this.stackTraceTime ? `#${this.stackTraceTime}` : '';
        this.index = encodeURIComponent(`${currentSelClass}${stackTraceTime}`);
        if (Object.keys(this.stackTrace.strackTraceMap).length === 0) {
            this.stackTrace.strackTraceMap = this.newStackTraceMap;
        }
        this.stackTrace.getStraceTraceData(this.index);
    }
    /**
     * 保存页签数据
     */
    public handleSaveCache() {
        this.downloadService.downloadItems.object.stackTraceMap = this.newStackTraceMap;
        this.downloadService.downloadItems.object.data = this.srcData.data;
        this.downloadService.downloadItems.object.isFileFinish = this.isFileFinish;
        this.downloadService.downloadItems.object.isStackFinish = this.isStackFinish;
    }
    /**
     * 导入页签数据
     */
    public handleImportCache() {
        this.srcData.data = this.downloadService.downloadItems.object.data;
        this.newStackTraceMap = this.downloadService.downloadItems.object.stackTraceMap;
        this.isFileFinish = this.downloadService.downloadItems.object.isFileFinish;
        this.isStackFinish = this.downloadService.downloadItems.object.isStackFinish;
        this.totalNumber = this.srcData.data.length;
    }

    /**
     * 搜索
     */
    public searchEvent(event: any): void {
        this.leftTable.searchKeys[0] = event.key;
        this.leftTable.searchWords[0] = event.value;
    }

    /**
     * intellij刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}
