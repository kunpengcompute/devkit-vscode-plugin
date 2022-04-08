import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  Renderer2,
  ChangeDetectorRef,
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { Util } from '@cloud/tiny3';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AnalysisScene, AnalysisType } from '../../domain';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';
import { CustomValidatorsService } from '../../service';

@Component({
  selector: 'app-modify-schedule',
  templateUrl: './modify-schedule.component.html',
  styleUrls: ['./modify-schedule.component.scss'],
})
export class ModifyScheduleComponent implements OnInit {
  private url: any;
  constructor(
    private urlService: UrlService,
    public i18nService: I18nService,
    private Axios: AxiosService,
    public renderer2: Renderer2,
    public fb: FormBuilder,
    private cdf: ChangeDetectorRef,
    public customValidatorsService: CustomValidatorsService
  ) {
    this.url = this.urlService.Url();
    this.i18n = this.i18nService.I18n();
    this.missionNameNotice = this.i18n.mission_create.missionNameNotice;
    this.modeList = [
      {
        name: this.i18n.mission_create.launchApp,
        value: 0,
      },
      {
        name: this.i18n.mission_create.attachPid,
        value: 1,
      },
    ];
    this.modeAppNotice = this.i18n.common_term_task_type_launch;
    this.modePidNotice = this.i18n.common_term_task_type_attach;
    this.modeAppHolder = this.i18n.mission_create.modeAppHolder;
    this.modePidHolder = this.i18n.mission_create.modePidHolder;
    this.modeAppParamsHolder = this.i18n.mission_create.modeAppParamsHolder;

    this.pidProcessGroup = this.fb.group({
      pidProcess: [],
      pidProcessJava: [],
    });
    this.pidProcessGroup.controls.pidProcess.valueChanges.subscribe(
      (pidProcess) => {
        if (pidProcess != null) {
          this.modePid = pidProcess.pid || '';
          this.modeProcess = pidProcess.process || '';
        }
      }
    );

    this.pidProcessGroup.controls.pidProcessJava.valueChanges.subscribe(
      (pidProcessJava) => {
        if (pidProcessJava != null) {
          this.modePidJava = pidProcessJava.pid || '';
          this.modeProcessJava = pidProcessJava.process || '';
        }
      }
    );

    // FIXME 控件封装的不成熟导致这里的逻辑过于复杂
    this.pidProcessGroup.controls.pidProcess.statusChanges.subscribe(
      (status) => {
        this.modePidValid =
          status === 'DISABLED' ||
          status === 'VALID' ||
          this.prevPidProcessStatus === 'DISABLED';
        this.prevPidProcessStatus = status;
      }
    );
    this.pidProcessGroup.controls.pidProcessJava.statusChanges.subscribe(
      (status) => {
        this.modePidValidJava =
          status === 'DISABLED' ||
          status === 'VALID' ||
          this.prevPidProcessStatusJava === 'DISABLED';
        this.prevPidProcessStatusJava = status;
      }
    );

    this.typeMsgInfo = {
      system: this.i18n.mission_create.sysProMsg,
      resource_schedule: this.i18n.mission_create.resScheduleMsg,
      microarchitecture: this.i18n.mission_create.structureMsg,
      mem_access: this.i18n.mission_create.memMsg,
      'process-thread-analysis': this.i18n.mission_create.processMsg,
      miss_event: this.i18n.mission_create.missEventMsg,
      'C/C++ Program': this.i18n.mission_create.cPlusPlusMsg,
      system_lock: this.i18n.mission_create.lockMsg,
    };
    this.typeMsg = this.typeMsgInfo.system;
  }
  @ViewChild('modal') modal: any;
  @ViewChild('performance') performance: any;
  @ViewChild('config') config: any;
  @ViewChild('process') process: any;
  @ViewChild('schedule') schedule: any;
  @ViewChild('lock') lock: any;
  @ViewChild('mem') mem: any;
  @ViewChild('cplusplus') cplusplus: any;
  @ViewChild('java') java: any;
  @ViewChild('structure') structure: any;
  @ViewChild('configNodeModal') configNodeModal: any;
  @ViewChild('keep_modal') keepModal: any;
  @ViewChild('modalDialog', { static: true }) private modalDialog: any;
  @ViewChild('cProfile') cProfile: any;
  @ViewChild('cLaunch') cLaunch: any;
  @ViewChild('cAttach') cAttach: any;
  @ViewChild('jLaunch') jLaunch: any;
  @ViewChild('jAttach') jAttach: any;
  @ViewChild('lAttach') lAttach: any;
  @ViewChild('lProfile') lProfile: any;
  @ViewChild('lLaunch') lLaunch: any;
  @ViewChild('rAttach') rAttach: any;
  @ViewChild('rLaunch') rLaunch: any;
  @ViewChild('rProfile') rProfile: any;
  @ViewChild('sAttach') sAttach: any;
  @ViewChild('sProfile') sProfile: any;
  @ViewChild('sLaunch') sLaunch: any;
  @ViewChild('dProfile') dProfile: any;
  @ViewChild('diagnose') diagnose: any;
  @ViewChild('hpcNodeParams') hpcNodeParams: any;

