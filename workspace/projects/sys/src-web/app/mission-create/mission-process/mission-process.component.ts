import {
  Component, OnInit, ViewChild, Output,
  Input, EventEmitter, OnChanges, SimpleChange,
} from '@angular/core';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { CustomValidators } from '../taskParams/AllParams';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';

import { AnalysisTarget, SpinnerBlurInfo, LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { ProcessNodeConfigPidComponent } from './components/process-node-config-pid/process-node-config-pid.component';
import { ProcessNodeConfigAppComponent } from './components/process-node-config-app/process-node-config-app.component';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-process',
  templateUrl: './mission-process.component.html',
  styleUrls: ['./mission-process.component.scss', '../mission-components/task-form/task-form.component.scss']
})
export class MissionProcessComponent implements OnInit, OnChanges {
  @ViewChild('preSwitchProcess') preSwitchProcess: any;
  @ViewChild('pretable') pretable: any;
  @ViewChild('configNodePara') configNodeParaEl: any;

  @ViewChild('pidConfigModel') pidConfigModel: ProcessNodeConfigPidComponent;
  @ViewChild('appConfigModel') appConfigModel: ProcessNodeConfigAppComponent;

  @Output() sendMissionKeep = new EventEmitter<any>();
  @Output() sendPretable = new EventEmitter<any>();
  @Output() closeTab = new EventEmitter<any>();
  @Output() sendAppOrPidDisable = new EventEmitter<boolean>();

  @Input() labelWidth: string;
  @Input() drawerLevel: number;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskNameValid = false;
  @Input() projectId: number;
  @Input() restartAndEditId: number;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Input() isModifySchedule: boolean;
  @Input() widthIsLimited = false;  // ???????????????????????????????????????????????? home ????????????????????????????????????????????????????????????????????????drawer???????????????????????????????????????????????????
  /** ???????????????0--Profile System, 1--Launch Application, 2--Attach to Process */
  @Input() typeId: number;
  /** Launch Application: ???????????? */
  @Input() modeApplication: string;
  /** Launch Application: ???????????? */
  @Input() modeAppParams: string;
  /** Launch Application: ?????????????????? ???????????? */
  @Input() switchState: boolean;
  /** Launch Application: ?????????????????? ????????? */
  @Input() modeApplicationUser: string;
  /** Launch Application: ?????????????????? ?????? */
  @Input() modeApplicationPassWord: string;
  /** Launch Application: ???????????????????????????????????????????????? */
  @Input() modeAppValid: boolean;
  /** Attach to Process: Pid */
  @Input() modePid: string;
  /** Attach to Process: ???????????? */
  @Input() modeProcess: string;
  /** Attach to Process: Pid ???????????????????????????????????? */
  @Input() modePidValid = false;
  @Input() editScheduleTask = false; // ?????????????????????

  /** ???????????? */
  public analysisMode: AnalysisTarget;
  /** ???????????? */
  /** pid ????????????????????????????????? */
  public pidConfigNodeData: {
    [ip: string]: {
      pid: string
      process_name: string,
      status: boolean
    }
  } = {};
  /** app ????????????????????????????????? */
  public appConfigNodeData: {
    [ip: string]: {
      'app-dir': string,
      'app-parameters': string,
      status: boolean
    }
  } = {};
  public runUserDataObj: LaunchRunUser = {};
  /** ?????????????????????????????? */
  public superParamsValid = false;

  public i18n: any;
  public isEdit: boolean;
  public isRestart: boolean;
  public startCheckC: any = {};
  public processItems: any = {};
  public processForm: FormGroup;
  public processTypeOptions: Array<any> = [
    { id: 'cpu', text: 'CPU' },
    { id: 'mem', text: 'Memory' },
    { id: 'disk', text: 'Disk IO' },
    { id: 'context', text: 'context' },
  ];
  public processCheckedTypes: Array<any> = [];
  public processRadioList: any = [];
  public startCheckProcess: any = {};
  public formDatas: any;
  public keepData: any;
  /** ???????????????????????????labelWidth?????????drawer????????????32px??? */
  public labelWidthOfNodeConfig = '200px';
  // ??????????????????
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  // ?????????????????? ???????????????????????????
  public scheduleTaskId: any;

  public runUserData = {
    runUser: false,
    user: '',
    password: ''
  };
  // ???????????????????????????????????????
  public isShowReserveAndImmedia = false;

  // ?????????????????????
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;

