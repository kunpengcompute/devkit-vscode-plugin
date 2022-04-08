import { Component, OnInit, ViewChild, OnChanges, SimpleChanges, Input, OnDestroy } from '@angular/core';
import { CustomValidatorsService } from 'projects/sys/src-web/app/service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';

@Component({
  selector: 'app-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrls: ['./tab-detail.component.scss']
})
export class TabDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() functionType: any;
  @Input() id: any;
  @Input() nodeid: any;
  @ViewChild('functionTab') functionTab: any;

  public analysisType = AnalysisType.CCppProgram;
  public selectDetail = {
    module: '',
    functionName: ''
  };
  public subscription: any;
  public hotFlameName: any;
  i18n: any;
  constructor(
    private custom: CustomValidatorsService,
    private msgService: MessageService,
    public i18nService: I18nService,
    public leftShowService: LeftShowService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public detailList: Array<any> = [];
  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
  }

  ngOnInit() {
    this.detailList = [
      {
        title: this.i18n.common_term_task_tab_summary,
        disable: true,
        active: false
      },
      {
        title: this.i18n.common_term_task_tab_function,
        disable: true,
        active: false
      },
      {
        title: this.i18n.common_term_task_tab_graph_hot,
        disable: true,
        active: false
      },
      {
        title: this.i18n.common_term_task_tab_congration,
        prop: 'configuration',
        active: false,
        disable: false,
      },
      {
        title: this.i18n.common_term_task_tab_log,
        active: false,
        disable: false,
      }
    ];

    this.hotFlameName = this.i18n.common_term_task_tab_graph_hot;
    this.detailList[2].title = this.i18n.common_term_task_tab_graph_hot;
    this.detailList.splice(this.detailList.findIndex(item => item.prop === 'configuration'), 0, {
      title: this.i18n.common_term_task_tab_graph_cold,
      disable: true,
      active: false
    });
    if (this.status === 'Completed' || this.status === 'Aborted') {
      this.detailList[0].disable = false;
      this.detailList[1].disable = false;
      this.detailList[2].disable = false;
      this.detailList[3].disable = false;
      this.detailList[0].active = true;
      this.detailList[0].disable = false;
    } else {
      this.detailList[4].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      this.detailList[2].disable = true;
      this.detailList[3].disable = true;
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
    }

    // 火焰图跳转函数详情
    this.subscription = this.msgService.getMessage().subscribe((msg) => {
      if (msg.taskName !== this.taskName) { return; }
      if (msg.function === 'openFunction') {
        try {
          this.selectDetail.module = msg.detail.module;
          this.selectDetail.functionName = msg.detail.functionName;
          this.detailList[2].active = false;
          this.detailList[1].disable = true;
          setTimeout(() => {
            this.detailList[1].disable = false;
            this.detailList[1].active = true;
          }, 300);
        } catch (error) {
        }
      }


    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  public change() {
    this.leftShowService.leftIfShow.next();
  }

}
