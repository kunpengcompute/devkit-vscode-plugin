import { Component, OnInit, TemplateRef } from '@angular/core';
import { TiMessageService, TiModalRef } from '@cloud/tiny3';
import { TiValidationConfig, TiModalService } from '@cloud/tiny3';
import { I18nService } from '../service/i18n.service';
@Component({
    selector: 'app-file-locked',
    templateUrl: './file-locked.component.html',
    styleUrls: ['./file-locked.component.scss']
})
export class FileLockedComponent implements OnInit {
    public i18n: any;
    constructor(
        private tiModal: TiModalService,
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    ngOnInit() {
    }
    deleteAll(modalTemplate: TemplateRef<any>) {
        this.tiModal.open(modalTemplate, {
            id: 'allModal',
            modalClass: 'del-report',
            close: null,
            dismiss: (): void => {
            }
        });
    }

}

