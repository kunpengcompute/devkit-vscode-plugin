import { Component, OnInit, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-ddr-ddr-detailil',
  templateUrl: './ddr-ddr-detailil.component.html',
  styleUrls: ['./ddr-ddr-detailil.component.scss']
})
export class DdrDdrDetaililComponent implements OnInit {
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
      },
    }).then((res: any) => {
      this.cpu = res.data.system_info.CPU;
      this.tableData = res.data;
    });
  }

}
