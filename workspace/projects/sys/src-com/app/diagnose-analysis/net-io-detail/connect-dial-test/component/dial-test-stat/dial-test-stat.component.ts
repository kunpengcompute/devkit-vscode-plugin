import { Component, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { IDialTestRaw } from '../../../domain';
import { I18n } from 'sys/locale';

type DialTestStat = IDialTestRaw['connection']['ping'];

@Component({
  selector: 'app-dial-test-stat',
  templateUrl: './dial-test-stat.component.html',
  styleUrls: ['./dial-test-stat.component.scss'],
})
export class DialTestStatComponent {
  @Input()
  set statData(val: DialTestStat) {
    this.srcData.data = this.createStatList(val);
  }

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
        title: I18n.net_io.sent_packets,
        rowspan: 2,
        width: '16%',
      },
      {
        title: I18n.net_io.received_packets,
        rowspan: 2,
        width: '14%',
      },
      {
        title: I18n.net_io.packets_loss_rate,
        rowspan: 2,
        width: '14%',
      },
      {
        title: I18n.net_io.rtt,
        width: '56%',
        colspan: 4,
        textAlign: 'center',
      },
    ],
    [
      {
        title: I18n.net_io.max,
        width: '14%',
      },
      {
        title: I18n.net_io.min,
        width: '14%',
      },
      {
        title: I18n.net_io.arv,
        width: '14%',
      },
      {
        title: I18n.net_io.mean_deviation,
        width: '14%',
      },
    ],
  ];

  constructor() {}

  trackByFn() {}

  private createStatList(data: DialTestStat): Partial<DialTestStat>[] {
    if (data == null) {
      return [{}];
    }

    return [data];
  }
}
