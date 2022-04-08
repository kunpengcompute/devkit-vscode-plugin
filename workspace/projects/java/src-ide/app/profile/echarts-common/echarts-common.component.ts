import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { connect } from 'echarts';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
@Component({
    selector: 'app-echarts-common',
    templateUrl: './echarts-common.component.html',
    styleUrls: ['./echarts-common.component.scss']
})
export class EchartsCommonComponent implements OnInit, AfterViewInit {

    @Output() public dataZoom = new EventEmitter<any>();

    constructor(
        public vscodeService: VscodeService
    ) { }

    @Input() datas: any;
    @Input() startDate: any;
    @Input() updateOptions: any;
    @Input() timeData: any;
    @Input() gridRight: any;
    public echartsInstance: any;
    public tableData: any;
    public baseTop = 20;
    public gridHeight = 130;
    public baseColor = '#e6ebf5';
    public ylabelColor = '#999';
    public labelColor = '#AAAAAA';
    public lineColorList = [
        '#3D7FF3', '#298A5F', '#2C8E8B', '#8739DB', '#4E8A30',
        '#A73074', '#A44017', '#A7264D', '#C0691C', '#BAB42B'];
    public filter = {};
    public time: any;
    public spec: any;
    public key: any;
    public uuid: any;
    public GlobalColumInfo: any;
    public option: any = {};

