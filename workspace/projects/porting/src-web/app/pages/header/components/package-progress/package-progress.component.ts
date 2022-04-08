import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs';
import { CommonService, AxiosService, I18nService, MessageService } from '../../../../service';

@Component({
  selector: 'app-package-progress',
  templateUrl: './package-progress.component.html',
  styleUrls: ['./package-progress.component.scss']
})
export class PackageProgressComponent implements OnInit, OnDestroy {

  public i18n: any;
  constructor(
    private i18nService: I18nService,
    private Axios: AxiosService,
    private msgService: MessageService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  @Input() reportId: string;
  @Output() createSucc = new EventEmitter();


  private maxCount = 3; // 异常情况下最多轮询次数
  private curCount = 0; // 异常情况下轮询次数
  private getStatusTimer: any = null;
  private currLang = 'zh-cn';

  public situation = -1;
  public msgInfo = '';

  public packResult = '';
  private totalProgress = 100; // 总的数据大小
  private totalBar = 440; // 进度条总宽
  public progessValue = '';
  public barWidth = 0;

  private cancels: any = [];
  private closeTaskSub: Subscription;

  ngOnInit() {
    this.currLang = sessionStorage.getItem('language');
    this.getStatus();
    this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
      if (message.type === 'closeTaskMsg' && message.data.result.subType === 'SoftwarePackage') {
        this.Axios.axios.delete(`/portadv/autopack/${encodeURIComponent(this.reportId)}/`)
        .then((resp: any) => {
          const msg = this.currLang ? resp.infochinese : resp.info;
          this.clearTimer();
          while (this.cancels.length > 0) {
            this.cancels.pop()();
          }
          if (this.commonService.handleStatus(resp) === 0) {
            this.createSucc.emit({
              id: this.reportId,
              type: 'SoftwarePackage',
              situation: 2,
              state: 'stop_success',
              msg });
            return;
          }
          this.createSucc.emit({ id: this.reportId, type: 'SoftwarePackage', situation: 2, state: 'stop_failed', msg});
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
  }
  public getStatus() {
    let url = '/task/progress/?task_type=1';
    url += this.reportId ? `&task_id=${this.reportId}` : '';

    const CancelToken = axios.CancelToken;

    this.Axios.axios.get(url, {
      cancelToken: new CancelToken( c1 => (this.cancels.push(c1)))
    }).then((resp: any) => {
      const data = resp.data; // 统一进度条使用
      if (Object.keys(data).length === 0) {
        if (this.commonService.handleStatus(resp) !== 0) {
          this.msgInfo = this.getRespInfo(resp);
          this.createSucc.emit({id: this.reportId, type: 'SoftwarePackage', state: 'failed', msg: this.msgInfo});
          this.msgService.sendMessage({ type: 'creatingPackageProgress', data: true});
        }
        return;
      }
      if (/deb/.test(resp.infochinese) || localStorage.getItem('filename') === 'deb') {
        localStorage.setItem('filename', 'deb');
      }
      if (/rpm/.test(resp.infochinese) || localStorage.getItem('filename') === 'rpm') {
        localStorage.setItem('filename', 'rpm');
      }
      if (data.status === -1) {
        // 暂无任务
        this.curCount++;
        if (this.curCount <= this.maxCount) {
          this.getStatus();
        }
      } else if (data.status === 0) {
        // 打包成功
        this.situation = 2;
        this.curCount = 0;
        this.packResult = data.result;
        this.msgInfo = this.getRespInfo(resp);
        this.createSucc.emit({
          id: this.reportId,
          type: 'SoftwarePackage',
          state: 'success',
          situation: 2,
          msg: this.msgInfo,
          data: { packResult: this.packResult }
        });
        this.msgService.sendMessage({ type: 'creatingPackageProgress', data: true});
        this.clearTimer();
      } else if (data.status === 1) {
        // 正在打包
        this.progessValue = data.progress + '%';
        this.barWidth = Math.floor((data.progress / this.totalProgress) * this.totalBar);
        this.situation = 1;
        this.curCount = 0;
        this.msgInfo = this.getRespInfo(resp);
        this.clearTimer();
        this.msgService.sendMessage({ type: 'creatingPackageProgress', data: true});
        this.getStatusTimer = setTimeout(() => {
          this.getStatus();
        }, 3000);
      } else if (data.status === 2) {
        // 打包失败
        this.clearTimer();
        this.curCount = 0;
        this.situation = 3;
        this.packResult = data.result;
        this.msgInfo = this.getRespInfo(resp);
        this.createSucc.emit({
          id: this.reportId,
          type: 'SoftwarePackage',
          state: 'failed',
          situation: 3,
          msg: this.msgInfo,
          data: { packResult: this.packResult }
        });
        this.msgService.sendMessage({ type: 'creatingPackageProgress', data: true});

      } else if (data.status === 3) {
        this.situation = 4;
        this.msgInfo = this.getRespInfo(resp);
        this.createSucc.emit({
          id: this.reportId,
          type: 'SoftwarePackage',
          state: 'success',
          situation: 4,
          msg: this.msgInfo });
        this.msgService.sendMessage({ type: 'creatingPackageProgress', data: true});
      }
    }, (error: any) => {
      this.msgService.sendMessage({ type: 'creatingPackageProgress', data: false});
    });
  }

  public closeTask() {
    const resultMsg = {
      id: this.reportId,
      type: 'stopConfirm',
      subType: 'SoftwarePackage',
      state: 'prompt',
    };
    this.msgService.sendMessage({
      type: 'creatingResultMsg',
      data: resultMsg
    });
  }

  private showLoding() {
    document.getElementById('loading-box').style.display = 'flex';
  }
  private closeLoding() {
    document.getElementById('loading-box').style.display = 'none';
  }

  private clearTimer() {
    if (this.getStatusTimer) {
      clearTimeout(this.getStatusTimer);
      this.getStatusTimer = null;
    }
  }

  private getRespInfo(data: any) {
    const info = this.currLang === 'zh-cn' ? data.infochinese : data.info;
    return info;
  }

}
