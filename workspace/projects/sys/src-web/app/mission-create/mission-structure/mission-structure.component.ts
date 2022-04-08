// 微架构分析_create
import { Component, OnInit, OnChanges, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AxiosService } from '../../service/axios.service';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import {
  AbstractControl, ValidationErrors, ValidatorFn,
  FormControl,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MytipService } from '../../service/mytip.service';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { SpinnerBlurInfo, LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { CustomValidatorsService } from '../../service';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-structure',
  templateUrl: './mission-structure.component.html',
  styleUrls: ['./mission-structure.component.scss', '../mission-components/task-form/task-form.component.scss']
})
export class MissionStructureComponent implements OnInit, OnChanges {

  constructor(
    public http: HttpService,
    public I18n: I18nService,
    public Axios: AxiosService, fb: FormBuilder,
    public scheduleTaskServer: ScheduleTaskService,
    public mytip: MytipService,
    private tiMessage: MessageModalService,
    public customValidatorsService: CustomValidatorsService) {
    this.i18n = I18n.I18n();

    // micarch校验
    this.launchItemsMicarchForm = fb.group({
      nodeList: new FormControl([]),
      dire_ctrl: new FormControl('', []),
      dire_input_ctrl: new FormControl('', {
        updateOn: 'change',
      }),
      mode_ctrl: new FormControl('summary', []),
      cpu_ctrl: new FormControl({
        label: this.i18n.common_term_task_start_custerm,
        id: 'customize',
      }, []),
      cpu_spinner_ctrl: new FormControl(5, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(999),
      ]),
      analysisTypes: new FormControl('', [TiValidators.required]),
      sampling_ctrl: new FormControl(60, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(900),
      ]),
      typeItem_ctrl: new FormControl({
        label: this.i18n.micarch.typeItem_all,
        id: 'all',
      }, []),
      timing_spinner_ctrl: new FormControl(0, [
        TiValidators.required,
        TiValidators.minValue(0),
        TiValidators.maxValue(900),
        this.customValidatorsService.validTheSizeRelationship({
          relatedFormControlName: 'sampling_ctrl',
          tip: this.i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
          calcExpression: ([valueA, valueB]) => valueA + valueB <= 900,
        })
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(1024, [
        TiValidators.minValue(1),
        TiValidators.maxValue(1024),
      ]),
    });
    this.micarchCurrntForm = this.launchItemsMicarchForm;
    this.profileItemsMicarchForm = fb.group({
      nodeList: new FormControl([]),
      mode_ctrl: new FormControl('summary', []),
      cpu_ctrl: new FormControl({
        label: this.i18n.common_term_task_start_custerm,
        id: 'customize',
      }, []),
      cpu_spinner_ctrl: new FormControl(5, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(999),
      ]),
      analysisTypes: new FormControl('', [TiValidators.required]),
      sampling_ctrl: new FormControl(60, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(900),
      ]),
      cpu_kernel_ctrl: new FormControl('', [this.customValidatorsService.checkSampCPUMask()]),
      typeItem_ctrl: new FormControl({
        label: this.i18n.micarch.typeItem_all,
        id: 'all',
      }, []),
      timing_spinner_ctrl: new FormControl(0, [
        TiValidators.required,
        TiValidators.minValue(0),
        TiValidators.maxValue(900),
        this.customValidatorsService.validTheSizeRelationship({
          relatedFormControlName: 'sampling_ctrl',
          tip: this.i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
          calcExpression: ([valueA, valueB]) => valueA + valueB <= 900,
        })
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(1024, [
        TiValidators.minValue(1),
        TiValidators.maxValue(1024),
      ]),
    });
    this.attachItemsMicarchForm = fb.group({
      nodeList: new FormControl([]),
      mode_ctrl: new FormControl('summary', []),
      cpu_ctrl: new FormControl({
        label: this.i18n.common_term_task_start_custerm,
        id: 'customize',
      }, []),
      cpu_spinner_ctrl: new FormControl(5, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(999),
      ]),
      analysisTypes: new FormControl('', [TiValidators.required]),
      sampling_ctrl: new FormControl(60, [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(900),
      ]),
      typeItem_ctrl: new FormControl({
        label: this.i18n.micarch.typeItem_all,
        id: 'all',
      }, []),
      timing_spinner_ctrl: new FormControl(0, [
        TiValidators.required,
        TiValidators.minValue(0),
        TiValidators.maxValue(900),
        this.customValidatorsService.validTheSizeRelationship({
          relatedFormControlName: 'sampling_ctrl',
          tip: this.i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
          calcExpression: ([valueA, valueB]) => valueA + valueB <= 900,
        })
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(1024, [
        TiValidators.minValue(1),
        TiValidators.maxValue(1024),
      ]),
    });

    this.micarchItems = {
      kcore: { // 内核函数关联汇编指令
        label: this.i18n.mission_create.kcore,
        required: false,
      },
      // 采集文件大小
      filesize: {
        label: this.i18n.mission_create.collection_size,
        required: false,
        type: 'spinner',
        value: 1024,
        correctable: false,
        min: 1,
        max: 1024,
        step: 100,
        format: 'n0',
        iconTip: this.i18n.falsesharing.filesizeTips,
        tailPrompt: this.i18n.common_term_sign_left + '1~1,024' + this.i18n.common_term_sign_right,
        placeholder: '1-1,024'
      },
      params_c: {
        label: this.i18n.common_term_task_crate_parameters,
        required: false,
      },
      path: {
        label: this.i18n.common_term_task_crate_path,
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
      analysis: {
        disabled: false,
        label: this.i18n.micarch.label.analysis,
        options: [
          { id: 'badSpeculation', text: 'Bad Speculation', tip: this.i18n.micarch.badSpeculation_tip },
          { id: 'frontEndBound', text: 'Front-End Bound', tip: this.i18n.micarch.frontEndBound_tip },
          { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: this.i18n.micarch.resourceBound_tip },
          { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: this.i18n.micarch.coreBound_tip },
          { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: this.i18n.micarch.memoryBound_tip },
        ]
      },
      typeItem: {
        label: this.i18n.micarch.label.typeItem,
        selected: {
          label: this.i18n.micarch.typeItem_all,
          id: 'all',
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

      samplingSwitch: {
        label: this.i18n.micarch.label.simpling,
        required: false,
        selected: 'summary',
        tip: this.i18n.micarch.summury_mode_tip,
        options: [
          {
            key: this.i18n.micarch.summury_mode,
            id: 'summary',
            disable: false,
          },
          {
            key: this.i18n.micarch.detail_mode,
            id: 'detail',
            disable: false,
          },
        ]
      },
      res_d: {
        placeholder: '1-900',
        min: 1,
        max: 900,
        format: 'N0',
        step: 1,
        tailPrompt: this.i18n.common_term_sign_left + '1~900' + this.i18n.common_term_sign_right,
      },
      cpu: {
        label: this.i18n.common_term_task_crate_interval_ms,
        required: true,
        tip: this.i18n.micarch.simpling_delay_tip,
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
          placeholder: '1-999',
          min: 1,
          max: 999,
          format: 'N0',
          step: 1,
        },
        spinner_delay: {
          placeholder: '0-900',
          min: 0,
          max: 900,
          format: 'N0',
          step: 1,
          tailPrompt: this.i18n.common_term_sign_left + '0~900' + this.i18n.common_term_sign_right,
        },
        tailPrompt: this.i18n.common_term_sign_left + '1~999' + this.i18n.common_term_sign_right,
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
      trace: {
        label: this.i18n.process.label.trace,
        required: false,
      },
      collection: {
        label: this.i18n.process.label.thread,
        required: true,
      },
    };
    this.LaunchItemsLock = {
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
    this.startCheckMicarch = {
      title: this.i18n.common_term_task_start_now,
      checked: true
    };
  }
  @ViewChild('nodeConfigM') nodeConfigM: any;
  @ViewChild('preSwitchMicarch') preSwitchMicarch: any;
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

  public isLaunch: boolean;
  public isAttach: boolean;
  public isProfile: boolean;
  public isEdit: boolean;
  public i18n: any;
  public isRestart: boolean;
  public micarchItems: any = {};
  public launchItemsMicarchForm: FormGroup;
  public attachItemsMicarchForm: FormGroup;
  public profileItemsMicarchForm: FormGroup;
  public advanceMicarchForm: FormGroup;
  public micarchCurrntForm: FormGroup;
  public LaunchItemsLock: any = {};
  public startCheckMicarch: any = {};
  public processItems: any = {};
  public advanceParams = false;
  public lockTypeOptions: Array<any> = [
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
  // 表单验证部分
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public micarchTypeSelected: any = this.lockTypeOptions[0];
  public appAndPidValid = false;
  public formDatas: any;
  public keepData: any; // 保存模板
  public typeLDesc = '';
  public micarchSimplingType: any = { more: [], little: [] };

  // 修改预约任务 接收从预约传来的值
  public editScheduleTask = false; // 判断是否是修改
  public scheduleTaskId: any; // 保存修改的预约任务ID

  public runUserData = {
    runUser: false,
    user: '',
    password: ''
  };
  public runUserDataObj: LaunchRunUser = {};

  public intervalBlur: SpinnerBlurInfo;
  public collectFileBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;
  public delaySamplingDurationBlur: SpinnerBlurInfo;
  public isShowReserveAndImmedia = false;
  // 工程下节点信息
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;

  ngOnInit() {
    this.getProjectNodes();
    this.micarchSimplingType.more = [
      { id: 'badSpeculation', text: 'Bad Speculation', tip: this.i18n.micarch.badSpeculation_tip },
      { id: 'frontEndBound', text: 'Front-End Bound', tip: this.i18n.micarch.frontEndBound_tip },
      { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: this.i18n.micarch.resourceBound_tip },
      { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: this.i18n.micarch.coreBound_tip },
      { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: this.i18n.micarch.memoryBound_tip },
    ],
    this.micarchSimplingType.little = [
      { id: 'badSpeculation', text: 'Bad Speculation', tip: this.i18n.micarch.badSpeculation_tip },
      { id: 'frontEndBound', text: 'Front-End Bound', tip: this.i18n.micarch.frontEndBound_tip },
      { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: this.i18n.micarch.coreBound_tip },
      { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: this.i18n.micarch.memoryBound_tip },
    ];

    this.setSpinnerBlur();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'switchState':
          if (changes.switchState.currentValue) {
            this.runUserData.runUser = true;
            // 立即执行为true
            this.startCheckMicarch.checked = true;
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
          this.runUserData.password = changes.modeApplicationPassWord.currentValue;
          break;
        case 'typeId':
          this.appAndPidValid = false;
          this.clear();
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
        default: break;
      }
    }

    switch (changes.typeId ? changes.typeId.currentValue : this.typeId) {
      case 0:
        this.isProfile = true;
        this.appAndPidValid = true;
        this.isLaunch = false;
        this.isAttach = false;
        this.micarchCurrntForm = this.profileItemsMicarchForm;
        this.micarchTypeSelected = this.lockTypeOptions[1];
        break;
      case 1:
        this.isProfile = false;
        this.isLaunch = true;
        this.appAndPidValid = this.modeAppValid;
        this.isAttach = false;
        this.micarchCurrntForm = this.launchItemsMicarchForm;
        this.micarchTypeSelected = this.lockTypeOptions[0];
        break;
      case 2:
        this.isProfile = false;
        this.isLaunch = false;
        this.isAttach = true;
        this.appAndPidValid = this.modePidValid;
        this.micarchCurrntForm = this.attachItemsMicarchForm;
        this.micarchTypeSelected = this.lockTypeOptions[2];
        break;
    }
  }
  public changeAppDire(type: any) { }
  public directory_change(data: any, modal: any) {
    const ctrls: any = '';
    if (data.id === 'customize') {
      ctrls.dire_input_ctrl.enable();
      ctrls.dire_input_ctrl.setValue('');
    } else {
      ctrls.dire_input_ctrl.disable();
      ctrls.dire_input_ctrl.setValue('');
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
          this.micarchCurrntForm.controls.nodeList.setValue(
            this.nodeList.length > 10 ? this.nodeList.slice(0, 10) : this.nodeList
          );
        }
      }
      // 获取工程
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC') {
        this.micarchCurrntForm.get('nodeList').enable();
      } else {
        this.micarchCurrntForm.get('nodeList').disable();
      }
    });
  }
  // 微架构分析模式切换事件
  public simplingSwitchChange(data: any) {
    const form = this.micarchItems;

    if (form.samplingSwitch.lastValue !== data) {
      const formGroup = this.isProfile ? this.profileItemsMicarchForm :
        (this.isLaunch ? this.launchItemsMicarchForm : this.attachItemsMicarchForm);

      if (data === 'summary') {
        form.samplingSwitch.tip = this.i18n.micarch.summury_mode_tip;
        form.res_d.placeholder = '1~900';
        form.res_d.max = 900;
        form.res_d.tailPrompt = this.i18n.common_term_sign_left + '1~900' + this.i18n.common_term_sign_right;

        // 保存下detail的值
        if (form.samplingSwitch.lastValue === 'detail') {
          form.res_d.detail_value = formGroup.getRawValue().sampling_ctrl;
          form.cpu.detail_value = formGroup.getRawValue().cpu_spinner_ctrl;
        }

        // 设置summary的值
        formGroup.controls.sampling_ctrl.setValue(form.res_d.summary_value || '60');
        formGroup.controls.cpu_spinner_ctrl.setValue(form.cpu.summary_value || '5');

        formGroup.get('sampling_ctrl').setValidators([
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(900),
        ]);
        formGroup.get('sampling_ctrl').updateValueAndValidity();
      } else {
        form.samplingSwitch.tip = this.i18n.micarch.detail_mode_tip;
        form.res_d.placeholder = '1~30';
        form.res_d.max = 30;
        form.res_d.tailPrompt = this.i18n.common_term_sign_left + '1~30' + this.i18n.common_term_sign_right;

        // 保存下summary的值
        if (form.samplingSwitch.lastValue === 'summary') {
          form.res_d.summary_value = formGroup.getRawValue().sampling_ctrl;
          form.cpu.summary_value = formGroup.getRawValue().cpu_spinner_ctrl;
        }

        // 设置detail的值
        formGroup.controls.sampling_ctrl.setValue(form.res_d.detail_value || '10');
        formGroup.controls.cpu_spinner_ctrl.setValue(form.cpu.detail_value || '2');

        formGroup.get('sampling_ctrl').setValidators([
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(30),
        ]);
        formGroup.get('sampling_ctrl').updateValueAndValidity();
      }
      this.setSpinnerBlur();

      form.samplingSwitch.lastValue = data;
    }
  }
  public analysisTypesChange(data: any) {
  }

  public cpu_interval_change(data: any, cpu: any, type: string) {
    const THIS = cpu;
    THIS.unit =
      data.id === 'higher'
        ? this.i18n.common_term_task_crate_us
        : this.i18n.common_term_task_crate_ms;
    const spinnerVal = data.id === 'higher' ? '710' : '1';
    if (type === 'micarch') {
      const tempForm = this.isLaunch
        ? this.launchItemsMicarchForm
        : this.isAttach
          ? this.attachItemsMicarchForm
          : this.profileItemsMicarchForm;
      tempForm.controls.cpu_spinner_ctrl.setValue(spinnerVal);
      if (data.id === 'higher') {
        tempForm.controls.cpu_spinner_ctrl.disable();
      } else {
        tempForm.controls.cpu_spinner_ctrl.enable();
      }
    }
  }


  async createMicarchkAnalysis(isEdit: any): Promise<any> {
    const self = this;
    const temp = this.isLaunch
      ? this.launchItemsMicarchForm
      : this.isAttach
        ? this.attachItemsMicarchForm
        : this.profileItemsMicarchForm;
    const errors = TiValidators.check(temp);
    const ctrls = temp.controls;
    const params: any = {
      analysisType: 'microarchitecture',
      projectName: self.projectName,
      taskName: self.taskName,
      analysisTarget: self.micarchTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : 0.71,
      duration: ctrls.sampling_ctrl.value,
      samplingMode: ctrls.mode_ctrl.value,
      analysisIndex: ctrls.analysisTypes.value,
      samplingSpace: ctrls.typeItem_ctrl.value.id,
      samplingDelay: ctrls.timing_spinner_ctrl.value || 0,
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
      kcore: ctrls.kcore.value,
      perfDataLimit: ctrls.fileSize.value || 5000,
    };
    if (self.isLaunch) {
      params.appDir = this.modeApplication;
      params.appParameters = this.modeAppParams || '';
    }
    if (self.isProfile) {
      params.cpuMask = ctrls.cpu_kernel_ctrl.value;
    }
    if (self.isAttach) {
      params.targetPid = this.modePid;
      params.process_name = this.modeProcess;
    }
    if (this.nodeConfigM.switchStatus) {
      params.switch = true;
      const nodeData: any = this.nodeConfigM.getNodesConfigParams();
      params.nodeConfig = nodeData.map((item: any, index: any) => {
        if (!Object.keys(this.runUserDataObj).includes(item.node)) {
          this.runUserDataObj[item.node] = {
            runUser: this.runUserData.runUser,
            user_name: this.runUserData.user,
            password: this.runUserData.password
          };
        }
        item.task_param.taskName = params.taskName;
        item.task_param.interval = params.interval;
        item.task_param.duration = params.duration;
        item.task_param.samplingMode = params.samplingMode;
        item.task_param.analysisIndex = params.analysisIndex;
        item.task_param.cpuType = params.cpuType;
        item.task_param.samplingSpace = params.samplingSpace;
        item.task_param.samplingDelay = params.samplingDelay;
        item.task_param.projectname = params.projectname;
        const obj: any = {};
        obj.nodeId = item.nodeId;
        obj.nickName = item.nickName;
        obj.taskParam = Object.assign({}, item.task_param);
        return obj;
      });
    } else {
      params.switch = false;
      params.nodeConfig = await this.getNodeConfigDatas(
        params.analysisType
      );
    }
    if (this.isRestart) {
      this.restartFunction(params);
      return false;
    }
    //  预约任务 preSwitch 预约组件名
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
            if (self.startCheckMicarch.checked) {
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
          .catch((error: any) => { });
      } else {
        this.tiMessage.open({
          type: 'warn',
          title: this.i18n.secret_title,
          content: this.i18n.secret_count,
          close() {
            // 判断是否打开指定运行用户
            const keyList = Object.keys(self.runUserDataObj);
            keyList.forEach((key) => {
              if (self.runUserDataObj[key].user_name && self.runUserDataObj[key].password) {
                params.is_user = true;
              }
            });
            const urlAnalysis = '/tasks/';

            // 调优助手跳转创建任务
            if (self.taskDetail.isFromTuningHelper) {
              Object.assign(
                params,
                {
                  suggestionId: self.taskDetail.suggestionId,  // 优化建议id
                  optimizationId: self.taskDetail.optimizationId,  // 调优助手任务id
                }
              );
            }
            self.Axios.axios
              .post(urlAnalysis, params)
              .then((res: any) => {
                const data = res.data;
                self.mytip.alertInfo({
                  type: 'success',
                  content: self.i18n.tip_msg.create_ok,
                  time: 3500,
                });
                if (self.startCheckMicarch.checked) {
                  self.startDataSamplingTask(
                    self.projectName,
                    self.taskName,
                    data.id,
                    params
                  );
                } else {
                  self.closeTab.emit({
                    title: `${data.taskName}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: data.analysisType,
                    status: data.taskStatus,
                    projectName: self.projectName
                  });
                }

              })
              .catch((error: any) => { });
          },
        });
      }
    }
  }
  // 保存模板
  async saveTemplates() {
    const self = this;
    const temp = this.isLaunch
      ? this.launchItemsMicarchForm
      : this.isAttach
        ? this.attachItemsMicarchForm
        : this.profileItemsMicarchForm;
    const errors = TiValidators.check(temp);
    const ctrls = temp.controls;
    const params: any = {
      analysisType: 'microarchitecture',
      projectName: self.projectName,
      taskName: self.taskName,
      analysisTarget: self.micarchTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : 0.71,
      duration: ctrls.sampling_ctrl.value,
      samplingMode: ctrls.mode_ctrl.value,
      analysisIndex: ctrls.analysisTypes.value,
      samplingSpace: ctrls.typeItem_ctrl.value.id,
      samplingDelay: ctrls.timing_spinner_ctrl.value || 0,
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
      kcore: ctrls.kcore.value,
      perfDataLimit: ctrls.fileSize.value || 5000,
    };
    if (self.isLaunch) {
      params.appDir = this.modeApplication;
      params.appParameters = this.modeAppParams || '';
    }
    if (self.isProfile) {
      params.cpuMask = ctrls.cpu_kernel_ctrl.value;
    }
    if (self.isAttach) {
      params.targetPid = this.modePid;
      params.process_name = this.modeProcess;
    }
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
    if (this.nodeConfigM.switchStatus) {
      params.switch = true;
      const nodeData: any = this.nodeConfigM.getNodesConfigParams();
      params.nodeConfig = nodeData.map((item: any, index: any) => {
        if (!Object.keys(this.runUserDataObj).includes(item.nickName)) {
          this.runUserDataObj[item.nickName] = {
            runUser: this.runUserData.runUser,
            user_name: this.runUserData.user,
            password: this.runUserData.password
          };
        }
        item.task_param.taskName = params.taskName;
        item.task_param.interval = params.interval;
        item.task_param.duration = params.duration;
        item.task_param.samplingMode = params.samplingMode;
        item.task_param.analysisIndex = params.analysisIndex;
        item.task_param.cpuType = params.cpuType;
        item.task_param.samplingSpace = params.samplingSpace;
        item.task_param.samplingDelay = params.samplingDelay;
        const obj: any = {};
        obj.nodeId = item.nodeId;
        obj.nickName = item.nickName;
        obj.taskParam = Object.assign({}, item.task_param);
        return obj;
      });
    } else {
      params.switch = false;
      params.nodeConfig = await this.getNodeConfigDatas(
        params.analysisType
      );
    }
    this.keepData = params;
    this.sendMissionKeep.emit(this.keepData);
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
        this.nodeConfigM.clear();
        this.sendPretable.emit('on');
        this.closeTab.emit({});
        resolve(true);
      });
    });
  }


  // 当点击开启参数配置时
  public onControlNode(taskName: any) {
    if (taskName) {
      // 开启
      this.getFormDatas(taskName);
      let target = '';
      if (Object.prototype.hasOwnProperty.call(this.formDatas, 'analysisTarget')) {
        target = this.formDatas.analysisTarget;
      } else {
        return;
      }
      const type = this.formDatas['analysis-type'] || this.formDatas.analysisType;
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
        case 'microarchitecture':
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
      case 'm_attach':
        this.attachItemsMicarchForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'm_launch':
        this.launchItemsMicarchForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'm_profile':
        this.profileItemsMicarchForm.controls.cpu_kernel_ctrl.disable();
        this.profileItemsMicarchForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      default:
        this.sendAppOrPidDisable.emit(false);
        this.attachItemsMicarchForm.controls.source_ctrl.enable();
        this.micarchItems.analysis.disabled = false;
        this.launchItemsMicarchForm.controls.source_ctrl.enable();
        this.micarchItems.analysis.disabled = false;
        this.profileItemsMicarchForm.controls.cpu_kernel_ctrl.enable();
        this.profileItemsMicarchForm.controls.source_ctrl.enable();
        this.micarchItems.analysis.disabled = false;
        break;
    }
  }
  // 获取数据
  public getFormDatas(str: string) {
    const self = this;
    const temp = this.isLaunch
      ? this.launchItemsMicarchForm
      : this.isAttach
        ? this.attachItemsMicarchForm
        : this.profileItemsMicarchForm;
    const errors = TiValidators.check(temp);
    const ctrls = temp.controls;
    const params: any = {
      analysisType: 'microarchitecture',
      projectName: self.projectName,
      taskName: self.taskName,
      analysisTarget: self.micarchTypeSelected.label,
      duration: ctrls.sampling_ctrl.value,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : 0.71,
      samplingMode: ctrls.mode_ctrl.value,
      analysisIndex: ctrls.analysisTypes.value,
      samplingSpace: ctrls.typeItem_ctrl.value.id,
      samplingDelay: ctrls.timing_spinner_ctrl.value || 0,
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
      kcore: ctrls.kcore.value,
      perfDataLimit: ctrls.fileSize.value || 5000,
    };
    if (self.isLaunch) {
      params.appDir = this.modeApplication || '';
      params.appParameters = this.modeAppParams || '';
    }
    if (self.isProfile) {
      params.cpuMask = ctrls.cpu_kernel_ctrl.value;
    }
    if (self.isAttach) {
      params.targetPid = this.modePid;
      params.process_name = this.modeProcess;
    }
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
    this.formDatas = params;
    return;
  }
  // 当配置节点参数没开时
  async getNodeConfigDatas(params: any) {
    this.getFormDatas(params);
    // 当开关组件没有打开时
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      const data: any = [];
      this.Axios.axios.get(url).then((res: any) => {
        const nodeList = this.sceneName === 'HPC'
          ? this.micarchCurrntForm.get('nodeList').value
          : res.data.nodeList;
        nodeList.forEach((item: any) => {
          this.runUserDataObj[item.nodeIp] = {
            runUser: this.runUserData.runUser,
            user_name: this.runUserData.user,
            password: this.runUserData.password
          };
          data.push({
            nodeId: item.id,
            nickName: item.nickName,
            taskParam: Object.assign({}, { status: false }, this.formDatas),
          });
        });
        resolve(data);
      });
    });
  }
  // 清空任务参数
  public clear() {
    if (this.nodeConfigM) {
      this.nodeConfigM.clear();
    }
    if (this.preSwitchMicarch) {
      this.preSwitchMicarch.clear();
    }
  }

  // 导入模板
  public getTemplateData(e: any) {
    this.taskNameValid = true;
    this.modeAppValid = true;
    this.modePidValid = true;
    const form = this.micarchItems;

    if (e.analysisTarget.indexOf('Launch') > -1) {
      this.typeLDesc = this.i18n.common_term_task_type_launch;
      this.isLaunch = true;
      this.isProfile = false;
      this.isAttach = false;

      this.micarchTypeSelected = this.lockTypeOptions[0];

      // 切换采样模式时会根据保存的值setValue
      form.res_d[`${e.samplingMode}_value`] = e.duration;
      form.cpu[`${e.samplingMode}_value`] = e.interval;

      this.launchItemsMicarchForm.controls.mode_ctrl.setValue(e.samplingMode);
      this.launchItemsMicarchForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.launchItemsMicarchForm.controls.source_ctrl.setValue(
        e.sourceLocation
      );
      const typeItem = this.micarchItems.typeItem.options.filter((val: any) => {
        return val.id === e.samplingSpace;
      });
      this.launchItemsMicarchForm.controls.typeItem_ctrl.setValue(
        typeItem[0]
      );
      this.launchItemsMicarchForm.controls.timing_spinner_ctrl.setValue(
        e.samplingDelay
      );
      this.launchItemsMicarchForm.controls.analysisTypes.setValue(
        e.analysisIndex
      );
      this.launchItemsMicarchForm.controls.kcore.setValue(e.kcore);
      this.launchItemsMicarchForm.controls.fileSize.setValue(
        e.perfDataLimit
      );
    } else if (e.analysisTarget.indexOf('Profile') > -1) {
      this.typeLDesc = this.i18n.common_term_task_type_profile;
      this.isLaunch = false;
      this.isProfile = true;
      this.isAttach = false;
      this.micarchTypeSelected = this.lockTypeOptions[1];
      this.profileItemsMicarchForm.controls.cpu_kernel_ctrl.setValue(
        e.cpuMask
      );
      if (e.interval === '0.71') {
        this.profileItemsMicarchForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }

      // 切换采样模式时会根据保存的值setValue
      form.res_d[`${e.samplingMode}_value`] = e.duration;
      form.cpu[`${e.samplingMode}_value`] = e.interval;

      this.profileItemsMicarchForm.controls.mode_ctrl.setValue(e.samplingMode);
      this.profileItemsMicarchForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.profileItemsMicarchForm.controls.source_ctrl.setValue(
        e.sourceLocation
      );
      const typeItem = this.micarchItems.typeItem.options.filter((val: any) => {
        return val.id === e.samplingSpace;
      });
      this.profileItemsMicarchForm.controls.typeItem_ctrl.setValue(
        typeItem[0]
      );
      this.profileItemsMicarchForm.controls.timing_spinner_ctrl.setValue(
        e.samplingDelay
      );
      this.profileItemsMicarchForm.controls.analysisTypes.setValue(
        e.analysisIndex
      );
      this.profileItemsMicarchForm.controls.kcore.setValue(e.kcore);
      this.profileItemsMicarchForm.controls.fileSize.setValue(
        e.perfDataLimit
      );
      this.micarchCurrntForm = this.profileItemsMicarchForm;
    } else if (e.analysisTarget.indexOf('Attach') > -1) {
      this.typeLDesc = this.i18n.common_term_task_type_attach;
      this.isLaunch = false;
      this.isProfile = false;
      this.isAttach = true;
      this.micarchTypeSelected = this.lockTypeOptions[2];

      // 切换采样模式时会根据保存的值setValue
      form.res_d[`${e.samplingMode}_value`] = e.duration;
      form.cpu[`${e.samplingMode}_value`] = e.interval;

      this.attachItemsMicarchForm.controls.mode_ctrl.setValue(e.samplingMode);

      this.attachItemsMicarchForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.attachItemsMicarchForm.controls.source_ctrl.setValue(
        e.sourceLocation
      );
      const typeItem = this.micarchItems.typeItem.options.filter((val: any) => {
        return val.id === e.samplingSpace;
      });
      this.attachItemsMicarchForm.controls.typeItem_ctrl.setValue(
        typeItem[0]
      );
      this.attachItemsMicarchForm.controls.timing_spinner_ctrl.setValue(
        e.samplingDelay
      );
      this.attachItemsMicarchForm.controls.analysisTypes.setValue(
        e.analysisIndex
      );
      this.attachItemsMicarchForm.controls.kcore.setValue(e.kcore);
      this.attachItemsMicarchForm.controls.fileSize.setValue(
        e.perfDataLimit
      );
      this.micarchCurrntForm = this.attachItemsMicarchForm;
    }
    this.micarchCurrntForm.get('nodeList').setValue(e.nodeConfig);

    // 预约任务数据导入
    this.preSwitchMicarch.importTemp(e);
    // 配置节点参数
    if (e.switch) {
      switch (e.analysisTarget) {
        case 'Launch Application':
          this.onDisableForm('m_launch');
          break;
        case 'Profile System':
          this.onDisableForm('m_profile');
          break;
        case 'Attach to Process':
          this.onDisableForm('m_attach');
          break;
        default:
          break;
      }
      // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
      setTimeout(() => this.nodeConfigM.importTemp(e.nodeConfig));
    } else {
      this.nodeConfigM.clear();
    }
    if (this.isEdit || this.isRestart) {
      this.preSwitchMicarch.isEdit = this.isEdit || this.isRestart;
    }
  }

  // 立即启动
  public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
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
            const taskName = params.taskname || params.taskName;
            const taskType = params['analysis-type'] || params.analysisType;
            self.closeTab.emit({
              title: `${taskName}-${params.nodeConfig[0].nickName}`,
              id: backData.id,
              nodeid: params.nodeConfig[0].nodeId,
              taskId: backData.id,
              taskType,
              status: backData['task-status'],
              projectName: self.projectName
            });
          });
      });
  }

  //  重启
  public restartFunction(params: any) {
    params.status = 'restarted';
    const self = this;
    if (self.isLaunch) {
      params.user_message = self.dealRunUserDataObj(self.runUserDataObj);
    }
    // 调优助手跳转创建任务
    if (self.taskDetail.isFromTuningHelper) {
      Object.assign(
        params,
        {
          suggestionId: self.taskDetail.suggestionId,  // 优化建议id
          optimizationId: self.taskDetail.optimizationId,  // 调优助手任务id
        }
      );
    }
    self.Axios.axios
      .put('/tasks/' + self.restartAndEditId + '/status/', params)
      .then((res: any) => {
        const data = res.data;
        self.closeTab.emit({
          title: `${params.taskName}-${params.nodeConfig[0].nickName}`,
          id: data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: data.id,
          taskType: params.analysisType,
          status: params.taskStatus,
          projectName: self.projectName
        });
        self.mytip.alertInfo({ type: 'info', content: self.i18n.mission_create.restartSuccess, time: 3500 });

        self.isRestart = false;
      })
      .catch((error: any) => {
      });
  }
  // 取消按钮
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    const form = this.isLaunch
      ? this.launchItemsMicarchForm
      : this.isAttach
        ? this.attachItemsMicarchForm
        : this.profileItemsMicarchForm;

    this.intervalBlur = {
      control: form.controls.cpu_spinner_ctrl,
      min: 1,
      max: 999,
    };
    this.collectFileBlur = {
      control: form.controls.fileSize,
      min: 1,
      max: 1024,
    };
    this.samplingDurationBlur = {
      control: form.controls.sampling_ctrl,
      min: 1,
      max: form.controls.mode_ctrl.value === 'summary' ? 900 : 30,
    };
    this.delaySamplingDurationBlur = {
      control: form.controls.timing_spinner_ctrl,
      min: 0,
      max: 900,
    };
  }

  private validFilePath(errorMessage: string): ValidatorFn {
    const reg = /^([\/][^\/]+)*$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = (control.value || '').toString().trim();
      if (tmpValue === '' || tmpValue == null) { return null; }

      return reg.test(tmpValue)
        ? null
        : { filePath: { tiErrorMessage: errorMessage } };
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
