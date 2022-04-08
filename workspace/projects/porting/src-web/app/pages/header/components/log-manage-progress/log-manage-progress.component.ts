import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ElementRef  } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs';
import { CommonService, AxiosService, I18nService, MessageService } from '../../../../service';

@Component({
  selector: 'app-log-manage-progress',
  templateUrl: './log-manage-progress.component.html',
  styleUrls: ['./log-manage-progress.component.scss']
})
export class LogManageProgressComponent implements OnInit, OnDestroy {

  constructor(
    private i18nService: I18nService,
    private Axios: AxiosService,
    private msgService: MessageService,
    private elementRef: ElementRef,
    private commonService: CommonService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  @Input() reportId: any;
  @Output() createSucc = new EventEmitter();

  private cancels: any = [];
  private timer: any = null;
  private closeTaskSub: Subscription;
  public isSuccess = false; // 是否显示创建成功弹框

  public moveTimer: any = null;
  public barWidth = 0;
  public totalBar = 440; // 进度条总宽
  public progess = 0; // 目前数据大小
  public totalProgress = 100;  // 总的数据大小
  public progessValue: string;  // 显示的进度值
  public i18n: any;
  public logPath: any;

  ngOnInit() {
    const el = this.elementRef.nativeElement.querySelector('.progress-bar');
    this.moveAnimation(el);
    this.downloadRunLog();

    // 中止日志压缩并关闭弹框事件
    this.closeTaskSub = this.msgService.getMessage().subscribe(message => {
      if (message.type === 'closeTaskMsg' && message.data.result.subType === 'LogManage') {
        this.Axios.axios.delete(`/portadv/runlog/zip_log/?task_id=${encodeURIComponent(this.reportId)}`)
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
            this.createSucc.emit({id: this.reportId, type: 'LogManage', state: 'stop_success', msg});
            return;
          }
          this.createSucc.emit({ id: this.reportId, type: 'LogManage', state: 'stop_failed', msg});
        });
      }
    });
  }

  public downloadRunLog() {
    this.Axios.axios.defaults.headers.notit = true;
    const CancelToken = axios.CancelToken;
    this.Axios.axios.get(`/portadv/runlog/zip_log/?task_id=${encodeURIComponent(this.reportId)}`, {
      cancelToken: new CancelToken( c1 => (this.cancels.push(c1)))
    }).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        if (resp.data.status === 2) { // 压缩中
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
          this.msgService.sendMessage({
            type: 'creatingLogManageProgress',
            data: true
          });
          this.timer = setTimeout(() => { this.downloadRunLog(); }, 1000);
        } else if (resp.data.status === 0) { // 成功
          this.moveTimer = null;
          clearInterval(this.moveTimer);
          clearTimeout(this.timer);
          this.timer = null;
          this.isSuccess = true;
          this.downLoadLogs();
          const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
          setTimeout(() => {
            this.createSucc.emit({ id: this.reportId, type: 'LogManage', state: 'success', msg, flag: false});
            this.msgService.sendMessage({ type: 'creatingLogManageProgress', data: false });
          }, 300);
        }
      } else {
        const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
        this.createSucc.emit({ id: this.reportId, type: 'LogManage', state: 'failed', msg });
        this.msgService.sendMessage({ type: 'creatingLogManageProgress', data: true });
      }
    });
  }

  // 下载日志
  downLoadLogs() {
    const form = document.createElement('form');
    form.action =  `${location.origin}/porting/api/portadv/download/`;
    form.method = 'post';
    const input0 = document.createElement('input');
    input0.type = 'hidden';
    input0.name = 'sub_path';
    input0.value = 'downloadlog';
    form.appendChild(input0);
    const input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'jwt';
    input1.value = sessionStorage.getItem('token').slice(3).trim();
    form.appendChild(input1);
    const input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'file_path';
    input2.value = 'log.zip';
    form.appendChild(input2);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  // 关闭任务
  public closeTask() {
    const resultMsg = {
      id: this.reportId,
      type: 'stopConfirm',
      subType: 'LogManage',
      state: 'prompt',
    };
    this.msgService.sendMessage({
      type: 'creatingResultMsg',
      data: resultMsg
    });
  }

   // 移动动画
   moveAnimation(el: any) {
    let left = 0;
    let bool = true;
    this.moveTimer = setInterval(() => {
      left = bool ? left + 5 : left - 5;
      if (left <= 0) {
        left = 0;
        bool = true;
      } else if (left >= Number((100 * (1 - 60 / 440)).toFixed(0))) {
        left = Number((100 * (1 - 60 / 440)).toFixed(0));
        bool = false;
      }
      el.style.left = left + '%';
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
  }
}
