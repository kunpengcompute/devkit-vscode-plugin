import { Component, OnInit, Input } from '@angular/core';
import { AnalysisType, TaskStatus } from 'sys/src-com/app/domain';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { ConfigurationInfo } from '../components/mission-configuration/domain';
import { TabProps } from '../domain';

@Component({
  selector: 'app-ddrtab-detail',
  templateUrl: './ddrtab-detail.component.html',
  styleUrls: ['./ddrtab-detail.component.scss']
})
export class DdrtabDetailComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() status: TaskStatus;
  @Input() id: number;
  @Input() nodeid: number;

  public analysisType = AnalysisType.MemAccess;
  public i18n: any;
  public detailList: Array<TabProps> = [];
  public initializing = false;
  public configurationInfo: ConfigurationInfo;

  constructor(
    private http: HttpService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  async ngOnInit() {
    this.detailList = [
      {
        title: this.i18n.common_term_task_tab_summary,
        active: false,
        disable: true,
      },
      {
        title: this.i18n.ddr.tabCatch,
        active: false,
        disable: true,
      },
      {
        title:  this.i18n.ddr.tabDdr,
        active: false,
        disable: true,
      },
      {
        title: this.i18n.common_term_task_tab_congration,
        active: false,
        disable: false,
      },
      {
        title: this.i18n.common_term_task_tab_log,
        active: false,
        disable: false,
      }
    ];

    const respConfig = await this.getTaskConfig();
    this.buildConfigurationInfo(respConfig?.data);

    if (this.status === TaskStatus.Completed || this.status === TaskStatus.Aborted) {
      this.initTab(respConfig?.data);
    } else {
      this.detailList[3].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      this.detailList[4].disable = false;
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
      this.initializing = false;
    }
  }

  private getTaskConfig() {
    const params = { 'node-id': this.nodeid };

    this.initializing = true;
    return this.http.get(`/tasks/${encodeURIComponent(this.id)}/common/configuration/`, {
      params,
      headers: { showLoading: false }
    });
  }

  private initTab(config: any) {
    if (config) {
      config.task_param.type.forEach((item: string, i: number): any => {
        if (this.status === TaskStatus.Failed) { return false; }
        if (item === 'cache_access' && config.task_param.type.length === 1) {
          this.detailList[1].disable = false;
          this.detailList.splice((i + 2), 1);
        } else if (item === 'cache_access' && config.task_param.type.length === 2) {
          this.detailList[1].disable = false;
        } else if (item === 'ddr_access' && config.task_param.type.length === 1) {
          this.detailList[2].disable = false;
          this.detailList.splice((i + 1), 1);
        } else {
          this.detailList[2].disable = false;
        }
      });
    }

    this.detailList[0].active = true;
    this.detailList[0].disable = false;
    this.initializing = false;
  }

  private async buildConfigurationInfo(data: any) {
    this.configurationInfo = {
      header: [
        {
          label: this.i18n.common_term_task_name,
          value: data.taskname
        },
        {
          label: this.i18n.common_term_another_nodename,
          value: data.nodeConfig[0].nodeNickName
        },
        {
          label: this.i18n.common_term_task_status,
          value: this.i18n['status_' + data.nodeConfig[0].taskStatus],
          status: data.nodeConfig[0].taskStatus,
          statusCode: data.nodeConfig[0].statusCode || '--'
        },
      ],
      main: [
        {
          label: this.i18n.common_term_task_analysis_type,
          value: this.i18n.mission_modal.memAccessAnalysis
        },
        {
          label: this.i18n.mission_create.analysisTarget,
          value: this.i18n.common_term_projiect_task_system
        },
        {
          label: this.i18n.ddr.accessAnalysisType,
          value: this.i18n.mission_create.mem,
        },
        {
          label: this.i18n.ddr.label.duration,
          value: data.duration,
        },
        {
          label: this.i18n.ddr.label.interval,
          value: data.interval,
        },
        {
          label: this.i18n.ddr.label.interval,
          value: data.task_param.type
            .map((item: string) => this.i18n.ddr.types[item])
            .join(sessionStorage.getItem('language') === 'en-us' ? ', ' : '、'),
        },
      ],
      footer: [
        {
          label: this.i18n.startTime,
          value: '--'
        },
        {
          label: this.i18n.endTime,
          value: '--'
        },
        {
          label: this.i18n.dataSize,
          value: '--'
        },
      ]
    };
    if (this.status !== TaskStatus.Completed) { return; }
    const commonInfo = await this.http.get(`/tasks/${encodeURIComponent(this.id)}/common/common-info/`, {
      params: { 'node-id': this.nodeid },
      headers: { showLoading: false }
    });
    this.configurationInfo.footer[0].value = commonInfo?.data?.start_time || '--';
    this.configurationInfo.footer[1].value = commonInfo?.data?.end_time || '--';
    this.configurationInfo.footer[2].value = commonInfo?.data?.size?.split(' ')[0] || '--';
  }

  public updateIs1616(is1616: boolean) {
    if (is1616) {
      this.detailList = this.detailList.filter(item => item.title !== this.i18n.ddr.tabDdr);
    }
  }
}
