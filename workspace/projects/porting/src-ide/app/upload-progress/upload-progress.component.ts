import { Component, OnInit, Input, Output } from '@angular/core';
import { I18nService } from '../service/i18n.service';

@Component({
    selector: 'app-upload-progress',
    templateUrl: './upload-progress.component.html',
    styleUrls: ['./upload-progress.component.scss']
})
export class UploadProgressComponent implements OnInit {
    @Input() info: any;
    @Input() uploadProgress: any;
    @Input() barWidth: any;
    @Input() isShow: any;
    public i18n: any;
    constructor(public i18nService: I18nService) { this.i18n = this.i18nService.I18n(); }

    ngOnInit() {
    }
    closeProgress() {
        this.isShow = false;
    }
}