  constructor(
    public http: HttpService,
    public I18n: I18nService, public Axios: AxiosService,
    fb: FormBuilder, public scheduleTaskServer: ScheduleTaskService,
    public mytip: MytipService,
    private msgMessage: MessageModalService,
  ) {
    this.i18n = I18n.I18n();
    this.startCheckC = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    this.processItems = {
      interval: {
        label: this.i18n.sys.interval,
        required: true,
        spinner: {
          placeholder: '1-10',
          min: 1,
          max: 10,
          format: 'N0',
          step: 1,
        },
      },
      duration: {
        label: this.i18n.sys.duration,
        required: true,
        spinner: {
          placeholder: '2-300',
          min: 2,
          max: 300,
          format: 'N0',
          step: 1,
        },
        tailPrompt: this.i18n.common_term_sign_left + '2~300' + this.i18n.common_term_sign_right,
      },
      type: {
        label: this.i18n.sys.type,
      },
      info: {
        label: this.i18n.sys.time,
      },
      trace: {
        label: this.i18n.process.label.trace,
        required: false,
      },
      collection: {
        label: this.i18n.process.label.thread,
        required: false,
      },
      nodeParamsConfig: {
        label: this.i18n.mission_create.nodeParamsConfig,
        required: false,
      }
    };
    //  process
    this.processForm = fb.group({
      nodeList: new FormControl([]),
      interval: new FormControl('', {
        validators: [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(10),
          CustomValidators.validTheSizeRelationship({
            relatedFormControlName: 'duration',
            tip: this.i18n.process.intervalTip,
            calcExpression: ([valueA, valueB]) => valueA <= valueB / 2,
          }),
        ],
        updateOn: 'change',
      }),
      duration: new FormControl('', {
        validators: [
          TiValidators.required,
          TiValidators.minValue(2),
          TiValidators.maxValue(300),
        ],
        updateOn: 'change',
      }),
      pidInput: new FormControl('', {
        updateOn: 'change',
      }),
      trace: new FormControl(false, {
        validators: [TiValidators.required],
        updateOn: 'change',
      }),
      collection: new FormControl(true, {
        validators: [TiValidators.required],
        updateOn: 'change',
      }),
      nodeParamsConfig: new FormControl(false, {
        validators: [],
        updateOn: 'change',
      }),
    });
    this.processTypeOptions = [
      { id: 'cpu', text: 'CPU' },
      { id: 'mem', text: this.i18n.process.mem },
      { id: 'disk', text: this.i18n.sys.disk },
      { id: 'context', text: this.i18n.process.context },
    ];
    this.processRadioList = [
      {
        key: 'All',
        id: 'all',
        disable: false,
      },
      {
        key: this.i18n.nodeConfig.pointed,
        id: 'notAll',
        disable: false,
      },
    ];
    this.startCheckProcess = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
  }

  public intervalBlur: SpinnerBlurInfo;
  public samplingDurationBlur: SpinnerBlurInfo;

  ngOnInit() {
    this.getProjectNodes();
    this.labelWidthOfNodeConfig = parseInt(this.labelWidth, 10) - (this.drawerLevel || 0) * 32 + 'px';
    this.processForm.controls.pidInput.disable();
    this.processForm.controls.interval.setValue('1');
    this.processForm.controls.duration.setValue('60');
    if (this.analysisMode === AnalysisTarget.PROFILE_SYSTEM) {
      this.processForm.controls.trace.disable();
    }
    this.processCheckedTypes = [...this.processTypeOptions];

    this.setSpinnerBlur();
  }

