// 访存统计分析_create
import {
  Component, ViewChild, Output, Input, EventEmitter, SimpleChanges, OnChanges, ViewChildren, OnInit
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';

import { MemAnalysisModeForm } from '../taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../taskParams/modules/MemAccessForm';
import { MissEventForm } from '../taskParams/modules/MissEventForm';
import { FalseSharingForm } from '../taskParams/modules/FalseSharingForm';
import { LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-mission-mem',
  templateUrl: './mission-mem.component.html',
  styleUrls: ['./mission-mem.component.scss']
})

export class MissionMemComponent implements OnChanges, OnInit {
  @Input() labelWidth: string;
  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskNameValid: boolean;
  @Input() targetClicked: boolean;
  @Input() modeClicked: boolean;
  @Input() modeApplication: string;
  @Input() modeAppParams: string;
  @Input() switchState: boolean;
  @Input() modeApplicationUser: string;
  @Input() modeApplicationPassWord: string;
  @Input() modePid: string;
  @Input() modeProcess: string;
  @Input() modeAppValid: boolean;
  @Input() modePidValid = false;
  @Input() nodeConfigShow: boolean;
  @Input() nodeConfigedData: any;
  @Input() projectId: number;
  @Input() restartAndEditId: number;
  @Input() typeId: number;
  @Input() isModifySchedule: boolean;
  @Input() drawerLevel: number;
  @Input() widthIsLimited = false;  // 表单父容器的宽度是否受限，例如在 home 界面提示信息在输入框的后面显示，在修改预约任务的drawer里面提示信息需要在输入框的下面显示
  @Input() taskDetail: any = {
    isFromTuningHelper: false,
  };

  @Output() public sendMissionKeep = new EventEmitter<any>();
  @Output() public sendPretable = new EventEmitter<any>();
  @Output() public closeTab = new EventEmitter<any>();
  @Output() public sendAppOrPidDisable = new EventEmitter<any>();
  @Output() public handleNodeEmitIndex = new EventEmitter<any>();
  @Output() public memAnalysisModeChange = new EventEmitter<any>();

  @ViewChildren('taskTmpl') taskTmpls: any;
  @ViewChild('scheduledStartup') scheduledStartup: any;

  public i18n: any;
  public type = 'create';
  public scheduleTaskId: any; // 保存修改的预约任务ID
  public runUserDataObj: LaunchRunUser = {};
  public runUserData = {
    runUser: false,
    user: '',
    password: ''
  };

  // 预约定时启动参数
  public scheduledPrams = {
    startNow: true,
  };

  public formEl: any; // 公共参数 + 访存分析类型 的表单参数
  public childFormEl: any; // 子表单 的表单参数
  public memAccessFormEl: any;  // 访存统计分析的表单参数
  public missEventFormEl: any;  // Miss事件统计的表单参数
  public falsesharingFormEl: any; // 伪共享分析的表单参数
  public nodeSelectForm: FormGroup;  // hpc工程节点选择表单参数
  public memAnalysisMode: string;
  public self: any = this;
  public formRelated: any = {
    mem_access: 'memAccessFormEl',
    miss_event: 'missEventFormEl',
    falsesharing: 'falsesharingFormEl',
  };
  public appAndPidValid = true;
  public memAnalysisModeInfo: any;
  public isShowReserveAndImmedia = false;

  /** 工程下的所以节点 */
  public allNodeList: any = [];
  /** 工程类型 */
  public isHpcPro = false;
  /** hpc工程节点选择器是否禁用 */
  public isSelectNodeDisabled = false;

