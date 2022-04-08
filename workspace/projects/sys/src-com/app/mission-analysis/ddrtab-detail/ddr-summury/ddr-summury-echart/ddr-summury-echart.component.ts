import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ECharts } from 'echarts';
import { EchartConfig, EchartYAxisUnit } from '../domain';
import { I18nService } from 'sys/src-com/app/service';
import { TiModalService, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
  selector: 'app-ddr-summury-echart',
  templateUrl: './ddr-summury-echart.component.html',
  styleUrls: ['./ddr-summury-echart.component.scss'],
})
export class DdrSummuryEchartComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() title = '';
  @Input() data: EchartConfig;
  @Input() dataZoom: { start: number, end: number };
  @Output() dataZoomOut = new EventEmitter<{ start: number, end: number }>();
   readonly colorTheme: { [theme in HyTheme]: any } = {
    dark: {
      tooltipBorderColor: 'rgba(50,50,50,0)',
      tooltipBackgroundColor: '#424242',
      tooltipExtraCssText: `box-shadow: 0px 9px 28px 8px
        rgba(0, 0, 0, 0.2),
        0px 6px 16px 0px
        rgba(0, 0, 0, 0.32),
        0px 3px 6px -4px
        rgba(0, 0, 0, 0.48);`,
      tooltipAxisPointerLineColor: '#aaaaaa',
    },
    light: {
      tooltipBorderColor: 'rgba(50,50,50,0)',
      tooltipBackgroundColor: '#fff',
      tooltipExtraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
      tooltipAxisPointerLineColor: '#6c7280',
    },
    grey: {
      tooltipBorderColor: 'rgba(50,50,50,0)',
      tooltipBackgroundColor: '#424242',
      tooltipExtraCssText: `box-shadow: 0px 9px 28px 8px
        rgba(0, 0, 0, 0.2),
        0px 6px 16px 0px
        rgba(0, 0, 0, 0.32),
        0px 3px 6px -4px
        rgba(0, 0, 0, 0.48);`,
      tooltipAxisPointerLineColor: '#aaaaaa',
    },
  };
  private unitMap: { [unit in EchartYAxisUnit]: string };
  private echartsInstance: ECharts;

  public colorList = [
    '#3d7ff3',
    '#2da46f',
    '#c0691c',
    '#8739db',
    '#2c8e8b',
    '#a73074',
    '#ada71e',
    '#8d1d3f',
    '#4e8a30',
    '#a44017',
  ];
  public i18n: any;
  public isLoading = true;
  public noData = false;
  /** echart固定配置 */
  public options: any;
  /** 根据单位变换的数据配置 */
  public merges: { [unit: string]: any } = {};
  /** y轴单位下拉选择项 */
  public yAxisUnits: Array<{ label: string, unit: EchartYAxisUnit }> = [];
  /** 当前显示的单位 */
  public currYAxisUnit: { label: string, unit: EchartYAxisUnit };
  /** 当前图表可以显示的所有单位 */
  private units: EchartYAxisUnit[];
  public currTheme: HyTheme;

  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public columns: Array<TiTableColumns>;

  constructor(
    private i18nService: I18nService,
    private tiModalService: TiModalService,
    private themeServe: HyThemeService
  ) {
    this.i18n = this.i18nService.I18n();
    this.unitMap = {
      percent: this.i18n.ddr_summury.percent,
      mpki: 'MPKI',
      gbs: 'MB/s'
    };
    this.columns = [
      { title: this.i18n.ddr_summury.averageTarget },
      { title: this.i18n.ddr_summury.average },
    ];
    this.themeServe.subscribe(msg => {
      this.currTheme = msg;
      this.initEchartsOptions();
      this.setData(this.dataZoom);
    });
  }

  ngOnInit(): void {

  }

  private initEchartsOptions() {
    let background = '';
    if (sessionStorage.getItem('tuningOperation') === 'hypertuner') {
      background = this.currTheme === 'dark' ? '#313335' : '#fff';
    } else {
      background = this.currTheme === 'dark' ? '#1e1e1e' : '#fff';
    }
    this.options = {
      title: {
        show: false
      },
      backgroundColor: background,
      legend: {
        type: 'scroll',
        icon: 'rect',
        right: 0,
        width: 400,
        itemWidth: 8,
        itemHeight: 8,
        data: [],
      },
      dataZoom: [{
        type: 'inside',
        show: false,
        xAxisIndex: [0, 1]
      }],
      grid: {
        left: 40,
        right: 20,
        bottom: 30,
        top: 40
      },
      xAxis: [
        {
          show: false,
          position: 'top',
          type: 'time',
        },
        {
          position: 'bottom',
          type: 'category',
          boundaryGap: false,
          axisPointer: {
            show: false
          },
          axisTick: {
            length: 9,
          },
          axisLabel: {
            height: 18,
            margin: 11,
          },
          splitLine: {
            show: false
          }
        }
      ],
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          height: 18,
          margin: 11,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          }
        }
      },
      series: [],
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (!this.data) { return; }
      this.units = (Object.keys(this.data).filter(item => item !== 'xAxisData') as EchartYAxisUnit[]);
      // 计算所有图例，后面遍历时遍历所有图例，数据没有的返回空数组。
      // 用于在echarts切换单位时，新数据可以完全覆盖老数据
      let allLegend: Array<string> = [];
      this.units.forEach((unit) => {
        this.data[unit].legend = this.data[unit].legend.filter((legendItem) => {
          return this.data[unit].seriesData[legendItem]?.length;
        });
        allLegend = allLegend.concat(this.data[unit].legend);
      });
      allLegend = Array.from(new Set(allLegend));
      if (allLegend.length === 0) {
        this.noData = true;
        return;
      }
      // 构建echarts数据
      this.units.forEach((unit) => {
        this.yAxisUnits.push({ label: this.unitMap[unit], unit });
        const echartConfig = this.data[unit];
        if (echartConfig.legend.length === 0) {
          this.noData = true;
          return;
        }
        this.merges[unit] = {
          legend: {
            data: echartConfig.legend.map((item) => ({ name: item })),
          },
          xAxis: [
            {
              min: this.data.xAxisData.min.getTime(),
              max: this.data.xAxisData.max.getTime(),
            },
            {
              data: this.data.xAxisData.data,
            }
          ],
          // 根据所有legend遍历数据，不存在的数据返回空数组，防止在echarts组件merges时有之前的数据残留
          // 使在echarts切换单位时，新数据可以完全覆盖老数据
          series: allLegend.map(legendItem => {
            if (!echartConfig.seriesData[legendItem]) {
              if (sessionStorage.getItem('tuningOperation') === 'hypertuner' && echartConfig.legend.length <= 2) {
                return {
                  name: legendItem,
                  type: 'line',
                  data: [],
                  areaStyle: {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [{
                        offset: 0, color: this.colorList[echartConfig.legend.indexOf(legendItem)] // 0% 处的颜色
                      }, {
                        offset: 1, color: '#313335' // 100% 处的颜色
                      }],
                      global: false // 缺省为 false
                    }
                  }
                };
              } else {
                return {
                  name: legendItem,
                  type: 'line',
                  data: [],
                };
              }
            }
            if (sessionStorage.getItem('tuningOperation') === 'hypertuner' && echartConfig.legend.length <= 2) {
              return {
                name: legendItem,
                type: 'line',
                showSymbol: false,
                data: echartConfig.seriesData[legendItem].map((value, index) => {
                  return [
                    // 根据时间偏移量(单位/s)计算基于时间轴最小时间进行偏移后的实际时间
                    this.data.xAxisData.min.getTime() + echartConfig.time[index] * 1000
                    // 同时整体时间偏移量向前挪一个采样间隔，同显示的x轴起始时间保持一致
                    - this.data.xAxisData.interval,
                    value
                  ];
                }),
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: this.colorList[echartConfig.legend.indexOf(legendItem)] // 0% 处的颜色
                    }, {
                      offset: 1, color: '#313335' // 100% 处的颜色
                    }],
                    global: false // 缺省为 false
                  }
                }
              };
            } else {
              return {
                name: legendItem,
                type: 'line',
                showSymbol: false,
                emphasis: {
                  lineStyle: {
                    width: 3,
                  },
                },
                data: echartConfig.seriesData[legendItem].map((value, index) => {
                  return [
                    // 根据时间偏移量(单位/s)计算基于时间轴最小时间进行偏移后的实际时间
                    this.data.xAxisData.min.getTime() + echartConfig.time[index] * 1000
                    // 同时整体时间偏移量向前挪一个采样间隔，同显示的x轴起始时间保持一致
                    - this.data.xAxisData.interval,
                    value,
                    echartConfig.time[index]
                  ];
                }),
              };
            }
          }),
        };
      });
      this.currYAxisUnit = this.yAxisUnits[0];
      this.initAverageTable();
    }
    if (changes.dataZoom) {
      this.echartsInstance?.dispatchAction({
        type: 'dataZoom',
        start: this.dataZoom.start,
        end: this.dataZoom.end
      });
    }
  }

  public onChartInit(echartsInstance: ECharts) {
    this.echartsInstance = echartsInstance;
    setTimeout(() => {
      this.isLoading = false;
    }, 0);
  }

  private initAverageTable() {
    const data: Array<{ target: string, average: string }> = [];
    const unitMap = {
      percent: '%',
      mpki: 'mpki',
      gbs: 'MB/s'
    };
    this.units.forEach((unit) => {
      const values = this.data[unit].seriesData;
      this.data[unit].legend.forEach(legend => {
        const total = values[legend].reduce((item1, item2) => item1 + item2, 0);
        const average = (total / values[legend].length).toFixed(2) + unitMap[unit];
        data.push({
          target: legend,
          average
        });
      });
    });
    this.srcData.data = data;
  }

  ngAfterViewInit() {
    this.setData(this.dataZoom);
  }
  public setData(timeData: any){
    this.options.tooltip = {
      trigger: 'axis',
        borderColor: this.colorTheme[this.currTheme].tooltipBorderColor,
        backgroundColor: this.colorTheme[this.currTheme].tooltipBackgroundColor,
        borderWidth: 1,
        borderRadius: 0,
        enterable: true,
        confine: true,
        padding: [8, 20, 8, 20],
        triggerOn: 'mousemove',
        extraCssText: this.colorTheme[this.currTheme].tooltipExtraCssText,
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: this.colorTheme[this.currTheme].tooltipAxisPointerLineColor,
            width: 1.5,
          },
        },
      formatter: (params: any): any => {
        if (params.length) {
          const axisValueLabel = params[0].axisValueLabel.split(' ');
          let html = ` <div style="width:100%;max-height:125px;overflow-y:auto;padding-right:5px;font-size:12px;">
            <div style="display:flex;min-width:110px;color:var(--common-color-font-secondary);">
                <p style="width:128px;margin-right:33px;"> ${params[0].data[2].toFixed(2)}</p>
                <span style="height:18px;">${this.title}</span>
            </div>
          `;
          params.forEach((item: any, index: any) => {
            html += `
            <div style="color:var(--common-color-font-primary);font-size:12px; line-height: 12px;
            margin-bottom:8px;display:flex;justify-content: space-between;">
              <div style="display:flex;align-items: center;min-width:110px;">
                <span style="margin-right:5px;height:8px;width:8px;background-color:
                  ${item.color}"></span>
                <p style="width:128px;margin-right:20px"> ${item.seriesName}:</p>
                <span style="width:84px;height:18px;">${item.value[1].toFixed(2)}</span>
              </div>
            </div>
            `;
          });
          html += `</div>`;
          return html;
        }
      }
    };
  }

  public showAverage(averageModal: any) {
    this.tiModalService.open(averageModal, {
      id: 'averageModal',
      context: {
        displayed: [],
        currentPage: 1,
        totalNumber: this.srcData.data.length
      }
    });
  }

  public onChartDataZoom(zoom: any) {
    if (zoom?.batch?.[0]) {
      this.dataZoomOut.emit({
        start: zoom.batch[0].start,
        end: zoom.batch[0].end,
      });
    }
  }
}
