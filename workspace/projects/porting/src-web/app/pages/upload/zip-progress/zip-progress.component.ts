import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18nService } from '../../../service';

@Component({
  selector: 'app-zip-progress',
  templateUrl: './zip-progress.component.html',
  styleUrls: ['./zip-progress.component.scss']
})
export class ZipProgressComponent {

  @Input() info: any;
  @Input() waiting: boolean;

  @Output() closeRequest = new EventEmitter();

  public i18n: any;
  constructor(public i18nService: I18nService, ) { this.i18n = this.i18nService.I18n(); }

  closeProgress() {
    this.waiting = false;
    this.closeRequest.emit();
  }
}
