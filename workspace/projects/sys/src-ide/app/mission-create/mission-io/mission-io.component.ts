import {
    Component, OnInit, Output, Input, EventEmitter, OnChanges,
    SimpleChange, ChangeDetectorRef, ViewChild, NgZone
} from '@angular/core';
import { TiValidators, TiValidationConfig } from '@cloud/tiny3';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { SuperData, IoFormControls, RawDataIO } from './io-domain/index';
import { AnalysisModeEnum, AnalysisTargetEnum, TaskActionType, RunUserDataObj } from './../mission-domain/index';
import { MissionIoDataService } from './services/mission-io-data.service';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import { VscodeService } from '../../service/vscode.service';
import { NET_HPC_NODE_NUM_MAX } from 'sys/src-com/app/global/constant';
import { PROJECT_TYPE } from '../../service/axios.service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-io',
    templateUrl: './mission-io.component.html',
    styleUrls: ['./mission-io.component.scss']
})
export class MissionIoComponent implements OnInit, OnChanges {
    @Output() sendMissionKeep = new EventEmitter<any>();
    @Output() sendPretable = new EventEmitter<any>();
    @Output() closeTab = new EventEmitter<any>();
    @Output() sendAppOrPidDisable = new EventEmitter<boolean>();
    @Output() private handlePidTidDisable = new EventEmitter<any>();
    @Output() private handleNodeEmitIndex = new EventEmitter<any>();
    @ViewChild('preSwitchIO', { static: false }) preSwitchIO;
    @ViewChild('nodeConfigC', { static: false }) nodeConfigC;

    @Input()
    set scenes(val: PROJECT_TYPE){
        if (null == val){
            return ;
        }
        this.scenesStash = val;
        PROJECT_TYPE.TYPE_HPC === val
            ? this.formGroup.get('nodeList').enable()
            : this.formGroup.get('nodeList').disable();
    }
    get scenes(){
        return this.scenesStash;
    }
    @Input() labelWidth: string;
    /** 工程名称 */
    @Input() projectName: string;
    /** 任务名称 */
    @Input() taskName: string;
    /** 任务名称验证标识 */
    @Input() taskNameValid: boolean;
    /** 任务ID */
    @Input() projectId: number;
    /**  */
    @Input() restartAndEditId: number;
    /** 是否为修改任务 */
    @Input() isModifySchedule: boolean;
    /** 分析模式：0--Profile System, 1--Launch Application, 2--Attach to Process */
    @Input() typeId: number;
    /** Launch Application: 应用名称 */
    @Input() modeApplication: string;
    /** Launch Application: 应用参数 */
    @Input() switchState: boolean;
    @Input() modeApplicationUser: string;
    @Input() modeApplicationPassWord: string;
    @Input() modeAppParams: string;
    /** Launch Application: 应用名称和应用参数的输入验证标志 */
    @Input() modeAppValid: boolean;
    /** Attach to Process: Pid */
    @Input() modePid: string;
    /** Attach to Process: 进程名称 */
    @Input() modeProcess: string;
    /** Attach to Process: Pid 和进程名称的输入验证标志 */
    @Input() modePidValid: boolean;
    /** 任务行为 */
    @Input() actionType: 'restart' | 'edit' | 'create' | 'scheduleEdit';
    /** 任务详情 */
    @Input() taskDetail: any;
    @Input() nodeConfigShow: boolean;
    @Input() nodeConfigedData: any;
    @Input() modeAppRunUserValid: boolean;
    @Input() modeAppPathAllow: string;

    analysisScene = PROJECT_TYPE;
    scenesStash: PROJECT_TYPE;
    /** 分析模式 */
    public analysisMode: AnalysisModeEnum;
    /** 分析对象 */
    public analysisTarget: AnalysisTargetEnum;
    /** 行为方式 */
    public taskActionType: TaskActionType;
    /** 表单控件 */
    public formGroup: FormGroup;
    /** 表单控件组 */
    public ctl: IoFormControls;
    /** 父组件的数据 */
    public superData: SuperData;
    /** 国际化 */
    public i18n: any;
    /** 父组件的验证 */
    private superParamsEnable = false;
    /** 本组件的验证 */
    private paramsEnable = true;
    /** 操作动作的使能与失能 */
    public opreationEnable = false;
    /** 配置表 */
    public formOption = {
        doOrder: { display: true },
        orderConfig: { display: false },
        doNodeConfig: { display: false },
        taskStartNow: { display: true },
    };
    public commentItems: any = {};
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    // 获取当前表单输入数据
    public formDatas: any;
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public runUserDataObj: RunUserDataObj = {};
    isLoading = true;

