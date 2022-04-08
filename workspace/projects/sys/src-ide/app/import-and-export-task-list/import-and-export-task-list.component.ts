import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TaskListInterfaceService } from '../import-and-export-task-list/service/task-list-interface.service';
import { I18nService } from '../service/i18n.service';
import { Router } from '@angular/router';
import { VscodeService } from '../service/vscode.service';
import { TiModalService, TiModalRef } from '@cloud/tiny3';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { MessageModalService } from 'projects/sys/src-ide/app/service/message-modal.service';
@Component({
    selector: 'app-import-and-export-task-list',
    templateUrl: './import-and-export-task-list.component.html',
    styleUrls: ['./import-and-export-task-list.component.scss']
})
export class ImportAndExportTaskListComponent implements OnInit, OnDestroy {

    @ViewChild('retryImportModalTemp', { static: false }) retryImportModalTemp: any;
    private retryImportModal: TiModalRef;

    public i18n: any;
    public language = 'en';
    public image = {
      dark: './assets/img/projects/dark-noproject.png',
      light: './assets/img/projects/light-noproject.png',
  };
    public userInfo: any = {
        role: '',
        id: undefined,
    };
    public table: any = {  // 任务列表
        displayed: ([] as Array<TiTableRowData>),
        srcData: {
            data: [],
            state: {
                searched: true, // 源数据未进行搜索处理
                sorted: true, // 源数据未进行排序处理
                paginated: true // 源数据未进行分页处理
            }
        },
        columns: ([] as Array<TiTableColumns>),
        pageNo: 1,
        pageSize: {
            options: [10, 20, 40, 80, 100],
            size: 20
        },
        total: 0,
    };
    public operateTypes = {}; // 类型列表
    public updateTaskInterval: any;

    public isShowProjectError = false;
    public projectNameVerifyMsg = '';
    public isShowTaskError = false;
    public taskNameVerifyMsg = '';
    public toolType = sessionStorage.getItem('toolType');
    constructor(
        public i18nService: I18nService,
        private tiMessage: MessageModalService,
        public router: Router,
        public vscodeService: VscodeService,
        public taskListInterface: TaskListInterfaceService,
        private tiModal: TiModalService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.language = I18nService.getLang() === 0 ? 'zh' : 'en';

        this.table.columns = [
            { label: this.i18n.common_term_task_name, prop: 'taskname' },
            { label: this.i18n.common_term_projiect_name, prop: 'projectname' },
            { label: this.i18n.plugins_sysperf_title_ddrSummury.type, prop: 'operation_type' },
            { label: this.i18n.node.status, prop: 'process_status' },
            { label: this.i18n.project.details, prop: 'detail_info' },
            { label: this.i18n.operationLog.size, prop: 'task_filesize' },
            { label: this.i18n.sys_res.startTime, prop: 'start_time' },
            { label: this.i18n.project.endTime, prop: 'end_time' },
            {
                label: this.i18n.common_term_operate,
                prop: 'operateList',
                width: this.language === 'en' ? '133px' : '86px'
            },
        ];

        this.operateTypes = {
            import: this.i18n.project.importTask,
            export: this.i18n.project.exportTask,
        };
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.userInfo.id = +(self as any).webviewSession.getItem('loginId');
        this.userInfo.role = (self as any).webviewSession.getItem('role');

        this.updateTaskList();
        this.updateTaskInterval = setInterval(() => {
            this.updateTaskList();
        }, 6000);
    }

    /**
     * 组件销毁后的操作
     */
    ngOnDestroy() {
        if (this.updateTaskInterval) {
            clearInterval(this.updateTaskInterval);
        }
    }

    /**
     * 更新导入导出列表
     */
    private updateTaskList() {
        this.taskListInterface.getTaskList({
            pageNo: this.table.pageNo,
            pageSize: this.table.pageSize.size,
            autoFlag: 'on',
        }).then((res: any) => {
            if (Array.isArray(res.data.taskList)) {
                this.table.srcData.data = res.data.taskList.map((taksItem: any) => {
                    const status: any = this.taskListInterface.statusList[taksItem.process_status] || {};
                    return {
                        ...taksItem,
                        taskId: taksItem.id,
                        status,
                        size: taksItem.task_filesize
                            && this.taskListInterface.formatFileSizeUnit(taksItem.task_filesize, 'B'),
                        operateList: status.operateList.map((operate: any) => {
                            const operateConfig = this.taskListInterface.operates[operate] || {};
                            return {
                                type: operate,
                                width: operateConfig[`width_${this.language}`],
                                text: operateConfig.text || '--',
                                disabled: false,
                            };
                        }),
                    };
                });
                this.table.total = res.data.totalCounts;
            }
        }).catch(e => {
            this.vscodeService.showInfoBox(e.message ? e.message : 'error', 'error');
        });
    }

    /**
     * 准备更新
     */
    public stateUpdate(): void {
        this.updateTaskList();
    }

    /**
     * 准备更新
     */
    public handleTime(timeStr: string) {
        return timeStr.replace(/-/g, '/');
    }

