import { Component, OnInit } from '@angular/core';
import { ToolType } from 'projects/domain';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-log-manage',
  templateUrl: './log-manage.component.html',
  styleUrls: ['./log-manage.component.scss']
})
export class LogManageComponent implements OnInit {
  public i18n: any;
  public role: string;
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.role = sessionStorage.getItem('role');
  }
}
