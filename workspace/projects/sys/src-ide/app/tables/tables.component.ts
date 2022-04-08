import {
    Component, OnInit, Input, AfterViewInit, ChangeDetectorRef, ViewChild, Output, EventEmitter
} from '@angular/core';
import { AxiosService } from '../service/axios.service';
import { TiTipRef, TiTipService } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
import { LeftShowService } from '../service/left-show.service';
import { Utils } from '../service/utils.service';
import {COLOR_THEME, currentTheme} from './../service/vscode.service';

/**
 * echarts线条样式常量
 */
const enum SERIES_THEME {
    Fill = 1,
    Linear = 2
}
@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit, AfterViewInit {
    private tipInstance: TiTipRef; // tip组件实例
    private tipShowState = false; // tip显示状态标志位
    @Input() datas;
    @Input() timeLine: any;
    @Input() isHave: string;
    @Input() isMe: string;
    @Output() public dataZoom = new EventEmitter<any>();
    @Output() public echartsInstOut = new EventEmitter<any>();
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public suggest = '';
    public i18n: any;
    public timer; // 延时器
    public yMax = 0;
    public isMore1 = false;
    public isMore2 = false;
    public echartsInstance: any;
    public tableData: any;
    public count = 70;
    public intervalCount = 67;
    public baseTop = 20;
    public gridHeight = 160;
    public baseColor = '#e6ebf5';
    public ylabelColor = '#999';
    public titleHeight = 78;  // 组与组之间的距离
    public gridGap = 60;
    public lineColorList = ['#3D7FF3', '#298A5F', '#2C8E8B', '#8739DB', '#4E8A30',
        '#A73074', '#A44017', '#A7264D', '#C0691C', '#BAB42B'];
    public filter = {};
    public time: any;
    public spec: any;
    public uuid: any;
    public GlobalColumInfo: any;
    // 绘图网格纵坐标刻度标签离容器左侧的距离
    private yAxisWidth = 80;
    public option = {
        title: {
            textStyle: {
                color: '#e8e8e8'
            }
        },
        legend: [],
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
            type: 'inside',
            zoomOnMouseWheel: true
        }],
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            snap: true
        },
        tooltip: {
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
    public scrollDataIndex = 0;
    public language = 'zh';
    public showSwap = false; // 控制dom显隐 防止报错
    constructor(
        public Axios: AxiosService,
        public changeDetectorRef: ChangeDetectorRef,
        private tipService: TiTipService,
        public leftShowService: LeftShowService,
        public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        if (this.currTheme === this.ColorTheme.Light) {
            this.baseColor = '#e6ebf5';
            this.option.title.textStyle.color = '#282b33';
        }
        this.leftShowService.timelineUPData.subscribe((e) => {
            this.upDateTimeLine(e);
        });

        this.uuid = Utils.generateConversationId(12);
        if (this.isHave === 'swap') {
            if (this.datas.data.values['pswpin/s']) {
                const arr1 = this.datas.data.values['pswpin/s'];
                for (const item of arr1) {
                    if (item > 0) {
                        this.isMore1 = true;
                    }
                }
            }
            if (this.datas.data.values['pswpout/s']) {
                const arr2 = this.datas.data.values['pswpout/s'];
                for (const item of arr2) {
                    if (item > 0) {
                        this.isMore2 = true;
                    }
                }
            }
            if (this.isMore1 || this.isMore2) {
                if (self.webviewSession.getItem('language') === 'zh-cn') {
                    this.suggest = this.datas.suggestion.suggest_chs;
                    this.language = 'zh';
                } else {
                    this.language = 'en';
                    this.suggest = this.datas.suggestion.suggest_en;
                }
            }
            // swap 在 ngOnInit 初始化
            this.showSwap = true;
            this.time = this.datas.data.time;
            this.spec = this.datas.spec.map(item => item.id);
            this.setData(this.timeLine);
        }
    }

    /**
     * 页面初始化后执行
     */
    ngAfterViewInit() {
        // 区分 swap 和其他 如果是 swap 不在 ngAfterViewInit 初始化
        this.initTable('unswap');
    }

    /**
     * chart初始化
     */
    onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', params => {
            // 放大缩小时调用接口
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });
        this.echartsInstance.on('legendscroll', params => {
            this.scrollDataIndex = params.scrollDataIndex;
        });
        this.echartsInstance.on('legendselectchanged', params => {  // 点击图例
            const showLegendList = [];
            for (const key of Object.keys(params.selected)) {
                const isSelected = params.selected[key];
                if (isSelected && key !== this.i18n.sys.averValue) {
                    showLegendList.push(key);
                }
            }
            this.rebuildOption(params, showLegendList);
        });
    }

    /**
     * 更新时间轴
     */
    public upDateTimeLine(data) {
        this.option.dataZoom[0].start = (data.start).toFixed(2);
        this.option.dataZoom[0].end = (data.end).toFixed(2);
        this.echartsInstance.setOption({
            dataZoom: this.option.dataZoom
        });
    }

    /**
     * 初始化table
     */
    public initTable(str = '') {
        this.scrollDataIndex = 0;
        if (str === 'unswap' && this.isHave !== 'swap') {
            this.time = this.datas.data.time;
            this.spec = this.datas.spec.map(item => item.id);
            this.setData(this.timeLine);
        }
        // swap 类型单独处理 mem-detail 调用 initTable 时传参 this.swap.initTable('swap');
        if (str === 'swap' || !str) {
            this.time = this.datas.data.time;
            this.spec = this.datas.spec.map(item => item.id);
            this.setData(this.timeLine);
        }
    }

    /**
     * 构造直角坐标系 grid 中的X轴样式
     */
    public makeXAxis(gridIndex, opt) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: false,
            offset: 0,
            data: this.time,
            axisLine: { onZero: true, lineStyle: { color: '#484A4E', width: 2 } },
            axisTick: {
                inside: false, show: true, length: 8,
                lineStyle: {
                    width: 1,
                    color: '#484A4E',
                    type: 'solid'
                }
            }, // 坐标轴刻度相关设置
            axisLabel: {
                show: false,
                color: '#AAAAAA',
                margin: 20,
                interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))

            }, // 坐标轴刻度标签的相关设置

            splitLine: {
                show: false,
                lineStyle: { color: this.baseColor },
                interval: 0
            },
        };

        if (option) {
            Object.assign(option, opt);
        }

        return option;

    }

    /**
     * 构造直角坐标系 grid 中的Y轴样式
     */
    public makeYAxis(gridIndex: any, opt: any) {
        const options = {
            type: 'value',
            show: true,
            gridIndex,
            // Y轴标题
            name: this.datas.key[0].id,
            nameLocation: 'end',
            nameTextStyle: {
                color: this.currTheme === COLOR_THEME.Dark ? '#E8E8E8' : '#222',
                fontSize: 14,
                height: 14,
                // 调整Y轴标题位置
                padding: [0, 0, -10, 0 - this.yAxisWidth],
                lineHeight: 14,
                align: 'left'
            },
            nameGap: 30,
            nameRotate: 0,
            offset: 0,
            min: 0,
            max: 'dataMax',
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { show: true, color: '#AAAAAA' },
            // Y轴分割线
            splitLine: { show: true, lineStyle: { color: '#383838', width: 1 } }
        };

        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 构造直角坐标系内绘图网格样式
     */
    public makeGrid(top, opt) {
        const options = {
            top: top + 20,
            height: this.gridHeight,
            left: this.yAxisWidth,
            right: '2.5%',
            borderWidth: 0,
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 构造图例样式
     */
    public makeLegend(data, top) {
        const option = {
            data,
            type: 'scroll',
            icon: 'rect',
            itemWidth: 8,
            itemHeight: 8,
            top,
            algin: 'left',
            right: 50,
            width: '35%',
            height: 12,
            textStyle: {
                color: this.currTheme === this.ColorTheme.Dark ? '#E8E8E8' : '#282b33',
                fontSize: 12,
                lineHeight: 12,
                fontWeight: 'normal',
            },
            show: true,
            selectedMode: true,
            formatter(name) {
                const info = name.split(',')[0];
                return info;
            }
        };
        return option;
    }

    /**
     * 配置图例
     */
    private buildLegend() {
        const legends = [];
        if (this.spec.length > 0) {
            const legend = [];  // 图例
            if (this.isHave === 'cpu' || this.isHave === 'consumption') {
                legend.push(this.i18n.sys.averValue);
            }
            this.spec.forEach((item2, index2) => {
                legend.push(this.datas.type === 'cpu' ? item2 + '-CPU' : item2);
            });
            legends.push(this.makeLegend(legend, 0));
        }
        return legends;
    }
    /**
     * setData
     */
    public setData(timeData: any) {
        // 清空数据
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        // 配置图例
        this.option.legend = this.buildLegend();
        // 配置区域缩放控制器
        this.buildDataZoom(timeData);
        // 配置绘图网格
        this.option.grid = this.buildGrid();
        // 配置直角坐标系 grid 中的X轴
        this.option.xAxis = this.buildXAxis();
        // 配置直角坐标系 grid 中的Y轴
        this.option.yAxis = this.buildYAxis();
        // 配置图表类型和数据
        this.option.series = this.buildSeries();
        // 配置提示框
        this.option.tooltip = this.buildOptionTooltip(this.option.yAxis[0].name);
        const height = (this.gridHeight + this.titleHeight);
        // 第一次设置 height 时不生效 这里使用 setTimeout
        if (this.isHave === 'swap') {
            setTimeout(() => {
                $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
            }, 0);
        } else {
            $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
        }
        setTimeout(() => {
            this.tableData = this.option;

            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }
            // echarts图表联动
            setTimeout(() => {
                this.echartsInstOut.emit(this.echartsInstance);
            }, 100);
        }, 100);
    }

    /**
     * 配置区域缩放，从而能自由关注细节的数据信息，或者概览数据整体，或者去除离群点的影响。
     */
    private buildDataZoom(timeData: any) {
        this.option.dataZoom[0].start = timeData.start;
        this.option.dataZoom[0].end = timeData.end;
        // 只有一个坐标轴
        this.option.dataZoom[0].xAxisIndex = [0];
        this.option.dataZoom[0].top = this.gridHeight + this.baseTop + 60;
    }

    /**
     * 配置绘图网格
     */
    private buildGrid() {
        const grid = [];
        grid.push(this.makeGrid(this.baseTop, {}));
        return grid;
    }

    /**
     * 配置直角坐标系 grid 中的 x 轴
     */
    private buildXAxis() {
        const xAxis = [];
        xAxis.push(
            this.makeXAxis(0, {
                axisLabel: {
                    show: true,
                    color: this.ylabelColor,
                    // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
                    interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))
                },
                // 坐标轴刻度标签的相关设置
                axisPointer: {
                    show: true,
                    lineStyle: {
                        color: '#AAAAAA',
                        width: 1.5
                    }
                },
                splitLine: {
                    show: false,
                    // 刻度线
                    interval: 0
                },
            })
        );
        return xAxis;
    }

    /**
     * 配置直角坐标系 grid 中的 y 轴
     */
    private buildYAxis() {
        const yAxis = [];

        yAxis.push(
            this.makeYAxis(0, {}),
        );

        return yAxis;
    }

    /**
     * 配置图表类型和数据
     */
    private buildSeries() {
        const series = [];
        let cupSeries: any;
        if (this.spec.length > 0) {
            if (this.isHave === 'cpu' || this.isHave === 'consumption') {
                cupSeries = {
                    name: this.i18n.sys.averValue,
                    data: this.datas.data.values.all[this.datas.key[0].id],
                    symbol: 'circle',
                    showSymbol: false, // 配置为false，线条上不展示圆圈，鼠标移动到对应坐标点时才展示圆圈图标
                    symbolSize: 4, // 曲线上圆圈标记的大小
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    type: 'line', // 线条类型为折线
                    smooth: true, // 折线线条平滑展示
                    lineStyle: {
                        color: '#9Ea4b3',
                        type: 'dashed',
                        width: 2
                    },
                    itemStyle: {
                        normal: {
                            color: '#9Ea4b3'
                        },
                    }
                };
            }
            this.spec.forEach((item2, index2) => {
                let colorIndex = 0;
                if (this.lineColorList.length < index2) {
                    colorIndex = Math.floor(index2 / this.lineColorList.length);
                } else {
                    colorIndex = index2;
                }
                const seriesData: any = {
                    name: this.datas.type === 'cpu' ? item2 + '-CPU' : item2,
                    type: 'line', // 线条类型为折线
                    smooth: true, // 折线线条平滑展示
                    symbol: 'circle',
                    showSymbol: false, // 配置为false，线条上不展示圆圈，鼠标移动到对应坐标点时才展示圆圈图标
                    symbolSize: 4, // 曲线上圆圈标记的大小
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    lineStyle: {
                        color: this.lineColorList[colorIndex],
                        width: 2
                    },
                    itemStyle: {
                        normal: {
                            color: this.lineColorList[colorIndex]
                        }
                    },
                    data: this.datas.data.values[item2][this.datas.key[0].id]
                };
                series.push(seriesData);
            });
        } else {
            series.push(
                {
                    name: this.datas.key[0].id,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4, // 曲线上圆圈标记的大小
                    showSymbol: false, // 配置为false，线条上不展示圆圈，鼠标移动到对应坐标点时才展示圆圈图标
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    lineStyle: {
                        width: 2
                    },
                    itemStyle: {
                        normal: {
                            color: (e) => {
                                if (this.isHave === 'swap' && this.isMore1 && e.value > 0 && e.value < 10000) {
                                    return '#f45c5e';
                                } else {
                                    return this.lineColorList[0];
                                }
                            }, // 折线点的颜色
                            lineStyle: { color: this.lineColorList[0] }// 折线的颜色
                        }
                    },
                    data: this.datas.data.values[this.datas.key[0].id]
                }
            );
        }
        this.setAreaStyle(series);
        const seriesArray = [];
        seriesArray.push(cupSeries);
        seriesArray.push(...series);
        return seriesArray;

    }
    private setAreaStyle(series: any[]) {
        if (series.length === 1) {
            series[0].areaStyle = { opacity: 0.16, color: this.lineColorList[0] };
        } else if (series.length === 2) {
            series.forEach((each: any) => {
                each.areaStyle = {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: this.hex2rgba(each.itemStyle.normal.color, 0.5) // 0% 处的颜色
                        }, {
                            offset: 1, color: this.hex2rgba(each.itemStyle.normal.color, 0) // 100% 处的颜色
                        }],
                        globalCoord: false
                    }
                };
            });
        }
    }

    private hex2rgba(color: any, opacity: any) {
        color = color.substring(1);
        color = color.toLowerCase();
        const b = [];
        for (let x = 0; x < 3; x++) {
            b[0] = color.substr(x * 2, 2);
            b[3] = '0123456789abcdef';
            b[1] = b[0].substr(0, 1);
            b[2] = b[0].substr(1, 1);
            b[20 + x] = b[3].indexOf(b[1]) * 16 + b[3].indexOf(b[2]);
        }
        return 'rgba(' + b[20] + ',' + b[21] + ',' + b[22] + ',' + opacity + ')';
    }
    /**
     * 获取当前style
     */
    public getStyle(type, item = '') {
        if (type === 'line') {
            return {
                'margin-top': `${this.baseTop + 20 - 1}px`,
                background: `${this.baseColor}`
            };
        } else if (type === 'title-box') {
            return {
                height: `${this.gridHeight - 2 * 2}px`,
                color: `${this.ylabelColor}`
            };
        } else if (type === 'line-bottom') {
            return {
                'margin-top': '2px',
                background: `${this.baseColor}`
            };
        } else if (type === 'title-box2') {
            return {
                height: `${this.gridHeight - 2 * 2}px`,
                color: `${this.ylabelColor}`
            };
        } else if (type === 'img') {
            return {
                display: `${this.isHave === 'swap' ? (item === 'pswpin/s' ?
                    (this.isMore1 ? 'block' : 'none') : (this.isMore2 ? 'block' : 'none')) : 'none'}`
            };
        }
        return null;
    }

    /**
     * 获取 class
     */
    public getClass(type, item) {
        if (type === 'title-num') {
            return `${item.replace('%', 'x').replace('/', 'x').replace('(', 'x').replace(')', 'x')}`;
        }
        return '';
    }
    /**
     * 构造提示框样式
     */
    private buildOptionTooltip(yAxisName: any) {
        return {
            trigger: 'axis',
            borderColor: 'rgba(49,49,49,0)',
            backgroundColor: this.currTheme === this.ColorTheme.Dark ? 'rgba(49,49,49,1)' : '#fff',
            borderWidth: 1,
            borderRadius: 4,
            enterable: true,
            confine: true,
            padding: [11, 18, 13, 18],
            triggerOn: 'mousemove',
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            axisPointer: {
                show: false,
                type: 'line',
                lineStyle: {
                    color: this.currTheme === this.ColorTheme.Dark ? '#7E8083' : '#6C7280',
                    width: 1
                }
            },
            position: (point, params, dom, rect, size) => {
                return [point[0], (size.viewSize[1] - size.contentSize[1]) / 2];
            },
            formatter: (params: any) => {
                if (params.length) {
                    const xAxisName = params[0].axisValue;
                    let html = `<div style="overflow-y:auto;max-height:140px;display:flex;
                    align-items:flex-start;justify-content:flex-start;">`;
                    let leftHtml = `<div style="display:flex;align-items:flex-start;
                        justify-content:flex-start;flex-direction:column;">`;
                    leftHtml += `<div style="color:${this.currTheme === this.ColorTheme.Dark ? '#AAAAAA' :
                        '#282b33'};text-align:left;">${xAxisName}</div>`;

                    let rightHtml = `<div style="margin-left: 32px;">
                    <div style="color:${this.currTheme === this.ColorTheme.Dark ? '#E8E8E8' :
                            '#282b33'};text-align:left;">${yAxisName}</div>`;

                    params.forEach((param: any, index: number) => {
                        let marginTop = 10;
                        if (index === 0) {
                            marginTop = 12;
                        }
                        leftHtml += `<div style="margin-top:${marginTop}px;
                            display:flex;align-items:center;justify-content:flex-start;">`;
                        const reg = /background-color:(#[a-zA-Z0-9]+)/;
                        if (reg.test(param.marker)) {
                            leftHtml += `<div style="margin-right: 8px;width: 8px;height: 8px;background-color:${
                                RegExp.$1};">
                                </div>`;
                        } else {
                            leftHtml += param.marker;
                        }
                        const seriesName = param.seriesName + ':';
                        leftHtml += `<div style="color:${this.currTheme === this.ColorTheme.Dark ? '#E8E8E8' :
                            '#282b33'};text-align:left;">${seriesName}</div></div>`;
                        rightHtml += `<div style="margin-top:${marginTop}px;color:
                            ${this.currTheme === this.ColorTheme.Dark
                            ? '#E8E8E8' : '#282b33'};text-align:left;">${param.value}</div>`;
                    });
                    leftHtml += `</div>`;
                    rightHtml += `</div>`;
                    html += leftHtml + rightHtml + '</div>';
                    return html;
                }
                return '';
            },
        };
    }

    private rebuildOption(params: any, list: any[]) {
        let lineNum = 0;
        const option = this.tableData;
        option.legend[0].selected = params.selected;
        option.legend[0].scrollDataIndex = this.scrollDataIndex;
        option.series.forEach(series => {
            if (list.indexOf(series.name) >= 0) {
                lineNum++;
            }
        });
        option.series.forEach(series => {
            if (list.indexOf(series.name) >= 0) {
                if (lineNum === SERIES_THEME.Fill) {
                    series.areaStyle = { opacity: 0.2 };
                } else if (lineNum === SERIES_THEME.Linear) {
                    series.areaStyle = {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: this.hex2rgba(series.itemStyle.normal.color, 0.5) // 0% 处的颜色
                            }, {
                                offset: 1, color: this.hex2rgba(series.itemStyle.normal.color, 0) // 100% 处的颜色
                            }],
                            globalCoord: false
                        }
                    };
                } else if (series.areaStyle) {
                    delete series.areaStyle;
                }
            }
        });
        setTimeout(() => {
            this.tableData = option;
            this.echartsInstance.clear();
            this.echartsInstance.setOption(option, true);
        }, 100);
    }
}
