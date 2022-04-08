import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs';
import { CommonService, AxiosService, I18nService, MessageService } from '../../../../service';

@Component({
  selector: 'app-package-porting-progress',
  templateUrl: './package-porting-progress.component.html',
  styleUrls: ['./package-porting-progress.component.scss']
})
export class PackagePortingProgressComponent implements OnInit, OnDestroy {

  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    private msgService: MessageService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  @Input() reportId: any;
  @Output() createSucc = new EventEmitter();

  public curLanguage = 'zh-cn';
  public formatReport: string;
  public barWidth = 0;
  public totalBar = 440; // 进度条总宽
  public progess = 0; // 目前数据大小
  public totalProgress = 100;  // 总的数据大小
  public progessValue: string;  // 显示的进度值
  public i18n: any;

  private timer: any = null;
  private cancels: any = [];
  private closeTaskSub: Subscription;
  ngOnInit() {
    this.curLanguage = sessionStorage.getItem('language');
    this.getReport();
    this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
      if (message.type === 'closeTaskMsg' && message.data.result.subType === 'PackagePorting') {
        this.Axios.axios.delete(`/portadv/binary/${encodeURIComponent(this.reportId)}/`)
        .then((resp: any) => {
          const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          while (this.cancels.length > 0) {
            this.cancels.pop()();
          }
          if (this.commonService.handleStatus(resp) === 0) {
            this.createSucc.emit({id: this.reportId, type: 'PackagePorting', state: 'stop_success', msg});
            return;
          }
          this.createSucc.emit({ id: this.reportId, type: 'PackagePorting', state: 'stop_failed', msg});
        });
      }
    });
  }
  getReport() {
    const CancelToken = axios.CancelToken;
    this.Axios.axios.get(`/task/progress/?task_type=7&task_id=${encodeURIComponent(this.reportId)}`, {
      cancelToken: new CancelToken( c1 => (this.cancels.push(c1)))
    })
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          if (resp.data.scanstatus === 1) {
            const msg = this.curLanguage === 'zh-cn' ? resp.infochinese : resp.info;
            this.createSucc.emit({ id: this.reportId, type: 'PackagePorting', state: 'failed', msg });
            this.msgService.sendMessage({ type: 'creatingPackPortingProgress', data: true });
            return;
          } else {
            const report_id = resp.data.report_id;
            this.progess = resp.data.progress;
            this.formatReport = this.formatCreatedId(this.reportId);
            this.progessValue = this.progess + '%';
            this.barWidth = Math.floor(this.progess / this.totalProgress * this.totalBar);
            if (this.progess < 100) {
              if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
              }
              this.msgService.sendMessage({
                type: 'creatingPackPortingProgress',
                data: true
              });
              this.timer = setTimeout(() => { this.getReport(); }, 1000);
            } else {
              clearTimeout(this.timer);
              this.timer = null;
              const flag = report_id !== '';
              let msg = this.i18n.common_term_workload_success_tip;
              if (!flag) {
                msg = this.curLanguage === 'zh-cn' ? resp.infochinese : resp.info;
              }
              setTimeout(() => {
                this.createSucc.emit({ id: this.reportId, type: 'PackagePorting', state: 'success', msg, flag});
                this.msgService.sendMessage({ type: 'creatingPackPortingProgress', data: false });
              }, 3000);
            }
          }
        } else {
          const msg = this.curLanguage === 'zh-cn' ? resp.infochinese : resp.info;
          this.createSucc.emit({ id: this.reportId, type: 'PackagePorting', state: 'failed', msg });
          this.msgService.sendMessage({ type: 'creatingPackPortingProgress', data: true });
        }
      })
      .catch((err: any) => {
        this.createSucc.emit({ id: this.reportId, type: 'PackagePorting', state: 'failed', msg: ''});
        this.msgService.sendMessage({ type: 'creatingPackPortingProgress', data: false });
      });
    this.Axios.axios.defaults.headers.notit = false;
  }

  public closeTask() {
    const resultMsg = {
      id: this.reportId,
      type: 'stopConfirm',
      subType: 'PackagePorting',
      state: 'prompt',
    };
    this.msgService.sendMessage({
      type: 'creatingResultMsg',
      data: resultMsg
    });
  }

  ngOnDestroy(): void {
    if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
  }


  formatCreatedId(data: any) {
    const years = data.slice(0, 4);
    const months = data.slice(4, 6);
    const days = data.slice(6, 8);
    const hours = data.slice(8, 10);
    const minutes = data.slice(10, 12);
    const seconds = data.slice(12, 14);
    return `${years}/${months}/${days} ${hours}:${minutes}:${seconds}`;
  }
}

