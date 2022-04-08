import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild, SecurityContext } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { MytipService } from '../../../service/mytip.service';
import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiTreeNode,
  TiTreeComponent,
  TiValidators,
  TiTreeUtil
} from '@cloud/tiny3';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { LibService } from '../../../service/lib.service';
import { AxiosService } from '../../../service/axios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-socket-io',
  templateUrl: './socket-io.component.html',
  styleUrls: ['./socket-io.component.scss']
})
export class SocketIoComponent implements OnInit, OnDestroy {
  socketIOWorker: Worker;
  @ViewChild('ioTimeLine') ioTimeLine: any;
  @Input() snapShot: boolean;
  @Input() snapShotData: any;
  @Input() leftState: boolean;
  constructor(
    private stompService: StompService,
    public i18nService: I18nService,
    private msgService: MessageService,
    public downloadService: ProfileDownloadService,
    private el: ElementRef,
    public mytip: MytipService,
    public libService: LibService,
    public Axios: AxiosService,
    public fb: FormBuilder,
    public regularVerify: RegularVerify,
    public domSanitizer: DomSanitizer
  ) {
    this.i18n = this.i18nService.I18n();
    this.echartsTitle = this.i18n.io.fileIo.socketIORate;
    this.tipStr = this.i18n.io.socketIoTip;
    // 左侧
    this.columnsTable = [
      {
        title: this.i18n.io.fileIo.socketPath,
        width: '28%',
        sortKey: 'ip'
      },
      {
        title: this.i18n.io.fileIo.totalTime,
        width: '12%',
        isSort: true,
        sortKey: 'duration'
      },
      {
        title: this.i18n.io.fileIo.count,
        width: '12%',
        isSort: true,
        sortKey: 'count'
      },
      {
        title: this.i18n.io.fileIo.readCount,
        width: '12%',
        isSort: true,
        sortKey: 'rCount'
      },
      {
        title: this.i18n.io.fileIo.writeCount,
        width: '12%',
        isSort: true,
        sortKey: 'wCount'
      },
      {
        title: this.i18n.io.fileIo.readByteCount,
        width: '12%',
        isSort: true,
        sortKey: 'rByte'
      },
      {
        title: this.i18n.io.fileIo.writeByteCount,
        width: '12%',
        isSort: true,
        sortKey: 'wByte'
      }
    ];
    this.columnsTableTime = [{
      title: this.i18n.io.fileIo.threadName,
      width: '20%',
      sortKey: 'threadName'
    },
    {
      title: this.i18n.io.fileIo.operateType,
      width: '13%',
      filter: true,
      sortKey: 'type',
      key: 'type',
      selected: [], // 该列的 headfilter 下拉选中项
      options: [{
        label: 'read'
      }, {
        label: 'write'
      }, {
        label: 'open'
      }, {
        label: 'close'
      }],
      multiple: true,
      selectAll: true
    },
    {
      title: this.i18n.io.fileIo.operateTime,
      width: '20%',
      isSort: true,
      sortKey: 'start'
    },
    {
      title: this.i18n.io.fileIo.rAndWBytes,
      width: '17%',
      isSort: true,
      sortKey: 'byte'
    },
    {
      title: this.i18n.io.fileIo.eventRate,
      width: '15%',
      isSort: true,
      sortKey: 'rate'
    },
    {
      title: this.i18n.io.fileIo.duration,
      width: '15%',
      isSort: true,
      sortKey: 'duration'
    }];
    this.searchValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.remoteIp
      }
    );
    this.searchThreadValue.placeholder = this.i18nService.I18nReplace(
      this.i18n.searchBox.info,
      {
        0: this.i18n.io.fileIo.threadName
      }
    );
    this.socketIOGroup = fb.group({
      socketIO_threshold: new FormControl(256, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(10485760),
        ],
        updateOn: 'change',
      }),
    });
  }
  // sampling配置
  public socketIOGroup: FormGroup;
  public socketIOBlur: SpinnerBlurInfo;
  private K = 1024;
  private MB = 1024 * 1024;
  private GB = 1024 * 1024 * 1024;
  private TB = 1024 * 1024 * 1024 * 1024;
  private μs = 1000;
  private ms = Math.pow(1000, 2);
  public i18n: any;
  public echartsTitle: string;
  public tableListData: any = [];
  public beginFileIo = false;
  public Threshold = 1;
  public tipStr: string;
  public jvmId: any;
  public guardianId: any;
  public formatData = {};
  public ioData: any = [];
  public isStopFlag = true;
  public totalCount = 0;
  public echartsName: string;
  public threshold = {
    label: '',
    min: 1,
    max: 10485760,
    rangeValue: [1, 10485760],
    value: 256,
    format: 'N0',
  };
  public filePath: any;
  public isDownload = false;
  public socketHostSelect: any;
  public socketFdSelect: any;
  public rightTableSelected: any;
  // 栈
  public stackTranceData: Array<TiTreeNode> = [];
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceData,
    false,
    false
  );
  public totalCountMonitor: any;
  // echarts
  public chartId = Math.floor(Math.random() * 10000000000);
  public echartsLabelTop: any;
  public echartsLabelBottom = 0;
  public echartsOption: any;
  public echartsLegendData: any = [];
  public echartsData: any = {
    timeList: [],
    readSpeed: [],
    writeSpeed: []
  };
  public updateOptions = {};
  public searchValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchWords: Array<string> = [this.searchValue.value];
  public searchKeys: Array<string> = ['ip'];
  public searchThreadValue: any = {
    placeholder: 'please input search key',
    value: ''
  };
  public searchThreadWords: Array<string> = [this.searchThreadValue.value];
  public searchThreadKeys: Array<string> = ['threadName'];
  public leftcurrentPage = 1;
  public lefttotalNumber = 0;
  public leftpageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  public currentPage = 1;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  // 左侧 表格部分
  public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTable: TiTableSrcData;
  public columnsTable: Array<TiTableColumns> = [];
  public displayedTable2: Array<TiTableRowData> = [];
  public closeOtherDetails = true;
  public noDadaInfo = '';
  public thirdLevel = false;
  public expand = false;
  public selectTableIndex: any = [];
  public selectTable: any;
  // 右侧 表格
  public displayedTableTime: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTableTime: TiTableSrcData;
  private dataTableTime: Array<TiTableRowData> = [];
  public columnsTableTime: Array<TiTableColumns> = [];
  public startBtnDisabled = false;
  private isStopMsgSub: Subscription;
  private socketIoSub: Subscription;
  public tip1Context: any;
  public snapCount: number;

  public socketIoBtnTip = '';


  public fileIPMap: any = {};
  public currentIpIndex: any = null;
  public currentHostIndex: any = null;
  public currentFdIndex: any = null;
  public isCurrentType = '';
  public currentEchartsIPName = '';
  public currentEchartsAddrName = '';
  public currentEchartsFdName = '';
  public currentStacktrace: any = [];
  public currentHostTableList: any = [];
  public currentHostTableListTop: any = [];
  public currentFdTableList: any = [];
  public currentFdTableListTop: any = [];
  private currnetEchartsData: any = {
    startTime: '',
    readSpeed: 0,
    writeSpeed: 0,
    readCount: 0,
    writeCount: 0
  };
  public socketIOEcharts: any;
  public spinnerValue = 10;
  public spinner = {
    label: '',
    max: 10000,
    min: 0,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public dataLimit: any = {
    limitTime: '',
    limitData: '',
    primaryTime: null,
    clearBuffer: 0.2,
    dataCount: 0,
  };
  public socketIOEchartsTimer: any;
  public stackBtnTip: string;
  public isDoSnapClick = true; // 防止重复点击
  public timeData: any = [];
  public socketTimeout: any = null;
  public analyzID: string;
  public timer: any = '';
  ngOnInit() {
    // 设置初始化第一列 headfilter 的选中项
    this.columnsTableTime[1].selected = [
      this.columnsTableTime[1].options[0], this.columnsTableTime[1].options[1], this.columnsTableTime[1].options[2],
      this.columnsTableTime[1].options[3]
    ];
    if (this.msgService) {
      this.msgService.clearProSocketMessage();
    }
    this.setSpinnerBlur();

    this.socketIoBtnTip = this.i18n.io.btn_tip_socket;
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    if (!this.snapShot) {
      this.leftState = true;
      this.tableListData = this.downloadService.downloadItems.pSocketIO.tableData;
      this.handleSnapShotCount('pSocketIO');
    }
    this.srcDataTable = {
      data: this.tableListData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    // 右侧
    this.srcDataTableTime = {
      data: this.dataTableTime,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };

    const role = sessionStorage.getItem('role');
    if (this.snapShot) { return; }
    const res = this.downloadService.downloadItems.pSocketIO.stackDepth;
    if (role === 'Admin') {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
    } else {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
    }
    if (this.isDownload) {
      this.hanldeDownloadData();
    } else {
      this.hanldeImportCache();
    }
    this.noDadaInfo = this.i18n.profileNoData.socketIo;
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.startBtnDisabled = true;
        this.beginFileIo = false;
        this.downloadService.dataSave.isSocketIOStart = false;
        this.clearSocketTimer();
      }
      if (msg.type === 'dataLimit' && !JSON.parse(sessionStorage.getItem('isProStop'))) {
        if (msg.data.type === 'socket_io') {
          if (msg.data.value > 50) {
            this.dataLimit.limitData = this.downloadService.dataLimit.socket_io.dataValue;
          }
          if (msg.data.value < 50) {
            this.dataLimit.limitTime = this.downloadService.dataLimit.socket_io.timeValue;
            this.echartsData.readSpeed = [];
            this.echartsData.writeSpeed = [];
            this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
            this.echartsLabelTop = null;
            this.updateEchartsData();
          }
        }
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.socketIOGroup.controls.socketIO_threshold.setValue(256);
        this.snapCount = 0;
        this.clearSocketTimer();
        this.clearData();
        this.getWorkerData();
      }
      if (msg.type === 'isClear' || msg.type === 'isClearOne') {
        this.clearData();
        this.getWorkerData();
      }
      if (msg.type === 'exportData') {
        this.handleSaveCache();
      }
      if (msg.type === 'setDeleteOne') {
        if (this.srcDataTable.data.length === 0) {
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
    this.getWorkerData();
    this.socketIoSub = this.msgService.getSocketMessage().subscribe(msg => {
      if (msg.type === 'psocketIO') {
        if (msg.data) {
          this.clearSocketTimer();
        }
        if (this.socketIOWorker) {
          this.socketIOWorker.postMessage({
            type: 'socketIOWs',
            data: msg.data
          });
        }
      }
    });
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.socketIOBlur = {
      control: this.socketIOGroup.controls.socketIO_threshold,
      min: 1,
      max: 10485760,
    };
  }

  /**
   * 微调器回填
   */
  public verifySpinnerValue(value: any) {
    this.regularVerify.setSpinnerInfo(value);
  }

  /**
   * 获取worker处理过的数据
   */
  public getWorkerData() {
    if (typeof Worker !== 'undefined') {
      this.socketIOWorker = new Worker('./assets/worker/profileSocketIO.worker.js');
      this.socketIOWorker.onmessage = ({ data }) => {
        this.handleAllData(data);
        if (this.socketIOEchartsTimer) {
          clearTimeout(this.socketIOEchartsTimer);
        }
        this.socketIOEchartsTimer = setTimeout(() => {
          this.handleLastCacheEchartsData();
          this.handleSaveCache();
        }, 1000);
        if (!this.socketIOEcharts) {
          this.initEchart();
        }
      };
    }
  }

  /**
   * 清除当前缓存数据
   */
  public clearData() {
    if (this.socketIOWorker) { this.socketIOWorker.terminate(); this.socketIOWorker = null; }
    this.srcDataTable.data = [];
    this.srcDataTableTime.data = [];
    this.stackTranceData = [];
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.timeData = this.echartsData.timeList;
    this.echartsLabelTop = null;
    this.fileIPMap = {};
    this.tableListData = [];
    this.handelClearCache();
    if (this.socketIOEcharts) {
      this.socketIOEcharts.clear();
      this.socketIOEcharts = null;
    }
  }
  ngOnDestroy() {
    window.onresize = null;
    if (this.isDownload || this.snapShot) { return; }
    this.handleSaveCache();
    this.socketIOWorker.postMessage({
      type: 'socketIOWs_close',
      data: ''
    });
    this.msgService.sendMessage({ type: 'getDeleteOne' });  // 清除本页面的发送事件
    if (this.socketIOWorker) { this.socketIOWorker.terminate(); this.socketIOWorker = null; }
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    if (this.socketIoSub) { this.socketIoSub.unsubscribe(); }
    if (this.stompService.socketIOTimer) { clearInterval(this.stompService.socketIOTimer); }
    clearInterval(this.timer);
  }
  public onControlAnalysis() {
    if (this.snapShot) { return; }
    if (!this.beginFileIo) {
      this.onStartFileIo();
    } else {
      this.onStopFileIo();
    }
    this.beginFileIo = !this.beginFileIo;
  }

  public onStartFileIo() {
    if (this.startBtnDisabled) { return; }

    if (!this.socketIOGroup.controls.socketIO_threshold.value) {
      const invalidEl = this.el.nativeElement.querySelector(`.fileIO-threshold.ng-invalid.ng-touched:not([tiFocused])`);
      if (invalidEl) {
        const inputEl = $(invalidEl).find('.ti3-spinner-input-box>.ti3-spinner-input')[0];
        inputEl.focus();
      }
      return;
    }
    this.getStack();
    this.isStopFlag = true;
    this.tableListData = [];
    this.srcDataTable.data = [];
    this.srcDataTableTime.data = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.updateEchartsData();
    this.socketIOEcharts = null;
    this.echartsLabelTop = null;
    this.stackTranceData = [];
    this.fileIPMap = {};
    this.currentEchartsIPName = '';
    this.currentEchartsAddrName = '';
    this.currentEchartsFdName = '';
    this.dataLimit.primaryTime = null;
    this.dataLimit.dataCount = 0;
    this.msgService.isClearProSocket = false;
    this.msgService.clearProSocketMessage();
    this.downloadService.downloadItems.pSocketIO.tableData = [];
    this.downloadService.downloadItems.pSocketIO.currentHostTableList = [];
    this.downloadService.downloadItems.pSocketIO.currentFdTableList = [];
    this.stompService.startStompRequest('/cmd/start-instrument-socket', {
      jvmId: this.jvmId,
      guardianId: this.guardianId,
      threshold: this.socketIOGroup.controls.socketIO_threshold.value
    });
    this.downloadService.dataSave.psocketThreshold =
      this.socketIOGroup.controls.socketIO_threshold.value;
    this.downloadService.dataSave.isSocketIOStart = true;
    this.downloadService.dataSave.isJdbcStart = false;
    this.downloadService.dataSave.isjdbcPoolStart = false;
    this.downloadService.dataSave.isMongodbStart = false;
    this.downloadService.dataSave.isCassStart = false;
    this.downloadService.dataSave.isHbaseStart = false;
    this.downloadService.dataSave.isFileIOStart = false;
    if (!this.srcDataTable.data.length) {
      this.socketTimeout = setTimeout(() => {
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.profileNodataTip.socketIo,
          time: 10000
        });
      }, 30000);
    }
    this.timer = setInterval(() => {
      if (this.srcDataTable.data.length > 0) {
        this.beforeToggle(this.displayedTable[0]);
        clearInterval(this.timer);
      }
    }, 1000);
  }
  public onStopFileIo() {
    this.stompService.startStompRequest('/cmd/stop-instrument-socket', {
      jvmId: this.jvmId,
      guardianId: this.guardianId,
      threshold: this.socketIOGroup.controls.socketIO_threshold.value
    });
    this.downloadService.dataSave.psocketThreshold =
      this.socketIOGroup.controls.socketIO_threshold.value;
    this.downloadService.dataSave.isSocketIOStart = false;
    this.clearSocketTimer();
    let tempTimer = setTimeout(() => {
      if (!this.isStopFlag) {
        this.isStopFlag = true;
        return;
      }
      this.msgService.isClearProSocket = true;
      this.msgService.clearProSocketMessage();
      clearTimeout(tempTimer);
      tempTimer = null;
    }, this.stompService.fileIoStep);
  }
  /**
   * 达到数据限定时清空表格数据
   */
  public handleTableDataLimit(data: any) {
    if (!this.dataLimit.primaryTime) {
      this.dataLimit.primaryTime = data[0].originTime;
    }
    if (!this.tableListData.length) {
      return;
    }
    if (this.dataLimit.dataCount > +this.dataLimit.limitData) {
      const lastTime = data[0].originTime;
      const diffTime = Math.ceil((lastTime - this.dataLimit.primaryTime) * this.dataLimit.clearBuffer);
      this.handleClearTableData(diffTime);
      this.dataLimit.primaryTime += diffTime;
    }
  }
  /**
   * 达到数据限定时清理表格数据
   */
  private handleClearTableData(diffTime: any) {
    this.dataLimit.dataCount = 0;
    let currentFileThreadCount = 0;
    const currentFileIndex = this.fileIPMap[String(this.currentEchartsIPName)] - 1;
    this.tableListData[currentFileIndex].children.forEach((host: any) => {
      host.children.forEach((fd: any) => {
        currentFileThreadCount += fd.options.length;
      });
    });
    this.tableListData.forEach((ip: any, ipIndex: any) => {
      if (this.currentEchartsIPName === ip.ip &&
        currentFileThreadCount < Number(this.dataLimit.limitData) * this.dataLimit.clearBuffer) {
        return;
      }
      ip.children.forEach((host: any, hostIndex: any) => {
        host.children.forEach((fd: any, fdIndex: any) => {
          fd.options.forEach((thread: any, threadIndex: any) => {
            const diff = Math.ceil(thread.originTime - this.dataLimit.primaryTime);
            if (diff <= diffTime) {
              fd.options.splice(threadIndex, 1);
            }
          });
          if (!fd.options.length) {
            host.count -= fd.count;
            host.children.splice(fdIndex, 1);
          } else {
            this.dataLimit.dataCount += fd.options.length;
          }
        });
        if (!host.children.length) {
          ip.children.splice(hostIndex, 1);
        }
      });
      if (!ip.children.length) {
        delete this.fileIPMap[ip.ip];
        this.tableListData.splice(ipIndex, 1);
      }
    });
  }
  /**
   * 初始化echarts
   */
  public initEchart() {
    this.echartsOption = {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        padding: [8, 20, 8, 20],
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any) => {
          let html = '';
          let read = null;
          let write = null;
          if (params.length === 1) {
            const flag = params[0].seriesName === this.i18n.io.fileIo.readRate;
            if (flag) {
              read = params[0].data === 0.001 ? 0.00 : params[0].data;
              read = +read > 1 ? this.libService.setThousandSeparator((+read).toFixed(2)) : (+read).toFixed(3);
              write = '0.000';
            } else {
              read = '0.000';
              write = params[0].data === 0.001 ? 0.00 : params[0].data;
              write = +write > 1 ? this.libService.setThousandSeparator((+write).toFixed(2)) : (+write).toFixed(3);
            }
            html += `
                  <div style="font-size:12px">${this.domSanitizer.sanitize(SecurityContext.HTML,
              this.downloadService.downloadItems.profileInfo.toolTipDate + ' ' + params[0].axisValueLabel)}</div>
                  <div style='margin-top:8px;display:flex;justify-content: space-between;
                   align-items: center;font-size:12px'>
                  <div style="float:left;">
                    <span style="margin-right:8px;display: inline-block;width: 8px;
                    height: 8px;background-color:${params[0].color};
                    margin-right:8px"></span>
                    <span style='display:inline-block;'>
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, params[0].seriesName)}</span>
                    </div>
                    <span  style="margin-left:24px">
                      ${this.domSanitizer.sanitize(SecurityContext.HTML, (params[0].data > 1 ?
                this.libService.setThousandSeparator((+params[0].data).toFixed(2)) :
                (+params[0].data).toFixed(3)))}KiB/s
                    </span>
                  </div>
                  `;
          } else {
            read = params[0].data === 0.001 ? 0.00 : params[0].data;
            write = params[1].data === 0.001 ? 0.00 : params[1].data;
            read = +read > 1 ? this.libService.setThousandSeparator((+read).toFixed(2)) : (+read).toFixed(3);
            write = +write > 1 ? this.libService.setThousandSeparator((+write).toFixed(2)) : (+write).toFixed(3);
            html += `
                  <div style="font-size:12px">${this.domSanitizer.sanitize(SecurityContext.HTML,
              this.downloadService.downloadItems.profileInfo.toolTipDate + ' ' + params[0].axisValueLabel)}</div>
                  <div style='margin-top:8px;display:flex;justify-content: space-between;
                   align-items: center;font-size:12px'>
                  <div style="float:left;">
                    <span style="display: inline-block;width: 8px;height: 8px;
                    background-color:#267DFF;margin-right:8px"></span>
                    <span style='display:inline-block;'>${this.domSanitizer.sanitize(SecurityContext.HTML,
                this.i18n.io.fileIo.readRate)}</span>
                    </div>
                    <span style="margin-left:24px">${this.domSanitizer.sanitize(SecurityContext.HTML, read)}KiB/s</span>
                  </div>
                  <div style='margin-top:8px;display:flex;justify-content: space-between;
                   align-items: center;font-size:12px'>
                  <div style="float:left;">
                    <span style="display: inline-block;width: 8px;height: 8px;
                    background-color:#00BFC9;margin-right:8px"></span>
                    <span style='display:inline-block;'>${this.i18n.io.fileIo.writeRate}</span>
                    </div>
                    <span style="margin-left:24px">
                    ${this.domSanitizer.sanitize(SecurityContext.HTML, write)}KiB/s</span>
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
      grid: {
        left: 90,
        right: 0,
        top: 90,
        height: 130
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
          fillerColor: 'rgba(0, 103, 255, 0.15)', // 选中的区域背景色
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
          showDataShadow: false,   // 是否显示数据阴影
          filterMode: 'empty'
        }
      ],
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
          data: this.echartsData.timeList
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
          },
          max: this.echartsLabelTop,
          min: 0.1
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
          data: this.echartsData.readSpeed
        },
        {
          id: 'series2',
          name: this.i18n.io.fileIo.writeRate,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00BFC9 '
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
          data: this.echartsData.writeSpeed
        }
      ]
    };
    let tempTimer = setTimeout(() => {
      this.socketIOEcharts = echarts.init(this.el.nativeElement.querySelector('#socketIOEcharts'));
      this.socketIOEcharts.setOption(this.echartsOption);
      window.onresize = this.socketIOEcharts.resize;
      this.socketIOEcharts.on('datazoom', (params: any) => {  // 放大缩小时调用接口
        this.ioTimeLine.dataConfig({ start: params.batch[0].start, end: params.batch[0].end });
      });
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 0);
  }

  /**
   * 处理当前来的所有数据
   * @param currentData 当前数据
   */
  public handleAllData(currentData: any) {
    if (this.dataLimit.dataCount > +this.dataLimit.limitData) {
      this.handleTableDataLimit(currentData.fd.options);
    }
    this.dataLimit.dataCount += currentData.fd.options.length;
    const index = this.fileIPMap[currentData.ip];
    const currentIp = this.handleIPIndex(index, currentData);
    const currentHost = this.handleHost(currentIp, currentData.host);
    const currentFd = currentData.fd;
    this.hanldeIpOrHostData(currentIp, currentFd);
    this.hanldeIpOrHostData(currentHost, currentFd);
    this.handleFdData(currentHost, currentFd);
    // 更新选中项
    this.handleSelectedUpdate();
    this.handleEchartsUpdate(currentData);
    this.srcDataTable.data = this.tableListData;
  }
  /**
   * 判断挡墙数据的IP层是否存在
   * @param index 当前数据所在的IP
   * @param currentData 当前数据
   */
  public handleIPIndex(index: any, currentData?: any) {
    if (index) { return this.tableListData[index - 1]; }
    const currentIp = currentData.ip;
    const host = currentData.host;
    const ip: any = {
      ip: currentIp,
      duration: 0,
      count: 0,
      rCount: 0,
      wCount: 0,
      rByte: 0,
      wByte: 0,
      children: [],
      isSelect: false,
      showDetails: false
    };
    const addr: any = {
      host,
      duration: 0,
      count: 0,
      rCount: 0,
      wCount: 0,
      rByte: 0,
      wByte: 0,
      children: [],
      isSelect: false,
      showDetails: false,
      showDetailsH: false,
    };
    ip.children.push(addr);
    this.tableListData.push(ip);
    if (!this.currentHostTableList.length) {
      this.tableListData[0].isSelect = true;
      this.currentHostTableList = this.tableListData[0].children;
    }
    this.fileIPMap[currentIp] = this.tableListData.length;
    return this.tableListData[this.tableListData.length - 1];
  }
  /**
   * 判断当前数据的host层是否存在
   * @param currentIp 当前数据的IP层
   * @param host 当前数据的host
   */
  public handleHost(currentIp: any, host: any) {
    const currentHost = currentIp.children.find((item: any) => {
      return item.host === host;
    });
    if (currentHost) { return currentHost; }
    const addr: any = {
      host,
      duration: 0,
      count: 0,
      rCount: 0,
      wCount: 0,
      rByte: 0,
      wByte: 0,
      children: [],
      isSelect: false,
      showDetails: false
    };
    currentIp.children.push(addr);
    return addr;
  }
  /**
   * 更新当前数据的Fd层数据
   * @param currentData 当前数据
   * @param currentFd 当前数据的Fd层
   */
  public hanldeIpOrHostData(currentData: any, currentFd: any) {
    currentData.duration += currentFd.duration;
    currentData.count += currentFd.count;
    currentData.rCount += currentFd.rCount;
    currentData.wCount += currentFd.wCount;
    currentData.rByte += currentFd.rByte;
    currentData.wByte += currentFd.wByte;
  }
  /**
   * 判断当前Fd层是否存在
   * @param currentFile 当前数据的IP层
   * @param currentFd 当前数据
   */
  public handleFdData(currentFile: any, currentFd: any) {
    const oldFd = currentFile.children.find((item: any) => {
      return item.fileDes === currentFd.fileDes;
    });
    if (!oldFd) {
      currentFile.children.push(currentFd);
    } else {
      oldFd.duration += currentFd.duration;
      oldFd.count += currentFd.count;
      oldFd.rCount += currentFd.rCount;
      oldFd.wCount += currentFd.wCount;
      oldFd.rByte += currentFd.rByte;
      oldFd.wByte += currentFd.wByte;
      oldFd.options.push(currentFd.options[0]);
    }
  }
  /**
   * 点击当前IP层数据
   * @param ip 点击IP层
   * @param i 当前IP层数据
   */
  public handleIpClicked(ip: any, i: any) {
    this.currentIpIndex = i;
    this.handleIsNowEcharts('ip', ip.ip);
    this.handleUpdateIPThreads(ip);
    this.handleIPSelected(i);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
  }
  /**
   * 更新当前IP层的所有线程数据
   * @param ip 当前IP层数据
   */
  public handleUpdateIPThreads(ip: any) {
    let threadList: any = [];
    ip.children.forEach((host: any) => {
      host.children.forEach((fd: any) => {
        threadList = threadList.concat(fd.options);
      });
    });
    this.dataTableTime = threadList;
    this.onTypeSelect();
  }
  /**
   * 设置当前IP层数据
   * @param i 当前数据IP层位置
   */
  public handleIPSelected(i: any) {
    this.tableListData.forEach((item: any, index: any) => {
      item.isSelect = index === i;
    });
    this.tableListData[i].children.forEach((item: any) => {
      item.showDetails = false;
      item.isSelect = false;
    });
  }
  /**
   * 点击host层
   * @param host host层数据
   * @param i host所在IP的位置
   * @param idx host层位置
   */
  public handleHostClicked(host: any, i: any, idx: any) {
    this.currentHostIndex = idx;
    this.handleIsNowEcharts('host', host.host);
    this.handleUpdateHostThreads(host);
    this.handleHostSelected(i, idx);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
  }
  /**
   * 点击host层数据时的颜色变化
   * @param i 当前数据所在的IP的层位置
   * @param idx 当前host数据位置
   */
  public handleHostSelected(i: any, idx: any) {
    this.tableListData[i].children.forEach((item: any, index: any) => {
      if (index !== idx) {
        item.showDetails = false;
      }
      item.isSelect = index === idx;
    });
    this.tableListData[i].children[idx].children.forEach((item: any) => {
      item.isSelect = false;
    });
  }
  /**
   * 更新当前host中的所有thread数据
   * @param host 当前host数据
   */
  public handleUpdateHostThreads(host: any) {
    let threadList: any = [];
    host.children.forEach((fd: any) => {
      threadList = threadList.concat(fd.options);
    });
    this.dataTableTime = threadList;
    this.onTypeSelect();
  }
  /**
   * 点击某Fd数据
   * @param fd 当前Fd数据
   * @param i 当前数据的IP的位置
   * @param idx 当前数据的Fd的位置
   * @param fi 当前数据的位置
   */
  public hanldeFdClicked(fd: any, i: any, idx: any, fi: any) {
    this.currentFdIndex = fi;
    this.handleIsNowEcharts('fd', fd.fileDes);
    this.handleUpdateFdThreads(fd);
    this.hanldeFdSelected(i, idx, fi);
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
  }
  /**
   * 点击某Fd时变色
   * @param i 当前Fd数据
   * @param idx 当前数据的Fd的位置
   * @param fi 当前数据的位置
   */
  public hanldeFdSelected(i: any, idx: any, fi: any) {
    this.tableListData[i].children[idx].children.forEach((item: any, index: any) => {
      item.isSelect = index === fi;
    });
  }
  /**
   * 更新当前Fd下的所有线程
   * @param fd 当前Fd
   */
  public handleUpdateFdThreads(fd: any) {
    this.dataTableTime = fd.options;
    this.onTypeSelect();
  }

  /**
   * 展开整个树
   */
  public expandAllNode(row: TiTableRowData) {
    if (row.expanded) {
      return;
    }
    const data: Array<TiTreeNode> = this.stackTranceData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    this.stackTranceData = data;
  }
  /**
   * 判断当前echarts是否是点击层的echarts
   * @param type 当前点击的层类型
   * @param name 当前层数据名字
   */
  public handleIsNowEcharts(type: any, name: any) {
    switch (type) {
      case 'ip':
        if (type === this.isCurrentType && this.currentEchartsIPName === name) { return; }
        this.currentEchartsIPName = name;
        this.currentEchartsAddrName = '';
        this.currentEchartsFdName = '';
        this.currentHostIndex = null;
        this.currentFdIndex = null;
        break;
      case 'host':
        if (type === this.isCurrentType && this.currentEchartsAddrName === name) { return; }
        this.currentEchartsAddrName = name;
        this.currentEchartsFdName = '';
        this.currentFdIndex = null;
        break;
      default:
        if (type === this.isCurrentType && this.currentEchartsFdName === name) { return; }
        this.currentEchartsFdName = name;
        break;
    }
    this.isCurrentType = type;
    this.echartsLabelTop = 0;
    this.echartsData.readSpeed = [];
    this.echartsData.writeSpeed = [];
    this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    this.timeData = this.echartsData.timeList;
    this.currnetEchartsData.startTime = '';
    this.currnetEchartsData.readSpeed = 0;
    this.currnetEchartsData.writeSpeed = 0;
    this.currnetEchartsData.readCount = 0;
    this.currnetEchartsData.writeCount = 0;
    this.updateEchartsData();
    this.handleReclickedFile(type, name);
  }
  /**
   * 更新对应层级echarts数据
   */
  public handleSelectedUpdate() {
    if (!this.fileIPMap[this.currentEchartsIPName]) {
      this.currentIpIndex = 0;
      this.isCurrentType = 'ip';
      this.currentEchartsIPName = this.tableListData[0].ip;
    }
    if (this.currentEchartsIPName && this.currentEchartsAddrName && this.currentEchartsFdName) {
      const fd = this.tableListData[this.currentIpIndex].children[this.currentHostIndex].children[this.currentFdIndex];
      return this.handleUpdateFdThreads(fd);
    }
    if (this.currentEchartsIPName && this.currentEchartsAddrName) {
      const host = this.tableListData[this.currentIpIndex].children[this.currentHostIndex];
      return this.handleUpdateHostThreads(host);
    }
    if (this.currentEchartsIPName) {
      const ip = this.tableListData[this.currentIpIndex];
      this.handleUpdateIPThreads(ip);
      if (!this.stackTranceData.length) {
        this.onClickRightTable(this.srcDataTableTime.data[0], 0);
      }
      return;
    }
  }
  /**
   * 更新判断当前数据是否应该更新echarts
   * @param currentData 当前数据
   */
  public handleEchartsUpdate(currentData: any) {
    if (
      this.currentEchartsIPName === currentData.ip &&
      this.currentEchartsAddrName === currentData.host &&
      this.currentEchartsFdName === currentData.fd.fileDes
    ) {
      return this.handleCacheEchartsData(currentData.fd);
    }
    if (this.currentEchartsIPName === currentData.ip &&
      this.currentEchartsAddrName === currentData.host &&
      !this.currentEchartsFdName) {
      return this.handleCacheEchartsData(currentData.fd);
    }
    if (this.currentEchartsIPName === currentData.ip && !this.currentEchartsAddrName && !this.currentEchartsFdName) {
      return this.handleCacheEchartsData(currentData.fd);
    }
  }
  /**
   * 更新当前echarts
   * @param echarts 数据
   */
  public handleEchartsData(echartsData: any) {
    const readSpeed = echartsData.readSpeed;
    const writeSpeed = echartsData.writeSpeed;
    const bigger = Math.max(+writeSpeed, +readSpeed);
    this.echartsLabelTop = Math.max(this.echartsLabelTop, bigger);
    this.echartsLabelTop = this.echartsLabelTop.toFixed(2);
    this.supplementDis(echartsData.startTime);
    this.reduceEchartsData(echartsData.startTime, readSpeed, writeSpeed);
    this.updateEchartsData();
  }
  /**
   * 更新/删除xAxis数据
   * @param time x轴数据
   */
  public reduceEchartsData(time: string, readSpeed: number, writeSpeed: number) {
    readSpeed = readSpeed === 0 ? 0.001 : readSpeed;
    writeSpeed = writeSpeed === 0 ? 0.001 : writeSpeed;
    const index = this.echartsData.timeList.findIndex((item: any) => {
      return item === '';
    });
    if (index !== -1) {
      this.echartsData.timeList[index] = time;
    } else {
      this.echartsData.timeList.shift();
      this.echartsData.readSpeed.shift();
      this.echartsData.writeSpeed.shift();
      this.echartsData.timeList.push(time);
    }
    this.timeData = this.echartsData.timeList;
    this.ioTimeLine.setTimeData(this.timeData);
    this.echartsData.readSpeed.push(readSpeed);
    this.echartsData.writeSpeed.push(writeSpeed);
  }
  /**
   * 如果当前数据时间比上一个数据时间的差多1s的倍数时，差值设置为0
   * @param timeData 当前数据时间
   */
  private supplementDis(timeData: string) {
    const len: any = [];
    this.echartsData.timeList.forEach((item: any) => {
      if (item !== '') {
        len.push(item);
      }
    });
    if (!len.length) { return; }
    const year = new Date().getFullYear();
    const date = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const newDate = `${year}/${date}/${day} `;
    const nowTime = (new Date(newDate + timeData)).getTime();
    const lastTime = (new Date(newDate + len[len.length - 1])).getTime();
    const diff = Math.floor((nowTime - lastTime) / 1000);
    if (diff > 1) {
      let count = 1;
      while (count <= diff - 1) {
        const time = this.libService.dateFormat(lastTime + (count * 1000), 'hh:mm:ss');
        this.reduceEchartsData(time, 0, 0);
        count++;
      }
    }
  }
  /**
   * 缓存当前某条数据，当吓一跳数据的时间与当前时间不同时，讲当前时间推出，缓存下一条数据
   * @param echarts 当前数据
   */
  private handleCacheEchartsData(echartsData: any) {
    const type = echartsData.options[0].type;
    const rate = echartsData.options[0].rate;
    if (type === 'open' || type === 'close') { return; }
    if (this.currnetEchartsData.startTime && echartsData.startTime !== this.currnetEchartsData.startTime) {
      this.handleLastCacheEchartsData();
    }
    this.currnetEchartsData.startTime = echartsData.startTime;
    if (type === 'read') {
      this.currnetEchartsData.readCount++;
      this.currnetEchartsData.readSpeed += rate;
    } else {
      this.currnetEchartsData.writeCount++;
      this.currnetEchartsData.writeSpeed += rate;
    }
  }
  /**
   * 处理当前数据
   */
  private handleLastCacheEchartsData() {
    if (!this.currnetEchartsData.startTime) {
      return;
    }
    this.currnetEchartsData.readSpeed = this.currnetEchartsData.readCount === 0
      ? 0.000
      : +(this.currnetEchartsData.readSpeed / this.currnetEchartsData.readCount).toFixed(2);
    this.currnetEchartsData.writeSpeed = this.currnetEchartsData.writeCount === 0
      ? 0.000
      : +(this.currnetEchartsData.writeSpeed / this.currnetEchartsData.writeCount).toFixed(2);
    this.handleEchartsData(this.currnetEchartsData);
    this.currnetEchartsData.readCount = 0;
    this.currnetEchartsData.writeCount = 0;
    this.currnetEchartsData.readSpeed = 0;
    this.currnetEchartsData.writeSpeed = 0;
    this.currnetEchartsData.startTime = '';
  }
  /**
   * 当前数据对应的速度
   * @param byte 当前数据的字节数
   * @param duration 当前数据的操作的时间
   */
  public handleSpeedCaulate(byte: any, duration: any) {
    if (byte === 0) {
      return 0;
    }
    if (duration === 0) {
      return 0;
    }
    const kb = +byte / 1024;
    const s = duration / this.ms;
    const speed = kb / s;
    return speed;
  }
  /**
   * 点击右侧线程列表
   * @param row 右侧线程表格的某行
   * @param index 当前数据的位置
   */
  public onClickRightTable(row: any, index: any) {
    if (!row) {
      return;
    }
    this.srcDataTableTime.data.forEach((item, i) => {
      item.isSelect = index === i;
    });
    for (const item of row.stackTrace.children) {
      item.expanded = false;
    }
    this.handleStacktrace(row);
  }
  /**
   * 取当前栈数据的第一层栈
   * @param row 某行
   */
  public handleStacktrace(row: any) {
    this.currentStacktrace = [];
    this.stackTranceData = [];
    this.currentStacktrace = row.stackTrace.children;
    this.currentStacktrace.forEach((item: any) => {
      this.stackTranceData.push({
        label: item.label,
        expanded: false,
        children: item.children
      });
    });
    this.treeFindChild(this.currentStacktrace);
  }
  public treeFindChild(tree: any) {
    const arr = tree[0];
    if (Object.prototype.hasOwnProperty.call(arr, 'children')) {
      if (arr.children.length) {
        this.treeFindChild(arr.children);
      } else {
        delete arr.children;
        delete arr.expanded;
      }
    }
    return tree;
  }
  /**
   * 展开之前获取下的子级数据
   * @param TreeCom TreeCom
   */
  public beforeExpand(TreeCom: TiTreeComponent): void {
    const currentTree: TiTreeNode = TreeCom.getBeforeExpandNode();
    this.getChildNodes(currentTree);
  }
  /**
   * 获取子级栈
   * @param currentTree currentTree
   */
  public getChildNodes(currentTree: any) {
    if (!currentTree.children.length) {
      const findChild = this.currentStacktrace.find((item: any) => {
        return item.label === currentTree.label;
      });
      currentTree.children = findChild ? findChild.children : [];
    }
    currentTree.expanded = true;
  }
  // 展开整个树
  public expandNode(): void {
    const data: Array<TiTreeNode> = this.stackTranceData.concat();
    TiTreeUtil.traverse(data, traverseFn);

    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    this.stackTranceData = data;
  }

  public onSelect(event: TiTreeNode): void {
    this.selectedData = TiTreeUtil.getSelectedData(
      this.stackTranceData,
      false,
      false
    );
  }
  public onClickExpand(): void {
    this.expand = !this.expand;
  }
  // 字节单位转换
  public onChangeUnit(num: any): any {
    if (num < this.K) {
      return num.toFixed(2) + 'B';
    } else if (this.K < num && num < this.MB) {
      const bytes = (num / this.K).toFixed(2);
      return bytes + 'KB';
    } else if (this.MB < num && num < this.GB) {
      const bytes = (num / this.MB).toFixed(2);
      return bytes + 'MB';
    } else if (this.GB < num && num < this.TB) {
      const bytes = (num / this.GB).toFixed(2);
      return bytes + 'GB';
    }
  }
  // io时间单位
  public onChangeTime(time: any): any {
    if (time < this.μs) {
      return time.toFixed(2) + ' μs';
    } else if (this.μs < time && time < this.ms) {
      return (time / this.μs).toFixed(2) + ' ms';
    } else if (this.ms < time) {
      return (time / this.ms).toFixed(2) + ' s';
    }
  }
  public handleTimeFormat(time: any) {
    const date = new Date(time);
    return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ?
      '0' + date.getMinutes() :
      date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;
  }
  /**
   * 第一层展开之前
   * @param row row
   */
  public beforeToggle(row: TiTableRowData): void {
    this.currentHostTableList = [];
    this.currentHostTableListTop = [];
    this.currentHostTableList = row.children.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentHostTableListTop = this.currentHostTableList.slice(0, this.spinnerValue);
    row.showDetails = !row.showDetails;
  }
  /**
   * 第二层展开之前
   * @param row row
   */
  public beforeToggleSecond(row: TiTableRowData): void {
    this.currentHostTableListTop.forEach((e: any) => {
      if (row.host !== e.host) {
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
    this.currentFdTableListTop = this.currentFdTableList.slice(0, this.spinnerValue);
    row.showDetailsH = !row.showDetailsH;
  }

  // 快照点击事件
  public compare(property: any) {
    return (a: any, b: any) => {
      const value1 = a[property];
      const value2 = b[property];
      return value2 - value1;
    };
  }
  public doSnap(type: any) {
    if (this.isDoSnapClick) {
      this.isDoSnapClick = false;
      // 事件
      this.doSnapFn(type);
      // 定时器
      let tempTimer = setTimeout(() => {
        this.isDoSnapClick = true;
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 1000); // 一秒内不能重复点击
    }
  }
  public doSnapFn(type: any) {
    if (this.isDownload) { return; }
    if (this.srcDataTable.data.length < 1) {
      return this.mytip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_noData,
        time: 3500
      });
    }
    const snapCounts = 5;
    if (this.snapCount < snapCounts) {
      const tableTop = this.srcDataTable.data.sort(this.compare('count'));
      const nowTime = this.libService.getSnapTime();
      const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
        JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
      if (!snapShot[type]) {
        snapShot[type] = {
          label: this.i18n.protalserver_profiling_tab.socketIo,
          type,
          children: [],
        };
      }
      snapShot[type].children.push({
        label: nowTime,
        type,
        value: {
          file: tableTop,
          threshold: this.socketIOGroup.controls.socketIO_threshold.value,
          snapCount: this.snapCount + 1,
          fileIPMap: this.fileIPMap,
          spinnerValue: this.spinnerValue,
          stackBtnTip: this.stackBtnTip,
          echarts: {
            echartsLabelTop: this.echartsLabelTop,
            currentEchartsIPName: this.currentEchartsIPName,
            currentEchartsAddrName: this.currentEchartsAddrName,
            currentEchartsFdName: this.currentEchartsFdName,
            data: this.echartsData
          }
        }
      });
      this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
      this.downloadService.downloadItems.snapShot.data = snapShot;
      this.downloadService.downloadItems.pSocketIO.snapCount = this.snapCount + 1;
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18n.do_snapshot_success,
        time: 3500
      });
    } else {
      this.mytip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_alert,
        time: 3500
      });
    }
    this.handleSnapShotCount(type);
  }
  public getStack() {
    const role = sessionStorage.getItem('role');
    this.Axios.axios.get('tools/settings/stackDepth').then((res: any) => {
      this.downloadService.downloadItems.pSocketIO.stackDepth = res;
      if (role === 'Admin') {
        this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
      } else {
        this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
      }
    });
  }
  public importSnapData(snapShotData: any) {
    this.tableListData = snapShotData.file;
    this.srcDataTable.data = snapShotData.file;

    this.fileIPMap = snapShotData.fileIPMap;
    this.currentEchartsIPName = snapShotData.echarts.currentEchartsIPName;
    this.currentEchartsAddrName = snapShotData.echarts.currentEchartsAddrName;
    this.currentEchartsFdName = snapShotData.echarts.currentEchartsFdName;

    this.echartsData.timeList = snapShotData.echarts.data.timeList;
    this.timeData = this.echartsData.timeList;
    this.echartsData.readSpeed = snapShotData.echarts.data.readSpeed;
    this.echartsData.writeSpeed = snapShotData.echarts.data.writeSpeed;

    this.socketIOGroup.controls.socketIO_threshold.setValue(snapShotData.threshold);
    this.snapCount = snapShotData.snapCount;
    this.spinnerValue = snapShotData.spinnerValue;
    this.echartsLabelTop = snapShotData.echarts.echartsLabelTop;
    this.stackBtnTip = snapShotData.stackBtnTip;
    let ipTable = [];
    let hostTable = [];
    if (this.currentEchartsIPName) {
      ipTable = this.tableListData[this.fileIPMap[this.currentEchartsIPName] - 1];
      this.currentHostTableList = ipTable.children;
      this.handleUpdateIPThreads(ipTable);
      this.currentFdTableList = this.downloadService.downloadItems.pSocketIO.currentFdTableList;
    }
    if (this.currentEchartsAddrName) {
      hostTable = ipTable.children.find((item: any) => {
        return item.host === this.currentEchartsAddrName;
      });
      this.currentFdTableList = hostTable.children;
      this.handleUpdateHostThreads(hostTable);
    }
    if (this.currentEchartsFdName) {
      const fd = this.currentFdTableList.find((item: any) => {
        return item.fileDes === this.currentEchartsFdName;
      });
      this.handleUpdateFdThreads(fd);
    }
    this.onClickRightTable(this.srcDataTableTime.data[0], 0);
    this.initEchart();
  }
  public handleSnapShotCount(type: any) {
    this.snapCount = this.downloadService.downloadItems.pSocketIO.snapCount;
  }

  public handleSaveCache() {
    this.downloadService.downloadItems.pSocketIO.currentIpIndex = this.currentIpIndex;
    this.downloadService.downloadItems.pSocketIO.currentHostIndex = this.currentHostIndex;
    this.downloadService.downloadItems.pSocketIO.currentFdIndex = this.currentFdIndex;
    this.downloadService.downloadItems.pSocketIO.tableData = this.srcDataTable.data;
    this.downloadService.downloadItems.pSocketIO.threshold = this.socketIOGroup.controls.socketIO_threshold.value;
    this.downloadService.downloadItems.pSocketIO.fileIPMap = this.fileIPMap;
    this.downloadService.downloadItems.pSocketIO.isCurrentType = this.isCurrentType;

    this.downloadService.downloadItems.pSocketIO.currentEchartsIPName = this.currentEchartsIPName;
    this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName = this.currentEchartsAddrName;
    this.downloadService.downloadItems.pSocketIO.currentEchartsFdName = this.currentEchartsFdName;

    this.downloadService.downloadItems.pSocketIO.echartsLabelTop = this.echartsLabelTop;

    this.downloadService.downloadItems.pSocketIO.echarts.timeList = this.echartsData.timeList;
    this.downloadService.downloadItems.pSocketIO.echarts.readSpeed = this.echartsData.readSpeed;
    this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed = this.echartsData.writeSpeed;

    this.downloadService.downloadItems.pSocketIO.stackTranceData = this.stackTranceData;

    this.downloadService.downloadItems.pSocketIO.currentHostTableList = this.currentHostTableList;
    this.downloadService.downloadItems.pSocketIO.currentFdTableList = this.currentFdTableList;

    this.downloadService.downloadItems.pSocketIO.spinnerValue = this.spinnerValue;
    this.downloadService.downloadItems.pSocketIO.primaryTime = this.dataLimit.primaryTime;
    this.downloadService.downloadItems.pSocketIO.dataCount = this.dataLimit.dataCount;
  }
  public handelClearCache() {
    this.downloadService.downloadItems.pSocketIO.currentIpIndex = null;
    this.downloadService.downloadItems.pSocketIO.currentHostIndex = null;
    this.downloadService.downloadItems.pSocketIO.currentFdIndex = null;
    this.downloadService.downloadItems.pSocketIO.tableData = [];
    this.downloadService.downloadItems.pSocketIO.threshold =
      this.socketIOGroup.controls.socketIO_threshold.value; // 256
    this.downloadService.downloadItems.pSocketIO.fileIPMap = {};
    this.downloadService.downloadItems.pSocketIO.isCurrentType = '';
    this.downloadService.downloadItems.pSocketIO.currentEchartsIPName = '';
    this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName = '';
    this.downloadService.downloadItems.pSocketIO.currentEchartsFdName = '';
    this.downloadService.downloadItems.pSocketIO.echartsLabelTop = '';
    this.downloadService.downloadItems.pSocketIO.echarts.timeList = new Array(180).fill('');
    this.downloadService.downloadItems.pSocketIO.echarts.readSpeed = [];
    this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed = [];
    this.downloadService.downloadItems.pSocketIO.stackTranceData = [];
    this.downloadService.downloadItems.pSocketIO.currentHostTableList = [];
    this.downloadService.downloadItems.pSocketIO.currentFdTableList = [];
    this.downloadService.downloadItems.pSocketIO.spinnerValue = 10;
    this.downloadService.downloadItems.pSocketIO.primaryTime = null;
    this.downloadService.downloadItems.pSocketIO.dataCount = 0;
  }
  public hanldeImportCache() { // 页面间切换
    this.dataLimit.limitData = this.downloadService.dataLimit.socket_io.dataValue;
    this.dataLimit.limitTime = this.downloadService.dataLimit.socket_io.timeValue;
    this.beginFileIo = this.downloadService.dataSave.isSocketIOStart;

    this.socketIOGroup.controls.socketIO_threshold.setValue(
      this.downloadService.dataSave.psocketThreshold);
    this.fileIPMap = this.downloadService.downloadItems.pSocketIO.fileIPMap;
    this.isCurrentType = this.downloadService.downloadItems.pSocketIO.isCurrentType;
    this.tableListData = this.downloadService.downloadItems.pSocketIO.tableData;

    this.currentEchartsIPName = this.downloadService.downloadItems.pSocketIO.currentEchartsIPName;
    this.currentEchartsAddrName = this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName;
    this.currentEchartsFdName = this.downloadService.downloadItems.pSocketIO.currentEchartsFdName;

    this.echartsLabelTop = this.downloadService.downloadItems.pSocketIO.echartsLabelTop;
    const hasData = this.downloadService.downloadItems.pSocketIO.echarts.timeList.findIndex((item: any) => {
      return item !== '';
    });
    if (hasData !== -1) {
      this.echartsData.timeList = this.downloadService.downloadItems.pSocketIO.echarts.timeList;
    } else {
      this.echartsData.timeList = new Array(Number(this.dataLimit.limitTime) * 60).fill('');
    }
    this.timeData = this.echartsData.timeList;
    this.echartsData.readSpeed = this.downloadService.downloadItems.pSocketIO.echarts.readSpeed;
    this.echartsData.writeSpeed = this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed;

    this.currentIpIndex = this.downloadService.downloadItems.pSocketIO.currentIpIndex;
    this.currentHostIndex = this.downloadService.downloadItems.pSocketIO.currentHostIndex;
    this.currentFdIndex = this.downloadService.downloadItems.pSocketIO.currentFdIndex;

    this.spinnerValue = this.downloadService.downloadItems.pSocketIO.spinnerValue;
    this.dataLimit.primaryTime = this.downloadService.downloadItems.pSocketIO.primaryTime;
    this.dataLimit.dataCount = this.downloadService.downloadItems.pSocketIO.dataCount;
    if (this.currentEchartsIPName) {
      this.handleUpdateIPThreads(this.tableListData[this.fileIPMap[this.currentEchartsIPName] - 1]);
    }
    this.stackTranceData = this.downloadService.downloadItems.pSocketIO.stackTranceData;
    this.currentHostTableList = this.downloadService.downloadItems.pSocketIO.currentHostTableList;
    this.currentFdTableList = this.downloadService.downloadItems.pSocketIO.currentFdTableList;
    if (this.srcDataTable.data.length !== 0) {
      this.initEchart();
    }
  }
  public hanldeDownloadData() {
    this.socketIOGroup.controls.socketIO_threshold.setValue(
      this.downloadService.downloadItems.pSocketIO.threshold);
    this.isCurrentType = this.downloadService.downloadItems.pSocketIO.isCurrentType;

    this.fileIPMap = this.downloadService.downloadItems.pSocketIO.fileIPMap;
    this.tableListData = this.downloadService.downloadItems.pSocketIO.tableData;

    this.currentEchartsIPName = this.downloadService.downloadItems.pSocketIO.currentEchartsIPName;
    this.currentEchartsAddrName = this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName;
    this.currentEchartsFdName = this.downloadService.downloadItems.pSocketIO.currentEchartsFdName;
    this.echartsLabelTop = this.downloadService.downloadItems.pSocketIO.echartsLabelTop;
    this.echartsData.timeList = this.downloadService.downloadItems.pSocketIO.echarts.timeList;
    this.timeData = this.echartsData.timeList;
    this.echartsData.readSpeed = this.downloadService.downloadItems.pSocketIO.echarts.readSpeed;
    this.echartsData.writeSpeed = this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed;

    this.currentIpIndex = this.downloadService.downloadItems.pSocketIO.currentIpIndex;
    this.currentHostIndex = this.downloadService.downloadItems.pSocketIO.currentHostIndex;
    this.currentFdIndex = this.downloadService.downloadItems.pSocketIO.currentFdIndex;
    this.spinnerValue = this.downloadService.downloadItems.pSocketIO.spinnerValue;
    if (this.currentEchartsIPName) {
      this.handleUpdateIPThreads(this.tableListData[this.fileIPMap[this.currentEchartsIPName] - 1]);
    }
    this.stackTranceData = this.downloadService.downloadItems.pSocketIO.stackTranceData;
    this.currentHostTableList = this.downloadService.downloadItems.pSocketIO.currentHostTableList;
    this.currentFdTableList = this.downloadService.downloadItems.pSocketIO.currentFdTableList;
    if (this.srcDataTable.data.length !== 0) {
      this.initEchart();
    }
  }
  public handleReclickedFile(type: any, name: any) { // 当状态为下载，快照，停止分析时，重新点击有echarts数据的file时调用
    if (this.isDownload || this.snapShot || this.startBtnDisabled || !this.beginFileIo) {
      if (type === this.downloadService.downloadItems.pSocketIO.isCurrentType) {
        switch (type) {
          case 'ip':
            if (this.downloadService.downloadItems.pSocketIO.currentEchartsIPName !== name) { return; }
            break;
          case 'host':
            if (this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName !== name) { return; }
            break;
          default:
            if (this.downloadService.downloadItems.pSocketIO.currentEchartsFdName !== name) { return; }
            break;
        }
        this.currentEchartsIPName = this.downloadService.downloadItems.pSocketIO.currentEchartsIPName;
        this.currentEchartsAddrName = this.downloadService.downloadItems.pSocketIO.currentEchartsAddrName;
        this.currentEchartsFdName = this.downloadService.downloadItems.pSocketIO.currentEchartsFdName;

        this.echartsLabelTop = this.downloadService.downloadItems.pSocketIO.echartsLabelTop;

        this.echartsData.timeList = this.downloadService.downloadItems.pSocketIO.echarts.timeList;
        this.echartsData.readSpeed = this.downloadService.downloadItems.pSocketIO.echarts.readSpeed;
        this.echartsData.writeSpeed = this.downloadService.downloadItems.pSocketIO.echarts.writeSpeed;
        this.updateEchartsData();
      }
    }
  }
  public updateEchartsData() {
    if (!this.socketIOEcharts) { return; }
    this.timeData = this.echartsData.timeList;
    this.ioTimeLine.setTimeData(this.timeData);
    this.socketIOEcharts.setOption({
      yAxis: [
        {
          max: this.echartsLabelTop
        }
      ],
      series: [
        {
          data: this.echartsData.readSpeed
        },
        {
          data: this.echartsData.writeSpeed
        }
      ],
      xAxis: [
        {
          data: this.echartsData.timeList
        }
      ]
    });
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
  threadSearch(value: string): void {
    this.searchThreadWords[0] = value;
  }
  threadClear(value: string): void {
    this.searchThreadWords[0] = '';
  }
  public onTypeSelect(): void {
    if (!this.columnsTableTime[1].selected.length) { this.srcDataTableTime.data = []; return; }
    this.srcDataTableTime.data = this.dataTableTime.filter((rowData: TiTableRowData): any => {
      const index: number = this.columnsTableTime[1].selected.findIndex((item: any) => {
        return item.label === rowData.type;
      });
      if (!(index < 0)) {
        return rowData;
      }
    });
  }
  /**
   * 子级数据限定
   * @param value value
   */
  public onModelChange(value: any): void {
    if (!value) {
      this.spinnerValue = 0;
    }
  }
  public timeLineData(data: any) {
    this.echartsOption.dataZoom[0].start = data.start;
    this.echartsOption.dataZoom[0].end = data.end;
    this.socketIOEcharts.setOption({
      dataZoom: this.echartsOption.dataZoom
    });
  }
  public clearSocketTimer() {
    clearTimeout(this.socketTimeout);
    this.socketTimeout = null;
  }
}
