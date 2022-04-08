import { Component, OnInit, Input } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTableColumns } from '@cloud/tiny3';

import { I18nService } from '../../../../service/i18n.service';

@Component({
  selector: 'app-nested-table',
  templateUrl: './nested-table.component.html',
  styleUrls: ['./nested-table.component.scss']
})
export class NestedTableComponent implements OnInit {
  @Input() data: Array<object>;

  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [
    {
      title: '',
      width: '10%'
    },
    {
      title: '',
      width: '90%'
    }
  ];

  ngOnInit(): void {
    this.columns[0].title = this.i18n.common_term_no_label;
    this.columns[1].title = this.i18n.common_suggestion_position;

    this.srcData = {
      data: this.data,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
  }

}
