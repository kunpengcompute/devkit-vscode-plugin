import { Component, OnInit, ElementRef, OnDestroy, ViewChild, SecurityContext } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData
} from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as echarts from 'echarts/core';


@Component({
  selector: 'app-sample-memory',
  templateUrl: './sample-memory.component.html',
  styleUrls: ['./sample-memory.component.scss']
})
export class SampleMemoryComponent implements OnInit, OnDestroy {
  @ViewChild('TimeLine') TimeLine: any;
  constructor(
    private stompService: StompService,
    private route: ActivatedRoute,
    private router: Router,
    public i18nService: I18nService,
    private el: ElementRef,
    private downloadService: SamplieDownloadService,
    private msgService: MessageService,
    public libService: LibService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.selectData.searchOptions = [
      {
        label: this.i18n.protalserver_sampling_memory_gc_activity.cause,
        value: 'cause'
      },
      {
        label: this.i18n.protalserver_sampling_memory_gc_activity.collector_name,
        value: 'collector_name'
      }
    ];
    this.searchActive.placeholder = this.i18n.searchBox.mutlInfo;
    this.selectData.searchKey = this.selectData.searchOptions[0];
    this.searchKeys[0] = this.selectData.searchKey.value;
    this.selectDataRight.searchOptions = [
      {
        label: this.i18n.protalserver_sampling_memory_pause.pause_phase,
        value: 'gcId'
      },
      {
        label: this.i18n.protalserver_sampling_memory_pause.name,
        value: 'name'
      }
    ];
    this.searchPause.placeholder = this.i18n.searchBox.mutlInfo;
    this.selectDataRight.searchKey = this.selectDataRight.searchOptions[0];
    this.pauseSearchKeys[0] = this.selectDataRight.searchKey.value;
  }
  public activeData: any;
  public showEcharts = false;
  public noDataFlag = false;
  public recordId = '';
  public topicUrl = '';
  public stompClient: any;
  i18n: any;
  public timeData: any = [];
  public baseConfig = [
    {
      label: 'young',
      keywords: 'youngCollector',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'old',
      keywords: 'oldCollector',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'concurrent_thread',
      keywords: 'concurrentGCThreads',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'parallel_thread',
      keywords: 'parallelGCThreads',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'concurrent_display',
      keywords: 'explicitGCConcurrent',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'display_disabled',
      keywords: 'explicitGCDisabled',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'use_thread',
      keywords: 'usesDynamicGCThreads',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'time_ratio',
      keywords: 'gcTimeRatio',
      value: '',
      msg: true,
      msgValue: ''
    }
  ];
  public heapConfig = [
    {
      label: 'initial',
      keywords: 'initialSize',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'min_size',
      keywords: 'minSize',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'max_size',
      keywords: 'maxSize',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'isuse',
      keywords: 'usesCompressedOops',
      value: '',
      msg: true,
      msgValue: ''
    },
    {
      label: 'compressed',
      keywords: 'compressedOopsMode',
      value: '',
      msg: true,
      msgValue: ''
    },
    {
      label: 'address_size',
      keywords: 'heapAddressBits',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'objects_alignment',
      keywords: 'objectAlignment',
      value: '',
      msg: true,
      msgValue: ''
    }
  ];
  public youngGenConfig = [
    {
      label: 'min_size',
      keywords: 'minSize',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'max_size',
      keywords: 'maxSize',
      value: '',
      msg: false,
      msgValue: ''
    },
    {
      label: 'new_ratio',
      keywords: 'newRatio',
      value: '',
      msg: false,
      msgValue: ''
    }
  ];
  public survivorConfig = [
    {
      label: 'initial_lifttime',
      keywords: 'initialTenuringThreshold',
      value: '',
      msg: true,
      msgValue: ''
    },
    {
      label: 'max_lifttime',
      keywords: 'maxTenuringThreshold',
      value: '',
      msg: true,
      msgValue: ''
    }
  ];
  public tlabConfig = [
    {
      label: 'used',
      keywords: 'usesTLABs',
      value: '',
      msg: true,
      msgValue: ''
    },
    {
      label: 'min_tlab_size',
      keywords: 'minTLABSize',
      value: '',
      msg: true,
      msgValue: ''
    },
    {
      label: 'waste_limit',
      keywords: 'tlabRefillWasteLimit',
      value: '',
      msg: true,
      msgValue: ''
    }
  ];
  public middleTable: any = [];


