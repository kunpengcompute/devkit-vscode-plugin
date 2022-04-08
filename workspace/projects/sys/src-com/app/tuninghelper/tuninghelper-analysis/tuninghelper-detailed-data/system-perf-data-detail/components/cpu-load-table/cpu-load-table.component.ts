import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CpuLoad } from '../../domain';
@Component({
  selector: 'app-cpu-load-table',
  templateUrl: './cpu-load-table.component.html',
  styleUrls: ['./cpu-load-table.component.scss']
})
export class CpuLoadTableComponent implements OnInit {
  @Input()
  set loadData(value: CpuLoad) {
    if (value) {
      this.srcData.data.push(value);
    }
  }
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  constructor() { }
  ngOnInit(): void {
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.initColumns();
  }
  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: 'runq-sz', tip: I18n.net_io.tip.runq_tip },
      { title: 'plist-sz', tip: I18n.net_io.tip.plist_tip },
      { title: 'ldavg-1', tip: I18n.net_io.tip.idavg_1_tip },
      { title: 'ldavg-5', tip: I18n.net_io.tip.idavg_5_tip },
      { title: 'ldavg-15', tip: I18n.net_io.tip.idavg_15_tip },
      { title: 'blocked', tip: I18n.net_io.tip.blocked_tip }
    ];
  }
}
