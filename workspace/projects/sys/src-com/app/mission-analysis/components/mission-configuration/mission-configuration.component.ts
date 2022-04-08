import { Component, Input, OnInit } from '@angular/core';
import { ConfigurationInfo } from './domain';
import { I18nService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-mission-configuration',
  templateUrl: './mission-configuration.component.html',
  styleUrls: ['./mission-configuration.component.scss']
})
export class MissionConfigurationComponent implements OnInit {

  @Input() data: ConfigurationInfo;

  public showReason = false;
  public i18n: any;

  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
  }

}
