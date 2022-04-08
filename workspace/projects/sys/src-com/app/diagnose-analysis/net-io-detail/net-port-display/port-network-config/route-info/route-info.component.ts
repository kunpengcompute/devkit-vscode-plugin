import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { RouteRowInfo } from '../domain/port-network-con-interface';

@Component({
  selector: 'app-route-info',
  templateUrl: './route-info.component.html',
  styleUrls: ['./route-info.component.scss']
})
export class RouteInfoComponent implements OnInit {

  @Input() routeData: string[][];

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
    const newData: RouteRowInfo[] = [];
    this.routeData.map((data: string[]) => {
      newData.push(this.handelRouteDatas(data));
    });
    this.srcData.data = newData;
  }

  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: 'Destination' },
      { title: 'Gateway' },
      { title: 'Genmask' },
      { title: 'Flags' },
      { title: 'Network Interface' }
    ];
  }

  // 处理 网口信息 表格数据
  private handelRouteDatas(routeData: string[]) {
    const [ destination, gateway, genmask, flags, network ] = routeData;

    return {
      destination,
      gateway,
      genmask,
      flags,
      network
    };
  }

}
