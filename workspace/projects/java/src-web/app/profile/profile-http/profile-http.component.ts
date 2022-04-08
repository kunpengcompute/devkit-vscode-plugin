import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { MytipService } from '../../service/mytip.service';
import { TiTreeNode, TiValidators } from '@cloud/tiny3';
import { Subscription } from 'rxjs';
import { I18nService } from '../../service/i18n.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { LibService } from '../../service/lib.service';
import { TreeGraph } from './tree';

import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';
import { SpinnerBlurInfo } from 'projects/java/src-com/app/utils/spinner-info.type';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';

@Component({
  selector: 'app-profile-http',
  templateUrl: './profile-http.component.html',
  styleUrls: ['./profile-http.component.scss']
})
export class ProfileHttpComponent implements OnInit, OnDestroy {
  @Input() snapShot: boolean;
  @Input() snapShotData: any;
  @ViewChild('echartsCommon') echartsCommon: any;
  constructor(
    private stompService: StompService,
    private msgService: MessageService,
    public fb: FormBuilder,
    public regularVerify: RegularVerify,
    public i18nService: I18nService,
    private downloadService: ProfileDownloadService,
    private el: ElementRef,
    public mytip: MytipService,
    public libService: LibService
  ) {
    this.i18n = this.i18nService.I18n();
    this.echartDatas.keys = [
      {
        label: this.i18n.protalserver_profiling_http.request,
        unit: this.i18n.common_term_jdbc_times
      },
      {
        label: this.i18n.protalserver_profiling_http.average_exec_time,
        unit: ' ms'
      }
    ];
    this.httpGroup = fb.group({
      http_threshold: new FormControl(50, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(0),
          TiValidators.maxValue(10000),
        ],
        updateOn: 'change',
      }),
    });
  }
  i18n: any;
  public stompClient: any;
  public jvmId = '';
  public guardianId = '';
  private isStopMsgSub: Subscription;
  private httpSub: Subscription;
  private updataHttpSub: Subscription;
  public startBtnDisabled: boolean;

  // sampling配置
  public httpGroup: FormGroup;
  public httpBlur: SpinnerBlurInfo;

  public tip1Context: any;
  public jdbcThresholdTip = '';
  public isStart = true;
  public currentTabName = '';
  public httpTreeData: Array<TiTreeNode> = [];
  public httpTabs = [
    {
      label: 'hot_spots',
      name: 'hot',
      selected: true
    },
    {
      label: 'real_time',
      name: 'real',
      selected: false
    }
  ];

  public count = 1;
  public step = 3000;
  public updateOptions: any;
  public startDate = '';
  public echartItems = ['request', 'aveTime'];
  public echartDatas: any = {
    request: [],
    aveTime: [],
    keys: [],
    label: ['request', 'aveTime'],
    time1: [],
    gridHeight: 100
  };
  public threshold = {
    label: '',
    max: 10000,
    min: 0,
    value: 50,
    rangeValue: [0, 10000],
    format: 'N0',
  };
  public treeDataCached: Array<any> = [];
  public cachedTimer: any = null;

  private isStopFlag = true;

  public isDownload = false;
  public snapCount: number;
  public httpBtnTip: any;
  public limitTime: any;
  public isDoSnapClick = true; // 防止重复点击
  public timeData: any = [];
  public jdbcTimeout: any = null;
  public analyzID: string;
  // 上一次刷新图表时间
  private lastRefreshEchartTime = 0;
  ngOnInit() {
    this.downloadService.downloadItems.currentTabPage = this.i18n.protalserver_profiling_tab.httpRequest;
    this.limitTime = this.downloadService.dataLimit.http.timeValue;
    this.threshold.label = this.i18n.protalserver_profiling_http_threshold;
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.httpBtnTip = this.i18n.protalserver_profiling_http.btn_tip;

    this.setSpinnerBlur();
    this.httpTreeData.push({
      label: 'Hot URL',
      children: [],
      expanded: false
    });
    this.jdbcThresholdTip = this.i18n.protalserver_profiling_http_threshold_tip;
    this.jvmId = sessionStorage.getItem('jvmId');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.getCurrentTab();
    if (this.snapShot) { return; }
    this.handleSnapShotCount('http');
    this.httpGroup.controls.http_threshold.setValue(this.downloadService.dataSave.httpThreshold);
    this.isStart = this.downloadService.dataSave.isHttpStart;
    if (this.isStart) {
      this.refreshTree();
    }
    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.isStart = false;
        this.startBtnDisabled = true;
        this.clearHttpTimer();
      }
    });
    if (this.downloadService.downloadItems.http.hotspot.length !== 0) {
      this.httpTreeData = this.downloadService.downloadItems.http.hotspot;
    }
    this.mapDownlaodEcharts(this.downloadService.downloadItems.http.monitor.data);
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    if (this.isDownload) {
      this.httpGroup.controls.http_threshold.setValue(this.downloadService.downloadItems.http.threshold);
      this.startDate = this.downloadService.downloadItems.http.monitor.startDate;
      return;
    }

    let startTime = 0;
    this.httpSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'http') {
        if (msg.data) {
          this.clearHttpTimer();
        }
        const tree = msg.data.tree;
        this.treeDataCached = [tree];
        if (this.httpTreeData[0].children.length === 0) {
          this.httpTreeData[0].children = JSON.parse(JSON.stringify(this.treeDataCached));
        }
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.httpGroup.controls.http_threshold.setValue(50);
        this.snapCount = 0;
        this.initData();
      }
      if (msg.type === 'isClear' || msg.type === 'isClearOne') {
        this.initData();
      }
    });

    this.updataHttpSub = this.msgService
      .getMessage()
      .subscribe(msg => {
        if (msg.type === 'updata_http') {
          if (startTime === 0) {
            startTime = msg.data.endTime;
          }
          this.updateData(msg.data);
        }
        if (msg.type === 'dataLimit') {
          if (msg.data.type === 'http') {
            this.echartDatas.time1 = [];
            this.echartItems.forEach(item => {
              this.echartDatas[item] = [];
            });
            this.limitTime = this.downloadService.dataLimit.http.timeValue;
          }
        }

        if (msg.type === 'exportData') {
          this.downloadData();
        }
        if (msg.type === 'setDeleteOne') {
          if (this.httpTreeData[0].children.length === 0) {
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

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.httpBlur = {
      control: this.httpGroup.controls.http_threshold,
      min: 0,
      max: 10000,
    };
  }

  /**
   * 微调器回填
   */
  public verifySpinnerValue(value: any) {
    this.regularVerify.setSpinnerInfo(value);
  }
  private initData() {
    this.stompService.treeGraph = new TreeGraph(null);
    this.echartDatas.time1 = [];
    this.echartItems.forEach(item => {
      this.echartDatas[item] = [];
    });
    this.httpTreeData = [];
    this.httpTreeData.push({
      label: 'Hot URL',
      children: [],
      expanded: false
    });
    this.treeDataCached = [];
    this.httpTreeData[0].children = JSON.parse(JSON.stringify(this.treeDataCached));
  }
  private mapDownlaodEcharts(data: any) {
    const keys = Object.keys(data);
    const series: any = [];
    const xAxis: any = [];
    this.echartDatas.time1 = keys;
    this.echartDatas.request = [];
    this.echartDatas.aveTime = [];
    keys.forEach(key => {
      this.echartDatas.request.push(data[key].averCount);
      this.echartDatas.aveTime.push(data[key].averTime);
    });
    this.echartItems.forEach(item => {
      series.push({
        data: this.echartDatas[item]
      });
      xAxis.push({
        data: this.echartDatas.time1
      });
    });
    xAxis.push({
      data: this.echartDatas.time1
    });
    this.updateOptions = {
      series,
      xAxis
    };
    this.timeData = this.echartDatas.time1;
  }

  private refreshTree() {
    this.cachedTimer = setInterval(() => {
      this.httpTreeData[0].children = JSON.parse(JSON.stringify(this.treeDataCached));
    }, 3000);
    this.stompService.httpTimer = setInterval(() => {
      this.stompService.httpUpdata();
    }, this.stompService.httpStep);
  }

  ngOnDestroy(): void {
    if (this.isDownload || this.snapShot) { return; }
    this.downloadData();
    clearInterval(this.cachedTimer);
    this.cachedTimer = null;
    if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    if (this.httpSub) { this.httpSub.unsubscribe(); }
    this.msgService.sendMessage({ type: 'getDeleteOne' });  // 清除本页面的发送事件
    if (this.updataHttpSub) { this.updataHttpSub.unsubscribe(); }
    this.downloadService.dataSave.isHttpStart = this.isStart;
    if (this.stompService.httpTimer) {
      clearInterval(this.stompService.httpTimer);
      this.stompService.httpTimer = null;
    }
  }
  public downloadData() {
    this.downloadService.downloadItems.http.hotspot = JSON.parse(JSON.stringify(this.httpTreeData));
    this.downloadService.downloadItems.http.monitor.data = this.handleDownloadData();
    this.downloadService.downloadItems.http.monitor.startDate = this.startDate;
    this.downloadService.downloadItems.http.threshold = this.httpGroup.controls.http_threshold.value;
  }
  private updateData(data: any) {
    this.startDate = this.libService.dateFormat(data.endTime, 'yyyy/MM/dd');
    const series: any = [];
    const xAxis: any = [];

    if (this.echartDatas.request.length > 20 * Number(this.limitTime)) { this.echartDatas.time1.shift(); }
    this.echartDatas.time1.push(this.libService.dateFormat(data.endTime, 'hh:mm:ss'));
    this.timeData = this.echartDatas.time1;
    this.echartItems.forEach(item => {
      if (this.echartDatas[item].length > 20 * Number(this.limitTime)) { this.echartDatas[item].shift(); }
      this.echartDatas[item].push(data[item]);

      series.push({
        data: this.echartDatas[item]
      });
      xAxis.push({
        data: this.echartDatas.time1
      });
    });
    xAxis.push({
      data: this.echartDatas.time1
    });
    const nowDate = Date.now();
    if (nowDate - this.lastRefreshEchartTime >= 2000) {
      this.lastRefreshEchartTime = nowDate;
      this.updateOptions = {
        series,
        xAxis
      };
      if (this.echartsCommon) {
        this.echartsCommon.updateEchartsData(this.updateOptions);
      }
    }
  }
  startHttp() {
    if (this.startBtnDisabled || this.snapShot) { return; }
    this.stompService.httpTimeInit = {
      startTime: 0,
      endTime: 0,
      count_pre_s: 0,
      duration_pre_s: 0
    };
    if (this.httpGroup.controls.http_threshold.value === '') {
      const invalidEl = this.el.nativeElement.querySelector(`.http-threshold.ng-invalid.ng-touched:not([tiFocused])`);
      if (invalidEl) {
        const inputEl = $(invalidEl).find('.ti3-spinner-input-box>.ti3-spinner-input')[0];
        inputEl.focus();
      }
      return;
    }
    this.isStopFlag = true;
    this.stompService.startStompRequest(
      '/cmd/start-instrument-http',
      { jvmId: this.jvmId, guardianId: this.guardianId, threshold: this.httpGroup.controls.http_threshold.value * 1000 }
    );
    this.stompService.handleStartHttp('/cmd/start-instrument-http');
    if (!this.httpTreeData[0].children.length) {
      this.jdbcTimeout = setTimeout(() => {
        this.mytip.alertInfo({
          type: 'warn',
          content: this.i18n.profileNodataTip.http,
          time: 10000
        });
      }, 30000);
    }
    this.isStart = !this.isStart;
    this.downloadService.dataSave.httpThreshold = this.httpGroup.controls.http_threshold.value;
    this.downloadService.dataSave.isHttpStart = true;
    // 启动http分析时，将停止jdbc分析
    this.downloadService.dataSave.isJdbcStart = false;
    this.downloadService.dataSave.isCassStart = false;
    this.downloadService.dataSave.isHbaseStart = false;
    this.downloadService.dataSave.isMongodbStart = false;
    let tempTimer1 = setTimeout(() => {
      clearInterval(this.stompService.jdbcTimer);
      this.stompService.jdbcTimer = null;
      clearInterval(this.stompService.cassTimer);
      this.stompService.cassTimer = null;
      clearInterval(this.stompService.hbaseTimer);
      this.stompService.hbaseTimer = null;
      clearInterval(this.stompService.mdbTimer);
      this.stompService.mdbTimer = null;
      clearTimeout(tempTimer1);
      tempTimer1 = null;
    }, this.stompService.jdbcStep);

    if (this.stompService.httpTimer) {
      this.isStopFlag = false;
      clearInterval(this.stompService.httpTimer);
      this.stompService.httpTimer = null;
    }
    this.refreshTree();
  }

  public stopHttp() {
    this.stompService.startStompRequest('/cmd/stop-instrument-http', {
      jvmId: this.jvmId,
      guardianId: this.guardianId
    });
    this.isStart = !this.isStart;
    this.downloadService.dataSave.isHttpStart = false;
    this.clearHttpTimer();
    let tempTimer = setTimeout(() => {
      if (!this.isStopFlag) {
        this.isStopFlag = true;
        return;
      }
      clearInterval(this.stompService.httpTimer);
      this.stompService.httpTimer = null;
      clearInterval(this.cachedTimer);
      this.cachedTimer = null;
      clearTimeout(tempTimer);
      tempTimer = null;
    }, this.stompService.httpStep * 2);

  }

  private handleDownloadData() {
    const downloadData: any = {};
    this.echartDatas.time1.forEach((item: any, idx: any) => {
      downloadData[item] = {
        averTime: this.echartDatas.aveTime[idx],
        averCount: this.echartDatas.request[idx]
      };
    });
    return downloadData;
  }

  toggleTab(index: any) {
    this.httpTabs.forEach(tab => {
      tab.selected = false;
    });
    this.httpTabs[index].selected = true;
    this.getCurrentTab();
  }

  private getCurrentTab() {
    this.currentTabName = this.httpTabs.find(tab => {
      return tab.selected;
    }).name;
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
    if (this.httpTreeData[0].children.length < 1) {
      return this.mytip.alertInfo({
        type: 'warn',
        content: this.i18n.snapshot_analysis_noData,
        time: 3500
      });
    }
    const snapCounts = 5;
    if (this.snapCount < snapCounts) {
      const tableTop = this.httpTreeData[0].children;

      const nowTime = this.libService.getSnapTime();
      const snapShot = this.downloadService.downloadItems.snapShot.snapShotData &&
        JSON.parse(this.downloadService.downloadItems.snapShot.snapShotData) || {};
      if (!snapShot[type]) {
        snapShot[type] = {
          label: this.i18n.protalserver_profiling_tab.httpRequest,
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
            threshold: this.httpGroup.controls.http_threshold.value,
            snapCount: this.snapCount + 1,
            echarts: {
              startDate: this.startDate,
              data: this.handleDownloadData()
            }
          }
        }
      );
      this.downloadService.downloadItems.snapShot.snapShotData = JSON.stringify(snapShot);
      this.downloadService.downloadItems.snapShot.data = snapShot;
      this.downloadService.downloadItems.http.snapCount = this.snapCount + 1;
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
  public importSnapData(snapShotData: any) {
    this.httpTreeData[0].children = snapShotData.file;
    this.isStart = false;
    this.startDate = snapShotData.echarts.startDate;
    this.snapCount = snapShotData.snapCount;
    let tempTimer = setTimeout(() => {
      this.httpGroup.controls.http_threshold.setValue(snapShotData.threshold);
      clearTimeout(tempTimer);
      tempTimer = null;
    }, 200);
    this.mapDownlaodEcharts(snapShotData.echarts.data);
  }
  public handleSnapShotCount(type: any) {
    this.snapCount = this.downloadService.downloadItems.http.snapCount;
  }
  public clearHttpTimer() {
    clearTimeout(this.jdbcTimeout);
    this.jdbcTimeout = null;
  }
}
