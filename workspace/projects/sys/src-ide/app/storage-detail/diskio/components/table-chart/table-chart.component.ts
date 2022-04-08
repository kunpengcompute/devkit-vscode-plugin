import {
    Component, ElementRef, EventEmitter, Input, OnInit, Output, AfterViewInit, SecurityContext
} from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';
import { MessageService } from '../../../../service/message.service';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { Utils } from '../../../../service/utils.service';
import { COLOR_THEME, currentTheme } from './../../../../service/vscode.service';

@Component({
    selector: 'app-table-chart',
    templateUrl: './table-chart.component.html',
    styleUrls: ['./table-chart.component.scss'],
})
export class TableChartComponent implements OnInit, AfterViewInit {
    @Input() datas: any;
    @Input() timeLine: any;
    @Input() ifDeatlis: boolean;
    @Output() public dataZoom = new EventEmitter<any>();
    @Output() public echartsInstOut = new EventEmitter<any>();
    @Output() public brushOut = new EventEmitter<any>();
    @Output() public viewDetails = new EventEmitter<any>();
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public echartsInstance: any;
    public tableData: any;
    public baseTop = 20;
    public gridHeight = 80;
    public baseColor = '#484a4e';
    public ylabelColor = '#999';
    public lineColorList = ['#3d7ff3', '#2da46f', '#18aba6', '#9653e1', '#618824', '#ad2776', '#c24123', '#ab254e'];
    public filter = {};
    public time: any;
    // 读\写
    public spec: any;
    // 数据大小\时延\队列深度
    public key: any;
    // 设备
    public devArr: Array<string>;
    public uuid: any;
    public GlobalColumInfo: any;
    public scrollDataIndex = 0;
    public option: any = {
        legend: {
            data: [],
            type: 'scroll',
            icon: 'path://M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,\
            11 L10,8 L6,8 L6,11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z',
            top: 0,
            algin: 'left',
            right: 50,
            width: '35%',
            itemHeight: 5,
            itemWidth: 25,
            show: true,
            selectedMode: true
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
        },
        {
            type: 'inside'
        }],
        tooltip: {},
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            snap: true
        },
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
    };
    public leftSubscribe: any;
    public i18n: any;

    constructor(
        public i18nService: I18nService,
        public msgService: MessageService,
        private el: ElementRef,
        private sanitizer: DomSanitizer
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        if (this.currTheme === this.ColorTheme.Light) {
            this.baseColor = '#e6ebf5';
            this.option.legend.textStyle.color = '#252c3c';
        }
        this.uuid = Utils.generateConversationId(12);
    }

    /**
     * 页面渲染完成
     */
    ngAfterViewInit() {
        this.initTable();
    }

    /**
     * ngx-echarts 初始化时调用
     */
    onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });
        this.echartsInstance.on('legendscroll', (params: any) => {
            this.scrollDataIndex = params.scrollDataIndex;
        });
        this.echartsInstance.on('legendselectchanged', (params: any) => {  // 点击图例
            const showLegendList = [];
            for (const key of Object.keys(params.selected)) {
                const isSelected = params.selected[key];
                if (isSelected) {
                    showLegendList.push(key);
                }
            }
            this.rebuildOption(params, showLegendList);
        });
    }

    /**
     * 重建canvas
     */
    private rebuildOption(params: any, list: any[]) {
        this.echartsInstance.group = '';    // 解除 echarts
        const lineNum: any = [];
        const option = this.tableData;
        option.legend.selected = params.selected;
        option.legend.scrollDataIndex = this.scrollDataIndex;
        option.series.forEach((series: any) => {
            if (list.indexOf(series.name) >= 0) {
                if (lineNum.indexOf(series.name) === -1) {
                    lineNum.push(series.name);
                }
            }
        });
        setTimeout(() => {    // 异步更新数据
            this.tableData = option;
            this.echartsInstance.clear();
            this.echartsInstance.setOption(option, true);
        }, 100);
        // echarts 实例绑定在一块
        setTimeout(() => {
            this.echartsInstOut.emit(this.echartsInstance);
        }, 100);
    }

    /**
     * 初始化数据
     */
    public initTable() {
        this.time = this.datas.time;
        this.spec = this.datas.spec;
        this.key = this.datas.key;
        this.devArr = this.datas.devArr;
        this.setData(this.timeLine);
    }

    /**
     * 导入数据生成canvas
     */
    public setData(timeData: any) {
        // 清空数据
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        this.option.dataZoom[0].start = timeData.start;
        this.option.dataZoom[0].end = timeData.end;
        this.option.dataZoom[0].xAxisIndex = this.key.map((item: any, index: any) => index);
        this.option.dataZoom[0].top = this.key.length * this.gridHeight;
        const legends: any = [];
        this.devArr.forEach((dev, dieIndex) => {
            this.spec.forEach((spec: any, specIndex: any) => {
                legends.push({
                    name: dev + '/' + spec.title,
                    icon: 'rect',
                    textStyle: {
                        color: '#e8e8e8'
                    }
                });
            });
        });
        this.option.legend.data = legends;
        if (this.spec.length === 0) {
            this.option.legend.show = false;
        }
        this.key.forEach((item: any, index: any) => {
            this.option.grid.push(this.makeGrid(this.baseTop + this.gridHeight * index, {}));
            this.option.yAxis.push(
                this.makeYAxis(index, {
                    name: item.title,
                    max: (value: any) => {
                        if (value.max === 0 || value.max === -Infinity) {
                            $('#' + this.uuid + ' .table-y ' + ` .${item.title}`).html('1.00');
                        } else {
                            $('#' + this.uuid + ' .table-y ' + ` .${item.title
                            .replace('%', 'x')
                            .replace('/', 'x')}`)
                            .html(
                                Utils.setThousandSeparator((value.max * 1.5).toFixed(2)) + item.unit);
                        }
                        return value.max * 1.5;
                    }
                }),
            );
            if (index !== this.key.length - 1) {
                this.option.xAxis.push(
                    this.makeXAxis(index, {
                        axisLabel: {
                            show: false,
                            color: 'rgba(0,0,0,0)', // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
                            formatter(value: any) {
                                return value;
                            }
                        }, // 坐标轴刻度标签的相关设置
                        axisPointer: {
                            show: true,
                            lineStyle: {
                                color: '#6C7280',
                                width: 1
                            }
                        }
                    })
                );
            } else {
                this.option.xAxis.push(
                    this.makeXAxis(index, {
                        axisLabel: {
                            show: false,
                            color: 'rgba(0,0,0,0)',
                            interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
                            formatter(value: any) {
                                return value;
                            }
                        }, // 坐标轴刻度标签的相关设置
                        axisPointer: {
                            show: true,
                            lineStyle: {
                                color: '#6C7280',
                                width: 1
                            }
                        }
                    })
                );
            }
        });
        // 多的一个grid
        this.option.grid.push(this.makeGrid(this.baseTop, {
            show: false,
            height: 1,
            z: 10,
        }));
        this.option.xAxis.push(
            this.makeXAxis(this.key.length, {
                position: 'top',
                axisPointer: {
                    show: true,
                    lineStyle: {
                        color: '#484a4e',
                        width: 1
                    }
                }
            })
        );
        this.option.yAxis.push(
            this.makeYAxis(this.key.length, {}),
        );
        // 设置series
        if (this.spec.length > 0) {
            this.devArr.forEach((dev, ideIndex) => {
                this.key.forEach((item: any, index: any) => {
                    let colorIndex1 = 0;
                    if (this.lineColorList.length < ideIndex) { // 如果颜色不够用
                        colorIndex1 = Math.floor((ideIndex) / this.lineColorList.length);
                    } else {
                        colorIndex1 = ideIndex;
                    }
                    this.spec.forEach((item2: any, index2: any) => {
                        const seriesObj: any = {
                            name: dev + '/' + item2.title,
                            type: 'line',
                            symbol: 'emptyCircle',
                            symbolSize: 4,
                            showAllSymbol: false,
                            xAxisIndex: index,
                            yAxisIndex: index,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: this.lineColorList[index2], // 折点颜色
                                },
                                color: this.lineColorList[index2]  // 折线颜色
                            },
                            data: this.datas.data[dev][item2.key][item.key]
                        };
                        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
                          seriesObj.itemStyle.emphasis = {
                            color: this.lineColorList[index2], // 折点颜色
                            borderColor: '#fff',
                            borderWidth: 2
                          };
                        }
                        this.option.series.push(seriesObj);
                    });
                });
            });
        }
        this.makeTooltip();
        const height = this.key.length * this.gridHeight + this.baseTop * 2 + 15;
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
     * 设置坐标系
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top: top + 20,
            height: this.gridHeight,
            left: 25,
            right: '2.5%',
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 设置X轴
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: false,
            offset: 0,
            data: this.time,
            axisLine: { onZero: false, lineStyle: { color: this.baseColor, width: 1 } },
            axisTick: { show: false }, // 坐标轴刻度相关设置
            axisLabel: {
                show: false,
                color: this.ylabelColor,
                interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
                formatter(value: any) {
                    value = parseFloat(value);
                    return value.toFixed(3) + 's';
                }
            }, // 坐标轴刻度标签的相关设置
            splitLine: {
                show: false,
                lineStyle: { color: this.baseColor },
                interval: this.time.length < 300 ? 0 : Math.floor((this.time.length / 200)),
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
     * 设置Y轴
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
            splitNumber: 1 // y轴刻度间隔
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 设置图表tooltip
     */
    public makeTooltip() {
        this.option.tooltip = {
            trigger: 'axis',
            borderColor: 'rgba(50,50,50,0)',
            backgroundColor: this.currTheme === this.ColorTheme.Dark ? '#424242' : '#fff',
            borderWidth: 1,
            borderRadius: 5,
            hideDelay: 500,
            enterable: true,
            confine: true,
            padding: [10, 20, 10, 20],
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: this.currTheme === this.ColorTheme.Dark ? '#478cf1' : '#6C7280',
                    width: 1.1
                }
            },
            transitionDuration: 1, // 移动过度时间
            textStyle: {
                color: '#222222',
                fontSize: 12,
            },
            formatter: (params: any) => {
                let titleList = [this.i18n.storageIO.diskio.top_delayr1, this.i18n.storageIO.diskio.top_delayw1];
                if (this.key.length > 1) {
                    titleList = [this.i18n.storageIO.diskio.top_datar1, this.i18n.storageIO.diskio.top_dataw1,
                    this.i18n.storageIO.diskio.top_thr1, this.i18n.storageIO.diskio.top_thw1];
                }
                let time = '';
                let html = `<div style="padding:8px 0px;font-size:12px;color:${this.currTheme === this.ColorTheme.Dark ?
                    '#E8E8E8' : '#282b33'}" class='chart-tip'>`;
                params.forEach((item: any, index1: any) => {
                    if (index1 === 0) {
                        time = item.axisValue;
                        html += `<div style="display:flex;color:#aaaaaa;padding-left:4px;">
                            <span>${this.sanitizer.sanitize(SecurityContext.HTML, item.axisValue)}</span></div>`;
                    }
                    const ifRead = item.seriesName.indexOf('read') > -1 || item.seriesName.indexOf('读') > -1
                        ? true : false;
                    html += `<div style="display:flex;line-height:25px;align-items:center;">`;
                    html += `<span *ngIf="ifRead"
                        style="display:block;margin-right:16px;height:8px;width:9px;background:
                        ${this.sanitizer.sanitize(SecurityContext.HTML, item.color)}"></span>`;
                    const unitIdx = Math.floor(index1 / 2);
                    html += `<span style="width:120px;">
                        ${this.sanitizer.sanitize(SecurityContext.HTML, titleList[index1])}</span>
                        <span>${this.sanitizer.sanitize(SecurityContext.HTML, item.data)}
                        ${this.sanitizer.sanitize(SecurityContext.HTML, this.key[unitIdx].unit)}</span></div>`;
                });
                html += `<div style="width:100%;height:2px;background:#5d5d5d;margin:5px 0 8px"></div>`;
                html += `<div class="diskViewDetails" data-time="${this.sanitizer.sanitize(SecurityContext.HTML, time)}"
                    style="display:flex;align-items:center;width:100%;color:${this.currTheme === this.ColorTheme.Dark ?
                        '#E8E8E8' : '#282b33'};cursor:pointer;">
                    <span>${this.i18n.storageIO.summury.viewDetails}</span>
                    <img style="width:12px;height:11px;margin-left:10px;"
                        src="./assets/img/micarch/enter-detail.svg"></div>`;
                setTimeout(() => {
                    const viewDetailButton = document.querySelector('.diskViewDetails') as HTMLImageElement;
                    viewDetailButton.onclick = () => {
                        const time1 = viewDetailButton.dataset.time;
                        this.viewDetails.emit(time1);
                    };
                }, 500);
                return html;
            }
        };
    }

    /**
     * 设置左侧title
     */
    public setLeft() {
        let html = ``;
        this.key.forEach((item: any, index: any) => {
            const itemName = item.title;
            if (index === 0) {
                html += `<div class="line" style="margin-top: ${this.baseTop + 20}px;background:${this.baseColor}">
                    </div>
                    <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
                    <span class="title-num ${this.sanitizer.sanitize(SecurityContext.HTML, itemName)}"></span>
                    <span style="color:${this.currTheme === this.ColorTheme.Dark ? '#e8e8e8' : '#6c7280'}">
                    ${this.sanitizer.sanitize(SecurityContext.HTML, itemName)}</span>
                    <span class="title-num">0</span></div>
                    <div class="line" style="margin-top: 3px;background:${this.baseColor}"></div>`;
            } else {
                html += `<div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
                    <span class="title-num ${this.sanitizer.sanitize(SecurityContext.HTML, itemName)}"></span>
                    <span style="color:${this.currTheme === this.ColorTheme.Dark ? '#e8e8e8' : '#6c7280'}">
                    ${this.sanitizer.sanitize(SecurityContext.HTML, itemName)}</span>
                    <span class="title-num">0</span></div>
                    <div class="line" style="margin-top: 3px;background:${this.baseColor}"></div>`;
            }
        });
        $('#' + this.uuid + ' .table-y').html(html);
    }
}
