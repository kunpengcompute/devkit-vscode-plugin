import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TiTableColumns, TiTableComponent, TiTableRowData } from '@cloud/tiny3';
import { TaskListInterfaceService } from 'projects/sys/src-web/app/service';
import { MytipService } from 'projects/sys/src-web/app/service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';

@Component({
  selector: 'app-import-and-export-task-list',
  templateUrl: './import-and-export-task-list.component.html',
  styleUrls: ['./import-and-export-task-list.component.scss']
})
export class ImportAndExportTaskListComponent implements OnInit, OnDestroy {
  // 下载任务
  @ViewChild('downloadTaskModal') downloadTaskModal: any;
  // 查看任务
  @ViewChild('viewTaskModal') viewTaskModal: any;
  // 导入任务
  @ViewChild('importTaskModel') importTaskModel: any;
  // 导出任务
  @ViewChild('exportTaskModel') exportTaskModel: any;

  public i18n: any;
  public language = 'en';
  public isPolling = false; // 是否轮询
  public timer: any; // 轮询列表数据的定时器
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
  public operateTypes: any = {}; // 类型列表
  public isLoading: any = false;
  constructor(
    public i18nService: I18nService,
    private tiMessage: MessageModalService,
    public taskListInterface: TaskListInterfaceService,
    public mytip: MytipService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.language = sessionStorage.getItem('language') === 'en-us' ? 'en' : 'zh';

    this.table.columns = [
      { label: this.i18n.common_term_task_name, prop: 'taskname' },
      { label: this.i18n.common_term_projiect_name, prop: 'projectname' },
      { label: this.i18n.ddr_summury.type, prop: 'operation_type' },
      { label: this.i18n.node.status, prop: 'process_status' },
      { label: this.i18n.project.details, prop: 'detail_info' },
      { label: this.i18n.operationLog.size, prop: 'task_filesize' },
      { label: this.i18n.sys_res.startTime, prop: 'start_time' },
      { label: this.i18n.project.endTime, prop: 'end_time' },
      { label: this.i18n.common_term_operate, prop: 'operateList', width: this.language === 'en' ? '133px' : '86px' },
    ];

    this.operateTypes = {
      import: this.i18n.project.importTask,
      export: this.i18n.project.exportTask,
    };
  }

  ngOnInit() {
    this.userInfo.id = +sessionStorage.getItem('loginId');
    this.userInfo.role = sessionStorage.getItem('role');
    this.startPolling();
  }

  ngOnDestroy() {
    this.endPolling();
  }

  // 开始轮询
  public startPolling() {
    this.isPolling = true;
    this.updateTaskList(true);
  }

  // 结束轮询
  public endPolling() {
    this.isPolling = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private updateTaskList(showLoading: any) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (showLoading) {
      this.isLoading = true;
    }
    this.taskListInterface.getTaskList({
      pageNo: this.table.pageNo,
      pageSize: this.table.pageSize.size,
      autoFlag: 'on',
    }).then((res: any) => {
      this.isLoading = false;
      if (Array.isArray(res.data.taskList)) {
        this.table.srcData.data = res.data.taskList.map((taksItem: any) => {
          const status: any = this.taskListInterface.statusList[taksItem.process_status] || {};
          return {
            ...taksItem,
            taskId: taksItem.id,
            status,
            size: taksItem.task_filesize && this.taskListInterface.formatFileSizeUnit(taksItem.task_filesize, 'B'),
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
      this.isLoading = false;
    }).finally(() => {
      this.isLoading = false;
      if (this.isPolling) {
        this.timer = setTimeout(() => this.updateTaskList(false), 3000);
      }
    });
  }

  public stateUpdate(tiTable: TiTableComponent): void {
    this.updateTaskList(true);
  }

  /**
   * handle operate
   * @param row 行数据
   * @param operate 操作
   */
  public handleOperate(row: any, operate: any) {
    if (operate.disabled || (this.userInfo.role !== 'Admin' && this.userInfo.id !== row.ownerId)) { return; }
    operate.disabled = true;

    if (row.operation_type === 'export') {  // 导出任务
      if (operate.type === 'downloadTask') {  // 下载任务
        this.downloadTaskModal.open(row, operate.text).finally(() => operate.disabled = false);
      } else if (operate.type === 'retry') {  // 重试
        this.exportTaskModel.openByRetry(row.id, row.projectname, row.taskname).finally(() => {
          operate.disabled = false;
          this.updateTaskList(true);
        });
      } else if (operate.type === 'delete') { // 删除
        this.tiMessage.open({
          type: 'warn',
          title: this.i18n.project.deleteTaskTipTitle,
          modalClass: 'delete-list',
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
            this.taskListInterface.deleteTsk(row.taskId).then(res => {
              operate.disabled = false;
              this.updateTaskList(true);
              this.mytip.alertInfo({
                type: 'success',
                content: this.i18n.tip_msg.delete_ok,
                time: 3500,
              });
            });
          },
        });
      }
    } else if (row.operation_type === 'import') { // 导入任务
      if (operate.type === 'viewTask') { // 查看任务
        this.taskListInterface.getTaskList({ taskId: row.taskId }).then((res: any) => {
          this.viewTaskModal.open(res.data, this.i18n.project.viewTask);
        }).catch(e => {});
      } else if (operate.type === 'retry') {  // 重试
        this.importTaskModel.openByRetry(row.file_path, row.id, row.projectname, row.taskname).finally(() => {
          operate.disabled = false;
          this.updateTaskList(true);
        });
      } else if (operate.type === 'delete') {  // 删除
        this.tiMessage.open({
          type: 'warn',
          title: this.i18n.project.deleteTaskTipTitle,
          modalClass: 'delete-list',
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
            this.taskListInterface.deleteTsk(row.taskId).then(res => {
              operate.disabled = false;
              this.updateTaskList(true);
              this.mytip.alertInfo({
                type: 'success',
                content: this.i18n.tip_msg.delete_ok,
                time: 3500,
              });
            });
          },
        });
      }
    }
  }
}
