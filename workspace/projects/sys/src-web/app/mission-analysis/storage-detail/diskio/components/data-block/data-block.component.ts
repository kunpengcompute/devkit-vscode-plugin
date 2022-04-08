import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef, ViewChild,
   Output, EventEmitter, ElementRef, SecurityContext } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTipRef, TiTipService } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-data-block',
  templateUrl: './data-block.component.html',
  styleUrls: ['./data-block.component.scss']
})
export class DataBlockComponent implements OnInit, AfterViewInit {
  private tipInstance: TiTipRef; // tip组件实例
  private tipShowState = false; // tip显示状态标志位
  @Input() datas: any;
  @Input() timeLine: any;
  @Input() isHave: string;
  @Input() isMe: string;
  @Output() public dataZoom = new EventEmitter<any>();
  public suggest = '';
  public i18n: any;
  public timer: any; // 延时器
  public yMax = 0;
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 47;
  public gridHeight = 140;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public titleHeight = 78;  // 组与组之间的距离
  public lineColorList = ['#037DFF', '#00BFC9', '#41BA41'];
  public echarts = require('echarts');
  public filter = {};
  public uuid: any;
  public GlobalColumInfo: any;
  public option: any = {
    title: [],
    legend: ['block'],

    tooltip: {},

    axisPointer: {
      snap: true
    },
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
  };
  public language = 'zh';
  public scrollDataIndex = 0;
  constructor(
    public Axios: AxiosService,
    public changeDetectorRef: ChangeDetectorRef,
    public leftShowService: LeftShowService,
    public i18nService: I18nService,
    private domSanitizer: DomSanitizer) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.leftShowService.leftIfShow.subscribe(() => {   // 点击左侧echarts需要自适应
      setTimeout(() => {
        const width = $('#user-guide-scroll').width() - 10;
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
    this.setData();
  }

  /**
   * ngx-echarts初始化后触发事件
   */
  public onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
    });

    this.echartsInstance.on('legendscroll', (params: any) => {
      this.scrollDataIndex = params.scrollDataIndex;
    });
    this.echartsInstance.on('legendselectchanged', (params: any) => {  // 点击图例
      const showLegendList = [];
      for (const key of Object.keys(params.selected)) {
        const isSelected = params.selected[key];
        if (isSelected) {
          showLegendList.push(key);
        }
      }
      this.rebuildOption(params, showLegendList);
    });
  }
  private rebuildOption(params: any, list: any[]) {
    this.echartsInstance.group = '';    // 解除 echarts
    const lineNum: any = [];
    const option = this.tableData;
    option.legend.selected = params.selected;
    option.legend.scrollDataIndex = this.scrollDataIndex;
    option.series.forEach((series: any) => {
      if (list.indexOf(series.name) >= 0) {
        if (lineNum.indexOf(series.name) === -1) {
          lineNum.push(series.name);
        }
      }
    });
    setTimeout(() => {    // 异步更新数据
      this.tableData = option;
      this.echartsInstance.clear();
      this.echartsInstance.setOption(option, true);
    }, 100);

  }


  public makeXAxis(gridIndex: any, opt: any) {
    const option = {
      type: 'category',
      gridIndex,
      boundaryGap: true,
      offset: 0,
      data: this.datas.time,
      show: true,
      axisLine: { onZero: false, lineStyle: { color: this.baseColor, width: 1.5 } },
      axisTick: { show: true }, // 坐标轴刻度相关设置
      axisLabel: {
        show: true,
        color: this.ylabelColor,                   // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
        interval: this.datas.time.length < 21 ? 0 : 'auto'

      },  // 坐标轴刻度标签的相关设置
      axisPointer: {
        show: true,
        lineStyle: {
          color: '#6C7280',
          width: 0
        }
      },
      splitLine: {
        show: false,  // 刻度线
        interval: 0
      },
    };
    if (option) {
      Object.assign(option, opt);
    }
    return option;

  }

  public makeYAxis(gridIndex: any, opt: any) {
    const options = [{
      type: 'value',
      show: true,
      gridIndex,
      nameLocation: 'end',
      nameTextStyle: 'left',
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      min: 'dataMin',
      max: 'dataMax',
      splitNumber: 2,
      axisTick: { show: true },
      axisLine: {
        show: true, // y轴是否展示
        lineStyle: {
          color: '#E1E6EE',
          width: 1.5
        }
      },
      axisLabel: { show: true, color: '#9ea4b3', formatter: '{value}' }, // y轴刻度
      splitLine: {
        show: false,
        lineStyle: { color: '#d4d9e6', type: 'solid' }
      }, // 刻度对应的线
    },
    ];

    return options;
  }

