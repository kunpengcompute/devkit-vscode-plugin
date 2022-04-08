import { Component, OnInit, Input, AfterViewInit, Output,
  EventEmitter, SecurityContext, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-table-process',
  templateUrl: './table-process.component.html',
  styleUrls: ['./table-process.component.scss']
})
export class TableProcessComponent implements OnInit, AfterViewInit {
  @Input() datas: any;
  @Input() timeLine: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() titleWidth: number;
  @Output() public dataZoom = new EventEmitter<any>();
  public i18n: any;
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 32;
  public gridHeight = 72;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public lineColorList = ['#267DFF', '#07A9EE', '#41BA41', '#E88B00', '#A050E7', '#E72E90'];
  public filter = {};
  public time: any;
  public spec: any;
  public key: any;
  public uuid: any;
  public GlobalColumInfo: any;
  public lengthTipTimer: any;
  public option: any = {
    legend: {
      data: [],
      type: 'scroll',
      icon: 'rect',
      top: -1,
      algin: 'left',
      left: 50,
      width: '88%',
      show: true,
      selectedMode: true,
      itemWidth: 8,
      itemHeight: 8,
      pageButtonItemGap: 10,
      tooltip: {
        show: true,
        confine: true,
        formatter: (params: any, ticket: any, callback: any) => {
          const that = this;
          const lengthTip = () => {
            const queryParams = {
              'node-id': that.nodeid,
              'query-type': 'detail',
              'query-target': 'cmdline',
              'query-ptid': params.name.toLowerCase(),
            };

            that.Axios.axios.get(`/tasks/${encodeURIComponent(that.taskid)}/process-analysis/`, {
              params: queryParams,
              headers: {
                showLoading: false,
              }
            }).then((res: any) => {
              callback(
                ticket,
                `<div style="color: #222; max-width: 400px;padding-top:10px; max-height:200px; overflow-Y:auto">
              ${that.domSanitizer.sanitize(
                SecurityContext.HTML,
                res.data.cmd_line || that.i18n.process.noCmdline
              )}</div>`
              );
            }).catch((e: any) => { });
          };
          if (this.lengthTipTimer) {
            clearTimeout(this.lengthTipTimer);
          }
          this.lengthTipTimer = setTimeout(lengthTip, 200);
          return `<div style="color: #222;display:flex;
          align-items:center;margin-top:6px"><img src="./assets/img/loading.gif" alt=""
          style="height:16px; width: 16px;margin-top: 4px;margin-right: 10px;">
          ${this.i18n.process.obtainingTheCmdline}</div>`;
        },
      },
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
    grid: [
    ],
    xAxis: [
    ],
    yAxis: [
    ],
    series: [
    ]
  };
  constructor(public Axios: AxiosService,
              public leftShowService: LeftShowService,
              public i18nService: I18nService,
              private domSanitizer: DomSanitizer,
              private el: ElementRef) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.leftShowService.leftIfShow.subscribe(() => {   // 点击左侧echarts需要自适应

      setTimeout(() => {
        const width = $('#user-guide-scroll').width() * 0.9;
        this.echartsInstance?.resize({ width });
        $('.title-box').width($('#user-guide-scroll').width() * 0.08);
        this.setLegends();
        this.echartsInstance?.clear();
        this.echartsInstance?.setOption(this.option, true);
      }, 200);
    });
    fromEvent(window, 'resize')
      .subscribe(() => {
        let timer: any;
        const that = this;
        function debounce() {
          clearTimeout(timer);
          timer = setTimeout(() => {              // 300毫秒的防抖
            const width = $('#user-guide-scroll').width() * 0.9;
            that.echartsInstance.resize({ width });
            $('.title-box').width($('#user-guide-scroll').width() * 0.08);
            this.setLegends();
            this.echartsInstance.clear();
            this.echartsInstance.setOption(this.option, true);
          }, 300);
        }
        debounce();
      });
    this.uuid = this.Axios.generateConversationId(12);
  }
  ngAfterViewInit() {
    this.setLegends();
    this.initTable();
  }