    // datazoom刻度
    public timeLine: any[] = [];
    public currTheme = COLOR_THEME.Dark;
    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            const keys = this.datas.keys;
            const yAxis: any[] = [];
            keys.forEach((item: any) => {
                yAxis.push({
                    nameTextStyle: {
                        color: this.currTheme === COLOR_THEME.Dark ? '#E8E8E8' : '#222',
                    }
                });
            });
            const tooltip = {
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
                },
            };
            this.updateOptions = {
                yAxis,
                tooltip
            };
        });
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
        setTimeout(() => {
            this.initTable();
        }, 1000);

    }

    /**
     * onChartInit
     * @param ec ec
     */
    onChartInit(ec: any) {
        this.echartsInstance = ec;
        this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
            this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
        });
    }

    /**
     * initTable
     */
    public initTable() {
        this.time = this.datas.time1 || this.datas.time;
        this.setData();

        setTimeout(() => {
            this.tableData = this.option;
            if (this.echartsInstance) {
                this.echartsInstance.clear();
                this.echartsInstance.setOption(this.tableData, true);
            }

            // echarts图表联动
            setTimeout(() => {
                this.uuid = this.updateOptions.groupId;
                this.echartsInstance.group = this.uuid;
                connect(this.updateOptions.groupId);
            }, 100);
        }, 100);
    }

    /**
     * makeXAxis
     * @param gridIndex gridIndex
     * @param opt opt
     */
    public makeXAxis(gridIndex: any, opt: any) {
        const option = {
            type: 'category',
            gridIndex,
            boundaryGap: false,
            offset: 0,
            data: this.time,
            axisLine: {
                onZero: true,
                lineStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#484A4E' : '#e1e6ee',
                    width: 2
                }
            },
            axisTick: {
                inside: false, show: true, length: 8,
                lineStyle: {
                    width: 1,
                    color: '#484A4E',
                    type: 'solid'
                }
            }, // 坐标轴刻度相关设置
            axisLabel: {
                show: true,
                color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',

            }, // 坐标轴刻度标签的相关设置
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
     */
    public makeYAxis(gridIndex: any, opt: any) {
          const nameColor = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner' ?
            '#dcdcdc' : '#e8e8e8';
          const namePadding = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner' ?
            [0, 0, 0, -60] : [0, 0, -15, -60];
          const options = {
              type: 'value',
              show: true,
              gridIndex,
              nameLocation: 'end',
              nameTextStyle: {
                  color: this.currTheme === COLOR_THEME.Dark ? nameColor : '#222',
                  fontSize: 20,
                  height: 14,
                  // 调整Y轴标题位置
                  padding: namePadding,
                  lineHeight: 14,
                  align: 'left'
              },
              nameGap: 35,
              nameRotate: 0,
              offset: 0,
              min: 0,
              axisTick: { show: false },
              axisLine: {
                  show: false,
                  lineStyle: {
                      color: this.currTheme === COLOR_THEME.Dark ? '#484A4E' : '#e1e6ee',
                      width: 2
                  }
              },
              axisLabel: {
                  show: true,
                  color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
              },
              // Y轴分割线
              splitLine: { show: false },
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
     */
    public makeGrid(top: any, opt: any) {
        const options = {
            top: top + 40,
            height: this.gridHeight,
            left: 65,
            right: this.gridRight || 60
        };
        if (opt) {
            Object.assign(options, opt);
        }
        return options;
    }

    /**
     * setData
     */
    public setData() {
        const dataZoomIdx: any[] = [];
        const grid: any[] = [];
        const xAxis: any[] = [];
        const yAxis: any[] = [];
        const series: any[] = [];
        const keys = this.datas.keys;
        keys.forEach((item: any, index: number) => {
            dataZoomIdx.push(index);
            grid.push(this.makeGrid(this.baseTop + this.gridHeight * index, {}));
            xAxis.push(
                this.makeXAxis(index, {})
            );
            xAxis.push(
                {// 上边界线
                    type: 'category',
                    boundaryGap: false,
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: this.currTheme === COLOR_THEME.Dark ? '#484A4E' : '#e1e6ee',
                            width: 2,
                        }
                    }
                }
            );
            const nameLabel = item.label + '(' + item.unit + ')';
            yAxis.push(
                this.makeYAxis(index, {
                    name: nameLabel.replace(' ', ''),
                })
            );
            const seriesTem: any = {
                name: item.label,
                type: 'line',
                symbol: 'circle',
                // 折线线条平滑展示
                smooth: false,
                // 配置为false，线条上不展示圆圈，鼠标移动到对应坐标点时才展示圆圈图标
                showSymbol: false,
                symbolSize: 2,
                xAxisIndex: index,
                yAxisIndex: index,
                itemStyle: {
                    normal: {
                        color: '#3d7ff3',
                    },

                },
                lineStyle: {
                    color: '#3d7ff3',
                    width: 2,
                },
                data: this.datas[this.datas.label[index]]
            };
            this.setAreaStyle([seriesTem], 0);
            series.push(seriesTem);
        });
        this.option = {
            dataZoom: [{
                type: 'inside',
                realtime: true,
                xAxisIndex: dataZoomIdx,
            }],
            tooltip: {
                borderWidth: 0,
                trigger: 'axis',
                borderColor: 'rgba(50,50,50,0)',
                backgroundColor: this.currTheme === COLOR_THEME.Dark ? '#424242' : '#ffffff',
                borderRadius: 5,
                padding: [0, 20, 10, 20],
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#478cf1',
                        width: 1.5
                    }
                },
                textStyle: {
                    color: this.currTheme === COLOR_THEME.Dark ? '#e8e8e8' : '#222222',
                },
                formatter: (params: any): any => {
                    if (params.length) {
                        let html = ``;
                        html += `
                            <div style='margin: 10px 5px 5px 5px'>${this.startDate + ' ' + params[0].axisValue}</div>
                            `;
                        this.datas.keys.forEach((key: any) => {
                            if (key.label === params[0].seriesName) {
                                html += `
                                        <div style='margin:5px'>
                                        <span >${params[0].seriesName}</span>
                                        <span >${params[0].data + key.unit}</span>
                                        </div>
                                        `;
                            }
                        });

                        html += `</div>`;

                        return html;
                    }
                }
            },
            grid,
            xAxis,
            yAxis,
            series
        };
        const height = this.datas.keys.length * this.gridHeight + this.baseTop * 3 + 20;
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });

        // 配置区域缩放控制器
        this.buildDataZoom(this.timeData);

    }

    private setAreaStyle(series: any[], hideLine: any) {
        const lineNum = series.length - hideLine;
        if (lineNum === 1) {
            series.forEach((each: any) => {
                each.areaStyle = { opacity: 0.2 };
            });
        } else if (lineNum === 2) {
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

    private getColorIdx(seriesNum: number) {
        let colorIdx = seriesNum;
        if (this.lineColorList.length < seriesNum) {
            colorIdx = Math.floor((seriesNum) / this.lineColorList.length);
        }
        return colorIdx;
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
