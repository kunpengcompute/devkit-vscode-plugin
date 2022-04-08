import { Component, OnInit } from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
const hardUrl: any = require('projects/java/src-com/assets/hard-coding/url.json');

@Component({
  selector: 'app-advice-error-alert',
  templateUrl: './advice-error-alert.component.html',
  styleUrls: ['./advice-error-alert.component.scss']
})
export class AdviceErrorAlertComponent implements OnInit {

  public isAlertShow: any;

  constructor(
    public i18nService: CommonI18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public linkURL: any = '';
  public hoverAdvice: string;

  ngOnInit(): void {
    this.linkURL = hardUrl.hikunpengUrl;
  }

  // 关闭弹窗
  public closeWindow() {
    this.isAlertShow = false;
  }
  // 打开弹窗
  public openWindow() {
    this.isAlertShow = true;
  }
  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
  }

}
