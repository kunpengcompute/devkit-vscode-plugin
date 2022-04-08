import { Component, OnInit, OnChanges, SimpleChanges,
  Input, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';
import { UserGuideService } from '../../service/user-guide.service';

@Component({
  selector: 'app-systab-detail',
  templateUrl: './systab-detail.component.html',
  styleUrls: ['./systab-detail.component.scss']
})
export class SystabDetailComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() tabShowing: boolean; // 用于判断当前tab的状态，为总览页面的相同svg图之间的独立做支撑
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() status: any;
  @Input() id: any;
  @Input() nodeid: any;

  public analysisType = AnalysisType.System;
  public i18n: any;
  public sceneSolution: number; // 后端返回场景标记

  constructor(
    public renderer2: Renderer2,
    public mytip: MytipService,
    public leftShowService: LeftShowService,
    private Axios: AxiosService,
    public i18nService: I18nService,
    private elementRef: ElementRef,
    public userGuide: UserGuideService,
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
      // common_term_task_tab_pcie
      {
        title: this.i18n.common_term_task_tab_pcie,
        disable: false,
        active: false,
      },
      {
        title: this.i18n.sys.performance,
        prop: 'perf',
        disable: true,
        active: false
      },
      {
        title: this.i18n.common_term_task_tab_congration,
        prop: 'configuration',
        disable: false,
        active: false,
      },
      {
        title: this.i18n.common_term_task_tab_log,
        prop: 'taskLog',
        disable: false,
        active: false
      }
    ];

    if (this.status === 'Completed' || this.status === 'Aborted') {
      this.initTab();

    } else {
      this.detailList.forEach(item => {
        item.active = item.prop === 'configuration';
        item.disable = !['configuration', 'taskLog'].includes(item.prop);
      });
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
    }
  }
  ngAfterViewInit() {
    // user-guide tree 数据更新后显示提示框
    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
      this.userGuide.hideMask();
      const selectScenes = document.querySelector('.tree-box');
      selectScenes.scrollTop = 0;
      setTimeout(() => {
        this.userGuide.showMask('user-guide-tree', 'class');
      }, 200);
    }
  }

  public async initTab() {
    this.detailList.forEach(item => item.disable = false);
    this.detailList[0].active = true;
    const params = {
      'node-id': this.nodeid,
      'analysis-type': 'system',
    };
    try {
      const resp = await this.Axios.axios.get('/tasks/' + encodeURIComponent(this.id) + '/common/configuration/', {
        params, headers: {
          showLoading: false,
        },
      });

      if (resp.data) {
        const taskData = resp.data.nodeConfig.find((item: any) => item.nodeId === this.nodeid);

        if (taskData.task_param.topCheck) {
          this.detailList.splice(this.detailList.findIndex(item => item.prop === 'configuration'), 0, {
            title: this.i18n.sys.topData,
            prop: 'topData',
            disable: false,
            active: false
          });
        }
        if (Object.prototype.hasOwnProperty.call(taskData.task_param, 'sceneSolution')) {
          this.sceneSolution = taskData.task_param.sceneSolution;
          this.detailList.splice(this.detailList.findIndex(item => item.prop === 'perf') + 1, 0, {
            title: this.i18n.sys_summary.distributed.typicalConfiguration,
            prop: 'typicalConfiguration',
            disable: false,
            active: false
          });
          if (Object.prototype.hasOwnProperty.call(taskData.task_param, 'traceSwitch')) {
            const hasTracing = taskData.task_param.traceSwitch;
            if (this.sceneSolution === 2 && hasTracing) {
              this.detailList.splice(this.detailList.findIndex(item => item.prop === 'perf') + 2, 0, {
                title: this.i18n.sys_summary.tracing.tag,
                prop: 'tracing',
                disable: false,
                active: false
              });
            }
          }
        }

      }
    }
    finally {
    }

  }
  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
