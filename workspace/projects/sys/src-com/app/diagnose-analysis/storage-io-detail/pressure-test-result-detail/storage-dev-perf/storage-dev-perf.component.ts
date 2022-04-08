import { Component, Input, OnInit } from '@angular/core';
import { TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-storage-dev-perf',
  template: `
    <app-common-table [commonTableData]="basicLatencyTable" [isFilters]="true"></app-common-table>
  `
})
export class StorageDevPerfComponent implements OnInit {

  @Input()
  set devPerf(data: any[]) {
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
        label: I18n.storage_io_detail.result_tab.dev_name,
        key: 'devName',
        disabled: true,
      },
      {
        label: 'I/O number',
        tip: I18n.storage_io_detail.result_tab.io_number_tip,
        children: [
          {
            label: I18n.storage_io_detail.result_tab.read,
            key: 'ioNumberRead',
          },
          {
            label: I18n.storage_io_detail.result_tab.write,
            key: 'ioNumberWrite',
          },
        ]
      },
      {
        label: 'merge number',
        tip: I18n.storage_io_detail.result_tab.merge_number_tip,
        children: [
          {
            label: I18n.storage_io_detail.result_tab.read,
            key: 'mergeNumberRead',
          },
          {
            label: I18n.storage_io_detail.result_tab.write,
            key: 'mergeNumberWrite',
          },
        ]
      },
      {
        label: 'tick number',
        tip: I18n.storage_io_detail.result_tab.tick_number_tip,
        children: [
          {
            label: I18n.storage_io_detail.result_tab.read,
            key: 'tickNumberRead',
          },
          {
            label: I18n.storage_io_detail.result_tab.write,
            key: 'tickNumberWrite',
          },
        ]
      },
      {
        label: 'time spent in queue',
        key: 'timeQueue',
        tip: I18n.storage_io_detail.result_tab.time_spent_in_queue_tip,
      },
      {
        label: 'util(%)',
        key: 'util',
        tip: I18n.storage_io_detail.result_tab.util_tip,
      }
    ];
  }

  private initTableData(data: any[]) {
    this.basicLatencyTable.srcData.data = data.map(arr => {
      const [devName, ioNumberRead, ioNumberWrite, mergeNumberRead, mergeNumberWrite,
        tickNumberRead, tickNumberWrite, timeQueue, util ] = arr;
      return { devName, ioNumberRead, ioNumberWrite, mergeNumberRead, mergeNumberWrite,
        tickNumberRead, tickNumberWrite, timeQueue, util };
    });
  }

}
