import { Component, Input, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from 'sys/src-com/app/service';
import { HyTheme, HyThemeService } from 'hyper';
import * as Utils from 'projects/sys/src-com/app/util';
import { I18n } from 'sys/locale';
import { graphic } from 'echarts';
import { TimeLineComponent } from 'sys/src-com/app/shared/components/time-line/time-line.component';
import { RespDiagram } from '../../domain';

type TimeLine = {
  start: number;
  end: number;
};

@Component({
  selector: 'app-io-time-line-chart',
  templateUrl: './io-time-line-chart.component.html',
  styleUrls: ['./io-time-line-chart.component.scss']
})
export class IoTimeLineChartComponent implements OnInit {

  @Input() chartData: RespDiagram = { unit: '', read: [], write: [], time: [] };
  @Input() chartTitle: string;

  @ViewChild(TimeLineComponent) timeLineCom: TimeLineComponent;

  uuid: any;
  currTheme: HyTheme;
  optionData: any;
  timeLine: TimeLine = { start: 0, end: 100 };
  private echartsInstance: any;
  private baseColor = '#484a4e';
  // y轴刻度标签颜色
  private ylabelColor = '#616161';
  // y轴名称颜色
  private yNameColor = '#222222';
  private yLineColor = '#6c7280';
  private tipLineColor = '#6c7280';
  private tipbgColor = '#FFFFFF';
  private readText = '';
  private writeText = '';
  private lineColorListPps = ['#037dff', '#00bfc9'];

  constructor(
    private themeServe: HyThemeService,
    public i18nService: I18nService,
    private sanitizer: DomSanitizer
  ) {
    this.uuid = Utils.generateConversationId(12);
  }
  /**
   * 初始化
   */
  ngOnInit() {
    this.readText = I18n.storage_io_detail.result_tab.read;
    this.writeText = I18n.storage_io_detail.result_tab.write;

    this.themeServe.subscribe((msg: HyTheme) => {
      this.getThemeColor(msg);

      // IDE切换主题,web进入页面同样会触发
      this.initChart();
    });
    if (document.body.className.includes('vscode-dark')) {
      this.getThemeColor(HyTheme.Dark);
    } else {
      this.getThemeColor(HyTheme.Light);
    }
  }

  /**
   * 获取主题和颜色值
   * @param theme dark | light
   */
  private getThemeColor(theme: HyTheme) {
    this.currTheme = theme;
    if (theme === HyTheme.Light) {
      this.baseColor = '#E1E6EE';
      this.ylabelColor = '#616161';
      this.yLineColor = '#6c7280';
      this.yNameColor = '#222222';
      this.tipLineColor = '#6c7280';
      this.tipbgColor = '#FFFFFF';
    } else {
      this.baseColor = '#484a4e';
      this.ylabelColor = '#AAAAAA';
      this.yLineColor = '#616161';
      this.yNameColor = '#E8E8E8';
      this.tipLineColor = '#7e8083';
      this.tipbgColor = '#424242';
    }
  }

  /**
   * 初始化数据
   */
  private initChart() {
    this.setData(this.timeLine);
  }

  /**
   * 导入数据生成canvas
   */
  private setData(timeLine: TimeLine) {
    this.initOptions();
    this.optionData.dataZoom[0].start = timeLine.start;
    this.optionData.dataZoom[0].end = timeLine.end;
    this.makeTooltip();
    setTimeout(() => {
      this.optionData = this.optionData;
      if (this.echartsInstance) {
        this.echartsInstance.setOption(this.optionData, true);
      }
    }, 100);
  }

  private initOptions() {
    const { time, read, unit, write } = this.chartData;
    const seriesArr = [
      // 读
      {
        name: this.readText,
        type: 'line',
        symbol: 'emptyCircle',
        symbolSize: 4,
        showSymbol: false,
        showAllSymbol: false,
        smooth: true,
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(3, 125, 255, 0.4)',
            },
            {
              offset: 1,
              color: 'rgba(0, 191, 201, 0.04)',
            },
          ]),
        },
        itemStyle: {
          // 折线颜色
          color: this.lineColorListPps[0]
        },
        emphasis: {
          lineStyle: {
            width: 2
          }
        },
        data: read,
      },
      // 写
      {
        name: this.writeText,
        type: 'line',
        symbol: 'emptyCircle',
        symbolSize: 4,
        showSymbol: false,
        showAllSymbol: false,
        smooth: true,
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(0, 191, 201, 0.4)',
            },
            {
              offset: 1,
              color: 'rgba(0, 191, 201, 0.04)',
            },
          ]),
        },
        itemStyle: {
          // 折线颜色
          color: this.lineColorListPps[1]
        },
        emphasis: {
          lineStyle: {
            width: 2
          }
        },
        data: write,
      },
    ];
    const legendData = [I18n.storage_io_detail.result_tab.read, I18n.storage_io_detail.result_tab.write];
    this.optionData = {
      title: {
        text: unit === 'times' ? I18n.storage_io_detail.result_tab.times : unit,
        textStyle: {
          color: this.yNameColor,
          fontSize: 12,
          fontWeight: 500,
        },
        left: -5
      },
      legend: {
        data: [],
        icon: 'rect',
        top: 0,
        algin: 'left',
        right: 0,
        width: '35%',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 24,
        show: true,
        selectedMode: true,
        textStyle: {
          color: this.yNameColor,
        }
      },
      dataZoom: [{
        start: 0,
        end: 100,
        top: 0,
        show: false,
        type: 'inside'
      }],
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: 0,
        right: 30,
        bottom: 0,
        top: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: time,
        offset: 0,
        // 坐标轴刻度相关设置
        axisTick: {
          length: 9,
          lineStye: {
            color: this.baseColor
          }
        },
        axisLabel: {
          lineHeight: 18,
          margin: 11,
          color: this.ylabelColor,
        },
        axisLine: {
          lineStyle: {
            color: this.baseColor,
          }
        },

        axisPointer: {
          show: true,
          type: 'line',
          lineStyle: {
            color: this.yLineColor,
            type: 'solid',
            width: 0.5
          }
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          color: this.ylabelColor
        },
        min: 0,
        axisLabel: {
          height: 18,
          color: this.ylabelColor,
        },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          }
        }
      },
      series: [],
    };
    if (read.length && write.length) {
      this.optionData.legend.data = legendData;
      this.optionData.series = seriesArr;
    } else if (read.length && !write.length) {
      this.optionData.legend.data = [legendData[0]];
      this.optionData.series = [seriesArr[0]];
    } else if (!read.length && write.length) {
      this.optionData.legend.data = [legendData[1]];
      this.optionData.series = [seriesArr[1]];
    }
  }

  /**
   * 设置图表tooltip
   */
  private makeTooltip() {
    this.optionData.tooltip = {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: this.tipbgColor,
      borderWidth: 1,
      borderRadius: 5,
      hideDelay: 500,
      enterable: true,
      confine: true,
      padding: [8, 16, 8, 16],
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: this.tipLineColor,
          width: 1.1
        }
      },

      // 移动过度时间
      transitionDuration: 1,
      formatter: (params: any) => {
        let html = `<div style="font-size: 12px; color: ${this.ylabelColor}" class='chart-tip'>`;
        params.forEach((item: any, index1: any) => {
          if (index1 === 0) {
            html += `<div style="height: 18px; line-height: 18px; margin-bottom: 8px">
                      <span>${I18n.storage_io_detail.result_tab.time}<span>
                      <span>${this.sanitizer.sanitize(SecurityContext.HTML, item.axisValue)}ms</span>
                    </div>`;
          }
          let seriesName = item.seriesName + I18n.common_term_sign_left + this.chartData.unit
            + I18n.common_term_sign_right;
          if (this.chartData.unit === 'times') {
            seriesName = item.seriesName + I18n.common_term_sign_left + I18n.storage_io_detail.result_tab.times
             + I18n.common_term_sign_right;
          }
          html += `<div style="display: flex; align-items: center; height:18px; margin-bottom: 8px;
                    color:${this.yNameColor};">
                    <span style="display: block; margin-right: 8px; height: 8px; width: 8px;
                      background: ${this.sanitizer.sanitize(SecurityContext.HTML, item.color)};">
                    </span>
                    <span style="margin-right: 24px;">
                      ${this.sanitizer.sanitize(SecurityContext.HTML, seriesName)}</span>
                    <span>${this.sanitizer.sanitize(SecurityContext.HTML, item.data)}</span>
                  </div>`;
        });
        html += `</div>`;

        // 修改鼠标经过tips框离开触发区域,tips不消失的问题
        const tipBoxContent = $('#' + this.uuid + ' .echarts');
        const tipBox = $('#' + this.uuid + ' .chart-tip').parent();
        if (tipBox) {
          tipBoxContent[0].onmouseleave = (e) => {
            tipBox.css('display', 'none');
          };
        }
        return html;
      }
    };
  }
  /**
   * ngx-echarts 初始化时调用
   */
  onChartInit(ec: any) {
    this.echartsInstance = ec;

    // 放大缩小时调用接口
    this.echartsInstance.on('datazoom', (params: any) => {
      this.timeLine = { start: params.batch[0].start, end: params.batch[0].end };
      this.timeLineCom.dataConfig(this.timeLine);
    });
  }

  /**
   * 拖动时间轴回调
   * @param e e
   */
  timeLineData(e: { start: number; end: number; }) {
    this.timeLine = e;
    this.initChart();
  }
}
