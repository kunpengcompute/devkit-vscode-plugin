import { Component, Input } from '@angular/core';
import { I18n } from 'sys/locale';
import {
  INetLoadRawData, HardIrqAffinity, IrqAffinityDetail
} from 'sys/src-com/app/diagnose-analysis/net-io-detail/domain';
import { IrqDistUtil } from 'sys/src-com/app/diagnose-analysis/net-io-detail/net-port-display/component/irq-dist.util';
import { PerfDataService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-detailed-data/server/perf-data.service';
type HardIrqRaw = INetLoadRawData['irq_affinity_info'][0];
type bodyTitle = {
  num: IrqAffinityDetail['eth_name'],
  eventName: IrqAffinityDetail['irq_event_name']
  irqCount: IrqAffinityDetail['irq_count'],
  numaNode: IrqAffinityDetail['numa_node'],
  ethName: IrqAffinityDetail['eth_name'],
  numaNum?: number
};
@Component({
  selector: 'app-hard-irq-affinity-dist',
  templateUrl: './hard-irq-affinity-dist.component.html',
  styleUrls: ['./hard-irq-affinity-dist.component.scss'],
})
export class HardIrqAffinityDistComponent {

  public readonly floor = Math.floor;

  @Input()
  set hardIrqData(val: HardIrqRaw) {
    if (!val) {
      return;
    }
    setTimeout(() => {
      this.hardIrqList = this.createHardIrqList(val);
    }, 10);
  }
  @Input() ipiData: INetLoadRawData['rps_ipi_info'];
  @Input() bodyTitle: bodyTitle;

  public hardIrqList: HardIrqAffinity[][];
  public legendH = {
    icon: 'H',
    label: I18n.tuninghelper.sysConfigDetail.hardIrqBond,
    active: true,
  };
  public legendR = {
    icon: 'R',
    label: I18n.tuninghelper.sysConfigDetail.rpsBond,
    active: true,
  };
  public legendX = {
    icon: 'X',
    label: I18n.tuninghelper.sysConfigDetail.xpsBond,
    active: true,
  };
  public legend = [this.legendH, this.legendR, this.legendX];

  constructor(
    private perfDataService: PerfDataService
  ) { }

  private createHardIrqList(info: HardIrqRaw): HardIrqAffinity[][] {

    const irqAffinityList = IrqDistUtil.getIrqList(
      info.irq_affinity_mask
    );
    const coreNum = irqAffinityList.length;

    const irqCountList = info.irq_count_list?.length
      ? info.irq_count_list
      : new Array(coreNum).fill(0);
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
    const numaNum = this.perfDataService.numaNum || this.bodyTitle?.numaNum;
    const num = numaNum ? irqSumList.length / numaNum : irqSumList.length / 4;
    return IrqDistUtil.groupByNum(irqSumList, num);
  }
}
