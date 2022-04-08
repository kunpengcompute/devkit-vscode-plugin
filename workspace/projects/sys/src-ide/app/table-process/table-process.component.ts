import {
    Component, OnInit, Input, AfterViewInit, Output, EventEmitter, SecurityContext, ElementRef
} from '@angular/core';
import { Utils } from '../service/utils.service';
import { VscodeService, COLOR_THEME, isLightTheme } from '../service/vscode.service';
import { I18nService } from '../service/i18n.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LeftShowService } from 'projects/sys/src-ide/app/service/left-show.service';
import { fromEvent } from 'rxjs';
/**
 * echarts线条样式常量
 */
const enum SERIES_THEME {
    Fill = 1,
    Linear = 2
}
@Component({
    selector: 'app-table-process',
    templateUrl: './table-process.component.html',
    styleUrls: ['./table-process.component.scss']
})
export class TableProcessComponent implements OnInit, AfterViewInit {
    @Input() datas: any;
    @Input() timeLine: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() titleWidth: number;
    @Output() public dataZoom = new EventEmitter<any>();
    public i18n: any;
    public echartsInstance: any;
    public tableData: any;
    public count = 70;
    public intervalCount = 67;
    public baseTop = 32;
    public gridHeight = 72;
    public baseColor = '#383838';
    public ylabelColor = '#999';
    public lineColorList = [
        '#3d7ff3', '#2da46f', '#c0691c', '#8739db', '#2c8e8b', '#a73074', '#ada71e', '#8d1d3f', '#4e8a30', '#a44017'
    ];
    public legendTxtColor = '#e8e8e8';
    public filter = {};
    public time: any;
    public spec: any;
    public key: any;
    public uuid: any;
    public GlobalColumInfo: any;
    public lengthTipTimer: any;
    public option: any = {
        legend: {
            data: [],
            type: 'scroll',
            icon: 'rect',
            top: 0,
            algin: 'left',
            left: 55,
            width: '50%',
            itemWidth: 8,
            itemHeight: 8,
            show: true,
            selectedMode: true,
            textStyle: {
                color: '#e8e8e8'
            },
            pageIconColor: '#888888', // 翻页下一页的三角按钮颜色
            pageIconInactiveColor: '#616161', // 翻页（即翻页到头时）
            pageIconSize: 12, // 翻页按钮大小
            pageButtonItemGap: 25, // 翻页按钮的两个之间的间距
            pageTextStyle: {
                color: '#e8e8e8' // 分页中的页数样式
            },
            tooltip: {
                show: true,
                confine: true,
                formatter: (params: any, ticket: any, callback: any) => {
                    const that = this;
                    const lengthTip = function getTipTxt() {
                        const queryParams = {
                            'node-id': that.nodeid,
                            'query-type': 'detail',
                            'query-target': 'cmdline',
                            'query-ptid': params.name.toLowerCase(),
                        };
                        const url = '/tasks/' + encodeURIComponent(that.taskid)
                            + '/process-analysis/?' + Utils.converUrl(queryParams);
                        that.vscodeService.get({ url }, (res: any) => {
                            callback(ticket, `<div class="boxAuto">
                            <p style="color: ${that.legendTxtColor}; max-width: 496px; white-space: normal">
                            ${that.domSanitizer.sanitize(SecurityContext.HTML,
                                res.data.cmd_line || that.i18n.process.noCmdline)}</p>`);
                        });
                    };
                    if (that.lengthTipTimer) {
                        clearTimeout(that.lengthTipTimer);
                    }
                    that.lengthTipTimer = setTimeout(lengthTip, 200);
                    return `<div style="color: ${that.legendTxtColor}; padding-top: 10px">
                    ${that.i18n.process.obtainingTheCmdline}</div>`;
                },
            },
        },
        dataZoom: [{
            start: 0,
            end: 100,
            xAxisIndex: [],
            left: '1.3%',
            right: '3.3%',
            height: '18',
            top: 0,
            show: false,
            textStyle: {
                color: 'rgba(0,0,0,0)'
            }
        }, {
            type: 'inside'
        }],
        tooltip: {
        },
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            snap: true
        },
        grid: [
        ],
        xAxis: [
        ],
        yAxis: [
        ],
        series: [
        ]
    };
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    constructor(
        public vscodeService: VscodeService,
        public leftShowService: LeftShowService,
        public i18nService: I18nService,
        private domSanitizer: DomSanitizer,
        private el: ElementRef) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        if (isLightTheme) {
            this.currTheme = COLOR_THEME.Light;
            this.baseColor = '#e6ebf5';
            this.legendTxtColor = '#222';
            this.option.legend.textStyle.color = '#222';
            this.option.legend.pageTextStyle.color = '#222';
        } else {
            this.baseColor = '#383838';
            this.legendTxtColor = '#e8e8e8';
            this.option.legend.textStyle.color = '#e8e8e8';
            this.option.legend.pageTextStyle.color = '#e8e8e8';
        }
        // // 监听到主题变化，重绘echart图表
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            if (this.currTheme === COLOR_THEME.Light) {
                this.legendTxtColor = '#222';
                this.option.legend.textStyle.color = '#222';
                this.option.legend.pageTextStyle.color = '#222';
            } else {
                this.legendTxtColor = '#e8e8e8';
                this.option.legend.textStyle.color = '#e8e8e8';
                this.option.legend.pageTextStyle.color = '#e8e8e8';
            }
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                // 重绘echarts
                this.setData(this.timeLine);
            }

        });
        this.leftShowService.leftIfShow.subscribe(() => {
            // 点击左侧echarts需要自适应
            setTimeout(() => {
                const width = $('#user-guide-scroll').width() * 0.9;
                this.echartsInstance.resize({ width });
                $('.title-box').width($('#user-guide-scroll').width() * 0.08);
                this.setLegends();
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.option, true);
            }, 200);
        });
        fromEvent(window, 'resize').subscribe((event) => {
            let timer: any;
            const that = this;
            function debounce() {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    // 300毫秒的防抖
                    const width = $('#user-guide-scroll').width() * 0.9;
                    that.echartsInstance.resize({ width });
                    $('.title-box').width($('#user-guide-scroll').width() * 0.08);
                    that.setLegends();
                    that.echartsInstance.clear();
                    that.echartsInstance.setOption(that.option, true);
                }, 300);
            }
            debounce();
        });
        this.uuid = Utils.generateConversationId(12);
    }
    /**
     * 动态调整legend位置
     */
    public setLegends() {
        const tableY = this.el.nativeElement.querySelector('.table-y').offsetWidth + 25;
        const left = this.titleWidth - tableY;
        this.option.legend.left = left + 10;
        if (tableY <= 104) {
            this.option.legend.top = 0;
        }
    }
    /**
     * 初始化
     */
    ngAfterViewInit() {
        this.initTable();
    }
    /**
     * onChartInit
     * @param ec ec
     */
    onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {
            // 放大缩小时调用接口
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }
    /**
     * upDateTimeLine
     * @param data data
     */
    public upDateTimeLine(data: any) {
        this.option.dataZoom[0].start = data.start;
        this.option.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.option.dataZoom
        });
    }
    /**
     * 初始化 echart数据
     */
    public initTable() {
        this.time = this.datas.data.time;
        this.spec = this.datas.spec;
        this.key = this.datas.key;
        this.setData(this.timeLine);
    }
    /**
     * makeXAxis
     * @param gridIndex gridIndex
     * @param opt opt
     * @returns option
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: false,
            offset: 0,
            data: this.time,
            axisLine: { onZero: false, lineStyle: { color: this.baseColor, width: 2 } },
            axisTick: { show: false },
            // 坐标轴刻度相关设置
            axisLabel: {
                show: false,
                color: this.ylabelColor,
                interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))

            },
            // 坐标轴刻度标签的相关设置
            splitLine: {
                show: true,
                lineStyle: { color: this.baseColor },
                interval: 0
            },
            axisPointer: {
                lineStyle: { color: 'transparent' }
            }
        };
        if (option) {
            Object.assign(option, opt);
        }
        return option;
    }

    /**
     * makeYAxis
     * @param gridIndex gridIndex
     * @param opt opt
     * @returns options
     */
    public makeYAxis(gridIndex: any, opt: any) {
        const options = {
            type: 'value',
            show: false,
            gridIndex,
            nameLocation: 'middle',
            nameGap: 30,
            nameRotate: 0,
            offset: 0,
            nameTextStyle: {
                color: '#333'
            },
            min: 0,
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { show: true },
            // y轴刻度间隔
            splitNumber: 1
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
     * @returns options
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top: top + 20,
            height: this.gridHeight,
            left: 25,
            right: '2.5%'
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * setData
     * @param timeData timeData
     */
    public setData(timeData: any) { // { end: 100, start: 0}
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        // 清空数据
        this.option.dataZoom[0].start = timeData.start;
        this.option.dataZoom[0].end = timeData.end;
        this.option.dataZoom[0].xAxisIndex = this.key.map((item: any, index: any) => index);
        this.option.dataZoom[0].top = this.key.length * this.gridHeight + this.baseTop + 60;
        if (this.datas.type === 'cpu') {
            // this.spec = ["Pid_1", "Tid_1"]
            this.option.legend.data = this.spec.map((item: any) => item);
        } else {
            this.option.legend.data = this.spec.map((item: any) => item);
        }
        // 处理最大值和单位
        let tipItemWidth = 60;
        // 以kb作单位的选项
        const kbList = ['kbmemused', 'kbmemfree', 'kbbuffers', 'kbcached', 'kbcommit',
            'kbactive', 'kbinact', 'kbdirty'];
        const columinfo: any = {};
        if (this.spec.length === 0) {
            this.key.forEach((item: any) => {
                columinfo[item] = {};
                columinfo[item].values = [];
                columinfo[item].showMax = true;
                columinfo[item].values = this.datas.data.values[item];
            });
        } else if (this.spec.length > 0) {
            this.key.forEach((item: any) => {
                columinfo[item] = {};
                columinfo[item].values = [];
                columinfo[item].showMax = true;
                if (this.datas.data.values != null) {
                    Object.keys(this.datas.data.values).forEach(key2 => {
                        if (this.spec.indexOf(key2) > -1) {
                            columinfo[item].values = columinfo[item].values.concat(this.datas.data.values[key2][item]);
                        }
                    });
                }
            });
        }
        const keys = Object.keys(columinfo);
        for (const val of keys) {
            columinfo[val].max = Math.max.apply(null, columinfo[val].values);
            if (columinfo[val].max > 100) {
                columinfo[val].max *= 2;
            }
            if (val === 'commit') { columinfo[val].max *= 2; }
            if (this.datas.type === 'cpu') { columinfo[val].max *= 2; tipItemWidth = 100; }
            if (this.datas.type === 'cpuavg') { columinfo[val].max *= 2; }
            if (this.datas.type === 'pag') { columinfo[val].max *= 2; }
            if (this.datas.type === 'memswap') { columinfo[val].max *= 2; }
            if (this.datas.type === 'disk') { columinfo[val].max *= 2; }
            if (this.datas.type === 'netOk') { columinfo[val].max *= 2; }
            if (this.datas.type === 'netError') { columinfo[val].max *= 2; }
            columinfo[val].min = 0;
            columinfo[val].max = (value: any) => {
                return value.max * 1.5;
            };   // 暂时全部自动最大
        }
        if (this.spec.length === 0) {
            this.option.legend.show = false;
        }
        this.key.forEach((item: any, index: any) => {
            this.option.grid.push(this.makeGrid(this.baseTop + this.gridHeight * index, {}));
            let myMax = 100;
            columinfo[item].danwei = '';
            if (this.datas.type === 'cpu') {
                columinfo[item].showMax = false;
                myMax = columinfo[item].max;
                columinfo[item].danwei = '';
            }
            if (this.datas.type === 'cpuavg') {
                columinfo[item].showMax = false;
                myMax = columinfo[item].max;
                columinfo[item].danwei = '';
            }
            if (this.datas.type.indexOf('Memory Usage') > -1) {
                tipItemWidth = 90;
                columinfo[item].showMax = false;
                if (kbList.indexOf(item) > -1) { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === '%memused') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'commit') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'kbavail') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
            }
            if (this.datas.type.indexOf('pag') > -1) {
                tipItemWidth = 100;
                columinfo[item].showMax = false;
                if (item === 'pgpgin/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'pgpgout/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'fault/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'majflt/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'pgfree/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'pgscank/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'pgscand/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'pgsteal/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === '%vmeff') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
            }
            if (this.datas.type === 'memswap') {
                tipItemWidth = 100;
                columinfo[item].showMax = false;
                if (item === 'pswpin/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'pswpout/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
            }
            if (this.datas.type === 'disk') {
                tipItemWidth = 100;
                columinfo[item].showMax = false;
                if (item === 'tps') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'rd_sec/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'wr_sec/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'avgrq-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'avgqu-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'await') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'svctm') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === '%util') {
                    myMax = 100; columinfo[item].max = 100;
                    columinfo[item].danwei = '';
                    columinfo[item].showMax = false;
                }
                if (item === 'rkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'wkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'aqu-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'areq-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
            }
            if (this.datas.type === 'netOk') {
                tipItemWidth = 100;
                columinfo[item].showMax = false;
                if (item === 'rxpck/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'txpck/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'rxkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'txkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
            }
            if (this.datas.type === 'netError') {
                tipItemWidth = 100;
                columinfo[item].showMax = false;
                if (item === 'rxerr/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'txerr/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'coll/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'rxdrop/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'txdrop/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'txcarr/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'rxfram/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'rxfifo/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
                if (item === 'txfifo/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
            }
            // 处理最大值和单位
            this.GlobalColumInfo = columinfo;
            this.option.yAxis.push(
                this.makeYAxis(index, {
                    name: item,
                    max: (value: any) => {
                        if (item === 'CPU') {
                            $('#' + this.uuid + ' .table-y ' + `.${item.replace('%', 'x')
                                .replace('/', 'x').replace('(', 'x')
                                .replace(')', 'x')}`).html(Utils.setThousandSeparator(value.max * 2));
                            return value.max * 1.5;
                        }
                        if (value.max === 0 || value.max === -Infinity) {
                            $('#' + this.uuid + ' .table-y ' + `.${item.replace('%', 'x')
                                .replace('/', 'x').replace('(', 'x')
                                .replace(')', 'x')}`).html('1.00');
                        } else {
                            $('#' + this.uuid + ' .table-y ' + `.${item.replace('%', 'x')
                                .replace('/', 'x').replace('(', 'x')
                                .replace(')', 'x')}`).html(Utils.setThousandSeparator((value.max * 1.5).toFixed(2)));
                        }
                        return value.max * 1.5;
                    }   // 暂时全部自动最大
                }),
            );
            if (index !== this.key.length - 1) {
                this.option.xAxis.push(
                    this.makeXAxis(index, {
                        axisLabel: {
                            show: true,
                            color: 'rgba(0,0,0,0)',
                            // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
                            interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))
                        }, // 坐标轴刻度标签的相关设置
                        axisPointer: {
                            show: true,
                            lineStyle: {
                                color: this.currTheme === COLOR_THEME.Light ? '#478cf1' : '#AAAAAA',
                                width: 1.5
                            }
                        }
                    })
                );
            } else {
                this.option.xAxis.push(
                    this.makeXAxis(index, {
                        axisLabel: {
                            show: true,
                            color: this.ylabelColor,
                            interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))
                        },
                        // 坐标轴刻度标签的相关设置
                        axisPointer: {
                            show: true,
                            lineStyle: {
                                color: this.currTheme === COLOR_THEME.Light ? '#478cf1' : '#AAAAAA',
                                width: 1.5
                            }
                        }
                    })
                );
            }
        });
        this.option.grid.push(this.makeGrid(this.baseTop, {   // 多的一个grid
            show: true,
            height: 0,
            borderColor: this.baseColor,
            borderWidth: 1,
            z: 10,
        }));
        this.option.xAxis.push(
            this.makeXAxis(this.key.length, {
                position: 'top',
                axisPointer: {
                    show: true,
                    lineStyle: {
                        color: this.currTheme === COLOR_THEME.Light ? '#478cf1' : '#AAAAAA',
                        width: 1.5
                    }
                }
            })
        );
        this.key.forEach((item: any, index: any) => {
            if (this.spec.length > 0) {
                this.spec.forEach((item2: any, index2: any) => {
                    const colorIndex = index2 % this.lineColorList.length;
                    this.option.series.push(
                        {
                            name: item2,
                            type: 'line',
                            symbol: 'emptyCircle',
                            symbolSize: 4,
                            showAllSymbol: false,
                            xAxisIndex: index,
                            yAxisIndex: index,
                            lineStyle: {
                            },
                            itemStyle: {
                                normal: {
                                    color: this.lineColorList[colorIndex]
                                }
                            },
                            data: this.datas.data.values[item2][item]
                        }
                    );
                });
            } else {
                let colorIndex = 0;
                if (this.lineColorList.length < index) {
                    colorIndex = Math.floor(index / this.lineColorList.length);
                } else {
                    colorIndex = index;
                }
                this.option.series.push(
                    {
                        name: item,
                        type: 'line',
                        symbol: 'emptyCircle',
                        symbolSize: 4,
                        showAllSymbol: false,
                        xAxisIndex: index,
                        yAxisIndex: index,
                        lineStyle: {
                        },
                        itemStyle: {
                            normal: {
                                color: this.lineColorList[colorIndex]
                            }
                        },
                        data: this.datas.data.values[item]
                    }
                );
            }
        });
        this.option.yAxis.push(
            this.makeYAxis(this.key.length, {}),
        );
        const xAxisIndexArr: number[] = [];
        this.key.map((item: any, index: number) => {
            xAxisIndexArr.push(index);
        });
        this.option.dataZoom[1].xAxisIndex = xAxisIndexArr;
        const contentBoxHeight = getComputedStyle(document.querySelector('#' + this.uuid)).getPropertyValue('height');
        this.option.tooltip = {
            trigger: 'axis',
            borderColor: 'rgba(50,50,50,0)',
            backgroundColor: this.currTheme === COLOR_THEME.Light ? '#fff' : 'rgba(49, 49, 49, 1)',
            borderWidth: 1,
            borderRadius: 0,
            hideDelay: 500,
            enterable: true,
            confine: true,
            padding: [0, 20, 10, 20],
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: this.currTheme === COLOR_THEME.Light ? '#478cf1' : '#7E8083',
                    width: 1.5
                }
            },
            formatter: (params: any): any => {
                if (params.length) {
                    const time = params[0].axisValue;
                    const table: any = {};
                    this.key.forEach((item: any, index: any) => {
                        table[item] = [];
                        table[item] = params.filter((param: any) => {
                            return (param.axisIndex === index);
                        });
                    });
                    let spec = params.map((item: any) => item.seriesName);
                    spec = [...new Set(spec)];
                    let html = `<div class='chart-tip'>`;
                    if (this.spec.length >= 1) {
                        html += `<div>
                        <span style="color:${this.currTheme === COLOR_THEME.Light
                            ? '#616161' : '#e8e8e8'};text-align:left;width:
                        ${this.domSanitizer.sanitize(SecurityContext.HTML, tipItemWidth)}px;
                        display:inline-block">${time}</span>`;
                        if (table != null) {
                            Object.keys(table).forEach(a => {
                                let itemName = a;
                                // 特殊处理后端写错的
                                if (itemName === '%usr') { itemName = '%user'; }
                                // UCD要求改为'CPU ID',纵坐标展示,key值使用依旧为'CPU'
                                if (itemName === 'CPU') { itemName = 'CPU ID'; }
                                html += `
                                  <span style="color:${this.currTheme === COLOR_THEME.Light ?
                                     '#282b33' : '#e8e8e8'};width:${tipItemWidth}px;
                                  text-align:left;display:inline-block">
                                  ${this.domSanitizer.sanitize(SecurityContext.HTML, itemName)}
                                  ${this.GlobalColumInfo[a].danwei}</span> `;
                            });
                        }
                        html += `</div><div class="infoList">`;
                        spec.forEach((item: any, index: any) => {
                            let colorIndex = 0;
                            if (this.lineColorList.length <= index) {
                                colorIndex = index % this.lineColorList.length;
                            } else {
                                colorIndex = index;
                            }
                            const colName = item;
                            html += `<div class="padding">`;
                            html += `
                            <span style="color:${this.currTheme === COLOR_THEME.Light ? '#282b33' :
                             '#e8e8e8'};width:${tipItemWidth}px;display:inline-block">
                            <div style="display:inline-block;position:relative;top:1px;
                            margin-right:5px;width:8px;height:8px;
                            background:${this.lineColorList[colorIndex]}">
                            </div>${this.domSanitizer.sanitize(SecurityContext.HTML, colName)}</span>`;
                            if (table != null) {
                                Object.keys(table).forEach(a => {
                                    html += `
                                  <span style="color:${this.currTheme === COLOR_THEME.Light ? '#282b33' :
                                   '#e8e8e8'};width:${tipItemWidth}px;
                                  display:inline-block;z-index:-1">
                                    ${this.domSanitizer.sanitize(
                                        SecurityContext.HTML, Utils.setThousandSeparator(table[a][index].value))}
                                  </span>`;
                                });
                            }
                            html += `</div>`;
                        });
                        html += `</div>`;
                    } else {
                        html += `
                            < span style = "color:${this.currTheme === COLOR_THEME.Light ? '#282b33' :
                             '#e8e8e8'};text-align:right;width:${tipItemWidth + 20}px;
                        display: inline - block">
                        ${this.domSanitizer.sanitize(SecurityContext.HTML, this.datas.title)}
                        </span>`;
                    }
                    html += '</div>';
                    return html;
                }
            },
            position(point: any, params: any, dom: any, rect: any, size: any): any {
                // 解决tooltip legend位置不正确的问题
                if (!Array.isArray(params) && params.componentType === 'legend') {
                    const top = point[1] + 20;
                    let right = size.viewSize[0] - (point[0] + size.contentSize[0] / 2);
                    if (right < 0) {
                        right = 0;
                    }
                    // 解决设置最大宽度且文字自动换行时，echarts计算宽度错误的问题【不足400px就开始换行】
                    if (size.contentSize[0] >= 440) {
                        dom.style.width = '400px';
                        dom.style.whiteSpace = 'normal';
                    }
                    return { top, right };
                }
            },
        };
        const height = this.key.length * this.gridHeight + this.baseTop * 2 + 25;
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
        this.setLeft();
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }
        }, 100);
    }
    /**
     * setLeft
     */
    public setLeft() {
        let html = ``;
        this.key.forEach((item: any, index: any) => {
            let itemName = item;
            if (itemName === '%usr') {
                // 特殊处理后端写错的
                itemName = '%user';
            } else if (itemName === 'CPU') {
                // UCD要求改为'CPU ID',纵坐标展示,key值使用依旧为'CPU'
                itemName = 'CPU ID';
            }
            if (index === 0) {
                html += `
                <div class="line" style="margin-top: ${
                    this.domSanitizer.sanitize(SecurityContext.HTML, this.baseTop + 20 - 1)}px;
                background:${this.domSanitizer.sanitize(SecurityContext.HTML, this.baseColor)}"></div>
                <div class="title-box" style="height: ${
                    this.domSanitizer.sanitize(SecurityContext.HTML, this.gridHeight - 2 * 2)}px;
                color:${this.domSanitizer.sanitize(SecurityContext.HTML, this.ylabelColor)}">
                    <span class="title-num  ${
                        this.domSanitizer.sanitize(SecurityContext.HTML, item.replace('%', 'x').replace('/', 'x')
                    .replace('(', 'x').replace(')', 'x'))}"></span>
                    <span class="title" style='color:${this.currTheme === COLOR_THEME.Light
                        ? '#6c7280' : '#e8e8e8'};font-size:12px'>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, itemName)}
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, this.GlobalColumInfo[item].danwei)}</span>
                    <span class="title-num">0</span>
                </div>
                <div class="line" style="margin-top: 2px;background:${
                    this.domSanitizer.sanitize(SecurityContext.HTML, this.baseColor)}">
                </div>`;
            } else {
                html += `
                <div class="title-box" style="height: ${this.domSanitizer
                    .sanitize(SecurityContext.HTML, this.gridHeight - 2 * 2)}px;
                color:${this.domSanitizer.sanitize(SecurityContext.HTML, this.ylabelColor)}">
                    <span class="title-num  ${this.domSanitizer.sanitize(SecurityContext.HTML,
                        item.replace('%', 'x').replace('/', 'x')
                    .replace('(', 'x').replace(')', 'x'))}"></span>
                    <span class="title" style='color:${this.currTheme === COLOR_THEME.Light
                        ? '#6c7280' : '#e8e8e8'};font-size:12px'>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, itemName)}
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, this.GlobalColumInfo[item].danwei)}</span>
                    <span class="title-num">0</span>
                </div>
                <div class="line" style="margin-top: 2px;background:${
                    this.domSanitizer.sanitize(SecurityContext.HTML, this.baseColor)}">
                </div>`;
            }
        });
        $('#' + this.uuid + ' .table-y').html(html);
    }
}
