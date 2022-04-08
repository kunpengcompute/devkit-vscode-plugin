import { Component, OnInit } from '@angular/core';
import { AnalysisTarget } from 'sys/src-com/app/domain';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService, WebviewPanelService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';

@Component({
  selector: 'app-process-perf-data-detail',
  templateUrl: './process-perf-data-detail.component.html',
  styleUrls: ['./process-perf-data-detail.component.scss']
})
export class ProcessPerfDataDetailComponent implements OnInit {

  public taskData: any;
  public showAppProcess = false;
  public appProcessInfoData: Array<any>;
  public allProcessInfoData: Array<any>;
  public tableData: CommonTableData;
  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
    private panelService: WebviewPanelService,
  ) { }

  /**
   * 初始化
   */
  ngOnInit() {
    this.getTaskConfig();
  }

  /**
   * 获取任务配置基本信息
   */
  private getTaskConfig() {
    const params = { 'node-id': this.statusService.nodeId };
    this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/common/configuration/`, {
      params,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS) {
        this.taskData = resp.data.nodeConfig[0];
        // 分析类型为系统-获取所有进程信息、分析类型为应用额外获取被分析应用/进程信息
        if (this.taskData.task_param.analysisTarget === AnalysisTarget.PROFILE_SYSTEM) {
          this.getProcessDetailInfo('sys');
        } else {
          this.showAppProcess = true;
          this.getProcessDetailInfo('sys');
          this.getProcessDetailInfo('app');
        }
      }
    }).catch((error: any) => {
    });
  }

  /**
   * 获取进程线程详细指标信息
   * @param type sys(获取所有进程信息) app(获取被分析的应用/进程信息)
   */
  private getProcessDetailInfo(type: any) {
    const processParams = {
      'node-id': this.statusService.nodeId,
      type
    };
    this.http.get(`/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/process-performance/`, {
      params: processParams,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data.optimization && resp.data.optimization.data) {
        if (type === 'sys') {
          this.setAllProcessTableData(resp.data.optimization.data);
        } else if (type === 'app') {
          this.setAppProcessTableData(resp.data.optimization.data);
        }
      }
    }).catch((error: any) => {});
  }

  /**
   * 设置所有进程表格信息
   */
  private setAllProcessTableData(data: any) {
    this.allProcessInfoData = data.system_indicator_information || [];
  }

  /**
   * 设置被分析的应用/进程表格信息
   */
  private setAppProcessTableData(data: any) {
    this.appProcessInfoData = data.app_indicator_information || [];
  }

  /**
   * 查看Pid详细数据-打开一个新的页签
   * @param pidData Pid指标
   */
  public lookPidDetail(pidData: any) {
    this.panelService.addPanel({
      viewType: 'TuninghelperProcessPidDetail',
      title: `${pidData.pid}-${this.taskData.task_param.projectname}-` +
      `${this.taskData.task_param.taskname}-${this.taskData.nodeNickName}`,
      id: `TuninghelperProcessPidDetail-${pidData.id}-${this.taskData.task_param.projectname}-` +
      `${this.taskData.task_param.taskname}-${this.taskData.nodeNickName}`,
      router: 'tuninghelperProcessPidDetail',
      message: {
        nodeId: this.statusService.nodeId,
        taskId: this.statusService.taskId,
        pid: pidData.id
      }
    });
  }
}
