import { MytipService } from './../service/mytip.service';
import { ViewDetailsService } from 'sys/src-ide/app/service/view-details.service';
import { PartialObserver, Subscription } from 'rxjs';
import {
    Component, OnInit, AfterViewInit, ViewChild, Renderer2, ViewChildren, OnDestroy, NgZone, ChangeDetectorRef
} from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { MessageService } from '../service/message.service';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
import { AxiosService } from '../service/axios.service';
import { ScheduleTaskService } from '../service/schedule-task.service';
import { Util } from '@cloud/tiny3';
import { VscodeService } from '../service/vscode.service';
import { ActivatedRoute } from '@angular/router';
import { UrlService } from 'projects/sys/src-ide/app/service/diagnoseServices/url.service';
import { openHelper } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-record-detail/tuninghelper-record-detail.component';
import { refSug } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-record-detail/tuninghelper-record-detail.component';
import { openDataDetailPanal } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-task-detail/tuninghelper-task-detail.component';
import { ToolType } from 'projects/domain';
import {
    TuningSysCreateTaskData,
    TuningSysMessageDetail,
    TuningSysMessageService,
    TuningSysMessageType,
    TuningSysViewTaskData,
    ViewAssociatedReportData,
} from 'sys/model/service';

@Component({
    selector: 'app-home2',
    templateUrl: './home2.component.html',
    styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit, AfterViewInit, OnDestroy {
    private url: any;
    constructor(
        private urlService: UrlService,
        private route: ActivatedRoute,
        private renderer2: Renderer2,
        public i18nService: I18nService,
        public mytip: MytipService,
        private msgService: MessageService,
        private Axios: AxiosService,
        private tiMessage: MessageModalService,
        public scheduleTaskServer: ScheduleTaskService,
        public vscodeService: VscodeService,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone,
        private tuningSysMessageService: TuningSysMessageService,
    ) {
        this.url = this.urlService.Url();
        this.i18n = this.i18nService.I18n();
        this.tabList = [
        ];
    }
    public nodeNickName = '';
    // ????????????ID
    public missNoImmediately: boolean;
    public panelId: any;
    public leftState = true;
    public maxLeftHeight = '100%';
    public tabList: any[] = [];
    public treeData: any = [];
    public i18n: any;
    public showTabArrow = false;
    public tanslateX = 0;
    public subscription: any;
    public operation: string;
    public userInfo = {
        role: '',
        loginId: '',
        userName: ''
    };
    public isAddTask = false;
    private openHelper: Subscription;
    private refSug: Subscription;
    private openDataDetailPanal: Subscription;
    public listenerFn: any;
    public toolType = sessionStorage.getItem('toolType');
    public ToolType = ToolType;
    @ViewChild('Tree', { static: false }) Tree: any;
    @ViewChildren('indexContent') indexContent: any;
    public tabCover = {
        couver(taskId: any, item: any) {
            if (this.tabList.length > 0) {
                this.tabList = this.tabList.filter((items: { taskId: any; }) => {
                    return items.taskId !== taskId.id;
                });
                let i = 0;
                this.tabList.forEach((tab: any) => {
                    if (tab.active === false) {
                        i++;
                    }
                });
                if (i === this.tabList.length && this.tabList.length > 0) {
                    this.tabList[0].active = true;
                }
                this.Tree.updateProjectDetail([item]);
            }
        },
        deleteProject(taskIdArr: any) {
            if (this.tabList.length > 0) {
                this.tabList = this.tabList.filter((items: any) => {
                    if (items.taskId && taskIdArr.indexOf(items.taskId) === -1) {
                        return items;
                    }
                });
                let i = 0;
                this.tabList.forEach((tab: any) => {
                    if (tab.active === false) {
                        i++;
                    }
                });
                if (i === this.tabList.length && this.tabList.length > 0) {
                    this.tabList[0].active = true;
                }
            }
        },
    };
    // ??????????????????
    public scheduleTask: any;
    private tuningHelperSub: Subscription;

    /**
     * ?????????
     */
    ngOnInit() {
        // ????????????????????????????????????
        this.msgService.getMessage().subscribe(msg => {
            if (msg && msg.type && msg.type.indexOf('updateMenu') !== -1) {
                this.initTabList(null);
            }
        });
        // ????????????????????????????????????????????????????????????
        this.openHelper = openHelper.subscribe((msg) => {
            this.pathToDetail(msg);
        });

        this.vscodeService.regVscodeMsgHandler('updateTuningRecordDetail', (data: any) => {
            const updateSugDetailMessage = {
                type: TuningSysMessageType.UpdateRecord,
                data
            };
            refSug.next(updateSugDetailMessage);
        });
        this.refSug = refSug.subscribe((msg) => {
            if (msg.type) {return; }
            this.vscodeService.postMessage({
                cmd: 'updateTuningRecordDetail',
                data: {
                    taskId: msg
                }
            }, null);
        });
        // ????????????????????????????????????????????????
        this.openDataDetailPanal = openDataDetailPanal.subscribe((msg) => {
            this.openDataDetailHepler(msg);
        });
        this.route.queryParams.subscribe((data) => {
            const operation = data.operation;
            let fromTuningDetail: TuningSysCreateTaskData;
            if (data.fromTuningDetail) {
                fromTuningDetail = JSON.parse(data.fromTuningDetail);
            }
            if (operation === 'createTuninghelperTask' || operation === 'reanalyzeTask'
                || operation === 'reanalyzeServer') {
                this.tuningHelperTaskOperate(operation, data);
            } else if (operation === 'modifyTask' || operation === 'reanalysisTask' || operation === 'createTask'
                || operation === 'createCompareTask') {
                const projectId = data.projectId;
                this.panelId = data.panelId;
                if (projectId) {
                    const option = {
                        url: this.url.project.concat(projectId).concat('/info/'),
                    };
                    this.vscodeService.get(option, async (resp: any) => {
                        if (resp.code === 'SysPerf.Success') {
                            const project = resp.data;
                            if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
                                this.nodeNickName = project.nodeList[0]?.nickName;
                            } else {
                                this.nodeNickName = project.nodeList[0].nickName;
                            }
                            const scenes = this.Axios.getScenes(resp.data.sceneId);
                            const taskDetail = {
                                id: '',
                                taskName: '',
                                label: project.projectName,
                                numFunction: project.numFunction,
                                numProcess: project.numProcess,
                                numSystem: project.numSystem,
                                ownerId: project.ownerId,
                                ownerName: project.ownerName,
                                projectId: project.projectId,
                                projectName: project.projectName,
                                timeCreated: project.timeCreated,
                                nodeList: project.nodeList,
                                analysisType: ''
                            };
                            if (operation === 'modifyTask' || operation === 'reanalysisTask') {
                                taskDetail.id = data.taskId;
                                taskDetail.taskName = data.taskName;
                                taskDetail.analysisType = data.analysisType;
                            }

                            let displayType = 'addTask';
                            if (fromTuningDetail) {
                                Object.assign(taskDetail, fromTuningDetail.task);
                                if (fromTuningDetail.task.isCreateDiagnoseTask) {
                                  displayType = 'tuningCreateDiagnoseTask';
                                }
                            }
                            this.tabList = this.tabList.filter(item => item.taskDetail.id !== taskDetail.id);
                            this.tabList.push({
                                actionType: operation === 'reanalysisTask'
                                    ? 'restart' : operation === 'modifyTask'
                                        ? 'edit' : 'create',
                                active: true,
                                projectName: data.projectName ? data.projectName : project.projectName,
                                taskDetail,
                                displayType,
                                scenes,
                            });
                            this.isAddTask = true;
                            this.operation = operation === 'createTask' ? 'create' : operation;
                        }
                        this.updateWebViewPage();
                    });
                } else {
                    this.tabList.push({
                        actionType: 'create',
                        active: true,
                        displayType: operation === 'createTask' ? 'addLinkage' : operation,
                    });
                }
                this.updateWebViewPage();
            } else {
                if (data.sendMessage) {
                    let response = data.sendMessage.replace(/#/g, ':');

                    const respParams = JSON.parse(response);
                    this.panelId = respParams.panelId;
                    const panel = this.tabList.find((tab) => {
                        return tab.panelId === this.panelId;
                    });
                    if (respParams.isRedirect === true) {
                        if (panel) {
                            this.tabList.splice(0, 1);
                        }
                        this.tabList.push({
                            taskName: respParams.params.taskName,
                            title: respParams.selfInfo.nodeNickName,
                            active: true,
                            nodeid: respParams.selfInfo.nodeId,
                            taskId: respParams.taskId,
                            projectName: respParams.params.projectName,
                            analysisType: respParams.params.analysisType,
                            analysisTarget: respParams.selfInfo.taskParam['analysis-target'],
                            taskType: respParams.params.taskType,
                            displayType: 'dataDisplay',
                            status: respParams.selfInfo.sampleStatus,
                            panelId: this.panelId,
                            ownerId: respParams.ownerId,
                        });

                        // ??????????????????????????????wibview????????????????????????????????????????????????????????????????????????sys?????????????????????
                        this.tuningSysMessageService.currActiveTab = {
                            tabPanelId: this.panelId,
                            nodeIP: respParams.selfInfo.nodeIP,
                            projectName: respParams.params.projectName,
                            taskDetail: {
                                ...respParams.selfInfo,
                                task: {
                                    'analysis-target': respParams.selfInfo.taskParam['analysis-target']
                                        || respParams.selfInfo.taskParam.analysisTarget,
                                    'analysis-type': respParams.params.analysisType,
                                    nodeIP: respParams.selfInfo.nodeIP,
                                    nodeId: respParams.selfInfo.nodeId,
                                    nodeNickName: respParams.selfInfo.nodeNickName,
                                    ownerId: respParams.ownerId,
                                    parent: respParams.params.projectName,
                                    taskId: respParams.taskId,
                                    taskname: respParams.params.taskName,
                                },
                            },
                        };
                    } else {
                        // hypertuner??????
                        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                            let newString = data.selfInfo.replace(/#/g, ':');
                            newString = newString
                                .replace(/%/g, '"')
                                .replace('processthreadanalysis', 'process-thread-analysis');
                            const selfInfo = JSON.parse(newString);
                            if (panel) {
                                return;
                            }
                            this.initTabList(selfInfo);
                            this.changeDetectorRef.markForCheck();
                            this.changeDetectorRef.detectChanges();
                        } else {
                            response = JSON.parse(response);
                            const selfInfo = response.selfInfo;
                            if (panel) {
                                return;
                            }
                            this.initTabList(response);
                        }

                    }
                }
                this.autoShowActiveTab();
            }
        });
        this.certificates();
        this.userInfo.role = self.webviewSession.getItem('role');
        this.userInfo.loginId = self.webviewSession.getItem('loginId');
        this.userInfo.userName = self.webviewSession.getItem('username');
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }

        // ?????????????????????????????????
        this.tuningHelperSub = this.tuningSysMessageService.getMessage({
            next: (message: TuningSysMessageDetail<any>) => {
                // ????????????????????????
                if (message.type === TuningSysMessageType.CreateSysTask) {
                    this.tuningSysOperateTask(message.data);
                }

                // ??????????????????
                if (message.type === TuningSysMessageType.ViewSysTask) {
                    this.tuningSysViewTask(message.data);
                }

                // ????????????????????????????????????
                if (message.type === TuningSysMessageType.ViewAssociatedReport) {
                    this.tuningViewAssociatedReport(message.data);
                }
            }
        });
    }

    /**
     * ?????????????????????
     * @param e ???????????????????????????
     */
    public tuningSysOperateTask(e: TuningSysCreateTaskData) {
        let viewTitle;
        let panelId;
        let message;
        if (e.type === 'create') {
            viewTitle = this.i18n.common_term_task_new;
            panelId = e.task.projectName + '-' + new Date().getTime();
            message = {
                fromTuningDetail: JSON.stringify(e),
                projectId: e.task.projectId,
                projectName: e.task.projectName,
                panelId,
                operation: 'createTask',
            };
        }
        if (e.type === 'restart') {
            viewTitle = e.task.sysTasktName ? e.task.sysTasktName : this.i18n.common_term_task_restart;
            panelId = e.task.projectName + '-' + e.task.sysTasktName;
            message = {
                fromTuningDetail: JSON.stringify(e),
                projectId: e.task.projectId,
                projectName: e.task.projectName,
                taskId: e.task.id,
                taskName: e.task.sysTasktName,
                analysisType: e.task.analysisType,
                operation: 'reanalysisTask'
            };
        }

        const data = {
            router: 'home',
            panelId,
            viewType: 'perfCreateTask',
            viewTitle,
            message,
        };
        if (e.task.isCreateDiagnoseTask) {
          Object.assign(data, { msgType: 'tuningCreateDiagnoseTask' });
        }
        // ?????????????????????sys????????????
        this.vscodeService.postMessage({
            cmd: 'openNewPage',
            data,
        }, null);

        // ?????????????????????????????????????????????
        this.vscodeService.regVscodeMsgHandler('updateTuningSugDetail', (vscodeMessage: any) => {
            const updateSugDetailMessage = {
                type: TuningSysMessageType.UpdateOptimization,
                data: {
                    tabPanelId: vscodeMessage.fromTuningTabId
                }
            };
            this.tuningSysMessageService.sendMessage(updateSugDetailMessage);
        });
    }

    /**
     * ????????????????????????????????????
     * @param tuningData ???????????????????????????
     */
    public tuningSysViewTask(tuningData: TuningSysViewTaskData) {
        const taskDetail = JSON.parse(JSON.stringify(this.tuningSysMessageService.currActiveTab?.taskDetail));
        const panelId = tuningData.projectName + '-' + tuningData.taskName + '-' + taskDetail?.nodeNickName
         + '-' + tuningData.nodeIP;
        const title = tuningData.taskName + '-' + tuningData.nodeIP + '-' + tuningData.projectName;
        taskDetail.id = tuningData.taskId;
        taskDetail.nodeId = tuningData.nodeId;
        taskDetail.nodeIP = tuningData.nodeIP;
        taskDetail.taskParam['analysis-type'] = tuningData.analysisType;
        if (tuningData.isCreateDiagnoseTask) {
          Object.assign(taskDetail, { isCreateDiagnoseTask: true});
        }
        const sendMessage = JSON.stringify({
            taskId: tuningData.taskId,
            selfInfo: taskDetail,
            panelId
        }).replace(/:/g, '#');
        this.vscodeService.postMessage({
            cmd: 'openNewPage',
            data: {
                router: 'home',
                panelId,
                viewType: 'sysPerfProjectTaskNode',
                viewTitle: title,
                module: 'sysPerf',
                msgType: tuningData.isCreateDiagnoseTask ? 'tuningViewDiagnoseReport'
                 : 'tuningViewSysReport',
                needAsycnUpdate: true,
                message: { sendMessage }
            }
        }, null);
    }

    /**
     * ??????????????????????????????????????????
     * @param data ???????????????????????????
     */
    public tuningViewAssociatedReport(tuningData: ViewAssociatedReportData) {
        const taskDetail = JSON.parse(JSON.stringify(tuningData.taskDetail));
        const panelId = tuningData.projectName + '-' + taskDetail.task.taskname + '/' + taskDetail.task.nodeIP;
        taskDetail.taskParam['analysis-type'] = 'tuninghelperRelation';
        taskDetail.task = {
            ...taskDetail.task,
            level: 'node',
        };
        const sendMessage = JSON.stringify({
            taskId: taskDetail.id,
            selfInfo: taskDetail,
            panelId
        }).replace(/:/g, '#');
        this.vscodeService.postMessage({
            cmd: 'openNewPage',
            data: {
                router: 'home',
                panelId,
                viewType: 'sysPerfProjectTaskNode',
                viewTitle: panelId,
                msgType: 'detailToPath',
                message: { sendMessage }
            }
        }, null);
    }

    public tuningHelperTaskOperate(operation: string, data: any) {
        const projectId = data.projectId;
        this.panelId = data.panelId;
        if (projectId) {
            const option = {
                url: this.url.project.concat(projectId).concat('/info/'),
            };
            this.vscodeService.get(option, async (resp: any) => {
                if (resp.code === 'SysPerf.Success') {
                    const project = resp.data;
                    if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner'){
                      this.nodeNickName = project.nodeList[0]?.nickName;
                    } else {
                      this.nodeNickName = project.nodeList[0].nickName;
                    }
                    const taskDetail: any = {
                        label: project.projectName,
                        ownerId: project.ownerId,
                        ownerName: project.ownerName,
                        projectId: +project.projectId,
                        projectName: project.projectName,
                        timeCreated: project.timeCreated,
                        nodeList: project.nodeList,
                    };
                    if (operation === 'reanalyzeTask') {
                        const taskInfo = JSON.parse(data.taskInfo);
                        taskDetail.id = taskInfo.id;
                        taskDetail.taskName = taskInfo.taskname;
                    }
                    this.tabList.push({
                        actionType: operation,
                        active: true,
                        projectName: data.projectName ? data.projectName : project.projectName,
                        projectId: +project.projectId,
                        taskDetail,
                        displayType: 'addTask',
                    });
                    this.isAddTask = true;
                    this.operation = operation;
                }
                this.updateWebViewPage();
            });
        } else {
            const taskDetail: any = {};
            if (operation === 'reanalyzeServer') {
                const taskInfo = JSON.parse(data.taskInfo);
                taskDetail.taskId = +data.taskId;
                taskDetail.nodeIp = taskInfo.nodeIP || taskInfo.nodeIp;
                taskDetail.nodeId = taskInfo.nodeId;
                taskDetail.ownerId = taskInfo.ownerId;
                this.tabList.push({
                    actionType: operation,
                    active: true,
                    taskDetail,
                    projectId: +taskInfo.projectId,
                    projectName: taskInfo.projectName,
                    displayType: 'addTask',
                });
            }
        }
        this.updateWebViewPage();
    }

    private initTabList(response: any) {
        if (!response) {
            this.updTaskInfo();
        } else {
            let selfInfo = response.selfInfo;
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                selfInfo = response;
            }
            if (['Sampling', 'Analyzing', 'Stopping', 'Cancelling', 'Waiting'].includes(selfInfo.sampleStatus)) {
                this.tabList.push({
                    taskName: selfInfo.taskParam.taskname ? selfInfo.taskParam.taskname : selfInfo.taskParam.taskName,
                    title: selfInfo.nodeNickName,
                    active: true,
                    nodeid: selfInfo.nodeId,
                    taskId: response.taskId,
                    projectName: selfInfo.taskParam.projectname,
                    analysisType: selfInfo.taskParam['analysis-type'],
                    taskType: selfInfo.taskParam['analysis-type'],
                    displayType: 'nodeProcessDisplay',
                    status: selfInfo.sampleStatus,
                    panelId: this.panelId
                });
            } else {
                if (selfInfo.isLinkageTask) {
                    this.tabList.push({
                        taskName: selfInfo.taskname,
                        title: selfInfo.nodeList[0].nodeNickName,
                        active: true,
                        id: selfInfo.id,
                        nodeid: selfInfo.nodeList[0].nodeId,
                        taskId: selfInfo.id,
                        projectName: response.projectName || '',
                        analysisType: selfInfo['analysis-type'],
                        analysisTarget: selfInfo['analysis-target'],
                        taskType: selfInfo['analysis-type'],
                        displayType: selfInfo['task-status'] === 'Running' ? 'nodeProcessDisplay' : 'dataDisplay',
                        status: selfInfo['task-status'] || '',
                        panelId: this.panelId
                    });
                } else {
                    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        this.tabList.push({
                            taskName: selfInfo.taskParam.taskname
                                ? selfInfo.taskParam.taskname : selfInfo.taskParam.taskName,
                            title: selfInfo.nodeNickName,
                            active: true,
                            nodeid: selfInfo.nodeId,
                            taskId: selfInfo.taskId,
                            projectName: selfInfo.taskParam.projectname,
                            analysisType: selfInfo.taskParam.analysistype,
                            analysisTarget: selfInfo.taskParam.analysistarget,
                            taskType: selfInfo.taskParam.analysistype,
                            displayType: 'dataDisplay',
                            status: selfInfo.sampleStatus,
                            panelId: this.panelId
                        });
                    } else {
                        this.tabList.push({
                            taskName: selfInfo.taskParam?.taskname || selfInfo.taskParam?.taskName
                                || selfInfo.task?.taskname || selfInfo.taskname,
                            title: selfInfo.nodeNickName,
                            active: true,
                            nodeid: selfInfo.nodeId,
                            taskId: response.taskId,
                            projectName: selfInfo.taskParam?.projectname || selfInfo.task?.parent,
                            analysisType: selfInfo.taskParam ? selfInfo.taskParam['analysis-type']
                                : selfInfo.task['analysis-type'],
                            analysisTarget: selfInfo.taskParam ? selfInfo.taskParam['analysis-target']
                                || selfInfo.taskParam.analysisTarget : selfInfo['analysis-target'],
                            taskType: selfInfo.taskParam ? selfInfo.taskParam['analysis-type']
                                : selfInfo.task['analysis-type'],
                            displayType: 'dataDisplay',
                            status: selfInfo.sampleStatus || selfInfo['task-status'],
                            panelId: this.panelId,
                            taskDetail: selfInfo.task || {},
                            ownerId: selfInfo.ownerId,
                        });

                        // ????????????wibview?????????
                        this.tuningSysMessageService.currActiveTab = {
                            tabPanelId: this.panelId,
                            nodeIP: selfInfo.nodeIP,
                            projectName: selfInfo.projectName,
                            taskDetail: selfInfo,
                        };
                    }
                }
                if (selfInfo.sampleStatus === 'Created' && selfInfo.taskParam['analysis-type'] === 'miss_event') {
                    this.missNoImmediately = true;
                }
            }
            this.updateWebViewPage();
        }
    }

    /**
     * ??????????????????????????????
     * @params resp ????????????????????????,
     */
    private pathToDetail(resp: any) {
        const selfInfo = {
            taskname: resp.parent[1].taskname,
            sampleStatus: resp.sampleStatus,
            nodeNickName: resp.nodeNickName,
            nodeId: resp.nodeId,
            taskId: resp.taskId,
            ownerId: resp.ownerId,
            'analysis-target': resp.analysisTarget,
            task: {
                parent: resp.parent[0].projectName,
                'analysis-type': 'optimization',
            }
        };
        const panelId = resp.parent[1].taskname + '-' + resp.nodeNickName + '-' + resp.parent[0].projectName;
        const sendMessage = JSON.stringify({
            panelId,
            taskId: resp.taskId,
            selfInfo,
        }).replace(/:/g, '#');
        this.panelId = panelId;
        this.vscodeService.postMessage({
            cmd: 'openNewPage',
            data: {
                router: 'home',
                panelId,
                viewType: 'sysPerfProjectTaskNode',
                viewTitle: panelId,
                msgType: 'pathToDetail',
                message: { sendMessage }
            }
        }, null);
    }

    /**
     * ????????????-????????????????????????
     * @param e ????????????
     */
    public openDataDetailHepler(e: any) {
        const selfInfo = {
            taskType: e.taskType,
            ownerId: e.ownerId,
            sampleStatus: 'dataDisplay',
            nodeid: e.nodeId,
            taskId: e.taskId,
            task: {
                showDetailType: e.type,
                'analysis-type': e.taskType,
                taskId: e.taskId,
                nodeid: e.nodeId,
            }
        };
        const panelId = `${e.type}-${e.taskId}-${e.nodeId}`;
        const sendMessage = JSON.stringify({
            panelId,
            taskId: e.taskId,
            selfInfo,
        }).replace(/:/g, '#');
        this.panelId = panelId;
        this.vscodeService.postMessage({
            cmd: 'openNewPage',
            data: {
                router: 'home',
                panelId,
                viewTitle: e.title,
                msgType: 'pathToDetail',
                message: { sendMessage }
            }
        }, null);
    }
    private updTaskInfo() {
        const taskInfo = this.tabList[0];
        const option = {
            url: '/tasks/task-summary/?analysis-type=all&project-name=' + encodeURIComponent(taskInfo.projectName) +
                '&auto-flag=on&page=1&per-page=1000'
        };
        this.vscodeService.get(option, (resp: any) => {
            if (resp.code === 'SysPerf.Success' && resp.data.length > 0) {
                const taskInfos = resp.data[0].tasklist.filter((task: any) => task.id === taskInfo.taskId);
                if (taskInfos.length > 0) {
                    if (['Sampling', 'Analyzing', 'Stopping', 'Cancelling', 'Waiting']
                        .includes(taskInfos[0]['task-status'])
                    ) {
                        taskInfo.displayType = 'nodeProcessDisplay';
                    } else {
                        taskInfo.displayType = 'dataDisplay';
                    }
                }
                this.updateWebViewPage();
            }
        });
    }

    /**
     * ???????????????????????????
     */
    ngAfterViewInit(): void {

        // ??????????????????????????????tiny????????????????????????
        this.indexContent.changes.subscribe((comps: any) => {
            if (comps.first) {
                if (!this.listenerFn) {
                    this.listenerFn = this.renderer2.listen(
                        comps.first.nativeElement,
                        'scroll',
                        () => {
                            Util.trigger(document, 'tiScroll');
                        }
                    );
                }
            } else {
                if (this.listenerFn) {
                    this.listenerFn();
                    this.listenerFn = undefined;
                }
            }
        });

    }
    /**
     * ????????????
     */
    ngOnDestroy() {
        // ??????????????????????????????tiny????????????????????????
        if (this.listenerFn) {
            this.listenerFn();
            this.listenerFn = undefined;
        }
        this.openHelper?.unsubscribe();
        this.openDataDetailPanal?.unsubscribe();
        this.tuningHelperSub?.unsubscribe();
        this.refSug?.unsubscribe();
    }
    /**
     * ????????????
     */
    public stopAnalysis(data: any, parent: any) {
        if (data.type === 'system_config') {
            return;
        }
        const params = {
            status: 'cancelled',
        };
        const option = {
            url: this.url.toolTask.concat(data.id).concat('/status/'),
            params
        };
        this.vscodeService.put(option, async (resp: any) => {
            if (resp.code === 'SysPerf.Success') {
                this.Tree.updateProjectDetail([parent]);
            }
        });
    }
    /**
     * ??????task
     */
    startDataSamplingTask(node: any) {
        const url = '/res-status/?type=disk_space&project-name=';
        const projectNameURL = encodeURIComponent(node.parentNode.projectName);
        const tasknameURL = encodeURIComponent(node.taskname);
        const option = {
            url: url.concat(projectNameURL).concat('&task-name=').concat(tasknameURL),
        };
        this.vscodeService.get(option, async (resp: any) => {
            const ops = {
                url: this.url.toolTask + node.id + '/status/',
                params: {
                    status: 'running'
                }
            };
            this.vscodeService.put(ops, async (data: any) => {
                if (data.code === 'SysPerf.Success') {
                    const tab = {
                        title: node.taskname + '-' + node.nodeList[0].nodeNickName,
                        id: node.id,
                        nodeid: node.nodeList[0].nodeId,
                        taskId: node.id,
                        taskType: node['analysis-type'],
                        status: node.nodeList[0].sampleStatus,
                        active: true,
                        displayType: 'nodeProcessDisplay',
                        projectName: node.parentNode.projectName,
                    };
                    this.tabList.forEach((item) => {
                        item.active = false;
                    });
                    this.checkTabListWithNewTab(tab);
                    this.autoShowActiveTab();
                    this.updateWebViewPage();
                }

            });
        });

    }
    /**
     * ?????????????????????????????????????????????????????? ???????????????
     */
    public async closeTabAndOpenDetail(e: any, index: number) {
        if (Object.keys(e).length === 0) {
            this.closeTab(index);
            this.vscodeService.postMessage({ cmd: 'optTaskSuccess' }, null);
            this.updateWebViewPage();
        } else {
            const tabItem = {
                title: `${e.title}-${e.projectName}`,
                id: e.id,
                nodeid: e.nodeid,
                taskId: e.taskId,
                scenes: e.scenes,
                taskType: e.taskType,
                status: e.status,
                active: true,
                displayType: 'nodeProcessDisplay',
                projectName: e.projectName,
                ownerId: e.ownerId,
            };
            if (e.startCheckCNo) {
                this.missNoImmediately = e.missNoImmediately;
                tabItem.displayType = 'dataDisplay';
            }
            if (e.taskType === 'tuninghelperCompare') {
                tabItem.title = e.title;
                tabItem.displayType = e.status === 'succeed' ? 'dataDisplay' : 'nodeProcessDisplay';
            } else if (e.taskType === 'task_contrast') {
                tabItem.title = e.title.substr(0, e.title.length - 1);
            }
            this.panelId = tabItem.title;
            if (e.fromTuningTabId) {
                Object.assign(tabItem, { taskDetail: { fromTuningTabId: e.fromTuningTabId } });
            }
            const message = {
                cmd: 'optTaskSuccess',
                data: {
                    type: 'confirm',
                    loginId: this.userInfo.loginId,
                    userName: this.userInfo.userName,
                    task: tabItem,
                    panelId: this.panelId
                }
            };
            this.vscodeService.postMessage(message, null);
            this.tabList = this.tabList.filter((items) => {
                return items.taskId !== e.id;
            });
            this.tabList.splice(index, 1, tabItem);
            this.updateWebViewPage();
        }

    }
    /**
     * ????????????
     */
    public closeTab(index: number) {
        this.tabList.splice(index, 1);
        const active = this.tabList.find((item) => item.active === true);
        if (!active) {
            if (index - 1 >= 0 && this.tabList.length > 0) {
                this.tabList[index - 1].active = true;
            } else if (index === 0 && this.tabList.length > 0) {
                this.tabList[0].active = true;
            }
        }
        const scroll = $('.scroll-box').width();
        const box = $('.tab-header').width();
        if (scroll > box) {
            this.showTabArrow = true;
        } else {
            this.showTabArrow = false;
        }
        this.autoShowActiveTab();
        this.updateWebViewPage();
    }
    /**
     * ??????tab??????active
     */
    public switchActive(index: any) {
        this.tabList.forEach((item) => {
            item.active = false;
        });
        this.tabList[index].active = true;
        this.updateWebViewPage();
    }
    /**
     * ??????tabList?????????????????????tab??????????????????active???????????????push
     */
    public checkTabListWithNewTab(tab: any) {
        const current = this.tabList.find(
            (item) =>
                item.title === tab.title &&
                item.projectName === tab.projectName &&
                (item.displayType === tab.displayType ||
                    item.displayType === 'nodeProcessDisplay' ||
                    item.displayType === 'dataDisplay')
        );
        // ????????? ????????? ????????? ????????????tab
        if (current && current.title) {
            current.active = true;
        } else {
            this.tabList.push(tab);
        }
    }

    /**
     * ??????????????????
     */
    public autoShowActiveTab() {
        setTimeout(() => {
            const maginLeft = $('.tab-btn.active')[0] && $('.tab-btn.active')[0].offsetLeft;
            if (!maginLeft) {
                this.tanslateX = 0;
                return;
            }
            const scroll = $('.scroll-box').width();
            const box = $('.tab-header').width();
            if (scroll > box) {
                this.showTabArrow = true;
                this.tanslateX = maginLeft - box + $('.tab-btn.active').width() + 50;
                if (this.tanslateX < 0) {
                    this.tanslateX = 0;
                }
            } else {
                this.showTabArrow = false;
                this.tanslateX = 0;
            }
        }, 0);
        this.updateWebViewPage();
    }
    /**
     * ????????????????????????????????????????????????
     */
    public certificates(): void {
        this.vscodeService.get({
            url: '/certificates/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        }, (res: any) => {
            const flag = res.data.some((res2: any) => {
                return +res2.certStatus >= 1;
            });
            if (
                flag &&
                (self.webviewSession.getItem('isAlert') === 'false' ||
                    !self.webviewSession.getItem('isAlert'))
            ) {
                self.webviewSession.setItem('isAlert', 'true');
                this.tiMessage.open({
                    type: 'warn',
                    title: this.i18n.certificate.notice,
                    content: this.i18n.certificate.warnNotice,
                    okButton: {
                        text: this.i18n.common_term_operate_ok,
                    },
                    cancelButton: {
                        show: false,
                    },
                });
            }
        });
    }
    /**
     * IntellIj??????webview??????
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
