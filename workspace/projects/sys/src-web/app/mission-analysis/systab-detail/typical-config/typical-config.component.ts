import { Component, Input, ElementRef } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-typical-config',
  templateUrl: './typical-config.component.html',
  styleUrls: ['./typical-config.component.scss']
})
export class TypicalConfigComponent {
  @Input() projectName: any;
  @Input() taskName: any;
  @Input() analysisType: any;
  @Input() taskid: any;
  @Input() nodeid: any;
  @Input() tabShowing: boolean;
  @Input() sceneSolution: any;

  public i18n: any;

  constructor(public i18nService: I18nService, private elementRef: ElementRef) {
    this.i18n = this.i18nService.I18n();
  }
}
