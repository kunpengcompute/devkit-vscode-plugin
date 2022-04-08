import { Component, OnInit, OnDestroy, ViewChild, SecurityContext } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
import { LibService } from '../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-sample-objects',
  templateUrl: './sample-objects.component.html',
  styleUrls: ['./sample-objects.component.scss']
})
export class SampleObjectsComponent implements OnInit, OnDestroy {
  constructor(
    private stompService: StompService,
    private route: ActivatedRoute,
    private router: Router,
    public i18nService: I18nService,
    private msgService: MessageService,
    private downloadService: SamplieDownloadService,
    public libService: LibService,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.columns = [
      {
        title: 'Class',
        sortKey: 'name',
        width: '30%'
      },
      {
        title: 'Maximum Real Time Count',
        sortKey: 'maxRealCount',
        width: '20%'
      },
      {
        title: 'Maximum Real Time Size',
        sortKey: 'maxRealSize',
        width: '20%'
      },
      {
        title: 'Total Allocation',
        sortKey: 'tlabSize',
        width: '20%'
      }
    ];
    this.searchValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.protalserver_sampling_object_class.name
      }
    );
  }
  @ViewChild('stackTrace') stackTrace: any;
  public stompClient: any;
  public recordId = '';
  public topicUrl = '';
  public typeOptions: any = [];
  public typeSelected = {};
  public objectTlabs: any = [];

  // 表格部分
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public noDadaInfo = '';
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchKeys: Array<string> = ['name'];

  public memChart: any;
  public echartsInstance: any;
  public xLabels: any = [];
  public xLabelTime: any = [];
  public seriesData: any = [];
  public stepXlabel = 0;
  public yearsInfo = '';
  public i18n: any;

  public dataLens = 0;
  public objDatas: Array<any> = [];

  // stack trace部分
  public stackTranceData: Array<TiTreeNode> = [];
  public stackTotalCount = 0;

  private currentSelClass: any;

  private wsFinishSub1: any;
  private wsFinishSub2: any;
  public stackTraceCache = {};
  public isFileFinish = false;
  public isStackFinish = false;
  public curentStacktrace: any = [];
  public newStackTraceMap = {};
  // 栈跟踪类型
  public eventType = 'OBJECT';
  // 栈跟踪请求数据需要
  public index = '';
  public stackTraceTime: any;
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  ngOnInit() {
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.recordId = this.getRecordId();
    this.msgService.sampleObjectIsLock = false;
    this.msgService.sampleObjectStackIsLock = false;
    this.handleImportCache();
    this.totalNumber = this.srcData.data.length;
    if (this.srcData.data.length === 0) {
      this.getSamplingData('object', this.recordId);
      this.getSamplingData('object_stacktrace', this.recordId);
      this.showLoding();
    } else {
      if (!this.isFileFinish || !this.isStackFinish) {
        this.msgService.handleSampleObjectResend();
      }
      let tempTimer = setTimeout(() => {
        this.showClassMemory(this.srcData.data[0], 0);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
    }

    this.wsFinishSub1 = this.msgService.getSampleObjectMessage().subscribe(msg => {
      if (msg.type === 'OBJECT') {
        if (msg.content === 'FINISH_FLAG') {
          this.isFileFinish = true;
          this.closeLoding();
          if (this.isStackFinish && this.isFileFinish) {
            this.getStraceTraceData();
          }
          return;
        }
        this.getObject(msg);
      }
      if (msg.type === 'OBJECT_FRAMES_MAP') {
        this.handleObjectStackTracesMap(msg);
      }
    });
    this.wsFinishSub2 = this.msgService.getSampleObjectStacktraceMessage().subscribe(msg => {
      if (msg.type === 'OBJECT_STACKTRACE') {
        if (msg.content === 'FINISH_FLAG') {
          this.closeLoding();
          this.isStackFinish = true;
          if (this.isStackFinish && this.isFileFinish) {
            this.getStraceTraceData();
          }
          return;
        }
      }
    });
  }

  ngOnDestroy() {
    if (!this.isFileFinish || !this.isStackFinish) {
      this.msgService.sampleObjectIsLock = false;
      this.msgService.sampleObjectStackIsLock = false;
    }
    this.handleSaveCache();
    if (this.wsFinishSub1) { this.wsFinishSub1.unsubscribe(); }
    if (this.wsFinishSub2) { this.wsFinishSub2.unsubscribe(); }
    this.closeLoding();
  }
  /**
   * 点击表格
   * @param row 表格某行
   * @param index 某行对应的位置
   */
  public showClassMemory(row: any, index: number) {
    this.srcData.data.forEach((item, idx) => { item.isSelect = index === idx; });
    this.seriesData = row.echartDatas.seriesData;
    this.xLabels = row.echartDatas.xLabels;
    this.yearsInfo = this.libService.dateFormat(row.echartDatas.time[0], 'yyyy/MM/dd');
    this.stepXlabel = row.echartDatas.stepXlabel;
    this.currentSelClass = row;
    this.stackTraceTime = '';
    if (this.isStackFinish && this.isFileFinish) {
      this.getStraceTraceData();
    }
    this.initMem();
  }
  /**
   * 处理从websocket获取的数据
   * @param data websocket数据
   */
  private getObject(data: any) {
    if (data.type === 'OBJECT') {
      this.srcData.data = [];
      this.objectTlabs = this.objectTlabs.concat(data.content);
      const srcDatas: any = [];
      this.objectTlabs.forEach((obj: any, idx: any) => {
        const echartDatas: any = {
          xLabels: [],
          time: [],
          stepXlabel: 0,
          seriesData: [],
        };
        const sortedSegMents = this.sortObjects(obj.segments);
        sortedSegMents.forEach((seg: any) => {
          echartDatas.stepXlabel = seg.durationSec;
          const xlabel = this.libService.dateFormat(seg.startTimeMilliSec, 'hh:mm:ss');
          echartDatas.xLabels.push(xlabel);
          echartDatas.time.push(seg.startTimeMilliSec);
          const estimatedSize = seg.estimatedSize ? Math.floor(seg.estimatedSize) : 0;
          echartDatas.seriesData.push(estimatedSize);
        });
        srcDatas.push({
          name: obj.className,
          isSelect: idx === 0,
          tlabSize: obj.estimatedSize ? Math.floor(obj.estimatedSize * 1000 / 1024 / 1024) / 1000 : '',
          maxRealCount: obj.maxInstanceCount,
          maxRealSize: obj.maxSize ? Math.floor(obj.maxSize * 1000 / 1024 / 1024) / 1000 : '',
          stackTrace: [],
          echartDatas,
        });
      });
      this.srcData.data = srcDatas;
      this.totalNumber = this.srcData.data.length;
      if (!this.currentSelClass) {
        this.showClassMemory(srcDatas[0], 0);
      }
    }
  }
  /**
   * 处理websocket栈MAP
   * @param msg websocket栈MAP
   */
  public handleObjectStackTracesMap(msg: any) {
    this.newStackTraceMap = msg.content;
  }
  /**
   * 初始化右侧echarts
   */
  public initMem() {
    const that = this;
    const option = {
      color: ['#5D89D8'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        },
        backgroundColor: '#ffffff',
        borderRadius: 5,
        padding: [8, 20, 8, 20],
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
          fontSize: 12
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any): any => {
          if (!params.length) { return; }
          let html = '';
          params.forEach((item: any) => {
            if (item.seriesName === that.i18n.protalserver_sampling_object_memory) {
              const currentEData = this.currentSelClass.echartDatas;
              const stepXlabel = currentEData.stepXlabel;
              const idx = currentEData.xLabels.indexOf(item.name);
              const time = currentEData.time[idx];
              const year = that.libService.dateFormat(currentEData.time[idx], 'yyyy/MM/dd');
              html += `
              <div>
                <div>
                  <span>At ${year + ' ' + that.libService.dateFormat(time - stepXlabel * 1000, 'hh:mm:ss')} -
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, item.axisValue)}</span>
                </div>
                <div style='margin-top:8px'>
                  <span style='width:8px;height:8px;display:inline-block;background:#5D89D8'></span>
                  <span>${that.i18n.protalserver_sampling_object_memory}[${stepXlabel}s] =
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, this.libService.onChangeUnit(item.data))}</span>
                </div>
              </div>
              `;
            }
          });
          return html;
        }
      },
      grid: {
        left: '0%',
        right: '4%',
        top: '2%',
        bottom: '2%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: this.xLabels,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            show: true,
            interval: 'auto', // 坐标轴刻度标签的相关设置
            rotate: 30
          }
        }
      ],
      yAxis: [
        {
          type: 'value',

          axisLabel: {
            formatter: (value: any, index: any) => {
              value = this.libService.onChangeUnit(value);
              return value;
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          }
        }
      ],
      series: [
        {
          name: this.i18n.protalserver_sampling_object_memory,
          type: 'bar',
          barWidth: '35%',
          data: this.seriesData
        }
      ]
    };
    this.memChart = option;
    let tempTimer = setTimeout(() => {
      this.echartsInstance.setOption(this.memChart, true);
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 200);
  }
  /**
   * 点击echarts中某个时间点
   * @param e echarts中某个时间点
   */
  public chartClick(e: any) {
    if (this.currentSelClass) {
      this.stackTotalCount = 0;
      this.stackTranceData = [];
      this.curentStacktrace = [];
      const startTime = this.currentSelClass.echartDatas.time[e.dataIndex] / 1000;
      this.stackTraceTime = startTime;
      if (this.isStackFinish && this.isFileFinish) {
        this.getStraceTraceData();
      }
    }
  }
  /**
   * 初始化echarts
   * @param e echarts
   */
  public onChartInit(e: any) {
    this.echartsInstance = e;
  }
  /**
   * 把数据按时间升序排序
   * @param objects websocket数据
   */
  private sortObjects(objects: any) {
    const sortedObjs = objects.sort((a: any, b: any) => {
      return a.startTimeMilliSec - b.startTimeMilliSec;
    });
    return sortedObjs;
  }

  private showLoding() {
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('sample-loading-box').style.display = 'none';
  }
  /**
   * 开始获取内存数据
   * @param type 获取数据类型
   * @param data recordId
   */
  public getSamplingData(type: string, data: string) {
    const uuid = this.libService.generateConversationId(8);
    const requestUrl = `/user/queue/sample/records/${data}/${uuid}/${type}`;
    this.stompService.subscribeStompFn(requestUrl);
    this.stompService.startStompRequest('/cmd/sub-record', {
      recordId: data,
      recordType: type.toUpperCase(),
      uuid
    });
  }
  /**
   * 从URL中获取recordId
   */
  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    if (path) {
      const lastIndex = params.lastIndexOf('/' + path);
      params = params.slice(0, lastIndex);
    }
    return params.replace('/objects', '');
  }
  /**
   * 获取点击某行的栈信息
   */
  public getStraceTraceData() {
    const currentSelClass = this.currentSelClass ? `${this.currentSelClass.name}` : '';
    const stackTraceTime = this.stackTraceTime ? `#${this.stackTraceTime}` : '';
    this.index = encodeURIComponent(`${currentSelClass}${stackTraceTime}`);
    if (Object.keys(this.stackTrace.strackTraceMap).length === 0) {
      this.stackTrace.strackTraceMap = this.newStackTraceMap;
    }
    this.stackTrace.getStraceTraceData(this.index);
  }
  public handleSaveCache() {
    this.downloadService.downloadItems.object.stackTraceMap = this.newStackTraceMap;
    this.downloadService.downloadItems.object.data = this.srcData.data;
    this.downloadService.downloadItems.object.isFileFinish = this.isFileFinish;
    this.downloadService.downloadItems.object.isStackFinish = this.isStackFinish;
  }
  public handleImportCache() {
    this.srcData.data = this.downloadService.downloadItems.object.data;
    this.newStackTraceMap = this.downloadService.downloadItems.object.stackTraceMap;
    this.isFileFinish = this.downloadService.downloadItems.object.isFileFinish;
    this.isStackFinish = this.downloadService.downloadItems.object.isStackFinish;
  }
  /**
   * 搜索
   * @param value value
   */
  keySearch(value: string): void {
    this.searchWords[0] = value;
  }
  searchClear(value: string): void {
    this.searchWords[0] = '';
  }
}
