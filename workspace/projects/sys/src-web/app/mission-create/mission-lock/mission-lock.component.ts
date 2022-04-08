import { Component, OnInit, OnChanges, ViewChild, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { TiMessageService, TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { SpinnerBlurInfo, LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { CustomValidatorsService } from '../../service';

@Component({
  selector: 'app-mission-lock',
  templateUrl: './mission-lock.component.html',
  styleUrls: ['./mission-lock.component.scss', '../mission-components/task-form/task-form.component.scss']
})
export class MissionLockComponent implements OnInit, OnChanges {
  constructor(
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
            id: 'application path'
          }, {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize'
          }
        ]
      },
      cpu: {
        label: this.i18n.common_term_task_crate_interval_ms,
        required: true,
        options: [
          {
            label: this.i18n.common_term_task_start_high_precision,
            id: 'higher'
          },
          {
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize'
          }
        ],
        spinner: {
          placeholder: '1-1,000',
          min: 1,
          max: 1000,
          format: 'N0',
          step: 1
        },
        tailPrompt: this.i18n.common_term_sign_left + '1~1,000' + this.i18n.common_term_sign_right,
      },
      c_d: {
        label: this.i18n.common_term_task_crate_duration,
        required: true,
        placeholder: '1-300',
        min: 1,
        max: 300,
        format: 'N0',
        step: 1,
        tailPrompt: this.i18n.common_term_sign_left + '1~300' + this.i18n.common_term_sign_right,
      },
      res_d: {
        label: this.i18n.common_term_task_crate_duration,
        required: true,
        placeholder: '1-60',
        min: 1,
        max: 60,
        format: 'N0',
        step: 1
      },
      mask: {
        label: this.i18n.ddr.cpuToBeSamples,
        tip: this.i18n.tip_msg.common_term_task_crate_mask_tip,
        required: false
      },
      b_s: {
        label: this.i18n.common_term_task_crate_bs_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
        required: false
      },
      c_source: {
        label: this.i18n.common_term_task_crate_c_path,
        tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
        required: false
      },
      j_source: {
        label: this.i18n.common_term_task_crate_java_path,
        tip: this.i18n.tip_msg.common_term_task_crate_j_source_tip,
        required: false
      },
      lock_function: {
        label: this.i18n.lock.form.functions_label,
        required: false
      },
      // 自定义函数
      custom_lock_function: {
        label: this.i18n.lock.form.custom_functions_label,
        required: false
      },
      profilingMode: 'Native',  // WebUI上不显示。
      sysWideState: 'on',  // WebUI上不显示。
      typeItem: { // 采样范围
        label: this.i18n.micarch.label.typeItem,
        selected: {
          label: this.i18n.micarch.typeItem_user,
          id: 'USER',
        },
        options: [
          {
            label: this.i18n.micarch.typeItem_all,
            id: 'ALL',
          },
          {
            label: this.i18n.micarch.typeItem_user,
            id: 'USER',
          },
          {
            label: this.i18n.micarch.typeItem_kernel,
            id: 'SYS',
          },
        ],
      },
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
        max: 4096,
        step: 1,
        format: 'n0',
        iconTip: this.i18n.falsesharing.filesizeTips,
        tailPrompt: this.i18n.common_term_sign_left + '1~4,096' + this.i18n.common_term_sign_right,
        placeholder: '1-4,096'
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
    this.profileItemLock = {
      c_dVal: 30,
      cpu: {
        unit: this.i18n.common_term_task_crate_ms,
        spinnerVal: 710,
      },
      maskVal: '',
      b_sVal: '',
      c_sourceVal: '',
    };

    this.attachItemsLock = {
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
    // lock
    this.launchItemsLockForm = fb.group({
      nodeList: new FormControl([]),
      cpu_ctrl: new FormControl('', []),
      cpu_spinner_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      dire_ctrl: new FormControl('', []),
      functionNamesForm: new FormControl('', []),
      functions: new FormControl('', [this.customValidatorsService.lockFunctionValidator]), // 函数名
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      // 采样范围
      typeItem_ctrl: new FormControl({
        label: this.i18n.micarch.typeItem_user,
        id: 'USER',
      }, []),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(1024, [
        TiValidators.minValue(1),
        TiValidators.maxValue(4096),
      ]),
    });

    this.lCurrntFormLock = this.launchItemsLockForm;
    this.attachItemsLockForm = fb.group({
      nodeList: new FormControl([]),
      c_d_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      cpu_ctrl: new FormControl('', []),
      cpu_spinner_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      functionNamesForm: new FormControl('', []),
      functions: new FormControl('', [this.customValidatorsService.lockFunctionValidator]), // 函数名
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      // 采样范围
      typeItem_ctrl: new FormControl({
        label: this.i18n.micarch.typeItem_user,
        id: 'USER',
      }, []),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(1024, [
        TiValidators.minValue(1),
        TiValidators.maxValue(4096),
      ]),
    });
    this.profileItemsLockForm = fb.group({
      nodeList: new FormControl([]),
      c_d_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      cpu_ctrl: new FormControl('', []),
      cpu_spinner_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(1000),
      ]),
      functionNamesForm: new FormControl('', []),
      functions: new FormControl('', [this.customValidatorsService.lockFunctionValidator]), // 函数名
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      source_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      // 采样范围
      typeItem_ctrl: new FormControl({
        label: this.i18n.micarch.typeItem_user,
        id: 'USER',
      }, []),
      kcore: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(1024, [
        TiValidators.minValue(1),
        TiValidators.maxValue(4096),
      ]),
    });
    this.startCheckLock = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    this.functionNames = [
      // 使用 select 标记 all 状态
      {
        label: 'All',
        value: 'all',
        select: true
      },
      // Mutex(互斥锁)
      {
        label: 'pthread_mutex_lock',
        value: '^_{,2}pthread_mutex_lock',
      },
      {
        label: 'pthread_mutex_trylock',
        value: '^_{,2}pthread_mutex_trylock',
      },
      {
        label: 'pthread_mutex_unlock',
        value: '^_{,2}pthread_mutex_unlock',
      },
      // Cond(条件变量)
      {
        label: 'pthread_cond_wait',
        value: '^_{,2}pthread_cond_wait',
      },
      {
        label: 'pthread_cond_timedwait',
        value: '^_{,2}pthread_cond_timedwait',
      },
      {
        label: 'pthread_cond_reltimedwait_np',
        value: '^_{,2}pthread_cond_reltimedwait_np',
      },
      {
        label: 'pthread_cond_signal',
        value: '^_{,2}pthread_cond_signal',
      },
      {
        label: 'pthread_cond_broadcast',
        value: '^_{,2}pthread_cond_broadcast',
      },
      // Rwlock
      {
        label: 'pthread_rwlock_rdlock',
        value: '^_{,2}pthread_rwlock_rdlock',
      },
      {
        label: 'pthread_rwlock_tryrdlock',
        value: '^_{,2}pthread_rwlock_tryrdlock',
      },
      {
        label: 'pthread_rwlock_wrlock',
        value: '^_{,2}pthread_rwlock_wrlock',
      },
      {
        label: 'pthread_rwlock_trywrlock',
        value: '^_{,2}pthread_rwlock_trywrlock',
      },
      {
        label: 'pthread_rwlock_unlock',
        value: '^_{,2}pthread_rwlock_unlock',
      },
      // Semaphore(信号量)
      {
        label: 'sem_post',
        value: '^_{,2}sem_post',
      },
      {
        label: 'sem_wait',
        value: '^_{,2}sem_wait',
      },
      {
        label: 'sem_trywait',
        value: '^_{,2}sem_trywait',
      },
      // Spinlock(自旋锁)
      {
        label: 'pthread_spin_lock',
        value: '^_{,2}pthread_spin_lock',
      },
      {
        label: 'pthread_spin_trylock',
        value: '^_{,2}pthread_spin_trylock',
      },
      {
        label: 'pthread_spin_unlock',
        value: '^_{,2}pthread_spin_unlock',
      },
      // sleep
      {
        label: 'sleep',
        value: '^_{,2}sleep',
      },
      {
        label: 'usleep',
        value: '^_{,2}usleep',
      },
    ];
  }
  @ViewChild('nodeConfigL') nodeConfigL: any;
  @ViewChild('preSwitchLock') preSwitchLock: any;
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
  @Input() modePid: string;
  @Input() modeProcess: string;
  @Input() switchState: boolean;
  @Input() modeApplicationUser: string;
  @Input() modeApplicationPassWord: string;
  @Input() modeAppValid: boolean;
  @Input() modePidValid: boolean;
  @Input() projectId: number;
  @Input() restartAndEditId: number;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Input() isModifySchedule: boolean;
  @Input() actionType: string;
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
  public launchItemsLockForm: FormGroup;
  public attachItemsLockForm: FormGroup;
  public profileItemsLockForm: FormGroup;
  public lCurrntFormLock: FormGroup;

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
  public lockTypeSelected: any = this.lockTypeOptions[0];
  public LaunchItemsLock: any = {};
  public profileItemLock: any = {};
  public attachItemsLock: any = {};
  public startCheckLock: any = {};

  public typeLDesc = '';
  public keepData: any; // 保存模板
  public appAndPidValid = false;
  public nodeList = false;
  // 获取数据
  public formDatas: any;
  // 修改预约任务 接收从预约传来的值
  public editScheduleTask = false; // 判断是否是修改
  public scheduleTaskId: any; // 保存修改的预约任务ID
  public isCustomFlag = false; // 函数选择是否是自定义
  public functionNamesSelected: any;
  public functionNames: any;
  public runUserData = {
    runUser: false,
    user: '',
    password: ''
  };
  public runUserDataObj: LaunchRunUser = {};

  public intervalBlur: SpinnerBlurInfo;
  public collectFileBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;
  public isShowReserveAndImmedia = false;

  /** 工程下的所以节点 */
  public allNodeList: any = [];
  /** 工程类型 */
  public isHpcPro = false;
  /** hpc工程节点选择器是否禁用 */
  public isSelectNodeDisabled = false;

  async ngOnInit() {
    this.allNodeList = await this.getProjectNodes();
    if (!(this.isEdit || this.isRestart || this.isModifySchedule)) {
      this.lCurrntFormLock.controls.nodeList.setValue(
        this.allNodeList.length > 10 ? this.allNodeList.slice(0, 10) : this.allNodeList
      );
    }
    this.onDisabledFormNodeList();
    if (this.actionType !== 'restart') {
      // 默认全选标准函数
      const cloneFunNames = [].concat(this.functionNames);
      this.functionNamesSelected = cloneFunNames;
    }

    this.profileItemsLockForm.controls.cpu_spinner_ctrl.setValue('1');
    this.profileItemsLockForm.controls.c_d_ctrl.setValue('30');
    this.profileItemsLockForm.controls.cpu_ctrl.setValue({
      label: this.i18n.common_term_task_start_custerm,
      id: 'customize',
    });

    this.launchItemsLockForm.controls.cpu_spinner_ctrl.setValue('1');
    this.launchItemsLockForm.controls.dire_ctrl.setValue({
      label: this.i18n.common_term_task_start_path,
      id: 'application path',
    });
    this.launchItemsLockForm.controls.cpu_ctrl.setValue({
      label: this.i18n.common_term_task_start_custerm,
      id: 'customize',
    });

    this.attachItemsLockForm.controls.cpu_spinner_ctrl.setValue('1');
    this.attachItemsLockForm.controls.c_d_ctrl.setValue('30');
    this.attachItemsLockForm.controls.cpu_ctrl.setValue({
      label: this.i18n.common_term_task_start_custerm,
      id: 'customize',
    });

    this.setSpinnerBlur();
  }

  /**
   * 获取工程下所有节点
   */
  public getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(url).then((res: any) => {
        if (res.data.sceneName === 'HPC') {
          this.isHpcPro = true;
        }
        resolve(res.data.nodeList);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'switchState':
          if (changes.switchState.currentValue) {
            this.runUserData.runUser = true;
            this.startCheckLock.checked = true;
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
            this.runUserData.password = changes.modeApplicationPassWord.currentValue;
          }
          break;
        case 'typeId':
          if (changes.typeId.currentValue) {
            this.appAndPidValid = false;
            if (this.nodeConfigL) {
              this.nodeConfigL.clear();
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
        default: break;
      }
    }
    switch (changes.typeId ? changes.typeId.currentValue : this.typeId) {
      case 0:
        this.isProfile = true;
        this.appAndPidValid = true;
        this.isLaunch = false;
        this.isAttach = false;
        this.lCurrntFormLock = this.profileItemsLockForm;
        this.lockTypeSelected = this.lockTypeOptions[1];
        break;
      case 1:
        this.isProfile = false;
        this.isLaunch = true;
        this.appAndPidValid = this.modeAppValid;
        this.isAttach = false;
        this.lCurrntFormLock = this.launchItemsLockForm;
        this.lockTypeSelected = this.lockTypeOptions[0];
        break;
      case 2:
        this.isProfile = false;
        this.isLaunch = false;
        this.isAttach = true;
        this.appAndPidValid = this.modePidValid;
        this.lCurrntFormLock = this.attachItemsLockForm;
        this.lockTypeSelected = this.lockTypeOptions[2];
        break;
    }
  }

  public cpu_interval_change(data: any, cpu: any, type: string) {
    const THIS = cpu;
    THIS.unit =
      data.id === 'higher'
        ? this.i18n.common_term_task_crate_us
        : this.i18n.common_term_task_crate_ms;
    const spinnerVal = data.id === 'higher' ? '710' : '1';
    if (type === 'lock') {
      const tempForm = this.isLaunch
        ? this.launchItemsLockForm
        : this.isAttach
          ? this.attachItemsLockForm
          : this.profileItemsLockForm;
      tempForm.controls.cpu_spinner_ctrl.setValue(spinnerVal);
      if (data.id === 'higher') {
        tempForm.controls.cpu_spinner_ctrl.disable();
      } else {
        tempForm.controls.cpu_spinner_ctrl.enable();
      }
    }
  }
  // 当点击开启参数配置时
  public onControlNode(taskName: any) {
    if (taskName) {
      // 开启
      this.getFormDatas(taskName);
      let target = '';
      if (Object.prototype.hasOwnProperty.call(this.formDatas, 'analysis-target')) {
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
      case 'l_attach':
        this.attachItemsLockForm.controls.b_s_ctrl.disable();
        this.attachItemsLockForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'l_launch':
        this.launchItemsLockForm.controls.b_s_ctrl.disable();
        this.launchItemsLockForm.controls.source_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'l_profile':
        this.sendAppOrPidDisable.emit(true);
        this.profileItemsLockForm.controls.b_s_ctrl.disable();
        this.profileItemsLockForm.controls.source_ctrl.disable();
        break;
      default:
        this.sendAppOrPidDisable.emit(false);
        this.attachItemsLockForm.controls.b_s_ctrl.enable();
        this.attachItemsLockForm.controls.source_ctrl.enable();
        this.launchItemsLockForm.controls.b_s_ctrl.enable();
        this.launchItemsLockForm.controls.source_ctrl.enable();
        this.profileItemsLockForm.controls.b_s_ctrl.enable();
        this.profileItemsLockForm.controls.source_ctrl.enable();
        break;
    }
    this.onDisabledFormNodeList();
  }

  /**
   * 节点选择控件是否需要校验
   */
  private onDisabledFormNodeList() {
    if (this.isHpcPro) {
      this.profileItemsLockForm.controls.nodeList.enable();
      this.launchItemsLockForm.controls.nodeList.enable();
      this.attachItemsLockForm.controls.nodeList.enable();
    } else {
      this.profileItemsLockForm.controls.nodeList.disable();
      this.launchItemsLockForm.controls.nodeList.disable();
      this.attachItemsLockForm.controls.nodeList.disable();
    }
  }

  /**
   * 切换多节点配置组件开关
   * @param event 多节点组件开发状态
   */
  public selectNodeDisable(event: boolean){
    this.isSelectNodeDisabled = event;
  }

  public getFormDatas(str?: string) {
    const self = this;
    const temp = this.isLaunch
      ? this.launchItemsLockForm
      : this.isAttach
        ? this.attachItemsLockForm
        : this.profileItemsLockForm;
    const errors = TiValidators.check(temp);
    const ctrls = temp.controls;

    const totalFnNames = this.getFunctionNames(ctrls.functionNamesForm.value, ctrls.functions.value);
    const params: any = {
      'analysis-type': 'system_lock',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.lockTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : '0.71',
      'profiling-mode': 'Native',
      functionname: totalFnNames,
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
      collect_range: ctrls.typeItem_ctrl.value.id,
      kcore: ctrls.kcore.value,
      collect_file_size: ctrls.fileSize.value || 1024,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid;
      params.process_name = this.modeProcess;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.preSwitchLock.switchState) {
      // 预约
      if (this.preSwitchLock.selected === 1) {
        const durationArr = this.preSwitchLock.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchLock.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchLock.onceTime.split(' ');
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
      if (this.isHpcPro) {
        const curSelectNode = this.lCurrntFormLock.controls.nodeList.value;
        curSelectNode.forEach((item: any) => {
          this.runUserDataObj[item.nickName] = {
            runUser: this.runUserData.runUser,
            user_name: this.runUserData.user,
            password: this.runUserData.password
          };
          data.push({
            nodeId: item.id,
            nickName: item.nickName,
            task_param: Object.assign({}, { status: false }, this.formDatas),
          });
        });
        resolve(data);
      } else {
        this.Axios.axios.get(url).then((res: any) => {
          res.data.nodeList.forEach((item: any) => {
            this.runUserDataObj[item.nickName] = {
              runUser: this.runUserData.runUser,
              user_name: this.runUserData.user,
              password: this.runUserData.password
            };
            data.push({
              nodeId: item.id,
              nickName: item.nickName,
              task_param: Object.assign({}, { status: false }, this.formDatas),
            });
          });
          resolve(data);
        });
      }
    });
  }

  /**
   * 获取函数信息
   */
  public getFunctionNames(fnNames: any, customFns: any) {
    // 如果选项有all 则去除
    const finded = fnNames.find((item: any) => item.value === 'all');
    if (finded) {
      fnNames = fnNames.slice(1);
    }

    let namesFn = '';
    if (fnNames && fnNames.length) {
      const tmpArr: any = [];
      fnNames.map((item: any) => {
        tmpArr.push(item.value);
      });
      namesFn = tmpArr.join(';');
    }

    if (customFns && !namesFn) {
      return customFns;
    } else if (!customFns && namesFn) {
      return namesFn;
    } else if (!customFns && !namesFn) {
      return '';
    } else {
      return `${namesFn};${customFns}`;
    }
  }

  /**
   * 重启或导入模板时 设置函数和自定义函数的值
   */
  public setFunctionNames(orgName: any) {
    if (orgName) {
      const fnNames: any = [];
      const customFnNames: any = [];
      const splitArr = orgName.split(';');
      splitArr.map((item: any) => {
        const finded = this.functionNames.find((fnName: any) => fnName.value === item);
        if (finded) {
          fnNames.push(finded);
        } else {
          customFnNames.push(item);
        }
      });

      return {
        fnNames,
        customFnNames: customFnNames.join(';')
      };
    } else {
      return null;
    }
  }

  // 创建任务
  async createLockAnalysis(isEdit: any): Promise<any> {
    const self = this;
    const temp = this.isLaunch
      ? this.launchItemsLockForm
      : this.isAttach
        ? this.attachItemsLockForm
        : this.profileItemsLockForm;
    const errors = TiValidators.check(temp);
    const ctrls = temp.controls;

    const totalFnNames = this.getFunctionNames(ctrls.functionNamesForm.value, ctrls.functions.value);
    const params: any = {
      'analysis-type': 'system_lock',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.lockTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : '0.71',
      'profiling-mode': 'Native',
      functionname: totalFnNames,
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
      collect_range: ctrls.typeItem_ctrl.value.id,
      kcore: ctrls.kcore.value,
      collect_file_size: ctrls.fileSize.value || 1024,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid;
      params.process_name = this.modeProcess;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.nodeConfigL.switchStatus) {
      params.switch = true;
      this.getFormDatas();
      const nodeData: any = this.nodeConfigL.getNodesConfigParams(this.formDatas);
      if (self.isLaunch) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          if (!Object.keys(this.runUserDataObj).includes(item.nickName)) {
            this.runUserDataObj[item.nickName] = {
              runUser: this.runUserData.runUser,
              user_name: this.runUserData.user,
              password: this.runUserData.password
            };
          }
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.functionname = params.functionname;
          item.task_param.projectname = params.projectname;
          return item;
        });

      }
      if (self.isProfile) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.duration = params.duration;
          item.task_param.functionname = params.functionname;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
      if (self.isAttach) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.interval = params.interval;
          item.task_param.duration = params.duration;
          item.task_param.functionname = params.functionname;
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
    if (this.preSwitchLock.switchState) {
      this.startCheckLock.checked = false;
      const flag = await this.createPreMission(
        this.preSwitchLock,
        params,
        'post'
      );
      if (flag) {
        this.startCheckLock.checked = true;
      }
    } else {
      if (isEdit) {

        let urlAnalysis = '';

        urlAnalysis = '/tasks/' + this.restartAndEditId + '/';

        self.Axios.axios
          .put(urlAnalysis, params)
          .then((data: any) => {
            this.mytip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.edite_ok,
              time: 3500,
            });
            if (self.startCheckLock.checked) {
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
            const urlAnalysis = '/tasks/';
            // 判断是否打开指定运行用户
            const keyList = Object.keys(self.runUserDataObj);
            keyList.forEach((key) => {
              if (self.runUserDataObj[key].user_name && self.runUserDataObj[key].password) {
                params.is_user = true;
              }
            });
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
                self.mytip.alertInfo({
                  type: 'success',
                  content: self.i18n.tip_msg.create_ok,
                  time: 3500,
                });
                const data = res.data;
                if (self.startCheckLock.checked) {
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
        this.nodeConfigL.clear();
        this.sendPretable.emit('on');
        this.closeTab.emit({});
        resolve(true);
      });
    });
  }
  // 取消按钮
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }

  /**
   * 导入模板 重启时设置表单数据
   */
  public  async getTemplateData(e: any): Promise<void> {
    this.taskNameValid = true;
    this.appAndPidValid = true;
    const tmpFnNames = this.setFunctionNames(e.functionname);
    const typeItem = this.commentItems.typeItem.options.filter((val: any) => {
      return val.id === e.collect_range;
    });
    if (e['analysis-target'].indexOf('Launch') > -1) {
      this.typeLDesc = this.i18n.common_term_task_type_launch;
      this.isLaunch = true;
      this.isProfile = false;
      this.isAttach = false;

      this.lockTypeSelected = this.lockTypeOptions[0];
      this.launchItemsLockForm.controls.functionNamesForm.setValue(
        tmpFnNames ? tmpFnNames.fnNames : []
      );
      if (tmpFnNames) {
        if (tmpFnNames.fnNames.length === this.functionNames.length - 1) {
          this.functionNamesSelected = [].concat(this.functionNames);
        } else {
          this.functionNamesSelected = tmpFnNames.fnNames;
        }
      }
      this.launchItemsLockForm.controls.functions.setValue(
        tmpFnNames ? tmpFnNames.customFnNames : ''
      );
      this.launchItemsLockForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.launchItemsLockForm.controls.source_ctrl.setValue(
        e.sourceLocation
      );
      this.launchItemsLockForm.controls.cpu_spinner_ctrl.setValue(
        e.interval
      );
      if (e.interval === '0.71') {
        this.launchItemsLockForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }
      this.launchItemsLockForm.controls.typeItem_ctrl.setValue(
        typeItem[0]
      );
      this.launchItemsLockForm.controls.kcore.setValue(
        e.kcore,
      );
      this.launchItemsLockForm.controls.fileSize.setValue(
        e.collect_file_size
      );
      this.lCurrntFormLock = this.launchItemsLockForm;
    } else if (e['analysis-target'].indexOf('Profile') > -1) {
      this.typeLDesc = this.i18n.common_term_task_type_profile;
      this.isLaunch = false;
      this.isProfile = true;
      this.isAttach = false;

      this.profileItemsLockForm.controls.functionNamesForm.setValue(
        tmpFnNames ? tmpFnNames.fnNames : []
      );
      if (tmpFnNames) {
        if (tmpFnNames.fnNames.length === this.functionNames.length - 1) {
          this.functionNamesSelected = [].concat(this.functionNames);
        } else {
          this.functionNamesSelected = tmpFnNames.fnNames;
        }
      }
      this.profileItemsLockForm.controls.functions.setValue(
        tmpFnNames ? tmpFnNames.customFnNames : ''
      );

      this.profileItemsLockForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.profileItemsLockForm.controls.source_ctrl.setValue(
        e.sourceLocation
      );
      this.lockTypeSelected = this.lockTypeOptions[1];
      this.profileItemsLockForm.controls.cpu_spinner_ctrl.setValue(
        e.interval
      );
      this.profileItemsLockForm.controls.c_d_ctrl.setValue(e.duration);
      if (e.interval === '0.71') {
        this.profileItemsLockForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }
      this.profileItemsLockForm.controls.typeItem_ctrl.setValue(
        typeItem[0]
      );
      this.profileItemsLockForm.controls.kcore.setValue(
        e.kcore,
      );
      this.profileItemsLockForm.controls.fileSize.setValue(
        e.collect_file_size
      );
      this.lCurrntFormLock = this.profileItemsLockForm;
    } else if (e['analysis-target'].indexOf('Attach') > -1) {
      this.typeLDesc = this.i18n.common_term_task_type_attach;
      this.isLaunch = false;
      this.isProfile = false;
      this.isAttach = true;
      this.attachItemsLockForm.controls.functionNamesForm.setValue(
        tmpFnNames ? tmpFnNames.fnNames : []
      );
      if (tmpFnNames) {
        if (tmpFnNames.fnNames.length === this.functionNames.length - 1) {
          this.functionNamesSelected = [].concat(this.functionNames);
        } else {
          this.functionNamesSelected = tmpFnNames.fnNames;
        }
      }
      this.attachItemsLockForm.controls.functions.setValue(
        tmpFnNames ? tmpFnNames.customFnNames : ''
      );
      this.attachItemsLockForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.attachItemsLockForm.controls.source_ctrl.setValue(
        e.sourceLocation
      );

      this.lockTypeSelected = this.lockTypeOptions[2];
      this.attachItemsLockForm.controls.cpu_spinner_ctrl.setValue(
        e.interval
      );
      this.attachItemsLockForm.controls.c_d_ctrl.setValue(e.duration);
      if (e.interval === '0.71') {
        this.attachItemsLockForm.controls.cpu_ctrl.setValue({
          label: this.i18n.common_term_task_start_high_precision,
          id: 'higher',
        });
      }
      this.attachItemsLockForm.controls.typeItem_ctrl.setValue(
        typeItem[0]
      );
      this.attachItemsLockForm.controls.kcore.setValue(
        e.kcore,
      );
      this.attachItemsLockForm.controls.fileSize.setValue(
        e.collect_file_size
      );
      this.lCurrntFormLock = this.attachItemsLockForm;
    }

    const allNodeList = await this.getProjectNodes();
    this.lCurrntFormLock.controls.nodeList.setValue(
      this.dealwithNodeSelectedData(allNodeList, e.nodeConfig)
    );

    // 预约任务数据导入
    this.preSwitchLock.importTemp(e);
    // 配置节点参数
    if (e.switch) {
      switch (e['analysis-target']) {
        case 'Launch Application':
          this.onDisableForm('l_launch');
          break;
        case 'Profile System':
          this.onDisableForm('l_profile');
          break;
        case 'Attach to Process':
          this.onDisableForm('l_attach');
          break;
        default:
          break;
      }
      // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
      setTimeout(() => this.nodeConfigL.importTemp(e.nodeConfig));
    } else {
      this.nodeConfigL.clear();
    }
    if (this.isEdit || this.isRestart) {
      this.preSwitchLock.isEdit = this.isEdit || this.isRestart;
    }
  }

  /**
   * 导入任务数据处理被选中节点参数格式
   * @param nodeList 所有的节点
   * @param nodeConfig 任务节点配置信息
   */
  public dealwithNodeSelectedData(nodeList: any, nodeConfig: any) {
    const resultData: any[] = [];
    nodeConfig.forEach((nodeParams: any) => {
      const node = nodeList.find((item: any) => {
        return nodeParams.nodeId === item.id;
      });
      if (node) {
        resultData.push({
          node: node.nodeIp,
          disabled: node.nodeStatus !== 'on',
          nickName: node.nickName,
          nodeState: node.nodeStatus,
          params: {
            status: false,
          },
          nodeId: node.nodeId,
          id: node.id,
        });
      }
    });
    return resultData;
  }

  // 保存模板
  async saveTemplates() {
    const self = this;
    const temp = this.isLaunch
      ? this.launchItemsLockForm
      : this.isAttach
        ? this.attachItemsLockForm
        : this.profileItemsLockForm;
    const errors = TiValidators.check(temp);
    const ctrls = temp.controls;

    const totalFnNames = this.getFunctionNames(ctrls.functionNamesForm.value, ctrls.functions.value);
    const params: any = {
      'analysis-type': 'system_lock',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.lockTypeSelected.label,
      interval:
        ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
          ? ctrls.cpu_spinner_ctrl.value
          : '0.71',
      'profiling-mode': 'Native',
      functionname: totalFnNames,
      assemblyLocation: ctrls.b_s_ctrl.value,
      sourceLocation: ctrls.source_ctrl.value,
      collect_range: ctrls.typeItem_ctrl.value.id,
      kcore: ctrls.kcore.value,
      collect_file_size: ctrls.fileSize.value || 1024,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid;
      params.process_name = this.modeProcess;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.preSwitchLock.switchState) {
      // 预约
      if (this.preSwitchLock.selected === 1) {
        const durationArr = this.preSwitchLock.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchLock.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchLock.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    if (this.nodeConfigL.switchStatus) {
      params.switch = true;
      this.getFormDatas('');
      params.nodeConfig = this.nodeConfigL.getNodesConfigParams(this.formDatas);
    } else {
      params.switch = false;
      params.nodeConfig = await this.getNodeConfigDatas(
        params['analysis-type']
      );
    }
    this.keepData = params;
    this.sendMissionKeep.emit(this.keepData);
  }
  // 清空任务参数
  public clear() {
    this.nodeConfigL.clear();
    this.preSwitchLock.clear();
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
            self.closeTab.emit({
              title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
              id: backData.id,
              nodeid: params.nodeConfig[0].nodeId,
              taskId: backData.id,
              taskType: params['analysis-type'],
              status: backData['task-status'],
              projectName: self.projectName
            });
          });
      });
  }

  //  重启
  public restartFunction(params: any) {
    params.status = 'restarted';
    if (this.isLaunch) {
      params.user_message = this.dealRunUserDataObj(this.runUserDataObj);
    }
    const self = this;
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
      .put('/tasks/' + this.restartAndEditId + '/status/', params)
      .then((res: any) => {
        const data = res.data;
        this.closeTab.emit({
          title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
          id: data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: data.id,
          taskType: params['analysis-type'],
          status: data['task-status'],
          projectName: this.projectName
        });
        self.mytip.alertInfo({ type: 'info', content: self.i18n.mission_create.restartSuccess, time: 3500 });

        this.isRestart = false;
      })
      .catch((error: any) => {
      });
  }
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }

  /**
   * profile 函数选择change
   */
  public profileFunctionNameChange(data: any) {
    if (data && data.length) {
      if (data.length === this.functionNames.length) { return; }
      const finded = data.find((item: any) => item.value === 'all');
      // 选中all
      if (finded) {
        if (data[0].select) {
          this.functionNames[0].select = false;
          this.functionNamesSelected = data.slice(1);
        } else {
          this.functionNames[0].select = true;
          this.functionNamesSelected = [].concat(this.functionNames);
        }
      } else { // 未选中all
        if (this.functionNames[0].select) {
          if (data.length + 1 === this.functionNames.length) {
            this.functionNamesSelected = [];
            this.functionNames[0].select = false;
          }
        } else {
          if (data.length + 1 === this.functionNames.length) {
            this.functionNamesSelected = [].concat(this.functionNames);
            this.functionNames[0].select = true;
          }
        }
      }
    }
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    const form = this.isLaunch
      ? this.launchItemsLockForm
      : this.isAttach
        ? this.attachItemsLockForm
        : this.profileItemsLockForm;

    this.intervalBlur = {
      control: form.controls.cpu_spinner_ctrl,
      min: 1,
      max: 1000,
    };
    this.collectFileBlur = {
      control: form.controls.fileSize,
      min: 1,
      max: 4096,
    };
    this.samplingDurationBlur = {
      control: form.controls.c_d_ctrl,
      min: 1,
      max: 300,
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

export class FunctionNameValidators {
  // 自定义校验规则

  public static functionName(i18n: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let validate = true;
      const arr = control.value.split(',');
      if (arr.length > 0) {
        arr.forEach((item: any) => {
          if (item === '*') {
            validate = false;
          }
        });
      }
      return validate ? null : { pwd: { tiErrorMessage: i18n } };
    };
  }
}
