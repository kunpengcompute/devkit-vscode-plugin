import { Component, OnInit, Input, AfterViewInit, ViewChild, SecurityContext, ElementRef } from '@angular/core';
import { LibService } from '../../../../service/lib.service';
import { I18nService } from '../../../../service/i18n.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-echarts-comm',
  templateUrl: './echarts-comm.component.html',
  styleUrls: ['./echarts-comm.component.scss']
})
export class EchartsCommComponent implements OnInit {

  constructor(
    public libService: LibService,
    public i18nService: I18nService,
    private elementRef: ElementRef,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
  }


  @Input() compareEchartData: any;
  @ViewChild('TimeLine') TimeLine: any;
  public i18n: any;
  public tableData: any;
  public baseTop = 20;
  public gridHeight = 100;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public lineColorList = ['#6c92fa', '#6cbfff', '#4eded2', '#7adfa0', '#f6df66', '#fdca5a', '#fa8e5a',
    '#f45c5e', '#f3689a', '#a97af8', '#4c6bc2', '#33b0a6'];
  public filter = {};
  public spec: any;
  public key: any;
  public uuid: any;
  public GlobalColumInfo: any;
  public option: any = {

  };
  public echartsOption: any = {
    startDate: '',
    keys: [],
    xlabels: [],
    sqlDataA: {
      name: '',
      data: [],
    },
    sqlDataB: {
      name: '',
      data: [],
    },
    sqlTimeA: {
      name: '',
      data: [],
    },
    sqlTimeB: {
      name: '',
      data: [],
    }
  };
  public Yvalue1: any = 0;
  public Yvalue2: any = 0;
  public overviewEchart: any;
  public timeData: any = [];
  ngOnInit() {
    this.echartsOption.keys = [
      {
        label: this.i18n.protalserver_profiling_jdbc.exec_statement,
        unit: this.i18n.common_term_jdbc_times
      },
      {
        label: this.i18n.protalserver_profiling_jdbc.aver_exec_time,
        unit: ' ms'
      }
    ];
    this.initTable();
    let tempTimer = setTimeout(() => {
      this.showEcharts();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 100);

  }
  public showEcharts() {
    this.echartsOption.startDate = this.compareEchartData.startDate;
    this.getEchartsData(this.compareEchartData.snapshotA, this.compareEchartData.snapshotB);
    this.setData();
    if (this.overviewEchart) {
      this.Yvalue1 = this.overviewEchart.getModel().getComponent('yAxis', 0).axis.scale.getExtent()[1];
      this.Yvalue2 = this.overviewEchart.getModel().getComponent('yAxis', 1).axis.scale.getExtent()[1] / 1000;
    }
  }

  /**
   * 对比快照echarts图数据的整合
   * params snapshotA, snapshotB  快照a数据，快照b数据
   */
  public getEchartsData(snapshotA: any, snapshotB: any) {
    if (!snapshotA || !snapshotB) {
      return;
    }
    const todayDate = this.echartsOption.startDate;
    const timeA = Object.keys(snapshotA);
    const timeB = Object.keys(snapshotB);
    const xLabel = [...new Set(timeA.concat(timeB))];
    const xLabels = xLabel.sort((a, b) => {
      return todayDate + a > todayDate + b ? 1 : -1;
    });
    this.echartsOption.xlabels = xLabels;
    this.timeData = xLabels;
    const sqlDataA: any = [];
    const sqlDataB: any = [];
    const sqlTimeA: any = [];
    const sqlTimeB: any = [];
    const snapshotDataA: any = {};
    const snapshotDataB: any = {};
    xLabels.forEach(item => {
      const dataItemA: any = {};
      dataItemA.averCount = snapshotA[item] ? snapshotA[item].averCount : '';
      dataItemA.averTime = snapshotA[item] ? snapshotA[item].averTime : '';
      snapshotDataA[item] = dataItemA;
      const dataItemB: any = {};
      dataItemB.averCount = snapshotB[item] ? snapshotB[item].averCount : '';
      dataItemB.averTime = snapshotB[item] ? snapshotB[item].averTime : '';
      snapshotDataB[item] = dataItemB;
    });
    Object.keys(snapshotDataA).forEach(item => {
      sqlDataA.push(snapshotDataA[item].averCount);
      sqlTimeA.push(snapshotDataA[item].averTime);
    });
    Object.keys(snapshotDataB).forEach(item => {
      sqlDataB.push(snapshotDataB[item].averCount);
      sqlTimeB.push(snapshotDataB[item].averTime);
    });
    this.echartsOption.sqlDataA.data = sqlDataA;
    this.echartsOption.sqlDataA.name = this.i18n.protalserver_profiling_jdbc.exec_statement;
    this.echartsOption.sqlDataB.data = sqlDataB;
    this.echartsOption.sqlDataB.name = this.i18n.protalserver_profiling_jdbc.exec_statement;
    this.echartsOption.sqlTimeA.data = sqlTimeA;
    this.echartsOption.sqlTimeA.name = this.i18n.protalserver_profiling_jdbc.aver_exec_time;
    this.echartsOption.sqlTimeB.data = sqlTimeB;
    this.echartsOption.sqlTimeB.name = this.i18n.protalserver_profiling_jdbc.aver_exec_time;
  }
  private initTable() {
    this.overviewEchart = echarts.init(this.elementRef.nativeElement.querySelector('#databaseEcharts'));
    this.overviewEchart.setOption(this.option);
    window.onresize = this.overviewEchart.resize;
    this.overviewEchart.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.TimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
    });
  }
  public toggleLeftResize() {
    let tempTimer = setTimeout(() => {
      this.overviewEchart.resize();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 100);
  }
  public makeXAxis(gridIndex: any, opt: any) {
    const option = {
      type: 'category',
      gridIndex,
      boundaryGap: false,
      offset: 0,
      data: this.echartsOption.xlabels,
      axisLine: { onZero: false, lineStyle: { color: this.baseColor, width: 2 }, interval: 1 },
      axisTick: {
        show: true,
        color: '#E1E6EE',
        width: 2,
        length: 8,
      },
      axisLabel: {
        show: false,
        color: this.ylabelColor,
        interval: this.echartsOption.xlabels.length < 21 ? 0 : Math.floor((this.echartsOption.xlabels.length / 21))
      }, // 坐标轴刻度标签的相关设置

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

  public makeYAxis(gridIndex: any, opt: any) {
    const options = {
      type: 'value',
      show: false,
      gridIndex,
      boundaryGap: ['0.01', '0.1'],
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

  public makeGrid(top: any, opt: any) {
    const options = {
      top,
      height: this.gridHeight,
      left: 25,
      right: 30
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  public setData() {
    const dataZoomIdx: any = [];
    const grid = [];
    const xAxis = [];
    const yAxis = [];
    const keys = this.echartsOption.keys;
    keys.forEach((item: any, index: any) => {
      dataZoomIdx.push(index);
      grid.push(this.makeGrid(this.baseTop + this.gridHeight * index, {}));
      xAxis.push(
        this.makeXAxis(index, {
          axisLabel: {
            show: index === 1,
            color: this.ylabelColor,
            interval: 'auto',
            padding: [11, 0, 0, 0],
            textStyle: {
              color: '#616161',
            },
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          }
        })
      );
      yAxis.push(
        this.makeYAxis(index, {
          name: item.label,
          max: 'dataMax',
        })
      );
    });
    grid.push(this.makeGrid(this.baseTop + this.gridHeight * keys.length, {}));
    grid.push(this.makeGrid(this.baseTop, {
      show: true,
      height: 0,
      borderColor: '#E1E6EE',
      borderWidth: 1,
      z: 10,
    }));
    xAxis.push(
      this.makeXAxis((keys.length + 1), {
        axisLabel: {
          show: false,
          interval: this.echartsOption.xlabels.length < 21 ? 0 : Math.floor((this.echartsOption.xlabels.length / 21))
        }, // 坐标轴刻度标签的相关设置
        position: 'top',
        axisPointer: {
          show: true,
          lineStyle: {
            color: '#478cf1',
            width: 2.5
          }
        },
        axisTick: {
          show: false
        }
      }));
    yAxis.push(this.makeYAxis((keys.length + 1), {
      max: 'dataMax',
    }));
    this.option = {
      legend: {
        data: [],
        type: 'scroll',
        icon: 'circle',
        top: 0,
        algin: 'left',
        right: 50,
        width: '35%',
        show: true
      },
      dataZoom: [{
        show: false,
        type: 'slider',
        realtime: true,
        xAxisIndex: dataZoomIdx,
        top: this.echartsOption.keys.length * this.gridHeight + this.baseTop + 40,
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
      }, {
        type: 'inside',
        realtime: true,
        xAxisIndex: dataZoomIdx,
      }],
      tooltip: {
        trigger: 'axis',
        borderColor: 'rgba(50,50,50,0)',
        borderWidth: 1,
        padding: [8, 20, 8, 20],
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#478cf1',
            width: 1.5
          }
        },
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any): any => {
          if (params.length) {
            let html = ``;
            html += `
              <div>${this.domSanitizer.sanitize(SecurityContext.HTML,
                 this.echartsOption.startDate + ' ' + params[0].axisValue)}</div>
            `;
            this.echartsOption.keys.forEach((key: any) => {
              if (params[0].seriesName.includes(key.label)) {
                if (params[0].data !== '') {
                  html += `
                  <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                  <div style="float:left;">
                    <span style="width:8px;height:8px;display:inline-block;
                    background: ${params[0].color};margin-right:8px"></span>
                    <span style=''>${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
                    </div>
                    <span style="margin-left:24px;display:inline-block;">
                      ${this.domSanitizer.sanitize(SecurityContext.HTML, (key.unit === ' ms' ?
                        (params[0].data / 1000).toFixed(2) : params[0].data) + key.unit)}
                    </span>
                  </div>`;
                }
                if (params[1].data !== '') {
                  html += `
                  <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                  <div style="float:left;">
                   <span style="width:8px;height:8px;display:inline-block;
                   background: ${params[1].color};margin-right:8px"></span>
                   <span style=''>${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].seriesName)}</span>
                   </div>
                   <span style='margin-left:24px;display:inline-block;'>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, (key.unit === ' ms' ?
                      (params[1].data / 1000).toFixed(2) : params[1].data) + key.unit)}
                  </span>
                  </div>`;
                }
              }
            });
            html += `</div>`;
            return html;
          }
        }
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        snap: true
      },
      grid,
      xAxis,
      yAxis,
      series: [
        {
          name: this.echartsOption.sqlDataA.name + 'A',
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.echartsOption.sqlDataA.data
        },
        {
          name: this.echartsOption.sqlDataB.name + 'B',
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.echartsOption.sqlDataB.data
        },
        {
          name: this.echartsOption.sqlTimeA.name + 'A',
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.echartsOption.sqlTimeA.data
        },
        {
          name: this.echartsOption.sqlTimeB.name + 'B',
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.echartsOption.sqlTimeB.data
        },
      ]
    };
    const height = this.echartsOption.keys.length * this.gridHeight + this.baseTop * 3 + 20;
    $(this.uuid + '.table-box').css({ height: height + 'px' });
    this.setLeft();
    this.initTable();
  }
  public setLeft() {
    let html = ``;
    const key = this.echartsOption.keys;
    key.forEach((item: any, index: any) => {
      if (index === 0) {
        html += `<div class='line' style='margin-top: ${this.baseTop + 20 - 1}px;background:${this.baseColor}'></div>
        <div class='title-box' style='height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}'>
            <span class='title-num'></span>
            <span class='title' style='color:#6c7280'>
            ${this.domSanitizer.sanitize(SecurityContext.HTML, item.label)}</span>
            <span class='title-num'>0</span>
        </div>
        <div class='line' style='margin-top: 2px;background:${this.baseColor}'></div>`;
      } else {
        html += `
        <div class='title-box' style='height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}'>
            <span class='title-num'></span>
            <span class='title' style='color:#6c7280'>
            ${this.domSanitizer.sanitize(SecurityContext.HTML, item.label)}</span>
            <span class='title-num'>0</span>
        </div>
        <div class='line' style='margin-top: 2px;background:${this.baseColor}'></div>`;
      }
    });
    $(this.uuid + '.table-y').html(html);
  }
  public timeLineData(data: any) {
    this.option.dataZoom[0].start = data.start;
    this.option.dataZoom[0].end = data.end;
    this.overviewEchart.setOption({
      dataZoom: this.echartsOption.dataZoom
    });
  }
}

