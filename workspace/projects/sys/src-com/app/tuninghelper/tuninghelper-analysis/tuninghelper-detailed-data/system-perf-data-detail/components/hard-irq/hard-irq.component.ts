import { Component, Input, OnInit } from '@angular/core';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18n } from 'sys/locale';
import { TiModalService } from '@cloud/tiny3';
import { IrqAffinityDetail } from '../../domain';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import { HttpService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-hard-irq',
  templateUrl: './hard-irq.component.html',
  styleUrls: ['./hard-irq.component.scss']
})
export class HardIrqComponent implements OnInit {
  @Input()
  set irqAffinityData(value: { [irqNumber: number]: IrqAffinityDetail }) {
    if (value) {
      this.initEthIrqAffinityInfo(value);
    }
  }
  @Input() numaNum = 4;
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
  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private tiModal: TiModalService
  ) { }

  ngOnInit() { }

  private initEthIrqAffinityInfo(data: { [irqNumber: number]: IrqAffinityDetail }) {
    this.ethIrqAffinityInfo.title = I18n.tuninghelper.sysConfigDetail.irqInfo;
    this.ethIrqAffinityInfo.columnsTree = [
      {
        label: I18n.net_io.xps_rps.hard_info.number,
        width: '10%',
        checked: true,
        disabled: true,
        key: 'irqNumber',
        searchKey: 'irqNumber',
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
          },
          {
            label: I18n.net_io.xps_rps.hard_info.inter_bind,
            checked: true,
            key: 'affinityMask',
            searchKey: 'affinityMask',
          },
          {
            label: I18n.tuninghelper.detailedData.irq_frequency,
            checked: true,
            key: 'irqCount',
            sortKey: 'irqCount'
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
            label: I18n.tuninghelper.detailedData.netPort_name,
            checked: true,
            key: 'ethName',
            searchKey: 'ethName',
          },
          {
            label: I18n.net_io.xps_rps.hard_info.network_queue,
            checked: true,
            key: 'queueName',
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
    Object.keys(data).forEach((irqNumber) => {
      this.irqNumberMap[Number(irqNumber)] = data[Number(irqNumber)];
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
      } = data[Number(irqNumber)];

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
    const params = {
      'iface-name': row.ethName,
      'node-id': this.statusService.nodeId,
      'query-type': JSON.stringify(['network_iface_info']),
    };
    this.http.get(`/tasks/${this.statusService.taskId}/optimization/system-performance/`, { params })
      .then((res) => {
        const ifaceIrq = res.data.optimization.data.iface_irq_info;
        const numaNum = res.data.optimization.data.context_info?.numa_num;
        const irqList = Object.keys(ifaceIrq).sort().map((key) => {
          return ifaceIrq[key];
        });
        const irqAll = irqList.reduce((sum: number, e: any) => sum + Number(e.irq_count || 0), 0);
        const { ethName, irqCount, numaNode } = row;
        this.tiModal.open(modal, {
          modalClass: 'hart-name-map-modal map-modal',
          context: {
            irqData: ifaceIrq,
            bodyTitle: {
              ethName,
              irqCount: irqAll.toFixed(2),
              numaNode,
              numaNum,
            },
          },
        });
      });
  }
}
