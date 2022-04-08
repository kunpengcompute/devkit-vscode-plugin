import { Component, OnInit } from '@angular/core';
import { I18nService } from '../service/i18n.service';

@Component({
    selector: 'app-disclaimer',
    templateUrl: './disclaimer.component.html',
    styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent {
    public i18n: any;

    constructor(
        public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

}
