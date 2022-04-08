import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { UserGuideService } from 'projects/java/src-web/app/service/user-guide.service';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss'],
})
export class AlertMessageComponent implements OnInit {
  i18n: any;
  @Output() confirmHandle = new EventEmitter();
  @Input() toChildPassword: string;
  @Input() deletePwd: string;
  @Input() confirmBtn: boolean;
  constructor(
    public i18nService: I18nService,
    public userGuide: UserGuideService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public showAlert = false;
  public type = 'success';
  public srcType = '';
  public width = '500px';
  public title = '';
  public content = '';
  public deleteStatu = false;
  public ValidResult = true;
  public alertTitle: any = '';
  public haveContent: any = true;
  public hoverClose: any;
  public isContinue = false;
  public userGuid: any;
  public addModelEyes: any = true;
  ngOnInit() {
    this.userGuid = sessionStorage.getItem('userGuidStatus-java-perf') === '0';
  }
  private getIcon() {
    switch (this.type) {
      case 'prompt':
        this.srcType = './assets/img/newSvg/tip.svg';
        break;
      case 'success':
        this.srcType = './assets/img/newSvg/ok.svg';
        break;
      case 'warn':
        this.srcType = './assets/img/newSvg/warn.svg';
        break;
      case 'none':
        this.srcType = '';
        break;
    }
  }

  alert_show() {
    this.getIcon();
    this.showAlert = true;
    this.addModelEyes = true;
    // user-guide
    sessionStorage.setItem('javaStep', '2');
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0' && sessionStorage.getItem('javaStep') === '2') {
      this.userGuide.hideMask();
      setTimeout(() => {
        $('.progress-modal').css({
          left: '34%',
          top: '28%',
          transform: 'none'
        });
        sessionStorage.setItem('javaStep', '3');
        this.userGuide.showMask('user-guide-add-guardian');
      }, 300);
    }
    this.getIcon();
  }

  alert_close() {
    if (!this.userGuid) {
      this.confirmHandle.emit(false); // 取消时直接关闭
      this.showAlert = false;
      this.hoverClose = '';
    }
    this.addModelEyes = false;
  }

  alert_ok() {
    this.addModelEyes = false;
    // user-guide
    if (!this.isContinue && sessionStorage.getItem('userGuidStatus-java-perf') === '0' &&
      sessionStorage.getItem('javaStep') === '3') {
      sessionStorage.setItem('javaStep', '4');
      this.userGuide.hideMask();
    }
    this.confirmHandle.emit(true); // 确定时处理后续逻辑
    this.showAlert = !this.ValidResult;
  }
  public onHoverClose(msg?: any) {
    this.hoverClose = msg;
  }
}
