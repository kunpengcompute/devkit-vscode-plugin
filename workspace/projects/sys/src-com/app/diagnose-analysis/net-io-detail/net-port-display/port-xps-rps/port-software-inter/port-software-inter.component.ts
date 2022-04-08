import { Component, Input, OnInit } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { Affinity, SoftwareInterRowData, SoftwareInterTableData } from '../domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-port-software-inter',
  templateUrl: './port-software-inter.component.html',
  styleUrls: ['./port-software-inter.component.scss']
})
export class PortSoftwareInterComponent implements OnInit {

  @Input() softwareInterData: SoftwareInterTableData;
  @Input() ksoftirqdList: number[];

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];

  constructor(private tiModal: TiModalService) { }

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
    const newData: SoftwareInterRowData[] = [];
    Object.keys(this.softwareInterData).forEach((key: string) => {
      newData.push(this.handelSoftwareInterDatas(this.softwareInterData[key], key));
    });
    this.srcData.data = newData;
  }

  // 初始化 columns
  private initColumns() {
    this.columns = [
      { title: I18n.net_io.xps_rps.software_info.info },
      { title: I18n.net_io.xps_rps.hard_info.inter_time }
    ];
  }

  // 处理 软中断 表格数据
  private handelSoftwareInterDatas(softwareData: Affinity, type: string) {
    const frequency = softwareData.softirq_count;

    return {
      type,
      frequency,
      softCountList: softwareData.softirq_count_list
    };
  }

  /**
   * 打开软中断 分布图弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   */
    public openMapModal(row: SoftwareInterRowData, modal: any) {
      const { type, frequency } = row;
      const softIrqData = {
        irqs: row.softCountList,
        ksofts: this.ksoftirqdList
      };

      this.tiModal.open(modal, {
        modalClass: 'soft-map-modal map-modal',
        context: {
          bodyTitle: {
            type,
            frequency
          },
          softIrqData
        }
      });
    }

}
