import {
  ApplicationRef,
  Component,
  EmbeddedViewRef,
  Input,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { EChartsOption, ECharts } from 'echarts';
import { IDialTestRaw } from '../../../domain';
import { CheckboxOption } from '../../../component/color-checkbox/color-checkbox.component';
import { HyTheme, HyThemeService } from 'hyper';
import { SysLocale } from 'sys/locale/sys-locale';
import { Observable } from 'rxjs';

type ConnectRtt = IDialTestRaw['connection']['RTT'];
type TipContent = {
  dialNum: string;
  data: {
    color: string;
    label: string;
    value: number;
  }[];
};

@Component({
  selector: 'app-dail-test-rtt',
  templateUrl: './dail-test-rtt.component.html',
  styleUrls: ['./dail-test-rtt.component.scss'],
})
export class DailTestRttComponent implements OnInit {
  @ViewChild('echartTip', { static: true }) echartTipTpl: TemplateRef<any>;

  @Input()
  set rttData(val: ConnectRtt) {
    if (val == null) {
      return;
    }
    this.rttDataStash = val;
    this.chartOption = this.getTableData(val) as any;
  }
  get rttData(): ConnectRtt {
    return this.rttDataStash;
  }
  @Input() average: number;

  chartOption: EChartsOption;
  colorCheckOptions: CheckboxOption[];
  colorCheckeds: string[];
  currTheme: HyTheme;
  theme$: Observable<HyTheme>;

  private echartsInstance: ECharts;
  private rttDataStash: ConnectRtt;
  readonly indexNameMap: Map<string, string> = new Map<string, string>([
    ['rtt', 'RTT(ms)'],
    ['average', SysLocale.translate('net_io.average', ['ms'])],
  ]);
  readonly colorMap = new Map<string, (currTheme?: HyTheme) => string>([
    [
      'rtt',
      (currTheme?: HyTheme) => {
        return '#037dff';
      },
    ],
    [
      'average',
      (currTheme?: HyTheme) => {
        return HyTheme.Light === currTheme ? '#41ba41' : '#9ea4b3';
      },
    ],
  ]);

  constructor(
    private themeServe: HyThemeService,
    private appRef: ApplicationRef,
    private renderer: Renderer2
  ) {
    this.theme$ = this.themeServe.getObservable();
    this.themeServe.subscribe((msg) => {
      this.currTheme = msg;
      this.initChartOption(this.currTheme);
    });
  }

  ngOnInit() {
    this.initChartOption(this.currTheme);
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
  }

  initChartOption(currTheme: HyTheme) {
    this.colorCheckOptions = this.getColorCheckOption(currTheme);
    this.colorCheckeds = this.colorCheckOptions.map((item) => item.value);
    if (null == this.rttData) {
      this.chartOption = this.getEchartOption(currTheme) as any;
    } else {
      this.chartOption = this.getTableData(this.rttData) as any;
    }
  }

  private getTableData(val: ConnectRtt) {
    const { data } = val;

    const option = this.getEchartOption(this.currTheme);
    const average =
      this.average ??
      data?.map((item) => +item).reduce((a, b) => a + b, 0) /
        (data.length + 0.000001);

    option.xAxis.data = Object.keys(data);
    option.series[0].data = data;
    option.series[1].data = Object.keys(data).map(
      () => Math.round(average * 1000) / 1000
    );

    return option;
  }

  private getEchartOption(currTheme: HyTheme) {
    const option = {
      grid: {
        top: 10,
        left: 35,
        right: 20,
        bottom: 70,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: HyTheme.Light === currTheme ? '#ffffff' : '#424242',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 1)',
        borderColor: HyTheme.Light === currTheme ? '#ffffff' : '#424242',
        textStyle: {
          color: HyTheme.Light === currTheme ? '#222222' : '#e8e8e8',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        padding: [8, 20, 8, 20],
        triggerOn: 'mousemove',
        hideDelay: 1000,
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: HyTheme.Light === currTheme ? '#478cf1' : '#aaaaaa',
            width: 1.5,
          },
        },
        formatter: (params: any[]) => {
          const tipData: TipContent['data'] = params.map((item) => {
            return {
              color: this.colorMap.get(item.seriesName)(this.currTheme),
              label: this.indexNameMap.get(item.seriesName),
              value: Math.round(+item.data * 1000) / 1000,
            };
          });
          const tipContent: TipContent = {
            dialNum: params?.[0]?.dataIndex,
            data: tipData,
          };

          return this.tpl2Html(this.echartTipTpl, tipContent);
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [] as any,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        splitNumber: 2,
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            opacity: 0,
          },
        },
        splitLine: {
          show: false,
        },
      },
      dataZoom: [
        {
          type: 'slider',
          height: 24,
          right: 23,
          left: 30,
          bottom: 5,
          backgroundColor: HyTheme.Dark === currTheme ? '#161616' : '#ffffff',
          borderColor: HyTheme.Dark === currTheme ? '#484a4e' : '#E1E6EE',
          handleStyle: { color: '#037dff' },
          textStyle: {
            color: HyTheme.Dark === currTheme ? '#e8e8e8' : '#252c3c',
          },
          // 是否开启刷选功能
          brushSelect: false,
        },
        {
          type: 'inside',
        },
      ],
      series: [
        {
          name: 'rtt',
          data: [] as any,
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: this.colorMap.get('rtt')(currTheme),
            opacity: 0.1,
          },
          lineStyle: {
            color: this.colorMap.get('rtt')(currTheme),
            width: 2,
          },
        },
        {
          name: 'average',
          data: [] as any,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: this.colorMap.get('average')(currTheme),
            width: 2,
            type: [5, 6],
            dashOffset: 6,
          },
        },
      ],
    };
    return option;
  }

  private getColorCheckOption(theme: HyTheme): CheckboxOption[] {
    return [
      {
        label: 'RTT(ms)',
        value: 'rtt',
        color: this.colorMap.get('rtt')(theme),
      },
      {
        label: this.indexNameMap.get('average'),
        value: 'average',
        color: this.colorMap.get('average')(theme),
      },
    ];
  }

  private tpl2Html(tpl: TemplateRef<any>, context: TipContent): Element {
    const embeddedView: EmbeddedViewRef<any> = tpl.createEmbeddedView({
      context,
    });
    this.appRef.attachView(embeddedView); // 不做此处理，ng-template中的标签不会解析

    const divEle: Element = this.renderer.createElement('div');
    for (const rootNode of embeddedView.rootNodes) {
      this.renderer.appendChild(divEle, rootNode);
    }
    return divEle;
  }
}