    constructor(
        public I18n: I18nService,
        private dataService: MissionIoDataService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private vscodeService: VscodeService,
        private zone: NgZone,
        private projectNodeListService: ProjectNodeListService
    ) {
        this.i18n = I18n.I18n();
        this.formGroup = this.fb.group({
            nodeList: new FormControl([]),
            duration: new FormControl(30, [
                TiValidators.required,
                TiValidators.minValue(2),
                TiValidators.maxValue(300),
            ]), // 采样时长
            statistical: new FormControl(1, [
                TiValidators.required,
                TiValidators.minValue(1),
                TiValidators.maxValue(5),
            ]), // 统计周期
            size: new FormControl(100, [
                TiValidators.required,
                TiValidators.minValue(10),
                TiValidators.maxValue(500),
            ]), // 采集文件大小
            stack: [false], // 采集调用栈
            doOrder: [false], // 是否预约定时启动
            orderConfig: [], // 预约配置参数
            doNodeConfig: [false], // 是否进行节点参数配置
            nodeConfig: [], // 配置节点参数
            taskStartNow: [true], // 立即启动
        });
        this.ctl = this.formGroup.controls;

        this.commentItems = {
            duration: {
                label: this.i18n.storageIO.mission_create.duration,
                required: true,
                placeholder: '2-300',
                format: 'N0',
                step: 1,
                min: 2,
                max: 300,
                tailPrompt: '(2~300)',
            },
            statistical: {
                label: this.i18n.storageIO.mission_create.statistical,
                required: true,
                placeholder: '1-5',
                format: 'N0',
                step: 1,
                min: 1,
                max: 5,
                tailPrompt: '(1~5)',
            },
            size: {
                label: this.i18n.storageIO.mission_create.collection_size,
                required: true,
                placeholder: '10-500',
                format: 'N0',
                step: 1,
                min: 10,
                max: 500,
                tailPrompt: '(10~500)',
                tip: this.i18n.falsesharing.filesizeTips,
            }
        };
    }

    public intervalBlur: SpinnerBlurInfo;
    public collectFileBlur: SpinnerBlurInfo;
    public samplingDurationBlur: SpinnerBlurInfo;
    // 工程下节点信息
    nodeList: any[] = [];
    isSelectNodeDisabled: boolean;

    nodeConfig: any[] = [];

