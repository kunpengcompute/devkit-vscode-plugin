
import { Component, OnInit, Input, AfterViewInit, Output,
  EventEmitter, ElementRef, SecurityContext, OnDestroy } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';
const hardUrl: any = require('../../../../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-table-chart',
  templateUrl: './table-chart.component.html',
  styleUrls: ['./table-chart.component.scss']
})
export class TableChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() datas: any;
  @Input() timeLine: any;
  @Input() ifDeatlis: boolean;
  @Output() public dataZoom = new EventEmitter<any>();
  @Output() public echartsInstOut = new EventEmitter<any>();
  @Output() public brushOut = new EventEmitter<any>();
  @Output() public viewDetails = new EventEmitter<any>();
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 20;
  public gridHeight = 80;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public lineColorList = ['#6c92fa', '#7adfa0', '#f6df66',
  '#fa8e5a', 'red', '#f3689a', '#a97af8', '#33b0a6', '#7eb05d'];
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
      selectedMode: true
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
      textStyle: {
        color: 'rgba(0,0,0,0)'
      }
    }, {
      type: 'inside'
    }],
    tooltip: {

    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      snap: true
    },
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
  };
  public leftSubscribe: any;
  public i18n: any;
  constructor(public Axios: AxiosService, public i18nService: I18nService, public leftShowService: LeftShowService,
              private el: ElementRef, private domsanitizer: DomSanitizer) {
    this.i18n = this.i18nService.I18n();

  }

  ngOnInit() {
    this.leftSubscribe = this.leftShowService.leftIfShow.subscribe(() => {   // 点击左侧echarts需要自适应
      setTimeout(() => {
        const width = $('#user-guide-scroll').width() * 0.9;
        this.echartsInstance.resize({ width });
        $('.title-box').width($('#user-guide-scroll').width() * 0.08);
      }, 200);
    });
    fromEvent(window, 'resize')
      .subscribe((event) => {
        let timer: any;
        const that = this;
        function debounce() {
          clearTimeout(timer);
          timer = setTimeout(() => {              // 300毫秒的防抖
            const width = $('#user-guide-scroll').width() * 0.9;
            that.echartsInstance.resize({ width });
            $('.title-box').width($('#user-guide-scroll').width() * 0.08);
          }, 300);
        }
        debounce();
      });
    this.uuid = this.Axios.generateConversationId(12);
  }
  ngAfterViewInit() {
    this.initTable();
  }
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

    setTimeout(() => {    // echarts 实例绑定在一块
      this.echartsInstOut.emit(this.echartsInstance);
    }, 100);
  }
  public upDateTimeLine(data: any) {
    this.option.dataZoom[0].start = data.start;
    this.option.dataZoom[0].end = data.end;
    this.echartsInstance.setOption({
      dataZoom: this.option.dataZoom
    });
  }
  public initTable() {
    this.time = this.datas.time;
    this.spec = this.datas.spec;
    this.key = this.datas.key;
    this.devArr = this.datas.devArr;
    this.setData(this.timeLine);
  }
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
        show: false,
        lineStyle: { color: this.baseColor },
        interval: this.time.length < 300 ? 0 : Math.floor((this.time.length / 200)),
      },
      axisPointer: {
        lineStyle: { color: 'transparent' }
      }
    };
    if (option) {
      Object.assign(option, opt);
    }
    return option;

  }

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

      min: 0,

      axisTick: { show: false },
      axisLine: { show: false },

      splitLine: { show: false },
      splitNumber: 1 // y轴刻度间隔
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;

  }

  public makeGrid(top: any, opt: any) {
    const options = {
      top: top + 20,
      height: this.gridHeight,
      left: 25,
      right: '2.5%',
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

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

          legends.push({ name: dev + '/' + spec.title, icon: 'rect', });
        }
      });
    });
    this.option.legend.data = legends;


    this.key.forEach((item: any, index: any) => {
      this.option.grid.push(this.makeGrid(this.baseTop + this.gridHeight * index, {}));

      this.option.yAxis.push(
        this.makeYAxis(index, {
          name: item.title,
          max: (value: any) => {
            if (value.max === 0 || value.max === -Infinity) {
              $('#' + this.uuid + ' .table-y ' + ` .${item.title}`).html('1.00');
            } else {
              $('#' + this.uuid + ' .table-y ' + ` .${item.title.replace('%', 'x').replace('/', 'x')}`)
              .html(Util.fixThouSeparator((value.max * 1.5).toFixed(2)) + item.unit);
            }
            return value.max * 1.5;
          }
        }),
      );
      if (index !== this.key.length - 1) {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: false,
              color: 'rgba(0,0,0,0)',                   // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
              formatter(value: any) {
                return value;
              }

            }, // 坐标轴刻度标签的相关设置
            axisPointer: {
              show: true,
              lineStyle: {
                color: '#6C7280',
                width: 1.5
              }
            }
          })
        );

      } else {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: true,
              color: 'rgba(0,0,0,0)',
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
              formatter(value: any) {
                return value;
              }

            }, // 坐标轴刻度标签的相关设置
            axisPointer: {
              show: true,
              lineStyle: {
                color: '#6C7280',
                width: 1.5
              }
            }
          })
        );

      }
    });
    this.option.grid.push(this.makeGrid(this.baseTop, {   // 多的一个grid
      show: true,
      height: 0,
      borderColor: this.baseColor,
      borderWidth: 1,
      z: 10,
    }));

    this.option.xAxis.push(
      this.makeXAxis(this.key.length, {
        position: 'top',

        axisPointer: {
          show: true,
          lineStyle: {
            color: '#6C7280',
            width: 1.5
          }
        }
      })
    );


    if (this.spec.length > 0) {// 设置series
      this.devArr.forEach((dev, ideIndex) => {
        this.key.forEach((item: any, index: any) => {
          let colorIndex1 = 0;
          if (this.lineColorList.length < ideIndex) { // 如果颜色不够用
            colorIndex1 = Math.floor((ideIndex) / this.lineColorList.length);
          } else {
            colorIndex1 = ideIndex;
          }
          this.spec.forEach((item2: any, index2: any) => {


            const seriesObj: any = {
              name: dev + '/' + item2.title,
              id: item2.title + item.title + ',' + item.unit,
              type: 'line',
              symbol: 'emptyCircle',
              symbolSize: 4,
              showAllSymbol: true,
              xAxisIndex: index,
              yAxisIndex: index,
              smooth: true,
              itemStyle: {
                normal: {
                  color: this.lineColorList[colorIndex1], // 折点颜色

                },
                color: this.lineColorList[colorIndex1]  // 折线颜色
              },
              data: this.datas.data[dev][item2.key][item.key]
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


    this.option.yAxis.push(
      this.makeYAxis(this.key.length, {}),
    );

    this.option.tooltip = {
      trigger: 'axis',
      position: (point: any) => {
        return [point[0], '10%'];
      },
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 0,
      hideDelay: 500,
      enterable: true,
      confine: true,
      padding: [0, 20, 10, 20],
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);z-index: 1003;',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#6C7280',
          width: 1.5
        }
      },
      transitionDuration: 1, // 移动过度时间
      textStyle: {
        color: '#222222',
        fontSize: 12,
      },
      formatter: (params: any) => {
        let titleList = [this.i18n.storageIO.diskio.top_delayr1, this.i18n.storageIO.diskio.top_delayw1];
        if (this.key.length > 1) {
          titleList = [this.i18n.storageIO.diskio.top_datar1, this.i18n.storageIO.diskio.top_dataw1,
          this.i18n.storageIO.diskio.top_thr1, this.i18n.storageIO.diskio.top_thw1];
        }
        let time = '';
        let html = `<div style="height: fit-content;padding:8px 0px;font-size:12px;color:#222222;" class='chart-tip'>`;
        params.forEach((item: any, index1: any) => {
          if (index1 === 0) {
            time = item.axisValue;
            html += `<div style="display:flex;"><span style="color:#161616;width:120px;margin-left:32px;">
            ${this.i18n.storageIO.ioapis.time}</span>
            <span>${this.domsanitizer.sanitize(SecurityContext.HTML, item.axisValue)}</span></div>`;
          }
          const ifRead = item.seriesName.indexOf('read') > -1 || item.seriesName.indexOf('读') > -1 ? true : false;
          html += `<div style="display:flex;line-height:25px;align-items:center;">`;
          if (ifRead) {
            html += `
                <span *ngIf="ifRead" style="display:block;
                margin-right:16px;height:3px;width:16px;background:${item.color}"></span>`;
          } else {
            html += `
              <span  style="display:block;margin-right:16px;">
              <svg width="16px" height="3px" viewBox="0 0 16 3"
              version="1.1" xmlns="${hardUrl.w3cUrl}" xmlns:xlink="${hardUrl.xlinkUrl}">
            <g id="storage-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
           <g id="disk-0" transform="translate(-1280.000000, -276.000000)" fill="${item.color}" fill-rule="nonzero">
              <g id="arr-2" transform="translate(1280.000000, 268.000000)">
              <path d="M0,11 L4,11 L4,8 L0,8 L0,11 Z M6,11 L10,11 L10,8 L6,8 L6,
              11 Z M12,11 L16,11 L16,8 L12,8 L12,11 Z" id="path-20"></path>
          </g></g></g></svg></span>`;
          }
          const label = item.seriesId.split(',');
          html += `
            <span style="width:120px;">${label[0]}</span>
            <span>${this.domsanitizer.sanitize(SecurityContext.HTML, item.data)}${label[1]}</span></div>`;

        });
        html += `<div style="width:100%;height:2px;background:#E1E6EE;margin:5px 0 8px"></div>`;
        html += `<div class="diskViewDetails" data-time="${time}" style="width:100%;height:2px;color:#0067FF;
        cursor:pointer;">${this.i18n.storageIO.summury.viewDetails}</div>`;

        // 设置查看详情点击事件
        setTimeout(() => {
          const viewDetailButton = document.querySelector('.diskViewDetails') as HTMLImageElement;
          viewDetailButton.onclick = () => {
            const time1 = viewDetailButton.dataset.time;
            this.viewDetails.emit(time1);
          };
        }, 500);
        // 修改鼠标经过tips框离开触发区域,tips不消失的问题
        const tipBoxContent = $('#' + this.uuid + ' .echart-content');
        const tipBox = $('#' + this.uuid + ' .chart-tip').parent();
        if (tipBox){
          tipBoxContent[0].onmouseleave = (e) => {
          tipBox.css('display', 'none');
        }; }
        return html;
      }
    };

    const height = this.key.length * this.gridHeight + this.baseTop * 2 + 15;
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

  public setLeft() {
    let html = ``;
    this.key.forEach((item: any, index: any) => {
      const itemName = item.title;
      if (index === 0) {
        html += `<div class="line" style="margin-top: ${this.baseTop + 20 - 1}px;background:${this.baseColor}"></div>
        <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
            <span class="title-num ${this.domsanitizer.sanitize(SecurityContext.HTML, itemName)}"></span>
            <span class="title" style='color:#6c7280'>${
              this.domsanitizer.sanitize(SecurityContext.HTML, itemName)
            }</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
      } else {
        html += `
        <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
            <span class="title-num ${this.domsanitizer.sanitize(SecurityContext.HTML, itemName)}"></span>
            <span class="title" style='color:#6c7280'>${
              this.domsanitizer.sanitize(SecurityContext.HTML, itemName)
            }</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
      }
    });
    $('#' + this.uuid + ' .table-y').html(html);
  }
  public radom(low: any, up: any) {
    return Math.floor(Math.random() * (up - low + 1)) + low;
  }

  public getIntersection(arr1: any, arr2: any) {
    const res: any = [];
    arr1.forEach((item: any) => {
      arr2.forEach((item2: any) => {
        if (item2.indexOf(item) > -1) { res.push(item); }
      });
    });
    return [... new Set(res)];
  }
  /**
   * 取消订阅
   */
  ngOnDestroy() {
    if (this.leftSubscribe) {
      this.leftSubscribe.unsubscribe();
    }
  }
}

