import { Component, OnInit } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { TiTableComponent } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

import {
  CompareSelectValue,
  IrqNumberType,
  NetworkType,
  QueryTypeEnum,
  RespBondInfoDictCompare,
  RespEthIrqAffinityInfoCompare,
  RespNetConfigCompare,
  RespNetInterfaceCompare
} from './sys-config-net-compare.type';

@Component({
  selector: 'app-sys-config-net-compare',
  templateUrl: './sys-config-net-compare.component.html',
  styleUrls: ['./sys-config-net-compare.component.scss'],
  providers: [
    { provide: TiTableComponent }
  ]
})
export class SysConfigNetCompareComponent implements OnInit {
  public tableData = {
    // 网络网口
    netInterface: {
      title: '',
      isFilters: true,
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      },
      columnsTree: [] as Array<CommonTreeNode>,
      allData: [],
      diffData: [],
    } as CommonTableData,

    // 网络绑定
    bondInfoDict: {
      title: '',
      isFilters: false,
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      },
      columnsTree: [],
      allData: [],
      diffData: [],
    } as CommonTableData,

    // 硬中断信息
    ethIrqAffinityInfo: {
      title: '',
      isFilters: true,
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      },
      columnsTree: [],
      allData: [],
      diffData: [],
    } as CommonTableData,
  };

  /** 对应三个表格参数 */
  public queryType: QueryTypeEnum[] = [
    QueryTypeEnum.IfaceConfigInfo,
    QueryTypeEnum.BondInfoDict,
    QueryTypeEnum.EthIrqAffinityInfo
  ];
  public objectType = {
    object1: 'object1',
    object2: 'object2',
  };
  public diskDiff = true;
  public bondDiff = true;
  public ethDiff = true;
  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
  ) { }

  ngOnInit() {

    // 初始化网络网口表格列
    this.initNetInterfaceTableColumn();

    // 初始化网络绑定表格列
    this.initBondInfoDictTableColumn();

    // 初始化中断信息表格列
    this.initEthIrqAffinityInfoTableColumn();

    // 获取数据
    this.queryType.forEach((type) => {
      this.getData(type).then(data => {
        if (data) {
          this.handleTableData(type, data);
        }
      });
    });
  }

  /**
   * 初始化网络网口表格列
   */
  private initNetInterfaceTableColumn() {
    this.tableData.netInterface.title = I18n.tuninghelper.sysConfigDetail.netInterface;
    this.tableData.netInterface.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.network,
        width: '100px',
        checked: true,
        key: 'network',
        searchKey: 'network',
        disabled: true,
      },
      {
        label: I18n.tuninghelper.compare.compareObject,
        width: '100px',
        checked: true,
        key: 'compareNode',
        disabled: true,
      },
      {
        label: 'Status',
        width: '100px',
        checked: true,
        key: 'status',
      },
      {
        label: 'IPv4',
        width: '100px',
        checked: true,
        key: 'ipv4',
      },
      {
        label: 'IPv6',
        width: '100px',
        checked: true,
        key: 'ipv6',
      },
      {
        label: 'Supported Ports',
        width: '100px',
        checked: true,
        key: 'supportPort',
      },
      {
        label: 'Speed(MiB/s)',
        width: '100px',
        checked: true,
        key: 'speed',
      },
      {
        label: 'Duplex',
        width: '100px',
        checked: true,
        key: 'duplex',
      },
      {
        label: 'NUMA NODE',
        width: '100px',
        checked: true,
        key: 'numaNode',
      },
      {
        label: 'Driver',
        width: '240px',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'driver',
            width: '80px',
            checked: true,
            key: 'driver',
          },
          {
            label: 'version',
            width: '80px',
            checked: true,
            key: 'version',
          },
          {
            label: 'firmware version',
            width: '80px',
            checked: true,
            key: 'firmwareVersion',
          },
        ],
      },
      {
        label: 'Coalesce',
        width: '480px',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'adaptive-rx',
            checked: true,
            key: 'adaptiveRx',
          },
          {
            label: 'adaptive-tx',
            checked: true,
            key: 'adaptiveTx',
          },
          {
            label: 'rx-usecs',
            checked: true,
            key: 'rxUsecs',
          },
          {
            label: 'tx-usecs',
            checked: true,
            key: 'txUsecs',
          },
          {
            label: 'rx-framcs',
            checked: true,
            key: 'rxFramcs',
          },
          {
            label: 'tx-framcs',
            checked: true,
            key: 'txFramcs',
          },
        ],
      },
      {
        label: 'Offload',
        width: '640px',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'rx-checksumming',
            checked: true,
            key: 'offLoadRx',
          },
          {
            label: 'tx-checksumming',
            checked: true,
            key: 'offLoadTx',
          },
          {
            label: 'scatter-gatter',
            checked: true,
            key: 'scattor',
          },
          {
            label: 'TSO',
            checked: true,
            key: 'tso',
          },
          {
            label: 'UFO',
            checked: true,
            key: 'ufo',
          },
          {
            label: 'LRO',
            checked: true,
            key: 'lro',
          },
          {
            label: 'GSO',
            checked: true,
            key: 'gso',
          },
          {
            label: 'GRO',
            checked: true,
            key: 'gro',
          },
        ],
      },
      {
        label: 'Channels',
        width: '100px',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'combined',
            checked: true,
            key: 'combined',
          },
        ],
      },
      {
        label: 'Ring Buffer',
        width: '160px',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'Tx',
            checked: true,
            key: 'tx',
          },
          {
            label: 'Rx',
            checked: true,
            key: 'rx',
          },
        ],
      },
    ];
    this.tableData.netInterface.columnsTree.forEach((v: any) => {
      if (v.children?.length) {
        v.width = `${100 * v.children.length}px`;
      } else {
        v.width = '100px';
      }
    });
  }

  /**
   * 初始化网络绑定表格列
   */
  private initBondInfoDictTableColumn() {
    this.tableData.bondInfoDict.title = I18n.tuninghelper.sysConfigDetail.netBond;
    this.tableData.bondInfoDict.columnsTree = [
      {
        label: I18n.net_io.network_config.bind_name,
        width: '20%',
        checked: true,
        key: 'bondName',
        searchKey: 'bondName'
      },
      {
        label: I18n.tuninghelper.compare.compareObject,
        width: '20%',
        checked: true,
        key: 'compareNode',
      },
      {
        label: 'IPv4',
        width: '20%',
        checked: true,
        key: 'ipv4',
      },
      {
        label: 'IPv6',
        width: '20%',
        checked: true,
        key: 'ipv6',
      },
      {
        label: I18n.mission_create.bindMode,
        width: '20%',
        checked: true,
        key: 'mode',
      },
      {
        label: 'Network Interface',
        width: '20%',
        checked: true,
        key: 'networkInterface',
      },
    ];
  }

  /**
   * 初始化中断信息表格列
   */
  private initEthIrqAffinityInfoTableColumn() {
    this.tableData.ethIrqAffinityInfo.title = I18n.tuninghelper.sysConfigDetail.irqInfo;
    this.tableData.ethIrqAffinityInfo.columnsTree = [
      {
        label: I18n.net_io.xps_rps.hard_info.number,
        width: '10%',
        checked: true,
        key: 'irqNumber',
        searchKey: 'irqNumber',
        disabled: true,
        searchByCompare: true,
        uniqueKey: 'irqNumber'
      },
      {
        label: I18n.tuninghelper.compare.compareObject,
        checked: true,
        width: '10%',
        key: 'compareNode',
        disabled: true
      },
      {
        label: I18n.net_io.xps_rps.hard_info.hardware_info,
        width: '35%',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.device_info,
            checked: true,
            key: 'irq_device_name',
            searchKey: 'irq_device_name',
            searchByCompare: true
          },
          {
            label: I18n.net_io.xps_rps.hard_info.PCIE_num,
            checked: true,
            key: 'irq_device_bdf',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_name,
            checked: true,
            key: 'irq_event_name',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_bind,
            checked: true,
            key: 'irq_affinity_mask',
          },
        ],
      },
      {
        label: I18n.net_io.xps_rps.hard_info.rps_xps_info,
        width: '45%',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.network_name,
            checked: true,
            key: 'eth_name',
            searchKey: 'eth_name',
            searchByCompare: true
          },
          {
            label: I18n.net_io.xps_rps.hard_info.network_queue,
            checked: true,
            key: 'queue_name',
          },
          {
            label: 'xps_cpus',
            checked: true,
            key: 'xps_affinity_mask',
          },
          {
            label: 'rps_cpus',
            checked: true,
            key: 'rps_affinity_mask',
          },
          {
            label: 'rps_flow_cnt',
            checked: true,
            key: 'rps_flow_cnt',
          },
        ],
      },
    ];
  }

  private handleTableData(type: QueryTypeEnum, data: any) {
    switch (type) {
      // 网络网口数据
      case QueryTypeEnum.IfaceConfigInfo:
        if (data.iface_config_info) {
          this.initNetInterface(data.iface_config_info);
        }
        break;

      // 网络绑定数据
      case QueryTypeEnum.BondInfoDict:
        if (data.bond_info_dict) {
          this.initBondInfoDict(data.bond_info_dict);
        }
        break;

      // 中断信息
      case QueryTypeEnum.EthIrqAffinityInfo:
        if (data.eth_irq_affinity_info) {
          this.initEthIrqAffinityInfo(data.eth_irq_affinity_info);
        }
        break;

      default:
        break;
    }
  }

  /**
   * 获取网络网口表格显示数据
   * @param data 返回的网络网口数据
   */
  private initNetInterface(data: RespNetInterfaceCompare) {
    if (JSON.stringify(data) === '{}') { return; }

    Object.keys(data).forEach((network) => {
      if (data[network]) {
        // 获取全部数据
        this.getNetInterfaceTableRow(network, data[network], CompareSelectValue.All);
      }
      if (data[network]?.status === CompareSelectValue.Difference) {
        // 获取不一致数据
        this.getNetInterfaceTableRow(network, data[network], CompareSelectValue.Difference);
      }
    });
    this.tableData.netInterface.srcData.data = Array.from(this.tableData.netInterface.diffData);
    /** 重新赋值触发表格更新 */
    this.tableData.netInterface = { ...this.tableData.netInterface };
    this.tableData.netInterface = this.dealTableData(this.tableData.netInterface);
  }

  /**
   * 获取网络网口表格行数据
   * @param network 网络接口名
   * @param networkObj 数据信息
   */
  private getNetInterfaceTableRow(network: string, networkObj: NetworkType, compare: CompareSelectValue) {
    const getTableRow = (nodeArr: string[], compareNode: string) => {
      const [
        status, ipv4, ipv6, supportPort,
        speed, duplex, numaNode,
        // Driver
        driver, version, firmwareVersion,
        // Coalesce
        adaptiveRx, adaptiveTx,
        // Offload
        rxUsecs, txUsecs,
        rxFramcs, txFramcs,
        // Channels
        offLoadRx, offLoadTx, scattor,
        tso, ufo, lro, gso, gro,
        // Ring Buffer
        combined, tx, rx,
      ] = nodeArr;
      return {
        network, compareNode, status, ipv4, ipv6, supportPort,
        speed, duplex, numaNode,
        driver, version, firmwareVersion,
        adaptiveRx, adaptiveTx,
        rxUsecs, txUsecs,
        rxFramcs, txFramcs,
        offLoadRx, offLoadTx, scattor,
        tso, ufo, lro, gso, gro,
        combined, tx, rx,
      };
    };

    const row1: any = getTableRow(networkObj.node1, I18n.tuninghelper.compare.object1);
    const row2: any = getTableRow(networkObj.node2, I18n.tuninghelper.compare.object2);
    // 不同项用对象保存
    Object.keys(row1).forEach((key: string) => {
      // row1[key],row2[key]  可能会存在 undefined 或 '--',统一成'--'
      const compareKey1 = row1[key] || '--';
      const compareKey2 = row2[key] || '--';
      if (compareKey1 !== compareKey2 && key !== 'compareNode') {
        row1[key] = {
          value: compareKey1,
          difference: this.objectType.object1,
        };
        row2[key] = {
          value: compareKey2,
          // 表格列对齐
          difference: this.objectType.object2,
        };
      }
    });
    if (compare === CompareSelectValue.All) {
      this.tableData.netInterface.allData.push(row1, row2);
    } else {
      this.tableData.netInterface.diffData.push(row1, row2);
    }
  }
  /**
   * 获取网络绑定表格显示数据
   * @param data 返回的网络绑定数据
   */
  private initBondInfoDict(data: RespBondInfoDictCompare) {
    if (JSON.stringify(data) === '{}') { return; }

    Object.keys(data).forEach((bondName) => {
      if (data[bondName]) {
        // 获取全部数据
        this.getBondInfoDictTableRow(bondName, data[bondName], CompareSelectValue.All);
      }
      if (data[bondName].status === CompareSelectValue.Difference) {
        // 获取不一致数据
        this.getBondInfoDictTableRow(bondName, data[bondName], CompareSelectValue.Difference);
      }
    });

    this.tableData.bondInfoDict.srcData.data = Array.from(this.tableData.bondInfoDict.diffData);
    /** 重新赋值触发表格更新 */
    this.tableData.bondInfoDict = { ...this.tableData.bondInfoDict };
    this.tableData.bondInfoDict = this.dealTableData(this.tableData.bondInfoDict);
  }

  /**
   * 获取网络绑定表格行数据
   * @param bondName 绑定名称
   * @param bondNameObj 绑定名称对象信息
   */
  private getBondInfoDictTableRow(bondName: string, bondNameObj: NetworkType, compare: CompareSelectValue) {
    const getTableRow = (nodeArr: string[], compareNode: string) => {
      const [bondname, ipv4, ipv6, mode, networkInterface] = nodeArr;
      return { bondName, compareNode, ipv4, ipv6, mode, networkInterface };
    };

    const row1: any = getTableRow(bondNameObj.node1, I18n.tuninghelper.compare.object1);
    const row2: any = getTableRow(bondNameObj.node2, I18n.tuninghelper.compare.object2);
    // 不同项用对象保存
    Object.keys(row1).forEach((key: string) => {
      if (row1[key] !== row2[key] && key !== 'compareNode') {
        row1[key] = {
          value: row1[key] || '--',
          difference: this.objectType.object1,
        };
        row2[key] = {
          value: row2[key] || '--',
          // 表格列对齐
          difference: this.objectType.object2,
        };
      }
    });
    if (compare === CompareSelectValue.All) {
      this.tableData.bondInfoDict.allData.push(row1, row2);
    } else {
      this.tableData.bondInfoDict.diffData.push(row1, row2);
    }
  }

  /**
   * 获取硬中断信息表格显示数据
   * @param data 返回的硬中断信息数据
   */
  private initEthIrqAffinityInfo(data: RespEthIrqAffinityInfoCompare) {
    if (JSON.stringify(data) === '{}') { return; }

    Object.keys(data).forEach((irqNumber: any) => {
      const irqNumberObj: IrqNumberType = data[irqNumber];
      // 获取全部数据
      this.getEthIrqAffinityInfoTableRow(irqNumber, irqNumberObj, CompareSelectValue.All);

      let isSame = true;
      Object.keys(irqNumberObj).forEach(key => {
        // 不显示'irq_count', 'numa_node', 'irq_count_list'这三列
        if (irqNumberObj[key].status === CompareSelectValue.Difference
          && !['irq_count', 'numa_node', 'irq_count_list'].includes(key)) {
          isSame = false;
        }
      });
      if (!isSame) {
        // 获取不一致数据
        this.getEthIrqAffinityInfoTableRow(irqNumber, irqNumberObj, CompareSelectValue.Difference);
      }
    });

    this.tableData.ethIrqAffinityInfo.srcData.data = Array.from(this.tableData.ethIrqAffinityInfo.diffData);
    /** 重新赋值触发表格更新 */
    this.tableData.ethIrqAffinityInfo = { ...this.tableData.ethIrqAffinityInfo };
    this.tableData.ethIrqAffinityInfo = this.dealTableData(this.tableData.ethIrqAffinityInfo);
  }

  /**
   * 获取硬中断信息表格行数据
   * @param irqNumber 中断编号
   * @param irqNumberObj 中断编号对应的信息
   */
  private getEthIrqAffinityInfoTableRow(irqNumber: string, irqNumberObj: IrqNumberType, compare: CompareSelectValue) {
    const getRowObj = (node: 'node1' | 'node2', nodeName: string) => {
      let rowObj: any = {};
      Object.keys(irqNumberObj).forEach(keyName => {
        rowObj[keyName] = irqNumberObj[keyName][node];
      });
      rowObj = {
        irqNumber,
        compareNode: nodeName,
        ...rowObj,
      };
      return rowObj;
    };
    const row1: any = getRowObj('node1', I18n.tuninghelper.compare.object1);
    const row2: any = getRowObj('node2', I18n.tuninghelper.compare.object2);
    // 不同项用对象保存
    Object.keys(row1).forEach((key: string) => {
      if (row1[key] !== row2[key] && key !== 'compareNode') {
        row1[key] = {
          value: row1[key],
          difference: this.objectType.object1,
        };
        row2[key] = {
          value: row2[key],
          // 为了表格列对齐
          difference: this.objectType.object2,
        };
      }
    });
    if (compare === CompareSelectValue.All) {
      this.tableData.ethIrqAffinityInfo.allData.push(row1, row2);
    } else {
      this.tableData.ethIrqAffinityInfo.diffData.push(row1, row2);
    }
  }

  private async getData(type: QueryTypeEnum) {
    const params = {
      id: this.statusService.taskId,
      type: 'network',
      'query-type': JSON.stringify([type]),
    };
    const resp: RespCommon<RespNetConfigCompare> = await this.http.get(
      '/data-comparison/system-config-comparison/',
      { params }
    );
    return resp?.data;
  }

  public onFilterChange(type: QueryTypeEnum, columnsTree: CommonTreeNode[]) {
    let diff;
    switch (type) {
      case QueryTypeEnum.IfaceConfigInfo:
        this.tableData.netInterface.columnsTree = columnsTree;
        diff = this.diskDiff;
        break;

      case QueryTypeEnum.BondInfoDict:
        this.tableData.bondInfoDict.columnsTree = columnsTree;
        diff = this.bondDiff;
        break;

      case QueryTypeEnum.EthIrqAffinityInfo:
        this.tableData.ethIrqAffinityInfo.columnsTree = columnsTree;
        diff = this.ethDiff;
        break;

      default:
        break;
    }
    this.compareSelectedChange(diff ? 'diff' : 'all', type);
  }

  /**
   * 对比选择改变
   * @param val all or False
   */
  public compareSelectedChange(select: 'diff' | 'all', comparetable: QueryTypeEnum) {
    switch (comparetable) {
      case QueryTypeEnum.IfaceConfigInfo:
        this.diskDiff = select === 'all' ? false : true;
        break;

      case QueryTypeEnum.BondInfoDict:
        this.bondDiff = select === 'all' ? false : true;
        break;

      case QueryTypeEnum.EthIrqAffinityInfo:
        this.ethDiff = select === 'all' ? false : true;
        break;

      default:
        break;
    }
    if (select === 'all') {
      switch (comparetable) {
        case QueryTypeEnum.IfaceConfigInfo:
          this.tableData.netInterface.srcData.data = Array.from(this.tableData.netInterface.allData);
          this.tableData.netInterface = { ...this.tableData.netInterface };
          break;

        case QueryTypeEnum.BondInfoDict:
          this.bondDiff = select === 'all' ? false : true;
          this.tableData.bondInfoDict.srcData.data = Array.from(this.tableData.bondInfoDict.allData);
          this.tableData.bondInfoDict = { ...this.tableData.bondInfoDict };
          break;

        case QueryTypeEnum.EthIrqAffinityInfo:
          this.ethDiff = select === 'all' ? false : true;
          this.tableData.ethIrqAffinityInfo.srcData.data = Array.from(this.tableData.ethIrqAffinityInfo.allData);
          this.tableData.ethIrqAffinityInfo = { ...this.tableData.ethIrqAffinityInfo };
          break;

        default:
          break;
      }
    } else {
      switch (comparetable) {
        case QueryTypeEnum.IfaceConfigInfo:
          // tslint:disable-next-line: max-line-length
          this.tableData.netInterface.srcData.data = this.getDiffTableData(this.tableData.netInterface);
          this.tableData.netInterface = { ...this.tableData.netInterface };
          break;

        case QueryTypeEnum.BondInfoDict:
          // tslint:disable-next-line: max-line-length
          this.tableData.bondInfoDict.srcData.data = this.getDiffTableData(this.tableData.bondInfoDict);
          this.tableData.bondInfoDict = { ...this.tableData.bondInfoDict };
          break;

        case QueryTypeEnum.EthIrqAffinityInfo:
          // tslint:disable-next-line: max-line-length
          this.tableData.ethIrqAffinityInfo.srcData.data = this.getDiffTableData(this.tableData.ethIrqAffinityInfo);
          this.tableData.ethIrqAffinityInfo = { ...this.tableData.ethIrqAffinityInfo };
          break;

        default:
          break;
      }
    }
  }

  private getDiffTableData(tableData: any) {
    const getShowKeys = (columns: CommonTreeNode[]) => {
      let result: string[] = [];
      for (const item of columns) {
        if (item.children) {
          result = result.concat(getShowKeys(item.children));
        } else if (!item.disabled && item.checked) {
          result.push(item.key);
        }
      }
      return result;
    };
    const showKeys = getShowKeys(tableData.columnsTree);
    const filteredData = [];
    for (let i = 0; i < tableData.diffData.length; i += 2) {
      const item1 = tableData.diffData[i];
      const diffIndex = showKeys.findIndex(key => item1[key]?.difference === this.objectType.object1);
      if (diffIndex > -1) {
        const item2 = tableData.diffData[i + 1];
        filteredData.push(item1, item2);
      }
    }
    return filteredData;
  }

  private dealTableData(tableData: any) {
    const newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData?.columnsTree?.forEach((columnData: any) => {
      if (columnData.children?.length) {
        columnData?.children.forEach((subColumnData: any) => {
          subColumnData.hasEmptyPlace = newTableData?.srcData?.data.some(
            (item: any) => item[subColumnData.key]?.difference
          );
        });
      } else {
        columnData.hasEmptyPlace = newTableData?.srcData?.data.some(
          (item: any) => item[columnData.key]?.difference
        );
      }
    });
    return newTableData;
  }
}
