// 访存统计分析_create
import {
    Component, ViewChild, Output, Input, EventEmitter, SimpleChanges, OnChanges,
    ViewChildren, NgZone, ChangeDetectorRef, OnInit
} from '@angular/core';
import { TiMessageService } from '@cloud/tiny3';
import { I18nService } from '../../service/i18n.service';
import { MytipService } from '../../service/mytip.service';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';

import { MemAnalysisModeForm } from '../taskParams/modules/MemAnalysisModeForm';
import { MemAccessForm } from '../taskParams/modules/MemAccessForm';
import { MissEventForm } from '../taskParams/modules/MissEventForm';
import { FalseSharingForm } from '../taskParams/modules/FalseSharingForm';
import { RunUserDataObj, LaunchRunUser } from './../mission-domain/index';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import { CustomValidatorsService } from '../../service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PROJECT_TYPE } from '../../service/axios.service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';

@Component({
    selector: 'app-mission-mem',
    templateUrl: './mission-mem.component.html',
    styleUrls: ['./mission-mem.component.scss']
})

export class MissionMemComponent implements OnChanges, OnInit {
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
    @Input() targetClicked: boolean;
    @Input() modeClicked: boolean;
    @Input() modeApplication: string;
    @Input() modeAppParams: string;
    /** Launch Application: 应用运行用户 开关 */
    @Input() switchState: boolean;
    /** Launch Application: 应用运行用户 用户名 */
    @Input() modeApplicationUser: string;
    /** Launch Application: 应用运行用户 密码 */
    @Input() modeApplicationPassWord: string;
    @Input() modePid: string;
    @Input() modeAppValid: boolean;
    @Input() modePidValid: boolean;
    @Input() nodeConfigShow: boolean;
    @Input() nodeConfigedData: any;
    @Input() projectId: number;
    @Input() restartAndEditId: number;
    @Input() typeId: number;
    @Input() isModifySchedule: boolean;
    @Input() appendTarget: string;
    @Input() drawerLevel: number;
    @Input() panelId: any;
    @Input() widthIsLimited = false;  // 表单父容器的宽度是否受限，例如在 home 界面提示信息在输入框的后面显示，在修改预约任务的drawer里面提示信息需要在输入框的下面显示
    /** Attach to Process: 进程名 */
    @Input() modeProcess: string;
    @Input() modeAppRunUserValid: boolean;
    @Input() taskDetail: any = {
      isFromTuningHelper: false,
    };

    @Output() public sendMissionKeep = new EventEmitter<any>();
    @Output() public sendPretable = new EventEmitter<any>();
    @Output() public closeTab = new EventEmitter<any>();
    @Output() public sendAppOrPidDisable = new EventEmitter<any>();
    @Output() public handlePidTidDisable = new EventEmitter<any>();
    @Output() public handleNodeEmitIndex = new EventEmitter<any>();
    @Output() public memAnalysisModeChange = new EventEmitter<any>();
    @ViewChildren('taskTmpl') taskTmpls: any;
    @ViewChild('scheduledStartup', { static: false }) scheduledStartup: any;

    analysisScene = PROJECT_TYPE;
    scenesStash: PROJECT_TYPE;
    public i18n: any;
    public type = 'create';
    public scheduleTaskId: any; // 保存修改的预约任务ID

    // 预约定时启动参数
    public scheduledPrams = {
        startNow: true,
    };

    public formEl: any; // 公共参数 + 访存分析类型 的表单参数
    public childFormEl: any; // 子表单 的表单参数
    public memAccessFormEl: any;  // 访存统计分析的表单参数
    public missEventFormEl: any;  // Miss事件统计的表单参数
    public falsesharingFormEl: any; // 伪共享分析的表单参数
    public nodeSelectForm: FormGroup;  // hpc工程节点选择表单参数
    public memAnalysisMode: string;
    public formRelated: any = {
        mem_access: 'memAccessFormEl',
        miss_event: 'missEventFormEl',
        falsesharing: 'falsesharingFormEl',
    };
    public appAndPidValid = true;

    public memAnalysisModeInfo: any;
    public runUserDataObj: LaunchRunUser = {};
    public runUserData = {
        runUser: false,
        user: '',
        password: ''
    };
    public memAnalysisModeType = 'mem_access';
    public isShowReserveAndImmedia = false;
    public startCheckSys: any = {};   // 立即启动

