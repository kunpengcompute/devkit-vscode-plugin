import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import { Component, OnInit } from '@angular/core';
import { notificationType } from '../notification-box/notification-box.component';

@Component({
  selector: 'app-notification-with-action',
  templateUrl: './notification-with-action.component.html',
  styleUrls: ['./notification-with-action.component.scss']
})
export class NotificationWithActionComponent implements OnInit {
  public currLang = '';
  public isShow = false;
  public type = notificationType.info;

  constructor() { }

  ngOnInit(): void {
    this.currLang = ((self as any).webviewSession || {}).getItem('language');
  }

  public show() {
    this.isShow = true;
  }

  // 右上角关闭icon点击关闭
  public close() {
    console.log("closing notification with action");
    this.isShow = false;
  }

  public setType(type: notificationType) {
    this.type = type;
  }
}
