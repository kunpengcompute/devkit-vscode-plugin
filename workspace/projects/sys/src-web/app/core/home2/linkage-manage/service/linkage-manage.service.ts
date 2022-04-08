import { Injectable } from '@angular/core';
import { HttpService } from 'sys/src-web/app/service/http.service';
import { Cat } from 'hyper';
import { I18nService } from 'sys/src-web/app/service/i18n.service';
import {
  ApiLinkageProject, ApiLinkageTask, LinkageTaskInfo
} from '../domain';
import { TaskStatus } from 'sys/src-web/app/domain';

@Injectable({
  providedIn: 'root'
})
export class LinkageManageService {

  i18n: any;
  private comparisonTypeDict: Map<string, string>;

  constructor(
    private http: HttpService,
    public i18nService: I18nService
  ) {

    this.i18n = this.i18nService.I18n();
    this.comparisonTypeDict = new Map([
      ['vertical analysis', this.i18n.linkage.hvertical],
      ['horizontal analysis', this.i18n.linkage.horizontal]
    ]);
  }

  /**
   * 从服务端拉取联合分析的工程数据
   * @param projectNamelist 工程名称的列表
   * @returns 联合分析的工程数据
   */
  async pullLinkageProjectData(projectNamelist: string[] = [])
    : Promise<ApiLinkageProject[]> {

    const params = {
      'analysis-type': 'task_contrast',
      'project-name': projectNamelist.join(','),
      'auto-flag': 'on',
      page: 1,
      'per-page': 1000
    };
    const url = `/tasks/task-summary/`;

    const resp = await this.http.get(url,
      { headers: { showLoading: false }, params }
    );
    return resp.data;
  }

  /**
   * 将接口工程列表的书转换为任务列表的数据
   * @param projectNamelist 工程名称的列表
   * @returns 联合分析的任务列表的数据
   */
  transLinkageTaskList(linkageProjectList: ApiLinkageProject[])
    : LinkageTaskInfo[] {

    const loginId = sessionStorage.getItem('loginId');
    const isAdmin = sessionStorage.getItem('role') === 'Admin';

    const listageTaskList = linkageProjectList.reduce((acc, projList) => {
      const taskList = projList.tasklist?.map(task => {
        return {
          ...task,
          ownerid: projList.ownerid,
          projectname: projList.projectname
        };
      });
      return acc.concat(taskList ?? []);
    }, ([] as ApiLinkageTask[]));

    if (Cat.isNil(listageTaskList) || Cat.isEmpty(listageTaskList)) {
      throw new Error('linkage report list is empty');
    }

    return listageTaskList.map(task => {
      return {
        id: task.id,
        isDeletable: String(task.ownerid) === loginId || isAdmin,
        taskName: task.taskname,
        taskStatus: (task['task-status'] as TaskStatus),
        createTime: new Date(task.createtime),
        taskTip: {
          taskName: task.taskname,
          analysisType: task['analysis-target'] === 'system' ?
          this.i18n.linkage.linkagedObject : this.i18n.linkage.hotspotAnalysis,
          compareType: this.comparisonTypeDict.get(task.comparison_type)
            || '--'
        },
        projectInfo: {
          ownerid: task.ownerid,
          projectname: task.projectname,
        },
        taskInfo: task
      };
    });
  }
}
