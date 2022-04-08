import { Component, OnInit, Input, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { ActivatedRoute } from '@angular/router';
import { UrlService } from 'projects/sys/src-ide/app/service/diagnoseServices/url.service';
import { ToolType } from 'projects/domain';
import { MemPerfUrl } from 'sys/src-ide/url/memperf';

@Component({
    selector: 'app-task-process',
    templateUrl: './task-process.component.html',
    styleUrls: ['./task-process.component.scss'],
})
export class TaskProcessComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() tabShowing: boolean; // 用于判断当前tab的状态，为总览页面的相同svg图之间的独立做支撑
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() analysisTarget: any;
    @Input() status: any;
    @Input() functionType: any;
    @Input() id: any;
    @Input() nodeid: any;
    @Input() displayType: any;
    @Input() operation: any;
    @Input() panelId: any;
    @Input() taskDetail: any;
    @Input() missNoImmediately: boolean;
    @Input() ownerId: string;

    public statusText: any;
    public i18n: any;
    public taskInfoInterval: any;
    public isImmediateAnal = false;
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    private url: any;
    public projectNames = '';
    public toolType: ToolType;
    public ToolType = ToolType;
    constructor(
        public i18nService: I18nService,
        private urlService: UrlService,
        public Axios: AxiosService,
        public vscodeService: VscodeService,
        private route: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef) {
        this.i18n = this.i18nService.I18n();

        this.toolType = sessionStorage.getItem('toolType') as ToolType;
    }
    /**
     * 销毁方法
     */
    ngOnDestroy() {
        if (this.taskInfoInterval) {
            clearInterval(this.taskInfoInterval);
            this.taskInfoInterval = null;
        }
    }
    /**
     * 初始化方法
     */
    ngOnInit() {
        if (this.taskDetail?.isCreateDiagnoseTask) {  // 调优助手优化建议创建的诊断分析任务
            this.url = MemPerfUrl;
        } else {
            this.url = this.urlService.Url();
        }
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.route.queryParams.subscribe((data) => {
            if (this.displayType !== 'nodeProcessDisplay' && data.sendMessage) {
                let response = data.sendMessage.replace(/#/g, ':');
                response = JSON.parse(response);
                if (response.operation === 'immediateAnal') {
                    this.isImmediateAnal = true;
                    const params = response.params;
                    this.displayType = 'nodeProcessDisplay';
                    this.id = params.selfInfo.id;
                    this.projectName = params.projectName;
                    this.taskName = params.taskName;
                    this.panelId = params.panelId;
                    this.analysisType = params.selfInfo['analysis-type'];
                    this.status = params.selfInfo.nodeList[0].sampleStatus;
                    this.nodeid = params.selfInfo.nodeList[0].nodeId;

                    this.getTaskInfo();
                    this.taskInfoInterval = setInterval(() => { this.getTaskInfo(); }, 3000);
                }
            } else if (data.operation === 'createCompareTask') {
                this.statusText = this.getTaskStatus(this.status);
                if (this.displayType === 'nodeProcessDisplay') {
                    this.getCompareList();
                    this.taskInfoInterval = setInterval(() => { this.getCompareList(); }, 3000);
                }
            } else {
                this.statusText = this.getTaskStatus(this.status);
                if (this.displayType === 'nodeProcessDisplay') {
                    this.getTaskInfo();
                    this.taskInfoInterval = setInterval(() => { this.getTaskInfo(); }, 3000);
                }
            }
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 组件视图初始化完之后
     */
    ngAfterViewInit() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    /**
     * 获取对比分析任务列表信息
     */
    private getCompareList() {
        const option = {
            url: '/data-comparison/compare-reports/',
        };
        this.vscodeService.get(option, (res: any) => {
            res.data.forEach((task: { id: any; status: string }) => {
                if (task.id === this.id && task.status === 'succeed') {
                    this.displayType = 'dataDisplay';
                    this.status = task.status;
                }
            });
        });
    }

    /**
     * 获取任务信息
     */
    public async getTaskInfo() {
        await this.getProjerctName();
        this.projectName = this.projectName.replace(/:/g, '#');
        let taskUrl: string;
        switch (this.analysisType) {
            case 'memory_diagnostic':
                taskUrl = '/memory-tasks/task-summary/';
                break;
            case 'netio_diagnostic':
            case 'storageio_diagnostic':
                taskUrl = '/diagnostic-tasks/task-summary/';
                break;
            default:
                taskUrl = '/tasks/task-summary/';
                break;
        }
        const url = this.analysisType === 'task_contrast'
            ? `/tasks/task-summary/?analysis-type=task_contrast&project-name=${encodeURIComponent(this.projectNames)}`
            : `${taskUrl}?analysis-type=all&project-name=${encodeURIComponent(this.projectName)}`;
        const option = {
            url: url.concat('&auto-flag=on&page=1&per-page=1000/'),
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status) {
                this.vscodeService.showInfoBox(data.message, 'error');
                return;
            }
            let list: any = [];
            if (this.analysisType === 'task_contrast') {
                const proList = data.data.filter((item: any) => {
                    return item.projectname === this.projectName;
                });
                list = proList[0].tasklist;
            } else {
                list = data.data[0].tasklist;
            }
            if (list.length > 0) {
                const task = list.find((item: any) => item.id === this.id);
                if (task) {
                    let nodeTask: any = [];
                    if (this.analysisType === 'task_contrast') {
                        nodeTask = task;
                        nodeTask.sampleStatus = nodeTask['task-status'];
                        nodeTask.taskParam = nodeTask.task_param || {};
                    } else {
                        nodeTask = task.nodeList.find(
                            (item: any) => item.nodeId === this.nodeid
                        );
                    }
                    if (nodeTask) {
                        if (nodeTask.sampleStatus === 'Aborted' || nodeTask.sampleStatus === 'Failed' ||
                            nodeTask.sampleStatus === 'Completed' || nodeTask.sampleStatus === 'Cancelled') {
                            let info = '';
                            if (this.operation === 'restart') {
                                info = this.i18n.mission_create.restartSuccess;
                            }
                            if (this.isImmediateAnal) {
                                info = this.i18nService.I18nReplace(this.i18n.plugins_term_task_immediateAnal_success, {
                                    0: this.taskName
                                });
                            }

                            if (nodeTask.sampleStatus === 'Cancelled') {
                                info = this.i18nService.I18nReplace(this.i18n.plugins_task_stop_success, {
                                    0: this.taskName
                                });
                            }
                            nodeTask.taskParam.taskname = nodeTask.taskParam.taskname
                                ? nodeTask.taskParam.taskname : task.taskname;
                            // hypertuner逻辑
                            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                                const opt = {
                                    page: 'createTask',
                                    isopen: nodeTask.sampleStatus === 'Aborted' ? false : true,
                                    projectName: this.projectName,
                                    task: nodeTask,
                                };
                                if (nodeTask.sampleStatus !== 'Aborted') {
                                    if (this.taskInfoInterval) {
                                        clearInterval(this.taskInfoInterval);
                                        this.taskInfoInterval = null;
                                    }
                                }
                                this.vscodeService.closePage(opt);
                            } else { // vscode逻辑
                                const isShowReport = (nodeTask.sampleStatus === 'Completed'
                                    || nodeTask.sampleStatus === 'Failed'
                                    || nodeTask.sampleStatus === 'Cancelled') ? true : false;
                                const messageData = {
                                    isShowReport,
                                    projectName: this.projectName,
                                    task: nodeTask,
                                    closePanel: this.panelId.replace(/:/g, '#'),
                                    type: 'info',
                                    info,
                                    toolType: sessionStorage.getItem('toolType'),
                                    ownerId: this.ownerId,
                                };
                                if (this.taskDetail?.fromTuningTabId) {
                                    // 更新调优助手优化建议详情页
                                    Object.assign(messageData, { fromTuningTabId: this.taskDetail.fromTuningTabId });
                                }
                                this.vscodeService.postMessage({
                                    cmd: 'updateTree',
                                    data: messageData,
                                }, null);
                                if (this.analysisType === 'task_contrast' && isShowReport) {
                                    this.displayType = 'dataDisplay';
                                }
                            }
                        } else if (nodeTask.sampleStatus === 'Created') {
                            // hypertuner逻辑
                            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                                const opt = {
                                    page: 'createTask',
                                    isopen: false
                                };
                                this.vscodeService.closePage(opt);
                            } else {
                                this.vscodeService.postMessage({
                                    cmd: 'updateTree',
                                    data: {
                                        isShowReport: false,
                                        projectName: this.projectName,
                                        task: nodeTask,
                                        type: 'info',
                                    }
                                }, null);
                            }
                        } else {
                            this.statusText = this.getTaskStatus(nodeTask.sampleStatus);
                            this.status = nodeTask.sampleStatus;
                        }
                    }
                }
            }
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * 获取联动分析信息
     */
    public getProjerctName() {
        const projerctName: any = [];
        const option = {
            url: `/projects/?auto-flag=on&analysis-type=task_contrast`
        };
        return new Promise((resolve) => {
            this.vscodeService.get(option, (res: any) => {
                if (res.data.projects && res.data.projects.length > 0) {
                    res.data.projects.forEach((item: { projectName: any; }) => {
                        projerctName.push(item.projectName);
                    });
                }
                this.projectNames = projerctName.join(',');
                resolve(projerctName.join(','));
            });
        });

    }
    /**
     * 获取任务状态对应的中文名
     */
    public getTaskStatus(status: any) {
        let statusMessage = '';
        switch (status) {
            case 'Created':
                statusMessage = this.i18n.status_Created;
                break;
            case 'Waiting':
                statusMessage = this.i18n.status_Waiting + '...';
                break;
            case 'Sampling':
                statusMessage = this.i18n.status_Sampling + '...';
                break;
            case 'comparing':
                statusMessage = this.i18n.status_Sampling + '...';
                break;
            case 'Analyzing':
                statusMessage = this.i18n.status_Analyzing + '...';
                break;
            case 'Running':
                statusMessage = this.i18n.status_Analyzing + '...';
                break;
            case 'Stopping':
                statusMessage = this.i18n.status_Stopping + '...';
                break;
            case 'Aborted':
                statusMessage = this.i18n.status_Aborted;
                break;
            case 'Failed':
                statusMessage = this.i18n.status_Failed;
                break;
            case 'Completed':
                statusMessage = this.i18n.status_Completed;
                break;
            case 'succeed':
                statusMessage = this.i18n.status_Completed;
                break;
            case 'on':
                statusMessage = this.i18n.status_Online;
                break;
            case 'off':
                statusMessage = this.i18n.status_Offline;
                break;
            case 'Cancelled':
                statusMessage = this.i18n.status_Cancelled;
                break;
            case 'Cancelling':
                statusMessage = this.i18n.status_Cancelling + '...';
                break;
            default:
                statusMessage = '';
        }
        return statusMessage;
    }

    /**
     * src-com提示弹框
     * @params info
     */
    public showInfoBox(info: any) {
        if (info.type) {
            this.vscodeService.showInfoBox(info.msg, info.type);
        } else {
            this.vscodeService.postMessage(info.msg, info.type);
        }
    }
}
