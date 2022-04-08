import {
    Component, OnInit, ViewChild, Output, Input, EventEmitter,
    SimpleChanges, OnChanges, NgZone, ChangeDetectorRef
} from '@angular/core';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { VscodeService } from '../../service/vscode.service';
import { TiModalService, TiMessageService } from '@cloud/tiny3';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import { RunUserDataObj, LaunchRunUser } from './../mission-domain/index';
import { CustomValidatorsService } from '../../service';
import { PROJECT_TYPE } from '../../service/axios.service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-lock',
    templateUrl: './mission-lock.component.html',
    styleUrls: ['./mission-lock.component.scss', '../../task-details/components/task-form/task-form.component.scss']
})
export class MissionLockComponent implements OnInit, OnChanges {

    constructor(
        public I18n: I18nService,
        public vscodeService: VscodeService,
        fb: FormBuilder,
        public scheduleTaskServer: ScheduleTaskService,
        private tiMessage: TiMessageService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        private tiModal: TiModalService,
        public customValidatorsService: CustomValidatorsService,
        private projectNodeListService: ProjectNodeListService) {

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
            res_d: {
                label: this.i18n.common_term_task_crate_duration,
                required: true,
                placeholder: '1-60',
                min: 1,
                max: 60,
                format: 'N0',
                step: 1
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
            fileSize: {
                placeholder: '1-4096',
                min: 1,
                max: 4096,
                format: 'N0',
                step: 1,
                tailPrompt: '(1~4,096)',
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
            // 自定义函数
            custom_lock_function: {
                label: this.i18n.lock.form.custom_functions_label,
                required: false
            },
            profilingMode: 'Native',  // WebUI上不显示。
            sysWideState: 'on',  // WebUI上不显示。
            typeItem: { // 采样范围
                label: this.i18n.micarch.label.typeItem,
                selected: {
                    label: this.i18n.micarch.typeItem_user,
                    id: 'USER',
                },
                options: [
                    {
                        label: this.i18n.micarch.typeItem_user,
                        id: 'USER',
                    },
                    {
                        label: this.i18n.micarch.typeItem_kernel,
                        id: 'SYS',
                    },
                    {
                        label: this.i18n.micarch.typeItem_all,
                        id: 'ALL',
                    },
                ],
            },

            // 内核函数关联汇编指令
            kcore: {
                label: this.i18n.mission_create.kcore,
                required: false,
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
        this.profileItemLock = {
            c_dVal: 30,
            cpu: {
                unit: this.i18n.common_term_task_crate_ms,
                spinnerVal: 710,
            },
            maskVal: '',
            b_sVal: '',
            c_sourceVal: '',
        };

        this.attachItemsLock = {
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
        // lock
        this.launchItemsLockForm = fb.group({
            nodeList: new FormControl([]),
            cpu_ctrl: new FormControl('', []),
            cpu_spinner_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(1000),
            ]),
            dire_ctrl: new FormControl('', []),
            functionNamesForm: new FormControl('', []),
            functions: new FormControl('', [this.customValidatorsService.lockFunctionValidator]), // 函数名
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),

            // 采样范围
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_user,
                id: 'USER',
            }, []),

            kcore: new FormControl(false, {
                updateOn: 'change',
            }),

            // 采集文件大小
            fileSize: new FormControl(1024, [
                TiValidators.minValue(1),
                TiValidators.maxValue(4096),
            ]),
        });

