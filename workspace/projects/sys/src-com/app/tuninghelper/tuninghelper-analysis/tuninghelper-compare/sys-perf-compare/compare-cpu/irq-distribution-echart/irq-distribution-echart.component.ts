import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HyTheme, HyThemeService } from 'hyper';
import { Subscription } from 'rxjs';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18nService } from 'sys/src-com/app/service';
import { CompareHandleService } from '../../service/compare-handle.service';
import { LANGUAGE_TYPE } from 'sys/src-com/app/global/constant';
@Component({
  selector: 'app-irq-distribution-echart',
  templateUrl: './irq-distribution-echart.component.html',
  styleUrls: ['./irq-distribution-echart.component.scss']
})
export class IrqDistributionEchartComponent implements OnInit {
  @Input()
  set interruptDistribution(value: any[]) {
    if (value) {
      this.initData(value);
    }
  }
  constructor(
    private themeServe: HyThemeService,
    private i18nService: I18nService,
    public compareHandle: CompareHandleService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public interruptDisData: any;
  public echartsOption: any;
  public echartsInstance: any;
  public xAxisData: string[] = [];
  public legend: string[] = [];
  public baseColor = '#e1e6ee';
  public ylabelColor = '#616161';
  public echartColor: string[] = ['#037dff', '#00bfc9', '#a050e7', '#8cd600'];
  public currTheme: HyTheme;
  public themeSub: Subscription;
  public cpuDetailTable: CommonTableData;
  public echartData: any;
  public currentCpu = 0;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public allFilterData: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public lineData = {
    start: 0,
    end: 8
  };
  public tableTitle: string;
  public currentCpuIdx: number;
  ngOnInit(): void {
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.themeSub = this.themeServe.getObservable().subscribe(theme => {
      this.currTheme = theme;
      switch (theme) {
        case HyTheme.Dark:
          this.baseColor = '#484a4e';
          this.ylabelColor = '#aaaaaa';
          break;
        case HyTheme.Light:
          this.baseColor = '#E1E6EE';
          this.ylabelColor = '#616161';
          break;
        case HyTheme.Grey:
          this.baseColor = '#484a4e';
          this.ylabelColor = '#aaaaaa';
          break;
        default:
          break;
      }
      setTimeout(() => {
        this.setOption();
      });
    });
    this.columns = [
      {
        label: I18n.tuninghelper.taskDetail.usage_and_irq,
        width: '30%',
        key: 'label',
        checked: true,
        expanded: true,
        filter: true,
        selected: null,
        searchable: true,
        options: [],
        multiple: true,
        selectAll: true
      },
      {
        label: I18n.tuninghelper.taskDetail.compareValue,
        width: '30%',
        key: 'compareValue_string',
        checked: true,
        expanded: true,
        sortKey: 'compareValue',
        asc: false
      },
      {
        label: I18n.tuninghelper.taskDetail.objectOne,
        width: '20%',
        key: 'value1',
        checked: true,
        expanded: true,
        sortKey: 'value1_sort',
        asc: 'none'
      },
      {
        label: I18n.tuninghelper.taskDetail.objectSecond,
        width: '20%',
        key: 'value2',
        checked: true,
        expanded: true,
        compareType: 'number',
        sortKey: 'value2_sort',
        asc: 'none'
      },
    ];
  }

  public initData(value: any) {
    if (!value.echartOpt) { return; }
    this.interruptDisData = JSON.parse(JSON.stringify(value));
    this.echartData = JSON.parse(JSON.stringify(value.echartOpt));
    this.xAxisData = this.initXAxisData(value);
    this.getTableData(value[0]);
    this.tableTitle = this.i18nService.I18nReplace(
      I18n.tuninghelper.taskDetail.indicatorInfo_detail, {
      0: 0
    });
    this.setOption();
  }

  public getTableData(data: any) {
    if (!data) { return; }
    const tableData: any = [];
    Object.keys(data).map((key: string) => {
      const obj: any = {};
      if (key !== '%idle' && key !== '%iowait' && key !== '%nice') {
        switch (key) {
          case '%user':
            obj.label = I18n.tuninghelper.taskDetail.user_usage;
            break;
          case '%sys':
            obj.label = I18n.tuninghelper.taskDetail.sys_usage;
            break;
          case '%irq':
            obj.label = I18n.tuninghelper.taskDetail.irq_usage;
            break;
          case '%soft':
            obj.label = I18n.tuninghelper.taskDetail.soft_usage;
            break;
          default:
            obj.label = key;
            break;
        }
        obj.compareValue = data[key][0] - data[key][1];
        data[key][2] = data[key][2]?.split('%')[0];
        obj.compareValue_string = this.compareHandle.getCompareValue(data[key]);
        obj.value1_sort = Number(data[key][0]);
        obj.value1 = data[key][0];
        obj.value2_sort = Number(data[key][1]);
        obj.value2 = data[key][1];
        if (+obj.value1 > 0 || +obj.value2 > 0) {
          tableData.push(obj);
        }
      }
    });
    this.srcData.data = tableData;
    this.allFilterData = JSON.parse(JSON.stringify(tableData));
    this.columns[0].options = this.allFilterData;
    this.columns[0].selected = this.allFilterData;
    this.totalNumber = this.srcData.data.length;
  }
  /**
   * 初始化echart实例方法
   * @param ec echart实例
   */
  public onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.getZr().on('click', (param: any) => {
      const pointInPixel = [param.offsetX, param.offsetY];
      if (this.echartsInstance.containPixel('grid', pointInPixel)) {
        const xIndex = this.echartsInstance.convertFromPixel({ seriesIndex: 0 }, pointInPixel)[0];
        this.currentCpuIdx = xIndex;
        this.tableTitle = this.i18nService.I18nReplace(
          I18n.tuninghelper.taskDetail.indicatorInfo_detail, {
          0: xIndex
        });
        this.clickHighlight(xIndex);
        this.getTableData(this.interruptDisData[xIndex]);
      }
    });
    this.echartsInstance.on('datazoom', (params: any) => {
      if (Reflect.has(params, 'start')) {
        this.lineData.start = params.start;
        this.lineData.end = params.end;
      } else if (params.batch?.length > 0) {
        this.lineData.start = params.batch[0].start;
        this.lineData.end = params.batch[0].end;
      }
    });
  }
  /**
   * 获取柱状图选中点击之后splitArea的color数组,高亮选中cpu0
   * @params 点击的xIndex
   */
  public clickHighlight(index: number) {
    const arr = new Array(this.xAxisData.length).fill(0);
    arr[index] = 100;
    setTimeout(() => {
      this.echartsOption.series[4].data = arr;
      this.echartsOption.animation = false;
      this.updateEchartOption();
    }, 0);
  }
  public setOption() {
    const fontColor = this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222222';
    const option = {
      title: {
        text: I18n.tuninghelper.taskDetail.distribution_view,
        padding: [0, 0, 0, 15],
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: fontColor
        }
      },
      tooltip: {
        trigger: 'axis',
        enterable: true,
        axisPointer: {
          type: 'shadow'
        },
        padding: [10, 20, 10, 20],
        backgroundColor: this.currTheme === HyTheme.Dark ? '#424242' : '#fff',
        borderColor: 'rgba(50,50,50,0)',
        borderWidth: 1,
        borderRadius: 4,
        extraCssText: `color: ${this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#222'};
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003; `,
        formatter: (params: any): any => {
          if (params.length) {
            let html = ``;
            html += `<div style='font-size:12px'><div>${params[0].axisValue}</div> `;
            params.forEach((param: any, index: any) => {
              if (param.componentIndex === 4) {
                html += '';
              } else {
                html += `
                <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                <div style="">
                  <div style="display: inline-block;width: 8px;height:${param.seriesType === 'bar' ? '8px' : '3px'};
                  background-color: ${param.color};margin-right: 8px;"></div>
                  <div style='display:inline-block;'>
                  ${param.seriesName}</div></div>
                  <div style='margin-left:24px;display:inline-block;'>
                  ${param.value}</div>
                  </div>
                  `;
              }
            });
            html += `</div>`;
            return html;
          }
        }
      },
      legend: [
        {
          itemWidth: 8,
          itemHeight: 8,
          right: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? '44%' : '60%',
          textStyle: {
            color: this.ylabelColor
          },
          data: [{ name: I18n.tuninghelper.taskDetail.objectFirstIrq, icon: 'rect' }],
        },
        {
          itemWidth: 8,
          itemHeight: 8,
          right: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? '31%' : '37%',
          textStyle: {
            color: this.ylabelColor
          },
          data: [{ name: I18n.tuninghelper.taskDetail.objectSecondIrq, icon: 'rect' }],
        },
        {
          itemWidth: 16,
          itemHeight: 3,
          right: this.i18nService.currLang === LANGUAGE_TYPE.ZH ? '16%' : '19%',
          textStyle: {
            color: this.ylabelColor
          },
          data: [{ name: I18n.tuninghelper.taskDetail.objectFirstUsage, icon: 'rect' }],
        },
        {
          itemWidth: 16,
          itemHeight: 3,
          right: 10,
          textStyle: {
            color: this.ylabelColor
          },
          data: [{ name: I18n.tuninghelper.taskDetail.objectSecondUsage, icon: 'rect' }],
        },
      ],
      grid: {
        left: '0%',
        right: '3%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: true,
          axisLine: {
            lineStyle: {
              color: this.baseColor,
              width: 2
            }
          },
          axisTick: {
            length: 8,
            show: true,
            alignWithLabel: true,
            lineStyle: {
              width: 2,
              color: this.baseColor
            }
          },
          axisLabel: {
            height: 18,
            margin: 11,
            color: this.ylabelColor,
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: this.currTheme === HyTheme.Dark ? 'rgba(52, 52, 52, 0.36)' : 'rgba(32, 114, 234, 0.1)',
            }
          },
          data: this.xAxisData
        },
        {
          type: 'category',
          boundaryGap: true,
          show: false,
          data: this.xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: I18n.net_io.xps_rps.inter_dis.soft_hadr_time,
          position: 'left',
          min: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: { type: 'dashed', color: this.currTheme === HyTheme.Dark ? '#484a4e' : '#d4d9e6' }
          },
          axisLabel: { color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#252c3c' },
          nameTextStyle: {
            align: 'left',
            color: fontColor,
            padding: [0, 0, 0, -28],

          },
          splitNumber: 2
        },
        {
          type: 'value',
          name: I18n.tuninghelper.detailedData.cpuUsage,
          position: 'right',
          min: 0,
          max: 100,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: { type: 'dashed', color: this.currTheme === HyTheme.Dark ? '#484a4e' : '#d4d9e6' }
          },
          axisLabel: { color: this.currTheme === HyTheme.Dark ? '#9ea4b3' : '#252c3c' },
          nameTextStyle: {
            align: 'center',
            color: fontColor,
            padding: [0, 20, 0, 0],

          },
          splitNumber: 2
        }
      ],
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: this.xAxisData.length < 20 ? 100 : 8,
          height: 24,
          right: 52,
          left: 45,
          bottom: 0,
          realtime: false,
          backgroundColor: this.currTheme === HyTheme.Dark ? '#161616' : '#ffffff',
          borderColor: this.baseColor,
          handleStyle: { color: '#037dff' },
          textStyle: { color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#252c3c' },
          // 是否开启刷选功能
          brushSelect: false
        },
        {
          type: 'inside'
        }
      ],
      series: [
        {
          name: I18n.tuninghelper.taskDetail.objectFirstIrq,
          type: 'bar',
          barMaxWidth: 17,
          yAxisIndex: '0',
          xAxisIndex: '0',
          color: this.echartColor[0],
          data: this.echartData?.father_node.irq
        },
        {
          name: I18n.tuninghelper.taskDetail.objectSecondIrq,
          type: 'bar',
          barMaxWidth: 17,
          yAxisIndex: '0',
          xAxisIndex: '0',
          color: this.echartColor[1],
          data: this.echartData?.child_node.irq
        },
        {
          name: I18n.tuninghelper.taskDetail.objectFirstUsage,
          symbol: 'none',
          type: 'line',
          yAxisIndex: '1',
          xAxisIndex: '0',
          color: this.echartColor[2],
          itemStyle: {
            normal: {
              lineStyle: {
                width: 1 // 设置线条粗细
              }
            }
          },
          data: this.echartData?.father_node.cpu_usage
        },
        {
          name: I18n.tuninghelper.taskDetail.objectSecondUsage,
          symbol: 'none',
          type: 'line',
          yAxisIndex: '1',
          xAxisIndex: '0',
          color: this.echartColor[3],
          itemStyle: {
            normal: {
              lineStyle: {
                width: 1 // 设置线条粗细
              }
            }
          },
          data: this.echartData?.child_node.cpu_usage
        },
        {
          type: 'bar',
          barCategoryGap: '0%',
          yAxisIndex: '1',
          xAxisIndex: '1',
          itemStyle: {
            color: 'rgba(32, 114, 234, 0.39)'
          },
          data: new Array(this.xAxisData.length).fill(0)
        }
      ]
    };
    this.echartsOption = option;
  }
  /**
   * 过滤
   */
  public onSelect(items: any, column: TiTableColumns): void {
    this.srcData.data = this.allFilterData.filter((rowData: TiTableRowData) => {
      for (const columnData of this.columns) {
        if (columnData.selected && columnData.selected.length) {
          const index: number = columnData.selected.findIndex((item: any) => {
            return item.label === rowData[columnData.key];
          });
          if (index < 0) {
            return false;
          }
        }
      }
      return true;
    });
    this.totalNumber = this.srcData.data.length;
  }
  /**
   * 初始化X轴数据
   * @returns X轴数据
   */
  private initXAxisData(value: any) {
    const xAxixData: any[] = [];
    Object.keys(value).forEach((key: any) => {
      if ((/^[0-9]*$/).test(key)) {
        xAxixData.push(`cpu${key}`);
      }
    });
    return xAxixData;
  }

  /**
   * datazoom记忆
   */
  private updateEchartOption() {
    this.echartsOption.dataZoom[0].start = this.lineData.start;
    this.echartsOption.dataZoom[0].end = this.lineData.end;
    if (this.echartsInstance) {
      this.echartsInstance.clear();
      this.echartsInstance.setOption(this.echartsOption);
    }
  }
}
