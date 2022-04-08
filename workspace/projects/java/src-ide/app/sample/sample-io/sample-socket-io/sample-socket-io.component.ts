import { LibService } from './../../../service/lib.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData,
    TiTreeNode,
    TiTreeUtil
} from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { SamplieDownloadService } from '../../../service/samplie-cache.service';
import { Utils } from '../../../service/utils.service';
import { COLOR_THEME, VscodeService } from '../../../service/vscode.service';

@Component({
    selector: 'app-sample-socket-io',
    templateUrl: './sample-socket-io.component.html',
    styleUrls: ['./sample-socket-io.component.scss']
})
export class SampleSocketIoComponent implements OnInit, OnDestroy {
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    @ViewChild('stackTrace', { static: false }) stackTrace: any;
    socketIOWorker: Worker;
    constructor(
        private stompService: StompService,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: SamplieDownloadService,
        public vscodeService: VscodeService,
        public libService: LibService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.echartsTitle = this.i18n.io.fileIo.socketIORate;
        this.echartsLegendData = [this.i18n.io.fileIo.readRate, this.i18n.io.fileIo.writeRate];
    }
    private K = 1024;
    private MB = 1024 * 1024;
    private GB = 1024 * 1024 * 1024;
    private TB = 1024 * 1024 * 1024 * 1024;
    private μs = 1000;
    private ms = Math.pow(1000, 2);
    private s = Math.pow(1000, 3);
    public i18n: any;
    public selectTable: any;
    public selectTableIndex: any[] = [];
    public firstIndex: any;
    public secondIndex: any;
    public thirdIndex: any;
    public chartId = Math.floor(window.crypto.getRandomValues(new Uint8Array(1))[0] * 0.001 * 10000000000);
    public closeLoad = true;
    public tableListData: any[] = [];
    public socketIOData = {};
    public echartsOption: any = {
        timeList: [],
        readSpeed: [],
        writeSpeed: []
    };
    public echartsOptions: any = {};
    public recordId: any;
    public filePathSelect = '';
    public fileFdSelected = '';
    public filethreadSelect = '';
    // 左侧 表格部分
    public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcDataTable: TiTableSrcData;
    public columnsTable: Array<TiTableColumns> = [];
    public closeOtherDetails = true;
    public noDadaInfo = '';
    public thirdLevel = false;
    public expand = false;

