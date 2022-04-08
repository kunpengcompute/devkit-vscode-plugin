// 资源调度分析_总览
import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-res-summary',
  templateUrl: './res-summary.component.html',
  styleUrls: ['./res-summary.component.scss'],
})
export class ResSummaryComponent implements OnInit {
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;

  public i18n: any;
  public suggestMsg: any = [];
  public language = 'zh';

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    if (sessionStorage.getItem('language') === 'en-us') {
      this.language = 'en';
    } else {
      this.language = 'zh';
    }
  }

  public suggListArr(suggList: any){
    this.suggestMsg = [];
    if (suggList[0].title_chs){
      this.suggestMsg.push({
        title: this.language === 'zh' ? suggList[0].title_chs : suggList[0].title_en,
        msgbody: this.language === 'zh' ? suggList[0].suggest_chs : suggList[0].suggest_en
      });
    }
  }
}
