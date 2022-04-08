import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TiValidationConfig, TiValidators, TiMessageService} from '@cloud/tiny3';
import { HttpService, I18nService, CustomValidatorsService, TipService } from 'sys/src-com/app/service';
import { MessageModalService } from 'projects/sys/src-com/app/service/message-modal.service';

@Component({
  selector: 'app-tuninghelper-create-task',
  templateUrl: './tuninghelper-create-task.component.html',
  styleUrls: ['./tuninghelper-create-task.component.scss']
})
export class TuninghelperCreateTaskComponent implements OnInit {
  @ViewChild('appParamsComponent', { static: false }) appParamsComponent: any;
  @ViewChild('processPidComponent', { static: false }) processPidComponent: any;
  @ViewChild('nodeConfigModal', { static: false }) nodeConfigModal: any;
  @Output() private closeTab = new EventEmitter<any>();
  @Output() createdTask = new EventEmitter<any>();
  @Input()
  set currentTool(value: string) {
    this.alertTipBox = value;
  }
  @Input() projectName: string;
  @Input() projectId: number = +sessionStorage.getItem('projectId');
  @Input() actionType: 'createTuninghelperTask' | 'reanalyzeTask' | 'reanalyzeServer' = 'createTuninghelperTask';
  @Input() taskDetail: any;
  public i18n: any;
  constructor(
    public i18nService: I18nService,
    public http: HttpService,
    public customValidatorsService: CustomValidatorsService,
    public mytip: TipService,
    private tiMessage: TiMessageService,
    private tiMessageModal: MessageModalService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public labelWidth = '220px';
  public validation: TiValidationConfig = {
    type: 'blur',
  };
  public taskParamsFormGroup: FormGroup;
  public analysisTypeList: any;
  public modeList: any;
  // 分析对象
  public analysisTarget = 0;
  // 模式
  public modeValue = 0;
  public samplingDurationBlur: any;
  public collectSizeBlur: any;
  public nodeList: any = [];
  public appParamsValid = true;
  public processPidValid = true;
  // 配置指定节点参数开关
  public nodeParamsSwitch = false;
  public nodeConfigList: any = [];
  public tableWidth = '700px';
  public inputWidth = '370px';
  public tipWidth = '480px';
  public showNodeConfig: boolean;
  public firstNodeLoad = true;
  public currentNode: string;
  public appParamsInfo: any;
  public processPidInfo: any;
  public taskNameValue = '';
  public alertTipBox: string;

  ngOnInit(): void {
    if (this.alertTipBox === 'popTip') {
      this.tableWidth = '720px';
    }
    this.taskParamsFormGroup = new FormGroup({
      taskName: new FormControl('', [this.customValidatorsService.checkEmpty(this.i18n.mission_create.missionNameWarn),
      this.customValidatorsService.taskNameValidator, TiValidators.required]),
      bs_path: new FormControl('', [this.customValidatorsService.pathValidator()]),
      duration: new FormControl(15, [this.customValidatorsService.checkRange(2, 300)]),
      collectSize: new FormControl(100, [this.customValidatorsService.checkRange(1, 100)]),
      switch: new FormControl(false, []),
    });
    this.analysisTypeList = [
      {
        name: this.i18n.common_term_projiect_task_system,
        value: 0,
      },
      {
        name: this.i18n.common_term_task_crate_path,
        value: 1,
      }
    ];
    this.modeList = [
      {
        name: this.i18n.mission_create.launchApp,
        value: 0,
      },
      {
        name: this.i18n.mission_create.attachPid,
        value: 1,
      }
    ];
    this.samplingDurationBlur = {
      control: this.taskParamsFormGroup.controls.duration,
      min: 2,
      max: 300,
    };
    this.collectSizeBlur = {
      control: this.taskParamsFormGroup.controls.collectSize,
      min: 1,
      max: 100,
    };
    if (this.actionType !== 'createTuninghelperTask') {
      this.reAnalysisInit();
      return;
    }
    this.getProjectNodes();
  }

  public onBlur(e: string) {
    this.taskNameValue = e.trim();
  }

  public onAnalysisTargetClick(value: any) {
    this.nodeParamsSwitch = false;
    if (value) {
      this.appParamsValid = false;
      this.processPidValid = false;
      this.modeValue = 0;
      this.onModeClick(0);
    } else {
      this.appParamsValid = true;
      this.processPidValid = true;
      this.taskParamsFormGroup.controls.bs_path.reset('');
    }
  }
  public onModeClick(value: any) {
    this.nodeParamsSwitch = false;
    if (value) {
      this.appParamsValid = true;
      this.processPidValid = false;
    } else {
      this.appParamsValid = false;
      this.processPidValid = true;
    }

  }
  public createTask() {
    const params: any = {
      analysisType: 'optimization',
      projectName: this.projectName,
      taskName: this.taskParamsFormGroup.get('taskName').value,
      duration: this.taskParamsFormGroup.get('duration').value,
      size: this.taskParamsFormGroup.get('collectSize').value,
    };
    if (!this.analysisTarget) {
      params.analysisTarget = 'Profile System';
    } else {
      if (!this.modeValue) {
        params.analysisTarget = 'Launch Application';
        Object.keys(this.appParamsComponent?.appParamsInfo.appParam).forEach((key: string) => {
          params[key] = this.appParamsComponent?.appParamsInfo.appParam[key];
        });
      } else {
        params.analysisTarget = 'Attach to Process';
        Object.keys(this.processPidComponent?.processPidInfo).forEach((key: string) => {
          params[key] = this.processPidComponent?.processPidInfo[key];
        });
      }
      params.assemblyLocation = this.taskParamsFormGroup.get('bs_path').value;
    }
    const nodeListParam = this.getNodeConfigParams(params);
    params.nodeConfig = nodeListParam;
    params.switch = this.nodeParamsSwitch;
    const taskId = this.actionType === 'reanalyzeServer' ? this.taskDetail?.taskId : this.taskDetail?.id;
    const url = this.actionType === 'createTuninghelperTask' ? `/tasks/`
    : `/tasks/${encodeURIComponent(taskId)}/optimization/`;
    params.taskId = this.actionType === 'createTuninghelperTask' ? undefined : taskId;
    const that = this;
    const tiMessage = that.alertTipBox === 'popTip' ? this.tiMessageModal : this.tiMessage;
    tiMessage.open({
      type: 'warn',
      title: this.i18n.secret_title,
      content: this.i18n.secret_count,
      close() {
        that.http.post(url, params).then((res: any) => {
          if (that.alertTipBox === 'popTip') {
            that.createdTask.emit({ type: 'info', msg: res.data?.taskName });
          } else {
            that.mytip.alertInfo({
              type: 'success',
              content: that.i18n.tip_msg.create_ok,
              time: 3500,
            });
          }
          that.startDataSamplingTask(res.data.id, params);
        }).catch((error: any) => {
          that.createdTask.emit({ type: 'error', msg: error.message });
        });
      },
    });
  }
  public startDataSamplingTask(id: any, params: any) {
    const option: any = { status: 'running' };
    if (this.analysisTarget && !this.modeValue) {
      const runUserObj = this.getUserConfig();
      option.user_message = runUserObj;
    }
    this.http.put(`/tasks/${encodeURIComponent(id)}/status/`, option).then((res: any) => {
      const backData = res.data;
      this.closeTab.emit({
        title: `${params.taskName}-${params.nodeConfig[0].nodeIp}`,
        id: backData.id,
        nodeid: params.nodeConfig[0].nodeId,
        taskId: backData.id,
        taskType: params.analysisType,
        status: backData['task-status'],
        projectName: this.projectName,
        ownerId: this.taskDetail.ownerId,
      });
    });
  }
  public checkAppParamVaild(e: any) {
    this.appParamsValid = e === 'VALID' ? true : false;
  }
  public checkProcessPid(e: any) {
    this.processPidValid = e === 'VALID' ? true : false;
  }

  /**
   * 节点配置
   * @param e 参数
   */
  public nodeSwitchChange(state: boolean) {
    setTimeout(() => {
      this.inputDisableChange(state);
    }, 0);
    if (this.firstNodeLoad) {
      this.firstNodeLoad = false;
      return;
    }
    if (state) {
      this.getProjectNodes();
    }
  }

  public inputDisableChange(status: boolean) {
    if (status) {
      if (this.modeValue) {
        this.processPidComponent.setDisabledState(true);
      } else {
        this.appParamsComponent.disableChange(true);
      }
      this.taskParamsFormGroup.controls.bs_path.disable({ emitEvent: false });
    } else {
      if (this.modeValue) {
        this.processPidComponent.setDisabledState(false);
      } else {
        this.appParamsComponent.disableChange(false);
      }
      this.taskParamsFormGroup.controls.bs_path.enable({ emitEvent: false });
    }
  }
  /**
   * 获取节点列表信息
   */
  public getProjectNodes() {
    const url = `/projects/${encodeURIComponent(this.projectId)}/info/`;
    this.http.get(url).then((res: any) => {
      if (this.actionType === 'reanalyzeServer') {
        this.nodeList = res.data.nodeList.filter((item: any) => {
          return item.nodeIp === this.taskDetail.nodeIP || this.taskDetail.nodeIp;
        });
      } else {
        this.nodeList = res.data.nodeList;
      }
      this.showNodeConfig = this.nodeList.length > 1;
      this.nodeConfigList = res.data.nodeList.map((item: any) => {
        return {
          id: item.id,
          nickName: item.nickName || item.nodeNickName,
          nodeIp: item.nodeIp,
          nodeStatus: item.nodeStatus,
          status: false,
          processPidInfo: this.modeValue ? this.processPidComponent?.processPidInfo : undefined,
          appParamsInfo: !this.modeValue ? this.appParamsComponent?.appParamsInfo : undefined,
          assemblyLocation: this.taskParamsFormGroup.get('bs_path').value || '',
        };
      });
    });
  }

  /**
   * 返回创建任务的节点列表参数
   * @param params 界面参数配置
   */
  public getNodeConfigParams(params: any) {
    const nodeListParam = this.nodeConfigList.map((item: any) => {
      const taskParam: any = {};
      Object.keys(params).forEach((key: string) => {
        taskParam[key] = params[key];
        taskParam.status = false;
      });
      if (item.status) {
        if (item.appParamsInfo) {
          Object.keys(item.appParamsInfo.appParam).forEach((key: string) => {
            taskParam[key] = item.appParamsInfo.appParam[key];
          });
        }
        if (item.processPidInfo) {
          Object.keys(item.processPidInfo).forEach((key: string) => {
            taskParam[key] = item.processPidInfo[key];
          });
        }
        taskParam.status = item.status;
      }
      return {
        nodeId: item.id || item.nodeId,
        nickName: item.nickName || item.nodeNickName,
        nodeIp: item.nodeIp,
        taskParam
      };
    });
    if (this.actionType === 'reanalyzeServer') {
      const nodeServerParam = nodeListParam.filter((item: any) => {
        return item.nodeIp === this.taskDetail.nodeIP || this.taskDetail.nodeIp;
      });
      return nodeServerParam;
    }
    return nodeListParam;
  }

  public openNodeConfigPop(nodeParams: any) {
    this.nodeConfigModal.open(nodeParams);
  }

  /**
   * @param e 获取指定节点配置后数据
   */
  public handleConfigData(e: any) {
    const nodeIndex = this.nodeConfigList.findIndex((item: any) => {
      return item.nodeIp === e.nodeIp;
    });
    const currentNodeInfo = JSON.parse(JSON.stringify(this.nodeConfigList));
    if (this.modeValue) {
      currentNodeInfo[nodeIndex].processPidInfo = e;
    } else {
      currentNodeInfo[nodeIndex].appParamsInfo = e;
    }
    currentNodeInfo[nodeIndex].status = true;
    currentNodeInfo[nodeIndex].assemblyLocation = e.assemblyLocation || '';
    this.nodeConfigList = currentNodeInfo;
  }

  /**
   * 再次分析初始化参数
   */
  public reAnalysisInit() {
    const taskId = this.actionType === 'reanalyzeServer' ? this.taskDetail?.taskId : this.taskDetail?.id;
    const nodeId = this.actionType === 'reanalyzeServer' ? this.taskDetail?.nodeId : '';
    const url = `/tasks/${encodeURIComponent(taskId)}/common/configuration/?node-id=${encodeURIComponent(nodeId)}`;
    this.http.get(url).then((res: any) => {
      const param = res.data;
      if (this.actionType === 'reanalyzeServer' || param.nodeConfig.length === 1) {
        if (this.taskDetail.children) {
          this.currentNode = this.taskDetail.children[0].nodeIP || this.taskDetail.children[0].nodeIp;
        } else {
          this.currentNode = this.taskDetail?.nodeIP || this.taskDetail?.nodeIp;
        }
      }
      const time = new Date();
      const currentTaskName = `reanalyze_${time.getHours()}_${time.getMinutes()}_${time.getSeconds()}`;
      this.analysisTarget = param['analysis-target'] === 'Profile System' ? 0 : 1;
      this.modeValue = param['analysis-target'] === 'Launch Application' ? 0 : 1;
      this.taskParamsFormGroup.controls.taskName.setValue(currentTaskName);
      this.taskParamsFormGroup.controls.duration.setValue(param.duration);
      this.taskParamsFormGroup.controls.collectSize.setValue(param.size);
      this.nodeParamsSwitch = param.switch;
      if (param.analysisTarget === 'Profile System') {
        this.nodeConfigList = param.nodeConfig;
        return;
      }
      // 获取指定节点配置信息参数回填
      this.nodeConfigList = param.nodeConfig.map((item: any) => {
        const appParamsInfo = {
          appParam: {
            appDir: item.taskParam?.appDir,
            appParameters: item.taskParam?.appParameters
          }
        };
        const processPidInfo = {
          targetPid: item.taskParam?.targetPid,
          processName: item.taskParam?.processName
        };
        return {
          id: item.nodeId,
          nickName: item.nickName || item.nodeNickName,
          nodeIp: item.nodeIp,
          nodeStatus: item.nodeStatus,
          status: item.taskParam?.status,
          appParamsInfo,
          processPidInfo,
          assemblyLocation: item.taskParam?.assemblyLocation,
        };
      });
      this.showNodeConfig = this.nodeConfigList.length > 1;
      if (this.actionType === 'reanalyzeServer') {
        this.initOutParam(param.nodeConfig[0]?.task_param);
        return;
      }
      this.initOutParam(param);
    });
  }

  /**
   * @returns 返回配置指定运行用户
   */
  public getUserConfig() {
    const runUserObj: any = {};
    this.nodeConfigList.forEach((item: any) => {
      if (this.actionType === 'reanalyzeServer' && item.nodeIp !== this.taskDetail?.nodeIP) {
        return;
      }
      runUserObj[item.nodeIp] = this.appParamsComponent.appParamsInfo.runUserParam;
      if (item.status) {
        runUserObj[item.nodeIp] = item.appParamsInfo.runUserParam;
      }
    });
    Object.keys(runUserObj).forEach(key => {
      if (runUserObj[key]?.user_name === '') {
        runUserObj[key].user_name = 'launcher';
      }
    });
    return runUserObj;
  }

  /**
   * 外层参数回填
   * @param param 回填参数
   */
  public initOutParam(param: any) {
    this.appParamsInfo = {
      appParam: {
        appDir: param.appDir,
        appParameters: param.appParameters
      }
    };
    this.processPidInfo = {
      targetPid: param.targetPid,
      processName: param.processName
    };
    this.taskParamsFormGroup.controls.bs_path.setValue(param.assemblyLocation);
  }
}
