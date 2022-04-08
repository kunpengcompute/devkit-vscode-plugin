import { Component, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-nested-table',
  templateUrl: './nested-table.component.html',
  styleUrls: ['./nested-table.component.scss'],
})
export class NestedTableComponent {
  @Input() set data(val: Array<object>) {
    this.table.srcData.data = val;
  }
  table = {
    displayed: [] as Array<TiTableRowData>,
    srcData: {
      data: [] as any[],
      state: {
        searched: true, // 源数据未进行搜索处理
        sorted: true, // 源数据未进行排序处理
        paginated: true, // 源数据未进行分页处理
      },
    },
    columns: [] as Array<TiTableColumns>,
    pageNo: 1,
    pageSize: {
      options: [10, 20, 40, 80, 100],
      size: 20,
    },
    total: 0,
  };

  constructor() {
    this.table.columns = [
      { label: I18n.nodeManagement.encryptionType, prop: 'hash_type', width: '20%' },
      { label: I18n.nodeManagement.protocolType, prop: 'key_type', width: '20%' },
      { label: I18n.nodeManagement.fingerprints, prop: 'finger_print', width: '60%' },
    ];
  }
}
