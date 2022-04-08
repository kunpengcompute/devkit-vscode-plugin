import { LibService } from './../../service/lib.service';
import {
    Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, ChangeDetectorRef, NgZone
} from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { Utils } from '../../service/utils.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import * as echarts from 'echarts/core';

@Component({
    selector: 'app-sample-leak',
    templateUrl: './sample-leak.component.html',
    styleUrls: ['./sample-leak.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SampleLeakComponent implements OnInit, OnDestroy {
    @ViewChild('timeLine', { static: false }) timeLine: any;
    @ViewChild('suggestion', { static: false }) suggestion: any;
    public wsFinishSub: Subscription;
    public wsFinishSub1: Subscription;
    public recordId = '';
    public finishLeak = false;
    public finishReport = false;
    public stackPool: any;
    public referPool: any;
    public oldSample: any;
    public oldDatas: any = [];
    public optionsEcharts: any;
    public leakSrcData: TiTableSrcData;
    public leakDisplayed: Array<TiTableRowData> = [];
    public leakColumns: Array<TiTableColumns> = [];
    i18n: any;
    public myOptionsRight: Array<any> = [
        { label: this.i18nService.I18n().protalserver_sampling_leak.stack, id: 'stack' },
        { label: this.i18nService.I18n().protalserver_sampling_leak.reference, id: 'refer' }
    ];
    public mySelect2: any = this.myOptionsRight[0];
    public headerSearch: any = {
        placeholder: 'please input search key',
        value: ''
    };
    // 栈帧池
    public statckDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public stackSrcData: TiTableSrcData;
    public stackColumns: Array<TiTableColumns> = [
        {
            title: 'stackPool',
            width: '100%'
        }
    ];
    // 引用链
    public referDisplayed: Array<TiTableRowData> = [];
    public referSrcData: TiTableSrcData;
    public referColumns: Array<TiTableColumns> = [{ title: 'referPool', width: '100%' }];
    public pageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public pool = true;
    public stackPageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public currentPage = 1;
    public stackCurrentPage = 1;
    public referCurrentPage = 1;
    public referPageSize: { options: Array<number>; size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public searchWords: Array<string> = [this.headerSearch.value];
    public searchKeys: Array<string> = ['objects'];
    public searchOptions: any[] = [];
    public noDadaInfo = '';
    //  echarts
    public leakViewOption: any;
    public echartsInstance: any;
    public gridHeight = 100;
    public baseColor = '#e6ebf5';
    public ylabelColor = '#999';
    public baseTop = 30;
    public getDataTimer: any = null;
    public echartsLabel: any;
    public suggetNum = 1;
    public hoverClose: any;
    public isSuggest = false;
    public suggestArr: any[] = [];
    public timeData: any[] = [];
    public sugHeight = true;
    public showLoading = false;

    constructor(
        private stompService: StompService,
        private i18nService: I18nService,
        private downloadService: SamplieDownloadService,
        private msgService: MessageService,
        private utils: Utils,
        private libService: LibService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private vscodeService: VscodeService
    ) {
        this.i18n = this.i18nService.I18n();
        // vscode颜色主题
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
        this.headerSearch.placeholder = this.i18nService.I18nReplace(
            this.i18n.searchBox.info,
            {
                0: this.i18n.protalserver_sampling_leak.object
            }
        );
        this.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_leak.object,
                value: 'objects'
            }
        ];
    }
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    /**
     * ngOnInit 初始化数据
     */
    ngOnInit() {
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.recordId = this.getRecordId();
        this.leakSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.stackSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.referSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.leakColumns = [
            {
                title: 'time',
                width: '25%',
                sortKey: 'time'
            },
            {
                title: 'object',
                width: '25%',
                sortKey: 'objects'
            },
            {
                title: 'thread',
                width: '25%',
                sortKey: 'thread'
            },
            {
                title: 'stackSize',
                width: '25%',
                sortKey: 'stackSize'
            }
        ];
        this.importCache();
        if (!this.finishLeak) {
            this.getSamplingData('old_object_sample', this.recordId);
            this.showLoading = true;
        } else {
            this.getOldSample();
            if (this.leakSrcData.data[0]) {
                this.getPoolValue(this.leakSrcData.data[0]);
            }
            this.setOption();
            this.showLoading = false;
            return;
        }
        if (!this.finishReport) {
            this.getSamplingData('analyse_report', this.recordId);
        }
        this.wsFinishSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'wsFinish') {
                this.showLoading = false;
                this.parseData();
            }
            if (msg.type === 'leak') {
                this.suggestArr = this.downloadService.downloadItems.leak.suggestArr;
            }
        });
        this.wsFinishSub1 = this.msgService.getSampleAnalysMessage().subscribe((msg) => {
            if (msg.type === 'ANALYSE_REPORT' && msg.content === 'FINISH_FLAG') {
                this.showLoading = false;
                this.finishReport = true;
            }
            if (msg.type === 'MEMORY_LEAK') {
                msg.content.forEach((item: any) => {
                    item.sugHeight = false;
                    this.suggestArr.push(item);
                });
            }
        });
        if (this.suggestArr.length === 0) {
            this.suggestArr = this.downloadService.downloadItems.leak.suggestArr;
        }
        this.updateWebViewPage();
    }
    /**
     * ngOnDestroy 销毁构造函数
     */
    ngOnDestroy() {
        clearTimeout(this.getDataTimer);
        this.getDataTimer = null;
        this.downloadService.downloadItems.leak.isFinish = this.finishLeak;
        this.downloadService.downloadItems.leak.oldSample = this.oldSample;
        this.downloadService.downloadItems.leak.stackPool = this.stackPool;
        this.downloadService.downloadItems.leak.referPool = this.referPool;
        this.downloadService.downloadItems.leak.finishReport = this.finishReport;
        this.downloadService.downloadItems.leak.suggestArr = this.suggestArr;
    }
    /**
     * 悬浮关闭
     */
    public onHoverClose(msg?: any) {
        this.hoverClose = msg;
    }
    /**
     * 获取数据
     */
    public getSamplingData(type: any, data: any) {
        const uuid = Utils.generateConversationId(8);
        const requestUrl = `/user/queue/sample/records/${encodeURIComponent(data)}/${encodeURIComponent(uuid)}/${type}`;
        this.stompService.subscribeStompFn(requestUrl);
        this.stompService.startStompRequest('/cmd/sub-record', {
            recordId: data,
            recordType: type.toUpperCase(),
            uuid
        });
        this.updateWebViewPage();
    }
    /**
     * 更改高度
     */
    public changeHeight(idx: any) {
        this.suggestArr[idx].sugHeight = !this.suggestArr[idx].sugHeight;
    }
    /**
     * 打开优化弹框
     */
    public openSuggest() {
        this.isSuggest = true;
    }
    /**
     * 关闭优化弹框
     */
    closeSuggest() {
        this.hoverClose = '';
        this.isSuggest = false;
    }
    /**
     * 引用链与栈帧池的切换
     */
    public dataChange(data: any) {
        if (data.id === 'stack') {
            this.pool = true;
        } else {
            this.pool = false;
        }
    }
    /**
     * 获取recordID
     */
    public getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }
    /**
     * 格式化
     */
    private parseData() {
        if (!this.stompService.sampleDatas11.length) {
            return;
        }
        let old: any[] = [];
        this.oldDatas = this.stompService.sampleDatas11;
        this.oldDatas.forEach((item: any) => {
            if (item.type === 'OLD_OBJECT_SAMPLE' && item.content === 'FINISH_FLAG') {
                this.finishLeak = true;
                return;
            }
            if (item.type === 'OLD_STACK_POOL') {
                Object.assign(this.stackPool, item.content);
            }
            if (item.type === 'OLD_OBJECT_SAMPLE' && item.content !== 'FINISH_FLAG') {
                old.push(...item.content);
            }
            if (item.type === 'REFER_POOL') {
                Object.assign(this.referPool, item.content);
            }
        });
        this.oldSample = old;
        old = [];
        this.getOldSample();
        if (this.leakSrcData.data[0]) {
            this.getPoolValue(this.leakSrcData.data[0]);
        }
        this.setOption();
        this.oldDatas = [];
    }
    /**
     * 获取oblObjectSample的数据
     */
    public getOldSample() {
        let leakColumns = this.oldSample;
        this.leakSrcData.data = [];
        const oldObject: any[] = [];
        leakColumns.forEach((leak: any, index: number) => {
            oldObject.push({
                isSelect: index === 0,
                time: this.format(leak[0]),
                timeyear: this.utils.dateFormat(leak[0], 'hh:mm:ss'),
                objects: leak[1],
                thread: leak[2],
                stackSize: this.getMib(leak[3]),
                formatSize: this.libService.onChangeUnit(leak[3]),
                refer: leak[5],
                stack: leak[4],
                group: leak[6]
            });
        });
        leakColumns = [];
        this.sortEchartsData(oldObject);
        this.leakSrcData.data = oldObject;
        this.optionsEcharts = oldObject;
        this.getEcharts(oldObject[0]);
        this.updateWebViewPage();
    }
    /**
     * echarts数据配置
     */
    public setOption() {
        let tipBgColor = '#424242';
        let fontColor = '#e8e8e8';
        if (this.currTheme === COLOR_THEME.Light) {
            tipBgColor = '#fffff';
            fontColor = '#222222';
        }
        const time: any[] = [];
        const size: any[] = [];
        const timeyear: any[] = [];
        this.echartsLabel.forEach((item: any) => {
            timeyear.push(item.timeyear);
            time.push(item.time);
            size.push(item.stackSize);
        });
        this.timeData = timeyear.map((str) => {
            return str.replace(' ', '\n');
        });
        const maxValue = (Math.max(...size) + 10).toFixed(0);
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const axisLabelColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#aaa';
        const option = {
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    label: {
                        backgroundColor: '#478cf1'
                    }
                },
                backgroundColor: this.currTheme === COLOR_THEME.Light ? '#fff' : '#222222',
                borderRadius: 5,
                padding: [12, 16, 12, 16],
                textStyle: {
                    color: fontColor,
                    fontSize: 12
                },
                formatter: (params: any): any => {
                    if (params.length) {
                        const t = time[params[0].dataIndex];
                        let html = ``;
                        html += `<div><div style="color:#aaa">${t}</div>
                `;
                        params.forEach((param: any) => {
                            html += `
                <div style='margin-top:10px'>
                  <span style="display: inline-block;width: 8px;height: 8px;
                  background-color:#3266C3;margin-right: 3px;"></span>
                  <span style='width:150px;display:inline-block'>${param.seriesName}</span>
                  <span >${param.data}MiB</span>
                </div>
                `;
                        });
                        html += `</div>`;
                        return html;
                    }
                }
            },
            grid: {
                top: '10%',
                left: '5',
                right: '10',
                bottom: '5%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: timeyear.map((str) => {
                        return str.replace(' ', '\n');
                    }),
                    boundaryGap: false,
                    axisTick: {
                        show: true
                    },
                    axisPointer: {
                        lineStyle: { show: true, color: '#7E8083' }
                    },
                    axisLine: {
                        lineStyle: { show: true, color: axisLineColor }
                    },
                    axisLabel: {
                        align: 'center',
                        color: axisLabelColor,
                    },
                    gridIndex: 0
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    max: maxValue,
                    min: 0,
                    axisLabel: {
                        formatter: (params: any) => {
                            return this.utils.setThousandSeparator(params) + 'MiB';
                        },
                        textStyle: { color: axisLabelColor },
                        show: true,
                    },
                    splitLine: {
                        lineStyle: { show: true, color: axisLineColor },
                    },
                    axisTick: { show: false },
                    axisLine: { show: false },
                    interval: maxValue
                },
            ],
            series: [
                {
                    name: this.i18n.protalserver_sampling_leak.size,
                    type: 'line',
                    stack: 'size',
                    lineStyle: {
                        color: '#3266C3'
                    },
                    itemStyle: {
                        normal: {
                            color: '#3266C3'
                        }
                    },
                    showSymbol: false,
                    symbolSize: 6,
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(50,102,195,0.75)'
                                },
                                {
                                    offset: 0.7,
                                    color: 'rgba(50,102,195,0.1)'
                                }
                            ])
                        }
                    },
                    data: size
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0],
                }
            ]
        };
        this.sortTime(time);
        this.leakViewOption = option;
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
        this.updateWebViewPage();
    }
    /**
     * timeLineData
     * @param data data
     */
    public timeLineData(data: any) {
        this.leakViewOption.dataZoom[0].start = data.start;
        this.leakViewOption.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.leakViewOption.dataZoom
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
    /**
     * 根据key获取栈的value
     */
    public getPoolValue(row: any) {
        let data: any[] = [];
        row.stack.forEach((temp: any) => {
            this.stackPool.map((item: any, index: number) => {
                if (index === temp) {
                    data.push(item);
                }
            });
        });
        let pool: any[] = [];
        row.refer.forEach((temp: any) => {
            this.referPool.map((item: any, index: number) => {
                if (index === temp[0]) {
                    const strPool = temp[1] === '' ? item : `${item}:${temp[1]}`;
                    pool.push(strPool);
                }
            });
        });
        this.getStackPool(data);
        this.getReferPool(pool);
        data = [];
        pool = [];
    }
    /**
     * 获取同类型的echarts数据
     */
    public getEcharts(row: any) {
        let echartsLabel = this.optionsEcharts.filter((item: any) => {
            return item.group === row.group;
        });
        this.echartsLabel = echartsLabel;
        echartsLabel = [];
    }
    /**
     * 获取同类型的echarts数据
     */
    public leakClear(value: string): void {
        this.searchWords[0] = '';
        this.getOldSample();
    }
    /**
     * leak搜索
     */
    public leakSearch(value: string): void {
        this.getOldSample();
        const reg = new RegExp(value);
        const data: any[] = [];
        this.leakSrcData.data.map((item) => {
            if (reg.test(item.objects)) {
                data.push(item);
            }
        });
        this.leakSrcData.data = data;
    }
    /**
     * 栈帧池
     */
    public getStackPool(oldStackPool: any) {
        this.stackSrcData.data = [];
        for (const i of oldStackPool) {
            this.stackSrcData.data.push({ stack: i });
        }
        oldStackPool = [];
    }
    /**
     * 栈帧池
     */
    public getPool(row: any) {
        this.getPoolValue(row);
        this.getEcharts(row);
        this.setOption();
        this.leakSrcData.data.forEach((item) => {
            item.isSelect = false;
        });
        row.isSelect = true;
    }
    /**
     * 引用链
     */
    public getReferPool(referPool: any) {
        this.referSrcData.data = [];
        for (const i of referPool) {
            this.referSrcData.data.push({ refer: i });
        }
        referPool = [];
    }
    /**
     * 引用链
     */
    private sortEchartsData(data: Array<any>) {
        const newData = data.sort((a, b) => {
            return new Date(a.time).getTime() - new Date(b.time).getTime();
        });
        return newData;
    }

    /**
     * 时间格式
     */
    public format(time: any) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const millsecond = date.getMilliseconds();
        const months = month < 10 ? `0${month}` : month;
        const dates = day < 10 ? `0${day}` : day;
        const hours = hour < 10 ? `0${hour}` : hour;
        const minutes = minute < 10 ? `0${minute}` : minute;
        const seconds = second < 10 ? `0${second}` : second;
        let millSeconds;
        if (millsecond < 10) {
            millSeconds = '00' + millsecond;
        } else if (millsecond < 100) {
            millSeconds = '0' + millsecond;
        } else {
            millSeconds = millsecond;
        }
        return `${year}-${months}-${dates} ${hours}:${minutes}:${seconds}.${millSeconds}`;
    }
    /**
     * 时间排序
     */
    public sortTime(time: any) {
        if (time) {
            const arr = time
                .map((item: any) => {
                    return (item = item.replace(/:/g, ''));
                })
                .sort();

            const oddTime: any[] = [];
            const newTime = arr.map((item: any, index: number) => {
                oddTime[index] = '';
                for (let i = 0; i < item.length; i++) {
                    oddTime[index] += item[i];
                    if (i === 1 || i === 3) {
                        oddTime[index] += ':';
                    }
                }
                return oddTime[index];
            });
            return newTime;
        }
    }
    /**
     * 换算
     */
    public getMib(b: any) {
        const m = (b / 1024 / 1024).toFixed(2);
        return m;
    }
    /**
     * 科学计数
     */
    public getFullNum(num: number) {
        if (num < 0) {
            return (num = -1);
        } else if (num < 1000) {
            return num;
        } else {
            const n = Math.floor(Math.log10(num));
            const s = Math.log10(num);
            const y = s - n;
            const effectNum = Math.pow(10, y).toFixed(2);
            return `${effectNum}x10^${n}`;
        }
    }
    /**
     * echarts数据配置
     */
    public importCache() {
        this.finishLeak = this.downloadService.downloadItems.leak.isFinish;
        this.stackPool = this.downloadService.downloadItems.leak.stackPool;
        this.referPool = this.downloadService.downloadItems.leak.referPool;
        this.oldSample = this.downloadService.downloadItems.leak.oldSample;
        this.finishReport = this.downloadService.downloadItems.leak.finishReport;
        this.suggestArr = this.downloadService.downloadItems.leak.suggestArr;
    }
    /**
     * 搜索
     */
    public searchEvent(event: any): void {
        if (event.value) {
            this.leakSearch(event.value);
        } else {
            this.leakClear(event.value);
        }
        this.updateWebViewPage();
    }

    /**
     * 优化建议汇总弹窗
     */
    public openModal() {
        if (this.downloadService.downloadItems.leak.suggestArr[0]) {
            this.downloadService.downloadItems.leak.suggestArr[0].state = true;
        }
        this.suggestion.open();
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
