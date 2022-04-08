import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AxiosService } from '../../../service/axios.service';
import {
  NodeConfigItem, RawDataIO, SuperData, RawDataIOBase, IoFormControls,
} from '../io-domain';
import { TaskActionType, OrderConfig } from '../../domain';
import { AnalysisTarget, LaunchRunUser } from 'projects/sys/src-web/app/domain';
import { MytipService } from '../../../service/mytip.service';
import { I18nService } from '../../../service/i18n.service';
import { MessageModalService } from 'projects/sys/src-web/app/service/message-modal.service';
import { RunUserDataObj } from 'projects/sys/src-ide/app/mission-create/mission-domain';
interface RunUserData {
  runUser: boolean;
  user: string;
  password: string;
}

/**
 * @description
 * 本组件主要是为组件 MissionIoComponent 接口数据处理的服务，包括：
 * 1、将后端的数据转化，并赋值给表单控件；
 * 2、将表单控件的值，转化为后端接口所需要的数据结构。
 *
 * @publicApi setControlsByRawData 根据后端接口的数据，设置控件的值
 * @publicApi getRawDataByControls 将控件的值，转化为接口的数据
 * @publicApi requestNodeInfo 获取 接口的节点 的数据
 */
@Injectable({
  providedIn: 'root'
})
export class MissionIoDataService {
  public i18n: any;
  public runUserDataObj: LaunchRunUser = {};
  public runUserData: RunUserData;
  public analysisTarget: string;

  constructor(
    private http: AxiosService,
    private mytip: MytipService,
    private i18nService: I18nService,
    private tiMessage: MessageModalService,
  ) {
    this.i18n = i18nService.I18n();
  }

  public async pushMissionData(
    formGroup: FormGroup, superData: SuperData, analysisMode: AnalysisTarget, actionType: TaskActionType,
    sendMissionKeep: EventEmitter<any>, sendPretable: EventEmitter<any>,
    closeTab: EventEmitter<any>, runUserData: RunUserData
  ) {
    this.runUserData = runUserData;
    const params = await this.getRawDataByControls(formGroup, analysisMode, superData);
    this.analysisTarget = params.analysisTarget;
    switch (actionType) {
      case TaskActionType.CREATE:
        this.createMissionData(formGroup, superData, analysisMode, params, sendMissionKeep, sendPretable, closeTab);
        break;
      case TaskActionType.EDIT:
        this.editMissionData(formGroup, superData, analysisMode, params, sendMissionKeep, sendPretable, closeTab);
        break;
      case TaskActionType.RESTART:
        this.restartMissionData(formGroup, superData, analysisMode, params, sendMissionKeep, sendPretable, closeTab);
        break;
      default:
        console.error('创建、更新、重启错误！');
    }
  }

  public async pullMissionData(
    formGroup: FormGroup, superData: SuperData, analysisMode: AnalysisTarget, actionType: TaskActionType,
  ) {
    const rawData = await this.requestGetMissionData(analysisMode, actionType, superData.restartAndEditId);
    this.setControlsByRawData(formGroup, rawData, analysisMode);
  }

