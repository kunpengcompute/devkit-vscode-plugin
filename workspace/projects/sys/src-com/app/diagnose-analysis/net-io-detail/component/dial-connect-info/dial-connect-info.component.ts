import { Component, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { DialTestTarget, IDialTestRaw } from '../../domain';
import { I18n } from 'sys/locale';

type DialConnectInfo =
  | IDialTestRaw['tcp']['CONNECTION']
  | IDialTestRaw['udp']['CONNECTION'];

/**
 * 拨测链接信息公共组件
 */
@Component({
  selector: 'app-dial-connect-info',
  templateUrl: './dial-connect-info.component.html',
  styleUrls: ['./dial-connect-info.component.scss'],
})
export class DialConnectInfoComponent {
  @Input()
  set endType(type: DialTestTarget) {
    const orders = this.orderMap.get(type);
    this.columns = orders?.map((ord) => this.pureColumns[ord]);
  }
  @Input()
  set connectInfo(val: DialConnectInfo) {
    if (null == val) {
      return;
    }
    this.srcData.data = [val];
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
  columns: Array<TiTableColumns> = [];

  private readonly pureColumns: Array<TiTableColumns> = [
    {
      title: I18n.net_io.connect_id,
      width: '20%',
    },
    {
      title: I18n.net_io.local_ip,
      width: '20%',
    },
    {
      title: I18n.net_io.local_port,
      width: '20%',
    },
    {
      title: I18n.net_io.remote_ip,
      width: '20%',
    },
    {
      title: I18n.net_io.remote_port,
      width: '20%',
    },
  ];
  private readonly orderMap = new Map([
    [DialTestTarget.Client, [0, 1, 2, 3, 4]],
    [DialTestTarget.Server, [0, 3, 4, 1, 2]],
  ]);

  constructor() {}

  trackByFn(row: any) {
    return row.connectId;
  }
}
