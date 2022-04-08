import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { HttpService } from 'sys/src-com/app/service';
import { AnalysisTarget } from 'sys/src-com/app/domain';
import { TuninghelperStatusService } from '../../service/tuninghelper-status.service';
@Component({
  selector: 'app-compare-info',
  templateUrl: './compare-info.component.html',
  styleUrls: ['./compare-info.component.scss']
})
export class CompareInfoComponent implements OnInit {

  @Input() taskId: any;

  public objData1: any = [];
  public objData2: any = [];
  public lang = sessionStorage.getItem('language');

  constructor(
    private http: HttpService,
    private statusService: TuninghelperStatusService,
  ) { }

  ngOnInit(): void {
    this.getTaskConfig();
  }

  /**
   * 获取对象信息
   */
   private getTaskConfig() {
    const params = { id: this.statusService.taskId};
    this.http
        .get('/data-comparison/comparison-details/', {
          params,
          headers: { showLoading: true },
        })
        .then((resp: any) => {
          this.buildData(resp.data);
        })
        .catch((error: any) => {});
  }

  /**
   * 赋值对象信息数据
   */
  private buildData(data: any) {
    this.objData1 = this.buildConfigurationInfo(data[0]);
    this.objData2 = this.buildConfigurationInfo(data[1]);
  }

  /**
   * 构造对象信息数据
   */
   private buildConfigurationInfo(taskConfig: any) {

    let main: Array<any> = [
      {
        label: I18n.common_term_projiect_name1,
        value: taskConfig.project_name || '--',
      },
      {
        label: I18n.common_term_task_name,
        value: taskConfig.task_name || '--',
      },
       {
        label: I18n.nodeManagement.nodeName,
        value: taskConfig.node_name || '--',
      },
       {
        label: I18n.common_term_node_ip,
        value: taskConfig.ip_address || '--',
      },
    ];

    switch (taskConfig.analysis_target) {
      case AnalysisTarget.PROFILE_SYSTEM:
        main = main.concat([{
          label: I18n.diagnostic.taskParams.analysisTarget,
          value: I18n.common_term_projiect_task_system || '--',
        }]);
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        main = main.concat([
          {
            label: I18n.mission_create.analysisTarget,
            value: I18n.common_term_task_crate_path || '--'
          },
          {
            label: I18n.ddr.analysisMode,
            value: taskConfig.analysis_target || '--'
          },
          {
            label: I18n.common_term_task_crate_app_path,
            value: taskConfig.app_dir || '--',
          },
           {
            label: I18n.common_term_task_crate_parameters,
            value: taskConfig.app_parameters || '--',
          },
          {
            label: I18n.common_term_two_name,
            value: taskConfig.assembly_location || '--',
          },
        ]);
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        main = main.concat([
          {
            label: I18n.mission_create.analysisTarget,
            value: I18n.common_term_task_crate_path || '--'
          },
          {
            label: I18n.ddr.analysisMode,
            value: taskConfig.analysis_target || '--'
          },
          {
            label: I18n.storageIO.ioapis.pidName,
            value: taskConfig.process_name || '--'
          },
          {
            label: I18n.storageIO.ioapis.pid,
            value: taskConfig.target_pid || '--'
          },
          {
            label: I18n.common_term_two_name,
            value: taskConfig.assembly_location || '--',
          },
        ]);
        break;
      default:
        break;
    }

    main = main.concat([
      {
        label: I18n.common_term_task_crate_duration,
        value: taskConfig.duration || '--',
      },
      {
        label: I18n.collection_size,
        value: taskConfig.size || '--',
      },
    ]);

    return main;
   }

}