  constructor(
    public I18n: I18nService,
    public mytip: MytipService,
    public Axios: AxiosService,
    private tiMessage: MessageModalService,
    public fb: FormBuilder
  ) {
    this.i18n = I18n.I18n();

    this.formEl = new MemAnalysisModeForm();
    this.formEl.generateFormGroup();
    this.formEl.customForm({ formEl: this.formEl });

    // 访存统计分析的表单参数
    this.memAccessFormEl = new MemAccessForm();
    this.memAccessFormEl.generateFormGroup();
    this.memAccessFormEl.initDefaultValue({ list: this.memAccessFormEl.displayedElementList });

    // Miss事件统计的表单参数
    this.missEventFormEl = new MissEventForm();
    this.missEventFormEl.generateFormGroup();
    this.missEventFormEl.initDefaultValue({ list: this.missEventFormEl.displayedElementList });

    // 伪共享分析的表单参数
    this.falsesharingFormEl = new FalseSharingForm(this.i18n);
    this.falsesharingFormEl.generateFormGroup();
    this.falsesharingFormEl.initDefaultValue({ list: this.falsesharingFormEl.displayedElementList });
    // 监听 memAnalysisMode 的变化
    this.formEl.formGroup.get('memAnalysisMode').valueChanges.subscribe((val: any) => {
      this.memAnalysisMode = val;
      this.childFormEl = this.self[this.formRelated[val]];

      // 通知子组件组件状态改变
      if (val && this.taskTmpls) {
        const taskTmpl = this.taskTmpls.find((tmpl: any) => tmpl.analysisType === val);

        if (taskTmpl) {
          taskTmpl.componentStatusChange('activated');
        }
      }
    });

    // 分析对象不同，显示的参数不同
    this.formEl.formGroup.get('analysisObject').valueChanges.subscribe((val: any) => {
      this.missEventFormEl.setAnalysisObject(val);
      this.falsesharingFormEl.setAnalysisObject(val);
    });
    this.formEl.formGroup.get('analysisMode').valueChanges.subscribe((val: any) => {
      if (val && this.formEl.formGroup.get('analysisObject').value === 'analysisObject_app') {
        this.missEventFormEl.setAnalysisObject(val);
        this.falsesharingFormEl.setAnalysisObject(val);
      }
    });
    this.memAnalysisModeInfo = this.formEl.form.memAnalysisMode;
    this.memAnalysisMode = this.memAnalysisModeInfo.systemList[0].value;
    this.nodeSelectForm = fb.group({
      nodeList: new FormControl([]),
    });
  }
  // 选择访存类型
  public ngModelChange(i: any) {
    this.runUserDataObj = {};
    this.memAnalysisMode = this.memAnalysisModeInfo.systemList[i].value;
    this.memAnalysisModeChange.emit(this.memAnalysisMode);
  }