  @Input()
  set taskDataModify(rowData: any) {
    if (rowData) {
      this.taskData = rowData.data;
      this.open(rowData);
    }
  }
  public taskData: any;

  @Output() private sendPretable = new EventEmitter<any>();
  public scenes: any;
  public scheduleTaskType = 'system'; // 分析类型,确定展示组件
  public modeClicked = 0; // 模式
  public targetClicked = 0; // 分析对象
  public analysisTypesDir: any; // 所有任务字典
  public typeClicked = 0; // 分析类型
  public missionName: string; // 任务名称
  public type = ''; // 某种任务类型，用于查找模板数据
  public actionType = 'scheduleEdit';
  public missionNameValid = true; // 任务名称是否合法
  public missionNameWarnMsg: string; // 不合法时输出提示
  public misssionNameAble = false; // 任务名称是否被禁用
  public nodeConfigShow: boolean;
  public modePidValid = true;
  public modePidWarnMsg: string;
  public modePid: number;
  public keepData: any; // 保存模板
  public projectId: number;
  public projectName: any;
  public isModifySchedule = false; // 是否是修改预约任务
  public i18n: any;
  public cPs = 'Profile System';
  public cAtp = 'Attach to Process';
  public cLa = 'Launch Application';
  public configList: any = [];
  public missConfigList: any = [];
  public showTaskData: any;
  public analysisTypeLaunch: any; // 应用 拉起应用(launch)
  public analysisTypeAttach: any; // 应用 指定进程 (attach)
  public analysisTypeSys: any; // 系统
  public typeMsgInfo: any; // 任务图标下的说明文字列表数据
  public typeMsg: string; // 任务图标下的说明文字
  public modeAppWarnMsg: string; // 校验之后的信息
  public modeAppParamsMsg: string;
  public modeAppValid = true; // 是否校验成功
  public modeAppParamsValid = true;
  public modeAppDisable = false;
  public modePidDisable = false;
  public modeAppParamsDisable = false;
  public modeList = new Array(); // 模式列表
  public modeAppNotice: string;
  public modePidNotice: string;
  public modeApplication = ''; // 应用或应用路径
  public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/
  public modeAppParams: string;
  public modeAppHolder: string; // 应用的placeholder
  public modeAppParamsHolder: string;
  public modePidHolder: string; // pid的placeholder
  public missionNameNotice: string;
  public labelWidth = '240px';
  public nodeConfigedData: any;
  // 处理模板分析类型
  public taskType: any = {};
  public simplingArr = [
    { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
    { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
    {
      id: 'resourceBound',
      text: 'Back-End Bound->Resource Bound',
      tip: 'testtest',
    },
    { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
    {
      id: 'memoryBound',
      text: 'Back-End Bound->Memory Bound',
      tip: 'testtest',
    },
  ];

  public modePidJava = '';
  public modeProcessJava = '';
  public modePidValidJava = true;
  public prevPidProcessStatusJava = '';

  /** 任务ID */
  public scheduleTaskId: string;
  /** 控制 IO 分析预约任务的修改 */
  public modelReopenSymbol = false;
  /** pid 和 进程名称输入的控件 */
  public pidProcessGroup: FormGroup;
  /** 应用，Attack to Process: 程序名称 */
  public modeProcess: string;
  private prevPidProcessStatus = '';
  // 内存诊断重新加载初始化
  public showDiagnose = true;

  public strategy = {
    // 导入模板
    CHILDACTION(
      child: any,
      actionType: string,
      pre?: boolean,
      id?: number
    ): void {
      if (null == child) {
        return;
      }
      if (pre) {
        child.editScheduleTask = pre;
        child.scheduleTaskId = id;
      }
      child.isRestart = actionType === 'restart';
      child.isEdit = actionType === 'edit';
    },
    IMPORTINIT(
      self: any,
      e: any,
      targetClicked: number,
      modeClicked: number
    ): void {
      const index = targetClicked + modeClicked;
      if (index === 1) {
        self.modeApplication = e['app-dir'];
        self.modeAppParams = e['app-parameters'];
        self.missionAppChange(self.modeApplication);
        self.missionAppParamsChange(self.modeAppParams);
      } else if (index === 2) {
        self.pidProcessGroup.controls.pidProcess.setValue({
          pid: e['target-pid'],
          process: e.process_name,
        });
      } else {
        self.modeApplication = '';
        self.modeAppParams = '';
        self.modePid = null;
      }
    },
    IMPORTINIT_NEW(
      self: any,
      e: any,
      targetClicked: number,
      modeClicked: number
    ): void {
      const index = targetClicked + modeClicked;
      if (index === 1) {
        self.modeApplication = e.appDir;
        self.modeAppParams = e.appParameters;
        self.missionAppChange(self.modeApplication);
        self.missionAppParamsChange(self.modeAppParams);
      } else if (index === 2) {
        self.pidProcessGroup.controls.pidProcess.setValue({
          pid: e.targetPid,
          process: e.process_name,
        });
      } else {
        self.modeApplication = '';
        self.modeAppParams = '';
        self.modePid = null;
      }
    },
    importInit_miss(
      self: any,
      appDir: any,
      appParameters: any,
      targetPid: any,
      processName: any
    ): void {
      const index = self.targetClicked + self.modeClicked;
      if (index === 1) {
        self.modeApplication = appDir;
        self.modeAppParams = appParameters;
        self.missionAppChange(self.modeApplication);
      } else if (index === 2) {
        self.pidProcessGroup.controls.pidProcess.setValue({
          pid: targetPid,
          process: processName,
        });
      } else {
        self.modeApplication = '';
        self.modeAppParams = '';
        self.modePid = null;
      }
    },
    importInit_io(
      context: ModifyScheduleComponent,
      thatMissionData: any
    ): void {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: '',
            process: '',
          });
          break;
        case 1: // launch application
          context.modeApplication = thatMissionData.appDir || '';
          context.modeAppParams = thatMissionData['app-parameters'] || '';
          context.missionAppChange(context.modeApplication);
          context.missionAppParamsChange(context.modeAppParams);
          break;
        case 2: // attach to process
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: thatMissionData.targetPid || '',
            process: thatMissionData.process_name || '',
          });
          break;
        default:
      }
    },
    importInit_process(
      context: ModifyScheduleComponent,
      thatMissionData: any
    ): void {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: '',
            process: '',
          });
          break;
        case 1: // launch application
          context.modeApplication = thatMissionData['app-dir'] || '';
          context.modeAppParams = thatMissionData['app-parameters'] || '';
          context.missionAppChange(context.modeApplication);
          context.missionAppParamsChange(context.modeAppParams);
          break;
        case 2: // attach to process
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: thatMissionData.pid || '',
            process: thatMissionData.process_name || '',
          });
          break;
        default:
      }
    },
    importInit_resource(context: ModifyScheduleComponent, thatData: any) {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: '',
            process: '',
          });
          break;
        case 1: // launch application
          context.modeApplication = thatData['app-dir'] || '';
          context.modeAppParams = thatData['app-parameters'] || '';
          context.missionAppChange(context.modeApplication);
          break;
        case 2: // attach to process
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: thatData['target-pid'] || '',
            process: thatData['process-name'] || '',
          });
          break;
        default:
      }
    },
    IMPORTDATA(child: any, e: any): void {
      if (null != child) {
        child.getTemplateData(e);
      }
    },
  };
  public isLoading: any = false;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  ngOnInit() {
    this.taskType = {
      net: this.i18n.sys.net,
      cpu: this.i18n.sys.cpu,
      mem: this.i18n.sys.mem,
      disk: this.i18n.sys.disk,
      hard: this.i18n.sys_cof.check_types.hard,
      soft: this.i18n.sys_cof.check_types.soft,
      env: this.i18n.sys_cof.check_types.env,
      cache_access: this.i18n.ddr.types.cache_access,
      ddr_access: this.i18n.ddr.types.ddr_access,
      context: this.i18n.process.context,
    };
    // 所有任务字典
    this.analysisTypesDir = [
      {
        name: this.i18n.mission_create.sysPro,
        type: 'system',
      },
      {
        name: this.i18n.mission_create.resSchedule,
        type: 'resource_schedule',
      },
      {
        name: this.i18n.mission_create.structure,
        type: 'microarchitecture',
      },
      {
        // 访存分析
        name: this.i18n.mission_modal.memAccessAnalysis,
        type: 'mem_access_analysis',
        typeList: ['mem_access', 'miss_event', 'falsesharing'],
      },
      {
        name: this.i18n.mission_create.process,
        type: 'process-thread-analysis',
      },
      {
        name: this.i18n.mission_create.cPlusPlus,
        type: 'C/C++ Program',
      },
      {
        name: this.i18n.mission_create.lock,
        type: 'system_lock',
      },
      {
        name: this.i18n.mission_create.io,
        type: 'ioperformance',
      },
    ];

    this.renderer2.listen(this.modalDialog.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });

    // 获取 应用路径
    this.Axios.axios
      .get(this.url.configSystem, { headers: { showLoading: false } })
      .then(({ data }: any) => {
        this.modeAppPathAllow =
          data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
      });
  }
  // 应用路径校验
  public missionAppChange(e: any) {
    e = this.modeApplication ? this.modeApplication.toString().trim() : ''; // 去掉字符串的头尾空格

    // 验证一：为空判断
    if (this.modeApplication == null || this.modeApplication.trim() === '') {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppPath;
      this.modeAppValid = false;
      return;
    }

    // 判断二：正则验证
    // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
    if (this.customValidatorsService.pathMatch(e)) {
      this.modeAppWarnMsg = this.i18n.mission_create.modeAppWarn;
      this.modeAppValid = false;
      return;
    }

    // 验证四：是否为系统配置指定路径下应用判断
    let isIncluded = false;
    const allowPathList: string[] = this.modeAppPathAllow.split(';');
    for (const allowPath of allowPathList) {
      if (
        this.modeApplication.includes(allowPath) &&
        this.modeApplication.indexOf(allowPath) === 0
      ) {
        isIncluded = true;
      }
    }
    if (!isIncluded) {
      this.modeAppWarnMsg = (
        this.i18n.mission_create.modeAppPathInvalid as string
      ).replace('${path}', this.Axios.getPathString(this.modeAppPathAllow));
      this.modeAppValid = false;
      return;
    }

    // 验证通过
    this.modeApplication = e;
    this.modeAppWarnMsg = '';
    this.modeAppValid = true;
  }
  // 应用参数
  public missionAppParamsChange(e: any): string {
    e = e.trim();
    if (!e) {
      this.modeAppParamsValid = false;
      return (this.modeAppParamsMsg = this.i18n.mission_create.modeAppParams);
    } else {
      this.modeAppParams = e;
      this.modeAppParamsValid = true;
      return (this.modeAppParamsMsg = '');
    }
  }
  public handleAppAndPidDisable(e: any): void {
    const num = this.targetClicked + this.modeClicked;
    switch (num) {
      case 1:
        this.modeAppDisable = e;
        this.modeAppParamsDisable = e;
        break;
      case 2:
        this.modePidDisable = e;
        break;
    }
  }

  // 根据 taskInfo 返回 analysisTarget
  public getAnalysisTarget({ taskInfo }: any) {
    const missAnalysisTarget: any = {
      sys: 'Profile System',
      app: 'Launch Application',
      pid: 'Attach to Process',
    };
    if (taskInfo['analysis-type'] === 'miss_event') {
      return missAnalysisTarget[taskInfo.task_param.target];
    } else {
      return taskInfo['analysis-target'] || taskInfo.analysisTarget;
    }
  }

  // 根据 taskInfo 返回分析类型
  public getAnalysisType({ taskInfo }: any) {
    return taskInfo['analysis-type'] || taskInfo.analysisType;
  }

  public open(item: any) {
    this.isModifySchedule = true;
    this.scheduleTaskType =
      item.data['analysis-type'] || item.data.analysisType;
    if (
      this.scheduleTaskType === 'memory_diagnostic' ||
      this.scheduleTaskType === 'netio_diagnostic' ||
      this.scheduleTaskType === 'storageio_diagnostic'
    ) {
      this.showDiagnose = true;
    }
    setTimeout(() => {
      this.modal.open();
    }, 0);
    const id = item.taskId;
    this.projectId = item.projectId;
    const url = this.isDiagnose
      ? `memory-project/${encodeURIComponent(this.projectId)}/info/`
      : `projects/${encodeURIComponent(this.projectId)}/info/`;
    this.Axios.axios.get(url).then((res: any) => {
      this.nodeConfigShow = res.data.nodeList.length > 1;
    });

    // IO 分析和 HPC 分析需要该变量的支持，以解决： 通过非“取消”按钮关闭一个预约任务修改界面弹框后，
    // 修改另一个析预约任务时，还显示前一个预约任务的信息。
    this.scheduleTaskId = item.taskId;
    this.modelReopenSymbol = false;
    setTimeout(() => {
      this.modelReopenSymbol = true;
    });

    if (id >= 0) {
      this.Axios.axios
        .get(`/schedule-tasks/${encodeURIComponent(id)}/`)
        .then((res: any) => {
          const taskInfo = JSON.parse(res.data.taskInfo);
          const taskData1 = JSON.parse(res.data.taskInfo);
          taskData1.editScheduleTask = true;
          taskData1.scheduleTaskId = id;
          taskData1.projectName =
            taskData1.projectname || taskData1.projectName;
          taskData1.projectId = this.projectId;
          this.showTaskData = Object.assign({}, taskData1, res.data);
          this.projectName = taskData1.projectName;
          const analysisTarget1 = this.getAnalysisTarget({ taskInfo });
          this.targetClicked = [undefined, 'Profile System'].includes(
            analysisTarget1
          )
            ? 0
            : 1;
          this.modeClicked = analysisTarget1 === 'Attach to Process' ? 1 : 0;
          const analysisType1 = this.getAnalysisType({ taskInfo });

          this.analysisTypesDir.forEach((item1: any, index: any) => {
            if (
              item1.type === analysisType1 ||
              (item1.typeList && item1.typeList.includes(analysisType1))
            ) {
              this.typeClicked = index;
            }
          });
          setTimeout(() => {
            this.getTemplateData(
              taskInfo,
              true,
              this.showTaskData.scheduleTaskId
            );
          }, 500);
        });
    }
    const taskData = item.data;
    if (Object.prototype.hasOwnProperty.call(taskData, 'sceneSolution')) {
      this.scenes = taskData.sceneSolution;
    } else {
      this.scenes = AnalysisScene.General;
    }
    const analysisType = taskData['analysis-type'] || taskData.analysisType;

    const taskAnalysisTypeArr = [
      'process-thread-analysis',
      'C/C++ Program',
      'microarchitecture',
      'resource_schedule',
      'system_lock',
    ];
    // 所有任务字典
    const analysisTypesDir: any = {
      'process-thread-analysis': this.i18n.mission_create.process,
      'C/C++ Program': this.i18n.mission_create.cPlusPlus,
      microarchitecture: this.i18n.mission_create.structure,
      resource_schedule: this.i18n.mission_create.resSchedule,
      system_lock: this.i18n.mission_create.lock,
    };
    if (analysisType === 'system') {
      this.configList = [
        {
          key: this.i18n.task_name,
          text: taskData.taskname,
        },
        {
          // 分析对象
          key: this.i18n.mission_create.analysisTarget,
          text: this.i18n.common_term_projiect_task_system,
          requier: '',
        },
        {
          // 分析类型
          key: this.i18n.common_term_task_analysis_type,
          text: this.i18n.mission_create.sysPro,
          requier: '',
        },
      ];
    } else if (taskAnalysisTypeArr.includes(analysisType)) {
      this.configList = [
        {
          // 任务名称
          key: this.i18n.common_term_task_name,
          text: taskData.taskname || taskData.taskName,
          requier: '',
        },
        {
          // 分析对象
          key: this.i18n.mission_create.analysisTarget,
          text:
            (taskData['analysis-target'] || taskData.analysisTarget) ===
            'Profile System'
              ? this.i18n.common_term_projiect_task_system
              : this.i18n.common_term_task_crate_path,
          requier: '',
        },
        {
          // 分析类型
          key: this.i18n.common_term_task_analysis_type,
          text: analysisTypesDir[analysisType],
          requier: '',
        },
      ];
      if (
        (taskData['analysis-target'] || taskData.analysisTarget) !==
        'Profile System'
      ) {
        this.configList.push({
          // 模式, 系统无此项
          key: this.i18n.mission_create.mode,
          text: taskData['analysis-target'] || taskData.analysisTarget,
          requier: '',
        });
      }
    } else if (
      ['mem_access', 'miss_event', 'falsesharing'].includes(analysisType)
    ) {
      // 访存分析
      let taskAnalysisType: string;
      let taskAnalysisTarget: string;
      let taskAnalysisMode: string;
      if (taskData['analysis-type'] === 'mem_access') {
        // 访存统计
        taskAnalysisType = this.i18n.mission_create.mem;
        taskAnalysisTarget = this.i18n.common_term_projiect_task_system;
        taskAnalysisMode = 'Profile System';
      } else if (taskData['analysis-type'] === 'miss_event') {
        // miss事件
        taskAnalysisType = this.i18n.mission_create.missEvent;
        taskAnalysisTarget =
          taskData.task_param.target === 'sys'
            ? this.i18n.common_term_projiect_task_system
            : this.i18n.common_term_task_crate_path;
        switch (taskData.task_param.target) {
          case 'sys':
            taskAnalysisMode = 'Profile System';
            break;
          case 'app':
            taskAnalysisMode = 'Launch Application';
            break;
          case 'pid':
            taskAnalysisMode = 'Attach to Process';
            break;
          default:
            break;
        }
      } else if (taskData['analysis-type'] === 'falsesharing') {
        // 伪共享
        taskAnalysisType = this.i18n.mission_create.falsesharing;
        taskAnalysisTarget =
          taskData['analysis-target'] === 'Profile System'
            ? this.i18n.common_term_projiect_task_system
            : this.i18n.common_term_task_crate_path;
        taskAnalysisMode = taskData['analysis-target'];
      }

      this.configList = [
        {
          // 任务名称
          key: this.i18n.common_term_task_name,
          text: taskData.taskname || taskData.taskName,
          requier: '',
        },
        {
          // 分析对象
          key: this.i18n.mission_create.analysisTarget,
          text: taskAnalysisTarget,
          requier: '',
        },
        {
          // 分析类型
          key: this.i18n.common_term_task_analysis_type,
          text: taskAnalysisType,
          requier: '',
        },
      ];
      if (taskAnalysisMode !== 'Profile System') {
        this.configList.push({
          // 模式, 系统无此项
          key: this.i18n.mission_create.mode,
          text: taskAnalysisMode,
          requier: '',
        });
      }
    }
  }

  // 导入模板传值
  public getTemplateData(e: any, pre?: boolean, id?: number): void {
    this.missionName = e.taskname || e.taskName;
    this.type = this.analysisTypesDir[this.typeClicked].type;
    this.missionNameChange(this.missionName); // 导入模板时，任务名称做一次校验
    const child: any = {
      system: this.performance,
      resource_schedule: this.schedule,
      microarchitecture: this.structure,
      mem_access_analysis: this.mem,
      'process-thread-analysis': this.process,
      'C/C++ Program': this.cplusplus,
      system_lock: this.lock,
    };
    if (child?.[this.type]?.scheduleTaskId != null) {
      child[this.type].scheduleTaskId = id;
    }

    const type1 = ['system', 'process-thread-analysis'];
    if (type1.indexOf(this.type) > -1) {
      this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
      this.strategy.IMPORTDATA(child[this.type], e);
      this.strategy.importInit_process(this, e);
      return;
    } else {
      switch (this.type) {
        case 'microarchitecture':
          this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
          this.strategy.IMPORTINIT_NEW(
            this,
            e,
            this.targetClicked,
            this.modeClicked
          );
          this.strategy.IMPORTDATA(child[this.type], e);
          break;
        case 'mem_access_analysis':
          const getParams = (taskInfo: any) => {
            const analysisType = this.getAnalysisType({ taskInfo });
            if (analysisType === 'miss_event') {
              return {
                appDir: taskInfo.task_param.app,
                appParameters: taskInfo.task_param.appArgs,
                targetPid: taskInfo.task_param.pid,
                processName: taskInfo.task_param.process_name,
              };
            } else {
              return {
                appDir: taskInfo.appDir,
                appParameters: taskInfo.appParameters,
                targetPid: taskInfo.pid,
                processName: taskInfo.process_name,
              };
            }
          };

          const { appDir, appParameters, targetPid, processName } =
            getParams(e);
          this.strategy.importInit_miss(
            this,
            appDir,
            appParameters,
            targetPid,
            processName
          );

          this.mem.init({
            type: this.actionType || 'create',
            params: e,
            scheduleTaskId: id,
          });
          break;
        case 'ioperformance':
          this.strategy.importInit_io(this, e);
          break;
        case 'resource_schedule':
          this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
          this.strategy.importInit_resource(this, e);
          this.strategy.IMPORTDATA(child[this.type], e);
          break;
        default:
          this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
          this.strategy.IMPORTINIT(
            this,
            e,
            this.targetClicked,
            this.modeClicked
          );
          this.strategy.IMPORTDATA(child[this.type], e);
          break;
      }
    }
  }

  // 保存模板
  public saveTemplate(e: any): void {
    this.keepData = e;
    this.keepModal.openModal();
  }
  // 任务名称校验
  public missionNameChange(e: any): string {
    const reg = new RegExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$');
    this.missionNameValid = reg.test(e);
    if (!this.missionNameValid) {
      if (!e) {
        return (this.missionNameWarnMsg =
          this.i18n.mission_create.missionNameWarn);
      } else {
        return (this.missionNameWarnMsg = this.i18n.validata.task_name_rule);
      }
    } else {
      return (this.missionNameWarnMsg = '');
    }
  }

  // 更新预约任务数据,再次向上级组件传值
  public handleUpdataPretable(strings: any): void {
    // on修改成功
    this.sendPretable.emit(strings);
    this.close();
  }
  public close() {
    this.showDiagnose = false;
    this.modal.close();
  }
  // 处理采集日期
  public handleColectDate(obj: any) {
    return obj.cycle
      ? obj.cycleStart && obj.cycleStart
        ? obj.cycleStart.split('-').join('/') +
          '一' +
          obj.cycleStop.split('-').join('/')
        : ''
      : obj.appointment
      ? obj.appointment.split('-').join('/')
      : '';
  }
  handleObj(val: any) {
    let arr = [];
    arr = val.type.map((item: any) => {
      return this.taskType[item];
    });
    return arr.join(',');
  }
  public onModeClick(index: any): void {
    if (this.actionType === 'edit' || this.actionType === 'restart') {
      return;
    }
    this.modeClicked = index;
    this.typeClicked =
      index === 0
        ? this.analysisTypeLaunch[0].id
        : this.analysisTypeAttach[0].id;
    this.typeMsg =
      this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
  }

  public handleNodeEmitIndex(e: any) {
    if (e?.param?.['analysis-type'] === AnalysisType.Hpc) {
      this.hpcNodeParams.open(e);
      return;
    }
    const child: any = {
      c_profile: this.cProfile,
      c_launch: this.cLaunch,
      c_attach: this.cAttach,
      l_attach: this.lAttach,
      l_profile: this.lProfile,
      l_launch: this.lLaunch,
      r_attach: this.rAttach,
      r_profile: this.rProfile,
      r_launch: this.rLaunch,
      m_attach: this.sAttach,
      m_profile: this.sProfile,
      m_launch: this.sLaunch,
      d_profile: this.dProfile,
      d_launch: this.diagnose,
    };
    child[e.key].open(e);
  }
  public handleConfigData(e: any) {
    this.nodeConfigedData = e;
  }
  public closePopDetail(e: any) {
    if (this.isDiagnose) {
      this.showDiagnose = false;
    }
    this.sendPretable.emit();
  }

  get calcLabelWidth() {
    return (drawerLevel: any) =>
      parseInt(this.labelWidth, 10) - (drawerLevel || 0) * 32 + 'px';
  }
}
