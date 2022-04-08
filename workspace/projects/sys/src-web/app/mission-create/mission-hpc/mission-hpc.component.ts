import {
  Output, SimpleChange, Component, EventEmitter,
  Input, OnChanges
} from '@angular/core';
import { TaskActionType, PidProcess, INodeInfo } from '../domain';
import { AnalysisTarget } from 'projects/sys/src-web/app/domain';
import { IHpcTaskInfo } from './domain';

interface AppAndParams {
  app: string;
  params?: string;
  runUser: boolean;
  user_name: string;
  password: string;
}

@Component({
  selector: 'app-mission-hpc',
  templateUrl: './mission-hpc.component.html'
})
export class MissionHpcComponent implements OnChanges {
  @Output() handleNodeEmitIndex = new EventEmitter<any>();
  @Output() cancelModify = new EventEmitter<void>();
  @Output() confirmModify = new EventEmitter<string>();
  @Output() sendMissionKeep = new EventEmitter<any>();
  @Output() sendPretable = new EventEmitter<any>();
  @Output() closeTab = new EventEmitter<any>();
  @Output() sendAppOrPidDisable = new EventEmitter<boolean>();
  @Output() sendMpiStatus = new EventEmitter<boolean>();

  @Input() taskInfo: IHpcTaskInfo;
  @Input() scheduleTaskId: number;
  @Input() restartAndEditId: number;

  @Input() projectName: string;
  @Input() projectId: number;
  @Input() typeId: number;
  @Input() actionType: TaskActionType;
  @Input() nodeInfo: INodeInfo[];
  @Input() nodeConfigedData: any;

  @Input() taskName: string;
  @Input() taskNameValid: boolean;
  @Input() modeApplication: string;
  @Input() modeAppParams: string;
  @Input() modeAppValid: boolean;
  /** Launch Application: 应用运行用户 开关 */
  @Input() switchState: boolean;
  /** Launch Application: 应用运行用户 用户名 */
  @Input() modeApplicationUser: string;
  /** Launch Application: 应用运行用户 密码 */
  @Input() modeApplicationPassWord: string;

  @Input() modePid: string;
  @Input() modeProcess: string;
  /** 进程名称和PID校验是否通过 */
  @Input() modePidValid: boolean;

  // 在模板中使用的
  anaModeEnum = AnalysisTarget;
  actTypeEnum = TaskActionType;

  // 控制变量
  analysisMode: AnalysisTarget;
  taskActionType: TaskActionType;

  // 表单变量
  appAndParams: AppAndParams;
  pidProcess: PidProcess;
  projectInfo: { name: string, id: number };

  constructor() { }

  /**
   * 监控 Input 参数的变化, 并初始化 分析模式 和 分析对象
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'typeId':
          // 判断分析对象和分析模式
          switch (this.typeId) {
            case 0:
              this.analysisMode = AnalysisTarget.PROFILE_SYSTEM;
              break;
            case 1:
              this.analysisMode = AnalysisTarget.LAUNCH_APPLICATION;
              break;
            case 2:
              this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
              break;
            default:
              throw new Error('分析对象和分析模式的判断出错！');
          }
          break;
        case 'actionType':
          switch (this.actionType) {
            case 'restart':
              this.taskActionType = TaskActionType.RESTART;
              break;
            case 'edit':
              this.taskActionType = TaskActionType.EDIT;
              break;
            case 'create':
              this.taskActionType = TaskActionType.CREATE;
              break;
            default:
              throw new Error('任务动作类型的判断出错！');
          }
          break;

        case 'modeApplication':
        case 'modeAppParams':
        case 'switchState':
        case 'modeApplicationUser':
        case 'modeApplicationPassWord':
          this.appAndParams = {
            app: this.modeApplication,
            params: this.modeAppParams,
            runUser: this.switchState,
            user_name: this.modeApplicationUser,
            password: this.modeApplicationPassWord
          };
          break;
        case 'projectName':
        case 'projectId':
          this.projectInfo = {
            name: this.projectName,
            id: this.projectId,
          };
          break;
        case 'modePid':
        case 'modeProcess':
          this.pidProcess = {
            pid: this.modePid,
            process: this.modeProcess,
          };
          break;
        default:
      }
    }
  }

  onSendMissionKeep(evt: any) {
    this.sendMissionKeep.emit(evt);
  }

  onSendPretable(evt: any) {
    this.sendPretable.emit(evt);
  }

  onCloseTab(evt: any) {
    this.closeTab.emit(evt);
  }

  onSendAppOrPidDisable(evt: any) {
    this.sendAppOrPidDisable.emit(evt);
  }

  onSendMpiStatus(evt: any) {
    this.sendMpiStatus.emit(evt);
  }

  onCancelModify(evt: any) {
    this.cancelModify.emit(evt);
  }

  onConfirmModify(evt: any) {
    this.confirmModify.emit(evt);
  }

  /**
   *   传递节点参数
   */
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }
}
