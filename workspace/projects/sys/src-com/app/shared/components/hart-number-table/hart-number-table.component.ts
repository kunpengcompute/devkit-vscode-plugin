import { Component, Input, OnChanges, OnInit, ViewEncapsulation, TemplateRef } from '@angular/core';
import { TiModalService, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { INetLoadRawData, IrqAffinityDetail } from 'sys/src-com/app/diagnose-analysis/net-io-detail/domain';
import { HartInterTable } from 'sys/src-com/app/diagnose-analysis/net-io-detail/net-port-display/port-xps-rps/port-hart-inter/domain';
import { I18n } from 'sys/locale';
import { CommonTableData } from 'sys/src-com/app/shared/domain';

type HartInterSingleTableData = INetLoadRawData['irq_affinity_info'];
type IpiInfoData = INetLoadRawData['rps_ipi_info'];

@Component({
  selector: 'app-hart-number-table',
  templateUrl: './hart-number-table.component.html',
  styleUrls: ['./hart-number-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HartNumberTableComponent implements OnInit, OnChanges {

  @Input() ipiInfo: IpiInfoData;
  @Input() hartNumberData: HartInterSingleTableData[];
  @Input() numaNum = 4;

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;

  // 分页数据
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 40, 80, 100],
    size: 10
  };
  public interruptData: CommonTableData = {
    columnsTree: ([] as TiTreeNode[]),
    srcData: {
      data: ([] as Array<TiTableRowData>),
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    }
  };
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
    this.interruptData.srcData.data = !this.hartNumberData.length
      ? []
      : this.handleHartNumberData(this.hartNumberData);
    this.totalNumber = this.srcData.data.length;
    /** 重新赋值触发表格更新 */
    this.interruptData = { ...this.interruptData };
  }

  // 初始化复合表头
  private initTheads() {
    this.interruptData.columnsTree = [
      {
        label: I18n.net_io.xps_rps.hard_info.number,
        key: 'number',
        searchKey: 'number',
        checked: true,
        expanded: true,
        disabled: true,
        canClick: true
      },
      {
        label: I18n.net_io.xps_rps.hard_info.hardware_info,
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: false,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.device_info,
            key: 'deviceName',
            checked: true,
            expanded: true,
            searchKey: 'deviceName',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.PCIE_num,
            key: 'bdf',
            checked: true,
            expanded: true,
            searchKey: 'bdf',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_name,
            key: 'eventName',
            checked: true,
            expanded: true,
            searchKey: 'eventName'
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_bind,
            key: 'affinityMask',
            checked: true,
            expanded: true,
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_time,
            key: 'irqCount',
            checked: true,
            expanded: true,
            sortKey: 'irqCount'
          }
        ]
      },
      {
        label: I18n.net_io.xps_rps.hard_info.rps_xps_info,
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: false,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.network_name,
            key: 'ethName',
            checked: true,
            expanded: true,
            searchKey: 'ethName',
            canClick: true
          },
          {
            label: I18n.net_io.xps_rps.hard_info.network_queue,
            key: 'queueName',
            checked: true,
            expanded: true,
            searchKey: 'queueName',
          },
          {
            label: 'xps_cpus',
            key: 'xpsCpus',
            checked: true,
            expanded: true,
          },
          {
            label: 'rps_cpus',
            key: 'rpxCpus',
            checked: true,
            expanded: true,
            tip: ''
          },
          {
            label: 'rps_flow_cnt',
            key: 'rpsFlowCnt',
            checked: true,
            expanded: true,
            tip: ''
          }
        ]
      },
    ];
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
        ipiData: this.ipiInfo,
        bodyTitle: {
          num, eventName, irqCount,
          numaNode, ethName,
          numaNum: this.numaNum
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
    const { ethName, numaNode } = row;
    const { irqCount, filterHartNumData } = this.filterHartNumData(ethName);

    this.tiModal.open(modal, {
      modalClass: 'hart-name-map-modal map-modal',
      context: {
        irqData: Object.assign({}, ...filterHartNumData),
        ipiData: this.ipiInfo,
        bodyTitle: {
          ethName, irqCount,
          numaNode,
          numaNum: this.numaNum
        }
      }
    });
  }

  /**
   * 打开弹框
   * @param item 子级传来的数据
   */
  triggerPop(item: any, softNumberMapModal: TemplateRef<any>, softNameMapModal: TemplateRef<any>) {
    item.key === 'number'
      ? this.openNumberMapModal(item.row, softNumberMapModal)
      : this.openNameMapModal(item.row, softNameMapModal);
  }

  /**
   * 筛选对应的 网络设备名称 & 计算所有中断频率总和
   * @param ethName 筛选的网络设备名称
   */
  private filterHartNumData(ethName: string) {
    const newEthNameData: HartInterSingleTableData[] = [];
    let irqCount = 0;

    this.hartNumberData.forEach((numData: HartInterSingleTableData) => {
      Object.keys(numData).forEach((key: string) => {
        if (numData[key].eth_name === ethName) {
          irqCount += numData[key].irq_count;
          newEthNameData.push({
            [key]: numData[key]
          });
        }
      });
    });

    return {
      irqCount,
      filterHartNumData: newEthNameData
    };
  }
}
