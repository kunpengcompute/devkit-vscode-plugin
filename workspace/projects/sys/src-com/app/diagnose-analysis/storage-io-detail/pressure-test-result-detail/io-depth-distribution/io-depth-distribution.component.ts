import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-io-depth-distribution',
  template: `
    <app-distribution-table [data]="ioDistributionData" [columns]="columns"></app-distribution-table>
  `,
})
export class IoDepthDistributionComponent implements OnInit {

  @Input() ioDistributionData: any;

  columns: Array<TiTableColumns> = [];

  constructor() { }

  ngOnInit(): void {
    this.columns = [
      {
        title: I18n.storage_io_detail.result_tab.io_depth_scope,
        width: '20%',
        key: 'scope',
      },
      {
        title: I18n.storage_io_detail.result_tab.percent,
        width: '80%',
        key: 'percent',
      },
    ];
  }

}
