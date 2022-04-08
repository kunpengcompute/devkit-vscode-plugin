import { Component, OnInit } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import {
  RespBondInfoDict,
  RespEthIrqAffinityInfo,
  RespNetInterface,
  RespSystemConfigNet,
} from '../domain/resp-system-config-net.type';
import { I18n } from 'sys/locale';
import { TiModalService } from '@cloud/tiny3';
import { IrqAffinityDetail } from 'sys/src-com/app/diagnose-analysis/net-io-detail/domain';

@Component({
  selector: 'app-sys-config-net',
  templateUrl: './sys-config-net.component.html',
  styleUrls: ['./sys-config-net.component.scss'],
})
export class SysConfigNetComponent implements OnInit {
  public tableData = {
    netInterface: {
      title: '',
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      },
      columnsTree: [],
    } as CommonTableData,
    bondInfoDict: {
      title: '',
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false,
        },
      },
      columnsTree: [],
    } as CommonTableData,
  };

  public ethIrqAffinityInfo: CommonTableData = {
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
  };

  private irqNumberMap: {
    /** 中断编号：中断信息 */
    [irqNumber: number]: IrqAffinityDetail
  } = {};
  public numaNum = 4;

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private tiModal: TiModalService,
  ) { }

  async ngOnInit() {
    const data = await this.getData();
    if (!data) {
      return;
    }
    this.numaNum = data.context_info.numa_num;
    this.initNetInterface(data.iface_config_info);
    this.initBondInfoDict(data.bond_info_dict);
    this.initEthIrqAffinityInfo(data.eth_irq_affinity_info);
  }

  private initNetInterface(data: RespNetInterface) {
    this.tableData.netInterface.title = I18n.tuninghelper.sysConfigDetail.netInterface;

    const statusFilterOptions: any[] = [];

    this.tableData.netInterface.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.network,
        checked: true,
        key: 'network',
        searchKey: 'network',
        disabled: true,
      },
      {
        label: 'Status',
        checked: true,
        key: 'status',
        filterConfig: {
          options: statusFilterOptions,
          select: this.onFilterSelect
        },
      },
      {
        label: 'IPv4',
        checked: true,
        key: 'ipv4',
      },
      {
        label: 'IPv6',
        checked: true,
        key: 'ipv6',
      },
      {
        label: 'Supported Ports',
        checked: true,
        key: 'supportPort',
      },
      {
        label: 'Speed(MiB/s)',
        checked: true,
        key: 'speed',
      },
      {
        label: 'Duplex',
        checked: true,
        key: 'duplex',
      },
      {
        label: 'NUMA NODE',
        checked: true,
        key: 'numaNode',
      },
      {
        label: 'Driver',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'driver',
            checked: true,
            key: 'driver',
          },
          {
            label: 'version',
            checked: true,
            key: 'version',
          },
          {
            label: 'firmware version',
            checked: true,
            key: 'firmwareVersion',
          },
        ],
      },
      {
        label: 'Coalesce',
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

    if (!data) { return; }

    const statusFilterOptionsMap: any = {};

    this.tableData.netInterface.srcData.data = Object.keys(data).map((network) => {
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
      ] = data[network];

      if (!statusFilterOptionsMap[status]) {
        statusFilterOptionsMap[status] = { label: status };
      }

      return {
        network, status, ipv4, ipv6, supportPort,
        speed, duplex, numaNode,
        driver, version, firmwareVersion,
        adaptiveRx, adaptiveTx,
        rxUsecs, txUsecs,
        rxFramcs, txFramcs,
        offLoadRx, offLoadTx, scattor,
        tso, ufo, lro, gso, gro,
        combined, tx, rx,
      };
    });
    statusFilterOptions.push({ label: I18n.sys_res.all, labelKey: 'all' });
    statusFilterOptions.push(...Object.values(statusFilterOptionsMap));

    /** 重新赋值触发表格更新 */
    this.tableData.netInterface = { ...this.tableData.netInterface };
  }

  private onFilterSelect(selected: any, column: any, columns: any, tableData: any) {
    if (selected.labelKey === 'all') {
      return tableData;
    } else {
      return tableData.filter((rowData: any) => {
        // 遍历所有列
        for (const columnData of columns) {
          if (!columnData.filterConfig?.selected) {
            continue;
          }
          const labelKey = columnData.filterConfig.labelKey || 'label';
          if (!columnData.filterConfig.multiple) {
            return columnData.filterConfig.selected[labelKey] === rowData[columnData.key];
          } else if (columnData.filterConfig.selected.length) {
            const index: number = columnData.filterConfig.selected.findIndex((item: any) => {
              return item[labelKey] === rowData[columnData.key];
            });
            if (index < 0) {
              return false;
            }
          }
        }
        return true;
      });
    }
  }

  private initBondInfoDict(data: RespBondInfoDict) {
    this.tableData.bondInfoDict.title = I18n.tuninghelper.sysConfigDetail.netBond;

    this.tableData.bondInfoDict.columnsTree = [
      {
        label: I18n.net_io.network_config.bind_name,
        width: '20%',
        checked: true,
        key: 'bindName',
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

    if (!data) { return; }

    this.tableData.bondInfoDict.srcData.data = Object.values(data).map((bondData) => {
      const [bindName, ipv4, ipv6, mode, networkInterface] = bondData;

      return {
        bindName, ipv4, ipv6, mode, networkInterface,
      };
    });

    /** 重新赋值触发表格更新 */
    this.tableData.bondInfoDict = { ...this.tableData.bondInfoDict };
  }

  private initEthIrqAffinityInfo(data: RespEthIrqAffinityInfo) {
    this.ethIrqAffinityInfo.title = I18n.tuninghelper.sysConfigDetail.irqInfo;

    this.ethIrqAffinityInfo.columnsTree = [
      {
        label: I18n.net_io.xps_rps.hard_info.number,
        width: '10%',
        checked: true,
        key: 'irqNumber',
        searchKey: 'irqNumber',
        disabled: true,
      },
      {
        label: I18n.net_io.xps_rps.hard_info.hardware_info,
        width: '45%',
        checked: true,
        expanded: true,
        children: [
          {
            label: I18n.net_io.xps_rps.hard_info.device_info,
            checked: true,
            key: 'deviceName',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.PCIE_num,
            checked: true,
            key: 'bdf',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_name,
            checked: true,
            key: 'eventName',
            searchKey: 'eventName'
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_bind,
            checked: true,
            key: 'affinityMask',
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
            key: 'ethName',
            searchKey: 'ethName'
          },
          {
            label: I18n.net_io.xps_rps.hard_info.network_queue,
            checked: true,
            key: 'queueName'
          },
          {
            label: 'xps_cpus',
            checked: true,
            key: 'xpsCpus',
          },
          {
            label: 'rps_cpus',
            checked: true,
            key: 'rpxCpus',
          },
          {
            label: 'rps_flow_cnt',
            checked: true,
            key: 'rpsFlowCnt',
          },
        ],
      },
    ];

    if (!data) {
      return;
    }

    const netInterfaceData: any[] = [];
    Object.values(data).map((irqInfo) => {
      Object.keys(irqInfo).forEach((irqNumber) => {
        this.irqNumberMap[Number(irqNumber)] = irqInfo[Number(irqNumber)];
        const {
          irq_device_name,
          irq_device_bdf,
          irq_event_name,
          irq_count,
          irq_affinity_mask,
          eth_name,
          queue_name,
          xps_affinity_mask,
          rps_affinity_mask,
          rps_flow_cnt,
          irq_count_list,
          numa_node,
        } = irqInfo[Number(irqNumber)];

        netInterfaceData.push({
          irqNumber,
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
          numaNode: numa_node,
        });
      });
    });

    this.ethIrqAffinityInfo.srcData.data = netInterfaceData;

    /** 重新赋值触发表格更新 */
    this.ethIrqAffinityInfo = { ...this.ethIrqAffinityInfo };
  }

  /**
   * 打开硬中断编号 分布图弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   */
  public openNumberMapModal(row: any, modal: any) {
    const { irqNumber: num, eventName, irqCount, numaNode, ethName } = row;

    this.tiModal.open(modal, {
      modalClass: 'hart-map-modal map-modal',
      context: {
        hartData: this.irqNumberMap[row.irqNumber],
        bodyTitle: {
          num, eventName, irqCount,
          numaNode, ethName,
          numaNum: this.numaNum
        }
      },
    });
  }

  /**
   * 打开网络设备名称 分布图弹框
   * @param row 点击行详情
   * @param modal 弹框组件
   */
  public openNameMapModal(row: any, modal: any) {
    if (row.ethName === '--') {
      return;
    }
    const { ethName, irqCount, numaNode, eventName } = row;

    this.tiModal.open(modal, {
      modalClass: 'hart-name-map-modal map-modal',
      context: {
        irqData: this.irqNumberMap,
        bodyTitle: {
          ethName,
          irqCount,
          numaNode,
          eventName,
          numaNum: this.numaNum
        },
      },
    });
  }

  private async getData() {
    const params = {
      'node-id': this.statusService.nodeId,
      'config-type': 'network',
    };
    const resp: RespCommon<RespSystemConfigNet> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }
}
