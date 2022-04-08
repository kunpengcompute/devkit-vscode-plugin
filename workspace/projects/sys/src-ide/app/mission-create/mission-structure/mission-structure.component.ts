// 微架构分析_create
import {
    Component, OnInit, ViewChild, Output, Input,
    EventEmitter, SimpleChanges, OnChanges, NgZone, ChangeDetectorRef
} from '@angular/core';
import { TiModalService } from '@cloud/tiny3';
import { TiValidators, TiValidationConfig, TiMessageService } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { VscodeService, HTTP_STATUS } from '../../service/vscode.service';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import { RunUserDataObj, LaunchRunUser } from './../mission-domain/index';
import { CustomValidatorsService } from '../../service';
import { PROJECT_TYPE } from '../../service/axios.service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-structure',
    templateUrl: './mission-structure.component.html',
    styleUrls: ['./mission-structure.component.scss']
})
export class MissionStructureComponent implements OnInit, OnChanges {

    constructor(
        public I18n: I18nService,
        public fb: FormBuilder,
        public scheduleTaskServer: ScheduleTaskService,
        private tiModal: TiModalService,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef,
        private tiMessage: TiMessageService,
        public vscodeService: VscodeService,
        public customValidatorsService: CustomValidatorsService,
        private projectNodeListService: ProjectNodeListService) {
        this.i18n = I18n.I18n();

        // micarch校验
        this.launchItemsMicarchForm = fb.group({
            nodeList: new FormControl([]),
            dire_ctrl: new FormControl('', []),
            dire_input_ctrl: new FormControl('', {
                updateOn: 'change',
            }),
            mode_ctrl: new FormControl('summary', []),
            cpu_ctrl: new FormControl({
                label: this.i18n.common_term_task_start_custerm,
                id: 'customize',
            }, []),
            cpu_spinner_ctrl: new FormControl(5, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(999),
            ]),
            analysisTypes: new FormControl('', [TiValidators.required]),
            sampling_ctrl: new FormControl(60, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(900),
            ]),
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_all,
                id: 'all',
            }, []),
            timing_spinner_ctrl: new FormControl(0, [
                TiValidators.required,
                TiValidators.minValue(0),
                TiValidators.maxValue(900),
                this.customValidatorsService.validTheSizeRelationship({
                    relatedFormControlName: 'sampling_ctrl',
                    tip: this.i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
                    calcExpression: ([valueA, valueB]) => valueA + valueB <= 900,
                })
            ]),
            b_s_ctrl: new FormControl('', {
                updateOn: 'change',
            }),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            kcore: new FormControl(false, {
                updateOn: 'change',
            }),
            fileSize: new FormControl(1024, [
                TiValidators.minValue(1),
                TiValidators.maxValue(1024),
            ]),
        });
        this.micarchCurrntForm = this.launchItemsMicarchForm;
        this.profileItemsMicarchForm = fb.group({
            nodeList: new FormControl([]),
            mode_ctrl: new FormControl('summary', []),
            cpu_ctrl: new FormControl({
                label: this.i18n.common_term_task_start_custerm,
                id: 'customize',
            }, []),
            cpu_spinner_ctrl: new FormControl(5, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(999),
            ]),
            analysisTypes: new FormControl('', [TiValidators.required]),
            sampling_ctrl: new FormControl(60, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(900),
            ]),
            cpu_kernel_ctrl: new FormControl('', [this.customValidatorsService.checkSampCPUMask()]),
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_all,
                id: 'all',
            }, []),
            timing_spinner_ctrl: new FormControl(0, [
                TiValidators.required,
                TiValidators.minValue(0),
                TiValidators.maxValue(900),
                this.customValidatorsService.validTheSizeRelationship({
                    relatedFormControlName: 'sampling_ctrl',
                    tip: this.i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
                    calcExpression: ([valueA, valueB]) => valueA + valueB <= 900,
                })
            ]),
            b_s_ctrl: new FormControl('', {
                updateOn: 'change',
            }),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            kcore: new FormControl(false, {
                updateOn: 'change',
            }),
            fileSize: new FormControl(1024, [
                TiValidators.minValue(1),
                TiValidators.maxValue(1024),
            ]),
        });
        this.attachItemsMicarchForm = fb.group({
            nodeList: new FormControl([]),
            mode_ctrl: new FormControl('summary', []),
            cpu_ctrl: new FormControl({
                label: this.i18n.common_term_task_start_custerm,
                id: 'customize',
            }, []),
            cpu_spinner_ctrl: new FormControl(5, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(999),
            ]),
            analysisTypes: new FormControl('', [TiValidators.required]),
            sampling_ctrl: new FormControl(60, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(900),
            ]),
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_all,
                id: 'all',
            }, []),
            timing_spinner_ctrl: new FormControl(0, [
                TiValidators.required,
                TiValidators.minValue(0),
                TiValidators.maxValue(900),
                this.customValidatorsService.validTheSizeRelationship({
                    relatedFormControlName: 'sampling_ctrl',
                    tip: this.i18n.mission_create.crossFieldValidation.samplingDelayAndSamplingTime,
                    calcExpression: ([valueA, valueB]) => valueA + valueB <= 900,
                })
            ]),
            b_s_ctrl: new FormControl('', {
                updateOn: 'change',
            }),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            kcore: new FormControl(false, {
                updateOn: 'change',
            }),
            fileSize: new FormControl(1024, [
                TiValidators.minValue(1),
                TiValidators.maxValue(1024),
            ]),
        });

        this.micarchItems = {
            kcore: { // 内核函数关联汇编指令
                label: this.i18n.mission_create.kcore,
                required: false,
            },
            params_c: {
                label: this.i18n.common_term_task_crate_parameters,
                required: false,
            },
            path: {
                label: this.i18n.common_term_task_crate_app_path,
                required: true,
            },
            dire: {
                label: this.i18n.common_term_task_crate_work_director,
                required: true,
                options: [
                    {
                        label: this.i18n.common_term_task_start_path,
                        id: 'application path',
                    },
                    {
                        label: this.i18n.common_term_task_start_custerm,
                        id: 'customize',
                    },
                ],
            },
            analysis: {
                disabled: false,
                label: this.i18n.micarch.label.analysis,
                options: [
                    { id: 'badSpeculation', text: 'Bad Speculation', tip: this.i18n.micarch.badSpeculation_tip },
                    {
                        id: 'resourceBound',
                        text: 'Back-End Bound->Resource Bound',
                        tip: this.i18n.micarch.resourceBound_tip
                    },
                    { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: this.i18n.micarch.memoryBound_tip },
                    { id: 'frontEndBound', text: 'Front-End Bound', tip: this.i18n.micarch.frontEndBound_tip },
                    { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: this.i18n.micarch.coreBound_tip }
                ]
            },
            typeItem: {
                label: this.i18n.micarch.label.typeItem,
                selected: {
                    label: this.i18n.micarch.typeItem_all,
                    id: 'all',
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
                    }
                ],
            },
            samplingSwitch: {
                label: this.i18n.micarch.label.simpling,
                required: false,
                selected: 'summary',
                colspan: 1,
                tip: this.i18n.micarch.summury_mode_tip,
                options: [
                    {
                        key: this.i18n.micarch.summury_mode,
                        id: 'summary',
                        disable: false,
                    },
                    {
                        key: this.i18n.micarch.detail_mode,
                        id: 'detail',
                        disable: false,
                    },
                ],
                lastValue: 'summary'
            },
            res_d: {
                placeholder: '1-900',
                min: 1,
                max: 900,
                format: 'N0',
                step: 1,
                tailPrompt: '(1~900)',
                summary_value: 60,
                detail_value: 10
            },
            cpu: {
                label: this.i18n.common_term_task_crate_interval_ms,
                required: true,
                tip: this.i18n.micarch.simpling_delay_tip,
                options: [
                    {
                        label: this.i18n.common_term_task_start_high_precision,
                        id: 'higher',
                    },
                    {
                        label: this.i18n.common_term_task_start_custerm,
                        id: 'customize',
                    },
                ],
                spinner: {
                    placeholder: '1-999',
                    min: 1,
                    max: 999,
                    format: 'N0',
                    step: 1,
                    tailPrompt: '(1~999)'
                },
                spinner_delay: {
                    placeholder: '0-900',
                    min: 0,
                    max: 900,
                    format: 'N0',
                    step: 1,
                    tailPrompt: '(0~900)'
                },
            },
            b_s: {
                label: this.i18n.common_term_task_crate_bs_path,
                tip: this.i18n.tip_msg.common_term_task_crate_c_bs_tip,
                required: false,
            },
            c_source: {
                label: this.i18n.common_term_task_crate_c_path,
                tip: this.i18n.tip_msg.common_term_task_crate_c_source_tip,
                required: false,
            },
            fileSize: {
                placeholder: '1-1024',
                min: 1,
                max: 1024,
                format: 'N0',
                step: 1,
                tailPrompt: '(1~1,024)'
            },
            trace: {
                label: this.i18n.node,
                required: false,
            },
            collection: {
                label: this.i18n.process.label.thread,
                required: true,
            },
        };
        this.LaunchItemsLock = {
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
        this.startCheckMicarch = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
    }
    @ViewChild('nodeConfigM', { static: false }) nodeConfigM: any;
    @ViewChild('preSwitchMicarch', { static: false }) preSwitchMicarch: any;
    @ViewChild('pretable', { static: false }) pretable: any;
    @ViewChild('createMicarchConfirmModal', { static: false }) createMicarchConfirmModal: any;
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
            ? this.micarchCurrntForm.get('nodeList').enable()
            : this.micarchCurrntForm.get('nodeList').disable();
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
    @Input() isRestart: boolean;
    @Input() panelId: any;
    /** Attach to Process: 进程名 */
    @Input() modeProcess: any;
    @Input() modeAppRunUserValid: boolean;
    @Input() taskDetail: any = {
      isFromTuningHelper: false,
    };
    @Input() modeAppPathAllow: string;

    scenesStash: PROJECT_TYPE;
    analysisScene = PROJECT_TYPE;
    public isLaunch: boolean;
    public isAttach: boolean;
    public isProfile = true;
    public isEdit: boolean;
    public i18n: any;
    public micarchItems: any = {};
    public launchItemsMicarchForm: FormGroup;
    public attachItemsMicarchForm: FormGroup;
    public profileItemsMicarchForm: FormGroup;
    public advanceMicarchForm: FormGroup;
    public micarchCurrntForm: FormGroup;
    public LaunchItemsLock: any = {};
    public startCheckMicarch: any = {};
    public processItems: any = {};
    public advanceParams = false;
    public lockTypeOptions: Array<any> = [
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
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public micarchTypeSelected: any = this.lockTypeOptions[0];
    public appAndPidValid = false;
    public formDatas: any;
    public keepData: any; // 保存模板
    public typeLDesc = '';
    public micarchSimplingType: any = { more: [], little: [] };
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public runUserDataObj: LaunchRunUser = {};
    // 修改预约任务 接收从预约传来的值
    public editScheduleTask = false; // 判断是否是修改
    public scheduleTaskId: any; // 保存修改的预约任务ID
    // 字符串
    public strObj = {
        kcore: 'Associate Kernel Function with Assembly Code', // 内核函数关联汇编指令
    };

    public intervalBlur: SpinnerBlurInfo;
    public collectFileBlur: SpinnerBlurInfo;
    public samplingDurationBlur: SpinnerBlurInfo;
    public delaySamplingDurationBlur: SpinnerBlurInfo;
    public startCheckSys: any = {};   // 立即启动
    // 工程下节点信息
    nodeList: any[] = [];
    isSelectNodeDisabled: boolean;
    nodeConfig: any[] = [];
    isLoading = true;

    /**
     * 初始化函数
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

        this.micarchSimplingType.more = [
            { id: 'badSpeculation', text: 'Bad Speculation', tip: this.i18n.micarch.badSpeculation_tip },
            { id: 'frontEndBound', text: 'Front-End Bound', tip: this.i18n.micarch.frontEndBound_tip },
            { id: 'resourceBound', text: 'Back-End Bound->Resource Bound', tip: this.i18n.micarch.resourceBound_tip },
            { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: this.i18n.micarch.coreBound_tip },
            { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: this.i18n.micarch.memoryBound_tip },
        ];
        this.micarchSimplingType.little = [
            { id: 'badSpeculation', text: 'Bad Speculation', tip: this.i18n.micarch.badSpeculation_tip },
            { id: 'frontEndBound', text: 'Front-End Bound', tip: this.i18n.micarch.frontEndBound_tip },
            { id: 'coreBound', text: 'Back-End Bound->Core Bound', tip: this.i18n.micarch.coreBound_tip },
            { id: 'memoryBound', text: 'Back-End Bound->Memory Bound', tip: this.i18n.micarch.memoryBound_tip },
        ];
        switch (this.typeId) {
            case 0:
                this.isProfile = true;
                this.appAndPidValid = true;
                this.isLaunch = false;
                this.isAttach = false;
                this.micarchCurrntForm = this.profileItemsMicarchForm;
                this.micarchTypeSelected = this.lockTypeOptions[1];
                break;
            case 1:
                this.isProfile = false;
                this.isLaunch = true;
                this.appAndPidValid = this.modeAppValid;
                this.isAttach = false;
                this.micarchCurrntForm = this.launchItemsMicarchForm;
                this.micarchTypeSelected = this.lockTypeOptions[0];
                break;
            case 2:
                this.isProfile = false;
                this.isLaunch = false;
                this.isAttach = true;
                this.appAndPidValid = this.modePidValid;
                this.micarchCurrntForm = this.attachItemsMicarchForm;
                this.micarchTypeSelected = this.lockTypeOptions[2];
                break;
        }
        this.setSpinnerBlur();
    }

    /**
     * ngOnChanges
     * @param changes changes
     */
    ngOnChanges(changes: SimpleChanges) {
        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'switchState':
                    if (changes.switchState.currentValue) {
                        this.runUserData.runUser = true;
                        // 指定用户，用户名由用户输入
                        this.runUserData.user = '';
                        this.startCheckMicarch.checked = true;
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
                    this.clear();
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
                this.micarchCurrntForm = this.profileItemsMicarchForm;
                this.micarchTypeSelected = this.lockTypeOptions[1];
                break;
            case 1:
                this.isProfile = false;
                this.isLaunch = true;
                this.appAndPidValid = this.modeAppValid;
                this.isAttach = false;
                this.micarchCurrntForm = this.launchItemsMicarchForm;
                this.micarchTypeSelected = this.lockTypeOptions[0];
                break;
            case 2:
                this.isProfile = false;
                this.isLaunch = false;
                this.isAttach = true;
                this.appAndPidValid = this.modePidValid;
                this.micarchCurrntForm = this.attachItemsMicarchForm;
                this.micarchTypeSelected = this.lockTypeOptions[2];
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
            this.micarchCurrntForm.get('nodeList').setValue(
                nodeList.length > 10 ? nodeList.slice(0, 10) : nodeList
            );
        }
        if (this.isRestart) {
            setTimeout(() => {
                this.preSwitchMicarch.switchState = false;
            }, 0);
        }
    }

    selectNodeDisable(event: boolean){
        this.isSelectNodeDisabled = event;
    }

    /**
     * changeAppDire
     */
    public changeAppDire(type: any) { }
    /**
     *  directory_change
     */
    public directory_change(data: any, modal: any) {
        const ctrls: any = '';
        if (data.id === 'customize') {
            ctrls.dire_input_ctrl.enable();
            ctrls.dire_input_ctrl.setValue('');
        } else {
            ctrls.dire_input_ctrl.disable();
            ctrls.dire_input_ctrl.setValue('');
        }
    }

    /**
     * 微架构分析模式切换事件
     */
    public simplingSwitchChange(data: any) {
        const form = this.micarchItems;
        if (form.samplingSwitch.lastValue !== data) {
            const formGroup = this.isProfile ? this.profileItemsMicarchForm :
                (this.isLaunch ? this.launchItemsMicarchForm : this.attachItemsMicarchForm);
            if (data === 'summary') {
                // 保存下detail的值
                if (form.samplingSwitch.lastValue === 'detail') {
                    form.res_d.detail_value = formGroup.getRawValue().sampling_ctrl;
                    form.cpu.detail_value = formGroup.getRawValue().cpu_spinner_ctrl;
                }
                form.samplingSwitch.tip = this.i18n.micarch.summury_mode_tip;
                form.res_d.placeholder = '1-900';
                form.res_d.max = 900;
                form.res_d.tailPrompt = '(1~900)';
                formGroup.get('sampling_ctrl').updateValueAndValidity();
                // 设置summary的值
                setTimeout(() => {
                    formGroup.controls.sampling_ctrl.setValue(form.res_d.summary_value || '60');
                    formGroup.controls.cpu_spinner_ctrl.setValue(form.cpu.summary_value || '5');
                });
            } else {
                // 保存下summary的值
                if (form.samplingSwitch.lastValue === 'summary') {
                    form.res_d.summary_value = formGroup.getRawValue().sampling_ctrl;
                    form.cpu.summary_value = formGroup.getRawValue().cpu_spinner_ctrl;
                }
                form.samplingSwitch.tip = this.i18n.micarch.detail_mode_tip;
                form.res_d.placeholder = '1-30';
                form.res_d.max = 30;
                form.res_d.tailPrompt = '(1~30)';
                formGroup.get('sampling_ctrl').updateValueAndValidity();
                // 设置detail的值
                setTimeout(() => {
                    formGroup.controls.sampling_ctrl.setValue(form.res_d.detail_value || '10');
                    formGroup.controls.cpu_spinner_ctrl.setValue(form.cpu.detail_value || '2');
                });
            }
            form.samplingSwitch.lastValue = data;
        }
    }

    /**
     * cpu_interval_change
     */
    public cpu_interval_change(data: any, cpu: any, type: string) {
        const THIS = cpu;
        THIS.unit =
            data.id === 'higher'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms;
        const spinnerVal = data.id === 'higher' ? '710' : '1';
        if (type === 'micarch') {
            const tempForm = this.isLaunch
                ? this.launchItemsMicarchForm
                : this.isAttach
                    ? this.attachItemsMicarchForm
                    : this.profileItemsMicarchForm;
            tempForm.controls.cpu_spinner_ctrl.setValue(spinnerVal);
            if (data.id === 'higher') {
                tempForm.controls.cpu_spinner_ctrl.disable();
            } else {
                tempForm.controls.cpu_spinner_ctrl.enable();
            }
        }
    }

    /**
     * 创建任务
     */
    async createMicarchkAnalysis(isEdit: any): Promise<any> {
        const context = this;
        const temp = this.isLaunch
            ? this.launchItemsMicarchForm
            : this.isAttach
                ? this.attachItemsMicarchForm
                : this.profileItemsMicarchForm;
        const ctrls = temp.controls;
        const params: any = {
            analysisType: 'microarchitecture',
            projectName: context.projectName,
            taskName: context.taskName,
            analysisTarget: context.micarchTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === context.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : 0.71,
            duration: ctrls.sampling_ctrl.value,
            samplingMode: ctrls.mode_ctrl.value,
            analysisIndex: ctrls.analysisTypes.value,
            samplingSpace: ctrls.typeItem_ctrl.value.id,
            samplingDelay: ctrls.timing_spinner_ctrl.value || 0,
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value || '',
            kcore: ctrls.kcore.value,
            perfDataLimit: ctrls.fileSize.value || 0,
        };
        if (context.isProfile) {// 系统
            params.analysisTarget = 'Profile System';
            params.cpuMask = ctrls.cpu_kernel_ctrl.value;
        } else if (context.isLaunch) { // 应用 路径
            params.analysisTarget = 'Launch Application';
            params.appDir = this.modeApplication;
            params.appParameters = this.modeAppParams || '';
        } else if (context.isAttach) { // 应用 pid
            params.analysisTarget = 'Attach to Process';
            params.targetPid = this.modePid;
            params.process_name = this.modeProcess;
        }
        if (this.nodeConfigM.switchStatus) {
            params.switch = true;
            const nodeData: any = this.nodeConfigM.getNodesConfigParams({}).nodeConfig;
            this.runUserDataObj = this.nodeConfigM.getNodesConfigParams({}).runUserData;
            const nodeDataTemp = JSON.parse(JSON.stringify(nodeData));
            nodeData.forEach((item: any, i: number) => {
                nodeDataTemp[i].taskParam = item.task_param;
            });
            nodeDataTemp.map((item: any) => {
                const itemTemp: any = {};
                Object.keys(item).forEach(key => {
                    if (key !== 'task_param') {
                        itemTemp[key] = item[key];
                    }
                });
                return itemTemp;
            });
            params.nodeConfig = nodeDataTemp;
        } else {
            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas(
                params.analysisType
            );
        }
        if (this.isRestart) {
            this.restartFunction(params);
            return false;
        }

        //  预约任务 preSwitch 预约组件名
        if (this.preSwitchMicarch.switchState) {
            this.startCheckMicarch.checked = false;
            const flag = await this.createPreMission(
                this.preSwitchMicarch,
                params,
                'post'
            );
            if (flag) {
                this.startCheckMicarch.checked = true;
            }
        } else {
            if (isEdit) {
                const option = {
                    url: '/tasks/' + this.restartAndEditId + '/',
                    params
                };
                context.vscodeService.put(option, (data: any) => {
                    // 修改任务提示
                    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        if (data.code === 'SysPerf.Success') {
                            const data1 = data.data;
                            this.vscodeService.showTuningInfo(data.message, 'info', 'modifyTask');
                            if (context.startCheckMicarch.checked) {
                                context.startDataSamplingTask(
                                    context.projectName,
                                    context.taskName,
                                    data1.id,
                                    params
                                );
                            } else {
                                const message = {
                                    cmd: 'openSomeNode',
                                    data: {
                                        taskId: data1.id,
                                        projectName: context.projectName
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
                            if (context.startCheckMicarch.checked) {
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
                                    this.closeTab.emit({});
                                }, 200);
                            }
                        }
                    }
                });
            } else {
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    const createMemInstance = this.tiMessage.open({
                        id: 'create',
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: '<div>' +
                            '<div class="warn-tip-msg">' +
                            '<div class="ti3-icon ti3-icon-warn"></div>' + this.i18n.secret_count + '</div>' +
                            '</div>',
                        dismiss: (): void => {
                            this.zone.run(() => {
                                createMemInstance.close();
                            });
                        },
                        okButton: {
                            show: true,
                            click: (): void => {
                                const option = {
                                    url: '/tasks/',
                                    params
                                };
                                context.vscodeService.post(option, (res: any) => {
                                    const data = res.data;
                                    if (res.code === 'SysPerf.Success') {
                                        this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                        let timer = 0;
                                        if (context.startCheckMicarch.checked) {
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
                                    createMemInstance.close();
                                });
                            }
                        },
                        cancelButton: {
                            show: true,
                            click: (): void => {
                                this.zone.run(() => {
                                    createMemInstance.close();
                                });
                            }
                        }
                    });
                } else {
                    const self = this;
                    this.tiModal.open(this.createMicarchConfirmModal, {
                        // 定义id防止同一页面出现多个相同弹框
                        id: 'createMicarch',
                        modalClass: 'createMicarchConfirmModal',
                        close() {
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
                            const option = {
                                url: '/tasks/',
                                params
                            };

                            context.vscodeService.post(option, (res: any) => {
                                const data = res.data;
                                if (res.status) {
                                    context.vscodeService.showInfoBox(res.message, 'error');
                                } else {
                                    let timer = 0;
                                    if (context.startCheckMicarch.checked) {
                                        timer = 3500;
                                        context.startDataSamplingTask(
                                            context.projectName,
                                            context.taskName,
                                            data.id,
                                            params
                                        );
                                    } else {
                                        context.closeTab.emit({
                                            title: `${data.taskName}-${params.nodeConfig[0].nickName}`,
                                            id: data.id,
                                            startCheckCNo: true,
                                            nodeid: params.nodeConfig[0].nodeId,
                                            taskId: data.id,
                                            taskType: data.analysisType,
                                            status: data.taskStatus,
                                            projectName: context.projectName
                                        });
                                    }
                                    setTimeout(() => {
                                        context.vscodeService.showInfoBox(
                                            context.I18n.I18nReplace(context.i18n.plugins_term_task_create_success, {
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
    }

    /**
     * 保存模板
     */
    async saveTemplates() {
        const self = this;
        const temp = this.isLaunch
            ? this.launchItemsMicarchForm
            : this.isAttach
                ? this.attachItemsMicarchForm
                : this.profileItemsMicarchForm;
        const ctrls = temp.controls;
        const params: any = {
            analysisType: 'microarchitecture',
            projectName: self.projectName,
            taskName: self.taskName,
            analysisTarget: self.micarchTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : 0.71,
            duration: ctrls.sampling_ctrl.value,
            samplingMode: ctrls.mode_ctrl.value,
            analysisIndex: ctrls.analysisTypes.value,
            samplingSpace: ctrls.typeItem_ctrl.value.id,
            samplingDelay: ctrls.timing_spinner_ctrl.value || 0,
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value || '',
            kcore: ctrls.kcore.value,
            perfDataLimit: ctrls.fileSize.value || 0,
        };
        if (self.isLaunch) {
            params.analysisTarget = 'Launch Application';
            params.appDir = this.modeApplication;
            params.appParameters = this.modeAppParams || '';
        }
        if (self.isProfile) {
            params.analysisTarget = 'Profile System';
            params.cpuMask = ctrls.cpu_kernel_ctrl.value;
        }
        if (self.isAttach) {
            params.analysisTarget = 'Attach to Process';
            params.targetPid = this.modePid;
            params.process_name = this.modeProcess;
        }
        if (this.preSwitchMicarch.switchState) {
            // 预约
            if (this.preSwitchMicarch.selected === 1) {
                const durationArr = this.preSwitchMicarch.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchMicarch.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchMicarch.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        if (this.nodeConfigM.switchStatus) {
            params.switch = true;
            const nodeData: any = this.nodeConfigM.getNodesConfigParams({}).nodeConfig;
            nodeData.map((item: any) => {
                item.taskParam = item.task_param;
                delete item.task_param;
                item.taskParam.taskName = self.taskName;
            });
            params.nodeConfig = nodeData;
            params.sourceLocation = '';
        } else {

            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas(
                params.analysisType
            );
        }
        this.keepData = params;
        this.sendMissionKeep.emit(this.keepData);
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
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            const options = { url: urlAnalysis, params };
            this.vscodeService[method](options, (res: any) => {
                if (res.code === 'SysPerf.Success') {
                    this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                    this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                } else {
                    this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                }
            });
        } else {
            return new Promise((resolve) => {
                const option = { url: urlAnalysis, params };
                context.vscodeService[method](option, (res: any) => {

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
                        this.nodeConfigM.clear();
                        this.sendPretable.emit();
                        this.closeTab.emit({});
                        resolve(true);
                    }

                });
            });
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
            if (this.formDatas.hasOwnProperty('analysisTarget')) {
                target = this.formDatas.analysisTarget;
            } else {
                return;
            }
            const type = this.formDatas['analysis-type'] || this.formDatas.analysisType;
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
                case 'microarchitecture':
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
     * 禁用
     */
    public onDisableForm(taskName: any) {
        switch (taskName) {
            case 'm_attach':
                this.attachItemsMicarchForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                this.handlePidTidDisable.emit(true);
                break;
            case 'm_launch':
                this.launchItemsMicarchForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                break;
            case 'm_profile':
                this.profileItemsMicarchForm.controls.source_ctrl.disable();
                this.profileItemsMicarchForm.controls.cpu_kernel_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                break;
            default:
                this.handlePidTidDisable.emit(false);
                this.sendAppOrPidDisable.emit(false);
                this.attachItemsMicarchForm.controls.source_ctrl.enable();
                this.micarchItems.analysis.disabled = false;
                this.launchItemsMicarchForm.controls.source_ctrl.enable();
                this.micarchItems.analysis.disabled = false;
                this.profileItemsMicarchForm.controls.cpu_kernel_ctrl.enable();
                this.profileItemsMicarchForm.controls.source_ctrl.enable();
                this.micarchItems.analysis.disabled = false;
                break;
        }
    }
    /**
     * 获取数据
     */
    public getFormDatas() {
        const self = this;
        const temp = this.isLaunch
            ? this.launchItemsMicarchForm
            : this.isAttach
                ? this.attachItemsMicarchForm
                : this.profileItemsMicarchForm;
        const ctrls = temp.controls;
        const params: any = {
            analysisType: 'microarchitecture',
            projectName: self.projectName,
            taskName: self.taskName,
            analysisTarget: self.micarchTypeSelected.label,
            duration: ctrls.sampling_ctrl.value,
            interval:
                ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : 0.71,
            samplingMode: ctrls.mode_ctrl.value,
            analysisIndex: ctrls.analysisTypes.value,
            samplingSpace: ctrls.typeItem_ctrl.value.id,
            samplingDelay: ctrls.timing_spinner_ctrl.value || 0,
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value || '',
            kcore: ctrls.kcore.value,
            perfDataLimit: ctrls.fileSize.value || 0,
        };
        if (self.isLaunch) {
            params.analysisTarget = 'Launch Application';
            params.appDir = this.modeApplication || '';
            params.appParameters = this.modeAppParams || '';
        }
        if (self.isProfile) {
            params.analysisTarget = 'Profile System';
            params.cpuMask = ctrls.cpu_kernel_ctrl.value;
        }
        if (self.isAttach) {
            params.analysisTarget = 'Attach to Process';
            params.targetPid = this.modePid;
            params.process_name = this.modeProcess;
        }
        if (this.preSwitchMicarch.switchState) {
            // 预约
            if (this.preSwitchMicarch.selected === 1) {
                const durationArr = this.preSwitchMicarch.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchMicarch.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchMicarch.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        this.formDatas = params;
        this.updateWebViewPage();
        return;
    }
    /**
     * 当配置节点参数没开时
     */
    async getNodeConfigDatas(params: any) {
        this.getFormDatas();
        // 当开关组件没有打开时
        return new Promise((resolve) => {
            const data: any = [];
            const nodeList = PROJECT_TYPE.TYPE_HPC === this.scenes
                ? this.micarchCurrntForm.get('nodeList').value
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
                    taskParam: Object.assign({}, { status: false }, this.formDatas),
                });
            });
            resolve(data);
        });
    }
    /**
     * 清空任务参数
     */
    public clear() {
        if (this.nodeConfigM) {
            this.nodeConfigM.clear();
        }
        if (this.preSwitchMicarch) {
            this.preSwitchMicarch.clear();
        }
    }

    /**
     *  导入模板
     */
    public getTemplateData(e: any) {
        this.taskNameValid = true;
        if (e.analysisTarget.indexOf('Launch') > -1) {
            this.typeLDesc = this.i18n.common_term_task_type_launch;
            this.isLaunch = true;
            this.isProfile = false;
            this.isAttach = false;

            this.micarchTypeSelected = this.lockTypeOptions[0];
            this.launchItemsMicarchForm.controls.sampling_ctrl.setValue(e.duration);
            this.launchItemsMicarchForm.controls.cpu_spinner_ctrl.setValue(
                e.interval
            );
            this.launchItemsMicarchForm.controls.analysisTypes.setValue(
                e.analysisIndex
            );
            this.launchItemsMicarchForm.controls.mode_ctrl.setValue(e.samplingMode);
            this.launchItemsMicarchForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.launchItemsMicarchForm.controls.source_ctrl.setValue(
                e.sourceLocation
            );
            const typeItem = this.micarchItems.typeItem.options.filter((val: any) => {
                return val.id === e.samplingSpace;
            });
            this.launchItemsMicarchForm.controls.typeItem_ctrl.setValue(
                typeItem[0]
            );
            this.launchItemsMicarchForm.controls.timing_spinner_ctrl.setValue(
                e.samplingDelay
            );
            this.launchItemsMicarchForm.controls.kcore.setValue(e.kcore);
            this.launchItemsMicarchForm.controls.fileSize.setValue(
                e.perfDataLimit
            );
        } else if (e.analysisTarget.indexOf('Profile') > -1) {
            this.typeLDesc = this.i18n.common_term_task_type_profile;
            this.isLaunch = false;
            this.isProfile = true;
            this.isAttach = false;
            this.micarchTypeSelected = this.lockTypeOptions[1];
            this.profileItemsMicarchForm.controls.cpu_spinner_ctrl.setValue(
                e.interval
            );
            this.profileItemsMicarchForm.controls.analysisTypes.setValue(
                e.analysisIndex
            );
            this.profileItemsMicarchForm.controls.cpu_kernel_ctrl.setValue(
                e.cpuMask
            );
            this.profileItemsMicarchForm.controls.sampling_ctrl.setValue(e.duration);
            if (e.interval === '0.71') {
                this.profileItemsMicarchForm.controls.cpu_ctrl.setValue({
                    label: this.i18n.common_term_task_start_high_precision,
                    id: 'higher',
                });
            }
            this.profileItemsMicarchForm.controls.mode_ctrl.setValue(e.samplingMode);
            this.profileItemsMicarchForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.profileItemsMicarchForm.controls.source_ctrl.setValue(
                e.sourceLocation
            );
            const typeItem = this.micarchItems.typeItem.options.filter((val: any) => {
                return val.id === e.samplingSpace;
            });
            this.profileItemsMicarchForm.controls.typeItem_ctrl.setValue(
                typeItem[0]
            );
            this.profileItemsMicarchForm.controls.timing_spinner_ctrl.setValue(
                e.samplingDelay
            );
            this.profileItemsMicarchForm.controls.kcore.setValue(e.kcore);
            this.profileItemsMicarchForm.controls.fileSize.setValue(
                e.perfDataLimit
            );
            this.micarchCurrntForm = this.profileItemsMicarchForm;
        } else if (e.analysisTarget.indexOf('Attach') > -1) {
            this.typeLDesc = this.i18n.common_term_task_type_attach;
            this.isLaunch = false;
            this.isProfile = false;
            this.isAttach = true;
            this.micarchTypeSelected = this.lockTypeOptions[2];
            this.attachItemsMicarchForm.controls.mode_ctrl.setValue(e.samplingMode);
            this.attachItemsMicarchForm.controls.cpu_spinner_ctrl.setValue(
                e.interval
            );
            this.attachItemsMicarchForm.controls.analysisTypes.setValue(
                e.analysisIndex
            );
            this.attachItemsMicarchForm.controls.sampling_ctrl.setValue(e.duration);

            this.attachItemsMicarchForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.attachItemsMicarchForm.controls.source_ctrl.setValue(
                e.sourceLocation
            );
            const typeItem = this.micarchItems.typeItem.options.filter((val: any) => {
                return val.id === e.samplingSpace;
            });
            this.attachItemsMicarchForm.controls.typeItem_ctrl.setValue(
                typeItem[0]
            );
            this.attachItemsMicarchForm.controls.timing_spinner_ctrl.setValue(
                e.samplingDelay
            );
            this.attachItemsMicarchForm.controls.kcore.setValue(e.kcore);
            this.attachItemsMicarchForm.controls.fileSize.setValue(
                e.perfDataLimit
            );
            this.micarchCurrntForm = this.attachItemsMicarchForm;
        }
        this.nodeConfig = e.nodeConfig;
        this.setNodeListParam(this.nodeConfig, this.nodeList);

        // 预约任务数据导入
        this.preSwitchMicarch.importTemp(e);
        // 配置节点参数
        if (e.switch) {
            switch (e.analysisTarget) {
                case 'Launch Application':
                    this.onDisableForm('m_launch');
                    break;
                case 'Profile System':
                    this.onDisableForm('m_profile');
                    break;
                case 'Attach to Process':
                    this.onDisableForm('m_attach');
                    break;
                default:
                    break;
            }
            setTimeout(() => {
                this.nodeConfigM.importTemp(e.nodeConfig);
            }, 0);
        } else {
            this.nodeConfigM.clear();
        }
        if (this.isEdit || this.isRestart) {
            this.preSwitchMicarch.isEdit = this.isEdit || this.isRestart;
        }
    }

    /**
     * 立即启动
     */
    public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
        const option: any = { status: 'running' };
        if (this.isLaunch) {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        const projectnameURL = encodeURIComponent(projectname);
        const tasknameURL = encodeURIComponent(taskname);
        this.vscodeService.get({
            url: '/res-status/?type=disk_space&project-name=' + projectnameURL + '&task-name=' + tasknameURL
        }, () => {
            const self = this;
            self.vscodeService.put({ url: '/tasks/' + id + '/status/', params: option }, (res: any) => {
                const backData = res.data;
                const taskName = params.taskname || params.taskName;
                const taskType = params['analysis-type'] || params.analysisType;
                self.closeTab.emit({
                    title: `${taskName}-${params.nodeConfig[0].nickName}`,
                    id: backData.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: backData.id,
                    taskType,
                    status: backData['task-status'],
                    projectName: self.projectName
                });
            });
        });
    }

    /**
     * 重启
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
        const option = { url: '/tasks/' + this.restartAndEditId + '/status/', params };
        self.vscodeService.put(option, (res: any) => {
            const data = res.data;
            if (res.status === HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                this.vscodeService.showInfoBox(res.message, 'error');
            } else {
                self.closeTab.emit({
                    title: `${params.taskName}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: params.analysisType,
                    status: params.taskStatus,
                    projectName: self.projectName
                });
                setTimeout(() => {
                    this.vscodeService.showInfoBox(
                        this.I18n.I18nReplace(this.i18n.plugins_term_task_reanalyze_success, {
                            0: this.taskName
                        }), 'info');
                }, 3000);
            }
            this.isRestart = false;
        });
        this.updateWebViewPage();
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
     * handleNodeEmit
     */
    public handleNodeEmit(e: any) {
        this.handleNodeEmitIndex.emit(e);
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        const form = this.isLaunch
            ? this.launchItemsMicarchForm
            : this.isAttach
                ? this.attachItemsMicarchForm
                : this.profileItemsMicarchForm;

        this.intervalBlur = {
            control: form.controls.cpu_spinner_ctrl,
            min: 1,
            max: 999,
        };
        this.collectFileBlur = {
            control: form.controls.fileSize,
            min: 1,
            max: 1024,
        };
        this.samplingDurationBlur = {
            control: form.controls.sampling_ctrl,
            min: 1,
            max: 900,
        };
        this.delaySamplingDurationBlur = {
            control: form.controls.timing_spinner_ctrl,
            min: 0,
            max: 900,
        };
    }
    /**
     * 微调器鼠标移出数据校验
     * @param e event
     * @param type 类型
     */
    selectBlur(e, type) {
        setTimeout(() => {
            const value = e.target.value;
            if (type === 'sampling_ctrl') {
                const maxVal = this.samplingDurationBlur.max;
                const minVal = this.samplingDurationBlur.min;
                if (value < minVal) {
                    this.profileItemsMicarchForm.controls[type].setValue(minVal);
                    this.launchItemsMicarchForm.controls[type].setValue(minVal);
                    this.attachItemsMicarchForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.profileItemsMicarchForm.controls[type].setValue(maxVal);
                    this.launchItemsMicarchForm.controls[type].setValue(maxVal);
                    this.attachItemsMicarchForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'cpu_spinner_ctrl') {
                const maxVal = this.intervalBlur.max;
                const minVal = this.intervalBlur.min;
                if (value < minVal) {
                    this.profileItemsMicarchForm.controls[type].setValue(minVal);
                    this.launchItemsMicarchForm.controls[type].setValue(minVal);
                    this.attachItemsMicarchForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.profileItemsMicarchForm.controls[type].setValue(maxVal);
                    this.launchItemsMicarchForm.controls[type].setValue(maxVal);
                    this.attachItemsMicarchForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'timing_spinner_ctrl') {
                const maxVal = this.delaySamplingDurationBlur.max;
                const minVal = this.delaySamplingDurationBlur.min;
                if (value < minVal) {
                    this.profileItemsMicarchForm.controls[type].setValue(minVal);
                    this.launchItemsMicarchForm.controls[type].setValue(minVal);
                    this.attachItemsMicarchForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.profileItemsMicarchForm.controls[type].setValue(maxVal);
                    this.launchItemsMicarchForm.controls[type].setValue(maxVal);
                    this.attachItemsMicarchForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'fileSize') {
                const maxVal = this.collectFileBlur.max;
                const minVal = this.collectFileBlur.min;
                if (value < minVal) {
                    this.launchItemsMicarchForm.controls[type].setValue(minVal);
                    this.attachItemsMicarchForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.launchItemsMicarchForm.controls[type].setValue(maxVal);
                    this.attachItemsMicarchForm.controls[type].setValue(maxVal);
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
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}