  // 表格部分
  public displayedActivity: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataActivity: TiTableSrcData;
  public columnsActivity: Array<TiTableColumns> = [];
  public searchActive: any = {
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
  public searchWords: Array<string> = [this.searchActive.value];
  public searchKeys: Array<string> = [];

  public displayedPhase: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataPhase: TiTableSrcData;
  public columnsPhase: Array<TiTableColumns> = [];
  public noDadaInfo = '';
  public searchPause: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public selectDataRight: any = {
    searchOptions: [],
    searchKey: {
      label: '',
      value: ''
    }
  };
  public pauseSearchWords: Array<string> = [this.searchPause.value];
  public pauseSearchKeys: Array<string> = [];


  // echarts部分
  public overViewOption: any = {};
  public echartsInstance: any;
  public baseTop = 0;
  public gridHeight = 105;
  public uuid: any;
  public baseColor = '#E1E6EE';
  public ylabelColor = '#999';

  public getDataTimer: any = null;
  public dataLens = 0;
  public gcDatas: Array<any> = [];

  private gcStatisticAll: any = [];

  private wsFinishSub: Subscription;
  private wsFinishSug: Subscription;
  private importDataType = ['GC_STATISTIC', 'HEAP_STATISTICS', 'GC_CONFIGURATION', 'METASPACE_STATISTICS'];
  private GCEchartsCache: any = [];
  private GCEchartsMetaSpace: any = [];
  private handleDataList: any = {
    GC_CONFIGURATION: (type: any) => {
      this.configsInit(type);
    },
    GC_STATISTIC: (type: any) => {
      this.gcActivityInit(type);
    },
    HEAP_STATISTICS: () => {
      this.initChart();
    },
    METASPACE_STATISTICS: () => {
      this.initChart();
    }
  };
  public finishGC = false;
  public fold1 = true;
  public fold2 = true;
  public gcduration: any;
  public maxStopTime: any;
  public maxMemory: any;
  public maxMetaSpace: any;
  public expandFlag = false;
  public leftCurrentPage = 10;
  public leftTotalNumber = 0;
  public leftPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public rightCurrentPage = 10;
  public rightTotalNumber = 0;
  public rightPageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public finishReport = false;
  public suggestArr: any = [];
  public isSuggest = false;
  public hoverClose: string;
  public sugtype = 0;
  public toolTipDate = '';
  @ViewChild('analysis ', { static: false }) analysis: any;
  ngOnInit() {
    this.baseConfig.forEach(item => {
      if (item.label === 'time_ratio') {
        item.msgValue = this.i18n.protalserver_sampling_memory_gc.time_ratio_msgValue;
      }
    });
    this.heapConfig.forEach(item => {
      if (item.label === 'isuse') {
        item.msgValue = this.i18n.protalserver_sampling_memory_heap.isuse_msgValue;
      }
      if (item.label === 'compressed') {
        item.msgValue = this.i18n.protalserver_sampling_memory_heap.compressed_msgValue;
      }
      if (item.label === 'objects_alignment') {
        item.msgValue = this.i18n.protalserver_sampling_memory_heap.objects_alignment_msgValue;
      }
    });
    this.survivorConfig[0].msgValue = this.i18n.protalserver_sampling_memory_generation.initial_lifttime_msgValue;
    this.survivorConfig[1].msgValue = this.i18n.protalserver_sampling_memory_generation.max_lifttime_msgValue;
    this.tlabConfig[0].msgValue = this.i18n.protalserver_sampling_memory_generation.used_msgValue;
    this.tlabConfig[1].msgValue = this.i18n.protalserver_sampling_memory_generation.min_tlab_size_msgValue;
    this.tlabConfig[2].msgValue = this.i18n.protalserver_sampling_memory_generation.waste_limit_msgValue;
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.recordId = this.getRecordId();
    this.topicUrl = `/user/queue/sample/records/${this.recordId}`;
    this.uuid = this.libService.generateConversationId(12);
    this.srcDataActivity = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.srcDataPhase = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    this.columnsActivity = [
      {
        title: 'activity',
        width: '10%',
        isSort: true,
        sortKey: 'activity',
      },
      {
        title: 'cause',
        width: '35%'
      },
      {
        title: 'collector_name',
        width: '10%'
      },
      {
        title: 'before_memory',
        width: '15%',
        isSort: true,
        sortKey: 'before_memory'
      },
      {
        title: 'after_memory',
        width: '15%',
        isSort: true,
        sortKey: 'after_memory'
      },
      {
        title: 'longest_pause',
        width: '15%',
        isSort: true,
        sortKey: 'longest_pause'
      }
    ];
    this.columnsPhase = [
      {
        title: 'pause_phase',
        width: '30%'
      },
      {
        title: 'name',
        width: '30%'
      },
      {
        title: 'duration',
        width: '20%',
        isSort: true,
        sortKey: 'duration'
      },
      {
        title: 'start',
        width: '20%',
        isSort: true,
        sortKey: 'startTime'
      }
    ];
    this.middleTable = [
      this.i18n.protalserver_sampling_memory_gc.time_out,
      this.i18n.protalserver_sampling_memory_gc.heap, this.i18n.protalserver_sampling_memory_gc.meta_space
    ];
    this.importCache();
    if (!this.finishGC) {
      this.getSamplingData('gc', this.recordId);
      this.showLoding();
    } else {
      this.getphase(this.srcDataActivity.data[0], 0);
      this.showEcharts = this.activeData.heapUsed.length > 0;
      this.noDataFlag = this.activeData.heapUsed.length === 0;
      this.overViewOption = this.setOptions();
      return;
    }
    this.wsFinishSub = this.msgService.getSampleGCMessage().subscribe(msg => {
      if (msg.type === 'GC' && msg.content === 'FINISH_FLAG') {
        this.finishGC = true;
        this.closeLoding();
        this.initChart();
      }
      if (this.importDataType.indexOf(msg.type) > -1) {
        switch (msg.type) {
          case 'HEAP_STATISTICS':
            this.GCEchartsCache.push(...msg.content);
            break;
          case 'METASPACE_STATISTICS':
            this.GCEchartsMetaSpace.push(...msg.content);
            break;
          default:
            this.handleDataList[msg.type](msg);
            break;
        }
      }
    });
    this.wsFinishSug = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'GC') {
        this.suggestArr = msg.data;
      }
    });
  }
  ngOnDestroy(): void {
    this.downloadService.downloadItems.gc.isFinish = this.finishGC;
    this.downloadService.downloadItems.gc.baseConfig = this.baseConfig;
    this.downloadService.downloadItems.gc.heapConfig = this.heapConfig;
    this.downloadService.downloadItems.gc.youngGenConfig = this.youngGenConfig;
    this.downloadService.downloadItems.gc.survivorConfig = this.survivorConfig;
    this.downloadService.downloadItems.gc.tlabConfig = this.tlabConfig;
    this.downloadService.downloadItems.gc.activity = this.srcDataActivity.data;
    this.downloadService.downloadItems.gc.activeData = this.activeData;
    this.downloadService.downloadItems.gc.timeData = this.timeData;
    if (this.wsFinishSub) { this.wsFinishSub.unsubscribe(); }
    if (this.wsFinishSug) { this.wsFinishSug.unsubscribe(); }
    this.closeLoding();
  }
  public onHoverClose(msg?: any) {
    this.hoverClose = msg;
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
  activeSearch(value: string): void {
    this.searchKeys[0] = this.selectData.searchKey.value;
    this.searchWords[0] = value;
  }
  activeClear(value: string): void {
    this.searchWords[0] = '';
  }
  pauseSearch(value: string): void {
    this.pauseSearchKeys[0] = this.selectDataRight.searchKey.value;
    this.pauseSearchWords[0] = value;
  }
  pauseClear(value: string): void {
    this.pauseSearchWords[0] = '';
  }
  // 初始化echarts
  public initChart() {
    this.closeLoding();
    const echartData = this.GCEchartsCache;
    const axiosData: any = {
      pause: [],
      committedSize: [],
      heapUsed: [],
      usedMetaSpace: [],
      commitedMetaSpace: [],
    };
    const maxStopTimeArr: any = [];
    const maxMemoryArr: any = [];
    const maxMetaSpaceArr: any = [];
    if (this.GCEchartsMetaSpace.length) {
      this.GCEchartsMetaSpace.forEach((item: any, index: any) => {
        const time = this.libService.dateFormat(item.data[2], 'yyyy/MM/dd hh:mm:ss.S');
        axiosData.usedMetaSpace.push({
          value: [time, item.data[1], item.data[2]]
        });
        maxMetaSpaceArr.push(item.data[0]);
        axiosData.commitedMetaSpace.push({
          value: [time, item.data[0], item.data[2]]
        });
      });
    }
    if (echartData.length) {
      this.toolTipDate = this.libService.dateFormat(echartData[0].startTime, 'yyyy/MM/dd');
      echartData.forEach((item: any, index: any) => {
        let middlePauseData = 0;
        const time = this.libService.dateFormat(item.startTime, 'yyyy/MM/dd hh:mm:ss.S');
        if (item.when === 'After GC') {
          middlePauseData = new Date(item.startTime).getTime() - new Date(echartData[index - 1].startTime).getTime();
        } else {
          middlePauseData = 0;
        }
        maxMemoryArr.push(item.committedSize);
        axiosData.committedSize.push({
          value: [time, item.committedSize, item.startTime, item.when]
        });
        axiosData.heapUsed.push({
          value: [time, item.heapUsed, item.startTime, item.when]
        });
        maxStopTimeArr.push(middlePauseData);
        axiosData.pause.push({
          value: [time, middlePauseData, item.startTime, item.when]
        });
        if (time) {
          this.timeData.push(time.split(' ')[1].split('.')[0]);
          this.timeData = [...new Set(this.timeData)];
        }
      });
    }
    this.maxStopTime = Math.max(...maxStopTimeArr) + ' ms';
    this.maxMemory = this.libService.onChangeUnit(Math.max(...maxMemoryArr));
    this.maxMetaSpace = this.libService.onChangeUnit(Math.max(...maxMetaSpaceArr));
    this.showEcharts = axiosData.heapUsed.length > 0;
    this.noDataFlag = axiosData.heapUsed.length === 0;
    this.activeData = axiosData;
    this.overViewOption = this.setOptions();
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
    window.onresize = this.echartsInstance.resize;
  }
  chartClick(ec: any) {
    const when = ec.value[3];
    const startTime = ec.value[2];
    const key = when === 'Before GC' ? 'beforeGC' : 'afterGC';
    const currentGC = this.gcStatisticAll.find((item: any) => {
      return item[key].startTime === startTime;
    });
    let currentGCId = '';
    if (currentGC && currentGC[key].gcId) {
      currentGCId = currentGC[key].gcId;
      const acIndex = this.srcDataActivity.data.findIndex(active => {
        return active.activity === currentGCId;
      });
      if (acIndex >= 0) {
        this.getphase(this.srcDataActivity.data[acIndex], acIndex);
        const that = this;
        let tempTimer = setTimeout(() => {
          const elTr = that.el.nativeElement.querySelector(`#gc_activity_body tr:nth-child(${acIndex + 1})`);
          elTr.scrollIntoView();
          clearTimeout(tempTimer);
          tempTimer = null;
        });
      }
    }
  }
  private setOptions() {
    let option = {};
    option = {
      title: [
        {
          text: this.middleTable[0],
          textStyle: { color: '#222222', fontSize: 16 , fontWeight: 'normal', fontStyle: 'normal'},
          top: this.baseTop
        },
        {
          text: this.middleTable[1],
          textStyle: { color: '#222222', fontSize: 16 , fontWeight: 'normal', fontStyle: 'normal'},
          top: this.baseTop + this.gridHeight * 2
        },
        {
          text: this.middleTable[2],
          textStyle: { color: '#222222', fontSize: 16 , fontWeight: 'normal', fontStyle: 'normal'},
          top: this.baseTop + this.gridHeight * 4
        }],
      legend: [
        {
          data: [this.i18n.protalserver_sampling_memory_gc.time_out],
          type: 'scroll',
          icon: 'rect',
          top: this.baseTop,
          algin: 'left',
          right: 50,
          width: '35%',
          itemWidth: 8,
          itemHeight: 8,
          show: true,
          textStyle: {
            color: '#9ea4b3'
          }
        },
        {
          data: [this.i18n.protalserver_sampling_memory_gc.free_heap_size,
             this.i18n.protalserver_sampling_memory_gc.used_heap_size],
          type: 'scroll',
          icon: 'rect',
          top: this.baseTop + this.gridHeight * 2,
          algin: 'left',
          right: 50,
          width: '35%',
          itemWidth: 8,
          itemHeight: 8,
          show: true,
          textStyle: {
            color: '#9ea4b3'
          }
        }, {
          data: [this.i18n.protalserver_sampling_memory_gc.commited_meta_space,
             this.i18n.protalserver_sampling_memory_gc.used_meta_space],
          type: 'scroll',
          icon: 'rect',
          top: this.baseTop + this.gridHeight * 4,
          algin: 'left',
          right: 50,
          width: '35%',
          itemWidth: 8,
          itemHeight: 8,
          show: true,
          textStyle: {
            color: '#9ea4b3'
          },

        }
      ],
      tooltip: {
        trigger: 'axis',
        borderColor: 'rgba(50, 50, 50, 0)',
        borderWidth: 1,
        padding: [12, 16, 12, 16],
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#478cf1',
            width: 1.5
          }
        },
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
          fontSize: 12
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any): any => {
          if (params.length) {
            let html = ``;
            const time = `<div>${this.domSanitizer.sanitize(
              SecurityContext.HTML, this.toolTipDate + ' ' + params[0].axisValueLabel
            )}</div>`;
            if (params[0].seriesIndex === 0) {
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                  <span style='width:8px;height:8px;display:inline-block;
                  background:${params[0].color};margin-right:8px'></span>
                  <span style='display:inline-block'>
                  ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
              </div>
                <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                params[0].seriesIndex === 0 ?
                  this.libService.setThousandSeparator(params[0].data.value[1]) + ' ms' :
                  this.libService.setThousandSeparator((params[0].data.value[1] / 1024 / 1024).toFixed(2)) +
                   ' MiB')}</span>
              </div>
              `;
            } else if (params[0].seriesIndex === 1) {
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style='width:8px;height:8px;display:inline-block;background:${params[0].color};
                margin-right:8px'></span>
                <span style='display:inline-block'>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}
                </span>
              </div>
                <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                  this.libService.onChangeUnit(params[0].data.value[1] - params[1].data.value[1]))}</span>
              </div>
              `;
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style='width:8px;height:8px;display:inline-block;background:${params[1].color};
                margin-right:8px'></span>
                <span style='display:inline-block'>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].seriesName)}
                </span>
              </div>
                <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                  this.libService.onChangeUnit(params[1].data.value[1]))}</span>
              </div>
              `;
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style='margin-right:8px;'>
                  <span style='width:4.5px;height:8px;display:inline-block;background: ${params[0].color};'></span>
                  <span style='width:4.5px;height:8px;display:inline-block;margin-left:-4px;
                  background: ${params[1].color};'></span>
                </span>
                <span style='display:inline-block'>
                ${this.i18n.protalserver_sampling_memory_gc.committed_heap_size}
                </span>
              </div>
                <span  style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                  this.libService.onChangeUnit(params[0].data.value[1]))}</span>
              </div>
              `;
            } else if (params[0].seriesIndex === 3) {
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style='width:8px;height:8px;display:inline-block;background:${params[0].color};
                margin-right:8px'></span>
                <span style='display:inline-block'>
                ${this.i18n.protalserver_sampling_memory_gc.free_meta_space}
                </span>
              </div>
                <span  style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                  this.libService.onChangeUnit(params[0].data.value[1] - params[1].data.value[1]))}</span>
              </div>
              `;
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style='width:8px;height:8px;display:inline-block;background:${params[1].color};
                margin-right:8px'></span>
                <span style='display:inline-block'>
                ${this.domSanitizer.sanitize(SecurityContext.HTML, params[1].seriesName)}
                </span>
              </div>
                <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                  this.libService.onChangeUnit(params[1].data.value[1]))}</span>
              </div>
              `;
              html += `
              <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
              <div style="float:left;">
                <span style='width:8px;height:8px;display:inline-block;background-image: linear-gradient(to right,
                    ${params[0].color} , ${params[1].color});margin-right:8px'></span>
                <span style='display:inline-block'>
                ${this.i18n.protalserver_sampling_memory_gc.commited_meta_space}
                </span>
              </div>
                <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                  this.libService.onChangeUnit(params[0].data.value[1]))}</span>
              </div>
              `;
            }
            return time + html;
          }
        }
      },
      grid: [
        this.makeGrid(this.baseTop, {}),
        this.makeGrid(this.baseTop + this.gridHeight * 2, {
          show: false,
          height: this.gridHeight,
          z: 10
        }),
        this.makeGrid(this.baseTop + this.gridHeight * 4, {
          show: false,
          height: this.gridHeight,
          z: 10
        }),
      ],
      xAxis: [
        this.makeXAxis(0, {
          axisLabel: {
            show: true,
            color: '#9ea4b3'
          }
        }),
        this.makeXAxis(1, {
          axisLabel: {
            show: true,
            color: '#9ea4b3',
            interval: 0
          }
        }),
        this.makeXAxis(2, {
          axisLabel: {
            show: true,
            color: '#9ea4b3'
          }
        }),
      ],
      yAxis: [
        this.makeYAxis(0, {
          axisLabel: {
            show: true,
            color: '#9ea4b3',
            formatter(item: any) {
              return Math.ceil(item);
            }
          }
        }),
        this.makeYAxis(1, {
          axisLabel: {
            show: true,
            color: '#9ea4b3',
            formatter(item: any) {
              return Math.ceil(item / 1024 / 1024);
            }
          }
        }),
        this.makeYAxis(2, {
          axisLabel: {
            show: true,
            color: '#9ea4b3',
            formatter(item: any) {
              return Math.ceil(item / 1024 / 1024);
            }
          }
        }),
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1, 2],
        }
      ],
      series: [
        {
          name: this.i18n.protalserver_sampling_memory_gc.time_out,
          type: 'line',
          step: 'start',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 0,
          yAxisIndex: 0,
          lineStyle: { color: '#267DFF' },
          areaStyle: {
            color: '#267DFF',
            opacity: 0.2
          },
          itemStyle: {
            color: '#267DFF'
          },
          data: this.activeData.pause
        },
        {
          name: this.i18n.protalserver_sampling_memory_gc.free_heap_size,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 1,
          yAxisIndex: 1,
          lineStyle: { color: '#85A5FF' },
          areaStyle: { color: '#85A5FF', opacity: 1 },
          itemStyle: {
            normal: {
              color: '#85A5FF'
            }
          },
          data: this.activeData.committedSize
        },
        {
          name: this.i18n.protalserver_sampling_memory_gc.used_heap_size,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 1,
          yAxisIndex: 1,
          lineStyle: { color: '#597EF7' },
          areaStyle: { color: '#597EF7', opacity: 1 },
          itemStyle: {
            normal: {
              color: '#597EF7'
            }
          },
          data: this.activeData.heapUsed
        },
        {
          name: this.i18n.protalserver_sampling_memory_gc.commited_meta_space,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 2,
          yAxisIndex: 2,
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
            normal: {
              color: '#267DFF'
            }
          },
          data: this.activeData.commitedMetaSpace
        },
        {
          name: this.i18n.protalserver_sampling_memory_gc.used_meta_space,
          type: 'line',
          symbol: 'circle',
          symbolSize: 2,
          xAxisIndex: 2,
          yAxisIndex: 2,
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
            normal: {
              color: '#00BFC9'
            }
          },
          data: this.activeData.usedMetaSpace
        },
      ]
    };
    return option;
  }

  private makeXAxis(gridIndex: any, opt: any) {
    const options = {
      type: 'time',
      gridIndex,
      offset: 0,
      boundaryGap: ['20%', '20%'],
      axisLine: {
        onZero: true,
        lineStyle: {
          color: '#E1E6EE',
          width: 2
        }
      },
      axisTick: { show: true }, // 坐标轴刻度相关设置
      splitLine: {
        show: true,
        lineStyle: { color: this.baseColor },
        interval: 0
      },
      axisPointer: {
        lineStyle: {
          show: true,
          color: '#478cf1'
        }
      }
    };
    if (opt) { Object.assign(options, opt); }
    return options;
  }

  makeYAxis(gridIndex: any, opt: any) {
    const options = {
      type: 'value',
      show: true,
      gridIndex,
      nameLocation: 'middle',
      nameGap: 30,
      nameRotate: 0,
      offset: 10,
      nameTextStyle: {
        color: '#999',
        fontSize: 16
      },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: this.baseColor
        }
      },
      splitNumber: 2, // y轴刻度间隔
      min: 0
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }

  public makeGrid(top: any, opt: any) {
    const options = {
      top: top + 50,
      left: 60,
      right: 30,
      height: this.gridHeight
    };
    if (opt) {
      Object.assign(options, opt);
    }
    return options;
  }
  // echarts 排序数据
  private sortEchartsData(data: Array<any>) {
    const newData = data.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    return newData;
  }
  // GC活动
  private gcActivityInit(data: any) {
    if (data.type === 'GC_STATISTIC' && data.content.length) {
      this.srcDataActivity.data = [];
      this.srcDataPhase.data = [];
      this.gcStatisticAll = this.gcStatisticAll.concat(data.content);
      const activitys: any = [];
      this.gcStatisticAll.forEach((gc: any, index: any) => {
        const phases: any = [];
        gc.phases.forEach((ph: any) => {
          phases.push({
            gcId: this.levelForamt(ph.level),
            name: ph.name,
            duration: ph.duration,
            startTime: this.libService.dateFormat(ph.starTime, 'yyyy/MM/dd hh:mm:ss.S')
          });
        });
        activitys.push({
          isSelect: index === 0,
          activity: gc.gcStatistic.gcId,
          cause: gc.gcStatistic.cause,
          collector_name: gc.gcStatistic.name,
          before_memory: gc.gcStatistic.beforeGcHeap,
          after_memory: gc.gcStatistic.afterGcHeap,
          longest_pause: gc.gcStatistic.longestPause,
          phases
        });
      });
      this.srcDataActivity.data.push(...activitys);
      this.getphase(activitys[0], 0);
    }
  }

  private levelForamt(level: any) {
    let str = '';
    switch (level) {
      case 'LEVEL_I':
        str = 'GC Pause Phase Level 1';
        break;
      case 'LEVEL_II':
        str = 'GC Pause Phase Level 2';
        break;
      case 'LEVEL_III':
        str = 'GC Pause Phase Level 3';
        break;
      case 'LEVEL_IV':
        str = 'GC Pause Phase Level 4';
        break;
      default:
        break;
    }
    return str;
  }

  public getphase(row: any, idx: any) {
    this.srcDataPhase.data = [];
    this.srcDataPhase.data = row.phases;
    this.srcDataActivity.data.forEach((item, index) => {
      item.isSelect = idx === index;
    });
  }
  // GC配置信息
  private configsInit(data: any) {
    const configs = data;
    if (configs.type === 'GC_CONFIGURATION' && configs.content.length) {
      const baseConfig = configs.content[0].basicConfig;
      const heapConfig = configs.content[0].heapConfig;
      const youngGenConfig = configs.content[0].youngGenConfig;
      const survivorConfig = configs.content[0].survivorConfig;
      const tlabConfig = configs.content[0].tlabConfig;
      this.baseConfig.forEach(item => {
        item.value = baseConfig[item.keywords];
      });
      this.heapConfig.forEach((item, index) => {
        switch (index) {
          case 0:
          case 1:
          case 2:
            item.value = this.libService.onChangeUnit(heapConfig[item.keywords]);
            break;
          case 3:
          case 4:
            item.value = heapConfig[item.keywords];
            break;
          case 5:
            item.value = heapConfig[item.keywords] + '-bit';
            break;
          case 6:
            item.value = heapConfig[item.keywords] + ' B';
            break;
          default:
            break;
        }
      });
      this.youngGenConfig.forEach((item, index) => {
        switch (index) {
          case 0:
          case 1:
            item.value = this.libService.onChangeUnit(youngGenConfig[item.keywords]);
            break;
          case 2:
            item.value = item.keywords && youngGenConfig[item.keywords];
            break;
          default:
            break;
        }
      });
      this.survivorConfig.forEach(item => {
        item.value = item.keywords && survivorConfig[item.keywords];
      });
      this.tlabConfig.forEach((item, index) => {
        switch (index) {
          case 0:
            item.value = tlabConfig[item.keywords];
            break;
          case 1:
            if (
              (tlabConfig[item.keywords] / 1024).toString().indexOf('.') > -1
            ) {
              item.value =
                (tlabConfig[item.keywords] / 1024).toFixed(3) + ' KiB';
            } else {
              item.value = tlabConfig[item.keywords] / 1024 + ' KiB';
            }
            break;
          case 2:
            if (tlabConfig[item.keywords].toString().indexOf('.') > -1) {
              item.value = tlabConfig[item.keywords].toFixed(3) + ' B';
            } else {
              item.value = tlabConfig[item.keywords] + ' B';
            }
            break;
          default:
            break;
        }
      });
    }
  }

  private showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }
  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    if (path) {
      const lastIndex = params.lastIndexOf('/' + path);
      params = params.slice(0, lastIndex);
    }
    return params;
  }

  connectWs() {
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: this.recordId
    });
  }
  public getSamplingData(type: any, data: any) {
    const uuid = this.libService.generateConversationId(8);
    const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
    this.stompService.subscribeStompFn(requestUrl);
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: data,
      recordType: type.toUpperCase(),
      uuid
    });
  }
  public importCache() {
    this.baseConfig = this.downloadService.downloadItems.gc.baseConfig.length > 0
      ? this.downloadService.downloadItems.gc.baseConfig
      : this.baseConfig;
    this.heapConfig = this.downloadService.downloadItems.gc.heapConfig.length > 0
      ? this.downloadService.downloadItems.gc.heapConfig
      : this.heapConfig;
    this.youngGenConfig = this.downloadService.downloadItems.gc.youngGenConfig.length > 0
      ? this.downloadService.downloadItems.gc.youngGenConfig
      : this.youngGenConfig;
    this.survivorConfig = this.downloadService.downloadItems.gc.survivorConfig.length > 0
      ? this.downloadService.downloadItems.gc.survivorConfig
      : this.survivorConfig;
    this.tlabConfig = this.downloadService.downloadItems.gc.tlabConfig.length > 0
      ? this.downloadService.downloadItems.gc.tlabConfig
      : this.tlabConfig;
    this.srcDataActivity.data = this.downloadService.downloadItems.gc.activity;
    this.activeData = this.downloadService.downloadItems.gc.activeData;
    this.timeData = this.downloadService.downloadItems.gc.timeData;
    this.finishGC = this.downloadService.downloadItems.gc.isFinish;
    this.suggestArr = this.downloadService.downloadItems.gc.suggestArr;
  }
  public unfold() {
    const item = document.getElementById('configData');
    this.fold1 = !this.fold1;
    if (this.fold1) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  }
  public unfoldTable() {
    const item = document.getElementById('gcConfig');
    this.fold2 = !this.fold2;
    if (this.fold2) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  }
  public maxData(data: any) {
    if (!data || !data.length) { return 0; }
    return data.sort((a: any, b: any) => b - a)[0];
  }
  public expandTable() {
    this.expandFlag = !this.expandFlag;
  }
  public timeLineData(event: any) {
    this.overViewOption.dataZoom[0].start = event.start;
    this.overViewOption.dataZoom[0].end = event.end;
    this.echartsInstance.setOption({
      dataZoom: this.overViewOption.dataZoom
    });
  }
  public handleDatazoom(event: any) {
    this.TimeLine.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }
}
