import { Component, Input, OnInit } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import {
  PerfDataService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-detailed-data/server/perf-data.service';
@Component({
  selector: 'app-tuninghelper-detailed-data',
  templateUrl: './tuninghelper-detailed-data.component.html',
  styleUrls: ['./tuninghelper-detailed-data.component.scss'],
  providers: [
    { provide: TuninghelperStatusService },
  ]
})
export class TuninghelperDetailedDataComponent implements OnInit {
  @Input() currentTool: boolean;
  @Input() taskDetail: {
    nodeid: number;
    showDetailType: string;
    taskId: number;
  };

  public showDetailType = '';

  constructor(
    private statusService: TuninghelperStatusService,
    private perfDataService: PerfDataService,
    private http: HttpService,
  ) { }

  ngOnInit(): void {
    this.statusService.nodeId = this.taskDetail.nodeid;
    this.statusService.taskId = this.taskDetail.taskId;
    this.showDetailType = this.taskDetail.showDetailType;
    this.getNumaNum().then(res => {
      const data = res.optimization?.data;
      this.perfDataService.numaNum = data.context_info?.numa_num;
    });
  }
  private async getNumaNum() {
    const params = {
      'node-id': this.statusService.nodeId,
      'config-type': 'network',
    };
    const resp: RespCommon<any> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config/`,
      { params }
    );
    return resp.data;
  }
}
