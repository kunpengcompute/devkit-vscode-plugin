import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef, SecurityContext, OnDestroy } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { ConnectLegendsService } from '../connect-legends.service';
import { DomSanitizer } from '@angular/platform-browser';

const IO_DELAY_LINE_WIDTH = 44;

@Component({
  selector: 'app-data-size-chart',
  templateUrl: './data-size-chart.component.html',
  styleUrls: ['./data-size-chart.component.scss']
})
export class DataSizeChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() data: any;
  @Input() dev: any;
  @Input() name: string;
  constructor(
    public Axios: AxiosService,
    public changeDetectorRef: ChangeDetectorRef,
    public leftShowService: LeftShowService,
    private connectLegends: ConnectLegendsService,
    public i18nService: I18nService,
    private domSanitizer: DomSanitizer) {
    this.i18n = this.i18nService.I18n();
  }
  public uuid: any;
  public i18n: any;
  public tableData: any;
  public echartsInstance: any;
  public scrollDataIndex = 0;
  public lineColorList = ['#267DFF', '#07A9EE', '#41BA41', '#E88B00', '#A050E7', '#E72E90'];
  public option: any = {// echarts 配置项
    title: [{
      text: '',
      top: 10,
      left: 50,
      textStyle: {
        color: '#252c3c',
        height: 14,
        fontSize: 14,
        lineHeight: 14,
        fontWeight: 'normal',
      }
    }],
    legend: {
      icon: 'rect',
      itemWidth: 8,
      itemHeight: 8,
      top: 10,
      algin: 'left',
      right: 50,
      width: '35%',
      height: 12,
      textStyle: {
        color: '#282b33',
        fontSize: 12,
        lineHeight: 12,
        fontWeight: 'normal',
      },
      show: true,
      selectedMode: true,
    },
    tooltip: {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 0,
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
      axisPointer: {
        type: 'line',
        lineStyle: {
          width: '88',
          color: '#267DFF19',
          opacity: 1,
        }
      }
    },
    dataset: {
      source: []
    },
    xAxis: {
      type: 'category',
      offset: 0,
      show: true,
      axisTick: {
        show: true, // 坐标轴刻度相关设置
        alignWithLabel: true
      },
      splitLine: {
        show: false,  // 刻度线
      }
    },
    grid: [{
      top: 70,
      height: 210,
      left: 60,
      right: '2.5%',
      containLabel: true
    }],
    yAxis: {
      type: 'value',
      splitNumber: 2,
      max: 100,
      min: 0,
      axisLabel: {
        show: true,
        formatter: '{value} %'
      },
      axisTick: { show: false }, // 坐标轴刻度相关设置
      axisLine: {
        show: false,
      },
      splitLine: {
        show: true,  // 刻度线
        interval: 50,
        lineStyle: {
          type: 'dashed',
        }
      }
    },
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [
      { type: 'bar', itemStyle: { color: '#267DFF' }, barWidth: 32, legendHoverLink: false },
      { type: 'bar', itemStyle: { color: '#07A9EE' }, barWidth: 32, legendHoverLink: false },
    ]
  };
  public language = 'zh';
  public leftSubscribe: any;
  public legendSubscribe: any;
  ngOnInit() {
    this.leftSubscribe = this.leftShowService.leftIfShow.subscribe(() => {   // 点击左侧echarts需要自适应
      setTimeout(() => {
        const width = $('#user-guide-scroll').width() - 50;
        this.echartsInstance.resize({ width });
      }, 200);
    });


    fromEvent(window, 'resize')
      .subscribe((event) => {
        let timer: any;
        const that = this;
        function debounce() {
          clearTimeout(timer);
          timer = setTimeout(() => {              // 300毫秒的防抖
            const width = $('#user-guide-scroll').width();
            that.echartsInstance.resize({ width });
          }, 300);
        }
        debounce();
      });
    this.uuid = this.Axios.generateConversationId(12);

  }
  ngAfterViewInit() {
    this.setChartsData();
    this.legendSubscribe = this.connectLegends.getMessage().subscribe((msg) => {
      if (msg.dev === this.dev && msg.page === 'summury'
      && this.option.title[0].text !== this.i18n.storageIO.summury.data_size) {
        this.rebuildOption(msg.data.params, msg.data.showLegendList);
      }
    });
  }

  setChartsData() {
    const that = this;
    if (this.name.indexOf('size') !== -1) {
      this.option.legend.show = true;
      this.option.title[0].text = this.i18n.storageIO.summury.data_size;
    } else if (this.name.indexOf('d2c') !== -1) {
      this.option.legend.show = false;
      this.option.title[0].text = this.i18n.storageIO.summury.d2c_io_delay;
      this.option.tooltip.axisPointer.lineStyle.width = IO_DELAY_LINE_WIDTH;
      this.option.series.forEach((serie: any) => {
        serie.barWidth = 16;
      });
    } else if (this.name.indexOf('i2d') !== -1) {
      this.option.legend.show = false;
      this.option.title[0].text = this.i18n.storageIO.summury.i2d_io_delay;
      this.option.tooltip.axisPointer.lineStyle.width = IO_DELAY_LINE_WIDTH;
      this.option.series.forEach((serie: any) => {
        serie.barWidth = 16;
      });
    } else {
      this.option.legend.show = false;
      this.option.title[0].text = this.i18n.storageIO.summury.io_delay;
    }

    this.option.dataset.source[0] = ['product', this.i18n.storageIO.summury.read, this.i18n.storageIO.summury.write];
    this.data.forEach((ele: any, index: any) => {
      const dataArr = [ele.name, Number(ele.r[1].replace('%', '')), Number(ele.w[1].replace('%', ''))];
      this.option.dataset.source.push(dataArr);
    });
    const win: any = window;
    if (!!win.ActiveXObject || 'ActiveXObject' in window) {
      this.option.tooltip.axisPointer.lineStyle.opacity = 0.3;
    }
    this.option.tooltip.formatter = (value: any) => {
      let dataIndex = 0;
      let perIdx = 1;
      let wr = 'w';
      let html = ` <div style="padding:0px 14px"> `;
      value.forEach((param: any, index: any) => {
        if (index === 0) {
          dataIndex = param.dataIndex;
          html += `<div style="color:#616161;font-size:12px; line-height: 20px;margin-bottom:3px;display:flex;">
          <div style="width:95px">${this.domSanitizer.sanitize(SecurityContext.HTML, param.axisValue)}</div>
          <div></div>${that.i18n.storageIO.times}</div>`;
        }
        if (param.seriesName === this.i18n.storageIO.summury.read) {
          wr = 'r';
          perIdx = 1;
        } else {
          wr = 'w';
          perIdx = 2;
        }
        html += `
            <div style="color:#222222;font-size:12px; line-height: 22px;margin-bottom:3px;display:flex;">
              <div style="display:flex;align-items: center;width:95px">
                <span style="display:block;margin-right:8px;height:8px;width:8px;
                background:${this.domSanitizer.sanitize(SecurityContext.HTML, param.color)}"></span>
                <p> ${this.domSanitizer.sanitize(SecurityContext.HTML, param.seriesName)}</p>
              </div>
              <p>${this.domSanitizer.sanitize(SecurityContext.HTML, that.data[dataIndex][wr][0])}
               (${this.domSanitizer.sanitize(SecurityContext.HTML, param.data[perIdx])}%)</p>
            </div>
            `;
      });
      html += `</div>`;
      return html;
    };

    setTimeout(() => {
      this.tableData = this.option;
      if (this.echartsInstance) {
        this.echartsInstance.clear();
        this.echartsInstance.setOption(this.tableData, true);
      }
    }, 100);
  }

  /**
   * ngx-echarts初始化后触发事件
   */
  public onChartInit(ec: any) {
    this.echartsInstance = ec;

    this.echartsInstance.on('legendscroll', (params: any) => {
      this.scrollDataIndex = params.scrollDataIndex;
    });
    this.echartsInstance.on('legendselectchanged', (params: any) => {  // 点击图例
      const showLegendList = [];
      for (const key of Object.keys(params.selected)) {
        const isSelected = params.selected[key];
        if (isSelected && key !== this.i18n.sys.averValue) {
          showLegendList.push(key);
        }
      }
      this.connectLegends.sendMessage({
        page: 'summury',
        dev: this.dev,
        key: '',
        data: { params, showLegendList }
      });
      this.rebuildOption(params, showLegendList);
    });
  }

  private rebuildOption(params: any, list: any[]) {
    this.echartsInstance.group = '';    // 解除 echarts
    const lineNum = [];
    const option = this.tableData;
    option.legend.selected = params.selected;
    option.legend.scrollDataIndex = this.scrollDataIndex;
    setTimeout(() => {    // 异步更新数据
      this.tableData = option;
      this.echartsInstance.clear();
      this.echartsInstance.setOption(option, true);
    }, 100);

  }

  /**
   * 取消订阅
   */
  ngOnDestroy() {
    if (this.legendSubscribe) {
      this.legendSubscribe.unsubscribe();
    }
    if (this.leftSubscribe) {
      this.leftSubscribe.unsubscribe();
    }
  }
}
