import { Component, Input } from '@angular/core';
import { INetLoadRawData, HardIrqAffinity, IrqAffinityDetail } from '../../component/domain';
import { IrqDistUtil } from '../irq-dist.util';

type HardIrqRaw = INetLoadRawData['irq_affinity_info'][0];
type bodyTitle = {
  num: IrqAffinityDetail['eth_name'],
  eventName: IrqAffinityDetail['irq_event_name']
  irqCount: IrqAffinityDetail['irq_count'],
  numaNode: IrqAffinityDetail['numa_node'],
  ethName: IrqAffinityDetail['eth_name']
};
@Component({
  selector: 'app-pcie-hard-irq-affinity-dist',
  templateUrl: './pcie-hard-irq-affinity-dist.component.html',
  styleUrls: ['./pcie-hard-irq-affinity-dist.component.scss']
})
export class PcieHardIrqAffinityDistComponent {
  @Input()
  set hardIrqData(val: HardIrqRaw) {
    if (!val) {
      return;
    }
    this.hardIrqList = this.createHardIrqList(val);
  }
  @Input() bodyTitle: bodyTitle;

  hardIrqList: HardIrqAffinity[][];
  floor = Math.floor;

  constructor() {}

  private createHardIrqList(info: HardIrqRaw): HardIrqAffinity[][] {

    const irqAffinityList = IrqDistUtil.getIrqList(
      info.irq_affinity_mask
    );
    const coreNum = irqAffinityList.length;

    const irqCountList = info.irq_count_list || new Array(coreNum).fill(0);
    const xpsAffinityList = IrqDistUtil.getIrqList(
      info.xps_affinity_mask,
      coreNum
    );
    const rpsAffinityList = IrqDistUtil.getIrqList(
      info.rps_affinity_mask,
      coreNum
    );

    const irqSumList = IrqDistUtil.createIrqList(
      irqCountList,
      irqAffinityList,
      xpsAffinityList,
      rpsAffinityList
    );

    return IrqDistUtil.groupByNum(irqSumList, 32);
  }
}
