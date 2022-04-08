import { Component, OnInit, Input, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { GetTreeService } from '../../../service/get-tree.service';
import { Subscription } from 'rxjs';
import { TaskStatus } from 'sys/src-com/app/domain';
import { TuningSysMessageService, TuningSysMessageType } from 'sys/model/service';
import { CreateCompareSub } from 'sys/src-com/app/tuninghelper/compare-create/compare-create.component';
import { MemPerfUrl } from 'sys/src-web/url/memperf';
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
  @Input() status: any;
  @Input() functionType: any;
  @Input() taskId: any;
  @Input() nodeid: any;
  @Input() displayType: any;
  @Input() taskDetail: any;
  @Input() deletingProject = false;
  @Input() ownerId: string;

  @Output() closeTab = new EventEmitter();

  public statusText: any;
  public i18n: any;
  public taskInfoInterval: any;
  public analyzID: string;
  private url: any;
  private linkageTaskInfoSub: Subscription;
  private createCompareSub: Subscription;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public userGuide: UserGuideService,
    private urlService: UrlService,
    public getTreeService: GetTreeService,
    private tuningSysMessageService: TuningSysMessageService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  ngOnDestroy(): void {
    if (this.taskInfoInterval) {
      clearInterval(this.taskInfoInterval);
    }
    this.linkageTaskInfoSub?.unsubscribe();
    this.createCompareSub?.unsubscribe();
  }

  ngOnInit() {
    if (this.taskDetail?.isCreateDiagnoseTask) {  // 调优助手优化建议创建的诊断分析任务
      this.url = MemPerfUrl;
    } else {
      this.url = this.urlService.Url();
    }
    this.statusText = this.getTaskStatus(this.status);
    if (this.displayType === 'nodeProcessDisplay') {
      this.getTaskInfo();
      if (!this.taskInfoInterval
        && this.analysisType !== 'task_contrast' && this.analysisType !== 'tuninghelperCompare') {
        this.taskInfoInterval = setInterval(() => {
          this.getTaskInfo();
        }, 3000);
      }
    }

    this.analyzID = this.Axios.generateConversationId(8);
  }
  ngAfterViewInit() {
    // user-guide
    const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
    if (flogin === '0') {
      setTimeout(() => {
        this.userGuide.showMask('user-guide-run');
      }, 500);
    }
    if (this.analysisType === 'task_contrast') {
      this.linkageTaskInfoSub
        = this.getTreeService.linkageTaskInfo.asObservable().subscribe((val) => {
          if (val['task-status'] !== 'Completed') {
            this.displayType = 'nodeProcessDisplay';
            this.status = val['task-status'];
            this.statusText = this.getTaskStatus(val['task-status']);
          } else {
            this.displayType = 'dataDisplay';
            this.status = val['task-status'];
            clearInterval(this.taskInfoInterval);
          }
        });
    }
    if (this.analysisType === 'tuninghelperCompare') {
      this.status = 'comparing';
      this.createCompareSub
        = CreateCompareSub.subscribe((val) => {
          if (val.newTag) { return; }
          if (val.status !== 'succeed') {
            this.status = val.status;
            this.statusText = this.getTaskStatus(val.status);
          } else {
            this.displayType = 'dataDisplay';
            this.status = val.status;
          }
        });
    }
  }

  public getTaskInfo(): any {
    if (this.deletingProject) {
      return false;
    }
    if (this.analysisType !== 'task_contrast' && this.analysisType !== 'tuninghelperCompare') {
      this.Axios.axios.get(
        this.url.task + '?analysis-type=all&project-name=' +
        encodeURIComponent(this.projectName) +
        '&auto-flag=on' +
        '&page=1' +
        '&per-page=1000'
      )
        .then((res: any) => {
          if (res.data[0]?.tasklist?.length > 0) {
            const list = res.data[0].tasklist;
            const task = list.find((item: any) => item.id === this.taskId);
            if (task) {
              const nodeTask = task.nodeList.find(
                (item: any) => item.nodeId === this.nodeid
              );
              if (nodeTask) {
                if (
                  nodeTask.sampleStatus === 'Aborted' ||
                  nodeTask.sampleStatus === 'Failed' ||
                  nodeTask.sampleStatus === 'Completed' ||
                  nodeTask.sampleStatus === 'Cancelled'
                ) {
                  clearInterval(this.taskInfoInterval);
                  if (nodeTask.sampleStatus === TaskStatus.Cancelled && this.analysisType === 'optimization') {
                    this.viewTuningHelperInfoAndLog(nodeTask, task);
                  } else {
                    this.displayType = 'dataDisplay';
                    this.status = nodeTask.sampleStatus;
                  }

                  if (this.taskDetail?.fromTuningTabId) {
                    // 更新调优助手优化建议详情页
                    const message = {
                      type: TuningSysMessageType.UpdateOptimization,
                      data: {
                        tabPanelId: this.taskDetail.fromTuningTabId
                      }
                    };
                    this.tuningSysMessageService.sendMessage(message);
                  }
                } else {
                  this.statusText = this.getTaskStatus(nodeTask.sampleStatus);
                  this.status = nodeTask.sampleStatus;
                }
              }
            }
          }
        });
    }
  }
  public getTaskStatus(status: any) {

    // 获取任务状态对应的中文名
    let statusMessage = '';
    switch (status) {
      case 'Created':
        statusMessage = this.i18n.status_Created_init;
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
   * 调优助手取消任务-打开基本信息和日志界面
   * @param nodeTask 节点信息
   * @param task 任务信息
   */
  public viewTuningHelperInfoAndLog(nodeTask: any, task: any) {
    this.closeTab.emit({
      title: this.taskName,
      id: this.taskId,
      nodeid: this.nodeid,
      taskId: this.taskId,
      taskType: 'tuninghelperInfoLog',
      status: nodeTask.sampleStatus,
      projectName: this.projectName,
      ownerId: this.ownerId,
      taskDetail: {
        taskId: this.taskId,
        nodeId: this.nodeid,
        sampleStatus: nodeTask.sampleStatus,
        task: {
          parentNode: {
            projectName: this.projectName
          },
          taskname: task.taskname
        }
      }
    });
  }
}
