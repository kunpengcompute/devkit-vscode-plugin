import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-threaddump-report',
  templateUrl: './threaddump-report.component.html',
  styleUrls: ['./threaddump-report.component.scss']
})
export class ThreaddumpReportComponent implements OnInit {
  public threaddumpId: any;
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
        title: this.i18n.plugins_common_report.thread_dump,
        active: true
      },
      {
        title: this.i18n.plugins_common_report.report_info,
        active: false,
      }
    ];
    this.route.queryParams.subscribe(data => {
      this.threaddumpId = data.taskId;
    });
  }

}
