import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-load-cpu-load',
  templateUrl: './load-cpu-load.component.html',
  styleUrls: ['./load-cpu-load.component.scss']
})
export class LoadCpuLoadComponent implements OnInit {

  @Input() loadData: string[];

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
    this.srcData.data.push(this.handelCPULoadDatas(this.loadData));
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

  // 获取 cpu 负载表格数据
  private handelCPULoadDatas(loadData: string[]) {
    const [ runqSz, plistSz, ldavg1, ldavg5, ldavg15, blocked ] = loadData;

    return {
      runqSz,
      plistSz,
      ldavg1,
      ldavg5,
      ldavg15,
      blocked
    };
  }

}
