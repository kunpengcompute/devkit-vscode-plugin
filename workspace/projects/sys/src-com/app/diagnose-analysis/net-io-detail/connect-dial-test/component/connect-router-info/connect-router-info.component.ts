import { Component, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { IDialTestRaw } from '../../../domain';
import { I18n } from 'sys/locale';

type ConnectRoute = IDialTestRaw['connection']['traceroute'];

@Component({
  selector: 'app-connect-router-info',
  templateUrl: './connect-router-info.component.html',
  styleUrls: ['./connect-router-info.component.scss'],
})
export class ConnectRouterInfoComponent {
  @Input()
  set routerData(val: ConnectRoute) {
    if (val == null) {
      return;
    }

    this.ttlNum = +val.num;
    this.srcData.data = this.createRouterList(val.data);
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

  ttlNum: number;
  columns: Array<TiTableColumns> = [
    {
      title: I18n.net_io.router_num,
      width: '20%',
    },
    {
      title: I18n.net_io.router_num,
      width: '20%',
    },
    {
      title: I18n.net_io.response_time1,
      width: '20%',
    },
    {
      title: I18n.net_io.response_time2,
      width: '20%',
    },
    {
      title: I18n.net_io.response_time3,
      width: '20%',
    },
  ];

  constructor() {}

  trackByFn() {}

  private createRouterList(data: ConnectRoute['data']): ConnectRoute['data'] {
    return data ?? [];
  }
}
