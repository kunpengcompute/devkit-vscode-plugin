import { Component, OnInit, Input, Output } from '@angular/core';
import { I18nService } from '../service/i18n.service';

@Component({
    selector: 'app-zip-progress',
    templateUrl: './zip-progress.component.html',
    styleUrls: ['./zip-progress.component.scss']
})
export class ZipProgressComponent implements OnInit {

    @Input() info: any;
    public i18n: any;
    constructor(public i18nService: I18nService) { this.i18n = this.i18nService.I18n(); }

    ngOnInit() {
    }

}
