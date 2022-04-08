import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HartInterSingleCPUTableData, HartInterSingleTableData, INetLoadRawData } from '../../../domain';
import { I18n } from 'sys/locale';
import { NetIoService } from '../../../service/net-io.service';

@Component({
  selector: 'app-port-hart-inter',
  templateUrl: './port-hart-inter.component.html',
  styleUrls: ['./port-hart-inter.component.scss']
})
export class PortHartInterComponent implements OnInit {

  @Input() bindName: string;
  @Input() singleIrqData: HartInterSingleTableData[];
  @Input() allIrqData: HartInterSingleTableData;
  @Input() singleIrqCPUData: HartInterSingleCPUTableData[];
  @Input() allIrqCPUData: HartInterSingleCPUTableData;
  @Input() ipiInfo: INetLoadRawData['rps_ipi_info'];

  public hartNumberData: HartInterSingleTableData[];
  public hartCPUData: HartInterSingleCPUTableData[];

  public interOption: Array<any>;
  public interSelected: { label: string; index: number; };

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];

  public checkTitle: string;
  public checked = true;
  public numaNum = 4;
  constructor(
    private netIoService: NetIoService
  ) { }

  ngOnInit(): void {
    this.interOption = [
      { label: I18n.net_io.xps_rps.hard_info.selected_list[0], index: 0 },
      { label: I18n.net_io.xps_rps.hard_info.selected_list[1], index: 1 }
    ];
    this.interSelected = this.interOption[0];
    this.checkTitle = `${I18n.net_io.xps_rps.hard_info.now_network}（${this.bindName}）`;

    this.hartNumberData = this.singleIrqData;
    this.hartCPUData = this.singleIrqCPUData;
    this.numaNum = this.netIoService.numaNum;
  }

  // 下拉框改变
  public interSelectedChange(selectedData: { index: number; }) {
    this.checked = true;
    this.hartNumberData = this.singleIrqData;
    this.hartCPUData = this.singleIrqCPUData;
  }

  // 复选框改变事件
  public checkBoxChange(e: MouseEvent) {
    !this.interSelected.index
      ? this.hartNumberData = e ? this.singleIrqData : [this.allIrqData]
      : this.hartCPUData = e ? this.singleIrqCPUData : [this.allIrqCPUData];
  }
}
