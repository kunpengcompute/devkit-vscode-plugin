import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { StompService } from '../../../service/stomp.service';
import { AxiosService } from '../../../service/axios.service';
import { MytipService } from '../../../service/mytip.service';
import { TiDragService } from '@cloud/tiny3';
import * as echarts from 'echarts/core';

import {
  TiTableColumns,
  TiTableRowData,
  TiTableSrcData,
  TiTreeNode,
  TiTreeUtil
} from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { LibService } from '../../../service/lib.service';
import { ProfileCreateService } from '../../../service/profile-create.service';

@Component({
  selector: 'app-jdbcpool',
  templateUrl: './jdbcpool.component.html',
  styleUrls: ['./jdbcpool.component.scss']
})
export class JdbcpoolComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() snapShot: boolean;
  @Input() snapShotData: any;
  @ViewChild('jdbcPoolTimeLine') jdbcPoolTimeLine: any;
  @ViewChild('analysis ', { static: false }) analysis: any;
  @ViewChild('draggable', { static: true }) private draggableEle: ElementRef;
  public suggestArr: any = [];
  public suggestTip: string;
  public hoverClose: any;
  public isSuggest = false;
  public sugtype = 1;
  public jdbcSug = false;
  constructor(
    private stompService: StompService,
    private el: ElementRef,
    private Axios: AxiosService,
    public i18nService: I18nService,
    public downloadService: ProfileDownloadService,
    private msgService: MessageService,
    public mytip: MytipService,
    public libService: LibService,
    private dragService: TiDragService,
    public createProServise: ProfileCreateService
  ) {
    this.i18n = this.i18nService.I18n();
    this.tipStr = this.i18n.jdbcpool.thresholdTip;
    this.tipStr2 = this.i18n.jdbcpool.moreThresholdTip;
    this.typeOptions = [{
      label: this.i18n.jdbcpool.wholeForm,
      value: 'form'
    }, {
      label: this.i18n.jdbcpool.queryView,
      value: 'view'
    }];
    this.typeSelected = {
      label: this.i18n.jdbcpool.wholeForm,
      value: 'form'
    };
  }
  public threshold = {
    label: '',
    max: 10000,
    min: 0,
    value: 50,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public tipStr: string;
  public tipStr2: string;
  public i18n: any;
  public beginFileIo = false; // 是否开始分析
  public Threshold: any; // 阈值
  public alertThreshold: any; // 报警阈值
  public typeOptions: any = [];
  public typeSelected: any;
  public jdbcpoolConfig: any = []; // 数据库连接池配置信息
  public isStopFlag = false;
  public connectDatas: any = {};
  public jvmId: any;
  public guardianId: any;
  public tip1Context: any;
  public startBtnDisabled = false;
  private isStopMsgSub: Subscription;
  private poolSub: Subscription;
  public deleteOneTab: Subscription;
  private jdbcPoolSuggest: Subscription;
  public isDownload = false;
  public configContext: any;
  public configTitle: any;
  public configTwoInstructions: any;
  // 左侧 表格部分
  public displayedTable: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcDataTable: TiTableSrcData;
  private tableData: Array<TiTableRowData> = [];
  public columnsTable: Array<TiTableColumns> = [];
  public closeOtherDetails = true;
  public noDadaInfo = '';
  public totalCount = 1000;
  public thirdLevel = false;
  public expand = false;
  public subrow: any;
  public language: any;
  // 栈
  public stackTranceData: Array<TiTreeNode> = [];
  // 连接池配置参数表格
  public configPoolDisplayed: Array<TiTableRowData> = [];
  public tableDataPool: Array<TiTableRowData> = [];
  public configPoolSrcData: TiTableSrcData;
  public configPoolColumns: Array<TiTableColumns> = [];
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedData: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceData,
    false,
    false
  );
  public totalCountMonitor: any;
  public stackTranceDataEnd: Array<TiTreeNode> = [];
  // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
  selectedDataEnd: Array<TiTreeNode> = TiTreeUtil.getSelectedData(
    this.stackTranceDataEnd,
    false,
    false
  );
  public poolSuggest: any = [];
  public snapCount = 0;
  public tipContext: any;
  public spinner = {
    label: '',
    max: 10000,
    min: 0,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public spinnerValue = 3;
  // echarts
  public data: any = [];
  public dataCount = 10;
  public startTime = +new Date();
  public categories: any = [];
  public types: any = [];
  public seriesData: any = [];
  public startDate: any = [];
  public updateOptions: any;
  public connectOwnerThread: any;
  public echartsOption: any = {};

  public jdbcPoolBtnTip = '';
  public noDataMsg = '';
  public limitTime: any;
  public limitData: any;
  public stackBtnTip: string;
  public timer: any;
  public isDoSnapClick = true; // 防止重复点击
  public currentFdTableList: Array<any> = [];
  public currentFdTableListTop: Array<any> = [];
  public timeData: any = [];
  public echartsInstance: any;
  public jbbcpoolTimeout: any = null;
  public analyzID: string;
  ngOnInit() {
    this.limitData = this.downloadService.dataLimit.pool_form.dataValue;
    this.noDataMsg = this.i18n.profileNoData.jdbcPoolNoDataMsg;
    this.configTwoInstructions = this.i18n.jdbcpool.configTwoInstructions;
    this.language = sessionStorage.getItem('language');
    this.jdbcPoolBtnTip = this.i18n.jdbcpool.btn_tip;
    this.types = [
      {
        name: this.i18n.jdbcpool.durationTime,
        color: '#75d874'
      },
      {
        name: this.i18n.jdbcpool.durationTime,
        color: '#f45c5e'
      }
    ];
    this.echartsOption = {
      tooltip: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        boxShadow: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#000000',
        },
        extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, .2);',
        formatter: (params: any) => {
          this.onClickTableRow(params.data);
          return `${params.name[0]}: ${params.value[3]}<br>${params.name[1]}: ${params.data.connectOwnerThread}`;
        }
      },
      legend: {
        itemHeight: 10,
        itemWidth: 10,
        icon: 'rect'
      },
      dataZoom: [
        {
          show: false,
          type: 'slider',
          start: 0,
          end: 100,
          filterMode: 'filter',
          showDetail: false,
          height: 15,
          bottom: 20,
          fillerColor: 'rgba(0, 108, 255, 0.15)'
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
        }
      ],
      grid: {
        left: 100,
        top: 50,
        right: 25,
        bottom: 0
      },
      xAxis: [{
        scale: true,
        position: 'top',
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#E1E6EE',
            width: 2
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E1E6EE'],
            width: 1
          }
        },
        axisLabel: {
          color: '#222',
          formatter: (val: any) => {
            const date = new Date(val);
            const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            return `${hour}:${min}:${sec}`;
          }
        }
      }, {
        scale: true,
        position: 'bottom',
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#E1E6EE',
            width: 2
          }
        }
      }],
      yAxis: {
        data: this.categories,
        axisLabel: {
          margin: 60,
          align: 'center'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#d4d9e6'],
            width: 1
          }
        }
      },
      series: [{
        type: 'custom',
        renderItem: this.renderItem,
        itemStyle: {
          height: 15,
          opacity: 0.8
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: []
      }]
    };
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    if (!this.snapShot) {
      this.tableData = this.downloadService.downloadItems.jdbcpool.tableData;
    }
    if (this.isDownload) {
      this.threshold.value = this.downloadService.downloadItems.jdbcpool.threshold;
      this.alertThreshold = this.downloadService.downloadItems.jdbcpool.alertThreshold;
      this.spinnerValue = this.downloadService.downloadItems.jdbcpool.spinnerValue;
      this.tableData = this.downloadService.downloadItems.jdbcpool.tableData;

      this.startDate = this.downloadService.downloadItems.jdbcpool.monitor.startDate;
      this.jdbcpoolConfig = this.downloadService.downloadItems.jdbcpool.jdbcpoolConfig;
      this.configTitle = this.downloadService.downloadItems.jdbcpool.configTitle;
    } else {
      this.threshold.value = this.downloadService.dataSave.jdbcPoolThreshold;
      this.alertThreshold = this.downloadService.dataSave.jdbcPoolAlertThreshold;
      this.spinnerValue = this.downloadService.dataSave.jdbcPoolSpinnerValue;
      this.connectDatas = this.downloadService.dataSave.jdbcPoolConnect;
      this.jdbcpoolConfig = this.downloadService.dataSave.jdbcpoolConfigData;
      this.configTitle = this.downloadService.dataSave.configTitle;
    }
    this.updateOptions = this.downloadService.downloadItems.jdbcpool.echartsData;
    if (this.updateOptions.series) {
      this.categories = this.updateOptions.yAxis.data;
      this.startTime = this.updateOptions.xAxis.data;
      this.seriesData = this.updateOptions.series[0].data;
    }
    // 左侧
    this.columnsTable = [
      {
        title: '',
        width: '1%',
      },
      {
        title: this.i18n.jdbcpool.linkId,
        width: '19%',
        sortKey: 'linkId'
      },
      {
        title: this.i18n.jdbcpool.linkChart,
        width: '20%',
        sortKey: 'linkChart'
      },
      {
        title: this.i18n.jdbcpool.beginTime,
        width: '20%',
        sortKey: 'beginTime'
      },
      {
        title: this.i18n.jdbcpool.endTime,
        width: '20%',
        sortKey: 'endTime'
      },
      {
        title: this.i18n.jdbcpool.eventCount,
        width: '10%',
        isSort: true,
        sortKey: 'count'
      },
      {
        title: this.i18n.jdbcpool.eventCostTime,
        width: '10%',
        isSort: true,
        sortKey: 'duration'
      },
    ];
    this.configPoolColumns = [
      {
        title: 'key',
        width: '50%'
      },
      {
        title: 'value',
        width: '50%'
      }
    ];
    this.srcDataTable = {
      data: this.tableData,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.configPoolSrcData = {
      data: this.tableDataPool,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };

    const role = sessionStorage.getItem('role');
    if (this.snapShot) { return; }
    const res = this.downloadService.downloadItems.jdbcpool.stackDepth;
    if (role === 'Admin') {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
    } else {
      this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
    }
    this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
    this.handleSnapShotCount('jdbcpool');
    this.beginFileIo = this.downloadService.dataSave.isjdbcPoolStart;
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.startBtnDisabled = true;
        this.beginFileIo = false;
        this.clearJpoolTimer();
        this.createProServise.clearJdbcpoolTimer();
      }
    });
    this.poolSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'pool') {
        if (msg.data) {
          this.clearJpoolTimer();
          this.createProServise.clearJdbcpoolTimer();
        }
        msg.data.forEach((item: any) => {
          this.jdbcConnectHandle(item);
          this.handlePoolData(this.connectDatas);
        });
      }
      if (msg.type === 'dataLimit') {
        if (msg.data.type === 'pool_form') {
          this.limitData = this.downloadService.dataLimit.pool_form.dataValue;
        }
      }
      if (msg.type === 'isRestart') {
        this.alertThreshold = '';
        this.startBtnDisabled = false;
        this.snapCount = 0;
        this.suggestArr = [];
        this.clearJpoolTimer();
        this.createProServise.clearJdbcpoolTimer();
        this.initData();
      }
      if (msg.type === 'isClear' || msg.type === 'isClearOne') {
        this.initData();
      }
      if (msg.type === 'exportData') {
        this.downloadData();
      }
    });
    this.stompService.updataJdbcSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'updata_pool') {
      }
    });
    this.jdbcPoolSuggest = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'connect-pool-suggest') {
        this.poolSugg(msg.data);
      }
    });
    this.timer = setInterval(() => {
      if (this.downloadService.downloadItems.jdbcpool.suggestArr.length > 0) {
        this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
      }
    }, 500);
    this.deleteOneTab = this.msgService.getMessage().subscribe(msg => {
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
  }
  ngAfterViewInit(): void {
    this.dragService.create({
      helper: this.draggableEle.nativeElement
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.timer = null;
    if (this.isDownload || this.snapShot) { return; }
    this.downloadData();
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    if (this.poolSub) { this.poolSub.unsubscribe(); }
    if (this.jdbcPoolSuggest) { this.poolSub.unsubscribe(); }
    this.msgService.sendMessage({ type: 'getDeleteOne' });  // 清除本页面的发送事件
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
  }
  private initData() {
    this.stackTranceData = [];
    this.stackTranceDataEnd = [];
    this.srcDataTable.data = [];
    this.tableData = [];
    this.connectDatas = {};
  }
  public downloadData() {
    this.downloadService.downloadItems.jdbcpool.tableData = this.srcDataTable.data;
    this.downloadService.dataSave.jdbcPoolConnect = this.connectDatas;
    this.downloadService.downloadItems.jdbcpool.echartsData = this.updateOptions;
    this.downloadService.downloadItems.jdbcpool.threshold = this.threshold.value;
    this.downloadService.downloadItems.jdbcpool.alertThreshold = this.alertThreshold;
    this.downloadService.downloadItems.jdbcpool.spinnerValue = this.spinnerValue;
    this.downloadService.dataSave.isjdbcPoolStart = this.beginFileIo;
  }
  public renderItem(params: any, api: any) {
    const categoryIndex = api.value(0);
    const start = api.coord([api.value(1), categoryIndex]);
    const end = api.coord([api.value(2), categoryIndex]);
    const height = api.size([0, 1])[1] * 0.6;
    const rectShape = echarts.graphic.clipRectByRect({
      x: start[0],
      y: start[1] - height / 2,
      width: 15,
      height
    }, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    });
    return rectShape && {
      type: 'rect',
      shape: rectShape,
      style: api.style()
    };
  }
  public getStack() {
    const role = sessionStorage.getItem('role');
    this.Axios.axios.get('tools/settings/stackDepth').then((res: any) => {
      this.downloadService.downloadItems.jdbcpool.stackDepth = res;
      if (role === 'Admin') {
        this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackAdmin, { 0: res });
      } else {
        this.stackBtnTip = this.i18nService.I18nReplace(this.i18n.newHeader.setting.stackUser, { 0: res });
      }
    });
  }
  public handleEchartsHeight() {
    return this.categories.length * 40;
  }
  // 开启连接池
  public onStartPool() {
    if (this.startBtnDisabled) { return; }
    if (!this.threshold.value) {
      const invalidEl = this.el.nativeElement.querySelector(`.hbase-threshold.ng-invalid.ng-touched:not([tiFocused])`);
      if (invalidEl) {
        const inputEl = $(invalidEl).find('.ti3-spinner-input-box>.ti3-spinner-input')[0];
        inputEl.focus();
      }
      return;
    }
    this.beginFileIo = !this.beginFileIo;
    this.isStopFlag = true;
    // 开始接收pool的socket信息
    this.stompService.startStompRequest('/cmd/start-instrument-connect-pool', {
      jvmId: this.jvmId,
      guardianId: this.guardianId,
      threshold: this.threshold.value * 1000
    });
    if (this.srcDataTable.data.length === 0) {
      this.jbbcpoolTimeout = setTimeout(() => {
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.profileNodataTip.jdbcpool,
          time: 10000
        });
      }, 30000);
    }
    this.getStack();
    this.downloadService.dataSave.jdbcPoolThreshold = this.threshold.value;
    this.downloadService.dataSave.jdbcPoolAlertThreshold = this.alertThreshold;
    this.downloadService.dataSave.jdbcPoolSpinnerValue = this.spinnerValue;
    this.downloadService.dataSave.isjdbcPoolStart = true;
    this.downloadService.dataSave.isSocketIOStart = false;
    this.downloadService.dataSave.isFileIOStart = false;
    this.downloadService.dataSave.isAsyncDis = true;
    let tempTimer = setTimeout(() => {
      clearInterval(this.stompService.poolTimer);
      this.stompService.poolTimer = null;
      clearTimeout(tempTimer);
      tempTimer = null;
    }, this.stompService.poolStep);

    if (this.stompService.poolTimer) {
      this.isStopFlag = false;
      clearInterval(this.stompService.poolTimer);
      this.stompService.poolTimer = null;
    }
    // 开始接收连接池优化信息
  }
  // 关闭连接池
  public onStopPool() {
    this.beginFileIo = !this.beginFileIo;
    this.stompService.startStompRequest('/cmd/stop-instrument-connect-pool', {
      jvmId: this.jvmId,
      guardianId: this.guardianId,
      threshold: this.threshold.value
    });
    this.downloadService.dataSave.jdbcPoolThreshold = this.threshold.value;
    this.downloadService.dataSave.jdbcPoolAlertThreshold = this.alertThreshold;
    this.downloadService.dataSave.jdbcPoolSpinnerValue = this.spinnerValue;
    this.downloadService.dataSave.isjdbcPoolStart = false;
    this.downloadService.dataSave.isAsyncDis = false;
    this.downloadService.dataSave.isCheckAsync = false;
    this.clearJpoolTimer();
    this.createProServise.clearJdbcpoolTimer();
    let tempTimer = setTimeout(() => {
      if (!this.isStopFlag) {
        this.isStopFlag = true;
        return;
      }
      this.stompService.fileIoSub = null;
      clearTimeout(tempTimer);
      tempTimer = null;
    }, this.stompService.jdbcStep * 2);
  }
  public onModelChange(value: any): void {
    if (!value) {
      this.spinnerValue = 0;
    }
  }
  // 连接池计算
  private jdbcConnectHandle(data: any) {
    const connectDatas = JSON.parse(JSON.stringify(this.connectDatas));
    if (!data.connect_) { return; }
    const linkId = data.connect_.physicalsConnectId;
    const sessId = data.connect_.connectId;
    const connectOwnerThread = data.connect_.connectOwnerThread;
    const urlData = data.dbcp_ || data.druid_ || data.c3p0_ || data.hikari_;
    if (this.jdbcpoolConfig.length === 0) {
      this.configTitle = data.attributes_.poolType;
      this.downloadService.downloadItems.jdbcpool.configTitle = this.configTitle;
      this.downloadService.dataSave.configTitle = this.configTitle;
      this.configPool(urlData);
    }
    if (!connectDatas[linkId]) {
      connectDatas[linkId] = {
        linkId,
        sessId: linkId,
        url: urlData.url,
        startTime: '',
        endTime: '',
        count: 0,
        duration: 0,
        connectOwnerThread,
        sessions: {}
      };
    }
    const status = data.connect_.connectStatus;
    if (status === 'close') {
      connectDatas[linkId].count++;
    }
    if (status === 'connect') {
      this.startDate.push(this.handleTimeFormat(data.connect_.connectedTimeMillis));
    }

    const sessObj = connectDatas[linkId].sessions;
    if (!sessObj[sessId]) {

      sessObj[sessId] = {
        sessId,
        startTime: status === 'connect' ? data.connect_.connectedTimeMillis : '',
        endTime: status === 'close' ? data.connect_.connectedTimeMillis : '',
        url: urlData.url,
        count: 0,
        duration: 0,
        status: [],
        stackTraces: [],
        config: {}
      };
    }
    const endTime = sessObj[sessId].endTime;
    const startTime = sessObj[sessId].startTime;
    sessObj[sessId].config = urlData;
    sessObj[sessId].endTime = !endTime && status === 'close' ? data.connect_.connectedTimeMillis : endTime;
    sessObj[sessId].duration = (!sessObj[sessId].endTime || !startTime) ? 0 : sessObj[sessId].endTime - startTime;
    sessObj[sessId].count = status === 'close' ? 1 : 0;
    sessObj[sessId].status.push(status);

    const root: any = { label: 'root', status, children: [] };
    sessObj[sessId].stackTraces.push(this.trackFormat(data.allStackTraces_, root));
    connectDatas[linkId].duration += sessObj[sessId].duration;
    this.connectDatas = connectDatas;
  }
  public handlePoolData(connectDatas: any) {
    const table = Object.values(connectDatas);
    const cate2: any = [];
    table.forEach((item: any) => {
      const tableDataValue = Object.values(item.sessions);
      const newTableArr: any = tableDataValue.slice(0, this.spinnerValue);
      const obj: any = {};
      if (newTableArr != null) {
        for (const i of Object.keys(newTableArr)) {
          obj[newTableArr[i].sessId] = newTableArr[i];
        }
      }
      item.sessions = obj;
    });
    this.tableData = table;
    this.srcDataTable.data = this.tableData;
    if (this.srcDataTable.data.length > this.limitData) {
      this.srcDataTable.data = this.srcDataTable.data.slice(-this.limitData - 1, -1);
    }
    this.categories = [];
    this.srcDataTable.data.forEach(item => {
      this.categories.push(item.linkId);
    });
    this.categories = cate2.concat(this.categories.filter((v: any) => {
      return !(cate2.indexOf(v) > -1);
    }));
    this.seriesData = [];
    echarts.util.each(this.categories, (category: any, index: any) => {
      let sessionsArr: any = [];
      if (Object.values(connectDatas)[index]) {
        const conectObj: any = Object.values(connectDatas)[index];
        sessionsArr = Object.values(conectObj.sessions);
      }
      sessionsArr.forEach((item: any, i: any) => {
        const typeItem = this.types[0];
        const typeItem1 = this.types[1];
        const baseTime = Number(item.startTime);
        const endTime = item.endTime;
        const duration = item.duration;
        const connectVal: any = Object.values(connectDatas)[index];
        const connectOwner = connectVal.connectOwnerThread;
        if (duration < this.alertThreshold || this.alertThreshold === null || this.alertThreshold === undefined) {
          this.seriesData.push({
            name: [this.i18n.jdbcpool.durationTime, this.i18n.jdbcpool.thread],
            value: [
              index,
              baseTime,
              endTime,
              duration
            ],
            itemStyle: {
              normal: {
                color: typeItem.color
              }
            },
            stackTraces: item.stackTraces,
            connectOwnerThread: connectOwner
          });
        } else {
          this.seriesData.push({
            name: [this.i18n.jdbcpool.durationTime, this.i18n.jdbcpool.thread],
            value: [
              index,
              baseTime,
              endTime,
              duration
            ],
            itemStyle: {
              normal: {
                color: typeItem1.color
              }
            },
            stackTraces: item.stackTraces,
            connectOwnerThread: connectOwner
          });
        }
        this.timeData.push(this.libService.dateFormat(baseTime, 'hh:mm:ss'));
        this.timeData = [...new Set(this.timeData)];
      });
    });
    // 更新echarts参数
    const xAxis1 = {
      data: this.startTime,
    };
    const yAxis1 = {
      data: this.categories
    };
    const series1 = [
      {
        data: this.seriesData
      }
    ];
    this.updateOptions = {
      xAxis: xAxis1,
      yAxis: yAxis1,
      series: series1
    };
    this.downloadService.downloadItems.jdbcpool.echartsData = this.updateOptions;
    const chart = document.getElementById('echartId');
    if (this.categories.length > 10) {
      chart.style.height = `${this.categories.length * 38}px`;
    }
  }
  private trackFormat(stackTrack: any, theTree: any) {
    this.totalCountMonitor = stackTrack.length;
    let node = theTree;
    stackTrack.forEach((item: any) => {
      node.children = node.children || [];
      const count = (item.lineNum_ - 0) / this.totalCountMonitor;
      const label = item.className_ + '.' + item.methodName_ + ' ' + item.lineNum_;
      const obj: any = {
        count,
        label,
        children: []
      };
      node.children.push(obj);
      node = obj;
    });
    return JSON.parse(JSON.stringify(theTree));
  }
  public beforeToggle(row: TiTableRowData): void {
    this.srcDataTable.data.forEach(e => {
      if (row.linkId !== e.linkId) {
        e.showDetails = false;
      }
    });
    this.currentFdTableList = [];
    this.currentFdTableListTop = [];
    const sessionsArr = Object.values(row.sessions);
    this.currentFdTableList = sessionsArr.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.currentFdTableListTop = this.currentFdTableList.slice(0, this.spinnerValue);
    row.showDetails = !row.showDetails;
  }
  // 点击表格某行
  public onClickTableRow(row: any) {
    if (this.subrow) {
      this.subrow.isSelect = false;
    }
    this.subrow = row;
    this.subrow.isSelect = true;
    this.stackTranceData = [];
    this.stackTranceDataEnd = [];
    row.stackTraces.forEach((stack: any) => {
      if (stack.status !== 'close') {
        this.stackTranceData = stack.children;
      } else {
        this.stackTranceDataEnd = stack.children;
      }
      this.treeFindChild(stack.children);
    });
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
  public configPool(values: any) {
    const data = [];
    if (values != null) {
      for (const key of Object.keys(values)) {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          const element = values[key];
          const obj = {
            label: key,
            value: element || '--'
          };
          data.push(obj);
        }
      }
    }
    this.jdbcpoolConfig = data;
    this.downloadService.downloadItems.jdbcpool.jdbcpoolConfig = this.jdbcpoolConfig;
    this.downloadService.dataSave.jdbcpoolConfigData = this.jdbcpoolConfig;
  }
  public configMouse(value: any) {
    this.configContext = value;
    this.configPoolSrcData.data = value.detail;
  }
  public poolSugg(value: any) {
    if (value) {
      this.jdbcpoolConfig.forEach((item: any) => {
        if (value.subLabel === item.label) {
          item.expected = value.title;
          item.descInfo = value.potentialStuff[0];
          const detailAll: any = [];
          const detailArr = value.suggestion.split(';').slice(0, -1);
          detailArr.forEach((detail: any) => {
            const keyArr = detail.split(':');
            detailAll.push({
              key: keyArr[0],
              value: keyArr[1]
            });
          });
          item.detail = detailAll;
        }
      });
      this.suggestArr = this.downloadService.downloadItems.jdbcpool.suggestArr;
    }
  }
  public onControlAnalysis() {
    if (this.snapShot) { return; }
    if (!this.beginFileIo) {
      this.onStartPool();
    } else {
      this.onStopPool();
    }
  }
  public handleEventCount(row: any) {
    let total = 0;
    if (row.children) {
      row.children.forEach((item: any) => {
        return total += +item.eventCount;
      });
    }
    return total;
  }
  public handleEventCostTime(row: any) {
    let total = 0;
    if (row.children) {
      row.children.forEach((item: any) => {
        return total += +item.eventCostTime;
      });
    }
    return total;
  }

  public onSelect(event: TiTreeNode): void {
    // 获取当前选中项，参数：树节点数据，选中项是否只包含叶子节点，是否多选
    this.selectedData = TiTreeUtil.getSelectedData(
      this.stackTranceData,
      false,
      false
    );
  }
  // 展开整个树
  public expandNode(state: string): void {
    const data: Array<TiTreeNode> = state === 'start' ?
      this.stackTranceData.concat() : this.stackTranceDataEnd.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    state === 'start' ? this.stackTranceData = data : this.stackTranceDataEnd = data;
  }
  // 收起整个树
  public deExpandNode(state: string): void {
    const data: Array<TiTreeNode> = state === 'start' ?
      this.stackTranceData.concat() : this.stackTranceDataEnd.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = false;
    }
    state === 'start' ? this.stackTranceData = data : this.stackTranceDataEnd = data;
  }
  private random() {
    return parseInt((Math.random() * 1).toFixed(1), 10);
  }
  public timeFormat(time: any) {
    const date = new Date(+time);
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${hour}:${min}:${sec}`;
  }
  public handleTimeFormat(time: any) {
    if (!time) {
      return '--';
    }
    const date = new Date(+time);
    const year = date.getFullYear();
    const month = +date.getMonth() + 1;
    const months = month < 10 ? '0' + month : month;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    const misec = date.getMilliseconds();
    return `${year}/${months}/${day} ${hour}:${min}:${sec}.${misec}`;
  }
  public handleViewData(values: any) {
    return Object.values(values);
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
          label: this.i18n.protalserver_profiling_tab.jdbcpool,
          type,
          children: [],
        };
      }
      snapShot[type].children.push(
        {
          label: nowTime,
          type,
          value: {
            file: tableTop,
            config: this.jdbcpoolConfig,
            snapCount: this.snapCount + 1,
            threshold: this.threshold.value,
            alertThreshold: this.alertThreshold,
            spinnerValue: this.spinnerValue,
            configTitle: this.configTitle,
            suggestArr: this.suggestArr,
            stackBtnTip: this.stackBtnTip,
            xAxis: {
              data: this.startTime
            },
            yAxis: {
              data: this.categories
            },
            series: [
              {
                data: this.seriesData
              }
            ]
          }
        }
      );
      this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
      this.downloadService.downloadItems.snapShot.data = snapShot;
      this.downloadService.downloadItems.jdbcpool.snapCount = this.snapCount + 1;
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
  /**
   * 在展开整个树
   * @param row row
   */
  public expandAllNode(row: TiTableRowData, index: number) {
    if (row.expanded) {
      return;
    }
    let treeData;
    if (!index) {
      treeData = this.stackTranceData;
    } else {
      treeData = this.stackTranceDataEnd;
    }
    const data: Array<TiTreeNode> = treeData.concat();
    TiTreeUtil.traverse(data, traverseFn);
    function traverseFn(node: TiTreeNode): void {
      node.expanded = true;
    }
    if (!index) {
      this.stackTranceData = data;
    } else {
      this.stackTranceDataEnd = data;
    }
  }
  public handleSnapShotCount(type: any) {
    this.snapCount = this.downloadService.downloadItems.jdbcpool.snapCount;
  }
  public importSnapData(snapShotData: any) {
    let tempTimer = setTimeout(() => {
      this.snapCount = snapShotData.snapCount;
      this.threshold.value = snapShotData.threshold;
      this.alertThreshold = snapShotData.alertThreshold;
      this.spinnerValue = snapShotData.spinnerValue;
      this.srcDataTable.data = snapShotData.file;
      this.jdbcpoolConfig = snapShotData.config;
      this.configTitle = snapShotData.configTitle;
      this.suggestArr = snapShotData.suggestArr;
      this.stackBtnTip = snapShotData.stackBtnTip;
      this.updateOptions = {
        xAxis: snapShotData.xAxis,
        yAxis: snapShotData.yAxis,
        series: snapShotData.series
      };
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 100);
    this.srcDataTable.data.forEach(e => {
      e.showDetails = false;
    });
  }
  public closeSuggest() {
    this.hoverClose = '';
    this.isSuggest = false;
  }
  public closeHandle(e: any) {
    this.isSuggest = false;
  }
  public openSuggest() {
    $('.analysis').css({ zIndex: '101' });
    $('.poolSug').css({ zIndex: '99' });
    this.isSuggest = true;
  }
  public openJDBC() {
    $('.analysis').css({ zIndex: '99' });
    $('.poolSug').css({ zIndex: '101' });
    this.jdbcSug = true;
  }
  public onHoverJDBC(msg?: any) {
    this.hoverClose = msg;
  }
  public closeJDBC() {
    this.hoverClose = '';
    this.jdbcSug = false;
  }
  public closeSug() {
    $('.analysis').css({ zIndex: '101' });
    $('.poolSug').css({ zIndex: '99' });
    this.isSuggest = true;
    this.hoverClose = '';
  }
  public dragAnalysis() {
    $('.analysis').css({ zIndex: '101' });
    $('.poolSug').css({ zIndex: '99' });
  }
  public dragJDBC() {
    $('.analysis').css({ zIndex: '99' });
    $('.poolSug').css({ zIndex: '101' });
  }

  onChartInit(ec: any) {
    this.echartsInstance = ec;
  }

  public timeLineData(event: any) {
    this.echartsOption.dataZoom[0].start = event.start;
    this.echartsOption.dataZoom[0].end = event.end;
    this.echartsInstance.setOption({
      dataZoom: this.echartsOption.dataZoom
    });
  }
  public handleDatazoom(event: any) {
    this.jdbcPoolTimeLine.dataConfig({
      start: event.batch[0].start,
      end: event.batch[0].end,
    });
  }
  public getTime(val: any) {
    const date = new Date(val);
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${hour}:${min}:${sec}`;
  }
  public clearJpoolTimer() {
    clearTimeout(this.jbbcpoolTimeout);
    this.jbbcpoolTimeout = null;
  }
}
