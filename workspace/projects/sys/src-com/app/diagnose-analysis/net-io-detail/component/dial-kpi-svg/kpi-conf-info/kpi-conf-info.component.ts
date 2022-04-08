import { Component, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-kpi-conf-info',
  templateUrl: './kpi-conf-info.component.html',
  styleUrls: ['./kpi-conf-info.component.scss'],
})
export class KpiConfInfoComponent {
  @Input() confType: 'router' | 'arp';
  @Input()
  set confData(val: (string | number)[][]) {
    if (val == null) {
      return;
    }
    this.columns = this.createColumns(this.confType);
    this.srcData.data = val;
  }

  displayed: Array<TiTableRowData> = [];
  columns: Array<TiTableColumns> = [];
  srcData: TiTableSrcData = {
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    },
    data: [],
  };

  constructor() { }

  private createColumns(type: 'router' | 'arp'): any[] {
    let cols: any[] = [];
    switch (type) {
      case 'arp':
        cols = [
          { title: 'Address', index: 0 },
          { title: 'HWtype', index: 1 },
          { title: 'HWaddress', index: 2 },
          { title: 'Flags', index: 3 },
          { title: 'Network Interface', index: 4 },
        ];

        break;
      case 'router':
        cols = [
          { title: 'Destination', index: 0 },
          { title: 'Gateway', index: 1 },
          { title: 'Genmask', index: 2 },
          { title: 'Flags', index: 3 },
          { title: 'Network Interface', index: 4 },
        ];
        break;
      default:
    }
    return cols.map((item) => {
      return {
        width: `${100 / cols.length}%`,
        ...item,
      };
    });
  }
}
