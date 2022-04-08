import { Component, OnInit, Input } from '@angular/core';
import { HttpService, I18nService } from 'sys/src-com/app/service';

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
  public ideType: string;
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
      },
    }).then((res: any) => {
      this.cpu = res.data.system_info.CPU;
      this.tableData = res.data;
    });
  }

}
