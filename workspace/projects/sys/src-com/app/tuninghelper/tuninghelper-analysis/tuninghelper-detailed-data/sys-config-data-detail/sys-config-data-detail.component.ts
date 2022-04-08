import { Component, OnInit } from '@angular/core';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { RespSystemConfigTitle } from './domain/resp-system-config-title.type';

@Component({
  selector: 'app-sys-config-data-detail',
  templateUrl: './sys-config-data-detail.component.html',
  styleUrls: ['./sys-config-data-detail.component.scss']
})
export class SysConfigDataDetailComponent implements OnInit {

  public summary = {
    projectName: '',
    taskName: '',
    nodeName: '',
    nodeIP: '',
    nodeForm: '',
    kernelVersion: '',
    osVersion: '',
  };
  public hasData = false;

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
  ) {
  }

  ngOnInit(): void {
    const i18nMap: any = {
      physical: I18n.tuninghelper.sysConfigDetail.physical,
      vm: I18n.tuninghelper.sysConfigDetail.vm
    };

    this.getSummaryData().then(summaryData => {
      this.hasData = true;
      this.summary = {
        projectName: summaryData.project_name,
        taskName: summaryData.task_name,
        nodeName: summaryData.node_name,
        nodeIP: summaryData.node_ip,
        nodeForm: i18nMap[summaryData.tuning_is_virutal],
        kernelVersion: summaryData.tuning_kernel_version,
        osVersion: summaryData.tuning_os_version
      };
    });
  }

  private async getSummaryData() {
    const params = {
      'node-id': this.statusService.nodeId,
    };
    const resp: RespCommon<RespSystemConfigTitle> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config-title/`,
      { params }
    );
    return resp.data;
  }

}
