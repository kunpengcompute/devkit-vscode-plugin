import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { Utils } from '../../../service/utils.service';
import { MessageService } from '../../../service/message.service';
import { VscodeService, COLOR_THEME } from '../../../service/vscode.service';
import * as echarts from 'echarts/core';

const conNum = {
    zeroApproximation: 0.001
};
/**
 * perfadvisor 定义echart图表下标
 */
export enum JAVAPERF_INDEX_NUM {
    INDEX_ZERO = 0,
    INDEX_FIRST = 1,
    INDEX_SECOND = 2,
    INDEX_THIRD = 3,
    INDEX_FOURTH = 4,
    INDEX_FIFTH = 5,
    INDEX_SIXTH = 6,
    INDEX_SEVENTH = 7,
    INDEX_EIGHTH = 8,
    INDEX_NINETH = 9,
    INDEX_TENTH = 10,
    INDEX_ELEVENTH = 11,
    INDEX_TWELFTH = 12,
}
@Component({
    selector: 'app-overview-echarts',
    templateUrl: './overview-echarts.component.html',
    styleUrls: ['./overview-echarts.component.scss']
})

export class OverviewEchartsComponent implements OnInit, OnDestroy {
    @ViewChild('timeLineDetail', { static: false }) timeLineDetail: any;
    @Input() isDownload = false;
    i18n: any;
    public tableData: any;
    public count = 70;
    public intervalCount = 67;
    public baseTop = 0;
    public gridHeight = 72;
    public baseColor = '#484a4e';
    public ylabelColor = '#aaaaaa';
    public filter = {};
    public time: any;
    public spec: any;
    public key: any;
    public uuid: any;
    public GlobalColumInfo: any;
    public option: any = {};
    public xAxisData: any = [];
    public overviewEchart: any;
    private overviewItems = [
        'heap_usedSize',
        'heap_committedSize',
        'nonHeap_UsedSize',
        'nonHeap_CommittedSize',
        'processPhysical_MemoryUsedSize',
        'systemFreePhysical_MemorySize',
        'gc_activity',
        'classes',
        'threads_RUNNABLE',
        'threads_WAITING',
        'threads_BLOCKED',
        'cpu_load_total',
        'cpu_load_progress'
    ];
    public overViewDatas: any = {
        heap_usedSize: [],
        heap_committedSize: [],
        nonHeap_UsedSize: [],
        nonHeap_CommittedSize: [],
        processPhysical_MemoryUsedSize: [],
        systemFreePhysical_MemorySize: [],
        gc_activity: [],
        classes: [],
        threads_RUNNABLE: [],
        threads_WAITING: [],
        threads_BLOCKED: [],
        cpu_load_total: [],
        cpu_load_progress: []
    };
    public limitTime = 1;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private downloadService: ProfileDownloadService,
        public libService: Utils,
        private msgService: MessageService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public timeData: any = []; // 时间轴数据
    public timeLine = {
        start: 0,
        end: 100
    };
    public maxDate: any = [];
    public nameList: any = [];
    public realTime: any = [];
    public stateAxisTime: any = +new Date(new Date().setHours(0, 0, 0, 0));
    public stateSub: any;
    /**
     * 初始化
     */
    ngOnInit() {
        // vscode颜色主题
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
            this.baseColor = this.currTheme === COLOR_THEME.Light ? '#d4d9e6' : '#484a4e';
        }
        this.setThemeColor();
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.baseColor = this.currTheme === COLOR_THEME.Light ? '#d4d9e6' : '#484a4e';
            this.setThemeColor();
        });
        // 如果是intellij加载，一秒后初始化；vscode直接初始化
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'
            && (self as any).webviewSession.getItem('downloadProfile') === true) {
            setTimeout(() => {
                this.initWithSession();
            }, 2000);
        } else {
            this.initWithSession();
        }
    }

    /**
     * 获取传参后继续初始化
     */
    initWithSession() {
        this.limitTime = this.downloadService.dataLimit.over_view.timeValue;
        this.nameList = [
            this.i18n.protalserver_profiling_overview.heap,
            this.i18n.protalserver_profiling_overview.nonHeap,
            this.i18n.protalserver_profiling_overview.physicalMemory,
            this.i18n.protalserver_profiling_overview.gc_activety,
            this.i18n.protalserver_profiling_overview.class,
            this.i18n.protalserver_profiling_overview.thread,
            this.i18n.protalserver_profiling_overview.cpu_load
        ];
        Object.keys(this.overViewDatas).forEach((item) => {
            this.overViewDatas[item] = [];
        });
        if (Object.keys(this.downloadService.downloadItems.overview.echarts).length !== 0) {
            this.stateAxisTime = this.downloadService.downloadItems.overview.timeNow + 1000;
            this.realTime = this.downloadService.downloadItems.overview.realtime;
            this.maxDate = this.downloadService.downloadItems.overview.maxDate;
            this.overViewDatas = JSON.parse(JSON.stringify(this.downloadService.downloadItems.overview.echarts));
            this.option = this.downloadService.downloadItems.overview.option;
            this.xAxisData = this.downloadService.downloadItems.overview.xAxisData;
            this.timeData = this.xAxisData;
        } else {
            this.initXAxisData();
        }
        this.initTable();
        if (this.isDownload) { return; }
        this.stateSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'dataLimit' && msg.data.name === 'over_view') {
                this.limitTime = msg.data.value;
                Object.keys(this.overViewDatas).forEach((item) => {
                    this.overViewDatas[item] = [];
                });
                this.stateAxisTime = +new Date(new Date().setHours(0, 0, 0, 0));
                this.initXAxisData(this.limitTime * 60);
                this.realTime = [];
                this.timeData = this.xAxisData;
            }
            if (msg.type === 'isRestart' || msg.type === 'isClear' || msg.type === 'isClearOne'
                || msg.type === this.i18n.protalserver_profiling_tab.overview) {
                Object.keys(this.overViewDatas).forEach((item) => {
                    this.overViewDatas[item] = [];
                });
                this.stateAxisTime = new Date(new Date().toLocaleDateString()).getTime();
                this.initXAxisData(this.limitTime * 60);
                this.realTime = [];
                this.timeData = this.xAxisData;
                this.timeLineDetail.setTimeData(this.xAxisData);
                this.setData();
            }
        });
    }
    /**
     * 设置主题色
     */
    public setThemeColor() {
        if (this.currTheme === COLOR_THEME.Light) {
            this.ylabelColor = '#222';
        } else {
            this.ylabelColor = '#aaa';
        }
    }

    /**
     * 销毁
     */
    ngOnDestroy(): void {
        this.downloadData();
    }

    /**
     * 做数据缓存
     */
    public downloadData() {
        this.downloadService.downloadItems.overview.echarts = this.overViewDatas;
        this.downloadService.downloadItems.overview.xAxisData = this.xAxisData;
        this.downloadService.downloadItems.overview.option = this.option;
        this.downloadService.downloadItems.overview.timeNow = this.stateAxisTime;
        this.downloadService.downloadItems.overview.realtime = this.realTime;
    }
    /**
     * 初始化echart表格
     */
    public initTable() {
        this.setData();
    }
    /**
     * 设置X轴数据
     */
    public makeXAxis(gridIndex: any, opt: any) {  // x轴
        const options = {
            type: 'category',
            boundaryGap: false,
            gridIndex,
            axisLine: {
                onZero: true,
                lineStyle: {
                    color: this.baseColor,
                    width: 1
                }
            },  // 轴线相关设置
            axisTick: { show: false }, // 坐标轴刻度相关设置
            axisLabel: {
                interval: 8,
                show: true
            }, // 坐标轴刻度标签的相关设置
            splitLine: {
                interval: 0,
            },
            axisPointer: {
                lineStyle: { color: 'transparent' }
            },
            data: this.xAxisData
        };
        if (opt) { Object.assign(options, opt); }
        return options;
    }
    /**
     * 设置y轴数据
     */
    public makeYAxis(gridIndex: any, opt: any) {  // y轴
        const options = {
            type: 'value',
            show: false,
            boundaryGap: ['0.01', '0.1'],   // 坐标轴两侧的边界间隙
            gridIndex,
            nameLocation: 'middle',
            nameGap: 30,   // 轴名称与轴线之间的间隔
            nameRotate: 0,  // 周名称的旋转
            offset: 0,  // y轴相对于默认位置的偏移量
            nameTextStyle: {  // 轴名称的默认样式
                color: '#333'
            },

            axisTick: { show: false },  // 轴线刻度相关---是否显示轴刻度
            axisLine: { show: false },  // 轴线相关设置---显示轴线

            splitLine: { show: true }, // 轴线在网格区域的分割线
            splitNumber: 1, // y轴刻度间隔
            min: 0
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }
    /**
     * 设置echart的grid
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top,
            height: this.gridHeight,
            left: 25,
            right: 0
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }
    /**
     * 处理时间数据格式
     */
    private dealWithDate(time: string) {
        return time.substring(0, 19);
    }
    /**
     * 设置配置项
     */
    public setData() {
        const lineColorArr = ['#3d7ff3', '#2da46f', '#18aba6'];
        const areaColorLinears = [
            {
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
            },
            {
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
            }
        ];
        this.option = {
            legend: {  // 标题
                data: [],
                type: 'scroll',
                icon: 'circle',
                top: 0,
                algin: 'left',
                right: 50,
                width: '35%',
                show: true
            },
            dataZoom: [  // 数据区缩放组件
                {
                    type: 'slider',
                    show: false,
                    realtime: true,
                    top: 0,
                    xAxisIndex: [0, 1, 2, 3, 4, 5, 6],
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
                    fillerColor: 'rgba(0, 108, 255, 0.15)', // 选中的区域背景色
                    textStyle: {
                        color: 'rgba(40, 43, 51, 0)'  // 选中区域两边的边界值样式  不显示
                    },
                    handleStyle: {   // 边界图标样式设置
                        color: 'rgba(108, 146, 250, 1)',
                        borderType: 'solid',
                        borderWidth: '10',
                    },
                },
                {
                    type: 'inside',
                    realtime: true,
                    xAxisIndex: [0, 1, 1, 3, 4, 5, 6],
                    showDataShadow: false   // 是否显示数据阴影
                }
            ],
            tooltip: {  // 提示框组件
                borderWidth: 0,
                trigger: 'axis',
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                borderRadius: 5,
                boxShadow: 'rgba(0, 0, 0, 1)',
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
                },
                extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
                padding: [0, 16, 16, 16],
                triggerOn: 'mousemove',
                hideDelay: 2000,
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#478cf1',
                        width: 1.5
                    }
                },
                formatter: (params: any) => {
                    params.forEach((item: any) => {
                        item.data = item.data === conNum.zeroApproximation ? 0 : item.data;
                        if (item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_ZERO ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_FIRST ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_SECOND ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_THIRD ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_FOURTH ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_FIFTH) {
                            item.data = this.libService.onChangeUnit(item.data);
                        }
                        if (item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_SIXTH) {
                            item.data += 'µs';
                        }
                        if (item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_SEVENTH ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_EIGHTH ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_NINETH ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_TENTH) {
                            item.data = this.libService.setThousandSeparator(item.data);
                        }
                        if (item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_ELEVENTH ||
                            item.seriesIndex === JAVAPERF_INDEX_NUM.INDEX_TWELFTH) {
                            item.data += '%';
                        }
                    });

                    let html = `
                        <div>
                            <p style="font-size :12px;margin:12px 0;"
                                [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                                ${params[0].axisValue ? params[0].axisValue : ''}
                                <span [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                                (${this.dealWithDate(this.realTime[params[0].dataIndex])})</span>
                            </p>
                        </div>
                        `;
                    const html1 = `<div style="font-size:12px; display:flex;justify-content: space-between;
                         align-items: center; margin-bottom:10px;
                          [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                        <div style="float : left;">
                            <span style="width:8px;height:8px;display:inline-block;
                            background: ${params[0].color ? params[0].color : ''};"></span>
                            <span>${params[0].seriesName ? params[0].seriesName : ''}</span>
                        </div>
                        <span">&nbsp;&nbsp;&nbsp;${params[0].data ? params[0].data : ''}</span>
                        </div>`;
                    const html2 = `<div style="font-size:12px; display:flex;justify-content: space-between;
                         align-items: center; margin-bottom:10px;
                          [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                            <div style="float : left;">
                            <span style="width:8px;height:8px;display:inline-block;
                            background: ${params[1].color ? params[1].color : ''};"></span>
                            <span>${params[1].seriesName ? params[1].seriesName : ''}</span>
                            </div>
                            <span">&nbsp;&nbsp;&nbsp;${params[1].data ? params[1].data : ''}</span>
                        </div>`;
                    const html3 = `<div style="font-size:12px; display:flex;justify-content: space-between;
                         align-items: center; margin-bottom:10px;
                          [ngStyle]="{'color':currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222'}">
                        <div style="float : left;">
                        <span style="width:8px;height:8px;display:inline-block;
                        background: ${params[2].color ? params[2].color : ''};"></span>
                        <span>${params[2].seriesName ? params[2].seriesName : ''}</span>
                        </div>
                        <span">&nbsp;&nbsp;&nbsp;${params[2].data ? params[2].data : ''}</span>
                    </div>`;

                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_ZERO ||
                        params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_FIRST) {
                        html += html1;
                        html += html2;
                    }
                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_SECOND ||
                        params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_THIRD) {
                        html += html1;
                        html += html2;
                    }
                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_FOURTH ||
                        params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_FIFTH) {
                        html += html1;
                        html += html2;
                    }
                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_SIXTH) {
                        html += html1;
                    }
                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_SEVENTH) {
                        html += html1;
                    }
                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_EIGHTH ||
                        params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_NINETH ||
                        params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_TENTH) {
                        html += html1;
                        html += html2;
                        html += html3;
                    }
                    if (params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_ELEVENTH ||
                        params[0].seriesIndex === JAVAPERF_INDEX_NUM.INDEX_TWELFTH) {
                        html += html1;
                        html += html2;
                    }
                    return html;
                }
            },
            axisPointer: {
                link: [{ xAxisIndex: 'all' }],
                snap: true
            },
            // 直角坐标系底板
            grid: [
                this.makeGrid(this.baseTop, {}),
                this.makeGrid(this.baseTop + this.gridHeight, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 2, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 3, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 4, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 5, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 6, {}),
                this.makeGrid(this.baseTop + this.gridHeight * 7, {}),
            ],
            // 直角坐标系x轴
            xAxis: [
                this.makeXAxis(0, {
                    axisLabel: {
                        show: false,
                        color: '#222222',
                        margin: this.gridHeight,

                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    },
                }),
                this.makeXAxis(1, {
                    axisLabel: {
                        show: false,
                        color: this.ylabelColor,
                        margin: this.gridHeight
                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    }
                }),
                this.makeXAxis(2, {
                    axisLabel: {
                        show: false,
                        color: this.ylabelColor,
                        margin: this.gridHeight
                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    }
                }),
                this.makeXAxis(3, {
                    axisLabel: {
                        show: false,
                        color: this.ylabelColor,
                        margin: this.gridHeight
                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    }
                }),
                this.makeXAxis(4, {
                    axisLabel: {
                        show: false,
                        color: this.ylabelColor,
                        margin: this.gridHeight
                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    }
                }),
                this.makeXAxis(5, {
                    axisLabel: {
                        show: true,
                        color: this.ylabelColor,
                        margin: this.gridHeight,
                        padding: [10, 0, 0, 0],
                        formatter: (value: any) => {
                            if (value.length > 10) {
                                const idx = value.indexOf(' ');
                                return value.slice(0, idx);
                            } else {
                                return value;
                            }
                        }
                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    },
                }),
                this.makeXAxis(6, {
                    axisLabel: {
                        show: false,
                        color: this.ylabelColor,
                        margin: this.gridHeight
                    }, // 坐标轴刻度标签的相关设置
                    axisPointer: {
                        show: true,
                        lineStyle: {
                            color: '#7E8083',
                            width: 1.0
                        }
                    },
                    axisTick: {
                        show: true,
                    }
                }),
            ],
            // 直角坐标系y轴
            yAxis: [
                this.makeYAxis(0, {
                    name: 'Heap'
                }),
                this.makeYAxis(1, {
                    name: 'nonHeap'
                }),
                this.makeYAxis(2, {
                    name: 'Physical Memory'
                }),
                this.makeYAxis(3, {
                    name: 'GC Activity'
                }),
                this.makeYAxis(4, {
                    name: 'Classes'
                }),
                this.makeYAxis(5, {
                    name: 'Threads'
                }),
                this.makeYAxis(6, {
                    name: 'CPU Load'
                }),
            ],
            series: [
                {
                    name: this.i18n.protalserver_profiling_overview.heapUsedSize,
                    type: 'line',
                    symbol: 'circle',
                    smooth: false,
                    symbolSize: 2,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[0]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[0],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[0],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.heap_usedSize,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.heapCommittedSize,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[1]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[1],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[1],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.heap_committedSize,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.nonHeapUsedSize,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[0]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[0],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[0],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.nonHeap_UsedSize,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.nonHeapCommittedSize,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[1]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[1],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[1],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.nonHeap_CommittedSize,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.processPhysicalMemoryUsedSize,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[0]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[0],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[0],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.processPhysical_MemoryUsedSize,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.systemFreePhysicalMemorySize,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[1]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[1],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[1],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.systemFreePhysical_MemorySize,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.gc_tip,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[0]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[0],
                        width: 2
                    },
                    areaStyle: {
                        color: lineColorArr[0],
                        opacity: 0.2
                    },
                    data: this.overViewDatas.gc_activity,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.class_tip,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 4,
                    yAxisIndex: 4,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[0]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[0],
                        width: 2
                    },
                    areaStyle: {
                        color: lineColorArr[0],
                        opacity: 0.2
                    },
                    data: this.overViewDatas.classes,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.thread_tip1,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 5,
                    yAxisIndex: 5,
                    itemStyle: {
                        normal: {
                            color: '#61D274'
                        }
                    },
                    lineStyle: {
                        color: '#61D274',
                    },
                    data: this.overViewDatas.threads_RUNNABLE,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.thread_tip2,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 5,
                    yAxisIndex: 5,
                    itemStyle: {
                        normal: {
                            color: '#FFD610'
                        }
                    },
                    lineStyle: {
                        color: '#FFD610',
                    },
                    data: this.overViewDatas.threads_WAITING,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.thread_tip3,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 5,
                    yAxisIndex: 5,
                    itemStyle: {
                        normal: {
                            color: '#ED4B4B'
                        }
                    },
                    lineStyle: {
                        color: '#ED4B4B',
                    },
                    data: this.overViewDatas.threads_BLOCKED,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.cpu_tip2,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 6,
                    yAxisIndex: 6,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[0]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[0],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[0],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.cpu_load_total,
                    hoverAnimation: false
                },
                {
                    name: this.i18n.protalserver_profiling_overview.cpu_tip1,
                    type: 'line',
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 2,
                    xAxisIndex: 6,
                    yAxisIndex: 6,
                    itemStyle: {
                        normal: {
                            color: lineColorArr[1]
                        }
                    },
                    lineStyle: {
                        color: lineColorArr[1],
                        width: 2
                    },
                    areaStyle: {
                        color: areaColorLinears[1],
                        opacity: 0.5
                    },
                    data: this.overViewDatas.cpu_load_progress,
                    hoverAnimation: false
                }
            ]
        };
        this.initEchart();
        const height = 5 * this.gridHeight + this.baseTop * 3 - 30;
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
        this.setLeft();
    }

    /**
     * 设置echart左边数据
     */
    public setLeft() {
        let html = ``;
        const maxDate: any[] = [];
        let paramData: any;
        const reg = /[0-9]/;
        this.nameList.forEach((item: any, index: number) => {
            switch (index) {
                case 0:
                    paramData = this.libService.onChangeUnit(Math.ceil(
                        Math.max(...this.overViewDatas.heap_committedSize.concat(
                            this.overViewDatas.heap_usedSize))
                    ), true);
                    paramData = reg.test(paramData) ? paramData : '0';
                    maxDate.push(paramData);
                    break;
                case 1:
                    paramData = this.libService.onChangeUnit(Math.ceil(
                        Math.max(...this.overViewDatas.nonHeap_UsedSize.concat(
                            this.overViewDatas.nonHeap_CommittedSize))
                    ), true);
                    paramData = reg.test(paramData) ? paramData : '0';
                    maxDate.push(paramData);
                    break;
                case 2:
                    paramData = this.libService.onChangeUnit(Math.ceil(
                        Math.max(...this.overViewDatas.processPhysical_MemoryUsedSize.
                            concat(this.overViewDatas.systemFreePhysical_MemorySize))
                    ), true);
                    paramData = reg.test(paramData) ? paramData : '0';
                    maxDate.push(paramData);
                    break;
                case 3:
                    const gcValueY = Math.max(...this.overViewDatas.gc_activity) ===
                        conNum.zeroApproximation ? 0 : Math.max(...this.overViewDatas.gc_activity);
                    paramData = gcValueY + 'µs';
                    paramData = reg.test(paramData) ? paramData : '0';
                    maxDate.push(paramData);
                    break;
                case 4:
                    paramData = Math.max(...this.overViewDatas.classes);
                    paramData = reg.test(paramData) ? paramData : '0';
                    paramData = this.libService.setThousandSeparator(Number(paramData));
                    maxDate.push(paramData);
                    break;
                case 5:
                    paramData = Math.max(...this.overViewDatas.threads_RUNNABLE
                        .concat(this.overViewDatas.threads_WAITING)
                        .concat(this.overViewDatas.threads_BLOCKED));
                    paramData = reg.test(paramData) ? paramData : '0';
                    paramData = this.libService.setThousandSeparator(Number(paramData));
                    maxDate.push(paramData);
                    break;
                case 6:
                    paramData = Math.max(...this.overViewDatas.cpu_load_total) + '%';
                    paramData = reg.test(paramData) ? paramData : '0';
                    maxDate.push(paramData);
                    break;
            }
            this.maxDate = maxDate;
            this.downloadService.downloadItems.overview.maxDate = maxDate;
            if (index === 0) {
                html += `
                <div class='line' style='height:1px;background:${this.baseColor};'></div>
                <div class='title-box' style='height:${this.gridHeight}px;color:${this.ylabelColor}'>
                    <span class='title-num'>${paramData}</span>
                    <span class='title' style='font-size:14px'>${item}</span>
                    <span class='title-num'>0</span>
                </div>
                <div class='line' style='height:1px;background:${this.baseColor}'></div>`;
            } else {
                html += `
                <div class='title-box' style='height:${this.gridHeight - 1}px;color:${this.ylabelColor}'>
                    <span class='title-num'>${paramData}</span>
                    <span class='title' style='font-size:14px'>${item}</span>
                    <span class='title-num'>0</span>
                </div>
                <div class='line' style='height:1px;background:${this.baseColor}'></div>`;
            }
        });
        $('#' + this.uuid + ' .table-y').html(html);
    }

    /**
     * 初始化echart
     */
    private initEchart() {
        this.overviewEchart = (echarts as any).init(document.getElementById('overviewEchart'));
        this.overviewEchart.clear();
        this.overviewEchart.setOption(this.option, true);
        window.onresize = this.overviewEchart.resize;
        this.overviewEchart.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 初始化时间轴数据
     */
    public initXAxisData(num: number = Number(this.limitTime) * 60) {
        this.xAxisData = [];
        this.xAxisData = this.libService.getXAxisTime(num);
        this.downloadService.downloadItems.overview.xAxisData = this.xAxisData;
    }
    /**
     * 更新echart
     */
    public updateEchartsData(echartData: any) {
        this.stateAxisTime += 1000;
        const axisTime = this.libService.getXAxisTime(this.stateAxisTime);
        Object.keys(echartData).forEach((item) => {
            echartData[item][0].value.push(axisTime);
        });
        this.setLeft();
        const time = echartData.classes[0].value[2];
        const nowTime = echartData.classes[0].value[0];
        if (this.realTime.length > Number(this.limitTime) * 60) {
            this.realTime = this.realTime.slice(-(Number(this.limitTime) * 60));
            this.realTime.push(nowTime);
        } else {
            this.realTime.push(nowTime);
        }
        this.overviewItems.forEach((item) => {
            const valueData = echartData[item].map((value: any) => {
                return value.value[1] = +value.value[1] === 0 ? conNum.zeroApproximation : value.value[1];
            });
            if (this.overViewDatas[item].length > Number(this.limitTime) * 60) {
                this.overViewDatas[item] = this.overViewDatas[item].slice(-(Number(this.limitTime) * 60));
                this.overViewDatas[item] = this.overViewDatas[item].concat(valueData);
            } else {
                this.overViewDatas[item] = this.overViewDatas[item].concat(valueData);
            }
        });
        this.updateXAxisData(time);
        this.echartSetOption();
        this.downloadData();
    }

    /**
     * 更新x轴数据
     */
    public updateXAxisData(time: string) {
        const index = this.xAxisData.findIndex((item: any) => {
            return item === time;
        });
        if (index !== -1) {
            this.xAxisData[index] = time;
        } else {
            this.xAxisData.push(time);
            if (this.xAxisData.length > Number(this.limitTime) * 60) {
                this.xAxisData.shift();
                this.realTime.shift();
                this.decreseSeriesData();
            }
        }
        this.timeLineDetail.setTimeData(this.xAxisData);
    }

    /**
     * 去除echart数据
     */
    public decreseSeriesData() {
        this.overviewItems.forEach((item) => {
            this.overViewDatas[item].shift();
        });
    }

    /**
     * 更新option
     */
    public echartSetOption() {
        this.overviewEchart.setOption({
            xAxis: [
                {
                    data: this.xAxisData,
                },
                {
                    data: this.xAxisData,
                },
                {
                    data: this.xAxisData,
                },
                {
                    data: this.xAxisData,
                },
                {
                    data: this.xAxisData,
                },
                {
                    data: this.xAxisData,
                },
                {
                    data: this.xAxisData,
                }
            ],
            series: [
                {
                    data: this.overViewDatas.heap_usedSize,
                },
                {
                    data: this.overViewDatas.heap_committedSize,
                },
                {
                    data: this.overViewDatas.nonHeap_UsedSize,
                },
                {
                    data: this.overViewDatas.nonHeap_CommittedSize,
                },
                {
                    data: this.overViewDatas.processPhysical_MemoryUsedSize,
                },
                {
                    data: this.overViewDatas.systemFreePhysical_MemorySize,
                },
                {
                    data: this.overViewDatas.gc_activity,
                },
                {
                    data: this.overViewDatas.classes,
                },
                {
                    data: this.overViewDatas.threads_RUNNABLE,
                },
                {
                    data: this.overViewDatas.threads_WAITING,
                },
                {
                    data: this.overViewDatas.threads_BLOCKED,
                },
                {
                    data: this.overViewDatas.cpu_load_total,
                },
                {
                    data: this.overViewDatas.cpu_load_progress,
                }
            ]
        });
    }

    /**
     * 更新时间轴
     */
    public upDateTimeLine(data: any) {
        this.option.dataZoom[0].start = data.start;
        this.option.dataZoom[0].end = data.end;
        this.overviewEchart.setOption({
            dataZoom: this.option.dataZoom
        });
    }

    /**
     * 设置echart
     */
    onChartInit(ec: any) {
        this.overviewEchart = ec;
        this.overviewEchart.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * 时间轴筛选
     */
    public timeLineData(e: any) {
        this.timeLine = e;
        this.upDateTimeLine(e);
    }
}
