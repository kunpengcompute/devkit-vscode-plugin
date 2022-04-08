import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  OnChanges,
  SimpleChange,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  AnalysisTarget,
  SpinnerBlurInfo,
  LaunchRunUser,
} from 'projects/sys/src-web/app/domain';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18nService } from '../../../../service/i18n.service';
import { MissionIoFormService } from '../../services/mission-io-form.service';
import { MissionIoDataService } from '../../services/mission-io-data.service';
import {
  SuperData,
  IoFormControls,
  NodeConfigItem,
  RawDataIO,
} from '../../io-domain';
import { TaskActionType } from '../../../domain';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { ImportTemplateService } from '../../services/import-template.service';
import { Subscription } from 'rxjs';
import { HttpService } from 'sys/src-com/app/service';

/**
 * 汇集父组件传递的参数，确定分析对象 和 创建方式
 */
@Component({
  selector: 'app-mission-io',
  templateUrl: './mission-io.component.html',
  styleUrls: ['./mission-io.component.scss'],
})
export class MissionIoComponent implements OnInit, OnChanges, OnDestroy {
  @Output() sendMissionKeep = new EventEmitter<any>();
  @Output() sendPretable = new EventEmitter<any>();
  @Output() closeTab = new EventEmitter<any>();
  @Output() sendAppOrPidDisable = new EventEmitter<boolean>();

  /** 工程名称 */
  @Input() projectName: string;
  /** 任务名称 */
  @Input() taskName: string;
  /** 任务名称验证标识 */
  @Input() taskNameValid: boolean;
  /** 任务ID */
  @Input() projectId: number;
  /**  */
  @Input() restartAndEditId: number;
  /** 是否为修改任务 */
  @Input() isModifySchedule: boolean;
  /** 分析模式：0--Profile System, 1--Launch Application, 2--Attach to Process */
  @Input() typeId: number;

  /** Launch Application: 应用名称 */
  @Input() modeApplication: string;
  /** Launch Application: 应用参数 */
  @Input() modeAppParams: string;
  /** Launch Application: 应用运行用户 开关 */
  @Input() switchState: boolean;
  /** Launch Application: 应用运行用户 用户名 */
  @Input() modeApplicationUser: string;
  /** Launch Application: 应用运行用户 密码 */
  @Input() modeApplicationPassWord: string;
  /** Launch Application: 应用名称和应用参数的输入验证标志 */
  @Input() modeAppValid: boolean;

  /** Attach to Process: Pid */
  @Input() modePid: string;
  /** Attach to Process: 进程名称 */
  @Input() modeProcess: string;
  /** Attach to Process: Pid 和进程名称的输入验证标志 */
  @Input() modePidValid: boolean;
  /** 任务行为 */
  @Input() actionType: 'restart' | 'edit' | 'create';
  /** 任务详情 */
  @Input() taskDetail: any;
  @Input() labelWidth: string;

  /** 分析模式 */
  public analysisMode: AnalysisTarget;
  /** 行为方式 */
  public taskActionType: TaskActionType;

  /** 表单控件 */
  public formGroup: FormGroup;
  /** 表单控件组 */
  public ctl: IoFormControls;

  /** 父组件的数据 */
  public superData: SuperData;

  public i18n: any;
  /** 父组件的验证 */
  private superParamsEnable = false;
  /** 本组件的验证 */
  private paramsEnable = true;
  /** 操作动作的使能与失能 */
  public opreationEnable = false;
  /** 使用TiValidation定义接口类型 */
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  /** 模板导入的标志 */
  private isImportTemplate = false;
  /** 模板导入订阅主题 */
  private importSubscription: Subscription;
  public runUserDataObj: LaunchRunUser = {};
  public runUserData = {
    runUser: false,
    user: '',
    password: '',
  };
  // 预约任务，立即执行禁用变量
  public isShowReserveAndImmedia = false;

  /** 配置表 */
  public formOption = {
    selectNodeList: { display: false },
    doOrder: { display: true },
    orderConfig: { display: false },
    doNodeConfig: { display: false },
    nodeConfig: { display: false },
    taskStartNow: { display: true },
  };
  // 工程下节点信息
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;

