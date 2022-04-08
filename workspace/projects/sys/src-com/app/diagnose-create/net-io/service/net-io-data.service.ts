import { Injectable, EventEmitter } from '@angular/core';
import { MessageModalService } from 'sys/src-com/app/service/message-modal.service';
import { ProjectInfo } from 'sys/src-com/app/domain';
import { HttpService, TipService, I18nService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';
import { NetioTaskInfoRaw } from '../domain';

@Injectable({
  providedIn: 'root',
})
export class NetIoDataService {
  constructor(
    private http: HttpService,
    private tiMessage: MessageModalService,
    private i18nService: I18nService,
    private mytip: TipService
  ) {}

  pullRawTaskInfo(taskId: number): Promise<{ data: NetioTaskInfoRaw }> {
    const url = `/diagnostic-tasks/${encodeURIComponent(
      taskId
    )}/configuration/?node-id=`;
    return this.http.get(url);
  }

  /**
   * 获取工程下的所有节点
   * @param projectId 工程ID
   * @returns 请求参数
   */
  pullProjectInfo(
    projectId: number
  ): Promise<{ code: string; data: ProjectInfo }> {
    const url = `/diagnostic-project/${encodeURIComponent(projectId)}/info/`;

    return this.http.get(url);
  }

  /**
   * 创建任务：普通任务和预约任务
   * @param rawData xxx
   * @param doOrder xxx
   * @param taskStartNow xxx
   * @param projectName xxx
   * @param closeTab xxx
   */
  createNewTask(
    rawData: NetioTaskInfoRaw,
    doOrder: boolean,
    taskStartNow: boolean,
    projectName: string,
    closeTab: EventEmitter<any>
  ) {
    const url = doOrder ? '/schedule-tasks/' : '/diagnostic-tasks/';
    const create = () => {
      this.http.post(url, rawData).then((resp: any) => {
        if (taskStartNow) {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18nService.I18nReplace(
              I18n.plugins_term_task_create_success,
              { 0: rawData.taskName }
            ),
            time: 3500,
          });
          // 立即启动
          this.startDataSamplingTask(
            resp.data.id,
            rawData,
            projectName,
            closeTab
          );
        } else if (doOrder) {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18nService.I18nReplace(
              I18n.plugins_term_scheduleTask_create_success,
              { 0: rawData.taskName }
            ),
            time: 3500,
          });
          // 预约任务
          closeTab.emit({});
        } else {
          this.mytip.alertInfo({
            type: 'success',
            content: this.i18nService.I18nReplace(
              I18n.plugins_term_task_create_success,
              { 0: rawData.taskName }
            ),
            time: 3500,
          });
          // 非立即启动任务
          closeTab.emit({});
        }
      });
    };
    this.tiMessage.open({
      type: 'warn',
      title: I18n.secret_title,
      content: I18n.network_diagnositic.tips.pop_content,
      close: create,
    });
  }

  editTask(
    rawData: NetioTaskInfoRaw,
    taskId: number,
    projectName: string,
    taskStartNow: boolean,
    closeTab: EventEmitter<any>
  ) {
    rawData.status = 'restarted';
    this.http.put(`/diagnostic-tasks/${encodeURIComponent(taskId)}/`, rawData).then((res: any) => {
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18nService.I18nReplace(
          I18n.plugins_term_task_modify_success,
          { 0: rawData.taskName }
        ),
        time: 3500,
      });
      if (taskStartNow) {
        // 立即执行
        this.startDataSamplingTask(res.data.id, rawData, projectName, closeTab);
      } else {
        closeTab.emit({});
      }
    });
  }

  restartTask(
    rawData: NetioTaskInfoRaw,
    taskId: number,
    projectName: string,
    closeTab: EventEmitter<any>
  ) {
    rawData.status = 'restarted';
    this.http
      .put(`/diagnostic-tasks/${encodeURIComponent(taskId)}/status/`, rawData)
      .then((res: any) => {
        if (res.code === 'SysPerf.Success') {
          const backData = res.data;
          closeTab.emit({
            title: `${rawData.taskName}-${rawData.nodeConfig[0].nodeIp}`,
            id: backData.id,
            nodeid: rawData.nodeConfig[0].nodeId,
            taskId: backData.id,
            taskType: rawData.analysisType,
            status: backData['task-status'],
            projectName,
          });
          this.mytip.alertInfo({
            type: 'info',
            content: this.i18nService.I18nReplace(
              I18n.plugins_term_task_reanalyze_success,
              { 0: rawData.taskName }
            ),
            time: 3500,
          });
        }
      });
  }

  /**
   * 修改预约任务
   * @param scheduleTaskId 预约任务ID
   * @param params 任务数据
   * @param confirmModify 确认
   */
  pushScheduleData(
    scheduleTaskId: number,
    params: NetioTaskInfoRaw,
    confirmModify: EventEmitter<any>
  ) {
    const url = '/schedule-tasks/' + encodeURIComponent(scheduleTaskId) + '/';
    this.http.put(url, params).then(() => {
      this.mytip.alertInfo({
        type: 'success',
        content: this.i18nService.I18nReplace(
          I18n.plugins_term_scheduleTask_modify_success,
          { 0: params.taskName }
        ),
        time: 3500,
      });
      confirmModify.emit('on');
    });
  }

  /**
   * 立即启动
   * @param respId 接口返回的ID
   * @param rawData 任务参数
   * @param projectName 工程名
   * @param closeTab 关闭的事件通知
   */
  private startDataSamplingTask(
    respId: number,
    rawData: NetioTaskInfoRaw,
    projectName: string,
    closeTab: EventEmitter<any>
  ) {
    const url = '/diagnostic-tasks/' + encodeURIComponent(respId) + '/status/';
    const option = { status: 'running' };
    this.http.put(url, option).then((res: any) => {
      const backData = res.data;
      closeTab.emit({
        title: `${rawData.taskName}-${rawData.nodeConfig[0].nodeIp}`,
        id: backData.id,
        nodeid: rawData.nodeConfig[0].nodeId,
        taskId: backData.id,
        taskType: rawData.analysisType,
        status: backData['task-status'],
        projectName,
      });
    });
  }
}
