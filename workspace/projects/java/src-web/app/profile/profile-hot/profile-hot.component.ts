import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { StompService } from '../../service/stomp.service';
import { MessageService } from '../../service/message.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { MytipService } from '../../service/mytip.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-profile-hot',
  templateUrl: './profile-hot.component.html',
  styleUrls: ['./profile-hot.component.scss']
})
export class ProfileHotComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    public Axios: AxiosService,
    private stompService: StompService,
    private msgService: MessageService,
    public downloadService: ProfileDownloadService,
    private myTip: MytipService,
  ) {

  }
  @ViewChild('hotAnalysis', { static: false }) hotAnalysis: any;
  public isStopMsgSub: Subscription;
  public hotDataInf: any = {}; // 火焰图数据
  public noDataInf: any = {}; // 无数据或者检测不能分析
  public guardianId: any;
  public jvmId: any;
  public params: any;
  public inforData: any = []; // 表单信息
  public startBtnDisabled = false; // 停止分析状态
  public arguments: any; // 概览下的参数配置信息
  public language: any; // 判断中英文
  public hotMethodInf: any; // 点击方法获取的信息
  public meId: any;
  public labelType: any;
  public isDisassemblyFinished = false;
  public isByteCodeFinished = false;

  ngOnInit(): void {
    this.language = sessionStorage.getItem('language');
    this.guardianId = sessionStorage.getItem('guardianId');
    this.jvmId = sessionStorage.getItem('jvmId');
    this.startBtnDisabled = JSON.parse(sessionStorage.getItem('isProStop'));
    this.arguments = this.downloadService.downloadItems.overview.arguments;
    if (this.downloadService.downloadItems.hot.inforData.length > 0) {
      this.inforData = this.downloadService.downloadItems.hot.inforData;
    }
    this.params = this.downloadService.downloadItems.hot.params;
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
      if (msg.type === 'isClear' || msg.type === 'isClearOne') {
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
        this.hotAnalysis.startOnHot = true;
        this.hotDataInf = msg.data.callTree;
        if (this.inforData.length > 0) {
          this.hotAnalysis.showInfor = true; // 显示form表单信息
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
          this.myTip.alertInfo({
            type: 'warn',
            content: msg.message,
            time: 3500
          });
        }
      }
      if (msg.type === 'stopHotspotState') {
        if (msg.state === 'SUCCESS') {
          this.hotAnalysis.beginSample = false;
          this.hotAnalysis.hotDisabled = false;
        }
      }
    });
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
    this.downloadService.downloadItems.hot.params = this.params;
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
    this.hotAnalysis.inforDataHot = [];
  }
  checkInfor() {
    const gId = encodeURIComponent(this.guardianId);
    const jId = encodeURIComponent(this.jvmId);
    this.Axios.axios.get(`/guardians/${gId}/jvms/${jId}/check/hotspot/analysis`
    ).then((resp: any) => {
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
    const jId = encodeURIComponent(this.jvmId);
    const meId = encodeURIComponent(e.m);
    const labelType = encodeURIComponent(e.l);
    this.Axios.axios.get(`/hotspot/jvms/${jId}/methods/${meId}/disassemble?methodType=${labelType}`).then(
      (resp: any) => {
        this.meId = meId;
        this.labelType = labelType;
        this.hotMethodInf = resp.data;
        this.isDisassemblyFinished = resp.data.isDisassemblyFinished;
        this.isByteCodeFinished = resp.data.isDisassemblyFinished;
      },
    );
  }
  public selectVersion(e: any) {
    const jId = encodeURIComponent(this.jvmId);
    const meId = encodeURIComponent(this.meId);
    const labelType = encodeURIComponent(this.labelType);
    const v = e.id ? e.id : 0;
    this.Axios.axios.get(`/hotspot/jvms/${jId}/methods/${meId}/disassemble?methodType=${labelType}&version=${v}`)
    .then(
      (resp: any) => {
        this.hotMethodInf = resp.data;
      },
    );
  }
}
