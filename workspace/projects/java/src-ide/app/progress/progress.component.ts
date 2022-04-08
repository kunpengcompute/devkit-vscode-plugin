import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AxiosService } from '../service/axios.service';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  @Input() recordData: any;
  @Input() guardian: any;
  @Input() jvm: any;
  @Input() selRecording: any;
  @Output() createSucc = new EventEmitter();

  public closeModalTip: string;
  public currentLang: string;
  public recordAutoTime = 0;
  public timeRequired = '00:00:00';
  public timeCount = 0;
  public startTime = '00:00:00';
  public isCreatingModal = true; // 显示进度弹框
  public isSuccess = false; // 是否显示创建成功弹框
  public barWidth = 0;
  public totalBar = 460; // 进度条总宽
  public progess = 0; // 目前数据大小
  public totalProgress = 0; // 总的数据大小
  public progessValue: string; // 显示的进度值
  public i18n: any;
  private timer: any = null;
  public barWidth60 = 60;
  private timer60: any = null;
  private timerGuardian: any = null;
  private autoGuardianTimer: any = null;
    constructor(private Axios: AxiosService,
                public i18nService: I18nService,
                private vscodeService: VscodeService,
    ) {
    this.i18n = this.i18nService.I18n();
  }
  /**
   * ngOnInit
   */
  ngOnInit() {
    this.closeModalTip = this.i18n.progress_close_btn_tip;
    this.currentLang = (self as any).webviewSession.getItem('language');
    this.recordAutoTime = this.recordData.duration;
    this.totalProgress = this.recordAutoTime / 1000;
    if (Object.keys(this.selRecording).length) {
      this.recordAutoTime = this.selRecording.totalTime;
      this.timeCount = this.selRecording.recordTime;
      if (this.recordAutoTime === -1) {
        this.startTime =
          this.timeCount - 300000 <= 0
            ? '00:00:00'
            : this.timeFormat(this.timeCount - 300000);
      }
      this.totalProgress = this.recordAutoTime / 1000;
      this.progess = this.timeCount / 1000;
    }
    this.getReport();
    this.timerGuardian = setInterval(() => {
      this.queryGuardins();
    }, 1000);
  }
  /**
   * getReport
   */
  getReport() {
    if (this.recordAutoTime === -1) {
      let dir = 1;
      this.timer60 = setInterval(() => {
        this.timeCount += 200;
        this.startTime =
          this.timeCount < 300000
            ? '00:00:00'
            : this.timeFormat(this.timeCount - 300000);
        this.timeRequired = this.timeFormat(this.timeCount);
        this.barWidth60 += 10 * dir;
        if (this.barWidth60 >= this.totalBar) { dir = -1; }
        if (this.barWidth60 <= 60) { dir = 1; }
      }, 200);
      this.autoGuardianTimer = setInterval(() => {
        this.Axios.axios.get(`/records`).then((resp: any) => {
          if (resp.members.length) {
            const idx = resp.members.findIndex((mem: any) => {
              return mem.id === this.recordData.id;
            });
            if (resp.members[idx].state !== 'FINISHED') {
              if (resp.members[idx].state === 'FAILED') {
                this.timer_stop();
                this.createSucc.emit('cancel');
              }
            }
          }
        });
      }, 2000);
    }
    if (this.recordAutoTime !== -1) {
      this.timer = setTimeout(() => {
        this.progess += 1;
        if (this.progess > this.totalProgress) {
          if (this.timer) { clearInterval(this.timer); }
          this.timer = null;
          this.isCreatingModal = false;
          setTimeout(() => {
            this.timer_stop();
            this.createSucc.emit(true);
          }, 1000);
          return;
        }
        this.timeCount += 1000;
        this.timeRequired = this.timeFormat(this.timeCount);
        this.progessValue =
          ((this.progess * 100) / this.totalProgress).toFixed(2) + '%';
        this.barWidth = Math.floor(
          (this.progess / this.totalProgress) * this.totalBar
        );
        if (this.totalProgress - this.progess === 1) {
          this.queryRecords();
        } else {
          this.timer = setTimeout(() => {
            this.getReport();
          }, 500);
        }
      }, 500);
    }
  }
  /**
   * queryRecords
   */
  queryRecords() {
    this.Axios.axios.get(`/records`).then((resp: any) => {
      if (resp.members.length) {
        const idx = resp.members.findIndex((mem: any) => {
          return mem.id === this.recordData.id;
        });
        if (resp.members[idx].state !== 'FINISHED') {
          if (resp.members[idx].state === 'FAILED') {
            setTimeout(() => {
              this.timer_stop();
              this.createSucc.emit('cancel');
            }, 1000);
            return;
          }
          this.timer = setTimeout(() => {
            this.queryRecords();
          }, 100);
          return;
        }
        this.timer = setTimeout(() => {
          this.getReport();
        }, 500);
      }
    });
  }

  /**
   * queryGuardins
   */
  queryGuardins() {
    this.Axios.axios.get('/guardians').then((resp: any) => {
      if (resp.members.length) {
        const currentGuardian = resp.members.find((mem: any) => {
          return mem.id === this.guardian.id;
        });
        if (!currentGuardian || !currentGuardian.id) {
          this.stop_analysis();
          this.timer_stop();
          return;
        }
        if (currentGuardian && currentGuardian.state === 'DISCONNECTED') {
          this.timer_stop();
          this.createSucc.emit('cancel');
          return;
        }
        if (currentGuardian && currentGuardian.jvms && currentGuardian.jvms.length) {
          const currentJvmIdx = currentGuardian.jvms.findIndex((jvm: any) => {
            return jvm.id === this.jvm.id;
          });
          if (currentJvmIdx === -1) {
            this.stop_analysis();
            this.timer_stop();
            return;
          }
        }
        return;
      }
      this.stop_analysis();
      this.timer_stop();
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

  /**
   * timer_stop
   */
  timer_stop() {
    clearTimeout(this.timer);
    clearInterval(this.timer60);
    clearInterval(this.timerGuardian);
    clearInterval(this.autoGuardianTimer);
    this.timer = null;
    this.timer60 = null;
    this.timerGuardian = null;
    this.autoGuardianTimer = null;
    this.isCreatingModal = false;
  }

  /**
   * stop_analysis
   */
  stop_analysis() {
    this.timer_stop();
    const params = {
      recordId: this.recordData.id
    };
    this.Axios.axios
      .post(`/guardians/${this.guardian.id}/cmds/stop-record`, params)
      .then(
        () => {
          this.timer_stop();
          this.createSucc.emit('stop');
        },
        (error: any) => {
          this.timer_stop();
          if (error.response.data.code.indexOf('ResourceGuardianIdNotFound') >= 0) {
            this.showInfoBox(this.i18nService.I18nReplace(this.i18n.guardian_not_fount,
               { 0: this.guardian.name }), 'warn');
          }

          this.createSucc.emit('cancel');
        }
      );
  }
  /**
   * cancel_analysis
   */
  cancel_analysis() {
    this.timer_stop();
    const params = {
      recordId: this.recordData.id
    };
    this.Axios.axios
      .post(`/guardians/${this.guardian.id}/cmds/cancel-record`, params)
      .then(
        () => {
          this.timer_stop();
          this.createSucc.emit('cancel');
        },
        (error: any) => {
          this.timer_stop();
          if (error.response.data.code.indexOf('ResourceGuardianIdNotFound') >= 0) {
              this.showInfoBox(this.i18nService.I18nReplace(this.i18n.guardian_not_fount,
                 { 0: this.guardian.name }), 'warn');
          }

          this.createSucc.emit('cancel');
        }
      );
  }
  /**
   * closeModal
   */
  closeModal() {
    this.timer_stop();
    this.createSucc.emit({
      record: this.recordData,
      optype: 'min',
      time: this.timeCount
    });
  }

  /**
   * timeFormat
   * @param ms ms
   */
  timeFormat(ms: any) {
    const s = ms / 1000;
    let hour: any = Math.floor(s / 3600);
    if (hour < 10) {
      hour = '0' + hour;
    }
    let minutes: any = Math.floor(s / 60);
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    let seconds: any = Math.floor(s % 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return `${hour}:${minutes}:${seconds}`;
  }
}
