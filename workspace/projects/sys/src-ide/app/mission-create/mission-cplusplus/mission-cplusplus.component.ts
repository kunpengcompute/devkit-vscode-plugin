import {
    Component, OnInit, ViewChild, Output, Input, EventEmitter,
    SimpleChanges, OnChanges, NgZone, ChangeDetectorRef
} from '@angular/core';
import { TiMessageService, TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { AxiosService, PROJECT_TYPE } from '../../service/axios.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import { RunUserDataObj, LaunchRunUser } from './../mission-domain/index';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import { CustomValidatorsService } from '../../service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-cplusplus',
    templateUrl: './mission-cplusplus.component.html',
    styleUrls: [
        './mission-cplusplus.component.scss',
        '../../task-details/components/task-form/task-form.component.scss',
        '../mission-structure/mission-structure.component.scss'
    ]
})

export class MissionCplusplusComponent implements OnInit, OnChanges {

    constructor(
        public I18n: I18nService,
        public Axios: AxiosService,
        fb: FormBuilder,
        public scheduleTaskServer: ScheduleTaskService,
        public mytip: MytipService,
        public vscodeService: VscodeService,
        private tMessage: TiMessageService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private tiMessage: MessageModalService,
        public customValidatorsService: CustomValidatorsService,
        private projectNodeListService: ProjectNodeListService
    ) {
        this.i18n = I18n.I18n();
        this.typeItem = {
            label: this.i18n.common_term_task_analysis_type,
            required: false,
        };
        // launch 表单校验设置
        this.launchItemsCForm = fb.group({
            nodeList: new FormControl([]),
            kcore: new FormControl(false, {
                updateOn: 'change',
            }),
            c_r_ctrl: new FormControl('', [
                TiValidators.minValue(1),
                TiValidators.maxValue(100),
            ]),
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_user,
                id: 'user',
            }, []),
            cpu_ctrl: new FormControl('', []),
            cpu_spinner_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(1000),
            ]),
            dire_ctrl: new FormControl('', []),
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
        });

        this.cCurrntFormC = this.launchItemsCForm;
        // attach 表单校验设置
        this.attachItemsCForm = fb.group({
            nodeList: new FormControl([]),
            c_d_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(300),
            ]),
            kcore: new FormControl(false, {
                updateOn: 'change',
            }),
            c_r_ctrl: new FormControl('', [
                TiValidators.minValue(1),
                TiValidators.maxValue(100),
            ]),
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_user,
                id: 'user',
            }, []),
            cpu_ctrl: new FormControl('', []),
            cpu_spinner_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(1000),
            ]),
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
        });
        // profile 表单校验设置
        this.profileItemsCForm = fb.group({
            nodeList: new FormControl([]),
            c_d_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(300),
            ]),
            kcore: new FormControl(false, {
                updateOn: 'change',
            }),
            c_r_ctrl: new FormControl('', [
                TiValidators.minValue(1),
                TiValidators.maxValue(100),
            ]),
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_user,
                id: 'user',
            }, []),
            cpu_ctrl: new FormControl('', []),
            cpu_spinner_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(1000),
            ]),
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            mask_ctrl: new FormControl('', [this.customValidatorsService.checkSampCPUMask()]),
        });
        this.commentItems = { // 公共表单配置信息
            path: {
                label: this.i18n.common_term_task_crate_app_path,
                required: true,
            },
            params_c: {
                label: this.i18n.common_term_task_crate_parameters,
                required: false,
            },
            params_java: {
                label: this.i18n.common_term_task_crate_parameters,
                required: true,
            },
            dire: {
                label: this.i18n.common_term_task_crate_work_director,
                required: true,
                options: [
                    {
                        label: this.i18n.common_term_task_start_path,
                        id: 'application path'
                    }, {
                        label: this.i18n.common_term_task_start_custerm,
                        id: 'customize'
                    }
                ]
            },
            cpu: {
                label: this.i18n.common_term_task_crate_interval_ms,
                required: true,
                options: [
                    {
                        label: this.i18n.common_term_task_start_high_precision,
                        id: 'higher'
                    },
                    {
                        label: this.i18n.common_term_task_start_custerm,
                        id: 'customize'
                    }
                ],
                spinner: {
                    placeholder: '1-1,000',
                    min: 1,
                    max: 1000,
                    format: 'N0',
                    step: 1
                },
                tailPrompt: '(1~1,000)',
            },
            c_d: {
                label: this.i18n.common_term_task_crate_duration,
                required: true,
                placeholder: '1-300',
                min: 1,
                max: 300,
                format: 'N0',
                step: 1,
                tailPrompt: '(1~300)',
            },
            typeItem: {
                label: this.i18n.micarch.label.typeItem,
                selected: {
                    label: this.i18n.micarch.typeItem_user,
                    id: 'user',
                },
                options: [
                    {
                        label: this.i18n.micarch.typeItem_user,
                        id: 'user',
                    },
                    {
                        label: this.i18n.micarch.typeItem_kernel,
                        id: 'kernel',
                    },
                    {
                        label: this.i18n.micarch.typeItem_all,
                        id: 'all',
                    },
                ],
            },
            kcore: { // 内核函数关联汇编指令
                label: this.i18n.mission_create.kcore,
                required: false,
            },
            c_r: {
                label: this.i18n.falsesharing.filesize
                    + ' '
                    + this.i18n.ddr.leftParenthesis
                    + 'MiB'
                    + this.i18n.ddr.rightParenthesis,
                required: false,
                placeholder: '1-100',
                min: 1,
                max: 100,
                format: 'N0',
                step: 1,
                tip: this.i18n.falsesharing.filesizeTips,
                tailPrompt: '(1~100)',
            },
            res_d: {
                label: this.i18n.common_term_task_crate_duration,
                required: true,
                placeholder: '1-60',
                min: 1,
                max: 60,
                format: 'N0',
                step: 1,
            },
            mask: {
                label: this.i18n.ddr.cpuToBeSamples,
                tip: this.i18n.tip_msg.common_term_task_crate_mask_tip,
                required: false
            },
            b_s: {
                label: this.i18n.common_term_task_crate_bs_path,
                tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
                required: false
            },
            c_source: {
                label: this.i18n.common_term_task_crate_c_path,
                tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
                required: false
            },
            j_source: {
                label: this.i18n.common_term_task_crate_java_path,
                tip: this.i18n.tip_msg.common_term_task_crate_j_source_tip,
                required: false
            },
            lock_function: {
                label: this.i18n.lock.form.functions_label,
                required: false
            },
            profilingMode: 'Native',  // WebUI上不显示。
            sysWideState: 'on'   // WebUI上不显示。
        };
        this.LaunchItemsC = { // Launch表单配置信息
            pathVal: '',
            paramsVal: '',
            dire: {
                value: '',
                saveValue: '',
            },
            cpu: {
                unit: this.i18n.common_term_task_crate_ms,
                spinnerVal: 710,
            },
            maskVal: '',
            b_sVal: '',
            c_sourceVal: '',
        };

        this.profileItemC = { // profile表单配置信息
            c_dVal: 30,
            cpu: {
                unit: this.i18n.common_term_task_crate_ms,
                spinnerVal: 710,
            },
            maskVal: '',
            b_sVal: '',
            c_sourceVal: '',
        };

        this.attachItemsC = { // attach表单配置信息
            p_t: {
                label: this.i18n.common_term_task_crate_pid,
                required: true,
                value: '',
            },
            c_dVal: 30,
            cpu: {
                unit: this.i18n.common_term_task_crate_ms,
                spinnerVal: 710,
            },
            b_sVal: '',
            c_sourceVal: '',
        };
        this.startCheckC = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
    }
    @ViewChild('nodeConfigC', { static: false }) nodeConfigC: any;
    @ViewChild('preSwitchC', { static: false }) preSwitchC: any;
    @ViewChild('pretable', { static: false }) pretable: any;
    @Output() private sendMissionKeep = new EventEmitter<any>();
    @Output() private sendPretable = new EventEmitter<any>();
    @Output() private sendAppOrPidDisable = new EventEmitter<any>();
    @Output() private handlePidTidDisable = new EventEmitter<any>();
    @Output() private closeTab = new EventEmitter<any>();
    @Output() private handleNodeEmitIndex = new EventEmitter<any>();

    @Input()
    set scenes(val: PROJECT_TYPE){
        if (null == val){
            return ;
        }
        this.scenesStash = val;
        PROJECT_TYPE.TYPE_HPC === val
            ? this.cCurrntFormC.get('nodeList').enable()
            : this.cCurrntFormC.get('nodeList').disable();
    }
    get scenes(){
        return this.scenesStash;
    }
    @Input() labelWidth: string;
    @Input() projectName: string;
    @Input() taskName: string;
    @Input() taskNameValid: boolean;
    @Input() typeId: number;
    @Input() modeApplication: string;
    @Input() modeAppParams: string;
    @Input() switchState: boolean;
    @Input() modeApplicationUser: string;
    @Input() modeApplicationPassWord: string;
    @Input() modePid: string;
    @Input() modeAppValid: boolean;
    @Input() modePidValid: boolean;
    @Input() projectId: number;
    @Input() restartAndEditId: number;
    @Input() nodeConfigShow: boolean;
    @Input() nodeConfigedData: any;
    @Input() isModifySchedule: boolean;
    @Input() selectWidth: string;
    /** Attach to Process: 进程名 */
    @Input() modeProcess: string;
    @Input() modeAppRunUserValid: boolean;
    @Input() taskDetail: any = {
      isFromTuningHelper: false,
    };
    @Input() modeAppPathAllow: string;

    analysisScene = PROJECT_TYPE;
    scenesStash: PROJECT_TYPE;
    public isLaunch = true;
    public isAttach = false;
    public isProfile = false;
    public isEdit: boolean;
    public i18n: any;
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public runUserDataObj: LaunchRunUser = {};
    // 获取主题颜色
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public isRestart = false; // 是否重启
    public typeItem: any = {};
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public keepData: any; // 保存模板数据
    public appAndPidValid = false; // pid参数校验
    public commentItems: any = {}; // 公共表单配置信息
    public launchItemsCForm: FormGroup; // Launch表单配置信息
    public attachItemsCForm: FormGroup; // attach表单配置信息
    public profileItemsCForm: FormGroup; // profile表单配置信息
    public currentTargetCForm: FormGroup; // 当前表单标识
    public cCurrntFormC: FormGroup; // 当前表单
    public LaunchItemsC: any = {}; // Launch 表单校验设置
    public profileItemC: any = {}; // profile 表单校验设置
    public attachItemsC: any = {}; // attach 表单校验设置
    public startCheckC: any = {}; // 预约任务状态
    public cTypeOptions: Array<any> = [ // 分析类型
        {
            label: 'Launch Application',
            id: 'launch',
        },
        {
            label: 'Profile System',
            id: 'profile',
        },
        {
            label: 'Attach to Process',
            id: 'attach',
        },
    ];
    public cTypeSelected: any = this.cTypeOptions[0]; // 当前类型选择
    public typeCDesc = ''; // 当前类型提示
    public formDatas: any; // 获取当前表单输入数据

    // 修改预约任务 接收从预约传来的值
    public editScheduleTask = false; // 判断是否是修改
    public scheduleTaskId: any; // 保存修改的预约任务ID
    public isShow: any = false;
    // 字符串
    public strObj = {
        kcore: 'Associate Kernel Function with Assembly Code', // 内核函数关联汇编指令
    };

    public intervalBlur: SpinnerBlurInfo;
    public collectFileBlur: SpinnerBlurInfo;
    public samplingDurationBlur: SpinnerBlurInfo;
    public startCheckSys: any = {}; // 立即启动

    // 工程下节点信息
    nodeList: any[] = [];
    isSelectNodeDisabled: boolean;
    nodeConfig: any[] = [];
    isLoading = true;

    /*
     * 初始化
     */
    async ngOnInit() {
        try{
            const resp = await this.projectNodeListService.getProjectNodes(this.projectId);
            this.isLoading = false;
            if (resp?.data?.nodeList) {
                // 存储工程下的节点信息
                this.nodeList = resp.data.nodeList;
                this.setNodeListParam(this.nodeConfig, this.nodeList);
            }
        } catch (err) {
            this.isLoading = false;
        }
        // vscode颜色主题适配
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.isShow = await this.checkNodeConfigCompoent();

        if (!(this.isEdit || this.isRestart || this.isModifySchedule)) {
            this.profileItemsCForm.controls.cpu_spinner_ctrl.setValue('1');
            this.profileItemsCForm.controls.c_d_ctrl.setValue('30');
            this.profileItemsCForm.controls.c_r_ctrl.setValue('100');
            this.profileItemsCForm.controls.cpu_ctrl.setValue({
                label: this.i18n.common_term_task_start_custerm,
                id: 'customize',
            });

            this.attachItemsCForm.controls.cpu_spinner_ctrl.setValue('1');
            this.attachItemsCForm.controls.c_d_ctrl.setValue('30');
            this.attachItemsCForm.controls.c_r_ctrl.setValue('100');
            this.attachItemsCForm.controls.cpu_ctrl.setValue({
                label: this.i18n.common_term_task_start_custerm,
                id: 'customize',
            });

            this.launchItemsCForm.controls.cpu_spinner_ctrl.setValue('1');
            this.launchItemsCForm.controls.c_r_ctrl.setValue('100');
            this.launchItemsCForm.controls.dire_ctrl.setValue({
                label: this.i18n.common_term_task_start_path,
                id: 'application path',
            });
            this.launchItemsCForm.controls.cpu_ctrl.setValue({
                label: this.i18n.common_term_task_start_custerm,
                id: 'customize',
            });
        }

        this.setSpinnerBlur();
    }
    /**
     * 周期
     * @param changes 改变
     */
    ngOnChanges(changes: SimpleChanges) {
        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'switchState':
                    if (changes.switchState.currentValue) {
                        this.runUserData.runUser = true;
                        // 指定用户，用户名由用户输入
                        this.runUserData.user = '';
                        this.startCheckC.checked = true;
                    } else {
                        this.runUserData = {
                            runUser: false,
                            user: '',
                            password: ''
                        };
                    }
                    break;
                case 'modeApplicationUser':
                    if (changes.modeApplicationUser.currentValue) {
                        this.runUserData.user = changes.modeApplicationUser.currentValue;
                    }
                    break;
                case 'modeApplicationPassWord':
                    if (changes.modeApplicationPassWord.currentValue) {
                        this.runUserData.password = changes.modeApplicationPassWord.currentValue;
                    }
                    break;
                case 'typeId':
                    this.appAndPidValid = false;
                    if (this.nodeConfigC) {
                        this.nodeConfigC.clear();
                    }
                    break;
                default: break;
            }
        }

        switch (changes.typeId ? changes.typeId.currentValue : this.typeId) {
            case 0:
                this.isProfile = true;
                this.appAndPidValid = true;
                this.isLaunch = false;
                this.isAttach = false;
                this.cCurrntFormC = this.profileItemsCForm;
                this.cTypeSelected = this.cTypeOptions[1];
                break;
            case 1:
                this.isProfile = false;
                this.isLaunch = true;
                this.appAndPidValid = this.modeAppValid;
                this.isAttach = false;
                this.cCurrntFormC = this.launchItemsCForm;
                this.cTypeSelected = this.cTypeOptions[0];
                break;
            case 2:
                this.isProfile = false;
                this.isLaunch = false;
                this.isAttach = true;
                this.appAndPidValid = this.modePidValid;
                this.cCurrntFormC = this.attachItemsCForm;
                this.cTypeSelected = this.cTypeOptions[2];
                break;
        }
        this.setSpinnerBlur();
    }

    // 初始化或导入数据时给表单nodeList赋值
    setNodeListParam(nodeConfig: any[], allNodeList: any[]){
        if (allNodeList.length) {
            let nodeList = [];
            const isNotCreat = this.isEdit || this.isRestart || this.isModifySchedule;
            nodeList = nodeConfig.length && isNotCreat
                ? nodeConfig.map((item: any) => {
                    return allNodeList.filter(
                    (nodeItem: any) => nodeItem.id === item.nodeId
                    )[0];
                })
                : allNodeList;
            this.cCurrntFormC.get('nodeList').patchValue(
                nodeList.length > 10 ? nodeList.slice(0, 10) : nodeList
            );
        }
        if (this.isRestart){
            setTimeout(() => {
                this.preSwitchC.switchState = false;
            }, 0);
        }
    }

    selectNodeDisable(event: boolean){
        this.isSelectNodeDisabled = event;
    }

    /**
     * 字典改变
     * @param data 数据
     * @param modal 模式
     */
    public directory_change(data: any, modal: any) {
        let ctrls: any;
        if (modal === 'LaunchItemsC') {
            ctrls = this.launchItemsCForm.controls;
        }
    }
    /**
     * 采样时长改变
     * @param data 数据
     * @param cpu CPU
     * @param type 类型
     */
    public cpu_interval_change(data: any, cpu: any, type: string) {
        const THIS = cpu;
        THIS.unit =
            data.id === 'higher'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms;
        const spinnerVal = data.id === 'higher' ? '710' : '1';
        this.currentTargetCForm = this.isLaunch
            ? this.launchItemsCForm
            : this.isAttach
                ? this.attachItemsCForm
                : this.profileItemsCForm;
        this.currentTargetCForm.controls.cpu_spinner_ctrl.setValue(spinnerVal);
        if (data.id === 'higher') {
            this.currentTargetCForm.controls.cpu_spinner_ctrl.disable();
        } else {
            this.currentTargetCForm.controls.cpu_spinner_ctrl.enable();
        }
        this.updateWebViewPage();
    }

    /**
     * 创建任务
     * @param isEdit 编辑状态
     */
    async createAnalysis(isEdit: boolean) {
        const context = this;
        this.currentTargetCForm = this.isLaunch
            ? this.launchItemsCForm
            : this.isAttach
                ? this.attachItemsCForm
                : this.profileItemsCForm;
        const ctrls = context.currentTargetCForm.controls;
        const params: any = {
            'analysis-type': 'C/C++ Program',
            projectname: context.projectName,
            taskname: context.taskName,
            'analysis-target': context.cTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === context.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : '0.71',
            'profiling-mode': 'Native',
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value,
            kcore: ctrls.kcore.value,
            size: ctrls.c_r_ctrl.value,
            samplingSpace: ctrls.typeItem_ctrl.value
        };
        if (context.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['profiling-mode'] = 'Native';
        }
        if (context.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
            params['cpu-mask'] = ctrls.mask_ctrl.value;
        }
        if (context.isAttach) {
            params['target-pid'] = this.modePid || '';
            params.process_name = this.modeProcess || '';
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.nodeConfigC.switchStatus) {
            params.switch = true;
            const nodeData: any = this.nodeConfigC.getNodesConfigParams({}).nodeConfig;
            this.runUserDataObj = this.nodeConfigC.getNodesConfigParams({}).runUserData;
            if (context.isLaunch) {
                params.nodeConfig = nodeData.map((item: any) => {
                    (item.task_param || item.taskParam).taskname = params.taskname;
                    (item.task_param || item.taskParam).interval = params.interval;
                    return item;
                });
            }
            if (context.isProfile) {
                params.nodeConfig = nodeData.map((item: any) => {
                    (item.task_param || item.taskParam).taskname = params.taskname;
                    (item.task_param || item.taskParam).interval = params.interval;
                    (item.task_param || item.taskParam).duration = params.duration;
                    return item;
                });
            }
            if (context.isAttach) {
                params.nodeConfig = nodeData.map((item: any) => {
                    (item.task_param || item.taskParam).taskname = params.taskname;
                    (item.task_param || item.taskParam).interval = params.interval;
                    (item.task_param || item.taskParam).duration = params.duration;
                    return item;
                });
            }
        } else {
            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas();
        }
        if (this.isRestart) {
            this.restartFunction(params);
            return false;
        }
        //  预约任务 preSwitch 预约组件名
        if (this.preSwitchC.switchState) {
            this.startCheckC.checked = false;
            const flag = await this.createPreMission(this.preSwitchC, params, 'post');
            if (flag) {
                this.startCheckC.checked = true;
            }
        } else {
            if (isEdit) {
                let urlAnalysis = '';
                urlAnalysis = '/tasks/' + this.restartAndEditId + '/';
                context.vscodeService.put({ url: urlAnalysis, params }, (data: any) => {
                    // 修改任务提示
                    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        if (data.code === 'SysPerf.Success') {
                            this.vscodeService.showTuningInfo(data.message, 'info', 'modifyTask');
                            if (this.startCheckC.checked) {
                                context.startDataSamplingTask(
                                    context.projectName,
                                    context.taskName,
                                    data.data.id,
                                    params
                                );
                            } else {
                                const message = {
                                    cmd: 'openSomeNode',
                                    data: {
                                        taskId: data.data.id,
                                        projectName: context.projectName,
                                    }
                                };
                                this.vscodeService.showTuningInfo('cancel', 'info', 'modifyTask');
                                this.vscodeService.postMessage(message, null);
                            }
                        } else {
                            this.vscodeService.showTuningInfo(data.message, 'error', 'modifyTask');
                        }
                    } else {
                        if (data.status) {
                            context.vscodeService.showInfoBox(data.message, 'error');
                        } else {
                            setTimeout(() => {
                                this.vscodeService.showInfoBox(
                                    this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                        0: this.taskName
                                    }), 'info');
                            }, 3500);
                            if (context.startCheckC.checked) {
                                context.startDataSamplingTask(
                                    context.projectName,
                                    context.taskName,
                                    data.data.id,
                                    params
                                );
                            } else {
                                setTimeout(() => {
                                    this.vscodeService.showInfoBox(
                                        this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                            0: this.taskName
                                        }), 'info');
                                    context.closeTab.emit({});
                                }, 200);
                            }
                        }
                    }
                });

            } else {
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    const createCplusplusInstance = this.tMessage.open({
                        id: 'create',
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: '<div>' +
                            '<div class="warn-tip-msg">' +
                            '<div class="ti3-icon ti3-icon-warn"></div>' + this.i18n.secret_count + '</div>' +
                            '</div>',
                        dismiss: (): void => {
                            this.zone.run(() => {
                                createCplusplusInstance.close();
                            });
                        },
                        okButton: {
                            show: true,
                            click: (): void => {
                                let urlAnalysis = '';
                                urlAnalysis = '/tasks/';
                                context.vscodeService
                                    .post({ url: urlAnalysis, params },
                                        (res: any) => {
                                            if (res.code === 'SysPerf.Success') {
                                                this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                                let timer = 0;
                                                const data = res.data;
                                                if (context.startCheckC.checked) {
                                                    timer = 3500;
                                                    context.startDataSamplingTask(
                                                        context.projectName,
                                                        context.taskName,
                                                        data.id,
                                                        params
                                                    );
                                                } else {
                                                    const message = {
                                                        cmd: 'openSomeNode',
                                                        data: {
                                                            taskId: data.id,
                                                            projectName: context.projectName
                                                        }
                                                    };
                                                    this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                                                    this.vscodeService.postMessage(message, null);
                                                }
                                            } else {
                                                this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                                            }
                                        });
                                this.zone.run(() => {
                                    createCplusplusInstance.close();
                                });
                            }
                        },
                        cancelButton: {
                            show: true,
                            click: (): void => {
                                this.zone.run(() => {
                                    createCplusplusInstance.close();
                                });
                            }
                        }

                    });
                    document.styleSheets[0].addRule('.ti3-icon-warn:before', 'content: "\\e907"!important');
                } else {
                    const self = this;
                    this.tiMessage.open({
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: this.i18n.secret_count,
                        close() {
                            let urlAnalysis = '';

                            urlAnalysis = '/tasks/';
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
                            context.vscodeService
                                .post({ url: urlAnalysis, params },
                                    (res: any) => {
                                        if (res.status) {
                                            context.vscodeService.showInfoBox(res.message, 'error');
                                        } else {
                                            let timer = 0;
                                            const data = res.data;
                                            if (context.startCheckC.checked) {
                                                timer = 3500;
                                                context.startDataSamplingTask(
                                                    context.projectName,
                                                    context.taskName,
                                                    data.id,
                                                    params
                                                );
                                            } else {
                                                context.closeTab.emit({
                                                    title: `${data.taskname}-${params.nodeConfig[0].nickName}`,
                                                    id: data.id,
                                                    startCheckCNo: true,
                                                    nodeid: params.nodeConfig[0].nodeId,
                                                    taskId: data.id,
                                                    taskType: data['analysis-type'],
                                                    status: data['task-status'],
                                                    projectName: context.projectName
                                                });
                                            }
                                            setTimeout(() => {
                                                context.vscodeService.showInfoBox(context.I18n.I18nReplace(
                                                    context.i18n.plugins_term_task_create_success,
                                                    { 0: context.taskName }), 'info');
                                            }, timer);
                                        }
                                    });
                        },
                    });
                }
            }
        }
    }
    /**
     * 当点击开启参数配置时
     * @param taskName 名称
     */
    public onControlNode(taskName: string) {
        if (taskName) {
            // 开启
            this.getFormDatas();
            let target = '';
            if (this.formDatas.hasOwnProperty('analysis-target')) {
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
                case 'java-mixed-mode':
                    firstName = 'j_';
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
                case 'micarch':
                    firstName = 'm_';
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
            this.onDisableForm(disableTarget);
        } else {
            // 关闭
            this.onDisableForm('');
        }
    }
    /**
     * 禁用表单修改项
     */
    public onDisableForm(taskName: any) {
        switch (taskName) {
            case 'c_launch':
                this.launchItemsCForm.controls.b_s_ctrl.disable();
                this.launchItemsCForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                break;
            case 'c_attach':
                this.attachItemsCForm.controls.b_s_ctrl.disable();
                this.attachItemsCForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                this.handlePidTidDisable.emit(true);
                break;
            case 'c_profile':
                this.profileItemsCForm.controls.mask_ctrl.disable();
                this.profileItemsCForm.controls.b_s_ctrl.disable();
                this.profileItemsCForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                break;

            default:
                this.handlePidTidDisable.emit(false);
                this.sendAppOrPidDisable.emit(false);
                this.profileItemsCForm.controls.mask_ctrl.enable();
                this.profileItemsCForm.controls.b_s_ctrl.enable();
                this.profileItemsCForm.controls.source_ctrl.enable();
                this.attachItemsCForm.controls.b_s_ctrl.enable();
                this.attachItemsCForm.controls.source_ctrl.enable();
                this.launchItemsCForm.controls.b_s_ctrl.enable();
                this.launchItemsCForm.controls.source_ctrl.enable();
                break;
        }
    }
    /**
     * 获取表单数据
     */
    public getFormDatas() {
        const self = this;
        this.currentTargetCForm = this.isLaunch
            ? this.launchItemsCForm
            : this.isAttach
                ? this.attachItemsCForm
                : this.profileItemsCForm;
        const errors = TiValidators.check(this.currentTargetCForm);
        const ctrls = self.currentTargetCForm.controls;
        const params: any = {
            'analysis-type': 'C/C++ Program',
            projectname: self.projectName,
            taskname: self.taskName,
            'analysis-target': self.cTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : '0.71',
            'profiling-mode': 'Native',
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value,
            kcore: ctrls.kcore.value,
            size: ctrls.c_r_ctrl.value,
            samplingSpace: ctrls.typeItem_ctrl.value
        };
        if (self.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['profiling-mode'] = 'Native';
        }
        if (self.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
            params['cpu-mask'] = ctrls.mask_ctrl.value;
        }
        if (self.isAttach) {
            params['target-pid'] = this.modePid || '';
            params.process_name = this.modeProcess || '';
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.preSwitchC.switchState) {
            if (this.preSwitchC.selected === 1) {
                const durationArr = this.preSwitchC.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchC.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchC.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        this.formDatas = params;
        return;
    }
    /**
     * 当配置节点参数没开时
     */
    async getNodeConfigDatas() {
        this.getFormDatas();
        // 当开关组件没有打开时
        const url = `/projects/${this.projectId}/info/`;
        return new Promise((resolve) => {
            const data: any = [];
            const nodeList = PROJECT_TYPE.TYPE_HPC === this.scenes
                ? this.cCurrntFormC.get('nodeList').value
                : this.nodeList;
            nodeList.forEach((item: any) => {
                this.runUserDataObj[item.nodeIp] = {
                    runUser: this.runUserData.runUser,
                    user_name: this.runUserData.user || '',
                    password: this.runUserData.password
                };
                data.push({
                    nodeId: item.id,
                    nickName: item.nickName,
                    task_param: Object.assign({}, { status: false }, this.formDatas),
                });
            });
            resolve(data);
        });
    }

    /**
     * 保存模板
     */
    async saveTemplates() {
        const self = this;
        this.currentTargetCForm = this.isLaunch
            ? this.launchItemsCForm
            : this.isAttach
                ? this.attachItemsCForm
                : this.profileItemsCForm;
        const errors = TiValidators.check(this.currentTargetCForm);
        const ctrls = self.currentTargetCForm.controls;
        const params: any = {
            'analysis-type': 'C/C++ Program',
            projectname: self.projectName,
            taskname: self.taskName,
            'analysis-target': self.cTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : '0.71',
            'profiling-mode': 'Native',
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value,
            kcore: ctrls.kcore.value,
            size: ctrls.c_r_ctrl.value,
            samplingSpace: ctrls.typeItem_ctrl.value
        };
        if (self.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['profiling-mode'] = 'Native';
        }
        if (self.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
            params['cpu-mask'] = ctrls.mask_ctrl.value;
        }
        if (self.isAttach) {
            params['target-pid'] = this.modePid || '';
            params.process_name = this.modeProcess || '';
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.preSwitchC.switchState) {
            if (this.preSwitchC.selected === 1) {
                const durationArr = this.preSwitchC.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchC.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchC.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        if (this.nodeConfigC.switchStatus) {
            params.switch = true;
            const nodeData: any = this.nodeConfigC.getNodesConfigParams({}).nodeConfig;
            if (self.isLaunch) {
                params.nodeConfig = nodeData.map((item: any) => {
                    (item.task_param || item.taskParam).taskname = params.taskname;
                    (item.task_param || item.taskParam).interval = params.interval;
                    return item;
                });
            }
            if (self.isProfile) {
                params.nodeConfig = nodeData.map((item: any) => {
                    (item.task_param || item.taskParam).taskname = params.taskname;
                    (item.task_param || item.taskParam).interval = params.interval;
                    (item.task_param || item.taskParam).duration = params.duration;
                    return item;
                });
            }
            if (self.isAttach) {
                params.nodeConfig = nodeData.map((item: any) => {
                    (item.task_param || item.taskParam).taskname = params.taskname;
                    (item.task_param || item.taskParam).interval = params.interval;
                    (item.task_param || item.taskParam).duration = params.duration;
                    return item;
                });
            }
        } else {
            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas();
        }
        this.keepData = params;
        this.sendMissionKeep.emit(this.keepData);
    }

    /**
     * 导入模板
     */
    public getTemplateData(e: any): void {
      if (e['analysis-target'].indexOf('Launch') > -1) {
        this.typeCDesc = this.i18n.common_term_task_type_launch;
        this.cTypeSelected = this.cTypeOptions[0];
        this.launchItemsCForm.patchValue({
          cpu_ctrl: this.commentItems.cpu.options[1],
          cpu_spinner_ctrl: e.interval,
          typeItem_ctrl: e.samplingSpace,
          kcore: e.kcore,
          c_r_ctrl: e.size,
          b_s_ctrl: e.assemblyLocation,
          source_ctrl: e.sourceLocation,
        });
        if (e.interval === '0.71') {
          this.launchItemsCForm
            .get('cpu_ctrl')
            .setValue(this.commentItems.cpu.options[0]);
        }
        (self as any).webviewSession.setItem(
          'dire_ctrl',
          this.launchItemsCForm.controls.dire_ctrl.value.id
        );
      } else if (e['analysis-target'].indexOf('Profile') > -1) {
        this.typeCDesc = this.i18n.common_term_task_type_profile;
        this.cTypeSelected = this.cTypeOptions[1];
        this.profileItemsCForm.patchValue({
          cpu_ctrl: this.commentItems.cpu.options[1],
          cpu_spinner_ctrl: e.interval,
          c_d_ctrl: e.duration,
          typeItem_ctrl: e.samplingSpace,
          kcore: e.kcore,
          c_r_ctrl: e.c_r_ctrl,
          mask_ctrl: e['cpu-mask'],
          b_s_ctrl: e.assemblyLocation,
          source_ctrl: e.sourceLocation,
        });
        if (e.interval === '0.71') {
          this.profileItemsCForm
            .get('cpu_ctrl')
            .setValue(this.commentItems.cpu.options[0]);
        }
        this.cCurrntFormC = this.profileItemsCForm;
      } else if (e['analysis-target'].indexOf('Attach') > -1) {
        this.typeCDesc = this.i18n.common_term_task_type_attach;
        this.cTypeSelected = this.cTypeOptions[2];
        this.attachItemsCForm.patchValue({
          c_d_ctrl: e.duration,
          cpu_ctrl: this.commentItems.cpu.options[1],
          cpu_spinner_ctrl: e.interval,
          typeItem_ctrl: e.samplingSpace,
          kcore: e.kcore,
          c_r_ctrl: e.size,
          b_s_ctrl: e.assemblyLocation,
          source_ctrl: e.sourceLocation,
        });
        if (e.interval === '0.71') {
          this.attachItemsCForm
            .get('cpu_ctrl')
            .setValue(this.commentItems.cpu.options[0]);
        }
        this.cCurrntFormC = this.attachItemsCForm;
      }
      this.nodeConfig = e.nodeConfig;
      this.setNodeListParam(e.nodeConfig, this.nodeList);

      // 预约任务数据导入
      this.preSwitchC.importTemp(e);
      // 配置节点参数
      if (e.switch) {
        switch (e['analysis-target']) {
          case 'Launch Application':
            this.onDisableForm('c_launch');
            break;
          case 'Profile System':
            this.onDisableForm('c_profile');
            break;
          case 'Attach to Process':
            this.onDisableForm('c_attach');
            break;
          default:
            break;
        }
        // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
        setTimeout(() => this.nodeConfigC.importTemp(e.nodeConfig));
      } else {
        this.nodeConfigC.clear();
      }
      if (this.isEdit || this.isRestart) {
        this.preSwitchC.isEdit = this.isEdit || this.isRestart;
      }
    }

    /**
     *   创建/修改 预约任务函数
     */
    public createPreMission(context: any, params: any, method: any) {
        //  周期
        if (context.selected === 1) {
            const durationArr = context.durationTime.split(' ');
            params.cycle = true;
            params.targetTime = context.pointTime;
            params.cycleStart = durationArr[0];
            params.cycleStop = durationArr[1];
            params.appointment = '';
        } else {
            // 单次
            const onceArr = context.onceTime.split(' ');
            params.cycle = false;
            params.targetTime = onceArr[1];
            params.appointment = onceArr[0];
            params.cycleStart = '';
            params.cycleStop = '';
        }
        // 预约任务请求地址
        let urlAnalysis = '';
        if (!this.editScheduleTask) { // 创建任务
            urlAnalysis = '/schedule-tasks/';
        } else {
            urlAnalysis = '/schedule-tasks/' + this.scheduleTaskId + '/';
            method = 'put';
        }
        const options = {
            url: urlAnalysis,
            method,
            params
        };

        const message = {
            cmd: 'getData',
            data: options
        };

        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.post(options, (res: any) => {
                if (res.code === 'SysPerf.Success') {
                    this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                    this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                } else {
                    this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                }
            });
        } else {
            return new Promise((resolve, reject) => {
                this.vscodeService.postMessage(message, (res: any) => {
                    if (res.status) {
                        this.vscodeService.showInfoBox(res.message, 'error');
                    } else {
                        if (this.editScheduleTask) {
                            this.vscodeService.showInfoBox(
                                this.I18n.I18nReplace(this.i18n.plugins_term_scheduleTask_modify_success, {
                                    0: this.taskName
                                }), 'info');
                            this.editScheduleTask = false;
                        } else {
                            this.vscodeService.showInfoBox(
                                this.I18n.I18nReplace(this.i18n.plugins_term_scheduleTask_create_success, {
                                    0: this.taskName
                                }), 'info');
                        }
                        context.clear();
                        this.nodeConfigC.clear();
                        this.sendPretable.emit('on');
                        this.closeTab.emit({});
                        resolve(true);
                    }
                });
            });
        }

    }

    /**
     *   清空任务参数
     */
    public clear() {
        this.nodeConfigC.clear();
        this.preSwitchC.clear();
    }

    /**
     *  取消按钮
     */
    public close() {
        this.closeTab.emit({});
        if (this.isModifySchedule) {
            this.sendPretable.emit();
        }
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            // 关闭当前页面
            this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
        }
    }

    /**
     *    立即启动
     */
    public startDataSamplingTask(projectname: string, taskname: string, id: any, params: any) {
        const option: any = { status: 'running' };
        if (this.isLaunch) {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        this.vscodeService.get({
            url: '/res-status/?type=disk_space&project-name=' +
                encodeURIComponent(projectname) +
                '&task-name=' +
                encodeURIComponent(taskname)
        },
            () => {
                const self = this;

                this.vscodeService
                    .put({ url: '/tasks/' + id + '/status/', params: option },
                        (res: any) => {
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

    /**
     *  刷新页面数据
     * @param params  重启参数
     */
    public restartFunction(params: any) {
        const self = this;
        params.status = 'restarted';
        if (self.isLaunch) {
            params.user_message = this.dealRunUserDataObj(self.runUserDataObj);
        }
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
        self.vscodeService
            .put({ url: '/tasks/' + this.restartAndEditId + '/status/', params },
                (res: any) => {
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
                    setTimeout(() => {
                        this.vscodeService.showInfoBox(
                            this.I18n.I18nReplace(this.i18n.plugins_term_task_reanalyze_success, {
                                0: this.taskName
                            }), 'info');
                    }, 3500);
                    this.isRestart = false;
                });
    }
    /**
     *   传递节点参数
     */
    public handleNodeEmit(e: any) {
        this.handleNodeEmitIndex.emit(e);
    }

    /**
     * 检测页面节点数量，判断是否显示节点配置模块
     */
    public checkNodeConfigCompoent() {
        return new Promise((resolve) => {
            this.vscodeService.get({ url: `/projects/${this.projectId}/info/` }, (res: any) => {
                if (res.data.nodeList && res.data.nodeList.length > 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.currentTargetCForm = this.isLaunch
            ? this.launchItemsCForm
            : this.isAttach
                ? this.attachItemsCForm
                : this.profileItemsCForm;

        this.intervalBlur = {
            control: this.currentTargetCForm.controls.cpu_spinner_ctrl,
            min: 1,
            max: 1000,
        };
        this.collectFileBlur = {
            control: this.currentTargetCForm.controls.c_r_ctrl,
            min: 1,
            max: 100,
        };
        this.samplingDurationBlur = {
            control: this.currentTargetCForm.controls.c_d_ctrl,
            min: 1,
            max: 300,
        };
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
    /**
     * 微调器鼠标移出数据校验
     * @param e event
     * @param type 类型
     */
    selectBlur(e: any, type: any) {
        setTimeout(() => {
            const value = e.target.value;
            if (type === 'cpu_spinner_ctrl') {
                const maxVal = this.intervalBlur.max;
                const minVal = this.intervalBlur.min;
                if (value < minVal) {
                    this.launchItemsCForm.controls[type].setValue(minVal);
                    this.profileItemsCForm.controls[type].setValue(minVal);
                    this.attachItemsCForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.launchItemsCForm.controls[type].setValue(maxVal);
                    this.profileItemsCForm.controls[type].setValue(maxVal);
                    this.attachItemsCForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'c_r_ctrl') {
                const maxVal = this.collectFileBlur.max;
                const minVal = this.collectFileBlur.min;
                if (value < minVal) {
                    this.launchItemsCForm.controls[type].setValue(minVal);
                    this.profileItemsCForm.controls[type].setValue(minVal);
                    this.attachItemsCForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.launchItemsCForm.controls[type].setValue(maxVal);
                    this.profileItemsCForm.controls[type].setValue(maxVal);
                    this.attachItemsCForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'c_d_ctrl') {
                const maxVal = this.samplingDurationBlur.max;
                const minVal = this.samplingDurationBlur.min;
                if (value < minVal) {
                    this.profileItemsCForm.controls[type].setValue(minVal);
                    this.attachItemsCForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.profileItemsCForm.controls[type].setValue(maxVal);
                    this.attachItemsCForm.controls[type].setValue(maxVal);
                }
            }
        }, 100);
    }
    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }

  getButState() {
    return !(
      this.cCurrntFormC.valid &&
      this.taskNameValid &&
      this.appAndPidValid &&
      (this.preSwitchC.previewState || !this.preSwitchC.switchState)
    );
  }
}
