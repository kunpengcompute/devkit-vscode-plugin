import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';
import { ViewDetailsService } from './service/view-details.service';
import { Subject, Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-restab-detail',
  templateUrl: './app-restab-detail.component.html',
  styleUrls: ['./app-restab-detail.component.scss'],
})
export class AppRestabDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() projectName: any;
  @Input() taskName: any;

  @Input() status: any;
  @Input() id: any;
  @Input() nodeid: any;

  public analysisType = AnalysisType.ResouSchedule;

  @ViewChild('cpuSche') cpuSche: any;
  public configuration: object;
  public i18n: any;
  public view: Subscription;
  public detailList: Array<any> = [];
  public tpItem: any;
  public numaItem: any;
  constructor(public i18nService: I18nService, public Axios: AxiosService,
              public leftShowService: LeftShowService, private viewDetails: ViewDetailsService, ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.detailList = [
      { title: this.i18n.common_term_task_tab_congration, prop: 'taskInfo'  },
      { title: this.i18n.common_term_task_tab_log, prop: 'taskLog'  }
    ];

    if (this.status === 'Completed' || this.status === 'Aborted') {
      this.detailList.unshift(...[
        { title: this.i18n.common_term_task_tab_summary, prop: 'summary' },
        { title: this.i18n.sys_res.tab.cpu, prop: 'cpu_schedule'  },
        { title: this.i18n.sys_res.tab.pro, prop: 'pt_schedule'  },
      ]);
      this.view = this.viewDetails.subject.subscribe({next: (item) => {
        this.detailList[0].active = false;
        setTimeout(() => {
          if (item[0] === 'tp'){
        this.detailList[1].disable = false;
        this.detailList[1].active = true;
        this.tpItem = item[1];
      } else {
        this.numaItem = item[1];
        this.detailList[2].disable = false;
        this.detailList[2].active = true;
      }
        }, 300);

    }});
    }

    this.detailList[0].active = true;

  }

  ngAfterViewInit() {
    this.getConfiguration();
  }

  /**
   * 取消订阅
   */
    ngOnDestroy() {
      if (this.view) {
        this.view.unsubscribe();
      }
    }
  public getConfiguration() {
    const params = {
      'node-id': this.nodeid,
    };

    this.Axios.axios.get(`/tasks/${encodeURIComponent(this.id)}/common/configuration/`, {
      params,
      headers: {
        showLoading: false,
      },
    }).then((res: any) => {
      if (res.data) {
        this.configuration = res.data.nodeConfig.find((item: any) => item.nodeId === this.nodeid);

        /**
         * CPU调度tab页依赖于任务的配置信息
         *  1、接口数据返回后，父子传值把配置信息传递给CPU调度页面；
         *  2、如果CPU调度页面已经初始化了，需要父组件调用init方法
         */
        if (this.cpuSche.waitInit) {
          this.cpuSche.init();
        }
      }
    }).catch((error: any) => {

    });
  }

  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
