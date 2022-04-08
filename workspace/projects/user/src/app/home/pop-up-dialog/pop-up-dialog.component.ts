import { Component, Input } from '@angular/core';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-pop-up-dialog',
  templateUrl: './pop-up-dialog.component.html',
  styleUrls: ['./pop-up-dialog.component.scss']
})
export class PopUpDialogComponent {
  public i18n: any;
  @Input() msg: any;
  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
}
