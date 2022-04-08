import { Component, Input, OnInit } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { AffinityMaskDict, HartInterTable, Theads } from '../../domain';
import { I18n } from 'sys/locale';
import { INetLoadRawData } from 'sys/src-com/app/diagnose-analysis/net-io-detail/domain';

@Component({
  selector: 'app-irq-modal-table',
  templateUrl: './irq-modal-table.component.html',
  styleUrls: ['./irq-modal-table.component.scss']
})
export class IrqModalTableComponent implements OnInit {

  @Input() ipiInfo: INetLoadRawData['rps_ipi_info'];
  @Input() dataList: AffinityMaskDict;

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public theads: Theads[][];

  public traceHeadShow: boolean;
  public treeData: TiTreeNode[];

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
    this.srcData.data = this.handleIrqrData(this.dataList);

    this.initTree();
  }

  // 初始化复合表头
  private initTheads() {
    this.theads = [
      [
        { title: I18n.net_io.xps_rps.hard_info.number, rowspan: 2, checked: true },
        { title: I18n.net_io.xps_rps.hard_info.hardware_info, colspan: 3, textAlign: 'center', checked: true },
        { title: I18n.net_io.xps_rps.hard_info.rps_xps_info, colspan: 3, textAlign: 'center', checked: true },
      ],
      [
        { title: I18n.net_io.xps_rps.hard_info.device_info, checked: false },
        { title: I18n.net_io.xps_rps.hard_info.PCIE_num, checked: false },
        { title: I18n.net_io.xps_rps.hard_info.inter_name, checked: true },
        { title: I18n.net_io.xps_rps.hard_info.inter_time, checked: true },
        { title: I18n.net_io.xps_rps.hard_info.inter_bind, checked: true },
        { title: I18n.net_io.xps_rps.hard_info.network_name, checked: true },
        { title: I18n.net_io.xps_rps.hard_info.network_queue, checked: false },
        { title: 'xps_cpus', checked: true },
        { title: 'rps_cpus', checked: true },
        { title: 'rps_flow_cnt', checked: false }
      ]
    ];
    this.columns = [].concat(...this.theads).filter((column: Theads) => !column.colspan);
  }

  // 初始化树形结构
  private initTree() {
    this.treeData = [
      { label: I18n.net_io.xps_rps.hard_info.number, disabled: true, checked: true },
      {
        label: I18n.net_io.xps_rps.hard_info.hardware_info,
        expanded: true,
        checked: 'indeterminate',
        textAlign: 'center',
        children: [
          { label: I18n.net_io.xps_rps.hard_info.device_info },
          { label: I18n.net_io.xps_rps.hard_info.PCIE_num },
          { label: I18n.net_io.xps_rps.hard_info.inter_name, checked: true },
          { label: I18n.net_io.xps_rps.hard_info.inter_time, checked: true },
          { label: I18n.net_io.xps_rps.hard_info.inter_bind, checked: true }
        ]
      },
      {
        label: I18n.net_io.xps_rps.hard_info.rps_xps_info,
        expanded: true,
        checked: 'indeterminate',
        textAlign: 'center',
        children: [
          { label: I18n.net_io.xps_rps.hard_info.network_name, checked: true },
          { label: I18n.net_io.xps_rps.hard_info.network_queue },
          { label: 'xps_cpus', checked: true },
          { label: 'rps_cpus', checked: true },
          { label: 'rps_flow_cnt' }
        ]
      }
    ];
  }

  /**
   * 对表格数据进行处理
   * @param irqList 硬中断绑核信息表格数据
   */
  private handleIrqrData(irqList: AffinityMaskDict) {
    const newData: HartInterTable[] = [];

    Object.keys(irqList).forEach((key: string) => {
      const {
        irq_device_name, irq_device_bdf, irq_event_name,
        irq_count, irq_affinity_mask, eth_name, queue_name,
        xps_affinity_mask, rps_affinity_mask, rps_flow_cnt,
        numa_node
      } = irqList[key];

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
        numaNode: numa_node
      });
    });
    return newData;
  }

  // 筛选树组件改变触发
  public selectFn(): void {
    const firstRow: Theads[] = [];
    const secondRow: Theads[] = [];
    this.treeData.forEach((tree: TiTreeNode) => {
      let colspan = 0;
      if (tree.children) {
        tree.children.forEach((child: TiTreeNode) => {
          if (child.checked) {
            colspan++;
          }
          secondRow.push({
            title: child.label,
            checked: child.checked,
            colspan: 1
          });
        });
      }
      firstRow.push({
        title: tree.label,
        colspan: tree.children ? colspan : 1,
        rowspan: tree.children ? 1 : 2,
        checked: tree.checked,
        textAlign: tree.textAlign
      });
    });

    this.theads = [ firstRow, secondRow ];
    this.columns = [].concat(...this.theads).filter((column: Theads) =>
      column.colspan === 1 && column.checked !== 'indeterminate'
    );
  }

  /**
   * 打开硬中断编号 分布图弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   */
   public openNumberMapModal(row: HartInterTable, modal: any) {
    const { number: num, eventName, irqCount, numaNode, ethName } = row;

    this.tiModal.open(modal, {
      modalClass: 'hart-map-modal map-modal',
      context: {
        hartData: this.dataList[row.number],
        ipiInfo: this.ipiInfo,
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
    const { ethName, numaNode } = row;
    const { irqCount, filterHartNumData } = this.filterHartNumData(ethName);

    this.tiModal.open(modal, {
      modalClass: 'hart-name-map-modal map-modal',
      context: {
        irqData: Object.assign({}, ...filterHartNumData),
        ipiInfo: this.ipiInfo,
        bodyTitle: {
          ethName, irqCount,
          numaNode
        }
      }
    });
  }

  /**
   * 筛选对应的 网络设备名称 & 计算所有中断频率总和
   * @param ethName 筛选的网络设备名称
   */
   private filterHartNumData(ethName: string) {
    const newEthNameData: AffinityMaskDict[] = [];
    let irqCount = 0;

    Object.keys(this.dataList).forEach((key: string) => {
      if (this.dataList[key].eth_name === ethName) {
        irqCount += this.dataList[key].irq_count;
        newEthNameData.push({
          [key]: this.dataList[key]
        });
      }
    });

    return {
      irqCount,
      filterHartNumData: newEthNameData
    };
  }
}
