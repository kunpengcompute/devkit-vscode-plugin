import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ElementRef } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs';
import {
  PortWorkerStatusService, AxiosService, I18nService,
  MessageService, CommonService
} from '../../../../service';

@Component({
  selector: 'app-weak-compiler-progress',
  templateUrl: './weak-compiler-progress.component.html',
  styleUrls: ['./weak-compiler-progress.component.scss']
})
export class WeakCompilerProgressComponent implements OnInit, OnDestroy {

  constructor(
    private i18nService: I18nService,
    private Axios: AxiosService,
    private msgService: MessageService,
    private elementRef: ElementRef,
    private commonService: CommonService,
    public portWorkerStatusService: PortWorkerStatusService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  @Input() reportId: any;
  @Output() createSucc = new EventEmitter();

  public i18n: any;
  private cancels: any = [];
  private timer: any = null;
  private closeTaskSub: Subscription;
  public isSuccess = false; // 是否显示创建成功弹框

  public moveTimer: any = null;
  public totalBar = 440; // 进度条总宽
  public moveBar = 60; // 动画宽度
  public progressStatus: string;  // 分析进度状态码
  public isAnimation: boolean;  // 是否有进度条动画

  ngOnInit() {
    this.isAnimation = false;
    this.getReport();
    // 监听点击关闭任务
    this.closeTaskSub = this.msgService.getMessage().subscribe((message) => {
        if (message.type === 'closeTaskMsg' && message.data.result.subType === 'weakCompiler') {
            this.Axios.axios
              .delete(`/portadv/weakconsistency/tasks/${encodeURIComponent(this.reportId)}/stop/?task_type=9`)
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
                      this.createSucc.emit({id: this.reportId, type: 'weakCompiler', state: 'stop_success', msg});
                      return;
                  }
                  this.createSucc.emit({
                    id: this.reportId,
                    type: 'weakCompiler',
                    state: 'stop_failed',
                    msg,
                    status: resp.status });
          });
        }
    });
  }

  getReport() {
    this.Axios.axios.defaults.headers.notit = true;
    const CancelToken = axios.CancelToken;
    this.Axios.axios.get(`/task/progress/?task_type=9&task_id=${encodeURIComponent(this.reportId)}`, {
      cancelToken: new CancelToken( c1 => (this.cancels.push(c1)))
    })
      .then((resp: any) => {
        this.progressStatus = resp.status;
        if (this.commonService.handleStatus(resp) === 0) {
          if (resp.data.runningstatus === 2 && !this.isAnimation) {
            // 任务运行中
            setTimeout(() => {
                const el = this.elementRef.nativeElement.querySelector('.progress-bar');
                this.moveAnimation(el);
            }, 100);
            this.isAnimation = true;
          }
          if (resp.data.runningstatus === 2 || resp.data.runningstatus === 255) {
            if (this.timer) {
              clearTimeout(this.timer);
              this.timer = null;
            }
            this.msgService.sendMessage({
              type: 'creatingWeakCompilerProgress',
              data: true
            });
            this.timer = setTimeout(() => { this.getReport(); }, 1000);
          } else if (resp.data.runningstatus === 0) { // 成功
            this.moveTimer = null;
            clearInterval(this.moveTimer);
            clearTimeout(this.timer);
            this.timer = null;
            this.moveTimer = null;
            this.isSuccess = true;
            const msg =  sessionStorage.getItem('language') === 'zh-cn' ? resp.data.infochinese : resp.data.info;
            setTimeout(() => {
              this.createSucc.emit({
                id: this.reportId,
                type: 'weakCompiler',
                state: 'success',
                msg,
                flag: false,
                result: resp.data.result,
                status: resp.status
              });
              this.msgService.sendMessage({ type: 'creatingWeakCompilerProgress', data: false });
            }, 3000);
          } else { // 失败
            const msg =  sessionStorage.getItem('language') === 'zh-cn' ? resp.data.infochinese : resp.data.info;
            this.createSucc.emit({ id: this.reportId, type: 'weakCompiler', state: 'failed', msg, status: resp.status});
            this.msgService.sendMessage({ type: 'creatingWeakCompilerProgress', data: false, state: 'failed'});
          }
        } else {
          clearInterval(this.moveTimer);
          this.moveTimer = null;
          const msg = sessionStorage.getItem('language') === 'zh-cn' ? resp.infochinese : resp.info;
          this.createSucc.emit({ id: this.reportId, type: 'weakCompiler', state: 'failed', msg, status: resp.status });
          this.msgService.sendMessage({ type: 'creatingWeakCompilerProgress', data: false, state: 'failed'});
        }
      }).catch((err: any) => {
        this.createSucc.emit({ id: this.reportId, type: 'weakCompiler', state: 'failed', msg: ''});
        this.msgService.sendMessage({ type: 'creatingWeakCompilerProgress', data: false });
      });
    this.Axios.axios.defaults.headers.notit = false;
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
      } else if (left >= Number((100 * (1 - this.moveBar / this.totalBar)).toFixed(0))) {
        left = Number((100 * (1 - this.moveBar / this.totalBar)).toFixed(0));
        bool = false;
      }
      el.style.left = left + '%';
    }, 100);
  }

  // 关闭任务
  public closeTask() {
    const resultMsg = {
      id: this.reportId,
      type: 'stopConfirm',
      subType: 'weakCompiler',
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
}
