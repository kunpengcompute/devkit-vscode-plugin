import { Component, Input, OnInit } from '@angular/core';
import { TableService } from '../../../../service/table.service';
import { I18nService } from '../../../../service/i18n.service';
import { TiTableRowData } from '@cloud/tiny3';

@Component({
    selector: 'app-disk-table',
    templateUrl: './disk-table.component.html',
    styleUrls: ['./disk-table.component.scss'],
})
export class DiskTableComponent implements OnInit {

    @Input() nodeid: string;
    @Input() dataList: any;
    @Input() hasPage: boolean;
    @Input() totalPage: number;
    @Input() columns: Array<any>;

    public i18n: any;
    public displayed: Array<TiTableRowData> = [];
    public tlbData: any = {
        columns: [],
        displayed: ([] as Array<TiTableRowData>),
        srcData: {
            data: ([] as Array<TiTableRowData>),
            state: {
                searched: false,
                sorted: false,
                paginated: false
            },
        },
        pageNo: 0,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
    };

    constructor(
        public i18nService: I18nService,
        public tableService: TableService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {}
}
