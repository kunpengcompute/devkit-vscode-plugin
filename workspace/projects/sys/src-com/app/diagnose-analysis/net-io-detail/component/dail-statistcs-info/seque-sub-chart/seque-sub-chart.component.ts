import { Component, Input, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ECharts, EChartsOption, graphic } from 'echarts';
import { TimeLineComponent } from 'sys/src-com/app/shared/components/time-line/time-line.component';
import { SequeTableData } from '../dail-statistcs-info.component';
import { HyTheme, HyThemeService } from 'hyper';
import { I18n } from 'sys/locale';
import { SysLocale } from 'sys/locale/sys-locale';
import {
  DialTestTarget,
  DialTestType,
  TcpDialSequeClient,
  TcpDialSequeServer,
  UdpDialSequeClient,
  UdpDialSequeServer,
} from '../../../domain';

type TcpDialSequeClientKeys = keyof Omit<TcpDialSequeClient, 'interval'>;
type TcpDialSequeServerKeys = keyof Omit<TcpDialSequeServer, 'interval'>;
type UdpDialSequeClientKeys = keyof Omit<UdpDialSequeClient, 'interval'>;
type UdpDialSequeServerKeys = keyof Omit<
  UdpDialSequeServer,
  'interval' | 'lost/total'
>;

type DialSequeKeys =
  | TcpDialSequeClientKeys
  | TcpDialSequeServerKeys
  | UdpDialSequeClientKeys
  | UdpDialSequeServerKeys;

enum DialSequeType {
  TcpDialSequeClient,
  TcpDialSequeServer,
  UdpDialSequeClient,
  UdpDialSequeServer,
}

type chartInfo = {
  name: string;
  min: number;
  max: number;
};

@Component({
  selector: 'app-seque-sub-chart',
  templateUrl: './seque-sub-chart.component.html',
  styleUrls: ['./seque-sub-chart.component.scss'],
})
export class SequeSubChartComponent implements OnDestroy {
  @ViewChild('TimeLine') timeLineComp: TimeLineComponent;

  @Input() dialType: DialTestType;
  @Input() endType: DialTestTarget;
  @Input() connectId: string | number;
  @Input() showMask: boolean;
  @Input()
  set sequeData(value: SequeTableData[]) {
    if (null == value) {
      return;
    }

    this.currSequeType = this.getDialSequeType(this.dialType, this.endType);
    this.initEchartData(value, this.currSequeType);
    this.echartOptions = this.initEchartOptions(
      this.currSequeType,
      this.currTheme
    );

    if (null == this.echartsInstance) {
      this.echartsInstance?.clear();
      this.echartsInstance?.setOption(this.echartOptions, true);
    }
  }

  @Output() closeModel = new EventEmitter<void>();

  currTheme: HyTheme;
  timeData: string[] = []; // 时间轴数据
  timeLine = {
    start: 0,
    end: 100,
  };
  echartOptions: EChartsOption = {};
  chartList: chartInfo[] = [];
  tableHeight: number;

  private currSequeType: DialSequeType;
  private xTime: string[] = [];
  private echartsInstance: ECharts;
  private echartData: { [key in DialSequeKeys]: number[] } = {
    transfer: [],
    bandwidth: [],
    cwnd: [],
    retr: [],
    total: [],
    lost_rate: [],
    jitter: [],
  };
  private themeSub: Subscription;

  private readonly echartConfig = {
    baseTop: 0,
    gridHeight: 83,
    baseColor: '#484a4e',
    ylabelColor: '#aaaaaa',
  };
  private readonly sequeKeysMap = new Map<DialSequeType, DialSequeKeys[]>([
    [
      DialSequeType.TcpDialSequeClient,
      ['transfer', 'bandwidth', 'retr', 'cwnd'],
    ],
    [DialSequeType.TcpDialSequeServer, ['transfer', 'bandwidth']],
    [
      DialSequeType.UdpDialSequeClient,
      ['transfer', 'bandwidth', 'lost_rate', 'total' ],
    ],
    [
      DialSequeType.UdpDialSequeServer,
      ['transfer', 'bandwidth', 'jitter', 'lost_rate' ],
    ],
  ]);
  private readonly sequeLabelsMap = new Map<DialSequeKeys, string>([
    ['transfer', SysLocale.translate('net_io.transferredData', ['MB'])],
    ['bandwidth', I18n.net_io.bandwidth],
    ['retr', I18n.net_io.retr],
    ['cwnd', SysLocale.translate('net_io.cwnd', ['MB'])],
    ['total', I18n.net_io.totaldatagrams],
    ['lost_rate', I18n.net_io.loss_p],
    ['jitter', I18n.net_io.jitter_ms],
  ]);

