
import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef,
   Output, EventEmitter, SecurityContext } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TiTipRef, TiTipService } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { fromEvent } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import * as Util from 'projects/sys/src-web/app/util';
import { graphic } from 'echarts';

const enum SERIES_THEME {
  Fill = 1,
  Linear = 2
}
@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit, AfterViewInit {
  private tipInstance: TiTipRef; // tip组件实例
  private tipShowState = false; // tip显示状态标志位
  @Input() datas: any;
  @Input() timeLine: any;
  @Input() isHave: string;
  @Input() isMe: string;
  @Output() public dataZoom = new EventEmitter<any>();
  @Output() public echartsInstOut = new EventEmitter<any>();
  @Output() public loading = new EventEmitter<any>();
  public suggest = '';
  public i18n: any;
  public timer: any; // 延时器
  public yMax = 0;
  public isMore1 = false;
  public isMore2 = false;
  public echartsInstance: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 20;
  public gridHeight = 160;
  public baseColor = '#e6ebf5';
  public ylabelColor = '#999';
  public titleHeight = 78;  // 组与组之间的距离
  public lineColorList = ['#6c92fa', '#7adfa0', '#f6df66', '#fa8e5a',
  '#f45c5e', '#f3689a', '#a97af8', '#33b0a6', '#7eb05d'];
  public filter = {};
  public time: any;
  public spec: any;
  public key: any;
  public uuid: any;
  public GlobalColumInfo: any;
  public initLock = false;
  public option: any = {
    title: [],
    legend: [],
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
    grid: [

    ],
    xAxis: [

    ],
    yAxis: [

    ],
    series: [
    ]
  };
  public language = 'zh';
  public showSwap = false; // 控制dom显隐 防止报错
  public scrollDataIndex = 0;
  constructor(
    public Axios: AxiosService,
    public changeDetectorRef: ChangeDetectorRef,
    private tipService: TiTipService,
    public leftShowService: LeftShowService,
    public i18nService: I18nService,
    private domsanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.leftShowService.leftIfShow.subscribe(() => {   // 点击左侧echarts需要自适应
      setTimeout(() => {
        const width = $('#user-guide-scroll').width() - 10;
        this.echartsInstance.resize({ width });
      }, 200);
    });
    this.leftShowService.timelineUPData.subscribe((e) => {
      this.upDateTimeLine(e);
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
    if (this.isHave === 'swap') {
      if (this.datas.data.values['pswpin/s']) {
        const arr1 = this.datas.data.values['pswpin/s'];
        for (const item of arr1) {
          if (item > 0) {
            this.isMore1 = true;
          }
        }
      }
      if (this.datas.data.values['pswpout/s']) {
        const arr2 = this.datas.data.values['pswpout/s'];
        for (const item of arr2) {
          if (item > 0) {
            this.isMore2 = true;
          }
        }
      }
      if (this.isMore1 || this.isMore2) {
        if (sessionStorage.getItem('language') === 'zh-cn') {
          this.suggest = this.datas.suggestion.suggest_chs;
          this.language = 'zh';
        } else {
          this.language = 'en';
          this.suggest = this.datas.suggestion.suggest_en;
        }
      }
      // swap 在 ngOnInit 初始化
      this.time = this.datas.data.time;
      this.spec = this.datas.spec.map((item: any) => item.id);
      this.key = this.datas.key.map((item: any) => item.id);
      this.setData(this.timeLine);
    }
  }
  ngAfterViewInit() {
    // 区分 swap 和其他 如果是 swap 不在 ngAfterViewInit 初始化
    this.initTable('unswap');
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
        if (isSelected && key !== this.i18n.sys.averValue) {
          showLegendList.push(key);
        }
      }
      this.rebuildOption(params, showLegendList);
    });
    this.echartsInstance.on('finished', (params: any) => {
      if (!this.initLock) {
        this.initLock = true;
        this.loading.emit(true);
      }

    });
  }




  private rebuildOption(params: any, list: any[]) {
    this.echartsInstance.group = '';    // 解除 echarts
    const lineNum: any = [];
    const option = this.tableData;
    let existCpu: string | boolean = false;
    option.legend[0].selected = params.selected;
    option.legend[0].scrollDataIndex = this.scrollDataIndex;
    option.series.forEach((series: any) => {
      if (list.indexOf(series.name) >= 0) {
        if (lineNum.indexOf(series.id) === -1) {
          lineNum.push(series.id);
          if (series.id.indexOf('%cpu') !== -1){
            existCpu = 'cpu'; // 判断是否是 cpu   cpu 需要做特殊处理
          } else if (series.id.indexOf('Power') !== -1 || series.id.indexOf('功率') !== -1) {
            existCpu = 'power'; // 判断是否是 功率 需要做特殊处理
          }
        }
      }
    });

    option.series.forEach((series: any) => {
      if (list.indexOf(series.name) >= 0) {
        if (existCpu !== 'cpu') {      // 不是 cpu
          if (lineNum.length === 2 && existCpu === 'power'){// 功率指标没有渐变, 只显示一层蓝色
            if (series.name !== '平均值,0' && series.name !== 'Average,0'){
             series.areaStyle = {
              color: new graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: this.lineColorList[0]
              }, {
                offset: 1,
                color: this.lineColorList[0]
              }])
            };
            }else{
              series.areaStyle = {
                opacity: 0,
              };
            }
          }else if (lineNum.length === 1 && series.name !== '平均值,0' && series.name !== 'Average,0') {    // 一条线 背景不渐变
            series.areaStyle = {
              color: new graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: series.itemStyle.normal.color
              }, {
                offset: 1,
                color: series.itemStyle.normal.color
              }])
            };
          } else if (1 < lineNum.length && lineNum.length < 3 && existCpu !== 'power') {   // 两条线 背景为渐变
            series.areaStyle = {
              color: new graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: series.itemStyle.normal.color
              }, {
                offset: 1,
                color: '#fff'
              }])
            };
          } else if (series.areaStyle) {   // 三条线 没有并景色
            delete series.areaStyle;
          }
        } else {        // 是cpu的时候  平均值不做任何处理
          if (lineNum.length === 1 && series.name !== '平均值,0' && series.name !== 'Average,0') {    // 一条线 背景不渐变
            series.areaStyle = {
              color: new graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: series.itemStyle.normal.color
              }, {
                offset: 1,
                color: series.itemStyle.normal.color
              }])
            };
          } else if (1 < lineNum.length && lineNum.length < 4) {   // 两条线 背景为渐变
            if (series.name !== '平均值,0' && series.name !== 'Average,0') {
              series.areaStyle = {
                color: new graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: series.itemStyle.normal.color
                }, {
                  offset: 1,
                  color: '#fff'
                }])
              };
            } else {
              delete series.areaStyle;
            }
          } else if (series.areaStyle) {   // 三条线 没有并景色
            delete series.areaStyle;
          }
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



  private hex2rgba(color: any, opacity: any) {
    color = color.substring(1);
    color = color.toLowerCase();
    const b = [];
    for (let x = 0; x < 3; x++) {
      b[0] = color.substr(x * 2, 2);
      b[3] = '0123456789abcdef';
      b[1] = b[0].substr(0, 1);
      b[2] = b[0].substr(1, 1);
      b[20 + x] = b[3].indexOf(b[1]) * 16 + b[3].indexOf(b[2]);
    }
    return 'rgba(' + b[20] + ',' + b[21] + ',' + b[22] + ',' + opacity + ')';
  }



  public upDateTimeLine(data: any) {
    this.option.dataZoom[0].start = (data.start).toFixed(2);
    this.option.dataZoom[0].end = (data.end).toFixed(2);
    this.echartsInstance.setOption({
      dataZoom: this.option.dataZoom
    });
  }
  public initTable(str = '') {
    this.scrollDataIndex = 0;
    if (str === 'unswap' && this.isHave !== 'swap') {
      this.time = this.datas.data.time;
      this.spec = this.datas.spec.map((item: any) => item.id);
      this.key = this.datas.key.map((item: any) => item.id);
      this.setData(this.timeLine);
    }
    // swap 类型单独处理 mem-detail 调用 initTable 时传参 this.swap.initTable('swap');
    if (str === 'swap' || !str) {
      this.time = this.datas.data.time;
      this.spec = this.datas.spec.map((item: any) => item.id);
      this.key = this.datas.key.map((item: any) => item.id);
      this.setData(this.timeLine);
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
      axisTick: { show: true }, // 坐标轴刻度相关设置
      axisLabel: {
        show: false,
        interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))

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
      show: true,
      gridIndex,
      nameLocation: 'end',
      nameTextStyle: 'left',
      nameGap: 30,
      nameRotate: 0,
      offset: 0,
      min: 0,
      max: 'dataMax',
      splitNumber: 2,  // 分成三段
      axisTick: { show: false },
      axisLine: { show: false }, // y轴是否展示
      axisLabel: { show: true, color: '#9ea4b3' }, // y轴刻度
      splitLine: {
        show: true,
        lineStyle: { color: '#d4d9e6', type: 'dashed' }
      }, // 刻度对应的线
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
      left: 85,
      right: '2.5%'
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  public makeTitle(text: any, top: any) {
    const options = {
      text,
      top,
      left: -5,
      textStyle: {
        color: '#252c3c',
        height: 14,
        fontSize: 14,
        lineHeight: 14,
        fontWeight: 'normal',
        fontFamily: 'FZLTXIHJW--GB1-0'
      }

    };
    return options;
  }

  public makeLegend(data: any, top: any) {
    const option = {
      data,
      type: 'scroll',
      icon: 'rect',
      itemWidth: 8,
      itemHeight: 8,
      top,
      algin: 'left',
      right: 50,
      width: '35%',
      height: 12,
      textStyle: {
        color: '#282b33',
        fontSize: 12,
        lineHeight: 12,
        fontWeight: 'normal',
        fontFamily: 'FZLTXIHJW--GB1-0'
      },
      show: true,
      selectedMode: true,
      formatter(name: any) {
        const datas = name.split(',')[0];
        return datas;
      }
    };
    return option;
  }

  public setData(timeData: any) {
    this.option.series = [];
    this.option.grid = [];
    this.option.xAxis = [];
    this.option.yAxis = [];              // 情空数据
    this.option.title = [];              // 清空title
    this.option.legend = [];              // 清空图例
    this.option.dataZoom[0].start = timeData.start;
    this.option.dataZoom[0].end = timeData.end;
    this.option.dataZoom[0].xAxisIndex = this.key.map((item: any, index: any) => index);
    this.option.dataZoom[0].top = this.key.length * this.gridHeight + this.baseTop + 60;
    // 处理最大值和单位
    let tipItemWidth = 60;
    const kbList = ['kbmemused', 'kbmemfree', 'kbbuffers', 'kbcached',
    'kbcommit', 'kbactive', 'kbinact', 'kbdirty'];   // 以kb作单位的选项
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
            if (this.spec.indexOf(key2) > -1) {
              columinfo[item].values = columinfo[item].values.concat(this.datas.data.values[key2][item]);
            }
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
      if (this.datas.type === 'cpu') { columinfo[val].max *= 2; }
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
    let myMax = 100;

    this.key.forEach((item: any, index: any) => {
      this.option.grid.push(this.makeGrid(this.baseTop + (this.gridHeight + this.titleHeight) * index, {}));
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
      if (this.datas.type === 'memswap') {
        tipItemWidth = 100;
        columinfo[item].showMax = false;
        if (item === 'pswpin/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
        if (item === 'pswpout/s') { myMax = columinfo[item].max; columinfo[item].danwei = ''; }
      }
      if (this.datas.type === 'disk') {
        tipItemWidth = 100;
        columinfo[item].showMax = false;
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

      this.setLeft();
      this.option.title.push(this.makeTitle(item, (this.gridHeight + this.titleHeight) * index));
      this.option.yAxis.push(
        this.makeYAxis(index, {
        }),
      );
      if (index !== this.key.length - 1) {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: true,
              color: this.ylabelColor,                   // 为了symbol 使用这里的间隔策略，所以显示标签但是设置为透明
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))

            }, // 坐标轴刻度标签的相关设置
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
          })
        );

      } else {
        this.option.xAxis.push(
          this.makeXAxis(index, {
            axisLabel: {
              show: true,
              color: this.ylabelColor,
              interval: this.time.length < 21 ? 0 : Math.floor((this.time.length / 21))

            }, // 坐标轴刻度标签的相关设置
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
          })
        );

      }
    });
    this.key.forEach((item: any, index: any) => {
      if (this.spec.length > 0) {
        const legend: any = [];  // 图例

        this.spec.forEach((item2: any, index2: any) => {
          let colorIndex = 0;
          colorIndex = index2 - Math.floor(index2 / this.lineColorList.length) * this.lineColorList.length;
          if (this.isHave === 'cpu' || this.isHave === 'consumption') {
            if (legend.indexOf(this.i18n.sys.averValue + ',' + index) === -1) {
              legend.push(this.i18n.sys.averValue + ',' + index);
            }
            const data: any = {
              name: this.i18n.sys.averValue + ',' + index,
              data: this.datas.data.values.all[item],
              symbol: 'emptyCircle',
              symbolSize: 4,
              xAxisIndex: index,
              yAxisIndex: index,
              type: 'line',
              lineStyle: {
                color: '#9Ea4b3',
                type: 'dashed',
                width: 2,
              },
              itemStyle: {
                normal: {
                  color: '#9Ea4b3'
                },
              },
              emphasis: {
                lineStyle: {
                    width: 2,
                }
              },
            };
            this.option.series.push(data);
          }
          legend.push(this.datas.type === 'cpu' ? item2 + '-CPU' + ',' + index : item2 + ',' + index);
          const seriesData: any = {
            name: this.datas.type === 'cpu' ? item2 + '-CPU' + ',' + index : item2 + ',' + index,
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
          };
          if (this.spec.length < 3) {
            seriesData.areaStyle = {
              color: new graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: this.lineColorList[colorIndex]
              }, {
                offset: 1,
                color: this.spec.length === 1 && this.isHave !== 'cpu' ? this.lineColorList[colorIndex] : '#fff'
              }])
            };
          }
          this.option.series.push(seriesData);
        });
        this.option.legend.push(this.makeLegend(legend, (this.gridHeight + this.titleHeight) * index));
      } else {
        let colorIndex = 0;
        if (this.lineColorList.length < index) {
          colorIndex = Math.floor(index / this.lineColorList.length);
        } else {
          colorIndex = index;
        }
        const legend = [];  // 图例
        legend.push(this.datas.type === 'cpu' ? item + '-CPU' + ',' + index : item + ',' + index);
        this.option.legend.push(this.makeLegend(legend, (this.gridHeight + this.titleHeight) * index));
        this.option.series.push(
          {
            name: item + ',' + index,
            type: 'line',
            symbol: 'emptyCircle',
            symbolSize: 4,
            showAllSymbol: false,
            areaStyle: { color: this.lineColorList[colorIndex] },
            xAxisIndex: index,
            yAxisIndex: index,
            lineStyle: {
              width: 2,
            },
            itemStyle: {
              normal: {
                color: this.lineColorList[colorIndex], // 折线点的颜色
                lineStyle: { color: this.lineColorList[colorIndex] }// 折线的颜色
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
    // 测拉框的层级为1000
    this.option.tooltip = {
      trigger: 'axis',
      borderColor: 'rgba(50,50,50,0)',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 0,
      enterable: true,
      confine: true,
      padding: [12, 16, 0, 18],
      triggerOn: 'mousemove',
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); z-index: 999',
      axisPointer: {
        show: false,
        type: 'line',
        lineStyle: {
          color: '#6C7280',
          width: 1.5
        }
      },
      formatter: (params: any): any => {
        if (params.length) {
          const nameArr: any = [];
          const dataArr: any[] = [];
          params.forEach((item: any, index: any) => {
            if (nameArr.indexOf(item.seriesName) === -1) {
              nameArr.push(item.seriesName);
              dataArr.push(item);
            }
          });
          let html = ` <div style="max-height:200px;overflow-y:auto;padding-right:5px" class='chart-tip'>`;
          dataArr.forEach((param, index) => {
            if (index === 0) {
              html += `<p style="color:#282b33;font-size:12px; line-height: 12px;font-family: FZLTZHJW--GB1-0;
              margin-bottom:12px">${this.domsanitizer.sanitize(SecurityContext.HTML, param.axisValue)}</p>`;
            }
            html += `
            <div style="color:#282b33;font-size:12px; line-height: 12px;font-family: FZLTZHJW--GB1-0;margin-bottom:10px;
            display:flex;justify-content: space-between;">
              <div style="display:flex;align-items: center;min-width:110px">
                <span style="display:block;margin-right:8px;height:8px;width:8px;background:${param.color}"></span>
                <p> ${this.domsanitizer.sanitize(SecurityContext.HTML, param.seriesName.split(',')[0])}:</p>
              </div>
              <p> ${this.domsanitizer.sanitize(SecurityContext.HTML, Util.fixThouSeparator(param.data))}</p>
            </div>
            `;
          });
          html += `</div>`;
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
    const height = this.key.length * (this.gridHeight + this.titleHeight);
    // 第一次设置 height 时不生效 这里使用 setTimeout
    if (this.isHave === 'swap') {
      setTimeout(() => {
        $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
      }, 0);
    } else {
      $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
    }

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

  public setLeft() {
    // swap return， html 在 table-component.html 中编写
    if (this.isHave === 'swap') {
      this.showSwap = true;
      return;
    }
    const that = this;
    let html = ``;
    this.key.forEach((item: any, index: any) => {
      if (index === 0) {
        html += `<div class="line" style="margin-top: ${this.baseTop + 20 - 1}px;background:${this.baseColor}"></div>
        <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
            <span class="title-num  ${this.domsanitizer.sanitize(SecurityContext.HTML,
               item.replace('%', 'x').replace('/', 'x').replace('(', 'x').replace(')', 'x'))}"></span>
            <span class="title" style='color:#6c7280'>${item}${this.GlobalColumInfo[item].danwei}
            <img src="./assets/img/rocket.svg" alt="" class="rocketImg2" [tiTip]="tipContent"
            style="margin-left:8px;display:${this.isHave === 'swap' ? (item === 'pswpin/s' ?
            (this.isMore1 ? 'block' : 'none') : (this.isMore2 ? 'block' : 'none')) : 'none'}" /></span>
            <span class="title-num">0</span>

        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
      } else {
        html += `
        <div class="title-box" style="height: ${this.gridHeight - 2 * 2}px;color:${this.ylabelColor}">
            <span class="title-num  ${this.domsanitizer.sanitize(SecurityContext.HTML,
               item.replace('%', 'x').replace('/', 'x').replace('(', 'x').replace(')', 'x'))}"></span>
            <span class="title" style='color:#6c7280'>${this.domsanitizer.sanitize(SecurityContext.HTML,
               item)}${this.domsanitizer.sanitize(SecurityContext.HTML, this.GlobalColumInfo[item].danwei)}
            <img src="./assets/img/rocket.svg" alt="" class="rocketImg2" [tiTip]="tipContent"
            style="margin-left:8px;display:${this.isHave === 'swap' ? (item === 'pswpin/s' ?
            (this.isMore1 ? 'block' : 'none') : (this.isMore2 ? 'block' : 'none')) : 'none'}" /></span>
            <span class="title-num">0</span>
        </div>
        <div class="line" style="margin-top: 2px;background:${this.baseColor}"></div>`;
      }
    });
    $('#' + this.uuid + ' .table-y').html(html);
    $('#' + this.uuid + ' .table-y').on('mouseenter', '.rocketImg2', function($event) {
      clearInterval(this.timer);
      if (that.tipInstance) {
        that.tipInstance.hide();
      }
      this.timer = setTimeout(() => {
        that.tipInstance = null;
        // 生成tip实例：通过调用tipService的create方法生成
        that.tipInstance = that.tipService.create($event.target, {
          position: 'right',
          maxWidth: '420px'
        });
        that.tipInstance.show(`${that.i18n.sys.baseValue}：${
          that.datas.suggestion.base_value} \n${that.i18n.sys.sug}：\n${that.suggest}`);
      }, 0);
    });
    $('#' + this.uuid + ' .table-y').on('mouseleave', '.rocketImg2', () => {
      setTimeout(() => {
        that.tipInstance.hide();
      }, 0);
    });
  }

  /**
   * 获取当前style
   */
  public getStyle(type: any, item = ''): any {
    if (type === 'line') {
      return {
        'margin-top': `${this.baseTop + 20 - 1}px`,
        background: `${this.baseColor}`
      };
    } else if (type === 'title-box') {
      return {
        height: `${this.gridHeight - 2 * 2}px`,
        color: `${this.ylabelColor}`
      };
    } else if (type === 'line-bottom') {
      return {
        'margin-top': '2px',
        background: `${this.baseColor}`
      };
    } else if (type === 'title-box2') {
      return {
        height: `${this.gridHeight - 2 * 2}px`,
        color: `${this.ylabelColor}`
      };
    } else if (type === 'img') {
      return {
        display: `${this.isHave === 'swap' ? (item === 'pswpin/s' ?
          (this.isMore1 ? 'block' : 'none') : (this.isMore2 ? 'block' : 'none')) : 'none'}`
      };
    }
  }

  /**
   * 获取 class
   */
  public getClass(type: any, item: any): any {
    if (type === 'title-num') {
      return `${item.replace('%', 'x').replace('/', 'x').replace('(', 'x').replace(')', 'x')}`;
    }
  }

  /**
   * 获取单位
   */
  public getUnit(item: any) {
    return `${item}${this.GlobalColumInfo[item].danwei}`;
  }
}
