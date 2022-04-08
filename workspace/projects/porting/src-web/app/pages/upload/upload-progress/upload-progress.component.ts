import { Component, Input, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../../service';

@Component({
  selector: 'app-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss']
})
export class UploadProgressComponent {
  @Input() info: any;
  @Input() uploadProgress: any;
  @Input() barWidth: any;
  @Input() isShow: any;
  @Input() isSlow: any;

  @Output() closeRequest = new EventEmitter();

  public i18n: any;
  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  closeProgress() {
    this.isShow = false;
    this.isSlow = false;
    this.closeRequest.emit();
  }
}
