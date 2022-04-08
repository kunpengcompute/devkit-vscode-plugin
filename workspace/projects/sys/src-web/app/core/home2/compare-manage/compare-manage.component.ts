import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService, HttpService } from '../../../service';
import { GetTreeService } from '../service/get-tree.service';
import { MessageModalService } from '../../../service/message-modal.service';
import { LinkageTaskInfo } from '../linkage-manage/domain';
import { ToolType } from 'projects/domain';
import { CreateCompareSub } from 'sys/src-com/app/tuninghelper/compare-create/compare-create.component';

@Component({
  selector: 'app-compare-manage',
  templateUrl: './compare-manage.component.html',
  styleUrls: ['./compare-manage.component.scss']
})
export class CompareManageComponent implements OnInit, OnDestroy {
  @Output() operateTask = new EventEmitter();
  @Output() selectTask = new EventEmitter();
  public toolType: ToolType = sessionStorage.getItem('toolType') as ToolType;
  i18n: any;
  public status = 'abnormal';
  public taskList: LinkageTaskInfo[] = [];
  public createCompareSub: Subscription;
  public createTaskId: number;
  private selectItem: LinkageTaskInfo;
  updateTaskListInterval: NodeJS.Timeout;

  constructor(
    public Axios: AxiosService,
    public http: HttpService,
    public timessage: MessageModalService,
    public getTreeService: GetTreeService,
    public mytip: MytipService,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.getProjerctName();
    this.createCompareSub = CreateCompareSub
    .subscribe((val: { status: string; taskId: number; }) => {
      if (val.status === 'success') {
          this.getProjerctName();
          this.createTaskId = val.taskId;
      }
    });
    if (!this.updateTaskListInterval) {
      this.updateTaskListInterval = setInterval(() => {
        this.getProjerctName();
      }, 10000);
    }
  }

  ngOnDestroy() {
    this.createCompareSub.unsubscribe();
    clearInterval(this.updateTaskListInterval);
  }
  // 获取工程名
  public async getProjerctName() {
    const resp = await this.Axios.axios.get('/data-comparison/compare-reports/', { headers: { showLoading: false } }
    );
    const loginId = sessionStorage.getItem('loginId');
    const isAdmin = sessionStorage.getItem('role') === 'Admin';
    const taskList
      = (resp.data ?? []).map((item: any) => {
        item.isDeletable = (String(item.owner_id) === loginId || isAdmin) && item.status !== 'comparing';
        item.taskName = item.compare_name;
        item.hilight = item.id === this.selectItem?.id ? true : false;
        return item;
      });
    if (taskList.length < 1) { return; }


    // 任务列表按时逆序排序
    this.taskList = taskList.sort((a: any, b: any) => {
      return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
    });

    this.taskList.forEach(task => {
      if (task.id === this.createTaskId) {
        CreateCompareSub.next(task);
      }
    });
  }

  // 新建任务
  public addLinkageTask(): void {
    this.operateTask.emit({
      type: 'addLinkage',
      task:  'comparetask',
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
        autofocus: false,
        primary: false,
      },
      cancelButton: {
        autofocus: true,
        primary: true,
      },
      close: () => {
        const params = { id: item.id };
        this.Axios.axios.delete(`/data-comparison/delete-report/`, {data: params}).then((res: any) => {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18n.tip_msg.delete_ok,
            time: 3500,
          });
          this.getProjerctName();
          this.taskList = this.taskList.filter(task => item.id !== task.id);
          this.operateTask.emit({
            type: 'deleteTask',
            task:  'comparetask',
            payload: item.id
          });
        });
      },
    });
  }
  // 打开任务详情页
  public onTaskDetailsOpen(item: LinkageTaskInfo) {
    this.selectItem = item;
    this.taskList.forEach((val: LinkageTaskInfo) => {
      val.hilight = val.id === this.selectItem?.id ? true : false;
    });
    this.selectTask.emit(item);
  }

  trackByFn(index: number, task: LinkageTaskInfo) {
    return task.id;
  }
}

