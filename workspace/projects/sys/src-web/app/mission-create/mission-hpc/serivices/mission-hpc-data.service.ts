import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { TaskActionType, INodeInfo } from '../../domain';
import { AnalysisTarget } from 'projects/sys/src-web/app/domain';
import { IHpcSendTaskInfo } from '../domain';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';

@Injectable({
  providedIn: 'root'
})
export class MissionHpcDataService {

  private i18n: any;
  public runUserDataObj: {
    [key: string]: {
      user_name: string,
      password: string
    }
  } = {};
  public analysisTarget: string;

  constructor(
    private http: AxiosService,
    private mytip: MytipService,
    private i18nService: I18nService,
    private tiMessage: MessageModalService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  pushData(
    actionType: TaskActionType, formGroup: FormGroup, params: IHpcSendTaskInfo,
    projactInfo: { name: string, id: number }, sendPretable: EventEmitter<any>,
    closeTab: EventEmitter<any>, restartAndEditId: number,
    runUserDataObj: { [key: string]: { user_name: string, password: string } }
  ) {
    this.analysisTarget = params['analysis-target'];
    this.runUserDataObj = runUserDataObj;
    switch (actionType) {
      case TaskActionType.CREATE:
        this.create(formGroup, params, projactInfo, sendPretable, closeTab);
        break;
      case TaskActionType.EDIT:
        this.edit(formGroup, params, restartAndEditId, closeTab);
        break;
      case TaskActionType.RESTART:
        this.restart(params, restartAndEditId, closeTab);
        break;
      default:
        throw new Error('创建、更新、重启错误！');
    }
  }

  pushScheduleData(
    scheduleTaskId: number, params: IHpcSendTaskInfo, confirmModify: EventEmitter<any>
  ) {
    this.http.axios.put('/schedule-tasks/' + encodeURIComponent(scheduleTaskId) + '/', params)
      .then(() => {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.edite_ok,
          time: 3500,
        });
        confirmModify.emit('on');
      });
  }

  pullData(analysisMode: AnalysisTarget, restartAndEditId: number): Promise<any> {
    const params = {
      'node-id': '',
      'analysis-type': analysisMode,
    };
    const url = '/tasks/' + encodeURIComponent(restartAndEditId) + '/common/configuration/';
    return new Promise<any>((resolve, reject) => {
      this.http.axios.get(url, { params })
        .then((res: any) => {
          resolve(res.data);
        });
    });
  }

  pullNodeInfo(projectId: number): Promise<INodeInfo[]> {
    const url = `projects/${encodeURIComponent(projectId)}/info/`;
    return new Promise<INodeInfo[]>((resolve, reject) => {
      const data: INodeInfo[] = [];
      this.http.axios.get(url).then((res: any) => {
        res.data.nodeList.forEach((item: any) => {
          data.push({
            nodeId: item.id,
            nickName: item.nickName,
            nodeIp: item.nodeIp, // 节点IP
            nodeStatus: item.nodeStatus,
            taskParam: {
              status: false,
            },
          });
        });
        resolve(data);
      });
    });
  }

  private create(
    fGroup: FormGroup, params: IHpcSendTaskInfo, projactInfo: { name: string, id: number },
    sendPretable: EventEmitter<any>, closeTab: EventEmitter<any>,
  ) {
    const self = this;
    if (fGroup.get('doOrder').value) {
      this.http.axios.post('/schedule-tasks/', params).then(() => {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.create_ok,
          time: 3500,
        });
        sendPretable.emit('on');
        closeTab.emit({});
      });
    } else {
      const postFunc = () => {
        // 判断是否打开指定运行用户
        const keyList = Object.keys(self.runUserDataObj);
        keyList.forEach((key) => {
          if (self.runUserDataObj[key].user_name && self.runUserDataObj[key].password) {
            params.is_user = true;
          }
        });
        this.http.axios.post('/tasks/', params).then((res: any) => {
          const data = res.data;
          self.mytip.alertInfo({
            type: 'success',
            content: self.i18n.tip_msg.create_ok,
            time: 3500,
          });

          // 关闭页签
          if (fGroup.get('taskStartNow').value) { // 立即执行
            self.startSample(closeTab, params, data.id);
          } else {
            closeTab.emit({
              title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
              id: data.id,
              nodeid: params.nodeConfig[0].nodeId,
              taskId: data.id,
              taskType: data.analysisType,
              status: data['task-status'],
              projectName: projactInfo.name,
            });
          }
        });
      };

      this.tiMessage.open({
        type: 'warn',
        title: this.i18n.secret_title,
        content: this.i18n.secret_count,
        close: postFunc,
      });
    }
  }

  private edit(
    formGroup: FormGroup, params: IHpcSendTaskInfo, restartAndEditId: number,
    closeTab: EventEmitter<any>,
  ) {
    const self = this;

    // 预约任务
    this.http.axios.put(`/tasks/${encodeURIComponent(restartAndEditId)}/`, params)
      .then((res: any) => {
        const backData: { id: number, 'task-status': string, [key: string]: any } = res.data;
        this.mytip.alertInfo({
          type: 'info',
          content: self.i18n.tip_msg.edite_ok,
          time: 3500,
        });
        // 关闭页签
        if (formGroup.get('taskStartNow').value) {
          this.startSample(closeTab, params, backData.id);
        } else {
          closeTab.emit({
            title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
            id: backData.id,
            nodeid: params.nodeConfig[0].nodeId,
            taskId: backData.id,
            taskType: params['analysis-type'],
            status: backData['task-status'],
            projectName: params.projectname,
          });
        }
      });
  }

  private restart(
    params: IHpcSendTaskInfo, restartAndEditId: number, closeTab: EventEmitter<any>
  ) {
    if (this.analysisTarget === 'Launch Application') {
      params.user_message = this.runUserDataObj;
    }
    params.status = 'restarted';
    this.http.axios.put(`/tasks/${encodeURIComponent(restartAndEditId)}/status/`, params)
      .then((res: any) => {
        const backData: { id: number, 'task-status': string } = res.data;

        closeTab.emit({
          title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
          id: backData.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: backData.id,
          taskType: params['analysis-type'],
          status: backData['task-status'],
          projectName: params.projectname,
        });
        this.mytip.alertInfo({ type: 'info', content: this.i18n.mission_create.restartSuccess, time: 3500 });
      });
  }

  // 立即启动
  private startSample(closeTab: EventEmitter<any>, param: any, id: number) {
    const option: any = { status: 'running' };
    if (this.analysisTarget === 'Launch Application') {
      option.user_message = this.runUserDataObj;
    }
    this.http.axios.get('/res-status/', {
      params: {
        type: 'disk_space',
        'project-name': encodeURIComponent(param.projectname),
        'task-name': encodeURIComponent(param.taskname),
      }
    }).then(() => {
      this.http.axios
        .put('/tasks/' + id + '/status/', option)
        .then((res: any) => {
          const backData = res.data;
          closeTab.emit({
            title: `${param.taskname}-${param.nodeConfig[0].nickName}`,
            id: backData.id,
            nodeid: param.nodeConfig[0].nodeId,
            taskId: backData.id,
            taskType: param['analysis-type'],
            status: backData['task-status'],
            projectName: param.projectname
          });
        });
    });
  }
}