  public makeGrid(top: any, opt: any) {
    const options = {
      top: 45,
      height: this.gridHeight,
      left: 100,
      right: '3.5%'
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  public makeTitle(text: any, top: any) {
    const options = {
      text,
      top: 0,
      left: -5,
      textStyle: {
        color: '#252c3c',
        height: 14,
        fontSize: 14,
        lineHeight: 14,
        fontWeight: 'normal',
      }

    };
    return options;
  }


  public setData() {

    const that = this;
    this.option.series = [];
    this.option.grid = [];
    this.option.xAxis = [];
    this.option.yAxis = [];              // 情空数据
    this.option.title = [];              // 清空title
    this.option.legend = [];              // 清空图例
    // 处理最大值
    const columinfo = {};
    const keys = Object.keys(columinfo);
    this.option.xAxis.push(this.makeXAxis(0, {})); //  设置X轴
    this.option.yAxis = this.makeYAxis(0, {}); // 设置Y轴
    this.option.title.push(this.makeTitle(this.i18n.storageIO.iodistribution, 0)); // 设置标题
    this.option.grid.push(this.makeGrid(this.baseTop, {}));
    function renderItem(params: any, api: any) {
      const xValue = api.value(0);
      const highPoint = api.coord([xValue, api.value(1)]);
      const lowPoint = api.coord([xValue, api.value(2)]);
      const halfWidth = api.size([1, 0])[0] * 0.1 > 4 ? 4 : api.size([1, 0])[0] * 0.1;
      const style = api.style({
        stroke: '#389E0D',
        fill: null
      });

      return {
        type: 'group',
        children: [{
          type: 'line',
          shape: {
            x1: highPoint[0] - halfWidth, y1: highPoint[1],
            x2: highPoint[0] + halfWidth, y2: highPoint[1]
          },
          style
        }, {
          type: 'line',
          shape: {
            x1: highPoint[0], y1: highPoint[1],
            x2: lowPoint[0], y2: lowPoint[1]
          },
          style
        }, {
          type: 'line',
          shape: {
            x1: lowPoint[0] - halfWidth, y1: lowPoint[1],
            x2: lowPoint[0] + halfWidth, y2: lowPoint[1]
          },
          style
        }]
      };
    }
    this.option.series.push(
      {
        name: 'block',
        type: 'custom',
        renderItem,
        encode: {
          x: 0,
          y: [1, 2]
        },
        itemStyle: {
          normal: {
            borderWidth: 1.5
          }
        },
        data: this.datas.data
      }
    );
    this.option.tooltip = {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 0,
      enterable: false,
      confine: true,
      padding: [12, 16, 0, 18],
      triggerOn: 'mousemove',
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;',
      axisPointer: {
        show: false,
        type: 'line',
        lineStyle: {
          color: '#6C7280',
          width: 1.5,
        }
      },
      formatter: (params: any) => {
        const title = [this.i18n.storageIO.diskio.startBlockNo, this.i18n.storageIO.diskio.endBlockNo];
        let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px"> `;
        params[0].data.forEach((param: any, index: any) => {
          if (index === 0) {
            html += `<p style="color:#282b33;font-size:12px; line-height: 12px;margin-bottom:12px">
            ${this.domSanitizer.sanitize(SecurityContext.HTML, param)}</p>`;
          } else {
            html += `
            <div style="color:#282b33;font-size:12px; line-height: 12px;
            margin-bottom:10px;display:flex;justify-content: space-between;">
              <div style="display:flex;align-items: center;min-width:110px">
                <p> ${title[index - 1]}</p>
              </div>
              <p> ${this.domSanitizer.sanitize(SecurityContext.HTML, Util.fixThouSeparator(param))}</p>
            </div>
            `;
          }

        });
        html += `</div>`;
        return html;

      }
    };
    const height = this.gridHeight + this.titleHeight;

    $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });

    setTimeout(() => {
      this.tableData = this.option;
      if (this.echartsInstance) {
        this.echartsInstance.clear();
        this.echartsInstance.setOption(this.tableData, true);
      }
    }, 100);

  }
}

