// Miss事件 详情
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';


@Component({
  selector: 'app-miss-detail',
  templateUrl: './miss-detail.component.html',
  styleUrls: ['./miss-detail.component.scss']
})
export class MissDetailComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() taskid: any;
  @Input() nodeid: any;

  public analysisType = 'miss_event';

  @ViewChild('missStatistics') missStatistics: any;

  i18n: any;
  public detailList: Array<any> = [];
  public initializing = false;

  public formEl: any;
  public parentFormEl: any;
  public values: any;
  public collectionLog: any = {};

  constructor(
    public mytip: MytipService,
    private Axios: AxiosService,
    public i18nService: I18nService,
    public leftShowService: LeftShowService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.detailList = [
      { // Miss事件统计
        title: this.i18n.ddr.missEventStatistics,
        prop: 'missEventStatistics',
        disable: !['Completed', 'Aborted'].includes(this.status),
      },
      { // 配置信息
        title: this.i18n.common_term_task_tab_congration,
        prop: 'configuration',
        disable: false,
      }, {  // 任务日志
        title: this.i18n.common_term_task_tab_log,
        prop: 'log',
        active: false,
        disable: false,
      }
    ];

    if (['Completed', 'Aborted'].includes(this.status)) {
      this.switchDefaultActive('missEventStatistics');
    } else {
      this.switchDefaultActive('configuration');
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
    }

    this.getTaksLog();
  }

  // 切换默认选中
  public switchDefaultActive(activeProp: any) {
    this.detailList.forEach(item => {
      item.active = item.prop === activeProp;
    });
  }

  // 子组件返回配置信息【不动子组件的逻辑且不重复获取】
  public returnConfigInfo({ formEl, formElList, values }: any) {
    this.parentFormEl = formElList[0];
    this.formEl = formElList[1];
    this.values = values;

    // 如果采集成功初始化Miss事件统计界面【设个定时器异步下，不然子组件获取不到fromEl】
    if (['Completed', 'Aborted'].includes(this.status)) {
      setTimeout(() => {
        this.missStatistics.init();
      }, 0);
    }
  }

  // 获取任务日志
  public getTaksLog() {
    const params = {
      'node-id': this.nodeid,
    };

    this.initializing = true;
    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/collection-log/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      this.collectionLog = {
        all: res.data
      };
    }).catch((error: any) => {

    }).finally(() => {
      this.initializing = false;
    });
  }

  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
