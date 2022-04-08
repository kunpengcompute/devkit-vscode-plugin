import {Component, OnInit, Input} from '@angular/core';
import {TiTableRowData} from '@cloud/tiny3';
import { TableService } from 'sys/src-com/app/service/table.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
@Component({
  selector: 'app-disk-table',
  templateUrl: './disk-table.component.html',
  styleUrls: ['./disk-table.component.scss']
})
export class DiskTableComponent implements OnInit {
  @Input() nodeid: string;
  @Input() dataList: any;
  @Input() hasPage: boolean;
  @Input() totalPage: number;
  @Input() columns: Array<any>;
  constructor(
    public i18nService: I18nService,
    public tableService: TableService
  ) {
    this.i18n = this.i18nService.I18n();
  }
   public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
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
  ngOnInit() {
  }

}
