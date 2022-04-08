// 资源调度分析_create
import {
    Component, OnInit, OnChanges, ViewChild, Output, Input, EventEmitter, SimpleChanges, NgZone, ChangeDetectorRef
} from '@angular/core';
import { TiMessageService, TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from '../../service/vscode.service';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import { RunUserDataObj, LaunchRunUser } from '../mission-domain/index';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import { CustomValidatorsService } from '../../service';
import { PROJECT_TYPE } from '../../service/axios.service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-schedule',
    templateUrl: './mission-schedule.component.html',
    styleUrls: ['./mission-schedule.component.scss', '../../task-details/components/task-form/task-form.component.scss']
})
export class MissionScheduleComponent implements OnInit, OnChanges {

    constructor(
        public I18n: I18nService,
        public vscodeService: VscodeService,
        fb: FormBuilder,
        public scheduleTaskServer: ScheduleTaskService,
        public mytip: MytipService,
        private zone: NgZone,
        private tiMessage: MessageModalService,
        private tMessage: TiMessageService,
        private changeDetectorRef: ChangeDetectorRef,
        public customValidatorsService: CustomValidatorsService,
        private projectNodeListService: ProjectNodeListService
    ) {
        this.i18n = I18n.I18n();
        this.typeItem = {
            label: this.i18n.common_term_task_analysis_type,
            required: false,
        };
        this.commentItems = {
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
                }
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
            res_d: {
                label: this.i18n.common_term_task_crate_duration,
                required: true,
                placeholder: '1-300',
                min: 1,
                max: 300,
                format: 'N0',
                step: 1,
                tailPrompt: '(1~300)',
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
            j_source: {
                label: this.i18n.common_term_task_crate_java_path,
                tip: this.i18n.tip_msg.common_term_task_crate_j_source_tip,
                required: false
            },
            lock_function: {
                label: this.i18n.lock.form.functions_label,
                required: false
            },
            collectCallStack: { // 采集调用栈
                label: this.i18n.mission_create.collectCallStack,
                required: false,
            },
            profilingMode: 'Native',  // WebUI上不显示。
            sysWideState: 'on',  // WebUI上不显示。
            // 采集文件大小
            filesize: {
                label: this.i18n.falsesharing.filesize
                    + ' '
                    + this.i18n.ddr.leftParenthesis
                    + 'MiB'
                    + this.i18n.ddr.rightParenthesis,
                required: false,
                type: 'spinner',
                value: 256,
                correctable: false,
                min: 1,
                max: 512,
                step: 1,
                format: 'n0',
                iconTip: this.i18n.falsesharing.filesizeTips,
                tailPrompt: '(1~512)',
                placeholder: '1-512'
            },
        };
        this.startCheckRes = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
        this.launchItemsRForm = fb.group({
            nodeList: new FormControl([]),
            params_ctrl: new FormControl('', []),

            dire_ctrl: new FormControl('', []),
            dire_input_ctrl: new FormControl('', {
                updateOn: 'change'
            }),
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            collectCallStack: new FormControl(false, {
                updateOn: 'change',
            }),
            // 采集文件大小
            fileSize: new FormControl(256, [
                TiValidators.minValue(1),
                TiValidators.maxValue(512),
            ]),
        });
        this.profileItemsRForm = fb.group({
            nodeList: new FormControl([]),
            c_d_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(300),
            ]),

            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            mask_ctrl: new FormControl('', {
                updateOn: 'change'
            }),
            collectCallStack: new FormControl(false, {
                updateOn: 'change',
            }),
            // 采集文件大小
            fileSize: new FormControl(256, [
                TiValidators.minValue(1),
                TiValidators.maxValue(512),
            ]),
        });
        this.attachItemsRForm = fb.group({
            nodeList: new FormControl([]),
            c_d_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(300),
            ]),

            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            collectCallStack: new FormControl(false, {
                updateOn: 'change',
            }),
            // 采集文件大小
            fileSize: new FormControl(256, [
                TiValidators.minValue(1),
                TiValidators.maxValue(512),
            ]),
        });
        this.rCurrntFormR = this.launchItemsRForm;
        this.LaunchItemsR = {
            pathVal: '',
            paramsVal: '',
            dire: {
                value: '',
                saveValue: ''
            },
            cpu: {
                unit: this.i18n.common_term_task_crate_ms,
                spinnerVal: 710
            },
            maskVal: '',
            b_sVal: '',
            c_sourceVal: ''
        };
        this.attachItemsR = {
            p_t: {
                label: this.i18n.common_term_task_crate_pid,
                required: true,
                value: ''
            },
            c_dVal: 30,
            cpu: {
                unit: this.i18n.common_term_task_crate_ms,
                spinnerVal: 710
            },
            b_sVal: '',
            c_sourceVal: ''
        };
    }
    @ViewChild('nodeConfigR', { static: false }) nodeConfigR: any;
    @ViewChild('preSwitchChange', { static: false }) preSwitchChange: any;
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
        this.isHpcPro = PROJECT_TYPE.TYPE_HPC === val;
        this.onDisabledFormNodeList();
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
    /** Attach to Process: 进程名 */
    @Input() modeProcess: string;
    @Input() modeAppRunUserValid: boolean;
    @Input() taskDetail: any = {
      isFromTuningHelper: false,
    };
    @Input() modeAppPathAllow: string;

    public isLaunch: boolean;
    public isAttach: boolean;
    public isProfile: boolean;
    public isEdit: boolean;
    public isRestart: boolean;
    public i18n: any;
    public typeItem: any = {};
    public commentItems: any = {};
    public launchItemsRForm: FormGroup;
    public profileItemsRForm: FormGroup;
    public attachItemsRForm: FormGroup;
    public rCurrntFormR: FormGroup;
    public LaunchItemsR: any = {};
    public attachItemsR: any = {};
    public startCheckRes: any = {};
    public rTypeOptions: Array<any> = [
        {
            label: 'Launch Application',
            id: 'launch',
        },
        {
            label: 'Profile System',
            id: 'profile',
        },
        {
            label: 'Attach to Process', // 2月版本暂时隐藏
            id: 'attach',
        },
    ];
    public rTypeSelected: any = this.rTypeOptions[1];
    public typeRDesc = '';

    public formDatas: any;
    public keepData: any; // 保存模板
    public appAndPidValid = false;
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public runUserDataObj: LaunchRunUser = {};
    // 修改预约任务 接收从预约传来的值
    public editScheduleTask = false; // 判断是否是修改
    public scheduleTaskId: any; // 保存修改的预约任务ID
    public filesizeLong: boolean;

    public collectFileBlur: SpinnerBlurInfo;
    public samplingDurationBlur: SpinnerBlurInfo;
    public startCheckSys: any = {};   // 立即启动

    /** 工程下的所以节点 */
    public allNodeList: Array<any> = [];
    /** 工程类型 */
    public isHpcPro = false;
    /** hpc工程节点选择器是否禁用 */
    public isSelectNodeDisabled = false;
    analysisScene = PROJECT_TYPE;
    scenesStash: PROJECT_TYPE;
    isLoading = true;

    /**
     * 组件初始化
     */
    async ngOnInit() {
        try{
            const resp = await this.projectNodeListService.getProjectNodes(this.projectId);
            this.isLoading = false;
            if (resp?.data?.nodeList) {
                // 存储工程下的节点信息
                this.allNodeList = resp.data.nodeList;
                if (!(this.isEdit || this.isRestart)) {
                    this.rCurrntFormR.controls.nodeList.setValue(
                        this.allNodeList.length > 10 ? this.allNodeList.slice(0, 10) : this.allNodeList
                    );
                }
            }
        } catch (err) {
            this.isLoading = false;
        }

        this.filesizeLong = this.isModifySchedule &&
            this.commentItems.filesize.label === 'Size of the collected file (MB)';

        this.launchItemsRForm.controls.dire_input_ctrl.disable(); // 初始化dir输入框灰化
        this.profileItemsRForm.controls.c_d_ctrl.setValue(60);
        this.attachItemsRForm.controls.c_d_ctrl.setValue(60);
        if (this.isRestart) {
            setTimeout(() => {
                this.preSwitchChange.switchState = false;
            }, 0);
        }
        this.setSpinnerBlur();
    }

    /**
     * 节点选择控件是否需要校验
     */
    private onDisabledFormNodeList() {
        if (this.isHpcPro) {
        this.profileItemsRForm.controls.nodeList.enable();
        this.launchItemsRForm.controls.nodeList.enable();
        this.attachItemsRForm.controls.nodeList.enable();
        } else {
        this.profileItemsRForm.controls.nodeList.disable();
        this.launchItemsRForm.controls.nodeList.disable();
        this.attachItemsRForm.controls.nodeList.disable();
        }
    }

    /**
     * 切换多节点配置组件开关
     * @param event 多节点组件开发状态
     */
    public selectNodeDisable(event: boolean){
        this.isSelectNodeDisabled = event;
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
                        this.startCheckRes.checked = true;
                    } else {
                        this.runUserData = {
                            runUser: false,
                            user: '',
                            password: ''
                        };
                    }
                    break;
                case 'modeApplicationUser':
                    this.runUserData.user = changes.modeApplicationUser.currentValue;
                    break;
                case 'modeApplicationPassWord':
                    this.runUserData.password = changes.modeApplicationPassWord.currentValue;
                    break;
                case 'typeId':
                    this.appAndPidValid = false;
                    if (this.nodeConfigR) {
                        this.nodeConfigR.clear();
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
                this.rCurrntFormR = this.profileItemsRForm;
                this.rTypeSelected = this.rTypeOptions[1];
                break;
            case 1:
                this.isProfile = false;
                this.isLaunch = true;
                this.appAndPidValid = this.modeAppValid;
                this.isAttach = false;
                this.rCurrntFormR = this.launchItemsRForm;
                this.rTypeSelected = this.rTypeOptions[0];
                break;
            case 2:
                this.isProfile = false;
                this.isLaunch = false;
                this.isAttach = true;
                this.appAndPidValid = this.modePidValid;
                this.rCurrntFormR = this.attachItemsRForm;
                this.rTypeSelected = this.rTypeOptions[2];
                break;
        }
        this.setSpinnerBlur();
    }

    /**
     * 获取预约任务列表下的所有任务名
     */
    getScheduleTaskList(): Promise<string[]> {
        const option = {
            url: '/schedule-tasks/batch/',
            method: 'GET'
        };
        return new Promise((resolve) => {
            this.vscodeService.get(option, (res: any) => {
                const taskNames = res.data.scheduleTaskList.map((item: any) => item.taskName);
                resolve(taskNames);
            });
        });
    }

    /**
     * 创建资源调度分析任务
     */
    async createResAnalysis(isEdit: boolean) {
        const taskNames = await this.getScheduleTaskList();
        if (isEdit !== false && taskNames.includes(this.taskName)) {
            this.vscodeService.showInfoBox(this.i18n.tip_msg.task_exist_error, 'error');
            return null;
        }

        const form = this.isLaunch
            ? this.launchItemsRForm
            : this.isAttach
                ? this.attachItemsRForm
                : this.profileItemsRForm;

        const context = this;
        const ctrls = form.controls;
        const params: any = {
            'analysis-type': 'resource_schedule',
            projectname: context.projectName,
            taskname: context.taskName,
            'analysis-target': context.rTypeSelected.label,
            'profiling-mode': 'Native',
            assemblyLocation: ctrls.b_s_ctrl.value,
            'dis-callstack': ctrls.collectCallStack.value,
            size: ctrls.fileSize.value || 256,
        };
        if (context.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['app-working-dir'] = ctrls.dire_input_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (context.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
        }
        if (context.isAttach) {
            params['process-name'] = this.modeProcess;
            params['target-pid'] = this.modePid || '';
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.nodeConfigR.switchStatus) {
            params.switch = true;
            this.getFormDatas();
            const nodeData: any = this.nodeConfigR.getNodesConfigParams({ formData: this.formDatas }).nodeConfig;
            this.runUserDataObj = this.nodeConfigR.getNodesConfigParams({}).runUserData;
            if (context.isLaunch) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    return item;
                });
            }
            if (context.isProfile) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.duration = params.duration;
                    return item;
                });
            }
            if (context.isAttach) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.duration = params.duration;
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
        let urlAnalysis = '';
        //  预约任务 preSwitch 预约组件名
        if (this.preSwitchChange.switchState) {
            this.startCheckRes.checked = false;
            const flag = await this.createPreMission(
                this.preSwitchChange,
                params,
                'post'
            );
            if (flag) {
                this.startCheckRes.checked = true;
            }
        } else {
            //  非预约任务
            if (isEdit) {
                urlAnalysis = '/tasks/' + this.restartAndEditId + '/';
            } else {
                urlAnalysis = '/tasks/';
            }
            if (isEdit) {
                context.vscodeService
                    .put({ url: urlAnalysis, params },
                        (data: any) => {
                            // 修改任务提示
                            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                                const data1 = data.data;
                                if (data.code === 'SysPerf.Success') {
                                    this.vscodeService.showTuningInfo(data.message, 'info', 'modifyTask');
                                    if (this.startCheckRes.checked) {
                                        this.startDataSamplingTask(
                                            this.projectName,
                                            this.taskName,
                                            data1.id,
                                            params
                                        );
                                    } else {
                                        const message = {
                                            cmd: 'openSomeNode',
                                            data: {
                                                taskId: data1.id,
                                                projectName: this.projectName,
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
                                    if (context.startCheckRes.checked) {
                                        context.startDataSamplingTask(
                                            context.projectName,
                                            context.taskName,
                                            data.data.id,
                                            params
                                        );
                                    } else {
                                        setTimeout(() => {
                                            context.closeTab.emit({});
                                        }, 200);
                                    }
                                }
                            }
                        });
            } else {
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    const createMissionInstance = this.tMessage.open({
                        id: 'create',
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: '<div>' +
                            '<div class="warn-tip-msg">' +
                            '<div class="ti3-icon ti3-icon-warn"></div>' + this.i18n.secret_count + '</div>' +
                            '</div>',
                        dismiss: (): void => {
                            this.zone.run(() => {
                                createMissionInstance.close();
                            });
                        },
                        okButton: {
                            show: true,
                            click: (): void => {
                                context.vscodeService
                                    .post({ url: urlAnalysis, params },
                                        (res: any) => {
                                            if (res.code === 'SysPerf.Success') {
                                                this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                                let timer = 0;
                                                const data = res.data;
                                                if (context.startCheckRes.checked) {
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
                                    createMissionInstance.close();
                                });
                            }
                        },
                        cancelButton: {
                            show: true,
                            click: (): void => {
                                this.zone.run(() => {
                                    createMissionInstance.close();
                                });
                            }
                        }
                    });
                } else {
                    this.tiMessage.open({
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: this.i18n.secret_count,
                        close() {
                            context.vscodeService
                                .post({ url: urlAnalysis, params },
                                    (res: any) => {
                                        if (res.status) {
                                            context.vscodeService.showInfoBox(res.message, 'error');
                                        } else {
                                            let timer = 0;
                                            const data = res.data;
                                            if (context.startCheckRes.checked) {
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
                                                    context.i18n.plugins_term_task_create_success, {
                                                    0: context.taskName
                                                }), 'info');
                                            }, timer);
                                        }
                                    });
                        },
                    });
                }
            }
        }
        return null;
    }
    /**
     * 当配置节点参数没开时
     */
    async getNodeConfigDatas() {
        this.getFormDatas();
        // 当开关组件没有打开时
        return new Promise((resolve) => {
            const data: any[] = [];
            if (this.isHpcPro) {
                const curSelectNode = this.rCurrntFormR.controls.nodeList.value;
                curSelectNode.forEach((item: any) => {
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
            } else {
                this.vscodeService.get({ url: `/projects/${this.projectId}/info/` }, (res: any) => {
                    res.data.nodeList.forEach((item: any) => {
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
        });
    }
    /**
     * 创建/修改 预约任务函数
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
        if (!this.editScheduleTask) {
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
            return null;
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
                        this.nodeConfigR.clear();
                        this.sendPretable.emit('on');
                        this.closeTab.emit({});
                        resolve(true);
                    }

                });
            });
        }

    }
    /**
     * 获取数据
     */
    public getFormDatas() {
        const form = this.isLaunch
            ? this.launchItemsRForm
            : this.isAttach
                ? this.attachItemsRForm
                : this.profileItemsRForm;

        const self = this;
        const ctrls = form.controls;
        const params: any = {
            'analysis-type': 'resource_schedule',
            projectname: self.projectName,
            taskname: self.taskName,
            'analysis-target': self.rTypeSelected.label,
            'profiling-mode': 'Native',
            assemblyLocation: ctrls.b_s_ctrl.value,
            'dis-callstack': ctrls.collectCallStack.value,
            size: ctrls.fileSize.value || 256,
        };
        if (self.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['app-working-dir'] = ctrls.dire_input_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (self.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
        }
        if (self.isAttach) {
            params['process-name'] = this.modeProcess;
            params['target-pid'] = this.modePid || '';
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.preSwitchChange.switchState) {
            // 预约
            if (this.preSwitchChange.selected === 1) {
                const durationArr = this.preSwitchChange.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchChange.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchChange.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        this.formDatas = params;
        return;
    }
    /**
     * 取消按钮
     */
    public close() {
        this.closeTab.emit({});
        if (this.isModifySchedule) {
            this.sendPretable.emit();
        }
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            // 关闭当前页面
            this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
        }
    }
    /**
     * 导入模板
     */
    public getTemplateData(e: any): void {
        this.taskNameValid = true;
        this.modeAppValid = true;
        this.modePidValid = true;
        if (e['analysis-target'].indexOf('Launch') > -1) {
            this.typeRDesc = this.i18n.common_term_task_type_launch;
            this.isLaunch = true;
            this.isProfile = false;
            this.isAttach = false;

            this.rTypeSelected = this.rTypeOptions[0];
            this.launchItemsRForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.launchItemsRForm.controls.collectCallStack.setValue(e['dis-callstack']);
            this.launchItemsRForm.controls.fileSize.setValue(
                e.size
            );
            this.launchItemsRForm.controls.nodeList.setValue(
                e.nodeConfig
            );
            this.rCurrntFormR = this.launchItemsRForm;
        } else if (e['analysis-target'].indexOf('Profile') > -1) {
            this.typeRDesc = this.i18n.common_term_task_type_profile;
            this.isLaunch = false;
            this.isProfile = true;
            this.isAttach = false;

            this.rTypeSelected = this.rTypeOptions[1];
            this.profileItemsRForm.controls.c_d_ctrl.setValue(e.duration);
            this.profileItemsRForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.profileItemsRForm.controls.collectCallStack.setValue(e['dis-callstack']);
            this.profileItemsRForm.controls.fileSize.setValue(
                e.size
            );
            this.profileItemsRForm.controls.nodeList.setValue(
                e.nodeConfig
            );
            this.rCurrntFormR = this.profileItemsRForm;
        } else if (e['analysis-target'].indexOf('Attach') > -1) {
            this.typeRDesc = this.i18n.common_term_task_type_attach;
            this.isLaunch = false;
            this.isProfile = false;
            this.isAttach = true;

            this.rTypeSelected = this.rTypeOptions[2];
            this.attachItemsRForm.controls.c_d_ctrl.setValue(e.duration);
            this.attachItemsRForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.attachItemsRForm.controls.collectCallStack.setValue(e['dis-callstack']);
            this.attachItemsRForm.controls.fileSize.setValue(
                e.size
            );
            this.attachItemsRForm.controls.nodeList.setValue(
                e.nodeConfig
            );
            this.rCurrntFormR = this.attachItemsRForm;
        }
        // 预约任务数据导入
        this.preSwitchChange.importTemp(e);
        // 配置节点参数
        if (e.switch) {
            switch (e['analysis-target']) {
                case 'Launch Application':
                    this.onDisableForm('r_launch');
                    break;
                case 'Profile System':
                    this.onDisableForm('r_profile');
                    break;
                case 'Attach to Process':
                    this.onDisableForm('r_attach');
                    break;
                default:
                    break;
            }
            // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
            setTimeout(() => this.nodeConfigR.importTemp(e.nodeConfig));
        } else {
            this.nodeConfigR.clear();
        }
        if (this.isEdit || this.isRestart) {
            this.preSwitchChange.isEdit = this.isEdit || this.isRestart;
        }
    }
    /**
     * 当点击开启参数配置时
     */
    public onControlNode(taskName: any) {
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
     * 禁用
     */
    public onDisableForm(taskName: any) {
        switch (taskName) {
            case 'r_attach':
                this.attachItemsRForm.controls.b_s_ctrl.disable();
                this.handlePidTidDisable.emit(true);
                this.sendAppOrPidDisable.emit(true);
                break;
            case 'r_launch':
                this.sendAppOrPidDisable.emit(true);
                this.launchItemsRForm.controls.params_ctrl.disable();
                this.launchItemsRForm.controls.b_s_ctrl.disable();
                break;
            case 'r_profile':
                this.profileItemsRForm.controls.b_s_ctrl.disable();
                break;
            default:
                this.handlePidTidDisable.emit(false);
                this.sendAppOrPidDisable.emit(false);
                this.attachItemsRForm.controls.b_s_ctrl.enable();
                this.launchItemsRForm.controls.params_ctrl.enable();
                this.launchItemsRForm.controls.b_s_ctrl.enable();
                this.profileItemsRForm.controls.b_s_ctrl.enable();
                break;
        }
    }
    /**
     * 保存模板
     */
    async saveTemplates() {
        const form = this.isLaunch
            ? this.launchItemsRForm
            : this.isAttach
                ? this.attachItemsRForm
                : this.profileItemsRForm;

        const self = this;
        const ctrls = form.controls;
        const params: any = {
            'analysis-type': 'resource_schedule',
            projectname: self.projectName,
            taskname: self.taskName,
            'analysis-target': self.rTypeSelected.label,
            'profiling-mode': 'Native',
            assemblyLocation: ctrls.b_s_ctrl.value,
            'dis-callstack': ctrls.collectCallStack.value,
            size: ctrls.fileSize.value || 256,
        };
        if (self.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['app-working-dir'] = ctrls.dire_input_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (self.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
        }
        if (self.isAttach) {
            params['process-name'] = this.modeProcess;
            params['target-pid'] = this.modePid || '';
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.preSwitchChange.switchState) {
            // 预约
            if (this.preSwitchChange.selected === 1) {
                const durationArr = this.preSwitchChange.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchChange.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchChange.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        if (this.nodeConfigR.switchStatus) {
            params.switch = true;
            this.getFormDatas();
            const nodeData: any = this.nodeConfigR.getNodesConfigParams({ formData: this.formDatas }).nodeConfig;
            if (self.isLaunch) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    return item;
                });
            }
            if (self.isProfile) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.duration = params.duration;
                    return item;
                });
            }
            if (self.isAttach) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.duration = params.duration;
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
     * 监测下拉框改变事件
     */
    public directory_change(data: any) {
        let ctrls: any;
        ctrls = this.launchItemsRForm.controls;
        if (data.id === 'customize') {
            ctrls.dire_input_ctrl.enable();
            ctrls.dire_input_ctrl.setValue('');
        } else {
            ctrls.dire_input_ctrl.disable();
            ctrls.dire_input_ctrl.setValue('');
        }
    }

    /**
     * 清空任务参数
     */
    public clear() {
        this.nodeConfigR.clear();
        this.preSwitchChange.clear();
    }
    /**
     * 立即启动
     */
    public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
        const option: any = { status: 'running' };
        if (this.isLaunch) {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        this.vscodeService
            .get({
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
     * 打开节点配置
     */
    public handleNodeEmit(e: any) {
        this.handleNodeEmitIndex.emit(e);
    }
    /**
     * 采集时长 点击事件
     */
    public duration_change(data: any) {
        this.updateWebViewPage();
    }
    /**
     * 采集调用栈点击事件
     */
    public collectCallStack_change(data: any) {
        this.updateWebViewPage();
    }
    /**
     * 采集文件大小 点击事件
     */
    public collectFileSize_change(data: any) {
        this.updateWebViewPage();
    }
    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        const form = this.isLaunch
            ? this.launchItemsRForm
            : this.isAttach
                ? this.attachItemsRForm
                : this.profileItemsRForm;

        this.collectFileBlur = {
            control: form.controls.fileSize,
            min: 1,
            max: 512,
        };
        this.samplingDurationBlur = {
            control: form.controls.c_d_ctrl,
            min: 1,
            max: 300,
        };
    }
    /**
     * 微调器鼠标移出数据校验
     * @param e event
     * @param type 类型
     */
    selectBlur(e: any, type: any) {
        setTimeout(() => {
            const value = e.target.value;
            if (type === 'c_d_ctrl') {
                const maxVal = this.samplingDurationBlur.max;
                const minVal = this.samplingDurationBlur.min;
                if (value < minVal) {
                    this.profileItemsRForm.controls[type].setValue(minVal);
                    this.attachItemsRForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.profileItemsRForm.controls[type].setValue(maxVal);
                    this.attachItemsRForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'fileSize') {
                const maxVal = this.collectFileBlur.max;
                const minVal = this.collectFileBlur.min;
                if (value < minVal) {
                    this.launchItemsRForm.controls[type].setValue(minVal);
                    this.profileItemsRForm.controls[type].setValue(minVal);
                    this.attachItemsRForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.launchItemsRForm.controls[type].setValue(maxVal);
                    this.profileItemsRForm.controls[type].setValue(maxVal);
                    this.attachItemsRForm.controls[type].setValue(maxVal);
                }
            }
        }, 100);
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
     * IntellIj刷新webview页面
     */
    private updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.checkNoChanges();
            this.changeDetectorRef.detectChanges();
        }
    }
}