    /**
     * 导入导出列表各项操作
     * @param row 行数据
     * @param operate 操作
     */
    public handleOperate(row: any, operate: any) {
        if (operate.disabled || (this.userInfo.role !== 'Admin' && this.userInfo.id !== row.ownerId)) { return; }
        operate.disabled = true;
        if (row.operation_type === 'export') {  // 导出任务
            if (operate.type === 'downloadTask') {  // 下载任务
                const data = {
                    filesNum: row.file_section_qty,
                    filename: row.file_name,
                    taskId: row.id,
                };
                const message = {
                    cmd: 'downloadFileTask',
                    data,
                };
                this.vscodeService.postMessage(message, null);
            } else if (operate.type === 'retry') {  // 重试
                const params = {
                    projectname: row.projectname,
                    taskname: row.taskname,
                    taskId: row.id,
                };
                const message = {
                    cmd: 'exportFileTask',
                    data: {
                        operate: 'retry',
                        params,
                    }
                };
                this.vscodeService.postMessage(message, null);
            } else if (operate.type === 'delete') { // 删除
                this.tiMessage.open({
                    type: 'warn',
                    title: operate.text,
                    content: this.i18n.project.deleteTaskTip,
                    okButton: {
                        primary: false,
                        autofocus: false
                    },
                    cancelButton: {
                        primary: true,
                        autofocus: true
                    },
                    close: () => {
                        this.taskListInterface.deleteTsk(row.taskId, this.userInfo.id).then(res => {
                            operate.disabled = false;
                            this.updateTaskList();
                        });
                    },
                });
            }
        } else if (row.operation_type === 'import') { // 导入任务
            if (operate.type === 'retry') {  // 重试
                this.showRetryImportTaskModal(row);
            } else if (operate.type === 'viewTask') { // 查看任务
                if (!row.is_delete) {
                    const message = {
                        cmd: 'openSomeNode',
                        data: {
                            projectName: row.projectname,
                            projectId: row.project_id,
                            taskId: row.task_id,
                            taskName: row.taskname,
                            toolType: this.toolType,
                        }
                    };
                    this.vscodeService.postMessage(message, null);
                } else {
                    this.showTaskDeletedMessage(row);
                }
            } else if (operate.type === 'delete') {  // 删除
                this.tiMessage.open({
                    type: 'warn',
                    title: operate.text,
                    content: this.i18n.project.deleteTaskTip,
                    okButton: {
                        primary: false,
                        autofocus: false
                    },
                    cancelButton: {
                        primary: true,
                        autofocus: true
                    },
                    close: () => {
                        this.taskListInterface.deleteTsk(row.taskId, this.userInfo.id).then(res => {
                            operate.disabled = false;
                            this.updateTaskList();
                        });
                    },
                });
            }
        }
    }

    /**
     * 显示工程已被删除的提示信息
     *
     * @param taskInfo 任务信息
     */
    public showTaskDeletedMessage(taskInfo: any) {
        this.tiMessage.open({
            type: 'warn',
            title: this.i18n.project.viewTask,
            content: this.i18n.project.viewDeletedTaskTip,
            close: () => {
                // 重新导入任务
                this.showRetryImportTaskModal(taskInfo);
            },
        });
    }

    private showRetryImportTaskModal(taskInfo: any) {
        this.retryImportModal = this.tiModal.open(this.retryImportModalTemp, {
            id: 'retry-import-modal',
            closeIcon: false,
            draggable: false,
            context: taskInfo
        });
    }

    /**
     * 发送消息给vscode
     */
    public retryImportTask(row: any) {
        const tempFile = {
            filePath: '',
            fileName: row.task,
            fileSize: ''
        };
        const templist = [];
        templist.push(tempFile);
        const params = {
            uploadPath: '',
            projectname: row.projectname,
            taskname: row.taskname,
            fileList: templist,
            taskId: row.id,
        };
        const message = {
            cmd: 'importFileTask',
            data: {
                operate: 'retry',
                params,
            }
        };
        this.vscodeService.postMessage(message, null);
        this.retryImportModal.close();
    }

    /**
     * 工程名称校验
     */
     public priojectNameChange(projectName: string) {
        projectName = projectName.trim();
        const reg = new RegExp(/^[\w\@\#\$\%\^\&\*\(\)\[\]\<\>\.\-\!\~\+\s]{1,32}$/);
        if (projectName && !reg.test(projectName)) {
            this.isShowProjectError = true;
            this.projectNameVerifyMsg = this.i18n.common_term_projiect_name_tip;
        } else {
            this.isShowProjectError = false;
            this.projectNameVerifyMsg = '';
        }
    }

    /**
     * 任务名称校验
     */
     public taskNameChange(taskName: string) {
        taskName = taskName.trim();
        const reg = new RegExp('[a-zA-Z0-9@#$%^&*()\\[\\]<>._\\-!~+ ]{1,32}$');
        if (taskName && !reg.test(taskName)) {
            this.isShowTaskError = true;
            this.taskNameVerifyMsg = this.i18n.validata.task_name_rule;
        } else {
            this.isShowTaskError = false;
            this.taskNameVerifyMsg = '';
        }
    }
}
