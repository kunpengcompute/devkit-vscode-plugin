// 查看任务弹框
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';

@Component({
  selector: 'app-view-task-modal',
  templateUrl: './view-task-modal.component.html',
  styleUrls: ['./view-task-modal.component.scss']
})
export class ViewTaskModalComponent implements OnInit {
  @ViewChild('importTaskModel') importTaskModel: any;

  public i18n: any;

  constructor(
    public i18nService: I18nService,
    private tiMessage: MessageModalService,
    public router: Router,
    public msgService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
  }

  /**
   * 查看任务
   * @param taskInfo 任务信息
   * @param modalTitle 弹框标题
   */
  public open(taskInfo: any, modalTitle: any) {
    return new Promise<void>((resolve, reject) => {
      if (taskInfo.is_delete) { // 任务已被删除，重试导入
        this.tiMessage.open({
          type: 'warn',
          title: modalTitle,
          content: this.i18n.project.viewDeletedTaskTip,
          close: () => {
            this.importTaskModel.openByRetry(
              taskInfo.file_path,
              taskInfo.id,
              taskInfo.projectname,
              taskInfo.taskname
            ).then((res: any) => {
              resolve(res);
            }).catch((e: any) => {
              reject(e);
            });
          },
        });
      } else {
        try {
          this.router.navigate(['/home']);
          setTimeout(() => {
            this.msgService.sendMessage({
              type: 'showTaskDetail',
              projectId: taskInfo.project_id,
              taskId: taskInfo.task_id,
            });
          }, 0);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  }
}
