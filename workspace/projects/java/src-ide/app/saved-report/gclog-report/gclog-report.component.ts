import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
@Component({
  selector: 'app-gclog-report',
  templateUrl: './gclog-report.component.html',
  styleUrls: ['./gclog-report.component.scss']
})
export class GclogReportComponent implements OnInit {
  public gclogId: any;
  public tabList: Array<any> = [];
  public i18n: any;
  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.tabList = [
      {
        title: this.i18n.plugins_common_report.gclog,
        active: true
      },
      {
        title: this.i18n.plugins_common_report.report_info,
        active: false,
      }
    ];
    this.route.queryParams.subscribe(data => {
      this.gclogId = data.taskId;
    });
  }

}
