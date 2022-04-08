import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef, Output,
   EventEmitter, ElementRef, SecurityContext, OnDestroy } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { ConnectLegendsService } from '../connect-legends.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';


@Component({
  selector: 'app-io-sequence',
  templateUrl: './io-sequence.component.html',
  styleUrls: ['./io-sequence.component.scss']
})
export class IoSequenceComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() datas: any;
  @Input() timeLine: any;
  @Input() isHave: string;
  @Input() isMe: string;
  @Output() public dataZoom = new EventEmitter<any>();
  @Output() public echartsInstOut = new EventEmitter<any>();
  @Output() public brushOut = new EventEmitter<any>();
  public i18n: any;
  public timer: any; // 延时器
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public baseTop = 47;
  public gridHeight = 40;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public titleHeight = 78;  // 组与组之间的距离
  public lineColorList = ['#267DFF', '#07A9EE', '#41BA41', '#E88B00', '#A050E7', '#E72E90'];
  public echarts = require('echarts');
  public uuid: any;
  public GlobalColumInfo: any;
  public ifShowlegend: boolean;
  public ifShowxAxis: boolean;
  public option: any = {
    title: [],
    legend: {},
    dataZoom: [{
      start: 0,
      end: 100,
      xAxisIndex: [],
      left: '1.3%',
      right: '3.3%',
      height: '18',
      top: 0,
      show: false,
      textStyle: {
        color: 'rgba(0,0,0,0)'
      }
    }, {
      type: 'inside',
    }],
    tooltip: {

    },
    axisPointer: {
      snap: true
    },
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
  };
  public language = 'zh';
  public showSwap = false; // 控制dom显隐 防止报错
  public scrollDataIndex = 0;
  public leftSubscribe: any;
  public timelineSubscribe: any;
  public legendSubscribe: any;
  public allKeys: any[] = [];
  public  legend: any = [];
  constructor(
    public Axios: AxiosService,
    public changeDetectorRef: ChangeDetectorRef,
    public leftShowService: LeftShowService,
    private connectLegends: ConnectLegendsService,
    private el: ElementRef,
    public i18nService: I18nService,
    private domSanitizer: DomSanitizer) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.leftSubscribe = this.leftShowService.leftIfShow.subscribe((leftState) => {   // 点击左侧echarts需要自适应
      setTimeout(() => {
        const width = $('#user-guide-scroll').width() - 50;
        if (this.echartsInstance) {
          this.echartsInstance.resize({ width });
        }
      }, 400);
    });

    this.timelineSubscribe = this.leftShowService.timelineUPData.subscribe((e) => {
      if (this.echartsInstance){
        this.upDateTimeLine(e);
      }
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
    this.legend = [this.i18n.storageIO.ioapis.Invoking_times, this.i18n.storageIO.ioapis.average_time,
      this.i18n.storageIO.ioapis.total_time];
    this.allKeys = [{title: this.i18n.storageIO.ioapis.Invoking_times, key: 'times'},
    {title: this.i18n.storageIO.ioapis.average_time, key: 'averageTime'},
    {title: this.i18n.storageIO.ioapis.total_time, key: 'totalTime'}];
  }

  ngAfterViewInit() {
    this.setData(this.timeLine);
    this.legendSubscribe = this.connectLegends.getMessage().subscribe((msg) => {
      if (msg.page === 'iops') {
        this.rebuildOption(msg.data.params, msg.data.showLegendList);
      }
    });
  }

  /**
   * 鼠标按下框选
   */
  public onBrush(e: any) {
    const maskBox = this.el.nativeElement.querySelector('.mask-box');
    const brushBox = this.el.nativeElement.querySelector('.brush-box');
    const tootipBox = this.el.nativeElement.querySelector('.echarts-box div').nextSibling; // 将tips框隐藏,防止碍事
    const canvasBox = this.el.nativeElement.querySelector('#' + this.uuid);
    tootipBox.style.display = 'none';
    maskBox.style.display = 'none';
    this.brushOut.emit('click');
    brushBox.style.width = 0;
    if (e.which !== 1) { return; }   // 只有左键按下可框选
    const anchorDot = e.clientX; // 鼠标点下原点
    const diffX = e.clientX - canvasBox.getBoundingClientRect().left - this.option.grid[0].left; // 框选框距离canvans左边框的距离
    const diffXr = diffX - canvasBox.offsetWidth + this.option.grid[0].left + this.option.grid[0].right; // 点击距离框选右侧距离
    if (diffX < 0 || diffXr > 0) { return; }
    const diffY = e.clientY - canvasBox.offsetTop;
    let rightSite = 0; // 框选右侧位置
    let leftSite = 0; // 框选左侧位置

    document.onmousemove = (v) => {
      tootipBox.style.display = 'none';
      maskBox.style.display = 'block';
      leftSite = diffX / maskBox.offsetWidth;
      brushBox.style.left = leftSite * 100 + '%';
      let mouseSite = v.clientX;
      const diffXlmove = v.clientX - canvasBox.getBoundingClientRect().left - this.option.grid[0].left;
      const diffXrmove = diffXlmove - canvasBox.offsetWidth + this.option.grid[0].left + this.option.grid[0].right;
      if (diffXlmove < 0) {
        mouseSite = canvasBox.getBoundingClientRect().left + this.option.grid[0].left;
      } else if (diffXrmove > 0) {
        mouseSite = canvasBox.getBoundingClientRect().left + canvasBox.offsetWidth - this.option.grid[0].right;
      }
      const disX = (mouseSite - anchorDot) / maskBox.offsetWidth;
      if (disX >= 0) {
        brushBox.style.width = disX * 100 + '%';
        rightSite = leftSite + disX;
      } else {
        const disX1 = Math.abs(disX);
        brushBox.style.width = disX1 * 100 + '%';
        brushBox.style.left = (leftSite - disX1) * 100 + '%';
        rightSite = leftSite - disX1;
      }
    };

    document.onmouseup = (v) => {
      this.dealBrushTime(leftSite, rightSite);
      document.onmousemove = null;
      document.onmouseup = null;
      document.onmousedown = null;
    };
  }

  /**
   * 处理框选时间
   */
  public dealBrushTime(left: number, right: number) {

    const dataNum = this.datas.time.length - 1;
    const totalTime = this.datas.time[dataNum];
    const leftTime = Number((totalTime * left).toFixed(6));
    const rightTime = Number((totalTime * right).toFixed(6));
    const brushTime = [leftTime, rightTime].sort((a, b) => a - b);

    if (left !== right) {
      const data = Object.assign(this.datas, { brushTime });
      this.brushOut.emit(data);
    }
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
    setTimeout(() => {
      const canvas = this.el.nativeElement.querySelector('canvas');
      canvas.onmousedown = (e: any) => { // 如果选中canvas,阻止默认事件
        e.preventDefault();
        e.stopPropagation();
        this.onBrush(e);
      };
    }, 1000);
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

    setTimeout(() => {    // echarts 实例绑定在一块
      this.echartsInstOut.emit(this.echartsInstance);
    }, 100);
  }
  public upDateTimeLine(data: any) {
    this.option.dataZoom[0].start = (data.start).toFixed(2);
    this.option.dataZoom[0].end = (data.end).toFixed(2);
    this.echartsInstance.setOption({
      dataZoom: this.option.dataZoom
    });
  }

  public makeXAxis(gridIndex: any, opt: any) {
    const option = {
      type: 'category',
      gridIndex,
      boundaryGap: false,
      offset: 0,
      data: this.datas.time,
      show: this.ifShowxAxis,
      axisLine: { onZero: false, lineStyle: { color: this.baseColor, width: 2 } },
      axisTick: { show: true }, // 坐标轴刻度相关设置
      axisLabel: {
        show: true,
        color: this.ylabelColor,                   // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
        interval: this.datas.time.length < 21 ? 0 : Math.floor((this.datas.time.length / 21))

      },  // 坐标轴刻度标签的相关设置
      axisPointer: {
        show: true,
        lineStyle: {
          color: '#6C7280',
          width: 1.5
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
    const that = this;
    const options = [{
      type: 'value',
      show: true,
      gridIndex,
      nameLocation: 'end',
      nameTextStyle: 'left',
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      min: 0,
      max: (value: any) => Math.ceil(value.max * 1.5),
      splitNumber: 1,
      interval: 300000,
      axisTick: { show: false },
      axisLine: { show: false }, // y轴是否展示
      axisLabel: { show: true, color: '#9ea4b3', formatter: (value: any) => {
        if (value !== 0) {
          return value + that.i18n.storageIO.ioapis.times;
        } else {
          return value;
        }
      }}, // y轴刻度
      splitLine: {
        show: true,
        lineStyle: { color: '#d4d9e6', type: 'solid' }
      }, // 刻度对应的线
    }, {
      type: 'value',
      show: true,
      gridIndex,
      nameLocation: 'end',
      nameTextStyle: 'left',
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      min: 0,
      max: (value: any) => Number((value.max * 1.5)).toFixed(3),
      splitNumber: 1,
      interval: 5000000,
      axisTick: { show: false },
      axisLine: { show: false }, // y轴是否展示
      axisLabel: { show: true, color: '#9ea4b3', formatter: (value: any) => {
        if (value !== 0) {
          return value + 'ms';
        } else {
          return value;
        }
      }}, // y轴刻度
      splitLine: {
        show: true,
        lineStyle: { color: '#d4d9e6', type: 'solid' }
      }, // 刻度对应的线
    }
    ];
    return options;
  }

  public makeGrid(top: any, opt: any) {
    const options = {
      top: this.ifShowlegend ? 72 : 45,
      height: this.ifShowlegend ? this.gridHeight : this.gridHeight,
      left: 70,
      right: 80,
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  public makeTitle(text: any, top: any) {
    const options = {
      text,
      top: this.ifShowlegend ? 37 : 0,
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

  public makeLegend(data: any) {
    const selected: any = {};
    this.allKeys.forEach(ele => {
      if (this.datas.key.indexOf(ele.key) > -1){
        selected[ele.title] = true;
      } else {
        selected[ele.title] = false;
      }
    });
    const option = {
      data,
      selected,
      type: 'scroll',
      icon: 'rect',
      itemWidth: 8,
      itemHeight: 8,
      top: 0,
      algin: 'left',
      right: 50,
      width: '35%',
      height: 120,
      textStyle: {
        color: '#282b33',
        fontSize: 12,
        lineHeight: 12,
        fontWeight: 'normal',
      },
      show: false,
      selectedMode: true,
      zlevel: 1100,
      inactiveColor: '#ccc'
    };
    return option;
  }

  public setData(timeData: any) {
    this.ifShowxAxis = this.datas.index[2] === this.datas.index[3] ? true : false;
    const that = this;
    this.option.series = [];
    this.option.grid = [];
    this.option.xAxis = [];
    this.option.yAxis = [];              // 情空数据
    this.option.title = [];              // 清空title
    this.option.legend = [];              // 清空图例
    this.option.dataZoom[0].start = timeData.start;
    this.option.dataZoom[0].end = timeData.end;
    this.option.dataZoom[0].xAxisIndex = [0];
    this.option.dataZoom[0].top = 60;
    // 处理最大值
    const columinfo = {};
    const keys = Object.keys(columinfo);
    this.option.xAxis.push(this.makeXAxis(0, {})); //  设置X轴
    this.option.yAxis = this.makeYAxis(0, {}); // 设置Y轴
    this.option.legend = this.makeLegend(this.legend); // 设置图例
    this.option.title.push(this.makeTitle(this.datas.function, 0)); // 设置标题
    this.option.grid.push(this.makeGrid(this.baseTop, {}));
    this.allKeys.forEach((item: any, index: number) => {
      let colorIdx = 0;
      if (item.key === 'averageTime') {
        colorIdx = 1;
      } else if (item.key === 'totalTime') {
        colorIdx = 2;
      }
      const yAxisIndex = index > 0 ? 1 : 0;
      this.option.series.push(
        {
          name: this.legend[colorIdx],
          type: 'line',
          symbol: 'emptyCircle',
          symbolSize: 4,
          showAllSymbol: false,
          xAxisIndex: 0,
          yAxisIndex,
          itemStyle: {

            normal: {
              color: this.lineColorList[colorIdx], // 折线点的颜色
              lineStyle: { color: this.lineColorList[colorIdx] }// 折线的颜色
            }
          },
          data: this.datas.values[item.key]
        }
      );
    });
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
      formatter: (params: any): any => {
        if (params.length) {
          let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px"> `;
          const unitList = [this.i18n.storageIO.ioapis.time1, 'ms', 'ms'];
          let unitIdx = 0;
          params.forEach((param: any, index: any) => {
            if (param.seriesName === this.i18n.storageIO.ioapis.Invoking_times) {
              unitIdx = 0;
            } else if (param.seriesName === this.i18n.storageIO.ioapis.average_time) {
              unitIdx = 1;
            } else {
              unitIdx = 2;
            }
            if (index === 0) {
              html += `<p style="color:#282b33;font-size:12px; line-height: 12px;margin-bottom:12px">
              ${this.domSanitizer.sanitize(SecurityContext.HTML, param.axisValue)}</p>`;
            }
            html += `
            <div style="color:#282b33;font-size:12px; line-height: 12px;
            margin-bottom:10px;display:flex;justify-content: space-between;">
              <div style="display:flex;align-items: center;min-width:110px">
                <span style="display:block;margin-right:8px;height:8px;width:8px;background:
                ${this.domSanitizer.sanitize(SecurityContext.HTML, param.color)}"></span>
                <p> ${this.domSanitizer.sanitize(SecurityContext.HTML, param.seriesName.split(',')[0])}:</p>
              </div>
              <p> ${this.domSanitizer.sanitize(SecurityContext.HTML,
                Util.fixThouSeparator(param.data) + unitList[unitIdx])}</p>
            </div>
            `;
          });
          html += `</div>`;
          return html;
        }
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
      // echarts图表联动
      setTimeout(() => {
        this.echartsInstOut.emit(this.echartsInstance);
      }, 100);
    }, 100);

  }
  getSafeText(content: any) {
    const $dom = $('<span></span>').text(content);
    return $dom[0].innerHTML;
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
    if (this.timelineSubscribe) {
      this.timelineSubscribe.unsubscribe();
    }
  }

}
