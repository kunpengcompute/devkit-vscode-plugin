import {
  Component,
  OnInit,
  ViewChild,
  Output,
  OnChanges,
  Input,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { TiValidators, TiValidationConfig, TiTableRowData } from '@cloud/tiny3';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import {
  SpinnerBlurInfo,
  LaunchRunUser,
} from 'projects/sys/src-web/app/domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { CustomValidatorsService } from '../../service';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-cplusplus',
  templateUrl: './mission-cplusplus.component.html',
  styleUrls: [
    './mission-cplusplus.component.scss',
    '../mission-components/task-form/task-form.component.scss',
  ],
})
export class MissionCplusplusComponent implements OnInit, OnChanges {
  constructor(
    public http: HttpService,
    public I18n: I18nService,
    public Axios: AxiosService,
    fb: FormBuilder,
    public scheduleTaskServer: ScheduleTaskService,
    public mytip: MytipService,
    private tiMessage: MessageModalService,
    public customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = I18n.I18n();
    this.typeItem = {
      label: this.i18n.common_term_task_analysis_type,
      required: false,
    };
    this.commentItems = {
      path: {
        label: this.i18n.common_term_task_crate_app_path,
        required: true,
      },
      params_c: {
        label: this.i18n.common_term_task_crate_parameters,
        required: false,
      },
      params_java: {
        label: this.i18n.common_term_task_crate_parameters,
        required: true,
      },
      dire: {
        label: this.i18n.common_term_task_crate_work_director,
        required: true,
        options: [
          {
            label: this.i18n.common_term_task_start_path,
            id: 'application path',
          },
          {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
          },
        ],
      },
      cpu: {
        label: this.i18n.common_term_task_crate_interval_ms,
        required: true,
        options: [
          {
            label: this.i18n.common_term_task_start_high_precision,
            id: 'higher',
          },
          {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
          },
        ],
        spinner: {
          placeholder: '1-1,000',
          min: 1,
          max: 1000,
          format: 'N0',
          step: 1,
        },
        tailPrompt:
          this.i18n.common_term_sign_left +
          '1~1,000' +
          this.i18n.common_term_sign_right,
      },
      c_d: {
        label: this.i18n.common_term_task_crate_duration,
        required: true,
        placeholder: '1-300',
        min: 1,
        max: 300,
        format: 'N0',
        step: 1,
        tailPrompt:
          this.i18n.common_term_sign_left +
          '1~300' +
          this.i18n.common_term_sign_right,
      },
      typeItem: {
        label: this.i18n.micarch.label.typeItem,
        selected: {
          label: this.i18n.micarch.typeItem_user,
          id: 'user',
        },
        options: [
          {
            label: this.i18n.micarch.typeItem_all,
            id: 'all',
          },
          {
            label: this.i18n.micarch.typeItem_user,
            id: 'user',
          },
          {
            label: this.i18n.micarch.typeItem_kernel,
            id: 'kernel',
          },
        ],
      },
      kcore: {
        // 内核函数关联汇编指令
        label: this.i18n.mission_create.kcore,
        required: false,
      },
      c_r: {
        label:
          this.i18n.falsesharing.filesize +
          ' ' +
          this.i18n.ddr.leftParenthesis +
          'MiB' +
          this.i18n.ddr.rightParenthesis,
        required: false,
        placeholder: '1-100',
        min: 1,
        max: 100,
        format: 'N0',
        step: 1,
        tip: this.i18n.falsesharing.filesizeTips,
        tailPrompt:
          this.i18n.common_term_sign_left +
          '1~100' +
          this.i18n.common_term_sign_right,
      },
      res_d: {
        label: this.i18n.common_term_task_crate_duration,
        required: true,
        placeholder: '1-60',
        min: 1,
        max: 60,
        format: 'N0',
        step: 1,
      },
      mask: {
        label: this.i18n.ddr.cpuToBeSamples,
        tip: this.i18n.tip_msg.common_term_task_crate_mask_tip,
        required: false,
      },
      b_s: {
        label: this.i18n.common_term_task_crate_bs_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
        required: false,
      },
      c_source: {
        label: this.i18n.common_term_task_crate_c_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
        required: false,
      },
      j_source: {
        label: this.i18n.common_term_task_crate_java_path,
        tip: this.i18n.tip_msg.common_term_task_crate_j_source_tip,
        required: false,
      },
      lock_function: {
        label: this.i18n.lock.form.functions_label,
        required: false,
      },
      profilingMode: 'Native', // WebUI上不显示。
      sysWideState: 'on', // WebUI上不显示。
    };
    this.launchItemsCForm = fb.group({
      nodeList: new FormControl([]),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      c_r_ctrl: new FormControl(100, [
        TiValidators.minValue(1),
        TiValidators.maxValue(100),
      ]),
      typeItem_ctrl: new FormControl(
        {
          label: this.i18n.micarch.typeItem_user,
          id: 'user',
        },
        []
      ),
      cpu_ctrl: new FormControl('', []),
      cpu_spinner_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      dire_ctrl: new FormControl('', []),
      dire_input_ctrl: new FormControl('', {
        validators: [TiValidators.required],
        updateOn: 'change',
      }),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error),
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error),
      ]),
    });

    this.cCurrntFormC = this.launchItemsCForm;
    this.attachItemsCForm = fb.group({
      nodeList: new FormControl([]),
      c_d_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      c_r_ctrl: new FormControl(100, [
        TiValidators.minValue(1),
        TiValidators.maxValue(100),
      ]),
      typeItem_ctrl: new FormControl(
        {
          label: this.i18n.micarch.typeItem_user,
          id: 'user',
        },
        []
      ),
      cpu_ctrl: new FormControl('', []),
      cpu_spinner_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error),
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error),
      ]),
    });
    this.profileItemsCForm = fb.group({
      nodeList: new FormControl([]),
      c_d_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      c_r_ctrl: new FormControl(100, [
        TiValidators.minValue(1),
        TiValidators.maxValue(100),
      ]),
      typeItem_ctrl: new FormControl(
        {
          label: this.i18n.micarch.typeItem_user,
          id: 'user',
        },
        []
      ),
      cpu_ctrl: new FormControl('', []),
      cpu_spinner_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error),
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error),
      ]),
      mask_ctrl: new FormControl('', [
        this.customValidatorsService.checkSampCPUMask(),
      ]),
    });
    this.LaunchItemsC = {
      pathVal: '',
      paramsVal: '',
      dire: {
        value: '',
        saveValue: '',
      },
      cpu: {
        unit: this.i18n.common_term_task_crate_ms,
        spinnerVal: 710,
      },
      maskVal: '',
      b_sVal: '',
      c_sourceVal: '',
    };

    this.profileItemC = {
      c_dVal: 30,
      cpu: {
        unit: this.i18n.common_term_task_crate_ms,
        spinnerVal: 710,
      },
      maskVal: '',
      b_sVal: '',
      c_sourceVal: '',
    };

    this.attachItemsC = {
      p_t: {
        label: this.i18n.common_term_task_crate_pid,
        required: true,
        value: '',
      },
      c_dVal: 30,
      cpu: {
        unit: this.i18n.common_term_task_crate_ms,
        spinnerVal: 710,
      },
      b_sVal: '',
      c_sourceVal: '',
    };
    this.startCheckC = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
  }
  @ViewChild('nodeConfigC') nodeConfigC: any;
  @ViewChild('preSwitchC') preSwitchC: any;
  @ViewChild('pretable') pretable: any;
  @Output() private sendMissionKeep = new EventEmitter<any>();
  @Output() private sendPretable = new EventEmitter<any>();
  @Output() private sendAppOrPidDisable = new EventEmitter<any>();
  @Output() private closeTab = new EventEmitter<any>();
  @Output() private handleNodeEmitIndex = new EventEmitter<any>();
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
  @Input() modePid: string;
  @Input() modeProcess: string;
  @Input() modeAppValid: boolean;
  @Input() modePidValid: boolean;
  @Input() projectId: number;
  @Input() restartAndEditId: number;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Input() isModifySchedule: boolean;
  @Input() taskDetail: any = {
    isFromTuningHelper: false,
  };
  public isLaunch = true;
  public isAttach = false;
  public isProfile = false;
  public isEdit: boolean;
  public i18n: any;
  public isRestart = false; // 是否重启
  public typeItem: any = {};
  public commentItems: any = {};
  // 表单验证部分
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public keepData: any; // 保存模板
  public appAndPidValid = false;
  public launchItemsCForm: FormGroup;
  public attachItemsCForm: FormGroup;
  public profileItemsCForm: FormGroup;
  public currentTargetCForm: FormGroup;
  public cCurrntFormC: FormGroup;
  public LaunchItemsC: any = {};
  public profileItemC: any = {};
  public attachItemsC: any = {};
  public startCheckC: any = {};
  public cTypeOptions: Array<any> = [
    {
      label: 'Launch Application',
      id: 'launch',
    },
    {
      label: 'Profile System',
      id: 'profile',
    },
    {
      label: 'Attach to Process',
      id: 'attach',
    },
  ];
  public cTypeSelected: any = this.cTypeOptions[0];
  public typeCDesc = '';
  // 获取数据
  public formDatas: any;

  // 修改预约任务 接收从预约传来的值
  public editScheduleTask = false; // 判断是否是修改
  public scheduleTaskId: any; // 保存修改的预约任务ID
  public runUserData = {
    runUser: false,
    user: '',
    password: '',
  };
  public runUserDataObj: LaunchRunUser = {};

  public intervalBlur: SpinnerBlurInfo;
  public collectFileBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;

  public isShowReserveAndImmedia = false;
  // 工程下节点信息
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;

  ngOnInit() {
    this.getProjectNodes();
    this.profileItemsCForm.controls.cpu_spinner_ctrl.setValue('1');
    this.profileItemsCForm.controls.c_d_ctrl.setValue('30');
    this.profileItemsCForm.controls.cpu_ctrl.setValue({
      label: this.i18n.common_term_task_start_custerm,
      id: 'customize',
    });

    this.attachItemsCForm.controls.cpu_spinner_ctrl.setValue('1');
    this.attachItemsCForm.controls.c_d_ctrl.setValue('30');
    this.attachItemsCForm.controls.cpu_ctrl.setValue({
      label: this.i18n.common_term_task_start_custerm,
      id: 'customize',
    });

    this.launchItemsCForm.controls.cpu_spinner_ctrl.setValue('1');
    this.launchItemsCForm.controls.dire_ctrl.setValue({
      label: this.i18n.common_term_task_start_path,
      id: 'application path',
    });
    this.launchItemsCForm.controls.dire_input_ctrl.disable(); // 初始化dir输入框灰化,暂时不需要了
    this.launchItemsCForm.controls.cpu_ctrl.setValue({
      label: this.i18n.common_term_task_start_custerm,
      id: 'customize',
    });

    this.setSpinnerBlur();
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'switchState':
          if (changes.switchState.currentValue) {
            this.runUserData.runUser = true;
            this.startCheckC.checked = true;
            this.isShowReserveAndImmedia = true;
          } else {
            this.runUserData.runUser = false;
            this.isShowReserveAndImmedia = false;
          }
          break;
        case 'modeApplicationUser':
          if (changes.modeApplicationUser.currentValue) {
            this.runUserData.user = changes.modeApplicationUser.currentValue;
          }
          break;
        case 'modeApplicationPassWord':
          if (changes.modeApplicationPassWord.currentValue) {
            this.runUserData.password =
              changes.modeApplicationPassWord.currentValue;
          }
          break;
        case 'typeId':
          if (changes.typeId.currentValue) {
            this.appAndPidValid = false;
            if (this.nodeConfigC) {
              this.nodeConfigC.clear();
            }
          }
          break;
        case 'nodeConfigedData':
          if (changes.nodeConfigedData.currentValue) {
            this.runUserDataObj[this.nodeConfigedData.nodeIp] = {
              runUser: this.nodeConfigedData.runUser.runUser,
              user_name: this.nodeConfigedData.runUser.user,
              password: this.nodeConfigedData.runUser.password,
            };
            let bool = false;
            Object.keys(this.runUserDataObj).map((key: string) => {
              if (this.runUserDataObj[key].runUser) {
                bool = true;
              }
            });
            this.isShowReserveAndImmedia = bool;
          }
          break;
        default:
          break;
      }
    }
    switch (changes.typeId ? changes.typeId.currentValue : this.typeId) {
      case 0:
        this.isProfile = true;
        this.appAndPidValid = true;
        this.isLaunch = false;
        this.isAttach = false;
        this.cCurrntFormC = this.profileItemsCForm;
        this.cTypeSelected = this.cTypeOptions[1];
        break;
      case 1:
        this.isProfile = false;
        this.isLaunch = true;
        this.appAndPidValid = this.modeAppValid;
        this.isAttach = false;
        this.cCurrntFormC = this.launchItemsCForm;
        this.cTypeSelected = this.cTypeOptions[0];
        break;
      case 2:
        this.isProfile = false;
        this.isLaunch = false;
        this.isAttach = true;
        this.appAndPidValid = this.modePidValid;
        this.cCurrntFormC = this.attachItemsCForm;
        this.cTypeSelected = this.cTypeOptions[2];
        break;
      default:
        break;
    }
  }
  selectNodeDisable(event: boolean){
    this.isSelectNodeDisabled = event;
  }
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = res.data.nodeList;
        if (!(this.isEdit || this.isRestart)) {
          this.cCurrntFormC.controls.nodeList.setValue(
            this.nodeList.length > 10 ? this.nodeList.slice(0, 10) : this.nodeList
          );
        }
      }
      // 获取工程
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC') {
        this.cCurrntFormC.get('nodeList').enable();
      } else {
        this.cCurrntFormC.get('nodeList').disable();
      }
    });
  }
  public changeAppDire(type: any) {}
  public directory_change(data: any, modal: any) {
    let ctrls: any;
    if (modal === 'LaunchItemsC') {
      ctrls = this.launchItemsCForm.controls;
    }
    if (data.id === 'customize') {
      ctrls.dire_input_ctrl.enable();
      ctrls.dire_input_ctrl.setValue('');
    } else {
      ctrls.dire_input_ctrl.disable();
      ctrls.dire_input_ctrl.setValue('');
    }
  }

  public cpu_interval_change(data: any, cpu: any, type: string) {
    const THIS = cpu;
    THIS.unit =
      data.id === 'higher'
        ? this.i18n.common_term_task_crate_us
        : this.i18n.common_term_task_crate_ms;
    const spinnerVal = data.id === 'higher' ? '710' : '1';
    if (type === 'C') {
      this.currentTargetCForm = this.isLaunch
        ? this.launchItemsCForm
        : this.isAttach
        ? this.attachItemsCForm
        : this.profileItemsCForm;
      this.currentTargetCForm.controls.cpu_spinner_ctrl.setValue(spinnerVal);
      if (data.id === 'higher') {
        this.currentTargetCForm.controls.cpu_spinner_ctrl.disable();
      } else {
        this.currentTargetCForm.controls.cpu_spinner_ctrl.enable();
      }
    }
  }

  async createAnalysis(isEdit: any): Promise<any> {
    const self = this;
    this.currentTargetCForm = this.isLaunch
      ? this.launchItemsCForm
      : this.isAttach
      ? this.attachItemsCForm
      : this.profileItemsCForm;
    const errors = TiValidators.check(this.currentTargetCForm);
    const ctrls = self.currentTargetCForm.controls;
    const params: any = {
      'analysis-type': 'C/C++ Program',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.cTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : '0.71',
      'profiling-mode': 'Native',
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
    };
    params.kcore = ctrls.kcore.value;
    params.size = ctrls.c_r_ctrl.value || 100;
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['app-parameters'] = this.modeAppParams || '';
      params['app-working-dir'] = ctrls.dire_input_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['cpu-mask'] = ctrls.mask_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid;
      params.process_name = this.modeProcess; // TODO liutaigang
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.nodeConfigC.switchStatus) {
      params.switch = true;
      const nodeData: any = this.nodeConfigC.getNodesConfigParams();
      if (self.isLaunch) {
        params.nodeConfig = nodeData.map((item: any) => {
          if (!Object.keys(this.runUserDataObj).includes(item.nickName)) {
            this.runUserDataObj[item.nickName] = {
              runUser: this.runUserData.runUser,
              user_name: this.runUserData.user,
              password: this.runUserData.password,
            };
          }
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.size = params.size;
          item.task_param.samplingSpace = params.samplingSpace;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
      if (self.isProfile) {
        params.nodeConfig = nodeData.map((item: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.duration = params.duration;
          item.task_param.size = params.size;
          item.task_param.samplingSpace = params.samplingSpace;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
      if (self.isAttach) {
        params.nodeConfig = nodeData.map((item: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.duration = params.duration;
          item.task_param.size = params.size;
          item.task_param.samplingSpace = params.samplingSpace;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
    } else {
      params.switch = false;
      params.nodeConfig = await this.getNodeConfigDatas(
        params['analysis-type']
      );
    }
    if (this.isRestart) {
      this.restartFunction(params);
      return false;
    }
    //  预约任务 preSwitch 预约组件名
    if (this.preSwitchC.switchState) {
      this.startCheckC.checked = false;
      const flag = await this.createPreMission(this.preSwitchC, params, 'post');
      if (flag) {
        this.startCheckC.checked = true;
      }
    } else {
      if (isEdit) {
        let urlAnalysis = '';

        urlAnalysis = '/tasks/' + this.restartAndEditId + '/';

        self.Axios.axios
          .put(urlAnalysis, params)
          .then((data: any) => {
            self.mytip.alertInfo({
              type: 'success',
              content: self.i18n.tip_msg.edite_ok,
              time: 3500,
            });
            if (self.startCheckC.checked) {
              self.startDataSamplingTask(
                self.projectName,
                self.taskName,
                data.data.id,
                params
              );
            } else {
              self.closeTab.emit({});
            }
          })
          .catch((error: any) => {});
      } else {
        this.tiMessage.open({
          type: 'warn',
          title: this.i18n.secret_title,
          content: this.i18n.secret_count,
          close() {
            // 调优助手跳转创建任务
            if (self.taskDetail.isFromTuningHelper) {
              Object.assign(params, {
                suggestionId: self.taskDetail.suggestionId, // 优化建议id
                optimizationId: self.taskDetail.optimizationId, // 调优助手任务id
              });
            }
            const urlAnalysis = '/tasks/';
            // 判断是否打开指定运行用户
            const keyList = Object.keys(self.runUserDataObj);
            keyList.forEach((key) => {
              if (
                self.runUserDataObj[key].user_name &&
                self.runUserDataObj[key].password
              ) {
                params.is_user = true;
              }
            });
            self.Axios.axios
              .post(urlAnalysis, params)
              .then((res: any) => {
                self.mytip.alertInfo({
                  type: 'success',
                  content: self.i18n.tip_msg.create_ok,
                  time: 3500,
                });
                const data = res.data;
                if (self.startCheckC.checked) {
                  self.startDataSamplingTask(
                    self.projectName,
                    self.taskName,
                    data.id,
                    params
                  );
                } else {
                  self.closeTab.emit({
                    title: `${data.taskname}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: data['analysis-type'],
                    status: data['task-status'],
                    projectName: self.projectName,
                  });
                }
              })
              .catch((error: any) => {});
          },
        });
      }
    }
  }
  // 当点击开启参数配置时
  public onControlNode(taskName: any) {
    if (taskName) {
      // 开启
      this.getFormDatas(taskName);
      let target = '';
      if (
        Object.prototype.hasOwnProperty.call(this.formDatas, 'analysis-target')
      ) {
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
        case 'process-thread-analysis':
          firstName = 'p_';
          break;
        case 'system_lock':
          firstName = 'l_';
          break;
        case 'resource_schedule':
          firstName = 'r_';
          break;
        case 'micarch':
          firstName = 'm_';
          break;
        default:
          break;
      }
      const disableTarget =
        target.indexOf('Launch') !== -1
          ? firstName + 'launch'
          : target.indexOf('Attach') !== -1
          ? firstName + 'attach'
          : firstName + 'profile';
      this.onDisableForm(disableTarget);
    } else {
      // 关闭
      this.onDisableForm('');
    }
  }
  // 禁用
  public onDisableForm(taskName: any) {
    switch (taskName) {
      case 'c_launch':
        this.launchItemsCForm.controls.b_s_ctrl.disable();
        this.launchItemsCForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'c_attach':
        this.attachItemsCForm.controls.b_s_ctrl.disable();
        this.attachItemsCForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'c_profile':
        this.profileItemsCForm.controls.mask_ctrl.disable();
        this.profileItemsCForm.controls.b_s_ctrl.disable();
        this.profileItemsCForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;

      default:
        this.sendAppOrPidDisable.emit(false);
        this.profileItemsCForm.controls.mask_ctrl.enable();
        this.profileItemsCForm.controls.b_s_ctrl.enable();
        this.profileItemsCForm.controls.source_ctrl.enable();
        this.attachItemsCForm.controls.b_s_ctrl.enable();
        this.attachItemsCForm.controls.source_ctrl.enable();
        this.launchItemsCForm.controls.b_s_ctrl.enable();
        this.launchItemsCForm.controls.source_ctrl.enable();
        break;
    }
  }
  public getFormDatas(str: string) {
    const self = this;
    this.currentTargetCForm = this.isLaunch
      ? this.launchItemsCForm
      : this.isAttach
      ? this.attachItemsCForm
      : this.profileItemsCForm;
    const errors = TiValidators.check(this.currentTargetCForm);
    const ctrls = self.currentTargetCForm.controls;
    const params: any = {
      'analysis-type': 'C/C++ Program',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.cTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : '0.71',
      'profiling-mode': 'Native',
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
    };
    params.kcore = ctrls.kcore.value;
    params.size = ctrls.c_r_ctrl.value || 100;
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['app-parameters'] = this.modeAppParams || '';
      params['app-working-dir'] = ctrls.dire_input_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['cpu-mask'] = ctrls.mask_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid;
      params.process_name = this.modeProcess; // TODO liutaigang
      params.duration = ctrls.c_d_ctrl.value;
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.preSwitchC.switchState) {
      if (this.preSwitchC.selected === 1) {
        const durationArr = this.preSwitchC.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchC.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchC.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }

    this.formDatas = params;
    return;
  }
  // 当配置节点参数没开时
  async getNodeConfigDatas(params: any) {
    this.getFormDatas(params);
    // 当开关组件没有打开时
    return new Promise((resolve, reject) => {
      const data: any = [];
      if (this.sceneName === 'HPC') {
        this.cCurrntFormC.get('nodeList').value.forEach((item: any) => {
          this.runUserDataObj[item.nodeIp] = {
            runUser: this.runUserData.runUser,
            user_name: this.runUserData.user,
            password: this.runUserData.password,
          };
          data.push({
            nodeId: item.id,
            nickName: item.nickName,
            task_param: Object.assign({}, { status: false }, this.formDatas),
          });
        });
      } else {
        this.nodeList.forEach((item: any) => {
          this.runUserDataObj[item.nodeIp] = {
            runUser: this.runUserData.runUser,
            user_name: this.runUserData.user,
            password: this.runUserData.password,
          };
          data.push({
            nodeId: item.id,
            nickName: item.nickName,
            task_param: Object.assign({}, { status: false }, this.formDatas),
          });
        });
      }
      resolve(data);
    });
  }

  // 保存模板
  async saveTemplates() {
    const self = this;
    this.currentTargetCForm = this.isLaunch
      ? this.launchItemsCForm
      : this.isAttach
      ? this.attachItemsCForm
      : this.profileItemsCForm;
    const errors = TiValidators.check(this.currentTargetCForm);
    const ctrls = self.currentTargetCForm.controls;
    const params: any = {
      'analysis-type': 'C/C++ Program',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.cTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : '0.71',
      'profiling-mode': 'Native',
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
    };
    params.kcore = ctrls.kcore.value;
    params.size = ctrls.c_r_ctrl.value || 100;
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['app-working-dir'] = ctrls.dire_input_ctrl.value;
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params['cpu-mask'] = ctrls.mask_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid;
      params.process_name = this.modeProcess; // TODO liutaigang
      params.samplingSpace = ctrls.typeItem_ctrl.value;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.preSwitchC.switchState) {
      if (this.preSwitchC.selected === 1) {
        const durationArr = this.preSwitchC.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchC.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchC.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    if (this.nodeConfigC.switchStatus) {
      params.switch = true;
      const nodeData: any = this.nodeConfigC.getNodesConfigParams();
      if (self.isLaunch) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          if (!Object.keys(this.runUserDataObj).includes(item.nickName)) {
            this.runUserDataObj[item.nickName] = {
              runUser: false,
              user_name: '',
              password: '',
            };
          }
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.samplingSpace = params.samplingSpace;
          return item;
        });
      }
      if (self.isProfile) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.duration = params.duration;
          item.task_param.samplingSpace = params.samplingSpace;
          return item;
        });
      }
      if (self.isAttach) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.duration = params.duration;
          item.task_param.samplingSpace = params.samplingSpace;
          return item;
        });
      }
    } else {
      params.switch = false;
      params.nodeConfig = await this.getNodeConfigDatas(
        params['analysis-type']
      );
    }
    this.keepData = params;
    this.sendMissionKeep.emit(this.keepData);
  }

  // 导入模板
  public getTemplateData(e: any): void {
    this.taskNameValid = true;
    this.appAndPidValid = true;
    const typeItem = this.commentItems.typeItem.options.find((val: any) => {
      return val.id === e.samplingSpace.id;
    });
    if (e['analysis-target'].indexOf('Launch') > -1) {
      this.typeCDesc = this.i18n.common_term_task_type_launch;
      this.isLaunch = true;
      this.isProfile = false;
      this.isAttach = false;

      this.cTypeSelected = this.cTypeOptions[0];
      this.launchItemsCForm.controls.cpu_spinner_ctrl.setValue(e.interval);
      this.launchItemsCForm.controls.typeItem_ctrl.setValue(typeItem);
      this.launchItemsCForm.controls.kcore.setValue(e.kcore);
      this.launchItemsCForm.controls.c_r_ctrl.setValue(e.size);
      if (e.interval === '0.71') {
        this.launchItemsCForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }
      this.launchItemsCForm.controls.b_s_ctrl.setValue(e.assemblyLocation);
      this.launchItemsCForm.controls.source_ctrl.setValue(e.sourceLocation);
      sessionStorage.setItem(
        'custInput',
        this.launchItemsCForm.controls.dire_input_ctrl.value
      );
      sessionStorage.setItem(
        'dire_ctrl',
        this.launchItemsCForm.controls.dire_ctrl.value.id
      );
    } else if (e['analysis-target'].indexOf('Profile') > -1) {
      this.typeCDesc = this.i18n.common_term_task_type_profile;
      this.isLaunch = false;
      this.isProfile = true;
      this.isAttach = false;
      this.cTypeSelected = this.cTypeOptions[1];
      this.profileItemsCForm.controls.cpu_spinner_ctrl.setValue(e.interval);
      this.profileItemsCForm.controls.c_d_ctrl.setValue(e.duration);
      this.profileItemsCForm.controls.typeItem_ctrl.setValue(typeItem);
      this.profileItemsCForm.controls.kcore.setValue(e.kcore);
      this.profileItemsCForm.controls.c_r_ctrl.setValue(e.size);
      if (e.interval === '0.71') {
        this.profileItemsCForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }
      this.profileItemsCForm.controls.mask_ctrl.setValue(e['cpu-mask']);
      this.profileItemsCForm.controls.b_s_ctrl.setValue(e.assemblyLocation);
      this.profileItemsCForm.controls.source_ctrl.setValue(e.sourceLocation);
      this.cCurrntFormC = this.profileItemsCForm;
    } else if (e['analysis-target'].indexOf('Attach') > -1) {
      this.typeCDesc = this.i18n.common_term_task_type_attach;
      this.isLaunch = false;
      this.isProfile = false;
      this.isAttach = true;

      this.cTypeSelected = this.cTypeOptions[2];
      this.attachItemsCForm.controls.cpu_spinner_ctrl.setValue(e.interval);
      this.attachItemsCForm.controls.c_d_ctrl.setValue(e.duration);
      this.attachItemsCForm.controls.typeItem_ctrl.setValue(typeItem);
      this.attachItemsCForm.controls.kcore.setValue(e.kcore);
      this.attachItemsCForm.controls.c_r_ctrl.setValue(e.size);
      if (e.interval === '0.71') {
        this.attachItemsCForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }
      this.attachItemsCForm.controls.b_s_ctrl.setValue(e.assemblyLocation);
      this.attachItemsCForm.controls.source_ctrl.setValue(e.sourceLocation);
      this.cCurrntFormC = this.attachItemsCForm;
    }
    this.cCurrntFormC.get('nodeList').setValue(e.nodeConfig);

    // 预约任务数据导入
    this.preSwitchC.importTemp(e);
    // 配置节点参数
    if (e.switch) {
      switch (e['analysis-target']) {
        case 'Launch Application':
          this.onDisableForm('c_launch');
          break;
        case 'Profile System':
          this.onDisableForm('c_profile');
          break;
        case 'Attach to Process':
          this.onDisableForm('c_attach');
          break;
        default:
          break;
      }
      // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
      setTimeout(() => this.nodeConfigC.importTemp(e.nodeConfig));
    } else {
      this.nodeConfigC.clear();
    }
    if (this.isEdit || this.isRestart) {
      this.preSwitchC.isEdit = this.isEdit || this.isRestart;
    }
  }

  // 创建/修改 预约任务函数
  public createPreMission(self: any, params: any, method: any) {
    //  周期
    if (self.selected === 1) {
      const durationArr = self.durationTime.split(' ');
      params.cycle = true;
      params.targetTime = self.pointTime;
      params.cycleStart = durationArr[0];
      params.cycleStop = durationArr[1];
      params.appointment = '';
    } else {
      // 单次
      const onceArr = self.onceTime.split(' ');
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
    return new Promise((resolve, reject) => {
      this.Axios.axios[method](urlAnalysis, params).then((res: any) => {
        if (this.editScheduleTask) {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500,
          });
          this.editScheduleTask = false;
        } else {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.create_ok,
            time: 3500,
          });
        }
        self.clear();
        this.nodeConfigC.clear();
        this.sendPretable.emit('on');
        this.closeTab.emit({});
        resolve(true);
      });
    });
  }

  // 清空任务参数
  public clear() {
    this.nodeConfigC.clear();
    this.preSwitchC.clear();
  }
  // 取消按钮
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }
  // 立即启动
  public startDataSamplingTask(
    projectname: any,
    taskname: any,
    id: any,
    params: any
  ) {
    const option: any = { status: 'running' };
    if (this.isLaunch) {
      option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
    }
    this.Axios.axios
      .get(
        '/res-status/?type=disk_space&project-name=' +
          encodeURIComponent(projectname) +
          '&task-name=' +
          encodeURIComponent(taskname)
      )
      .then((data: any) => {
        const self = this;

        this.Axios.axios
          .put('/tasks/' + id + '/status/', option)
          .then((res: any) => {
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
      });
  }
  //  重启
  public restartFunction(params: any) {
    const self = this;
    params.status = 'restarted';
    if (self.isLaunch) {
      params.user_message = this.dealRunUserDataObj(self.runUserDataObj);
    }
    // 调优助手跳转创建任务
    if (self.taskDetail.isFromTuningHelper) {
      Object.assign(params, {
        suggestionId: self.taskDetail.suggestionId, // 优化建议id
        optimizationId: self.taskDetail.optimizationId, // 调优助手任务id
      });
    }
    self.Axios.axios
      .put('/tasks/' + self.restartAndEditId + '/status/', params)
      .then((res: any) => {
        const data = res.data;
        self.closeTab.emit({
          title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
          id: data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: data.id,
          taskType: params['analysis-type'],
          status: data['task-status'],
          projectName: self.projectName,
        });
        self.mytip.alertInfo({
          type: 'info',
          content: self.i18n.mission_create.restartSuccess,
          time: 3500,
        });

        self.isRestart = false;
      })
      .catch((error: any) => {});
  }
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }

  private validFilePath(errorMessage: string): ValidatorFn {
    const reg = /^([\/][^\/]+)*$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = (control.value || '').toString().trim();
      if (tmpValue === '' || tmpValue == null) {
        return null;
      }

      return reg.test(tmpValue)
        ? null
        : { filePath: { tiErrorMessage: errorMessage } };
    };
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.currentTargetCForm = this.isLaunch
      ? this.launchItemsCForm
      : this.isAttach
      ? this.attachItemsCForm
      : this.profileItemsCForm;

    this.intervalBlur = {
      control: this.currentTargetCForm.controls.cpu_spinner_ctrl,
      min: 1,
      max: 1000,
    };
    this.collectFileBlur = {
      control: this.currentTargetCForm.controls.c_r_ctrl,
      min: 1,
      max: 100,
    };
    this.samplingDurationBlur = {
      control: this.currentTargetCForm.controls.c_d_ctrl,
      min: 1,
      max: 300,
    };
  }

  private dealRunUserDataObj(obj: LaunchRunUser) {
    const runUserDataObj: RunUserDataObj = {};
    Object.keys(obj).map((key: string) => {
      if (obj[key].runUser) {
        runUserDataObj[key] = {
          user_name: obj[key].user_name,
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
}
