import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { TiModalService, TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { AffinityMaskDict, HartInterTable, Theads } from '../../domain';
import { INetLoadRawData } from '../../component/domain';
import { PopDirective } from 'sys/src-com/app/shared/directives/pop/pop.directive';
import { I18n } from 'sys/locale';
import { Cat } from 'hyper';

@Component({
  selector: 'app-irq-modal-table',
  templateUrl: './irq-modal-table.component.html',
  styleUrls: ['./irq-modal-table.component.scss']
})
export class IrqModalTableComponent implements OnInit {
  /** 搜索组件 */
  @ViewChildren('processSearchPop') processSearchPop: any;

  @Input() dataList: AffinityMaskDict;
  @Input() ipiInfo: INetLoadRawData['rps_ipi_info'];
  @Input() numaNum: any;

  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public columns: Array<TiTableColumns> = [];
  public theads: Theads[][];

  public traceHeadShow: boolean;
  public treeData: TiTreeNode[];
  public treeData1: any;
  tableData: {
    srcData: {
      data: any[];
      state: { searched: boolean; sorted: boolean; paginated: boolean; };
    }; columnsTree: any[];
  };
  public processSearchWords = ['', '', '', '', ''];
  public processSearchKeys = ['number', 'deviceName', 'bdf', 'eventName', 'ethName'];
  public searchWordsSave: { [key: string]: string } = {};

  /**
   * 过滤后的数据的备份，为了修复
   * tiny表格的搜索功能在第一次搜索之后会修改srcData
   * 导致后续搜索结果异常的问题
   */
  private filterData: TiTableRowData[];

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
    this.filterData = this.srcData.data.slice();

    this.initTree();
  }

  /**
   * 表头搜索弹框点击搜索事件监控
   * @param searchText 搜索文本
   * @param column 搜索列
   */
  public onTableHeaderSearch(searchText?: any, column?: any) {
    if (column) {
      const index = this.processSearchKeys.indexOf(column.key);
      if (index > -1 && this.processSearchKeys.length > index) {
        this.searchWordsSave[column.key] = searchText ?? '';
        this.processSearchWords[index] = this.searchWordsSave[column.key];
      }
      if (index > -1 && this.processSearchPop._results?.length > 0) {
        const curSearchPop: PopDirective
          = this.processSearchPop._results.find((item: any) => item.popContext.key === column.key);
        curSearchPop.hide();
      }
    }
    const tempData: Array<any> = [];
    this.filterData.forEach((item: any) => {
      let add = true;
      this.processSearchWords.forEach((searchWord: any, wordIndex: number) => {
        const searchKey = this.processSearchKeys[wordIndex];
        if (typeof item[searchKey] === 'string') {
          if (item[searchKey].toLowerCase().indexOf(searchWord.trim().toLowerCase()) === -1) {
            add = false;
          }
        }
        if (Cat.isObj(item[searchKey])) {
          if (item[searchKey].value.toLowerCase().indexOf(searchWord.trim().toLowerCase()) === -1) {
            add = false;
          }
        }
      });
      if (add) {
        tempData.push(item);
      }
    });
    setTimeout(() => {  // 需要异步更新
      this.srcData.data = tempData;
    });
  }

  // 初始化复合表头
  private initTheads() {
    this.theads = [
      [
        { title: I18n.net_io.xps_rps.hard_info.number, rowspan: 2, checked: true, searchKey: 'number' },
        { title: I18n.net_io.xps_rps.hard_info.hardware_info, colspan: 3, textAlign: 'center', checked: true },
        { title: I18n.net_io.xps_rps.hard_info.rps_xps_info, colspan: 3, textAlign: 'center', checked: true },
      ],
      [
        { title: I18n.net_io.xps_rps.hard_info.device_info, checked: false, searchKey: 'deviceName' },
        { title: I18n.net_io.xps_rps.hard_info.PCIE_num, checked: false, searchKey: 'bdf' },
        { title: I18n.net_io.xps_rps.hard_info.inter_name, checked: true, searchKey: 'eventName' },
        { title: I18n.net_io.xps_rps.hard_info.inter_time, checked: true, sortKey: 'irqCount' },
        { title: I18n.net_io.xps_rps.hard_info.inter_bind, checked: true },
        { title: I18n.net_io.xps_rps.hard_info.network_name, checked: true, searchKey: 'ethName' },
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
      { label: I18n.net_io.xps_rps.hard_info.number, disabled: true, checked: true, searchKey: 'number' },
      {
        label: I18n.net_io.xps_rps.hard_info.hardware_info,
        expanded: true,
        checked: 'indeterminate',
        textAlign: 'center',
        children: [
          { label: I18n.net_io.xps_rps.hard_info.device_info, searchKey: 'deviceName' },
          { label: I18n.net_io.xps_rps.hard_info.PCIE_num, searchKey: 'bdf' },
          { label: I18n.net_io.xps_rps.hard_info.inter_name, checked: true, searchKey: 'eventName' },
          { label: I18n.net_io.xps_rps.hard_info.inter_time, checked: true, sortKey: 'irqCount' },
          { label: I18n.net_io.xps_rps.hard_info.inter_bind, checked: true }
        ]
      },
      {
        label: I18n.net_io.xps_rps.hard_info.rps_xps_info,
        expanded: true,
        checked: 'indeterminate',
        textAlign: 'center',
        children: [
          { label: I18n.net_io.xps_rps.hard_info.network_name, checked: true, searchKey: 'ethName' },
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
    let copNumber = 0;
    this.treeData.forEach((tree: TiTreeNode) => {
      let colspan = 0;
      if (tree.children) {
        tree.children.forEach((child: TiTreeNode) => {
          if (child.checked) {
            colspan++;
            if (child.checked !== 'indeterminate') {
              copNumber++;
            }
          }
          secondRow.push({
            title: child.label,
            checked: child.checked,
            colspan: 1,
            searchKey: child.searchKey,
            sortKey: child.sortKey
          });
        });
      } else if (tree.checked !== 'indeterminate') {
        copNumber++;
      }
      firstRow.push({
        title: tree.label,
        colspan: tree.children ? colspan : 1,
        rowspan: tree.children ? 1 : 2,
        checked: tree.checked,
        textAlign: tree.textAlign,
        searchKey: tree.searchKey
      });
    });

    this.theads = [firstRow, secondRow];
    const dedterColums = [].concat(...this.theads).filter((column: Theads) =>
      column.colspan === 1 && column.checked !== 'indeterminate'
    );
    const Percentage = `${(100 / copNumber).toFixed(2)}%`;
    this.columns = dedterColums.map((item: Theads) => {
      item.width = Percentage;
      return item;
    });
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
          numaNode, ethName,
          numaNum: this.numaNum,

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
          numaNode,
          numaNum: this.numaNum,
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
