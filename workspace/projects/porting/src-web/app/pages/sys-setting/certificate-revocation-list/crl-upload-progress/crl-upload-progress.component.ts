import { I18nService } from '../../../../service';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-crl-upload-progress',
  templateUrl: './crl-upload-progress.component.html',
  styleUrls: ['./crl-upload-progress.component.scss']
})
export class CrlUploadProgressComponent {
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
