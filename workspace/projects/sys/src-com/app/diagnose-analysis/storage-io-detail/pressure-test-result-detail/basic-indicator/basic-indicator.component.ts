import { Component, Input, OnInit } from '@angular/core';
import { TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CommonTreeNode } from 'sys/src-com/app/shared/domain';

@Component({
  selector: 'app-basic-indicator',
  template: `
    <app-general-table [dataList]="basicIndicatorSrcData.data" [columns]="basicIndicatorColumns"></app-general-table>
  `
})
export class BasicIndicatorsComponent implements OnInit {

  @Input()
  set basicIndicatorData(data: any[]) {
    if (data && data.length) {
      this.initTableData(data);
    }
  }

  basicIndicatorSrcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    },
  };
  basicIndicatorColumns: Array<CommonTreeNode> = [];

  constructor() { }

  ngOnInit(): void {
    this.basicIndicatorColumns = [
      {
        label: I18n.storage_io_detail.result_tab.indicator,
        width: '20%',
        key: 'indicator',
      },
      {
        label: I18n.storage_io_detail.result_tab.read,
        key: 'read',
      },
      {
        label: I18n.storage_io_detail.result_tab.write,
        key: 'write',
      }
    ];
  }

  private initTableData(data: any[]) {
    this.basicIndicatorSrcData.data = data.map(arr => {
      const [ indicator, read, write ] = arr;
      return { indicator, read, write };
    });
    this.basicIndicatorSrcData.data[0].indicator = I18n.storage_io_detail.result_tab.iops;
    this.basicIndicatorSrcData.data[1].indicator = I18n.storage_io_detail.result_tab.throughput +
      I18n.common_term_sign_left + 'KiB/s' + I18n.common_term_sign_right;
    this.basicIndicatorSrcData.data[2].indicator = I18n.storage_io_detail.result_tab.latency +
      I18n.common_term_sign_left + 'ms' + I18n.common_term_sign_right;
  }

}
