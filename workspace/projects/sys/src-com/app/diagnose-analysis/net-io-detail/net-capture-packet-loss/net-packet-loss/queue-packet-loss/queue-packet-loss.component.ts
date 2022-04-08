import { Component, ComponentRef, Input, OnInit, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTipDirective } from '@cloud/tiny3';
import { PocketLossRaw } from '../../../domain';

type QueuTableData = {
  queue: number,
  received: string,
  drop: string,
  rate: string
};

@Component({
  selector: 'app-queue-packet-loss',
  templateUrl: './queue-packet-loss.component.html',
  styleUrls: ['./queue-packet-loss.component.scss']
})
export class QueuePacketLossComponent implements OnInit {

  @Input()
  set queuePacketData(val: PocketLossRaw['softnet_stat']) {
    if (!val) { return; }

    this.srcData.data = this.handelQueuePacketData(val);
    // 保存总的条数，避免搜索结果小于10条，清空搜索后数据显示不全的问题
    this.originTotalNum = JSON.parse(JSON.stringify(this.srcData.data)).length;
    this.totalNumber = this.srcData.data.length;
  }

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: [],
    state: {
      searched: false,
      sorted: false,
      paginated: false
    }
  };
  public columns: Array<TiTableColumns> = [];

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };

  public searchWord = '';
  public searchWords = [''];
  public searchKeys = ['queue'];
  private originTotalNum: number;

  constructor() { }

  ngOnInit(): void {
    this.columns = this.initColumns();
    this.searchWords = [this.searchWord];
  }

  // 初始化 columns
  private initColumns(): TiTableColumns[] {
    const columns = [
      { title: 'Queue（CPU Core）', prop: 'queue', searchShow: true },
      { title: 'received/s', prop: 'received', sortKey: 'received' },
      { title: 'drop/s', prop: 'drop', sortKey: 'drop' },
      { title: 'drop rate（%）', prop: 'rate', sortKey: 'rate' }
    ];

    return columns;
  }

  /**
   * 对后端传回的表格数据作处理
   * @param queuePacketData 数据
   */
  private handelQueuePacketData(queuePacketData: PocketLossRaw['softnet_stat']): QueuTableData[] {
    const queuePacketTableData: QueuTableData[] = [];

    queuePacketData.forEach((data: string[], index: number) => {
      const [ received, drop, rate ] = data;

      queuePacketTableData.push({
        queue: index,
        received,
        drop,
        rate
      });
    });

    return queuePacketTableData;
  }

  // 对表格进行排序
  public sortTableFn(a: TiTableColumns, b: TiTableColumns, predicate: string) {
    return Number(a[predicate]) - Number(b[predicate]);
  }

  /**
   * 搜索框值改变事件
   * @param value 输入值
   */
  public searchValueChange(value: string) {
    if (value.trim() === '') {
      this.totalNumber = this.originTotalNum;
    }
    this.searchWords[0] = value;
  }

}
