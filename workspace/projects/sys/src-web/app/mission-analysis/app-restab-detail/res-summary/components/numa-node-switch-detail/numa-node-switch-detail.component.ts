import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-numa-node-switch-detail',
  templateUrl: './numa-node-switch-detail.component.html',
  styleUrls: ['./numa-node-switch-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumaNodeSwitchDetailComponent implements OnInit {
  @ViewChild('numaNodeSwitchDetailsModal') numaNodeSwitchDetailsModal: any;

  public i18n: any;

  public columns: Array<TiTableColumns> = [];
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData = {
    data: ([] as Array<TiTableRowData>),
    state: {
      searched: false,
      sorted: false,
      paginated: false,
    }
  };
  public pageNo = 1;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  public total = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.initColumns();
  }

  /** 初始化表格列 */
  private initColumns() {
    this.columns = [
      { label: this.i18n.sys_res.conversion, sortKey: 'pathSwitch' },
      { label: this.i18n.sys_res.frequency, sortKey: 'times' }
    ];

    this.cdr.markForCheck();
  }

  /**
   * 展示NUMA切换详情【numa node switch 组件调用】
   * @param tableData 表格数据
   */
  public open(tableData: Array<TiTableRowData>) {
    this.srcData.data = tableData;
    this.total = tableData.length;
    this.numaNodeSwitchDetailsModal.open();
    this.cdr.markForCheck();
  }
}
