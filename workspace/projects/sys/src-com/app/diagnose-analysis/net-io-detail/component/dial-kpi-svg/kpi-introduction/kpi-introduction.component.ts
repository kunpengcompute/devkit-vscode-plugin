import { Component } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-kpi-introduction',
  templateUrl: './kpi-introduction.component.html',
  styleUrls: ['./kpi-introduction.component.scss'],
})
export class KpiIntroductionComponent {
  displayed: Array<TiTableRowData> = [];
  srcData: TiTableSrcData = {
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
    data: [],
  };
  theads: Array<TiTableColumns> = [
    [
      {
        title: I18n.net_io.net_kpi,
        rowspan: 2,
        width: '25%',
      },
      {
        title: I18n.net_io.index_grade,
        width: '75%',
        colspan: 3,
        textAlign: 'center',
      },
    ],
    [
      {
        title: I18n.net_io.excel,
        width: '33%',
      },
      {
        title: I18n.net_io.good,
        width: '33%',
      },
      {
        title: I18n.net_io.bad,
        width: '34%',
      },
    ],
  ];

  constructor() {
    this.srcData.data = [
      {
        kpi: I18n.net_io.jit,
        excel: '<5ms',
        good: '<30ms',
        bad: '>=30ms',
      },
      {
        kpi: I18n.net_io.jitter,
        excel: '<1ms',
        good: '<20ms',
        bad: '>=20ms',
      },
      {
        kpi: I18n.net_io.packets_loss_rate_1,
        excel: '<0.001%',
        good: '<0.5%',
        bad: '>=0.5%',
      },
      {
        kpi: I18n.net_io.bandwidth_1,
        excel: `>${I18n.net_io.theory_bandwidth}*70%`,
        good: `>${I18n.net_io.theory_bandwidth}*40%`,
        bad: `<=${I18n.net_io.theory_bandwidth}*40%`,
      },
    ];
  }
}