  /**
   * ?????? Input ???????????????
   * @param changes ????????? Input ??????
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'typeId':
          switch (this.typeId) {
            case 0:
              this.analysisMode = AnalysisTarget.PROFILE_SYSTEM;
              this.isShowReserveAndImmedia = false;
              break;
            case 1:
              this.analysisMode = AnalysisTarget.LAUNCH_APPLICATION;
              break;
            case 2:
              this.analysisMode = AnalysisTarget.ATTACH_TO_PROCESS;
              this.isShowReserveAndImmedia = false;
              break;
            default:
          }
          break;
        case 'modeAppValid':
        case 'modePidValid':
        case 'taskNameValid':
          this.setSuperParamsValid(this.taskNameValid, this.modePidValid, this.modeAppValid);
          break;
        case 'switchState':
          if (changes.switchState.currentValue) {
            this.runUserData.runUser = true;
            this.runUserData.user = '';
            this.startCheckProcess.checked = true;
            this.isShowReserveAndImmedia = true;
          } else {
            this.runUserData.runUser = false;
            this.runUserData.user = '';
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
        default: break;
      }
    }
  }
  selectNodeDisable(event: boolean){
    this.isSelectNodeDisabled = event;
  }
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // ??????????????????????????????
        this.nodeList = res.data.nodeList;
        if (!(this.isEdit || this.isRestart)) {
          this.processForm.controls.nodeList.setValue(
            this.nodeList.length > 10 ? this.nodeList.slice(0, 10) : this.nodeList
          );
        }
      }
      // ????????????
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC') {
        this.processForm.get('nodeList').enable();
      } else {
        this.processForm.get('nodeList').disable();
      }
    });
  }

  private setSuperParamsValid(taskNameValid: boolean, modePidValid: boolean, modeAppValid: boolean) {
    switch (this.typeId) {
      case 0:
        this.superParamsValid = taskNameValid;
        break;
      case 1:
        this.superParamsValid = taskNameValid && modeAppValid;
        break;
      case 2:
        this.superParamsValid = taskNameValid && modePidValid;
        break;
      default:
    }
  }

  // ??????????????????????????????
  public onControlNode(taskName: any) {
    if (taskName) {
      this.sendAppOrPidDisable.emit(true);
      // ??????
      this.getFormDatas();
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
    } else {
      this.sendAppOrPidDisable.emit(false);
    }
  }

  public getFormDatas() {
    const errors = TiValidators.check(this.processForm);
    const taskParam = this.processCheckedTypes.map((item) => {
      return item.id;
    });
    const ctrls = this.processForm.controls;
    const params: any = {
      'analysis-target': this.analysisMode,
      'analysis-type': 'process-thread-analysis',
      projectname: this.projectName,
      taskname: this.taskName,
      interval: ctrls.interval.value,
      duration: ctrls.duration.value,
      task_param: {
        type: taskParam,
      },
    };

    if (this.analysisMode === AnalysisTarget.PROFILE_SYSTEM) {
      params.pid = ctrls.pidInput.value;
    } else {
      if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
        Object.assign(params, {
          'app-dir': this.modeApplication,
          'app-parameters': this.modeAppParams
        });
      } else if (this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS) {
        Object.assign(params, {
          pid: this.modePid,
          process_name: this.modeProcess,
        });
      }
    }

    params.process = 'enable'; // ?????????enable
    params['strace-analysis'] = ctrls.trace.value ? 'enable' : 'disable'; // strace-analysis
    ctrls.collection.value === true
      ? (params.thread = 'enable')
      : (params.thread = 'disable');
    if (params.interval > Math.floor(params.duration / 2)) {
      params.interval = Math.floor(params.duration / 2);
    }
    if (this.preSwitchProcess.switchState) {
      // ??????
      if (this.preSwitchProcess.selected === 1) {
        const durationArr = this.preSwitchProcess.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchProcess.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // ??????
        const onceArr = this.preSwitchProcess.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    this.formDatas = params;
  }

  // ????????????
  async createProcess(isEdit: any): Promise<any> {
    const self = this;
    const errors = TiValidators.check(this.processForm);
    const taskParam = this.processCheckedTypes.map((item) => {
      return item.id;
    });
    const ctrls = this.processForm.controls;
    const params: any = {
      'analysis-type': 'process-thread-analysis',
      'analysis-target': this.analysisMode,
      projectname: this.projectName,
      taskname: this.taskName,
      interval: ctrls.interval.value,
      duration: ctrls.duration.value,
      switch: false,
      task_param: {
        type: taskParam,
      },
    };
    params.pid = ctrls.pidInput.value;
    params.process = 'enable'; // ?????????enable
    params['strace-analysis'] = ctrls.trace.value ? 'enable' : 'disable'; // strace-analysis
    params.thread = ctrls.collection.value ? 'enable' : 'disable';

    if (params.interval > Math.floor(params.duration / 2)) {
      params.interval = Math.floor(params.duration / 2);
    }

    if (this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS) {
      params.pid = this.modePid;
      params.process_name = this.modeProcess;
    } else if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
      params['app-dir'] = this.modeApplication;
      params['app-parameters'] = this.modeAppParams;
    }

    params.nodeConfig = await this.getNodeConfigDatas();

    // ????????????????????????
    if (this.analysisMode !== AnalysisTarget.PROFILE_SYSTEM) {
      if (this.configNodeParaEl.switchStatus) {
        params.switch = true;
        this.formDatas.switch = true;
      } else {
        params.switch = false;
        this.formDatas.switch = false;
      }
    }

    if (this.isRestart) {
      this.restartFunction(params);
      return false;
    }
    //  ???????????? preSwitch ???????????????
    if (this.preSwitchProcess.switchState) {
      this.startCheckProcess.checked = false;
      const flag = await this.createPreMission(
        this.preSwitchProcess,
        params,
        'post'
      );
      if (flag) {
        this.startCheckProcess.checked = true;
      }
    } else {
      if (isEdit) {
        const urlAnalysis = '/tasks/' + encodeURIComponent(this.restartAndEditId) + '/';
        this.Axios.axios.put(urlAnalysis, params)
          .then((res: any) => {
            const data = res.data;
            if (isEdit) {
              this.mytip.alertInfo({
                type: 'success',
                content: this.i18n.tip_msg.edite_ok,
                time: 3500,
              });
              if (this.startCheckProcess.checked) {
                this.startDataSamplingTask(
                  this.projectName,
                  this.taskName,
                  data.id,
                  params
                );
              } else {
                this.closeTab.emit({});
              }
            }
          });
      } else {
        this.msgMessage.open({
          type: 'warn',
          title: this.i18n.secret_title,
          content: this.i18n.secret_count_without_code,
          close: () => {
            const urlAnalysis = '/tasks/';
            // ????????????????????????????????????
            const keyList = Object.keys(self.runUserDataObj);
            keyList.forEach((key) => {
              if (self.runUserDataObj[key].user_name && self.runUserDataObj[key].password) {
                params.is_user = true;
              }
            });
            this.Axios.axios.post(urlAnalysis, params)
              .then((res: any) => {
                const data = res.data;
                this.mytip.alertInfo({
                  type: 'success',
                  content: this.i18n.tip_msg.create_ok,
                  time: 3500,
                });
                if (this.startCheckProcess.checked) {
                  this.startDataSamplingTask(
                    this.projectName,
                    this.taskName,
                    data.id,
                    params
                  );
                } else {
                  this.closeTab.emit({
                    title: `${data.taskname}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: data['analysis-type'],
                    status: data['task-status'],
                    projectName: this.projectName
                  });
                }
              });
          }
        });
      }
    }
  }

  // ??????????????????????????????
  async getNodeConfigDatas() {
    this.getFormDatas();
    // ??????????????????????????????
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      const data: any = [];
      this.Axios.axios.get(url).then((res: any) => {
        const nodeList: Array<any> = this.sceneName === 'HPC'
          ? this.processForm.get('nodeList').value
          : res.data.nodeList;
        if (nodeList.length > 1) {
          nodeList.forEach((item: any) => {
            // ???????????????????????????
            let taskParamTmp;
            switch (this.analysisMode) {
              case AnalysisTarget.LAUNCH_APPLICATION:
                taskParamTmp = this.appConfigNodeData[item.nodeIp];
                break;
              case AnalysisTarget.ATTACH_TO_PROCESS:
                taskParamTmp = this.pidConfigNodeData[item.nodeIp];
                break;
              default:
            }
            if (!Object.keys(this.runUserDataObj).includes(item.nodeIp)) {
              this.runUserDataObj[item.nodeIp] = {
                runUser: false,
                user_name: '',
                password: ''
              };
            }
            data.push({
              nodeId: item.id,
              nickName: item.nickName,
              task_param: Object.assign({ status: false }, this.formDatas, taskParamTmp || {}),
            });
          });
        } else {
          nodeList.forEach((item: any) => {
            this.runUserDataObj[item.nodeIp] = {
              runUser: this.runUserData.runUser,
              user_name: this.runUserData.user,
              password: this.runUserData.password
            };
            data.push({
              nodeId: item.id,
              nickName: item.nickName,
              task_param: Object.assign({ status: false }, this.formDatas),
            });
          });
        }

        resolve(data);
      });
    });
  }

  // ??????/?????? ??????????????????
  public createPreMission(self: any, params: any, method: any) {
    //  ??????
    if (self.selected === 1) {
      const durationArr = self.durationTime.split(' ');
      params.cycle = true;
      params.targetTime = self.pointTime;
      params.cycleStart = durationArr[0];
      params.cycleStop = durationArr[1];
      params.appointment = '';
    } else {
      // ??????
      const onceArr = self.onceTime.split(' ');
      params.cycle = false;
      params.targetTime = onceArr[1];
      params.appointment = onceArr[0];
      params.cycleStart = '';
      params.cycleStop = '';
    }
    // ????????????????????????
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
        this.sendPretable.emit('on');
        this.closeTab.emit({});
        resolve(true);
      });
    });
  }

  // ????????????
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }
  // ????????????
  public async getTemplateData(e: any) {
    this.taskNameValid = true;
    this.modePidValid = true;
    this.modeAppValid = true;

    this.setSuperParamsValid(this.taskNameValid, this.modePidValid, this.modeAppValid);

    // ??????????????????
    this.processForm.controls.interval.setValue(e.interval);
    this.processForm.controls.duration.setValue(e.duration);
    this.processForm.get('nodeList').setValue(e.nodeConfig);
    this.processCheckedTypes = [];
    e.task_param.type.forEach((item: any) => {
      const a = this.processTypeOptions.filter((option) => {
        return option.id === item;
      });
      this.processCheckedTypes.push(a[0]);
    });
    this.processForm.controls.collection.setValue(e.thread === 'enable');
    // ????????????????????????
    this.preSwitchProcess.importTemp(e);
    if (this.isEdit || this.isRestart) {
      this.preSwitchProcess.isEdit = this.isEdit || this.isRestart;
    }

    // ??????????????????
    switch (this.analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
      case AnalysisTarget.LAUNCH_APPLICATION:
        this.processForm.controls.trace.setValue(e['strace-analysis'] === 'enable');
        if (e.switch) {
          this.sendAppOrPidDisable.emit(true);
          setTimeout(() => { this.configNodeParaEl.importTemp(e.nodeConfig); });
        } else {
          this.configNodeParaEl.clear();
        }
        break;
    }

    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    const res = await this.Axios.axios.get(url);
    const nodeList = res.data.nodeList as Array<{ nodeIp: string, id: number }>;
    const nodeConfig = e.nodeConfig.map((config: { nodeId: number, task_param: any }) => {
      return {
        nodeId: config.nodeId,
        task_param: config.task_param,
        nodeIp: nodeList.find(item => item.id === config.nodeId).nodeIp
      };
    });
    // ??????????????????
    switch (this.analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
        for (const nodeItem of nodeConfig) {
          const { nodeIp, task_param } = nodeItem;
          this.pidConfigNodeData[nodeIp] = {
            pid: task_param?.pid,
            process_name: task_param?.process_name,
            status: task_param?.status
          };
        }
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        for (const nodeItem of nodeConfig) {
          const { nodeIp, task_param } = nodeItem;
          this.appConfigNodeData[nodeIp] = {
            'app-dir': task_param?.['app-dir'],
            'app-parameters': task_param?.['app-parameters'],
            status: task_param?.status
          };
        }
        break;
    }
  }

  async saveTemplates() {
    const errors = TiValidators.check(this.processForm);
    const taskParam = this.processCheckedTypes.map((item) => {
      return item.id;
    });
    const self = this;
    const ctrls = self.processForm.controls;
    const params: any = {
      'analysis-type': 'process-thread-analysis',
      'analysis-target': this.analysisMode,
      projectname: self.projectName,
      taskname: self.taskName,
      interval: ctrls.interval.value,
      duration: ctrls.duration.value,
      switch: true,
      task_param: {
        type: taskParam,
      },
    };
    params.pid = ctrls.pidInput.value;
    params.process = 'enable'; // ?????????enable
    ctrls.trace.value === true
      ? (params['strace-analysis'] = 'enable')
      : (params['strace-analysis'] = 'disable'); // strace-analysis
    ctrls.collection.value === true
      ? (params.thread = 'enable')
      : (params.thread = 'disable');
    if (params.interval > Math.floor(params.duration / 2)) {
      params.interval = Math.floor(params.duration / 2);
    }

    if (this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS) {
      params.pid = this.modePid;
      params.process_name = this.modeProcess;
    } else if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
      params['app-dir'] = this.modeApplication;
      params['app-parameters'] = this.modeAppParams;
    }

    if (this.preSwitchProcess.switchState) {
      // ??????
      if (this.preSwitchProcess.selected === 1) {
        const durationArr = this.preSwitchProcess.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchProcess.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // ??????
        const onceArr = this.preSwitchProcess.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    params.nodeConfig = await this.getNodeConfigDatas();

    // ????????????????????????
    if (this.analysisMode !== AnalysisTarget.PROFILE_SYSTEM) {
      if (this.configNodeParaEl.switchStatus) {
        params.switch = true;
      } else {
        params.switch = false;
      }
    }

    this.keepData = params;
    this.sendMissionKeep.emit(this.keepData);
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

  // ????????????
  public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
    const option: any = { status: 'running' };
    if (this.analysisMode === 'Launch Application') {
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

  //  ??????
  public restartFunction(params: any) {
    params.status = 'restarted';
    const self = this;
    if (self.analysisMode === 'Launch Application') {
      params.user_message = this.dealRunUserDataObj(self.runUserDataObj);
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

  // ?????? info-icon ??? left ???
  get tipInfoLeftPosition() {
    return -parseInt(this.labelWidth, 10) - 20 + 'px';
  }

  public handleNodeEmit(e: any) {
    if (this.analysisMode === AnalysisTarget.ATTACH_TO_PROCESS) {
      this.pidConfigModel.open();
      if (this.pidConfigNodeData[e.nodeIP] == null) {
        this.pidConfigModel.configData = {
          rawData: e,
          nodeName: e.nodeName,
          nodeIP: e.nodeIP,
          param: {
            status: e.param.status,
            pid: e.param.pid,
            process_name: e.param.process_name,
          }
        };
      } else {
        this.pidConfigModel.configData = {
          rawData: e,
          nodeName: e.nodeName,
          nodeIP: e.nodeIP,
          param: {
            status: this.pidConfigNodeData[e.nodeIP].status,
            pid: this.pidConfigNodeData[e.nodeIP].pid,
            process_name: this.pidConfigNodeData[e.nodeIP].process_name,
          }
        };
      }
    } else if (this.analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
      this.appConfigModel.open();
      if (this.appConfigNodeData[e.nodeIP] == null) {
        this.appConfigModel.configData = {
          rawData: e,
          nodeName: e.nodeName,
          nodeIP: e.nodeIP,
          param: {
            status: e.param.status,
            'app-dir': e.param['app-dir'],
            'app-parameters': e.param['app-parameters'],
          },
          runUserDate: {
            runUser: e.runUser.runUser,
            user: this.runUserDataObj?.[e.nodeIP]?.user_name || e.runUser.user,
            password: this.runUserDataObj?.[e.nodeIP]?.password || e.runUser.password
          },
          isModifySchedule: this.isModifySchedule
        };
      } else {
        this.appConfigModel.configData = {
          rawData: e,
          nodeName: e.nodeName,
          nodeIP: e.nodeIP,
          param: {
            status: this.appConfigNodeData[e.nodeIP].status,
            'app-dir': this.appConfigNodeData[e.nodeIP]['app-dir'],
            'app-parameters': this.appConfigNodeData[e.nodeIP]['app-parameters'],
          },
          runUserDate: {
            runUser: e.runUser.runUser,
            user: e.runUser.user,
            password: e.runUser.password
          },
          isModifySchedule: this.isModifySchedule
        };
      }
    }
  }

  /**
   * Attach to Process: ????????????????????????
   * @param val ?????????????????????
   */
  public onPidConfirmConfig(val: any) {
    val.rawData.param.status = val.param.status;
    this.pidConfigNodeData[val.nodeIP] = val.param;
  }

  /**
   * Launch Applicateion: ????????????????????????
   * @param val ?????????????????????
   */
  public onAppConfirmConfig(val: any) {
    val.rawData.param.status = val.param.status;
    this.appConfigNodeData[val.nodeIP] = val.param;
    this.runUserDataObj[val.nodeIP] = {
      runUser: val.runUserDate.runUser,
      user_name: val.runUserDate.user,
      password: val.runUserDate.password,
    };
    let bool = false;
    Object.keys(this.runUserDataObj).map((key: string) => {
      if (this.runUserDataObj[key].runUser) {
        bool = true;
        return;
      }
    });
    this.isShowReserveAndImmedia = bool;
  }

  /**
   * ????????????????????????
   */
  public setSpinnerBlur() {
    this.intervalBlur = {
      control: this.processForm.controls.interval,
      min: 1,
      max: 10,
    };
    this.samplingDurationBlur = {
      control: this.processForm.controls.duration,
      min: 2,
      max: 300,
    };
  }
}
