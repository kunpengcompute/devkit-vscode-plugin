import {
  Component, Input, OnInit, SimpleChange, OnChanges
} from '@angular/core';
import { TaskDetailMode } from '../../../domain';
import { AnalysisTarget, HpcPresetType } from 'projects/sys/src-web/app/domain';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

interface IDetailItem {
  value: string | number;
  label: string;
  display: boolean;
}

@Component({
  selector: 'app-mission-hpc-detail',
  templateUrl: './mission-hpc-detail.component.html',
  styleUrls: ['./mission-hpc-detail.component.scss']
})
export class MissionHpcDetailComponent implements OnInit, OnChanges {

  @Input() taskInfo: any;
  @Input() detailTarget: TaskDetailMode;

  displayList: IDetailItem[];
  displayData: { [key: string]: IDetailItem };

  labelWidth: string;

  // 其他
  i18n: any;

  private labelWidthDict: Map<TaskDetailMode, { 'en-us': string, 'zh-cn': string }> = new Map([
    [TaskDetailMode.RESERVATION, { 'en-us': '25%', 'zh-cn': '25%' }],
    [TaskDetailMode.TEMPLATE_DETAIL, { 'en-us': '25%', 'zh-cn': '25%' }],
    [TaskDetailMode.TEMPLATE_IMPORT, { 'en-us': '210px', 'zh-cn': '140px' }],
  ]);

  private presetValueDict: Map<HpcPresetType, string>;

  /** 分析模式 */
  private analysisMode: AnalysisTarget;

  constructor(
    private i18nService: I18nService
  ) {

    this.i18n = this.i18nService.I18n();

    this.presetValueDict = new Map([
      [HpcPresetType.Summary, this.i18n.hpc.mission_create.summary],
      [HpcPresetType.Topdown, 'HPC Top-Down'],
      [HpcPresetType.InstrucMix, this.i18n.hpc.mission_create.instr_dis]
    ]);
  }

  /** 判断分析对象 */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const { taskInfo } = changes;
    if (taskInfo != null) {
      switch (this.taskInfo['analysis-target']) {
        case 'Profile System':
          this.analysisMode = AnalysisTarget.PROFILE_SYSTEM;
          break;
        case 'Launch Application':
          this.analysisMode = AnalysisTarget.LAUNCH_APPLICATION;
          break;
        case 'Attach to Process':
          this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
          break;
        default:
      }
    }
  }

  ngOnInit() {
    this.labelWidth = this.labelWidthDict.get(this.detailTarget)
      ?.[(sessionStorage.getItem('language') as 'en-us' | 'zh-cn')];

    this.displayData = {
      taskName: {
        value: this.taskInfo.taskname,
        label: this.i18n.storageIO.mission_create.mission_name,
        display: [TaskDetailMode.TEMPLATE_IMPORT, TaskDetailMode.TEMPLATE_DETAIL].includes(this.detailTarget),
      },
      analysisMode: {
        value: this.analysisMode,
        label: this.i18n.mission_create.mode,
        display: [AnalysisTarget.ATTACH_TO_PROCESS, AnalysisTarget.LAUNCH_APPLICATION].includes(this.analysisMode),
      },
      app: {
        value: this.taskInfo['app-dir'] || '--',
        label: this.i18n.storageIO.mission_create.app_dir,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
      },
      appParams: {
        value: this.taskInfo['app-parameters'] || '--',
        label: this.i18n.storageIO.mission_create.app_params,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
      },
      pid: {
        value: this.taskInfo.targetPid || '--',
        label: 'PID',
        display: this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS,
      },
      process: {
        value: this.taskInfo.process_name || '--',
        label: this.i18n.storageIO.mission_create.process_name,
        display: this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS,
      },
      duration: {
        value: this.taskInfo.duration,
        label: this.i18n.storageIO.mission_create.duration,
        display: true,
      },
      preset: {
        value: this.presetValueDict.get(this.taskInfo.preset),
        label: this.i18n.hpc.mission_create.analysis_type,
        display: true,
      },
      collectType: {
        value: this.taskInfo.mpi_status === true ? 'MPI' : 'OpenMP',
        label: this.i18n.hpc.mission_create.collectionType,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
      },
      openMpParams: {
        value: this.taskInfo.open_mp_param  || '--',
        label: this.i18n.hpc.mission_create.openMpParams,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION && !this.taskInfo.mpi_status,
      },
      mpiEnvDir: {
        value: this.taskInfo.mpi_env_dir,
        label: this.i18n.hpc.mission_create.mpi_env_dir,
        display: !!this.taskInfo.mpi_status,
      },
      cycle: {
        value: !!this.taskInfo.cycle ? this.i18n.preSwitch.duraColect : this.i18n.preSwitch.onceColect,
        label: this.i18n.storageIO.mission_create.collect_way,
        display: this.taskInfo.cycle != null,
      },
      targetTime: {
        value: this.taskInfo.targetTime,
        label: this.i18n.storageIO.mission_create.cellect_time,
        display: this.taskInfo.cycle != null,
      },
      cycleDate: {
        value: !!this.taskInfo.cycle
          ? (this.taskInfo.cycleStart || '').replace(/-/g, '/')
          + '—' + (this.taskInfo.cycleStop || '').replace(/-/g, '/')
          : (this.taskInfo.appointment || '').replace(/-/g, '/'),
        label: this.i18n.storageIO.mission_create.cellect_date,
        display: this.taskInfo.cycle != null,
      },
      masterIp: {
        value: this.taskInfo.master_ip,
        label: this.i18n.hpc.mission_create.selectNode,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION && this.taskInfo.mpi_status,
      }
    };
    this.displayList = Object.values(this.displayData);
  }
}
