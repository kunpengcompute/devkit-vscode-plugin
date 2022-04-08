import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HTTP_STATUS_CODE, VscodeService } from '../../../service/vscode.service';
import { NodeConfigItem, RawDataIO, SuperData, RawDataIOBase, IoFormControls } from '../io-domain';
import { AnalysisModeEnum, TaskActionType, OrderConfig, RunUserDataObj, LaunchRunUser } from '../../mission-domain';
import { I18nService } from '../../../service/i18n.service';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import {TiMessageService} from '@cloud/tiny3';


/**
 * @description
 * 本组件主要是为组件 MissionIoComponent 接口数据处理的服务，包括：
 * 1、将后端的数据转化，并赋值给表单控件；
 * 2、将表单控件的值，转化为后端接口所需要的数据结构。
 *
 * @publicApi setControlsByRawData 根据后端接口的数据，设置控件的值
 * @publicApi getRawDataByControls 将控件的值，转化为接口的数据
 * @publicApi requestNodeInfo 获取 接口的节点 的数据
 */
@Injectable({
    providedIn: 'root',
})
export class MissionIoDataService {
    public i18n: any;
    public runUserDataObj: LaunchRunUser = {};
    public analysisTarget: AnalysisModeEnum;
    public startCheckSys: any = {};   // 立即启动

    constructor(
        private i18nService: I18nService,
        public vscodeService: VscodeService,
        private zone: NgZone,
        private tiMessage: MessageModalService,
        private tMessage: TiMessageService,
    ) {
        this.i18n = i18nService.I18n();

    }

    /**
     * 创建任务-1
     * @param formGroup io分析表单控件
     * @param superData 父组件的数据
     * @param analysisMode 分析模式
     * @param actionType 行为方式(创建/编辑/重启)
     * @param sendPretable 更新预约任务事件
     * @param closeTab 关闭页签事件
     * @param preSwitchIO 预约定时组件
     * @param nodeConfigC 多节点配置组件
     */
    public async pushMissionData(
        formGroup: FormGroup,
        superData: SuperData,
        analysisMode: AnalysisModeEnum,
        actionType: TaskActionType,
        sendPretable: EventEmitter<any>,
        closeTab: EventEmitter<any>,
        preSwitchIO: any,
        nodeConfigC: any,
        ioComponent: any,
        runUserData: { runUser: boolean, user: string, password: string }
    ) {
        const params = await this.getRawDataByControls(
            formGroup,
            analysisMode,
            superData,
            preSwitchIO,
            nodeConfigC,
            runUserData
        );

        this.analysisTarget = (params.analysisTarget as AnalysisModeEnum);
        switch (actionType) {
            case TaskActionType.CREATE:
                this.createMissionData(
                    formGroup,
                    params,
                    sendPretable,
                    closeTab,
                    preSwitchIO
                );
                break;
            case TaskActionType.EDIT:
                this.editMissionData(
                    formGroup,
                    superData,
                    params,
                    closeTab,
                );
                break;
            case TaskActionType.RESTART:
                this.restartMissionData(
                    superData,
                    params,
                    closeTab,
                );
                break;
            case TaskActionType.SCHEDULEEDIT:
                this.scheduleTaskEdit(
                    params,
                    sendPretable,
                    closeTab,
                    ioComponent
                );
                break;
            default:
                break;
        }
    }

    /**
     * 重新启动
     * @param formGroup io分析表单控件
     * @param superData 父组件的数据
     * @param analysisMode 分析模式
     */
    public async pullMissionData(
        formGroup: FormGroup,
        superData: SuperData,
        analysisMode: AnalysisModeEnum,
    ) {
        const rawData = await this.requestGetMissionData(
            analysisMode,
            superData.restartAndEditId
        );
        this.setControlsByRawData(formGroup, rawData, analysisMode);
    }

