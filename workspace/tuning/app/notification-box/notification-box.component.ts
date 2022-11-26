import { Component, OnInit } from '@angular/core';

export enum notificationType {
  success = "success",
  error = "error",
  info = "info",
  warn = "warn",
}

@Component({
  selector: 'app-notification-box',
  templateUrl: './notification-box.component.html',
  styleUrls: ['./notification-box.component.scss']
})
export class NotificationBoxComponent implements OnInit {
  public currLang = '';
  // 是否显示notification
  public isShow = false;
  // 提示类型
  public type = notificationType.success;

  constructor() { 
  }

  ngOnInit(): void {
    this.currLang = ((self as any).webviewSession || {}).getItem('language');
  }

  public show() {
    this.isShow = true;
    $('.notification-box').css('display', 'flex');
    setTimeout(this.close, 6000);
  }

  public close() {
    console.log("closing notification");
    this.isShow = false;
    $('.notification-box').css('display', 'none');
  }

  public setType(type: notificationType) {
    this.type = type;
  }

}
