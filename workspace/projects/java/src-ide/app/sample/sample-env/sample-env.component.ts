import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone, ChangeDetectorRef  } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import {
    TiTableColumns,
    TiTableRowData,
    TiTableSrcData
} from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { Utils } from '../../service/utils.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
/**
 * 静态常量
 */
const enum STATIC_NUM {
    NIL_NUM = 0 , // setOptions、showTip需要的判断节点
    ONE_NUM = 1 , // 时间排序需要的判断节点
    THREE_NUM = 3 , // 时间排序需要的判断节点
}
@Component({
    selector: 'app-sample-env',
    templateUrl: './sample-env.component.html',
    styleUrls: ['./sample-env.component.scss']
})
export class SampleEnvComponent implements OnInit, OnDestroy {
    @ViewChild('suggestion', { static: false }) suggestion: any;
    public jvmId = '';
    public cpuViewOption = {};
    public stompClient: any;
    public recordId = '';
    // 表格部分
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public searchWords: Array<string> = [];
    public searchKeys: Array<string> = ['keyworad'];
    public columns: Array<TiTableColumns> = [];
    public noDadaInfo = '';
    public cpuNoDataFlag = false;
    public envInfoNoDataFlag = false;

    public envDisplayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public envSrcData: TiTableSrcData;
    public envSearchWords: Array<string> = [];
    public envSearchKeys: Array<string> = ['keyworad'];
    public envColumns: Array<TiTableColumns> = [];
    // info部分
    public infoLabel: any[] = [];
    public lineColorList = [
        '#3d7ff3',
        '#2da46f',
        '#18aba6'
    ];
    public lineColorListRGB = [
        {
            start: 'rgba(61,127,243, .5)',
            end: 'rgba(61,127,243, .02)',
        },
        {
            start: 'rgba(45,164,111, .5)',
            end: 'rgba(45,164,111, .02)',
        },
        {
            start: 'rgba(24,171,266, .5)',
            end: 'rgba(24,171,266, .02)',
        }
    ];
    // 存储数据
    public sysEnv: any;
    public cpuInofo: Array<any> = [];
    public envContent: Array<any> = [];
    public echartsInstance: any;
    i18n: any;
    constructor(
        private stompService: StompService,
        public i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: SamplieDownloadService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private el: ElementRef,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.infoLabel = [
            {
                title: 'cpu',
                value: ''
            },
            {
                title: 'cores',
                value: ''
            },
            {
                title: 'thread',
                value: ''
            },
            {
                title: 'nymber',
                value: ''
            },
            {
                title: 'memory',
                value: ''
            },
            {
                title: 'os',
                value: ''
            }
        ];
        this.columns = [
            {
                title: 'Keyword',
                width: '30%',
                sortKey: 'keyworad'
            },
            {
                title: 'Value',
                width: '70%'
            }
        ];
        this.envColumns = [
            {
                title: 'Keyword',
                width: '30%',
                sortKey: 'keyworad'
            },
            {
                title: 'Value',
                width: '70%'
            }
        ];
        this.searchOptions = [
            {
                label: this.i18n.protalserver_sampling_enviroment.spkeyword,
                value: 'keyworad'
            },
            {
                label: this.i18n.protalserver_sampling_enviroment.spvalue,
                value: 'value'
            }
        ];
        this.envsearchOptions = [
            {
                label: this.i18n.protalserver_sampling_enviroment_ev.keyword,
                value: 'keyworad'
            },
            {
                label: this.i18n.protalserver_sampling_enviroment_ev.value,
                value: 'value'
            }
        ];
    }
    public getDataTimer: any = null;
    public dataLens = 0;
    public envDatas: Array<any> = [];
    private wsFinishSub: Subscription;
    public finishENV = false;
    public searchOptions: any[] = [];
    public envsearchOptions: any[] = [];
    public showLoading = false;
    public suggestArr: any[] = [];
    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme: any;
    /**
     * 初始化
     */
    ngOnInit() {
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
        this.srcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.envSrcData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.recordId = this.getRecordId();
        this.importCache();
        if (!this.finishENV) {
            this.showLoading = true;
        } else {
            this.setOptions();
            this.initSys();
            this.initProp();
            this.initEnv();
            return;
        }
        setTimeout(() => {
            if (!this.downloadService.downloadItems.env.isFinish) {
              this.showLoading = true;
              this.getSamplingData('env', this.recordId);
              this.finishENV = true;
              this.downloadService.downloadItems.env.isFinish = true;
            }
        }, 1000);
        const swState = (self as any).webviewSession.getItem('wsState');
        if (swState === 'success') {
            this.parseData();
            this.showLoading = false;
        }
        this.wsFinishSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'sEnv' || msg.type === 'wsFinish') {
                this.finishENV = true;
                this.parseData();
                this.showLoading = false;
            }
            if (msg.type === 'env') {
                this.suggestArr = this.downloadService.downloadItems.env.suggestArr;
            }
        });
        if (this.suggestArr.length === 0) {
            this.suggestArr = this.downloadService.downloadItems.env.suggestArr;
        }
        this.updateWebViewPage();
    }
    private parseData() {
        this.envDatas = this.stompService.sampleDatas11;
        this.envDatas.forEach((temp) => {
            if (temp.type === 'ENV' && temp.content === 'FINISH_FLAG') { this.finishENV = true; return; }
            if (temp.type === 'CPU_STATISTICS') {
                this.envContent.push(...temp.content);
            }
            if (temp.type === 'SYSTEM_ENV') {
                this.sysEnv = temp.content;
                this.initSys();
                this.initProp();
                this.initEnv();
            }
        });
        this.cpuInofo = this.sortEchartsData(this.envContent);
        this.setOptions();
        this.envContent = [];
        this.updateWebViewPage();
    }
    /**
     * 切换页签时
     */
    ngOnDestroy() {
        clearTimeout(this.getDataTimer);
        this.getDataTimer = null;
        this.downloadService.downloadItems.env.isFinish = this.finishENV;
        this.downloadService.downloadItems.env.cpuInofo = this.cpuInofo;
        this.downloadService.downloadItems.env.sysEnv = this.sysEnv;
        this.downloadService.downloadItems.env.suggestArr = this.suggestArr;
        if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    }
    /**
     * 搜索
     */
    public searchEvent(event: any, type: any): void {
        if (type === 'left') {
            this.searchKeys[0] = event.key;
            this.searchWords[0] = event.value;
        } else {
            this.envSearchKeys[0] = event.key;
            this.envSearchWords[0] = event.value;
        }
    }
    /**
     * initSys
     */
    initSys() {
        this.infoLabel[0].value = this.sysEnv[0].cpu.type;
        this.infoLabel[1].value = this.sysEnv[0].cpu.cores;
        this.infoLabel[5].value = this.sysEnv[0].os.split('\n').join(' ');
        const mem = this.sysEnv[0].totalPhysicalMemorySize / 1024 / 1024 / 1024;
        if (mem > 1) {
            this.infoLabel[4].value = mem.toFixed(2) + 'GB';
        } else {
            this.infoLabel[4].value =
                Math.floor(this.sysEnv[0].totalPhysicalMemorySize / 1024 / 1024) +
                'MB';
        }
        this.updateWebViewPage();
    }
    /**
     * initProp
     */
    initProp() {
        this.srcData.data = [];
        let propDatas: any[] = [];
        if (this.sysEnv) {
            this.sysEnv.forEach((env: any) => {
                for (const key in env.systemProperties) {
                    if (Object.prototype.hasOwnProperty.call(env.systemProperties, key)) {
                        propDatas.push({
                            keyworad: key,
                            value: env.systemProperties[key],
                            isKeyTip: false,
                            isValTip: false
                        });
                    }
                }
            });
        }
        propDatas = propDatas.sort((a: any, b: any): number => {
            return a.keyworad.localeCompare(b.keyworad);
        });
        this.srcData.data = propDatas;
        this.updateWebViewPage();
    }
    /**
     * initEnv
     */
    public initEnv() {
        this.envSrcData.data = [];
        let variables: any[] = [];
        if (this.sysEnv) {
            this.sysEnv.forEach((env: any) => {
                for (const key in env.environmentVariables) {
                    if (Object.prototype.hasOwnProperty.call(env.environmentVariables, key)) {
                        variables.push({
                            keyworad: key,
                            value: env.environmentVariables[key],
                            isKeyTip: false,
                            isValTip: false
                        });
                    }
                }
            });
        }
        variables = variables.sort((a: any, b: any): number => {
            return a.keyworad.localeCompare(b.keyworad);
        });
        this.envSrcData.data = variables;
        this.updateWebViewPage();
    }

    private getRecordId() {
        return (self as any).webviewSession.getItem('recordId');
    }
    private sortEchartsData(data: Array<any>) {
        const newData = data.sort((a, b) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
        return newData;
    }
    /**
     * format
     * @param time time
     * @param format format
     */
    public format(time: any, format: any) {
        const date = new Date(time);
        const o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'f+': date.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(format)) {
            format = format
                .replace(RegExp.$1, date.getFullYear() + '')
                .substr(4 - RegExp.$1.length);
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(format)) {
                format = format.replace(
                    RegExp.$1,
                    RegExp.$1.length === STATIC_NUM.ONE_NUM
                        ? (o as any)[k]
                        : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length)
                );
            }
        }
        return format;
    }
    /**
     * setOptions
     */
    public setOptions() {
        let areaColorList: any[] = [];
        let opacityNum: any = 0;
        areaColorList = this.lineColorList;
        opacityNum = 0.2;
        const jvmUser: any[] = [];
        const jvmSystem: any[] = [];
        const machineTotal: any[] = [];
        const time: any[] = [];
        if (this.cpuInofo.length === STATIC_NUM.NIL_NUM) {
            this.cpuNoDataFlag = true;
            return;
        }
        this.cpuInofo.forEach((item) => {
            jvmUser.push(Math.floor(item.jvmUser * 10000) / 100);
            jvmSystem.push(Math.floor(item.jvmSystem * 10000) / 100);
            machineTotal.push(Math.floor(item.machineTotal * 10000) / 100);
            time.push(this.format(new Date(item.startTime), 'HH:mm:ss'));
        });
        const arrAll = jvmUser.concat(jvmSystem).concat(machineTotal);
        const maxValue = Math.max(...arrAll);
        const textColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#E8E8E8';
        const bgColor = this.currTheme === COLOR_THEME.Light ? '#ffffff' : '#424242';
        const timeColor = this.currTheme === COLOR_THEME.Light ? '#616161' : '#aaaaaa';
        const axisLineColor = this.currTheme === COLOR_THEME.Light ? '#E1E6EE' : '#484A4E';
        const axisLabelColor = this.currTheme === COLOR_THEME.Light ? '#222222' : '#aaa';
        const option = {
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                },
                backgroundColor: bgColor,
                borderRadius: 5,
                padding: [12, 16, 12, 16],
                boxShadow: 'rgba(0, 0, 0, 0.5)',
                textStyle: {
                    color: textColor,
                    fontSize: 12
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                formatter: (params: any): any => {
                    if (params.length) {
                        let html = ``;
                        html += `<div><div style="color:${timeColor}">${params[0].axisValueLabel}</div>
                      `;
                        params.forEach((param: any, index: number) => {
                            html += `
                      <div style='margin-top:10px'>
                        <span style="display: inline-block;width: 8px;
                        height: 8px;background-color: ${this.lineColorList[index]};
                        margin-right: 3px;"></span>
                        <span style='width:150px;display:inline-block;color:${textColor}'>${param.seriesName}</span>
                        <span style="color:${textColor}">${param.data}%</span>
                      </div>
                      `;
                        });
                        html += `</div>`;
                        return html;
                    }
                }
            },
            legend: {
                itemHeight: 8,
                itemWidth: 8,
                icon: 'rect',
                data: [
                    this.i18n.protalserver_sampling_enviroment.jvmUserMode,
                    this.i18n.protalserver_sampling_enviroment.jvmSystemMode,
                    this.i18n.protalserver_sampling_enviroment.usaged],
                x: 'right',
                padding: [
                    5,  // 上
                    30, // 右
                    70,  // 下
                    5, // 左
                ],
                textStyle: {
                    color: axisLabelColor
                }
            },
            grid: {
                top: '25',
                left: '0',
                right: '30',
                bottom: '0%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: time.map((str) => {
                        return str.replace(' ', '\n');
                    }),
                    boundaryGap: false,
                    axisTick: {
                        alignWithLabel: true,
                        show: false
                    },
                    axisLabel: {
                        align: 'center',
                        color: axisLabelColor
                    },
                    axisLine: {
                        lineStyle: { show: true, color: axisLineColor }
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        formatter: '{value} %',
                        color: axisLabelColor
                    },
                    splitLine: {
                        show: true,
                        lineStyle: { show: true, color: axisLineColor, type: 'dashed' },
                    },
                    axisLine: {
                        lineStyle: { show: true, color: axisLineColor }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: axisLineColor
                        }
                    },
                    max: maxValue,
                    min: 0,
                }
            ],
            series: [
                {
                    name: this.i18n.protalserver_sampling_enviroment.jvmUserMode,
                    type: 'line',
                    stack: 'jvmUser',
                    lineStyle: {
                        color: this.lineColorList[0]
                    },
                    itemStyle: {
                        normal: {
                            color: this.lineColorList[0]
                        }
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: this.lineColorListRGB[0].start // 0% 处的颜色
                            }, {
                                offset: 1, color: this.lineColorListRGB[0].end // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        },
                        opacity: opacityNum,
                    },
                    showSymbol: false,
                    symbolSize: 6,
                    data: jvmUser
                },
                {
                    name: this.i18n.protalserver_sampling_enviroment.jvmSystemMode,
                    type: 'line',
                    stack: 'jvmSystem',
                    lineStyle: {
                        color: this.lineColorList[1]
                    },
                    itemStyle: {
                        normal: {
                            color: this.lineColorList[1]
                        }
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: this.lineColorListRGB[1].start // 0% 处的颜色
                            }, {
                                offset: 1, color: this.lineColorListRGB[1].end // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        },
                        opacity: opacityNum,
                    },
                    showSymbol: false,
                    symbolSize: 6,
                    data: jvmSystem
                },
                {
                    name: this.i18n.protalserver_sampling_enviroment.usaged,
                    type: 'line',
                    stack: 'machineTotal',
                    lineStyle: {
                        color: this.lineColorList[2]
                    },
                    itemStyle: {
                        normal: {
                            color: this.lineColorList[2]
                        }
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: this.lineColorListRGB[2].start // 0% 处的颜色
                            }, {
                                offset: 1, color: this.lineColorListRGB[2].end // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        },
                        opacity: opacityNum,
                    },
                    showSymbol: false,
                    symbolSize: 6,
                    data: machineTotal
                }
            ]
        };
        this.cpuViewOption = option;
        this.sortTime(time);
    }
    /**
     * showTip
     * @param content content
     * @param idx idx
     * @param td td
     * @param tName tName
     */
    public showTip(content: any, idx: any, td: any, tName: any) {
        let tWidth = 0;
        let tdContainerWidth = 0;
        const span = $(`<span>${content}</span>`);
        if (tName === 'env') {
            tWidth = this.el.nativeElement.querySelector('.env-container').offsetWidth;
            const tdPer = Number(this.envColumns[td].width.slice(0, -1));
            tdContainerWidth = tWidth * tdPer / 100 - 20;
            const flag = this.i18nService.isEleTextOverflow(span, tdContainerWidth);
            if (td === STATIC_NUM.NIL_NUM) {
                this.envSrcData.data[idx].isKeyTip = flag;
            } else {
                this.envSrcData.data[idx].isValTip = flag;
            }
        } else {
            tWidth = this.el.nativeElement.querySelector('.prop-container').offsetWidth;
            const tdPer = Number(this.columns[td].width.slice(0, -1));
            tdContainerWidth = tWidth * tdPer / 100 - 20;
            const flag = this.i18nService.isEleTextOverflow(span, tdContainerWidth);
            if (td === STATIC_NUM.NIL_NUM) {
                this.srcData.data[idx].isKeyTip = flag;
            } else {
                this.srcData.data[idx].isValTip = flag;
            }
        }

    }

    /**
     * 时间排序
     * @param time time
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
                    if (i === STATIC_NUM.ONE_NUM || i === STATIC_NUM.THREE_NUM) {
                        oddTime[index] += ':';
                    }
                }
                return oddTime[index];
            });
            return newTime;
        }
    }
    /**
     * getSamplingData
     * @param type type
     * @param data data
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
        this.updateWebViewPage();
    }
    /**
     * importCache
     */
    public importCache() {
        this.cpuInofo = this.downloadService.downloadItems.env.cpuInofo;
        this.sysEnv = this.downloadService.downloadItems.env.sysEnv;
        this.finishENV = this.downloadService.downloadItems.env.isFinish;
        this.suggestArr = this.downloadService.downloadItems.env.suggestArr;
    }
    /**
     * 优化建议汇总弹窗
     */
    public openModal() {
        if (this.downloadService.downloadItems.env.suggestArr[0]) {
            this.downloadService.downloadItems.env.suggestArr[0].state = true;
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
