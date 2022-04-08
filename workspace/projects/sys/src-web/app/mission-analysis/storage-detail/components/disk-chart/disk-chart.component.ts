

import {
  Component, OnInit, Input, AfterViewInit, Output,
  EventEmitter, ElementRef, SecurityContext, OnDestroy
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { ConnectLegendsService } from '../connect-legends.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';
const hardUrl: any = require('../../../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-disk-chart',
  templateUrl: './disk-chart.component.html',
  styleUrls: ['./disk-chart.component.scss']
})
export class DiskChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() datas: any;
  @Input() timeLine: any;
  @Output() public dataZoom = new EventEmitter<any>();
  @Output() public brushOut = new EventEmitter<any>();
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 30;
  public gridHeight = 80;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public lineColorList = ['#267DFF', '#07A9EE', '#41BA41', '#E88B00', '#A050E7', '#E72E90'];
  public filter = {};
  public time: any;
  public spec: any; // 读\写
  public key: any;  // 数据大小\时延\队列深度
  public devArr: Array<string>; // 设备
  public uuid: any;
  public GlobalColumInfo: any;
  public scrollDataIndex = 0;
  public option: any = {
    legend: {
      data: [],
      type: 'scroll',
      icon: 'path://M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,11 L10,8 L6,8 L6,11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z',
      top: 0,
      algin: 'left',
      right: 50,
      width: '35%',
      itemHeight: 5,
      itemWidth: 25,
      show: true,
      selectedMode: true,
      zlevel: 1051,
      inactiveColor: '#ccc'
    },
    dataZoom: [{
      start: 0,
      end: 100,
      xAxisIndex: [],
      left: '1.3%',
      right: '3.3%',
      height: '18',
      top: 0,
      show: false,
      textStyle: { color: 'rgba(0,0,0,0)' }
    },
    { type: 'inside' }],
    tooltip: {},
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      snap: true
    },
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
  };
  public i18n: any;
  public leftSubscribe: any;
  public timelineSubscribe: any;
  public legendSubscribe: any;
  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public leftShowService: LeftShowService,
    private connectLegends: ConnectLegendsService,
    private el: ElementRef,
    private domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.leftSubscribe = this.leftShowService.leftIfShow.subscribe((leftState) => {   // 点击左侧echarts需要自适应
      setTimeout(() => {
        const width = $('#user-guide-scroll').width() * 0.892;
        if (this.echartsInstance) {
          this.echartsInstance.resize({ width });
        }
        $('.title-box').width($('#user-guide-scroll').width() * 0.08);
      }, 200);
    });

    this.timelineSubscribe = this.leftShowService.timelineUPData.subscribe((e) => { // 时间轴筛选
      this.upDateTimeLine(e);
    });

    fromEvent(window, 'resize')
      .subscribe((event) => {
        let timer: any;
        const that = this;
        function debounce() {
          clearTimeout(timer);
          timer = setTimeout(() => {              // 300毫秒的防抖
            const width = $('#user-guide-scroll').width() * 0.892;
            that.echartsInstance?.resize({ width });
            $('.title-box').width($('#user-guide-scroll').width() * 0.08);
          }, 300);
        }
        debounce();
      });
    this.uuid = this.Axios.generateConversationId(12);
  }
  ngAfterViewInit() {
    this.initTable();
    this.legendSubscribe = this.connectLegends.getMessage().subscribe((msg) => {
      if (msg.page === 'diskio' && this.key[0].key !== msg.key && this.key[0].key !== 'queue_depth') {
        this.rebuildOption(msg.data.params, msg.data.showLegendList);
      }
    });
  }
  /**
   * ngx-echarts 初始化时调用
   */
  onChartInit(ec: any) {
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
      if (this.key[0].key !== 'queue_depth') {
        this.connectLegends.sendMessage({
          page: 'diskio',
          dev: '',
          key: this.key[0].key,
          data: { params, showLegendList }
        });
      }
    });
    setTimeout(() => {

      let canvas = this.el.nativeElement.querySelector('canvas');
      if (this.datas.showLe) {
        canvas = this.el.nativeElement.querySelectorAll('canvas')[1];
      }
      canvas.onmousedown = (e: any) => { // 如果选中canvas,阻止默认事件
        if (e.layerY < 25 && this.datas.showLe) {

        } else {
          e.preventDefault();
          e.stopPropagation();
          this.onBrush(e);
        }

      };
    }, 1500);
  }

  /**
   * 重建canvas
   */
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

  /**
   * 更新时间轴筛选
   */
  public upDateTimeLine(data: any) {
    this.option.dataZoom[0].start = data.start;
    this.option.dataZoom[0].end = data.end;
    this.echartsInstance.setOption({
      dataZoom: this.option.dataZoom
    });
  }

  /**
   * 初始化数据
   */
  public initTable() {
    this.time = this.datas.time;
    this.spec = this.datas.spec;
    this.key = this.datas.key;
    this.devArr = this.datas.devArr;
    this.setData(this.timeLine);
  }

  /**
   * 设置X轴
   */
  public makeXAxis(gridIndex: any, opt: any) {

    const option = {
      type: 'category',
      gridIndex,
      boundaryGap: false,
      offset: 0,
      data: this.time,
      axisLine: { onZero: false, lineStyle: { color: this.baseColor, width: 2 } },
      axisTick: { show: false }, // 坐标轴刻度相关设置
      axisLabel: {
        show: false,
        color: this.ylabelColor,
        interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
        formatter(value: any) {
          value = parseFloat(value);
          return value.toFixed(3) + 's';
        }
      }, // 坐标轴刻度标签的相关设置
      splitLine: {
        show: true,
        lineStyle: { color: this.baseColor },
        interval: this.time.length < 300 ? 0 : Math.floor((this.time.length / 200)),
      },
      axisPointer: { lineStyle: { color: 'transparent' } }
    };
    if (option) { Object.assign(option, opt); }
    return option;
  }


  /**
   * 设置Y轴
   */
  public makeYAxis(gridIndex: any, opt: any) {

    const options = {
      type: 'value',
      show: false,
      gridIndex,
      nameLocation: 'middle',
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      nameTextStyle: {
        color: '#333'
      },
      min(value: any) {
        if (value.max < 10) {
          return -0.03;
        } else {
          return -value.max * 0.03;
        }
      },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: true },
      splitNumber: 0.1 // y轴刻度间隔
    };
    if (opt) { Object.assign(options, opt); }
    return options;
  }


  /**
   * 设置坐标系
   */
  public makeGrid(top: any, opt: any) {
    const options = {
      top,
      height: this.gridHeight,
      left: 25,
      right: 20,
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }


  /**
   * 导入数据生成canvas
   */
  public setData(timeData: any) {
    this.option.series = [];
    this.option.grid = [];
    this.option.xAxis = [];
    this.option.yAxis = [];              // 情空数据
    this.option.dataZoom[0].start = timeData.start;
    this.option.dataZoom[0].end = timeData.end;
    this.option.dataZoom[0].xAxisIndex = this.key.map((item: any, index: any) => index);
    this.option.dataZoom[0].top = this.key.length * this.gridHeight;
    const legends: any = [];
    this.devArr.forEach((dev, dieIndex) => {
      this.spec.forEach((spec: any) => {
        if (spec.key === 'write') {
          legends.push({ name: dev + '/' + spec.title,
           icon: 'path://M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,\
           11 L10,11 L10,8 L6,8 L6,11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z', });
        } else {
          if (this.key[0].key === 'queue_depth') {
            legends.push({ name: dev, icon: 'rect', });
          } else {
            legends.push({ name: dev + '/' + spec.title, icon: 'rect', });
          }
        }
      });
    });
    this.option.legend.data = legends;

    if (this.spec.length === 0 || !this.datas.showLe) {
      this.option.legend.show = false;
    }
    this.baseTop = this.datas.showLe ? 30 : 0;
    this.key.forEach((item: any, index: any) => {
      this.option.grid.push(this.makeGrid(this.baseTop, {}));

      this.option.yAxis.push(
        this.makeYAxis(index, {
          name: item.title,
          max: (value: any) => {
            if (value.max.toString() === 'NaN') { return 1; }
            if (value.max === 0 || value.max === -Infinity) {
              $('#' + this.uuid + ' .table-y ' + ` .${item.title}`).html('1.00' + this.key[0].unit);
              return 1;
            } else {
              $('#' + this.uuid + ' .table-y ' + ` .${item.title.replace('%', 'x').replace('/', 'x')}`)
                .html(this.domSanitizer.sanitize(SecurityContext.HTML,
                  Util.fixThouSeparator((value.max * 1.5).toFixed(0)) + this.key[0].unit));
              return value.max * 1.5;
            }
          }   // 暂时全部自动最大
        }),
      );
      if (!this.datas.showAxis) {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: true,
              color: 'rgba(0,0,0,0)',                   // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
              formatter(value: any) { return value; }
            }, // 坐标轴刻度标签的相关设置
            axisPointer: { show: true, lineStyle: { color: '#6C7280', width: 1.5 } }
          }));
      } else {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: true,
              color: this.ylabelColor,
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
              formatter(value: any) { return value; }
            }, // 坐标轴刻度标签的相关设置
            axisPointer: { show: true, lineStyle: { color: '#6C7280', width: 1.5 } }
          }));
      }
    });



    if (this.spec.length > 0) {// 设置series
      this.devArr.forEach((dev, ideIndex) => {
        this.key.forEach((item: any, index: any) => {
          let colorIndex1 = 0;
          if (this.lineColorList.length <= ideIndex) { // 如果颜色不够用
            colorIndex1 = ideIndex % this.lineColorList.length;
          } else {
            colorIndex1 = ideIndex;
          }
          this.spec.forEach((item2: any, index2: any) => {
            let name = dev + '/' + item2.title;
            if (this.key[0].key === 'queue_depth') {
              name = dev;
            }
            const seriesObj: any = {
              name,
              type: 'line',
              symbol: 'emptyCircle',
              symbolSize: 4,
              showAllSymbol: false,
              xAxisIndex: index,
              yAxisIndex: index,
              smooth: true,
              itemStyle: {
                normal: {
                  color: this.lineColorList[colorIndex1], // 折点颜色
                },
                color: this.lineColorList[colorIndex1]  // 折线颜色
              },
              data: this.datas.data[dev][item2.key][item.key],
              legendHoverLink: false,
            };
            if (item2.key === 'write') {
              seriesObj.smooth = false,   // 关键点，为true是不支持虚线的，实线就用true
                seriesObj.itemStyle.normal.lineStyle = { type: 'dotted' };
            }
            this.option.series.push(seriesObj);
          });
        });
      });
    }


    this.option.tooltip = {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 0,
      hideDelay: 0,
      confine: true,
      padding: [10, 20, 10, 20],
      alwaysShowContent: false,
      enterable: false,
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;padding: 10px 20px 0px;',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#6C7280',
          width: 1.5
        }
      },
      textStyle: {
        color: '#222222',
        fontSize: 12,
      },
      formatter: (params: any): any => {
        if (params.length) {
          const nameArr: any = [];
          const dataArr: any = [];
          params.forEach((item: any, index: any) => {
            if (nameArr.indexOf(item.seriesName) === -1) {
              nameArr.push(item.seriesName);
              dataArr.push(item);
            }
          });
          let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px"> `;
          const unit = this.key[0].unit;
          dataArr.forEach((param: any, index: any) => {
            const ifRead = param.seriesName.indexOf('read') > -1 || param.seriesName.indexOf('读') > -1 ? true : false;
            if (index === 0) {
              html += `<p style="color:#282b33;font-size:12px; line-height: 12px;margin-bottom:12px">
              ${this.domSanitizer.sanitize(SecurityContext.HTML, param.axisValue)}</p>`;
            }
            html += `
            <div style="color:#282b33;font-size:12px; line-height: 12px;
            margin-bottom:10px;display:flex;justify-content: space-between;">
              <div style="display:flex;align-items: center;min-width:110px">`;
            if (ifRead || this.key[0].key === 'queue_depth') {
              html += `
                  <span *ngIf="ifRead" style="display:block;margin-right:16px;height:3px;width:16px;background:
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, param.color)}"></span>`;
            } else {
              html += `
                <span  style="display:block;margin-right:16px;">
                <svg width="16px" height="3px" viewBox="0 0 16 3" version="1.1"
                xmlns="${hardUrl.w3cUrl}" xmlns:xlink="${hardUrl.xlinkUrl}">
              <g id="storage-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
             <g id="disk-0" transform="translate(-1280.000000, -276.000000)"
             fill="${this.domSanitizer.sanitize(SecurityContext.HTML, param.color)}" fill-rule="nonzero">
                <g id="arr-2" transform="translate(1280.000000, 268.000000)">
                <path d="M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,\
                11 L10,8 L6,8 L6,11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z" id="path-20">
                </path>
            </g></g></g></svg></span>`;
            }


            html += ` <p> ${this.domSanitizer.sanitize(SecurityContext.HTML, param.seriesName)}:</p>
              </div>
              <p> ${this.domSanitizer.sanitize(SecurityContext.HTML, Util.fixThouSeparator(param.data) + unit)}</p>
            </div>
            `;
          });
          html += `</div>`;
          return html;
        }
      }
    };
    const height = this.gridHeight + this.baseTop;
    $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
    this.setLeft();
    setTimeout(() => {
      this.tableData = this.option;
      if (this.echartsInstance) {
        this.echartsInstance.clear();
        this.echartsInstance.setOption(this.tableData, true);
      }
    }, 100);
  }

  /**
   * 设置左侧title
   */
  public setLeft() {
    let html = ``;
    const itemName = this.key[0].title;
    if (this.datas.showLe) {
      html += `<div class="line" style="margin-top: ${this.baseTop}px;background:${this.baseColor}"></div>
        <div class="title-box" style="height: ${this.gridHeight - 5}px;color:${this.ylabelColor}">
            <span class="title-num ${itemName}"></span>
            <span class="title" style='color:#6c7280'>${itemName}</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
    } else {
      html += `<div class="line" style="background:${this.baseColor};margin-top:-1px;"></div>
        <div class="title-box" style="height: ${this.gridHeight - 5}px;color:${this.ylabelColor}">
            <span class="title-num ${itemName}"></span>
            <span class="title" style='color:#6c7280'>${itemName}</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
    }
    $('#' + this.uuid + ' .table-y').html(html);
  }

  /**
   * 鼠标按下框选
   */
  public onBrush(e: any) {
    const canvasBox = this.el.nativeElement.querySelector('#' + this.uuid);
    const maskBox = this.el.nativeElement.querySelector('.mask-box');
    const brushBox = this.el.nativeElement.querySelector('.brush-box');
    const tootipBox = this.el.nativeElement.querySelector('.echarts-box div')?.nextSibling; // 将tips框隐藏,防止碍事
    const leftTitleWidth = $('#' + this.uuid + ' .table-y')[0].offsetWidth; // 左侧title宽度
    tootipBox.style.display = 'none';
    maskBox.style.display = 'none';
    this.brushOut.emit('click');
    brushBox.style.width = 0;
    if (e.which !== 1) { return; }   // 只有左键按下可框选
    const anchorDot = e.clientX; // 鼠标点下原点
    // 框选框距离canvans左边框的距离
    const diffX = e.clientX - canvasBox.getBoundingClientRect().left - this.option.grid[0].left - leftTitleWidth;
    // 点击距离框选右侧距离
    const diffXr = diffX - canvasBox.offsetWidth + this.option.grid[0].left + this.option.grid[0].right;
    if (diffX < 0 || diffXr > 0) { return; }
    let rightSite = 0; // 框选右侧位置
    let leftSite = 0; // 框选左侧位置
    brushBox.style.left = diffX + 'px';

    document.onmousemove = (event) => {
      tootipBox.style.display = 'none';
      maskBox.style.display = 'block';
      leftSite = diffX / maskBox.offsetWidth;
      brushBox.style.left = leftSite * 100 + '%';
      let mouseSite = event.clientX;
      const diffXlmove = event.clientX - canvasBox.getBoundingClientRect().left
        - this.option.grid[0].left - leftTitleWidth;
      const diffXrmove = event.clientX - canvasBox.getBoundingClientRect().left
        - canvasBox.offsetWidth + this.option.grid[0].right;
      if (diffXlmove < 0) {
        mouseSite = canvasBox.getBoundingClientRect().left + this.option.grid[0].left + leftTitleWidth;
      } else if (diffXrmove > 0) {
        mouseSite = canvasBox.getBoundingClientRect().left + maskBox.offsetWidth
          + this.option.grid[0].left + leftTitleWidth;
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
      const data = Object.assign(this.datas, { brushTime, item: this.key[0] });
      this.brushOut.emit(data);
    }
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