    /** 工程下的所以节点 */
    public allNodeList: Array<any> = [];
    /** 工程类型 */
    public isHpcPro = false;
    /** hpc工程节点选择器是否禁用 */
    public isSelectNodeDisabled = false;
    isLoading = true;

    constructor(
        public I18n: I18nService,
        public mytip: MytipService,
        private tiMessage: MessageModalService,
        private tMessage: TiMessageService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        public vscodeService: VscodeService,
        public customValidatorsService: CustomValidatorsService,
        public fb: FormBuilder,
        private projectNodeListService: ProjectNodeListService
    ) {
        this.i18n = I18n.I18n();

        this.formEl = new MemAnalysisModeForm();
        this.formEl.generateFormGroup();
        this.formEl.customForm({ formEl: this.formEl });

        // 访存统计分析的表单参数
        this.memAccessFormEl = new MemAccessForm();
        this.memAccessFormEl.generateFormGroup();
        this.memAccessFormEl.initDefaultValue({ list: this.memAccessFormEl.displayedElementList });

        // Miss事件统计的表单参数
        this.missEventFormEl = new MissEventForm(this.customValidatorsService);
        this.missEventFormEl.generateFormGroup();
        this.missEventFormEl.initDefaultValue({ list: this.missEventFormEl.displayedElementList });

        // 伪共享分析的表单参数
        this.falsesharingFormEl = new FalseSharingForm(this.i18n, this.customValidatorsService);
        this.falsesharingFormEl.generateFormGroup();
        this.falsesharingFormEl.initDefaultValue({ list: this.falsesharingFormEl.displayedElementList });

        // 监听 memAnalysisMode 的变化
        this.formEl.formGroup.get('memAnalysisMode').valueChanges.subscribe((val: any) => {
            this.memAnalysisMode = val;
            this.childFormEl = this[this.formRelated[val]];

            // 通知子组件组件状态改变
            if (val && this.taskTmpls) {
                const taskTmpl = this.taskTmpls.find((item: any) => item.analysisType === val);

                if (taskTmpl) {
                    taskTmpl.componentStatusChange('activated');
                }
            }
        });

        // 监听 analysisObject 的变化，Miss事件在系统模式需要添加待采样CPU核
        this.formEl.formGroup.get('analysisObject').valueChanges.subscribe((val: any) => {
            this.missEventFormEl.setAnalysisObject(val);
            const modelListArr: string[] = [];
            this.memAnalysisModeInfo.list.map((item: any) => {
                modelListArr.push(item.value);
                item.checked = item.value === this.memAnalysisModeType;
            });
            if (!modelListArr.includes(this.memAnalysisModeType)) {
                this.memAnalysisModeInfo.list[0].checked = true;
            }
        });
        this.memAnalysisModeInfo = this.formEl.form.memAnalysisMode;
        this.nodeSelectForm = fb.group({
            nodeList: new FormControl([]),
        });
    }

    /**
     * 节点选择控件是否需要校验
     */
    private onDisabledFormNodeList() {
        if (this.isHpcPro) {
        this.nodeSelectForm.controls.nodeList.enable();
        } else {
        this.nodeSelectForm.controls.nodeList.disable();
        }
    }

    /**
     * 切换多节点配置组件开关
     * @param status 多节点组件开发状态
     */
    public nodeConfigSwitchChange(status: any) {
        this.isSelectNodeDisabled = status;
        this.sendAppOrPidDisable.emit(status);
    }

    /**
     * 选择访存类型
     * @param e e
     */
    public ngModelChange(i: number) {
        this.memAnalysisMode = this.memAnalysisModeInfo.list[i].value;
        this.memAnalysisModeChange.emit(this.memAnalysisMode);
        this.memAnalysisModeType = this.memAnalysisMode;
        this.formEl.formGroup.controls.memAnalysisMode.setValue(this.memAnalysisMode);
        // 更新formE1
        this.formEl.customForm({ formEl: this.formEl });
        this.updateWebViewPage();
    }

    async ngOnInit() {
        try{
            const resp = await this.projectNodeListService.getProjectNodes(this.projectId);
            this.isLoading = false;
            if (resp?.data?.nodeList) {
                // 存储工程下的节点信息
                this.allNodeList = resp.data.nodeList;
                if (this.type === 'create') {
                    this.nodeSelectForm.get('nodeList').setValue(
                        this.allNodeList.length > 10 ? this.allNodeList.slice(0, 10) : this.allNodeList
                    );
                }
            }
        } catch (err) {
            this.isLoading = false;
        }
    }

