import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  Input,
  OnChanges,
  SimpleChange,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  TaskActionType,
  AppAndParams,
  INodeInfo,
  PidProcess,
} from '../../../domain';
import {
  AnalysisTarget,
  HpcPresetType,
  SpinnerBlurInfo,
  CollectionType,
  AnalysisType,
} from 'projects/sys/src-com/app/domain';
import { IHpcFormGroupValue, IHpcSchTaskInfo } from '../../domain';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { PartialObserver, Subscription } from 'rxjs';
import {
  MissionHpcDataService,
  MissionHpcFormService,
  MissionHpcImportService,
} from '../../serivices';
import { AxiosService } from '../../../../service/axios.service';
import { CustomValidatorsService } from '../../../../service';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { HttpService } from 'sys/src-com/app/service';
import { Cat } from 'hyper';

type INodeRankInfo = {
  id: number;
  nodeIp: string;
  rank: number;
  nickName: string;
};

@Component({
  selector: 'app-mission-hpc-create',
  templateUrl: './mission-hpc-create.component.html',
  styleUrls: ['./mission-hpc-create.component.scss'],
})
export class MissionHpcCreateComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('nodeConfigC') nodeConfigC: any;
  @Output() private handleNodeEmitIndex = new EventEmitter<any>();
  @Output() sendMissionKeep = new EventEmitter<any>();
  @Output() sendPretable = new EventEmitter<any>();
  @Output() closeTab = new EventEmitter<any>();
  @Output() sendAppOrPidDisable = new EventEmitter<boolean>();
  @Output() sendMpiStatus = new EventEmitter<boolean>();
  @Input() isModifySchedule: boolean;
  @Input() taskName: string;
  @Input() analysisMode: AnalysisTarget;
  @Input() actionType: TaskActionType;
  @Input() appAndParams: AppAndParams;
  @Input() pidProcess: PidProcess;

  /** 工程信息 */
  @Input() projectInfo: { name: string; id: number };
  @Input() restartAndEditId: number;
  /** Launch Application: 应用运行用户 开关 */
  @Input() switchState: boolean;
  /** Launch Application: 应用运行用户 用户名 */
  @Input() modeApplicationUser: string;
  /** Launch Application: 应用运行用户 密码 */
  @Input() modeApplicationPassWord: string;
  /** 进程名称和PID校验是否通过 */
  @Input() modePidValid: boolean;
  @Input() nodeConfigedData: any; // 配置节点返回数据
  public formDatas: any;
  formGroup: FormGroup;
  nodeSwitchStatus = false;
  public analysisType = AnalysisType;
  hpcPresetOption = HpcPresetType;
  i18n: any;
  labelWidth = '240px';
  analysisTarget = AnalysisTarget;
  public runUserData = {
    runUser: false,
    user_name: '',
    password: '',
  };
  collectionType = CollectionType;
  public runUserDataObj: {
    [key: string]: {
      user_name: string;
      password: string;
      runUser?: boolean;
    };
  } = {};
  public tempRunUserDataObj: {
    [key: string]: {
      user_name: string;
      password: string;
      runUser?: boolean;
    };
  } = {};
  public rankNodes = {
    columns: [] as TiTableColumns,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false,
      },
    },
    displayed: [] as Array<TiTableRowData>,
  };
  @Input() nodeInfo: INodeInfo[];
  private startNowSub: Subscription;
  private importSub: Subscription;
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public mpiDisabled = false;
  private initMpiStatus: boolean;

  /** 配置表 */
  formOption = {
    taskName: { display: false },
    appAndParams: { display: false },
    pidProcess: { display: false },
    selectNodeList: { display: false },
    duration: { display: true },
    preset: { display: true },
    openMpParams: { display: false },
    rank: { display: false },
    doOrder: { display: true },
    orderConfig: { display: false },
    taskStartNow: { display: true },
    mpiStatus: { display: false },
    MPIParams: { display: false },
    doNodeConfig: { display: false },
    nodeConfig: { display: false },
  };
  public runUservalid = true;

  public samplingDurationBlur: SpinnerBlurInfo;
  public rankBlur: SpinnerBlurInfo[];
  projectId = +sessionStorage.getItem('projectId');
  // 工程下节点信息
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;
  selectIpInfo: any[] = [];

  // 所允许的所有应用路径，如： /opt/;/home/
  public modeAppPathAllow = '';
  constructor(
    public http: HttpService,
    private fb: FormBuilder,
    private i18nService: I18nService,
    private dataService: MissionHpcDataService,
    private formService: MissionHpcFormService,
    private importService: MissionHpcImportService,
    public Axios: AxiosService,
    public customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = this.i18nService.I18n();
    this.formGroup = this.fb.group({
      taskName: [
        '',
        [
          TiValidators.required,
          TiValidators.regExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$'),
        ],
      ],
      appAndParams: [],
      pidProcess: [],
      nodeList: [],
      duration: [
        60,
        [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(3600),
        ],
      ],
      preset: [HpcPresetType.Summary], // HPC 分析模式
      mpiParams: [],
      openMpParams: [null, [this.customValidatorsService.checkOpenMPParam()]],
      selectNode: [],
      mpiStatus: [false],
      mpiEnvDir: [
        { value: '' },
        [TiValidators.required, this.customValidatorsService.checkFilePath()],
      ],
      hpc_mlt_rank_info: [],
      doNodeConfig: [false], // 是否进行节点参数配置
      doOrder: [false],
      orderConfig: [{ value: null, disabled: true }],
      taskStartNow: [true],
      switch: [false],
    });

    // 设置预约任务响应
    const doOrderObserver1: PartialObserver<boolean> = {
      next: (doOrder: boolean) => {
        this.formOption.orderConfig.display = doOrder;
        doOrder
          ? this.formGroup.get('orderConfig').enable()
          : this.formGroup.get('orderConfig').disable();
      },
    };
    const doOrderObserver2: PartialObserver<boolean> = {
      next: (doOrder: boolean) => {
        this.formOption.taskStartNow.display = !doOrder;
        doOrder
          ? this.formGroup.get('taskStartNow').disable()
          : this.switchState || this.nodeSwitchStatus
          ? this.formGroup.get('taskStartNow').disable()
          : this.formGroup.get('taskStartNow').enable();
      },
    };

    this.formGroup.get('doOrder').valueChanges.subscribe(doOrderObserver1);
    this.startNowSub = this.formGroup
      .get('doOrder')
      .valueChanges.subscribe(doOrderObserver2);

    // 设置 MPI 状态的响应
    const mpiStatusObserver: PartialObserver<boolean> = {
      next: (status: boolean) => {
        this.initMpiStatus = status;
        this.nodeSwitchStatus = false;
        this.sendMpiStatus.emit(status);
        this.formOption.MPIParams.display = status;
        if (status) {
          this.sendAppOrPidDisable.emit(false);
          this.sendMpiStatus.emit(status);
          this.formGroup.get('mpiEnvDir').enable();
          this.formGroup.get('openMpParams').disable();
          this.formGroup.get('nodeList').enable();
        } else {
          this.formGroup.get('mpiEnvDir').disable();
          this.formGroup.get('openMpParams').enable();
          if (Cat.isBool(this.nodeConfigC?.switchStatus)) {
            this.nodeConfigC.switchStatus = false;
          }
        }
        if (this.analysisMode === AnalysisTarget.PROFILE_SYSTEM) {
          this.formOption.openMpParams.display = false;
          this.formOption.doNodeConfig.display = false;
        } else if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
          this.formOption.openMpParams.display = !status;
          this.formOption.doNodeConfig.display =
            !status && this?.nodeInfo?.length > 1;
        } else if (this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS) {
          this.formOption.openMpParams.display = false;
          this.formOption.doNodeConfig.display = this?.nodeInfo?.length > 1;
        }
      },
    };
    this.formGroup.get('mpiStatus').valueChanges.subscribe(mpiStatusObserver);

    // 监听导入事件
    const importObserver: PartialObserver<any> = {
      next: (rawData: IHpcSchTaskInfo) => {
        const formData: IHpcFormGroupValue =
          this.formService.transForm(rawData);
        this.formGroup.patchValue(formData);

        this.selectIpInfo = rawData?.hpc_mlt_rank_info ?? rawData.nodeConfig;
        this.setNodeListParam(this.selectIpInfo, this.nodeList);

        if (
          this.analysisMode !== AnalysisTarget.LAUNCH_APPLICATION ||
          formData.mpiStatus
        ) {
          this.formOption.openMpParams.display = false;
        }
        // mpi模式配置rank
        if (rawData?.hpc_mlt_rank_info?.length > 0) {
          this.rankNodes.srcData.data.forEach((element: any, index: number) => {
            if (rawData.hpc_mlt_rank_info[index]) {
              element.num = rawData.hpc_mlt_rank_info[index].rank;
            }
          });
        }
        this.loadNodes(rawData);
      },
    };
    this.importSub = this.importService.importLister$.subscribe(importObserver);
    this.rankNodes.columns = [
      { title: this.i18n.common_term_node_ip },
      { title: this.i18n.nodeManagement.nodeName },
      { title: this.i18n.hpc.mission_create.rankNum },
    ];

    this.formGroup.get('nodeList').valueChanges.subscribe((value) => {
      const ids: number[] = value?.map((node: any) => node.id) ?? [];
      // 动态添加rank数量校验
      this.rankNodes.srcData.data = this.formatterRankNodes(this.nodeInfo, ids);
      const rankListInfo = this.setRankListInfo(this.rankNodes.srcData.data);
      this.formGroup.get('hpc_mlt_rank_info').patchValue(rankListInfo);
    });
  }

  ngOnInit() {
    this.getProjectNodes();
  }

  /**
   * 监控 Input 参数的变化, 并初始化 分析模式 和 分析对象
   * @param changes 变化的 Input 参数
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'appAndParams':
          this.formGroup.get('appAndParams').setValue(this.appAndParams);
          break;
        case 'pidProcess':
          this.formGroup.get('pidProcess').setValue(this.pidProcess);
          break;
        case 'taskName':
          this.formGroup.get('taskName').setValue(this.taskName);
          break;
        case 'analysisMode':
          {
            // 设置初始状态
            switch (this.analysisMode) {
              case AnalysisTarget.PROFILE_SYSTEM:
                this.formGroup.get('appAndParams').disable();
                this.formGroup.get('pidProcess').disable();
                this.modePidValid = true;
                this.formOption.doNodeConfig.display = false;
                this.nodeSwitchStatus = false;
                break;
              case AnalysisTarget.LAUNCH_APPLICATION:
                this.formGroup.get('appAndParams').enable();
                this.formGroup.get('pidProcess').disable();
                this.modePidValid = true;
                this.formOption.mpiStatus.display = true;
                this.formOption.openMpParams.display = true;
                this.formOption.doNodeConfig.display =
                  this?.nodeInfo?.length > 1;
                this.nodeSwitchStatus = false;
                break;
              case AnalysisTarget.ATTACH_TO_PROCESS:
                this.switchState = false;
                this.sendMpiStatus.emit(false);
                this.formGroup.get('appAndParams').disable();
                this.formGroup.get('pidProcess').enable();
                this.modePidValid = this.formGroup.get('pidProcess').valid;
                this.formOption.doNodeConfig.display =
                  this?.nodeInfo?.length > 1;
                this.nodeSwitchStatus = false;
                break;
              default:
                break;
            }
          }
          break;
        case 'switchState':
          if (changes.switchState.currentValue) {
            this.runUserData = {
              runUser: changes.switchState.currentValue,
              user_name: '',
              password: '',
            };
            // 立即执行开启 预约关闭
            this.formGroup.controls.taskStartNow.setValue(true);
            this.formGroup.controls.doOrder.setValue(false);
            this.formGroup.controls.doOrder.disable();
          } else {
            this.runUserData = {
              runUser: changes.switchState.currentValue,
              user_name: '',
              password: '',
            };
            this.formGroup.controls.doOrder.enable({ emitEvent: false });
            if (!this.switchState && !this.nodeSwitchStatus) {
              this.formGroup.controls.taskStartNow.enable();
            }
          }
          break;
        case 'modeApplicationUser':
          if (changes.modeApplicationUser.currentValue) {
            this.runUserData.user_name =
              changes.modeApplicationUser.currentValue;
          }
          break;
        case 'modeApplicationPassWord':
          if (changes.modeApplicationPassWord.currentValue) {
            this.runUserData.password =
              changes.modeApplicationPassWord.currentValue;
          }
          break;
        case 'nodeConfigedData':
          if (changes.nodeConfigedData.currentValue) {
            this.tempRunUserDataObj[this.nodeConfigedData.nodeIp] = {
              runUser: this.nodeConfigedData.runUser.runUser,
              user_name: this.nodeConfigedData.runUser.user,
              password: this.nodeConfigedData.runUser.password,
            };
          }
          this.runUserDataObj = JSON.parse(
            JSON.stringify(this.tempRunUserDataObj)
          );
          this.nodeSwitchStatus = false;
          let bool = false;
          Object.keys(this.runUserDataObj).map((key: string) => {
            if (
              this.runUserDataObj[key].runUser &&
              this.nodeConfigC?.switchStatus
            ) {
              bool = true;
            }
          });
          if (
            bool &&
            this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION &&
            !this.formGroup.get('mpiStatus').value
          ) {
            this.nodeSwitchStatus = bool;
            this.formGroup.controls.taskStartNow.setValue(true);
            this.formGroup.controls.doOrder.setValue(false);
            this.formGroup.controls.doOrder.disable();
          }
          break;
        case 'nodeInfo':
          if (changes.nodeInfo.currentValue) {
            this.initData();
          }
          break;
        default:
          break;
      }
    }
    if (this.switchState) {
      this.mpiDisabled = true;
      this.runUservalid = Boolean(
        this.modeApplicationUser && this.modeApplicationPassWord
      );
    } else {
      this.runUservalid = true;
    }
  }

  selectNodeDisable(event: boolean) {
    this.isSelectNodeDisabled = event;
  }

  /**
   * 获取工程下的所有节点
   */
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = res.data.nodeList;
        this.setNodeListParam(this.selectIpInfo, this.nodeList);
      }
      // 获取工程
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC') {
        this.formOption.selectNodeList.display = true;
        this.formGroup.get('nodeList').enable();
      } else {
        this.formOption.selectNodeList.display = false;
        this.formGroup.get('nodeList').disable();
      }
      if (this.initMpiStatus) {
        this.formGroup.get('nodeList').disable();
      }
    });
  }

  /**
   * 初始化或导入数据时给表单nodeList赋值
   * @param selectIpInfo 选中的节点的信息
   * @param allNodeList 所有节点的信息
   */
  setNodeListParam(selectIpInfo: any[], allNodeList: any[]){
    if (allNodeList.length) {
        let nodeList = [];
        const isNotCreat = TaskActionType.CREATE !== this.actionType || this.isModifySchedule;
        nodeList = selectIpInfo.length && isNotCreat
            ? selectIpInfo.map((item: any) => {
                return allNodeList.filter(
                (nodeItem: any) => nodeItem?.nodeIp === item?.nodeIp || nodeItem?.nodeIp === item?.IP
                )[0];
            })
            : allNodeList;
        this.formGroup.get('nodeList').patchValue(nodeList);
    }
  }

  async initData() {
    // 获取 应用路径
    this.Axios.axios.get('config/system/').then(({ data }: any) => {
      this.modeAppPathAllow =
        data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
    });
    // 设置“动作类型”的相关
    switch (this.actionType) {
      case TaskActionType.CREATE:
        this.formGroup.controls.mpiEnvDir.setValue('');
        this.formGroup.get('mpiEnvDir').disable();
        this.formGroup.controls.openMpParams.setValue('OMP_NUM_THREADS=32');
        break;
      case TaskActionType.EDIT:
        this.dataService
          .pullData(this.analysisMode, this.restartAndEditId)
          .then((rawData) => {
            if (this.analysisMode === AnalysisTarget.PROFILE_SYSTEM) {
              this.formGroup.get('mpiEnvDir').disable();
            }
            if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
              this.formOption.doNodeConfig.display = this?.nodeInfo?.length > 1;
            }
            this.loadNodes(rawData);
            const formData: IHpcFormGroupValue =
              this.formService.transForm(rawData);
            this.formGroup.patchValue(formData);

            this.selectIpInfo = rawData?.hpc_mlt_rank_info ?? rawData.nodeConfig;
            this.setNodeListParam(this.selectIpInfo, this.nodeList);
          });
        break;
      case TaskActionType.RESTART:
        this.formOption.taskStartNow.display = false;
        this.startNowSub.unsubscribe();
        this.dataService
          .pullData(this.analysisMode, this.restartAndEditId)
          .then((rawData) => {
            if (this.analysisMode === AnalysisTarget.PROFILE_SYSTEM) {
              this.formGroup.get('mpiEnvDir').disable();
            }
            if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
              this.formOption.doNodeConfig.display = this?.nodeInfo?.length > 1;
            }
            this.loadNodes(rawData);
            const formData: IHpcFormGroupValue =
              this.formService.transForm(rawData);
            this.formGroup.patchValue(formData);

            this.selectIpInfo = rawData?.hpc_mlt_rank_info ?? rawData.nodeConfig;
            this.setNodeListParam(this.selectIpInfo, this.nodeList);
            // 格式化数据
            if (this.formGroup.get('mpiStatus').value) {
              const newNodeInfo: INodeInfo[] = rawData.hpc_mlt_rank_info.map(
                (item: TiTableColumns) => {
                  let temp: any = {};
                  this.nodeInfo.forEach((node: INodeInfo) => {
                    if (item.IP === node.nodeIp) {
                      temp = {
                        nickName: node.nickName,
                        nodeId: node.nodeId,
                        nodeIp: node.nodeIp,
                        nodeStatus: node.nodeStatus,
                        taskParam: { status: node.taskParam.status },
                        prop: 'rankNode-' + node.nodeIp,
                        label: node.nodeIp,
                        num: item.rank,
                      };
                      return;
                    }
                  });
                  return temp;
                }
              );
              this.rankNodes.srcData.data =
                this.formatterRankNodes(newNodeInfo);
              this.formGroup.controls.selectNode.setValue(rawData.master_ip);
            } else {
              this.rankNodes.srcData.data = this.formatterRankNodes(
                this.nodeInfo
              );
              this.formGroup
                .get('selectNode')
                .setValue(this.rankNodes.srcData.data[0].nodeIp);
            }
            this.setSpinnerBlur();
          });
        break;
    }
    if (TaskActionType.RESTART !== this.actionType) {
      // 动态添加rank数量校验
      this.rankNodes.srcData.data = this.formatterRankNodes(this.nodeInfo);
      // 选择运行mpirun的节点默认值
      this.formGroup
        .get('selectNode')
        .setValue(this.rankNodes.srcData.data[0].nodeIp);
      this.setSpinnerBlur();
    }
    const rankListInfo = this.setRankListInfo(this.rankNodes.srcData.data);
    this.formGroup.get('hpc_mlt_rank_info').patchValue(rankListInfo);
  }

  ngOnDestroy() {
    this.importSub.unsubscribe();
  }

  onCreate() {
    // 获取被选择的节点
    const selectNodes = this.getSelectedNodes(
      this.nodeInfo,
      this.formGroup.get('nodeList').value
    );

    const params = this.formService.transData(
      this.analysisMode,
      this.formGroup,
      this.projectInfo.name,
      selectNodes ?? []
    );
    // 打开配置节点, 同步配置参数
    if (this.nodeConfigC?.switchStatus) {
      params.switch = true;
      params.nodeConfig = this.nodeConfigC?.getNodesConfigParams(params);
    }
    // mpi无多节点配置
    if (params.mpi_status) {
      const node = selectNodes.find((item) => item.nodeIp === params.master_ip);
      params.nodeConfig = params.nodeConfig.filter((item) => {
        return item.nodeId === node.nodeId;
      });
    }
    selectNodes.forEach((node: INodeInfo) => {
      this.tempRunUserDataObj[node.nodeIp] = {
        user_name: this.runUserData.user_name || 'launcher',
        password: this.runUserData.password,
      };
    });
    this.runUserDataObj = JSON.parse(JSON.stringify(this.tempRunUserDataObj));
    this.dataService.pushData(
      this.actionType,
      this.formGroup,
      params,
      this.projectInfo,
      this.sendPretable,
      this.closeTab,
      this.restartAndEditId,
      this.tempRunUserDataObj
    );
  }

  onClose() {
    this.closeTab.emit({});
  }

  onSaveTemplate() {
    // 获取被选择的节点
    const selectNodes = this.getSelectedNodes(
      this.nodeInfo,
      this.formGroup.get('nodeList').value
    );

    const params = this.formService.transData(
      this.analysisMode,
      this.formGroup,
      this.projectInfo.name,
      selectNodes
    );
    if (this.nodeConfigC?.switchStatus) {
      params.switch = true;
      params.nodeConfig = this.nodeConfigC?.getNodesConfigParams(params);
    }
    if (params.mpi_status) {
      const node = selectNodes.find((item) => item.nodeIp === params.master_ip);
      params.nodeConfig = params.nodeConfig.filter((item) => {
        return item.nodeId === node.nodeId;
      });
    }
    this.sendMissionKeep.emit(params);
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.samplingDurationBlur = {
      control: this.formGroup.controls.duration,
      min: 1,
      max: 3600,
    };
    this.rankBlur = this.rankNodes.srcData.data.map((node: any) => {
      const item = {
        control: this.formGroup.controls[node.prop],
        min: 1,
        max: 128,
      };
      return item;
    });
  }

  /**
   * MPI命令所在目录输入检测
   */
  public mpiEnvDirValid(): ValidatorFn {
    const regOne = this.customValidatorsService.applicationPathReg;
    const regTwo = /(\/{2,})/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          name: { tiErrorMessage: this.i18n.mission_create.modeAppPath },
        };
      }
      // 判断二：正则验证
      // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
      if (this.customValidatorsService.pathMatch(control.value)) {
        return {
          name: {
            tiErrorMessage: this.i18n.mission_create.modeAppWarn,
          },
        };
      }
      // 验证三：是否为系统配置指定路径下应用判断
      let isIncluded = false;
      const allowPathList: string[] = this.modeAppPathAllow.split(';');
      for (const allowPath of allowPathList) {
        if (
          control.value.includes(allowPath) &&
          control.value.indexOf(allowPath) === 0
        ) {
          isIncluded = true;
        }
      }
      if (!isIncluded) {
        return {
          name: {
            tiErrorMessage: (
              this.i18n.mission_create.modeAppPathInvalid as string
            ).replace(
              '${path}',
              this.Axios.getPathString(this.modeAppPathAllow)
            ),
          },
        };
      }
      return null;
    };
  }
  /**
   *   传递节点参数
   */
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }
  /**
   * 当点击开启参数配置时
   * @param taskName 名称
   */
  public onControlNode(taskName: any) {
    if (taskName) {
      this.sendAppOrPidDisable.emit(true);
      this.formGroup.get('openMpParams').disable();
      this.formDatas = this.formService.transData(
        this.analysisMode,
        this.formGroup,
        this.projectInfo.name,
        this.nodeInfo
      );
    } else {
      this.sendAppOrPidDisable.emit(false);
      this.formGroup.get('openMpParams').enable();
      this.nodeSwitchStatus = false;
      if (!this.nodeConfigC?.switchStatus && !this.switchState) {
        this.formGroup.get('doOrder').enable();
      }
    }
  }

  /**
   * 格式化rankNodes.srcData.data数据
   */
  private formatterRankNodes(
    nodeInfo: INodeInfo[],
    nodeIds?: number[]
  ): TiTableRowData[] {
    if (nodeInfo && nodeInfo.length) {
      const nodeList = nodeInfo.map((node: INodeInfo) => {
        const item: any = node;
        item.num = node.num || 4;
        item.label = node.nickName;
        item.prop = 'rankNode-' + node.nodeIp;
        const nodeControl = new FormControl(
          { value: item.num, disabled: false },
          [
            TiValidators.required,
            TiValidators.minValue(1),
            TiValidators.maxValue(128),
          ]
        );
        this.formGroup.addControl(item.prop, nodeControl);
        return item;
      });
      return nodeIds
        ? nodeList.filter((node) => {
            return nodeIds.includes(node.nodeId);
          })
        : nodeList;
    } else {
      return [];
    }
  }

  /**
   * rank 表格数据
   * @param nodeInfo rankNodes.srcData.data
   * @returns 表格数据
   */
  private setRankListInfo(
    nodeInfo: TiTableRowData[],
    nodeIds?: number[]
  ): INodeRankInfo[] {
    if (nodeInfo && nodeInfo.length) {
      const nodeList = nodeInfo.map((node: INodeInfo) => {
        return {
          id: node.nodeId,
          nodeIp: node.nodeIp,
          rank: node.num || 4,
          nickName: node.nickName,
        };
      });
      return nodeIds
        ? nodeList.filter((node) => {
            return nodeIds.includes(node.id);
          })
        : nodeList;
    } else {
      return [];
    }
  }

  /**
   * 载入、清理多节点数据
   */
  loadNodes(rawData: IHpcSchTaskInfo) {
    // 设置个定时器异步下，否则配置节点参数获取的formData 没有获取到页面参数
    if (rawData.switch) {
      setTimeout(() => this.nodeConfigC?.importTemp(rawData.nodeConfig));
    } else {
      setTimeout(() => this.nodeConfigC?.clear());
    }
  }

  /**
   * 选出被选择的节点
   * @param allNodes 所有节点
   * @param selectedNodes 被选择的节点
   * @returns 被选择的节点的信息
   */
  private getSelectedNodes(
    allNodes: INodeInfo[],
    selectedNodes: { id: number }[]
  ): INodeInfo[] {
    const selectNodeIds: number[] =
      selectedNodes?.map((node: any) => node.id) ?? [];
    const selectNodes = selectNodeIds.map((id) => {
      return allNodes?.find?.((node) => node.nodeId === id);
    });

    return selectNodes || [];
  }
}