        this.lCurrntFormLock = this.launchItemsLockForm;
        this.attachItemsLockForm = fb.group({
            nodeList: new FormControl([]),
            c_d_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(300),
            ]),
            cpu_ctrl: new FormControl('', []),
            cpu_spinner_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(1000),
            ]),
            functionNamesForm: new FormControl('', []),
            functions: new FormControl('', [this.customValidatorsService.lockFunctionValidator]), // 函数名
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            // 采样范围
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_user,
                id: 'USER',
            }, []),

            kcore: new FormControl(false, {
                updateOn: 'change',
            }),

            // 采集文件大小
            fileSize: new FormControl(1024, [
                TiValidators.minValue(1),
                TiValidators.maxValue(4096),
            ]),
        });
        this.profileItemsLockForm = fb.group({
            nodeList: new FormControl([]),
            c_d_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(300),
            ]),
            cpu_ctrl: new FormControl('', []),
            cpu_spinner_ctrl: new FormControl('', [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(1000),
            ]),
            functionNamesForm: new FormControl('', []),
            functions: new FormControl('', [this.customValidatorsService.lockFunctionValidator]), // 函数名
            b_s_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            source_ctrl: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            // 采样范围
            typeItem_ctrl: new FormControl({
                label: this.i18n.micarch.typeItem_user,
                id: 'USER',
            }, []),

            kcore: new FormControl(false, {
                updateOn: 'change',
            }),

            // 采集文件大小
            fileSize: new FormControl(1024, [
                TiValidators.minValue(1),
                TiValidators.maxValue(4096),
            ]),
        });
        this.startCheckLock = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
        this.functionNames = [
            // 使用 select 标记 all 状态
            {
                label: 'All',
                value: 'all',
                select: true
            },
            // Mutex(互斥锁)
            {
                label: 'pthread_mutex_lock',
                value: '^_{,2}pthread_mutex_lock',
            },
            {
                label: 'pthread_mutex_trylock',
                value: '^_{,2}pthread_mutex_trylock',
            },
            {
                label: 'pthread_mutex_unlock',
                value: '^_{,2}pthread_mutex_unlock',
            },
            // Cond(条件变量)
            {
                label: 'pthread_cond_wait',
                value: '^_{,2}pthread_cond_wait',
            },
            {
                label: 'pthread_cond_timedwait',
                value: '^_{,2}pthread_cond_timedwait',
            },
            {
                label: 'pthread_cond_reltimedwait_np',
                value: '^_{,2}pthread_cond_reltimedwait_np',
            },
            {
                label: 'pthread_cond_signal',
                value: '^_{,2}pthread_cond_signal',
            },
            {
                label: 'pthread_cond_broadcast',
                value: '^_{,2}pthread_cond_broadcast',
            },
            // Rwlock
            {
                label: 'pthread_rwlock_rdlock',
                value: '^_{,2}pthread_rwlock_rdlock',
            },
            {
                label: 'pthread_rwlock_tryrdlock',
                value: '^_{,2}pthread_rwlock_tryrdlock',
            },
            {
                label: 'pthread_rwlock_wrlock',
                value: '^_{,2}pthread_rwlock_wrlock',
            },
            {
                label: 'pthread_rwlock_trywrlock',
                value: '^_{,2}pthread_rwlock_trywrlock',
            },
            {
                label: 'pthread_rwlock_unlock',
                value: '^_{,2}pthread_rwlock_unlock',
            },
            // Semaphore(信号量)
            {
                label: 'sem_post',
                value: '^_{,2}sem_post',
            },
            {
                label: 'sem_wait',
                value: '^_{,2}sem_wait',
            },
            {
                label: 'sem_trywait',
                value: '^_{,2}sem_trywait',
            },
            // Spinlock(自旋锁)
            {
                label: 'pthread_spin_lock',
                value: '^_{,2}pthread_spin_lock',
            },
            {
                label: 'pthread_spin_trylock',
                value: '^_{,2}pthread_spin_trylock',
            },
            {
                label: 'pthread_spin_unlock',
                value: '^_{,2}pthread_spin_unlock',
            },
            // sleep
            {
                label: 'sleep',
                value: '^_{,2}sleep',
            },
            {
                label: 'usleep',
                value: '^_{,2}usleep',
            },
        ];
    }
    @ViewChild('nodeConfigL', { static: false }) nodeConfigL: any;
    @ViewChild('preSwitchLock', { static: false }) preSwitchLock: any;
    @ViewChild('pretable', { static: false }) pretable: any;
    @ViewChild('createLockConfirmModal', { static: false }) createLockConfirmModal: any;
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
    @Input() actionType: string;
    /** Attach to Process: 进程名 */
    @Input() modeProcess: string;
    @Input() modeAppRunUserValid: boolean;
    @Input() taskDetail: any = {
        isFromTuningHelper: false,
    };
    @Input() modeAppPathAllow: string;

    analysisScene = PROJECT_TYPE;
    scenesStash: PROJECT_TYPE;
    /** 工程下的所以节点 */
    public allNodeList: Array<any> = [];
    /** 工程类型 */
    public isHpcPro = false;
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public runUserDataObj: LaunchRunUser = {};
    public isLaunch = false;
    public isAttach = false;
    public isProfile = true;
    public isEdit: boolean;
    public i18n: any;
    public isRestart = false; // 是否重启
    public typeItem: any = {};
    public commentItems: any = {};
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    public launchItemsLockForm: FormGroup;
    public attachItemsLockForm: FormGroup;
    public profileItemsLockForm: FormGroup;
    public lCurrntFormLock: FormGroup;

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
    public lockTypeSelected: any = this.lockTypeOptions[0];
    public LaunchItemsLock: any = {};
    public profileItemLock: any = {};
    public attachItemsLock: any = {};
    public startCheckLock: any = {};

    public typeLDesc = '';
    public keepData: any;
    public appAndPidValid = false;
    public nodeList = false;
    // 获取数据
    public formDatas: any;
    // 修改预约任务 接收从预约传来的值
    public editScheduleTask = false;
    public scheduleTaskId: any;
    public isCustomFlag = false;
    public functionNamesSelected: any;
    public functionNames: any;
    // 字符串
    public strObj = {
        custom_lock_function: 'Customized Lock and Wait Function',
        kcore: 'Associate Kernel Function with Assembly Code',
    };

    public intervalBlur: SpinnerBlurInfo;
    public collectFileBlur: SpinnerBlurInfo;
    public samplingDurationBlur: SpinnerBlurInfo;
    public startCheckSys: any = {};
     /** hpc工程节点选择器是否禁用 */
    public isSelectNodeDisabled = false;
    isLoading = true;

    /**
     * ngOnInit
     */
     async ngOnInit() {
        try {
          const resp = await this.projectNodeListService.getProjectNodes(
            this.projectId
          );
          this.isLoading = false;
          if (resp?.data?.nodeList) {
            // 存储工程下的节点信息
            this.allNodeList = resp.data.nodeList;
            if (!(this.isEdit || this.isRestart)) {
              this.lCurrntFormLock.controls.nodeList.patchValue(
                this.allNodeList.length > 10
                  ? this.allNodeList.slice(0, 10)
                  : this.allNodeList
              );
            }
          }
        } catch (err) {
          this.isLoading = false;
        }

        if (this.actionType !== 'restart') {
            // 默认全选标准函数
            const cloneFunNames = [].concat(this.functionNames);
            this.functionNamesSelected = cloneFunNames;
        }

        this.profileItemsLockForm.controls.cpu_spinner_ctrl.setValue('1');
        this.profileItemsLockForm.controls.c_d_ctrl.setValue('30');
        this.profileItemsLockForm.controls.cpu_ctrl.setValue({
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
        });

        this.launchItemsLockForm.controls.cpu_spinner_ctrl.setValue('1');
        this.launchItemsLockForm.controls.dire_ctrl.setValue({
            label: this.i18n.common_term_task_start_path,
            id: 'application path',
        });
        this.launchItemsLockForm.controls.cpu_ctrl.setValue({
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
        });

        this.attachItemsLockForm.controls.cpu_spinner_ctrl.setValue('1');
        this.attachItemsLockForm.controls.c_d_ctrl.setValue('30');
        this.attachItemsLockForm.controls.cpu_ctrl.setValue({
            label: this.i18n.common_term_task_start_custerm,
            id: 'customize',
        });
        if (this.isRestart) {
            setTimeout(() => {
                this.preSwitchLock.switchState = false;
            }, 0);
        }
        this.setSpinnerBlur();
    }

    /**
     * 节点选择控件是否需要校验
     */
    private onDisabledFormNodeList() {
        if (this.isHpcPro) {
          this.profileItemsLockForm.controls.nodeList.enable();
          this.launchItemsLockForm.controls.nodeList.enable();
          this.attachItemsLockForm.controls.nodeList.enable();
        } else {
          this.profileItemsLockForm.controls.nodeList.disable();
          this.launchItemsLockForm.controls.nodeList.disable();
          this.attachItemsLockForm.controls.nodeList.disable();
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
     * ngOnChanges
     * @param changes 参数
     */
    ngOnChanges(changes: SimpleChanges) {
        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'switchState':
                    if (changes.switchState.currentValue) {
                        this.runUserData.runUser = true;
                        // 指定用户，用户名由用户输入
                        this.runUserData.user = '';
                        this.startCheckLock.checked = true;
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
                    if (this.nodeConfigL) {
                        this.nodeConfigL.clear();
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
                this.lCurrntFormLock = this.profileItemsLockForm;
                this.lockTypeSelected = this.lockTypeOptions[1];
                break;
            case 1:
                this.isProfile = false;
                this.isLaunch = true;
                this.appAndPidValid = this.modeAppValid;
                this.isAttach = false;
                this.lCurrntFormLock = this.launchItemsLockForm;
                this.lockTypeSelected = this.lockTypeOptions[0];
                break;
            case 2:
                this.isProfile = false;
                this.isLaunch = false;
                this.isAttach = true;
                this.appAndPidValid = this.modePidValid;
                this.lCurrntFormLock = this.attachItemsLockForm;
                this.lockTypeSelected = this.lockTypeOptions[2];
                break;
        }
        this.setSpinnerBlur();
    }

    /**
     * cpu_interval_change
     * @param data 参数一
     * @param cpu 参数二
     * @param type 参数三
     */
    public cpu_interval_change(data: any, cpu: any, type: string) {
        const THIS = cpu;
        THIS.unit =
            data.id === 'higher'
                ? this.i18n.common_term_task_crate_us
                : this.i18n.common_term_task_crate_ms;
        const spinnerVal = data.id === 'higher' ? '710' : '1';
        if (type === 'lock') {
            const tempForm = this.isLaunch
                ? this.launchItemsLockForm
                : this.isAttach
                    ? this.attachItemsLockForm
                    : this.profileItemsLockForm;
            tempForm.controls.cpu_spinner_ctrl.setValue(spinnerVal);
            if (data.id === 'higher') {
                tempForm.controls.cpu_spinner_ctrl.disable();
            } else {
                tempForm.controls.cpu_spinner_ctrl.enable();
            }
        }
        this.updateWebViewPage();
    }

    /**
     * 当点击开启参数配置时
     * @param taskName 参数
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
        this.updateWebViewPage();
    }

    /**
     * 禁用
     * @param taskName 参数
     */
    public onDisableForm(taskName: any) {
        switch (taskName) {
            case 'l_attach':
                this.attachItemsLockForm.controls.b_s_ctrl.disable();
                this.attachItemsLockForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                this.handlePidTidDisable.emit(true);
                break;
            case 'l_launch':
                this.launchItemsLockForm.controls.b_s_ctrl.disable();
                this.launchItemsLockForm.controls.source_ctrl.disable();
                this.sendAppOrPidDisable.emit(true);
                break;
            case 'l_profile':
                this.sendAppOrPidDisable.emit(true);
                this.profileItemsLockForm.controls.b_s_ctrl.disable();
                this.profileItemsLockForm.controls.source_ctrl.disable();

                break;
            default:
                this.handlePidTidDisable.emit(false);
                this.sendAppOrPidDisable.emit(false);
                this.attachItemsLockForm.controls.b_s_ctrl.enable();
                this.attachItemsLockForm.controls.source_ctrl.enable();
                this.launchItemsLockForm.controls.b_s_ctrl.enable();
                this.launchItemsLockForm.controls.source_ctrl.enable();
                this.profileItemsLockForm.controls.b_s_ctrl.enable();
                this.profileItemsLockForm.controls.source_ctrl.enable();
                break;
        }
        this.onDisabledFormNodeList();
        this.updateWebViewPage();
    }

    /**
     * 获取表单数据
     */
    public getFormDatas() {
        const self = this;
        const temp = this.isLaunch
            ? this.launchItemsLockForm
            : this.isAttach
                ? this.attachItemsLockForm
                : this.profileItemsLockForm;
        const errors = TiValidators.check(temp);
        const ctrls = temp.controls;

        const totalFnNames = this.getFunctionNames(ctrls.functionNamesForm.value, ctrls.functions.value);
        const params: any = {
            'analysis-type': 'system_lock',
            projectname: self.projectName,
            taskname: self.taskName,
            'analysis-target': self.lockTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : '0.71',
            'profiling-mode': 'Native',
            functionname: totalFnNames,
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value,
            collect_range: ctrls.typeItem_ctrl.value.id,
            kcore: ctrls.kcore.value,
            collect_file_size: ctrls.fileSize.value || 1024,
        };
        if (self.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['profiling-mode'] = 'Native';
        }
        if (self.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
        }
        if (self.isAttach) {
            params['target-pid'] = this.modePid || '';
            params.process_name = this.modeProcess;
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.preSwitchLock.switchState) {
            // 预约
            if (this.preSwitchLock.selected === 1) {
                const durationArr = this.preSwitchLock.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchLock.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchLock.onceTime.split(' ');
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
        return new Promise((resolve, reject) => {
            const data: any = [];
            if (this.isHpcPro) {
                const curSelectNode = this.lCurrntFormLock.controls.nodeList.value;
                curSelectNode.forEach((item: any) => {
                  this.runUserDataObj[item.nickName] = {
                    runUser: this.runUserData.runUser,
                    user_name: this.runUserData.user,
                    password: this.runUserData.password
                  };
                  data.push({
                    nodeId: item.id,
                    nickName: item.nickName,
                    task_param: Object.assign({}, { status: false }, this.formDatas),
                  });
                });
                resolve(data);
              }else {
                this.vscodeService.get({ url }, (res: any) => {
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
     * 获取函数信息
     */
    public getFunctionNames(fnNames: any, customFns: any) {
        // 如果选项有all 则去除
        const finded = fnNames.find((item: any) => item.value === 'all');
        if (finded) {
            fnNames = fnNames.slice(1);
        }

        let namesFn = '';
        if (fnNames && fnNames.length) {
            const tmpArr: any = [];
            fnNames.map((item: any) => {
                tmpArr.push(item.value);
            });
            namesFn = tmpArr.join(';');
        }

        if (customFns && !namesFn) {
            return customFns;
        } else if (!customFns && namesFn) {
            return namesFn;
        } else if (!customFns && !namesFn) {
            return '';
        } else {
            return `${namesFn};${customFns}`;
        }
    }

    /**
     * 重启或导入模板时 设置函数和自定义函数的值
     */
    public setFunctionNames(orgName: any) {
        if (orgName) {
            const fnNames: any = [];
            const customFnNames: any = [];
            const splitArr = orgName.split(';');
            splitArr.map((item: any) => {
                const finded = this.functionNames.find((fnName: any) => fnName.value === item);
                if (finded) {
                    fnNames.push(finded);
                } else {
                    customFnNames.push(item);
                }
            });

            return {
                fnNames,
                customFnNames: customFnNames.join(';')
            };
        } else {
            return null;
        }
    }

    /**
     * 创建任务
     * @param isEdit 参数
     */
    async createLockAnalysis(isEdit: any) {
        const context = this;
        const temp = this.isLaunch
            ? this.launchItemsLockForm
            : this.isAttach
                ? this.attachItemsLockForm
                : this.profileItemsLockForm;
        const errors = TiValidators.check(temp);
        const ctrls = temp.controls;

        const totalFnNames = this.getFunctionNames(ctrls.functionNamesForm.value, ctrls.functions.value);
        const params: any = {
            'analysis-type': 'system_lock',
            projectname: context.projectName,
            taskname: context.taskName,
            'analysis-target': context.lockTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === context.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : '0.71',
            'profiling-mode': 'Native',
            functionname: totalFnNames,
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value,
            collect_range: ctrls.typeItem_ctrl.value.id,
            kcore: ctrls.kcore.value,
            collect_file_size: ctrls.fileSize.value || 1024,
        };
        if (context.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['profiling-mode'] = 'Native';
        }
        if (context.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
        }
        if (context.isAttach) {
            params['target-pid'] = this.modePid || '';
            params.process_name = this.modeProcess;
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.nodeConfigL.switchStatus) {
            params.switch = true;
            const nodeData: any = this.nodeConfigL.getNodesConfigParams({}).nodeConfig;
            this.runUserDataObj = this.nodeConfigL.getNodesConfigParams({}).runUserData;
            if (context.isLaunch) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.functionname = params.functionname;
                    return item;
                });
            }
            if (context.isProfile) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.duration = params.duration;
                    item.task_param.functionname = params.functionname;
                    return item;
                });
            }
            if (context.isAttach) {
                params.nodeConfig = nodeData.map((item: any, index: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.duration = params.duration;
                    item.task_param.functionname = params.functionname;
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
        if (this.preSwitchLock.switchState) {
            this.startCheckLock.checked = false;
            const flag = await this.createPreMission(
                this.preSwitchLock,
                params,
                'post'
            );
            if (flag) {
                this.startCheckLock.checked = true;
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
                        const data1 = data.data;
                        if (data.code === 'SysPerf.Success') {
                            this.vscodeService.showTuningInfo(data.message, 'info', 'modifyTask');
                            if (this.startCheckLock.checked) {
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
                        this.vscodeService.showInfoBox(
                            this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                0: this.taskName
                            }), 'info');
                        if (context.startCheckLock.checked) {
                            context.startDataSamplingTask(
                                context.projectName,
                                context.taskName,
                                data.data.id,
                                params
                            );
                        } else {
                            context.closeTab.emit({});
                        }
                    }
                });
            } else {
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    const postFunc = () => {
                        this.zone.run(() => {
                            const option = {
                                url: '/tasks/',
                                params
                            };
                            context.vscodeService.post(option, (res: any) => {
                                if (res.code === 'SysPerf.Success') {
                                    this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                    const data = res.data;
                                    if (context.startCheckLock.checked) {
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
                                createLockInstance.close();
                            });
                        });
                    };
                    const createLockInstance = this.tiMessage.open({
                        id: 'create',
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: '<div>' +
                            '<div class="warn-tip-msg">' +
                            '<div class="ti3-icon ti3-icon-warn"></div>' + this.i18n.secret_count + '</div>' +
                            '</div>',
                        dismiss: (): void => {
                            this.zone.run(() => {
                                createLockInstance.close();
                            });
                        },
                        okButton: {
                            show: true,
                            click: (): void => {
                                postFunc();
                            }
                        },
                        cancelButton: {
                            show: true,
                            click: (): void => {
                                this.zone.run(() => {
                                    createLockInstance.close();
                                });
                            }
                        }
                    });
                } else {
                    const self = this;
                    this.tiModal.open(this.createLockConfirmModal, {
                        // 定义id防止同一页面出现多个相同弹框
                        id: 'createMicarch',
                        modalClass: 'createLockConfirmModal',
                        close() {
                            // 调优助手跳转创建任务
                            if (self.taskDetail && self.taskDetail.isFromTuningHelper) {
                                Object.assign(
                                    params,
                                    {
                                        suggestionId: self.taskDetail.suggestionId,
                                        // 优化建议id
                                        optimizationId: self.taskDetail.optimizationId,
                                        // 调优助手任务id
                                    }
                                );
                            }
                            const option = {
                                url: '/tasks/',
                                params
                            };
                            context.vscodeService.post(option, (res: any) => {
                                if (res.status) {
                                    context.vscodeService.showInfoBox(res.message, 'error');
                                } else {
                                    const data = res.data;
                                    if (context.startCheckLock.checked) {
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
                                            nodeid: params.nodeConfig[0].nodeId,
                                            taskId: data.id,
                                            startCheckCNo: true,
                                            taskType: data['analysis-type'],
                                            status: data['task-status'],
                                            projectName: context.projectName
                                        });
                                    }
                                    context.vscodeService.showInfoBox(
                                        context.I18n.I18nReplace(context.i18n.plugins_term_task_create_success, {
                                            0: context.taskName
                                        }), 'info');
                                }
                            });
                        }
                    });
                }
            }
        }

    }

    /**
     * 创建/修改 预约任务函数
     * @param self 参数一
     * @param params 参数二
     * @param method 参数三
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
            const options = {
                url: urlAnalysis,
                params
            };
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
                const option = {
                    url: urlAnalysis,
                    params
                };
                this.vscodeService[method](option, (res: any) => {
                    // 接口调用失败，则有status返回
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
                        this.nodeConfigL.clear();
                        this.sendPretable.emit('on');
                        this.closeTab.emit({});
                        resolve(true);
                    }
                });
            });
        }
    }


    /**
     * 取消按钮
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
     * 导入模板 重启时设置表单数据
     */
    public getTemplateData(e: any): void {
        this.taskNameValid = true;
        this.modeAppValid = true;
        this.modePidValid = true;
        const tmpFnNames = this.setFunctionNames(e.functionname);
        const typeItem = this.commentItems.typeItem.options.filter((val: any) => {
            return val.id === e.collect_range;
        });
        if (e['analysis-target'].indexOf('Launch') > -1) {
            this.typeLDesc = this.i18n.common_term_task_type_launch;
            this.isLaunch = true;
            this.isProfile = false;
            this.isAttach = false;

            this.lockTypeSelected = this.lockTypeOptions[0];
            this.launchItemsLockForm.controls.functionNamesForm.setValue(
                tmpFnNames ? tmpFnNames.fnNames : []
            );
            if (tmpFnNames) {
                if (tmpFnNames.fnNames.length === this.functionNames.length - 1) {
                    this.functionNamesSelected = [].concat(this.functionNames);
                } else {
                    this.functionNamesSelected = tmpFnNames.fnNames;
                }
            }
            this.launchItemsLockForm.controls.functions.setValue(
                tmpFnNames ? tmpFnNames.customFnNames : ''
            );
            this.launchItemsLockForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.launchItemsLockForm.controls.source_ctrl.setValue(
                e.sourceLocation
            );
            this.launchItemsLockForm.controls.cpu_spinner_ctrl.setValue(
                e.interval
            );
            if (e.interval === '0.71') {
                this.launchItemsLockForm.controls.cpu_ctrl.setValue({
                    label: this.i18n.common_term_task_start_high_precision,
                    id: 'higher',
                });
            }
            this.launchItemsLockForm.controls.typeItem_ctrl.setValue(
                typeItem[0]
            );
            this.launchItemsLockForm.controls.kcore.setValue(
                e.kcore,
            );
            this.launchItemsLockForm.controls.fileSize.setValue(
                e.collect_file_size
            );
            this.launchItemsLockForm.controls.nodeList.setValue(
                e.nodeConfig
              );
            this.lCurrntFormLock = this.launchItemsLockForm;
        } else if (e['analysis-target'].indexOf('Profile') > -1) {
            this.typeLDesc = this.i18n.common_term_task_type_profile;
            this.isLaunch = false;
            this.isProfile = true;
            this.isAttach = false;

            this.profileItemsLockForm.controls.functionNamesForm.setValue(
                tmpFnNames ? tmpFnNames.fnNames : []
            );
            if (tmpFnNames) {
                if (tmpFnNames.fnNames.length === this.functionNames.length - 1) {
                    this.functionNamesSelected = [].concat(this.functionNames);
                } else {
                    this.functionNamesSelected = tmpFnNames.fnNames;
                }
            }
            this.profileItemsLockForm.controls.functions.setValue(
                tmpFnNames ? tmpFnNames.customFnNames : ''
            );

            this.profileItemsLockForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.profileItemsLockForm.controls.source_ctrl.setValue(
                e.sourceLocation
            );
            this.lockTypeSelected = this.lockTypeOptions[1];
            this.profileItemsLockForm.controls.cpu_spinner_ctrl.setValue(
                e.interval
            );
            this.profileItemsLockForm.controls.c_d_ctrl.setValue(e.duration);
            if (e.interval === '0.71') {
                this.profileItemsLockForm.controls.cpu_ctrl.setValue({
                    label: this.i18n.common_term_task_start_high_precision,
                    id: 'higher',
                });
            }
            this.profileItemsLockForm.controls.typeItem_ctrl.setValue(
                typeItem[0]
            );
            this.profileItemsLockForm.controls.kcore.setValue(
                e.kcore,
            );
            this.profileItemsLockForm.controls.fileSize.setValue(
                e.collect_file_size
            );
            this.profileItemsLockForm.controls.nodeList.setValue(
                e.nodeConfig
              );
            this.lCurrntFormLock = this.profileItemsLockForm;
        } else if (e['analysis-target'].indexOf('Attach') > -1) {
            this.typeLDesc = this.i18n.common_term_task_type_attach;
            this.isLaunch = false;
            this.isProfile = false;
            this.isAttach = true;
            this.attachItemsLockForm.controls.functionNamesForm.setValue(
                tmpFnNames ? tmpFnNames.fnNames : []
            );
            if (tmpFnNames) {
                if (tmpFnNames.fnNames.length === this.functionNames.length - 1) {
                    this.functionNamesSelected = [].concat(this.functionNames);
                } else {
                    this.functionNamesSelected = tmpFnNames.fnNames;
                }
            }
            this.attachItemsLockForm.controls.functions.setValue(
                tmpFnNames ? tmpFnNames.customFnNames : ''
            );
            this.attachItemsLockForm.controls.b_s_ctrl.setValue(
                e.assemblyLocation
            );
            this.attachItemsLockForm.controls.source_ctrl.setValue(
                e.sourceLocation
            );

            this.lockTypeSelected = this.lockTypeOptions[2];
            this.attachItemsLockForm.controls.cpu_spinner_ctrl.setValue(
                e.interval
            );
            this.attachItemsLockForm.controls.c_d_ctrl.setValue(e.duration);
            if (e.interval === '0.71') {
                this.attachItemsLockForm.controls.cpu_ctrl.setValue({
                    label: this.i18n.common_term_task_start_high_precision,
                    id: 'higher',
                });
            }
            this.attachItemsLockForm.controls.typeItem_ctrl.setValue(
                typeItem[0]
            );
            this.attachItemsLockForm.controls.kcore.setValue(
                e.kcore,
            );
            this.attachItemsLockForm.controls.fileSize.setValue(
                e.collect_file_size
            );
            this.attachItemsLockForm.controls.nodeList.setValue(
                e.nodeConfig
              );
            this.lCurrntFormLock = this.attachItemsLockForm;
        }

        // 预约任务数据导入
        this.preSwitchLock.importTemp(e);
        // 配置节点参数
        if (e.switch) {
            switch (e['analysis-target']) {
                case 'Launch Application':
                    this.onDisableForm('l_launch');
                    break;
                case 'Profile System':
                    this.onDisableForm('l_profile');
                    break;
                case 'Attach to Process':
                    this.onDisableForm('l_attach');
                    break;
                default:
                    break;
            }
            // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
            setTimeout(() => this.nodeConfigL.importTemp(e.nodeConfig));
        } else {
            this.nodeConfigL.clear();
        }
        if (this.isEdit || this.isRestart) {
            this.preSwitchLock.isEdit = this.isEdit || this.isRestart;
        }
    }

    /**
     * 保存模板
     */
    async saveTemplates() {
        const self = this;
        const temp = this.isLaunch
            ? this.launchItemsLockForm
            : this.isAttach
                ? this.attachItemsLockForm
                : this.profileItemsLockForm;
        const errors = TiValidators.check(temp);
        const ctrls = temp.controls;

        const totalFnNames = this.getFunctionNames(ctrls.functionNamesForm.value, ctrls.functions.value);
        const params: any = {
            'analysis-type': 'system_lock',
            projectname: self.projectName,
            taskname: self.taskName,
            'analysis-target': self.lockTypeSelected.label,
            interval:
                ctrls.cpu_ctrl.value.label === self.i18n.common_term_task_start_custerm
                    ? ctrls.cpu_spinner_ctrl.value
                    : '0.71',
            'profiling-mode': 'Native',
            functionname: totalFnNames,
            assemblyLocation: ctrls.b_s_ctrl.value,
            sourceLocation: ctrls.source_ctrl.value,
            collect_range: ctrls.typeItem_ctrl.value.id,
            kcore: ctrls.kcore.value,
            collect_file_size: ctrls.fileSize.value || 1024,
        };
        if (self.isLaunch) {
            params['app-dir'] = this.modeApplication || '';
            params['app-parameters'] = this.modeAppParams || '';
            params['profiling-mode'] = 'Native';
        }
        if (self.isProfile) {
            params.duration = ctrls.c_d_ctrl.value;
        }
        if (self.isAttach) {
            params['target-pid'] = this.modePid || '';
            params.process_name = this.modeProcess;
            params.duration = ctrls.c_d_ctrl.value;
            params['profiling-mode'] = 'Native';
        }
        if (this.preSwitchLock.switchState) {
            // 预约
            if (this.preSwitchLock.selected === 1) {
                const durationArr = this.preSwitchLock.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchLock.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchLock.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        if (this.nodeConfigL.switchStatus) {
            params.switch = true;
            params.nodeConfig = this.nodeConfigL.getNodesConfigParams({}).nodeConfig;
        } else {
            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas();
        }
        this.keepData = params;
        this.sendMissionKeep.emit(this.keepData);
    }

    /**
     * 清空任务参数
     */
    public clear() {
        this.nodeConfigL.clear();
        this.preSwitchLock.clear();
    }

    /**
     * 立即启动
     * @param projectname 参数一
     * @param taskname 参数二
     * @param id 参数三
     * @param params 参数四
     */
    public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
        const option: any = { status: 'running' };
        if (this.isLaunch) {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        const url = '/res-status/?type=disk_space&project-name=' +
            encodeURIComponent(projectname) +
            '&task-name=' +
            encodeURIComponent(taskname);
        this.vscodeService.get({ url }, () => {
            const self = this;
            const options = {
                url: '/tasks/' + id + '/status/',
                params: option
            };
            this.vscodeService.put(options, (res: any) => {
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
     * 重启
     * @param params 参数
     */
    public restartFunction(params: any) {
        params.status = 'restarted';
        if (this.isLaunch) {
            params.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        const self = this;
        // 调优助手跳转创建任务
        if (self.taskDetail && self.taskDetail.isFromTuningHelper) {
            Object.assign(
                params,
                {
                    suggestionId: self.taskDetail.suggestionId,
                    optimizationId: self.taskDetail.optimizationId,
                }
            );
        }
        const option = {
            url: '/tasks/' + this.restartAndEditId + '/status/',
            params
        };
        this.vscodeService.put(option, (res: any) => {
            if (res.status) {
                self.vscodeService.showInfoBox(res.message, 'error');
                return;
            }
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
            self.vscodeService.showInfoBox(this.I18n.I18nReplace(this.i18n.plugins_term_task_reanalyze_success, {
                0: this.taskName
            }), 'info');
            this.isRestart = false;
        });
    }

    /**
     * handleNodeEmit
     * @param e 参数
     */
    public handleNodeEmit(e: any) {
        this.handleNodeEmitIndex.emit(e);
    }

    /**
     * profile 函数选择change
     */
    public profileFunctionNameChange(data: any) {
        if (data && data.length) {
            if (data.length === this.functionNames.length) { return; }
            const finded = data.find((item: any) => item.value === 'all');
            // 选中all
            if (finded) {
                if (data[0].select) {
                    this.functionNames[0].select = false;
                    this.functionNamesSelected = data.slice(1);
                } else {
                    this.functionNames[0].select = true;
                    this.functionNamesSelected = [].concat(this.functionNames);
                }
            } else { // 未选中all
                if (this.functionNames[0].select) {
                    if (data.length + 1 === this.functionNames.length) {
                        this.functionNamesSelected = [];
                        this.functionNames[0].select = false;
                    }
                } else {
                    if (data.length + 1 === this.functionNames.length) {
                        this.functionNamesSelected = [].concat(this.functionNames);
                        this.functionNames[0].select = true;
                    }
                }
            }
        }
        this.updateWebViewPage();
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        const form = this.isLaunch
            ? this.launchItemsLockForm
            : this.isAttach
                ? this.attachItemsLockForm
                : this.profileItemsLockForm;

        this.intervalBlur = {
            control: form.controls.cpu_spinner_ctrl,
            min: 1,
            max: 1000,
        };
        this.collectFileBlur = {
            control: form.controls.fileSize,
            min: 1,
            max: 4096,
        };
        this.samplingDurationBlur = {
            control: form.controls.c_d_ctrl,
            min: 1,
            max: 300,
        };
        this.updateWebViewPage();
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
                    this.launchItemsLockForm.controls[type].setValue(minVal);
                    this.profileItemsLockForm.controls[type].setValue(minVal);
                    this.attachItemsLockForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.launchItemsLockForm.controls[type].setValue(maxVal);
                    this.profileItemsLockForm.controls[type].setValue(maxVal);
                    this.attachItemsLockForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'fileSize') {
                const maxVal = this.collectFileBlur.max;
                const minVal = this.collectFileBlur.min;
                if (value < minVal) {
                    this.launchItemsLockForm.controls[type].setValue(minVal);
                    this.profileItemsLockForm.controls[type].setValue(minVal);
                    this.attachItemsLockForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.launchItemsLockForm.controls[type].setValue(maxVal);
                    this.profileItemsLockForm.controls[type].setValue(maxVal);
                    this.attachItemsLockForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'c_d_ctrl') {
                const maxVal = this.samplingDurationBlur.max;
                const minVal = this.samplingDurationBlur.min;
                if (value < minVal) {
                    this.profileItemsLockForm.controls[type].setValue(minVal);
                    this.attachItemsLockForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.profileItemsLockForm.controls[type].setValue(maxVal);
                    this.attachItemsLockForm.controls[type].setValue(maxVal);
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

    public filrFizeBlur(e: any) {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            if (e.target.value === '') {
                e.target.value = 1;
            }
        }
    }
}
