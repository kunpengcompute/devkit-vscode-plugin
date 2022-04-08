import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import {
  TiValidators,
  TiValidationConfig,
  TiModalService,
  TiMessageService,
} from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { VscodeService, HTTP_STATUS } from '../../service/vscode.service';
import {
  AnalysisTarget,
  SpinnerBlurInfo,
} from 'projects/sys/src-ide/app/domain';
import { RunUserDataObj } from './../mission-domain';
import { CustomValidatorsService, HttpService } from '../../service';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { Cat } from 'hyper';
import { PROJECT_TYPE } from '../../service/axios.service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';
enum HpcPresetType {
  Summary = 'default',
  Topdown = 'top-down',
  InstrucMix = 'instruction-mix',
}
@Component({
  selector: 'app-mission-hpc',
  templateUrl: './mission-hpc.component.html',
  styleUrls: ['./mission-hpc.component.scss'],
})
export class MissionHpcComponent implements OnInit, OnChanges {
  public formOption = {
    selectNodeList: { display: false },
    doOrder: { display: true },
    orderConfig: { display: false },
    doNodeConfig: { display: false },
    nodeConfig: { display: false },
    taskStartNow: { display: true },
  };
  public isDisableExecuteImmediately = true; // 是否禁用立即执行
  @ViewChild('nodeConfigM', { static: false }) nodeConfigM: any;
  @ViewChild('preSwitchMicarch', { static: false }) preSwitchMicarch: any;
  @ViewChild('createMicarchConfirmModal', { static: false })
  createMicarchConfirmModal: any;
  @ViewChild('preSwitchChange', { static: false }) preSwitchChange: any;
  @Output() private sendMissionKeep = new EventEmitter<any>();
  @Output() private sendPretable = new EventEmitter<any>();
  @Output() private closeTab = new EventEmitter<any>();
  @Output() private handleNodeEmitIndex = new EventEmitter<any>();
  @Output() sendcollectionType = new EventEmitter<any>();
  @Output() sendAppOrPidDisable = new EventEmitter<boolean>();
  @Output() sendAppOrPidDisableM = new EventEmitter<boolean>();
  @Output() private handlePidTidDisable = new EventEmitter<any>();

  @Input()
  set scenes(val: PROJECT_TYPE){
      if (null == val){
          return ;
      }
      this.scenesStash = val;
      PROJECT_TYPE.TYPE_HPC === val
          ? this.micarchCurrntForm.get('nodeList').enable()
          : this.micarchCurrntForm.get('nodeList').disable();
  }
  get scenes(){
      return this.scenesStash;
  }
  @Input() labelWidth: string;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskNameValid: boolean;
  @Input() typeId: number;
  @Input() modeApplication: string;
  @Input() modeAppParams: string;
  @Input() switchState: boolean;
  @Input() modeApplicationUser: string;
  @Input() modeApplicationPassWord: string;
  @Input() modeAppValid: boolean;
  @Input() modePidValid: boolean;
  @Input() modeAppRunUserValid = true;
  @Input() projectId: number;
  @Input() restartAndEditId: number;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Input() isModifySchedule: boolean;
  @Input() isRestart: boolean;
  @Input() panelId: any;
  public showNodeConfig: boolean;
  /** Attach to Process: 进程名 */
  @Input() modeProcess: string;
  @Input() modePid: string;
  @Input() nodeInfo: any[];
  @Input() modeAppPathAllow: string;

  analysisScene = PROJECT_TYPE;
  scenesStash: PROJECT_TYPE;
  public isLaunch: boolean;
  public isAttach: boolean;
  public isProfile = true;
  public isEdit: boolean;
  public i18n: any;
  public micarchItems: any = {};
  public launchItemsMicarchForm: FormGroup;
  public profileItemsMicarchForm: FormGroup;
  public attachItemsMicarchForm: FormGroup;
  public micarchCurrntForm: FormGroup;
  public startCheckMicarch: any = {};
  public processItems: any = {};
  public advanceParams = false;
  // 表单验证部分
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public appAndPidValid = false;
  public valid = false;
  public formDatas: any;
  public keepData: any; // 保存模板
  public typeLDesc = '';

  // 修改预约任务 接收从预约传来的值
  public editScheduleTask = false; // 判断是否是修改
  public scheduleTaskId: any; // 保存修改的预约任务ID

  public samplingDurationBlur: SpinnerBlurInfo;
  public rankBlur: SpinnerBlurInfo;
  public rankBlurList: SpinnerBlurInfo[] = [];

  public runUserData = {
    runUser: false,
    user: '',
    password: '',
  };
  public runUserDataObj: RunUserDataObj = {};
  public startCheckSys: any = {}; // 立即启动
  private userMessage: {
    [nodeIp: string]: { user_name: string; password: string };
  } = {};
  public nodeCfg: any = [];
  public rTypeOptions: Array<any> = [
    {
      label: 'Launch Application',
      id: 'launch',
    },
    {
      label: 'Profile System',
      id: 'profile',
    },
    {
      label: 'Attach to Process', // 2月版本暂时隐藏
      id: 'attach',
    },
  ];
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
  public rTypeSelected: any = this.rTypeOptions[0];
  public hpcTaskInfo: any;
  public collectionType = false;
  public isIntellij = ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner';
  // 工程下节点信息
  nodeList: any[] = [];
  isSelectNodeDisabled: boolean;
  nodeListChange: any = null;
  selectIpInfo: any[] = [];
  runUservalid = true;
  isLoading = true;

