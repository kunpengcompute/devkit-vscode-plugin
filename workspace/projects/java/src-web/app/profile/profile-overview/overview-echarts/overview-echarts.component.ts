import { Component, OnInit, Input, AfterViewInit, OnDestroy,
  ViewChild, SecurityContext, ElementRef, NgZone } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { LibService } from '../../../service/lib.service';
import { MessageService } from '../../../service/message.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-overview-echarts',
  templateUrl: './overview-echarts.component.html',
  styleUrls: ['./overview-echarts.component.scss']
})
export class OverviewEchartsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('timeLineDetail') timeLineDetail: any;
  @Input() datas: any;
  @Input() updateOptions: any;
  i18n: any;
  public tableData: any;
  public count = 70;
  public intervalCount = 67;
  public baseTop = 0;
  public gridHeight = 72;
  public baseColor = '#D4D9E6';
  public ylabelColor = '#616161';
  public filter = {};
  public time: any;
  public spec: any;
  public key: any;
  public uuid: any;
  public GlobalColumInfo: any;
  public option: any = {};
  public xAxisData: any = [];
  public overviewEchart: any;
  private overviewItems = [
    'heap_usedSize',
    'heap_committedSize',
    'nonHeap_UsedSize',
    'nonHeap_CommittedSize',
    'processPhysical_MemoryUsedSize',
    'systemFreePhysical_MemorySize',
    'gc_activity',
    'classes',
    'threads_RUNNABLE',
    'threads_WAITING',
    'threads_BLOCKED',
    'cpu_load_total',
    'cpu_load_progress'
  ];
  public overViewDatas: any = {
    heap_usedSize: [],
    heap_committedSize: [],
    nonHeap_UsedSize: [],
    nonHeap_CommittedSize: [],
    processPhysical_MemoryUsedSize: [],
    systemFreePhysical_MemorySize: [],
    gc_activity: [],
    classes: [],
    threads_RUNNABLE: [],
    threads_WAITING: [],
    threads_BLOCKED: [],
    cpu_load_total: [],
    cpu_load_progress: []
  };
  public isDownload: any = false;
  public limitTime: any;
  public lastRefreshEchartTime = 0;
  constructor(
    public i18nService: I18nService,
    private downloadService: ProfileDownloadService,
    public libService: LibService,
    private msgService: MessageService,
    private elementRef: ElementRef,
    public domSanitizer: DomSanitizer,
    protected zone: NgZone
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public timeData: any = []; // 时间轴数据
  public timeLine = {
    start: 0,
    end: 100
  };
  public maxDate: any = [];
  public nameList: any = [];
  public realTime: any = [];
  public stateAxisTime: any = +new Date(new Date().setHours(0, 0, 0, 0));
  public stateSub: any;
  ngOnInit() {
    this.limitTime = this.downloadService.dataLimit.over_view.timeValue;
    this.nameList = [
      this.i18n.protalserver_profiling_overview.heap,
      this.i18n.protalserver_profiling_overview.nonHeap,
      this.i18n.protalserver_profiling_overview.physicalMemory,
      this.i18n.protalserver_profiling_overview.gc_activety,
      this.i18n.protalserver_profiling_overview.class,
      this.i18n.protalserver_profiling_overview.thread,
      this.i18n.protalserver_profiling_overview.cpu_load
    ];
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    if (Object.keys(this.downloadService.downloadItems.overview.echarts).length !== 0) {
      this.stateAxisTime = this.downloadService.downloadItems.overview.timeNow;
      this.realTime = this.downloadService.downloadItems.overview.realtime;
      this.maxDate = this.downloadService.downloadItems.overview.maxDate;
      this.overViewDatas = this.downloadService.downloadItems.overview.echarts;
      this.option = this.downloadService.downloadItems.overview.option;
      this.xAxisData = this.downloadService.downloadItems.overview.xAxisData;
      this.timeData = this.xAxisData;
    } else {
      this.initXAxisData();
    }
    this.stateSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'dataLimit') {
        if (msg.data.type === 'over_view') {
          this.limitTime = this.downloadService.dataLimit.over_view.timeValue;
          Object.keys(this.overViewDatas).forEach(item => {
            this.overViewDatas[item] = [];
          });
          this.stateAxisTime = +new Date(new Date().setHours(0, 0, 0, 0));
          this.initXAxisData(Number(this.downloadService.dataLimit.over_view.timeValue) * 60);
          this.realTime = [];
          this.timeData = this.xAxisData;
        }
      }
      if (msg.type === 'isRestart' || msg.type === 'isClear' || msg.type === 'isClearOne') {
        Object.keys(this.overViewDatas).forEach(item => {
          this.overViewDatas[item] = [];
          this.downloadService.downloadItems.overview.showNodate = true;
        });
        this.stateAxisTime = +new Date(new Date().setHours(0, 0, 0, 0));
        this.initXAxisData(Number(this.downloadService.dataLimit.over_view.timeValue) * 60);
        this.realTime = [];
        this.setData();
      }
      if (msg.type === 'exportData') {
        this.downloadData();
      }
    });
  }

  ngAfterViewInit() {
    this.initTable();
  }

  ngOnDestroy(): void {
    this.downloadData();
    this.overviewEchart.clear();
    if (this.stateSub) { this.stateSub.unsubscribe(); }
  }
  public downloadData() {
    this.downloadService.downloadItems.overview.echarts = this.overViewDatas;
    this.downloadService.downloadItems.overview.xAxisData = this.xAxisData;
    this.downloadService.downloadItems.overview.option = this.option;
    this.downloadService.downloadItems.overview.timeNow = this.stateAxisTime;
    this.downloadService.downloadItems.overview.realtime = this.realTime;
  }
  public initTable() {
    this.time = this.datas.time1;
    this.setData();
  }
  public makeXAxis(gridIndex: any, opt: any) {  // x轴
    const options = {
      type: 'category',
      boundaryGap: false,
      gridIndex,
      axisLine: {
        onZero: true,
        lineStyle: {
          color: '#D4D9E6',
          width: 2
        }
      },  // 轴线相关设置
      splitLine: {
        interval: 0,
        lineStyle: {
          color: 'rgba(212,217,230,0.5)',
          type: 'dashed'
        },
        show: true
      },
      axisPointer: {
        lineStyle: { color: 'transparent' }
      },
      data: this.xAxisData
    };
    if (opt) { Object.assign(options, opt); }
    return options;
  }

  public makeYAxis(gridIndex: any, opt: any) {  // y轴
    const options = {
      type: 'value',
      show: false,
      boundaryGap: ['0.01', '0.1'],   // 坐标轴两侧的边界间隙
      gridIndex,
      nameLocation: 'middle',
      nameGap: 30,   // 轴名称与轴线之间的间隔
      nameRotate: 0,  // 周名称的旋转
      offset: 0,  // y轴相对于默认位置的偏移量
      nameTextStyle: {  // 轴名称的默认样式
        color: '#333'
      },

      axisTick: { show: false },  // 轴线刻度相关---是否显示轴刻度
      axisLine: { show: false },  // 轴线相关设置---显示轴线

      splitLine: { show: true }, // 轴线在网格区域的分割线
      splitNumber: 1, // y轴刻度间隔
      min: 0.1
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  public makeGrid(top: any, opt: any) {
    const options = {
      top,
      height: this.gridHeight,
      left: 25,
      right: 0
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  // 设置配置项
  public setData() {
    this.option = {
      legend: {  // 标题
        data: [],
        type: 'scroll',
        icon: 'circle',
        top: 0,
        algin: 'left',
        right: 50,
        width: '35%',
        show: true
      },
      dataZoom: [  // 数据区缩放组件
        {
          type: 'slider',
          show: false,
          realtime: true,
          top: 0,
          xAxisIndex: [0, 1, 2, 3, 4, 5, 6],
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
          fillerColor: 'rgba(0, 108, 255, 0.15)', // 选中的区域背景色
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
          xAxisIndex: [0, 1, 2, 3, 4, 5, 6],
          showDataShadow: false,   // 是否显示数据阴影
          filterMode: 'empty'
        }
      ],
      tooltip: {  // 提示框组件
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 1)',
        textStyle: {
          color: '#000000',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        padding: [8, 20, 8, 20],
        triggerOn: 'mousemove',
        hideDelay: 2000,
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#478cf1',
            width: 1.5
          }
        },
        formatter: (params: any) => {
          params.forEach((item: any) => {
            item.data = item.data === 0.001 ? 0 : item.data;
            if (
              item.seriesIndex === 0 || item.seriesIndex === 1 || item.seriesIndex === 2 ||
              item.seriesIndex === 3 || item.seriesIndex === 4 || item.seriesIndex === 5
            ) {
              item.data = this.libService.onChangeUnit(item.data);
            }
            if (item.seriesIndex === 6) {
              item.data += 'ms';
            }
            if (item.seriesIndex === 7 || item.seriesIndex === 8 || item.seriesIndex === 9 || item.seriesIndex === 10) {
              item.data = this.libService.setThousandSeparator(item.data);
            }
            if (item.seriesIndex === 11 || item.seriesIndex === 12) {
              item.data += '%';
            }
          });
          let html = `
          <div>
            <p style="font-size :12px;">${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].axisValue)}
              <span style="color:#979797">
              (${this.domSanitizer.sanitize(SecurityContext.HTML, this.realTime[params[0].dataIndex])})</span>
            </p>
          </div>
        `;
          const html1 = `<div style="font-size:12px; display:flex;
          justify-content: space-between; align-items: center; margin-top:8px">
      <div style="float : left;">
        <span style="width:8px;height:8px;display:inline-block;background: ${params[0].color};margin-right:8px"></span>
        <span>${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
      </div>
      <span style="margin-left:24px;">${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].data)}</span>
    </div>`;
          const html2 = `<div style="font-size:12px; display:flex;
          justify-content: space-between; align-items: center; margin-top:8px">
        <div style="float : left;">
          <span style="width:8px;height:8px;display:inline-block;
          background: ${params[1].color};margin-right:8px"></span>
          <span>${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].seriesName)}</span>
        </div>
        <span style="margin-left:24px;">${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].data)}</span>
      </div>`;
          const html3 = `<div style="font-size:12px; display:flex;
          justify-content: space-between; align-items: center; margin-top:8px">
        <div style="float : left;">
          <span style="width:8px;height:8px;display:inline-block;
          background: ${params[2].color};margin-right:8px"></span>
          <span>${this.domSanitizer.sanitize(SecurityContext.HTML, params[2].seriesName)}</span>
        </div>
        <span  style="margin-left:24px;">${params[2].data}</span>
      </div>`;
          if (params[0].seriesIndex === 0 || params[0].seriesIndex === 1) {
            html += html1;
            html += html2;
          }
          if (params[0].seriesIndex === 2 || params[0].seriesIndex === 3) {
            html += html1;
            html += html2;
          }
          if (params[0].seriesIndex === 4 || params[0].seriesIndex === 5) {
            html += html1;
            html += html2;
          }
          if (params[0].seriesIndex === 6) {
            html += html1;
          }
          if (params[0].seriesIndex === 7) {
            html += html1;
          }
          if (params[0].seriesIndex === 8 || params[0].seriesIndex === 9 || params[0].seriesIndex === 10) {
            html += html1;
            html += html2;
            html += html3;
          }
          if (params[0].seriesIndex === 11 || params[0].seriesIndex === 12) {
            html += html1;
            html += html2;
          }
          return html;
        }
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        snap: true
      },
      // 直角坐标系底板
      grid: [
        this.makeGrid(this.baseTop, {}),
        this.makeGrid(this.baseTop + this.gridHeight, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 2, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 3, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 4, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 5, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 6, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 7, {}),
      ],
      // 直角坐标系x轴
      xAxis: [
        this.makeXAxis(0, {
          axisLabel: {
            show: false,
            color: '#222222',
            margin: this.gridHeight,

          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: false,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
        this.makeXAxis(1, {
          axisLabel: {
            show: false,
            color: this.ylabelColor,
            margin: this.gridHeight
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: false,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
        this.makeXAxis(2, {
          axisLabel: {
            show: false,
            color: this.ylabelColor,
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: false,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
        this.makeXAxis(3, {
          axisLabel: {
            show: false,
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: false,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
        this.makeXAxis(4, {
          axisLabel: {
            show: false,
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: false,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
        this.makeXAxis(5, {
          axisLabel: {
            show: true,
            color: this.ylabelColor,
            padding: [11, 0, 0, 0],
            margin: this.gridHeight + 2,
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: false,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
        this.makeXAxis(6, {
          axisLabel: {
            show: false,
          }, // 坐标轴刻度标签的相关设置
          axisPointer: {
            show: true,
            lineStyle: {
              color: '#478cf1',
              width: 1.5
            }
          },
          axisTick: {
            show: true,
            width: 2,
            length: 8,
          }, // 坐标轴刻度相关设置
        }),
      ],
      // 直角坐标系y轴
      yAxis: [
        this.makeYAxis(0, {
          name: 'Heap'
        }),
        this.makeYAxis(1, {
          name: 'nonHeap'
        }),
        this.makeYAxis(2, {
          name: 'Physical Memory'
        }),
        this.makeYAxis(3, {
          name: 'GC Activity'
        }),
        this.makeYAxis(4, {
          name: 'Classes'
        }),
        this.makeYAxis(5, {
          name: 'Threads'
        }),
        this.makeYAxis(6, {
          name: 'CPU Load'
        }),
      ],
      series: [
        {
          name: this.i18n.protalserver_profiling_overview.usedHeap,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.overViewDatas.heap_usedSize,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.commitHeap,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.overViewDatas.heap_committedSize,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.usedSize,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.overViewDatas.nonHeap_UsedSize,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.committedSize,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.overViewDatas.nonHeap_CommittedSize,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.processPhysicalMemoryUsedSize,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 2,
          yAxisIndex: 2,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF ',
          },
          data: this.overViewDatas.processPhysical_MemoryUsedSize,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.systemFreePhysicalMemorySize,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 2,
          yAxisIndex: 2,
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.overViewDatas.systemFreePhysical_MemorySize,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.gc_tip,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 3,
          yAxisIndex: 3,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            opacity: 0.2,
            color: '#267DFF'
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.overViewDatas.gc_activity,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.class_tip,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 4,
          yAxisIndex: 4,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: '#267DFF',
            opacity: 0.2,
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.overViewDatas.classes,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.thread_tip1,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 5,
          yAxisIndex: 5,
          itemStyle: {
            normal: {
              color: '#61D274'
            }
          },
          lineStyle: {
            color: '#61D274',
          },
          data: this.overViewDatas.threads_RUNNABLE,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.thread_tip2,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 5,
          yAxisIndex: 5,
          itemStyle: {
            normal: {
              color: '#FFD610'
            }
          },
          lineStyle: {
            color: '#FFD610',
          },
          data: this.overViewDatas.threads_WAITING,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.thread_tip3,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 5,
          yAxisIndex: 5,
          itemStyle: {
            normal: {
              color: '#ED4B4B'
            }
          },
          lineStyle: {
            color: '#ED4B4B',
          },
          data: this.overViewDatas.threads_BLOCKED,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.cpu_tip2,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 6,
          yAxisIndex: 6,
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(38,125,255,0.3)',
            }, {
              offset: 1,
              color: 'rgba(38,125,255,0.04)'
            }])
          },
          lineStyle: {
            color: '#267DFF',
          },
          data: this.overViewDatas.cpu_load_total,
          hoverAnimation: false
        },
        {
          name: this.i18n.protalserver_profiling_overview.cpu_tip1,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 6,
          yAxisIndex: 6,
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0,191,201,0.3)',
            }, {
              offset: 1,
              color: 'rgba(0,191,201,0.04)'
            }])
          },
          lineStyle: {
            color: '#00BFC9',
          },
          data: this.overViewDatas.cpu_load_progress,
          hoverAnimation: false
        }
      ]
    };
    this.initEchart();
    const height = 5 * this.gridHeight + this.baseTop * 3 - 30;
    $('#' + this.uuid + ' .table-box').css({ height: height + 'px' });
    this.setLeft();
  }
  public setLeft() {
    const maxDate: any = [];
    let paramData: any;
    const reg = /[0-9]/;
    this.nameList.forEach((item: any, index: any) => {
      switch (index) {
        case 0:
          paramData = this.libService.onChangeUnit(Math.ceil(
            Math.max(...this.overViewDatas.heap_committedSize.concat(this.overViewDatas.heap_usedSize))
          ), true);
          paramData = reg.test(paramData) ? paramData : '0';
          maxDate.push(paramData);
          break;
        case 1:
          paramData = this.libService.onChangeUnit(Math.ceil(
            Math.max(...this.overViewDatas.nonHeap_UsedSize.concat(this.overViewDatas.nonHeap_CommittedSize))
          ), true);
          paramData = reg.test(paramData) ? paramData : '0';
          maxDate.push(paramData);
          break;
        case 2:
          paramData = this.libService.onChangeUnit(Math.ceil(
            Math.max(...this.overViewDatas.processPhysical_MemoryUsedSize.concat(
              this.overViewDatas.systemFreePhysical_MemorySize))
          ), true);
          paramData = reg.test(paramData) ? paramData : '0';
          maxDate.push(paramData);
          break;
        case 3:
          const gcValueY = Math.max(...this.overViewDatas.gc_activity) === 0.001 ?
           0 : Math.max(...this.overViewDatas.gc_activity);
          paramData = gcValueY + 'ms';
          paramData = reg.test(paramData) ? paramData : '0';
          maxDate.push(paramData);
          break;
        case 4:
          paramData = Math.max(...this.overViewDatas.classes);
          paramData = reg.test(paramData) ? paramData : '0';
          paramData = this.libService.setThousandSeparator(Number(paramData));
          maxDate.push(paramData);
          break;
        case 5:
          paramData = Math.max(...this.overViewDatas.threads_RUNNABLE
            .concat(this.overViewDatas.threads_WAITING)
            .concat(this.overViewDatas.threads_BLOCKED))
            ;
          paramData = reg.test(paramData) ? paramData : '0';
          paramData = this.libService.setThousandSeparator(Number(paramData));
          maxDate.push(paramData);
          break;
        case 6:
          paramData = Math.max(...this.overViewDatas.cpu_load_total) + '%';
          paramData = reg.test(paramData) ? paramData : '0';
          maxDate.push(paramData);
          break;
      }
      this.maxDate = maxDate;
      this.downloadService.downloadItems.overview.maxDate = maxDate;
    });
  }
  public maxData(data: any) {
    if (!data || !data.length) { return 0; }
    const arr: any = [];
    if (Array.isArray(data)) {
      data.forEach(item => {
        arr.push(item.value[1]);
      });
      return arr.sort((a: any, b: any) => b - a)[0];
    }
  }

  private initEchart() {
    this.zone.runOutsideAngular(() => {
      // echarts的Animation对象里的_startLoop方法有个递归调用requestAnimationFrame,会触发变更检查
      this.overviewEchart = echarts.init(this.elementRef.nativeElement.querySelector('#overviewEchart'));
    });
    this.overviewEchart.setOption(this.option);
    window.onresize = this.overviewEchart.resize;
    this.overviewEchart.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
    });
  }
  public initXAxisData(num: number = Number(this.limitTime) * 60) {
    this.xAxisData = [];
    this.xAxisData = this.libService.getXAxisTime(num);
    this.downloadService.downloadItems.overview.xAxisData = this.xAxisData;
  }
  public updateEchartsData(echartData: any) {
    const axisTime = this.libService.getXAxisTime(this.stateAxisTime);
    const index = this.xAxisData.findIndex((item: any) => {
      return item === axisTime;
    });
    if (index !== -1) {
      this.xAxisData[index] = axisTime;
    } else {
      this.xAxisData.push(axisTime);
    }
    const nowTime = echartData.classes[0].value[0];
    this.realTime.push(nowTime);
    this.overviewItems.forEach((item) => {
      const valueData = echartData[item].map((value: any) => {
        return value.value[1] = +value.value[1] === 0 ? 0.001 : value.value[1];
      });
      this.overViewDatas[item] = this.overViewDatas[item].concat(valueData);
    });
    this.updateXAxisData();
    this.stateAxisTime += 1000;
    const nowDate = Date.now();
    if (nowDate - this.lastRefreshEchartTime >= 2000) {
      this.lastRefreshEchartTime = nowDate;
      this.overviewEchart.setOption({
        xAxis: [
          {
            data: this.xAxisData,
          },
          {
            data: this.xAxisData,
          },
          {
            data: this.xAxisData,
          },
          {
            data: this.xAxisData,
          },
          {
            data: this.xAxisData,
          },
          {
            data: this.xAxisData,
          },
          {
            data: this.xAxisData,
          }
        ],
        series: [
          {
            data: this.overViewDatas.heap_usedSize,
          },
          {
            data: this.overViewDatas.heap_committedSize,
          },
          {
            data: this.overViewDatas.nonHeap_UsedSize,
          },
          {
            data: this.overViewDatas.nonHeap_CommittedSize,
          },
          {
            data: this.overViewDatas.processPhysical_MemoryUsedSize,
          },
          {
            data: this.overViewDatas.systemFreePhysical_MemorySize,
          },
          {
            data: this.overViewDatas.gc_activity,
          },
          {
            data: this.overViewDatas.classes,
          },
          {
            data: this.overViewDatas.threads_RUNNABLE,
          },
          {
            data: this.overViewDatas.threads_WAITING,
          },
          {
            data: this.overViewDatas.threads_BLOCKED,
          },
          {
            data: this.overViewDatas.cpu_load_total,
          },
          {
            data: this.overViewDatas.cpu_load_progress,
          }
        ]
      });
      this.setLeft();
    }
  }
  public updateXAxisData() {
    if (this.xAxisData.length > Number(this.limitTime) * 60) {
      this.xAxisData.shift();
      this.realTime.shift();
      this.decreseSeriesData();
    }
    this.timeLineDetail.setTimeData(this.xAxisData);
  }
  public decreseSeriesData() {
    this.overviewItems.forEach(item => {
      this.overViewDatas[item].shift();
    });
  }

  /**
   * 更新时间轴
   */
  public upDateTimeLine(data: any) {
    this.option.dataZoom[0].start = data.start;
    this.option.dataZoom[0].end = data.end;
    this.overviewEchart.setOption({
      dataZoom: this.option.dataZoom
    });
  }
  onChartInit(ec: any) {
    this.overviewEchart = ec;
    this.overviewEchart.on('datazoom', (params: any) => {  // 放大缩小时调用接口
      this.timeLineDetail.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
    });
  }

  /**
   * 时间轴筛选
   */
  public timeLineData(e: any) {
    this.timeLine = e;
    this.upDateTimeLine(e);
  }
}
