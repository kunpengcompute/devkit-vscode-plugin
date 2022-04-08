import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TiTipRef } from '@cloud/tiny3';
import { fromEvent } from 'rxjs';
import { Utils } from '../../../../service/utils.service';
import { I18nService } from '../../../../service/i18n.service';
import {COLOR_THEME, currentTheme} from './../../../../service/vscode.service';

@Component({
    selector: 'app-data-block',
    templateUrl: './data-block.component.html',
    styleUrls: ['./data-block.component.scss'],
})
export class DataBlockComponent implements OnInit, AfterViewInit {
    @Input() datas: any;
    @Input() timeLine: any;
    @Input() isHave: string;
    @Input() isMe: string;
    @Output() public dataZoom = new EventEmitter<any>();
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    // tip组件实例
    private tipInstance: TiTipRef;
    // tip显示状态标志位
    private tipShowState = false;
    public i18n: any;
    public echartsInstance: any;
    public tableData: any;
    public baseTop = 47;
    public gridHeight = 140;
    public baseColor = '#e6ebf5';
    // 组与组之间的距离
    public titleHeight = 78;
    public uuid: any;
    public option: any = {
        title: [],
        legend: ['block'],
        tooltip: {},
        axisPointer: {
            snap: true
        },
        grid: [],
        xAxis: [],
        yAxis: [],
        series: [],
    };
    public scrollDataIndex = 0;

    constructor(
        private domSanitizer: DomSanitizer,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        this.uuid = Utils.generateConversationId(12);
    }

    /**
     * 页面渲染完成
     */
    ngAfterViewInit() {
        this.setData();
    }

