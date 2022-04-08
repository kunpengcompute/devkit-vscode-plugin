import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { I18nService } from '../../service/i18n.service';

@Component({
    selector: 'app-suggestion',
    templateUrl: './suggestion.component.html',
    styleUrls: ['./suggestion.component.scss']
})
export class SuggestionComponent implements OnInit {
    i18n: any;
    constructor(public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }
    @Output() showJdbcCheck = new EventEmitter();

    public isShowAgreeBox = true;
    public showChecked = false;

    /**
     * 选择
     * @param state 状态
     */
    checkedChange(state: any) {
        this.isShowAgreeBox = !state;
    }

    /**
     * 显示差别
     */
    showDiffCode() {
        this.showJdbcCheck.emit(true);
    }

    /**
     * 初始化
     */
    ngOnInit() { }
}
