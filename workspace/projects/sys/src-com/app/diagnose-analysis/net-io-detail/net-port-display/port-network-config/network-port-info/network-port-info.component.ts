import { Component, Input, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { NetPortRowData, NetPortTableData } from '../../../domain';
import { PortTheads } from '../domain';

@Component({
  selector: 'app-network-port-info',
  templateUrl: './network-port-info.component.html',
  styleUrls: ['./network-port-info.component.scss']
})
export class NetworkPortInfoComponent implements OnInit {
  @Input()
  set portInfoData(val: NetPortTableData[] | []) {
    this.initTheads();
    if (!val.length) {
      this.netWorkInfoTable.srcData.data = [];
      return;
    }
    this.netWorkInfoTable.srcData.data = this.handlePortData(val);
  }

  public netWorkInfoTable: CommonTableData = {  // 网口信息表格
    columnsTree: ([] as Array<CommonTreeNode>),
    displayed: [] as Array<CommonTableData>,
    srcData: {
      data: [] as Array<TiTableRowData>,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      },
    } as TiTableSrcData,
    isFilters: true,
  };

  constructor() { }

  ngOnInit(): void { }

  // 初始化复合表头
  private initTheads() {
    this.netWorkInfoTable.columnsTree = [
      { label: 'Network Interface', key: 'network', disabled: true, width: '100px', fixed: 'left' },
      { label: 'Status', key: 'status', width: '100px' },
      { label: 'IPv4', key: 'ipv4', width: '100px' },
      { label: 'IPv6', key: 'ipv6', width: '100px' },
      { label: 'Supported Ports', key: 'supportPort', width: '100px' },
      { label: 'Speed(Mb/s)', key: 'speed', width: '100px' },
      { label: 'Duplex', key: 'duplex', width: '100px' },
      { label: 'NUMA NODE', key: 'numaNodem', width: '100px' },
      {
        label: 'Driver',
        width: '300px',
        children: [
          { label: 'driver', key: 'driver', },
          { label: 'version', key: 'version', },
          { label: 'firmware version', key: 'firmwareVersion', }
        ]
      },
      {
        label: 'Coalesce',
        width: '200px',
        children: [
          { label: 'adaptive-rx', key: 'adaptiveRx', },
          { label: 'adaptive-tx', key: 'adaptiveTx', }
        ]
      },
      {
        label: 'Offload',
        width: '400px',
        children: [
          { label: 'rx-usecs', key: 'rxUsecs', },
          { label: 'tx-usecs', key: 'txUsecs', },
          { label: 'rx-framcs', key: 'rxFramcs', },
          { label: 'tx-framcs', key: 'txFramcs', }
        ]
      },
      {
        label: 'Channels',
        width: '600px',
        children: [
          { label: 'rx-checksumming', key: 'offLoadRx', },
          { label: 'tx-checksumming', key: 'offLoadTx', },
          { label: 'scatter-gatter', key: 'scattor', },
          { label: 'TSO', key: 'tso', },
          { label: 'UFO', key: 'ufo', },
          { label: 'LRO', key: 'lro', },
          { label: 'GSO', key: 'gso', },
          { label: 'GRO', key: 'gro', }
        ]
      },
      {
        label: 'Ring Buffer',
        width: '300px',
        children: [
          { label: 'combined', key: 'combined', },
          { label: 'Tx', key: 'tx', },
          { label: 'Rx', key: 'rx', }
        ]
      }
    ];
  }

  /**
   * 对表格数据进行处理
   * @param irqList 硬中断绑核信息表格数据
   */
  private handlePortData(irqList: NetPortTableData[]) {
    const newData: NetPortRowData[] = [];

    irqList.forEach((data: NetPortTableData) => {
      Object.keys(data).forEach((key: string) => {
        const [
          status, ipv4, ipv6, supportPort,
          speed, duplex, numaNodem,
          driver, version, firmwareVersion,
          adaptiveRx, adaptiveTx, rxUsecs,
          txUsecs, rxFramcs, txFramcs,
          offLoadRx, offLoadTx, scattor, tso,
          ufo, lro, gso, gro,
          combined, tx, rx
        ] = data[key];

        newData.push({
          network: key,
          status, ipv4, ipv6, speed,
          supportPort, duplex, numaNodem,
          driver, version, firmwareVersion,
          adaptiveRx, adaptiveTx, rxUsecs,
          txUsecs, rxFramcs, txFramcs,
          offLoadRx, offLoadTx, scattor, tso,
          ufo, lro, gso, gro,
          combined, tx, rx
        });
      });
    });
    return newData;
  }
}
