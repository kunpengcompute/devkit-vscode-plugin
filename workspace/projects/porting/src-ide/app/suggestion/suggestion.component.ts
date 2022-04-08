import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../service/i18n.service';

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion.component.html',
    styleUrls: ['./suggestion.component.scss']
})
export class SuggestionComponent implements OnInit {

    @Output() showDiffCheck = new EventEmitter();
    public i18n: any;
    constructor(
        public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    public isShowAgreeBox = true;
    public showChecked = false;

    checkedChange(state: any) {
        this.isShowAgreeBox = !state;
    }

    showDiffCode() {
        this.showDiffCheck.emit(true);
    }

    ngOnInit() {
    }

}
