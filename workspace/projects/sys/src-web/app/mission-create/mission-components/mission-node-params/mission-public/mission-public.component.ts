import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { I18nService } from '../../../../service/i18n.service';

@Component({
  selector: 'app-mission-public',
  templateUrl: './mission-public.component.html',
  styleUrls: ['./mission-public.component.scss']
})
export class MissionPublicComponent implements OnInit {
  @Input() labelWidth: string;
  @Input() nodeName: any;
  @Input() nodaIP: any;
  @Input() drawerLevel: number; // 打开的drawer的层级，每层嵌套需要缩减32px，从0开始

  @ViewChild('missionModal') missionModal: any;

  public i18n: any;
  public explorer: string;

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
    this.explorer = this.getExplorer();
  }

  ngOnInit() { }

  // 打开
  public open() {
    this.missionModal.open();
  }

  // 父组件去关闭 drawer
  public close() {
    return new Promise((resolve, reject) => {
      this.missionModal.close().then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  public getExplorer(): any {
    const explorer = window.navigator.userAgent;
    const ie11 = 'ActiveXObject' in window;

    if (explorer.indexOf('MSIE') >= 0 || ie11) {
      return 'ie';
    } else if (explorer.indexOf('Firefox') && !ie11) {
      return 'Firefox';
    } else if (explorer.indexOf('Chrome') && !ie11) {
      return 'Chrome';
    } else if (explorer.indexOf('Opera') && !ie11) {
      return 'Opera';
    } else if (explorer.indexOf('Safari') && !ie11) {
      return 'Safari';
    }
  }
}
