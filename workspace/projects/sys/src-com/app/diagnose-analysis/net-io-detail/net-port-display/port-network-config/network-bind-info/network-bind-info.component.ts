import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { NetworkBindRowInfo } from '../../../domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-network-bind-info',
  templateUrl: './network-bind-info.component.html',
  styleUrls: ['./network-bind-info.component.scss']
})
export class NetworkBindInfoComponent implements OnInit {

  @Input() bondInfoData: NetworkBindRowInfo[] | [];

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
    const newData: any[] = [];
    if (!this.bondInfoData.length) {
      this.srcData.data = [];
      return;
    }
    this.bondInfoData.forEach((data: string[]) => {
      newData.push(this.handelBindDatas(data));
    });
    this.srcData.data = newData;
  }

  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: I18n.net_io.network_config.bind_name },
      { title: 'IPv4' },
      { title: 'IPv6' },
      { title: I18n.mission_create.mode },
      { title: 'Network Interface' }
    ];
  }

  // 处理 网口信息 表格数据
  private handelBindDatas(bindData: string[]) {
    const [ name, ipV4, ipV6, mode, network ] = bindData;

    return {
      name,
      ipV4,
      ipV6,
      mode,
      network
    };
  }

}
