// 进程线程分析_create
import {
    Component, OnInit, ViewChild, OnChanges, Output,
    Input, EventEmitter, SimpleChanges, ChangeDetectorRef, NgZone
} from '@angular/core';
import { TiValidators, TiValidationConfig, TiModalService, TiMessageService } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService, HTTP_STATUS } from 'projects/sys/src-ide/app/service/vscode.service';
import { AnalysisModeEnum, RunUserDataObj, LaunchRunUser } from '../mission-domain/index';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import { CustomValidators } from '../taskParams/AllParams';
import { PROJECT_TYPE } from '../../service/axios.service';
import { HttpService } from 'sys/src-com/app/service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-process',
    templateUrl: './mission-process.component.html',
    styleUrls: ['./mission-process.component.scss']
})
export class MissionProcessComponent implements OnInit, OnChanges {
    constructor(
        private tiModal: TiModalService,
        public I18n: I18nService,
        public fb: FormBuilder,
        public scheduleTaskServer: ScheduleTaskService,
        public mytip: MytipService,
        private tiMessage: TiMessageService,
        private zone: NgZone,
        public vscodeService: VscodeService,
        private changeDetectorRef: ChangeDetectorRef,
        private projectNodeListService: ProjectNodeListService) {
        this.i18n = I18n.I18n();
        this.startCheckC = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
        this.processItems = {
            interval: {
                label: this.i18n.sys.interval,
                required: true,
                spinner: {
                    placeholder: '1-10',
                    min: 1,
                    max: 10,
                    format: 'N0',
                    step: 1,
                },
            },
            duration: {
                label: this.i18n.sys.duration,
                required: true,
                spinner: {
                    placeholder: '2-300',
                    min: 2,
                    max: 300,
                    format: 'N0',
                    step: 1,
                },
            },
            type: {
                label: this.i18n.sys.type,
            },
            info: {
                label: this.i18n.sys.time,
            },
            pidSwitch: {
                label: this.i18n.process.label.pid,
                required: true,
            },
            trace: {
                label: this.i18n.process.label.trace,
                required: false,
            },
            collection: {
                label: this.i18n.process.label.thread,
                required: false,
            },
        };
        // process
        this.processForm = fb.group({
            nodeList: new FormControl([]),
            interval: new FormControl('', {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(10),
                    CustomValidators.validTheSizeRelationship({
                        relatedFormControlName: 'duration',
                        tip: this.i18n.process.intervalTip,
                        calcExpression: ([valueA, valueB]) => valueA <= valueB / 2,
                    }),
                ],
                updateOn: 'change',
            }),
            duration: new FormControl('', {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(2),
                    TiValidators.maxValue(300),
                ],
                updateOn: 'change',
            }),
            pidSwitch: new FormControl('all', {
                validators: [TiValidators.required],
                updateOn: 'change',
            }),
            pidInput: new FormControl('', {
                updateOn: 'change',
            }),
            trace: new FormControl(false, {
                validators: [TiValidators.required],
                updateOn: 'change',
            }),
            collection: new FormControl(true, {
                validators: [TiValidators.required],
                updateOn: 'change',
            }),
        });
        this.processTypeOptions = [
            { id: 'cpu', text: 'CPU' },
            { id: 'mem', text: this.i18n.process.mem },
            { id: 'disk', text: this.i18n.process.disk },
            { id: 'context', text: this.i18n.process.context },
        ];
        this.processRadioList = [
            {
                key: 'All',
                id: 'all',
                disable: false,
            },
            {
                key: this.i18n.nodeConfig.pointed,
                id: 'notAll',
                disable: false,
            },
        ];
        this.startCheckProcess = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
    }
    @ViewChild('preSwitchProcess', { static: false }) preSwitchProcess: any;
    @ViewChild('createProcessConfirmModal', { static: false }) createProcessConfirmModal: any;
    @ViewChild('pretable', { static: false }) pretable: any;
    @ViewChild('nodeConfigC', { static: false }) nodeConfigC: any;
    @Output() private sendMissionKeep = new EventEmitter<any>();
    @Output() private sendPretable = new EventEmitter<any>();
    @Output() private closeTab = new EventEmitter<any>();
    @Output() private handleNodeEmitIndex = new EventEmitter<any>();
    @Output() private sendAppOrPidDisable = new EventEmitter<any>();
    @Output() private handlePidTidDisable = new EventEmitter<any>();

    @Input()
    set scenes(val: PROJECT_TYPE){
        if (null == val){
            return ;
        }
        this.scenesStash = val;
        PROJECT_TYPE.TYPE_HPC === val
            ? this.processForm.get('nodeList').enable()
            : this.processForm.get('nodeList').disable();
    }
    get scenes(){
        return this.scenesStash;
    }
    @Input() nodeConfigedData: any;
    @Input() labelWidth: string;
    @Input() projectName: string;
    @Input() taskName: string;
    @Input() taskNameValid: boolean;
    @Input() processName: string;
    @Input() modePid: string;
    @Input() projectId: number;
    @Input() restartAndEditId: number;
    @Input() nodeConfigShow: boolean;
    @Input() isModifySchedule: boolean;
    @Input() isRestart: boolean;
    @Input() panelId: any;
    @Input() appDir: string; // 应用名称
    @Input() appParameters: string; // 应用参数
    /** Launch Application: 应用运行用户 开关状态 */
    @Input() switchState: boolean;
    /** Launch Application: 应用运行用户 用户名 */
    @Input() modeApplicationUser: string;
    /** Launch Application: 应用运行用户 口令 */
    @Input() modeApplicationPassWord: string;
    @Input() modeAppValid: boolean;
    @Input() typeId: number;
    @Input() modeAppParamsValid: boolean;
    @Input() public targetClicked = 0;  // targetClicked=0 && modeClicked=0 表示系统分析对象；
    @Input() public modeClicked = 0; // targetClicked=1 && modeClicked=0  表示application Launch分析对象；
    /** Attach to Process: 进程名 */
    @Input() modeProcess: string;
    // targetClicked=1 && modeClicked=1  表示attatch to Process分析对象；
    @Input() modePidValid: boolean;
    @Input() modeAppRunUserValid: boolean;
    @Input() modeAppPathAllow: string;

    analysisScene = PROJECT_TYPE;
    scenesStash: PROJECT_TYPE;
    public i18n: any;
    public runUserDataObj: LaunchRunUser = {};
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public selectTarget = '';
    public isEdit: boolean;
    public isTemplateAssign = false;
    public startCheckC: any = {};
    public processItems: any = {};
    public processForm: FormGroup;
    public processTypeOptions: Array<any> = [
        { id: 'cpu', text: 'CPU' },
        { id: 'mem', text: 'Memory' },
        { id: 'disk', text: 'Disk IO' },
        { id: 'context', text: 'context' },
    ];
    public processCheckedTypes: Array<any> = [];
    public processRadioList: any = [];
    public startCheckProcess: any = {};
    public formDatas: any;
    public keepData: any; // 保存模板
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };
    // 修改预约任务 接收从预约传来的值
    public editScheduleTask = false; // 判断是否是修改
    public scheduleTaskId: any; // 保存修改的预约任务ID
    public appAndPidValid = true;
    public showNodeConfig: boolean;
    /** 分析模式 */
    public analysisMode: AnalysisModeEnum;
    /** pid 配置节点参数的节点数据 */
    public pidConfigNodeData: { [key: string]: any } = {};
    /** app 配置节点参数的节点数据 */
    public appConfigNodeData: { [key: string]: any } = {};

    public intervalBlur: SpinnerBlurInfo;
    public samplingDurationBlur: SpinnerBlurInfo;
    public startCheckSys: any = {};   // 立即启动
    // 工程下节点信息
    nodeList: any[] = [];
    isSelectNodeDisabled: boolean;
    nodeConfig: any[] = [];
    // launch模式下用户名、密码、应用路径校验
    public superParamsValid = true;
    isLoading = true;

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
        } catch (err){
            this.isLoading = false;
        }

        this.processForm.controls.pidInput.disable();
        this.processForm.controls.interval.setValue('1');
        this.processForm.controls.duration.setValue('60');
        if (this.analysisMode === AnalysisModeEnum.PROFILE_SYSTEM) {
            this.showNodeConfig = false;
        } else {
            this.showNodeConfig = true;
        }
        this.processCheckedTypes = [...this.processTypeOptions];

        this.setSpinnerBlur();
    }

    /**
     * 生命周期
     * @param changes 改变
     */
    ngOnChanges(changes: SimpleChanges) {
        for (const propName of Object.keys(changes)) {
            switch (propName) {
                case 'switchState':
                    if (changes.switchState.currentValue) {
                        this.runUserData.runUser = true;
                        this.startCheckProcess.checked = true;
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
                this.appAndPidValid = true;
                this.analysisMode = AnalysisModeEnum.PROFILE_SYSTEM;
                break;
            case 1:
                this.appAndPidValid = this.appDir ? true : false;
                this.analysisMode = AnalysisModeEnum.LAUNCH_APPLICATION;
                this.superParamsValid = this.modeAppRunUserValid && this.modeAppValid;
                break;
            case 2:
                this.appAndPidValid = this.modePidValid;
                this.analysisMode = AnalysisModeEnum.ATTACH_TO_PROCESS;
                break;
            default:
                this.appAndPidValid = true;
                break;
        }
        this.showNodeConfig = this.analysisMode !== AnalysisModeEnum.PROFILE_SYSTEM;
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
            this.processForm.get('nodeList').setValue(
                nodeList.length > 10 ? nodeList.slice(0, 10) : nodeList
            );
        }
        if (this.isRestart) {
            setTimeout(() => {
                this.preSwitchProcess.switchState = false;
            }, 0);
        }
    }

    selectNodeDisable(event: boolean){
        this.isSelectNodeDisabled = event;
    }

    /**
     * pid 改变
     */
    public pidSwitchChange() {
        if (this.processForm.controls.pidSwitch.value === 'notAll') {
            this.processForm.controls.pidInput.setValue('');
            this.processForm.controls.pidInput.enable();
            this.processForm.controls.trace.enable();
            if (!this.isTemplateAssign) {
                this.nodeConfigC.getProjectNodes('get');
            }
        } else {
            this.processForm.controls.pidInput.disable();
            this.processForm.controls.trace.disable();
        }
    }

    /**
     * 点击开启参数配置
     */
    public onControlNode(taskName: any) {
        if (taskName) {
            // 开启
            this.getFormDatas(taskName);
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
            case 'p_attach':
                this.sendAppOrPidDisable.emit(true);
                this.handlePidTidDisable.emit(true);
                break;
            case 'p_launch':
                this.sendAppOrPidDisable.emit(true);
                break;
            case 'p_profile':
                this.sendAppOrPidDisable.emit(true);
                break;
            default:
                this.handlePidTidDisable.emit(false);
                this.sendAppOrPidDisable.emit(false);
                break;
        }
    }
    // 获取target
    private getTargetParams() {
        if (this.targetClicked === 0 && this.modeClicked === 0) {
            this.selectTarget = 'Profile System';
        } else if (this.targetClicked === 1 && this.modeClicked === 0) {
            this.selectTarget = 'Launch Application';
        } else if (this.targetClicked === 1 && this.modeClicked === 1) {
            this.selectTarget = 'Attach to Process';
        } else {
            this.selectTarget = 'Profile System';
        }
    }

    /**
     * 获取表单数据
     */
    public getFormDatas(str: string) {
        const errors = TiValidators.check(this.processForm);
        const taskParam = this.processCheckedTypes.map((item) => {
            return item.id;
        });
        const ctrls = this.processForm.controls;
        const params: any = {
            'analysis-type': 'process-thread-analysis',
            projectname: this.projectName,
            taskname: this.taskName,
            interval: ctrls.interval.value,
            duration: ctrls.duration.value,
            task_param: {
                type: taskParam,
            },
        };
        this.getTargetParams();
        params['analysis-target'] = this.selectTarget;
        if (this.selectTarget === 'Attach to Process') {
            params.pid = this.modePid;
            params.process_name = this.modeProcess;
        } else if (this.selectTarget === 'Launch Application') {
            params.appDir = this.appDir;
            params['app-dir'] = this.appDir;
            params['app-parameters'] = this.appParameters;
        }
        params.process = 'enable'; // 一直未enable
        ctrls.trace.value === true
            ? (params['strace-analysis'] = 'enable')
            : (params['strace-analysis'] = 'disable'); // strace-analysis
        ctrls.collection.value === true
            ? (params.thread = 'enable')
            : (params.thread = 'disable');
        if (params.interval > Math.floor(params.duration / 2)) {
            params.interval = Math.floor(params.duration / 2);
        }
        if (this.preSwitchProcess.switchState) {
            // 预约
            if (this.preSwitchProcess.selected === 1) {
                const durationArr = this.preSwitchProcess.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchProcess.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchProcess.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        this.formDatas = params;
    }

    /**
     * 微调器鼠标移出数据校验
     * @param e event
     * @param type 类型
     */
    selectBlur(e: any, type: any) {
        setTimeout(() => {
            const value = e.target.value;
            const maxVal = this.processItems[type].spinner.max;
            const minVal = this.processItems[type].spinner.min;
            if (value < minVal) {
                this.processForm.controls[type].setValue(minVal);
            } else if (value > maxVal) {
                this.processForm.controls[type].setValue(maxVal);
            }
        }, 100);
    }

    /**
     * 创建任务
     * @param isEdit 是否编辑
     */
    async createProcess(isEdit: any): Promise<any> {
        const errors = TiValidators.check(this.processForm);
        const taskParam = this.processCheckedTypes.map((item) => {
            return item.id;
        });
        const ctrls = this.processForm.controls;
        const params: any = {
            'analysis-type': 'process-thread-analysis',
            projectname: this.projectName,
            taskname: this.taskName,
            interval: ctrls.interval.value,
            duration: ctrls.duration.value,
            task_param: {
                type: taskParam,
            },
        };

        this.getTargetParams();
        params['analysis-target'] = this.selectTarget;

        params.process = 'enable'; // 一直未enable
        ctrls.trace.value === true
            ? (params['strace-analysis'] = 'enable')
            : (params['strace-analysis'] = 'disable'); // strace-analysis

        ctrls.collection.value === true
            ? (params.thread = 'enable')
            : (params.thread = 'disable');
        if (params.interval > Math.floor(params.duration / 2)) {
            params.interval = Math.floor(params.duration / 2);
        }
        if (this.selectTarget === 'Attach to Process') {
            params.pid = this.modePid;
            params.process_name = this.modeProcess;
        } else if (this.selectTarget === 'Launch Application') {
            params['app-dir'] = this.appDir;
            params['app-parameters'] = this.appParameters;
        }

        // 是否进行节点配置
        if (this.nodeConfigC && this.nodeConfigC.switchStatus) {
            params.switch = true;
            this.formDatas.switch = true;
            const nodeData: any = this.nodeConfigC.getNodesConfigParams({}).nodeConfig;
            this.runUserDataObj = this.nodeConfigC.getNodesConfigParams({}).runUserData;
            if (this.analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    return item;
                });
            }
            if (this.analysisMode === AnalysisModeEnum.PROFILE_SYSTEM) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.duration = params.duration;
                    return item;
                });
            }
            if (this.analysisMode === AnalysisModeEnum.ATTACH_TO_PROCESS) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.duration = params.duration;
                    return item;
                });
            }
        } else {
            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas(params['analysis-type']);
        }

        if (this.isRestart) {
            // 重启任务
            this.restartFunction(params);
            return false;
        }
        let urlAnalysis = '';
        let errorText = '';
        let method = '';
        //  预约任务 preSwitch 预约组件名
        if (this.preSwitchProcess.switchState) {
            this.startCheckProcess.checked = false;
            const flag = await this.createPreMission(
                this.preSwitchProcess,
                params,
                'post'
            );
            if (flag) {
                this.startCheckProcess.checked = true;
            }
        } else {
            if (isEdit) {
                urlAnalysis = '/tasks/' + this.restartAndEditId + '/';
                errorText = 'task_edit_error';
                method = 'put';
                const message = {
                    cmd: 'getData',
                    data: {
                        url: urlAnalysis,
                        method,
                        params
                    }
                };
                this.vscodeService.postMessage(message, (res: any) => {
                    const data = res.data;
                    // 修改任务提示
                    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        if (res.code === 'SysPerf.Success') {
                            this.vscodeService.showTuningInfo(res.message, 'info', 'modifyTask');
                            if (this.startCheckProcess.checked) {
                                this.startDataSamplingTask(
                                    this.projectName,
                                    this.taskName,
                                    data.id,
                                    params
                                );
                            } else {
                                this.vscodeService.showTuningInfo('cancel', 'info', 'modifyTask');
                                this.vscodeService.postMessage({
                                    cmd: 'openSomeNode',
                                    data: {
                                        taskId: data.id,
                                        projectName: this.projectName,
                                    }
                                }, null);
                            }
                        } else {
                            this.vscodeService.showTuningInfo(res.message, 'error', 'modifyTask');
                        }
                    } else {
                        if (res.status) {
                            this.vscodeService.showInfoBox(res.message, 'error');
                        } else {
                            setTimeout(() => {
                                this.vscodeService.showInfoBox(
                                    this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                        0: this.taskName
                                    }), 'info');
                            }, 3500);
                            if (this.startCheckProcess.checked) {
                                this.startDataSamplingTask(
                                    this.projectName,
                                    this.taskName,
                                    data.id,
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
                const context = this;
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    const createMissionInstance = this.tiMessage.open({
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
                                urlAnalysis = '/tasks/';
                                errorText = 'task_create_error';
                                method = 'post';
                                const message = {
                                    cmd: 'getData',
                                    data: {
                                        url: urlAnalysis,
                                        method,
                                        params
                                    }
                                };
                                context.vscodeService.postMessage(message, (res: any) => {
                                    const data = res.data;
                                    if (res.code === 'SysPerf.Success') {
                                        this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                        let timer = 0;

                                        if (context.startCheckProcess.checked) {
                                            timer = 3500;
                                            context.startDataSamplingTask(
                                                context.projectName,
                                                context.taskName,
                                                data.id,
                                                params
                                            );
                                        } else {
                                            this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                                            this.vscodeService.postMessage({
                                                cmd: 'openSomeNode',
                                                data: {
                                                    taskId: data.id,
                                                    projectName: context.projectName
                                                }
                                            }, null);
                                        }
                                    } else {
                                        this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                                    }
                                    this.zone.run(() => {
                                        createMissionInstance.close();
                                    });
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
                    this.tiModal.open(this.createProcessConfirmModal, {
                        // 定义id防止同一页面出现多个相同弹框
                        id: 'createProcess',
                        modalClass: 'createProcessConfirmModal',
                        close() {
                            urlAnalysis = '/tasks/';
                            errorText = 'task_create_error';
                            method = 'post';
                            const message = {
                                cmd: 'getData',
                                data: {
                                    url: urlAnalysis,
                                    method,
                                    params
                                }
                            };
                            context.vscodeService.postMessage(message, (res: any) => {
                                const data = res.data;
                                if (res.status) {
                                    context.vscodeService.showInfoBox(res.message, 'error');
                                } else {
                                    let timer = 0;
                                    if (context.startCheckProcess.checked) {
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
                        }
                    });
                }
            }

        }
    }

    /**
     * 获取节点配置
     */
    async getNodeConfigDatas(params: any) {
        this.getFormDatas(params);
        // 当开关组件没有打开时
        const url = `/projects/${this.projectId}/info/`;
        return new Promise((resolve, reject) => {
            const data: any = [];
            const nodeList = PROJECT_TYPE.TYPE_HPC === this.scenes
                ? this.processForm.get('nodeList').value
                : this.nodeList;
            nodeList.forEach((item: any) => {
                // 设置配置的节点参数
                let taskParamTmp;
                switch (this.analysisMode) {
                    case AnalysisModeEnum.LAUNCH_APPLICATION:
                        taskParamTmp = this.appConfigNodeData[item.nodeIp];
                        break;
                    case AnalysisModeEnum.ATTACH_TO_PROCESS:
                        taskParamTmp = this.pidConfigNodeData[item.nodeIp];
                        break;
                    default:
                        break;
                }
                this.runUserDataObj[item.nodeIp] = {
                    runUser: this.runUserData.runUser,
                    user_name: this.runUserData.user || '',
                    password: this.runUserData.password
                };
                data.push({
                    nodeId: item.id,
                    nickName: item.nickName,
                    task_param: Object.assign({}, { status: false }, this.formDatas, taskParamTmp || {}),
                });
            });
            resolve(data);
        });
    }

    /**
     * 创建/修改 预约任务函数
     */
    public createPreMission(context: any, params: any, method: string) {
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
                const message = {
                    cmd: 'getData',
                    data: {
                        url: urlAnalysis,
                        method,
                        params
                    }
                };
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
                        this.sendPretable.emit();
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
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            // 关闭当前页面
            this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
        }
    }

    /**
     * 导入模板
     */
    public getTemplateData(e: any): void {
        this.isTemplateAssign = true;
        this.processForm.controls.interval.setValue(e.interval);
        this.processForm.controls.duration.setValue(e.duration);
        this.nodeConfig = e.nodeConfig;
        this.setNodeListParam(e.nodeConfig, this.nodeList);
        this.processCheckedTypes.length = 0;
        e.task_param.type.forEach((item: any) => {
            const a = this.processTypeOptions.filter((option) => {
                return option.id === item;
            });
            this.processCheckedTypes.push(a[0]);
        });
        if (e.thread === 'enable') {
            this.processForm.controls.collection.setValue(true);
        } else {
            this.processForm.controls.collection.setValue(false);
        }

        // 预约任务数据导入
        this.preSwitchProcess.importTemp(e);
        // 配置节点参数
        switch (this.analysisMode) {
            case AnalysisModeEnum.ATTACH_TO_PROCESS:
            case AnalysisModeEnum.LAUNCH_APPLICATION:
                this.processForm.controls.trace.setValue(e['strace-analysis'] === 'enable');
                if (e.switch) {
                    this.sendAppOrPidDisable.emit(true);
                    setTimeout(() => { this.nodeConfigC.importTemp(e.nodeConfig); });
                } else {
                    this.nodeConfigC.clear();
                }
                break;
        }
        if (this.isEdit || this.isRestart) {
            this.preSwitchProcess.isEdit = this.isEdit || this.isRestart;
        }
        this.isTemplateAssign = false;
    }

    /**
     * 保存模板
     */
    async saveTemplates() {
        const errors = TiValidators.check(this.processForm);
        const taskParam = this.processCheckedTypes.map((item) => {
            return item.id;
        });
        const self = this;
        const ctrls = self.processForm.controls;
        const params: any = {
            'analysis-type': 'process-thread-analysis',
            projectname: self.projectName,
            taskname: self.taskName,
            interval: ctrls.interval.value,
            duration: ctrls.duration.value,
            task_param: {
                type: taskParam,
            },
        };
        this.getTargetParams();
        params['analysis-target'] = this.selectTarget;
        if (this.selectTarget === 'Attach to Process') {
            params.pid = this.modePid;
            params.process_name = this.modeProcess;
        } else if (this.selectTarget === 'Launch Application') {
            params['app-dir'] = this.appDir;
            params['app-parameters'] = this.appParameters;
        }
        params.process = 'enable'; // 一直未enable
        ctrls.trace.value === true
            ? (params['strace-analysis'] = 'enable')
            : (params['strace-analysis'] = 'disable'); // strace-analysis
        ctrls.collection.value === true
            ? (params.thread = 'enable')
            : (params.thread = 'disable');
        if (params.interval > Math.floor(params.duration / 2)) {
            params.interval = Math.floor(params.duration / 2);
        }
        // 节点数据列表
        if (this.nodeConfigC && this.nodeConfigC.switchStatus) {
            params.switch = true;
            this.formDatas.switch = true;
            const nodeData: any = this.nodeConfigC.getNodesConfigParams({}).nodeConfig;
            if (this.analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    return item;
                });
            }
            if (this.analysisMode === AnalysisModeEnum.PROFILE_SYSTEM) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.duration = params.duration;
                    return item;
                });
            }
            if (this.analysisMode === AnalysisModeEnum.ATTACH_TO_PROCESS) {
                params.nodeConfig = nodeData.map((item: any) => {
                    item.task_param.taskname = params.taskname;
                    item.task_param.interval = params.interval;
                    item.task_param.duration = params.duration;
                    return item;
                });
            }
        } else {
            params.switch = false;
            params.nodeConfig = await this.getNodeConfigDatas(params['analysis-type']);
        }
        if (this.preSwitchProcess.switchState) {
            // 预约
            if (this.preSwitchProcess.selected === 1) {
                const durationArr = this.preSwitchProcess.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchProcess.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchProcess.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        this.keepData = params;
        this.sendMissionKeep.emit(this.keepData);
    }

    /**
     * 清空任务参数
     */
    public clear() {
        this.nodeConfigC.clear();
        this.processForm.controls.pidSwitch.setValue('all');
    }


    /**
     * 立即启动
     */
    public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
        const option: any = { status: 'running' };
        if (this.analysisMode === 'Launch Application') {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        this.vscodeService
            .get({
                url: '/res-status/?type=disk_space&project-name=' +
                    encodeURIComponent(projectname) +
                    '&task-name=' +
                    encodeURIComponent(taskname)
            }, (data: any) => {
                const self = this;

                this.vscodeService
                    .put({ url: '/tasks/' + id + '/status/', params: option }, (res: any) => {
                        const backData = res.data;
                        self.closeTab.emit({
                            title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
                            id: backData.id,
                            nodeid: params.nodeConfig[0].nodeId,
                            taskId: backData.id,
                            taskTarget: data['analysis-target'],
                            taskType: params['analysis-type'],
                            status: backData['task-status'],
                            projectName: self.projectName
                        });
                    });
            });
    }

    /**
     * 重启分析任务
     */
    public restartFunction(params: any) {
        const self = this;
        params.status = 'restarted';
        if (self.analysisMode === 'Launch Application') {
            params.user_message = self.dealRunUserDataObj(self.runUserDataObj);
        }
        self.vscodeService
            .put({ url: '/tasks/' + this.restartAndEditId + '/status/', params }, (res: any) => {
                const data = res.data;
                if (res.status !== HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                    this.closeTab.emit({
                        title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
                        id: data.id,
                        nodeid: params.nodeConfig[0].nodeId,
                        taskId: data.id,
                        taskTarget: params['analysis-target'],
                        taskType: params['analysis-type'],
                        status: data['task-status'],
                        projectName: this.projectName
                    });
                } else if (res.status === HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                    this.vscodeService.showInfoBox(res.message, 'error');
                } else {
                    setTimeout(() => {
                        self.vscodeService.postMessage({
                            cmd: 'updateTree',
                            data: {
                                type: 'info',
                                info: this.I18n.I18nReplace(this.i18n.plugins_term_task_reanalyze_success, {
                                    0: this.taskName
                                })
                            }
                        }, null);
                    }, 3500);
                }
                this.isRestart = false;
            });
    }

    /**
     * 计算 info-icon 的 left 值
     */
    get tipInfoLeftPosition() {
        return -parseInt(this.labelWidth, 10) - 20 + 'px';
    }
    /**
     *   传递节点参数
     */
    public handleNodeEmit(e: any) {
        this.handleNodeEmitIndex.emit(e);
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.intervalBlur = {
            control: this.processForm.controls.interval,
            min: 1,
            max: 10,
        };
        this.samplingDurationBlur = {
            control: this.processForm.controls.duration,
            min: 2,
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
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
