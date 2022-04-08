import {
  Component, OnInit, Input, AfterViewInit, Output,
  EventEmitter, SecurityContext
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-table-catch',
  templateUrl: './table-catch.component.html',
  styleUrls: ['./table-catch.component.scss']
})
export class TableCatchComponent implements OnInit, AfterViewInit {
  @Input() datas: any;
  @Input() timeLine: any;
  @Output() public dataZoom = new EventEmitter<any>();
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 10;
  public gridHeight = 120;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public lineColorList = ['#037dff', '#00bfc9', '#41ba41', '#e88b00',
  '#a050e7', '#e72e90', '#8cd600', '#ff9b00', '#07a9ee', '#f05f26'];
  public filter = {};
  public time: any;
  public spec: any;
  public key: any;
  public die: any;
  public keyPer: any;
  public uuid: any;
  public GlobalColumInfo: any;
  public keyperf: any = [];
  public option: any = {
    color: this.lineColorList,
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
    series: []
  };
  public i18n: any;
  public typeTips: any = {};
  constructor(
    public Axios: AxiosService, public i18nService: I18nService,
    private domSanitizer: DomSanitizer,
    public leftShowService: LeftShowService,
  ) {
    this.i18n = this.i18nService.I18n();

    this.typeTips = {
      L1D: this.i18n.ddr.select.L1D,
      L1I: this.i18n.ddr.select.L1I,
      L2D: this.i18n.ddr.select.L2D,
      L2I: this.i18n.ddr.select.L2I,
      L2_TLB: this.i18n.ddr.select.L2_TLB,
      L2D_TLB: this.i18n.ddr.select.L2D_TLB,
      L2I_TLB: this.i18n.ddr.select.L2I_TLB,

      L3C_RD_IN: this.i18n.ddr.select.L3C_RD_IN,
      L3C_WR_IN: this.i18n.ddr.select.L3C_WR_IN,
      L3C_RD_OUT: this.i18n.ddr.select.L3C_RD_OUT,
      L3C_WR_OUT: this.i18n.ddr.select.L3C_WR_OUT,

      L3C_RD: this.i18n.ddr.select.L3C_RD,
      L3C_WR: this.i18n.ddr.select.L3C_WR,

      DDR_RD: this.i18n.ddr.select.DDR_RD,
      DDR_WR: this.i18n.ddr.select.DDR_WR,
    };
  }

  ngOnInit() {
    this.leftShowService.leftIfShow.subscribe(() => {   // 点击左侧echarts需要自适应
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
    this.spec = this.datas.spec.map((item: any) => item.id);
    this.key = this.datas.key;
    this.die = this.datas.die.map((item: any) => item.id);
    this.setData(this.timeLine);
    if (Object.prototype.hasOwnProperty.call(this.datas, 'key_per')) {
      this.keyPer = this.datas.key_per;
    }
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
        show: true,
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
      right: 20,
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
    let legends: any = [];
    this.die.forEach((die: any, dieIndex: any) => {
      this.spec.forEach((spec: any) => {
        legends.push(die + '-' + this.typeTips[spec]);
      });
    });
    if (this.datas.type === 'ddrwidth' && this.datas.hasDdrid) {
      legends = [];
      this.die.forEach((die: any, dieIndex: any) => {
        this.datas.ddrid.forEach((ddrid: any) => {
          this.spec.forEach((spec: any) => {
            legends.push(die + '-' + ddrid.id + '-' + this.typeTips[spec]);
          });
        });
      });
    }
    this.option.legend.data = legends;

    // 处理最大值和单位
    let tipItemWidth = 60;
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
        if (this.datas.data.values !== null) {
          Object.keys(this.datas.data.values).forEach(key2 => {
            if (this.spec.indexOf(key2) > -1) { columinfo[item].values = columinfo[item].values
              .concat(this.datas.data.values[key2][item]); }
          });
        }
      });
    }
    const keys = Object.keys(columinfo);
    for (const val of keys) {
      columinfo[val].max = Math.max.apply(null, columinfo[val].values);
      if (columinfo[val].max > 100) {
        columinfo[val].max *= 2;
      }
      if (val === 'commit') { columinfo[val].max *= 2; }
      if (this.datas.type === 'cpu') { columinfo[val].max *= 2; tipItemWidth = 100; }
      if (this.datas.type === 'cpuavg') { columinfo[val].max *= 2; }
      if (this.datas.type === 'pag') { columinfo[val].max *= 2; }
      if (this.datas.type === 'memswap') { columinfo[val].max *= 2; }
      if (this.datas.type === 'disk') { columinfo[val].max *= 2; }
      if (this.datas.type === 'netOk') { columinfo[val].max *= 2; }
      if (this.datas.type === 'netError') { columinfo[val].max *= 2; }
      columinfo[val].min = 0;
      columinfo[val].max = (value: any) => {
        return value.max * 1.5;
      };   // 暂时全部自动最大
    }