    /**
     * 同步父组件的值【目前是一个完整的表单流程，包含全部的参数，需要同步下父组件的值模拟用户输入】
     * @param changes 父组件传递下来的值
     */
    ngOnChanges(changes: SimpleChanges): void {
        // 任务名称
        if (changes.taskName !== undefined) {
            this.formEl.formGroup.controls.taskName.setValue(changes.taskName.currentValue);
        }

        // 分析对象
        if (changes.targetClicked !== undefined) {
            const value = changes.targetClicked.currentValue === 0 ? 'analysisObject_sys' : 'analysisObject_app';
            this.formEl.formGroup.controls.analysisObject.setValue(value);
        }

        // 模式
        if (changes.modeClicked !== undefined) {
            const value = changes.modeClicked.currentValue === 0 ? 'app' : 'pid';
            this.formEl.formGroup.controls.analysisMode.setValue(value);
        }

        // 应用
        if (changes.modeApplication !== undefined) {
            this.formEl.formGroup.controls.application.setValue(changes.modeApplication.currentValue);
        }

        // 应用参数
        if (changes.hasOwnProperty('modeAppParams')) {
            this.formEl.formGroup.controls.applicationParams.setValue(changes.modeAppParams.currentValue || '');
        }

        if (Object.prototype.hasOwnProperty.call(changes, 'switchState')) {
            this.isShowReserveAndImmedia = changes.switchState.currentValue;
            if (changes.switchState.currentValue) {
                this.scheduledPrams.startNow = true;
            } else {
                this.runUserData = {
                    runUser: false,
                    user: '',
                    password: ''
                };
            }
            this.formEl.formGroup.controls.switchState.setValue(changes.switchState.currentValue);
            this.runUserData.runUser = changes.switchState.currentValue;
        }

        if (Object.prototype.hasOwnProperty.call(changes, 'modeApplicationUser')) {
            if (this.formEl.formGroup.value.switchState) {
                this.formEl.formGroup.controls.user_name.setValue(changes.modeApplicationUser.currentValue || '');
                this.runUserData.user = changes.modeApplicationUser.currentValue || '';
            } else {
                this.formEl.formGroup.controls.user_name.setValue('');
                this.runUserData.user = '';
            }
        }
        if (Object.prototype.hasOwnProperty.call(changes, 'modeApplicationPassWord')) {
            this.formEl.formGroup.controls.password.setValue(changes.modeApplicationPassWord.currentValue || '');
            this.runUserData.password = changes.modeApplicationPassWord.currentValue || '';
        }

        // PID
        if (changes.modePid !== undefined) {
            this.formEl.formGroup.controls.pid.setValue(changes.modePid.currentValue);
        }
        // 进程名
        if (changes.modeProcess !== undefined) {
            this.formEl.formGroup.controls.process_name.setValue(changes.modeProcess.currentValue);
        }
        switch (changes.typeId ? changes.typeId.currentValue : this.typeId) {
            case 0:
                this.appAndPidValid = true;
                break;
            case 1:
                this.appAndPidValid = this.modeAppValid;
                break;
            case 2:
                this.appAndPidValid = this.modePidValid;
                break;
            default:
                this.appAndPidValid = true;
                break;
        }
        if (changes.taskDetail) {
          // 来自调优助手
          if (this.taskDetail && this.taskDetail.isFromTuningHelper) {
            this.memAnalysisMode = this.taskDetail.analysisType;
          }
        }
    }

    // 根据 taskInfo 返回分析类型
    /**
     * 返回分析类型
     * @param param0 任务信息
     */
    public getAnalysisType({ taskInfo }: any) {
        return taskInfo['analysis-type'] || taskInfo.analysisType;
    }

