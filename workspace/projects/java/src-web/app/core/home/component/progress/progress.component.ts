import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { LibService } from 'projects/java/src-web/app/service/lib.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  @Input() recordData: any;
  @Input() guardian: any;
  @Input() jvm: any;
  @Input() selRecording: any; // 手动停止 或  自动记录
  @Output() createSucc = new EventEmitter();

  public closeModalTip: string;
  public currentLang: string;
  public recordAutoTime = 0;
  public timeRequired = '00:00:00';
  public timeCount = 0;
  public startTime = '00:00:00';
  public isCreatingModal = true; // 显示进度弹框
  public isSuccess = false; // 是否显示创建成功弹框
  public barWidth1: any = 0;
  public TimeDiff: any = 0;
  public totalBar = 420; // 进度条总宽
  public progess = 0; // 目前数据大小
  public totalProgress = 0; // 总的数据大小
  public progessValue: string; // 显示的进度值
  public i18n: any;
  private timer: any = null;
  public barWidth60 = 60;
  private timer60: any = null;
  private timerGuardian: any = null;
  public hoverClose: any;
  public currendName: any;
  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    private myTip: MytipService,
    public libService: LibService) {
    this.i18n = this.i18nService.I18n();
  }
  ngOnInit() {
    this.closeModalTip = this.i18n.progress_close_btn_tip;
    this.currentLang = sessionStorage.getItem('language');
    this.currendName = sessionStorage.getItem('record_name');
    this.recordAutoTime = this.recordData.duration;
    this.totalProgress = this.recordAutoTime / 1000;
    this.getReport();
  }

  getReport() {
    // 手动停止
    if (this.recordAutoTime === -1) {
      let dir = 1;
      this.timer60 = setInterval(() => {
        const nowTime: any = +new Date() / 1000;
        this.TimeDiff = Math.trunc(nowTime) - Math.trunc(this.recordData.createTime);
        this.startTime =
          this.TimeDiff * 1000 < 300000
            ? '00:00:00'
            : this.timeFormat(this.TimeDiff * 1000 - 300000);
        this.timeRequired = this.timeFormat(this.TimeDiff * 1000);
        this.barWidth60 += 10 * dir;
        if (this.barWidth60 >= this.totalBar) { dir = -1; }
        if (this.barWidth60 <= 60) { dir = 1; }
      }, 500);
    }

    // 自动记录时长
    if (this.recordAutoTime !== -1) {
      this.getTime();
      this.timer = setTimeout(() => {
        if (this.TimeDiff > this.totalProgress) {
          if (this.timer) { clearInterval(this.timer); }
          this.timer = null;
          this.isCreatingModal = false;
          setTimeout(() => {
            this.timer_stop();
            this.createSucc.emit(true);
          }, 1000);
          return;
        }
        if (this.totalProgress - this.TimeDiff === 0) {
          this.queryRecords();
        } else {
          this.timer = setTimeout(() => {
            this.getReport();
          }, 500);
        }
      }, 500);
    }
  }
  public getTime() {
    const nowTime: any = +new Date() / 1000;
    this.TimeDiff = Math.trunc(nowTime) - Math.trunc(this.recordData.createTime);
    if (this.TimeDiff <= this.totalProgress) {
      this.barWidth1 = `${(this.TimeDiff / this.totalProgress * 100).toFixed(2)}%`;
      this.timeRequired = this.timeFormat(this.TimeDiff * 1000);
    }
  }
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

  timer_stop() {
    clearTimeout(this.timer);
    clearInterval(this.timer60);
    clearInterval(this.timerGuardian);
    this.timer = null;
    this.timer60 = null;
    this.timerGuardian = null;
    this.isCreatingModal = false;
  }

  stop_analysis() {
    this.timer_stop();
    const params = {
      recordId: this.recordData.id
    };
    this.Axios.axios
      .post(`/guardians/${encodeURIComponent(this.guardian.id)}/cmds/stop-record`, params)
      .then(
        (resp: any) => {
          this.timer_stop();
          this.createSucc.emit('stop');
        },
        (error: any) => {
          this.timer_stop();
          if (error.response.data.code.indexOf('ResourceGuardianIdNotFound') >= 0) {
            this.myTip.alertInfo({
              type: 'warn',
              content: this.i18nService.I18nReplace(this.i18n.guardian_not_fount, { 0: this.guardian.name }),
              time: 10000
            });
          }

          this.createSucc.emit('cancel');
        }
      );
  }
  cancel_analysis() {
    this.timer_stop();
    const params = {
      recordId: this.recordData.id
    };
    this.Axios.axios
      .post(`/guardians/${encodeURIComponent(this.guardian.id)}/cmds/cancel-record`, params)
      .then(
        (resp: any) => {
          this.timer_stop();
          this.createSucc.emit('cancel');
        },
        (error: any) => {
          this.timer_stop();
          if (error.response.data.code.indexOf('ResourceGuardianIdNotFound') >= 0) {
            this.myTip.alertInfo({
              type: 'warn',
              content: this.i18nService.I18nReplace(this.i18n.guardian_not_fount, { 0: this.guardian.name }),
              time: 10000
            });
          }

          this.createSucc.emit('cancel');
        }
      );
  }
  closeModal() {
    this.timer_stop();
    this.hoverClose = '';
    this.createSucc.emit({
      record: this.recordData,
      optype: 'min',
      time: this.timeCount
    });
  }

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
  onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
}