  constructor(
    public I18n: I18nService,
    public fb: FormBuilder,
    public scheduleTaskServer: ScheduleTaskService,
    private tiModal: TiModalService,
    private tiMessage: TiMessageService,
    private zone: NgZone,
    public vscodeService: VscodeService,
    private changeDetectorRef: ChangeDetectorRef,
    public customValidatorsService: CustomValidatorsService,
    private http: HttpService,
    private projectNodeListService: ProjectNodeListService
  ) {
    this.i18n = I18n.I18n();
    this.rankNodes.columns = [
      { title: this.i18n.common_term_node_ip },
      { title: this.i18n.nodeConfig.nodeName },
      { title: this.i18n.hpc.mission_create.rankNum },
    ];

    // micarch校验
    this.launchItemsMicarchForm = this.fb.group({
      nodeList: [],
      analysis: [HpcPresetType.Summary], // HPC 分析模式
      collectionTypes: new FormControl(false, [TiValidators.required]),
      duration: new FormControl(60, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(3600),
      ]),
      mpi_env_dir: [
        '',
        [this.customValidatorsService.checkFilePath(), TiValidators.required],
      ],
      doNodeConfig: [false],
      selectNode: new FormControl('', [TiValidators.required]),
      openMpParams: [
        'OMP_NUM_THREADS=32',
        [this.customValidatorsService.checkOpenMPParam()],
      ],
      hpc_mlt_rank_info: [],
      mpiParams: [],
    });
    this.profileItemsMicarchForm = this.fb.group({
      nodeList: [],
      analysis: [HpcPresetType.Summary], // HPC 分析模式
      duration: new FormControl(60, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(3600),
      ]),
    });
    this.launchItemsMicarchForm.controls.mpi_env_dir.disable();
    this.launchItemsMicarchForm.controls.selectNode.disable();
    this.micarchCurrntForm = this.profileItemsMicarchForm;

    this.micarchItems = {
      analysis: {
        required: false,
        label: this.i18n.mission_modal.hpc.label,
        options: [
          { id: 'default', text: this.i18n.mission_modal.hpc.all },
          { id: 'instruction-mix', text: this.i18n.mission_modal.hpc.orders },
          { id: 'top-down', text: this.i18n.mission_modal.hpc.top_down },
        ],
        value: 'default',
      },
      collectionTypes: {
        required: false,
        disabled: false,
        label: this.i18n.mission_modal.hpc.collectionType,
        options: [
          { status: false, text: this.i18n.mission_modal.hpc.openMp },
          { status: true, text: this.i18n.mission_modal.hpc.mpi },
        ],
      },
      duration: {
        required: true,
        label: this.i18n.mission_modal.hpc.duration,
        step: 60,
        min: 1,
        max: 3600,
        placeholder: '1~3600',
        format: 'N0',
      },
      rank: {
        required: true,
        label: this.i18n.mission_modal.hpc.duration,
        step: 4,
        min: 1,
        max: 128,
        format: 'N0',
      },
      mpi_status: {
        required: false,
        value: false,
      },
      mpi_env_dir: {
        required: true,
        value: '',
      },
    };
    this.startCheckMicarch = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    this.nodeListChangeSub();
  }
  /**
   * ngOnChanges
   * @param changes changes
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'switchState':
          if (changes.switchState.currentValue) {
            this.runUserData.runUser = true;
            // 指定用户，用户名由用户输入
            this.runUserData.user = '';
            this.startCheckMicarch.checked = true;
          } else {
            this.runUserData.runUser = false;
            // 未指定用户，用户名默认为 launcher
            this.runUserData.user = 'launcher';
          }
          break;
        case 'modeApplicationUser':
          this.runUserData.user =
            changes.modeApplicationUser.currentValue || 'launcher';
          break;
        case 'modeApplicationPassWord':
          this.runUserData.password =
            changes.modeApplicationPassWord.currentValue;
          break;
        case 'typeId':
          this.appAndPidValid = false;
          this.clear();
          if (this.nodeConfigM) {
            this.nodeConfigM.switchStatus = false;
            this.sendAppOrPidDisable.emit(false);
          }
          break;
        default:
          break;
      }
    }
    if (this.switchState) {
      this.runUservalid = Boolean(
        this.modeApplicationUser && this.modeApplicationPassWord
      );
    } else {
      this.runUservalid = true;
    }

    switch (changes.typeId ? changes.typeId.currentValue : this.typeId) {
      case 0:
        this.isProfile = true;
        this.appAndPidValid = true;
        this.isLaunch = false;
        this.isAttach = false;
        this.micarchCurrntForm = this.profileItemsMicarchForm;
        this.nodeListChangeSub();
        this.rTypeSelected = this.rTypeOptions[1];
        break;
      case 1:
        this.isProfile = false;
        this.isLaunch = true;
        this.isAttach = false;
        this.appAndPidValid = this.modeAppValid;
        this.micarchCurrntForm = this.launchItemsMicarchForm;
        this.nodeListChangeSub();
        this.rTypeSelected = this.rTypeOptions[0];
        break;
      case 2:
        this.isProfile = false;
        this.isLaunch = false;
        this.isAttach = true;
        this.appAndPidValid = this.modePidValid;
        this.micarchCurrntForm = this.profileItemsMicarchForm;
        this.nodeListChangeSub();
        this.rTypeSelected = this.rTypeOptions[2];
        break;
      default:
        break;
    }
    this.setSpinnerBlur();
  }

  /**
   * 初始化
   */
  async ngOnInit() {
    try{
      const resp = await this.projectNodeListService.getProjectNodes(this.projectId);
      this.isLoading = false;
      if (resp?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = resp.data.nodeList;
        this.setNodeListParam(this.selectIpInfo, this.nodeList);
      }
    } catch (err) {
      this.isLoading = false;
    }

    const params = this.getFormDatas();

    this.nodeCfg = await this.getNodeConfigDatas(params);
    this.rankNodes.srcData.data = this.nodeCfg;

    const newNodeCfg = this.nodeCfg.map((item: any) => {
      return {
        id: item.nodeId,
        nodeIp: item.nodeIp,
        rank: 4,
        nickName: item.nickName,
      };
    });
    this.launchItemsMicarchForm.get('hpc_mlt_rank_info').patchValue(newNodeCfg);
    this.launchItemsMicarchForm.get('selectNode').setValue(
      this.rankNodes.srcData.data[0].nodeIp
    );
    this.rankNodes.columns = [
      { title: this.i18n.common_term_node_ip },
      { title: this.i18n.nodeConfig.nodeName },
      { title: this.i18n.hpc.mission_create.rankNum },
    ];
    this.setSpinnerBlur();
  }
  nodeListChangeSub() {
    if (this.nodeListChange) {
      this.nodeListChange.unsubscribe();
    }
    this.nodeListChange = this.micarchCurrntForm
      .get('nodeList')
      .valueChanges.subscribe((nodeList) => {
        if (this.micarchItems.mpi_status.value) {
          const rankInfo = nodeList.map((nodeItem: any) => {
            return {
              id: nodeItem.id,
              nodeIp: nodeItem.nodeIp,
              rank: 4,
              nickName: nodeItem.nickName,
            };
          });
          this.micarchCurrntForm.get('hpc_mlt_rank_info').setValue(rankInfo);
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
        const isNotCreat = this.isEdit || this.isRestart || this.isModifySchedule;
        nodeList = selectIpInfo.length && isNotCreat
            ? selectIpInfo.map((item: any) => {
                return allNodeList.filter(
                (nodeItem: any) => nodeItem?.nodeIp === item?.nodeIp || nodeItem?.nodeIp === item?.IP
                )[0];
            })
            : allNodeList;
        this.micarchCurrntForm.get('nodeList').patchValue(nodeList);
    }
}
  selectNodeDisable(event: boolean) {
    this.isSelectNodeDisabled = event;
  }

  /**
   * 立即启动
   */
  public startDataSamplingTask(
    projectname: string,
    taskname: string,
    id: string,
    params: any
  ) {
    this.vscodeService.get(
      {
        url:
          '/res-status/?type=disk_space&project-name=' +
          encodeURIComponent(projectname) +
          '&task-name=' +
          encodeURIComponent(taskname),
      },
      (data: any) => {
        const self = this;
        const option = {
          url: '/tasks/' + id + '/status/',
          params: { status: 'running', user_message: this.userMessage },
        };
        this.vscodeService.put(option, (res: any) => {
          const backData = res.data;
          self.closeTab.emit({
            title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
            id: backData.id,
            nodeid: params.nodeConfig[0].nodeId,
            taskId: backData.id,
            taskType: params['analysis-type'],
            status: backData['task-status'],
            projectName: self.projectName,
          });
        });
      }
    );
  }
  /**
   * 节点信息
   */
  async getNodeConfigDatas(params: any) {
    const url = `/projects/${this.projectId}/info/`;
    return new Promise((resolve) => {
      const data: Array<TiTableRowData> = [];
      this.vscodeService.get({ url }, (res: any) => {
        this.hpcTaskInfo = res;
        const nodeList =
        PROJECT_TYPE.TYPE_HPC === this.scenes
            ? this.micarchCurrntForm.get('nodeList').value
            : res.data.nodeList;
        nodeList.forEach((item: any) => {
          this.runUserDataObj[item.nodeIp] = {
            user_name: this.runUserData.user || '',
            password: this.runUserData.password,
          };
          data.push({
            nodeId: item.id,
            nodeIp: item.nodeIp || item.node,
            nickName: item.nickName,
            task_param: Object.assign({}, { status: false }, params),
          });
        });
        resolve(data);
      });
    });
  }

  // 获取数据
  public getFormDatas() {
    const form = this.isLaunch
      ? this.launchItemsMicarchForm
      : this.profileItemsMicarchForm;
    const self = this;
    const ctrls = form?.controls;
    const params: any = {
      'analysis-type': 'hpc_analysis',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.rTypeSelected.label,
      duration: ctrls?.duration.value,
      preset: ctrls?.analysis.value,
      switch: false,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params.mpi_status = ctrls?.collectionTypes.value;
      if (ctrls?.collectionTypes.value) {
        params.mpi_env_dir = ctrls?.mpi_env_dir.value || '';
        params.master_ip = ctrls?.selectNode.value;
        params.hpc_mlt_rank_info = this.launchItemsMicarchForm
          .get('hpc_mlt_rank_info')
          .value.map((item: any) => {
            return {
              IP: item.nodeIp,
              rank: item.rank,
            };
          });
      } else {
        params.open_mp_param = ctrls?.openMpParams.value;
      }
    }
    if (this.isAttach) {
      params.process_name = this.modeProcess;
      params.targetPid = this.modePid || '';
    }

    this.formDatas = params;
    return params;
  }

  // 当点击开启参数配置时
  public onControlNode(taskName: any) {
    if (taskName) {
      // 开启
      this.getFormDatas();
      let target = '';
      if (this.formDatas.hasOwnProperty('analysis-target')) {
        target = this.formDatas['analysis-target'];
      } else {
        return;
      }
      const type = this.formDatas['analysis-type'];
      let firstName = '';
      switch (type) {
        case 'C/C++ Program':
          firstName = 'c_';
          break;
        case 'java-mixed-mode':
          firstName = 'j_';
          break;
        case 'process-thread-analysis':
          firstName = 'p_';
          break;
        case 'system_lock':
          firstName = 'l_';
          break;
        case 'resource_schedule':
          firstName = 'r_';
          break;
        default:
          break;
      }
      this.onDisableForm(taskName);
    } else {
      // 关闭
      this.onDisableForm('');
    }
  }
  /**
   * 禁用
   */
  public onDisableForm(taskName: any) {
    if (taskName === 'hpcOpenMP') {
      if (this.isLaunch) {
        this.sendAppOrPidDisable.emit(true);
      }
      if (this.isAttach) {
        this.handlePidTidDisable.emit(true);
      }
      this.sendAppOrPidDisableM.emit(true);
      this.launchItemsMicarchForm.get('openMpParams').disable();
    } else {
      this.sendAppOrPidDisable.emit(false);
      this.handlePidTidDisable.emit(false);
      this.sendAppOrPidDisableM.emit(false);
      this.launchItemsMicarchForm.get('openMpParams').enable();
    }
  }
  /**
   * 创建任务
   */
  async createMicarchkAnalysis(isEdit: any) {
    const context = this;
    const params = this.getFormDatas();
    if (this.nodeConfigM?.switchStatus) {
      params.switch = true;
      const nodeData: any = this.nodeConfigM.getNodesConfigParams(
        {}
      ).nodeConfig;
      const runUserData = this.nodeConfigM.getNodesConfigParams({}).runUserData;
      this.runUserDataObj = this.dealRunUserDataObj(runUserData);
      if (this.isLaunch) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
      if (this.isProfile) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.duration = params.duration;
          return item;
        });
      }
      if (this.isAttach) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.duration = params.duration;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
    } else {
      params.switch = false;
      params.nodeConfig = await this.getNodeConfigDatas(params);
    }
    if (params.mpi_status) {
      params.nodeConfig = params.nodeConfig.filter((nodeItem: any) => {
        return nodeItem.nodeIp === params.master_ip;
      });
    }
    // 重启
    if (this.isRestart) {
      this.restartFunction(params);
      return;
    }
    //  预约任务
    if (this.preSwitchMicarch.switchState) {
      this.startCheckMicarch.checked = false;
      const flag = await this.createPreMission(
        this.preSwitchMicarch,
        params,
        'post'
      );
      if (flag) {
        this.startCheckMicarch.checked = true;
      }
    } else {
      if (isEdit) {
        const option = {
          url: '/tasks/' + this.restartAndEditId + '/',
          params,
        };
        context.vscodeService.put(option, (data: any) => {
          // 修改任务提示
          if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            if (data.code === 'SysPerf.Success') {
              this.vscodeService.showTuningInfo(
                data.message,
                'info',
                'modifyTask'
              );
              if (this.startCheckMicarch.checked) {
                this.startTaskNow(
                  this.projectName,
                  this.taskName,
                  data.data.id,
                  params
                );
              } else {
                const message = {
                  cmd: 'openSomeNode',
                  data: {
                    taskId: data.data.id,
                    projectName: this.projectName,
                  },
                };
                this.vscodeService.showTuningInfo(
                  'cancel',
                  'info',
                  'modifyTask'
                );
                this.vscodeService.postMessage(message, null);
              }
            } else {
              this.vscodeService.showTuningInfo(
                data.message,
                'error',
                'modifyTask'
              );
            }
          } else {
            if (data.status) {
              context.vscodeService.showInfoBox(data.message, 'error');
            } else {
              setTimeout(() => {
                this.vscodeService.showInfoBox(
                  this.I18n.I18nReplace(
                    this.i18n.plugins_term_task_modify_success,
                    { 0: this.taskName }
                  ),
                  'info'
                );
              }, 3500);
              if (context.startCheckMicarch.checked) {
                context.startTaskNow(
                  context.projectName,
                  context.taskName,
                  data.data.id,
                  params
                );
              } else {
                setTimeout(() => {
                  this.vscodeService.showInfoBox(
                    this.I18n.I18nReplace(
                      this.i18n.plugins_term_task_modify_success,
                      { 0: this.taskName }
                    ),
                    'info'
                  );
                  this.closeTab.emit({});
                }, 200);
              }
            }
          }
        });
      } else {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
          const createHpcInstance = this.tiMessage.open({
            id: 'create',
            type: 'warn',
            title: this.i18n.secret_title,
            content:
              '<div>' +
              '<div class="warn-tip-msg">' +
              '<div class="ti3-icon ti3-icon-warn"></div>' +
              this.i18n.secret_count +
              '</div>' +
              '</div>',
            dismiss: (): void => {
              this.zone.run(() => {
                createHpcInstance.close();
              });
            },
            okButton: {
              show: true,
              click: (): void => {
                const option = {
                  url: '/tasks/',
                  params,
                };
                context.vscodeService.post(option, (res: any) => {
                  const data = res.data;
                  if (
                    self.webviewSession.getItem('tuningOperation') ===
                    'hypertuner'
                  ) {
                    if (res.code === 'SysPerf.Success') {
                      this.vscodeService.showTuningInfo(
                        res.message,
                        'info',
                        'createTask'
                      );
                      let timer = 0;
                      if (context.startCheckMicarch.checked) {
                        timer = 3500;
                        context.startTaskNow(
                          context.projectName,
                          context.taskName,
                          data.id,
                          params
                        );
                      } else {
                        const message = {
                          cmd: 'openSomeNode',
                          data: {
                            taskId: data.id,
                            projectName: context.projectName,
                          },
                        };
                        this.vscodeService.showTuningInfo(
                          'cancel',
                          'info',
                          'createTask'
                        );
                        this.vscodeService.postMessage(message, null);
                      }
                    } else {
                      this.vscodeService.showTuningInfo(
                        res.message,
                        'error',
                        'createTask'
                      );
                    }
                  }
                });
                this.zone.run(() => {
                  createHpcInstance.close();
                });
              },
            },
            cancelButton: {
              show: true,
              click: (): void => {
                this.zone.run(() => {
                  createHpcInstance.close();
                });
              },
            },
          });
        } else {
          this.tiModal.open(this.createMicarchConfirmModal, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'createMicarch',
            modalClass: 'createMicarchConfirmModal',
            close() {
              const option = {
                url: '/tasks/',
                params,
              };
              context.vscodeService.post(option, (res: any) => {
                const data = res.data;
                if (res.status) {
                  context.vscodeService.showInfoBox(res.message, 'error');
                } else {
                  let timer = 0;
                  if (context.startCheckMicarch.checked) {
                    timer = 3500;
                    context.startTaskNow(
                      context.projectName,
                      context.taskName,
                      data.id,
                      params
                    );
                  } else {
                    context.closeTab.emit({
                      title: `${data.taskname}-${params.nodeConfig[0].nickName}`,
                      id: data.id,
                      startCheckCNo: true,
                      nodeid: params.nodeConfig[0].nodeId,
                      taskId: data.id,
                      taskType: data['analysis-type'],
                      status: data.taskStatus,
                      projectName: context.projectName,
                      panelId: this.panelId,
                    });
                  }
                  setTimeout(() => {
                    context.vscodeService.showInfoBox(
                      context.I18n.I18nReplace(
                        context.i18n.plugins_term_task_create_success,
                        {
                          0: context.taskName,
                        }
                      ),
                      'info'
                    );
                  }, timer);
                }
              });
            },
          });
        }
      }
    }
  }

  /**
   * 处理运行用户数据
   */
  private dealRunUserDataObj(obj: any) {
    const runUserDataObj: RunUserDataObj = {};
    Object.keys(obj).map((key: string) => {
      if (obj[key].runUser) {
        runUserDataObj[key] = {
          user_name: obj[key].user_name || 'launcher',
          password: obj[key].password,
        };
      } else {
        runUserDataObj[key] = {
          user_name: 'launcher',
          password: '',
        };
      }
    });
    return runUserDataObj;
  }

  /**
   * 监听采集类型
   */
  public onChangeCollectionType(e: boolean) {
    const curCollectionType: boolean =
      this.launchItemsMicarchForm.get('collectionTypes').value;
    this.collectionType = curCollectionType;
    this.micarchItems.mpi_status.value = curCollectionType;
    if (curCollectionType) {
      this.isSelectNodeDisabled = false;
      this.launchItemsMicarchForm.get('mpi_env_dir').enable();
      this.launchItemsMicarchForm.get('selectNode').enable();
      this.launchItemsMicarchForm.get('hpc_mlt_rank_info').enable();
      const rankInfo = this.micarchCurrntForm.get('nodeList').value.map((nodeItem: any) => {
        return {
          id: nodeItem.id,
          nodeIp: nodeItem.nodeIp,
          rank: 4,
          nickName: nodeItem.nickName,
        };
      });
      this.launchItemsMicarchForm.get('hpc_mlt_rank_info').setValue(rankInfo);
    } else {
      if (Cat.isBool(this.nodeConfigM?.switchStatus)) {
        this.nodeConfigM.switchStatus = false;
      }
      this.launchItemsMicarchForm.controls.mpi_env_dir.disable();
      this.launchItemsMicarchForm.controls.selectNode.disable();
      this.launchItemsMicarchForm.get('hpc_mlt_rank_info').disable();
    }
    this.sendcollectionType.emit(curCollectionType);
    this.sendAppOrPidDisable.emit(false);
  }

  /**
   * 保存模板
   */
  async saveTemplates() {
    const self = this;
    const params = this.getFormDatas();
    if (this.preSwitchMicarch.switchState) {
      // 预约
      if (this.preSwitchMicarch.selected === 1) {
        const durationArr = this.preSwitchMicarch.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchMicarch.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchMicarch.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    if (this.nodeConfigM && this.nodeConfigM?.switchStatus) {
      params.switch = true;
      params.nodeConfig = this.nodeConfigM.getNodesConfigParams({}).nodeConfig;
      params.nodeConfig = params.nodeConfig.map((nodeItem: any) => {
        if (params['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION) {
          return {
            nickName: nodeItem.nickName,
            nodeId: nodeItem.nodeId,
            task_param: {
              status: nodeItem.task_param.status,
              'analysis-target': params['analysis-target'],
              'analysis-type': params['analysis-type'],
              projectname: params.projectname,
              taskname: params.taskname,
              duration: params.duration,
              preset: params.preset,
              switch: params.switch,
              'app-dir': nodeItem.task_param.appDir || params['app-dir'],
              'app-parameters':
                nodeItem.task_param['app-parameters'] ||
                params['app-parameters'],
              open_mp_param:
                nodeItem.task_param.open_mp_param || params.open_mp_param,
              mpi_status: params.mpi_status,
            },
          };
        } else {
          return {
            nickName: nodeItem.nickName,
            nodeId: nodeItem.nodeId,
            task_param: {
              status: nodeItem.task_param.status,
              'analysis-target': params['analysis-target'],
              'analysis-type': params['analysis-type'],
              process_name:
                nodeItem.task_param.process_name || params.process_name,
              targetPid: nodeItem.task_param.targetPid || params.targetPid,
              projectname: params.projectname,
              taskname: params.taskname,
              duration: params.duration,
              preset: params.preset,
              switch: params.switch,
            },
          };
        }
      });
    } else {
      const nodeConfig: any = await this.getNodeConfigDatas(params);
      params.nodeConfig = [];
      nodeConfig.forEach((nodeItem: any) => {
        const curNodeData: any = {
          nickName: nodeItem.nickName,
          nodeIP: nodeItem.nodeIp,
          nodeId: nodeItem.nodeId,
          task_param: {
            status: false,
            'analysis-target': params['analysis-target'],
            'analysis-type': params['analysis-type'],
            projectname: params.projectname,
            taskname: params.taskname,
            duration: params.duration,
            preset: params.preset,
            switch: params.switch,
            mpi_status: params.mpi_status,
          },
        };
        if (params.mpi_status) {
          curNodeData.task_param.mpi_env_dir = params.mpi_env_dir;
          curNodeData.task_param.hpc_mlt_rank_info = params.hpc_mlt_rank_info;
          curNodeData.task_param.master_ip = params.master_ip;
        }
        if (params['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION) {
          curNodeData.task_param['app-dir'] = params['app-dir'];
          curNodeData.task_param['app-parameters'] = params['app-parameters'];
          if (!params.mpi_status) {
            curNodeData.task_param.open_mp_param = params.open_mp_param;
          }
        }
        if (params['analysis-target'] === AnalysisTarget.ATTACH_TO_PROCESS) {
          curNodeData.task_param['app-dir'] = params['app-dir'];
          curNodeData.task_param['app-parameters'] = params['app-parameters'];
          curNodeData.task_param.process_name = params.process_name;
          curNodeData.task_param.targetPid = params.targetPid;
        }
        if (params.mpi_status && self.isLaunch) {
          if (params.master_ip === nodeItem.nodeIp) {
            params.nodeConfig.push(curNodeData);
          }
        } else {
          params.nodeConfig.push(curNodeData);
        }
      });
    }
    this.keepData = params;
    this.sendMissionKeep.emit(this.keepData);
  }
  /**
   * 创建/修改 预约任务函数
   */
  public createPreMission(context: any, params: any, method: string): any {
    //  周期
    if (context.selected === 1) {
      const durationArr = context.durationTime.split(' ');
      params.cycle = true;
      params.targetTime = context.pointTime;
      params.cycleStart = durationArr[0];
      params.cycleStop = durationArr[1];
      params.appointment = '';
    } else {
      // 单次
      const onceArr = context.onceTime.split(' ');
      params.cycle = false;
      params.targetTime = onceArr[1];
      params.appointment = onceArr[0];
      params.cycleStart = '';
      params.cycleStop = '';
    }
    // 预约任务请求地址
    let urlAnalysis = '';
    if (!this.editScheduleTask) {
      urlAnalysis = '/schedule-tasks/';
    } else {
      urlAnalysis = '/schedule-tasks/' + this.scheduleTaskId + '/';
      method = 'put';
    }
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      const options = { url: urlAnalysis, params };
      this.vscodeService.post(options, (res: any) => {
        if (res.code === 'SysPerf.Success') {
          this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
          this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
        } else {
          this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
        }
      });
    } else {
      return new Promise((resolve) => {
        const option = { url: urlAnalysis, params };
        context.vscodeService[method](option, (res: any) => {
          if (res.status) {
            this.vscodeService.showInfoBox(res.message, 'error');
          } else {
            if (this.editScheduleTask) {
              this.vscodeService.showInfoBox(
                this.I18n.I18nReplace(
                  this.i18n.plugins_term_scheduleTask_modify_success,
                  { 0: this.taskName }
                ),
                'info'
              );
              this.editScheduleTask = false;
            } else {
              this.vscodeService.showInfoBox(
                this.I18n.I18nReplace(
                  this.i18n.plugins_term_scheduleTask_create_success,
                  { 0: this.taskName }
                ),
                'info'
              );
            }
            this.sendPretable.emit('on');
            this.closeTab.emit({});
            context.clear();
            resolve(true);
          }
        });
      });
    }
  }
  /**
   * 清空任务参数
   */
  public clear() {
    if (this.preSwitchMicarch) {
      this.preSwitchMicarch.clear();
    }
  }

  /**
   * 导入模板
   */
  async getTemplateData(e: any) {
    this.taskNameValid = true;
    this.micarchItems.duration.step = e.duration;
    this.micarchItems.analysis.value = e.preset;
    if (e['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION) {
      this.micarchItems.mpi_env_dir.value = e.mpi_env_dir;
      this.micarchItems.mpi_status.value = e.mpi_status;
    }

    this.launchItemsMicarchForm.controls.openMpParams.setValue(
      e?.open_mp_param
    );
    if (this.nodeConfigM) {
      this.nodeConfigM.switchStatus = e?.switch;
      this.sendAppOrPidDisable.emit(e?.switch);
    }
    if (e.switch) {
      setTimeout(() => this.nodeConfigM?.importTemp(e.nodeConfig));
    }
    this.selectIpInfo = e?.hpc_mlt_rank_info ?? e.nodeConfig;
    this.setNodeListParam(this.selectIpInfo, this.nodeList);
    // 导入节点
    const nodeParams = this.getFormDatas();

    this.nodeCfg = await this.getNodeConfigDatas(nodeParams);
    this.rankNodes.srcData.data = this.nodeCfg;
    this.rankNodes.srcData.data.forEach((element: any, index: number) => {
      const rank = e?.hpc_mlt_rank_info?.[index]?.rank;
      element.rank = rank;
    });
    // 预约任务数据导入
    this.preSwitchMicarch.importTemp(e);
    if (this.isEdit) {
      this.preSwitchMicarch.isEdit = this.isEdit;
    }
    if (this.isRestart) {
      this.preSwitchMicarch.switchState = false;
    }

    // 重启回显数据
    const params: any = {
      'analysis-type': e['analysis-type'],
      projectname: e.projectName,
      preset: e.preset,
      taskname: e.taskName,
      duration: e.duration,
      mpi_status: e.mpi_status,
      mpi_env_dir: e.mpi_env_dir,
      switch: e.switch,
    };
    this.launchItemsMicarchForm.get('collectionTypes').setValue(e.mpi_status);
    if (e.mpi_status){
      this.launchItemsMicarchForm.get('mpiParams').setValue(e.mpi_param);
      this.launchItemsMicarchForm.get('selectNode').setValue(e.master_ip);
    }
    this.getNodeConfigDatas(params).then((res: any) => {
      if (res?.length && e?.hpc_mlt_rank_info?.length) {
        const newNodeCfg: any = [];
        e.hpc_mlt_rank_info.forEach((node: any) => {
          res.forEach((item: any) => {
            if (node.IP === item.nodeIp) {
              newNodeCfg.push({
                rank: node.rank,
                nickName: item.nickName,
                nodeIp: item.nodeIp,
              });
            }
          });
        });
        this.launchItemsMicarchForm
          .get('hpc_mlt_rank_info')
          .patchValue(newNodeCfg);
      }
    });
  }

  /**
   * 立即启动
   */
  public startTaskNow(
    projectname: string,
    taskname: string,
    id: string,
    params: any
  ) {
    const option: any = { status: 'running' };
    if (this.isLaunch) {
      option.user_message = this.runUserDataObj;
    }
    const projectnameURL = encodeURIComponent(projectname);
    const tasknameURL = encodeURIComponent(taskname);
    this.vscodeService.get(
      {
        url:
          '/res-status/?type=disk_space&project-name=' +
          projectnameURL +
          '&task-name=' +
          tasknameURL,
      },
      () => {
        const self = this;
        const options = { url: '/tasks/' + id + '/status/', params: option };
        self.vscodeService.put(options, (res: any) => {
          const backData = res.data;
          const taskName = params.taskname || params.taskName;
          const taskType = params['analysis-type'] || params.analysisType;
          self.closeTab.emit({
            title: `${taskName}-${params.nodeConfig[0].nickName}`,
            id: backData.id,
            nodeid: params.nodeConfig[0].nodeId,
            taskId: backData.id,
            taskType,
            status: backData['task-status'],
            projectName: self.projectName,
          });
        });
      }
    );
  }

  /**
   * 重启
   */
  public restartFunction(params: any) {
    const self = this;
    params.status = 'restarted';
    if (params.analysisTarget === AnalysisTarget.LAUNCH_APPLICATION) {
      params.user_message = this.runUserDataObj;
    }
    const option = {
      url: '/tasks/' + this.restartAndEditId + '/status/',
      data: params,
    };
    this.http.put(option.url, option.data).then((res: any) => {
      if (res.status === HTTP_STATUS.HTTP_400_BAD_REQUEST) {
        this.vscodeService.showInfoBox(res.message, 'error');
      } else {
        self.closeTab.emit({
          title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
          id: res.data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: res.data.id,
          status: res.data['task-status'],
          projectName: self.projectName,
          taskType: params['analysis-type'],
        });
        setTimeout(() => {
          this.vscodeService.showInfoBox(
            this.I18n.I18nReplace(
              this.i18n.plugins_term_task_reanalyze_success,
              { 0: this.taskName }
            ),
            'info'
          );
        }, 3000);
        this.isRestart = false;
      }
    }).catch((e) => {
      this.vscodeService.showInfoBox(e.message, 'error');
    });
  }
  /**
   * 取消按钮
   */
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      // 关闭当前页面
      this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
    }
  }
  /**
   * handleNodeEmit
   */
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }

  /**
   * 微调器回填初始化
   */
  public async setSpinnerBlur() {
    const form = this.isLaunch
      ? this.launchItemsMicarchForm
      : this.profileItemsMicarchForm;

    this.samplingDurationBlur = {
      control: form.controls.duration,
      min: 1,
      max: 3600,
    };
  }
  /**
   * 微调器鼠标移出数据校验
   */
  selectBlur(e: any, type: any) {
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      setTimeout(() => {
        const value = e.target.value;
        if (type === 'duration') {
          const maxVal = this.samplingDurationBlur.max;
          const minVal = this.samplingDurationBlur.min;
          if (value < minVal) {
            this.profileItemsMicarchForm.controls[type].setValue(minVal);
            this.launchItemsMicarchForm.controls[type].setValue(minVal);
          } else if (value > maxVal) {
            this.profileItemsMicarchForm.controls[type].setValue(maxVal);
            this.launchItemsMicarchForm.controls[type].setValue(maxVal);
          }
        }
        if (type === 'rank') {
          const maxVal = this.rankBlur.max;
          const minVal = this.rankBlur.min;
          if (value < minVal) {
            this.launchItemsMicarchForm.controls[type].setValue(minVal);
          } else if (value > maxVal) {
            this.launchItemsMicarchForm.controls[type].setValue(maxVal);
          }
        }
      }, 100);
    }
  }
  /**
   * IntellIj刷新webview页面
   */
  private updateWebViewPage() {
    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
      this.zone.run(() => {
        this.changeDetectorRef.checkNoChanges();
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  /**
   * 格式化节点信息
   */
  public formatNodeInfo(nodeInfo: any) {
    let newNodeInfo: any = [];
    if (nodeInfo && nodeInfo.length) {
      newNodeInfo = nodeInfo.map((node: any) => {
        return {
          nickName: node.nickName,
          nodeId: node.nodeId,
          nodeIp: node.nodeIp,
          nodeStatus: node.nodeStatus,
          taskParam: { status: node.task_param.status },
        };
      });
    }
    return newNodeInfo;
  }

  getIsAbled(){
    return !(
      this.taskNameValid &&
      this.appAndPidValid &&
      this.modeAppRunUserValid &&
      this.micarchCurrntForm.valid &&
      this.runUservalid
      );
  }
  /**
   * 节点配置开启运用运行用户
   * @param value 开启状态
   */
  public openRunUserConfig(value: boolean) {
    this.switchState = value;
  }
}
