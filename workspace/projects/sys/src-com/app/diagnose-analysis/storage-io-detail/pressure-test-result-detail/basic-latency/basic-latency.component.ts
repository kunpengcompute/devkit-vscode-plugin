import { Component, Input, OnInit } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-basic-latency',
  template: `
    <app-common-table [commonTableData]="basicLatencyTable"></app-common-table>
  `
})
export class BasicLatencyComponent implements OnInit {

  @Input()
  set latencyData(data: any[]) {
    if (data && data.length) {
      this.initTableData(data);
    }
  }

  basicLatencyTable: CommonTableData = {
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
  };

  constructor() { }

  ngOnInit(): void {
    this.basicLatencyTable.columnsTree = [
      {
        label: I18n.storage_io_detail.result_tab.type,
        key: 'type',
        width: '20%',
      },
      {
        label: I18n.storage_io_detail.result_tab.read,
        children: [
          {
            label: I18n.storage_io_detail.result_tab.max_val,
            key: 'rMax',
          },
          {
            label: I18n.storage_io_detail.result_tab.min_val,
            key: 'rMin',
          },
          {
            label: I18n.storage_io_detail.result_tab.avg_val,
            key: 'rAvg',
          },
          {
            label: I18n.storage_io_detail.result_tab.standard_val,
            key: 'rStandard',
          },
        ]
      },
      {
        label: I18n.storage_io_detail.result_tab.write,
        children: [
          {
            label: I18n.storage_io_detail.result_tab.max_val,
            key: 'wMax',
          },
          {
            label: I18n.storage_io_detail.result_tab.min_val,
            key: 'wMin',
          },
          {
            label: I18n.storage_io_detail.result_tab.avg_val,
            key: 'wAvg',
          },
          {
            label: I18n.storage_io_detail.result_tab.standard_val,
            key: 'wStandard',
          },
        ]
      }
    ];
  }

  private initTableData(data: any[]) {
    this.basicLatencyTable.srcData.data = data.map(arr => {
      const [ type, rMax = '--', rMin = '--', rAvg = '--',
        rStandard = '--', wMax = '--', wMin = '--', wAvg = '--', wStandard = '--' ] = arr;
      return { type, rMax, rMin, rAvg, rStandard, wMax, wMin, wAvg, wStandard };
    });
  }
}
