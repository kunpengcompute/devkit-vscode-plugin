import { Utils } from './../../../service/utils.service';
import { Component, OnInit, AfterViewInit, Input, ChangeDetectorRef, ElementRef, OnDestroy } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { LeftShowService } from '../../../service/left-show.service';
import { MessageService } from '../../../service/message.service';
import { COLOR_THEME, currentTheme } from 'projects/sys/src-ide/app/service/vscode.service';

const IO_DELAY_LINE_WIDTH = 44;
@Component({
    selector: 'app-data-size-chart',
    templateUrl: './data-size-chart.component.html',
    styleUrls: ['./data-size-chart.component.scss'],
})
export class DataSizeChartComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() data;
    @Input() dev;
    @Input() name: string;
    constructor(
        public changeDetectorRef: ChangeDetectorRef,
        public leftShowService: LeftShowService,
        private connectLegends: MessageService,
        private el: ElementRef,
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public uuid: any;
    public i18n: any;
    public tableData: any;
    public echartsInstance: any;
    public scrollDataIndex = 0;
    public lineColorList = ['#267DFF', '#07A9EE', '#41BA41', '#E88B00', '#A050E7', '#E72E90'];
    // echarts 配置项
    public option: any;
    public leftSubscribe;
    public legendSubscribe;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;

    /**
     * 初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        const that = this;
        this.uuid = Utils.generateConversationId(12);
        this.option = {
            title: [{
                text: '',
                top: 10,
                left: 50,
                textStyle: {
                    color: this.currTheme === this.ColorTheme.Dark ? '#e8e8e8' : '#252c3c',
                    height: 16,
                    fontSize: 16,
                    lineHeight: 16,
                    fontWeight: 'normal',
                }
            }],
            legend: {
                icon: 'rect',
                itemWidth: 8,
                itemHeight: 8,
                top: 10,
                algin: 'left',
                right: 50,
                width: '35%',
                height: 12,
                textStyle: {
                    color: this.currTheme === this.ColorTheme.Dark ? '#e8e8e8' : '#282b33',
                    fontSize: 12,
                    lineHeight: 12,
                    fontWeight: 'normal',
                },
                show: true,
                selectedMode: true,
            },
            tooltip: {
                trigger: 'axis',
                borderColor: 'rgba(50,50,50,0)',
                backgroundColor: this.currTheme === this.ColorTheme.Dark ? '#424242' : '#fff',
                borderWidth: 1,
                borderRadius: 5,
                padding: [10, 20, 10, 20],
                extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        width: '88',
                        color: this.currTheme === this.ColorTheme.Dark ? 'rgba(255,255,255,0.1)' : '#267DFF19',
                        opacity: 1,
                    }
                },
                formatter: (value) => {
                    let dataIndex = 0;
                    let perIdx = 1;
                    let wr = 'w';
                    let html = ` <div style="padding:0px 14px"> `;
                    value.forEach((param, index) => {
                        if (index === 0) {
                            dataIndex = param.dataIndex;
                            html += `<div style="color:${this.currTheme === this.ColorTheme.Dark ?
                                '#E8E8E8' : '#282b33'};font-size:12px;line-height:20px;margin-bottom:3px;display:flex;">
                                    <div style="width:95px;color:#aaaaaa;">${param.axisValue}</div><div>
                                    </div>${that.i18n.storageIO.times}</div>`;
                        }
                        if (param.seriesName === this.i18n.storageIO.summury.read) {
                            wr = 'r';
                            perIdx = 1;
                        } else {
                            wr = 'w';
                            perIdx = 2;
                        }
                        html += `<div style="color:${this.currTheme === this.ColorTheme.Dark ?
                            '#E8E8E8' : '#282b33'};font-size:12px;line-height:22px;margin-bottom:3px;display:flex;">
                                    <div style="display:flex;align-items: center;width:95px">
                                    <span style="display:block;margin-right:8px;height:8px;width:8px;
                                    background:${param.color}"></span>
                                    <p> ${param.seriesName}</p></div>
                                    <p>${that.data[dataIndex][wr][0]} (${(param.data[perIdx])}%)</p></div>`;
                    });
                    html += `</div>`;
                    return html;
                }
            },
            dataset: {
                source: []
            },
            xAxis: {
                type: 'category',
                offset: 0,
                show: true,
                axisTick: {
                    show: true, // 坐标轴刻度相关设置
                    alignWithLabel: true
                }, // 刻度对齐
                splitLine: {
                    show: false,  // 刻度线
                },
                axisLine: {
                    lineStyle: {
                        color: '#484a4e',
                    }
                },
                axisLabel: {
                    color: '#aaaaaa',
                }
            },
            grid: [{
                top: 70,
                height: 210,
                left: 60,
                right: '2.5%',
                containLabel: true
            }],
            yAxis: {
                type: 'value',
                splitNumber: 2,
                max: 100,
                min: 0,
                axisLabel: {
                    show: true,
                    color: '#aaaaaa',
                    formatter: '{value} %'
                },
                axisTick: { show: false }, // 坐标轴刻度相关设置
                axisLine: {
                    show: false,
                },
                splitLine: {
                    show: true,  // 刻度线
                    interval: 50,
                    lineStyle: {
                        type: 'solid',
                        color: '#484a4e'
                    }
                }
            },
            series: [
                {
                    type: 'bar',
                    itemStyle: {
                        color: '#3d7ff3'
                    },
                    barWidth: 32,
                    legendHoverLink: false
                },
                {
                    type: 'bar',
                    itemStyle: {
                        color: '#2da46f'
                    },
                    barWidth: 32,
                    legendHoverLink: false
                },
            ]
        };

    }

    /**
     * 钩子函数-初始化之后
     */
    ngAfterViewInit() {
        this.setChartsData();
        this.legendSubscribe = this.connectLegends.getMessage().subscribe((msg) => {
            if (msg.dev === this.dev && msg.page === 'summury'
                && this.option.title[0].text === this.i18n.storageIO.summury.io_delay) {
                this.rebuildOption(msg.data.params, msg.data.showLegendList);
            }
        });
    }

    /**
     * 设置图表数据
     */
    setChartsData() {
        const that = this;
        if (this.name.indexOf('size') !== -1) {
            this.option.legend.show = true;
            this.option.title[0].text = this.i18n.storageIO.summury.data_size;
        } else if (this.name.indexOf('d2c') !== -1) {
            this.option.legend.show = false;
            this.option.title[0].text = this.i18n.storageIO.summury.d2c_io_delay;
            this.option.xAxis.axisLabel.rotate = 45; // x轴刻度标签旋转45°
            this.option.tooltip.axisPointer.lineStyle.width = IO_DELAY_LINE_WIDTH;
            this.option.series.forEach((serie: any) => {
                serie.barWidth = 16;
            });
        } else if (this.name.indexOf('i2d') !== -1) {
            this.option.legend.show = false;
            this.option.title[0].text = this.i18n.storageIO.summury.i2d_io_delay;
            this.option.xAxis.axisLabel.rotate = 45; // x轴刻度标签旋转45°
            this.option.tooltip.axisPointer.lineStyle.width = IO_DELAY_LINE_WIDTH;
            this.option.series.forEach((serie: any) => {
                serie.barWidth = 16;
            });
        } else {
            this.option.legend.show = false;
            this.option.title[0].text = this.i18n.storageIO.summury.io_delay;
        }
        this.option.dataset.source[0] = [
            'product',
            this.i18n.storageIO.summury.read,
            this.i18n.storageIO.summury.write
        ];
        this.data.forEach((ele, index) => {
            const dataArr = [ele.name, Number(ele.r[1].replace('%', '')), Number(ele.w[1].replace('%', ''))];
            this.option.dataset.source.push(dataArr);
        });
        const aXObj = 'ActiveXObject';
        if (!!window[aXObj] || aXObj in window) {
            this.option.tooltip.axisPointer.lineStyle.opacity = 0.3;
        }
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }
        }, 100);
    }

    /**
     * ngx-echarts初始化后触发事件
     */
    public onChartInit(ec) {
        this.echartsInstance = ec;
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
            this.connectLegends.sendMessage({
                page: 'summury',
                dev: this.dev,
                key: '',
                data: { params, showLegendList }
            });
            this.rebuildOption(params, showLegendList);
        });
    }

    /**
     * 重新配置图表参数
     */
    private rebuildOption(params: any, list: any[]) {
        this.echartsInstance.group = '';    // 解除 echarts
        const lineNum = [];
        const option = this.tableData;
        option.legend.selected = params.selected;
        option.legend.scrollDataIndex = this.scrollDataIndex;
        setTimeout(() => {    // 异步更新数据
            this.tableData = option;
            this.echartsInstance.clear();
            this.echartsInstance.setOption(option, true);
        }, 100);
    }


    /**
     * 取消订阅
     */
    ngOnDestroy() {
        if (this.legendSubscribe) {
            this.legendSubscribe.unsubscribe();
        }
        if (this.leftSubscribe) {
            this.leftSubscribe.unsubscribe();
        }
    }
}
