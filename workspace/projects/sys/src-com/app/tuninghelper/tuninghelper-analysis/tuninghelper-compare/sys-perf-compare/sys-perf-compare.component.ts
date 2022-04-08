import { Component, OnInit } from '@angular/core';
import { HttpService } from 'sys/src-com/app/service';
import { TuninghelperStatusService } from '../../service/tuninghelper-status.service';
interface SysPerfDiff {
  cpu: boolean;
  memory: boolean;
  network: boolean;
  storage: boolean;
}
@Component({
  selector: 'app-sys-perf-compare',
  templateUrl: './sys-perf-compare.component.html',
  styleUrls: ['./sys-perf-compare.component.scss']
})
export class SysPerfCompareComponent implements OnInit {
  constructor(
    private http: HttpService,
    private tuninghelperStatusService: TuninghelperStatusService
  ) { }
  public sysPerfDiff: SysPerfDiff;

  async ngOnInit() {
    this.sysPerfDiff = await this.getsysPerfDiff();
  }
  /**
   * 获取页签是否有对比差异 显示小红点
   */
  private async getsysPerfDiff() {
    const params = {
      id: this.tuninghelperStatusService.taskId,
    };
    const resp = await this.http.get(
      `/data-comparison/system-performance-diff/`,
      { params, headers: { showLoading: false } }
    );
    return resp.data;
  }
}
