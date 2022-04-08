import { Component, OnInit, Input } from '@angular/core';
import { HttpService, I18nService } from 'sys/src-com/app/service';
import { RespTlbData } from './domain';
@Component({
  selector: 'app-ddr-cache-detail',
  templateUrl: './ddr-cache-detail.component.html',
  styleUrls: ['./ddr-cache-detail.component.scss']
})
export class DdrCatchDetailComponent implements OnInit {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() isActive: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  public cpu = 1620;

  public i18n: any;

  public isTable = false;
  public tableData: any;

  public ideType: string;
  public filterMap = new Map();
  /** tlb过滤表格数据 */
  public tlbFilterTableData: RespTlbData[];
  constructor(
    private http: HttpService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    if (sessionStorage.getItem('tuningOperation') === 'hypertuner'){
      this.ideType = 'intellij';
    } else {
      this.ideType = 'other';
    }
    const params = {
      'node-id': this.nodeid,
      'query-type': 'summary',
      'query-target': ''
    };

    this.http.get(`/tasks/${encodeURIComponent(this.taskid)}/mem-access-analysis/`, {
      params,
      headers: {
        showLoading: false,
      }
    }).then((res: any) => {
      this.cpu = res.data.system_info.CPU;
      // 初始化过滤弹窗数据
      const tlbData: RespTlbData[] = res.data.l1c_l2c_tlb_count_sum;
      this.tlbFilterTableData = tlbData.sort((a, b) => a.hitrate - b.hitrate);
      // 表格视图数据赋值
      this.tableData = res.data;
    });
  }

}
