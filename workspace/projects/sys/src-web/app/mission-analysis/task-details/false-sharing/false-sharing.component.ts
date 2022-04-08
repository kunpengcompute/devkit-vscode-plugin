// 伪共享分析 详情
import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { StorageService } from 'projects/sys/src-web/app/service/storage.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';


@Component({
  selector: 'app-false-sharing',
  templateUrl: './false-sharing.component.html',
  styleUrls: ['./false-sharing.component.scss']
})
export class FalseSharingComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() taskid: any;
  @Input() nodeid: any;

  public analysisType = 'falsesharing';

  i18n: any;
  public detailList: Array<any> = [];
  public formEl: any;

  constructor(
    public mytip: MytipService,
    private Axios: AxiosService,
    private msgService: MessageService,
    public i18nService: I18nService,
    private sessionStorage: StorageService,
    public leftShowService: LeftShowService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.detailList = [
      {  // 总览
        title: this.i18n.common_term_task_tab_summary,
        prop: 'summary',
        disable: !['Completed', 'Aborted'].includes(this.status),
      }, { // 配置信息
        title: this.i18n.common_term_task_tab_congration,
        prop: 'configuration',
        disable: false,
      }, {  // 采集日志
        title: this.i18n.common_term_task_tab_log,
        prop: 'log',
        disable: false,
      }
    ];

    if (['Completed', 'Aborted'].includes(this.status)) {
      this.switchDefaultActive('summary');
    } else {
      this.switchDefaultActive('configuration');
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
    }
  }

  // 切换默认选中
  public switchDefaultActive(activeProp: any) {
    this.detailList.forEach(item => {
      item.active = item.prop === activeProp;
    });
  }

  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