    /**
     * 初始化参数
     */
    public init({ type, params = {}, scheduleTaskId }: {
        type: 'create' | 'edit' | 'restart',  // 任务类型
        params?: any,  // 表单参数
        scheduleTaskId: any // 修改的预约任务ID
    }) {
        this.type = type;
        this.scheduleTaskId = scheduleTaskId;

        if (params) {
            this.formEl.form.memAnalysisMode.lastValue = params['analysis-type'];
            this.formEl.form.memAnalysisMode.list.map((item: any) => {
                if (item.value === params['analysis-type']) {
                    item.checked = true;
                } else {
                    item.checked = false;
                }
            });
            this.formEl.form.memAnalysisMode = { ...this.formEl.form.memAnalysisMode };
            setTimeout(() => {  // 设置个定时器异步下，防止默认值还没设置完开始设置修改参数了
                const analysisType = this.getAnalysisType({ taskInfo: params });
                const taskTmpl = this.taskTmpls.find((item: any) => analysisType === item.analysisType);
                const values = taskTmpl.formEl.paramsToValues({ params });

                this.formEl.setValues({
                    values,
                    formEl: this.formEl,
                    type: 'form',
                    i18n: this.i18n,
                });

                taskTmpl.init({ params, values });
                this.nodeSelectForm.controls.nodeList.setValue(params.nodeConfig);

                // 如果是预约任务
                this.scheduledStartup.importTemp(params);

                // 修改任务和重启任务不能修改预约定时启动任务【先 importTemp 导入参数再设置isEdit，否则 importTemp 会清空 isEdit】
                if (['edit', 'restart'].includes(type)) {
                    this.scheduledStartup.isEdit = true;
                }
            }, 10);
        }
        this.updateWebViewPage();
    }

    /**
     * 清空任务参数
     */
    public clear() {
        this.taskTmpls.forEach((taskTmpl: any) => {
            taskTmpl.clear();
        });

        this.restoreScheduleParams();
    }

    /**
     * 还原预约任务参数
     */
    public restoreScheduleParams() {
        this.scheduledStartup.clear();
    }

