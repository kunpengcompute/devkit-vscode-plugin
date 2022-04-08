import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HeaderService } from '../../service/header.service';
import { I18nService } from '../../service/i18n.service';

@Component({
    selector: 'app-stack-tip',
    templateUrl: './stack-tip.component.html',
    styleUrls: ['./stack-tip.component.scss']
})
export class StackTipComponent implements OnChanges {

    @Input() depth: number;

    public i18n: any;
    public role: boolean;
    public stackBtnTip: string;

    constructor(
        public i18nService: I18nService,
        private headerService: HeaderService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.depth) {
            this.role = sessionStorage.getItem('role') === 'Admin' ? true : false;
            this.stackBtnTip = this.i18nService.I18nReplace(
                this.role ? this.i18n.newHeader.setting.stackAdmin : this.i18n.newHeader.setting.stackUser,
                { 0: this.depth ?? 0 }
            );
        }
    }

    public toSetting() {
        this.headerService.sendMessage({
            cmd: 'openJavaSetting'
        });
    }
}