    // echarts
    public echartsInterval: any;
    public echartsName: any;
    public tableFileName: string;
    public tableFileId: any;
    public echartsLegendData: any[] = [];
    public updateOption: any = {};
    // 栈
    public stackTranceData: Array<TiTreeNode> = [];
    selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
        this.stackTranceData,
        false,
        false
    );
    public totalCountMonitor: any;

    public wsFinishSub1: any;
    public wsFinishSub2: any;
    public fileDatas: any;
    public echartsTitle: string;
    public ioData: any[] = [];
    public totalCount = 0;
    public isFileFinish = false;
    public isStackFinish = false;
    public timeData: any[] = [];
    public echartsInstance: any = {};
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public eventType = 'SOCKET_IO';
    public index = '';
    public borderColor = '';
    public newStackTraceMap = {};
    public searchWords: Array<string> = [];
    public searchKeys: Array<string> = ['path'];
    public searchOptions: any[] = [];

    // 表格分页
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    /**
     * ngOnInit
     */
    ngOnInit() {
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        // 左侧
        this.columnsTable = [
            {
                title: '',
            },
            {
                title: this.i18n.io.fileIo.smapSocketPath,
                width: '13%',
                sortKey: 'path'
            },
            {
                title: this.i18n.io.fileIo.totalTime,
                width: '13%',
                sortKey: 'totalIOTime',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.count,
                width: '13%',
                sortKey: 'totalCount',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.readCount,
                width: '13%',
                sortKey: 'readCount',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.writeCount,
                width: '13%',
                sortKey: 'writeCount',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.readByteCount,
                width: '13%',
                sortKey: 'bytesRead',
                isSort: true
            },
            {
                title: this.i18n.io.fileIo.writeByteCount,
                width: '13%',
                sortKey: 'bytesWritten',
                isSort: true
            }
        ];
        this.srcDataTable = {
            data: this.tableListData,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.searchOptions = [
            {
                label: this.i18n.plugins_perf_java_profiling_fileIO_address,
                value: 'path'
            }
        ];
        this.recordId = this.getRecordId();
        this.msgService.sampleSocketIOIsLock = false;
        this.msgService.sampleSocketIOStackIsLock = false;
        this.handleImportCache();
        if (this.tableListData.length === 0) {
            this.getSamplingData('socket_io', this.recordId);
            this.getSamplingData('socket_stacktrace', this.recordId);
            this.showLoding();
        } else {
            this.closeLoad = true;
            this.srcDataTable.data = this.tableListData;
            this.totalNumber = this.srcDataTable.data.length;
            this.initChart();
            setTimeout(() => {
                this.onDefaultClick();
            }, 0);
            if (!this.isFileFinish || !this.isStackFinish) {
                this.msgService.handleSampleSocketIOResend();
            }
        }
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.closeLoad = true;
        }
        if (typeof Worker !== 'undefined') {
            // 为解决跨域调用问题，将脚本内嵌在index.html中，通过下述语句获取脚本内容并创建子线程
            const blob = new Blob([document.querySelector('#sample-socket-io-worker').textContent]);
            const url = window.URL.createObjectURL(blob);
            // 创建子线程
            this.socketIOWorker = new Worker(url);
            this.socketIOWorker.onmessage = ({ data }) => {
                this.tableListData.push(...data.tableListData);
                this.srcDataTable.data = this.tableListData;
                this.totalNumber = this.srcDataTable.data.length;
                if (this.isStackFinish) {
                    setTimeout(() => {
                        this.onDefaultClick();
                    }, 0);
                }
            };
        } else {
        }
        this.wsFinishSub1 = this.msgService.getSampleSocketMessage().subscribe((msg) => {
            if (msg.type === 'SOCKET_IO') {
                if (msg.content === 'FINISH_FLAG') { this.closeLoding(); this.isFileFinish = true; return; }
                if (this.socketIOWorker) {
                    this.socketIOWorker.postMessage({
                        type: 'sSocketioWorker',
                        data: msg
                    });
                }
            }
        });
        this.wsFinishSub1 = this.msgService.getSampleSocketStacktraceMessage().subscribe((msg) => {
            if (msg.type === 'SOCKET_STACKTRACE' && msg.content === 'FINISH_FLAG') {
                this.closeLoding();
                this.isStackFinish = true;
                this.initChart();
                setTimeout(() => {
                    this.onDefaultClick();
                }, 0);
                return;
            }
            if (msg.type === 'SOCKET_IO_MAP') {
                this.handleStacktrace(msg);
            }
        });
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
        if (!this.isFileFinish || !this.isStackFinish) {
            this.msgService.sampleSocketIOIsLock = true;
            this.msgService.sampleSocketIOStackIsLock = true;
        }
        this.handleSaveCache();
        if (this.wsFinishSub1) { this.wsFinishSub1.unsubscribe(); }
        if (this.wsFinishSub2) { this.wsFinishSub2.unsubscribe(); }
        this.closeLoding();
        if (this.socketIOWorker) {
            this.socketIOWorker.postMessage({
                type: 'sSocketioWorker_close',
                data: {}
            });
        }
    }

    /**
     * handleViewData
     * @param threadsData threadsData
     */
    public handleViewData(threadsData?: any): any {
        if (threadsData) {
            return Object.values(threadsData);
        }
    }
    /**
     * handleStacktrace
     * @param data data
     */
    public handleStacktrace(data: any) {
        this.newStackTraceMap = data.content[0];
    }
    /**
     * handleBasicIOData
     * @param target target
     * @param path path
     * @param baseIO baseIO
     */
    public handleBasicIOData(target: any, path: any, baseIO: any) {
        if (!target[path]) {
            target[path] = {
                path,
                stackTrace: [],
                threads: {}
            };
        }
        target[path].stackTrace = baseIO.stackTraceTreeNode.children;
    }
    /**
     * 默认点击第一条
     */
    public onDefaultClick() {
        if (!this.echartsName) {
            if (this.tableListData[0]) {
                this.tableListData[0].showDetails = false;
            }
            this.onClickTableRow(this.tableListData[0], 0);
        }
    }
    /**
     * onClickTableRow
     * @param row row
     * @param arg arg
     */
    public onClickTableRow(row: any, ...arg: any) {
        if (row) {
            this.handleEchartsData(row, arg);
            this.handleTableSelect(row, arg);
        }
    }
    /**
     * handleTableSelect
     * @param row row
     * @param arg arg
     */
    public handleTableSelect(row: any, arg: any) {
        if (arg.length === 1) {
            this.filePathSelect = row.path;
            this.fileFdSelected = '';
            this.filethreadSelect = '';
            this.beforeToggle(1, row);
        } else if (arg.length === 2) {
            this.fileFdSelected = row.path;
            this.filethreadSelect = '';
            this.handleFdSelectShow(row, arg);
        } else {
            this.filethreadSelect = row.path;
        }
        if (this.isStackFinish) {
            this.getStraceTraceData();
        }
    }
    private handleFdSelectShow(row: any, arg: any) {
        const path = row.path;
        const data: any = this.tableListData[arg[0]].threads;
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (path === key) {
                    this.tableListData[arg[0]].threads[key].showDetails =
                     !this.tableListData[arg[0]].threads[key].showDetails;
                } else {
                    this.tableListData[arg[0]].threads[key].showDetails = false;
                }
            }
        }
    }
    /**
     * handleEchartsData
     * @param row row
     * @param arg arg
     */
    public handleEchartsData(row: any, arg: any) {
        this.echartsName = this.handleEchartsName(row, arg);
        this.echartsOption.timeList = this.hanldeEchartsTimeZone(row.timeList);
        this.echartsOption.readSpeed = row.readSpeed;
        this.echartsOption.writeSpeed = row.writeSpeed;
        this.handleEchartsUpdate();
        setTimeout(() => {
            this.buildTimeLine(this.echartsOption.timeList);
        }, 0);
    }
    /**
     * handleEchartsName
     * @param row row
     * @param arg arg
     */
    public handleEchartsName(row: any, arg: any) {
        if (arg.length === 1) {
            return row.path;
        } else if (arg.length === 2) {
            const firstName = this.tableListData[arg[0]].path;
            return `${firstName}[${row && row.path}]`;
        } else {
            const firstName = this.tableListData[arg[0]].path;
            const setcondName = this.handleViewData(this.tableListData[arg[0]].threads)[arg[1]].path;
            return `${firstName}(${setcondName}[${row && row.path}])`;
        }
    }
    /**
     * hanldeEchartsTimeZone
     * @param timeZone timeZone
     */
    public hanldeEchartsTimeZone(timeZone: any) {
        let time = [];
        time = timeZone.map((item: any) => {
            return this.handleTimeFormat(item * 1000);
        });
        return time;
    }
    /**
     * handleTimeFormat
     * @param time time
     */
    public handleTimeFormat(time: any) {
        const date = new Date(time);
        return `${date.getHours() < 10 ?
            '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ?
                '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ?
                   '0' + date.getSeconds() : date.getSeconds()}`;
    }
    /**
     * handleEchartsUpdate
     */
    public handleEchartsUpdate() {
        const max1 = this.echartsOption.readSpeed;
        const max2 = max1.concat(this.echartsOption.writeSpeed);
        let echartsLabelTop = Math.ceil(Math.max(...max2));
        if (echartsLabelTop % 2 > 0) {
            echartsLabelTop += 1;
        }
        this.updateOption = {
            xAxis: [{
                data: this.echartsOption.timeList,
                axisLabel: {
                    interval: this.echartsOption.timeList.length < 11 ? 0 :
                        Math.floor((this.echartsOption.timeList.length / 11))
                }
            }],
            yAxis: [{
                max: echartsLabelTop,
                interval: echartsLabelTop / 2
            }],
            series: [{
                id: 'series1',
                data: this.echartsOption.readSpeed
            }, {
                id: 'series2',
                data: this.echartsOption.writeSpeed
            }]
        };
    }

    /**
     * 栈
     * @param event event
     */
    public onSelect(event: TiTreeNode): void {
        this.selectedData = TiTreeUtil.getSelectedData(
            this.stackTranceData,
            false,
            false
        );
    }
    /**
     * 展开整个树
     */
    public expandNode(): void {
        const data: Array<TiTreeNode> = this.stackTranceData.concat();
        TiTreeUtil.traverse(data, traverseFn);
        function traverseFn(node: TiTreeNode): void {
            node.expanded = true;
        }
        this.stackTranceData = data;
    }
    /**
     * 点击后表格改变表格高度
     */
    public onClickExpand(): void {
        this.expand = !this.expand;
    }
    private showLoding() {
        this.closeLoad = false;
        document.getElementById('sample-loading-box').style.display = 'flex';
    }
    private closeLoding() {
        document.getElementById('sample-loading-box').style.display = 'none';
        this.closeLoad = true;
    }
    /**
     * 字节单位转换
     * @param num num
     */
    public onChangeUnit(num: any): any {
        if (num < this.K) {
            return num.toFixed(2) + 'B';
        } else if (this.K < num && num < this.MB) {
            const bytes = (num / this.K).toFixed(2);
            return bytes + 'KB';
        } else if (this.MB < num && num < this.GB) {
            const bytes = (num / this.MB).toFixed(2);
            return bytes + 'MB';
        } else if (this.GB < num && num < this.TB) {
            const bytes = (num / this.GB).toFixed(2);
            return bytes + 'GB';
        }
    }
    /**
     * io时间单位
     * @param time time
     */
    public onChangeTime(time: any): any {
        if (time < this.μs) {
            return time.toFixed(2) + 'ns';
        } else if (this.μs < time && time < this.ms) {
            return (time / this.μs).toFixed(2) + 'μs';
        } else if (this.ms < time && time < this.s) {
            return (time / this.ms).toFixed(2) + 'ms';
        } else if (this.s < time) {
            return (time / this.s).toFixed(2) + 's';
        }
    }
    /**
     * 初始化echarts表格
     */
    public initChart() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.borderColor = 'rgba(50,50,50,0)';
        } else {
            this.borderColor = '';
        }
        const that = this;
        const textColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#E8E8E8';
        const bgColor = this.currTheme === COLOR_THEME.Light ? '#ffffff' : '#424242';
        const timeColor = this.currTheme === COLOR_THEME.Light ? '#616161' : '#aaaaaa';
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const axisLabelColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#aaa';
        this.echartsOptions = {
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                backgroundColor: bgColor,
                borderRadius: 5,
                borderColor: this.borderColor,
                boxShadow: 'rgba(0, 0, 0, 0.5)',
                formatter: (params: any) => {
                    const item = params[0];
                    const itemWrite = params[1];
                    let html = '';
                    const zeroDecimal = '0.000';
                    if (params.length === 1) {
                        let value = zeroDecimal;
                        value = that.libService.onChangeUnit(item.data * 1024);
                        html += `
                            <div style='padding:10px;'>
                                <div style="color: ${timeColor}">${item.axisValueLabel}</div>
                                <div style='margin-top:5px'>
                                    <span style="display:inline-block;margin-right: 8px;width: 8px;height: 8px;
                                    background-color:${item.color};"></span>
                                    <span style='width:80px;display:inline-block;
                                    color:${textColor}'>${item.seriesName}</span>
                                    <span style="color:${textColor}">${value}/s</span>
                                </div>
                            </div>
                         `;
                    } else {
                        let read = zeroDecimal;
                        let write = zeroDecimal;
                        if (item) {
                            read = that.libService.onChangeUnit(item.data * 1024);
                        }
                        if (itemWrite) {
                            write = that.libService.onChangeUnit(itemWrite.data * 1024);
                        }
                        html += `
                        <div style='padding:10px;color: ${timeColor}'><div>${params[0].axisValueLabel}</div>
                          <div style='margin-top:5px'>
                            <span style="display:inline-block;margin-right: 8px;width: 8px;
                            height: 8px;background-color:#3d7ff3;"></span>
                            <span style='width:80px;display:inline-block;
                            color:${textColor}'>${this.i18n.io.fileIo.readRate}</span>
                            <span style="color:${textColor}">${read}/s</span>
                          </div>
                          <div style='margin-top:5px'>
                            <span style="display:inline-block;margin-right: 8px;
                            width: 8px;height: 8px;background-color:#2da46f;"></span>
                            <span style='width:80px;display:inline-block;
                            color:${textColor}'>${this.i18n.io.fileIo.writeRate}</span>
                            <span style="color:${textColor}">${write}/s</span>
                          </div>
                        </div>
                          `;
                    }
                    return html;
                }
            },
            dataZoom: [{
                type: 'inside'
            }],
            legend: {
                data: [this.i18n.io.fileIo.readRate, this.i18n.io.fileIo.writeRate],
                right: 25,
                selectedMode: true,
                textStyle: {
                    color: axisLabelColor
                },
                icon: 'rect',
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 24
            },
            grid: {
                left: 5,
                right: 25,
                bottom: '1%',
                top: 30,
                containLabel: true
            },
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
                            color: axisLabelColor,
                        },
                    },
                    axisTick: {
                        show: true,
                        alignWithLabel: true,
                    },
                    data: this.echartsOption.timeList,
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    show: true,
                    min: 0,
                    axisLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: true,
                        color: axisLabelColor,
                        formatter: (value: any) => {
                            return  `${that.libService.onChangeUnit(value * 1024)}/s`;
                        }
                    },
                    axisTick: {
                        show: false
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
                    id: 'series1',
                    name: this.i18n.io.fileIo.readRate,
                    type: 'line',
                    showSymbol: false,
                    itemStyle: {
                        normal: {
                            color: '#3d7ff3',
                        },
                    },
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
                    data: this.echartsOption.readSpeed
                },
                {
                    id: 'series2',
                    name: this.i18n.io.fileIo.writeRate,
                    type: 'line',
                    showSymbol: false,
                    itemStyle: {
                        normal: {
                            color: '#2da46f',
                        },
                    },
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
                    data: this.echartsOption.writeSpeed
                }
            ]
        };
    }
    private getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }
    /**
     * getSamplingData
     * @param type type
     * @param data data
     */
    public getSamplingData(type: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${data}/${encodeURIComponent(uuid)}/${type}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: type.toUpperCase(),
            uuid
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
     * 时间轴变化数据改变
     */
    public timeLineData(data: any) {
        this.echartsOptions.dataZoom[0].start = data.start;
        this.echartsOptions.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.echartsOptions.dataZoom
        });
    }
    private buildTimeLine(data: any) {
        const arr = [];
        const interval = this.updateOption.xAxis[0].axisLabel.interval;
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
     * 获取点击某行的栈信息
     */
    public getStraceTraceData() {
        const filePath = this.filePathSelect;
        const fileFd = this.fileFdSelected ? `#${this.fileFdSelected}` : '';
        const thread = this.filethreadSelect ? `#${this.filethreadSelect}` : '';
        this.index = encodeURIComponent(`${filePath}${fileFd}${thread}`);
        if (!Object.keys(this.stackTrace.strackTraceMap).length) {
            this.stackTrace.strackTraceMap = this.newStackTraceMap;
        }
        this.stackTrace.getStraceTraceData(this.index);
    }
    /**
     * 展开之前
     * @param row 某行
     */
    public beforeToggle(level: any, row: TiTableRowData): void {
        if (level === 2) {
            return;
        }
        row.showDetails = !row.showDetails;
    }
    /**
     * 保存页签数据
     */
    public handleSaveCache() {
        this.downloadService.downloadItems.socketIO.stackTraceMap = this.newStackTraceMap;
        this.downloadService.downloadItems.socketIO.data = this.tableListData;
        this.downloadService.downloadItems.socketIO.isFileFinish = this.isFileFinish;
        this.downloadService.downloadItems.socketIO.isStackFinish = this.isStackFinish;
    }
    /**
     * 导入页签数据
     */
    public handleImportCache() {
        this.tableListData = this.downloadService.downloadItems.socketIO.data;
        this.newStackTraceMap = this.downloadService.downloadItems.socketIO.stackTraceMap;
        this.isFileFinish = this.downloadService.downloadItems.socketIO.isFileFinish;
        this.isStackFinish = this.downloadService.downloadItems.socketIO.isStackFinish;
    }
    /**
     * 搜索
     */
    public searchEvent(event: any): void {
        this.searchWords[0] = event.value;
    }
}
