import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-latency-distribution',
  template: `
    <app-distribution-table [data]="latencyDistributionData" [columns]="columns"></app-distribution-table>
  `,
})
export class LatencyDistributionComponent implements OnInit {

  @Input() latencyDistributionData: any;

  columns: Array<TiTableColumns> = [];

  constructor() { }

  ngOnInit(): void {
    this.columns = [
      {
        title: I18n.storage_io_detail.result_tab.latency_cope,
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
