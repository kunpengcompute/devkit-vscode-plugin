import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService, HttpService } from '../../../service';
import { GetTreeService } from '../service/get-tree.service';
import { MessageModalService } from '../../../service/message-modal.service';
import { LinkageManageService } from './service/linkage-manage.service';
import { LinkageTaskInfo } from './domain';

@Component({
  selector: 'app-linkage-manage',
  templateUrl: './linkage-manage.component.html',
  styleUrls: ['./linkage-manage.component.scss']
})
export class LinkageManageComponent implements OnInit, OnDestroy {
  @Output() operateTask = new EventEmitter();
  @Output() selectTask = new EventEmitter();
  i18n: any;
  public status = 'abnormal';
  public projerctName: any[];
  public taskList: LinkageTaskInfo[] = [];
  public createLinkageTask: Subscription;
  public createTaskId: number;
  updateTaskListInterval: NodeJS.Timeout;

  constructor(
    public Axios: AxiosService,
    public http: HttpService,
    public timessage: MessageModalService,
    public getTreeService: GetTreeService,
    public mytip: MytipService,
    public i18nService: I18nService,
    private linkServe: LinkageManageService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.getProjerctName();
    this.createLinkageTask = this.getTreeService.createLinkageTask.subscribe((val) => {
      if (val.status === 'success') {
        this.getProjerctName();
        this.createTaskId = val.taskId;
      }
    });
    if (!this.updateTaskListInterval) {
      this.updateTaskListInterval = setInterval(() => {
        this.getProjerctName();
      }, 5000);
    }
  }

  ngOnDestroy() {
    this.createLinkageTask.unsubscribe();
    clearInterval(this.updateTaskListInterval);
  }
  // 获取工程名
  public async getProjerctName() {

    const resp = await this.Axios.axios.get(
      `/projects/?auto-flag=on&analysis-type=task_contrast`,
      { headers: { showLoading: false } }
    );

    this.projerctName
      = (resp.data.projects ?? []).map((item: { projectName: any; }) => item.projectName);

    if (this.projerctName.length < 1) { return; }

    const projectList = await this.linkServe.pullLinkageProjectData(this.projerctName);
    const taskList = this.linkServe.transLinkageTaskList(projectList);

    // 任务列表按时逆序排序
    this.taskList = taskList.sort((a, b) => {
      return b.createTime.getTime() - a.createTime.getTime();
    });

    this.taskList.forEach(task => {
      if (task.id === this.createTaskId) {
        this.getTreeService.linkageTaskInfo.next(task.taskInfo);
      }
    });
  }

  // 新建任务
  public addLinkageTask(): void {
    this.operateTask.emit({
      type: 'addLinkage',
      task: 'linkagetask',
      scenes: '',
    });
  }
  // 删除任务
  public onTaskDelete(item: LinkageTaskInfo) {
    this.timessage.open({
      type: 'warn',
      modalClass: 'project-del',
      title: this.i18n.common_term_delete_title_analysis,
      content: this.i18n.common_term_delete_content_analysis,
      okButton: {
        primary: false,
        autofocus: false,
      },
      cancelButton: {
        primary: true,
        autofocus: true,
      },
      close: () => {
        this.Axios.axios.delete(`/tasks/${item.id}/`).then((res: any) => {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.delete_ok,
            time: 3500,
          });
          this.getProjerctName();
          this.taskList = this.taskList.filter(task => item.id !== task.id);
          this.operateTask.emit({
            type: 'deleteTask',
            task: 'linkagetask',
            payload: item.id
          });
        });
      },
    });
  }
  // 打开任务详情页
  public onTaskDetailsOpen(item: LinkageTaskInfo) {
    this.selectTask.emit(item.taskInfo);
  }

  trackByFn(index: number, task: LinkageTaskInfo) {
    return task.id;
  }
}

