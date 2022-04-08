import { Component, Input, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { IDialTestRaw, DialTestType, DialTestTarget } from '../../domain';
import { I18n } from 'sys/locale';
import {
  TcpDialSequeClient,
  TcpDialSequeServer,
  UdpDialSequeClient,
  UdpDialSequeServer,
} from '../../domain';

export type SequeTableData = TcpDialSequeClient &
  TcpDialSequeServer &
  UdpDialSequeClient &
  UdpDialSequeServer;

type StatTableData = {
  id: 'string';
  interval: string;
  transfer: string;
  bandwidth: number;
  retr?: number;
  jitter?: number;
  'loss/total'?: string;
  loss?: number;
  children: SequeTableData[];
};

type TcpStatInfo = IDialTestRaw['tcp'];
type UdpStatInfo = IDialTestRaw['udp'];

@Component({
  selector: 'app-dail-statistcs-info',
  templateUrl: './dail-statistcs-info.component.html',
  styleUrls: ['./dail-statistcs-info.component.scss'],
})
export class DailStatistcsInfoComponent {
  @ViewChild('echartConfigAlert', { static: false }) echartConfigAlert: any;

  @Input() dialType: DialTestType;
  @Input()
  set statData(val: TcpStatInfo | UdpStatInfo) {
    if (val == null) {
      return;
    }
    setTimeout(() => {
      this.srcData.data = this.createCurry?.(val) || [];
    });
  }
  @Input()
  set endType(endType: DialTestTarget) {
    if (endType == null) {
      return;
    }
    this.endTypeStash = endType;
    this.statColumns = this.createStatColumns(endType, this.dialType);
    this.sequeColumns = this.createSequeColumns(endType, this.dialType);
    this.createCurry = (statInfo: TcpStatInfo | UdpStatInfo) => {
      return this.createTableData(endType, statInfo);
    };
  }
  get endType(): DialTestTarget {
    return this.endTypeStash;
  }

  srcData: TiTableSrcData = {
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
    data: [],
  };
  statColumns: Array<TiTableColumns> = [];
  displayed: Array<TiTableRowData> = [];
  sequeColumns: Array<TiTableColumns> = [];

  showEchartModel = false;
  sequeData: SequeTableData[];
  connectId: string | number;

  private endTypeStash: DialTestTarget;
  private createCurry: (val: TcpStatInfo | UdpStatInfo) => StatTableData[];

  constructor() {}

  onDetailClick(row: any) {
    this.sequeData = row.children;
    this.connectId = row.id;
    this.showEchartModel = true;
  }

  onModelClose() {
    this.showEchartModel = false;
  }

  trackByFn(row: any) {
    return row.id;
  }

  trackByFnCol(col: any) {
    return col.prop;
  }

  private createTableData(
    end: DialTestTarget,
    data: TcpStatInfo | UdpStatInfo
  ): StatTableData[] {
    const statisData = data?.STATISTICIAL?.[end];
    const sequenData = data?.SEQUENTIAL?.[end];

    const tableData = Object.keys(statisData).map((item: any) => {
      return {
        id: item,
        ...statisData[item],
        children: sequenData[item],
      };
    });
    return tableData as any;
  }

  private createStatColumns(end: DialTestTarget, dial: DialTestType): any[] {
    const columms = [
      {
        title: I18n.net_io.connect_id,
        valid: true,
        prop: 'id',
        sortKey: 'id',
      },
      {
        title: I18n.diagnostic.timeInterval,
        valid: true,
        prop: 'interval',
        sortKey: 'interval',
      },
      {
        title: I18n.diagnostic.transferredData,
        valid: true,
        prop: 'transfer',
        sortKey: 'transfer',
      },
      {
        title: I18n.net_io.bandwidth,
        valid: true,
        prop: 'bandwidth',
        sortKey: 'bandwidth',
      },
      {
        title: I18n.net_io.retr,
        valid: end === DialTestTarget.Client && dial === DialTestType.TCP,
        prop: 'retr',
      },
      {
        title: I18n.net_io.jitter_ms,
        valid: dial === DialTestType.UDP,
        prop: 'jitter',
      },
      {
        title: I18n.net_io.loss_total,
        valid: dial === DialTestType.UDP,
        prop: 'lost/total',
      },
      {
        title: I18n.net_io.loss_p,
        valid: dial === DialTestType.UDP,
        prop: 'lost_rate',
      },
    ];

    const validColumns = columms.filter((col) => col.valid);
    const colLen = validColumns.length;

    return validColumns.map((item) => {
      return {
        width: `${100 / colLen}%`,
        ...item,
      };
    });
  }

  private createSequeColumns(end: DialTestTarget, dial: DialTestType): any[] {
    const columms = [
      {
        title: I18n.diagnostic.timeInterval,
        valid: true,
        prop: 'interval',
        sortKey: 'interval',
      },
      {
        title: I18n.diagnostic.transferredData,
        valid: true,
        prop: 'transfer',
        sortKey: 'transfer',
      },
      {
        title: I18n.net_io.bandwidth,
        valid: true,
        prop: 'bandwidth',
        sortKey: 'bandwidth',
      },
      {
        title: I18n.net_io.retr,
        valid: end === DialTestTarget.Client && dial === DialTestType.TCP,
        prop: 'retr',
      },
      {
        title: I18n.diagnostic.windowSize,
        valid: end === DialTestTarget.Client && dial === DialTestType.TCP,
        prop: 'cwnd',
      },
      {
        title: I18n.net_io.jitter_ms,
        valid: end === DialTestTarget.Server && dial === DialTestType.UDP,
        prop: 'jitter',
      },
      {
        title: I18n.net_io.loss_total,
        valid: end === DialTestTarget.Server && dial === DialTestType.UDP,
        prop: 'lost/total',
      },
      {
        title: I18n.net_io.loss_p,
        valid: dial === DialTestType.UDP,
        prop: 'lost_rate',
      },
      {
        title: I18n.net_io.totaldatagrams,
        valid: end === DialTestTarget.Client && dial === DialTestType.UDP,
        prop: 'total',
      },
    ];

    const validColumns = columms.filter((col) => col.valid);
    const colLen = validColumns.length;

    return validColumns.map((item) => {
      return {
        width: `${100 / colLen}%`,
        ...item,
      };
    });
  }
}
