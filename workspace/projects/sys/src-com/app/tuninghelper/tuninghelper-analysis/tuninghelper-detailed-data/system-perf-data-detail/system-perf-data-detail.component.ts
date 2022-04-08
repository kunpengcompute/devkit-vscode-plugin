import { Component, Input, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { STATUS_CODE } from 'sys/src-com/app/global/constant';
import { HttpService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';

@Component({
  selector: 'app-system-perf-data-detail',
  templateUrl: './system-perf-data-detail.component.html',
  styleUrls: ['./system-perf-data-detail.component.scss']
})
export class SystemPerfDataDetailComponent implements OnInit {
  @Input() taskDetail: any;
  public tabs: any;
  public taskData: any;
  constructor(
    public statusService: TuninghelperStatusService,
    private http: HttpService,
  ) { }
  ngOnInit(): void {
    this.tabs = {
      cpu: {
        title: 'CPU',
        active: true,
        disable: true,
      },
      memory: {
        title: I18n.tuninghelper.detailedData.sysperf_memory,
        active: false,
        disable: true,
      },
      storage: {
        title: I18n.tuninghelper.detailedData.sysperf_Storage,
        active: false,
        disable: true,
      },
      network: {
        title: I18n.tuninghelper.detailedData.sysperf_network,
        active: false,
        disable: false,
      }
    };
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
      }
    }).catch((error: any) => {
    });
  }
}
