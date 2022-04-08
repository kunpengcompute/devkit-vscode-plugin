import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit,
  ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
import { createSvg } from 'projects/java/src-com/app/utils';

@Component({
  selector: 'app-com-progress',
  templateUrl: './com-progress.component.html',
  styleUrls: ['./com-progress.component.scss']
})
export class ComProgressComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('cancalDump') cancalDump: any;
  @Input() recordData: any;
  @Input() selRecording: any; // 手动停止 或  自动记录
  @Output() createSucc = new EventEmitter();

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
  public generateID: any;
  public currTheme = 1;
  constructor(
    public i18nService: CommonI18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public startCreating = true;
  public stopAnalysisDisable = true;
  ngOnInit() {
    // vscode颜色主题
    if (document.body.className.indexOf('vscode-dark') !== -1) {
      this.currTheme = 1;
    } else {
      this.currTheme = 2;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.recordData) {
      if (changes.recordData.currentValue) {
        this.startCreating = this.recordData.startCreating;
        this.stopAnalysisDisable = true;
        if (!this.startCreating) {
          this.stopAnalysisDisable = false;
          this.recordAutoTime = this.recordData.duration;
          this.totalProgress = this.recordAutoTime / 1000;
          this.getReport();
        }
      }
    }
  }
  public start() {
    if (this.recordData.duration !== 0) {
      this.recordData.startCreating = false;
      this.stopAnalysisDisable = false;
      this.startCreating = this.recordData.startCreating;
      this.recordAutoTime = this.recordData.duration;
      this.totalProgress = this.recordAutoTime / 1000;
      this.getReport();
    }
  }
  ngAfterViewInit() {
    const path = this.currTheme === 1 ?
      './assets/img/collecting/dark/loading-dark.json' :
      './assets/img/collecting/light/loading-light.json';
    setTimeout(() => {
      createSvg('#' + this.generateID, path);
    }, 0);
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
        if (this.totalProgress - this.TimeDiff <= 0) {
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
    } else {
      this.isCreatingModal = false;
      this.queryRecords();
    }
  }
  queryRecords() {
    this.timer_stop();
    this.createSucc.emit(true);
  }


  timer_stop() {
    clearTimeout(this.timer);
    clearInterval(this.timer60);
    clearInterval(this.timerGuardian);
    this.timer = null;
    this.timer60 = null;
    this.timerGuardian = null;
    this.barWidth1 = '100.00%';
  }
  // 停止采集
  stop_analysis() {
    this.timer_stop();
    this.createSucc.emit({
      time: this.TimeDiff
    });
  }
  // 取消采集
  cancel_analysis() {
    this.cancalDump.type = 'warn';
    this.cancalDump.alert_show();
    this.cancalDump.alertTitle = this.i18n.protalserver_profiling_hot.cancalTitle;
    this.cancalDump.haveContent = false;
    this.cancalDump.content = this.i18n.protalserver_profiling_hot.cancalTip;
    this.cancalDump.deleteStatu = true;
  }

  confirmHandle_stop( e: any ){
    if (e) {
      this.timer_stop();
      this.createSucc.emit(false);
    }
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
}
