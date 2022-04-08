import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { I18nService } from '../../../service/i18n.service';
import { Utils } from 'projects/sys/src-ide/app/service/utils.service';
import { MessageService } from './../../../service/message.service';
import { COLOR_THEME, currentTheme } from './../../../service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
  selector: 'app-io-sequence',
  templateUrl: './io-sequence.component.html',
  styleUrls: ['./io-sequence.component.scss']
})
export class IoSequenceComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() datas: any;
    @Input() timeLine: any;
    @Input() isHave: string;
    @Input() isMe: string;
    @Output() public dataZoom = new EventEmitter<any>();
    @Output() public echartsInstOut = new EventEmitter<any>();
    @Output() public brushOut = new EventEmitter<any>();

    public i18n: any;
    public echartsInstance: any;
    public tableData: any;
    public uuid: any;
    public timelineSubscribe: Subscription;

    public baseTop = 47;
    public gridHeight = 40;
    // 组与组之间的距离
    public titleHeight = 78;
    public baseColor = '#484a4e';
    public lineColorList = ['#3d7ff3', '#2da46f', '#18aba6', '#9653e1', '#618824', '#ad2776'];

    public ifShowlegend: boolean;
    public ifShowxAxis: boolean;
    public option: any = {
        title: [],
        legend: {},
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
        }],
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
    public currTheme = COLOR_THEME.Dark;
    constructor(
        private i18nService: I18nService,
        private el: ElementRef,
        private msgService: MessageService,
        private themeServe: HyThemeService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        this.themeServe.subscribe((msg) => {
            this.setTheme(msg);
        });
        this.msgService.getMessage().subscribe((e) => {
            if (e.type === 'ioAPIsUpdateTime') {
                this.upDateTimeLine(e.data);
            }
            if (e.page === 'iops') {
                this.rebuildOption(e.data.params, e.data.showLegendList);
            }
        });

        this.uuid = Utils.generateConversationId(12);
    }
    private setTheme(theme: HyTheme) {
        if (!theme) {
          return;
        }
        this.currTheme = theme === 'light' ? COLOR_THEME.Light :  COLOR_THEME.Dark;
        this.themeStyleChange();
      }

    public themeStyleChange() {
        this.baseColor = this.currTheme === COLOR_THEME.Light ? '#e6ebf5' : '#484a4e';
        this.echartsInstance?.setOption({
            title: {
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Light ? '#282b33' : '#E8E8E8',
                }
            },
            tooltip: {
                backgroundColor: this.currTheme === COLOR_THEME.Light ? '#ffffff' : '#424242',
            },
        });
    }

    /**
     * 初始化完成之后
     */
    ngAfterViewInit() {
        this.setData(this.timeLine);
    }

    /**
     * 取消订阅
     */
    ngOnDestroy() {
        if (this.timelineSubscribe) {
            this.timelineSubscribe.unsubscribe();
        }
    }
    /**
     * 鼠标按下框选
     */
    public onBrush(e: any) {
        const maskBox = this.el.nativeElement.querySelector('.mask-box');
        const brushBox = this.el.nativeElement.querySelector('.brush-box');
        const tootipBox = this.el.nativeElement.querySelector('.echarts-box div').nextSibling;
        const canvasBox = this.el.nativeElement.querySelector('#' + this.uuid);

        // 将tips框隐藏,防止碍事
        tootipBox.style.display = 'none';

        maskBox.style.display = 'none';
        this.brushOut.emit('click');

        // 只有左键按下可框选
        if (e.which !== 1) { return; }

        // 鼠标点下原点
        const anchorDot = e.clientX;

        // 框选框距离canvans左边框的距离
        const diffX = e.clientX - canvasBox.getBoundingClientRect().left - this.option.grid[0].left;
        // 点击距离框选右侧距离为负值
        const diffXR = diffX -  canvasBox.offsetWidth + this.option.grid[0].left + this.option.grid[0].right;
        // 超出范围，结束框选
        if (diffX < 0 || diffXR > 0) { return; }
        const diffY = e.clientY - canvasBox.offsetTop;

        // 框选右侧位置
        let rightSite = 0;
        // 框选左侧位置
        let leftSite = 0;

        document.onmousemove = (ev) => {
            tootipBox.style.display = 'none';
            maskBox.style.display = 'block';
            leftSite = diffX / maskBox.offsetWidth;
            // 设置框选颜色块样式
            brushBox.style.left = leftSite * 100 + '%';
            let mouseSite = ev.clientX;
            // 计算当前点离左边的距离
            const diffMoveL = ev.clientX - canvasBox.getBoundingClientRect().left - this.option.grid[0].left;
            // 计算当前点离右边的距离
            const diffMoveR = diffMoveL -  canvasBox.offsetWidth + this.option.grid[0].left + this.option.grid[0].right;
            // 如果当前点超出图表范围，自动取最左边最右边
            if (diffMoveL < 0) {
                mouseSite = canvasBox.getBoundingClientRect().left + this.option.grid[0].left;
            } else if (diffMoveR > 0) {
                mouseSite = canvasBox.getBoundingClientRect().left + canvasBox.offsetWidth - this.option.grid[0].right;
            }
            const disX = (mouseSite - anchorDot) / maskBox.offsetWidth;
            if (disX >= 0) {
                brushBox.style.width = disX * 100 + '%';
                rightSite = leftSite + disX;
            } else {
                const disX1 = Math.abs(disX);
                brushBox.style.width = disX1 * 100 + '%';
                brushBox.style.left = (leftSite - disX1) * 100 + '%';
                rightSite = leftSite - disX1;
            }
        };

        document.onmouseup = (ev) => {
            this.dealBrushTime(leftSite, rightSite);
            document.onmousemove = null;
            document.onmouseup = null;
            document.onmousedown = null;
        };
    }

    /**
     * 处理框选时间
     */
    public dealBrushTime(left: number, right: number) {
        // 优化框选最大值
        if (right > 0.98) {
            right = 1;
        }
        const dataNum = this.datas.time.length - 1;
        const totalTime = this.datas.time[dataNum];
        const leftTime = Math.ceil(Number((totalTime * left).toFixed(6)));
        const rightTime = parseInt((totalTime * right).toFixed(6), 10);
        const brushTime = [leftTime, rightTime].sort((a, b) => {
            return a - b;
        });

        if (left !== right) {
            const data = Object.assign(this.datas, { brushTime });
            this.brushOut.emit(data);
        }
    }


    /**
     * ngx-echarts初始化后触发事件
     */
    public onChartInit(ec: any) {
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
        setTimeout(() => {
            const canvas = this.el.nativeElement.querySelector('canvas');
            canvas.onmousedown = (e) => { // 如果选中canvas,阻止默认事件
                e.preventDefault();
                e.stopPropagation();
                this.onBrush(e);
            };
        }, 1000);
    }

    /**
     * 重构图表配置
     */
    private rebuildOption(params: any, list: any[]) {
        this.echartsInstance.group = '';    // 解除 echarts
        const lineNum: any[] = [];
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
            this.themeStyleChange();
        }, 100);

        setTimeout(() => {    // echarts 实例绑定在一块
            this.echartsInstOut.emit(this.echartsInstance);
        }, 100);
      }

    /**
     * 设置图表配置
     * @param timeData 时间
     */
    public setData(timeData: any) {
        this.ifShowxAxis = this.datas.index[2] === this.datas.index[3] ? true : false;
        const that = this;
        // 清空图表配置
        this.option.series = [];
        this.option.grid = [];
        this.option.xAxis = [];
        this.option.yAxis = [];
        this.option.title = [];
        this.option.legend = [];

        this.option.dataZoom[0].start = timeData.start;
        this.option.dataZoom[0].end = timeData.end;
        this.option.dataZoom[0].xAxisIndex = [0];
        this.option.dataZoom[0].top = 60;

        // 设置X轴
        this.option.xAxis.push(this.makeXAxis(0, {}));
        // 设置Y轴
        this.option.yAxis = this.makeYAxis(0, {});
        const legend = [
            that.i18n.storageIO.ioapis.Invoking_times,
            that.i18n.storageIO.ioapis.average_time,
            this.i18n.storageIO.ioapis.total_time
        ];
        // 设置图例
        this.option.legend = this.makeLegend(legend);
        // 设置标题
        this.option.title.push(this.makeTitle(this.datas.function, 0));
        // 设置网格
        this.option.grid.push(this.makeGrid(this.baseTop, {}));
        this.makeSeries(legend);
        this.makeTooltip();
        const height = this.gridHeight + this.titleHeight;
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
                this.themeStyleChange();
            }
            // echarts图表联动
            setTimeout(() => {
                this.echartsInstOut.emit(this.echartsInstance);
            }, 100);
        }, 100);
    }

    /**
     * 设置图标X轴
     * @param gridIndex  图表下标
     * @param opt 配置项
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: false,
            offset: 0,
            data: this.datas.time,
            show: this.ifShowxAxis,
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: this.baseColor,
                    width: 2
                }
            },
            // 坐标轴刻度相关设置
            axisTick: { show: false },
            // 坐标轴刻度标签的相关设置
            axisLabel: {
                show: false,
                color: '#aaaaaa',
                // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
                interval: this.datas.time.length < 21 ? 0 : Math.floor((this.datas.time.length / 21))
            },
            axisPointer: {
                show: true,
                lineStyle: {
                    color: '#7E8083',
                    width: 1
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
     * 设置图标Y轴
     * @param gridIndex 图表下标
     * @param opt 配置项
     */
    public makeYAxis(gridIndex: any, opt: any) {
        const that = this;
        const options = [{
            type: 'value',
            show: true,
            gridIndex,
            nameLocation: 'end',
            nameTextStyle: 'left',
            nameGap: 30,
            nameRotate: 0,
            offset: 0,
            min: 0,
            max: (value: any) => Math.ceil(value.max * 1.5),
            splitNumber: 1,
            interval: 300000,
            axisTick: { show: false },
            axisLine: { show: false }, // y轴是否展示
            axisLabel: {
                show: true,
                color: '#aaaaaa',
                formatter: (value: any) => {
                    if (value !== 0) {
                        return value + that.i18n.storageIO.ioapis.times;
                    } else {
                        return value;
                    }
                }
            }, // y轴刻度
            splitLine: {
                show: true,
                lineStyle: { color: '#484a4e', type: 'solid' }
            }, // 刻度对应的线
        }, {
            type: 'value',
            show: true,
            gridIndex,
            nameLocation: 'end',
            nameTextStyle: 'left',
            nameGap: 30,
            nameRotate: 0,
            offset: 0,
            min: 0,
            max: (value: any) => Number((value.max * 1.5)).toFixed(3),
            splitNumber: 1,
            interval: 5000000,
            axisTick: { show: false },
            axisLine: { show: false }, // y轴是否展示
            axisLabel: {
                show: true,
                color: '#aaaaaa',
                formatter: (value: any) => {
                    if (value !== 0) {
                        return value + 'ms';
                    } else {
                        return value;
                    }
                }
            }, // y轴刻度
            splitLine: {
                show: true,
                lineStyle: { color: '#484a4e', type: 'solid' }
            }, // 刻度对应的线
            }
        ];
        return options;
    }

    /**
     * 配置图例
     * @param data 图例数据
     */
    public makeLegend(data: any) {
        const option = {
            data,
            type: 'scroll',
            icon: 'rect',
            itemWidth: 8,
            itemHeight: 8,
            top: 0,
            algin: 'left',
            right: 50,
            width: '35%',
            height: 120,
            textStyle: {
                color: '#282b33',
                fontSize: 12,
                lineHeight: 12,
                fontWeight: 'normal',
            },
            show: false,
            selectedMode: true,
            zlevel: 1100,
            inactiveColor: '#ccc'
        };
        return option;
    }

    /**
     * 设置标题
     * @param text 标题
     * @param top 离顶部位置
     */
    public makeTitle(text: any, top: any) {
        const options = {
            text,
            top: this.ifShowlegend ? 37 : 0,
            left: -5,
            textStyle: {
                color: this.currTheme === COLOR_THEME.Light ? '#282b33' : '#E8E8E8',
                height: 14,
                fontSize: 14,
                lineHeight: 14,
                fontWeight: 'normal',
            }
        };
        return options;
    }

    /**
     * 配置坐标轴网格
     * @param top 离顶部的位置
     * @param opt 配置参数
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top: this.ifShowlegend ? 72 : 45,
            height: this.gridHeight,
            left: 68,
            right: 84,
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * 配置图表
     * @param legend 图例数据
     */
    public makeSeries(legend: any) {
        this.datas.key.forEach((item: any, index: any) => {
            const yAxisIndex = index > 0 ? 1 : 0;
            this.option.series.push(
              {
                name: legend[index],
                type: 'line',
                showSymbol: false,
                symbolSize: 4,
                showAllSymbol: false,
                xAxisIndex: 0,
                yAxisIndex,
                itemStyle: {
                    normal: {
                        color: this.lineColorList[index],
                    },

                },
                lineStyle: {
                    color: this.lineColorList[index],
                    width: 2,
                },
                data: this.datas.values[item]
              }
            );
        });
    }

    /**
     * 配置tooltip
     */
    public makeTooltip() {
        this.option.tooltip = {
            trigger: 'axis',
            borderColor: 'rgba(50,50,50,0)',
            backgroundColor: this.currTheme === COLOR_THEME.Light ? '#ffffff' : '#424242',
            borderWidth: 1,
            borderRadius: 5,
            padding: [10, 20, 10, 20],
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); z-index: 1003;',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: '#478cf1',
                    width: 1.5
                }
            },
            position: (pos: any, params: any, el: any, elRect: any, size: any) => {
                if (pos[0] < size.viewSize[0] / 2) {
                    return {top: 10 , left: pos[0] + 10};
                } else {
                    return {top: 10 , right: size.viewSize[0] - pos[0] + 10};
                }
            },
            formatter: (params: any) => {
                if (params.length) {
                    let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px"> `;
                    const unitList = [this.i18n.storageIO.ioapis.time1, 'ms', 'ms'];
                    let unitIdx  = 0;
                    params.forEach((param: any, index: any) => {
                        if (param.seriesName === this.i18n.storageIO.ioapis.Invoking_times) {
                            unitIdx = 0;
                        } else if (param.seriesName === this.i18n.storageIO.ioapis.average_time) {
                            unitIdx = 1;
                        } else {
                            unitIdx = 2;
                        }
                        if (index === 0) {
                            html += `<p style="color:${this.currTheme === COLOR_THEME.Dark ?
                                '#E8E8E8' : '#282b33'};font-size:12px; line-height: 12px;margin-bottom:12px">${
                                    param.axisValue}</p>`;
                        }
                        html += `<div style="color:${this.currTheme === COLOR_THEME.Dark ?
                            '#E8E8E8' : '#282b33'};font-size:12px; line-height: 12px;
                            margin-bottom:10px;display:flex;justify-content: space-between;">
                            <div style="display:flex;align-items: center;min-width:110px">
                            <span style="display:block;margin-right:8px;height:8px;width:8px;background:${
                                param.color}"></span>
                            <p> ${param.seriesName.split(',')[0]}:</p>
                            </div>
                            <p> ${Utils.setThousandSeparator(param.data) + unitList[unitIdx]}</p>
                            </div>`;
                    });
                    html += `</div>`;
                    return html;
                }
                return '';
            }
        };

    }

    /**
     * 更新时间轴
     */
    public upDateTimeLine(data: any) {
        this.option.dataZoom[0].start = data.start;
        this.option.dataZoom[0].end = data.end;
        this.echartsInstance.setOption({
            dataZoom: this.option.dataZoom
        });
    }

}
