import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { Subscription } from 'rxjs';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
@Component({
  selector: 'app-profile-hot',
  templateUrl: './profile-hot.component.html',
  styleUrls: ['./profile-hot.component.scss']
})
export class ProfileHotComponent implements OnInit, OnDestroy, AfterViewInit {

  i18n: any;
  constructor(
    public vscodeService: VscodeService,
    private stompService: StompService,
    private msgService: MessageService,
    public downloadService: ProfileDownloadService,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('hotAnalysis', { static: false }) hotAnalysis: any;
  public isStopMsgSub: Subscription;
  public hotDataInf = {}; // 火焰图数据
  public noDataInf: any; // 无数据或者检测不能分析
  public guardianId: any;
  public jvmId: any;
  public params: any;
  public inforData: any = []; // 表单信息
  public startBtnDisabled: any; // 停止分析状态
  public arguments: any; // 概览下的参数配置信息
  public language: any;
  public hotMethodInf: any; // 点击方法获取的信息
  public meId: any;
  public labelType: any;
  public isDisassemblyFinished = false;
  public isByteCodeFinished = false;

  ngOnInit(): void {
    this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab.hot;
    if (this.downloadService.downloadItems.hot.inforData.length > 0) {
      this.inforData = this.downloadService.downloadItems.hot.inforData;
    }
    this.language = ((self as any).webviewSession || {}).getItem('language');
    this.jvmId = (self as any).webviewSession.getItem('jvmId');
    this.guardianId = (self as any).webviewSession.getItem('guardianId');
    this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop') || 'false');
    this.arguments = this.downloadService.downloadItems.overview.arguments;
    this.checkInfor();
    this.hotDataInf = this.downloadService.downloadItems.hot.hotData;

    this.isStopMsgSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'isStopPro') {
        this.startBtnDisabled = true;
        if (this.hotAnalysis.beginSample) {
          this.hotAnalysis.showInfor = false; // 不显示form表单信息
          this.hotAnalysis.inforDataHot = [];
        }
      }
      if (msg.type === 'isRestart') {
        this.startBtnDisabled = false;
        this.hotDataInf = {};
        this.hotMethodInf = [];
        this.hotAnalysis.showInfor = false; // 不显示form表单信息
        this.hotAnalysis.inforDataHot = [];
        this.hotAnalysis.recordData.startCreating = true;
        this.hotAnalysis.recordData.duration = 0;
        this.hotAnalysis.recordData.createTime = 0;
        this.hotAnalysis.recordData.startCreating = true;
        this.hotAnalysis.startOnHot = false;
      }
      if (msg.type === 'isClear' || msg.type === this.i18n.protalserver_profiling_tab.hot) {
        this.hotAnalysis.recordData.duration = 0;
        this.hotAnalysis.recordData.createTime = 0;
        this.hotAnalysis.recordData.startCreating = true;
        this.hotAnalysis.startOnHot = false;
        this.onCancelHot();
        this.hotAnalysis.beginSample = false;
        this.clearHotData();
        this.hotAnalysis.dividerHide();
      }
      if (msg.type === 'setDeleteOne') {
        if (Object.keys(this.hotDataInf).length === 0) {
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
    this.stompService.hotspotAnalysis = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'hotspot-analysis') {
        this.hotDataInf = msg.data.callTree;
        if (this.inforData.length > 0) {
          this.hotAnalysis.inforData = true;
          this.hotAnalysis.inforDataHot = this.inforData;
        }
      }
      if (msg.type === 'startHotspotState') {
        this.hotAnalysis.startOnHot = false;
        if (msg.state === 'SUCCESS') {
          this.hotAnalysis.startSvg();
        } else if (msg.state === 'ERROR') {
          this.noDataInf = msg;
          this.hotAnalysis.beginSample = false;
          this.hotAnalysis.showChart = false;
          this.showInfoBox(msg.message, 'warn');
        }
      }
      if (msg.type === 'stopHotspotState') {
        if (msg.state === 'SUCCESS') {
          this.hotAnalysis.hotDisabled = false;
        }
      }
    });
  }
  /**
   * 发送消息给vscode, 右下角弹出提醒框
   * @param info info
   * @param type type
   */
  showInfoBox(info: any, type: any) {
    const message = {
      cmd: 'showInfoBox',
      data: {
        info,
        type
      }
    };
    this.vscodeService.postMessage(message, null);
  }
  ngAfterViewInit() {
    this.hotAnalysis.startOnHot = this.downloadService.downloadItems.hot.startOnHot;
    this.hotAnalysis.beginSample = this.downloadService.downloadItems.hot.beginSample;
    if (this.hotAnalysis.beginSample) {
      this.hotAnalysis.recordData.startCreating = this.downloadService.downloadItems.hot.startCreating;
      this.hotAnalysis.recordData.duration = this.downloadService.downloadItems.hot.recordDataDuration;
      this.hotAnalysis.recordData.createTime = this.downloadService.downloadItems.hot.recordDataCreateTime;
    }
    if (this.arguments.indexOf('-XX:MaxInlineSize=0') !== -1) {
      this.hotAnalysis.showTip = false; // 不显示热点提示信息
    } else {
      this.hotAnalysis.showTip = true; // 显示热点提示信息
    }
    if (Object.keys(this.hotDataInf).length !== 0 || this.hotAnalysis.startOnHot) { // 判断火焰图数据是否是空数据，===0为空数据
      this.hotAnalysis.inforDataHot = this.downloadService.downloadItems.hot.inforData;
      if (this.hotAnalysis.inforDataHot.length > 0) {
        this.hotAnalysis.showInfor = true; // 显示form表单信息
      }
    }
    this.hotMethodInf = this.downloadService.downloadItems.hot.hotMethodInf;
  }
  ngOnDestroy() {
    this.downloadService.downloadItems.hot.startOnHot = this.hotAnalysis.startOnHot;
    this.downloadService.downloadItems.hot.beginSample = this.hotAnalysis.beginSample;
    this.downloadService.downloadItems.hot.hotData = this.hotDataInf;
    this.downloadService.downloadItems.hot.inforData = this.inforData;
    this.downloadService.downloadItems.hot.recordDataCreateTime = this.hotAnalysis.recordData.createTime;
    this.downloadService.downloadItems.hot.recordDataDuration = this.hotAnalysis.recordData.duration;
    this.downloadService.downloadItems.hot.startCreating = this.hotAnalysis.recordData.startCreating;
    this.downloadService.downloadItems.hot.hotMethodInf = this.hotMethodInf;
  }
  // 点击热点分析按钮
  public clickHotAnalysis(ev: any) {
    if (ev) {
      this.params = ev.hotFormData;
      this.inforData = ev.inforData;
      this.onStartHot();
    } else {
      this.onStopHot();
    }
  }
  // 点击取消分析
  public clickCancelHotAnalysis(ev: any) {
    if (ev) {
      this.onCancelHot();
    }
  }
  public clearHotData() {
    this.hotAnalysis.showChart = false;
    this.hotDataInf = {};
    this.hotMethodInf = [];
    this.hotAnalysis.showInfor = false; // 不显示form表单信息
    this.hotAnalysis.inforData = [];
  }
  checkInfor() {
    const option = {
      url: `/guardians/${this.guardianId}/jvms/${this.jvmId}/check/hotspot/analysis `
    };
    this.vscodeService.get(option, (resp: any) => {
      this.noDataInf = resp;
    });
  }
  onStartHot() {
    this.params.jvmId = this.jvmId;
    this.params.guardianId = this.guardianId;
    this.stompService.startStompRequest('/cmd/start-hotspot-analysis', this.params);
    this.hotAnalysis.showChart = false;
    this.hotAnalysis.beginSample = true;
    this.hotMethodInf = [];
  }
  onCancelHot() {
    this.params.jvmId = this.jvmId;
    this.params.guardianId = this.guardianId;
    this.stompService.startStompRequest('/cmd/cancel-hotspot-analysis', this.params);
  }
  // 重建采样清除数据
  clearedHotDataInf(e: any) {
    if (e) {
      this.hotDataInf = {};
      this.inforData = [];
      this.hotMethodInf = [];
    }
  }
  onStopHot() {
    this.stompService.startStompRequest('/cmd/stop-hotspot-analysis', {
      jvmId: this.jvmId,
      guardianId: this.guardianId
    });
    this.hotAnalysis.startOnHot = false;
  }
  public clickMethod(e: any) {
    const jvmId = encodeURIComponent(this.jvmId);
    const methodId = encodeURIComponent(e.m);
    const labelType = encodeURIComponent(e.l);
    const option = {
      url: `/hotspot/jvms/${jvmId}/methods/${methodId}/disassemble?methodType=${labelType}`
    };
    this.vscodeService.get(option, (resp: any) => {
      this.meId = methodId;
      this.labelType = labelType;
      this.hotMethodInf = resp.data;
      this.isDisassemblyFinished = resp.data.isDisassemblyFinished;
      this.isByteCodeFinished = resp.data.isDisassemblyFinished;
    });
  }
  public selectVersion(e: any) {
    const jId = encodeURIComponent(this.jvmId);
    const meId = encodeURIComponent(this.meId);
    const labelType = encodeURIComponent(this.labelType);
    const v = e.id ? e.id : 0;
    const option = {
      url: `/hotspot/jvms/${jId}/methods/${meId}/disassemble?methodType=${labelType}&version=${v}`
    };
    this.vscodeService.get(option,
      (resp: any) => {
        this.hotMethodInf = resp.data;
      });
  }
}
