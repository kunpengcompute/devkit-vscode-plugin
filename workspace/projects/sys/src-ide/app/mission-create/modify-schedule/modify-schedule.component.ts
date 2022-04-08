import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';
import * as AxiosService from '../../service/axios.service';
import { PpEmitValue } from '../index/components/mission-create-pid-process/mission-create-pid-process.component.types';
import { AnalysisTarget } from '../../domain';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { ToolType } from 'projects/domain';
import { DiagnoseScheduleComponent } from '../mission-diagnose/diagnose-schedule/diagnose-schedule.component';
import { CustomValidatorsService } from 'sys/src-com/app/service/index';
@Component({
    selector: 'app-modify-schedule',
    templateUrl: './modify-schedule.component.html',
    styleUrls: ['./modify-schedule.component.scss']
})
export class ModifyScheduleComponent implements OnInit {
    private url: any;
    constructor(
        public i18nService: I18nService,
        private vscodeService: VscodeService,
        private urlService: UrlService,
        private customValidatorsService: CustomValidatorsService) {
        this.i18n = this.i18nService.I18n();
        this.url = this.urlService.Url();
        this.modeAppHolder = this.i18n.mission_create.modeHolder;
        this.modePidHolder = this.i18n.mission_create.modePidHolder;
        this.modeAppParamsHolder = this.i18n.mission_create.modeAppParamsHolder;
    }
    @ViewChild('diagnoseSchedule', { static: false }) diagnoseSchedule: DiagnoseScheduleComponent;
    @ViewChild('hpc', { static: false }) hpc;
    @ViewChild('modal', { static: false }) modal;
    @ViewChild('performance', { static: false }) performance;
    @ViewChild('config', { static: false }) config;
    @ViewChild('process', { static: false }) process;
    @ViewChild('schedule', { static: false }) schedule;
    @ViewChild('lock', { static: false }) lock;
    @ViewChild('mem', { static: false }) mem;
    @ViewChild('cplusplus', { static: false }) cplusplus;
    @ViewChild('java', { static: false }) java;
    @ViewChild('structure', { static: false }) structure;
    @ViewChild('configNodeModal', { static: false }) configNodeModal;
    @ViewChild('keep_modal', { static: false }) keepModal;
    @ViewChild('io', { static: false }) io;
    @Input() taskData: any;
    @Input() anasyname: any;
    @Output() private sendPretable = new EventEmitter<any>();
    public analysisTarget: string;
    public hpcTarget: number;
    public scenes: any;
    public scheduleTaskType = ''; // 分析类型,确定展示组件
    public modeClicked = 0;  // 模式
    public targetClicked = 0; // 分析对象
    public analysisTypesDir: any; // 所有任务字典
    public typeClicked = 0; // 分析类型
    public missionName: string; // 任务名称
    public type = ''; // 某种任务类型，用于查找模板数据
    public actionType = 'scheduleEdit';
    public missionNameValid: boolean;  // 任务名称是否合法
    public missionNameWarnMsg: string;  // 不合法时输出提示
    public misssionNameAble = false; // 任务名称是否被禁用
    public keepData: any; // 保存模板
    public projectId: number;
    public projectName: any;
    public isModifySchedule = false; // 是否是修改预约任务
    public i18n: any;
    public missionDetail: any;
    public cPs = 'Profile System';
    public cAtp = 'Attach to Process';
    public cLa = 'Launch Application';
    public configList = [];
    public missConfigList = [];
    public panelList = [];
    public showTaskData: any;
    public modeAppValid = false;   // 是否校验成功
    public modeAppWarnMsg: string;  // 校验之后的信息
    public modeAppParamsMsg: string;
    public modeApplication = '';  // 应用或应用路径
    public modeAppHolder: string;    // 应用的placeholder
    public modeAppParamsHolder: string;
    public modePidHolder: string;    // pid的placeholder
    public modePidWarnMsg: string;
    public modePid: string;
    public modeProcessName: string | number;
    public modeProcessNameWarnMsg: string;
    public modePidValid = false;
    public modeProcessNameValid = false;
    public modeAppDisable = false;
    public modePidDisable = false;
    public modeAppParamsDisable = false;
    public modeAppParamsValid = false;
    public modeAppParams: string;
    public labelWidth = '200px';
    public nodeConfigShow: boolean;
    public nodeConfigedData: any;
    public modeProcess;
    // 内存诊断重新加载初始化
    public showDiagnose = true;
    // 处理模板分析类型
    public taskType = {};
    public simplingArr = [
        { id: 'badSpeculation', text: 'Bad Speculation', tip: 'testtest' },
        { id: 'frontEndBound', text: 'Front-End Bound', tip: 'testtest' },
        { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: 'testtest' },
        { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: 'testtest' },
        { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: 'testtest' },
    ];
    public strategy = { // 导入模板
        CHILDACTION(child: any, actionType: string, pre?: boolean, id?: number): void {
            if (child) {
                if (pre) {
                    child.editScheduleTask = pre;
                    child.scheduleTaskId = id;
                }
                child.isRestart = actionType === 'restart';
                child.isEdit = actionType === 'edit';
            }
        },
        IMPORTINIT(self: any, e: any, targetClicked: number, modeClicked: number): void {
            const index = targetClicked + modeClicked;
            if (index === 1) {
                self.modeApplication = e['app-dir'];
                self.modeAppParams = e['app-parameters'];
                self.missionAppChange(self.modeApplication);
            } else if (index === 2) {
                self.modeProcessName = e.process_name || e['process-name'] || '';
                self.modePid = e['target-pid'] || e.pid || e.targetPid || '';
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
                self.modeProcessName = e.process_name || '';
                self.modePid = e.targetPid || '';
            } else {
                self.modeApplication = '';
                self.modeAppParams = '';
                self.modePid = null;
            }
        },
        importInit_miss({ self, e, appDir, appParameters, targetPrcessName, targetPid }): void {
            if (e['analysis-type'] === 'falsesharing') {
                if (e['analysis-target'] === 'Launch Application') {
                    self.modeApplication = appDir;
                    self.modeAppParams = appParameters;
                    self.missionAppChange(self.modeApplication);
                } else if (e['analysis-target'] === 'Attach to Process') {
                    self.modeProcessName = targetPrcessName || '';
                    self.modePid = targetPid || '';
                } else {
                    self.modeApplication = '';
                    self.modeAppParams = '';
                    self.modePid = null;
                }
            } else {
                if (e.task_param.target === 'app') {
                    self.modeApplication = appDir;
                    self.modeAppParams = appParameters;
                    self.missionAppChange(self.modeApplication);
                } else if (e.task_param.target === 'pid') {
                    self.modeProcessName = targetPrcessName || '';
                    self.modePid = targetPid || '';
                } else {
                    self.modeApplication = '';
                    self.modeAppParams = '';
                    self.modePid = null;
                }
            }

        },
        IMPORTDATA(child: any, e: any): void {
            if (child) {
                child.getTemplateData(e);
            }
        },
        importInitIo(self: any, e: any, targetClicked: number, modeClicked: number): void {
            const index = targetClicked + modeClicked;
            if (index === 1) {
                self.modeApplication = e.appDir || '';
                self.modeAppParams = e['app-parameters'];
                self.missionAppChange(self.modeApplication);
                self.missionAppParamsChange(self.modeAppParams);
            } else if (index === 2) {
                self.modeProcessName = e.process_name || '';
                self.modePid = e.targetPid || '';
            } else {
                self.modeApplication = '';
                self.modeAppParams = '';
                self.modePid = null;
            }
        }
    };
    public modeAppPathAllow = ''; // 所允许的所有应用路径，如： /opt/;/home/
    public toolType: ToolType;
    /** 任务ID */
    public scheduleTaskId: string;
    modeAppRunUserValid = true;

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.toolType = sessionStorage.getItem('toolType') as ToolType;

