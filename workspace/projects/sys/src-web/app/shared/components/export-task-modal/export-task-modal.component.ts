// 导出任务子组件
import { Component, OnInit, ViewChild,  } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { TiModalService, TiValidators, TiModalRef } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TaskListInterfaceService } from 'projects/sys/src-web/app/service/task-list-interface.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import * as hardUrl from 'sys/src-com/assets/hard-coding/url.json';
import { ToolType } from 'projects/domain';
import { SysLocale } from 'sys/locale/sys-locale';
import { SysLocaleLang } from 'sys/locale';

@Component({
  selector: 'app-export-task-modal',
  templateUrl: './export-task-modal.component.html',
  styleUrls: ['./export-task-modal.component.scss']
})
export class ExportTaskModalComponent implements OnInit {
  @ViewChild('exportTaskModalComponent') exportTaskModalComponent: any;

  public i18n: any;
  public userInfo = {
    role: '',
    id: '',
  };
  public exportTaskModal: any;
  public exportTaskForm: any = {
    projectName: {  // 工程名称
      label: '',
      required: true,
      noDataText: '',
      placeholder: '',
      list: [],
    },
    taskName: { // 任务名称
      label: '',
      required: true,
      noDataText: '',
      placeholder: '',
      list: [],
    },
  };
  private url: any;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(
    public i18nService: I18nService,
    private taskListInterface: TaskListInterfaceService,
    private tiModal: TiModalService,
    private Axios: AxiosService,
    public timessage: MessageModalService,
    private urlService: UrlService
  ) {
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.exportTaskForm.projectName.label = this.i18n.project.selectProject;
    this.exportTaskForm.projectName.noDataText = this.i18n.common_term_task_nodata;
    this.exportTaskForm.projectName.placeholder =  this.i18n.project.selectProjectPlaceholder;
    this.exportTaskForm.taskName.label = this.i18n.project.selectTask;
    this.exportTaskForm.taskName.noDataText = this.i18n.common_term_task_nodata;
    this.exportTaskForm.taskName.placeholder = this.i18n.project.selectTaskPlaceholder;
  }

  ngOnInit() {
    this.userInfo.id = sessionStorage.getItem('loginId');
    this.userInfo.role = sessionStorage.getItem('role');
  }

  /**
   * 导出任务
   */
  public open() {
    this.exportTaskForm.projectName.noDataText = this.i18n.process.obtainingTheCmdline;

    this.getProjectList().then((res: any) => {
      this.exportTaskForm.projectName.noDataText = this.i18n.common_term_task_nodata;
      const projectList: any = [];
      res.data.projects.forEach((item: any) => {
        if ((this.userInfo.role === 'Admin' || item.ownerId === this.userInfo.id) && !item.is_import) {
          projectList.push({
            label: item.projectName,
            value: item.projectId,
          });
        }
      });
      this.exportTaskForm.projectName.list = projectList;
    });

    const formGroup = new FormBuilder().group({
      projectName: new FormControl(null, TiValidators.required),
      taskName: new FormControl(null, TiValidators.required),
    });

    this.exportTaskModal = this.tiModal.open(this.exportTaskModalComponent, {
      id: 'exportTaskModal', // 定义id防止同一页面出现多个相同弹框
      modalClass: 'custemModal',
      context: {
        formGroup,
        interfacing: false, // 调用接口中需要禁用掉按钮，防止点两次
        projectNameChange: (projectInfo: any) => { // 获取工程详情
          if (projectInfo) {
            this.exportTaskForm.taskName.noDataText = this.i18n.process.obtainingTheCmdline;

            this.getProjectListInfo(projectInfo.label).then((res: any) => {
              this.exportTaskForm.taskName.noDataText = this.i18n.common_term_task_nodata;
              this.exportTaskForm.taskName.list = res.data.find((item: any) => {
                return item.projectname === projectInfo.label;
              }).tasklist.filter((item: any) => {
                return item['task-status'] === 'Completed';
              }).map((taskInfo: any) => {
                return {
                  label: taskInfo.taskname,
                  value: taskInfo.id,
                };
              });
            });
          }
        },
        confirm: (context: any) => {  // 点击确定
          const lang = SysLocale.getLocale();
          const guideUrl = SysLocaleLang.ZH_CN === lang
                         ? hardUrl.exportTaskUserGuideUrl
                         : hardUrl.exportTaskUserGuideUrlEn;

          this.timessage.open({ // 二次确认
            modalClass: 'custemMessage prompt',
            type: 'prompt',
            title: this.i18n.importAndExportTask.ensureExport.title,
            content: this.i18n.importAndExportTask.ensureExport.tip.replace(
              this.i18n.importAndExportTask.ensureExport.tipALink,
              `<a href="${ guideUrl }" target="_blank">
                ${ this.i18n.importAndExportTask.ensureExport.tipALink }
              </a>`
            ),
            okButton: {
              text: this.i18n.importAndExportTask.ensureExport.confirmText,
            },
            close: (messageRef: TiModalRef): void => {
              const value = context.formGroup.value;
              const params: any = {
                projectname: value.projectName.label,
                taskname: value.taskName.label,
              };
              if (this.isDiagnose){
                params.analysisType = 'memory_diagnostic';
               }
              this.taskListInterface.createExportTask(params).then((res: any) => {
                context.dismiss();
              });
            },
          });
        },
      },
    });
  }

  /**
   * 用重试的方式打开
   * @param taskId 任务id
   * @param projectname 工程名
   * @param taskname 任务名
   */
  public openByRetry(taskId: any, projectname: any, taskname: any) {
    return new Promise((resolve, reject) => {
      this.taskListInterface.createExportTask({
        projectname,
        taskname,
        id: taskId,
      }).then((res: any) => {
        resolve(res);
      }).catch(e => {
        reject(e);
      });
    });
  }

  /**
   * 获取工程列表
   * @param auto 是否计入超时退出功能
   */
  public getProjectList(auto = 'off') {
    return new Promise((resolve, reject) => {
      const params = {
        'auto-flag': auto,
        date: Date.now(),
      };

      this.Axios.axios.get(`${this.url.project}`, { params }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 获取工程详情
   * @param projectName 工程名称
   */
  public getProjectListInfo(projectName: any) {
    return new Promise((resolve, reject) => {
      const params = {
        'analysis-type': 'all',
        'project-name': projectName,
        'auto-flag': 'on',
        page: 1,
        'per-page': 1000,
      };

      this.Axios.axios.get(`${this.url.toolTask}task-summary/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }
}
