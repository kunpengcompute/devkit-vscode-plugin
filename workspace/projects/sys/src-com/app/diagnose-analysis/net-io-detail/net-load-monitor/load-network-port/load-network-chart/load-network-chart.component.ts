import {
  Component, Input, OnInit,
  Output, EventEmitter, SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from 'sys/src-com/app/service';
import { HyTheme, HyThemeService } from 'hyper';
import * as Utils from 'projects/sys/src-com/app/util';

@Component({
  selector: 'app-load-network-chart',
  templateUrl: './load-network-chart.component.html',
  styleUrls: ['./load-network-chart.component.scss']
})
export class LoadNetworkChartComponent implements OnInit {
  @Input() datas: any;
  @Input() timeLine: any;
  @Output() public dataZoomOut = new EventEmitter<any>();
  @Output() public echartsInstOut = new EventEmitter<any>();
  @Input() lineColorListPps: any;

  public devArr: Array<string>;
  public uuid: any;
  public scrollDataIndex = 0;
  public currTheme: HyTheme;
  public echartsInstance: any;
  public tableData: any;
  public baseTop = 20;
  public gridHeight = 170;
  public baseColor = '#484a4e';
  public ylabelColor = '#999';
  public yLineColor = '#6c7280';
  public lineColorList = ['#3d7ff3', '#2da46f', '#18aba6', '#9653e1', '#618824', '#ad2776', '#c24123', '#ab254e'];
  public option: any;
  public leftSubscribe: any;
  public i18n: any;
  constructor(
    private themeServe: HyThemeService,
    public i18nService: I18nService,
    private sanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.uuid = Utils.generateConversationId(12);
  }
  /**
   * 初始化
   */
  ngOnInit() {
    this.themeServe.subscribe((msg: HyTheme) => {
      this.getthemeColor(msg);
      this.initTable(); // IDE切换主题,web进入页面同样会触发
    });
    if (document.body.className.includes('vscode-dark')) {
      this.getthemeColor(HyTheme.Dark);
    } else {
      this.getthemeColor(HyTheme.Light);
    }
  }

  /**
   * 获取主题和颜色值
   * @param theme dark | light
   */
  private getthemeColor(theme: HyTheme) {
    this.currTheme = theme;
    if (theme === HyTheme.Light) {
      this.baseColor = '#E1E6EE';
      this.ylabelColor = '#616161';
      this.yLineColor = '#6c7280';
    } else {
      this.baseColor = '#484a4e';
      this.ylabelColor = '#AAAAAA';
      this.yLineColor = '#616161';
    }
  }
  /**
   * ngx-echarts 初始化时调用
   */
  onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.dataZoomOut.emit({ start: params.batch[0].start, end: params.batch[0].end });
    });
    setTimeout(() => {    // echarts 实例绑定在一块
      this.echartsInstOut.emit(this.echartsInstance);
    }, 100);
  }


  public initOptions() {
    this.option = {
      title: {
        text: this.datas.title,
        textStyle: {
          color: this.currTheme === HyTheme.Dark ? '#E8E8E8' : '#222222',
          fontSize: 14,
          fontWeight: 500,
          left: -20
        }
      },
      legend: {
        data: [],
        type: 'scroll',
        icon: 'rect',
        top: 0,
        algin: 'left',
        right: 0,
        width: '35%',
        itemWidth: 8,
        itemHeight: 8,
        show: true,
        selectedMode: true,
        textStyle: {
          color: this.currTheme === HyTheme.Dark ? '#e8e8e8' : '#252c3c',
        }
      },
      dataZoom: [{
        start: 0,
        end: 100,
        top: 0,
        show: false,
        textStyle: {
          color: 'rgba(0,0,0,0)'
        },
        type: 'inside'
      }],
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: 40,
        right: 40,
        bottom: 30,
        top: 40,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.datas.time,
        offset: 0,
        axisTick: {
          length: 9,
          lineStye: {
            color: this.baseColor
          }
        }, // 坐标轴刻度相关设置
        axisLabel: {
          lineHeight: 18,
          margin: 11,
          color: this.currTheme === HyTheme.Dark ? '#aaa' : '#252c3c',
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
        offset: 0,
        nameLocation: 'middle',
        nameGap: 30,
        nameRotate: 0,
        nameTextStyle: {
          color: '#333'
        },
        min: 0,
        axisLabel: {
          height: 18,
          padding: -28,
          textStyle: {
            align: 'left',
          }
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
  }

  /**
   * 初始化数据
   */
  public initTable() {
    this.setData(this.timeLine);
  }

  /**
   * 导入数据生成canvas
   */
  public setData(timeData: any) {
    this.initOptions();
    this.option.dataZoom[0].start = timeData.start;
    this.option.dataZoom[0].end = timeData.end;
    const legends: any = [];
    this.datas.key.forEach((dev: any, index: number) => {
      const name = dev.title + this.i18n.common_term_sign_left + dev.unit + this.i18n.common_term_sign_right;
      legends.push(name);

      // 设置series
      let colorIndex1 = 0;
      if (this.lineColorListPps.length < index) { // 如果颜色不够用
        colorIndex1 = Math.floor((index) / this.lineColorList.length);
      } else {
        colorIndex1 = index;
      }

      const seriesObj: any = {
        name,
        type: 'line',
        symbol: 'emptyCircle',
        symbolSize: 4,
        showAllSymbol: false,
        smooth: true,
        itemStyle: {
          normal: {
            color: this.lineColorListPps[colorIndex1], // 折点颜色
          },
          color: this.lineColorListPps[colorIndex1]  // 折线颜色
        },
        emphasis: {
          lineStyle: {
            width: 2
          }
        },
        data: this.datas.data[dev.key]
      };
      this.option.series.push(seriesObj);
    });
    this.option.legend.data = legends;

    this.makeTooltip();
    setTimeout(() => {
      this.tableData = this.option;
      if (this.echartsInstance) {
        this.echartsInstance.setOption(this.tableData, true);
      }
      setTimeout(() => {
        this.echartsInstOut.emit(this.echartsInstance);
      }, 100);
    }, 100);
  }


  /**
   * 设置图表tooltip
   */
  public makeTooltip() {
    this.option.tooltip = {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: this.currTheme === HyTheme.Dark ? '#424242' : '#fff',
      borderWidth: 1,
      borderRadius: 5,
      hideDelay: 500,
      enterable: true,
      confine: true,
      padding: [8, 16, 16, 20],
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: this.currTheme === HyTheme.Dark ? '#478cf1' : '#6C7280',
          width: 1.1
        }
      },
      transitionDuration: 1, // 移动过度时间
      textStyle: {
        color: '#222222',
        fontSize: 12,
      },
      formatter: (params: any) => {
        let time = '';
        let html = `<div style="font-size:12px;height:96px;color:${this.currTheme === HyTheme.Dark ?
          '#aaaaaa' : '#616161'}" class='chart-tip'>`;
        html += `<div style="height:18px;padding-bottom:8px;">${this.datas.dev}</div>`;
        params.forEach((item: any, index1: any) => {
          if (index1 === 0) {
            time = item.axisValue;
            html += `<div style="display:flex;height:18px;margin-bottom:8px;">
                          <span>${this.sanitizer.sanitize(SecurityContext.HTML, item.axisValue)}</span></div>`;
            html += `<div style="height:18px;">${this.datas.dev}</div>`;
          }
          html += `<div style="display:flex;line-height:22px;color:${this.currTheme === HyTheme.Dark ?
            '#E8E8E8' : '#222222'};align-items:center;">`;
          html += `<span  style="display:block;margin-right:8px;height:8px;width:9px;background:
                          ${this.sanitizer.sanitize(SecurityContext.HTML, item.color)}"></span>`;
          html += `<span style="width:81px;height:18px; margin-right:16px;">
          ${this.sanitizer.sanitize(SecurityContext.HTML, item.seriesName)}:</span>
                      <span style="width:26px;height:18px;">
                      ${this.sanitizer.sanitize(SecurityContext.HTML, item.data)}
                      </span></div>`;
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

}
