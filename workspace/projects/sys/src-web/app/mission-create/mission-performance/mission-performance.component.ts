// 性能全景分析_create
import { Component, OnInit, ViewChild, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { UserGuideService } from '../../service/user-guide.service';
import { CustomValidators } from '../taskParams/AllParams';
import { Subscription } from 'rxjs';
import { DatabaseConfig } from '../domain';
import { MissionNodeConfigComponent } from '../mission-components/mission-node-config/mission-node-config.component';
import { AnalysisScene, SpinnerBlurInfo } from 'projects/sys/src-web/app/domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { CustomValidatorsService } from '../../service';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-performance',
  templateUrl: './mission-performance.component.html',
  styleUrls: ['./mission-performance.component.scss', '../mission-components/task-form/task-form.component.scss']
})
export class MissionPerformanceComponent implements OnInit, OnDestroy {
  constructor(
    public http: HttpService,
    public I18n: I18nService,
    public Axios: AxiosService,
    fb: FormBuilder,
    public scheduleTaskServer: ScheduleTaskService,
    public mytip: MytipService,
    public userGuide: UserGuideService,
    private msgService: MessageModalService,
    public customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = I18n.I18n();

    // system
    this.sysForm = fb.group({
      interval: new FormControl(1, {
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
      duration: new FormControl(300, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(2),
          TiValidators.maxValue(300),
        ],
        updateOn: 'change',
      }),
      scenes: new FormControl('', [this.customValidatorsService.checkFilePath()]),
      collectTop: new FormControl(true, {
        updateOn: 'change',
      }),
    });
    this.sysScenesForm = fb.group({
      nodeList: new FormControl([]),
      interval: new FormControl(1, {
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
      duration: new FormControl(300, {
        validators: [
          TiValidators.required,
          TiValidators.minValue(2),
          TiValidators.maxValue(300),
        ],
        updateOn: 'change',
      }),
      collectTop: new FormControl(true, {
        updateOn: 'change',
      }),

      traceForm: new FormGroup({
        traceSwitch: new FormControl(false, {
          updateOn: 'change',
        }),
        events: new FormControl('', [TiValidators.required, this.validFilePath(this.i18n.sys.eventError)]),
      }),
      databaseConfig: new FormGroup({
        ip: new FormControl('', [TiValidators.required, TiValidators.ipv4]),
        port: new FormControl(null, [TiValidators.minValue(1), TiValidators.maxValue(65535)]),
        username: new FormControl('', [TiValidators.required]),
        password: new FormControl('', [TiValidators.required]),
      })
    });
    this.sysItems = {
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
      scenes: {
        label: this.i18n.sys.scenes_bigData,
        placeholder: this.i18n.sys.scenes_placeholder,
        tailPrompt: this.i18n.sys.scenes_tailprompt,
        collectTop: this.i18n.sys.scenes_top,
      }
    };
    this.startCheckSys = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    this.startCheckC = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    (this.sysScenesForm.controls.traceForm as FormGroup).controls.events.disable();
    (this.sysScenesForm.controls.traceForm as FormGroup).controls.traceSwitch.valueChanges.subscribe((value) => {
      this.ifTracing = value;
      if (this.ifTracing) {
        (this.sysScenesForm.controls.traceForm as FormGroup).controls.events.enable();
      } else {
        (this.sysScenesForm.controls.traceForm as FormGroup).controls.events.disable();
      }
    });
    if (window.navigator.msSaveOrOpenBlob) { // IE浏览器自动聚焦先更改校验
      this.sysScenesForm.setControl('databaseConfig', new FormGroup({
        ip: new FormControl('', []),
        port: new FormControl(null, [TiValidators.minValue(1), TiValidators.maxValue(65535)]),
        username: new FormControl('', []),
        password: new FormControl('', []),
      }));
      let lock = true;
      (this.sysScenesForm.controls.databaseConfig as FormGroup).controls.password.valueChanges.subscribe((value) => {
        if (lock) {
          this.sysScenesForm.setControl('databaseConfig', new FormGroup({
            ip: new FormControl('', [TiValidators.required, TiValidators.ipv4]),
            port: new FormControl(null, [TiValidators.minValue(1), TiValidators.maxValue(65535)]),
            username: new FormControl('', [TiValidators.required]),
            password: new FormControl('', [TiValidators.required]),
          }));
          lock = false;
        }
      });
    }
  }
  @ViewChild('preSwitchSysA') preSwitchSysA: any;
  @ViewChild('pretable') pretable: any;
  @ViewChild('nodeConfigModal') nodeConfigModal: MissionNodeConfigComponent;
  @Output() private sendMissionKeep = new EventEmitter<any>();
  @Output() private sendPretable = new EventEmitter<any>();
  @Output() private closeTab = new EventEmitter<any>();
  @Output() private handleNodeEmitIndex = new EventEmitter<any>();
  @Input() labelWidth: string;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskNameValid: boolean;
  @Input() isModifySchedule: boolean;
  @Input() projectId: number;
  @Input() restartAndEditId: number;
  @Input() widthIsLimited = false;  // 表单父容器的宽度是否受限，例如在 home 界面提示信息在输入框的后面显示，在修改预约任务的drawer里面提示信息需要在输入框的下面显示
  @Input() scenes: any; //  0 分布式场景;  1 大数据场景 ;2 通用场景 general scenario equal storage
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;

  public ifTracing = false; // 是否采集tracing数据, 不作为参数传递
  public analysisScene = AnalysisScene;
  public i18n: any;
  public isRestart = false; // 是否重启
  public isEdit = false; // 是否修改
  public sysForm: FormGroup;
  public sysScenesForm: FormGroup;
  public currentForm: FormGroup;
  public sysItems: any = {};
  public sureCreateButton: any;  // 新建任务确认弹窗

  public startCheckSys: any = {};   // 立即启动

  public startCheckC: any = {};

  public configCheckedTypes: Array<any> = [];
  public userGuideStep: Subscription;
  public formDatas: any;
  public keepData: any; // 保存模板
  // 表单验证部分
  public validation: TiValidationConfig = {
    type: 'blur',
  };

  // 修改预约任务 接收从预约传来的值
  public editScheduleTask = false; // 判断是否是修改
  public scheduleTaskId: any; // 保存修改的预约任务ID

  public durationBlur: SpinnerBlurInfo;
  public intervalBlur: SpinnerBlurInfo;
  public durationBlurSysForm: SpinnerBlurInfo;
  public intervalBlurSysForm: SpinnerBlurInfo;
  // 数据库场景下确认按钮禁用的提示
  public startOrSaveBtnTip = '';

  // 工程下节点信息
  nodeList: any[] = [];
  sceneName = '';
  isSelectNodeDisabled: boolean;

  private nodeIpMap: { [nodeNickName: string]: string } = {};

  ngOnInit() {
    const that = this;
    this.getProjectNodes();
    this.changeScenesTitle();
    this.userGuideStep = this.userGuide.userGuideStep.subscribe((str) => {
      if (str === 'select-analysis-target-type') {
        const selectSeenes = document.querySelector('#user-guide-scroll');
        const scrHeight = selectSeenes.scrollHeight;
        selectSeenes.scrollTop = scrHeight;
        that.currentForm.controls.duration.setValue(5);
        this.userGuide.showMask('user-guide-analysis-params');
      } else if (str === 'user-guide-analysis-params') {
        this.userGuide.showMask('create-task-sure');
      } else if (str === 'create-task-sure') {
        this.createSys(false);
      } else if (str === 'ti3-modal-content') {
        this.sureCreateButton.close();
      }
    });

    this.setSpinnerBlur();
  }
  getProjectNodes() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (res?.data?.nodeList) {
        // 存储工程下的节点信息
        this.nodeList = res.data.nodeList;
        if (!(this.isEdit || this.isRestart)) {
          this.currentForm.controls.nodeList.setValue(
            this.nodeList.length > 10 ? this.nodeList.slice(0, 10) : this.nodeList
          );
        }
      }
      // 获取工程
      this.sceneName = res.data.sceneName;
      if (this.sceneName === 'HPC') {
        this.sysScenesForm.get('nodeList').enable();
      } else {
        this.sysScenesForm.get('nodeList').disable();
      }
    });
  }
  selectNodeDisable(event: boolean){
    this.isSelectNodeDisabled = event;
  }

  /**
   * 微调器回填初始化
   */
  public setSpinnerBlur() {
    this.durationBlur = {
      control: this.sysScenesForm.controls.duration,
      min: 2,
      max: 300,
    };
    this.intervalBlur = {
      control: this.sysScenesForm.controls.interval,
      min: 1,
      max: 10,
    };
    this.durationBlurSysForm = {
      control: this.sysForm.controls.duration,
      min: 2,
      max: 300,
    };
    this.intervalBlurSysForm = {
      control: this.sysForm.controls.interval,
      min: 1,
      max: 10,
    };
  }
  ngOnDestroy() {
    if (this.userGuideStep) {
      this.userGuideStep.unsubscribe();
    }
  }

  /**
   * 改变校验表单及场景title
   */
  public changeScenesTitle() {
    if (this.scenes === AnalysisScene.BigData) {
      // 大数据场景
      this.currentForm = this.sysForm;
      this.sysItems.scenes.label = this.i18n.sys.scenes_bigData;
    } else if (this.scenes === AnalysisScene.Distribute) {
      // 分布式场景
      this.currentForm = this.sysForm;
      this.sysItems.scenes.label = this.i18n.sys.scenes_dds;
    } else if (this.scenes === AnalysisScene.Database) {
      // 数据库
      this.currentForm = this.sysScenesForm;
    } else if (this.scenes === AnalysisScene.Hpc) {
      // HPC
      this.sysScenesForm.removeControl('databaseConfig');
      this.sysScenesForm.removeControl('traceForm');
      this.currentForm = this.sysScenesForm;
    } else {
      // 通用场景
      this.sysScenesForm.removeControl('databaseConfig');
      this.sysScenesForm.removeControl('traceForm');
      this.currentForm = this.sysScenesForm;
    }
  }

  // 创建任务

  // 获取表单数据
  public getFormDatas(str: string) {
    const errors = TiValidators.check(this.currentForm);

    const ctrls = this.currentForm.controls;
    const params: any = {
      'analysis-type': 'system',
      projectname: this.projectName,
      taskname: this.taskName,
      interval: ctrls.interval.value,
      duration: ctrls.duration.value,
      topCheck: ctrls.collectTop.value,
    };
    if (this.scenes === AnalysisScene.Database) {
      const databaseConfig: DatabaseConfig = ctrls.databaseConfig.value;
      params.sqlIp = databaseConfig.ip;
      params.sqlPort = databaseConfig.port;
      params.sqlUser = databaseConfig.username;
      params.sqlPwd = databaseConfig.password;
      params.traceSwitch = ctrls.traceForm.value.traceSwitch;
      if (ctrls.traceForm.value.traceSwitch) {
        params.events = ctrls.traceForm.value.events;
      } else {
        params.events = '';
      }
      params.sceneSolution = this.scenes;
    }
    if (this.scenes === AnalysisScene.Distribute || this.scenes === AnalysisScene.BigData) {
      params.configDir = ctrls.scenes.value;
      params.sceneSolution = this.scenes;
    }
    if (params.interval > Math.floor(params.duration / 2)) {
      params.interval = Math.floor(params.duration / 2);
    }
    if (this.preSwitchSysA.switchState) {
      // 预约
      if (this.preSwitchSysA.selected === 1) {
        const durationArr = this.preSwitchSysA.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchSysA.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchSysA.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    this.formDatas = params;
  }
  private async initNodeIpMap() {
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    const res = await this.Axios.axios.get(url);
    res.data.nodeList.forEach((item: any) => {
      this.nodeIpMap[item.nickName] = item.nodeIp;
    });
  }
  // 多节点
  // 当配置节点参数没开时
  async getNodeConfigDatas(params: any) {

    this.getFormDatas(params);
    // 当开关组件没有打开时
    const url = `projects/${encodeURIComponent(this.projectId)}/info/`;
    return new Promise((resolve, reject) => {
      const data: any = [];
      const nodeList = this.sceneName === 'HPC'
        ? this.currentForm.get('nodeList').value
        : this.nodeList;
      nodeList.forEach((item: any) => {
        this.nodeIpMap[item.nickName] = item.nodeIp;
        data.push({
          nodeId: item.id,
          nickName: item.nickName,
          task_param: Object.assign({}, { status: false }, this.formDatas),
        });
      });
      resolve(data);
    });
  }
  async createSys(isEdit: any): Promise<any> {

    const errors = TiValidators.check(this.currentForm);

    const ctrls = this.currentForm.controls;
    const params: any = {
      'analysis-type': 'system',
      projectname: this.projectName,
      taskname: this.taskName,
      interval: ctrls.interval.value,
      duration: ctrls.duration.value,
      topCheck: ctrls.collectTop.value,
    };
    if (this.scenes === AnalysisScene.Database) {
      const databaseConfig: DatabaseConfig = ctrls.databaseConfig.value;
      params.sqlIp = databaseConfig.ip;
      params.sqlPort = databaseConfig.port;
      params.sqlUser = databaseConfig.username;
      params.sqlPwd = databaseConfig.password;
      params.traceSwitch = ctrls.traceForm.value.traceSwitch;
      params.events = ctrls.traceForm.value.events;
      params.sceneSolution = this.scenes;
    }
    if (this.scenes === AnalysisScene.Distribute || this.scenes === AnalysisScene.BigData) {
      params.configDir = ctrls.scenes.value;
      params.sceneSolution = this.scenes;
    }
    if (params.interval > Math.floor(params.duration / 2)) {
      params.interval = Math.floor(params.duration / 2);
    }
    // 多节点数据
    params.switch = this.nodeConfigModal?.switchStatus || false;
    if (params.switch) {
      await this.initNodeIpMap();
      params.nodeConfig = this.nodeConfigModal.getNodesConfigParams();
      params.nodeConfig.forEach((item: any) => {
        item.task_param.taskname = this.taskName;
        delete item.task_param['analysis-target'];
      });
    } else {
      params.nodeConfig = await this.getNodeConfigDatas(params['analysis-type']);
    }
    if (this.isRestart) {
      this.restartFunction(params);
      return false;
    }
    // user guide
    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
      // 标识 user-guide 步骤
      setTimeout(() => {
        this.userGuide.showMask('ti3-modal-content', 'class');
        setTimeout(() => {
          $('.ti3-modal').css('background', 'rgba(0,0,0,0)');
        }, 200);
      }, 200);
    }
    //  预约任务 preSwitch 预约组件名
    if (this.preSwitchSysA.switchState) {
      this.startCheckSys.checked = false;
      // 创建预约任务
      const flag = await this.createPreMission(this.preSwitchSysA, params, 'post');
      if (flag) {
        this.startCheckSys.checked = true;
      }
    } else {
      //  非预约任务
      if (isEdit) {
        const urlAnalysis = '/tasks/' + encodeURIComponent(this.restartAndEditId) + '/';
        const errorText = 'task_edit_error';
        this.Axios.axios.put(urlAnalysis, params).then((res: any) => {
          const data = res.data;
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.edite_ok,
            time: 3500,
          });
          if (this.startCheckSys.checked) {
            this.startDataSamplingTask(
              this.projectName,
              this.taskName,
              data.id,
              params
            );
          } else {
            this.closeTab.emit({});
          }
        }).catch(async () => {
          // user-guide 新建报错 结束新手引导
          if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
            this.userGuide.closeUserGuide();
          }
        });
      } else {
        this.sureCreateButton = this.msgService.open({
          type: 'warn',
          title: this.i18n.secret_title,
          content: this.i18n.secret_count_without_code,
          close: () => {
            this.sureCreate(params);
          },

        });
      }
    }
  }

  /**
   * 确认创建任务弹窗按钮事件
   */

  public sureCreate(params: any) {
    const userMessage: { [nodeIp: string]: { user_name: string, password: string } } = {};
    if (this.scenes === AnalysisScene.Database) {
      params.nodeConfig.forEach((item: any) => {
        userMessage[this.nodeIpMap[item.nickName]] = {
          user_name: item.task_param.sqlUser || params.sqlUser,
          password: item.task_param.sqlPwd || params.sqlPwd
        };
        delete item.task_param.sqlUser;
        delete item.task_param.sqlPwd;
      });
      delete params.sqlUser;
      delete params.sqlPwd;
    }
    const urlAnalysis = '/tasks/';
    this.Axios.axios.post(urlAnalysis, params).then((res: any) => {
      const data = res.data;
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.create_ok,
        time: 3500,
      });
      if (this.startCheckSys.checked) {
        this.startDataSamplingTask(
          this.projectName,
          this.taskName,
          data.id,
          params,
          userMessage
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
    }).catch(async () => {
      // user-guide 新建报错 结束新手引导
      if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
        this.userGuide.closeUserGuide();
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
        this.sendPretable.emit('on');
        this.closeTab.emit({});
        resolve(true);
      });
    });
  }

  // 导入模板
  public getTemplateData(e: any): void {
    this.changeScenesTitle();
    this.taskNameValid = true;
    this.currentForm.controls.interval.setValue(e.interval);
    this.currentForm.controls.duration.setValue(e.duration);
    if (Object.prototype.hasOwnProperty.call(e, 'topCheck') && e.topCheck !== null) {
      this.currentForm.controls.collectTop.setValue(e.topCheck);
    } else {
      this.currentForm.controls.collectTop.setValue(true);
    }
    if (this.scenes === AnalysisScene.Database) {
      const databaseFormGroup = this.currentForm.controls.databaseConfig as FormGroup;
      const traceFormGroup = this.currentForm.controls.traceForm as FormGroup;
      databaseFormGroup.controls.ip.setValue(e.sqlIp);
      databaseFormGroup.controls.port.setValue(e.sqlPort);
      traceFormGroup.controls.traceSwitch.setValue(e.traceSwitch);
      traceFormGroup.controls.events.setValue(e.events);
    }
    if (this.scenes === AnalysisScene.Distribute || this.scenes === AnalysisScene.BigData) {
      this.currentForm.controls.scenes.setValue(e.configDir);
    }
    if (this.scenes === AnalysisScene.Hpc) {
      this.currentForm.get('nodeList').setValue(e.nodeConfig);
    }
    // 预约任务数据导入
    this.preSwitchSysA.importTemp(e);
    if (this.isEdit || this.isRestart) {
      this.preSwitchSysA.isEdit = this.isEdit || this.isRestart;
    }
    if (e.switch) {
      // 多节点数据导入
      this.nodeConfigModal.importTemp(e.nodeConfig);
    }
  }

  // 取消按钮
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }
  // 保存模板
  async saveTemplates() {
    const errors = TiValidators.check(this.currentForm);
    const self = this;
    const ctrls = this.currentForm.controls;
    const params: any = {
      'analysis-type': 'system',
      projectname: self.projectName,
      taskname: self.taskName,
      interval: ctrls.interval.value,
      duration: ctrls.duration.value,
      topCheck: ctrls.collectTop.value,
    };
    if (this.scenes === AnalysisScene.Database) {
      const databaseConfig: DatabaseConfig = ctrls.databaseConfig.value;
      params.sqlIp = databaseConfig.ip;
      params.sqlPort = databaseConfig.port;
      params.traceSwitch = ctrls.traceForm.value.traceSwitch;
      if (ctrls.traceForm.value.traceSwitch) {
        params.events = ctrls.traceForm.value.events;
      } else {
        params.events = '';
      }
      params.sceneSolution = this.scenes;
    }
    if (this.scenes === AnalysisScene.Distribute || this.scenes === AnalysisScene.BigData) {
      params.configDir = ctrls.scenes.value;
      params.sceneSolution = this.scenes;
    }
    if (params.interval > Math.floor(params.duration / 2)) {
      params.interval = Math.floor(params.duration / 2);
    }
    if (this.preSwitchSysA.switchState) {
      // 预约
      if (this.preSwitchSysA.selected === 1) {
        const durationArr = this.preSwitchSysA.durationTime.split(' ');
        params.cycle = true;
        params.targetTime = this.preSwitchSysA.pointTime;
        params.cycleStart = durationArr[0];
        params.cycleStop = durationArr[1];
        params.appointment = '';
      } else {
        // 单次
        const onceArr = this.preSwitchSysA.onceTime.split(' ');
        params.cycle = false;
        params.targetTime = onceArr[1];
        params.appointment = onceArr[0];
      }
    }
    params.switch = this.nodeConfigModal?.switchStatus || false;
    if (params.switch) {
      params.nodeConfig = this.nodeConfigModal.getNodesConfigParams();
      params.nodeConfig.forEach((item: any) => {
        item.task_param.taskname = this.taskName;
        delete item.task_param['analysis-target'];
        delete item.task_param.sqlUser;
        delete item.task_param.sqlPwd;
      });
    } else {
      params.nodeConfig = await this.getNodeConfigDatas(params['analysis-type']);
    }
    this.keepData = params;
    this.sendMissionKeep.emit(this.keepData);
  }
  // 清空任务参数
  public clear() {
    this.preSwitchSysA.clear();
  }
  // 立即启动
  public startDataSamplingTask(
    projectname: any, taskname: any, id: any, params: any,
    userMessage?: { [nodeIp: string]: { user_name: string, password: string } }
  ) {
    this.Axios.axios
      .get(
        '/res-status/?type=disk_space&project-name=' +
        encodeURIComponent(projectname) +
        '&task-name=' +
        encodeURIComponent(taskname)
      )
      .then((data: any) => {
        const self = this;
        const startParams: any = { status: 'running' };
        if (this.scenes === AnalysisScene.Database) {
          startParams.user_message = userMessage;
        }
        this.Axios.axios
          .put('/tasks/' + id + '/status/', startParams)
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
  public async restartFunction(params: any) {
    if (this.scenes === AnalysisScene.Database) {
      const userMessage: { [nodeIp: string]: { user_name: string, password: string } } = {};
      await this.initNodeIpMap();
      params.nodeConfig.forEach((item: any) => {
        userMessage[this.nodeIpMap[item.nickName]] = {
          user_name: item.task_param.sqlUser || params.sqlUser,
          password: item.task_param.sqlPwd || params.sqlPwd
        };
        delete item.task_param.sqlUser;
        delete item.task_param.sqlPwd;
      });
      delete params.sqlUser;
      delete params.sqlPwd;
      params.user_message = userMessage;
    }
    params.status = 'restarted';
    const self = this;
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
      .catch(() => {
      });
  }

  // 计算 info-icon 的 left 值
  get tipInfoLeftPosition() {
    return -parseInt(this.labelWidth, 10) - 20 + 'px';
  }

  public onControlNode(taskName: string) {
    const databaseFormGroup = this.currentForm.controls.databaseConfig as FormGroup;
    if (taskName) {
      this.getFormDatas(taskName);
      this.formDatas['analysis-target'] = 'Profile System';
      databaseFormGroup.disable();
    } else {
      databaseFormGroup.enable();
    }
  }

  public handleNodeEmit(e: any) {
    this.handleNodeEmitIndex.emit(e);
  }

  public startOrSaveBtnIsDisabled() {
    if (this.scenes === this.analysisScene.Database && this.nodeConfigModal?.switchStatus) {
      const isDisabled = !!this.nodeConfigModal.srcData.data.find(item => {
        return !(item.params.sqlUser && item.params.sqlPwd);
      });
      if (isDisabled) {
        this.startOrSaveBtnTip = this.i18n.databaseConfig.btnTip;
      } else {
        this.startOrSaveBtnTip = '';
      }
      return isDisabled;
    } else {
      return !(
        this.currentForm.valid
        && this.taskNameValid
        && (this.preSwitchSysA?.previewState || !this.preSwitchSysA?.switchState)
      );
    }
  }

  /**
   * 打开联机帮助
   */
  public openHelp() {
    let url = window.location.origin + window.location.pathname;
    if (sessionStorage.getItem('language') === 'en-us') {
      url +=
        './assets/help/en/index.html';
    } else {
      url +=
        './assets/help/zh/index.html';
    }
    window.open(url, '_blank');
  }
  /**
   * tracing采集事件格式校验
   * @param errorMessage 错误提示信息
   * @returns bool
   */
  private validFilePath(errorMessage: string): ValidatorFn {
    const reg = /^([a-zA-Z0-9\-\_]+\:[a-zA-Z0-9\*]+,)*([a-zA-Z0-9\-\_]+\:[a-zA-Z0-9\*]+)$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const tmpValue = (control.value || '').toString().trim();
      if (tmpValue === '' || tmpValue == null) { return null; }

      return reg.test(tmpValue)
        ? null
        : { filePath: { tiErrorMessage: errorMessage } };
    };
  }
}
