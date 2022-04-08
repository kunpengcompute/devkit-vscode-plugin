import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { ARPRowInfo } from '../domain';

@Component({
  selector: 'app-arp-info',
  templateUrl: './arp-info.component.html',
  styleUrls: ['./arp-info.component.scss']
})
export class ARPInfoComponent implements OnInit {

  @Input() arpData: string[][];

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
    const newData: ARPRowInfo[] = [];
    this.arpData.map((data: string[]) => {
      newData.push(this.handelArpDatas(data));
    });
    this.srcData.data = newData;
  }

  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: 'Address' },
      { title: 'HWtype' },
      { title: 'HWaddress' },
      { title: 'Flags' },
      { title: 'Network Interface' }
    ];
  }

  // 处理 arp 表格数据
  private handelArpDatas(arpData: string[]) {
    const [ address, hWtype, hWaddress, flags, network ] = arpData;

    return {
      address,
      hWtype,
      hWaddress,
      flags,
      network
    };
  }

}