    if (this.spec.length === 0) {
      this.option.legend.show = false;
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
      if (this.datas.type === 'cpuavg') {
        columinfo[item].showMax = false;
        myMax = columinfo[item].max;
        columinfo[item].danwei = '';
      }
      if (this.datas.type === 'catchl1') {
        tipItemWidth = 130;
        columinfo[item].showMax = false;
        if (item === 'bandwith') { myMax = columinfo[item].max; columinfo[item].danwei = this.i18n.ddr.chart.bandwith; }
        if (item === 'hitrate') { myMax = 1; columinfo[item].danwei = this.i18n.ddr.chart.hitrate; }

      }
      if (this.datas.type === 'catchl2') {
        tipItemWidth = 155;
        columinfo[item].showMax = false;
        if (item === 'hitbandwith') {
          myMax = columinfo[item].max;
          columinfo[item].danwei = this.i18n.ddr.chart.hitbandwith;
        }
        if (item === 'bandwith') { myMax = columinfo[item].max; columinfo[item].danwei = this.i18n.ddr.chart.bandwith; }
        if (item === 'hitrate') { myMax = 1; columinfo[item].danwei = this.i18n.ddr.chart.hitrate; }

      }
      if (this.datas.type === 'ddrcount') {
        tipItemWidth = 140;
        columinfo[item].showMax = false;
        if (item === 'acessscount') {
          myMax = columinfo[item].max;
          columinfo[item].danwei = this.i18n.ddr.chart.acessscount;
        }
        if (item === 'localaccess') {
          myMax = columinfo[item].max;
          columinfo[item].danwei = this.i18n.ddr.chart.localaccess;
        }
        if (item === 'spandie') { myMax = columinfo[item].max; columinfo[item].danwei = this.i18n.ddr.chart.spandie; }
        if (item === 'spanchip') { myMax = columinfo[item].max; columinfo[item].danwei = this.i18n.ddr.chart.spanchip; }
        if (item === 'ddr_access_count') {
          myMax = columinfo[item].max;
          columinfo[item].danwei = this.i18n.ddr.chart.totaldie;
        }
      }
      if (this.datas.type === 'ddrwidth') {
        tipItemWidth = 220;
        columinfo[item].showMax = false;
        if (item === 'bandwith') { myMax = columinfo[item].max; columinfo[item].danwei = this.i18n.ddr.chart.bandwith; }

      }
      // 处理最大值和单位
      this.GlobalColumInfo = columinfo;
      this.option.yAxis.push(
        this.makeYAxis(index, {
          name: item,
          max: (value: any) => {
            if (value.max === 0 || value.max === -Infinity) {
              $('#' + this.uuid + ' .table-y ' + `.${item.replace('%', 'x').replace('/', 'x')}`).html('1.00');
            } else {
              $('#' + this.uuid + ' .table-y ' + `.${item.replace('%', 'x').replace('/', 'x')}`)
              .html(Util.fixThouSeparator((value.max * 1.5).toFixed(2)));
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
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
              formatter(value: any) {
                value = parseFloat(value);
                return value.toFixed(3) + 's';
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
              color: this.ylabelColor,
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21)),
              formatter(value: any) {
                value = parseFloat(value);
                return value.toFixed(3) + 's';
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

    if (this.datas.type === 'ddrwidth' && this.datas.hasDdrid) {
      this.key.forEach((item: any, index: any) => {

        if (this.spec.length > 0) {
          this.die.forEach((die: any, ideIndex: any) => {

            this.spec.forEach((item2: any, index2: any) => {
              this.datas.ddrid.forEach((ddrid: any) => {
                ddrid = ddrid.id;
                this.option.series.push(
                  {
                    name: die + '-' + ddrid + '-' + this.typeTips[item2],
                    type: 'line',
                    symbol: 'emptyCircle',
                    symbolSize: 4,
                    showAllSymbol: false,
                    xAxisIndex: index,
                    yAxisIndex: index,
                    lineStyle: {
                    },
                    data: this.datas.data.values[die][item2]['DDR' + ddrid][item]
                  }
                );
              });
            });
          });
        }
      });
    } else {
      this.key.forEach((item: any, index: any) => {

        if (this.spec.length > 0) {
          this.die.forEach((die: any, ideIndex: any) => {

            this.spec.forEach((item2: any, index2: any) => {

              this.option.series.push(
                {
                  name: die + '-' + this.typeTips[item2],
                  type: 'line',
                  symbol: 'emptyCircle',
                  symbolSize: 4,
                  showAllSymbol: false,
                  xAxisIndex: index,
                  yAxisIndex: index,
                  lineStyle: {
                  },
                  data: this.datas.data.values[die][item2][item]
                }
              );
            });
          });
        }
      });
    }

    this.option.yAxis.push(
      this.makeYAxis(this.key.length, {}),
    );
    this.option.dataZoom[1].xAxisIndex = this.key.map((item: any, index: number) => index);
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
          color: '#6C7280',
          width: 1.5
        }
      },
      formatter: (params: any): any => {

        if (params.length) {
          const table: any = {};

          this.key.forEach((item: any, index: any) => {
            table[item] = [];
            table[item] = params.filter((param: any) => {
              return (param.axisIndex === index);
            });
          });

          let itemNames = params.map((item: any) => item.seriesName);
          itemNames = [... new Set(itemNames)];
          // 高度200px滚动
          const heightScrollNum = this.datas.type === 'ddrwidth' ? 110 : 200;
          let html = `<div style="max-height:${heightScrollNum}px;overflow-y:auto" class='chart-tip'>`;
          if (this.spec.length >= 1) {
            if (this.datas.type === 'ddrwidth' && this.datas.hasDdrid) {
              // tips中有图标未展示数据,使用dataIndex获取origin数据对应时间的数据
              const dataIndex =
                table.bandwith[0].dataIndex || table.bandwith[0].dataIndex === 0
                  ? table.bandwith[0].dataIndex
                  : -1;
              this.keyperf = ['bandwith', 'bandwidth_theory_value', 'bandwidth_percent'];
              const keytitleList = [this.i18n.ddr_summury.brandwidth, this.i18n.ddr_summury.maxBandWidth,
                this.i18n.ddr_summury.maxBandWidthRateTipTitle];
              html += `<div style="display:flex;"><span style="font-size:12px;color:#616161;
              min-width:${
                tipItemWidth + 10
              }px;text-align:left;display:inline-block;
              margin:7px 10px 0 0 ;">${
                Number(table[Object.keys(table)[0]][0].axisValueLabel).toFixed(
                  3
                ) + 's'
              }</span>`;
              keytitleList.forEach((val) => {
                html += `<span style="font-size:12px;color:#616161;min-width:${
                  tipItemWidth + 10
                }px;
                text-align:left;display:inline-block;margin:7px 10px 0 0;max-width:240px;overflow-x:auto;">${
                  val
                }</span>`;
              });

              html += `</div>`;
              let colorIndex = -1;
              this.die.forEach((item: any) => {
                this.spec.forEach((item2: any) => {
                  this.datas.ddrid.forEach((ddrid: any): any => {
                    ddrid = ddrid.id;

                    colorIndex++;
                    if (colorIndex >= this.lineColorList.length) {
                      colorIndex = 0;
                    }
                    const item3 = item2 === 'DDR_RD' ? this.i18n.ddr.select.DDR_RD : this.i18n.ddr.select.DDR_WR;
                    const colName = item + '-' + ddrid + '-' + item3;
                    if (itemNames.indexOf(colName) === -1) { return false; }
                    if (this.datas.type === 'cpu') { }
                    html += `<div style="display:flex;"><span style="color:#282b33;
                    width:${tipItemWidth + 10}px;display:inline-block;margin-top:7px;padding-right:10px;">
                            <div style="display:inline-block;position:relative;top:1px;
                            margin-right:5px;width:13px;height:13px;border-radius:50%;
                            background:${this.lineColorList[colorIndex]}"></div>${colName}
                          </span>`;

                    const listData = this.datas.data.values[item][item2]['DDR' + ddrid];
                    this.keyperf.forEach((a: any) => {

                      if (a !== 'bandcount') {

                        if (dataIndex !== -1) {
                          listData[a]?.forEach((item4: any, valueIdx: any) => {
                            if (valueIdx === dataIndex) {
                              if (a === 'bandwidth_percent') {
                                let itemValue = Number(item4);
                                if (itemValue !== 0 && itemValue < 50) {
                                  itemValue += 1;
                                }
                                html += `<span style="color:#282b33;width:${tipItemWidth + 10}px;display:
                                inline-block;margin:7px 10px 0 0 ;z-index:-1">
                                <div class="pro-rate"  style="width:${itemValue}%; height:100%;
                            background-color: #D6E4FF;">${this.domSanitizer.sanitize(SecurityContext.HTML,
                               Util.fixThouSeparator(item4))}</div></span>`;
                              } else {

                                html += `<span style="color:#282b33;width:${tipItemWidth + 10}px;
                                display:inline-block;margin:7px 10px 0 0 ;z-index:-1">
                          ${this.domSanitizer.sanitize(SecurityContext.HTML, Util.fixThouSeparator(item4))}</span>`;
                              }
                            }
                          });
                        } else {
                          html += `<span style="color:#282b33;width:${tipItemWidth + 10}px;display:inline-block;
                          margin:7px 10px 0 0 ;z-index:-1">
                          --</span>`;
                        }
                      }
                    });

                    html += `</div>`;
                  });
                });
              });

            } else {
              if (this.datas.type === 'ddrcount') {
                html += `<div style="display:flex;"><span style="font-size:12px;color:#616161;
                min-width:${
                  tipItemWidth - 10
                }px;text-align:left;display:inline-block;
                margin:7px 10px 0 0 ;">${
                  Number(
                    table[Object.keys(table)[0]][0].axisValueLabel
                  ).toFixed(3) + 's'
                }</span>`;
                if (table !== null) {
                  Object.keys(table).forEach((a) => {
                    let itemName = a;
                    if (itemName === '%usr') {
                      itemName = '%user';
                    } // 特殊处理后端写错的

                    html += `<span style="font-size:12px;color:#616161;min-width:${
                      tipItemWidth - 10
                    }px;
                    text-align:left;display:inline-block;margin:7px 10px 0 0;">${
                      this.GlobalColumInfo[a].danwei
                    }</span>`;
                  });
                }

                html += `</div>`;
                let valueIndex1 = -1;
                let colorIndex = -1;
                this.die.forEach((item: any, index: any) => {
                  this.spec.forEach((item2: any, index2: any): any => {
                    valueIndex1++;

                    colorIndex++;
                    if (colorIndex >= this.lineColorList.length) {
                      colorIndex = 0;
                    }
                    const item3 = item2 === 'DDR_RD' ? this.i18n.ddr.select.DDR_RD : this.i18n.ddr.select.DDR_WR;
                    const colName = item + '-' + item3;
                    if (itemNames.indexOf(colName) === -1) { return false; }
                    if (this.datas.type === 'cpu') { }
                    html += `<div style="display:flex;"><span style="font-size:12px;color:#282b33;
                    width:${
                      tipItemWidth - 10
                    }px;display:inline-block;margin:7px 10px 0 0 ;">
                            <div style="display:inline-block;position:relative;top:1px;margin-right:5px;
                            width:13px;height:13px;border-radius:50%;background:${
                              this.lineColorList[colorIndex]
                            }"></div>${colName}</span>`;
                    const tableKeys = Object.keys(table);

                    keys.forEach((ele, perIdx) => {
                      let ddrCountValue = table[ele][valueIndex1] ? table[ele][valueIndex1].value : '--';
                      ddrCountValue === '' ? ddrCountValue = '--' : Util.fixThouSeparator(ddrCountValue);
                      if (ele !== 'acessscount') {
                        let per = 0;
                        per = this.datas.data.values[item][item2][this.keyPer[perIdx]]
                        ? this.datas.data.values[item][item2][this.keyPer[perIdx]][table[ele][0].dataIndex] : 0;
                        let perValue = Number(per);
                        if (perValue !== 0 && perValue < 50) {
                          perValue += 1;
                        }
                        html += `<span style="color:#282b33;width:${tipItemWidth - 10}px;display:inline-block;
                        margin:7px 10px 0 0 ;z-index:-1"><div class="pro-rate"  style="width:${perValue}%; height:100%;
                    background-color: #D6E4FF;">${
                      this.domSanitizer.sanitize(SecurityContext.HTML, ddrCountValue)
                    }(${per}%)</div></span>`;
                      } else {
                        html += `<span style="color:#282b33;width:${tipItemWidth - 10}px;display:inline-block;
                        margin:7px 10px 0 0 ;z-index:-1">
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, ddrCountValue)}</span>`;
                      }
                    });

                    html += `</div>`;
                  });
                });
              } else {
                // 缓存访问
                html += `<div style="display:flex;"><span style="font-size:12px;color:#616161;min-width:${
                  tipItemWidth - 10
                }px;
                text-align:left;display:inline-block;margin:7px 10px 0 0 ;">
                ${(Number(table[Object.keys(table)[0]][0].axisValueLabel)).toFixed(3) + 's'}</span>`;
                if (table !== null) {
                  Object.keys(table).forEach(a => {
                    let itemName = a;
                    if (itemName === '%usr') { itemName = '%user'; }   // 特殊处理后端写错的

                    html += `<span style="font-size:12px;color:#616161;min-width:${tipItemWidth - 10}px;text-align:left;
                    display:inline-block;margin:7px 10px 0 0;">${this.GlobalColumInfo[a].danwei}</span>`;
                  });
                }

                html += `</div>`;
                let valueIndex = -1;
                let colorIndex = -1;
                this.die.forEach((item: any, index: any) => {
                  this.datas.spec.forEach((item2: any, index2: any): any => {
                    valueIndex++;

                    colorIndex++;
                    if (colorIndex >= this.lineColorList.length) {
                      colorIndex = 0;
                    }
                    const item3 = item2 === 'DDR_RD' ? this.i18n.ddr.select.DDR_RD : this.i18n.ddr.select.DDR_WR;
                    const colName = item + '-' + item2.tips;
                    if (itemNames.indexOf(colName) === -1) { return false; }
                    if (this.datas.type === 'cpu') { }
                    html += `<div style="display:flex;"><span style="font-size:12px;color:#282b33;width:${
                      tipItemWidth - 10
                    }px;
                    display:inline-block;margin:7px 10px 0 0 ;">
                    <div style="display:inline-block;position:relative;top:1px;margin-right:5px;width:13px;height:13px;
                            border-radius:50%;background:${this.lineColorList[colorIndex]}"></div>${colName}</span>`;
                    const ks = Object.keys(table);
                    ks.forEach(ele => {
                      let keyValue = table[ele][valueIndex] ? table[ele][valueIndex].value : '--';
                      keyValue === '' ? keyValue = '--' : Util.fixThouSeparator(keyValue);
                      html += `<span style="color:#282b33;width:${tipItemWidth - 10}px;display:inline-block;
                      margin:7px 10px 0 0 ;z-index:-1">
                     ${this.domSanitizer.sanitize(SecurityContext.HTML, keyValue)}</span>`;
                    });
                    html += `</div>`;
                  });
                });
              }
            }
          }
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
      }
    };
    const height = this.key.length * this.gridHeight + this.baseTop * 2 + 65;
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
      if (index === 0) {
        html += `<div class="line" style="margin-top: ${this.baseTop + 20 - 1}px;background:${this.baseColor}"></div>
        <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
            <span class="title-num ${
              this.domSanitizer.sanitize(SecurityContext.HTML, item.replace('%', 'x').replace('/', 'x'))}"></span>
            <span class="title" style='color:#6c7280'>${this.GlobalColumInfo[item].danwei}</span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
      } else {
        html += `
        <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
            <span class="title-num ${
              this.domSanitizer.sanitize(SecurityContext.HTML, item.replace('%', 'x').replace('/', 'x'))}"></span>
            <span class="title" style='color:#6c7280'>${this.GlobalColumInfo[item].danwei}</span>
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
    return [...new Set(res)];
  }
}
