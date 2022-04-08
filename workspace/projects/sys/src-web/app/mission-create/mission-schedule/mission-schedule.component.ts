// 资源调度分析_create
import { Component, OnInit, ViewChild, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { SpinnerBlurInfo, LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { CustomValidatorsService } from '../../service';

@Component({
  selector: 'app-mission-schedule',
  templateUrl: './mission-schedule.component.html',
  styleUrls: ['./mission-schedule.component.scss', '../mission-components/task-form/task-form.component.scss']
})
export class MissionScheduleComponent implements OnInit, OnChanges {

  constructor(
    public I18n: I18nService, public Axios: AxiosService, fb: FormBuilder,
    public scheduleTaskServer: ScheduleTaskService, public mytip: MytipService,
    private tiMessage: MessageModalService,
    public customValidatorsService: CustomValidatorsService) {
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
        }
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
        placeholder: '1-300',
        min: 1,
        max: 300,
        format: 'N0',
        step: 1,
        tailPrompt: this.i18n.common_term_sign_left + '1~300' + this.i18n.common_term_sign_right,
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
      j_source: {
        label: this.i18n.common_term_task_crate_java_path,
        tip: this.i18n.tip_msg.common_term_task_crate_j_source_tip,
        required: false
      },
      lock_function: {
        label: this.i18n.lock.form.functions_label,
        required: false
      },
      collectCallStack: { // 采集调用栈
        label: this.i18n.mission_create.collectCallStack,
        required: false,
      },
      profilingMode: 'Native',  // WebUI上不显示。
      sysWideState: 'on',  // WebUI上不显示。
      // 采集文件大小
      filesize: {
        label: this.i18n.falsesharing.filesize
          + ' '
          + this.i18n.ddr.leftParenthesis
          + 'MiB'
          + this.i18n.ddr.rightParenthesis,
        required: false,
        type: 'spinner',
        value: 256,
        correctable: false,
        min: 1,
        max: 512,
        step: 1,
        format: 'n0',
        iconTip: this.i18n.falsesharing.filesizeTips,
        tailPrompt: this.i18n.common_term_sign_left + '1~512' + this.i18n.common_term_sign_right,
        placeholder: '1-512'
      },
    };
    this.startCheckRes = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    this.launchItemsRForm = fb.group({
      nodeList: new FormControl([]),
      params_ctrl: new FormControl('', []),

      dire_ctrl: new FormControl('', []),
      dire_input_ctrl: new FormControl('', {
        updateOn: 'change'
      }),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      collectCallStack: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(256, [
        TiValidators.minValue(1),
        TiValidators.maxValue(512),
      ]),
    });
    this.profileItemsRForm = fb.group({
      nodeList: new FormControl([]),
      c_d_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      mask_ctrl: new FormControl('', [this.customValidatorsService.checkSampCPUMask()]),
      collectCallStack: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(256, [
        TiValidators.minValue(1),
        TiValidators.maxValue(512),
      ]),
    });
    this.attachItemsRForm = fb.group({
      nodeList: new FormControl([]),
      c_d_ctrl: new FormControl('', [
        TiValidators.required,
        TiValidators.minValue(1),
        TiValidators.maxValue(300),
      ]),
      b_s_ctrl: new FormControl('', [
        this.validFilePath(this.i18n.tip_msg.common_term_file_path_error)
      ]),
      collectCallStack: new FormControl(false, {
        updateOn: 'change',
      }),
      // 采集文件大小
      fileSize: new FormControl(256, [
        TiValidators.minValue(1),
        TiValidators.maxValue(512),
      ]),
    });
    this.rCurrntFormR = this.launchItemsRForm;
    this.LaunchItemsR = {
      pathVal: '',
      paramsVal: '',
      dire: {
        value: '',
        saveValue: ''
      },
      cpu: {
        unit: this.i18n.common_term_task_crate_ms,
        spinnerVal: 710
      },
      maskVal: '',
      b_sVal: '',
    };
    this.attachItemsR = {
      p_t: {
        label: this.i18n.common_term_task_crate_pid,
        required: true,
        value: ''
      },
      c_dVal: 30,
      cpu: {
        unit: this.i18n.common_term_task_crate_ms,
        spinnerVal: 710
      },
      b_sVal: '',
    };
  }
  @ViewChild('nodeConfigR') nodeConfigR: any;
  @ViewChild('preSwitchChange') preSwitchChange: any;
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
  public isRestart: boolean;
  public i18n: any;
  public typeItem: any = {};
  public commentItems: any = {};
  public launchItemsRForm: FormGroup;
  public profileItemsRForm: FormGroup;
  public attachItemsRForm: FormGroup;
  public rCurrntFormR: FormGroup;
  public LaunchItemsR: any = {};
  public attachItemsR: any = {};
  public startCheckRes: any = {};
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
  public rTypeSelected: any = this.rTypeOptions[1];
  public typeRDesc = '';

  public formDatas: any;
  public keepData: any; // 保存模板
  public appAndPidValid = false;
  // 表单验证部分
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  // 修改预约任务 接收从预约传来的值
  public editScheduleTask = false; // 判断是否是修改
  public scheduleTaskId: any; // 保存修改的预约任务ID
  public runUserData = {
    runUser: false,
    user: '',
    password: ''
  };
  public runUserDataObj: LaunchRunUser = {};

  public collectFileBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;

  // 预约任务，立即执行禁用变量
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
      this.rCurrntFormR.controls.nodeList.setValue(
        this.allNodeList.length > 10 ? this.allNodeList.slice(0, 10) : this.allNodeList
      );
    }
    this.onDisabledFormNodeList();
    this.launchItemsRForm.controls.dire_input_ctrl.disable(); // 初始化dir输入框灰化
    this.profileItemsRForm.controls.c_d_ctrl.setValue('60');
    this.attachItemsRForm.controls.c_d_ctrl.setValue('60');

    this.setSpinnerBlur();
  }

  /**
   * 获取工程下所有节点
   */
  public getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(url).then((res: any) => {
        // 获取工程
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
            this.startCheckRes.checked = true;
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
            if (this.nodeConfigR) {
              this.nodeConfigR.clear();
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
    switch (changes.typeId != null ? changes.typeId.currentValue : this.typeId) {
      case 0:
        this.isProfile = true;
        this.appAndPidValid = true;
        this.isLaunch = false;
        this.isAttach = false;
        this.rCurrntFormR = this.profileItemsRForm;
        this.rTypeSelected = this.rTypeOptions[1];
        break;
      case 1:
        this.isProfile = false;
        this.isLaunch = true;
        this.isAttach = false;
        this.appAndPidValid = this.modeAppValid;
        this.rCurrntFormR = this.launchItemsRForm;
        this.rTypeSelected = this.rTypeOptions[0];
        break;
      case 2:
        this.isProfile = false;
        this.isLaunch = false;
        this.isAttach = true;
        this.appAndPidValid = this.modePidValid;
        this.rCurrntFormR = this.attachItemsRForm;
        this.rTypeSelected = this.rTypeOptions[2];
        break;
    }
  }

  async createResAnalysis(isEdit: any): Promise<any> {
    const form = this.isLaunch
      ? this.launchItemsRForm
      : this.isAttach
        ? this.attachItemsRForm
        : this.profileItemsRForm;
    const errors = TiValidators.check(form);

    const self = this;
    const ctrls = form.controls;
    const params: any = {
      'analysis-type': 'resource_schedule',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.rTypeSelected.label,
      'profiling-mode': 'Native',
      assemblyLocation: ctrls.b_s_ctrl.value,
      'dis-callstack': ctrls.collectCallStack.value,
      size: ctrls.fileSize.value || 256,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['app-working-dir'] = ctrls.dire_input_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid + '';
      params['process-name'] = this.modeProcess;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.nodeConfigR.switchStatus) {
      params.switch = true;
      this.getFormDatas();
      const nodeData: any = this.nodeConfigR.getNodesConfigParams(this.formDatas);
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
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
      if (self.isProfile) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.duration = params.duration;
          item.task_param.projectname = params.projectname;
          return item;
        });
      }
      if (self.isAttach) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.duration = params.duration;
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
    let urlAnalysis = '';
    //  预约任务 preSwitch 预约组件名
    if (this.preSwitchChange.switchState) {
      this.startCheckRes.checked = false;
      const flag = await this.createPreMission(
        this.preSwitchChange,
        params,
        'post'
      );
      if (flag) {
        this.startCheckRes.checked = true;
      }
    } else {
      //  非预约任务
      if (isEdit) {
        urlAnalysis = '/tasks/' + this.restartAndEditId + '/';
      } else {
        urlAnalysis = '/tasks/';
      }
      if (isEdit) {
        self.Axios.axios
          .put(urlAnalysis, params)
          .then((data: any) => {
            self.mytip.alertInfo({
              type: 'success',
              content: self.i18n.tip_msg.edite_ok,
              time: 3500,
            });
            if (self.startCheckRes.checked) {
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
            self.Axios.axios.post(urlAnalysis, params).then((res: any) => {
              self.mytip.alertInfo({
                type: 'success',
                content: self.i18n.tip_msg.create_ok,
                time: 3500,
              });
              const data = res.data;
              if (self.startCheckRes.checked) {
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
  // 当配置节点参数没开时
  public getNodeConfigDatas(params: any) {
    this.getFormDatas(params);
    // 当开关组件没有打开时
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      const data: any = [];
      if (this.isHpcPro) {
        const curSelectNode = this.rCurrntFormR.controls.nodeList.value;
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
            this.runUserDataObj[item.nodeIp] = {
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
        this.nodeConfigR.clear();
        this.sendPretable.emit('on');
        this.closeTab.emit({});
        resolve(true);
      });
    });
  }
  // 获取数据
  public getFormDatas(str?: string) {
    const form = this.isLaunch
      ? this.launchItemsRForm
      : this.isAttach
        ? this.attachItemsRForm
        : this.profileItemsRForm;
    const errors = TiValidators.check(form);

    const self = this;
    const ctrls = form.controls;
    const params: any = {
      'analysis-type': 'resource_schedule',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.rTypeSelected.label,
      'profiling-mode': 'Native',
      assemblyLocation: ctrls.b_s_ctrl.value,
      'dis-callstack': ctrls.collectCallStack.value,
      size: ctrls.fileSize.value || 256,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['app-working-dir'] = ctrls.dire_input_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid + '';
      params['process-name'] = this.modeProcess;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.preSwitchChange.switchState) {
      // 预约
      if (this.preSwitchChange.selected === 1) {
        const durationArr = this.preSwitchChange.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchChange.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchChange.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    this.formDatas = params;
    return;
  }
  // 取消按钮
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }
  // 导入模板
  public async getTemplateData(e: any): Promise<void> {
    // 后端传入参数有问题，这里修改 procss-name : process-name
    if (e['analysis-target'] === 'Attach to Process') {
      const nodeConfig = e?.nodeConfig;
      if (nodeConfig == null) { return; }
    }

    this.taskNameValid = true;
    this.appAndPidValid = true;
    if (e['analysis-target'].indexOf('Launch') > -1) {
      this.typeRDesc = this.i18n.common_term_task_type_launch;
      this.isLaunch = true;
      this.isProfile = false;
      this.isAttach = false;

      this.rTypeSelected = this.rTypeOptions[0];
      this.launchItemsRForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.launchItemsRForm.controls.collectCallStack.setValue(e['dis-callstack']);
      this.launchItemsRForm.controls.fileSize.setValue(
        e.size
      );
      this.rCurrntFormR = this.launchItemsRForm;
    } else if (e['analysis-target'].indexOf('Profile') > -1) {
      this.typeRDesc = this.i18n.common_term_task_type_profile;
      this.isLaunch = false;
      this.isProfile = true;
      this.isAttach = false;

      this.rTypeSelected = this.rTypeOptions[1];
      this.profileItemsRForm.controls.c_d_ctrl.setValue(e.duration);
      this.profileItemsRForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.profileItemsRForm.controls.collectCallStack.setValue(e['dis-callstack']);
      this.profileItemsRForm.controls.fileSize.setValue(
        e.size
      );
      this.rCurrntFormR = this.profileItemsRForm;
    } else if (e['analysis-target'].indexOf('Attach') > -1) {
      this.typeRDesc = this.i18n.common_term_task_type_attach;
      this.isLaunch = false;
      this.isProfile = false;
      this.isAttach = true;

      this.rTypeSelected = this.rTypeOptions[2];
      this.attachItemsRForm.controls.c_d_ctrl.setValue(e.duration);
      this.attachItemsRForm.controls.b_s_ctrl.setValue(
        e.assemblyLocation
      );
      this.attachItemsRForm.controls.collectCallStack.setValue(e['dis-callstack']);
      this.attachItemsRForm.controls.fileSize.setValue(
        e.size
      );
      this.rCurrntFormR = this.attachItemsRForm;
    }
    const allNodeList = await this.getProjectNodes();
    this.rCurrntFormR.controls.nodeList.setValue(
      this.dealwithNodeSelectedData(allNodeList, e.nodeConfig)
    );
    // 预约任务数据导入
    this.preSwitchChange.importTemp(e);
    // 配置节点参数
    if (e.switch) {
      switch (e['analysis-target']) {
        case 'Launch Application':
          this.onDisableForm('r_launch');
          break;
        case 'Profile System':
          this.onDisableForm('r_profile');
          break;
        case 'Attach to Process':
          this.onDisableForm('r_attach');
          break;
        default:
          break;
      }
      // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
      setTimeout(() => {
        this.nodeConfigR.importTemp(e.nodeConfig);
      });
    } else {
      this.nodeConfigR.clear();
    }
    if (this.isEdit || this.isRestart) {
      this.preSwitchChange.isEdit = this.isEdit || this.isRestart;
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
      case 'r_attach':
        this.attachItemsRForm.controls.b_s_ctrl.disable();
        this.sendAppOrPidDisable.emit(true);
        break;
      case 'r_launch':

        this.sendAppOrPidDisable.emit(true);
        this.launchItemsRForm.controls.params_ctrl.disable();
        this.launchItemsRForm.controls.b_s_ctrl.disable();
        break;
      case 'r_profile':
        this.profileItemsRForm.controls.b_s_ctrl.disable();
        break;
      default:

        this.sendAppOrPidDisable.emit(false);
        this.attachItemsRForm.controls.b_s_ctrl.enable();
        this.launchItemsRForm.controls.params_ctrl.enable();
        this.launchItemsRForm.controls.b_s_ctrl.enable();
        this.profileItemsRForm.controls.b_s_ctrl.enable();
        break;
    }
    this.onDisabledFormNodeList();
  }

  /**
   * 节点选择控件是否需要校验
   */
   private onDisabledFormNodeList() {
    if (this.isHpcPro) {
      this.profileItemsRForm.controls.nodeList.enable();
      this.launchItemsRForm.controls.nodeList.enable();
      this.attachItemsRForm.controls.nodeList.enable();
    } else {
      this.profileItemsRForm.controls.nodeList.disable();
      this.launchItemsRForm.controls.nodeList.disable();
      this.attachItemsRForm.controls.nodeList.disable();
    }
  }

  /**
   * 切换多节点配置组件开关
   * @param event 多节点组件开发状态
   */
   public selectNodeDisable(event: boolean){
    this.isSelectNodeDisabled = event;
  }

  // 保存模板
  async saveTemplates() {
    const form = this.isLaunch
      ? this.launchItemsRForm
      : this.isAttach
        ? this.attachItemsRForm
        : this.profileItemsRForm;
    const errors = TiValidators.check(form);

    const self = this;
    const ctrls = form.controls;
    const params: any = {
      'analysis-type': 'resource_schedule',
      projectname: self.projectName,
      taskname: self.taskName,
      'analysis-target': self.rTypeSelected.label,
      'profiling-mode': 'Native',
      assemblyLocation: ctrls.b_s_ctrl.value,
      'dis-callstack': ctrls.collectCallStack.value,
      size: ctrls.fileSize.value || 256,
    };
    if (self.isLaunch) {
      params['app-dir'] = this.modeApplication || '';
      params['app-parameters'] = this.modeAppParams || '';
      params['app-working-dir'] = ctrls.dire_input_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (self.isProfile) {
      params.duration = ctrls.c_d_ctrl.value;
    }
    if (self.isAttach) {
      params['target-pid'] = this.modePid + '';
      params['process-name'] = this.modeProcess;
      params.duration = ctrls.c_d_ctrl.value;
      params['profiling-mode'] = 'Native';
    }
    if (this.preSwitchChange.switchState) {
      // 预约
      if (this.preSwitchChange.selected === 1) {
        const durationArr = this.preSwitchChange.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchChange.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchChange.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    if (this.nodeConfigR.switchStatus) {
      params.switch = true;
      this.getFormDatas();
      const nodeData: any = this.nodeConfigR.getNodesConfigParams(this.formDatas);
      if (self.isLaunch) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {

          item.task_param.taskname = params.taskname;
          return item;
        });
      }
      if (self.isProfile) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.duration = params.duration;
          return item;
        });
      }
      if (self.isAttach) {
        params.nodeConfig = nodeData.map((item: any, index: any) => {
          item.task_param.taskname = params.taskname;
          item.task_param.duration = params.duration;
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

  public checkApplicationPath_blur(modal: string): any {
    let ctrl: any;
    let currentMoal: any;
    let url = '/res-status/?type=application&application=';

    ctrl = this.launchItemsRForm.controls;
    currentMoal = this.LaunchItemsR;
    if (ctrl.dire_ctrl.value.id === 'customize') {
      return false;
    } // 如果是自定义，就不往里面填
    if (ctrl.path_ctrl.value !== '') {
      url += ctrl.path_ctrl.value;
      this.Axios.axios
        .get(url)
        .then((resp: any) => {
          currentMoal.dire.saveValue = resp.data.address;
          ctrl.dire_input_ctrl.setValue(resp.data.address);
        })
        .catch((error: any) => { });
    }
  }
  public directory_change(data: any, modal: any) {
    let ctrls: any;
    ctrls = this.launchItemsRForm.controls;
    if (data.id === 'customize') {
      ctrls.dire_input_ctrl.enable();
      ctrls.dire_input_ctrl.setValue('');
    } else {
      ctrls.dire_input_ctrl.disable();
      ctrls.dire_input_ctrl.setValue('');
    }
  }
  public changeAppDire(type: any) { }

  // 清空任务参数
  public clear() {
    this.nodeConfigR.clear();
    this.preSwitchChange.clear();
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
          title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
          id: data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: data.id,
          taskType: params['analysis-type'],
          status: data['task-status'],
          projectName: self.projectName
        });
        self.mytip.alertInfo({ type: 'info', content: self.i18n.mission_create.restartSuccess, time: 3500 });

        self.isRestart = false;
      })
      .catch((error: any) => {
      });
  }
  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    const form = this.isLaunch
      ? this.launchItemsRForm
      : this.isAttach
        ? this.attachItemsRForm
        : this.profileItemsRForm;

    this.collectFileBlur = {
      control: form.controls.fileSize,
      min: 1,
      max: 512,
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
