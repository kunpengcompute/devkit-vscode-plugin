import { Component, OnInit, OnDestroy, ViewChild, SecurityContext } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
} from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { SamplieDownloadService } from '../../../service/samplie-cache.service';
import { LibService } from '../../../service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';
import { graphic } from 'echarts';

@Component({
  selector: 'app-sample-socket-io',
  templateUrl: './sample-socket-io.component.html',
  styleUrls: ['./sample-socket-io.component.scss']
})
export class SampleSocketIoComponent implements OnInit, OnDestroy {
  socketIOWorker: Worker;
  @ViewChild('ioTimeLine') ioTimeLine: any;
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
    this.echartsTitle = this.i18n.io.fileIo.socketIORate;
    this.echartsLegendData = [this.i18n.io.fileIo.readRate, this.i18n.io.fileIo.writeRate];
    // 左侧
    this.columnsTable = [
      {
        title: this.i18n.io.fileIo.smapSocketPath,
        width: '40%',
        sortKey: 'path'
      },
      {
        title: this.i18n.io.fileIo.totalTime,
        width: '10%',
        sortKey: 'totalIOTime',
        isSort: true
      },
      {
        title: this.i18n.io.fileIo.count,
        width: '10%',
        sortKey: 'totalCount',
        isSort: true
      },
      {
        title: this.i18n.io.fileIo.readCount,
        width: '10%',
        sortKey: 'readCount',
        isSort: true
      },
      {
        title: this.i18n.io.fileIo.writeCount,
        width: '10%',
        sortKey: 'writeCount',
        isSort: true
      },
      {
        title: this.i18n.io.fileIo.readByteCount,
        width: '10%',
        sortKey: 'bytesRead',
        isSort: true
      },
      {
        title: this.i18n.io.fileIo.writeByteCount,
        width: '10%',
        sortKey: 'bytesWritten',
        isSort: true
      }
    ];
    this.searchValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.remoteIp
      }
    );
  }
  @ViewChild('stackTrace') stackTrace: any;
  private μs = 1000;
  private ms = Math.pow(1000, 2);
  private s = Math.pow(1000, 3);
  public i18n: any;
  public selectTable: any;
  public selectTableIndex: any = [];
  public firstIndex: any;
  public secondIndex: any;
  public thirdIndex: any;
  public chartId = Math.floor(Math.random() * 10000000000);
  public closeLoad = false;
  public tableListData: any = [];
  public socketIOData = {};
  public socketIOStacktrace = {};
  public echartsOption: any = {
    option: {},
    timeList: [],
    readSpeed: [],
    writeSpeed: []
  };
  public recordId: any;
  public filePathSelect = '';
  public fileFdSelected = '';
  public filethreadSelect = '';
  // 左侧 表格部分
  public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTable: TiTableSrcData;
  public columnsTable: Array<TiTableColumns> = [];
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchKeys: Array<string> = ['path'];
  public closeOtherDetails = true;
  public noDadaInfo = '';
  public thirdLevel = false;
  public expand = false;

  // echarts
  public echartsInterval: any;
  public echartsName: any;
  public tableFileName: string;
  public tableFileId: any;
  public echartsLegendData: any = [];
  public echartsLabelTop: any;
  public echartsLabelBottom: any;
  public updateOption = {};

  public wsFinishSub1: any;
  public wsFinishSub2: any;
  public fileDatas: any;
  public echartsTitle: string;
  public ioData: any = [];
  public totalCount = 0;
  public isFileFinish = false;
  public isStackFinish = false;
  public eventType = 'SOCKET_IO';
  public index = '';
  public newStackTraceMap = {};
  public currentHostTableList: any = [];
  public currentHostTableListTop: any = [];
  public currentFdTableList: any = [];
  public currentFdTableListTop: any = [];
  public timeData: any = [];
  public echartsInstance: any;
  // 表格分页
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public tempTimer: Array<any> = [];
  public finish: Array<boolean> = [];
  ngOnInit() {
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.srcDataTable = {
      data: this.tableListData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.recordId = this.getRecordId();
    this.msgService.sampleSocketIOIsLock = false;
    this.msgService.sampleSocketIOStackIsLock = false;
    this.tableListData = this.downloadService.downloadItems.socketIO.data;
    this.newStackTraceMap = this.downloadService.downloadItems.socketIO.stackTraceMap;
    this.isStackFinish = this.downloadService.downloadItems.socketIO.isStackFinish;
    if (this.tableListData.length === 0) {
      this.getSamplingData('socket_io', this.recordId);
      this.getSamplingData('socket_stacktrace', this.recordId);
      this.showLoding();
    } else {
      this.closeLoad = true;
      this.handleTableListData();
      this.initChart();
      let tempTimer = setTimeout(() => {
        this.onDefaultClick();
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 0);
      if (!this.isFileFinish || !this.isStackFinish) {
        this.msgService.handleSampleSocketIOResend();
      }
    }
    if (typeof Worker !== 'undefined') {
      this.socketIOWorker = new Worker('./assets/worker/sampleSocketIO.worker.js');
      this.socketIOWorker.onmessage = ({ data }) => {
        this.tableListData.push(...data.tableListData);
        this.finish[2] = true;
        this.handleTableListData();
        this.onDefaultClick();
      };
    }
    this.wsFinishSub1 = this.msgService.getSampleSocketMessage().subscribe(msg => {
      if (msg.type === 'SOCKET_IO') {
        if (msg.content === 'FINISH_FLAG') {
          this.finish[0] = true;
          this.isFileFinish = true;
          let tempTimer = setTimeout(() => {
            this.getStraceTraceData();
            clearTimeout(tempTimer);
            tempTimer = null;
          }, 0);
          return;
        }
        if (this.socketIOWorker) {
          this.socketIOWorker.postMessage({
            type: 'sSocketioWorker',
            data: msg
          });
        }
      }
    });
    this.wsFinishSub1 = this.msgService.getSampleSocketStacktraceMessage().subscribe(msg => {
      if (msg.type === 'SOCKET_STACKTRACE' && msg.content === 'FINISH_FLAG') {
        this.finish[1] = true;
        this.isStackFinish = true;
        let tempTimer = setTimeout(() => {
          this.getStraceTraceData();
          clearTimeout(tempTimer);
          tempTimer = null;
        }, 0);
        return;
      }
      if (msg.type === 'SOCKET_IO_MAP') {
        this.handleStacktrace(msg);
      }
    });
    this.closeLoding();
  }
  ngOnDestroy() {
    if (!this.isFileFinish || !this.isStackFinish) {
      this.msgService.sampleSocketIOIsLock = true;
      this.msgService.sampleSocketIOStackIsLock = true;
    }
    this.downloadService.downloadItems.socketIO.data = this.srcDataTable.data;
    this.downloadService.downloadItems.socketIO.stackTraceMap = this.newStackTraceMap;
    this.downloadService.downloadItems.socketIO.isStackFinish = this.isStackFinish;
    if (this.wsFinishSub1) { this.wsFinishSub1.unsubscribe(); }
    if (this.wsFinishSub2) { this.wsFinishSub2.unsubscribe(); }
    this.tempTimer.forEach(item => {
      clearInterval(item);
    });
    if (this.socketIOWorker) {
      this.socketIOWorker.postMessage({
        type: 'sSocketioWorker_close',
        data: {}
      });
    }
  }
  public handleTableListData() {
    this.tableListData.forEach((item: any) => {
      item.children = this.handleViewData(item.threads);
      item.children.forEach((fd: any) => {
        fd.children = this.handleViewData(fd.threads);
      });
    });
    this.srcDataTable.data = this.tableListData;
  }
  public handleViewData(threadsData?: any): any {
    if (threadsData) {
      return Object.values(threadsData);
    }
  }
  public handleStacktrace(data: any) {
    this.newStackTraceMap = data.content[0];
  }
  public handleBasicIOData(target: any, path: any, baseIO: any) {
    if (!target[path]) {
      target[path] = {
        path,
        stackTrace: [],
        threads: {}
      };
    }
    target[path].stackTrace = baseIO.stackTraceTreeNode.children;
  }
  // 默认点击第一条
  public onDefaultClick() {
    if (!this.echartsName) {
      this.initChart();
      this.tableListData[0].showDetails = false;
      this.beforeToggle(this.tableListData[0]);
      this.onClickTableRow(this.tableListData[0], 0);
    }
  }
  public onClickTableRow(row: any, ...arg: any) {
    if (row) {
      this.handleEchartsData(row, arg);
      this.handleTableSelect(row, arg);
    }
  }
  public handleTableSelect(row: any, arg: any) {
    if (arg.length === 1) {
      this.filePathSelect = row.path;
      this.fileFdSelected = '';
      this.filethreadSelect = '';
    } else if (arg.length === 2) {
      this.fileFdSelected = row.path;
      this.filethreadSelect = '';
      this.handleFdSelectShow(row, arg);
    } else {
      this.filethreadSelect = row.path;
    }
    if (this.isStackFinish) {
      let tempTimer = setTimeout(() => {
        this.getStraceTraceData();
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 1000);
    }
  }
  private handleFdSelectShow(row: any, arg: any) {
    const path = row.path;
    const data: any = this.tableListData[arg[0]].threads;
    if (data != null) {
      for (const key of Object.keys(data)) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (path === key) {
            this.tableListData[arg[0]].threads[key].showDetails = !this.tableListData[arg[0]].threads[key].showDetails;
          } else {
            this.tableListData[arg[0]].threads[key].showDetails = false;
          }
        }
      }
    }
  }
  public handleEchartsData(row: any, arg: any) {
    this.echartsName = this.handleEchartsName(row, arg);
    this.echartsOption.timeList = this.hanldeEchartsTimeZone(row.timeList);
    this.echartsOption.readSpeed = row.readSpeed;
    this.echartsOption.writeSpeed = row.writeSpeed;
    this.handleEchartsUpdate();
  }
  public handleEchartsName(row: any, arg: any) {
    if (arg.length === 1) {
      return row.path;
    } else if (arg.length === 2) {
      const firstName = this.tableListData[arg[0]].path;
      return `${firstName}[${row && row.path}]`;
    } else {
      const firstName = this.tableListData[arg[0]].path;
      const setcondName = this.handleViewData(this.tableListData[arg[0]].threads)[arg[1]].path;
      return `${firstName}(${setcondName}[${row && row.path}])`;
    }
  }
  public hanldeEchartsTimeZone(timeZone: any) {
    let time = [];
    time = timeZone.map((item: any) => {
      return this.handleTimeFormat(item * 1000);
    });
    return time;
  }
  public handleTimeFormat(time: any) {
    const date = new Date(time);
    return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' +
      date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;
  }
  public handleEchartsUpdate() {
    this.timeData = this.echartsOption.timeList;
    if (this.ioTimeLine) {
      this.ioTimeLine.setTimeData(this.timeData);
    }
    this.updateOption = {
      xAxis: [{
        data: this.echartsOption.timeList
      }, {}],
      series: [{
        id: 'series1',
        data: this.echartsOption.readSpeed
      }, {
        id: 'series2',
        data: this.echartsOption.writeSpeed
      }]
    };
    const max1 = this.echartsOption.readSpeed;
    const max2 = max1.concat(this.echartsOption.writeSpeed);
    this.echartsLabelTop = this.libService.onChangeUnit(Math.max(...max2) * 1024) + '/s';
    this.echartsLabelBottom = 0;
  }
  // 点击后表格改变表格高度
  public onClickExpand(): void {
    this.expand = !this.expand;
  }
  private showLoding() {
    this.closeLoad = false;
    document.getElementById('sample-loading-box').style.display = 'flex';
  }
  private closeLoding() {
    const tempTimer = setInterval(() => {
      const flag = this.finish.filter(item => {
        return item;
      });
      if (flag.length === this.finish.length){
        clearInterval(tempTimer);
        document.getElementById('sample-loading-box').style.display = 'none';
        this.closeLoad = true;
      }
    }, 1000);
    this.tempTimer.push(tempTimer);
  }
  // io时间单位
  public onChangeTime(time: any): any {
    if (time < this.μs) {
      return time.toFixed(2) + ' ns';
    } else if (this.μs < time && time < this.ms) {
      return (time / this.μs).toFixed(2) + ' μs';
    } else if (this.ms < time && time < this.s) {
      return (time / this.ms).toFixed(2) + ' ms';
    } else if (this.s < time) {
      return (time / this.s).toFixed(2) + ' s';
    }
  }

  private getRecordId() {
    const url = this.router.url;
    const path = this.route.routeConfig.path;
    let params = url.slice(10);
    if (path) {
      const lastIndex = params.lastIndexOf('/' + path);
      params = params.slice(0, lastIndex);
    }
    return params.replace('/io', '');
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
  /**
   * 获取点击某行的栈信息
   */
  public getStraceTraceData() {
    if (!this.stackTrace) { return; }
    const filePath = this.filePathSelect;
    const fileFd = this.fileFdSelected ? `#${this.fileFdSelected}` : '';
    const thread = this.filethreadSelect ? `#${this.filethreadSelect}` : '';
    this.index = `${filePath}${fileFd}${thread}`;
    if (!Object.keys(this.stackTrace.strackTraceMap).length) {
      this.stackTrace.strackTraceMap = this.newStackTraceMap;
    }
    this.stackTrace.getStraceTraceData(this.index);
  }
  // 初始化echarts表格
  public initChart() {
    this.echartsOption.option = {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        padding: [8, 20, 8, 20],
        textStyle: {
          color: '#000000',
          fontSize: 12
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any) => {
          let html = '';
          let read = null;
          let write = null;
          if (params.length === 1) {
            const flag = params[0].seriesName === this.i18n.io.fileIo.readRate;
            if (flag) {
              read = params[0].data;
              read = +read > 1 ? this.libService.setThousandSeparator((+read).toFixed(2)) : (+read).toFixed(3);
              write = '0.000';
            } else {
              read = '0.000';
              write = params[0].data;
              write = +write > 1 ? this.libService.setThousandSeparator((+write).toFixed(2)) : (+write).toFixed(3);
            }
            html += `
                <div>
                  <div>${this.domSanitizer.sanitize(SecurityContext.HTML,
                     this.downloadService.dataSave.toolTipDate + ' ' +
                    params[0].axisValueLabel)}</div>
                  <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                  <div style="float:left;">
                    <span style="margin-right:8px;display: inline-block;
                    width: 8px;height: 8px;background-color:${params[0].color};"></span>
                    <span style='display:inline-block;'>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
                    </div>
                    <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML,
                      this.libService.onChangeUnit(+params[0].data * 1024))}/s</span>
                  </div>
                </div>
                  `;
          } else {
            read = params[0].data;
            write = params[1].data;
            read = this.libService.onChangeUnit(+read * 1024);
            write = this.libService.onChangeUnit(+write * 1024);
            html += `
                <div>
                  <div>${this.domSanitizer.sanitize(SecurityContext.HTML,
                     this.downloadService.dataSave.toolTipDate + ' ' +
                    params[0].axisValueLabel)}</div>
                  <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                  <div style="float:left;">
                    <span style="margin-right:8px;display: inline-block;
                    width: 8px;height: 8px;background-color:#267DFF;"></span>
                    <span style='display:inline-block;'>${this.i18n.io.fileIo.readRate}</span>
                  </div>
                    <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, read)}/s</span>
                  </div>
                  <div style='margin-top:8px;display:flex;justify-content: space-between; align-items: center;'>
                  <div style="float:left;">
                    <span style="margin-right:8px;display: inline-block;
                    width: 8px;height: 8px;background-color:#00BFC9;"></span>
                    <span style='display:inline-block;'>${this.i18n.io.fileIo.writeRate}</span>
                    </div>
                    <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, write)}/s</span>
                  </div>
                </div>
                  `;
          }
          return html;
        }
      },
      legend: {
        itemHeight: 10,
        itemWidth: 10,
        icon: 'rect',
        data: [this.i18n.io.fileIo.readRate, this.i18n.io.fileIo.writeRate],
        x: 'right',
        selectedMode: true
      },
      dataZoom: [
        {
          show: false,
          type: 'slider',
          realtime: true,
          top: 30,
          start: 0,
          end: 100,
          height: 32,
          showDataShadow: true,
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
        },
        {
          type: 'inside',
          realtime: true,
          showDataShadow: false   // 是否显示数据阴影
        }
      ],
      grid: {
        left: 90,
        right: 0,
        top: 90,
        height: 130
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          position: 'bottom',
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 2
            }
          },
          axisLabel: {
            padding: [11, 0, 0, 0],
            textStyle: {
              color: '#616161',
            },
          },
          axisTick: {
            show: true,
            color: '#E1E6EE',
            width: 2,
            length: 8,
          },
          splitLine: {
            interval: 0,
            lineStyle: {
              type: 'dashed',
              opacity: 0.3
            },
            show: true
          },
          data: this.echartsOption.timeList,
        },
        {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#E1E6EE',
              width: 2,
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          show: false,
          splitNumber: 1,
          splitLine: {
            show: false,
            lineStyle: {
              type: 'solid'
            }
          }
        }
      ],
      series: [
        {
          id: 'series1',
          name: this.i18n.io.fileIo.readRate,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#267DFF'
            }
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [{
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
          data: this.echartsOption.readSpeed
        },
        {
          id: 'series2',
          name: this.i18n.io.fileIo.writeRate,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00BFC9'
            }
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [{
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
          data: this.echartsOption.writeSpeed
        }
      ]
    };
  }
  /**
   * 展开之前
   * @param row 某行
   */
  public beforeToggle(row: TiTableRowData): void {
    this.currentHostTableList = [];
    this.currentHostTableListTop = [];
    this.currentHostTableList = row.children.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentHostTableListTop = this.currentHostTableList;
    row.showDetails = !row.showDetails;
  }
  /**
   * 第二层展开之前
   * @param row row
   */
  public beforeToggleSecond(row: TiTableRowData): void {
    this.currentHostTableListTop.forEach((e: any) => {
      if (row.path !== e.path) {
        if (Object.prototype.hasOwnProperty.call(e, 'showDetailsH')) {
          e.showDetailsH = false;
        }
      }
    });
    this.currentFdTableList = [];
    this.currentFdTableListTop = [];
    this.currentFdTableList = row.children.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentFdTableListTop = this.currentFdTableList;
    row.showDetailsH = !row.showDetailsH;
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
  onChartInit(ec: any) {
    this.echartsInstance = ec;
    window.onresize = this.echartsInstance.resize;
  }

  public timeLineData(event: any) {
    this.echartsOption.option.dataZoom[0].start = event.start;
    this.echartsOption.option.dataZoom[0].end = event.end;
    this.echartsInstance.setOption({
      dataZoom: this.echartsOption.option.dataZoom
    });
  }
  public handleDatazoom(event: any) {
    this.ioTimeLine.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }
}
