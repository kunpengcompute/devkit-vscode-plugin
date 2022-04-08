import {
  Component, OnInit, Output, ViewChild, Input, SecurityContext, EventEmitter, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { ScheduleTaskService } from 'projects/sys/src-web/app/service/schedule-task.service';
import { TaskService } from 'projects/sys/src-web/app/service/taskService/nodeList.service';
import { ScheduleUpdateService } from 'projects/sys/src-web/app/service/schedule-update.service';
import { AnalysisScene } from 'projects/sys/src-web/app/domain';
import { IconStatus } from 'projects/sys/src-web/app/icon-lib/domain';
import { Subscription } from 'rxjs';
import { CustomValidatorsService } from '../service';
import { INodeInfo } from 'projects/sys/src-web/app/mission-create/domain';

interface AnalysisType {
  [key: string]: any;
}

@Component({
  selector: 'app-mission-create',
  templateUrl: './mission-create.component.html',
  styleUrls: ['./mission-create.component.scss']
})
export class MissionCreateComponent implements OnInit, OnDestroy {
  constructor(
    public I18n: I18nService,
    public Axios: AxiosService,
    private fb: FormBuilder,
    public scheduleTaskServer: ScheduleTaskService,
    public taskServices: TaskService,
    private scheduleUpdateService: ScheduleUpdateService,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    public userGuide: UserGuideService,
    public customValidatorsService: CustomValidatorsService
  ) {
    this.i18n = I18n.I18n();
    this.typeTitle = [this.i18n.mission_create.universal_title
      , this.i18n.mission_create.system_title, this.i18n.mission_create.dedicated_title];
    this.missionNameNotice = this.i18n.mission_create.missionNameNotice;
    this.analysisTargets = [
      {
        iconName: 'system',
        name: this.i18n.common_term_projiect_task_system,
      },
      {
        iconName: 'application',
        name: this.i18n.common_term_task_crate_path,
      },
    ];
    // 所有任务字典
    this.analysisTypesDir = [
      {
        iconName: 'panoramicAnalysis',
        name: this.i18n.sys_summary.cpupackage_tabel.sysPro,
        type: 'system',
      },
      {
        iconName: 'processAnalysis',
        name: this.i18n.mission_create.process,
        type: 'process-thread-analysis',
      },
      {
        iconName: 'cplusAnalysis',
        name: this.i18n.mission_create.cPlusPlus,
        type: 'C/C++ Program',
      },
      {
        iconName: 'microAnalysis',
        name: this.i18n.mission_create.structure,
        type: 'microarchitecture',
      },
      {
        iconName: 'memAccessAnalysis',
        name: this.i18n.mission_modal.memAccessAnalysis,
        type: 'mem_access_analysis',
        typeList: ['mem_access', 'miss_event', 'falsesharing'],
      },
      {
        iconName: 'ioAnalysis',
        name: this.i18n.mission_create.io,
        type: 'ioperformance',
      },
      {
        iconName: 'resourceAnalysis',
        name: this.i18n.mission_create.resSchedule,
        type: 'resource_schedule',
      },
      {
        iconName: 'lockAnalysis',
        name: this.i18n.mission_create.lock,
        type: 'system_lock',
      },
      {
        iconName: 'hpcAnalysis',
        name: this.i18n.mission_create.hpc_analysis,
        type: 'hpc_analysis'
      }
    ];
    this.modeList = [
      {
        name: this.i18n.mission_create.launchApp,
        value: 0,
        display: true
      },
      {
        name: this.i18n.mission_create.attachPid,
        value: 1,
        display: true
      }
    ];
    this.typeMsgInfo = {
      system: this.i18n.mission_create.sysProMsg,
      resource_schedule: this.i18n.mission_create.resScheduleMsg,
      microarchitecture: this.i18n.mission_create.structureMsg,
      mem_access_analysis: this.i18n.mission_create.memAccessAnalysisMsg,
      'process-thread-analysis': this.i18n.mission_create.processMsg,
      'C/C++ Program': this.i18n.mission_create.cPlusPlusMsg,
      system_lock: this.i18n.mission_create.lockMsg,
      ioperformance: this.i18n.mission_create.ioMsg,
      hpc_analysis: this.i18n.mission_create.hpcMsg,
    };
    this.modeAppNotice = this.i18n.common_term_task_type_launch;
    this.modePidNotice = this.i18n.common_term_task_type_attach;
    this.modeAppHolder = this.i18n.mission_create.modeAppHolder;
    this.modePidHolder = this.i18n.mission_create.modePidHolder;
    this.modeAppParamsHolder = this.i18n.mission_create.modeAppParamsHolder;

    this.pidProcessGroup = this.fb.group({
      pidProcess: [],
      pidProcessJava: [],
    });

    this.pidProcessGroup.controls.pidProcess.valueChanges.subscribe((pidProcess) => {
      if (pidProcess != null) {
        this.modePid = pidProcess.pid || '';
        this.modeProcess = pidProcess.process || '';
        this.cdr.detectChanges();
      }
    });

    this.pidProcessGroup.controls.pidProcessJava.valueChanges.subscribe((pidProcessJava) => {
      if (pidProcessJava != null) {
        this.modePidJava = pidProcessJava.pid || '';
        this.modeProcessJava = pidProcessJava.process || '';
        this.cdr.detectChanges();
      }
    });

    // FIXME 控件封装的不成熟导致这里的逻辑过于复杂
    this.pidProcessGroup.controls.pidProcess.statusChanges.subscribe(status => {
      this.modePidValid = (status === 'DISABLED' || status === 'VALID' || this.prevPidProcessStatus === 'DISABLED');
      this.cdr.detectChanges();
      this.prevPidProcessStatus = status;
    });
  }
  @Output() private closeIndexTab = new EventEmitter<any>();
  @Input() projectName: any;
  @Input() actionType: any;
  @Input() taskDetail: any;
  @Input() refreshItem: any;
  @Input() scenes: AnalysisScene;
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
  @ViewChild('template') taskTemplate: any;
  @ViewChild('pretable') pretable: any;
  @ViewChild('cProfile') cProfile: any;
  @ViewChild('cLaunch') cLaunch: any;
  @ViewChild('cAttach') cAttach: any;
  @ViewChild('lAttach') lAttach: any;
  @ViewChild('lProfile') lProfile: any;
  @ViewChild('lLaunch') lLaunch: any;
  @ViewChild('rAttach') rAttach: any;
  @ViewChild('rLaunch') rLaunch: any;
  @ViewChild('rProfile') rProfile: any;
  @ViewChild('mAttach') mAttach: any;
  @ViewChild('mProfile') mProfile: any;
  @ViewChild('mLaunch') mLaunch: any;

  @ViewChild('dProfile') dProfile: any;
  public restartTaskInfo: {
    [key: string]: any
  } = {};

  public modePidJava = '';
  public modeProcessJava = '';
  public prevPidProcessStatusJava = '';
  public objectChange = true;

  public ieFocusCountName = 0; // 任务名称IE浏览器自动聚焦计数
  public ieFocusCountApp = 0; // 任务应用路径IE浏览器自动聚焦计数
  public ieFocusCountAppParams = 0; // 任务应用参数IE浏览器自动聚焦计数
  public ieFocusCountAppPid = 0; // 任务PID IE浏览器自动聚焦计数
  public i18n: any;
  public labelWidth = '240px';
  public missionName: string; // 任务名称
  public missionNameNotice: string;
  public missionNameValid = false;  // 任务名称是否合法
  public missionNameWarnMsg: string;  // 不合法时输出提示
  public misssionNameAble = false; // 任务名称是否被禁用
  public analysisTargets = new Array(); // 分析对象数据
  public targetClicked = 0; // 分析对象

  public modeClicked = 0;  // 模式
  public midModeClicked = 0; // 对象切换暂存模式选择
  public modeList = new Array();    // 模式列表
  public modeAppNotice: string;
  public modePidNotice: string;
  public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/
  public modeApplication = '';  // 应用或应用路径
  public switchState = false;
  private switchStateCopy = false;
  public modeApplicationUser = '';  // 用户名
  public modeAppRunUserValid = true; // 应用运行用户必选校验
  public runUserValid = true;
  public runUserMsg: string;
  public runPasswordValid = true;
  public modeApplicationPassWord = '';
  public modeAppParams: string;
  /** 应用，Attack to Process: Pid 的值 */
  public modePid: string;
  /** 应用，Attack to Process: 程序名称 */
  public modeProcess: string;
  /** 应用，Attack to Process: Pid 的值的验证是否通过 */
  public modePidValid = false;
  public modeAppHolder: string;    // 应用的placeholder
  public modeAppParamsHolder: string;
  public modePidHolder: string;    // pid的placeholder
  public modeAppWarnMsg: string;  // 校验之后的信息
  public modePidWarnMsg: string;
  public modeAppParamsMsg: string;
  public modeAppValid = false;   // 应用路径是否校验成功
  public modeAppParamsValid = false;
  public modeAppDisable = false;
  public applicationPathDisable = false; // 应用路径禁用
  public modePidDisable = false;
  public modeAppParamsDisable = false;
  public userGuideStep: Subscription;
  public nodeInfo: INodeInfo[];

  private prevPidProcessStatus = '';
  public analysisTypes = new Array(); // 分析类型数据
  public typeClickedCopy = 0; // 分析类型
  public isShowTip = false; // 是否展示禁用原因
  set typeClicked(val: number) {
    this.typeClickedCopy = val;
    this.setTipHtml();

    this.appPathVildChangeAction();
  }
  get typeClicked() {
    return this.typeClickedCopy;
  }
  public mouseHover = -1; // 鼠标hover变色
  public mouseHoverTarget = -1;
  public type = ''; // 某种任务类型，用于查找模板数据
  public keepData: any; // 保存模板
  public templates: any; // 导入模板
  public missionTypeDir = new Array();

  public analysisTypesDir: any; // 所有任务字典

  public typeTitle: string[];
  public typeTitleHover: number;
  public typeTitleClicked = 0;
  public typeSysKey = ['universal', 'system', 'dedicated'];
  public analysisTypeSys: AnalysisType = {};  // 系统
  public analysisTypeLaunch: AnalysisType = {}; // 应用 拉起应用(launch)
  public analysisTypeAttach: AnalysisType = {}; // 应用 指定进程 (attach)

  public nodeList = false;
  public isEdit = false;
  public isRestart = false;
  public strategy = { // 导入模板
    CHILDACTION(child: any, actionType: string, pre?: boolean, id?: number): void {
      if (pre) {
        child.editScheduleTask = pre;
        child.scheduleTaskId = id;
      }
      child.isRestart = actionType === 'restart';
      child.isEdit = actionType === 'edit';
    },
    IMPORTINIT(self: MissionCreateComponent, e: any, targetClicked: number, modeClicked: number): void {
      const index = targetClicked + modeClicked;
      if (index === 1) {
        self.modeApplication = e['app-dir'];
        self.modeAppParams = e['app-parameters'];
        self.missionAppChange(self.modeApplication);
        self.missionAppParamsChange(self.modeAppParams);
      } else if (index === 2) {
        self.pidProcessGroup.controls.pidProcess.setValue({ pid: e['target-pid'], process: e.process_name });
      } else {
        self.modeApplication = '';
        self.modeAppParams = '';
        self.modePid = null;
      }
    },
    IMPORTINIT_NEW(self: any, e: any, targetClicked: number, modeClicked: number): void {
      const index = targetClicked + modeClicked;
      if (index === 1) {
        self.modeApplication = e.appDir;
        self.modeAppParams = e.appParameters;
        self.missionAppChange(self.modeApplication);
        self.missionAppParamsChange(self.modeAppParams);
      } else if (index === 2) {
        self.pidProcessGroup.controls.pidProcess.setValue({ pid: e.targetPid, process: e.process_name });
      } else {
        self.modeApplication = '';
        self.modeAppParams = '';
        self.modePid = null;
      }
    },
    importInit_miss({ self, appDir, appParameters, targetPid, processName }: any): void {
      const index = self.targetClicked + self.modeClicked;
      if (index === 1) {
        self.modeApplication = appDir;
        self.modeAppParams = appParameters;
        self.missionAppChange(self.modeApplication);
      } else if (index === 2) {
        self.pidProcessGroup.controls.pidProcess.setValue({ pid: targetPid, process: processName });
      } else {
        self.modeApplication = '';
        self.modeAppParams = '';
        self.modePid = null;
      }
    },
    importInit_io(context: MissionCreateComponent, thatMissionData: any): void {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({ pid: '', process: '' });
          break;
        case 1: // launch application
          context.modeApplication = thatMissionData.appDir || '';
          context.modeAppParams = thatMissionData['app-parameters'] || '';
          context.missionAppChange(context.modeApplication);
          break;
        case 2: // attach to process
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: thatMissionData.targetPid || '',
            process: thatMissionData.process_name || ''
          });
          break;
        default:
      }
    },
    importInit_hpc(context: MissionCreateComponent, thatMissionData: any): void {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({ pid: '', process: '' });
          break;
        case 1: // launch application
          context.modeApplication = thatMissionData['app-dir'] || '';
          context.modeAppParams = thatMissionData['app-parameters'] || '';
          context.missionAppChange(context.modeApplication);
          break;
        case 2: // attach to process
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: thatMissionData.targetPid || '',
            process: thatMissionData.process_name || ''
          });
          break;
        default:
      }
    },
    importInit_resource(context: MissionCreateComponent, thatData: any) {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({ pid: '', process: '' });
          break;
        case 1: // launch application
          context.modeApplication = thatData['app-dir'] || '';
          context.modeAppParams = thatData['app-parameters'] || '';
          context.missionAppChange(context.modeApplication);
          break;
        case 2: // attach to process
          context.pidProcessGroup.controls.pidProcess.setValue({
            pid: thatData['target-pid'] || '',
            process: thatData['process-name'] || ''
          });
          break;
        default: break;
      }
    },
    importInit_process(context: MissionCreateComponent, thatMissionData: any): void {
      const index = context.targetClicked + context.modeClicked;
      switch (index) {
        case 0: // system prefile
          context.modeApplication = '';
          context.modeAppParams = '';
          context.pidProcessGroup.controls.pidProcess.setValue({ pid: '', process: '' });
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
            process: thatMissionData.process_name || ''
          });
          break;
        default:
      }
    },
    IMPORTDATA(child: any, e: any): void {
      child.getTemplateData(e);
    }
  };
  public typeMsgInfo: any; // 任务图标下的说明文字列表数据
  public typeMsg: string; // 任务图标下的说明文字
  public systemTip: string; // 全景分析区分场景提示

  public projectId: number;
  public restartAndEditId: number;
  public nodeConfigShow: boolean;
  public nodeConfigName: string;
  public nodeConfigTitle: string;
  public nodeConfigData: any;
  public nodeConfigedData: any;

  /** pid 和 进程名称输入的控件 */
  public pidProcessGroup: FormGroup;

  /** 在应用（分析对象）下，Launch Application模式下，应用输入前的提示 */
  public appPathInputTip = '';
  /** 在应用（分析对象）下，Launch Application模式下，应用输入前的提示显示的控制变量 */
  public isFirstFocusAppPathInput = true;
  /** 应用模式下，应用路径有效性判断的方法。判断时机：失去焦点后。目的为： 控制判断时机，方便调用 */
  public appPathVildBlurAction = () => { };
  /** 应用模式下，应用路径有效性判断的方法。判断时机：内容输入时。目的为： 控制判断时机，方便调用 */
  public appPathVildChangeAction = () => { };

  ngOnInit() {
    let sys: any;
    let launch: any;
    let attach: any;
    if (this.scenes === AnalysisScene.Hpc) {
      sys = {
        universal: [0, 1, 2],
        system: [3, 4, 5],
        dedicated: [6, 7, 8]
      };
      launch = {
        universal: [1, 2],
        system: [3, 4, 5],
        dedicated: [6, 7, 8]
      };
      attach = {
        universal: [1, 2],
        system: [3, 4, 5],
        dedicated: [6, 7, 8]
      };
    } else {
      sys = {
        universal: [0, 1, 2],
        system: [3, 4, 5],
        dedicated: [6, 7]
      };
      launch = {
        universal: [1, 2],
        system: [3, 4, 5],
        dedicated: [6, 7]
      };
      attach = {
        universal: [1, 2],
        system: [3, 4, 5],
        dedicated: [6, 7]
      };
    }
    for (const key of Object.keys(sys)) {
      this.analysisTypeSys[key] = sys[key].map((item: number) => {
        const obj = this.analysisTypesDir[item];
        obj.id = item;
        return obj;
      });
    }
    for (const key of Object.keys(launch)) {
      this.analysisTypeLaunch[key] = launch[key].map((item: number) => {
        const obj = this.analysisTypesDir[item];
        obj.id = item;
        return obj;
      });
    }
    for (const key of Object.keys(attach)) {
      this.analysisTypeAttach[key] = attach[key].map((item: number) => {
        const obj = this.analysisTypesDir[item];
        obj.id = item;
        return obj;
      });
    }

    // 默认选择第一个元素
    this.typeClicked = this.analysisTypeSys.universal[0]?.id || 0;

    // 任务信息
    this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];

    let url = '';
    switch (this.actionType) {
      case 'create':
        this.actionType = 'create';
        this.projectId = this.taskDetail.projectId;
        break;
      case 'edit':
        this.actionType = 'edit';
        this.misssionNameAble = true;
        this.projectId = this.taskDetail.projectId;
        if (this.taskDetail.editScheduleTask) {
          url = `/schedule-tasks/${encodeURIComponent(this.taskDetail.scheduleTaskId)}/`;
          this.Axios.axios.get(url).then((res: any) => {
            const taskInfo = JSON.parse(res.data.taskInfo);

            const analysisTarget = this.getAnalysisTarget({ taskInfo });
            this.targetClicked = [undefined, 'Profile System'].includes(analysisTarget) ? 0 : 1;
            this.modeClicked = analysisTarget === 'Attach to Process' ? 1 : 0;
            const analysisType = this.getAnalysisType({ taskInfo });
            this.getRestartTaskInfo(analysisTarget, analysisType, taskInfo);
            this.analysisTypesDir.forEach((item: any, index: any) => {
              if (item.type === analysisType || item.typeList && item.typeList.includes(analysisType)) {
                this.typeClicked = index;
              }
            });
            setTimeout(() => {
              this.getTemplateData(taskInfo, true, this.taskDetail.scheduleTaskId);
            }, 500);
          });
        } else {
          const typeName = this.taskDetail['analysis-type'] || this.taskDetail.analysisType;
          url = '/tasks/' + encodeURIComponent(this.taskDetail.id) + '/common/configuration/?node-id' +
            '&analysis-type=' + encodeURIComponent(typeName);
          this.projectId = this.taskDetail.parentNode.projectId;
          this.restartAndEditId = this.taskDetail.id;
          this.Axios.axios.get(url).then((res: any) => {
            const data = res.data;
            const analysisTarget = this.getAnalysisTarget({ taskInfo: data });
            this.targetClicked = [undefined, 'Profile System'].includes(analysisTarget) ? 0 : 1;
            this.modeClicked = analysisTarget === 'Attach to Process' ? 1 : 0;
            const analysisType = this.getAnalysisType({ taskInfo: data });
            this.getRestartTaskInfo(analysisTarget, analysisType, data);
            this.analysisTypesDir.forEach((item: any, index: any) => {
              if (item.type === analysisType || item.typeList && item.typeList.includes(analysisType)) {
                this.typeClicked = index;
              }
            });
            setTimeout(() => {
              this.getTemplateData(res.data);
            }, 500);

          });
        }
        break;
      case 'restart':
        this.actionType = 'restart';
        this.misssionNameAble = true;
        const type = this.taskDetail['analysis-type'] || this.taskDetail.analysisType;
        url = '/tasks/' + encodeURIComponent(this.taskDetail.id) + '/common/configuration/?node-id' +
          '&analysis-type=' + encodeURIComponent(type);
        this.projectId = this.taskDetail.isFromTuningHelper ? this.taskDetail.projectId
        : this.taskDetail.parentNode.projectId;
        this.restartAndEditId = this.taskDetail.id;
        this.Axios.axios.get(url).then((res: any) => {
          const data = res.data;

          const analysisTarget = this.getAnalysisTarget({ taskInfo: data });
          this.targetClicked = [undefined, 'Profile System'].includes(analysisTarget) ? 0 : 1;
          this.modeClicked = analysisTarget === 'Attach to Process' ? 1 : 0;
          const analysisType = this.getAnalysisType({ taskInfo: data });
          this.getRestartTaskInfo(analysisTarget, analysisType, data);
          this.analysisTypesDir.forEach((item: any, index: any) => {
            if (item.type === analysisType || item.typeList && item.typeList.includes(analysisType)) {
              this.typeClicked = index;
            }
          });
          setTimeout(() => {
            this.getTemplateData(res.data);
          }, 500);
        });
        break;
    }
    this.Axios.axios.get(`projects/${encodeURIComponent(this.projectId)}/info/`).then((res: any) => {
      this.nodeConfigShow = res.data.nodeList.length > 1;
      const data: INodeInfo[] = [];
      res.data.nodeList.forEach((item: any) => {
        data.push({
          nodeId: item.id,
          nickName: item.nickName,
          nodeIp: item.nodeIp, // 节点IP
          nodeStatus: item.nodeStatus,
          taskParam: {
            status: false,
          },
        });
      });
      this.nodeInfo = data;
    });

    // 获取 应用路径
    this.Axios.axios.get('config/system/')
      .then(({ data }: any) => {
        this.modeAppPathAllow = data.TARGET_APP_PATH == null ? '' : data.TARGET_APP_PATH;
        this.appPathInputTip
          = this.i18n.mission_create.modeAppPathSaftWarn
          + '<br/>'
          + (this.i18n.mission_create.modeAppPathInvalid as string)
            .replace(
              '${path}',
              this.domSanitizer.sanitize(SecurityContext.HTML, this.Axios.getPathString(this.modeAppPathAllow)));
      });

    this.userGuideStep = this.userGuide.userGuideStep.subscribe((str) => {
      if (str.indexOf('Task_Demo') > -1) {
        this.missionName = str;
        this.missionNameValid = true;
        this.missionNameChange(this.missionName);
      } else if (str === 'user-guide-taskname') {
        this.userGuide.showMask('select-analysis-target-type');
      }
    });

    // 来自调优助手的创建重启任务
    if (this.taskDetail.isFromTuningHelper) {
      if (this.targetClicked === 0) {  // 系统
        this.selectAnalysisType(this.analysisTypeSys);
      } else { // 应用类型
        this.selectAnalysisType(this.analysisTypeLaunch);
      }
    }
  }

  private setTipHtml() {
    let finalPathAllow: any = this.modeAppPathAllow;
    // 应用运行用户选中
    if (!this.switchState) {
      const defaultPathArr = ['/opt/', '/home/'];
      const getPathArr = this.modeAppPathAllow.split(';');
      finalPathAllow = defaultPathArr.filter(n => getPathArr.includes(n)).join(';');
    }
    this.appPathInputTip
      = this.i18n.mission_create.modeAppPathSaftWarn
      + '<br/>'
      + (this.i18n.mission_create.modeAppPathInvalid as string).replace(
        '${path}',
        this.domSanitizer.sanitize(SecurityContext.HTML, this.Axios.getPathString(finalPathAllow))
      );
  }

  /**
   * 选中分析类型
   * @param data analysisTypeLaunch or analysisTypeSys
   */
  private selectAnalysisType(data: any) {
    Object.values(data).forEach((arr: any, index: number) => {
      arr.forEach((item: any) => {
        if (item.type === this.taskDetail.analysisType || item?.typeList?.includes(this.taskDetail.analysisType)) {
          this.typeTitleClicked = index;
          this.typeClicked = item.id;
        }
      });
    });
  }

  private getRestartTaskInfo(analysisTarget: string, analysisType: string, taskInfo: any) {
    const fetchTypeList = [ 'mem_access', 'miss_event', 'falsesharing'];
    const taskType = this.analysisTypesDir.find((item: any) => {
      const typeList = item.typeList || [];
      return item.type === analysisType || typeList.includes(analysisType);
    });
    if (analysisTarget === 'Profile System') {
      this.restartTaskInfo = {
        analysisTarget: {
          key: this.i18n.mission_create.analysisTarget,
          value: this.i18n.common_term_projiect_task_system + this.i18n.common_term_sign_left
            + analysisTarget + this.i18n.common_term_sign_right,
          isHaveImg: true,
          msg: this.i18n.common_term_task_type_profile
        },
        analysisType: {
          key: this.i18n.common_term_task_analysis_type,
          value: fetchTypeList.includes(analysisType) ? taskType.name + this.i18n.common_term_sign_left
            + this.getfetchTask(analysisType) + this.i18n.common_term_sign_right : taskType.name,
          isHaveImg: true,
          msg: this.typeMsg
        }
      };
    } else if (analysisTarget === 'Launch Application') {
      this.restartTaskInfo = {
        analysisTarget: {
          key: this.i18n.mission_create.analysisTarget,
          value: this.i18n.common_term_task_crate_path + this.i18n.common_term_sign_left
            + analysisTarget + this.i18n.common_term_sign_right,
          isHaveImg: true,
          msg: this.i18n.common_term_task_type_launch
        },
        analysisType: {
          key: this.i18n.common_term_task_analysis_type,
          value: fetchTypeList.includes(analysisType) ? taskType.name + this.i18n.common_term_sign_left
            + this.getfetchTask(analysisType) + this.i18n.common_term_sign_right : taskType.name,
          isHaveImg: true,
          msg: this.typeMsg
        }
      };
    } else if (analysisTarget === 'Attach to Process') {
      this.restartTaskInfo = {
        analysisTarget: {
          key: this.i18n.mission_create.analysisTarget,
          value: this.i18n.common_term_task_crate_path + this.i18n.common_term_sign_left
            + analysisTarget + this.i18n.common_term_sign_right,
          isHaveImg: true,
          msg: this.i18n.common_term_task_type_attach
        },
        analysisType: {
          key: this.i18n.common_term_task_analysis_type,
          value: fetchTypeList.includes(analysisType) ? taskType.name + this.i18n.common_term_sign_left
            + this.getfetchTask(analysisType) + this.i18n.common_term_sign_right : taskType.name,
          isHaveImg: true,
          msg: this.typeMsg
        }
      };
    }
    if (fetchTypeList.indexOf(analysisType) > -1){
      this.restartTaskInfo.analysisType.value = taskType.name;
    }
  }

  private getfetchTask(analysisType: string) {
    switch (analysisType) {
      case 'mem_access': return this.i18n.mission_create.mem;
      case 'miss_event': return this.i18n.mission_create.missEvent;
      case 'falsesharing': return this.i18n.mission_create.falsesharing;
      default: break;
    }
  }

  ngOnDestroy() {
    if (this.userGuideStep) {
      this.userGuideStep.unsubscribe();
    }
  }
  public getAnalysisType({ taskInfo }: any) {
    return taskInfo['analysis-type'] || taskInfo.analysisType;
  }

  public getAnalysisTarget({ taskInfo }: any) {
    const missAnalysisTarget: any = {
      sys: 'Profile System',
      app: 'Launch Application',
      pid: 'Attach to Process'
    };
    if (taskInfo['analysis-type'] === 'miss_event') {
      return missAnalysisTarget[taskInfo.task_param.target] || 'Profile System';
    } else {
      return taskInfo['analysis-target'] || taskInfo.analysisTarget || 'Profile System';
    }
  }

  // 分析对象点击事件
  public onTargetClick(index: any): void {
    this.ieFocusCountApp = 0;
    this.ieFocusCountAppParams = 0;
    this.ieFocusCountAppPid = 0;
    // 应用运行用户  密码清除
    this.modeApplicationPassWord = '';
    if ((this.actionType === 'edit' || this.actionType === 'restart')) {
      return;
    }
    this.objectChange = false;
    this.targetClicked = index;
    if (index === 0) {
      this.midModeClicked = this.modeClicked;
      this.modeClicked = 0;
      this.switchStateCopy = this.switchState;
      this.switchState = false;
    } else {
      this.modeClicked = this.midModeClicked;
      this.switchState = this.switchStateCopy;
    }
    // 分析对象从系统切换到应用时特殊处理
    if (index !== 0 && this.typeClicked === 0) {
      this.typeClicked = 1;
    }
    this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];

    setTimeout(() => {
      this.objectChange = true;
    }, 0);

    // 来自调优助手的创建重启任务
    if (this.taskDetail.isFromTuningHelper) {
      if (this.targetClicked === 0) {  // 系统
        this.selectAnalysisType(this.analysisTypeSys);
      } else {
        this.selectAnalysisType(this.analysisTypeLaunch);
      }
    }
  }
  public onModeClick(index: any): void {
    if (index) {
      this.switchStateCopy = this.switchState;
      this.switchState = false;
    } else {
      this.switchState = this.switchStateCopy;
      this.modeAppRunUserValid = Boolean(!this.switchState);
    }
    this.modeAppDisable = false;
    this.pidProcessGroup.controls.pidProcess.enable();
    // 应用运行用户  密码清除
    this.modeApplicationPassWord = '';
    this.ieFocusCountApp = 0;
    this.ieFocusCountAppParams = 0;
    this.ieFocusCountAppPid = 0;
    if ((this.actionType === 'edit' || this.actionType === 'restart')) {
      return;
    }
    this.objectChange = false;
    this.modeClicked = index;
    this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
    setTimeout(() => {
      this.objectChange = true;
    }, 0);
  }
  // 分析类型点击变色
  public onTypeClick(index: any): void {
    if (this.taskDetail.isFromTuningHelper) {
      return;
    }

    if ((this.actionType === 'edit' || this.actionType === 'restart')) {
      return;
    }
    if (index !== this.typeClicked) {
      // 切换任务，初始化nodeconfig信息
      this.nodeConfigedData = undefined;
    }
    const id = this.typeClicked;
    this.typeClicked = index;
    if (index < 3) {
      this.typeTitleClicked = 0;
    } else if (index < 6) {
      this.typeTitleClicked = 1;
    } else if (index < 9) {
      this.typeTitleClicked = 2;
    }
    this.hanldeClear(id);
    this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
    if (this.modeClicked === 0 && this.analysisTypesDir[this.typeClicked].type !== 'hpc_analysis') {
      this.modeAppDisable = false;
      this.isShowTip = false;
    }

  }
  /**
   * 处理打开页面IE自动聚焦触发的校验
   */

  // 任务名称校验
  public missionNameChange(missionName: string): any {
    missionName = missionName.trim();
    const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
    if (isIE11 && sessionStorage.getItem('language') === 'zh-cn') {
      this.ieFocusCountName++;
      if (this.ieFocusCountName < 3) {
        return;
      }
    }
    const reg = new RegExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$');
    this.missionNameValid = reg.test(missionName);
    if (!this.missionNameValid) {
      if (!missionName) {
        return this.missionNameWarnMsg = this.i18n.mission_create.missionNameWarn;
      } else {
        return this.missionNameWarnMsg = this.i18n.validata.task_name_rule;
      }
    } else {
      return this.missionNameWarnMsg = '';
    }
  }

  // 应用路径校验(输入时)
  public missionAppChange(e: any): any {
    this.isFirstFocusAppPathInput = false;
    const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
    e = this.modeApplication ? this.modeApplication.toString().trim() : ''; // 去掉字符串的头尾空格

    this.appPathVildChangeAction = () => {
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
        if (this.modeApplication.includes(allowPath) && this.modeApplication.indexOf(allowPath) === 0) {
          isIncluded = true;
        }
      }
      if (!isIncluded) {
        this.modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace('${path}',
          this.Axios.getPathString(this.modeAppPathAllow));
        this.modeAppValid = false;
        return;
      }

      // 验证通过
      this.modeApplication = e;
      this.modeAppWarnMsg = '';
      this.modeAppValid = true;
    };
    this.appPathVildChangeAction();
  }

  // 应用参数
  public missionAppParamsChange(e: any): any {
    const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
    if (isIE11) {
      this.ieFocusCountAppParams++;
      if (this.ieFocusCountAppParams < 3) {
        return;
      }
    }
    e = e.trim();
    if (!e) {
      this.modeAppParamsValid = false;
      return this.modeAppParamsMsg = this.i18n.mission_create.modeAppParams;
    } else {
      this.modeAppParams = e;
      this.modeAppParamsValid = true;
      return this.modeAppParamsMsg = '';
    }
  }
  // 保存模板
  public saveTemplate(e: any): void {
    this.keepData = e;
    this.keepModal.openModal();
  }
  // 导入模板
  public importTemplate(): void {
    this.type = this.analysisTypesDir[this.typeClicked].type;
    this.taskTemplate.open({
      type: this.type,
      typeList: this.analysisTypesDir[this.typeClicked].typeList,
    });
  }
  // 导入模板传值
  public getTemplateData(e: any, pre?: boolean, id?: number): void {
    this.missionName = e.taskname || e.taskName;
    this.type = this.analysisTypesDir[this.typeClicked].type;
    this.missionNameChange(this.missionName); // 导入模板时，任务名称做一次校验
    this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
    const child: any = {
      system: this.performance,
      resource_schedule: this.schedule,
      microarchitecture: this.structure,
      mem_access_analysis: this.mem,
      'process-thread-analysis': this.process,
      'C/C++ Program': this.cplusplus,
      system_lock: this.lock,
    };

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
          this.strategy.IMPORTINIT_NEW(this, e, this.targetClicked, this.modeClicked);
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

          const { appDir, appParameters, targetPid, processName } = getParams(e);
          this.strategy.importInit_miss({ self: this, appDir, appParameters, targetPid, processName });

          this.mem.init({
            type: this.actionType || 'create',
            params: e,
            scheduleTaskId: id
          });
          break;
        case 'ioperformance':
          this.strategy.importInit_io(this, e);
          break;
        case 'hpc_analysis':
          this.strategy.importInit_hpc(this, e);
          break;
        case 'resource_schedule':
          this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
          this.strategy.importInit_resource(this, e);
          this.strategy.IMPORTDATA(child[this.type], e);
          break;
        default:
          this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
          this.strategy.IMPORTINIT(this, e, this.targetClicked, this.modeClicked);
          this.strategy.IMPORTDATA(child[this.type], e);
          break;
      }
    }

  }
  public mouseEnterTypeChange(i: number): void {
    if (this.taskDetail.isFromTuningHelper) {
      return;
    }
    if ((this.actionType === 'edit' || this.actionType === 'restart')) {
      return;
    }
    this.typeTitleHover = i;
  }
  // 鼠标hover变色
  public mouseEnterChange(e: any): void {
    if (this.taskDetail.isFromTuningHelper) {
      return;
    }
    if ((this.actionType === 'edit' || this.actionType === 'restart')) {
      return;
    }
    this.mouseHover = e;
    if (e < 3) {
      this.typeTitleHover = 0;
    } else if (e < 6) {
      this.typeTitleHover = 1;
    } else if (e < 9) {
      this.typeTitleHover = 2;
    }
  }
  public mouseLeaveChange(): void {
    this.mouseHover = -1;
    this.typeTitleHover = -1;
  }
  public mouseLeaveTypeChange(): void {
    this.typeTitleHover = -1;
  }
  public mouseEnterChangeTarget(e: any): void {
    if ((this.actionType === 'edit' || this.actionType === 'restart')) {
      return;
    }
    this.mouseHoverTarget = e;
  }
  public mouseLeaveChangeTarget(): void {
    this.mouseHoverTarget = -1;
  }
  // 更新预约任务数据
  public handleUpdataPretable(): void {
    this.scheduleUpdateService.sendMessage(this.projectId);
  }
  public handleAppAndPidDisable(e: any): void {
    const num = this.targetClicked + this.modeClicked;
    switch (num) {
      case 1: // launch application
        this.modeAppDisable = e;
        this.modeAppParamsDisable = e;
        this.applicationPathDisable = e;
        break;
      case 2: // attach to process
        e ? this.pidProcessGroup.controls.pidProcess.disable() : this.pidProcessGroup.controls.pidProcess.enable();
        this.modePidDisable = e;
        break;
    }
  }
  // 切换同类型分析类型时清理任务数据
  public hanldeClear(id: any): void {
    const type = this.analysisTypesDir[id].type;
    const child: any = {
      system: this.performance,
      resource_schedule: this.schedule,
      microarchitecture: this.structure,
      mem_access_analysis: this.mem,
      'process-thread-analysis': this.process,
      'C/C++ Program': this.cplusplus,
      system_lock: this.lock,
    };
    if (child[type] && child[type].clear) {
      child[type].clear();
    }
  }
  // 关闭页签
  public closeTab(e: any) {
    if (this.taskDetail.isFromTuningHelper) {
      this.closeIndexTab.emit(Object.assign(e, {fromTuningTabId: this.taskDetail.tabPanelId}));
    } else {
      this.closeIndexTab.emit(e);
    }
  }

  public handleNodeEmitIndex(e: any) {
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
      m_attach: this.mAttach,
      m_profile: this.mProfile,
      m_launch: this.mLaunch,
      d_profile: this.dProfile,
    };
    child[e.key].open(e);
  }
  public handleConfigData(e: any) {
    this.nodeConfigedData = e;
  }

  /**
   * 计算分析对象图标的状态
   * @param i 索引
   */
  public calcAnalysisTargetIconStatus(i: number): IconStatus {
    if (['edit', 'restart'].includes(this.actionType) && (this.targetClicked !== i)) {
      return IconStatus.Disabled;
    } else if (this.targetClicked === i || this.mouseHoverTarget === i) {
      return IconStatus.Hover;
    } else {
      return IconStatus.Normal;
    }
  }

  /**
   * 计算分析类型图标的状态
   * @param id 索引
   */
  public calcAnalysisTypeIconStatus(id: number): IconStatus {
    if (['edit', 'restart'].includes(this.actionType) && (this.typeClicked !== id)) {
      return IconStatus.Disabled;
    } else if (this.typeClicked === id || this.mouseHover === id) {
      return IconStatus.Hover;
    } else {
      return IconStatus.Normal;
    }
  }
  // 从子组件传来的访存类型
  public memAnalysisModeChange(str: string) {
    switch (str) {
      case 'mem_access':
        // 访存统计分析
        this.typeMsg = this.i18n.mission_create.memAccessAnalysisMsg;
        break;
      case 'miss_event':
        // 访存统计分析
        this.typeMsg = this.i18n.mission_create.missEventMsg;
        break;
      case 'falsesharing':
        // 访存统计分析
        this.typeMsg = this.i18n.mission_create.falsesharingMsg;
        break;
      default: break;
    }
  }

  public onSendMpiStatus(mpiStatus: boolean) {
    if (mpiStatus) {
      this.isShowTip = true;
      this.modeAppDisable = true;
      this.switchState = true;
    } else {
      this.isShowTip = false;
      this.modeAppDisable = false;
    }
  }

  public checkUserOrPassWord(str: string) {
    this.setTipHtml();
    if (str === 'user') {
      this.runUserValid = Boolean(this.modeApplicationUser);
      if (this.modeApplicationUser === '') {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_empty_judge;
        this.runUserValid = false;
        return;
      }
      const reg = new RegExp('^[a-zA-Z._][a-zA-Z0-9._\\-]{0,127}$');
      if (!reg.test(this.modeApplicationUser)) {
        this.runUserMsg = this.i18n.tip_msg.system_setting_input_run_user_msg;
        this.runUserValid = false;
      } else {
        this.runUserValid = true;
      }
    } else if (str === 'password') {
      this.runPasswordValid = Boolean(this.modeApplicationPassWord);
    }
    // 验证必选项
    if (this.switchState) {
      this.modeAppRunUserValid = Boolean(this.modeApplicationUser) && Boolean(this.modeApplicationPassWord);
    } else {
      this.modeAppRunUserValid = true;
      this.modeApplicationUser = '';
      this.modeApplicationPassWord = '';
    }
  }
  public isHaveValue(val: any) {
    return Boolean(val);
  }
}