  /**
   * 获取 接口的节点 的数据
   * @param projectId 工程ID
   */
  public requestGetNodeInfo(projectId: any): Promise<NodeConfigItem[]> {
    const url = `projects/${encodeURIComponent(projectId)}/info/`;
    return new Promise<NodeConfigItem[]>((resolve, reject) => {
      const data: any = [];
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

  /**
   * 根据后端接口的数据，设置控件的值
   * @param formGroup 表单控件组
   * @param rawData 后端接口数据
   * @param analysisMode 分析模式
   */
  public async setControlsByRawData(
    formGroup: FormGroup, rawData: RawDataIO, analysisMode: AnalysisTarget,
  ) {
    const ctl: IoFormControls = formGroup.controls;

    // 设置常规控件
    ctl.size.setValue(rawData.size);
    ctl.stack.setValue(rawData.stack);
    ctl.statistical.setValue(rawData.statistical);
    ctl.duration.setValue(rawData.duration);
    // 导入模板时，未打开配置指定节点参数ctl中无doNodeConfig控件信息，无法进行setValue赋值，避免报错
    if (ctl.doNodeConfig) {
      ctl.doNodeConfig.setValue(rawData.switch);
    }

    if (ctl?.nodeList){
      ctl.nodeList.setValue(rawData.nodeConfig);
    }

    // 设置预约控件
    ctl.orderConfig.setValue({
      cycle: rawData.cycle,
      cycleStart: rawData.cycleStart,
      cycleStop: rawData.cycleStop,
      targetTime: rawData.targetTime,
      appointment: rawData.appointment,
    });
    if (rawData.cycleStart
      || rawData.cycleStop
      || rawData.appointment
      || rawData.targetTime
    ) {
      ctl.doOrder.setValue(true);
    } else {
      ctl.doOrder.setValue(false);
    }

    // 设置节点数据控件
    const nodeConfig: NodeConfigItem[] = [];
    for (const rawNode of rawData.nodeConfig) {
      let taskParam: any = {};
      switch (analysisMode) {
        case AnalysisTarget.ATTACH_TO_PROCESS:
          taskParam = JSON.parse(
            JSON.stringify(rawNode.taskParam, ['status', 'targetPid', 'process_name'])
          );
          break;
        case AnalysisTarget.LAUNCH_APPLICATION:
          taskParam = JSON.parse(
            JSON.stringify(rawNode.taskParam, ['status', 'appDir', 'app-parameters'])
          );
          break;
        default:
      }

      // FIXME
      nodeConfig.push({
        nodeId: rawNode.nodeId,
        nickName: rawNode.nodeNickName || rawNode.nickName,
        nodeIp: rawNode.nodeIp,
        nodeStatus: rawNode.nodeStatus,
        taskParam,
        runUserData: {
          runUser: false,
          user: '',
          password: ''
        }
      });
    }

    switch (analysisMode) {
      case AnalysisTarget.ATTACH_TO_PROCESS:
      case AnalysisTarget.LAUNCH_APPLICATION:
        ctl.doNodeConfig.setValue(rawData.switch);
        ctl.nodeConfig.setValue(nodeConfig);
        break;
      default:
    }
  }

  /**
   * 将控件的值，转化为接口的数据
   * @param formGroup 表单控件组
   * @param analysisMode 分析模式
   */
  public async getRawDataByControls(
    formGroup: FormGroup,
    analysisMode: AnalysisTarget,
    superdata: SuperData
  ): Promise<RawDataIO> {
    // 控件组
    const ctlTmp: any = formGroup.controls;
    const ctl: IoFormControls = ctlTmp;
    // 共有参数处理
    const baseRawData: RawDataIOBase = {
      analysisType: 'ioperformance',
      projectName: superdata.projectName,
      taskName: superdata.taskName,
      duration: ctl.duration.value,
      statistical: ctl.statistical.value,
      size: ctl.size.value,
      stack: ctl.stack.value,
    };
    if (ctl.doOrder.value) {
      const cycleConfig: OrderConfig = ctl.orderConfig.value;
      baseRawData.cycle = cycleConfig.cycle;
      baseRawData.cycleStart = cycleConfig.cycleStart || '';
      baseRawData.cycleStop = cycleConfig.cycleStop || '';
      baseRawData.targetTime = cycleConfig.targetTime || '';
      baseRawData.appointment = cycleConfig.appointment || '';
    }

    // 特有参数处理
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        baseRawData.analysisTarget = 'Profile System';
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
        baseRawData.analysisTarget = 'Launch Application';
        baseRawData.appDir = superdata.modeApplication || '';
        baseRawData['app-parameters'] = superdata.modeAppParams || '';
        break;
      case AnalysisTarget.ATTACH_TO_PROCESS:
        baseRawData.analysisTarget = 'Attach to Process';
        baseRawData.targetPid = superdata.modePid || '';
        baseRawData.process_name = superdata.modeProcess || '';
        break;
      default:
        console.error('错误： getRawDataByControls');
    }

    // 嵌套节点参数
    const nodeData = ctlTmp.nodeList.value
      ? ctlTmp.nodeList.value
      : await this.requestGetNodeInfo(superdata.projectId);
    const rawData: RawDataIO = JSON.parse(JSON.stringify(baseRawData));
    rawData.nodeConfig = [];
    nodeData.forEach((item: any) => {
      const nodeItem: any = {
        nodeId: item.id || item.nodeId,
        nickName: item.nickName || item.nodeNickName,
        taskParam: JSON.parse(JSON.stringify(baseRawData)),
      };
      nodeItem.taskParam.status = false; // 默认
      rawData.nodeConfig.push(nodeItem);
    });
    if ((ctl.nodeConfig != null)
      && Array.isArray(ctl.nodeConfig.value)
      && (ctl.nodeConfig.value.length > 1)
      && ctl.doNodeConfig.value
    ) {
      const ctlNodeConfig = ctl.nodeConfig.value as NodeConfigItem[];
      switch (analysisMode) {
        case AnalysisTarget.LAUNCH_APPLICATION:
          this.runUserDataObj = {};
          rawData.nodeConfig.forEach((nodeItem: NodeConfigItem) => {
            const ctlNode = ctlNodeConfig.find(element => element.nodeId === nodeItem.nodeId);
            nodeItem.taskParam.status = ctlNode.taskParam.status;
            nodeItem.taskParam.appDir = ctlNode.taskParam.appDir || '';
            nodeItem.taskParam['app-parameters'] = ctlNode.taskParam['app-parameters'] || '';
            this.runUserDataObj[nodeItem.nickName] = {
              runUser: ctlNode?.runUserData?.runUser || false,
              user_name: ctlNode?.runUserData?.user || this.runUserData.user || '',
              password: ctlNode?.runUserData?.password || this.runUserData.password || ''
            };
          });
          break;
        case AnalysisTarget.ATTACH_TO_PROCESS:
          rawData.nodeConfig.forEach((nodeItem: NodeConfigItem) => {
            const ctlNode = ctlNodeConfig.find(element => element.nodeId === nodeItem.nodeId);
            nodeItem.taskParam.status = ctlNode.taskParam.status;
            nodeItem.taskParam.targetPid = ctlNode.taskParam.targetPid || '';
            nodeItem.taskParam.process_name = ctlNode.taskParam.process_name || '';
          });
          break;
        default:
      }
    } else {
      this.runUserDataObj = {};
      if (analysisMode === AnalysisTarget.LAUNCH_APPLICATION) {
        rawData.nodeConfig.forEach((nodeItem: NodeConfigItem) => {
          this.runUserDataObj[nodeItem.nickName] = {
            runUser: this.runUserData?.runUser || false,
            user_name: this.runUserData?.user || '',
            password: this.runUserData?.password || ''
          };
        });
      }
    }

    // 外层默认参数(是否配置节点的标志)
    switch (analysisMode) {
      case AnalysisTarget.PROFILE_SYSTEM:
        rawData.switch = false;
        break;
      case AnalysisTarget.LAUNCH_APPLICATION:
      case AnalysisTarget.ATTACH_TO_PROCESS:
        rawData.switch = !!ctl?.doNodeConfig?.value;
        break;
      default:
    }
    return rawData;
  }

  // 立即启动
  private startDataSamplingTask(closeTab: EventEmitter<any>, params: RawDataIO, id: string) {
    const option: any = { status: 'running' };
    if (this.analysisTarget === 'Launch Application') {
      option.user_message = this.dealRunUserDataObj(this.runUserDataObj);
    }
    this.http.axios.get(
      '/res-status/?type=disk_space&project-name=' +
      encodeURIComponent(params.projectName) +
      '&task-name=' +
      encodeURIComponent(params.taskName)
    )
      .then(() => {
        this.http.axios
          .put('/tasks/' + id + '/status/', option)
          .then((res: any) => {
            const backData = res.data;
            closeTab.emit({
              title: `${params.taskName}-${params.nodeConfig[0].nickName}`,
              id: backData.id,
              nodeid: params.nodeConfig[0].nodeId,
              taskId: backData.id,
              taskType: params.analysisType,
              status: backData['task-status'],
              projectName: params.projectName
            });
          });
      });
  }

  private dealRunUserDataObj(obj: LaunchRunUser) {
    const runUserDataObj: RunUserDataObj = {};
    Object.keys(obj).map((key: string) => {
      if (obj[key].runUser) {
        runUserDataObj[key] = {
          user_name: obj[key].user_name,
          password: obj[key].password,
        };
      } else {
        runUserDataObj[key] = {
          user_name: 'launcher',
          password: '',
        };
      }
    });
    return runUserDataObj;
  }
  private createMissionData(
    formGroup: FormGroup, superData: SuperData, analysisMode: AnalysisTarget, params: RawDataIO,
    sendMissionKeep: EventEmitter<any>, sendPretable: EventEmitter<any>, closeTab: EventEmitter<any>
  ) {

    const ctlTmp: any = formGroup.controls;
    const ctl: IoFormControls = ctlTmp;
    const self = this;
    if (ctl.doOrder.value) {
      this.http.axios.post('/schedule-tasks/', params).then(() => {
        this.mytip.alertInfo({
          type: 'success',
          content: this.i18n.tip_msg.create_ok,
          time: 3500,
        });

        sendPretable.emit('on');
        closeTab.emit({});
        this.clear();
      }).catch((error: any) => {
        console.error('新建预约任务失败', error);
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
          if (ctl.taskStartNow.value) { // 立即执行
            self.startDataSamplingTask(closeTab, params, data.id);
          } else {
            closeTab.emit({
              title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
              id: data.id,
              nodeid: params.nodeConfig[0].nodeId,
              taskId: data.id,
              taskType: data.analysisType,
              status: data['task-status'],
              projectName: superData.projectName
            });
          }
          self.clear();
        }).catch((error: any) => {
          console.error('error', error);
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

  private editMissionData(
    formGroup: FormGroup, superData: SuperData, analysisMode: AnalysisTarget, params: RawDataIO,
    sendMissionKeep: EventEmitter<any>, sendPretable: EventEmitter<any>, closeTab: EventEmitter<any>
  ) {
    const ctlTmp: any = formGroup.controls;
    const ctl: IoFormControls = ctlTmp;
    const self = this;

    // 预约任务
    this.http.axios.put(`/tasks/${superData.restartAndEditId}/`, params).then((res: any) => {
      const data = res.data;

      this.mytip.alertInfo({
        type: 'info',
        content: self.i18n.tip_msg.edite_ok,
        time: 3500,
      });
      // 关闭页签
      if (ctl.taskStartNow.value) { // 立即执行
        this.startDataSamplingTask(closeTab, params, data.id);
      } else {
        closeTab.emit({
          title: `${data.taskname || data.taskName}-${params.nodeConfig[0].nickName}`,
          id: data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: data.id,
          taskType: data.analysisType,
          status: data['task-status'],
          projectName: params.projectName
        });
      }
      this.clear();
    }).catch((error: any) => {
      console.error('修改任务失败', error);
    });
  }

  private restartMissionData(
    formGroup: FormGroup, superData: SuperData, analysisMode: AnalysisTarget, params: RawDataIO,
    sendMissionKeep: EventEmitter<any>, sendPretable: EventEmitter<any>, closeTab: EventEmitter<any>
  ) {

    const ctlTmp: any = formGroup.controls;
    const ctl: IoFormControls = ctlTmp;
    const self = this;
    if (this.analysisTarget === 'Launch Application') {
      params.user_message = this.dealRunUserDataObj(this.runUserDataObj);
    }
    params.status = 'restarted';
    this.http.axios.put(`/tasks/${superData.restartAndEditId}/status/`, params)
      .then((res: any) => {
        const data = res.data;
        closeTab.emit({
          title: `${superData.taskName}-${params.nodeConfig[0].nickName}`,
          id: data.id,
          nodeid: params.nodeConfig[0].nodeId,
          taskId: data.id,
          taskType: params.analysisType,
          status: data['task-status'],
          projectName: superData.projectName
        });
        this.mytip.alertInfo({ type: 'info', content: this.i18n.mission_create.restartSuccess, time: 3500 });

        this.clear();
      }).catch((error: any) => {
        console.error('重启任务失败', error);
      });
  }

  private requestGetMissionData(analysisMode: AnalysisTarget, actionType: TaskActionType, restartAndEditId: string):
    Promise<RawDataIO> {
    const url = '/tasks/' + encodeURIComponent(restartAndEditId) + '/common/configuration/?node-id' + '&analysis-type='
      + encodeURIComponent(analysisMode);
    return new Promise<RawDataIO>((resolve, reject) => {
      this.http.axios.get(url)
        .then((res: any) => {
          resolve(res.data);
        })
        .catch((err: any) => {
          console.error('获取任务数据失败', err);
        });
    });
  }

  private clear() { }
}