  constructor(
    public http: HttpService,
    private i18nService: I18nService,
    private formService: MissionIoFormService,
    private dataService: MissionIoDataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private importService: ImportTemplateService
  ) {
    this.i18n = i18nService.I18n();
    this.formGroup = this.fb.group({
      nodeList: [],
      duration: [
        30,
        [
          TiValidators.required,
          TiValidators.minValue(2),
          TiValidators.maxValue(300),
        ],
      ], // 采样时长
      statistical: [
        1,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(5),
        ],
      ], // 统计周期
      size: [
        100,
        [
          TiValidators.required,
          TiValidators.minValue(10),
          TiValidators.maxValue(500),
        ],
      ], // 采集文件大小
      stack: [false], // 采集调用栈
      doOrder: [false], // 是否预约定时启动
      orderConfig: [], // 预约配置参数
      doNodeConfig: [false], // 是否进行节点参数配置
      nodeConfig: [], // 配置节点参数
      taskStartNow: [true], // 立即启动
    });

    this.ctl = this.formGroup.controls;
    if (this.ctl?.nodeConfig) {
      this.ctl.nodeConfig.valueChanges.subscribe((val) => {
        let bool = false;
        const nodeConfigInfo = val;
        nodeConfigInfo.forEach((nodeItem: NodeConfigItem) => {
          if (nodeItem?.runUserData?.runUser) {
            bool = true;
            return;
          }
        });
        if (bool) {
          this.ctl.doOrder.disable();
        }
        this.isShowReserveAndImmedia = bool;
      });
    }
  }

  public intervalBlur: SpinnerBlurInfo;
  public collectFileBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;

  async ngOnInit() {
    this.getProjectNodes();
    // 监听导入事件
    this.importSubscription = this.importService.importLister$.subscribe(
      (taskData: RawDataIO) => {
        this.isImportTemplate = true;
        this.dataService.setControlsByRawData(
          this.formGroup,
          taskData,
          this.analysisMode
        );
        this.modePidValid = true; // 这样做的目的是：在导入模板的时候，modePidValid 不随父组件的更新而更新
        this.cdr.detectChanges();
      }
    );
    // 修正表单控件组
    this.formService.amendFormGroup(
      this.formGroup,
      this.analysisMode,
      this.projectId
    );

    // 控制界面的交互
    const doOrderSubject = this.ctl.doOrder.valueChanges.subscribe(
      (doOrder) => {
        this.formOption.orderConfig.display = doOrder;
        this.formOption.taskStartNow.display = !doOrder;
        this.cdr.detectChanges();
      }
    );
    if (this.analysisMode === AnalysisTarget.PROFILE_SYSTEM) {
      this.formOption.doNodeConfig.display = false;
      this.formOption.nodeConfig.display = false;
      this.cdr.detectChanges();
    } else {
      // 初始化节点参数的函数；
      let initNodeConfigOnce = () => {
        this.dataService
          .requestGetNodeInfo(this.projectId)
          .then((nodes: NodeConfigItem[]) => {
            let nodeConfig: any[] = [];
            switch (this.analysisMode) {
              case AnalysisTarget.LAUNCH_APPLICATION:
                if (this.sceneName === 'HPC') {
                  this.formGroup.get('nodeList').value.forEach((item: any) => {
                    nodes.filter((nodeItem) => {
                      if (nodeItem.nodeIp === item.nodeIp) {
                        nodeConfig.push(nodeItem);
                      }
                    });
                  });
                } else {
                  nodeConfig = nodes;
                }
                nodeConfig.forEach((item) => {
                  item.taskParam.status = false;
                  item.taskParam.appDir = this.superData.modeApplication;
                  item.taskParam['app-parameters'] =
                    this.superData.modeAppParams;
                });
                break;
              case AnalysisTarget.ATTACH_TO_PROCESS:
                if (this.sceneName === 'HPC') {
                  this.formGroup.get('nodeList').value.forEach((item: any) => {
                    nodes.filter((nodeItem) => {
                      if (nodeItem.nodeIp === item.nodeIp) {
                        nodeConfig.push(nodeItem);
                      }
                    });
                  });
                } else {
                  nodeConfig = nodes;
                }
                nodeConfig.forEach((item) => {
                  item.taskParam.status = false;
                  item.taskParam.targetPid = this.superData.modePid;
                  item.taskParam.process_name = this.superData.modeProcess;
                });
                break;
              default:
                break;
            }
            this.ctl.nodeConfig.setValue(nodeConfig);
          });
      };
      this.ctl.doNodeConfig.valueChanges.subscribe((doConfig) => {
        this.formOption.nodeConfig.display = doConfig;
        // 使能或失能父组件的控件
        this.sendAppOrPidDisable.emit(doConfig);
        // 控件附上初值(仅在使能时赋值一次)
        if (
          doConfig &&
          this.taskActionType === TaskActionType.CREATE &&
          !this.isImportTemplate
        ) {
          initNodeConfigOnce();
          initNodeConfigOnce = () => {};
        }
        this.isSelectNodeDisabled = doConfig;
      });
      this.dataService
        .requestGetNodeInfo(this.projectId)
        .then((nodeInfo: NodeConfigItem[]) => {
          this.formOption.doNodeConfig.display = nodeInfo.length > 1;
        });
    }

    // 操作（确认，保存模板）使能，失能控制
    this.formGroup.statusChanges.subscribe((status) => {
      this.paramsEnable = status === 'VALID';
      this.opreationEnable = this.superParamsEnable && this.paramsEnable;
    });

    switch (this.taskActionType) {
      case TaskActionType.CREATE:
        break;
      case TaskActionType.EDIT:
        this.dataService.pullMissionData(
          this.formGroup,
          this.superData,
          this.analysisMode,
          this.taskActionType
        );
        this.ctl.doOrder.disable();
        break;
      case TaskActionType.RESTART:
        this.dataService.pullMissionData(
          this.formGroup,
          this.superData,
          this.analysisMode,
          this.taskActionType
        );
        this.ctl.doOrder.disable();
        this.formOption.taskStartNow.display = false;
        doOrderSubject.unsubscribe();
        break;
      default:
        break;
    }

    this.setSpinnerBlur();
  }

  /**
   * 监控 Input 参数的变化, 并初始化 分析模式 和 分析对象
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'typeId':
          // 判断分析对象和分析模式
          switch (changes.typeId.currentValue || this.typeId) {
            case 0:
              this.analysisMode = AnalysisTarget.PROFILE_SYSTEM;
              this.superParamsEnable = true;
              break;
            case 1:
              this.analysisMode = AnalysisTarget.LAUNCH_APPLICATION;
              if (this.switchState) {
                this.superParamsEnable = Boolean(
                  this.modeAppValid &&
                    this.modeApplicationUser &&
                    this.modeApplicationPassWord
                );
              } else {
                this.superParamsEnable = Boolean(this.modeAppValid);
              }
              break;
            case 2:
              this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
              this.superParamsEnable = this.modePidValid;
              break;
            default:
              break;
          }
          break;
        case 'taskNameValid':
        case 'modeAppValid':
        case 'modePidValid':
          switch (this.analysisMode) {
            case AnalysisTarget.PROFILE_SYSTEM:
              this.superParamsEnable = this.taskNameValid;
              break;
            case AnalysisTarget.LAUNCH_APPLICATION:
              this.superParamsEnable = this.taskNameValid && this.modeAppValid;
              break;
            case AnalysisTarget.ATTACH_TO_PROCESS:
              this.superParamsEnable = this.taskNameValid && this.modePidValid;
              break;
            default:
              break;
          }
          this.validOnSuperChange();
          this.opreationEnable = this.superParamsEnable && this.paramsEnable;
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
          }
          break;
        case 'switchState': {
          if (changes.switchState.currentValue) {
            this.runUserData.runUser = true;
            // 立即执行开启 预约关闭
            this.formGroup.controls.taskStartNow.setValue(true);
            this.formGroup.controls.doOrder.setValue(false);
            this.ctl.doOrder.disable();
            this.ctl.taskStartNow.disable();
            this.isShowReserveAndImmedia = true;
          } else {
            this.runUserData.runUser = false;
            this.ctl.doOrder.enable({ emitEvent: false });
            this.ctl.taskStartNow.enable({ emitEvent: false });
            this.isShowReserveAndImmedia = false;
          }
          break;
        }
        case 'modeApplicationUser': {
          if (changes.modeApplicationUser.currentValue) {
            this.runUserData.user = changes.modeApplicationUser.currentValue;
          }
          break;
        }
        case 'modeApplicationPassWord': {
          this.runUserData.password =
            changes.modeApplicationPassWord.currentValue;
          break;
        }
        default:
          break;
      }
    }

    this.opreationEnable =
      this.taskNameValid && this.superParamsEnable && this.paramsEnable;
    this.superData = {
      projectName: this.projectName,
      taskName: this.taskName,
      projectId: this.projectId,
      modeAppParams: this.modeAppParams,
      modeApplication: this.modeApplication,
      modePid: this.modePid,
      modeProcess: this.modeProcess,
      restartAndEditId: this.restartAndEditId,
      scheduleTaskId: '',
      runUserStatus: this.switchState,
      user_name: this.runUserData.user,
      password: this.runUserData.password,
    };
  }

  ngOnDestroy() {
    this.importSubscription.unsubscribe();
  }
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = res.data.nodeList;
        if (this.actionType === 'create') {
          this.formGroup.get('nodeList').setValue(
            this.nodeList.length > 10 ? this.nodeList.slice(0, 10) : this.nodeList
          );
        }
      }
      // 获取工程
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC'){
        this.formOption.selectNodeList.display = true;
        this.formGroup.get('nodeList').enable();
      } else {
        this.formOption.selectNodeList.display = false;
        this.formGroup.get('nodeList').disable();
      }
    });
  }

  /**
   * 事件处理： 创建任务、更新任务
   */
  public onCreateMission() {
    this.dataService.pushMissionData(
      this.formGroup,
      this.superData,
      this.analysisMode,
      this.taskActionType,
      this.sendMissionKeep,
      this.sendPretable,
      this.closeTab,
      this.runUserData,
    );
  }

  /**
   * 事件处理：关闭操作页面
   */
  public onClose() {
    this.closeTab.emit({});
  }

  /**
   * 事件处理：保存模板
   */
  public async onSaveTemplate() {
    const params = await this.dataService.getRawDataByControls(
      this.formGroup,
      this.analysisMode,
      this.superData
    );
    this.sendMissionKeep.emit(params);
  }

  /**
   * 当父组件的表单值发生改变是，根据其验证标识，验证和控制当前表单的状态和合理性
   */
  public validOnSuperChange() {
    if (this.ctl?.doNodeConfig == null) {
      return;
    }
    switch (this.analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        if (this.taskNameValid && this.modeAppValid) {
          this.ctl.doNodeConfig.enable({ emitEvent: false });
        } else {
          this.ctl.doNodeConfig.setValue(false, { emitEvent: false });
          this.ctl.doNodeConfig.disable({ emitEvent: false });
        }
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        if (this.taskNameValid && this.modePidValid) {
          this.ctl.doNodeConfig.enable({ emitEvent: false });
        } else {
          this.ctl.doNodeConfig.setValue(false, { emitEvent: false });
          this.ctl.doNodeConfig.disable({ emitEvent: false });
        }
        break;
      default:
        break;
    }
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.intervalBlur = {
      control: this.formGroup.controls.statistical,
      min: 1,
      max: 5,
    };
    this.collectFileBlur = {
      control: this.formGroup.controls.size,
      min: 10,
      max: 500,
    };
    this.samplingDurationBlur = {
      control: this.formGroup.controls.duration,
      min: 2,
      max: 300,
    };
  }
}
