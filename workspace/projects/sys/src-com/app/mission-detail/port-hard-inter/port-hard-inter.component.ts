import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HartInterSingleCPUTableData, HartInterSingleTableData, INetLoadRawData } from './component/domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-port-hard-inter',
  templateUrl: './port-hard-inter.component.html',
  styleUrls: ['./port-hard-inter.component.scss']
})
export class PortHardInterComponent implements OnInit, OnChanges {

  @Input() allIrqData: any;
  @Input() singleIrqCPUData: any;
  @Input() allIrqCPUData: any;
  @Input() ipiInfo: INetLoadRawData['rps_ipi_info'];
  @Input() numaNum: any;

  constructor() { }
  public hartNumberData: any;
  public hartCPUData: any;

  public interOption: Array<any>;
  public cpuOption: Array<any>;
  public interSelected: { label: string; index: number; };
  public cpuSelected: any;
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];

  public checkTitle: string;
  public checked = true;
  ngOnInit(): void {
    this.interOption = [
      { label: I18n.net_io.xps_rps.hard_info.selected_list[0], index: 0 },
      { label: I18n.net_io.xps_rps.hard_info.selected_list[1], index: 1 }
    ];
    this.cpuOption = [
      { label: I18n.popInfo.all, id: 'all' },
    ];
    this.interSelected = this.interOption[0];
    this.cpuSelected = this.cpuOption[0];
    if (this.singleIrqCPUData) {
      this.initSelect(this.singleIrqCPUData);
    }
  }

  ngOnChanges(): void {
    setTimeout(() => {
      this.hartNumberData = [this.allIrqData];
      this.hartCPUData = [this.allIrqCPUData];
      this.initSelect(this.singleIrqCPUData);
    }, 0);
  }

  public initSelect(data?: any) {
    for (const key of Object.keys(data)) {
      if (key !== 'other') {
        const option = {
          label: key,
          id: key
        };
        this.cpuOption.push(option);
      }
    }
    this.cpuOption.push({
      label: I18n.popInfo.other,
      id: 'other'
    });
  }

  // 图下拉框改变
  public interSelectedChange(selectedData: { index: number; }) {
  }

  // cpu下拉框改变
  public cpuSelectedChange(selectedData: { id: string; }) {
    if (selectedData.id === 'all') {
      this.hartCPUData = [this.allIrqCPUData];
    } else {
      this.hartCPUData = [this.singleIrqCPUData[selectedData.id]];
    }
  }
}
