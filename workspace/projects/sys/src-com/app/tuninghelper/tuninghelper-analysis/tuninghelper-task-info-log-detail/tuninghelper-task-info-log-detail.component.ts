import { Component, Input, OnInit } from '@angular/core';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { TabProps } from 'sys/src-com/app/mission-analysis/domain';
import { ConfigurationInfo } from 'sys/src-com/app/mission-analysis/components/mission-configuration/domain';
import { AnalysisTarget, TaskStatus } from 'sys/src-com/app/domain';

@Component({
  selector: 'app-tuninghelper-task-info-log-detail',
  templateUrl: './tuninghelper-task-info-log-detail.component.html',
  styleUrls: ['./tuninghelper-task-info-log-detail.component.scss']
})
export class TuninghelperTaskInfoLogDetailComponent implements OnInit {
  @Input() taskDetail: any;

  public i18n: any;
  // 导航
  public navTabList: Array<TabProps> = [];
  // 是否在初始化数据-loading遮罩
  public initializing = false;
  // 任务基本信息
  public configurationInfo: ConfigurationInfo;

  public taskId: any;
  public nodeId: any;
  public status: any;
  public projectName: any;
  public taskName: any;
  public analysisType = 'optimization';
  constructor(
    private http: HttpService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  async ngOnInit() {
    this.setTaskParam();
    this.navTabList = [
      {
        title: this.i18n.common_term_task_tab_congration,
        active: true,
        disable: false,
      },
      {
        title: this.i18n.common_term_task_tab_log,
        active: false,
        disable: false,
      }
    ];
    this.initializing = true;
    try {
      const taskConfigResp: any = await this.getTaskConfig();
      let commonInfoResp: any;
      if (this.status !== TaskStatus.Failed && this.status !== TaskStatus.Cancelled) {
        commonInfoResp = await this.getTaskCommonInfo();
      }
      this.buildConfigurationInfo(taskConfigResp?.data, commonInfoResp?.data);
      this.initializing = false;
    } catch {
      this.initializing = false;
    }
  }

  /**
   * 设置任务参数
   */
  private setTaskParam() {
    if (this.taskDetail) {
      this.taskId = this.taskDetail.taskId;
      this.nodeId = this.taskDetail.nodeId;
      this.status = this.taskDetail.sampleStatus;
      this.projectName = this.taskDetail.task.parentNode.projectName;
      this.taskName = this.taskDetail.task.taskname;
    }
  }

  /**
   * 获取任务配置基本信息
   */
  private getTaskConfig() {
    const params = { 'node-id': this.nodeId };
    return new Promise((resolve, reject) => {
      this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/common/configuration/`, {
        params,
        headers: { showLoading: false }
      }).then((resp: any) => {
        resolve(resp);
      }).catch((error: any) => {
        resolve(error);
      });
    });
  }

  /**
   * 获取任务公共信息-采集开始结束时间&采集大小
   */
  private getTaskCommonInfo() {
    const params = { 'node-id': this.nodeId };
    return new Promise((resolve, reject) => {
      this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/common/common-info/`, {
        params,
        headers: { showLoading: false }
      }).then((resp: any) => {
        resolve(resp);
      }).catch((error: any) => {
        resolve(error);
      });
    });
  }

  /**
   * 构造任务基本信息数据
   */
  private buildConfigurationInfo(taskConfig: any, commonInfo: any) {
    const taskParams = taskConfig.nodeConfig[0].task_param;
    let main: Array<any> = [];
    switch (taskConfig.analysisTarget) {
      case AnalysisTarget.PROFILE_SYSTEM:
        main = main.concat([{
          label: this.i18n.mission_create.analysisTarget,
          value: this.i18n.common_term_projiect_task_system
        }]);
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        main = main.concat([
          {
            label: this.i18n.mission_create.analysisTarget,
            value: this.i18n.common_term_task_crate_path || '--'
          },
          {
            label: this.i18n.ddr.analysisMode,
            value: taskParams.analysisTarget || this.i18n.mission_create.launchApp
          },
          {
            label: this.i18n.common_term_task_crate_app_path,
            value: taskParams.appDir || '--'
          },
          {
            label: this.i18n.common_term_task_crate_parameters,
            value: taskParams.appParameters || '--'
          },
          {
            label: this.i18n.mission_modal.sysSource.file_path,
            value: taskParams.assemblyLocation || '--'
          }
        ]);
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        main = main.concat([
          {
            label: this.i18n.mission_create.analysisTarget,
            value: this.i18n.common_term_task_crate_path || '--'
          },
          {
            label: this.i18n.ddr.analysisMode,
            value: taskParams.analysisTarget || this.i18n.mission_create.attachPid
          },
          {
            label: this.i18n.sys_res.processName,
            value: taskParams.processName || '--'
          },
          {
            label: this.i18n.sys_res.PID,
            value: taskParams.targetPid || '--'
          },
          {
            label: this.i18n.mission_modal.sysSource.file_path,
            value: taskParams.assemblyLocation || '--'
          }
        ]);
        break;
      default:
        break;
    }
    main = main.concat([
      {
        label: this.i18n.common_term_task_crate_duration,
        value: taskConfig.duration || '--'
      },
      {
        label: this.i18n.mission_create.collection_size,
        value: taskConfig?.size || '--',
      }
    ]);
    this.configurationInfo = {
      header: [
        {
          label: this.i18n.common_term_task_name,
          value: taskConfig.taskname || '--'
        },
        {
          label: this.i18n.common_term_another_nodename,
          value: taskConfig.nodeConfig[0].nodeNickName || '--'
        },
        {
          label: this.i18n.common_term_task_status,
          value: this.i18n['status_' + taskConfig.nodeConfig[0].taskStatus],
          status: taskConfig.nodeConfig[0].taskStatus,
          statusCode: taskConfig.nodeConfig[0].statusCode || '--'
        },
      ],
      main,
      footer: [
        {
          label: this.i18n.startTime,
          value: commonInfo?.start_time || '--',
        },
        {
          label: this.i18n.endTime,
          value: commonInfo?.end_time || '--',
        },
        {
          label: this.i18n.dataSize,
          value: commonInfo?.size ? commonInfo.size.replace(/MB/, '') : '--',
        }
      ]
    };
  }

}
