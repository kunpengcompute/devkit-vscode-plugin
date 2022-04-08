import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { CpuContextSwitch } from '../../domain';
@Component({
  selector: 'app-create-and-context-switch',
  templateUrl: './create-and-context-switch.component.html',
  styleUrls: ['./create-and-context-switch.component.scss']
})
export class CreateAndContextSwitchComponent implements OnInit {
  @Input()
  set cpuContextSwitch(value: CpuContextSwitch) {
    if (value) {
      this.srcData.data.push(value);
    }
  }
  constructor() { }
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  ngOnInit(): void {
    this.initColumns();
    this.srcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
  }
  private initColumns() {
    this.columns = [
      { title: 'proc/s', width: '20%', tip: I18n.tuninghelper.detailedData.proc_tip },
      { title: 'cswch/s', width: '80%', tip: I18n.tuninghelper.detailedData.cswch_tip },
    ];
  }
}
