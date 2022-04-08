import {
  Component, EventEmitter, Input, OnInit,
  Output, ViewChild, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { I18n } from 'sys/locale';
import { VscodeService } from '../../../service/vscode.service';
import { MytipService } from '../../../service/mytip.service';
import { TiTextComponent, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import { NodeConfigItem, NodelistItem, NodeConfigListItem } from '../domain';
import {
  MissionDiagnosisLaunchComponent
} from '../mission-components/mission-diagnosis-launch/mission-diagnosis-launch.component';
import { TaskInfoService } from '../../../service/diagnoseServices/task-info.service';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { DomSanitizer } from '@angular/platform-browser';

interface SelectItem {
  id: string;
  txt: string;
  select: boolean;
  src: string;
  selectSrc: string;
  publicSrc: string;
  disabledSrc: string;
}

enum DiagnoseType {
  memory_diagnostic = 0,
  netio_diagnostic = 1,
}

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit, AfterViewInit {

  @ViewChild('diagnoseAttach') diagnoseAttach: MissionDiagnosisLaunchComponent;
  @ViewChild('switchScheduled') switchScheduled: any;
  @ViewChild('saveTemplateModal') templateModal: any;
  @ViewChild('template') taskTemplate: any;

  @Output() closeTab = new EventEmitter<any>();

  @Input() projectName: string;
  @Input() actionType: any;
  @Input() taskDetail: any;
  @Input() isModifySchedule: boolean;
  public taskNameValid: any;

  public selectList: Array<SelectItem>;
  public diagnoseTarget: string;
  public diagnoseTargetValue = 'memory_diagnostic';

  public appPathValid: any;
  public pathValid = new FormControl('', [this.customValidatorsService.checkFilePath()]);
  public pathCValid = new FormControl('', [this.customValidatorsService.checkFilePath()]);
  public samplingDelayValid = new FormControl(0, [this.customValidatorsService.checkRange(0)]);
  public intervalValid = new FormControl(1000, [this.customValidatorsService.checkRange(1, 60000)]);
  public collectSizeValid = new FormControl(100, [this.customValidatorsService.checkRange(1, 100)]);
  // 重启或修改任务,导入模板时,传给网络IO组件的回填数据
  public networkInfo: any;
  // 重启或修改任务,导入模板时,传给存储IO组件的回填数据
  public storageIoInfo: any;
  // 重启和修改时当前选中诊断对象
  public currentDiagnoseObj: string;
  constructor(
    public sanitizer: DomSanitizer,
    public vscodeService: VscodeService,
    public mytip: MytipService,
    public i18nService: I18nService,
    public customValidatorsService: CustomValidatorsService,
    private tiMessage: MessageModalService,
    private taskInfoService: TaskInfoService,
    private cdr: ChangeDetectorRef
  ) {
    this.i18n = I18n;
    this.taskName = {
      id: 'taskname',
      label: this.i18n.diagnostic.taskParams.taskname,
      require: true,
      show: true
    };
    this.selectList = [
      {
        id: 'memory_diagnostic',
        txt: this.i18n.diagnostic.taskParams.ram,
        select: true,
        src: './assets/img/diagnose/ram_select.png',
        publicSrc: './assets/img/diagnose/ram_public.png',
        selectSrc: './assets/img/diagnose/ram_select.png',
        disabledSrc: './assets/img/diagnose/ram_disabled.png'
      },
      {
        id: 'netio_diagnostic',
        txt: this.i18n.diagnostic.taskParams.networkIO,
        select: false,
        src: './assets/img/diagnose/network_public.png',
        publicSrc: './assets/img/diagnose/network_public.png',
        selectSrc: './assets/img/diagnose/network_select.png',
        disabledSrc: './assets/img/diagnose/network_disabled.png'
      },
      {
        id: 'storageio_diagnostic',
        txt: this.i18n.diagnostic.taskParams.storageIO,
        select: false,
        src: './assets/img/diagnose/storage_public.svg',
        publicSrc: './assets/img/diagnose/storage_public.svg',
        selectSrc: './assets/img/diagnose/storage_select.svg',
        disabledSrc: './assets/img/diagnose/storage_disabled.svg'
      }
    ];
    this.taskNameValid = new FormControl('', [
      this.customValidatorsService.checkEmpty(this.i18n.mission_create.missionNameWarn),
      this.customValidatorsService.taskNameValidator,
      TiValidators.required
    ]);
    this.appPathValid = new FormControl('', [this.appDirValidator(), TiValidators.required]);
    this.startCheckRes = {
      title: this.i18n.common_term_task_start_now,
      checked: true,
    };
    this.columns = [
      {
        title: this.i18n.nodeConfig.nickName,
      },
      {
        title: this.i18n.nodeConfig.node,
      },
      {
        title: this.i18n.nodeConfig.status,
      },
      {
        title: this.i18n.nodeConfig.action,
      },
    ];
    this.memoryDiagnoseType = [
      {
        id: 'mem_leak',
        title: this.i18n.diagnostic.taskParams.memory_leakage,
        checked: true,
        disable: true,
      },
      {
        id: 'mem_consume',
        title: this.i18n.diagnostic.taskParams.memory_consumption,
        checked: false,
        disable: false
      },
      {
        id: 'oom',
        title: 'OOM',
        checked: false,
        disable: false
      }
    ];
    this.runUserFormGroup = new FormGroup({
      userName: new FormControl('', [this.customValidatorsService.checkEmpty(),
      this.customValidatorsService.runUserNameValidator(), TiValidators.required]),
      pwd: new FormControl('', [this.customValidatorsService.checkEmpty(), TiValidators.required]),
    });
    this.initPidProcessGroup();
  }
  public columns: Array<TiTableColumns> = [];
  // 节点列表
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
  };
  public nodeTiModal: any;
  // 模板组件参数
  public keepData: any;
  public i18n: any;
  public validation: TiValidationConfig = {
    type: 'blur'
  };
  public nodeConfigUser = false;
  // 模式
  public modeClicked = 0;
  /** pid 和 进程名称输入的控件 */
  public pidProcessGroup: FormGroup;

  // 立即执行参数
  public startCheckRes: any;
  // 创建任务左侧参数配置
  public taskInfo: any;
  // 应用路径提示
  public appPathTip = '';
  public appPathPlaceholder = '';
  public interval: any = {
    max: 60000,
    min: 1
  };
  public samplingDelayRange: any = {
    min: 0
  };
  // 配置指定节点参数开关
  public nodeParams = false;
  public collectSize: any = {
    max: 100,
    min: 1
  };
  // 内存诊断类型
  public memoryDiagnoseType: any = [];
  // 判断确认按钮置灰
  public isSure = true;
  // 展示立即启动
  public showImmediately = true;
  public projectId: number = +(self as any).webviewSession.getItem('projectId');
  public labelWidth = '218px';
  // 当前可用应用路径
  public modeAppPathAllow = '';
  // 控制重启或编辑是部分参数禁止修改
  public restartDisable = false;
  public taskId: number;
  public nodeList: NodelistItem[];
  public nodeConfigedData: NodeConfigListItem[];
  // 配置节点按钮禁用状态
  public nodeConfigDisabled = false;
  public taskName: any;
  // 创建任务参数
  public taskParams: any = {
    // 采集类型 默认launch application
    analysisTarget: 'Launch Application',
    // 分析类型 默认 memory diagnostic
    analysisType: 'memory_diagnostic',
    // 诊断类型  mem_exception | oom、memory_leak、memory_consumption
    diagnosticType: ['mem_leak'],
    // 应用路径
    appDir: '',
    // 应用参数
    appParameters: '',
    processPid: '', // PID
    processName: '', // 进程名称
    // 工程名称
    projectName: '',
    // 任务名称
    taskName: '',
    // 诊断时长
    duration: '',
    // 采样间隔
    interval: 1000,
    // 诊断开始时间/延迟采样时长
    samplingDelay: 0,
    // 配置指定节点参数开关
    switch: false,
    // 二进制/符号文件路径
    assemblyLocation: '',
    // C/C++源文件路径
    sourceLocation: '',
    // 异常后终止诊断  异常访问类型显示
    stopException: true,
    // 采集调用栈  默认true
    collectStack: true,
    // 采集文件大小（MB）
    collectSize: 100,
    // 节点配置
    nodeConfig: [],
  };

  public runUserSwitch = false;
  public runUserFormGroup: FormGroup;
  public runUserParams: any = {
    user_name: '',
    password: ''
  };
  // 当前诊断内容 0：内存泄漏 1：内存异常访问
  public currentCreateType = 0;
  ngOnInit(): void {
    // 来自调优助手的创建重启任务
    if (this.taskDetail.isFromTuningHelper) {
      this.diagnoseTargetValue = this.taskDetail.analysisType;
      if (this.taskDetail.analysisType === 'memory_diagnostic') {  // 内存诊断
        this.selectList[0].select = true;
        this.selectList[1].select = false;
        this.selectList[2].select = false;
        this.diagnoseTarget = this.selectList[0].txt;
      } else if (this.taskDetail.analysisType === 'netio_diagnostic') {
        this.selectList[0].select = false;
        this.selectList[1].select = true;
        this.selectList[2].select = false;
        this.diagnoseTarget = this.selectList[1].txt;
      } else {
        this.selectList[0].select = false;
        this.selectList[1].select = false;
        this.selectList[2].select = true;
        this.diagnoseTarget = this.selectList[2].txt;
      }
    }
    this.projectId = this.taskDetail.projectId;
    this.taskInfo = JSON.parse(JSON.stringify(this.taskInfoService.taskInfo));
    this.getAppDir();
    // 编辑 or 重启任务
    if (this.actionType === 'restart' || this.actionType === 'edit') {
      this.resrtartInitParams();
      this.restartDisable = true;
      return;
    } else {
      this.diagnoseTarget = this.selectList[0].txt;
    }
    this.getProjectNodes();
    for (const i in this.taskInfo) {
      if (this.taskInfo[i].id === 'diagnoseType') {
        this.taskInfo.splice(i, 1);
      }
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      // 预约定时启动组件初始化开关重启与编辑禁用
      if (this.switchScheduled) {
        this.switchScheduled.isDisable = this.actionType === 'create' ? false : true;
      }
    }, 0);
  }
  public onSelect(idx: number) {
    if (this.taskDetail.isFromTuningHelper) {
      return;
    }
    this.diagnoseTarget = this.selectList[idx].txt;
    this.diagnoseTargetValue = this.selectList[idx].id;
    this.selectList.forEach((item: any, index: number) => {
      if (index === idx) {
        this.selectList[index].select = true;
        this.selectList[index].src = this.selectList[index].selectSrc;
      } else {
        this.selectList[index].select = false;
        this.selectList[index].src = this.selectList[index].publicSrc;
      }
    });
    if (idx) {
      this.modeClicked = -1;
    } else {
      this.onModeClick(0);
    }
  }
  public onMouseEnter(idx: number) {
    if (this.taskDetail.isFromTuningHelper) {
      return;
    }
    this.selectList.forEach((item: any, index: number) => {
      if (idx === index) {
        this.selectList[index].select = true;
        this.selectList[index].src = this.selectList[index].selectSrc;
      }
    });
  }
  public onMouseLeave(idx: number) {
    this.selectList.forEach((item: any, index: number) => {
      if (this.diagnoseTarget === this.selectList[index].txt) {
        this.selectList[index].src = this.selectList[index].selectSrc;
      } else {
        this.selectList[index].select = false;
        this.selectList[index].src = this.selectList[index].publicSrc;
      }
    });
  }

  /**
   * 选择模式
   * @param index 模式下标
   */
  public onModeClick(index: number) {
    // 重置配置指点节点参数开关
    if (this.nodeParams) {
      this.nodeParams = false;
      this.taskParams.switch = false;
    }
    if (index) {
      // 重置诊断内容
      if (this.currentCreateType) {
        this.clickDiagnoseType(0);
      }
      this.appPathValid.reset();
      this.taskParams.appParameters = '';
      // 重置应用运行用户
      if (this.runUserSwitch) {
        this.runUserSwitch = false;
        this.runUserFormGroup.reset({ userName: '', pwd: '' });
      }
    }
    this.pidProcessGroup.get('pidProcess').reset();
    this.handleMode(index);
    this.doValidtor();
  }

  /**
   * 对不同模式进行处理
   * @param index 模式下标
   * @param isCreate 是否为创建任务
   */
  private handleMode(index: number, isCreate: boolean = true) {
    this.modeClicked = index;
    this.taskParams.analysisTarget = !index ? 'Launch Application' : 'Attach to Process';
    this.taskInfo.forEach((info: { id: string; show: boolean; }) => {
      if (
        info.id === 'app_dir' || info.id === 'app_parameters' || info.id === 'app_runUser'
        || info.id === 'samplingDelay'
      ) {
        if (info.id === 'samplingDelay') {
          info.show = !index && !this.currentCreateType ? true : false;
        } else {
          info.show = !index ? true : false;
        }
      } else if (info.id === 'attachProcess') {
        info.show = index ? true : false;
      }
    });
  }

  // 初始化 Attach to Process 表单
  private initPidProcessGroup() {
    this.pidProcessGroup = new FormGroup({
      pidProcess: new FormControl(),
    });
    this.pidProcessGroup.valueChanges.subscribe((val) => {
      this.taskParams.processName = val.pidProcess?.processName || '';
      this.taskParams.processPid = val.pidProcess?.processPid || '';
      this.doValidtor();
    });
  }

  /**
   * 任务名称
   * @param e 任务名称
   */
  public taskNameChange(e: any) {
    this.taskParams.taskName = e;
    this.doValidtor();
  }
  /**
   * 应用路径
   * @param e 路径
   */
  public appDirChange(appDir: any) {
    this.taskParams.appDir = appDir;
    this.resetEdit('appDir');
    setTimeout(() => {
      // 解决初始化校验不通过，确认按钮禁用问题；
      this.doValidtor();
    }, 10);
  }
  /**
   * 应用参数
   * @param e 参数
   */
  public appParameterChange(e: any) {
    this.taskParams.appParameters = e;
    this.resetEdit('appParameters');
  }

  /**
   * 指定运行用户开关
   * @param e 参数
   */
  public runUserSwitchChange(e: boolean) {
    if (!e) {
      this.runUserFormGroup.reset({ userName: '', pwd: '' });
    } else {
      this.startCheckRes.checked = true;
    }
  }

  /**
   * 运行用户
   * @param e 参数
   */
  public runUserparamChange(e: any) {
    setTimeout(() => {
      this.doValidtor();
    }, 10);
  }

  /**
   * 获取当前分析内存诊断分析类型 类型交互
   * @param type 当前诊断类型  0：内存 1：内存异常访问
   */
  public clickDiagnoseType(type: number) {
    if (this.currentCreateType === type) { return; }
    this.currentCreateType = type;
    this.taskParams.diagnosticType = [];
    if (this.currentCreateType) {
      this.memoryDiagnoseType[0].disable = false;
      this.taskParams.diagnosticType = ['mem_exception'];
      this.taskParams.assemblyLocation = '';
      this.memoryDiagnoseType.forEach((item: any) => {
        item.checked = false;
      });
    } else {
      this.taskParams.diagnosticType = ['mem_leak'];
      this.memoryDiagnoseType[0].checked = true;
      this.memoryDiagnoseType[0].disable = true;
    }
    this.labelShowChange();
    this.handleInterval();
  }

  // 获取诊断内容参数
  public diagnoseTypeChange() {
    if (!this.currentCreateType) {
      this.taskParams.diagnosticType = [];
      this.memoryDiagnoseType.forEach((item: any) => {
        if (item.checked) {
          this.taskParams.diagnosticType.push(item.id);
        }
      });
      this.handleInterval();
    }
  }

  /**
   * 根据诊断内容匹配相应参数显示与隐藏
   */
  public labelShowChange() {
    this.taskInfo.forEach((item: any) => {
      if (item.type === 1) {
        item.show = this.currentCreateType ? false : true;
      }
      if (item.type === 2) {
        item.show = this.currentCreateType ? true : false;
      }
    });
  }

  // 导入模板时 隐藏诊断开始时间
  private hideSamplingDelay() {
    this.taskInfo.forEach((el: { id: string; show: boolean; }) => {
      if (el.id === 'samplingDelay') {
        el.show = false;
      }
    });
  }

  /**
   * 采样间隔的显示与隐藏  仅当选择内存消耗的时候显示
   */
  public handleInterval() {
    this.taskInfo.forEach((el: any) => {
      if (el.id === 'interval') {
        el.show = this.taskParams.diagnosticType.indexOf('mem_consume') > -1 ? true : false;
      }
    });
  }

  /**
   * 二进制/符号文件路径
   * @param e 参数
   */
  public assemblyLocationChange(e: any) {
    this.taskParams.assemblyLocation = e;
    setTimeout(() => {
      this.doValidtor();
    }, 10);
    this.resetEdit('assemblyLocation');
  }
  /**
   * C/C++源文件路径
   * @param e 参数
   */
  public sourceLocationChange(e: any) {
    this.taskParams.sourceLocation = e;
    setTimeout(() => {
      this.doValidtor();
    }, 10);
    this.resetEdit('sourceLocation');
  }
  /**
   * 诊断开始时间
   * @param e 参数
   */
  public samplingDelayChange(e: number) {
    this.taskParams.samplingDelay = e;
    setTimeout(() => {
      this.doValidtor();
    }, 10);
    this.resetEdit('samplingDelay');
  }
  /**
   * 诊断时长
   * @param e 参数
   */
  public durationChange(e: number | undefined | string) {
    if (e === undefined) {
      e = '';
    }
    this.taskParams.duration = e;
    this.resetEdit('duration');
  }
  /**
   * 采样间隔
   * @param e 参数
   */
  public intervalChange(e: number) {
    this.taskParams.interval = e;
    setTimeout(() => {
      this.doValidtor();
    }, 10);
    this.resetEdit('interval');
  }

  /**
   * 采集调用栈
   * @param e 参数
   */
  public collectStackChange(state: boolean) {
    this.taskParams.collectStack = state;
    this.resetEdit('collectStack');
  }
  /**
   * 采集文件大小
   * @param e 参数
   */
  public collectSizeChange(size: number) {
    this.taskParams.collectSize = size;
    setTimeout(() => {
      this.doValidtor();
    }, 10);
    this.resetEdit('collectSize');
  }
  /**
   * 节点配置
   * @param e 参数
   */
  public nodeSwitchChange(state: boolean) {
    this.taskParams.switch = state;
    if (state) {
      this.getProjectNodes();
    } else {
      this.nodeConfigUser = false;
    }
  }
  /**
   * 获取当前配置节点按钮是否禁用
   */
  public getDisabledStatus() {
    const appPathValid = this.taskParams.switch
      ? false
      : this.modeClicked ? !this.pidProcessGroup.valid : this.appPathValid.errors;
    const valid = this.actionType === 'create' ? this.taskNameValid.errors || appPathValid :
      !this.taskParams.taskName.length || appPathValid;
    const runUserValid = !this.runUserFormGroup.controls.userName.errors && !this.runUserFormGroup.controls.pwd.errors;
    if (this.runUserSwitch) {
      this.nodeConfigDisabled = valid || !runUserValid;
    } else {
      this.nodeConfigDisabled = valid;
    }
  }

  /**
   * 获取节点信息
   */
  public getProjectNodes() {
    const option = {
      url: `/diagnostic-project/${encodeURIComponent(this.projectId)}/info/`
    };
    this.vscodeService.get(option, (res: any) => {
      this.nodeList = res.data.nodeList.map((item: any) => {
        return {
          nickName: item.nickName || item.nodeNickName,
          node: item.nodeIp,
          nodeState: item.nodeStatus,
          params: {
            status: false,
          },
          nodeId: item.nodeId,
          id: item.id,
        };
      });
      const newParams = !this.modeClicked
        ? { appDir: '', appParameters: '' }
        : { processPid: '', processName: '' };
      this.srcData.data = this.nodeList;
      this.nodeConfigedData = res.data.nodeList.map((item: any) => {
        const params = {
          nodeIp: item.nodeIp,
          formData: {
            ...newParams,
            assemblyLocation: '',
            sourceLocation: '',
          }
        };
        return !this.modeClicked
          ? Object.assign(params, {
            runUserSwitch: this.runUserSwitch,
            runUser: {
              user_name: this.runUserParams.user_name,
              password: this.runUserParams.password
            }
          })
          : params;
      });
      this.taskParams.nodeConfig = this.getNodeConfig(res.data.nodeList);
    });
  }

  /**
   * 多节点配置滑窗确认时,更新多节点配置信息
   */
  public async handleConfigData(e: any) {
    const nodeIndex = this.nodeConfigedData.findIndex(item => {
      return item.nodeIp === e.nodeIp;
    });
    this.nodeConfigedData[nodeIndex].formData = e.formData;
    if (!this.modeClicked) {
      this.nodeConfigedData[nodeIndex].runUser = e.runUser;
      this.nodeConfigedData[nodeIndex].runUserSwitch = e.runUserSwitch;
      this.nodeConfigUser = e.runUserSwitch;
    }
    this.nodeList[nodeIndex].params.status = true;
    // 重新存个变量，是因为直接赋值 taskParam 会所有的节点都赋值上，具体原因未知
    const newParam = Object.assign({}, this.taskParams.nodeConfig[nodeIndex].taskParam);
    newParam.status = true;
    Object.keys(e.formData).forEach((key) => {
      newParam[key] = e.formData[key];
    });
    this.taskParams.nodeConfig[nodeIndex].taskParam = newParam;
    this.srcData.data = this.nodeList;
  }


  /*
   * 异常后中止分析
   * @param e 参数
   */
  public stopExceptionChange(state: boolean) {
    this.taskParams.stopException = state;
    this.resetEdit('stopException');
  }

  /**
   * 预约定时任务
   * @param e 参数
   */
  public scheduledChange(state: boolean) {
    this.taskParams.switch = state;
  }

  /**
   * 创建任务参数校验
   */
  public doValidtor(): boolean {
    let isSure = false;
    const appPathValid = this.taskParams.switch
      ? false
      : this.modeClicked ? !this.pidProcessGroup.valid : this.appPathValid.errors;
    const validValue = appPathValid || this.pathValid.errors ||
      this.pathCValid.errors || this.taskParams.diagnosticType.length === 0 ||
      this.taskParams.samplingDelay === undefined ||
      this.taskParams.interval === undefined || this.taskParams.collectSize === undefined;
    const value = this.actionType === 'create' ? this.taskNameValid.errors || validValue
      : !this.taskParams.taskName.length || validValue;
    isSure = value ? true : false;
    if (this.runUserSwitch) {
      const runUserValid = !this.runUserFormGroup.controls.userName.errors
        && !this.runUserFormGroup.controls.pwd.errors;
      isSure = !runUserValid;
    }
    this.isSure = isSure;
    return isSure;
  }

  /**
   * 创建任务
   */
  public async createResAnalysis(): Promise<any> {
    this.isSure = this.doValidtor();
    if (this.isSure) { return; }
    if (this.actionType === 'restart') {
      this.restartTask(this.taskParams, this.taskDetail.id);
    } else if (this.actionType === 'edit') {
      this.editTask(this.initDefaultParams(), this.taskDetail.id);
      return;
    } else {
      if (!this.taskParams.switch) {
        const nodeConfig = await this.requestGetNodeInfo(this.projectId);
        this.taskParams.nodeConfig = nodeConfig;
      }
      this.taskParams.projectName = this.projectName;
      let url: string;
      let params: any = this.initDefaultParams();
      const self = this;
      if (self.switchScheduled.switchState) {
        self.showImmediately = false;
        self.startCheckRes.checked = false;
        params = self.createPreMission(self.switchScheduled, params);
      }
      url = self.switchScheduled.switchState ? '/schedule-tasks/' : '/memory-tasks/';
      const option = {
        url,
        params
      };
      this.tiMessage.open({
        type: 'warn',
        title: this.i18n.secret_title,
        content: this.memoryDiagnoseType[1].checked ?
          this.i18n.secret_count + this.i18n.diagnostic.taskParams.createTip : this.i18n.secret_count,
        okButton: this.i18n.common_term_operate_ok,
        cancelButton: this.i18n.common_term_operate_cancel,
        close() {
          // 调优助手跳转创建任务
          if (self.taskDetail.isFromTuningHelper) {
            params = self.getParams(params);
          }
          self.vscodeService.post(option, (res: any) => {
            if (res.status) {
              self.vscodeService.showInfoBox(res.message, 'error');
            } else {
              const data = res.data;
              if (self.startCheckRes.checked) {
                // 立即执行
                self.startDataSamplingTask(
                  data.id,
                  params
                );
              } else if (self.switchScheduled.switchState) {
                self.vscodeService.showInfoBox(
                  self.i18nService.I18nReplace(self.i18n.plugins_term_scheduleTask_create_success, {
                    0: params.taskName
                  }), 'info');
                self.closeTab.emit({});
              } else {
                self.vscodeService.showInfoBox(
                  self.i18nService.I18nReplace(self.i18n.plugins_term_task_create_success, {
                    0: params.taskName
                  }), 'info');
                self.closeTab.emit({
                  title: `${data.taskName}-${params.nodeConfig[0].nickName}`,
                  id: data.id,
                  startCheckCNo: true,
                  nodeid: params.nodeConfig[0].nodeId,
                  taskId: data.id,
                  taskType: data.analysisType,
                  status: data.taskStatus,
                  projectName: self.projectName
                });
              }
            }
          });
        },
      });
    }
  }

  /**
   * 任务创建启动，获取status
   * @param projectName 工程名
   * @param taskName 任务名
   * @param id 任务id
   * @param params 任务信息参数
   */
  public startDataSamplingTask(id: any, params: any) {
    const self = this;
    const runUserObj = self.getUserConfig();
    const option: any = { status: 'running', user_message: runUserObj };
    const ops = {
      url: `/memory-tasks/${id}/status/`,
      params: option
    };
    self.vscodeService.put(ops, (res: any) => {
      if (res.status) {
        self.vscodeService.showInfoBox(res.message, 'error');
      } else {
        this.vscodeService.showInfoBox(this.i18nService.I18nReplace(this.i18n.plugins_term_task_create_success, {
          0: params.taskName
        }), 'info');
        if (res && res.data) {
          this.updateWebview(res.data, params);
        }
      }
    });
  }

  /**
   * 调优助手创建诊断分析任务
   */
  private getParams(params: any) {
    return Object.assign(
      params,
      {
        suggestionId: this.taskDetail.suggestionId,  // 优化建议id
        optimizationId: this.taskDetail.optimizationId,  // 调优助手任务id
      }
    );
  }
  /**
   * 更新webview页签信息
   */
  private updateWebview(backData: any, params: any) {
    const tabInfo = {
      title: `${params.taskName}-${params.nodeConfig[0].nodeIp}`,
      id: backData.id,
      nodeid: params.nodeConfig[0].nodeId,
      taskId: backData.id,
      taskType: params.analysisType,
      status: backData['task-status'],
      projectName: this.projectName,
    };
    if (this.taskDetail.isFromTuningHelper) {
      this.closeTab.emit(Object.assign(
        tabInfo,
        {
          fromTuningTabId: this.taskDetail.tabPanelId,
          isCreateDiagnoseTask: this.taskDetail.isCreateDiagnoseTask, // 是否来自调优助手优化建议创建诊断分析任务
        })
      );
    } else {
      this.closeTab.emit(tabInfo);
    }
  }

  public getUserConfig() {
    const runUserObj: any = {};
    this.nodeList.forEach((item: any) => {
      runUserObj[item.node] = this.runUserParams;
    });
    if (!this.modeClicked) {
      this.nodeList.forEach((item: any) => {
        if (item.params.status) {
          const currentNode = this.nodeConfigedData.find((node: any) => {
            return node.nodeIp === item.node;
          });
          runUserObj[item.node] = currentNode.runUser;
        }
      });
    }
    Object.keys(runUserObj).forEach(key => {
      if (runUserObj[key].user_name === '') {
        runUserObj[key].user_name = 'launcher';
      }
    });
    return runUserObj;
  }
  /**
   * 获取节点列表
   * @param projectId 工程id
   */
  public requestGetNodeInfo(projectId: any): Promise<NodeConfigItem[]> {
    const option = {
      url: `/memory-project/${encodeURIComponent(projectId)}/info/`
    };
    return new Promise<NodeConfigItem[]>((resolve, reject) => {
      this.vscodeService.get(option, (res: any) => {
        const data = this.getNodeConfig(res.data.nodeList);
        resolve(data);
      });
    });
  }

  /**
   * 添加预约任务参数处理
   * @param self 预约组件
   * @param params 当前预约任务配置参数
   */
  public createPreMission(self: any, params: any) {
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
    return params;
  }

  /**
   * 获取节点参数，返回请求参数格式
   * @param data 节点信息查询回参
   */
  public getNodeConfig(data: any) {
    const configList: any = [];
    const taskParam = {
      status: false,
      duration: this.taskParams.duration,
      interval: this.taskParams.interval,
      assemblyLocation: this.taskParams.assemblyLocation,
      sourceLocation: this.taskParams.sourceLocation,
      collectStack: this.taskParams.collectStack,
      collectSize: this.taskParams.collectSize,
      stopException: this.taskParams.stopException,
      analysisTarget: this.taskParams.analysisTarget
    };
    data.forEach((item: any) => {
      configList.push({
        nodeId: item.id,
        nickName: item.nickName,
        nodeIp: item.nodeIp,
        nodeStatus: item.nodeStatus,
        taskParam: !this.modeClicked
          ? Object.assign(taskParam, {
            appDir: this.taskParams.appDir,
            appParameters: this.taskParams.appParameters,
            samplingDelay: this.taskParams.samplingDelay
          })
          : Object.assign(taskParam, {
            processPid: this.taskParams.processPid,
            processName: this.taskParams.processName,
            samplingDelay: 0
          })
      });
    });
    return configList;
  }

  /**
   * 显示保存模板弹框
   */
  public showTemplateModal(): void {
    if (this.isSure) { return; }
    this.saveTemplate().then(res => {
      this.keepData = res;
      this.templateModal.openModal();
    });
  }

  /**
   * 保存模板时获取任务信息，节点信息等
   */
  public async saveTemplate() {
    if (!this.taskParams.switch) {
      const nodeConfig = await this.requestGetNodeInfo(this.projectId);
      this.taskParams.nodeConfig = nodeConfig;
    }
    this.taskParams.projectName = this.projectName; this.taskParams.projectName = this.projectName;
    let params: any = this.initDefaultParams();
    if (this.switchScheduled.switchState) {
      this.showImmediately = false;
      this.startCheckRes.checked = false;
      params = this.createPreMission(this.switchScheduled, params);
    }
    return params;
  }

  // 初始化默认变量
  private initDefaultParams() {
    const {
      analysisTarget, analysisType, diagnosticType,
      projectName, taskName, interval, duration,
      switch: switchStatus, assemblyLocation,
      sourceLocation, stopException, collectStack,
      collectSize, nodeConfig
    } = this.taskParams;
    const defaultParams = {
      analysisTarget,
      analysisType,
      diagnosticType,
      projectName,
      taskName,
      duration,
      interval,
      switch: switchStatus,
      assemblyLocation,
      sourceLocation,
      stopException,
      collectStack,
      collectSize,
      nodeConfig,
    };
    // 是否为 Attach模式
    return !this.modeClicked
      ? Object.assign(defaultParams, {
        appDir: this.taskParams.appDir,
        appParameters: this.taskParams.appParameters,
        samplingDelay: this.taskParams.samplingDelay
      })
      : Object.assign(defaultParams, {
        processPid: this.taskParams.processPid,
        processName: this.taskParams.processName,
        samplingDelay: 0
      });
  }

  /**
   * 应用路径提示
   */
  public getAppDir() {
    const option = {
      url: '/config/system/?analysis-type=memory_diagnostic'
    };
    this.vscodeService.get(option, ({ data }: any) => {
      this.modeAppPathAllow = data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
      this.appPathTip =
        (this.i18n.mission_create.modeAppPathInvalid as string).replace(
          '${path}',
          this.taskInfoService.getPathString(this.modeAppPathAllow)
        );
      this.appPathPlaceholder =
        (this.i18n.mission_create.modeAppHolder as string).replace(
          '${path}',
          this.taskInfoService.getPathString(this.modeAppPathAllow)
        );
      this.appDirValidator();
    });
  }

  /**
   * 编辑任务，重启任务时初始化配置参数
   */
  public async resrtartInitParams() {
    const taskId = this.taskDetail.id;
    const option = {
      url: `/memory-tasks/${encodeURIComponent(taskId)}/configuration/?node-id=`
    };
    this.vscodeService.get(option, (res: any) => {
      const taskDetail = res.data;
      this.diagnoseTargetValue = taskDetail.analysisType;
      if (taskDetail.analysisType === 'netio_diagnostic') {
        // 网络IO诊断
        this.onSelect(DiagnoseType.netio_diagnostic);
        this.networkInfo = taskDetail;
        this.taskParams.taskName = taskDetail.taskName;
        this.currentDiagnoseObj = this.i18n.diagnostic.taskParams.networkIO;
      } else if (taskDetail.analysisType === 'storageio_diagnostic') {
        this.onSelect(2);
        this.storageIoInfo = taskDetail;
        this.taskParams.taskName = taskDetail.taskName;
        this.currentDiagnoseObj = this.i18n.diagnostic.taskParams.storageIO;
      } else {
        // 初始化获取节点信息列表
        this.onSelect(0);
        this.currentDiagnoseObj = this.i18n.diagnostic.taskParams.ram;
        const nodeData = JSON.parse(JSON.stringify(res.data.nodeConfig));
        const isAttach = taskDetail.analysisTarget === 'Attach to Process';
        this.modeClicked = isAttach ? 1 : 0;
        this.taskParams = taskDetail;
        this.taskParams.projectName = taskDetail.projectName;
        this.initNodeParams(taskDetail?.switch, nodeData);
        // 初始化采样间隔显示隐藏
        this.handleInterval();
        this.changeDiagnoseType(this.taskParams.diagnosticType);
        this.handleMode(isAttach ? 1 : 0, false);
        if (isAttach) {
          const attachVal = {
            processName: taskDetail.processName,
            processPid: taskDetail.processPid,
          };
          this.pidProcessGroup.get('pidProcess').patchValue(attachVal);
        }
        // 下面逻辑写在这的原因，1090 和 1091 会把多节点重置，原因未知
        this.taskParams.nodeConfig = nodeData.map((detail: any) => {
          if (isAttach) {
            detail.taskParam = Object.assign(detail.taskParam, {
              processName: detail.taskParam?.process_name || detail.taskParam?.processName || '',
              processPid: detail.taskParam?.process_pid || detail.taskParam?.processPid || ''
            });
          }
          return detail;
        });

        if (this.taskParams.analysisTarget === 'Launch Application') {
          delete this.taskParams.processName;
          delete this.taskParams.processPid;
          this.taskParams.nodeConfig.forEach((item: any) => {
            item.taskParam.analysisTarget = 'Launch Application';
            delete item.taskParam.processName;
            delete item.taskParam.processPid;
          });
          this.doValidtor();
        }
      }
    });
  }

  /**
   * 多节点信息初始化
   * @param status 配置指定节点开关是否打开
   * @param nodeData 节点参数列表数据
   */
  public initNodeParams(status: boolean, nodeData: any) {
    if (!status) {
      this.getProjectNodes();
      return;
    }
    this.nodeParams = true;
    this.taskParams.switch = true;
    this.nodeList = nodeData.map((item: any) => {
      return {
        nickName: item.nickName || item.nodeNickName,
        node: item.nodeIp,
        nodeState: item.nodeStatus,
        params: {
          status: item.taskParam.status,
        },
        nodeId: item.nodeId,
      };
    });
    this.srcData.data = this.nodeList;
    this.nodeConfigedData = nodeData.map((item: any) => {
      if (item.taskParam.status) {
        const newFormData = !this.modeClicked
          ? {
            appDir: item.taskParam.appDir,
            appParameters: item.taskParam.appParameters
          }
          : {
            processPid: item.taskParam.processPid || item.taskParam.process_pid || '',
            processName: item.taskParam.processName || item.taskParam.process_name || ''
          };
        const params = {
          nodeIp: item.nodeIp,
          formData: {
            ...newFormData,
            assemblyLocation: item.taskParam.assemblyLocation,
            sourceLocation: item.taskParam.sourceLocation
          }
        };
        return !this.modeClicked
          ? Object.assign(params, {
            runUserSwitch: false,
            runUser: { user_name: '', password: '' }
          })
          : params;
      } else {
        const newFormData = !this.modeClicked
          ? {
            appDir: this.taskParams.appDir,
            appParameters: this.taskParams.appParameters
          }
          : {
            processPid: this.taskParams.processPid,
            processName: this.taskParams.processName
          };
        const params = {
          nodeIp: item.nodeIp,
          formData: {
            ...newFormData,
            assemblyLocation: this.taskParams.assemblyLocation,
            sourceLocation: this.taskParams.sourceLocation
          }
        };
        return !this.modeClicked
          ? Object.assign(params, {
            runUserSwitch: this.runUserSwitch,
            runUser: {
              user_name: this.runUserParams.user_name,
              password: this.runUserParams.password
            }
          })
          : params;
      }
    });
  }
  /**
   * 重启任务
   * @param params 当前任务参数
   * @param taskId 任务ID
   */
  public restartTask(params: any, taskId: number) {
    if (this.currentCreateType) {
      params.nodeConfig.forEach((item: any) => {
        item.taskParam.assemblyLocation = '';
      });
    }
    params.nodeConfig.forEach((item: any) => {
      delete item.taskParam.diagnosticType;
    });
    params.status = 'restarted';
    params.user_message = this.getUserConfig();
    if (this.modeClicked) {
      this.handleAttachNodeParams(params);
    }
    // 调优助手跳转创建任务
    if (this.taskDetail.isFromTuningHelper) {
      params = this.getParams(params);
    }
    const ops = {
      url: `/memory-tasks/${taskId}/status/`,
      params
    };
    this.vscodeService.put(ops, (res: any) => {
      const self = this;
      if (res.status) {
        self.vscodeService.showInfoBox(res.message, 'error');
      } else {
        if (res && res.data) {
          this.updateWebview(res.data, params);
        }
      }
    });
  }

  /**
   * 编辑修改任务信息
   * @param params 任务配置参数
   * @param taskId 任务Id
   */
  public editTask(params: any, taskId: number) {
    if (this.currentCreateType) {
      params.nodeConfig.forEach((item: any) => {
        item.taskParam.assemblyLocation = '';
      });
    }
    params.nodeConfig.forEach((item: any) => {
      delete item.taskParam.diagnosticType;
    });
    if (this.modeClicked) {
      this.handleAttachNodeParams(params);
    }
    const ops = {
      url: `/memory-tasks/${taskId}/`,
      params
    };
    this.vscodeService.put(ops, (res: any) => {
      if (res.status) {
        this.vscodeService.showInfoBox(res.message, 'error');
      } else {
        if (this.startCheckRes.checked) {
          this.startDataSamplingTask(taskId, params);
        } else {
          this.vscodeService.showInfoBox(this.i18nService.I18nReplace(this.i18n.plugins_term_task_modify_success, {
            0: params.taskName
          }), 'info');
          this.closeTab.emit({});
        }
      }
    });
  }

  /**
   * 根据传入的内存诊断列表更新页面复选框状态
   * @param list 内存诊断类型选择列表
   */
  public changeDiagnoseType(list: any) {
    if (list.indexOf('mem_exception') > -1) {
      this.clickDiagnoseType(1);
    } else {
      this.currentCreateType = 0;
      this.memoryDiagnoseType.forEach((item: any) => {
        if (list.indexOf(item.id) > -1) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });
      this.labelShowChange();
      this.handleInterval();
    }
  }

  /**
   * 配置指定节点参数关闭状态下，编辑状态下参数中的节点属性值同时更新
   * @param param 被重新修改值的属性名 label
   */
  public resetEdit(param: any) {
    if (this.actionType !== 'create') {
      this.taskParams.nodeConfig.forEach((item: any) => {
        if (param === 'processPid') {
          item.taskParam[param] = this.taskParams[param];
          item.taskParam.processName = this.taskParams.processName;
        } else {
          item.taskParam[param] = this.taskParams[param];
        }
      });
    }
  }

  // 导入模板
  public importTemplate(): void {
    if (this.diagnoseTarget === this.selectList[0].txt) {
      this.taskTemplate.open({
        type: 'memory_diagnostic',
        typeList: [],
      });
    } else if (this.diagnoseTarget === this.selectList[1].txt) {
      this.taskTemplate.open({
        type: 'network_diagnostic',
        typeList: [],
      });
    } else if (this.diagnoseTarget === this.selectList[2].txt) {
      this.taskTemplate.open({
        type: 'storageio_diagnostic',
        typeList: [],
      });
    }
  }

  // 导入模板传值
  public getTemplateData(e: any): void {
    this.actionType = 'create';
    if (e.analysisType === 'netio_diagnostic') {
      this.networkInfo = e;
      this.taskParams.taskName = e.taskName;
    } else if (e.analysisType === 'storageio_diagnostic') {
      this.storageIoInfo = e;
      this.taskParams.taskName = e.taskName;
    } else {
      Object.keys(this.taskParams).forEach(val => {
        if (val !== 'projectName') {
          this.taskParams[val] = e[val];
        }
      });
      if (this.nodeParams) {
        this.nodeParams = false;
        this.taskParams.switch = false;
      }
      this.changeDiagnoseType(e.diagnosticType);
      this.handleInterval();
      // 初始化多节点
      this.initNodeParams(e.switch, e.nodeConfig);
      // 预约任务数据导入
      this.switchScheduled.importTemp(e);
      if (e.analysisTarget === 'Attach to Process') {
        this.pidProcessGroup.get('pidProcess').patchValue({ processName: e.processName, processPid: e.processPid });
        this.hideSamplingDelay();
      }
      setTimeout(() => {
        this.doValidtor();
      }, 200);
    }
  }


  /**
   * 当前页签取消
   */
  public cancalTab(event: any) {
    if (this.taskDetail.isFromTuningHelper) {  // 来自调优助手
      this.closeTab.emit(Object.assign(
        event,
        {
          fromTuningTabId: this.taskDetail.tabPanelId,
          isCreateDiagnoseTask: this.taskDetail.isCreateDiagnoseTask, // 是否来自调优助手优化建议创建诊断分析任务
        })
      );
    } else {
      this.closeTab.emit(event);
    }
  }

  /**
   * 应用路径校验
   */

  public appDirValidator(): any {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === '') {
        return { appPathValid: { tiErrorMessage: this.i18n.mission_create.modeAppPath } };
      }
      if (this.customValidatorsService.pathMatch(control.value)) {
        return { appPathValid: { tiErrorMessage: this.i18n.mission_create.modeAppWarn } };
      }
      let isIncluded = false;
      const allowPathList: string[] = this.modeAppPathAllow.split(';');
      for (const allowPath of allowPathList) {
        if (control.value.includes(allowPath) && control.value.indexOf(allowPath) === 0) {
          isIncluded = true;
        }
      }
      if (!isIncluded) {
        const modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace('${path}',
          this.taskInfoService.getPathString(this.modeAppPathAllow));
        return { appPathValid: { tiErrorMessage: modeAppWarnMsg } };
      } else {
        return null;
      }
    };
  }

  /**
   * 微调器失焦恢复默认值
   */
  public paramsBlur(label: string) {
    if (label === 'duration' && this.taskParams[label] < 1) {
      this.taskParams[label] = '';
      return;
    }
    if (this.taskParams[label]) { return; }
    if (label === 'samplingDelay') {
      this.taskParams[label] = 0;
    }
    if (label === 'interval') {
      this.taskParams[label] = 1000;
    }
    if (label === 'collectSize') {
      this.taskParams[label] = 100;
    }
    this.resetEdit(label);
    setTimeout(() => {
      this.doValidtor();
    }, 10);
  }
  // 状态小圆点
  public statusFormat(status: boolean): string {
    let statusClass = '';
    switch (status) {
      case true:
        statusClass = 'success-icon';
        break;
      default:
        statusClass = 'reserve-icon';
        break;
    }
    return statusClass;
  }

  // 打开配置参数二级框
  public onConfigParams(row: any) {
    const newParams = !this.modeClicked
      ? {
        appDir: this.taskParams.appDir,
        appParameters: this.taskParams.appParameters
      }
      : {
        processPid: this.taskParams.processPid,
        processName: this.taskParams.processName
      };
    let params = {
      nodeIp: row.node,
      nodeName: row.nickName,
      analysisTarget: this.taskParams.analysisTarget,
      param: {
        ...newParams,
        assemblyLocation: this.taskParams.assemblyLocation,
        sourceLocation: this.taskParams.sourceLocation,
      }
    };
    if (!this.modeClicked) {
      params = Object.assign(params, {
        runUserSwitch: this.runUserSwitch,
        runUser: {
          user_name: this.runUserParams.user_name,
          password: this.runUserParams.password
        }
      });
    }
    this.diagnoseAttach.open(params);
  }

  /**
   * 从tiny3密码框获取小眼睛图片
   * ps: 目前先以当前方式显示小眼睛，后续有更好的vscode显示背景图片的方式再行改善
   */
  public getEyesImg(tiTextComponent: TiTextComponent) {
    const inputEl = tiTextComponent.nativeElement as HTMLInputElement;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      /url\("(.*?)"\)/.exec(inputEl.style.backgroundImage)?.[1] || ''
    );
  }
  onSendMissionKeep(event: any) {
    this.keepData = event;
    this.templateModal.openModal();
  }
  /**
   * 处理attach to process 多节点列表参数
   */
  private handleAttachNodeParams(params: any) {
    params.nodeConfig.forEach((item: any) => {
      if (!this.nodeParams) {
        item.taskParam.processName = this.taskParams.processName || '';
        item.taskParam.processPid = this.taskParams.processPid || '';
        item.taskParam.status = false;
      }
    });
  }
}
