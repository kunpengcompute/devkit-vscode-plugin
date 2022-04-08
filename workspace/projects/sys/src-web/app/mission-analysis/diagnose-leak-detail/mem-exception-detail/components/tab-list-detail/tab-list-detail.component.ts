import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FuncProps } from '../../../doman';
import { I18nService } from 'projects/sys/src-web/app/service';

@Component({
    selector: 'app-tab-list-detail',
    templateUrl: './tab-list-detail.component.html',
    styleUrls: ['./tab-list-detail.component.scss']
})
export class TabListDetailComponent implements OnInit, OnChanges {
    @Input() data: FuncProps;
    @ViewChild('exceptionDetailsModal') exceptionDetailsModal: any;
    public tabDetailList: any = [];
    public detailedInformationList: any = [];
    public i18n: any;
    constructor(
        private i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.data) { return; }
        this.tabDetailList = JSON.parse(JSON.stringify(this.data.exceptionDteail));
        this.tabDetailList.forEach((item: any, index: number) => {
            item.open = true;
        });
    }
    public expandToggle(item: any) {
        item.open = !item.open;
    }
    public getInfoDetails(timeVal: string) {
        this.detailedInformationList = timeVal.split('\n');
        this.exceptionDetailsModal.showMsg('exception');
    }
}