    /**
     * 点击确定
     */
    public clickConfirmBtn() {
        const context = this;
        this.getTaskData().then((resp: any) => {
            const params = resp.params;
            this.runUserDataObj = resp.runUserDataObj;
            if (this.type === 'create') {
                if (this.scheduledStartup.switchState) {  // 预约任务
                    this.vscodeService.post({ url: '/schedule-tasks/', params }, (res: any) => {
                        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner'){
                                    if (res.code === 'SysPerf.Success') {
                                        this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                        this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                                    }else{
                                        this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                                    }
                         }else {
                        if (res.status) {
                            this.vscodeService.showInfoBox(res.message, 'error');
                        } else {
                            this.vscodeService.showInfoBox(
                                this.I18n.I18nReplace(this.i18n.plugins_term_scheduleTask_create_success, {
                                0: this.taskName
                            }), 'info');

                            this.sendPretable.emit('on');
                            this.closeTab.emit({});
                            setTimeout(() => {
                                this.clear();
                            }, 1000);
                        }
                    }
                    });
                } else {
                  if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        const createMemInstance = this.tMessage.open({
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
                                    context.vscodeService.post({ url: '/tasks/', params }, (res: any) => {
                                        if (res.code === 'SysPerf.Success') {
                                            this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                            const data = res.data;
                                            let timer = 0;
                                            // 关闭页签
                                            if (context.scheduledPrams.startNow) { // 立即执行
                                                timer = 3500;
                                                context.startDataSamplingTask(
                                                    context.projectName, params.taskname, data.id, params);
                                            } else {
                                                const message = {
                                                    cmd: 'openSomeNode',
                                                    data: {
                                                        taskId: data.id,
                                                        projectName:  context.projectName,
                                                    }
                                                };
                                                this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                                                this.vscodeService.postMessage(message, null);

                                            }

                                        } else {
                                            this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                                        }
                                        this.zone.run(() => {
                                            createMemInstance.close();
                                        });
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
                        this.tiMessage.open({
                            type: 'warn',
                            title: this.i18n.secret_title,
                            content: this.i18n.secret_count,
                            close() {
                                // 调优助手跳转创建任务
                                if (self.taskDetail && self.taskDetail.isFromTuningHelper) {
                                  Object.assign(
                                    params,
                                    {
                                      suggestionId: self.taskDetail.suggestionId,  // 优化建议id
                                      optimizationId: self.taskDetail.optimizationId,  // 调优助手任务id
                                    }
                                  );
                                }
                                context.vscodeService.post({ url: '/tasks/', params }, (res: any) => {
                                    if (res.status) {
                                        context.vscodeService.showInfoBox(res.message, 'error');
                                    } else {
                                        const data = res.data;
                                        let timer = 0;

                                        // 关闭页签
                                        if (context.scheduledPrams.startNow) { // 立即执行
                                            timer = 3500;
                                            context.startDataSamplingTask(
                                                context.projectName, params.taskname, data.id, params);
                                        } else {
                                            const name = data.taskname || data.taskName;
                                            context.closeTab.emit({
                                                title: `${name}-${params.nodeConfig[0].nickName}`,
                                                id: data.id,
                                                startCheckCNo: true,
                                                missNoImmediately: true,
                                                nodeid: params.nodeConfig[0].nodeId,
                                                taskId: data.id,
                                                taskType: data['analysis-type'] || data.analysisType,
                                                status: data['task-status'],
                                                projectName: context.projectName,
                                                panelId: this.panelId
                                            });
                                        }

                                        setTimeout(() => {
                                            context.vscodeService.showInfoBox(context.I18n.I18nReplace(
                                                context.i18n.plugins_term_task_create_success,
                                                { 0: context.taskName }), 'info');
                                        }, timer);

                                        setTimeout(() => {
                                            context.clear();
                                        }, 1000);
                                    }
                                });
                            },
                        });
                    }
                }
            } else if (this.type === 'edit' || this.type === 'scheduleEdit') {
                // 预约任务
                if (this.scheduledStartup.switchState) {
                    this.vscodeService.put({ url: `/schedule-tasks/${this.scheduleTaskId}/`, params }, (res: any) => {
                        if (res.status) {
                            this.vscodeService.showInfoBox(res.message, 'error');
                        } else {
                            this.vscodeService.showInfoBox(
                                this.I18n.I18nReplace(this.i18n.plugins_term_scheduleTask_modify_success, {
                                0: this.taskName
                            }), 'info');

                            this.sendPretable.emit('on');
                            this.closeTab.emit({});

                            this.clear();
                            this.type = 'create';
                        }
                    });
                } else {
                    this.vscodeService.put({ url: `/tasks/${this.restartAndEditId}/`, params }, (res: any) => {
                        // 修改任务提示
                        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                            if (res.code === 'SysPerf.Success') {
                                this.vscodeService.showTuningInfo(res.message, 'info', 'modifyTask');
                                const data = res.data;
                                // 关闭页签
                                if (context.scheduledPrams.startNow) {
                                    this.startDataSamplingTask(this.projectName, params.taskname, data.id, params);

                                } else {
                                    this.closeTab.emit({
                                        title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
                                        id: data.id,
                                        nodeid: params.nodeConfig[0].nodeId,
                                        taskId: data.id,
                                        taskType: data['analysis-type'],
                                        status: data['task-status'],
                                        projectName: this.projectName
                                    });
                                }
                                this.clear();
                                this.type = 'create';
                            } else {
                                this.vscodeService.showTuningInfo(res.message, 'error', 'modifyTask');
                            }
                        } else {
                            if (res.status) {
                                this.vscodeService.showInfoBox(res.message, 'error');
                            } else {
                                const data = res.data;
                                let timer = 200;

                                // 关闭页签
                                if (context.scheduledPrams.startNow) { // 立即执行
                                    timer = 3500;
                                    this.startDataSamplingTask(this.projectName, params.taskname, data.id, params);
                                } else {
                                    this.closeTab.emit({
                                        title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
                                        id: data.id,
                                        nodeid: params.nodeConfig[0].nodeId,
                                        taskId: data.id,
                                        taskType: data['analysis-type'],
                                        status: data['task-status'],
                                        projectName: this.projectName
                                    });
                                }

                                setTimeout(() => {
                                    this.vscodeService.showInfoBox(
                                        this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                        0: this.taskName
                                    }), 'info');
                                }, timer);

                                this.clear();
                                this.type = 'create';
                            }
                        }
                    });
                }
            } else if (this.type === 'restart') {
                params.status = 'restarted';
                if (this.formEl.formGroup.value.analysisObject === 'analysisObject_app'
                    && this.formEl.formGroup.value.analysisMode === 'app') {
                    params.user_message = this.dealRunUserDataObj(this.runUserDataObj);
                }
                // 调优助手跳转创建任务
                if (this.taskDetail && this.taskDetail.isFromTuningHelper) {
                  Object.assign(
                    params,
                    {
                      suggestionId: this.taskDetail.suggestionId,  // 优化建议id
                      optimizationId: this.taskDetail.optimizationId,  // 调优助手任务id
                    }
                  );
                }
                this.vscodeService.put({ url: `/tasks/${this.restartAndEditId}/status/`, params }, (res: any) => {
                    const data = res.data;

                    this.closeTab.emit({
                        title: `${params.taskname || params.taskName}-${params.nodeConfig[0].nickName}`,
                        id: data.id,
                        nodeid: params.nodeConfig[0].nodeId,
                        taskId: data.id,
                        taskType: params['analysis-type'],
                        status: data['task-status'],
                        projectName: this.projectName
                    });
                    this.vscodeService.showInfoBox(
                        this.I18n.I18nReplace(this.i18n.plugins_term_task_reanalyze_success, {
                        0: this.taskName
                    }), 'info');
                    this.clear();
                    this.type = 'create';
                });
            }
        });
    }

    /**
     * 立即启动
     */
    public startDataSamplingTask(projectname: any, taskname: any, id: any, params: any) {
        const option: any = { status: 'running' };
        if (this.formEl.formGroup.value.analysisObject === 'analysisObject_app'
            && this.formEl.formGroup.value.analysisMode === 'app') {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        this.vscodeService.get({
            url:
                '/res-status/?type=disk_space&project-name=' +
                encodeURIComponent(projectname) +
                '&task-name=' +
                encodeURIComponent(taskname)
        }, () => {
            const self = this;

            this.vscodeService.put({ url: '/tasks/' + id + '/status/', params: option }, (res: any) => {
                const backData = res.data;
                self.closeTab.emit({
                    title: `${params.taskname || params.taskName}-${params.nodeConfig[0].nickName}`,
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
     * 点击取消
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
     * 点击保存模板
     */
    public saveTemplates() {
        this.getTaskData().then((params: any) => {
            this.sendMissionKeep.emit(params.params);
        });
    }

    /**
     * 获取任务参数
     */
    public getTaskData() {
        const taskTmpl = this.taskTmpls.find((item: any) => this.memAnalysisMode === item.analysisType);
        const extendParams = {
            projectname: this.projectName,
            taskname: this.taskName,
        };
        // 如果是预约任务
        if (this.scheduledStartup.switchState) {
            Object.assign(extendParams, this.getScheduledTaskParams());
        }

        return new Promise((resolve, reject) => {
            taskTmpl.getTaskData({ extendParams, runUserData: this.runUserData }).then((params: any) => {
                return resolve(params);
            });
        });
    }

    /**
     * 获取预约任务参数
     */
    public getScheduledTaskParams() {
        const self = this.scheduledStartup;

        if (self.selected === 1) {  //  周期
            const durationArr = self.durationTime.split(' ');

            return {
                cycle: true,
                targetTime: self.pointTime,
                cycleStart: durationArr[0],
                cycleStop: durationArr[1],
                appointment: '',
            };
        } else {  // 单次
            const onceArr = self.onceTime.split(' ');

            return {
                cycle: false,
                targetTime: onceArr[1],
                appointment: onceArr[0],
                cycleStart: '',
                cycleStop: '',
            };
        }
    }
    public sendRunUserDataObj(e: LaunchRunUser) {
        this.runUserDataObj = e;
        let bool = false;
        Object.keys(this.runUserDataObj).map((key: string) => {
            if (this.runUserDataObj[key].runUser) {
                bool = true;
            }
        });
        this.isShowReserveAndImmedia = bool;
        this.updateWebViewPage();
    }

    get displayedElementList() {
        const doNotShowList = ['taskName', 'analysisObject', 'analysisMode', 'application', 'applicationParams',
            'switchStatus', 'user_name', 'password', 'pid', 'process_name', 'analysisType'];

        return this.formEl.displayedElementList.filter((item: any) => {
            return !doNotShowList.includes(item);
        });
    }

    get formValid() {
        const nodeSelectValid  = this.isHpcPro ? this.nodeSelectForm.valid : true;
        return this.formEl.formGroup.valid && this.childFormEl.formGroup.valid && nodeSelectValid;
    }

    get scheduledStartupParamsValid() {
        if (this.scheduledStartup && this.scheduledStartup.switchState) {
            return this.scheduledStartup.previewState;
        } else {
            return true;
        }
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
