import { Component, Input, OnInit } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { SoftwareInterRowData } from '../../domain';

@Component({
  selector: 'app-soft-irq',
  templateUrl: './soft-irq.component.html',
  styleUrls: ['./soft-irq.component.scss']
})
export class SoftIrqComponent implements OnInit {
  @Input()
  set softIrq(value: any) {
    if (value) {
      this.allFilterData = this.handleSoftData(value);
      this.srcData.data = this.handleSoftData(value);
      this.totalNumber = this.srcData.data.length;
    }
  }
  @Input() ksoftirqdList: number[];
  @Input() numaNum = 4;
  constructor(private tiModal: TiModalService) { }
  public allFilterData: SoftwareInterRowData[];
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
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
  }
  /**
   * 初始化表头
   */
  private initColumns() {
    this.columns = [
      {
        title: I18n.tuninghelper.detailedData.irq_type,
        width: '50%',
        filter: true,
        key: 'type',
        selected: null,
        searchable: true,
        options: [],
        multiple: true,
        selectAll: true
      },
      { title: I18n.tuninghelper.detailedData.irq_frequency, width: '50%', sortKey: 'frequency' },
    ];
  }
  /**
   * 处理软中断数据- 处理成key-value列表
   * @param data 字典型软中断数据
   * @returns 软中断表格数据
   */
  public handleSoftData(data: any) {
    const softData: SoftwareInterRowData[] = [];
    Object.keys(data).forEach((key: string) => {
      softData.push({
        type: key,
        frequency: +data[key].softirq_count,
        softCountList: data[key].softirq_count_list,
        label: key
      });
    });
    this.columns[0].options = softData;
    this.columns[0].selected = softData;
    return softData;
  }
  public onSelect(items: any, column: TiTableColumns): void {
    this.srcData.data = this.allFilterData.filter((rowData: TiTableRowData) => {
      for (const columnData of this.columns) {
        if (columnData.selected && columnData.selected.length) {
          const index: number = columnData.selected.findIndex((item: any) => {
            return item.label === rowData[columnData.key];
          });
          if (index < 0) {
            return false;
          }
        }
      }
      return true;
    });
  }

  /**
   * 点击中断类型，查看软中断分布弹框
   * @param row 选中行
   * @param modal 弹框组件
   */
  public viewDetails(row: any, modal: any) {
    const { type, frequency } = row;
    const softIrqData = {
      irqs: row.softCountList,
      ksofts: this.ksoftirqdList
    };
    this.tiModal.open(modal, {
      modalClass: 'softIrqMapModal map-modal',
      context: {
        bodyTitle: {
          type,
          frequency,
          numaNum: this.numaNum
        },
        softIrqData
      }
    });
  }
}
