import { Component, Input, OnInit, SimpleChange, OnChanges } from '@angular/core';
import { RawDataIO } from '../../io-domain';
import { TaskDetailMode } from '../../../domain';
import { AnalysisTarget } from 'projects/sys/src-web/app/domain';
import { I18nService } from '../../../../service/i18n.service';

interface DetailItem {
  value: string | number;
  label: string;
  display: boolean;
}

@Component({
  selector: 'app-mission-io-detail',
  templateUrl: './mission-io-detail.component.html',
  styleUrls: ['./mission-io-detail.component.scss']
})
export class MissionIoDetailComponent implements OnInit, OnChanges {
  /** 输入参数： 任务信息 */
  @Input() taskInfo: RawDataIO;
  /** 输入参数： detail 展示对象 */
  @Input() detailTarget: TaskDetailMode;

  /** 显示列表 */
  public displayList: DetailItem[];
  /** 显示数据 */
  public displayData: { [key: string]: DetailItem };

  /** 节点数据列表 */
  public nodeList: {
    title: string;
    nodeInfo: DetailItem[]
  }[];
  /** 是否展示节点列表 */
  public isNodeListShow = false;

  public labelWidth: string;

  /** label 宽度的字典 */
  private labelWidthDict: Map<TaskDetailMode, { 'en-us': string, 'zh-cn': string }> = new Map([
    [TaskDetailMode.RESERVATION, { 'en-us': '25%', 'zh-cn': '25%' }],
    [TaskDetailMode.TEMPLATE_DETAIL, { 'en-us': '25%', 'zh-cn': '25%' }],
    [TaskDetailMode.TEMPLATE_IMPORT, { 'en-us': '210px', 'zh-cn': '140px' }],
  ]);

  /** 分析模式 */
  private analysisMode: AnalysisTarget;


  // 其他
  public i18n: any;

  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  /** 判断分析对象 */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const { taskInfo } = changes;
    if (taskInfo != null) {
      switch (this.taskInfo.analysisTarget) {
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
      analysisMode: {
        value: this.analysisMode,
        label: this.i18n.mission_create.mode,
        display: [AnalysisTarget.ATTACH_TO_PROCESS, AnalysisTarget.LAUNCH_APPLICATION].includes(this.analysisMode),
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
      app: {
        value: this.taskInfo.appDir || '--',
        label: this.i18n.storageIO.mission_create.app_dir,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
      },
      appParams: {
        value: this.taskInfo['app-parameters'] || '--',
        label: this.i18n.storageIO.mission_create.app_params,
        display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
      },
      duration: {
        value: this.taskInfo.duration,
        label: this.i18n.storageIO.mission_create.duration,
        display: true,
      },
      statistical: {
        value: this.taskInfo.statistical,
        label: this.i18n.storageIO.mission_create.statistical,
        display: true,
      },
      size: {
        value: this.taskInfo.size,
        label: this.i18n.storageIO.mission_create.collection_size,
        display: true,
      },
      stack: {
        value: this.taskInfo.stack ? this.i18n.process.enable : this.i18n.process.disable,
        label: this.i18n.storageIO.mission_create.stack,
        display: true,
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
    };
    this.displayList = Object.values(this.displayData);

    if (this.taskInfo.nodeConfig.length > 1
      && this.taskInfo.switch
      && this.analysisMode !== AnalysisTarget.PROFILE_SYSTEM) {
      this.isNodeListShow = true;
      this.nodeList = this.taskInfo.nodeConfig.map((nodeItem: any) => {
        const taskParam = nodeItem.taskParam;
        return {
          title: nodeItem.nickName + '(' + nodeItem.nodeIp + ')',
          nodeInfo: [{
            value: taskParam.targetPid || '--',
            label: 'PID',
            display: this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS,
          }, {
            value: taskParam.process_name || '--',
            label: this.i18n.storageIO.mission_create.process_name,
            display: this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS,
          }, {
            value: taskParam.appDir || '--',
            label: this.i18n.storageIO.mission_create.app_dir,
            display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
          }, {
            value: taskParam['app-parameters'] || '--',
            label: this.i18n.storageIO.mission_create.app_params,
            display: this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION,
          }],
        };
      });
    }
  }
}
