import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';


@Component({
  selector: 'app-log-manage',
  templateUrl: './log-manage.component.html',
  styleUrls: ['./log-manage.component.scss']
})
export class LogManageComponent implements OnInit {
  public i18n: any;
  public role: string;

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.role = sessionStorage.getItem('role');
  }
}
