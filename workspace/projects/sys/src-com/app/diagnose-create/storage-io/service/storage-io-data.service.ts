import { Injectable, EventEmitter } from '@angular/core';
import { MessageModalService } from 'sys/src-com/app/service/message-modal.service';
import { HttpService, TipService, I18nService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';
import { OrderConfig, StorageCreateForm } from '../domain';
import { BaseUtil } from '../../net-io/util/base.util';

@Injectable({
  providedIn: 'root'
})

export class StorageIoDataService {
  constructor(
    private http: HttpService,
    private tiMessage: MessageModalService,
    private i18nService: I18nService,
    private mytip: TipService
  ) { }

  /**
   * 创建任务：普通任务和预约任务
   * @param rawData xxx
   * @param doOrder xxx
   * @param taskStartNow xxx
   * @param projectName xxx
   * @param closeTab xxx
   */
  public createNewTask(
    rawData: any,
    doOrder: boolean,
    taskStartNow: boolean,
    projectName: string,
    closeTab: EventEmitter<any>,
    errorTips: EventEmitter<any>
  ) {
    const url = doOrder ? '/schedule-tasks/' : '/storage-tasks/';
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
            closeTab,
            errorTips
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
          closeTab.emit({
            title: `${rawData.taskName}-${rawData.nodeConfig[0].nodeIp}`,
            id: resp.data.id,
            nodeid: rawData.nodeConfig[0].nodeId,
            taskId: resp.data.id,
            taskType: rawData.analysisType,
            status: resp.data.taskStatus,
            projectName,
          });
        }
      }).catch((e) => {
        errorTips.emit(e.message);
      });
    };
    this.tiMessage.open({
      type: 'warn',
      title: I18n.secret_title,
      content: I18n.network_diagnositic.tips.pop_content,
      close: create,
    });
  }

  public editTask(
    rawData: any,
    taskId: number,
    projectName: string,
    taskStartNow: boolean,
    closeTab: EventEmitter<any>,
    errorTips: EventEmitter<any>
  ) {
    this.http.put(`/storage-tasks/${encodeURIComponent(taskId)}/`, rawData).then((res: any) => {
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
        this.startDataSamplingTask(res.data.id, rawData, projectName, closeTab, errorTips);
      } else {
        closeTab.emit({});
      }
    }).catch((e) => {
      errorTips.emit(e.message);
    });
  }

  public restartTask(
    rawData: any,
    taskId: number,
    projectName: string,
    closeTab: EventEmitter<any>,
    errorTips: EventEmitter<any>
  ) {
    rawData.status = 'restarted';
    this.http
      .put(`/storage-tasks/${encodeURIComponent(taskId)}/status/`, rawData)
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
      }).catch((e) => {
        errorTips.emit(e.message);
      });
  }

  /**
   * 修改预约任务
   * @param scheduleTaskId 预约任务ID
   * @param params 任务数据
   * @param confirmModify 确认
   */
  public pushScheduleData(
    scheduleTaskId: number,
    params: any,
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
    rawData: any,
    projectName: string,
    closeTab: EventEmitter<any>,
    errorTips: EventEmitter<any>
  ) {
    const url = '/storage-tasks/' + encodeURIComponent(respId) + '/status/';
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
    }).catch((e) => {
      errorTips.emit(e.message);
    });
  }

  /**
   * 将界面表单值转化为请求数据结构
   * @param formData 表单数据
   * @param projectName 工程名称
   * @param nodeConfig 压测对象
   * @param indicatorForm 关键指标
   */
  public transformReqData(
    formData: any,
    diagnosticFunc: string[],
    projectName: string,
    isChooseSysMonitor?: boolean
  ) {
    const resquestData: any = {
      // 任务名称
      taskName: formData?.taskName,
      // 工程名称
      projectName,
      // 分析对象 Profile System 默认系统
      analysisTarget: 'Profile System',
      // 诊断对象 storageio_diagnostic
      analysisType: 'storageio_diagnostic',
      // 诊断功能
      diagnosticFunc,
      // 压测对象
      nodeConfig: formData?.nodeConfig,
      // 吞吐量
      throughput: formData?.indicatorForm?.throughput,
      // iops
      iops: formData?.indicatorForm?.iops,
      // 时延
      latency: formData?.indicatorForm?.latency,
      // 关键指标
      indicatorForm: formData?.indicatorForm?.data,
      // 周期统计
      cycleOn: formData?.cycleOn,
      // 统计周期
      cyclePeriod: formData?.cyclePeriod || 500,
      // 采集文件大小（MiB）
      collectSize: formData?.collectSize,
    };
    if (isChooseSysMonitor) {
      // 采集时长
      resquestData.collectDuration = formData?.collectDuration;
      // 采样间隔
      resquestData.collectSeparation = formData?.collectSeparation;
    }
    // 预约任务参数
    if (formData?.doOrder) {
      if (formData.orderConfig?.cycle) {
        resquestData.cycle = true;
        resquestData.cycleStart = formData.orderConfig?.cycleStart || '';
        resquestData.cycleStop = formData.orderConfig?.cycleStop || '';
        resquestData.appointment = formData.orderConfig?.appointment || '';
        resquestData.targetTime = formData.orderConfig?.targetTime || '';
      } else {
        resquestData.cycle = false;
        resquestData.appointment = formData.orderConfig?.appointment || '';
        resquestData.targetTime = formData.orderConfig?.targetTime || '';
      }
    }
    return resquestData;
  }
  /**
   * 将后端返回任务信息处理成前端所需结构
   * @param resData 任务信息
   */
  public transformResData(rawData: StorageCreateForm) {
    const {
      nodeConfig,
      throughput,
      iops,
      latency,
      indicatorForm,
      collectDuration,
      collectSeparation,
      cycleOn,
      cyclePeriod,
      collectSize,
      cycle,
      appointment,
      targetTime,
      cycleStart,
      cycleStop,
    } = rawData;
    // 预约任务表单值
    const orderConfig = this.transFormOrderConfig(
      cycle,
      appointment,
      targetTime,
      cycleStart,
      cycleStop
    );
    // 是否立即执行
    const doOrder =
      Object.keys(JSON.parse(JSON.stringify(orderConfig))).length > 0;
    // 关键指标值
    const indicatorFormData = {
      throughput,
      iops,
      latency,
      data: indicatorForm
    };
    // 其他参数表单
    const formsData = {
      nodeConfig,
      indicatorForm: indicatorFormData,
      collectDuration,
      collectSeparation,
      cycleOn,
      cyclePeriod,
      collectSize,
      doOrder,
      orderConfig,
      taskStartNow: !doOrder,
    };
    return BaseUtil.nullReplacer(formsData, '');
  }

  /**
   * 获取预约任务表单参数结构
   * @param cycle 是否为周期
   * @param appointment 采集日期
   * @param targetTime 采集时间
   * @param cycleStart 周期开始时间
   * @param cycleStop 周期结束时间
   * @returns 预约任务表单数据
   */
  private transFormOrderConfig(
    cycle: boolean,
    appointment: string,
    targetTime: string,
    cycleStart: string,
    cycleStop: string
  ): OrderConfig {
    const formData = {
      cycle,
      cycleStart,
      cycleStop,
      targetTime,
      appointment,
    };
    return formData;
  }
}