    /**
     * ngx-echarts初始化后触发事件
     */
    public onChartInit(ec: any) {
        this.echartsInstance = ec;
        // 放大缩小时调用接口
        this.echartsInstance.on('datazoom', (params: any) => {
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });

        this.echartsInstance.on('legendscroll', (params: any) => {
            this.scrollDataIndex = params.scrollDataIndex;
        });
        // 点击图例
        this.echartsInstance.on('legendselectchanged', (params: any) => {
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
        // 解除 echarts
        this.echartsInstance.group = '';
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
    }

    /**
     * 初始化数据
     */
    public setData() {
        // 清空配置项
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        this.option.title = [];
        this.option.legend = [];
        // 设置配置项
        this.option.xAxis.push(this.makeXAxis(0, {}));
        this.option.yAxis = this.makeYAxis(0, {});
        this.option.title.push(this.makeTitle(this.i18n.storageIO.iodistribution, 0));
        this.option.grid.push(this.makeGrid(this.baseTop, {}));
        this.makeSeries();
        this.makeTooltips();
        const height = this.gridHeight + this.titleHeight;
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }
        }, 100);
    }

    /**
     * 设置X轴
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: true,
            offset: 0,
            data: this.datas.time,
            show: true,
            axisLine: { onZero: false, lineStyle: { color: '#4a484e', width: 1 } },
            axisTick: { show: true }, // 坐标轴刻度相关设置
            axisLabel: {
                show: true,
                color: '#aaaaaa',
                interval: this.datas.time.length < 21 ? 0 : Math.floor((this.datas.time.length / 21))
            },  // 坐标轴刻度标签的相关设置
            axisPointer: {
                show: true,
                lineStyle: {
                    color: '#4a484e',
                    width: 0
                }
            },
            splitLine: {
                show: false,  // 刻度线
                interval: 0
            },
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
        const options = [{
            type: 'value',
            show: true,
            gridIndex,
            nameLocation: 'end',
            nameTextStyle: 'left',
            nameGap: 30,
            nameRotate: 0,
            offset: 0,
            min: 'dataMin',
            max: 'dataMax',
            splitNumber: 2,
            axisTick: { show: true },
            axisLine: {
                show: true,
                lineStyle: {
                    color: this.currTheme === this.ColorTheme.Dark ? '#4a484e' : '#E1E6EE',
                    width: 1
                }
            },
            axisLabel: {
                show: true,
                color: this.currTheme === this.ColorTheme.Dark ? '#aaaaaa' : '#9ea4b3',
                formatter: '{value}'
            }, // y轴刻度
            splitLine: {
                show: false,
                lineStyle: { color: '#d4d9e6', type: 'solid' }
            }, // 刻度对应的线
        }];
        if (options) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 设置标题
     * @param text 标题文本
     * @param top 离顶部距离
     */
    public makeTitle(text: any, top: any) {
        const options = {
            text,
            top,
            left: -5,
            textStyle: {
                color: this.currTheme === this.ColorTheme.Dark ? '#e8e8e8' : '#252c3c',
                height: 16,
                fontSize: 16,
                lineHeight: 16,
                fontWeight: 'normal',
            }
        };
        return options;
    }

    /**
     * 设置坐标系
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top: 45,
            height: this.gridHeight,
            left: 100,
            right: '3.5%'
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 设置内容
     */
    public makeSeries() {
        this.option.series.push(
            {
                name: 'block',
                type: 'custom',
                renderItem: (params: any, api: any) => {
                    const xValue = api.value(0);
                    const highPoint = api.coord([xValue, api.value(1)]);
                    const lowPoint = api.coord([xValue, api.value(2)]);
                    const halfWidth = api.size([1, 0])[0] * 0.1 > 4 ? 4 : api.size([1, 0])[0] * 0.1;
                    const style = api.style({
                        stroke: '#206cf0',
                        fill: null
                    });
                    const children = [{
                        type: 'line',
                        shape: {
                            x1: highPoint[0] - halfWidth, y1: highPoint[1],
                            x2: highPoint[0] + halfWidth, y2: highPoint[1]
                        },
                        style
                    }, {
                        type: 'line',
                        shape: {
                            x1: highPoint[0], y1: highPoint[1],
                            x2: lowPoint[0], y2: lowPoint[1]
                        },
                        style
                    }, {
                        type: 'line',
                        shape: {
                            x1: lowPoint[0] - halfWidth, y1: lowPoint[1],
                            x2: lowPoint[0] + halfWidth, y2: lowPoint[1]
                        },
                        style
                    }];
                    return {
                        type: 'group',
                        children
                    };
                },
                encode: {
                    x: 0,
                    y: [1, 2]
                },
                itemStyle: {
                    normal: {
                        borderWidth: 1
                    }
                },
                data: this.datas.data
            }
        );
    }

    /**
     * 设置tooltip悬浮提示
     */
    public makeTooltips() {
        this.option.tooltip = {
            trigger: 'axis',
            borderColor: 'rgba(50,50,50,0)',
            backgroundColor: this.currTheme === this.ColorTheme.Dark ? '#424242' : '#fff',
            borderWidth: 1,
            borderRadius: 5,
            enterable: true,
            confine: true,
            padding: [10, 20, 10, 20],
            triggerOn: 'mousemove',
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;',
            axisPointer: {
                show: false,
                type: 'line',
                lineStyle: {
                    color: '#6C7280',
                    width: 1,
                }
            },
            formatter: (params: any) => {
                const title = [this.i18n.storageIO.diskio.startBlockNo, this.i18n.storageIO.diskio.endBlockNo];
                let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px"> `;
                params[0].data.forEach((param: any, index: any) => {
                    if (index === 0) {
                        html += `<p style="color:${this.currTheme === this.ColorTheme.Dark ?
                            '#aaaaaa' : '#282b33'};font-size:12px; line-height: 12px;margin-bottom:12px">
                            ${this.domSanitizer.sanitize(SecurityContext.HTML, param)}</p>`;
                    } else {
                        html += `<div style="color:${this.currTheme === this.ColorTheme.Dark ?
                            '#e8e8e8' : '#282b33'};font-size:12px;line-height:12px;margin-bottom:10px;
                            display:flex;justify-content:space-between;">
                            <div style="display:flex;align-items: center;min-width:110px"><p> ${
                                title[index - 1]}</p></div>
                            <p> ${this.domSanitizer.sanitize(
                                SecurityContext.HTML, Utils.setThousandSeparator(param))}</p></div>`;
                    }
                });
                html += `</div>`;
                return html;
            }
        };
    }
}