        // 详细任务条目名称
        this.missionDetail = [
            [
                [
                    // cPs
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    { title: this.i18n.mission_modal.cProcess.ready_cpu_num },
                    { title: this.i18n.mission_modal.cProcess.cpu_interval },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                ],
                [
                    // cAtp
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.pid },
                    { title: this.i18n.mission_modal.cProcess.duration },
                    { title: this.i18n.mission_modal.cProcess.cpu_interval },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                ],
                [
                    // cLa
                    { title: this.i18n.mission_modal.cProcess.taskname },
                    { title: this.i18n.mission_modal.cProcess.analysis_type },
                    { title: this.i18n.mission_modal.cProcess.app_params },
                    { title: this.i18n.mission_modal.cProcess.app_path },
                    { title: this.i18n.mission_modal.cProcess.cpu_interval },
                    { title: this.i18n.mission_modal.cProcess.file_path },
                    { title: this.i18n.mission_modal.cProcess.source_path },
                ],
            ],
            [
                [
                    { title: this.i18n.mission_modal.javaMix.taskname },
                    { title: this.i18n.mission_modal.javaMix.analysis_type },
                    { title: this.i18n.mission_modal.javaMix.pid },
                    { title: this.i18n.mission_modal.javaMix.duration },
                    { title: this.i18n.mission_modal.javaMix.cpu_interval },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                ],
                [
                    { title: this.i18n.mission_modal.javaMix.taskname },
                    { title: this.i18n.mission_modal.javaMix.analysis_type },
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.javaMix.app_params },
                    { title: this.i18n.mission_modal.javaMix.cpu_interval },
                    { title: this.i18n.mission_modal.javaMix.java_path },
                ],
            ],
            [
                { title: this.i18n.mission_modal.process.taskname },
                { title: this.i18n.mission_modal.process.duration },
                { title: this.i18n.mission_modal.process.interval },
                { title: this.i18n.mission_modal.process.task_params },
                { title: this.i18n.mission_modal.process.pid },
                { title: this.i18n.mission_modal.process.straceAnalysis },
                { title: this.i18n.mission_modal.process.thread },
            ],
            [
                // ok
                { title: this.i18n.mission_modal.panoramic.taskname },
                { title: this.i18n.mission_modal.panoramic.interval },
                { title: this.i18n.mission_modal.panoramic.duration },
                { title: this.i18n.mission_modal.panoramic.task_params },
            ],
            [
                // ok
                { title: this.i18n.mission_modal.sysConfig.taskname },
                { title: this.i18n.mission_modal.sysConfig.task_params },
            ],
            [
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.mission_modal.sysSource.analysis_type },
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ],
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.mission_modal.sysSource.analysis_type },
                    { title: this.i18n.mission_modal.sysSource.pid },
                    { title: this.i18n.mission_modal.sysSource.duration },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ],
                [
                    { title: this.i18n.mission_modal.sysSource.taskname },
                    { title: this.i18n.mission_modal.sysSource.analysis_type },
                    { title: this.i18n.common_term_task_crate_app_path },
                    { title: this.i18n.mission_modal.sysSource.app_params },
                    { title: this.i18n.mission_modal.sysSource.file_path },
                    { title: this.i18n.mission_modal.sysSource.source_path },
                ]
            ],
            [
                [
                    // mPs
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.mission_modal.syslock.analysis_type },
                    { title: this.i18n.mission_modal.syslock.duration },
                    { title: this.i18n.mission_modal.syslock.cpu_interval },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                ],
                [
                    // mAtp
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.mission_modal.syslock.analysis_type },
                    { title: this.i18n.mission_modal.syslock.pid },
                    { title: this.i18n.mission_modal.syslock.duration },
                    { title: this.i18n.mission_modal.syslock.cpu_interval },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                ],
                [
                    // mLa
                    { title: this.i18n.mission_modal.syslock.taskname },
                    { title: this.i18n.mission_modal.syslock.analysis_type },
                    { title: this.i18n.mission_modal.syslock.app_params },
                    { title: this.i18n.mission_modal.syslock.app_path },
                    { title: this.i18n.mission_modal.syslock.cpu_interval },
                    { title: this.i18n.mission_modal.syslock.function },
                    { title: this.i18n.mission_modal.lockSummary.filname },
                    { title: this.i18n.mission_modal.lockSummary.source_path },
                ],
            ],
            [
                { title: this.i18n.mission_modal.memAccess.taskname },
                { title: this.i18n.mission_modal.memAccess.interval },
                { title: this.i18n.mission_modal.memAccess.duration },
                { title: this.i18n.mission_modal.sysConfig.task_params },
            ]
        ];
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
                url: './assets/img/mission/iconPerform.svg',
                url2: './assets/img/mission/iconhoverPerform.svg',
                url3: './assets/img/mission/icondisabledPerform.svg',
                name: this.i18n.mission_create.sysPro,
                type: 'system'
            },
            {
                url: './assets/img/mission/iconSchedule.svg',
                url2: './assets/img/mission/iconhoverSchedule.svg',
                url3: './assets/img/mission/icondisabledSchedule.svg',
                name: this.i18n.mission_create.resSchedule,
                type: 'resource_schedule'
            },
            {
                url: './assets/img/mission/iconConfig.svg',
                url2: './assets/img/mission/iconhoverConfig.svg',
                url3: './assets/img/mission/icondisabledConfig.svg',
                name: this.i18n.mission_create.sysConfig,
                type: 'system_config'
            },
            {
                url: './assets/img/mission/iconSchedule.svg',
                url2: './assets/img/mission/iconhoverSchedule.svg',
                url3: './assets/img/mission/icondisabledSchedule.svg',
                name: this.i18n.mission_create.resSchedule,
                type: 'resource_schedule'
            },
            {
                url: './assets/img/mission/iconStructure.svg',
                url2: './assets/img/mission/iconhoverStructure.svg',
                url3: './assets/img/mission/icondisabledStructure.svg',
                name: this.i18n.mission_create.structure,
                type: 'microarchitecture'
            },
            { // 访存分析
                url: './assets/img/mission/iconDdr.svg',
                url2: './assets/img/mission/iconhoverDdr.svg',
                url3: './assets/img/mission/icondisabledDdr.svg',
                name: this.i18n.mission_modal.memAccessAnalysis,
                type: 'mem_access_analysis',
                typeList: ['mem_access', 'miss_event', 'falsesharing'],
            },
            {
                url: './assets/img/mission/iconProcess.svg',
                url2: './assets/img/mission/iconhoverProcess.svg',
                url3: './assets/img/mission/icondisabledProcess.svg',
                name: this.i18n.mission_create.process,
                type: 'process-thread-analysis'
            },
            {
                url: './assets/img/mission/iconC.svg',
                url2: './assets/img/mission/iconhoverC.svg',
                url3: './assets/img/mission/icondisabledC.svg',
                name: this.i18n.mission_create.cPlusPlus,
                type: 'C/C++ Program'
            },
            {
                url: './assets/img/mission/iconLock.svg',
                url2: './assets/img/mission/iconhoverLock.svg',
                url3: './assets/img/mission/icondisabledLock.svg',
                name: this.i18n.mission_create.lock,
                type: 'system_lock'
            },
            {
                url: './assets/img/mission/iconJava.svg',
                url2: './assets/img/mission/iconhoverJava.svg',
                url3: './assets/img/mission/icondisabledJava.svg',
                name: this.i18n.mission_create.java,
                type: 'java-mixed-mode'
            },
            {// hpc
                url: './assets/img/projects/hpc_normal.svg',
                url2: './assets/img/projects/hpc_hover.svg',
                url3: './assets/img/projects/hpc_disabled.svg',
                name: this.i18n.mission_create.hpc,
                type: 'hpc_analysis'
            },
            {
                url: './assets/img/mission/iconIO.svg',
                url2: './assets/img/mission/iconhoverIO.svg',
                url3: './assets/img/mission/icondisabledIO.svg',
                name: this.i18n.mission_create.io,
                type: 'ioperformance'
            }
        ];

        // 获取 应用路径
        this.vscodeService.get({ url: this.url.configSystem }, res => {
            this.modeAppPathAllow = res.data.TARGET_APP_PATH == null ? '' : res.data.TARGET_APP_PATH;
        });
    }

    /**
     * 应用路径校验
     */
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
        const regOne = /^\/([^`\|;&$><\\!\s])+[^\/]$/;
        const regTwo = /(\/{2,})/;
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
            this.modeAppWarnMsg = (this.i18n.mission_create.modeAppPathInvalid as string)
                .replace('${path}', this.modeAppPathAllow.replace(/;/g, this.i18n.plugins_term_or));
            this.modeAppValid = false;
            return;
        }

        // 验证通过
        this.modeApplication = e;
        this.modeAppWarnMsg = '';
        this.modeAppValid = true;
    }
    /**
     * 应用参数
     */
    public missionAppParamsChange(e: string) {
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
    /**
     * 处理应用和进程ID禁用
     */
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
    /**
     * 改变进程
     * @param e  进程/线程校验
     */
    public missionPidChange(e: any) {
        if (e) {
            e = e.toString().trim();
        }
        const reg = new RegExp('^([0]{1}|[1-9]+[0-9]*)$');
        this.modePidValid = reg.test(e);
        if (!e) {
            return this.modePidWarnMsg = this.i18n.mission_create.modePidNotice;
        } else {
            if (!this.modePidValid) {
                return this.modePidWarnMsg = this.i18n.mission_create.modePidWarn;
            } else {
                this.modePid = +e + '';
                return this.modeProcessNameWarnMsg = '';
            }
        }
    }
    /**
     * 改变进程名称
     * @param e 进程名
     */
    public missionProcessNameChange(e: any) {
        if (e) {
            e = e.toString().trim();
            this.modeProcess = e;
            return this.modeProcessNameWarnMsg = '';
        } else {
            return this.modeProcessNameWarnMsg = this.i18n.mission_create.modeNameNotice;
        }
    }

    /**
     * 根据 taskInfo 返回 analysisTarget
     */
    public getAnalysisTarget({ taskInfo }) {
        const missAnalysisTarget = {
            sys: 'Profile System',
            app: 'Launch Application',
            pid: 'Attach to Process'
        };
        if (taskInfo['analysis-type'] === 'miss_event') {
            return missAnalysisTarget[taskInfo.task_param.target];
        } else {
            return taskInfo['analysis-target'] || taskInfo.analysisTarget;
        }
    }

    /**
     * 根据 taskInfo 返回分析类型
     */
    public getAnalysisType({ taskInfo }) {
        return taskInfo['analysis-type'] || taskInfo.analysisType;
    }
    /**
     * hpc annalysis
     * @param str target
     * @returns targetType
     */
    private getHpcTarget(str: string) {
        if (str === AnalysisTarget.PROFILE_SYSTEM) {
            return 0;
        } else if (str === AnalysisTarget.LAUNCH_APPLICATION) {
            return 1;
        } else {
            return 2;
        }
    }

    /**
     * open
     * @param item item
     */
    public open(item: any) {
        const analysis = 'analysis-type';
        this.isModifySchedule = true;
        this.analysisTarget = item.data['analysis-target'] || item.data.analysisTarget;
        this.hpcTarget = this.getHpcTarget(this.analysisTarget);
        this.scheduleTaskType = item.data[analysis] || item.data.analysisType;
        if (
            this.scheduleTaskType === 'memory_diagnostic' ||
            this.scheduleTaskType === 'netio_diagnostic'
        ) {
            this.showDiagnose = true;
            if (this.diagnoseSchedule) {
                this.diagnoseSchedule.checkMoreNode();
            }
        }
        this.modal.Open();
        const id = item.taskId;
        this.projectId = item.projectId;
        const url = this.toolType === ToolType.DIAGNOSE
            ? `/diagnostic-project/${encodeURIComponent(this.projectId)}/info/`
            : `/projects/${encodeURIComponent(this.projectId)}/info/`;
        this.vscodeService.get({ url }, (res: any) => {
            this.nodeConfigShow = res.data.nodeList.length > 1;
        });
        this.scheduleTaskId = item.taskId;

        if (id >= 0) {
            const option = {
                url: `/schedule-tasks/${id}/`
            };
            this.vscodeService.get(option, (res: any) => {
                const taskInfo = JSON.parse(res.data.taskInfo);
                const taskDataLocal = JSON.parse(res.data.taskInfo);
                taskDataLocal.editScheduleTask = true;
                taskDataLocal.scheduleTaskId = id;
                taskDataLocal.projectName =
                    taskDataLocal.projectname || taskDataLocal.projectName;
                taskDataLocal.projectId = item.projectId;
                this.showTaskData = Object.assign({}, taskDataLocal, res.data);
                this.projectId = item.projectId;
                this.projectName = taskDataLocal.projectName;

                const analysisTarget = this.getAnalysisTarget({ taskInfo });
                const analysisType2 = this.getAnalysisType({ taskInfo });
                this.targetClicked = [undefined, 'Profile System'].includes(analysisTarget) ? 0 : 1;
                this.modeClicked = analysisTarget === 'Attach to Process' ? 1 : 0;

                this.analysisTypesDir.forEach((item1: any, index) => {
                    if (item1.type === analysisType2 || item1.typeList && item1.typeList.includes(analysisType2)) {
                        this.typeClicked = index;
                    }
                });
                setTimeout(() => {
                    this.getTemplateData(taskInfo, true, this.showTaskData.scheduleTaskId);
                }, 800);
            });
        }

        const taskData = item.data;
        if (taskData.hasOwnProperty('sceneSolution')) {
            this.scenes = taskData.sceneSolution ? 'TYPE_BIGDATA' : 'TYPE_DISTRIBUTED';
        } else {
            this.scenes = AxiosService.PROJECT_TYPE.TYPE_GENERAL;
        }
        const analysisType = taskData[analysis] || taskData.analysisType;
        if (analysisType.indexOf('C++') > -1) {
            if (taskData['analysis-target'].indexOf('Launch') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: (taskData['app-dir'] !== undefined && taskData['app-dir'] !== '')
                            ? taskData['app-dir'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: (taskData['app-parameters'] !== undefined &&
                            taskData['app-parameters'] !== '') ? taskData['app-parameters'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_interval_ms +
                            ' (' + (taskData.interval === '0.71' ?
                                this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                        text: (taskData.interval !== undefined && taskData.interval !== '') ? taskData.interval : '--',
                        requier: ''
                    },

                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined &&
                            taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined &&
                            taskData.sourceLocation !== '') ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: itemLocal.task_param['app-dir'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: itemLocal.task_param['app-parameters'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_interval_ms + ' (' + (taskData.interval === '0.71' ?
                            this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                        text: (taskData.interval !== undefined && taskData.interval !== '') ? taskData.interval : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_mask,
                        text: (taskData['cpu-mask'] !== undefined && taskData['cpu-mask'] !== '')
                            ? taskData['cpu-mask'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_duration,
                        text: (taskData.duration !== undefined && taskData.duration !== '') ? taskData.duration : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_interval_ms + ' (' + (taskData.interval === '0.71' ?
                            this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                        text: (taskData.interval !== undefined && taskData.interval !== '') ? taskData.interval : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: (taskData['target-pid'] !== undefined && taskData['target-pid'] !== '')
                            ? taskData['target-pid'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_duration,
                        text: (taskData.duration !== undefined && taskData.duration !== '') ? taskData.duration : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: itemLocal.task_param['target-pid'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            }
        } else if (analysisType === 'system') {
            let a = '';
            if (taskData.task_param && taskData.task_param.type) {
                taskData.task_param.type.forEach((itemLocal, index) => {
                    if (index < taskData.task_param.type.length - 1) {
                        a += this.i18n.sys[itemLocal] + this.i18n.sys.douhao;
                    } else {
                        a += this.i18n.sys[itemLocal];
                    }
                });
            }
            this.configList = [
                {
                    key: this.i18n.task_name,
                    text: taskData.taskname,
                },
                {
                    key: this.i18n.sys.interval,
                    text: taskData.interval,
                },
                {
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                },
                {
                    key: this.i18n.sys.type,
                    text: a,
                },
            ];

        } else if (analysisType.indexOf('resource') > -1) {
            if (taskData['analysis-target'].indexOf('Launch') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: (taskData['app-dir'] !== undefined && taskData['app-dir'] !== '')
                            ? taskData['app-dir'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: (taskData['app-parameters'] !== undefined &&
                            taskData['app-parameters'] !== '') ? taskData['app-parameters'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: itemLocal.task_param['app-dir'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: itemLocal.task_param['app-parameters'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '') ?
                            taskData.sourceLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_duration,
                        text: (taskData.duration !== undefined && taskData.duration !== '') ?
                            taskData.duration : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: (taskData['target-pid'] !== undefined && taskData['target-pid'] !== '')
                            ? taskData['target-pid'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_duration,
                        text: (taskData.duration !== undefined && taskData.duration !== '') ? taskData.duration : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: itemLocal.task_param['target-pid'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            }
        } else if (analysisType === 'microarchitecture') {
            let simplingIndex = '';
            let samplingSpace = '';
            this.simplingArr.forEach(val => {
                if (taskData.analysisIndex.indexOf(val.id) > -1) {
                    simplingIndex += ',' + val.text;
                }
            });
            if (simplingIndex) {
                simplingIndex = simplingIndex.slice(1);
            } else {
                simplingIndex = '--';
            }

            if (taskData.samplingSpace === 'all') {
                samplingSpace = this.i18n.micarch.typeItem_all;
            } else if (taskData.samplingSpace === 'user') {
                samplingSpace = this.i18n.micarch.typeItem_user;
            } else if (taskData.samplingSpace === 'kernel') {
                samplingSpace = this.i18n.micarch.typeItem_kernel;
            } else {
                samplingSpace = '--';
            }

            if (taskData.analysisTarget.indexOf('Launch') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskName,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: taskData.appDir || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: taskData.appParameters || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.simpling,
                        text: taskData.samplingMode || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.sys.duration,
                        text: taskData.duration || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.mission_modal.syslock.cpu_interval,
                        text: taskData.interval || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.analysis,
                        text: simplingIndex,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.typeItem,
                        text: samplingSpace,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.simpling_delay,
                        text: taskData.samplingDelay ? taskData.samplingDelay : taskData.samplingDelay === 0 ? 0 : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: itemLocal.taskParam.appDir || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: itemLocal.taskParam.appParameters || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.taskParam.sourceLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.micarch.label.typeItem,
                            text: itemLocal.taskParam.samplingSpace || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.micarch.simpling_delay,
                            text: itemLocal.taskParam.samplingDelay || '0',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData.analysisTarget.indexOf('Profile') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskName,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.simpling,
                        text: taskData.samplingMode || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.sys.duration,
                        text: taskData.duration || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.mission_modal.syslock.cpu_interval,
                        text: taskData.interval || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.analysis,
                        text: simplingIndex,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.cpu_kernel,
                        text: taskData.cpuMask ? taskData.cpuMask : taskData.cpuMask === 0 ? 0 : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.typeItem,
                        text: samplingSpace,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.simpling_delay,
                        text: taskData.samplingDelay ? taskData.samplingDelay : taskData.samplingDelay === 0 ? 0 : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    },

                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.micarch.cpu_kernel,
                            text: itemLocal.taskParam.cpuMask || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.taskParam.sourceLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.micarch.label.typeItem,
                            text: itemLocal.taskParam.samplingSpace || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.micarch.simpling_delay,
                            text: itemLocal.taskParam.samplingDelay || '0',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData.analysisTarget.indexOf('Attach') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskName,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.targetPid || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.simpling,
                        text: taskData.samplingMode || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.sys.duration,
                        text: taskData.duration || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.mission_modal.syslock.cpu_interval,
                        text: taskData.interval || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.analysis,
                        text: simplingIndex,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.label.typeItem,
                        text: samplingSpace,
                        requier: ''
                    },
                    {
                        key: this.i18n.micarch.simpling_delay,
                        text: taskData.samplingDelay ? taskData.samplingDelay : taskData.samplingDelay === 0 ? 0 : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: itemLocal.taskParam.targetPid || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.taskParam.sourceLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.micarch.label.typeItem,
                            text: itemLocal.taskParam.samplingSpace || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.micarch.simpling_delay,
                            text: itemLocal.taskParam.samplingDelay || '0',
                            requier: ''
                        }
                    ];
                });
            }
        } else if (analysisType === 'system_config') {
            let a = '';
            taskData.task_param.type.forEach((itemLocal, index) => {
                if (index < taskData.task_param.type.length - 1) {
                    a += this.i18n.sys_cof.check_types[itemLocal] + this.i18n.sys.douhao;
                } else {
                    a += this.i18n.sys_cof.check_types[itemLocal];
                }
            });
            this.configList = [
                {
                    key: this.i18n.task_name,
                    text: taskData.taskname,
                    requier: ''
                },

                {
                    key: this.i18n.sys.type,
                    text: a,
                    requier: ''
                },
            ];

        } else if (analysisType === 'process-thread-analysis') {
            let a = '';
            taskData.task_param.type.forEach((typeItem, index) => {
                if (index < taskData.task_param.type.length - 1) {
                    a += this.taskType[typeItem] + this.i18n.sys.douhao;
                } else {
                    a += this.taskType[typeItem];
                }
            });
            const nameArr = [
                { key: this.i18n.task_name, text: taskData.taskname, requier: '' },
                { key: this.i18n.common_term_task_analysis_type, text: taskData['analysis-target'], requier: '' },
            ];
            const publicArr = [
                { // 采样时长
                    key: this.i18n.sys.duration,
                    text: taskData.duration,
                    requier: ''
                },
                { // 采样间隔
                    key: this.i18n.sys.interval,
                    text: taskData.interval,
                    requier: ''
                },
                { // 采样类型
                    key: this.i18n.sys.type,
                    text: a,
                    requier: ''
                },
                { // 采集线程信息
                    key: this.i18n.mission_modal.process.thread,
                    text: taskData.thread === 'enable' ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                }
            ];
            let diffArr = [];
            if (item['analysis-target'] === 'Launch Application') {
                diffArr = [
                    {
                        key: this.i18n.mission_modal.cProcess.app_path,
                        text: taskData.nodeConfig.length && taskData.nodeConfig[0].task_param
                            && taskData.nodeConfig[0].task_param['app-dir'] ?
                            taskData.nodeConfig[0].task_param['app-dir'] : '',
                        requier: ''
                    },
                    {
                        key: this.i18n.mission_modal.syslock.app_params,
                        text: taskData.nodeConfig.length && taskData.nodeConfig[0].task_param
                            && taskData.nodeConfig[0].task_param['app-parameters'] ?
                            taskData.nodeConfig[0].task_param['app-parameters'] : '--',
                        requier: ''
                    }
                ];
                publicArr.push({ // 跟踪系统调用
                    key: this.i18n.process.trace,
                    text: taskData['strace-analysis'] === 'enable'
                        ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                });
            } else if (item['analysis-target'] === 'Attach to Process') {
                diffArr = [
                    { key: this.i18n.common_term_task_crate_processName, text: item.process_name, requier: '' },
                    { key: this.i18n.common_term_task_crate_pid, text: item.pid, requier: '' }
                ];
                publicArr.push({ // 跟踪系统调用
                    key: this.i18n.process.trace,
                    text: taskData['strace-analysis'] === 'enable'
                        ? this.i18n.process.enable : this.i18n.process.disable,
                    requier: ''
                });
            }
            this.configList = [...nameArr, ...diffArr, ...publicArr];
            this.panelList = taskData.nodeConfig.map((nodeParams, index) => {
                return [
                    { // 进程ID
                        key: this.i18n.nodeConfig.processId,
                        text: nodeParams.task_param.pid,
                        requier: ''
                    },
                ];
            });
        } else if (analysisType.indexOf('system_lock') > -1) {
            if (taskData['analysis-target'].indexOf('Launch') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: (taskData['app-dir'] !== undefined && taskData['app-dir'] !== '')
                            ? taskData['app-dir'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: (taskData['app-parameters'] !== undefined && taskData['app-parameters'] !== '') ?
                            taskData['app-parameters'] : '--',
                        requier: ''
                    },

                    {
                        key: this.i18n.common_term_task_crate_interval_ms + ' (' + (taskData.interval === '0.71' ?
                            this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                        text: (taskData.interval !== undefined && taskData.interval !== '') ? taskData.interval : '--',
                        requier: ''
                    },

                    {
                        key: this.i18n.lock.form.functions_label,
                        text: taskData.functionname || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_app_path,
                            text: itemLocal.task_param['app-dir'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_parameters,
                            text: itemLocal.task_param['app-parameters'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData['analysis-target'].indexOf('Profile') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_duration,
                        text: (taskData.duration !== undefined && taskData.duration !== '') ? taskData.duration : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_interval_ms + ' (' + (taskData.interval === '0.71' ?
                            this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                        text: (taskData.interval !== undefined && taskData.interval !== '') ? taskData.interval : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.lock.form.functions_label,
                        text: taskData.functionname || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            } else if (taskData['analysis-target'].indexOf('Attach') > -1) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: (taskData['target-pid'] !== undefined && taskData['target-pid'] !== '')
                            ? taskData['target-pid'] : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_duration,
                        text: (taskData.duration !== undefined && taskData.duration !== '') ? taskData.duration : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_interval_ms + ' (' + (taskData.interval === '0.71' ?
                            this.i18n.common_term_task_crate_us : this.i18n.common_term_task_crate_ms) + ')',
                        text: (taskData.interval !== undefined && taskData.interval !== '') ? taskData.interval : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.lock.form.functions_label,
                        text: taskData.functionname || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_bs_path,
                        text: (taskData.assemblyLocation !== undefined && taskData.assemblyLocation !== '') ?
                            taskData.assemblyLocation : '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_c_path,
                        text: (taskData.sourceLocation !== undefined && taskData.sourceLocation !== '')
                            ? taskData.sourceLocation : '--',
                        requier: ''
                    }
                ];
                this.panelList = taskData.nodeConfig.map((itemLocal, index) => {
                    return [
                        {
                            key: this.i18n.common_term_task_crate_pid,
                            text: itemLocal.task_param['target-pid'] || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_bs_path,
                            text: itemLocal.task_param.assemblyLocation || '--',
                            requier: ''
                        },
                        {
                            key: this.i18n.common_term_task_crate_c_path,
                            text: itemLocal.task_param.sourceLocation || '--',
                            requier: ''
                        }
                    ];
                });
            }
        } else if (['mem_access', 'miss_event', 'falsesharing'].includes(analysisType)) { // 访存分析
            this.configList = [{
                key: this.i18n.task_name,
                text: taskData.taskname || taskData.taskName,
                requier: ''
            }];
        } else if (analysisType.indexOf('hpc') > -1) {
            if (taskData['analysis-target'].includes('Launch')) {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                    },
                    {
                        key: this.i18n.mission_modal.hpc.duration,
                        text: taskData.duration,
                    },
                    {
                        key: this.i18n.mission_modal.hpc.label,
                        text: taskData.preset === 'default' ? this.i18n.mission_modal.hpc.all :
                            taskData.preset === 'instruction-mix' ? this.i18n.mission_modal.hpc.orders :
                                this.i18n.mission_modal.hpc.top_down,
                    },
                    {
                        key: this.i18n.hpc.mission_create.collectionType,
                        text: taskData.mpi_status ? 'MPI' : 'OpenMP',
                    },
                    {
                        key: this.i18n.hpc.mission_create.openMpParams,
                        text: taskData.open_mp_param || '--',
                    }
                ];
            } else {
                this.configList = [
                    {
                        key: this.i18n.task_name,
                        text: taskData.taskname,
                    },
                    {
                        key: this.i18n.mission_modal.hpc.duration,
                        text: taskData.duration,
                    },
                    {
                        key: this.i18n.mission_modal.hpc.label,
                        text: taskData.preset === 'default' ? this.i18n.mission_modal.hpc.all :
                            taskData.preset === 'instruction-mix' ? this.i18n.mission_modal.hpc.orders :
                                this.i18n.mission_modal.hpc.top_down,
                    }
                ];
            }
            let appOrPid: any[] = [];
            if (taskData['analysis-target'] === AnalysisTarget.LAUNCH_APPLICATION) {
                appOrPid = [
                    {
                        key: this.i18n.common_term_task_crate_app_path,
                        text: taskData['app-dir'] || taskData.appDir || '--',
                    },
                    {
                        key: this.i18n.common_term_task_crate_parameters,
                        text: taskData['app-parameters'] || '--'
                    }
                ];
            } else if (taskData['analysis-target'] === AnalysisTarget.ATTACH_TO_PROCESS) {
                appOrPid = [
                    {
                        key: this.i18n.common_term_task_crate_processName,
                        text: taskData.process_name || '--',
                        requier: ''
                    },
                    {
                        key: this.i18n.common_term_task_crate_pid,
                        text: taskData.targetPid || taskData['target-pid'] || '--',
                        requier: ''
                    }
                ];
            }
            this.configList.splice(1, 0, ...appOrPid);
        } else if (analysisType === 'ioperformance') {
            this.configList = [{
                key: this.i18n.task_name,
                text: taskData.taskName,
                requier: ''
            }];
        }

        const configInfo = [];
        // 所有任务字典,eg:性能全景分析
        const analysisTypesDir = {
            system: this.i18n.mission_create.sysPro,
            system_config: this.i18n.mission_create.sysConfig,
            resource_schedule: this.i18n.mission_create.resSchedule,
            microarchitecture: this.i18n.mission_create.structure,
            mem_access: this.i18n.mission_modal.memAccessAnalysis,
            'process-thread-analysis': this.i18n.mission_create.process,
            miss_event: this.i18n.mission_modal.memAccessAnalysis,
            falsesharing: this.i18n.mission_modal.memAccessAnalysis,
            'C/C++ Program': this.i18n.mission_create.cPlusPlus,
            system_lock: this.i18n.mission_create.lock,
            'java-mixed-mode': this.i18n.mission_create.java,
            hpc_analysis: this.i18n.mission_create.hpc,
            ioperformance: this.i18n.mission_create.io
        };
        const info = {
            target: { // 分析对象
                key: this.i18n.common_term_task_analysis_type,
                text: analysisTypesDir[analysisType],
                requier: ''
            },
            sys: { // 分析类型，系统
                key: this.i18n.mission_create.analysisTarget,
                text: this.i18n.common_term_projiect_task_system,
                requier: ''
            },
            app: {  // 分析类型，应用
                key: this.i18n.mission_create.analysisTarget,
                text: this.i18n.common_term_task_crate_path,
                requier: ''
            },
            mode: { // 当分析类型为‘应用’时，有分析模式
                key: this.i18n.mission_create.mode,
                text: taskData['analysis-target'] || taskData.analysisTarget,
                requier: ''
            },
            cycleD: { // 是否是周期
                key: this.i18n.preSwitch.colectMethods,
                text: taskData.cycle ? this.i18n.preSwitch.duraColect : this.i18n.preSwitch.onceColect,
                requier: ''
            },
            pointTime: {
                key: this.i18n.preSwitch.pointTime,
                text: taskData.targetTime,
                requier: ''
            },
            date: {
                key: this.i18n.preSwitch.pointDuration,
                text: this.handleColectDate(taskData),
                requier: ''
            }
        };
        configInfo.push(info.target);
        let ifApp = false;
        if (['miss_event'].includes(analysisType)) {
            switch (taskData.task_param.target) {
                case 'sys': {
                    configInfo.push(info.sys);
                    break;
                }
                case 'app': {
                    configInfo.push(info.app);
                    configInfo.push({
                        key: this.i18n.mission_create.mode,
                        text: 'Launch Application',
                        requier: ''
                    });
                    ifApp = true;
                    break;
                }
                case 'pid': {
                    configInfo.push(info.app);
                    configInfo.push({
                        key: this.i18n.mission_create.mode,
                        text: 'Attach to Process',
                        requier: ''
                    });
                    ifApp = true;
                    break;
                }
                default: {
                    break;
                }
            }
        } else {
            const hasTarget = taskData['analysis-target'] || taskData.analysisTarget;
            const hasSysTarget =
                taskData['analysis-target'] === 'Profile System' || taskData.analysisTarget === 'Profile System';
            if (!hasTarget || hasSysTarget) {
                configInfo.push(info.sys);
            } else {
                configInfo.push(info.app);
                configInfo.push(info.mode);
                ifApp = true;
            }
        }
        for (let i = configInfo.length - 1; i >= 0; i--) {
            this.configList.splice(1, 0, configInfo[i]);
        }
        this.configList.push(info.cycleD);
        this.configList.push(info.pointTime);
        this.configList.push(info.date);
        if (ifApp) {
            this.configList = this.configList.slice(0, 4);
        } else {
            this.configList = this.configList.slice(0, 3); // 截取展示前3个信息;前边不知道啥用,不删
        }
    }

    /**
     * 导入模板传值
     * @param e e
     * @param pre pre
     * @param id id
     */
    public getTemplateData(e: any, pre?: boolean, id?: number): void {
        this.missionName = e.taskname || e.taskName;
        this.type = this.analysisTypesDir[this.typeClicked].type;
        this.missionNameChange(this.missionName); // 导入模板时，任务名称做一次校验
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
        if (child[this.type] && child[this.type].scheduleTaskId) {
            child[this.type].scheduleTaskId = id; // 直接改变子组件的id
        }
        const type1 = ['system', 'system_config', 'process-thread-analysis', 'hpc_analysis'];
        if (type1.indexOf(this.type) > -1) {
            this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
            this.strategy.IMPORTINIT(this, e, this.targetClicked, this.modeClicked);
            this.strategy.IMPORTDATA(child[this.type], e);
            return;
        } else {
            switch (this.type) {
                case 'microarchitecture':
                    this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
                    this.strategy.IMPORTINIT_NEW(this, e, this.targetClicked, this.modeClicked);
                    this.strategy.IMPORTDATA(child[this.type], e);
                    break;
                case 'mem_access_analysis':
                    const getParams = taskInfo => {
                        const analysisType = this.getAnalysisType({ taskInfo });
                        if (analysisType === 'miss_event') {
                            this.modeProcess = taskInfo.task_param.process_name;
                            return {
                                appDir: taskInfo.task_param.app,
                                appParameters: taskInfo.task_param.appArgs,
                                targetPrcessName: taskInfo.task_param.process_name,
                                targetPid: taskInfo.task_param.pid,
                            };
                        } else {
                            this.modeProcess = taskInfo.process_name;
                            return {
                                appDir: taskInfo.appDir,
                                appParameters: taskInfo.appParameters,
                                targetPrcessName: taskInfo.process_name,
                                targetPid: taskInfo.pid,
                            };
                        }
                    };

                    const { appDir, appParameters, targetPrcessName, targetPid } = getParams(e);
                    this.strategy.importInit_miss({
                        self: this,
                        e,
                        appDir,
                        appParameters,
                        targetPrcessName,
                        targetPid,
                    });

                    this.mem.init({
                        type: this.actionType || 'create',
                        params: e,
                        scheduleTaskId: id
                    });
                    break;
                case 'ioperformance':
                    this.strategy.CHILDACTION(child[this.type], this.actionType, pre, id);
                    this.strategy.importInitIo(this, e, this.targetClicked, this.modeClicked);
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

    /**
     * 保存模板
     * @param e e
     */
    public saveTemplate(e): void {
        this.keepData = e;
        this.keepModal.openModal();
    }
    /**
     * 任务名称校验
     * @param e e
     */
    public missionNameChange(e): string {
        const reg = new RegExp('^[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$');
        this.missionNameValid = reg.test(e);
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

    /**
     * 更新预约任务数据,再次向上级组件传值
     * @param strings strings
     */
    public handleUpdataPretable(strings): void {
        if (strings === 'on') {
            this.sendPretable.emit();
        }
        this.close();
    }
    /**
     * close
     */
    public close() {
        this.showDiagnose = false;
        this.modal.Close();
    }
    /**
     * 处理采集日期
     * @param obj obj
     */
    public handleColectDate(obj) {
        return obj.cycle ? (obj.cycleStart && obj.cycleStart ?
            obj.cycleStart.split('-').join('/') + '一' + obj.cycleStop.split('-').join('/') : '') :
            (obj.appointment ? obj.appointment.split('-').join('/') : '');
    }

    /**
     * handleObj
     * @param val val
     */
    handleObj(val) {
        let arr = [];
        arr = val.type.map(item => {
            return this.taskType[item];
        });
        return arr.join(',');
    }
    /**
     *  处理组件 MissionCreatePidProcessComponent 的输入值
     * @param val val 输入值
     */
    public onPidProcessUpdateValue(val: PpEmitValue) {
        this.modePid = val.pid;
        this.modeProcessName = val.process;
        this.modeProcess = val.process;
        this.modePidValid = val.valid;
    }

    public closePopDetail(e: any) {
        if (this.toolType === ToolType.DIAGNOSE) {
            this.showDiagnose = false;
        }
    }
}

