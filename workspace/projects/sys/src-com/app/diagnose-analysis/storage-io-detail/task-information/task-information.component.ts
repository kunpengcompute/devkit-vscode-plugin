
import { Component, OnInit, Input } from '@angular/core';
import { StorageIoService } from '../service/storage-io-service';
import { I18n } from 'sys/locale';
import { HyTheme, HyThemeService } from 'hyper';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-task-information',
  templateUrl: './task-information.component.html',
  styleUrls: ['./task-information.component.scss']
})
export class TaskInformationComponent implements OnInit {
  @Input() taskId: number;
  @Input() nodeId: number;
  constructor(private StIoService: StorageIoService, private themeServe: HyThemeService) { }
  public taskConfig: any;
  configInfo: any;
  showReason = false;
  i18n = I18n;
  showFooter: boolean;
  showMain: boolean;
  theme$: Observable<HyTheme>;
  async ngOnInit() {
    const res = await this.StIoService.getInfoData(this.taskId, this.nodeId);
    this.taskConfig = res.data;
    this.buildConfigInfo(this.taskConfig);
  }
  /**
   * 构造任务基本信息数据
   */
  private buildConfigInfo(taskConfig: any) {
    const taskParams = taskConfig.nodeConfig[0].taskParam;
    this.showFooter = true;
    this.showMain = taskConfig.diagnosticFunc.length ? true : false;

    let main: any[] = [];
    if (this.showMain) {
      main = [
        {
          // 诊断对象
          label: I18n.diagnostic.taskParams.diagnosticTarget,
          value: I18n.diagnostic.taskParams.storageIO,
          show: true
        },
        {
          // 诊断功能
          label: I18n.network_diagnositic.taskParams.diagnositic_scen,
          value: this.handleDiagnoseFun(taskConfig.diagnosticFunc),
          show: true
        },
        {
          // 压测对象
          label: I18n.storageIo.pressObj.pressObj,
          value: taskParams.file_name,
          show: true
        },
        {
          // 关键指标
          label: I18n.storageIo.keyMetric.keyMetric,
          value: this.handleIndicator(taskConfig),
          show: true
        },
        {
          // 测试模型
          label: I18n.storage_io_detail.result_tab.test_model_label,
          value: '',
          valueList: this.handleModel(taskConfig),
          show: true
        },
        {
          // 采集时长
          label: I18n.network_diagnositic.network_load_param.collection_time,
          value: taskConfig.collectDuration || '--',
          show: taskConfig.diagnosticFunc.includes('systemMonitor')
        },
        {
          // 采样间隔
          label: I18n.storageIo.storageInterval,
          value: taskConfig.collectSeparation || '--',
          show: taskConfig.diagnosticFunc.includes('systemMonitor')
        },
        {
          // 周期统计
          label: I18n.storageIo.cycleOn,
          value: taskConfig.cycleOn ? I18n.sys_cof.sum.open : I18n.sys_cof.sum.close,
          show: true
        },
        {
          // 统计周期
          label: I18n.storageIo.cyclePeriod,
          value: taskConfig.cyclePeriod || '--',
          show: true
        },
        {
          // 采集文件大小
          label: I18n.storageIO.mission_create.collection_size,
          value: taskConfig.collectSize || '--',
          show: true
        },
      ];
    }
    let footer: Array<any> = [];
    footer = [
      {
        label: I18n.common_term_task_tab_summary_start,
        value: taskConfig.nodeConfig[0].commonInfo.start_time || '--',
      },
      {
        label: I18n.common_term_task_tab_summary_end,
        value: taskConfig.nodeConfig[0].commonInfo.end_time || '--',
      },
      {
        label: I18n.common_term_task_tab_summary_size,
        value: parseFloat(taskConfig.nodeConfig[0].commonInfo.size) || '--',
      },
    ];

    const header = [
      {
        label: I18n.common_term_task_name,
        value: taskConfig?.taskName || '--',
      },
      {
        label: I18n.common_term_another_nodename,
        value: taskConfig.nodeConfig[0].nodeName || '--',
      },
      {
        label: I18n.common_term_node_ip,
        value: taskConfig.nodeConfig[0].nodeIp || '--',
      },
      {
        label: I18n.common_term_task_status,
        value: (I18n as any)['status_' + taskConfig.nodeConfig[0].taskStatus],
        status: taskConfig.nodeConfig[0]?.taskStatus,
        statusCode: taskConfig.nodeConfig?.[0].statusCode || '--',
      }
    ];

    this.configInfo = {
      header,
      main,
      footer,
    };
  }

  /**
   * 对诊断功能参数做处理
   * @param funArr 诊断功能数据
   */
  private handleDiagnoseFun(funArr: string[]) {
    return funArr.map((funName: string) => this.transformLanguage(funName));
  }
  /**
   * 对关键指标参数做处理
   * @param taskConfig 任务数据
   */
  private handleIndicator(taskConfig: any) {
    let indicator = '';
    indicator += taskConfig.throughput ? `${I18n.storageIo.keyMetric.throughput}${I18n.common_term_sign_comma}` : '';
    indicator += taskConfig.iops ? `iops${I18n.common_term_sign_comma}` : '';
    indicator += taskConfig.latency ? `${I18n.storageIo.keyMetric.delay}` : '';
    return indicator;
  }
  /**
   * 对压测对象参数做处理
   * @param taskConfig 任务数据
   */
  private handleModel(taskConfig: any) {
    const indicatorList = taskConfig.indicatorForm?.map((item: any) => {
      const {
        block_size,
        rw_type,
        rw_mix_read_ratio,
        io_depth,
        io_engine,
        num_jobs,
        direct,
        size,
        runtime,
        indicator_type
      } = item;
      const model: any = {
        block_size,
        rw_type: this.StIoService.transformLabel(rw_type),
        rw_mix_read_ratio,
        io_depth,
        io_engine,
        num_jobs,
        direct,
        size,
        runtime,
        indicator_type: this.handleindicatorType(indicator_type)
      };
      const modalList = Object.values(model);
      return modalList.join(`${I18n.common_term_sign_semicolon}`);
    });
    return indicatorList;
  }

  /**
   * 将后端返回的诊断功能数据转换为 对应的中英文
   * @param funName 功能名
   */
  private transformLanguage(funName: string) {
    switch (funName) {
      case 'storageDiagnostic':
        return I18n.storageIo.storage_io;
      case 'systemMonitor':
        return I18n.storageIo.sys_load;
      default:
        return I18n.storageIo.storage_io;
    }
  }

  /**
   * 相关指标界面词处理
   */
  public handleindicatorType(str: string) {
    if (!str.length) { return ''; }
    return str.split('|').map((item: string) => {
      return this.StIoService.transformLabel(item);
    });
  }
}
