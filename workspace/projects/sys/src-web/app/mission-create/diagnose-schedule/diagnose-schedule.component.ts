import {
    AfterViewInit, ChangeDetectorRef, Component, EventEmitter,
    Input, OnInit, Output, ViewChild
  } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { AxiosService, I18nService } from 'projects/sys/src-web/app/service';
import { CustomValidatorsService } from '../../service';
import { MytipService } from '../../service/mytip.service';
import {
    MissionDiagnosisLaunchComponent
  } from '../../diagnose-create/mission-components/mission-diagnosis-launch/mission-diagnosis-launch.component';
import { NodelistItem, NodeConfigListItem } from 'projects/sys/src-web/app/diagnose-create/domain';

@Component({
    selector: 'app-diagnose-schedule',
    templateUrl: './diagnose-schedule.component.html',
    styleUrls: ['./diagnose-schedule.component.scss']
  })
  export class DiagnoseScheduleComponent implements OnInit, AfterViewInit {

    @ViewChild('diagnoseAttach') diagnoseAttach: MissionDiagnosisLaunchComponent;
    @ViewChild('switchScheduled') switchScheduled: any;
    @ViewChild('nodeConfigTable') nodeConfigTable: any;

    @Input() taskData: any;
    @Input() projectId: any;
    @Input() scheduleTaskId: any;

    @Output() cancelModify = new EventEmitter<void>();
    @Output() confirmModify = new EventEmitter<string>();

    // 模式
    public modeClicked = 0; // 默认为 Launch
    /** pid 和 进程名称输入的控件 */
    public pidProcessGroup: FormGroup;
    public isModifySchedule = true;
    public taskInfo: any;
    public i18n: any;
    public isSure = false;
    public leakCheck = false;
    public memoryDiagnose: any = [];
    // 当前可用应用路径
    public modeAppPathAllow = '';
    // 应用路径提示
    public appPathTip = '';
    public modeAppWarnMsg: string;  // 校验之后的信息
    public validation: TiValidationConfig = {
      type: 'blur'
    };
    public interval: any = {
      max: 60000,
      min: 1
    };
    public samplingDelayRange: any = {
      min: 0
    };
    // 配置指定节点参数开关
    public nodeParams = false;
    public nodeList: NodelistItem[];
    public nodeConfigedData: NodeConfigListItem[];
    public collectSize: any = {
      max: 100,
      min: 1
    };
    // 预约采集 采集方式 1  周期， 2 单次
    public selected: number;
    // 创建任务参数
    public taskParams: any = {
      // 采集类型 默认launch application
      analysisTarget: 'Launch Application',
      // 分析类型 默认 memory diagnostic
      analysisType: 'memory_diagnostic',
      // 诊断类型  mem_exception | oom、memory_leak、memory_consumption
      diagnosticType: ['mem_leak'],
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
    public appPathValid: any;
    public pathValid = new FormControl('', [this.customValidatorsService.pathValidator()]);
    public pathCValid = new FormControl('', [this.customValidatorsService.pathValidator()]);
    public samplingDelayValid = new FormControl(0, [this.customValidatorsService.checkRange(0)]);
    public intervalValid = new FormControl(1000, [this.customValidatorsService.checkRange(1, 60000)]);
    public collectSizeValid = new FormControl(100, [this.customValidatorsService.checkRange(1, 100)]);
    // 当前诊断内容
    public currentCreateType = 0;
    constructor(
      public Axios: AxiosService,
      public i18nService: I18nService,
      public customValidatorsService: CustomValidatorsService,
      public mytip: MytipService,
      private cdr: ChangeDetectorRef
    ) {
      this.i18n = this.i18nService.I18n();
      this.appPathValid = new FormControl('', [this.appDirValidator(), TiValidators.required]);
      this.memoryDiagnose = [
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
      this.taskInfo = [
        {
          id: 'taskname',
          label: this.i18n.diagnostic.taskParams.taskname,
          require: true,
          show: true
        },
        {
          id: 'analysisTarget',
          label: this.i18n.diagnostic.taskParams.diagnosticTarget,
          require: false,
          show: true
        },
        {
          id: 'mode',
          label: this.i18n.mission_create.mode,
          require: false,
          show: true
        },
        {
          id: 'app_dir',
          label: this.i18n.diagnostic.taskParams.app_dir,
          require: true,
          tipMsg: this.i18n.mission_create.modeAppNotice,
          show: true
        },
        {
          id: 'app_parameters',
          label: this.i18n.diagnostic.taskParams.app_parameters,
          require: false,
          tipMsg: this.i18n.mission_create.modeAppParamsNotice,
          show: true
        },
        /* Attach to process */
        {
          id: 'attachProcess',
          require: true,
          show: false
        },
        {
          id: 'memory_diagnose',
          label: this.i18n.diagnostic.taskParams.content_diagnose,
          require: true,
          show: true
        },
        {
          id: 'assemblyLocation',
          label: this.i18n.diagnostic.taskParams.assemblyLocation,
          tipMsg: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
          require: false,
          show: true,
          type: 1 // 表示非内存诊断
        },
        {
          id: 'sourceLocation',
          label: this.i18n.diagnostic.taskParams.sourceLocation,
          tipMsg: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
          require: false,
          show: true
        },
        {
          id: 'samplingDelay',
          label: this.i18n.diagnostic.taskParams.samplingDelay,
          tipMsg: this.i18n.micarch.simpling_delay_tip,
          require: false,
          show: true,
          type: 1 // 表示非内存诊断
        },
        {
          id: 'duration',
          label: this.i18n.diagnostic.taskParams.duration,
          require: false,
          show: true,
          type: 1 // 表示非内存诊断
        },
        {
          id: 'interval',
          label: this.i18n.diagnostic.taskParams.interval,
          require: false,
          show: false,
          type: 1 // 表示非内存诊断
        },
        {
          id: 'collectStack',
          label: this.i18n.diagnostic.taskParams.collectStack,
          require: false,
          show: true,
          type: 1 // 表示非内存诊断
        },
        {
          id: 'stopException',
          label: this.i18n.diagnostic.taskParams.stopException,
          require: false,
          show: false,
          type: 2 // 表示内存异常
        },
        {
          id: 'switch',
          label: this.i18n.diagnostic.taskParams.switch,
          require: false,
          show: true
        },
        {
          id: 'collectSize',
          label: this.i18n.diagnostic.taskParams.collectSize,
          tipMsg: this.i18n.falsesharing.filesizeTips,
          require: false,
          show: true
        },
      ];
      this.initPidProcessGroup();
    }

    ngOnInit(): void {
      this.selected = this.taskData.cycle ? 1 : 2;
      this.taskParams = this.initDefaultParams();
      if (this.taskData.analysisTarget !== 'Attach to Process') {
        this.getAppDir();
      } else {
        this.modeClicked = 1;
      }
      if (!this.taskData.switch) {
        this.getProjectNodes();
      }
    }
    ngAfterViewInit(): void {
      setTimeout(() => {
        this.taskParams = this.inittTskParams(this.taskData);
        // 预约定时启动组件初始化开关重启与编辑禁用
        this.switchScheduled.switchState = true;
        this.switchScheduled.importTemp(this.taskData);
      }, 10);
    }

    public sureUpdata() {
      const params: any = this.createPreMission(this.switchScheduled, this.taskParams);
      this.Axios.axios.put(`/schedule-tasks/${this.scheduleTaskId}/`, params).then((res: any) => {
        this.confirmModify.emit('on');
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
      });

    }

    /**
     * 对 taskParams值进行赋值
     * @param obj 父组件传过来的值
     */
    public inittTskParams(obj: any) {
      Object.keys(this.taskParams).forEach((item) => {
        this.taskParams[item] = obj[item];
      });
      this.nodeParams = obj.switch;
      if (this.nodeParams) {
        this.initProjectNodes();
      }
      this.changeDiagnoseType(this.taskParams.diagnosticType);
      this.handleMode(this.modeClicked);
      return this.taskParams;
    }

    // 初始化 Attach to Process 表单
    private initPidProcessGroup() {
      this.pidProcessGroup = new FormGroup({
        pidProcess: new FormControl(),
      });
      this.pidProcessGroup.valueChanges.subscribe((val) => {
        this.taskParams.processName = val.pidProcess?.processName || '';
        this.taskParams.processPid = val.pidProcess?.processPid || '';
        if (!this.nodeParams){
          this.doValidtor();
        }
      });
    }

    /**
     * 对不同模式进行处理
     * @param index 模式下标
     */
    public handleMode(index: number) {
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

      const { processPid, processName } = this.taskParams;
      if (index) {
        this.pidProcessGroup.get('pidProcess').patchValue({processName, processPid });
      }
      this.doValidtor();
    }

    // 初始化默认变量
    private initDefaultParams() {
      // 是否为 Attach模式
      return this.taskData.analysisTarget !== 'Attach to Process'
        ? Object.assign(this.taskParams, {
          appDir: '', // 应用路径
          appParameters: '' // 应用参数
        })
        : Object.assign(this.taskParams, {
          processPid: '', // PID
          processName: '' // 进程名称
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
        this.memoryDiagnose.forEach((item: any) => {
          if (list.indexOf(item.id) > -1) {
            item.checked = true;
          }
        });
        this.labelShowChange();
        this.handleInterval();
      }
    }
    public resetNodeConfig(param: any) {
      this.taskParams.nodeConfig.forEach((item: any) => {
        if (param === 'processPid') {
          item.taskParam[param] = this.taskParams[param];
          item.taskParam.processName = this.taskParams.processName;
        } else {
          item.taskParam[param] = this.taskParams[param];
        }
      });
    }
    /**
     * 应用路径
     * @param e 路径
     */
    public appDirChange(appDir: any) {
      this.taskParams.appDir = appDir;
      setTimeout(() => {
        this.doValidtor();
      }, 10);
      this.resetNodeConfig('appDir');
    }
    /**
     * 应用参数
     * @param e 参数
     */
    public appParameterChange(e: any) {
      this.taskParams.appParameters = e;
      this.resetNodeConfig('appParameters');
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
        this.memoryDiagnose[0].disable = false;
        this.taskParams.diagnosticType = ['mem_exception'];
        this.memoryDiagnose.forEach((item: any) => {
          item.checked = false;
        });
      } else {
        this.taskParams.diagnosticType = ['mem_leak'];
        this.memoryDiagnose[0].checked = true;
        this.memoryDiagnose[0].disable = true;
      }
      this.labelShowChange();
      this.handleInterval();
    }

    public diagnoseTypeChange() {
      if (!this.currentCreateType) {
        this.taskParams.diagnosticType = [];
        this.memoryDiagnose.forEach((item: any) => {
          if (item.checked) {
            this.taskParams.diagnosticType.push(item.id);
          }
        });
        this.handleInterval();
      }
    }

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

    /**
     * 二进制/符号文件路径
     * @param e 参数
     */
    public assemblyLocationChange(e: any) {
      this.taskParams.assemblyLocation = e;
      setTimeout(() => {
        this.doValidtor();
      }, 10);
      this.resetNodeConfig('assemblyLocation');
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
      this.resetNodeConfig('sourceLocation');
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
      this.resetNodeConfig('samplingDelay');
    }
    /**
     * 诊断时长
     * @param e 参数
     */
    public durationChange(e: number | undefined | string) {
      if (e === undefined || e === 0) {
        e = '';
      }
      this.taskParams.duration = e;
      this.resetNodeConfig('duration');
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
      this.resetNodeConfig('interval');
    }
    /*
     * 异常后中止分析
     * @param e 参数
     */
    public stopExceptionChange(state: boolean) {
      this.taskParams.stopException = state;
    }
    /**
     * 采集调用栈
     * @param e 参数
     */
    public collectStackChange(state: boolean) {
      this.taskParams.collectStack = state;
      this.resetNodeConfig('collectStack');
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
      this.resetNodeConfig('collectSize');
    }


    /**
     * 节点配置
     * @param e 参数
     */
    public nodeSwitchChange(state: boolean) {
      this.taskParams.switch = state;
      if (state) {
        this.getProjectNodes();
      }else{
        this.handleAttachNodeParams(this.taskParams);
      }
    }

    /**
     * 关闭侧滑框
     */
    public onClose() {
      this.cancelModify.emit();
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
     * 应用路径提示
     */
    public getAppDir() {
      this.Axios.axios.get('config/system/?analysis-type=memory_diagnostic')
        .then(({ data }: any) => {
          this.modeAppPathAllow = data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
          this.appPathTip =
            (this.i18n.mission_create.modeAppPathInvalid as string).replace(
              '${path}',
              this.Axios.getPathString(this.modeAppPathAllow)
            );
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
    public doValidtor(): boolean {
      let isSure = false;
      // launch 打开多节点配置，数据初始化时默认应用路径校验通过，不校验应用路径
      const appDirValid = this.nodeParams ? false : this.appPathValid.errors;
      const appPathValid = this.modeClicked ? !this.pidProcessGroup.valid : appDirValid;
      const validValue = appPathValid || this.pathValid.errors ||
        this.taskParams.samplingDelay === undefined || this.taskParams.interval === undefined ||
        this.taskParams.collectSize === undefined ||
        this.pathCValid.errors || this.taskParams.diagnosticType.length === 0;
      isSure = validValue ? true : false;
      this.isSure = isSure;
      return isSure;
    }

    public appDirValidator(): any {
      const regOne = this.customValidatorsService.applicationPathReg;
      const regTwo = /(\/{2,})/;
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
            this.Axios.getPathString(this.modeAppPathAllow));
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
      if (label === 'duration' && this.taskParams[label] < 1 ||
        label === 'duration' && this.taskParams[label] === undefined
      ) {
        this.taskParams[label] = '';
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
      this.resetNodeConfig(label);
      setTimeout(() => {
        this.doValidtor();
      }, 10);
    }

    /**
     * 打开多节点配置滑窗
     */
    public onOpentNodeEmit(e: any) {
      this.diagnoseAttach.open(e);
    }

    /**
     * 初始化节点信息
     */
    public initProjectNodes() {
      this.nodeList = this.taskData.nodeConfig.map((item: any) => {
        return {
          nickName: item.nickName,
          node: item.nodeIp,
          nodeState: item.nodeStatus,
          params: {
            status: item.taskParam.status,
          },
          nodeId: item.nodeId,
        };
      });
      this.nodeConfigedData = this.taskData.nodeConfig.map((item: any) => {
        const params = !this.modeClicked
          ? {
            appDir: item.taskParam.appDir,
            appParameters: item.taskParam.appParameters
          }
          : {
            processPid: item.taskParam.processPid,
            processName: item.taskParam.processName
          };
        return {
          nodeIp: item.nodeIp,
          formData: {
            ...params,
            assemblyLocation: item.taskParam.assemblyLocation,
            sourceLocation: item.taskParam.sourceLocation,
          },
        };
      });
    }

    public async handleConfigData(e: any) {
      const nodeIndex = this.nodeConfigedData.findIndex(item => {
        return item.nodeIp === e.nodeIp;
      });
      this.nodeConfigedData[nodeIndex].formData = e.formData;
      this.nodeList[nodeIndex].params.status = true;
      this.taskParams.nodeConfig[nodeIndex].taskParam.status = true;
      Object.keys(e.formData).forEach((key) => {
        this.taskParams.nodeConfig[nodeIndex].taskParam[key] = e.formData[key];
      });
    }

    /**
     * 开关节点配置
     */
    public getProjectNodes() {
      const url = `memory-project/${encodeURIComponent(this.projectId)}/info/`;
      this.Axios.axios.get(url).then((res: any) => {
        this.nodeList = res.data.nodeList.map((item: any) => {
          return {
            nickName: item.nickName,
            node: item.nodeIp,
            nodeState: item.nodeStatus,
            params: {
              status: false,
            },
            nodeId: item.nodeId,
            id: item.id,
          };
        });
        this.nodeConfigedData = res.data.nodeList.map((item: any) => {
          const params = !this.modeClicked
            ? { appDir: '', appParameters: '' }
            : { processPid: '', processName: '' };
          return {
            nodeIp: item.nodeIp,
            formData: {
              ...params,
              assemblyLocation: '',
              sourceLocation: '',
            },
          };
        });
        this.taskParams.nodeConfig = this.getNodeConfig(res.data.nodeList);
      });
    }

    /**
     * 获取节点参数，返回请求参数格式
     * @param data 节点信息查询回参
     */
    public getNodeConfig(data: any) {
      const configList: any = [];
      const params = !this.modeClicked
        ? {
          appDir: this.taskParams.appDir,
          appParameters: this.taskParams.appParameters,
        }
        : {
          processPid: this.taskParams.processPid,
          processName: this.taskParams.processName
        };
      data.forEach((item: any) => {
        configList.push({
          id: item.id,
          nodeId: item.id,
          nickName: item.nickName,
          nodeIp: item.nodeIp,
          nodeStatus: item.nodeStatus,
          taskParam: {
            analysisTarget: this.taskParams.analysisTarget,
            status: false,
            duration: this.taskParams.duration,
            interval: this.taskParams.interval,
            samplingDelay: this.taskParams.samplingDelay,
            assemblyLocation: this.taskParams.assemblyLocation,
            sourceLocation: this.taskParams.sourceLocation,
            collectStack: this.taskParams.collectStack,
            collectSize: this.taskParams.collectSize,
            stopException: this.taskParams.stopException,
            ...params
          },
        });
      });
      return configList;
    }

    /**
     * 处理attach to process 多节点列表参数
     */
    private handleAttachNodeParams(params: any) {
      params.nodeConfig.forEach((item: any) => {
        // 关闭指定节点配置参数开关
        if (!this.nodeParams) {
          item.taskParam.processName = this.taskParams.processName || '';
          item.taskParam.processPid = this.taskParams.processPid || '';
          item.taskParam.status = false;
        }
      });
    }
  }