    /**
     * 获取 接口的节点 的数据
     * @param projectId 工程ID
     */
    public requestGetNodeInfo(projectId): Promise<NodeConfigItem[]> {

        // 当开关组件没有打开时
        const url = `/projects/${projectId}/info/`;
        return new Promise((resolve, reject) => {
            const data = [];
            this.vscodeService.get({ url }, (res) => {
                res.data.nodeList.forEach((item) => {
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
                resolve(data);
            });
        });
    }

    /**
     * 根据后端接口的数据，设置控件的值
     * @param formGroup 表单控件组
     * @param rawData 后端接口数据
     * @param analysisMode 分析模式
     */
    public async setControlsByRawData(
        formGroup: FormGroup,
        rawData: RawDataIO,
        analysisMode: AnalysisModeEnum
    ) {
        const ctl: IoFormControls = formGroup.controls;

        // 设置常规控件
        ctl.size.setValue(rawData.size);
        ctl.stack.setValue(rawData.stack);
        ctl.statistical.setValue(rawData.statistical);
        ctl.duration.setValue(rawData.duration);

        // 设置预约控件
        ctl.orderConfig.setValue({
            cycle: rawData.cycle,
            cycleStart: rawData.cycleStart,
            cycleStop: rawData.cycleStop,
            targetTime: rawData.targetTime,
            appointment: rawData.appointment,
        });
        if (
            rawData.cycleStart ||
            rawData.cycleStop ||
            rawData.appointment ||
            rawData.targetTime
        ) {
            ctl.doOrder.setValue(true);
        } else {
            ctl.doOrder.setValue(false);
        }

        // 设置节点数据控件
        const nodeConfig: NodeConfigItem[] = [];
        for (const rawNode of rawData.nodeConfig) {
            let taskParam: any = {};
            switch (analysisMode) {
                case AnalysisModeEnum.ATTACH_TO_PROCESS:
                    taskParam = JSON.parse(
                        JSON.stringify(rawNode.taskParam, [
                            'status',
                            'targetPid',
                            'process_name',
                        ])
                    );
                    break;
                case AnalysisModeEnum.LAUNCH_APPLICATION:
                    taskParam = JSON.parse(
                        JSON.stringify(rawNode.taskParam, [
                            'status',
                            'appDir',
                            'app-parameters',
                        ])
                    );
                    break;
                default:
            }

            // FIXME
            nodeConfig.push({
                nodeId: rawNode.nodeId,
                nickName: rawNode.nodeNickName || rawNode.nickName,
                nodeIp: rawNode.nodeIp,
                nodeStatus: rawNode.nodeStatus,
                taskParam,
                runUserData: { user: '', password: '' }
            });
        }
        ctl.nodeList.setValue(rawData.nodeConfig);

        switch (analysisMode) {
            case AnalysisModeEnum.ATTACH_TO_PROCESS:
            case AnalysisModeEnum.LAUNCH_APPLICATION:
                ctl.doNodeConfig.setValue(rawData.switch);
                ctl.nodeConfig.setValue(nodeConfig);
                break;
            default:
        }
    }

    /**
     * 将控件的值，转化为接口的数据
     * @param formGroup 表单控件组
     * @param analysisMode 分析模式
     * @param superdata 父组件数据
     * @param preSwitchIO 预约定时组件
     * @param nodeConfigC 节点配置组件
     */
    public async getRawDataByControls(
        formGroup: FormGroup,
        analysisMode: AnalysisModeEnum,
        superdata: SuperData,
        preSwitchIO: any,
        nodeConfigC: any,
        runUserData: any
    ): Promise<RawDataIO> {
        // 控件组
        const ctlTmp: any = formGroup.controls;
        const ctl: IoFormControls = ctlTmp;
        // 共有参数处理
        const baseRawData: RawDataIOBase = {
            analysisType: 'ioperformance',
            projectName: superdata.projectName,
            taskName: superdata.taskName,
            duration: ctl.duration.value,
            statistical: ctl.statistical.value,
            size: ctl.size.value,
            stack: ctl.stack.value,
        };

        // 判断预约定时启动是否打开
        if (preSwitchIO.switchState) {
            if (preSwitchIO.selected === 1) {
                // 周期采集
                const durationArr = preSwitchIO.durationTime.split(' ');
                baseRawData.cycle = true;
                baseRawData.targetTime = preSwitchIO.pointTime;
                baseRawData.cycleStart = durationArr[0];
                baseRawData.cycleStop = durationArr[1];
                baseRawData.appointment = '';
            } else {
                // 单次采集
                const onceArr = preSwitchIO.onceTime.split(' ');
                baseRawData.cycle = false;
                baseRawData.targetTime = onceArr[1];
                baseRawData.appointment = onceArr[0];
            }
        }

        // 特有参数处理
        switch (analysisMode) {
            case AnalysisModeEnum.PROFILE_SYSTEM:
                baseRawData.analysisTarget = 'Profile System';
                break;
            case AnalysisModeEnum.LAUNCH_APPLICATION:
                baseRawData.analysisTarget = 'Launch Application';
                baseRawData.appDir = superdata.modeApplication || '';
                baseRawData['app-parameters'] = superdata.modeAppParams || '';
                break;
            case AnalysisModeEnum.ATTACH_TO_PROCESS:
                baseRawData.analysisTarget = 'Attach to Process';
                baseRawData.targetPid = superdata.modePid || '';
                baseRawData.process_name = superdata.modeProcess || '';
                break;
            default:
                break;
        }

        // 嵌套节点参数
        const rawData: RawDataIO = JSON.parse(JSON.stringify(baseRawData));
        if (analysisMode !== AnalysisModeEnum.PROFILE_SYSTEM && nodeConfigC && nodeConfigC.switchStatus) {
            const nodeData = nodeConfigC.getNodesConfigParams({}).nodeConfig;
            this.runUserDataObj = nodeConfigC.getNodesConfigParams({}).runUserData;
            rawData.nodeConfig = nodeData.map((nodeItem: any) => {
                let ctlNode: any;
                if (ctlTmp.nodeList.value) {
                    ctlTmp.nodeList.value.forEach((element: any) => {
                        if (element.id === nodeItem.nodeId) {
                            ctlNode = nodeItem;
                        }
                    });
                } else {
                    ctlNode = nodeItem;
                }

                if (analysisMode === AnalysisModeEnum.LAUNCH_APPLICATION) {
                    return {
                        nickName: ctlNode.nickName,
                        nodeId: ctlNode.nodeId,
                        taskParam: {
                            analysisType: ctlNode.task_param.analysisType,
                            projectName: ctlNode.task_param.projectName,
                            taskName: ctlNode.task_param.taskName || rawData.taskName,
                            duration: ctlNode.task_param.duration,
                            statistical: ctlNode.task_param.statistical,
                            size: ctlNode.task_param.size,
                            stack: ctlNode.task_param.stack,
                            analysisTarget: ctlNode.task_param.analysisTarget,
                            appDir: ctlNode.task_param.appDir,
                            'app-parameters': ctlNode.task_param['app-parameters'],
                            status: ctlNode.task_param.status
                        }
                    };
                } else {
                    return {
                        nickName: ctlNode.nickName,
                        nodeId: ctlNode.nodeId,
                        taskParam: {
                            analysisType: ctlNode.task_param.analysisType,
                            projectName: ctlNode.task_param.projectName,
                            taskName: ctlNode.task_param.taskName || rawData.taskName,
                            duration: ctlNode.task_param.duration,
                            statistical: ctlNode.task_param.statistical,
                            size: ctlNode.task_param.size,
                            stack: ctlNode.task_param.stack,
                            analysisTarget: ctlNode.task_param.analysisTarget,
                            targetPid: ctlNode.task_param.targetPid,
                            process_name: ctlNode.task_param.process_name,
                            status: ctlNode.task_param.status
                        }
                    };
                }
            });
        } else {
            const nodeData = ctlTmp.nodeList.value
                ? ctlTmp.nodeList.value
                : await this.requestGetNodeInfo(superdata.projectId);
            rawData.nodeConfig = [];
            nodeData.forEach((item: any) => {
                this.runUserDataObj[item.nodeIp] = {
                    runUser: runUserData.runUser,
                    user_name: runUserData.user || '',
                    password: runUserData.password
                };
                const nodeItem: any = {
                    nodeId: item.id || item.nodeId,
                    nickName: item.nickName || item.nodeNickName,
                    taskParam: JSON.parse(JSON.stringify(baseRawData)),
                };
                nodeItem.taskParam.status = false; // 默认
                rawData.nodeConfig.push(nodeItem);
            });
        }
        // 外层默认参数(是否配置节点的标志)
        switch (analysisMode) {
            case AnalysisModeEnum.PROFILE_SYSTEM:
                rawData.switch = false;
                break;
            case AnalysisModeEnum.LAUNCH_APPLICATION:
            case AnalysisModeEnum.ATTACH_TO_PROCESS:
                rawData.switch = nodeConfigC.switchStatus;
                break;
            default:
        }
        return rawData;
    }

    // 立即启动
    private startDataSamplingTask(
        closeTab: EventEmitter<any>,
        params: RawDataIO,
        id: string
    ) {
        const self = this;
        const option: any = { status: 'running' };
        if (this.analysisTarget === AnalysisModeEnum.LAUNCH_APPLICATION) {
            option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        this.vscodeService.get({
            url: '/res-status/?type=disk_space&project-name=' +
                encodeURIComponent(params.projectName) +
                '&task-name=' +
                encodeURIComponent(params.taskName)
        }, () => {
            this.vscodeService.put({
                url: '/tasks/' + id + '/status/',
                params: option
            }, (res: any) => {
                const backData = res.data;
                closeTab.emit({
                    title: `${params.taskName}-${params.nodeConfig[0].nickName}`,
                    id: backData.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: backData.id,
                    taskType: params.analysisType,
                    status: backData['task-status'],
                    projectName: params.projectName,
                });
                self.vscodeService.showInfoBox(self.i18nService.I18nReplace(
                    self.i18n.plugins_term_task_create_success, {
                    0: params.taskName
                }
                ), 'info');
            });
        });
    }

    /**
     * 创建任务-创建预约任务-创建立即启动任务
     * @param formGroup io分析表单控件
     * @param params 请求参数
     * @param sendPretable 更新预约任务事件
     * @param closeTab 关闭页签事件
     * @param preSwitchIO 预约定时组件
     */
    private createMissionData(
        formGroup: FormGroup,
        params: RawDataIO,
        sendPretable: EventEmitter<any>,
        closeTab: EventEmitter<any>,
        preSwitchIO: any
    ) {
        const ctlTmp: any = formGroup.controls;
        const ctl: IoFormControls = ctlTmp;
        const context = this;
        if (preSwitchIO.switchState) {
            this.vscodeService.post({ url: '/schedule-tasks/', params }, (resp: any) => {
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    if (resp.code === 'SysPerf.Success') {
                        this.vscodeService.showTuningInfo(resp.message, 'info', 'createTask');
                        this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                    } else {
                        this.vscodeService.showTuningInfo(resp.message, 'error', 'createTask');
                    }
                } else {
                    if (resp.status) {
                        context.vscodeService.showInfoBox(resp.message, 'error');
                    } else {
                        this.vscodeService.showInfoBox(context.i18nService.I18nReplace(
                            this.i18n.plugins_term_scheduleTask_create_success, {
                            0: params.taskName
                        }), 'info');
                        sendPretable.emit('on');
                        closeTab.emit({});
                        context.clear();
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
                        // 创建任务
                        this.vscodeService.post(option, (resp: any) => {
                            if (resp.code === 'SysPerf.Success') {
                                this.vscodeService.showTuningInfo(resp.message, 'info', 'createTask');
                                const data = resp.data;
                                // 判断立即执行任务
                                if (ctl.taskStartNow.value) {
                                    // 立即执行
                                    context.startDataSamplingTask(
                                        closeTab,
                                        params,
                                        data.id
                                    );
                                } else {
                                    const message = {
                                        cmd: 'openSomeNode',
                                        data: {
                                            taskId: data.id,
                                            projectName: params.projectName
                                        }
                                    };
                                    this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                                    this.vscodeService.postMessage(message, null);
                                }

                            } else {
                                this.vscodeService.showTuningInfo(resp.message, 'error', 'createTask');
                            }
                        });
                        modalInstance.close();
                    });
                };
                const modalInstance = this.tMessage.open({
                    id: 'create',
                    type: 'warn',
                    title: this.i18n.secret_title,
                    content: '<div>' +
                        '<div class="warn-tip-msg">' +
                        '<div class="ti3-icon ti3-icon-warn"></div>' + this.i18n.secret_count + '</div>' +
                        '</div>',
                    dismiss: (): void => {
                        this.zone.run(() => {
                            modalInstance.close();
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
                                modalInstance.close();
                            });
                        }
                    }
                });
            } else {
                const postFunc = () => {
                    const option = {
                        url: '/tasks/',
                        params
                    };
                    // 创建任务
                    this.vscodeService.post(option, (resp: any) => {
                        if (resp.status) {
                            context.vscodeService.showInfoBox(resp.message, 'error');
                        } else {
                            const data = resp.data;
                            // 判断立即执行任务
                            if (ctl.taskStartNow.value) {
                                // 立即执行
                                context.startDataSamplingTask(
                                    closeTab,
                                    params,
                                    data.id
                                );
                            } else {
                                closeTab.emit({
                                    title: `${data.taskName}-${params.nodeConfig[0].nickName}`,
                                    id: data.id,
                                    startCheckCNo: true,
                                    nodeid: params.nodeConfig[0].nodeId,
                                    taskId: data.id,
                                    taskType: data.analysisType,
                                    status: data.taskStatus,
                                    projectName: params.projectName
                                });
                                context.vscodeService.showInfoBox(context.i18nService.I18nReplace(
                                    context.i18n.plugins_term_task_create_success, {
                                    0: params.taskName
                                }), 'info');
                            }
                            context.clear();
                        }
                    });
                };

                this.tiMessage.open({
                    type: 'warn',
                    title: this.i18n.secret_title,
                    content: this.i18n.secret_count,
                    close: postFunc,
                });
            }
        }
    }

    /**
     * 修改任务
     * @param formGroup io分析表单控件
     * @param superData 父组件的数据
     * @param params 请求参数
     * @param closeTab 关闭页签事件
     */
    private editMissionData(
        formGroup: FormGroup,
        superData: SuperData,
        params: RawDataIO,
        closeTab: EventEmitter<any>,
    ) {
        const ctlTmp: any = formGroup.controls;
        const ctl: IoFormControls = ctlTmp;

        // 编辑任务
        this.vscodeService.put({
            url: `/tasks/${superData.restartAndEditId}/`,
            params
        }, (resp: any) => {
            const data = resp.data;
            // 修改任务提示
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                if (resp.code === 'SysPerf.Success') {
                    this.vscodeService.showTuningInfo(resp.message, 'info', 'modifyTask');
                    if (ctl.taskStartNow.value) {
                        this.startDataSamplingTask(
                            closeTab,
                            params,
                            data.id
                        );

                    } else {
                        const message = {
                            cmd: 'openSomeNode',
                            data: {
                                taskId: data.id,
                                projectName: params.projectName,
                            }
                        };
                        this.vscodeService.showTuningInfo('cancel', 'info', 'modifyTask');
                        this.vscodeService.postMessage(message, null);
                    }
                } else {
                    this.vscodeService.showTuningInfo(resp.message, 'error', 'modifyTask');
                }
            } else {
                if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                    this.vscodeService.showInfoBox(this.i18nService.I18nReplace(
                        this.i18n.plugins_term_task_modify_success, {
                        0: resp.data.taskName
                    }), 'info');
                    // 关闭页签
                    if (ctl.taskStartNow.value) {
                        // 立即执行
                        this.startDataSamplingTask(closeTab, params, resp.data.id);
                    } else {
                        closeTab.emit({});
                    }
                } else {
                    this.vscodeService.showInfoBox(resp.message, 'error');
                }
            }
        });
    }

    /**
     * 重启任务任务
     * @param superData 父组件的数据
     * @param params 请求参数
     * @param closeTab 关闭页签事件
     */
    private restartMissionData(
        superData: SuperData,
        params: RawDataIO,
        closeTab: EventEmitter<any>,
    ) {
        if (this.analysisTarget === AnalysisModeEnum.LAUNCH_APPLICATION) {
            params.user_message = this.dealRunUserDataObj(this.runUserDataObj);
        }
        params.status = 'restarted';
        this.vscodeService.put({
            url: `/tasks/${superData.restartAndEditId}/status/`,
            params
        }, (resp: any) => {
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                const data = resp.data;
                closeTab.emit({
                    title: `${superData.taskName}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: params.analysisType,
                    status: data['task-status'],
                    projectName: superData.projectName,
                });
                this.vscodeService.showInfoBox(this.i18n.mission_create.restartSuccess, 'info');
            } else {
                this.vscodeService.showInfoBox(resp.message, 'error');
            }
        });
    }

    /**
     * 预约任务编辑
     * @param params 请求参数
     * @param sendPretable 更新预约任务事件
     * @param closeTab 关闭页签事件
     * @param IO组件 预约定时组件
     */
    private scheduleTaskEdit(
        params: RawDataIO,
        sendPretable: EventEmitter<any>,
        closeTab: EventEmitter<any>,
        ioComponent: any
    ) {
        this.vscodeService.put({
            url: '/schedule-tasks/' + ioComponent.scheduleTaskId + '/',
            params
        }, (resp: any) => {
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                this.vscodeService.showInfoBox(this.i18nService.I18nReplace(
                    this.i18n.plugins_term_scheduleTask_modify_success, {
                    0: params.taskName
                }), 'info');
                sendPretable.emit('on');
                closeTab.emit({});
            } else {
                this.vscodeService.showInfoBox(resp.message, 'error');
            }
        });
    }

    /**
     * 获取任务数据
     * @param analysisMode 分析模式
     * @param restartAndEditId 任务id
     */
    private requestGetMissionData(
        analysisMode: AnalysisModeEnum,
        restartAndEditId: string
    ): Promise<RawDataIO> {
        const url =
            '/tasks/' +
            restartAndEditId +
            '/common/configuration/?node-id' +
            '&analysis-type=' +
            analysisMode;
        return new Promise<RawDataIO>((resolve, reject) => {
            this.vscodeService.get({
                url,
            }, (resp) => {
                resolve(resp.data);
            });
        });
    }

    private clear() { }
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
}
