import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @ViewChild('body') bodyComponent: any;

  public i18n: any;
  private subscription: any;
  public taskList: any = [];
  public showTaskListBox = false;
  public bodyShow = true;

  constructor(
    private i18nService: I18nService,
    private msgService: MessageService,
    private mytip: MytipService,
    public Axios: AxiosService,
    public router: Router,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.subscription = this.msgService.getMessage().subscribe((msg) => {
      if (msg.type === 'uploadFile') {  // 导入任务
        const taskInfo = {
          taskType: msg.type,
          fileInfoList: msg.fileInfoList,
          taskId: msg.taskId,
          projectName: msg.projectName,
          taskName: msg.taskName,
        };
        this.addTask(taskInfo, msg.taskId);
      } else if (msg.type === 'downloadFile') { // 导出任务
        const taskInfo = {
          taskType: msg.type,
          taskId: msg.taskId,
          projectName: msg.projectName,
          taskName: msg.taskName,
        };
        this.addTask(taskInfo, msg.taskId);
      }
    });
  }

  /**
   * 更新不是hidden的task列表
   */
  private updateShowTaskList() {
    this.showTaskListBox = !!this.taskList.filter((task: any) => !task.hidden).length;
  }

  /**
   * 添加任务
   * @param taskInfo 任务信息
   * @param taskId 任务id
   */
  public addTask(taskInfo: any, taskId: number) {
    if (!this.taskList.find((taskItem: any) => taskItem.taskId === taskId)) {
      this.taskList.unshift(taskInfo);
      this.updateShowTaskList();
    }
    this.bodyShow = true;
  }

  /**
   * 预删除任务【可能任务还在执行中，这回只是取消显示，最终子组件运行完成之后再通知关闭】
   * @param taskId 任务id
   */
  public preDeleteTask(taskId: any) {
    const task = this.taskList.find((item: any) => item.taskId === taskId);
    task.hidden = true;
    this.updateShowTaskList();

    if (['uploadFile', 'downloadFile'].includes(task.taskType)) {
      if (this.router.url.indexOf('importAndExportTaskList') < 0) {
        this.mytip.alertInfo({
          type: 'tip',
          content: this.i18n.project.closeImportOrExportTaskTip,
          time: 3500,
        });
      }
    }
  }

  /**
   * 从任务列表中删除某一项
   * @param taskId 任务id
   */
  public deleteTask(taskId: any) {
    const taskIndex = this.taskList.findIndex((task: any) => task.taskId === taskId);
    this.taskList.splice(taskIndex, 1);
    this.updateShowTaskList();
  }
}
