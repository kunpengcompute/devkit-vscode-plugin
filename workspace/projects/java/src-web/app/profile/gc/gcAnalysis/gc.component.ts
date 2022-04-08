import { Component, OnInit, ViewChild, ElementRef, OnDestroy, SecurityContext } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { StompService } from '../../../service/stomp.service';
import { MessageService } from '../../../service/message.service';
// 引入设置中文字体
import { I18nService } from '../../../service/i18n.service';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { LibService } from '../../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-gc',
  templateUrl: './gc.component.html',
  styleUrls: ['./gc.component.scss']
})
export class GcComponent implements OnInit, OnDestroy {
  @ViewChild('regionCharts') regionCharts: any;
  @ViewChild('analysis ', { static: false }) analysis: any;
  @ViewChild('gcTimeLine', { static: false }) gcTimeLine: any;
  public suggestArr: any = [];
  public suggestTip: string;
  public hoverClose: any;
  public isSuggest = false;
  public sugtype = 1;
  constructor(
    private stompService: StompService,
    private msgService: MessageService,
    public i18nService: I18nService,
    private downloadService: ProfileDownloadService,
    public libService: LibService,
    public domSanitizer: DomSanitizer,
    private elementRef: ElementRef,
  ) {
    this.i18n = this.i18nService.I18n();
    this.selectData.searchOptions = [
      {
        label: this.i18n.profikeGC.GCCause,
        value: 'gcCause'
      },
      {
        label: this.i18n.profikeGC.GarbageCollector,
        value: 'gcName'
      }
    ];
    this.searchValue.placeholder = this.i18n.searchBox.mutlInfo;
    this.selectData.searchKey = this.selectData.searchOptions[0];
    this.searchKeys[0] = this.selectData.searchKey.value;
  }
  public i18n: any;
  // i18n只能在nginit中拿到
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public selectData: any = {
    searchOptions: [],
    searchKey: {
      label: '',
      value: ''
    }
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchKeys: Array<string> = [''];
  //  echart数据
  public update: any = [];
  public timeOpt: any = [];
  public timeFun: any = [];
  public gridTop: any = 20;
  public gridHeight: any = 90;
  public gridLeft: any = 34;


  public assetZone: any = {};
  // 请求数据源
  // GC活动--分组
  public oldgcActive: any = [];
  public gcactivename = '';
  public gcnewactivname = '';
  public newgcActive: any = [];
  public gcNameOne: any = [];
  public gcNameTwo: any = [];
  // 内存
  public gccommitaft: any = [];
  public gcusedaft: any = [];
  // gc回收
  public gcCircle: any = [];
  // gc暂停时间
  public gcduration: any = [];
  // gc进程数
  public gcthredcount: any = [];
  // 表头数据
  public yGcact: any;
  public yGcstore: any;
  public ycGcback: any;
  public yGcpause: any;
  public yGcthread: any;
  public isDownload = false;

  public echarts: any;
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public limitData: any;
  public limitTime: any;
  public gcTimeData: any = [];
  public segmentation: any = [];
  public markLineData: any = [];
  // 图表上一次刷新时间
  public lastRefreshEchartTime = 0;

  ngOnInit() {
    this.limitData = this.downloadService.dataLimit.gc.dataValue;
    this.limitTime = this.downloadService.dataLimit.gc.timeValue;
    this.handleDownload();
    this.makeSeg();
    this.echartsInit();
    this.getupTable();
    this.stompService.gcState = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'gcState') {
        this.timeOpt.push(this.libService.dateFormat(msg.data.startTime + msg.data.duration, 'hh:mm:ss.S'));
        this.timeFun.push(msg.data.startTime + msg.data.duration);
        if (msg.data.gcName !== '') {
          if (this.gcactivename === '' && this.gcnewactivname === '') {
            this.gcactivename = msg.data.gcName;
            this.oldgcActive.push(msg.data.duration / 1000);
            this.newgcActive.push(0);
          } else if (this.gcactivename !== msg.data.gcName) {
            this.gcnewactivname = msg.data.gcName;
            this.newgcActive.push(msg.data.duration / 1000);
            this.oldgcActive.push(0);
          } else {
            this.oldgcActive.push(msg.data.duration / 1000);
            this.newgcActive.push(0);
          }
        } else {
          this.newgcActive.push(0);
          this.oldgcActive.push(0);
        }
        if (this.oldgcActive.some((item: any) => {
          return item !== 0;
        })) {
          this.gcNameOne = this.oldgcActive;
        }
        if (this.newgcActive.some((item: any) => {
          return item !== 0;
        })) {
          this.gcNameTwo = this.newgcActive;
        }
        let newarr: any = [];
        newarr = newarr.concat(this.newgcActive, this.oldgcActive);
        this.yGcact = (Math.max(this.maxData(newarr))).toLocaleString() + '%' || 1;
        // 内存数据 --1.used size，2.commited size
        this.gccommitaft.push(msg.data.committedAfterGc);
        this.gcusedaft.push(msg.data.usedAfterGc);
        this.yGcstore = this.libService.onChangeUnit(Math.max(...this.gccommitaft));
        // gc回收
        const gccircledata = msg.data.usedBeforeGc - msg.data.usedAfterGc;
        this.gcCircle.push(gccircledata);
        this.ycGcback = this.libService.onChangeUnit(Math.max(...this.gcCircle));
        // gc暂停时间
        this.gcduration.push((msg.data.pauseTime / 1000).toFixed(3));
        this.yGcpause = (Math.max(...this.gcduration).toLocaleString()) || 1;
        // gc线程数
        if (msg.data.gcThreadCount === -1) {
          this.gcthredcount.push(0);
        } else {
          this.gcthredcount.push(msg.data.gcThreadCount);
          this.yGcthread = (Math.max(...this.gcthredcount)).toLocaleString() || 1;
        }
        // table表格数据
        if (msg.data.gcId !== -1) {
          this.data.push(this.tableFormat(msg));
          // 数据限定
          if (this.data.length > this.limitData) {
            this.data.shift();
          }
        }
        const nowDate = Date.now();
        if (nowDate - this.lastRefreshEchartTime >= 2000) {
          this.lastRefreshEchartTime = nowDate;
          this.getupTable();
          // 更新数据
          this.getUpdate();
        }
      }
      if (msg.type === 'dataLimit' && msg.data.type === 'gc') {
        if (msg.data.value > 50) {
          this.limitData = this.downloadService.dataLimit.gc.dataValue;
        }
        if (msg.data.value < 50) {
          this.gcDataInit();
          this.limitTime = this.downloadService.dataLimit.gc.timeValue;
        }
      }
      if (msg.type === 'isClear' || msg.type === 'isClearOne') {
        this.gcDataInit();
      }
      if (msg.type === 'isRestart') {
        this.gcDataInit();
        this.suggestArr = [];
      }
      if (msg.type === 'suggest') {
        this.suggestArr = msg.data.filter((item: any) => {
          return item.label === 2;
        });
        this.downloadService.downloadItems.gc.suggestArr = this.suggestArr;
      }
      if (msg.type === 'exportData') {
        this.handleDownloadSave();
      }
      if (msg.type === 'setDeleteOne') {
        if (this.gcCircle.length === 0 || this.gcusedaft.length === 0 ||
          this.gcduration.length === 0 || this.gcthredcount.length === 0) {
          this.msgService.sendMessage({
            type: 'getDeleteOne',
            isNoData: 'true',
          });
        } else {
          this.msgService.sendMessage({
            type: 'getDeleteOne',
            isNoData: 'false',
          });
        }
      }
    });
    this.suggestArr = this.downloadService.downloadItems.gc.suggestArr;
    // 设置表头
    this.columns = [
      {
        title: this.i18n.profikeGC.Timestamp,
        width: '10%',
        isSort: true,
        sortKey: 'startTime'
      },
      {
        title: this.i18n.profikeGC.GCCause,
        width: '15%'
      },
      {
        title: this.i18n.profikeGC.GarbageCollector,
        width: '15%'
      },
      {
        title: this.i18n.profikeGC.MemoryAppliedforGC,
        width: '10%',
        isSort: true,
        sortKey: 'gcCommit'
      },
      {
        title: this.i18n.profikeGC.MemoryBeforeGC,
        width: '10%',
        isSort: true,
        sortKey: 'gccommitbefore'
      },
      {
        title: this.i18n.profikeGC.MemoryAfterGC,
        width: '10%',
        isSort: true,
        sortKey: 'gccommitafter'
      },
      {
        title: this.i18n.profikeGC.GCCircle,
        width: '10%',
        isSort: true,
        sortKey: 'gcCircle'
      },
      {
        title: this.i18n.profikeGC.GCThreads,
        width: '10%',
        isSort: true,
        sortKey: 'gcThreadCount'
      },
      {
        title: this.i18n.profikeGC.PauseTime,
        width: '10%',
        isSort: true,
        sortKey: 'gcDuration'
      }
    ];
  }

  public gcDataInit() {
    this.data = [];
    this.srcData.data = [];
    this.timeOpt = [];
    this.timeFun = [];
    this.oldgcActive = [];
    this.gcNameOne = [];
    this.newgcActive = [];
    this.gcNameTwo = [];
    this.gccommitaft = [];
    this.gcusedaft = [];
    this.gcCircle = [];
    this.gcduration = [];
    this.gcthredcount = [];
    this.echartsInit();
  }
  public handleDownload() {
    this.data = this.downloadService.downloadItems.gc.tableData;
    this.yGcact = this.downloadService.downloadItems.gc.maxValue.yGcact;
    this.yGcstore = this.downloadService.downloadItems.gc.maxValue.yGcstore;
    this.ycGcback = this.downloadService.downloadItems.gc.maxValue.ycGcback;
    this.yGcpause = this.downloadService.downloadItems.gc.maxValue.yGcpause;
    this.yGcthread = this.downloadService.downloadItems.gc.maxValue.yGcthread;
    if (Object.keys(this.downloadService.downloadItems.gc.startDate).length) {
      this.timeOpt = this.downloadService.downloadItems.gc.startDate.xAxis[0].data;
      this.gcTimeData = this.timeOpt;
      this.oldgcActive = this.downloadService.downloadItems.gc.startDate.series[0].data;
      this.gcactivename = this.downloadService.downloadItems.gc.startDate.series[0].name;
      this.newgcActive = this.downloadService.downloadItems.gc.startDate.series[1].data;
      this.gcnewactivname = this.downloadService.downloadItems.gc.startDate.series[1].name;
      this.gcusedaft = this.downloadService.downloadItems.gc.startDate.series[3].data;
      this.gccommitaft = this.downloadService.downloadItems.gc.startDate.series[2].data;
      this.gcCircle = this.downloadService.downloadItems.gc.startDate.series[4].data;
      this.gcduration = this.downloadService.downloadItems.gc.startDate.series[5].data;
      this.gcthredcount = this.downloadService.downloadItems.gc.startDate.series[6].data;
      if (this.oldgcActive.some((item: any) => {
        return item !== 0;
      })) {
        this.gcNameOne = this.oldgcActive;
      }
      if (this.newgcActive.some((item: any) => {
        return item !== 0;
      })) {
        this.gcNameTwo = this.newgcActive;
      }
      this.assetZone = this.downloadService.downloadItems.gc.startDate;
    }
  }
  public makeGrid(top: any, opt: any) {
    const options = {
      top,
      height: this.gridHeight,
      left: this.gridLeft,
      right: 50,
      bottom: 30
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  public makeaXAxis(gridIndex: any, opt: any) {
    const options = {
      type: 'category',
      splitLine: { show: false, },  // x轴grid分割线
      position: 'bottom',   // 轴线位置
      gridIndex,
      boundaryGap: false,   // 要主动设，从0开始
      axisTick: { show: true },
      axisLine: { onZero: false, lineStyle: { color: '#e6ebf5', width: 2 } },  // 轴线颜色
      data: this.timeOpt
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  public makeYAxis(gridIndex: any, opt: any) {
    const options = {
      show: true,
      gridIndex,
      type: 'value',
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      axisLine: { onZero: false, lineStyle: { color: '#e6ebf5', width: 1 } },  // 轴线颜色
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  public makeSeries(xAxisIndex: any, yAxisIndex: any, opt: any) {
    const options: any = {
      type: 'line',
      xAxisIndex,
      yAxisIndex,
      showSymbol: false,
      data: []
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  // echarts数据更新
  public getUpdate() {
    this.gcTimeData = this.timeOpt;
    this.gcTimeLine.setTimeData(this.gcTimeData);
    this.assetZone.series[0] = {
      type: 'line',
      name: this.gcactivename,
      xAxisIndex: 0,
      yAxisIndex: 0,
      showSymbol: false,
      lineStyle: { color: '#267DFF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(38,125,255,0.3)',
        }, {
          offset: 1,
          color: 'rgba(38,125,255,0.04)'
        }])
      },
      itemStyle: {
        color: '#267DFF'  // 拐点颜色
      },
      data: this.gcNameOne,
    };
    this.assetZone.series[1] = {
      type: 'line',
      name: this.gcnewactivname,
      xAxisIndex: 0,
      yAxisIndex: 0,
      showSymbol: false,
      lineStyle: { color: '#00BFC9' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(0,191,201,0.3)',
        }, {
          offset: 1,
          color: 'rgba(0,191,201,0.04)'
        }])
      },
      itemStyle: {
        color: '#00BFC9'  // 拐点颜色
      },
      data: this.gcNameTwo
    };
    const time1 = this.timeFun[this.timeFun.length - 1];
    const time2 = this.timeFun[0];
    const newTime = time1 - time2;
    if (newTime > Number(this.limitTime) * 60 * 1000) {
      this.timeOpt.shift();
      this.gcNameOne.shift();
      this.gcNameTwo.shift();
      // 内存
      this.gccommitaft.shift();
      this.gcusedaft.shift();
      // gc回收
      this.gcCircle.shift();
      // gc暂停时间
      this.gcduration.shift();
      // gc进程数
      this.gcthredcount.shift();
    }
    this.echarts = echarts.init(this.elementRef.nativeElement.querySelector('#myEchart'));
    this.echarts.setOption(this.assetZone, { notMerge: false, lazyUpdate: true, silent: false });
    window.onresize = this.echarts.resize;
    this.echarts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.gcTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
    });
  }
  /**
   * markLine定制
   */
  public makeSeg() {
    this.segmentation.forEach((item: any) => {
      this.markLineData.push({
        silent: false,
        lineStyle: {
          type: 'datted',
          color: '#FA3934',
        },
        label: {
          show: false,
          position: 'end'
        },
        xAxis: `${item}`
      });
    });
  }
  public echartsInit() {
    this.setData();
    const series = [
      {
        type: 'line',
        name: this.gcactivename,
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        lineStyle: { color: '#267DFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(38,125,255,0.3)',
          }, {
            offset: 1,
            color: 'rgba(38,125,255,0.04)'
          }])
        },
        itemStyle: {
          color: '#267DFF'  // 拐点颜色
        },
        data: this.gcNameOne,
      },
      {
        type: 'line',
        name: this.gcnewactivname,
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        lineStyle: { color: '#00BFC9' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0,191,201,0.3)',
          }, {
            offset: 1,
            color: 'rgba(0,191,201,0.04)'
          }])
        },
        itemStyle: {
          color: '#00BFC9'  // 拐点颜色
        },
        data: this.gcNameTwo
      },
      {
        type: 'line',
        name: 'committed size',
        xAxisIndex: 1,
        yAxisIndex: 1,
        showSymbol: false,
        lineStyle: { color: '#85A5FF' },
        areaStyle: {
          color: '#85A5FF',
          opacity: 1
        },
        itemStyle: {
          color: '#85A5FF'  // 拐点颜色
        },
        data: this.gccommitaft,
      },
      {
        type: 'line',
        name: 'used  size',
        xAxisIndex: 1,
        yAxisIndex: 1,
        showSymbol: false,
        lineStyle: { color: '#597EF7' },
        areaStyle: {
          color: '#597EF7',
          opacity: 1
        },
        itemStyle: {
          color: '#597EF7'  // 拐点颜色
        },
        data: this.gcusedaft
      },
      {
        type: 'line',
        name: 'GC',
        xAxisIndex: 2,
        yAxisIndex: 2,
        showSymbol: false,
        lineStyle: { color: '#267DFF' },
        areaStyle: { color: '#267DFF', opacity: 0.2 },
        itemStyle: {
          color: '#267DFF'  // 拐点颜色
        },
        data: this.gcCircle,
      },
      {
        type: 'line',
        name: this.i18n.profikeGC.PauseTime,
        xAxisIndex: 3,
        yAxisIndex: 3,
        showSymbol: false,
        lineStyle: { color: '#267DFF' },
        areaStyle: { color: '#267DFF', opacity: 0.2 },
        itemStyle: {
          color: '#267DFF'  // 拐点颜色
        },
        data: this.gcduration,
      },
      {
        type: 'line',
        name: this.i18n.profikeGC.GCThreads,
        showSymbol: false, // 只有hover时显示
        xAxisIndex: 4,
        yAxisIndex: 4,
        lineStyle: { color: '#267DFF' },
        areaStyle: { color: '#267DFF', opacity: 0.2 },
        itemStyle: {
          color: '#267DFF'  // 拐点颜色
        },
        data: this.gcthredcount,
      }];
    this.assetZone.series = series;
    this.echarts = echarts.init(this.elementRef.nativeElement.querySelector('#myEchart'));
    this.echarts.setOption(this.assetZone, { notMerge: false, lazyUpdate: true, silent: false });
    window.onresize = this.echarts.resize;
    this.echarts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.gcTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
    });
  }
  public setData() {
    const that = this;
    this.assetZone = {
      grid: [
        this.makeGrid(this.gridTop, {}),
        this.makeGrid(this.gridTop + this.gridHeight, {}),
        this.makeGrid(this.gridTop + this.gridHeight * 2, {}),
        this.makeGrid(this.gridTop + this.gridHeight * 3, {}),
        this.makeGrid(this.gridTop + this.gridHeight * 4, {})
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        hideDelay: 2000,
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        padding: [8, 20, 8, 20],
        axisPointer: {
          show: false,
        },
        formatter: (params: any) => {
          let html = '';
          html = `
            <div>
              <div style="font-size:12px;">${this.domSanitizer.sanitize(SecurityContext.HTML,
            this.downloadService.downloadItems.profileInfo.toolTipDate + ' ' + params[0].axisValue)}</div>
            </div>
          `;
          let comitsize: any;
          let usedsize: any;
          let freesize: any;
          params.forEach((item: any) => {
            if (item.seriesName === 'committed size') {
              comitsize = item.data;
            } else if (item.seriesName === 'used  size') {
              usedsize = item.data;
            }
          });
          freesize = ((comitsize - usedsize) / 1024 / 1024).toFixed(2) + 'MiB';
          const gcList = params.filter((item: any) => {
            return item.seriesIndex === 0 || item.seriesIndex === 1;
          });
          if (params[0].axisIndex === 0) {
            params[0].data += '%';
            if (params[0].seriesIndex === 0 && params[1].seriesIndex === 1) {
              html += `
        <div style="font-size:12px; display:flex;justify-content: space-between; align-items: center; margin-top:8px">
          <div style="float : left; ">
            <span style="width:8px;height:8px;display:inline-block;background: ${params[1].color};"></span>
            <span style="margin-left:8px">
            ${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].seriesName)}</span>
          </div>
          <span style="margin-left:24px">
          ${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].data)}%</span>
        </div>
       `;
            }
          }
          if (params[0].axisIndex === 1) {
            params[0].data = (params[0].data / 1024 / 1024).toFixed(2) + 'MiB';
            params[0].color = 'linear-gradient(to right, #85A5FF, #597EF7);';
            html += `
                 <div style="font-size:12px; display:flex;justify-content: space-between; align-items: center;
                 margin-top:8px">
                 <div style="float : left;">
                   <span style="width:8px;height:8px;display:inline-block;
                   background:#597EF7;"></span>
                   <span style="margin-left:8px">used size</span>
                 </div>
                 <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
              (usedsize / 1024 / 1024).toFixed(2))}MiB</span>
               </div>
                `;
            html += `
                <div style="font-size:12px; display:flex;justify-content: space-between; align-items: center;
                margin-top:8px">
                <div style="float : left;">
                  <span style="width:8px;height:8px;display:inline-block;background:#85A5FF;"></span>
                  <span style="margin-left:8px">free size</span>
                </div>
                <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, freesize)}</span>
              </div>
               `;
          } else if (params[0].axisIndex === 2) {
            params[0].data = (params[0].data / 1024 / 1024).toFixed(2) + 'MiB';
            params[0].color = '#267DFF';
          } else if (params[0].axisIndex === 3 || params[0].axisIndex === 4) {
            params[0].data = params[0].data.toLocaleString();
          }
          html += `
          <div style="font-size:12px;display:flex;justify-content: space-between; align-items: center;margin-top:8px">
            <div>
              <span style="width:8px;height:8px;display:inline-block;background:${params[0].color};"></span>
              <span style="margin-left:8px">
              ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
            </div>
            <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].data)}</span>
          </div>
        `;
          return html;
        }
      },
      axisPointer: {
        link: { xAxisIndex: [0, 1, 2, 3, 4] },
        snap: true
      },
      // 区域缩放组件
      dataZoom: [
        {
          show: false,
          type: 'slider',
          realtime: true,
          xAxisIndex: [0, 1, 2, 3, 4],
          top: 0,
          showDataShadow: true, // 是否显示背景
          height: 32,
          dataBackground: {
            areaStyle: {
              color: 'rgba(230,233,240,0.6)' // 滑块背景阴影的填充样式
            },
            lineStyle: {
              opacity: 0.8,
              color: 'rgb(230,233,240)' // 滑块背景的边线颜色
            }
          },
          fillerColor: 'rgba(108, 146, 250, 0.15)', // 选中的区域背景色
          textStyle: {
            color: 'rgba(40, 43, 51, 0)'  // 选中区域两边的边界值样式  不显示
          },
          handleStyle: {   // 边界图标样式设置
            color: 'rgba(108, 146, 250, 1)',
            borderType: 'solid',
            borderWidth: '10',
          },
          filterMode: 'empty'
        },
        {
          type: 'inside',
          realtime: true,
          xAxisIndex: [0, 1, 2, 3, 4],
          showDataShadow: false,   // 是否显示数据阴影
          filterMode: 'empty'
        }
      ],
      xAxis: [
        this.makeaXAxis(0, { axisLabel: { show: false }, }),
        this.makeaXAxis(1, { axisLabel: { show: false } }),
        this.makeaXAxis(2, { axisLabel: { show: false } }),
        this.makeaXAxis(3, { axisLabel: { show: false } }),
        this.makeaXAxis(4, { axisLabel: { show: true, color: '#9ea4b3' } }),
      ],
      yAxis: [
        this.makeYAxis(0, {}),
        this.makeYAxis(1, {}),
        this.makeYAxis(2, {}),
        this.makeYAxis(3, {}),
        this.makeYAxis(4, {}),
      ],
      series: []
    };
  }
  // table表格数据更新
  public getupTable() {
    this.srcData = {
      data: this.data,   // 元数据
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }
  // table表格数据处理
  public tableFormat(msg: any) {
    const tabledata = msg.data;
    const startTime = this.libService.dateFormat(tabledata.startTime + tabledata.duration, 'hh:mm:ss.S');
    const gcCause = tabledata.gcCause;
    const gcName = tabledata.gcName;
    const gcCommit = tabledata.committedAfterGc;
    const gccommitbefore = tabledata.usedBeforeGc;
    const gccommitafter = tabledata.usedAfterGc;
    const gcCircle = tabledata.usedBeforeGc - tabledata.usedAfterGc;
    const gcThreadCount = Number(tabledata.gcThreadCount);
    const gcDuration = Number((tabledata.pauseTime / 1000).toFixed(3));
    return {
      startTime,
      gcCause,
      gcName,
      gcCommit,
      gccommitbefore,
      gccommitafter,
      gcCircle,
      gcThreadCount,
      gcDuration
    };
  }
  // 日期格式化

  public checkTime(i: any) {
    if (i < 100 && i > 9) {
      i = '0' + i;
    }
    if (i < 10) {
      i = '00' + i;
    }
    return i;
  }
  public maxData(data: any) {
    if (!data || !data.length) { return 0; }
    return data.sort((a: any, b: any) => b - a)[0];
  }
  public handleDownloadSave() {
    this.downloadService.downloadItems.gc.tableData = this.data;
    this.downloadService.downloadItems.gc.maxValue.yGcact = this.yGcact;
    this.downloadService.downloadItems.gc.maxValue.yGcstore = this.yGcstore;
    this.downloadService.downloadItems.gc.maxValue.ycGcback = this.ycGcback;
    this.downloadService.downloadItems.gc.maxValue.yGcpause = this.yGcpause;
    this.downloadService.downloadItems.gc.maxValue.yGcthread = this.yGcthread;
    this.downloadService.downloadItems.gc.startDate = this.assetZone;
  }
  ngOnDestroy(): void {
    this.downloadService.downloadItems.gc.suggestArr = this.suggestArr;
    if (this.isDownload) { return; }
    this.handleDownloadSave();
    this.echarts.clear();
    this.msgService.sendMessage({ type: 'getDeleteOne' });  // 清除本页面的发送事件
    this.stompService.gcState.unsubscribe();
    window.onresize = null;
  }
  /**
   * 搜索
   * @param value value
   */
  keySearch(value: string): void {
    this.searchKeys[0] = this.selectData.searchKey.value;
    this.searchWords[0] = value;
  }
  searchClear(value: string): void {
    this.searchWords[0] = '';
  }
  public closeSuggest() {
    this.hoverClose = '';
    this.isSuggest = false;
  }
  public closeHandle(e: any) {
    this.isSuggest = false;
  }
  public openSuggest() {
    this.isSuggest = true;
  }
  public timeLineData(data: any) {
    this.assetZone.dataZoom[0].start = data.start;
    this.assetZone.dataZoom[0].end = data.end;
    this.echarts.setOption({
      dataZoom: this.assetZone.dataZoom
    });
  }
}