  constructor(private themeServe: HyThemeService) {
    this.themeSub = this.themeServe
      .getObservable()
      .subscribe((theme: HyTheme) => {
        this.currTheme = theme;

        switch (theme) {
          case HyTheme.Dark:
            this.echartConfig.baseColor = '#484a4e';
            this.echartConfig.ylabelColor = '#aaaaaa';
            break;
          case HyTheme.Light:
            this.echartConfig.baseColor = '#E1E6EE';
            this.echartConfig.ylabelColor = '#616161';
            break;
          default:
            break;
        }

        setTimeout(() => {
          if (null == this.currSequeType) {
            return;
          }

          this.echartOptions = this.initEchartOptions(
            this.currSequeType,
            this.currTheme
          );

          if (null == this.echartsInstance) {
            this.echartsInstance?.clear();
            this.echartsInstance?.setOption(this.echartOptions, true);
          }
        });
      });
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
    this.closeModel.emit();
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
  }

  onModelClose() {
    this.showMask = false;
    this.echartData = {
      transfer: [],
      bandwidth: [],
      cwnd: [],
      retr: [],
      total: [],
      lost_rate: [],
      jitter: [],
    };
    this.closeModel.emit();
  }

  onTimeLineZoom(event: { start: number; end: number }) {
    (this.echartOptions as any).dataZoom[0].start = event.start;
    (this.echartOptions as any).dataZoom[0].end = event.end;
    this.echartsInstance?.setOption({
      dataZoom: this.echartOptions.dataZoom,
    });
  }

  onEchartZoom(event: any) {
    this.timeLineComp.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }

  initEchartData(datum: SequeTableData[], sequeType: DialSequeType) {
    // 表格高度
    const dataKeys = this.sequeKeysMap.get(sequeType);
    this.tableHeight = dataKeys.length * this.echartConfig.gridHeight + 30;

    // 时t间轴取值
    this.xTime = datum.map((item) => item.interval.split('-')[1]);
    this.timeData = this.xTime;

    // 数据转换逻辑
    datum.forEach((data) => {
      dataKeys.forEach((key) => {
        this.echartData[key].push(+data[key]);
      });
    });

    // 左侧列表数据
    this.chartList = dataKeys.map((key) => {
      return {
        name: this.sequeLabelsMap.get(key),
        min: 0,
        max: Math.max(...this.echartData[key]),
      };
    });
  }

  initEchartOptions(sequeType: DialSequeType, theme: HyTheme): EChartsOption {
    const dataKeys = this.sequeKeysMap.get(sequeType);

    const option = {
      // 网格
      grid: dataKeys.map((item, index) =>
        this.makeGrid(
          this.echartConfig.baseTop + this.echartConfig.gridHeight * index
        )
      ),
      // 数据区缩放组件
      dataZoom: [
        {
          type: 'inside',
          realtime: true,
          xAxisIndex: dataKeys.map((_, index) => index),
          showDataShadow: false,
          filterMode: 'empty',
        },
      ],
      tooltip: this.makeTooltip(theme, this.xTime),
      // 直角坐标系x轴
      xAxis: dataKeys.map((_, index) => {
        const lastIdx = dataKeys.length - 1;
        return this.makeXAxis(index, {
          axisLabel: {
            show: lastIdx === index,
            color: this.echartConfig.ylabelColor,
            margin: 15,
          },
          axisTick: {
            show: lastIdx === index,
            width: 3,
            length: 8,
          },
        });
      }),
      // 直角坐标系y轴
      yAxis: dataKeys.map((key, index) => {
        return this.makeYAxis(
          index,
          {
            name: key,
          },
          key
        );
      }),
      series: dataKeys.map((key, index) => {
        return this.makeSeries(key, this.echartData[key], index, index);
      }),
    };

    return option as EChartsOption;
  }