    /**
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
        // 控制界面的交互
        const doOrderSubject = this.ctl.doOrder.valueChanges.subscribe(doOrder => {
            this.formOption.orderConfig.display = doOrder;
            this.formOption.taskStartNow.display = !doOrder;
            this.cdr.detectChanges();
        });

        if (this.analysisMode === AnalysisModeEnum.PROFILE_SYSTEM) {
            this.formOption.doNodeConfig.display = false;
            this.cdr.detectChanges();
        } else {
            this.formOption.doNodeConfig.display = true;
        }
        // 操作（确认，保存模板）使能，失能控制
        this.formGroup.statusChanges.subscribe(status => {
            this.paramsEnable = (status === 'VALID');
            this.opreationEnable = this.superParamsEnable && this.paramsEnable;
        });
        if (this.taskActionType === 'restart') {
            setTimeout(() => {
                this.preSwitchIO.switchState = false;
            }, 0);
        }
        this.setSpinnerBlur();
    }

    /**
     * 监控 Input 参数的变化, 并初始化 分析模式 和 分析对象
     * @param changes 变化的 Input 参数
     */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'switchState':
                    if (changes.switchState.currentValue) {
                        this.runUserData.runUser = true;
                        // 指定用户，用户名由用户输入
                        this.runUserData.user = '';
                        // 立即执行开启 预约关闭
                        this.formGroup.controls.taskStartNow.setValue(true);
                        this.formGroup.controls.doOrder.setValue(false);
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
                    if (this.nodeConfigC) {
                        this.nodeConfigC.clear();
                    }
                    break;
                default: break;
            }
        }

        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'typeId':
                    // 判断分析对象和分析模式
                    switch (this.typeId) {
                        case 0:
                            this.analysisMode = AnalysisModeEnum.PROFILE_SYSTEM;
                            this.analysisTarget = AnalysisTargetEnum.SYSTEM;
                            break;
                        case 1:
                            this.analysisMode = AnalysisModeEnum.LAUNCH_APPLICATION;
                            this.analysisTarget = AnalysisTargetEnum.APPLICATION;
                            break;
                        case 2:
                            this.analysisMode = AnalysisModeEnum.ATTACH_TO_PROCESS;
                            this.analysisTarget = AnalysisTargetEnum.APPLICATION;
                            break;
                        default:
                            break;
                    }
                    break;
                case 'taskNameValid':
                case 'modeAppValid':
                case 'modePidValid':
                    this.validOnSuperChange();
                    switch (this.analysisMode) {
                        case AnalysisModeEnum.PROFILE_SYSTEM:
                            this.superParamsEnable = this.taskNameValid;
                            this.formOption.doNodeConfig.display = false;
                            break;
                        case AnalysisModeEnum.LAUNCH_APPLICATION:
                            this.superParamsEnable = this.taskNameValid && this.modeAppValid;
                            this.formOption.doNodeConfig.display = true;
                            break;
                        case AnalysisModeEnum.ATTACH_TO_PROCESS:
                            this.superParamsEnable = this.taskNameValid && this.modePidValid;
                            this.formOption.doNodeConfig.display = true;
                            break;
                        default:
                            break;
                    }
                    this.opreationEnable = this.superParamsEnable && this.paramsEnable;
                    break;
                case 'actionType':
                    switch (this.actionType) {
                        case 'restart':
                            this.taskActionType = TaskActionType.RESTART;
                            break;
                        case 'edit':
                            this.taskActionType = TaskActionType.EDIT;
                            break;
                        case 'create':
                            this.taskActionType = TaskActionType.CREATE;
                            break;
                        case 'scheduleEdit':
                            this.taskActionType = TaskActionType.SCHEDULEEDIT;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        this.superData = {
            projectName: this.projectName,
            taskName: this.taskName,
            projectId: this.projectId,
            modeAppParams: this.modeAppParams,
            modeApplication: this.modeApplication,
            modePid: this.modePid,
            modeProcess: this.modeProcess,
            restartAndEditId: this.restartAndEditId,
            scheduleTaskId: '',
        };
    }

    // 初始化或导入数据时给表单nodeList赋值
    setNodeListParam(nodeConfig: any[], allNodeList: any[]){
        if (allNodeList.length) {
            let nodeList = [];
            const isNotCreat = this.actionType !== TaskActionType.CREATE || this.isModifySchedule;
            nodeList = nodeConfig.length && isNotCreat
                ? nodeConfig.map((item: any) => {
                    return allNodeList.filter(
                    (nodeItem: any) => nodeItem.id === item.nodeId
                    )[0];
                })
                : allNodeList;
            this.formGroup.get('nodeList').setValue(
                nodeList.length > NET_HPC_NODE_NUM_MAX
                    ? nodeList.slice(0, NET_HPC_NODE_NUM_MAX)
                    : nodeList
            );
        }
    }
    selectNodeDisable(event: boolean){
        this.isSelectNodeDisabled = event;
    }

    /**
     * 事件处理： 创建任务、更新任务
     */
    public onCreateMission() {
        this.dataService.pushMissionData(
            this.formGroup, this.superData, this.analysisMode, this.taskActionType, this.sendPretable,
            this.closeTab, this.preSwitchIO, this.nodeConfigC, this, this.runUserData
        );
    }

    /**
     * 事件处理：关闭操作页面
     */
    public onClose() {
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
     * 事件处理：保存模板
     */
    public async onSaveTemplate() {
        const params = await this.dataService.getRawDataByControls(this.formGroup, this.analysisMode,
            this.superData, this.preSwitchIO, this.nodeConfigC, this.runUserData
        );
        this.sendMissionKeep.emit(params);
    }

    /**
     * 当父组件的表单值发生改变是，根据其验证标识，验证和控制当前表单的状态和合理性
     */
    public validOnSuperChange() {
        if (this.ctl.doNodeConfig == null) { return; }
        switch (this.analysisMode) {
            case AnalysisModeEnum.PROFILE_SYSTEM:
                break;
            case AnalysisModeEnum.LAUNCH_APPLICATION:
                if (this.taskNameValid && this.modeAppValid) {
                    this.ctl.doNodeConfig.enable({ emitEvent: false });
                } else {
                    this.ctl.doNodeConfig.setValue(false, { emitEvent: false });
                    this.ctl.doNodeConfig.disable({ emitEvent: false });
                }
                break;
            case AnalysisModeEnum.ATTACH_TO_PROCESS:
                if (this.taskNameValid && this.modePidValid) {
                    this.ctl.doNodeConfig.enable({ emitEvent: false });
                } else {
                    this.ctl.doNodeConfig.setValue(false, { emitEvent: false });
                    this.ctl.doNodeConfig.disable({ emitEvent: false });
                }
                break;
            default:
        }
    }

    /**
     * 当点击开启参数配置时
     * @param taskName 名称
     */
    public async onControlNode(taskName: any) {
        if (taskName) {
            // 开启
            this.formDatas = await this.dataService.getRawDataByControls(this.formGroup, this.analysisMode,
                this.superData, this.preSwitchIO, this.nodeConfigC, this.runUserData
            );
            let target = '';
            if (this.formDatas.hasOwnProperty('analysisTarget')) {
                target = this.formDatas.analysisTarget;
            } else {
                return;
            }
            const firstName = 'i_';
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
            case 'i_launch':
                this.sendAppOrPidDisable.emit(true);
                break;
            case 'i_attach':
                this.sendAppOrPidDisable.emit(true);
                this.handlePidTidDisable.emit(true);
                break;
            case 'i_profile':
                this.sendAppOrPidDisable.emit(true);
                break;

            default:
                this.handlePidTidDisable.emit(false);
                this.sendAppOrPidDisable.emit(false);
                break;
        }
    }

    /**
     *   传递节点参数
     */
    public handleNodeEmit(e: any) {
        this.handleNodeEmitIndex.emit(e);
    }

    /**
     * 模板赋值数据
     */
    public getTemplateData(taskData: RawDataIO) {
        this.dataService.setControlsByRawData(this.formGroup, taskData, this.analysisMode);
        // 预约任务数据导入
        this.preSwitchIO.importTemp(taskData);
        this.nodeConfig = taskData.nodeConfig;
        this.setNodeListParam(this.nodeConfig, this.nodeList);
        // 配置节点参数
        if (taskData.switch) {
            switch (taskData['analysis-target']) {
                case 'Launch Application':
                    this.onDisableForm('i_launch');
                    break;
                case 'Profile System':
                    this.onDisableForm('i_attach');
                    break;
                case 'Attach to Process':
                    this.onDisableForm('i_profile');
                    break;
                default:
                    break;
            }
            // 设置个定时器异步下，否则 配置节点参数获取的formData 没有获取到页面参数
            setTimeout(() => this.nodeConfigC.importTemp(taskData.nodeConfig));
        } else {
            if (this.nodeConfigC) {
                this.nodeConfigC.clear();
            }
        }
        this.cdr.detectChanges();
        if (this.preSwitchIO) {
            switch (this.actionType) {
                case 'restart':
                    this.taskActionType = TaskActionType.RESTART;
                    break;
                case 'edit':
                    this.taskActionType = TaskActionType.EDIT;
                    this.preSwitchIO.isEdit = true;
                    break;
                case 'create':
                    this.taskActionType = TaskActionType.CREATE;
                    break;
                default:
                    break;
            }
        }
    }

    /**
     *   清空任务参数
     */
    public clear() {
        if (this.nodeConfigC) {
            this.nodeConfigC.clear();
        }
        if (this.preSwitchIO) {
            this.preSwitchIO.clear();
        }
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.intervalBlur = {
            control: this.formGroup.controls.statistical,
            min: 1,
            max: 5,
        };
        this.collectFileBlur = {
            control: this.formGroup.controls.size,
            min: 10,
            max: 500,
        };
        this.samplingDurationBlur = {
            control: this.formGroup.controls.duration,
            min: 2,
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
            if (type === 'duration') {
                const maxVal = this.samplingDurationBlur.max;
                const minVal = this.samplingDurationBlur.min;
                if (value < minVal) {
                    this.formGroup.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.formGroup.controls[type].setValue(maxVal);
                }
            }
            if (type === 'statistical') {
                const maxVal = this.intervalBlur.max;
                const minVal = this.intervalBlur.min;
                if (value < minVal) {
                    this.formGroup.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.formGroup.controls[type].setValue(maxVal);
                }
            }
            if (type === 'size') {
                const maxVal = this.collectFileBlur.max;
                const minVal = this.collectFileBlur.min;
                if (value < minVal) {
                    this.formGroup.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.formGroup.controls[type].setValue(maxVal);
                }
            }
        }, 100);
    }
    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.cdr.detectChanges();
                this.cdr.checkNoChanges();
            });
        }
    }
}
