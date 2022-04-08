import { Component, OnInit, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { RespTlbData, RespCpu } from './doman';
@Component({
  selector: 'app-ddr-catch-detail',
  templateUrl: './ddr-catch-detail.component.html',
  styleUrls: ['./ddr-catch-detail.component.scss']
})
export class DdrCatchDetailComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  public cpu: number;

  public i18n: any;

  public isTable = false;
  public tableData: any;

  public filterMap = new Map();
  /** tlb过滤表格数据 */
  public tlbFilterTableData: RespTlbData[];
  constructor(
    public axiosService: AxiosService,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    const params = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': ''
    };

    this.axiosService.axios.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      this.cpu = res.data.system_info.CPU ?? RespCpu.CPU1620;
      // 初始化过滤弹窗数据
      const tlbData: RespTlbData[] = res.data.l1c_l2c_tlb_count_sum;
      this.tlbFilterTableData = tlbData.sort((a, b) => a.hitrate - b.hitrate);
      // 表格视图数据赋值
      this.tableData = res.data;
    });
  }

}
