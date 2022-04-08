import { Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { TaskListInterfaceService } from 'projects/sys/src-web/app/service/task-list-interface.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss']
})
export class FileDownloadComponent implements OnInit, OnDestroy {
  @Input() taskId: any;

  @Output() private sendDeleteMessage = new EventEmitter();

  @ViewChild('downloadTaskModal') downloadTaskModal: any;

  public i18n: any;
  public isPolling = false; // 是否轮询
  public timer: any; // 轮询列表数据的定时器
  public taskInfo: any;
  public steps: any = [];  // 导出任务 - 打包任务
  public math = Math;
  public preExit = false; // 任务列表点击删除该项，但是任务还未完成，暂时隐藏该任务，子组件运行结束之后再通知父组件关闭该项
  public exited = false;
  public exportSucceeded = false; // 是否导出成功
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(public taskListInterface: TaskListInterfaceService, private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();

    this.steps = [
      { prop: 'export', text: this.i18n.project.exportTask, status: 'waiting' },
      { prop: 'package', text: this.i18n.project.packageTask, status: 'waiting' },
    ];
  }

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    this.endPolling();
  }

  // 开始轮询
  public startPolling() {
    this.isPolling = true;
    this.updateSteps();
  }

  // 结束轮询
  public endPolling() {
    this.isPolling = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * 轮询更新状态
   */
  private updateSteps() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    this.taskListInterface.getTaskList({ taskId: this.taskId }).then((res: any) => {
      this.taskInfo = res.data;
      this.updateExportStatus();
      this.updatePackageStatus();
    }).catch(e => {

    }).finally(() => {
      if (this.isPolling) {
        this.timer = setTimeout(() => this.updateSteps(), 3000);
      }
    });
  }

  /**
   * 更新导出状态
   */
  private updateExportStatus() {
    const exportStep = this.steps.find((step: any) => step.prop === 'export');
    const processStatusIndex = this.taskListInterface.exportStepsList.indexOf(this.taskInfo.process_status);

    if (processStatusIndex === -1) {  // 导出任务
      exportStep.text = this.i18n.project.exportTask;
      exportStep.status = 'waiting';
    } else if (processStatusIndex === 0) {  // 待导出
      const pre_export = this.taskListInterface.statusList.pre_export;
      exportStep.text = pre_export.text;
      exportStep.status = pre_export.status;
    } else if (processStatusIndex === 1) {  // 导出任务启动失败
      const export_start_fail = this.taskListInterface.statusList.export_start_fail;
      exportStep.text = export_start_fail.text;
      exportStep.status = export_start_fail.status;
      this.exit('failed');
    } else if (processStatusIndex === 2) {  // 导出数据
      const exporting = this.taskListInterface.statusList.exporting;
      exportStep.text = exporting.text;
      exportStep.status = exporting.status;
    } else if (processStatusIndex === 3) {  // 导出数据失败
      const malluma_export_fail = this.taskListInterface.statusList.malluma_export_fail;
      exportStep.text = malluma_export_fail.text;
      exportStep.status = malluma_export_fail.status;
      this.exit('failed');
    } else if (processStatusIndex > 3) {  // 导出数据成功
      exportStep.text = this.i18n.project.exportDataSucceeded;
      exportStep.status = 'succeeded';
    }
  }

  /**
   * 更新打包状态
   */
  private updatePackageStatus() {
    const packageStep = this.steps.find((step: any) => step.prop === 'package');
    const processStatusIndex = this.taskListInterface.exportStepsList.indexOf(this.taskInfo.process_status);

    if (processStatusIndex < 4) { // 打包任务
      packageStep.text = this.i18n.project.packageTask;
      packageStep.status = 'waiting';
    } else if (processStatusIndex === 4) {  // 打包中
      const packaging = this.taskListInterface.statusList.packaging;
      packageStep.text = packaging.text;
      packageStep.status = packaging.status;
    } else if (processStatusIndex === 5) {  // 打包失败
      const package_fail = this.taskListInterface.statusList.package_fail;
      packageStep.text = package_fail.text;
      packageStep.status = package_fail.status;
      this.exit('failed');
    } else if (processStatusIndex > 5) {  // 导出成功
      const export_success = this.taskListInterface.statusList.export_success;
      packageStep.text = this.i18n.project.exportSucceeded;
      packageStep.status = export_success.status;
      this.exit('succeeded');
    }
  }

  /**
   * 预删除任务
   */
  public preDeleteTask() {
    if (this.exited) {
      this.deleteTask();
    } else {
      this.preExit = true;
    }
  }

  /**
   * 导出成功或失败
   * @param status 成功| 失败
   */
  private exit(status: 'succeeded' | 'failed') {
    this.endPolling();
    this.exited = true;
    this.exportSucceeded = status === 'succeeded';
    if (this.preExit) {
      this.deleteTask();
    }
  }

  /**
   * 通知任务列表界面关闭改任务，触发于以下情景
   *  1、任务列表界面点击删除该任务，但是该任务还在运行中，运行完成之后再通知任务列表界面可以删除该任务
   *  2、任务列表界面点击删除该任务，该任务已经运行完毕，通知任务列表界面可以删除该任务
   */
  private deleteTask() {
    this.sendDeleteMessage.emit();
  }

  /**
   * handle operate
   * @param operate 操作
   */
  public handleOperate(operate: any) {
    const params: any = {
        projectname: this.taskInfo.projectname,
        taskname: this.taskInfo.taskname,
        id: this.taskId,
    };
    if (this.isDiagnose){
        params.analysisType = 'memory_diagnostic';
    }
    if (operate === 'retry') {  // 重试
      this.taskListInterface.createExportTask(params).then(() => {
        this.startPolling();
      });
    } else if (operate === 'download') {  // 下载任务
      this.downloadTaskModal.open(this.taskInfo, this.i18n.project.downloadTask);
    }
  }
}