  /**
   * 动态调整legend位置
   */
  public setLegends() {
    const tableY = this.el.nativeElement.querySelector('.table-y').offsetWidth + 25;
    const left = this.titleWidth - tableY;
    this.option.legend.left = left + 10;
    if (tableY <= 104) {
      this.option.legend.top = 0;
    }
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
    this.echartsInstance.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.dataZoom.emit({ start: params.batch[0].start, end: params.batch[0].end });
    });
  }
  public upDateTimeLine(data: any) {
    this.option.dataZoom[0].start = data.start;
    this.option.dataZoom[0].end = data.end;
    this.echartsInstance.setOption({
      dataZoom: this.option.dataZoom
    });
  }
  public initTable() {
    this.time = this.datas.data.time;
    this.spec = this.datas.spec;
    this.key = this.datas.key;
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
        interval: 'auto'

      }, // 坐标轴刻度标签的相关设置

      splitLine: {
        show: true,
        lineStyle: { color: this.baseColor },
        interval: 0
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

      splitLine: { show: true },
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
      right: '2.5%'
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
    this.option.dataZoom[0].top = this.key.length * this.gridHeight + this.baseTop + 60;
    if (this.datas.type === 'cpu') {
      this.option.legend.data = this.spec.map((item: any) => item);
    } else {
      this.option.legend.data = this.spec.map((item: any) => item);
    }
    // 处理最大值和单位
    let tipItemWidth = 60;
    // 以kb作单位的选项
    const kbList = ['kbmemused', 'kbmemfree', 'kbbuffers', 'kbcached', 'kbcommit', 'kbactive', 'kbinact', 'kbdirty'];
    const columinfo: any = {};
    if (this.spec.length === 0) {
      this.key.forEach((item: any) => {
        columinfo[item] = {};
        columinfo[item].values = [];
        columinfo[item].showMax = true;
        columinfo[item].values = this.datas.data.values[item];
      });
    } else if (this.spec.length > 0) {
      this.key.forEach((item: any) => {
        columinfo[item] = {};
        columinfo[item].values = [];
        columinfo[item].showMax = true;
        if (this.datas.data.values != null) {
          Object.keys(this.datas.data.values).forEach(key2 => {
            if (this.spec.indexOf(key2) > -1) { columinfo[item].values
              = columinfo[item].values.concat(this.datas.data.values[key2][item]); }
          });
        }
      });
    }
    const keys = Object.keys(columinfo);
    for (const val of keys) {
      columinfo[val].max = Math.max(columinfo[val].values);
      if (columinfo[val].max > 100) {
        columinfo[val].max *= 2;
      }
      if (val === 'commit') { columinfo[val].max *= 2; }
      if (this.datas.type === 'cpu') { columinfo[val].max *= 2; tipItemWidth = 100; }
      if (this.datas.type === 'context') { columinfo[val].max *= 2; tipItemWidth = 100; }
      if (this.datas.type === 'pag') { columinfo[val].max *= 2; }
      if (this.datas.type === 'mem') { columinfo[val].max *= 2; }
      if (this.datas.type === 'disk') { columinfo[val].max *= 2; }
      if (this.datas.type === 'netOk') { columinfo[val].max *= 2; }
      if (this.datas.type === 'netError') { columinfo[val].max *= 2; }
      columinfo[val].min = 0;
      columinfo[val].max = (value: any) => {
        return value.max * 1.5;
      };   // 暂时全部自动最大
    }

    let myMax = 100;

    this.key.forEach((item: any, index: any) => {
      this.option.grid.push(this.makeGrid(this.baseTop + this.gridHeight * index, {}));
      columinfo[item].danwei = '';
      if (this.datas.type === 'cpu') {
        columinfo[item].showMax = false;
        myMax = columinfo[item].max;
        columinfo[item].danwei = '';
      }
      if (this.datas.type === 'context') {
        columinfo[item].showMax = false;
        myMax = columinfo[item].max;
        columinfo[item].danwei = '';
      }
      if (this.datas.type.indexOf('Memory Usage') > -1) {
        tipItemWidth = 90;
        columinfo[item].showMax = false;
        if (kbList.indexOf(item) > -1) { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === '%memused') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'commit') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'kbavail') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
      }
      if (this.datas.type.indexOf('pag') > -1) {
        tipItemWidth = 100;
        columinfo[item].showMax = false;
        if (item === 'pgpgin/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pgpgout/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'fault/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'majflt/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pgfree/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pgscank/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pgscand/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pgsteal/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === '%vmeff') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
      }
      if (this.datas.type === 'mem') {
        tipItemWidth = 100;
        columinfo[item].showMax = false;
        myMax = columinfo[item].max;
        if (item === 'pswpin/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pswpout/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
      }
      if (this.datas.type === 'disk') {
        tipItemWidth = 170;
        columinfo[item].showMax = false;
        myMax = columinfo[item].max;
        if (item === 'tps') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'rd_sec/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'wr_sec/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'avgrq-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'avgqu-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'await') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'svctm') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === '%util') {
          myMax = 100;
          columinfo[item].max = 100;
          columinfo[item].danwei = '';
          columinfo[item].showMax = false;
        }
        if (item === 'rkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'wkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'aqu-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'areq-sz') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
      }
      if (this.datas.type === 'netOk') {
        tipItemWidth = 100;
        columinfo[item].showMax = false;
        if (item === 'rxpck/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'txpck/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'rxkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'txkB/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }


      }
      if (this.datas.type === 'netError') {
        tipItemWidth = 100;
        columinfo[item].showMax = false;
        if (item === 'rxerr/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'txerr/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'coll/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'rxdrop/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'txdrop/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'txcarr/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'rxfram/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'rxfifo/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'txfifo/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
      }
      // 处理最大值和单位
      this.GlobalColumInfo = columinfo;
      this.option.yAxis.push(
        this.makeYAxis(index, {
          name: item,
          max: (value: any) => {
            if (item === 'CPU') {
              $(
                '#' +
                  this.uuid +
                  ' .table-y ' +
                  `.${item
                    .replace('%', 'x')
                    .replace('/', 'x')
                    .replace('(', 'x')
                    .replace(')', 'x')}`
              ).html(Util.fixThouSeparator(value.max * 2));
              return value.max * 1.5;
            }
            if (value.max === 0 || value.max === -Infinity) {
              $('#' + this.uuid + ' .table-y ' + `.${item.replace('%', 'x').replace('/', 'x').
              replace('(', 'x').replace(')', 'x')}`).html('1.00');
            } else {
              $(
                '#' +
                  this.uuid +
                  ' .table-y ' +
                  `.${item
                    .replace('%', 'x')
                    .replace('/', 'x')
                    .replace('(', 'x')
                    .replace(')', 'x')}`
              ).html(Util.fixThouSeparator((value.max * 1.5).toFixed(2)));
            }

            return value.max * 1.5;
          }   // 暂时全部自动最大
        }),
      );
      if (index !== this.key.length - 1) {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: true,
              color: 'rgba(0,0,0,0)',                   // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
              interval: 'auto'

            }, // 坐标轴刻度标签的相关设置
            axisPointer: {
              show: true,
              lineStyle: {
                color: '#478cf1',
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
              color: this.ylabelColor,
              interval: 'auto'

            }, // 坐标轴刻度标签的相关设置
            axisPointer: {
              show: true,
              lineStyle: {
                color: '#478cf1',
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
            color: '#478cf1',
            width: 1.5
          }
        }
      })
    );

    this.key.forEach((item: any, index: any) => {
      if (this.spec.length > 0) {
        this.spec.forEach((item2: any, index2: any) => {
          let colorIndex = 0;
          if (this.lineColorList.length <= index2) {
            colorIndex = index2 % this.lineColorList.length;
          } else {
            colorIndex = index2;
          }
          this.option.series.push(
            {
              name: item2,
              type: 'line',
              symbol: 'emptyCircle',
              symbolSize: 4,
              showAllSymbol: false,
              xAxisIndex: index,
              yAxisIndex: index,
              lineStyle: {
                width: 2,
              },
              itemStyle: {
                normal: {
                  color: this.lineColorList[colorIndex]
                }
              },
              emphasis: {
                lineStyle: {
                    width: 2,
                }
              },
              data: this.datas.data.values[item2][item]
            }
          );
        });
      } else {
        let colorIndex = 0;
        if (this.lineColorList.length < index) {
          colorIndex = Math.floor(index / this.lineColorList.length);
        } else {
          colorIndex = index;
        }
        this.option.series.push(
          {
            name: item,
            type: 'line',
            symbol: 'emptyCircle',
            symbolSize: 4,
            showAllSymbol: false,
            xAxisIndex: index,
            yAxisIndex: index,
            lineStyle: {
              width: 2,
            },
            itemStyle: {
              normal: {
                color: this.lineColorList[colorIndex]
              }
            },
            emphasis: {
              lineStyle: {
                  width: 2,
              }
            },
            data: this.datas.data.values[item]
          }
        );
      }
    });

    this.option.yAxis.push(
      this.makeYAxis(this.key.length, {}),
    );
    const xAxisIndexArr: number[] = [];
    this.key.map((item: any, index: number) => {
      xAxisIndexArr.push(index);
    });
    this.option.dataZoom[1].xAxisIndex = xAxisIndexArr;
    let contentBoxHeight = getComputedStyle(document.querySelector('#' + this.uuid)).getPropertyValue('height');
    if (!this.echartsInstance) {
      contentBoxHeight = '200px';
    }
    this.option.tooltip = {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 0,
      hideDelay: 500,
      enterable: true,
      confine: true,
      padding: [0, 20, 10, 20],
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#478cf1',
          width: 1.5
        }
      },
      formatter: (params: any): any => {
        if (params.length) {
          const time = params[0].axisValue;
          const table: any = {};
          this.key.forEach((item: any, index: any) => {
            table[item] = [];
            table[item] = params.filter((param: any) => {
              return (param.axisIndex === index);
            });
          });
          let spec = params.map((item: any) => item.seriesName);
          spec = [... new Set(spec)];
          let html = `<div class='chart-tip'>`;
          if (this.spec.length >= 1) {
            html += `<div>
            <span style="color:#616161;text-align:left;width:
            ${this.domSanitizer.sanitize(
              SecurityContext.HTML,
              tipItemWidth
            )}px;display:inline-block;margin-top:7px">${time}</span>`;
            if (table != null) {
              Object.keys(table).forEach(a => {
                let itemName = a;
                if (itemName === '%usr') { itemName = '%user'; }   // 特殊处理后端写错的
                if (itemName === 'CPU') { itemName = 'CPU ID'; }   // 页面展示为'CPU ID',纵坐标展示,key值使用依旧为'CPU'
                html += `
                    <span style="color:#282b33;width:${
                      tipItemWidth}px;text-align:left;display:inline-block;margin-top:7px;">
                      ${this.domSanitizer.sanitize(SecurityContext.HTML, itemName)}${this.GlobalColumInfo[a].danwei}
                    </span> `;
              });
            }
            html += `</div><div class="infoLists">`;
            spec.forEach((item: any, index: any) => {
              let colorIndex = 0;
              if (this.lineColorList.length <= index) {
                colorIndex = index % this.lineColorList.length;
              } else {
                colorIndex = index;
              }
              const colName = item;
              html += `<div style="padding-bottom: 7px">`;
              html += `<span style="color:#282b33;width:${tipItemWidth}px;display:inline-block;">
                          <div style="display:inline-block;position:relative;top:1px;
                          margin-right:5px;width:8px;height:8px;background:${this.lineColorList[colorIndex]}"></div>
                          ${this.domSanitizer.sanitize(SecurityContext.HTML, colName)}
                        </span>`;

              if (table != null) {
                Object.keys(table).forEach(a => {
                  let value;
                  if (table[a][index].value !== 'NULL' && table[a][index].value !== null) {
                    value = Util.fixThouSeparator(table[a][index].value);
                  } else {
                    value = '--';
                  }
                  html += `
                    <span style="color:#282b33;width:${tipItemWidth}px;display:inline-block;z-index:-1">
                      ${this.domSanitizer.sanitize(SecurityContext.HTML, value)}
                    </span>
                  `;
                });
              }
              html += `</div>`;
            });
            html += `</div>`;
          } else {
            html += `<span style="color:#282b33;text-align:right;width:${
              tipItemWidth + 20}px;display:inline-block;margin-top:7px;">
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, this.datas.title)}
                </span>`;
          }

          html += '</div>';
          // 修改鼠标经过tips框离开触发区域,tips不消失的问题
          const tipBoxContent = $('#' + this.uuid + ' .echart-content');
          const tipBox = $('#' + this.uuid + ' .chart-tip').parent();
          if (tipBox) {
            tipBoxContent[0].onmouseleave = (e) => {
              tipBox.css('display', 'none');
            };
          }
          return html;
        }
      },
      position(point: any, params: any, dom: any, rect: any, size: any): any {
        // 解决tooltip legend位置不正确的问题
        if (!Array.isArray(params) && params.componentType === 'legend') {
          const top = point[1] + 20;
          let right = size.viewSize[0] - (point[0] + size.contentSize[0] / 2);

          if (right < 0) {
            right = 0;
          }

          // 解决设置最大宽度且文字自动换行时，echarts计算宽度错误的问题【不足400px就开始换行】
          if (size.contentSize[0] >= 440) {
            dom.style.width = '400px';
            dom.style.whiteSpace = 'normal';
          }

          return { top, right };
        }
      },
    };
    const height = this.key.length * this.gridHeight + this.baseTop * 2 + 25;
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
      let itemName = item;
      if (itemName === '%usr') { itemName = '%user'; }   // 特殊处理后端写错的
      if (itemName === 'CPU') { itemName = 'CPU ID'; }   // 页面展示'CPU ID',纵坐标展示,key值使用依旧为'CPU'
      if (index === 0) {
        html += `<div class="line" style="margin-top: ${
          this.domSanitizer.sanitize(SecurityContext.HTML, this.baseTop + 20 - 1)}px;
        background:${this.domSanitizer.sanitize(SecurityContext.HTML, this.baseColor)}"></div>
        <div class="title-box" style="height: ${
          this.domSanitizer.sanitize(SecurityContext.HTML, this.gridHeight - 2 * 2)}px;
        color:${this.domSanitizer.sanitize(SecurityContext.HTML, this.ylabelColor)}">
            <span class="title-num  ${this.domSanitizer.sanitize(
              SecurityContext.HTML, item.replace('%', 'x').replace('/', 'x').
            replace('(', 'x').replace(')', 'x'))}"></span>
            <span class="title" style='color:#6c7280'>${this.domSanitizer.sanitize(SecurityContext.HTML, itemName)}
            ${this.domSanitizer.sanitize(SecurityContext.HTML, this.GlobalColumInfo[item].danwei)}</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${
          this.domSanitizer.sanitize(SecurityContext.HTML, this.baseColor)}"></div>`;
      } else {
        html += `
        <div class="title-box" style="height: ${
          this.domSanitizer.sanitize(SecurityContext.HTML, this.gridHeight - 2 * 2)}px;
        color:${this.domSanitizer.sanitize(SecurityContext.HTML, this.ylabelColor)}">
            <span class="title-num  ${this.domSanitizer.sanitize(SecurityContext.HTML, item.replace('%', 'x')
            .replace('/', 'x').replace('(', 'x').replace(')', 'x'))}"></span>
            <span class="title" style='color:#6c7280'>${this.domSanitizer.sanitize(SecurityContext.HTML, itemName)}
            ${this.domSanitizer.sanitize(SecurityContext.HTML, this.GlobalColumInfo[item].danwei)}</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${
          this.domSanitizer.sanitize(SecurityContext.HTML, this.baseColor)}"></div>`;
      }
    });
    $('#' + this.uuid + ' .table-y').html(html);
  }

}