  private getDialSequeType(
    dialType: DialTestType,
    endType: DialTestTarget
  ): DialSequeType {
    switch (dialType + endType) {
      case DialTestType.TCP + DialTestTarget.Client:
        return DialSequeType.TcpDialSequeClient;
      case DialTestType.UDP + DialTestTarget.Client:
        return DialSequeType.UdpDialSequeClient;
      case DialTestType.TCP + DialTestTarget.Server:
        return DialSequeType.TcpDialSequeServer;
      case DialTestType.UDP + DialTestTarget.Server:
        return DialSequeType.UdpDialSequeServer;
      default:
        return DialSequeType.TcpDialSequeServer;
    }
  }

  private makeXAxis(gridIndex: number, opt: any) {
    const option = {
      type: 'category',
      splitLine: {
        show: true,
        lineStyle: { color: this.echartConfig.baseColor },
      },
      gridIndex,
      boundaryGap: false,
      axisLine: {
        onZero: false,
        lineStyle: {
          color: this.echartConfig.baseColor,
          width: 2,
        },
      },
      axisLabel: {
        padding: [11, 0, 0, 0],
        textStyle: {
          color: this.echartConfig.ylabelColor,
        },
      },
      axisTick: {
        show: true,
        color: this.echartConfig.baseColor,
        width: 2,
        length: 8,
      },
      axisPointer: {
        show: true,
        snap: true,
        lineStyle: {
          color: '#6c7280',
          width: 1,
        },
      },
      data: this.xTime,
    };
    if (option) {
      Object.assign(option, opt);
    }
    return option;
  }

  private makeYAxis(gridIndex: number, opt: any, name: DialSequeKeys) {
    const options = {
      type: 'value',
      show: false,
      gridIndex,
      boundaryGap: ['0.01', '0.1'],
      nameLocation: 'middle',
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      min: 0,
      max: Math.max(...this.echartData[name]),
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: this.echartConfig.baseColor,
          width: 2,
        },
      },
      splitNumber: 1, // y轴刻度间隔
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  private makeGrid(top: number, opt: any = {}) {
    const options = {
      top: top + 1,
      height: this.echartConfig.gridHeight,
      left: 25,
      right: 20,
      bottom: 0,
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  private makeTooltip(theme: HyTheme, xTime: string[]) {
    const options = {
      trigger: 'axis',
      backgroundColor: theme === HyTheme.Dark ? '#424242' : '#ffffff',
      borderRadius: 5,
      boxShadow: 'rgba(0, 0, 0, 1)',
      textStyle: {
        color: theme === HyTheme.Dark ? '#e8e8e8' : '#222222',
      },
      borderColor: HyTheme.Light === theme ? '#ffffff' : '#424242',
      extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
      padding: [8, 20, 8, 20],
      triggerOn: 'mousemove',
      hideDelay: 2000,
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: theme === HyTheme.Dark ? '#aaaaaa' : '#478cf1',
          width: 1.5,
        },
      },
      formatter: (params: any) => {
        let html = ``;
        params.forEach((item: any) => {
          html += `
                <div style='padding:8px;display:flex;justify-content: space-between; align-items: flex-start;'>
                  <div>
                    <span style='display:block;'>${
                      I18n.diagnostic.timeInterval
                    }</span>
                    <span style='display:block;margin-top:6px'>${
                      this.chartList[item.axisIndex].name
                    }</span>
                   </div>
                  <div style='margin-left:20px'>
                    <span style='display:block;'>
                    ${xTime[item.dataIndex - 1] || '0.00'} -
                    ${xTime[item.dataIndex]}
                    </span>
                    <span style='display:block;margin-top:6px'> ${
                      item.value
                    }</span>
                  </div>
                </div>`;
        });
        return html;
      },
    };

    return options;
  }

  private makeSeries(
    name: string,
    data: number[],
    xAxisIndex: number,
    yAxisIndex: number
  ) {
    const options = {
      name,
      xAxisIndex,
      yAxisIndex,
      data,
      type: 'line',
      symbol: 'circle',
      symbolSize: 2,
      itemStyle: {
        normal: {
          color: '#037dff',
        },
      },
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(38,125,255,0.3)',
          },
          {
            offset: 1,
            color: 'rgba(38,125,255,0.04)',
          },
        ]),
      },
      lineStyle: {
        color: '#037dff',
      },
      hoverAnimation: false,
    };
    return options;
  }
}
