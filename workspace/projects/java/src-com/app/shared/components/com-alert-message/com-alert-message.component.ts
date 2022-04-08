import {
  AfterViewInit, Component, EventEmitter,
  Input, OnInit, Output
} from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
import { LibService } from 'java/src-com/app/service/lib.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-com-alert-message',
  templateUrl: './com-alert-message.component.html',
  styleUrls: ['./com-alert-message.component.scss'],
})
export class ComAlertMessageComponent implements OnInit, AfterViewInit {
  i18n: any;
  @Output() confirmHandle = new EventEmitter();
  @Input() toChildPassword: string;
  @Input() deletePwd: string;
  @Input() confirmBtn: boolean;
  @Input() messageWidth: string;
  constructor(
    public i18nService: CommonI18nService,
    public libService: LibService,
    public sanitizer: DomSanitizer
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
  ngAfterViewInit(): void {
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
  }

  alert_close() {
    if (!this.userGuid) {
      // 取消时直接关闭
      this.confirmHandle.emit(false);
      this.showAlert = false;
      this.libService.onHoverIcon();
    }
    this.addModelEyes = false;
  }

  alert_ok() {
    this.addModelEyes = false;
    // 确定时处理后续逻辑
    this.confirmHandle.emit(true);
    this.showAlert = !this.ValidResult;
  }
  public onHoverClose(msg?: any) {
    if (msg) {
      this.libService.onHoverIcon('close-hover-dark');
    } else {
      this.libService.onHoverIcon();
    }
  }
  public getImgSrc(state: string) {
    if (this.libService.hoverIcon === state) {
      if (state === 'close-hover-dark') {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/img/newSvg/close_hover.svg`);
      } else if (state === 'close-hover-dark') {
        return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/newSvg/close_hover.svg');
      } else if (state === 'close-hover-dark') {
        return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/newSvg/close_hover.svg');
      } else {
        return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/newSvg/close_hover.svg');
      }
    } else {
      if (state === 'close-hover-dark') {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/img/newSvg/close_icon.svg`);
      } else if (state === 'close-hover-dark') {
        return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/newSvg/close_icon.svg');
      } else if (state === 'close-hover-dark') {
        return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/newSvg/close_icon.svg');
      } else {
        return this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/newSvg/close_icon.svg');
      }
    }
  }
}
