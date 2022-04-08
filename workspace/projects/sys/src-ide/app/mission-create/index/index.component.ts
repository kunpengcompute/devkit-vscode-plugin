// 系统性能分析_create
import { Component, OnInit, Output, ViewChild, Input, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { ScheduleUpdateService } from '../../service/schedule-update.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PpEmitValue } from './components/mission-create-pid-process/mission-create-pid-process.component.types';
import { PROJECT_TYPE } from '../../service/axios.service';
import { CustomValidatorsService } from '../../service';
/**
 * 按任务功能分类
 */
type taskFeatures = 'universal' | 'system' | 'dedicated';
type AnalysisType = {
    [propName in taskFeatures]: Array<{
        url: string;
        urlLight: string;
        urlHover: string;
        urlHoverLight: string;
        urlDisabled: string;
        name: string;
        type: string;
        id: number
    }>
};
@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
    constructor(
        public I18n: I18nService,
        private scheduleUpdateService: ScheduleUpdateService,
        public vscodeService: VscodeService,
        private sanitizer: DomSanitizer,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef,
        public customValidatorsService: CustomValidatorsService
    ) {
        this.i18n = I18n.I18n();
        this.typeTitle = [this.i18n.mission_create.universal_title, this.i18n.mission_create.system_title,
        this.i18n.mission_create.dedicated_title];
        this.missionNameNotice = this.i18n.mission_create.missionNameNotice;
        this.analysisTargets = [
            {
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconSystem.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconSystemLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverSystem.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverSystemLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/icondisabledSystem.svg'
                ),
                name: this.i18n.common_term_projiect_task_system,
            },
            {
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconApp.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconAppLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverApp.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverAppLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/icondisabledApp.svg'),
                name: this.i18n.common_term_task_crate_path,
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
        this.typeMsgInfo = {
            system: this.i18n.mission_create.sysProMsg, // 全景
            resource_schedule: this.i18n.mission_create.resScheduleMsg, // 资源调度
            microarchitecture: this.i18n.mission_create.structureMsg, // 微架构
            mem_access_analysis: this.i18n.mission_create.memAccessAnalysisMsg, // 访存
            'process-thread-analysis': this.i18n.mission_create.processMsg, // 进程线程
            'C/C++ Program': this.i18n.mission_create.cPlusPlusMsg, // c/c++
            system_lock: this.i18n.mission_create.lockMsg, // 锁与等待
            ioperformance: this.i18n.mission_create.ioMsg, // io
            hpc_analysis: this.i18n.mission_create.hpcMsg, // hpc
        };
        // 所有任务字典
        this.analysisTypesDir = [
            { // 全景分析
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconPerform.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconPerformLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverPerform.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverPerformLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/icondisabledPerform.svg'
                ),
                name: this.i18n.mission_create.sysPro,
                type: 'system'
            },
            { // 进程/线程
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconProcess.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconProcessLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverProcess.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverProcessLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/icondisabledProcess.svg'
                ),
                name: this.i18n.mission_create.process,
                type: 'process-thread-analysis'
            },
            { // C/C++性能分析
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconC.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconCLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverC.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverCLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/icondisabledC.svg'),
                name: this.i18n.mission_create.cPlusPlus,
                type: 'C/C++ Program'
            },
            { // 微架构
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconStructure.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconStructureLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverStructure.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverStructureLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/icondisabledStructure.svg'
                ),
                name: this.i18n.mission_create.structure,
                type: 'microarchitecture'
            },
            { // 访存分析
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconDdr.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconDdrLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverDdr.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverDdrLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/icondisabledDdr.svg'),
                name: this.i18n.mission_modal.memAccessAnalysis,
                type: 'mem_access_analysis',
                typeList: ['mem_access', 'miss_event', 'falsesharing'],
            },
            {// I/O分析
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconIO.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconIOLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverIO.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverIOLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/icondisabledIO.svg'),
                name: this.i18n.mission_create.io,
                type: 'ioperformance'
            },
            { // 资源调度
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconSchedule.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconScheduleLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverSchedule.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverScheduleLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/icondisabledSchedule.svg'
                ),
                name: this.i18n.mission_create.resSchedule,
                type: 'resource_schedule'
            },
            { // 锁与等待
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconLock.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconLockLight.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/iconhoverLock.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/mission/iconhoverLockLight.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/mission/icondisabledLock.svg'),
                name: this.i18n.mission_create.lock,
                type: 'system_lock'
            },
            {// hpc
                url: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/projects/hpc_normal.svg'),
                urlLight: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/projects/hpc_normal-light.svg'),
                urlHover: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/projects/hpc_hover.svg'),
                urlHoverLight: this.sanitizer.bypassSecurityTrustResourceUrl(
                    './assets/img/projects/hpc_hover-light.svg'
                ),
                urlDisabled: this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/projects/hpc_disabled.svg'),
                name: this.i18n.mission_create.hpc,
                type: 'hpc_analysis'
            }
        ];
        this.modeAppNotice = this.i18n.common_term_task_type_launch;
        this.modePidNotice = this.i18n.common_term_task_type_attach;
        this.modePidHolder = this.i18n.mission_create.modePidHolder;
        this.modeHolder = this.i18n.mission_create.modeHolder;
        this.modeNameHolder = this.i18n.mission_create.modeNameHolder;
        this.modeAppParamsHolder = this.i18n.mission_create.modeAppParamsHolder;
    }
    set typeClicked(val: number) {
        this.typeClickedCopy = val;
        this.setTipText();
        this.appPathVildChangeAction();
    }
    get typeClicked() {
        return this.typeClickedCopy;
    }
    @Output() private closeIndexTab = new EventEmitter<any>();
    @Input() projectName: any;
    @Input() actionType: any;
    @Input() taskDetail: any;
    @Input() refreshItem: any;
    @Input() panelId: any;
    @Input() scenes: PROJECT_TYPE;
    @ViewChild('hpc', { static: false }) hpc: any;
    @ViewChild('performance', { static: false }) performance;
    @ViewChild('config', { static: false }) config;
    @ViewChild('process', { static: false }) process;
    @ViewChild('schedule', { static: false }) schedule;
    @ViewChild('lock', { static: false }) lock;
    @ViewChild('mem', { static: false }) mem;
    @ViewChild('cplusplus', { static: false }) cplusplus;
    @ViewChild('java', { static: false }) java;
    @ViewChild('io', { static: false }) io;
    @ViewChild('structure', { static: false }) structure;
    @ViewChild('miss', { static: false }) miss;
    @ViewChild('configNodeModal', { static: false }) configNodeModal;
    @ViewChild('keep_modal', { static: false }) keepModal;
    @ViewChild('template', { static: false }) taskTemplate;
    @ViewChild('pretable', { static: false }) pretable;
    @ViewChild('cProfile', { static: false }) cProfile;
    @ViewChild('cLaunch', { static: false }) cLaunch;
    @ViewChild('cAttach', { static: false }) cAttach;
    @ViewChild('jLaunch', { static: false }) jLaunch;
    @ViewChild('jAttach', { static: false }) jAttach;
    @ViewChild('lAttach', { static: false }) lAttach;
    @ViewChild('lProfile', { static: false }) lProfile;
    @ViewChild('lLaunch', { static: false }) lLaunch;
    @ViewChild('rAttach', { static: false }) rAttach;
    @ViewChild('rLaunch', { static: false }) rLaunch;
    @ViewChild('rProfile', { static: false }) rProfile;
    @ViewChild('mAttach', { static: false }) mAttach;
    @ViewChild('mProfile', { static: false }) mProfile;
    @ViewChild('mLaunch', { static: false }) mLaunch;
    public restartTaskInfo: {
        [key: string]: any
    } = {};
    public objectChange = true; // 切换target和modal时重置配置项
    public i18n: any;
    public labelWidth = '225px';
    public missionName = ''; // 任务名称
    public missionNameNotice: string;
    public missionNameValid: boolean;  // 任务名称是否合法
    public isShowMsg = false;  // 是否展示提示
    public missionNameWarnMsg: string;  // 不合法时输出提示
    public misssionNameAble = false; // 任务名称是否被禁用
    public analysisTargets = new Array(); // 分析对象数据
    public targetClicked = 0; // 分析对象
    public typeBigMsg: string;
    public modeClicked = 0;  // 模式
    public midModeClicked = 0; // 对象切换暂存模式选择
    public modeList = new Array();    // 模式列表
    public modeAppNotice: string;
    public modePidNotice: string;
    public modeApplication = '';  // 应用或应用路径
    public switchState = false;
    public switchStateCopy = false;
    public modeApplicationUser = '';  // 用户名
    public modeAppRunUserValid = true; // 应用运行用户必选校验
    public runUserValid = true;
    public runUserMsg: string;
    public runPasswordValid = true;
    public modeApplicationPassWord = '';
    public modeAppParams: string;
    public processName: string;
    public modeAppHolder: string;    // 提示文本
    public modeHolder: string;     // 输入框placeholder
    public modeAppParamsHolder: string;
    public modePidHolder: string;    // pid的placeholder
    public modeNameHolder: string; // 进程名称占位字符
    public modeAppWarnMsg: string;  // 校验之后的信息
    public modePidWarnMsg: string;
    public modeNameWarnMsg: string;
    public modeAppParamsMsg: string;
    public modeAppValid = false;   // 应用路径是否校验成功
    public modeAppParamsValid = false;
    public modeAppPathDisable = false; // 应用路径禁用
    public modeAppDisable = false;
    public runUserDisable = false; // 应用运行用户
    public modePidDisable = false;
    public modeNameDisable = false;
    public modeAppParamsDisable = false;
    public isFirstFocusAppPathInput = true; // 在应用（分析对象）下，Launch Application模式下，应用输入前的提示显示的控制变量
    public appPathInputTip = ''; // 在应用（分析对象）下，Launch Application模式下，应用输入前的提示
    public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/
    public isShowTip = false; // 是否展示禁用原因

    /** 应用，Attack to Process: Pid 的值 */
    public modePid = '';
    /** 应用，Attack to Process: 程序名称 */
    public modeProcess = '';
    /** 应用，Attack to Process: Pid 的值的验证是否通过 */
    public modePidValid = false;
    public isDisablePidTid = false;

    public analysisTypes = new Array(); // 分析类型数据
    public typeClickedCopy = 0; // 分析类型
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
    public analysisTypeSys: AnalysisType = ({} as AnalysisType);  // 系统
    public analysisTypeLaunch: AnalysisType = ({} as AnalysisType); // 应用 拉起应用(launch)
    public analysisTypeAttach: AnalysisType = ({} as AnalysisType); // 应用 指定进程 (attach)

    public colorTheme = { // 主题颜色
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    public nodeList = false;
    public isEdit = false;
    public isRestart = false;
    public isInitPid = true;
    public isInitProcessName = true;
    public isInitApp = true;
    public strategy = { // 导入模板
        childAction(child: any, actionType: string, pre?: boolean, id?: number): void {
            if (pre) {
                child.editScheduleTask = pre;
                child.scheduleTaskId = id;
            }
            child.isRestart = actionType === 'restart';
            child.isEdit = actionType === 'edit';
        },
        importInit(self: any, e: any, targetClicked: number, modeClicked: number): void {
            const index = targetClicked + modeClicked;
            if (index === 1) {
                self.modeApplication = e.nodeConfig && e.nodeConfig.length && e.nodeConfig[0].task_param
                    && e.nodeConfig[0].task_param['app-dir'] ? e.nodeConfig[0].task_param['app-dir'] : '';
                self.modeAppParams = e.nodeConfig && e.nodeConfig.length && e.nodeConfig[0].task_param
                    && e.nodeConfig[0].task_param['app-parameters'] ? e.nodeConfig[0].task_param['app-parameters'] : '';
                if (!self.modeApplication) {
                    self.modeApplication = e.nodeConfig && e.nodeConfig.length && e.nodeConfig[0].task_param
                        && e.nodeConfig[0].task_param.appDir ? e.nodeConfig[0].task_param.appDir : '';
                }
                self.missionAppChange(self.modeApplication);
                self.missionAppParamsChange(self.modeAppParams);
            } else if (index === 2) {
                self.modePid = e['target-pid'] || e.pid || e.targetPid || '';
                self.modeProcess = e.process_name || e['process-name'] || '';
            } else {
                self.modeApplication = '';
                self.modeAppParams = '';
                self.modePid = null;
            }
        },
        importInit_new(self: any, e: any, targetClicked: number, modeClicked: number): void {
            const index = targetClicked + modeClicked;
            if (index === 1) {
                self.modeApplication = e.appDir;
                self.modeAppParams = e.appParameters;
                self.missionAppChange(self.modeApplication);
                self.missionAppParamsChange(self.modeAppParams);
            } else if (index === 2) {
                self.modeProcess = e.process_name || '';
                self.modePid = e.targetPid || '';
            } else {
                self.modeApplication = '';
                self.modeAppParams = '';
                self.modePid = null;
            }
        },
        importInitMiss({ self, e, appDir, appParameters, targetPid, processName }): void {
            const index = self.targetClicked + self.modeClicked;

            if (index === 1) {
                self.modeApplication = appDir;
                self.modeAppParams = appParameters;
                self.missionAppChange(self.modeApplication);
            } else if (index === 2) {
                self.modeProcess = processName || '';
                self.modePid = targetPid || '';
            } else {
                self.modeApplication = '';
                self.modeAppParams = '';
                self.modePid = null;
            }
        },
        importData(child: any, e: any): void {
            child.getTemplateData(e);
        },
        importInitIo(self: any, e: any, targetClicked: number, modeClicked: number): void {
            const index = targetClicked + modeClicked;
            if (index === 1) {
                self.modeApplication = e.appDir || '';
                self.modeAppParams = e['app-parameters'];
                self.missionAppChange(self.modeApplication);
                self.missionAppParamsChange(self.modeAppParams);
            } else if (index === 2) {
                self.modeProcess = e.process_name || '';
                self.modePid = e.targetPid || '';
            } else {
                self.modeApplication = '';
                self.modeAppParams = '';
                self.modePid = null;
            }
        }
    };
    public typeMsgInfo: any; // 任务图标下的说明文字列表数据
    public typeMsg: string; // 任务图标下的说明文字

    public projectId: number;
    public restartAndEditId: number;
    public nodeConfigShow: boolean;
    public nodeConfigName: string;
    public nodeConfigTitle: string;
    public nodeConfigData: any;
    public nodeConfigedData: any;
    public checkBoxes = [];
    public currTheme: any;
    public passwordInputType = 'password';
    public nodeInfo: any[] = []; // nodeList 信息
    public operationSys: any;
    public isIntellij = self.webviewSession.getItem('tuningOperation') === 'hypertuner';
    /** 应用模式下，应用路径有效性判断的方法。判断时机：内容输入时。目的为： 控制判断时机，方便调用 */
    public appPathVildChangeAction = () => { };
    /**
     * 初始化
     */
    ngOnInit() {

        let sys: any;
        let launch: any;
        let attach: any;
        if (this.scenes === PROJECT_TYPE.TYPE_HPC) {
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
                const obj: any = this.analysisTypesDir[item];
                obj.id = item;
                return obj;
            });
        }
        for (const key of Object.keys(sys)) {
            this.analysisTypeLaunch[key] = launch[key].map((item: number) => {
                const obj: any = this.analysisTypesDir[item];
                obj.id = item;
                return obj;
            });
        }
        for (const key of Object.keys(sys)) {
            this.analysisTypeAttach[key] = attach[key].map((item: number) => {
                const obj: any = this.analysisTypesDir[item];
                obj.id = item;
                return obj;
            });
        }

        // 默认选择第一个元素
        this.typeClicked = this.analysisTypeSys.universal[0].id || 0;

        // 任务信息
        this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];

        // 获取VSCode当前主题颜色
        this.currTheme = currentTheme();
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.checkBoxes = [
            { labelName: this.i18n.mission_create.processName, checked: true },
            { labelName: 'PID', checked: false },
        ];

        // 根据任务信息设置分析对象、分析模式和分析类型
        const setAnalysisInfo = (taskInfo: any) => {
            const analysisTarget = this.getAnalysisTarget({ taskInfo });
            const analysisType = this.getAnalysisType({ taskInfo });
            this.getRestartTaskInfo(analysisTarget, analysisType, taskInfo);

            if (analysisType === 'microarchitecture') {
                this.nodeConfigedData = taskInfo.nodeConfig;
            }
            this.targetClicked = [undefined, 'Profile System'].includes(analysisTarget) ? 0 : 1;
            this.modeClicked = analysisTarget === 'Attach to Process' ? 1 : 0;

            this.analysisTypesDir.forEach((item: any, index: any) => {
                if (item.type === analysisType || item.typeList && item.typeList.includes(analysisType)) {
                    this.typeClicked = index;
                }
            });
        };
        switch (this.actionType) {
            case 'create':
                this.projectId = this.taskDetail.projectId;
                break;
            case 'edit':
                this.misssionNameAble = true;
                this.isEdit = true;
                this.projectId = this.taskDetail.projectId;
                if (this.taskDetail.editScheduleTask) {

                    const options = {
                        url: `/schedule-tasks/${this.taskDetail.scheduleTaskId}/`
                    };
                    this.vscodeService.get(options, (data: any) => {
                        const taskInfo = JSON.parse(data.data.taskInfo);

                        setAnalysisInfo(taskInfo);
                        setTimeout(() => {
                            this.getTemplateData(taskInfo, true, this.taskDetail.scheduleTaskId);
                        }, 500);
                    });
                } else {
                    const typeName = this.taskDetail['analysis-type'] || this.taskDetail.analysisType;
                    this.projectId = this.taskDetail.projectId;
                    this.restartAndEditId = this.taskDetail.id;

                    const options = {
                        url: '/tasks/'.concat(this.taskDetail.id)
                        .concat('/common/configuration/?node-id&analysis-type=')
                            .concat(encodeURIComponent(typeName))
                    };
                    this.vscodeService.get(options, (res: any) => {
                        const taskInfo = res.data;

                        setAnalysisInfo(taskInfo);
                        setTimeout(() => {
                            this.getTemplateData(taskInfo);
                        }, 500);

                    });
                }
                break;
            case 'restart':
                this.isRestart = true;
                this.misssionNameAble = true;
                const type = this.taskDetail['analysis-type'] || this.taskDetail.analysisType;
                this.projectId = this.taskDetail.isFromTuningHelper ? this.taskDetail.projectId
                : this.taskDetail.projectId;
                this.restartAndEditId = this.taskDetail.id;
                this.missionName = this.taskDetail.taskName;
                const option = {
                    url: '/tasks/' + this.taskDetail.id + '/common/configuration/?node-id'
                    + '&analysis-type=' + encodeURIComponent(type)
                };
                this.vscodeService.get(option, (res: any) => {
                    const taskInfo = res.data;
                    setAnalysisInfo(taskInfo);
                    setTimeout(() => {
                        this.getTemplateData(taskInfo);
                    }, 500);
                });
                break;
        }
        if (this.actionType === 'create' && this.taskDetail.nodeList) {
            this.nodeConfigShow = this.taskDetail.nodeList.length > 1 ? true : false;
            this.nodeInfo = this.taskDetail.nodeList;
        } else {
            const option = {
                url: '/projects/'.concat(`${this.projectId}`).concat('/info/'),
            };
            this.vscodeService.get(option, async (data: any) => {
                if (data.code === 'SysPerf.Success') {
                    this.nodeConfigShow = data.data.nodeList.length > 1 ? true : false;
                    data.data.nodeList.forEach((item: any) => {
                        this.nodeInfo.push({
                          nodeId: item.id,
                          nickName: item.nickName,
                          nodeIp: item.nodeIp, // 节点IP
                          nodeStatus: item.nodeStatus,
                          taskParam: {
                            status: false,
                          },
                        });
                      });
                }
            });
        }
        // 获取应用路径
        this.vscodeService.get({ url: '/config/system/' }, (data) => {
            this.modeAppPathAllow = data.data.TARGET_APP_PATH;
            const modeAppPath = null ? '' : data.data.TARGET_APP_PATH;
            this.appPathInputTip = (this.i18n.mission_create.modeAppPathInvalid as string).replace(
                '${path}', modeAppPath);
        });
        // 来自调优助手的创建重启任务
        if (this.taskDetail.isFromTuningHelper) {
          if (this.targetClicked === 0) {  // 系统
            this.selectAnalysisType(this.analysisTypeSys);
          } else { // 应用类型
            this.selectAnalysisType(this.analysisTypeLaunch);
          }
        }

        this.operationSys = this.getOperationSys();
    }
    private setTipText() {
        let finalPathAllow: any = this.modeAppPathAllow;
        // 应用运行用户选中
        if (!this.switchState) {
          const defaultPathArr = ['/opt/', '/home/'];
          const getPathArr = this.modeAppPathAllow.split(';');
          finalPathAllow = defaultPathArr.filter(n => getPathArr.includes(n)).join(';');
        }
        this.appPathInputTip = (this.i18n.mission_create.modeAppPathInvalid as string).replace(
            '${path}', finalPathAllow.replace(/;/g, this.i18n.plugins_term_or));
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
        const fetchTypeList = ['mem_access', 'miss_event', 'falsesharing'];
        const taskType = this.analysisTypesDir.find((item: any) => {
            const typeList = item.typeList || [];
            return item.type === analysisType || typeList.includes(analysisType);
        });

        if (analysisTarget === 'Profile System') {
            this.restartTaskInfo = {
                analysisTarget: {
                    key: this.i18n.mission_create.analysisTarget,
                    value: this.i18n.common_term_projiect_task_system + this.i18n.common_term_left_parentheses
                        + analysisTarget + this.i18n.common_term_right_parentheses,
                    isHaveImg: true,
                    msg: this.i18n.common_term_task_type_profile
                },
                analysisType: {
                    key: this.i18n.common_term_task_analysis_type,
                    value: fetchTypeList.includes(analysisType) ? taskType.name + this.i18n.common_term_left_parentheses
                        + this.getfetchTask(analysisType) + this.i18n.common_term_right_parentheses : taskType.name,
                    isHaveImg: true,
                    msg: this.typeMsg
                }
            };
        } else if (analysisTarget === 'Launch Application') {
            this.restartTaskInfo = {
                analysisTarget: {
                    key: this.i18n.mission_create.analysisTarget,
                    value: this.i18n.common_term_task_crate_path + this.i18n.common_term_left_parentheses
                        + analysisTarget + this.i18n.common_term_right_parentheses,
                    isHaveImg: true,
                    msg: this.i18n.common_term_task_type_launch
                },
                analysisType: {
                    key: this.i18n.common_term_task_analysis_type,
                    value: fetchTypeList.includes(analysisType) ? taskType.name + this.i18n.common_term_left_parentheses
                        + this.getfetchTask(analysisType) + this.i18n.common_term_right_parentheses : taskType.name,
                    isHaveImg: true,
                    msg: this.typeMsg
                }
            };
        } else if (analysisTarget === 'Attach to Process') {
            this.restartTaskInfo = {
                analysisTarget: {
                    key: this.i18n.mission_create.analysisTarget,
                    value: this.i18n.common_term_task_crate_path + this.i18n.common_term_left_parentheses
                        + analysisTarget + this.i18n.common_term_right_parentheses,
                    isHaveImg: true,
                    msg: this.i18n.common_term_task_type_attach
                },
                analysisType: {
                    key: this.i18n.common_term_task_analysis_type,
                    value: fetchTypeList.includes(analysisType) ? taskType.name + this.i18n.common_term_left_parentheses
                        + this.getfetchTask(analysisType) + this.i18n.common_term_right_parentheses : taskType.name,
                    isHaveImg: true,
                    msg: this.typeMsg
                }
            };
        }
    }

    private getfetchTask(analysisType: string) {
        switch (analysisType) {
            case 'mem_access': return this.i18n.mission_create.mem;
            case 'miss_event': return this.i18n.mission_create.missEvent;
            case 'falsesharing': return this.i18n.mission_create.falsesharing;
            default: break;
        }
        this.updateWebViewPage();
    }

    /**
     * 选择进程名称/PID
     * @param item checkBoxes
     * @param i 进程名称或进程ID的标记
     */
    checkEvent(item: { checked: any; }, i: number) {
        if (item.checked) {
            this.checkBoxes[i].checked = true;
        } else {
            this.checkBoxes[i].checked = false;
        }
    }

    /**
     * 通过任务信息返回分析对象
     */
    public getAnalysisTarget({ taskInfo }) {
        const missAnalysisTarget = {
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

    /**
     *  分析对象点击事件
     */
    public onTargetClick(index: number): void {
        if (index) {
            this.switchState = this.switchStateCopy;
        } else {
            this.switchStateCopy = this.switchState;
            this.switchState = false;
        }
        this.modePid = undefined;
        this.modePidWarnMsg = '';
        this.modeAppWarnMsg = '';
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
        } else {
            this.modeClicked = this.midModeClicked;
        }
        // 分析对象从系统切换到应用时特殊处理
        if (index !== 0 && this.typeClicked === 0) {
            this.typeClicked = 1;
        }
        this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
        this.updateWebViewPage();
        setTimeout(() => {
            // 切换对象，将禁用项应用路径和应用参数解禁
            this.modeAppDisable = false;
            this.modeAppParamsDisable = false;
            this.modeAppPathDisable = false;
        }, 0);
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
    /**
     * 切换模式选中事件
     */
    public onModeClick(index: number): void {
        this.isFirstFocusAppPathInput = true;
        if (index) {
            this.switchStateCopy = this.switchState;
            this.switchState = false;
            this.modeAppDisable = false;
            this.modeAppParamsDisable = false;
            this.modeAppPathDisable = false;
        } else {
            this.switchState = this.switchStateCopy;
            this.modePidDisable = false;
        }
        // 切换分析对象时清理配置项
        this.modePid = undefined;
        this.modePidWarnMsg = '';
        this.modeAppWarnMsg = '';
        // 应用运行用户  密码清除
        this.modeApplicationPassWord = '';
        if ((this.actionType === 'edit' || this.actionType === 'restart')) {
            return;
        }
        this.objectChange = false;
        this.modeClicked = index;
        this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
        this.updateWebViewPage();
        setTimeout(() => {
            this.objectChange = true;
          }, 0);
    }
    /**
     * 分析类型点击变色
     */
    public onTypeClick(index: number): void {
        if ((this.actionType === 'edit' || this.actionType === 'restart')) {
            return;
        }
        if (this.taskDetail.isFromTuningHelper) {
          return;
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
        if (this.analysisTypesDir[this.typeClicked].type !== 'hpc_analysis') {
            this.isShowTip = false;
            this.modeAppDisable = false;
            this.runUserDisable = false;
            this.modeAppPathDisable = false;
            this.modeAppParamsDisable = false;
            this.isDisablePidTid = false;
        }
        this.hanldeClear(id);
        this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
        this.updateWebViewPage();
    }
    /**
     * 任务名称失焦校验
     * @param e 输入框信息
     */
    checkMissionName(e: any) {
        this.missionName = this.missionName.trim();
        if (this.missionName === '') {
            this.missionNameWarnMsg = this.i18n.mission_create.missionNameWarn;
            this.missionNameValid = false;
            this.isShowMsg = true;
        } else {
            const reg = new RegExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$');
            this.missionNameValid = reg.test(e);
            this.isShowMsg = !reg.test(e);
            if (!this.missionNameValid) {
                if (!e) {
                    return this.missionNameWarnMsg = this.i18n.mission_create.missionNameWarn;
                } else {
                    return this.missionNameWarnMsg = this.i18n.validata.task_name_rule;
                }
            } else {
                return this.missionNameWarnMsg = '';
            }
        }
    }
    /**
     * 应用路径校验
     */
    public missionAppChange(): void {
        const path = this.modeApplication ? this.modeApplication.toString().trim() : ''; // 去掉字符串的头尾空格
        this.isFirstFocusAppPathInput = false;
        this.appPathVildChangeAction = () => {
            // 验证一：为空判断
            if (this.modeApplication == null || this.modeApplication.trim() === '') {
                this.modeAppWarnMsg = this.i18n.mission_create.modeAppPath;
                this.modeAppValid = false;
                return;
            }
            // 判断二：正则验证
            // 匹配规则简述：1、前必有 /; 2、不含字符：^ ` | ; & $ > < \ ! 任何空白字符; 4、不能以 / 结尾; 3、不能出现：//
            if (this.customValidatorsService.pathMatch(path)) {
                this.modeAppWarnMsg = this.i18n.mission_create.modeAppWarn;
                this.modeAppValid = false;
                return;
            }
            if (this.analysisTypesDir[this.typeClicked].type === 'java-mixed-mode') {
                const javaReg = /\/java$/;
                if (!javaReg.test(this.modeApplication)) {
                    this.modeAppWarnMsg = this.i18n.mission_create.modeAppPathInvalid2;
                    this.modeAppValid = false;
                    return;
                }
            } else {
                // 验证四：是否为系统配置指定路径下应用判断
                let isIncluded = false;
                const allowPathList: string[] = this.modeAppPathAllow.split(';');
                for (const allowPath of allowPathList) {
                    if (this.modeApplication.includes(allowPath) && this.modeApplication.indexOf(allowPath) === 0) {
                        isIncluded = true;
                    }
                }
                if (!isIncluded) {
                    this.modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string).replace(
                        '${path}', this.modeAppPathAllow
                    );
                    this.modeAppValid = false;
                    return;
                }
            }
            this.modeApplication = path;
            this.modeAppValid = true;
            return this.modeAppWarnMsg = '';
        };
        this.appPathVildChangeAction();
    }
    /**
     * 应用参数
     */
    public missionAppParamsChange(e: any): string {
        e = e ? e.toString().trim() : e;
        if (!e) {
            this.modeAppParamsValid = false;
            return this.modeAppParamsMsg = this.i18n.mission_create.modeAppParams;
        } else {
            this.modeAppParams = e;
            this.modeAppParamsValid = true;
            return this.modeAppParamsMsg = '';
        }
    }
    /**
     * 进程/线程ID校验
     */
    public missionPidChange(e: any): string {
        e = e ? e.toString().trim() : e;

        if (!e) {
            return this.modePidWarnMsg = this.i18n.mission_create.modePidNotice;
        }

        const reg = new RegExp('^([0]{1}|[1-9]+[0-9]*)$');
        this.modePidValid = reg.test(e);
        if (!this.modePidValid) {
            return this.modePidWarnMsg = this.i18n.mission_create.modePidWarn;
        } else {
            this.modePid = e || '';
            return this.modePidWarnMsg = '';
        }
    }

    /**
     * 进程/线程名称校验
     */
    public missionProcessNameChange(e: any): string {
        e = e ? e.toString().trim() : e;
        if (!e) {
            return this.modeNameWarnMsg = this.i18n.mission_create.modeNameNotice;
        } else {
            this.processName = e || '';
            return this.modeNameWarnMsg = '';
        }
    }

    /**
     * 保存模板
     */
    public saveTemplate(e: any): void {
        this.keepData = e;
        this.keepModal.openModal();
        this.updateWebViewPage();
    }

    /**
     * 导入模板
     */
    public importTemplate(): void {
        this.type = this.analysisTypesDir[this.typeClicked].type;
        this.taskTemplate.open({
            type: this.type,
            typeList: this.analysisTypesDir[this.typeClicked].typeList,
        });
        this.updateWebViewPage();
    }

    /**
     * 导入模板传值
     */
    public getTemplateData(e: any, pre?: boolean, id?: number): void {
        this.missionName = e.taskName ? e.taskName : this.taskDetail.taskName;
        this.missionName = this.missionName ? this.missionName : e.taskname;
        this.type = this.analysisTypesDir[this.typeClicked].type;
        this.checkMissionName(this.missionName); // 导入模板时，任务名称做一次校验
        this.typeMsg = this.typeMsgInfo[this.analysisTypesDir[this.typeClicked].type];
        const child = {
            hpc_analysis: this.hpc,
            system: this.performance,
            system_config: this.config,
            resource_schedule: this.schedule,
            microarchitecture: this.structure,
            mem_access_analysis: this.mem,
            'process-thread-analysis': this.process,
            'C/C++ Program': this.cplusplus,
            system_lock: this.lock,
            'java-mixed-mode': this.java,
            ioperformance: this.io
        };
        const type1 = ['system', 'system_config', 'process-thread-analysis', 'hpc_analysis'];
        if (type1.indexOf(this.type) > -1) {
            this.strategy.childAction(child[this.type], this.actionType, pre, id);
            this.strategy.importInit(this, e, this.targetClicked, this.modeClicked);
            this.strategy.importData(child[this.type], e);
            return;
        } else {
            switch (this.type) {
                case 'microarchitecture':
                    this.strategy.childAction(child[this.type], this.actionType, pre, id);
                    this.strategy.importInit_new(this, e, this.targetClicked, this.modeClicked);
                    this.strategy.importData(child[this.type], e);
                    break;
                case 'mem_access_analysis':
                    const getParams = taskInfo => {
                        const analysisType = this.getAnalysisType({ taskInfo });
                        this.updateWebViewPage();
                        if (analysisType === 'miss_event') {
                            return {
                                appDir: taskInfo.task_param.app,
                                appParameters: taskInfo.task_param.appArgs,
                                targetPid: taskInfo.task_param.pid,
                                processName: taskInfo.process_name || taskInfo.task_param.process_name || ''
                            };
                        } else {
                            return {
                                appDir: taskInfo.appDir,
                                appParameters: taskInfo.appParameters,
                                targetPid: taskInfo.pid,
                                processName: taskInfo.process_name || taskInfo.task_param.process_name || ''
                            };
                        }
                    };

                    const { appDir, appParameters, targetPid, processName } = getParams(e);
                    this.strategy.importInitMiss({ self: this, e, appDir, appParameters, targetPid, processName });
                    this.mem.init({
                        type: this.actionType || 'create',
                        params: e,
                        scheduleTaskId: id
                    });
                    break;
                case 'ioperformance':
                    this.strategy.childAction(child[this.type], this.actionType, pre, id);
                    this.updateWebViewPage();
                    this.strategy.importInitIo(this, e, this.targetClicked, this.modeClicked);
                    this.strategy.importData(child[this.type], e);
                    break;
                default:
                    this.strategy.childAction(child[this.type], this.actionType, pre, id);
                    this.updateWebViewPage();
                    this.strategy.importInit(this, e, this.targetClicked, this.modeClicked);
                    this.strategy.importData(child[this.type], e);
                    break;
            }
        }
        this.updateWebViewPage();
    }

    /**
     * getAnalysisType
     * @param param0 param0
     */
    public getAnalysisType({ taskInfo }) {
        return taskInfo['analysis-type'] || taskInfo.analysisType;
    }

    /**
     * 鼠标hover变色
     * @param i number
     * @returns null
     */
    public onMouseMove(i: number): void {
        if (this.isMouseOver()) {
          return;
        }
        this.typeTitleHover = i;
        this.updateWebViewPage();
    }

    /**
     * 鼠标hover变色
     */
    public onMouseTaskTypeMove(e: any): void {
        if (this.isMouseOver()) {
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
        this.updateWebViewPage();
    }

    /**
     * 鼠标hover变色
     * @returns boolean
     */
    private isMouseOver() {
      return this.actionType === 'edit' || this.actionType === 'restart' || this.taskDetail?.isFromTuningHelper;
    }
    /**
     * 鼠标离开
     */
    public mouseLeaveChange(): void {
        this.mouseHover = -1;
        this.typeTitleHover = -1;
        this.updateWebViewPage();
    }
    /**
     * 鼠标离开
     */
    public mouseLeaveTypeChange(): void {
        this.typeTitleHover = -1;
    }
    /**
     * 鼠标enter
     */
    public mouseEnterChangeTarget(e: any): void {
        if ((this.actionType === 'edit' || this.actionType === 'restart')) {
            return;
        }
        this.mouseHoverTarget = e;
        this.updateWebViewPage();
    }
    /**
     * 鼠标离开
     */
    public mouseLeaveChangeTarget(): void {
        this.mouseHoverTarget = -1;
        this.updateWebViewPage();
    }
    /**
     * 更新预约任务数据
     */
    public handleUpdataPretable(): void {
        this.scheduleUpdateService.sendMessage(this.projectId);
        this.updateWebViewPage();
    }
    /**
     * 处理应用和进程ID禁用
     */
    public handleAppAndPidDisable(e: any): void {
        const num = this.targetClicked + this.modeClicked;
        switch (num) {
            case 1:
                this.modeAppPathDisable = e;
                this.modeAppDisable = e;
                this.modeAppParamsDisable = e;
                break;
            case 2:
                this.modePidDisable = e;
                break;
            default: break;
        }
    }
    /**
     * 处理进程名称和
     */
    public handlePidTidDisable(e: any) {
        this.isDisablePidTid = e;
    }
    /**
     *  切换同类型分析类型时清理任务数据
     */
    public hanldeClear(id: any): void {
        const type = this.analysisTypesDir[id].type;
        const child = {
            hpc_analysis: this.hpc,
            system: this.performance,
            system_config: this.config,
            resource_schedule: this.schedule,
            microarchitecture: this.structure,
            mem_access_analysis: this.mem,
            'process-thread-analysis': this.process,
            'C/C++ Program': this.cplusplus,
            system_lock: this.lock,
            'java-mixed-mode': this.java,
            ioperformance: this.io
        };
        child[type].clear();
        this.updateWebViewPage();
    }
    /**
     * 关闭页签
     */
    public closeTab(e: any) {
        if (this.taskDetail.isFromTuningHelper) {
          this.closeIndexTab.emit(Object.assign(e, {fromTuningTabId: this.taskDetail.tabPanelId}));
        } else {
          this.closeIndexTab.emit(e);
        }
        this.updateWebViewPage();
    }

    /**
     * 处理emit
     */
    public handleNodeEmitIndex(e: any) {
        const child = {
            c_profile: this.cProfile,
            c_launch: this.cLaunch,
            c_attach: this.cAttach,
            j_launch: this.jLaunch,
            j_attach: this.jAttach,
            l_attach: this.lAttach,
            l_profile: this.lProfile,
            l_launch: this.lLaunch,
            r_attach: this.rAttach,
            r_profile: this.rProfile,
            r_launch: this.rLaunch,
            m_attach: this.mAttach,
            m_profile: this.mProfile,
            m_launch: this.mLaunch,
        };
        child[e.key].open(e);
        this.updateWebViewPage();
    }

    /**
     * 校验指定运行用户  用户名或密码
     * @param str 用户名或密码
     */
    public checkUserOrPassWord(str: string) {
        this.setTipText();
        if (str === 'switch') {
            if (!this.switchState) {
                this.modeApplicationUser = '';
                this.modeApplicationPassWord = '';
            }
        } else if (str === 'user') {
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
        }
    }
    /**
     * 配置数据
     */
    public handleConfigData(e: any) {
        this.nodeConfigedData = e;
    }
    /**
     *  处理组件 MissionCreatePidProcessComponent 的输入值
     * @param val val 输入值
     */
    public onPidProcessUpdateValue(val: PpEmitValue) {
        this.modePid = val.pid;
        this.modeProcess = val.process;
        this.modePidValid = val.valid;
    }
    /**
     * 从子组件传来的访存类型
     * @param str 类型
     */
    public memAnalysisModeChange(str: string) {
        switch (str) {
            case 'mem_access':
                // 访存统计分析
                this.typeMsg = this.i18n.mission_create.memAccessAnalysisMsg;
                break;
            case 'miss_event':
                // miss事件
                this.typeMsg = this.i18n.mission_create.missEventMsg;
                break;
            case 'falsesharing':
                // 伪共享分享
                this.typeMsg = this.i18n.mission_create.falsesharingMsg;
                break;
            default: break;
        }
        this.updateWebViewPage();
    }

    /**
     * 获取分析目标图标url
     */
    public getTargetIconUrl(item: any, i: any) {
        if ((this.actionType === 'edit' || this.actionType === 'restart') && (this.targetClicked !== i)) {
            return item.urlDisabled;
        } else if (this.targetClicked === i || this.mouseHoverTarget === i) {
            if (this.currTheme === this.colorTheme.Dark) {
                return item.urlHover;
            } else {
                return item.urlHoverLight;
            }
        } else {
            if (this.currTheme === this.colorTheme.Dark) {
                return item.url;
            } else {
                return item.urlLight;
            }
        }
        this.updateWebViewPage();
    }

    /**
     * 获取分析类型图标url
     */
    public getTypeIconUrl(item: any) {
        if ((this.actionType === 'edit' || this.actionType === 'restart') && (this.typeClicked !== item.id)) {
            return item.urlDisabled;
        } else if (this.typeClicked === item.id || this.mouseHover === item.id) {
            if (this.currTheme === this.colorTheme.Dark) {
                return item.urlHover;
            } else {
                return item.urlHoverLight;
            }
        } else {
            if (this.currTheme === this.colorTheme.Dark) {
                return item.url;
            } else {
                return item.urlLight;
            }
        }
        this.updateWebViewPage();
    }
    public isHaveValue(val: any) {
        return Boolean(val);
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 获取操作系统
     */
    getOperationSys() {
      let OS = '';
      const OSArray: any = {};
      const UserAgent = navigator.userAgent.toLowerCase();
      OSArray.Windows = (navigator.platform === 'Win32') || (navigator.platform === 'Windows');
      OSArray.Mac = (navigator.platform === 'Mac68K') || (navigator.platform === 'MacPPC')
        || (navigator.platform === 'Macintosh') || (navigator.platform === 'MacIntel');
      OSArray.iphone = UserAgent.indexOf('iPhone') > -1;
      OSArray.ipod = UserAgent.indexOf('iPod') > -1;
      OSArray.ipad = UserAgent.indexOf('iPad') > -1;
      OSArray.Android = UserAgent.indexOf('Android') > -1;
      for (const i in OSArray) {
        if (OSArray[i]) {
          OS = i;
        }
      }
      return OS;
    }
    /**
     * 接受采集类型
     * @param collectionType: mpi: true | open-mp: false
     */
    public onSendcollectionType(collectionType: boolean) {
        if (collectionType) {
            this.runUserDisable = true;
            this.switchState = true;
            this.isShowTip = true;
        } else {
            this.runUserDisable = false;
            this.isShowTip = false;
            this.modeAppDisable = true;
        }
        this.modeAppDisable = false;
        this.checkUserOrPassWord('switch');
    }
}
