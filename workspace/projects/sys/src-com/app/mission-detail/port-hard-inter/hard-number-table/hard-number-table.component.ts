import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HartInterSingleTableData, IrqAffinityDetail } from '../component/domain';
import { HartInterTable, Theads } from '../domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-hard-number-table',
  templateUrl: './hard-number-table.component.html',
  styleUrls: ['./hard-number-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HardNumberTableComponent implements OnInit, OnChanges {

  @Input() hartNumberData: HartInterSingleTableData[];

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public theads: Theads[][];

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };

  public processSearchWords = ['', '', '', '', ''];
  public processSearchKeys = ['number', 'deviceName', 'bdf', 'eventName', 'ethName'];

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
    this.initTheads();

    this.initSrcData();

  }

  ngOnChanges(): void {
    if (this.srcData?.data) {
      this.initSrcData();
    }
  }

  // 初始化表格数据
  private initSrcData() {
    this.srcData.data = !this.hartNumberData.length
      ? []
      : this.handleHartNumberData(this.hartNumberData);
    this.totalNumber = this.srcData.data.length;
  }

  // 初始化复合表头
  private initTheads() {
    this.theads = [
      [
        { title: I18n.net_io.xps_rps.hard_info.number, rowspan: 2, searchKey: 'number' },
        { title: I18n.net_io.xps_rps.hard_info.hardware_info, colspan: 5, textAlign: 'center' },
        { title: I18n.net_io.xps_rps.hard_info.rps_xps_info, colspan: 5, textAlign: 'center' }
      ],
      [
        { title: I18n.net_io.xps_rps.hard_info.device_info , searchKey: 'deviceName'},
        { title: I18n.net_io.xps_rps.hard_info.PCIE_num, searchKey: 'bdf'},
        { title: I18n.net_io.xps_rps.hard_info.inter_name, searchKey: 'eventName' },
        { title: I18n.net_io.xps_rps.hard_info.inter_time, sortKey: 'irqCount' },
        { title: I18n.net_io.xps_rps.hard_info.inter_bind },
        { title: I18n.net_io.xps_rps.hard_info.network_name , searchKey: 'ethName'},
        { title: I18n.net_io.xps_rps.hard_info.network_queue },
        { title: 'xps_cpus' },
        { title: 'rps_cpus' },
        { title: 'rps_flow_cnt' }
      ]
    ];
    this.columns = [].concat(...this.theads).filter((column: Theads) => !column.colspan);
  }

  /**
   * 对表格数据进行处理
   * @param hartNumberData 表格数据
   */
  private handleHartNumberData(hartNumberData: HartInterSingleTableData[]) {
    const newData: HartInterTable[] = [];
    hartNumberData.forEach((data: HartInterSingleTableData) => {
      Object.keys(data).forEach((key: string) => {
        const {
          irq_device_name, irq_device_bdf, irq_event_name,
          irq_count, irq_affinity_mask, eth_name, queue_name,
          xps_affinity_mask, rps_affinity_mask, rps_flow_cnt,
          irq_count_list, numa_node
        } = data[key];

        newData.push({
          number: key,
          deviceName: irq_device_name,
          bdf: irq_device_bdf,
          eventName: irq_event_name,
          irqCount: irq_count,
          affinityMask: irq_affinity_mask,
          ethName: eth_name,
          queueName: queue_name,
          xpsCpus: xps_affinity_mask,
          rpxCpus: rps_affinity_mask,
          rpsFlowCnt: rps_flow_cnt,
          irqCountList: irq_count_list,
          numaNode: numa_node
        });
      });
    });
    return newData;
  }

  /**
   * 打开硬中断编号 分布图弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   */
   public openNumberMapModal(row: HartInterTable, modal: any) {
    let hartData: IrqAffinityDetail;
    const { number: num, eventName, irqCount, numaNode, ethName } = row;

    this.hartNumberData.forEach((data: HartInterSingleTableData) => {
      hartData = hartData ?? data[row.number];
    });

    this.tiModal.open(modal, {
      modalClass: 'hart-map-modal map-modal',
      context: {
        hartData,
        bodyTitle: {
          num, eventName, irqCount,
          numaNode, ethName
        }
      }
    });
  }

  /**
   * 打开网络设备名称 分布图弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   */
   public openNameMapModal(row: HartInterTable, modal: any) {
    if (row.ethName === '--') { return; }
    const { ethName, irqCount, numaNode } = row;

    this.tiModal.open(modal, {
      modalClass: 'hart-name-map-modal map-modal',
      context: {
        irqData: Object.assign({}, ...this.hartNumberData),
        bodyTitle: {
          ethName, irqCount,
          numaNode
        }
      }
    });
  }

  public onProcessSearch(key: string, value: string) {
    const keyIndex = this.processSearchKeys.indexOf(key);
    if (keyIndex > -1) {
      this.processSearchWords[keyIndex] = value || '';
    }
  }

}
