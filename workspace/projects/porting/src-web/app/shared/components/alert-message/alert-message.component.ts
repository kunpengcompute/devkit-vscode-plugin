import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss']
})
export class AlertMessageComponent implements OnInit {
  i18n: any;
  @Output() confirmHandle = new EventEmitter();
  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  public showAlert = false;
  public type = 'success';
  public srcType = '';
  public width = '500px';
  public title = '';
  public content = '';
  public showOkBtn = true;
  public showCancelBtn = true;

  ngOnInit() {
  }
  private getIcon() {
    switch (this.type) {
      case 'prompt':
        this.srcType = './assets/img/home/icon_error.png';
        break;
      case 'success':
        this.srcType = './assets/img/home/success.svg';
        break;
    }
  }

  alert_show() {
    this.showAlert = true;
    this.getIcon();
  }

  alert_close() {
    this.confirmHandle.emit(false); // 取消时直接关闭
    this.showAlert = false;
  }

  alert_ok() {
    this.confirmHandle.emit(true); // 确定时处理后续逻辑
    this.showAlert = false;
  }
}