  async ngOnInit() {
    this.allNodeList = await this.getProjectNodes();
    if (this.type === 'create') {
      this.nodeSelectForm.controls.nodeList.setValue(
        this.allNodeList.length > 10 ? this.allNodeList.slice(0, 10) : this.allNodeList
      );
    }
    this.onDisabledFormNodeList();
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

  /**
   * 节点选择控件是否需要校验
   */
  private onDisabledFormNodeList() {
    if (this.isHpcPro) {
      this.nodeSelectForm.controls.nodeList.enable();
    } else {
      this.nodeSelectForm.controls.nodeList.disable();
    }
  }

  /**
   * 切换多节点配置组件开关
   * @param status 多节点组件开发状态
   */
  public nodeConfigSwitchChange(status: any) {
    this.isSelectNodeDisabled = status;
    this.sendAppOrPidDisable.emit(status);
  }

  // -- 同步父组件的值【目前是一个完整的表单流程，包含全部的参数，需要同步下父组件的值模拟用户输入】 --
  ngOnChanges(changes: SimpleChanges): void {
    // 任务名称
    if (changes.taskName !== undefined) {
      this.formEl.formGroup.get('taskName').setValue(changes.taskName.currentValue);
    }

    // 分析对象
    if (changes.targetClicked !== undefined) {
      const value = changes.targetClicked.currentValue === 0 ? 'analysisObject_sys' : 'analysisObject_app';
      this.formEl.formGroup.get('analysisObject').setValue(value);
    }

    // 模式
    if (changes.modeClicked !== undefined) {
      const value = changes.modeClicked.currentValue === 0 ? 'app' : 'pid';
      this.formEl.formGroup.get('analysisMode').setValue(value);
    }

    // 应用
    if (changes.modeApplication !== undefined) {
      this.formEl.formGroup.get('application').setValue(changes.modeApplication.currentValue);
    }

    // 应用参数
    if (Object.prototype.hasOwnProperty.call(changes, 'modeAppParams')) {
      this.formEl.formGroup.get('applicationParams').setValue(changes.modeAppParams.currentValue || '');
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'switchState')) {
      if (changes.switchState) {
        this.scheduledPrams.startNow = true;
        this.isShowReserveAndImmedia = this.switchState;
      }
      this.formEl.formGroup.get('switchState').setValue(changes.switchState.currentValue);
      this.runUserData.runUser = changes.switchState.currentValue;
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'modeApplicationUser')) {
      if (this.formEl.formGroup.value.switchState) {
        this.formEl.formGroup.get('user_name').setValue(changes.modeApplicationUser.currentValue || '');
        this.runUserData.user = changes.modeApplicationUser.currentValue || '';
      } else {
        this.formEl.formGroup.get('user_name').setValue('');
        this.runUserData.user = '';
      }
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'modeApplicationPassWord')) {
      this.formEl.formGroup.get('password').setValue(changes.modeApplicationPassWord.currentValue || '');
      this.runUserData.password = changes.modeApplicationPassWord.currentValue || '';
    }

    // PID
    if (changes.modePid !== undefined) {
      this.formEl.formGroup.get('pid').setValue(changes.modePid.currentValue);
    }

    // process_name
    if (changes.modeProcess != null) {
      this.formEl.formGroup.get('process_name').setValue(changes.modeProcess.currentValue);
    }

    if (this.typeId === 1) {
      this.appAndPidValid = this.switchState ? this.modeApplication &&
        Boolean(this.modeApplicationUser && this.modeApplicationPassWord) : Boolean(this.modeApplication);
    }

    // 来自调优助手
    if (changes.taskDetail) {
      if (this.taskDetail.isFromTuningHelper) {
        this.memAnalysisMode = this.taskDetail.analysisType;
      }
    }
  }

  // 根据 taskInfo 返回分析类型
  public getAnalysisType({ taskInfo }: any) {
    return taskInfo['analysis-type'] || taskInfo.analysisType;
  }

  // 初始化参数
  public init({ type, params = {}, scheduleTaskId }: {
    type: 'create' | 'edit' | 'restart',  // 任务类型
    params?: any,  // 表单参数
    scheduleTaskId: any // 修改的预约任务ID
  }) {
    this.type = type;
    this.scheduleTaskId = scheduleTaskId;
    if (params) {
      setTimeout(async () => {  // 设置个定时器异步下，防止默认值还没设置完开始设置修改参数了
        const analysisType = this.getAnalysisType({ taskInfo: params });
        const taskTmpl = this.taskTmpls.find((item: any) => analysisType === item.analysisType);
        const values = taskTmpl.formEl.paramsToValues({ params });

        this.formEl.setValues({
          values,
          formEl: this.formEl,
          type: 'form',
          i18n: this.i18n,
        });
        taskTmpl.init({ params, values });
        const allNodeList = await this.getProjectNodes();
        this.nodeSelectForm.controls.nodeList.setValue(
          this.dealwithNodeSelectedData(allNodeList, params.nodeConfig)
        );

        // 如果是预约任务
        this.scheduledStartup.importTemp(params);

        // 修改任务和重启任务不能修改预约定时启动任务【先 importTemp 导入参数再设置isEdit，否则 importTemp 会清空 isEdit】
        if (['edit', 'restart'].includes(type)) {
          this.scheduledStartup.isEdit = true;
        }
      }, 10);
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

  // 清空任务参数
  public clear() {
    this.restoreScheduleParams();
  }

  // 还原预约任务参数
  public restoreScheduleParams() {
    this.scheduledStartup.clear();
  }



  // -- 界面操作 --
  // 点击确定
  public clickConfirmBtn() {
    const self = this;
    self.getTaskData().then((resp: any) => {
      const params = resp.params;
      this.runUserDataObj = resp.runUserDataObj;
      if (this.type === 'create') {
        if (this.scheduledStartup.switchState) {  // 预约任务
          this.Axios.axios.post('/schedule-tasks/', params).then((data: any) => {
            this.mytip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.create_ok,
              time: 3500,
            });

            this.sendPretable.emit('on');
            this.closeTab.emit({});
            this.clear();
          }).catch((error: any) => { });
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
              self.Axios.axios.post('/tasks/', params).then((res: any) => {
                const data = res.data;

                self.mytip.alertInfo({
                  type: 'success',
                  content: self.i18n.tip_msg.create_ok,
                  time: 3500,
                });

                // 关闭页签
                if (self.scheduledPrams.startNow) { // 立即执行
                  self.startDataSamplingTask(self.projectName, params.taskname, data.id, params);
                } else {
                  self.closeTab.emit({
                    title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: data['analysis-type'],
                    status: data['task-status'],
                    projectName: self.projectName
                  });
                }

                self.clear();
              }).catch((error: any) => { });
            },
          });
        }
      } else if (this.type === 'edit' || this.type === 'scheduleEdit') {
        // 预约任务
        if (this.scheduledStartup.switchState) {
          this.Axios.axios.put(`/schedule-tasks/${this.scheduleTaskId}/`, params).then((res: any) => {
            this.mytip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.edite_ok,
              time: 3500,
            });

            this.sendPretable.emit('on');
            this.closeTab.emit({});

            this.clear();
            this.type = 'create';
          });
        } else {
          this.Axios.axios.put(`/tasks/${this.restartAndEditId}/`, params).then((res: any) => {
            const data = res.data;

            this.mytip.alertInfo({
              type: 'info',
              content: self.i18n.tip_msg.edite_ok,
              time: 3500,
            });
            // 关闭页签
            if (self.scheduledPrams.startNow) { // 立即执行
              this.startDataSamplingTask(this.projectName, params.taskname, data.id, params);
            } else {
              this.closeTab.emit({
                title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
                id: data.id,
                nodeid: params.nodeConfig[0].nodeId,
                taskId: data.id,
                taskType: data['analysis-type'],
                status: data['task-status'],
                projectName: this.projectName
              });
            }

            this.clear();
            this.type = 'create';
          }).catch((error: any) => { });
        }
      } else if (this.type === 'restart') { // 重启
        params.status = 'restarted';
        if (this.formEl.formGroup.value.analysisObject === 'analysisObject_app'
          && this.formEl.formGroup.value.analysisMode === 'app') {
          params.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        // 调优助手跳转重启任务
        if (self.taskDetail.isFromTuningHelper) {
          Object.assign(
            params,
            {
              suggestionId: self.taskDetail.suggestionId,  // 优化建议id
              optimizationId: self.taskDetail.optimizationId,  // 调优助手任务id
            }
          );
        }
        this.Axios.axios.put(`/tasks/${this.restartAndEditId}/status/`, params).then((res: any) => {
          const data = res.data;

          this.closeTab.emit({
            title: `${params.taskname || params.taskName}-${params.nodeConfig[0].nickName}`,
            id: data.id,
            nodeid: params.nodeConfig[0].nodeId,
            taskId: data.id,
            taskType: params['analysis-type'],
            status: data['task-status'],
            projectName: this.projectName
          });
          this.mytip.alertInfo({ type: 'info', content: this.i18n.mission_create.restartSuccess, time: 3500 });

          this.clear();
          this.type = 'create';
        }).catch((error: any) => { });
      }
    });
  }

  // 立即启动
  public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
    const option: any = { status: 'running' };
    if (this.formEl.formGroup.value.analysisObject === 'analysisObject_app'
      && this.formEl.formGroup.value.analysisMode === 'app') {
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
              title: `${params.taskname || params.taskName}-${params.nodeConfig[0].nickName}`,
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

  // 点击取消
  public close() {
    this.closeTab.emit({});
    if (this.isModifySchedule) {
      this.sendPretable.emit();
    }
  }

  // 点击保存模板
  public saveTemplates() {
    this.getTaskData().then((res: any) => {
      this.sendMissionKeep.emit(res.params);
    });
  }


  // -- 获取任务参数 --
  public getTaskData() {
    const taskTmpl = this.taskTmpls.find((tmpl: any) => this.memAnalysisMode === tmpl.analysisType);
    const extendParams = {
      projectname: this.projectName,
      taskname: this.taskName,
    };

    // 如果是预约任务
    if (this.scheduledStartup.switchState) {
      Object.assign(extendParams, this.getScheduledTaskParams());
    }
    return new Promise((resolve, reject) => {
      taskTmpl.getTaskData({ extendParams, runUserData: this.runUserData }).then((res: any) => resolve(res));
    });
  }

  // 获取预约任务参数
  public getScheduledTaskParams() {
    const self = this.scheduledStartup;

    if (self.selected === 1) {  //  周期
      const durationArr = self.durationTime.split(' ');

      return {
        cycle: true,
        targetTime: self.pointTime,
        cycleStart: durationArr[0],
        cycleStop: durationArr[1],
        appointment: '',
      };
    } else {  // 单次
      const onceArr = self.onceTime.split(' ');

      return {
        cycle: false,
        targetTime: onceArr[1],
        appointment: onceArr[0],
        cycleStart: '',
        cycleStop: '',
      };
    }
  }

  private dealRunUserDataObj(obj: LaunchRunUser) {
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

  public sendRunUserDataObj(e: LaunchRunUser) {
    this.runUserDataObj = e;
    let bool = false;
    Object.keys(this.runUserDataObj).map((key: string) => {
      if (this.runUserDataObj[key].runUser) {
        bool = true;
      }
    });
    this.isShowReserveAndImmedia = bool;
  }

  get displayedElementList() {
    const doNotShowList = ['taskName', 'analysisObject', 'analysisMode', 'application', 'applicationParams',
      'switchStatus', 'user_name', 'password', 'pid', 'process_name', 'analysisType'];

    return this.formEl.displayedElementList.filter((item: any) => {
      return !doNotShowList.includes(item);
    });
  }

  get formValid() {
    const nodeSelectValid  = this.isHpcPro ? this.nodeSelectForm.valid : true;
    switch (this.typeId) {
      case 0:
        return this.taskNameValid && this.childFormEl.formGroup.valid && nodeSelectValid;
      case 1:
        return this.modeAppValid && this.taskNameValid && this.childFormEl.formGroup.valid && nodeSelectValid;
      case 2:
        return this.modePidValid && this.taskNameValid && this.childFormEl.formGroup.valid && nodeSelectValid;
      default:
        return false;
    }
  }

  get scheduledStartupParamsValid() {
    if (this.scheduledStartup && this.scheduledStartup.switchState) {
      return this.scheduledStartup.previewState;
    } else {
      return true;
    }
  }
}
