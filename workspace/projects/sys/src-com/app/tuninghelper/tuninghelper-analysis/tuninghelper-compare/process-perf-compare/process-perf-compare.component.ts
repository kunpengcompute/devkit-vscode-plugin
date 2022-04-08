import { Component, OnInit } from '@angular/core';
import { TiTableComponent, TiTreeNode } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService, WebviewPanelService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../service/tuninghelper-status.service';

@Component({
  selector: 'app-process-perf-compare',
  templateUrl: './process-perf-compare.component.html',
  styleUrls: ['./process-perf-compare.component.scss'],
})
export class ProcessPerfCompareComponent implements OnInit {

  public hasAllProcessInfoData = false;
  public hasAppProcessInfoData = false;
  public showAppProcess = true;
  public appProcessInfoData: Array<any>;
  public allProcessInfoData: Array<any>;

  constructor(
    private panelService: WebviewPanelService,
    private http: HttpService,
    private statusService: TuninghelperStatusService,
  ) {
    this.getProcessDetailInfo();
  }

  ngOnInit(): void {
  }

  /**
   * 获取进程线程详细指标信息
   */
  private getProcessDetailInfo() {
    const processParams = {
      id: this.statusService.taskId
    };
    this.http.get(`/data-comparison/process-performance-comparison/`, {
      params: processParams,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data) {
        this.allProcessInfoData = resp.data;
        this.hasAllProcessInfoData = true;
      }
    }).catch((error: any) => {});
    this.http.get(`/data-comparison/process-performance-comparison-app/`, {
      params: processParams,
    }).then((resp: any) => {
      if (resp.code === STATUS_CODE.SUCCESS && resp.data) {
        this.appProcessInfoData = resp.data;
        this.hasAppProcessInfoData = true;
      }
    }).catch((error: any) => {});
  }

  /**
   * 查看指令详细信息
   * @param data 指令信息
   */
  public lookCommandDetail(data: any) {
    this.panelService.addPanel({
      viewType: 'TuninghelperCompareProcessCommandDetail',
      title: `${I18n.tuninghelper.taskDetail.comparisonResult}-${data.original}`,
      id: `TuninghelperCompareProcessCommandDetail-${data.original}-${this.statusService.taskId}`,
      router: 'tuninghelperCompareProcessPidDetail',
      message: {
        taskId: this.statusService.taskId,
        command: data.cmdline
      }
    });
  }

}
