import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-load-memory-usage',
  templateUrl: './load-memory-usage.component.html',
  styleUrls: ['./load-memory-usage.component.scss']
})
export class LoadMemoryUsageComponent implements OnInit {

  @Input() memUsageData: string[];

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
    this.srcData.data.push(this.handleMemUsageData(this.memUsageData));
  }

  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: 'total（KB）' },
      { title: 'free（KB）' },
      { title: 'used（KB）' },
      { title: '%used' },
      { title: 'avail（KB）' },
      { title: 'buffers（KB）' },
      { title: 'cached（KB）' }
    ];
  }

  // 处理 内存利用率 表格数据
  private handleMemUsageData(data: string[]) {
    const [ total, free, used, used1, avail, buffers, cached ] = data;

    return {
      total,
      free,
      used,
      used1,
      avail,
      buffers,
      cached
    };
  }

}
