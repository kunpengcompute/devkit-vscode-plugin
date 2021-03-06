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

  /** ???????????? */
  @Input() projectInfo: { name: string; id: number };
  @Input() restartAndEditId: number;
  /** Launch Application: ?????????????????? ?????? */
  @Input() switchState: boolean;
  /** Launch Application: ?????????????????? ????????? */
  @Input() modeApplicationUser: string;
  /** Launch Application: ?????????????????? ?????? */
  @Input() modeApplicationPassWord: string;
  /** ???????????????PID?????????????????? */
  @Input() modePidValid: boolean;
  @Input() nodeConfigedData: any; // ????????????????????????
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

  /** ????????? */
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
  // ?????????????????????
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;
  selectIpInfo: any[] = [];

  // ??????????????????????????????????????? /opt/;/home/
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
      preset: [HpcPresetType.Summary], // HPC ????????????
      mpiParams: [],
      openMpParams: [null, [this.customValidatorsService.checkOpenMPParam()]],
      selectNode: [],
      mpiStatus: [false],
      mpiEnvDir: [
        { value: '' },
        [TiValidators.required, this.customValidatorsService.checkFilePath()],
      ],
      hpc_mlt_rank_info: [],
      doNodeConfig: [false], // ??????????????????????????????
      doOrder: [false],
      orderConfig: [{ value: null, disabled: true }],
      taskStartNow: [true],
      switch: [false],
    });

    // ????????????????????????
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

    // ?????? MPI ???????????????
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

    // ??????????????????
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
        // mpi????????????rank
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
      // ????????????rank????????????
      this.rankNodes.srcData.data = this.formatterRankNodes(this.nodeInfo, ids);
      const rankListInfo = this.setRankListInfo(this.rankNodes.srcData.data);
      this.formGroup.get('hpc_mlt_rank_info').patchValue(rankListInfo);
    });
  }

  ngOnInit() {
    this.getProjectNodes();
  }

  /**
   * ?????? Input ???????????????, ???????????? ???????????? ??? ????????????
   * @param changes ????????? Input ??????
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
            // ??????????????????
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
            // ?????????????????? ????????????
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
   * ??????????????????????????????
   */
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // ??????????????????????????????
        this.nodeList = res.data.nodeList;
        this.setNodeListParam(this.selectIpInfo, this.nodeList);
      }
      // ????????????
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
   * ????????????????????????????????????nodeList??????
   * @param selectIpInfo ????????????????????????
   * @param allNodeList ?????????????????????
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
    // ?????? ????????????
    this.Axios.axios.get('config/system/').then(({ data }: any) => {
      this.modeAppPathAllow =
        data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
    });
    // ?????????????????????????????????
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
            // ???????????????
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
      // ????????????rank????????????
      this.rankNodes.srcData.data = this.formatterRankNodes(this.nodeInfo);
      // ????????????mpirun??????????????????
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
    // ????????????????????????
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
    // ??????????????????, ??????????????????
    if (this.nodeConfigC?.switchStatus) {
      params.switch = true;
      params.nodeConfig = this.nodeConfigC?.getNodesConfigParams(params);
    }
    // mpi??????????????????
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
    // ????????????????????????
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
   * ????????????????????????
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
   * MPI??????????????????????????????
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
      // ????????????????????????
      // ?????????????????????1???????????? /; 2??????????????????^ ` | ; & $ > < \ ! ??????????????????; 4???????????? / ??????; 3??????????????????//
      if (this.customValidatorsService.pathMatch(control.value)) {
        return {
          name: {
            tiErrorMessage: this.i18n.mission_create.modeAppWarn,
          },
        };
      }
      // ????????????????????????????????????????????????????????????
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
   *   ??????????????????
   */
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }
  /**
   * ??????????????????????????????
   * @param taskName ??????
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
   * ?????????rankNodes.srcData.data??????
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
   * rank ????????????
   * @param nodeInfo rankNodes.srcData.data
   * @returns ????????????
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
   * ??????????????????????????????
   */
  loadNodes(rawData: IHpcSchTaskInfo) {
    // ???????????????????????????????????????????????????????????????formData ???????????????????????????
    if (rawData.switch) {
      setTimeout(() => this.nodeConfigC?.importTemp(rawData.nodeConfig));
    } else {
      setTimeout(() => this.nodeConfigC?.clear());
    }
  }

  /**
   * ????????????????????????
   * @param allNodes ????????????
   * @param selectedNodes ??????????????????
   * @returns ???????????????????????????
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
