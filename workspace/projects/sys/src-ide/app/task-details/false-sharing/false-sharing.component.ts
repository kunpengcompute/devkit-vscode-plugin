// 伪共享分析 详情
import { Component, OnInit, Input, NgZone, ChangeDetectorRef } from '@angular/core';
import { MessageService } from '../../service/message.service';
import { I18nService } from '../../service/i18n.service';
import { Axios2vscodeServiceService } from '../../service/axios2vscode-service.service';
import { MytipService } from '../../service/mytip.service';
import { StorageService } from 'projects/sys/src-ide/app/service/storage.service';
import { LeftShowService } from './../../service/left-show.service';


@Component({
  selector: 'app-false-sharing',
  templateUrl: './false-sharing.component.html',
  styleUrls: ['./false-sharing.component.scss']
})
export class FalseSharingComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any = 'miss_event';
  @Input() status: any;
  @Input() taskid: any;
  @Input() nodeid: any;

  i18n: any;
  public detailList: Array<any> = [];
  public formEl: any;

  constructor(
    public mytip: MytipService,
    private Axios: Axios2vscodeServiceService,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private msgService: MessageService,
    public i18nService: I18nService,
    private sessionStorage: StorageService,
    public leftShowService: LeftShowService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  /**
   * 组件初始化
   */
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
        disable: !['Completed', 'Failed', 'Aborted'].includes(this.status),
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
    this.updateWebViewPage();
  }

  // 切换默认选中
  private switchDefaultActive(activeProp) {
    this.detailList.forEach(item => {
      item.active = item.prop === activeProp;
    });
  }

  /**
   * change
   */
  public change() {
    this.leftShowService.leftIfShow.next();
  }
  /**
   * IntellIj刷新webview页面
   */
  public updateWebViewPage() {
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      this.zone.run(() => {
        this.changeDetectorRef.checkNoChanges();
        this.changeDetectorRef.detectChanges();
      });
    }
  }
}
