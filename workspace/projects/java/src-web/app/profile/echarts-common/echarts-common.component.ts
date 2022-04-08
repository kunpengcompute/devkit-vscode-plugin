import { Component, OnInit, Input, AfterViewInit, ViewChild, OnChanges, SecurityContext } from '@angular/core';
import { LibService } from '../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-echarts-common',
  templateUrl: './echarts-common.component.html',
  styleUrls: ['./echarts-common.component.scss']
})
export class EchartsCommonComponent implements OnInit, AfterViewInit, OnChanges {

  constructor(
    public libService: LibService,
    public domSanitizer: DomSanitizer
  ) { }

  @Input() datas: any;
  @Input() startDate: any;
  @Input() updateOptions: any;
  @Input() timeData: any;
  @ViewChild('TimeLine') TimeLine: any;
  public echartsInstance: any;
  public tableData: any;
  public baseTop = 0;
  public gridHeight = 0;
  public baseColor = '#E1E6EE';
  public ylabelColor = '#999';
  public lineColorList = ['#6c92fa', '#6cbfff', '#4eded2', '#7adfa0', '#f6df66', '#fdca5a', '#fa8e5a',
    '#f45c5e', '#f3689a', '#a97af8', '#4c6bc2', '#33b0a6'];
  public filter = {};
  public time: any;
  public spec: any;
  public key: any;
  public uuid: any;
  public GlobalColumInfo: any;
  public option = {

  };
  public xTime: any = [];
  public overviewEchart: any;
  public Yvalue1: any;
  public Yvalue2: any;
  ngOnInit() {
    this.xTime = new Array(180).fill('');
    this.gridHeight = this.datas.gridHeight;
  }
  ngOnChanges(): void {
    if (this.TimeLine) {
      this.TimeLine.setTimeData(this.timeData);
    }
  }
  ngAfterViewInit() {
    let tempTimer = setTimeout(() => {
      this.initTable();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 1000);
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.setOption(this.option);
    window.onresize = this.echartsInstance.resize;
  }
  public initTable() {
    this.time = this.datas.time1;
    this.setData();
  }
  public makeXAxis(gridIndex: any, opt: any) {
    const option = {
      type: 'category',
      splitLine: {
        show: true,
        lineStyle: { color: this.baseColor },
      },
      gridIndex,
      boundaryGap: false,
      axisLine: {
        onZero: false,
        lineStyle: {
          color: '#E1E6EE',
          width: 2,
        }
      },
      axisLabel: {
        padding: [11, 0, 0, 0],
        textStyle: {
          color: '#616161',
        },
        interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))
      },
      axisTick: {
        show: true,
        color: '#E1E6EE',
        width: 2,
        length: 8,
      },
      data: this.time,
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
      axisLine: {
        lineStyle: {
          color: '#E1E6EE',
          width: 2,
        }
      },
      splitNumber: 1 // y轴刻度间隔
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;

  }

  public makeGrid(top: any, opt: any) {
    const options = {
      top: top + 0,
      height: this.gridHeight,
      left: 25,
      right: 25,
      bottom: 0
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
    const series: any = [];
    const keys = this.datas.keys;
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
          name: item.label
        })
      );
      series.push(
        {
          name: item.label,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: index,
          yAxisIndex: index,
          itemStyle: {
            normal: {
              color: '#037DFF',
            },
          },
          lineStyle: {
            color: '#037DFF',
          },
          areaStyle: {
            color: '#037DFF',
            opacity: 0.2,
          },
          data: this.datas[this.datas.label[index]]
        },
      );
    });
    grid.push(this.makeGrid(this.baseTop + this.gridHeight * keys.length, {}));
    grid.push(this.makeGrid(this.baseTop, {
      show: true,
      height: 0,
      borderColor: '#E1E6EE',
      borderWidth: 2,
      z: 10,
    }));
    xAxis.push(
      this.makeXAxis((keys.length + 1), {
        axisLabel: {
          show: false,
          interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))
        }, // 坐标轴刻度标签的相关设置
        axisTick: {
          show: false
        },
        axisPointer: {
          show: true,
          lineStyle: {
            color: '#478cf1',
            width: 2.5
          }
        }
      }));
    yAxis.push(this.makeYAxis((keys.length + 1), {
      axisLine: {
        lineStyle: {
          color: '#E1E6EE',
          width: 2,
        }
      },
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
        top: this.datas.keys.length * this.gridHeight + this.baseTop + 40,
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
        filterMode: 'empty'
      }, {
        type: 'inside',
        realtime: true,
        xAxisIndex: dataZoomIdx,
        filterMode: 'empty'
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
              <div>${this.domSanitizer.sanitize(SecurityContext.HTML, this.startDate + ' ' + params[0].axisValue)}</div>
            `;
            this.datas.keys.forEach((key: any) => {
              if (key.label === params[0].seriesName) {
                html += `
                  <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                  <div>
                    <span style="width:8px;height:8px;display:inline-block;
                    background: ${params[0].color};margin-right:8px"></span>
                    <span style=''>${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
                   </div>
                    <span style='margin-left:24px;display:inline-block;'>
                      ${this.domSanitizer.sanitize(SecurityContext.HTML, (key.unit === ' ms' ?
                        (params[0].data / 1000).toFixed(2) :
                        params[0].data) + key.unit)}
                    </span>
                    </div>
                  `;
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
      series
    };

    $('#' + this.uuid + ' .table-box').css({ height: '100%' });
    this.setLeft();
    let tempTimer = setTimeout(() => {
      this.tableData = this.option;
      if (this.echartsInstance) {
        this.echartsInstance.clear();
        this.echartsInstance.setOption(this.tableData, true);
      }
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 100);
  }
  public setLeft() {
    if (this.datas.executed) {
      this.Yvalue1 = Math.max(...this.datas.executed);
    } else {
      this.Yvalue1 = Math.max(...this.datas.request);
    }
    this.Yvalue2 = (Math.max(...this.datas.aveTime) / 1000).toFixed(2);
    let html = ``;
    const key = this.datas.keys;
    key.forEach((item: any, index: any) => {
      if (index === 0) {
        html += `<div class='line' style='margin-top: 0px;background:${this.baseColor}'></div>
        <div class='title-box' style='height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}'>
            <span class='title-num'>${this.domSanitizer.sanitize(SecurityContext.HTML, this.Yvalue1 + item.unit)}</span>
            <span class='title' style='color:#6c7280'>
            ${this.domSanitizer.sanitize(SecurityContext.HTML, item.label)}</span>
            <span class='title-num'>0</span>
        </div>
        <div class='line' style='margin-top: 1px;background:${this.baseColor}'></div>`;
      } else {
        html += `
        <div class='title-box' style='height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}'>
            <span class='title-num'>${this.domSanitizer.sanitize(SecurityContext.HTML, this.Yvalue2 + item.unit)}</span>
            <span class='title' style='color:#6c7280'>
            ${this.domSanitizer.sanitize(SecurityContext.HTML, item.label)}</span>
            <span class='title-num'>0</span>
        </div>
        <div class='line' style='margin-top: 2px;background:${this.baseColor}'></div>`;
      }
    });
    $('#' + this.uuid + ' .table-y').html(html);
  }
  /**
   * 页面传递图数据
   */
  public updateEchartsData(echartData: any) {
    this.setLeft();
  }
  public timeLineData(event: any) {
    this.tableData.dataZoom[0].start = event.start;
    this.tableData.dataZoom[0].end = event.end;
    this.echartsInstance.setOption({
      dataZoom: this.tableData.dataZoom
    });
  }
  public handleDatazoom(event: any) {
    this.TimeLine.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }


}
