import { Component, Input } from '@angular/core';
import {
  IrqAffinityDetail, HardIrqAffinity, INetLoadRawData
} from 'sys/src-com/app/diagnose-analysis/net-io-detail/domain';
import { IrqDistUtil } from 'sys/src-com/app/diagnose-analysis/net-io-detail/net-port-display/component/irq-dist.util';
import { I18n } from 'sys/locale';
import { PerfDataService } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-detailed-data/server/perf-data.service';
type NetportIrqRaw = {
  [prop in string]: IrqAffinityDetail;
};

type IrqOption = {
  label: string;
  irqNum: string;
};

type bodyTitle = {
  ethName: IrqAffinityDetail['eth_name'],
  irqCount: IrqAffinityDetail['irq_count'],
  numaNode: IrqAffinityDetail['numa_node'],
  eventName?: IrqAffinityDetail['irq_event_name'],
  numaNum?: number;
};

@Component({
  selector: 'app-netport-irq-affinity-dist',
  templateUrl: './netport-irq-affinity-dist.component.html',
  styleUrls: ['./netport-irq-affinity-dist.component.scss'],
})
export class NetportIrqAffinityDistComponent {
  readonly NUMA_CORE_NUM = 32;
  readonly floor = Math.floor;
  numaCoreNum: number;

  @Input()
  set irqData(val: NetportIrqRaw) {
    if (!val) {
      return;
    }
    setTimeout(() => {
      this.irqDataStash = val;
      const numaNum = this.perfDataService.numaNum || this.bodyTitle?.numaNum;
      this.netportIrqListArr = this.createNetportIrqList(val, numaNum);
      this.allHardIrqCount = this.computedAllHardIrqCount(this.netportIrqListArr);
      this.irqOptionList = this.createIrqOptionList(val);
    }, 0);
  }
  @Input() ipiData: INetLoadRawData['rps_ipi_info']; // 诊断调试会用到，跨核IPI
  @Input() bodyTitle: bodyTitle;

  // 中断信息的一、二维数组
  netportIrqListArr: HardIrqAffinity[][];

  // 中断选择
  irqOptionList: IrqOption[];
  currIrqOption: IrqOption;

  // 当前被选中的中断的中断数的信息(二维数组)
  currIrqCountList: number[] = [];
  currRpsList: number[] = [];
  currIrqAffinityList: number[] = [];
  currXpsList: number[] = [];

  public allHardIrqCount = 0;

  private irqDataStash: NetportIrqRaw;

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

  private computedAllHardIrqCount(arr: HardIrqAffinity[][]) {
    let count = 0;
    arr?.forEach(row => {
      row.forEach(item => {
        count += item.hardIrq.irqCount;
      });
    });
    return count;
  }

  onIrqSelectChange(option: IrqOption) {
    if (!option || option.irqNum === 'ALL') {
      this.currIrqCountList = [];
      this.currIrqAffinityList = [];
      this.currXpsList = [];
      this.currRpsList = [];
      return;
    }

    const selectedIrq = this.irqDataStash[option.irqNum];

    const irqAffinityList = IrqDistUtil.getIrqList(
      selectedIrq.irq_affinity_mask
    );

    const coreNum = irqAffinityList.length;
    const irqCountList = selectedIrq.irq_count_list ?? new Array(coreNum).fill(0);

    const xpsAffinityList = IrqDistUtil.getIrqList(
      selectedIrq.xps_affinity_mask,
      coreNum
    );
    const rpsAffinityList = IrqDistUtil.getIrqList(
      selectedIrq.rps_affinity_mask,
      coreNum
    );

    const currIrqInfo = IrqDistUtil.createIrqList(
      irqCountList,
      irqAffinityList,
      xpsAffinityList,
      rpsAffinityList
    );
    this.currIrqCountList = currIrqInfo.map((irq) => irq.hardIrq.irqCount);
    this.currIrqAffinityList = currIrqInfo.map((irq) => irq.hardIrq.affinity);
    this.currXpsList = currIrqInfo.map((irq) => irq.xps.affinity);
    this.currRpsList = currIrqInfo.map((irq) => irq.rps.affinity);
  }

  /**
   * 计算中断频率所占百分比
   * @param selectedIrq 选中中断频次
   * @param irqCount 所有中断频次
   */
  computePercent(selectedIrq: number, irqCount: number) {
    return irqCount === 0
      ? '0%'
      : (selectedIrq / irqCount * 100).toFixed(2) + '%';
  }

  format(irqCount: number) {
    const len = irqCount.toString().length;
    const idx = irqCount.toString().indexOf('.');
    // 大于两位小数保留两位小数
    if (idx > -1 && (len - idx) > 1) {
      return irqCount?.toFixed && irqCount.toFixed(2);
    } else {
      return irqCount;
    }
  }

  private createNetportIrqList(info: NetportIrqRaw, numaNum: number): HardIrqAffinity[][] {
    const irqNumList = Object.keys(info);

    // 数组汇集
    let irqCountSumList: number[];
    let irqAffinitySumList: number[];
    let xpsAffinitySumList: number[];
    let rpsAffinitySumList: number[];
    let irqNum = 0;
    irqNumList.forEach((name) => {
      // 取值
      const portInfo = info[name];
      if (portInfo.eth_name === this.bodyTitle.ethName) {

        const irqAffinityList = IrqDistUtil.getIrqList(
          portInfo.irq_affinity_mask
        );

        irqNum = portInfo.irq_count ? (irqNum * 100 + portInfo.irq_count * 100) / 100 : irqNum;

        const coreNum = irqAffinityList.length;

        const irqCountList = portInfo.irq_count_list ?? new Array(coreNum).fill(0);
        const xpsAffinityList = IrqDistUtil.getIrqList(
          portInfo.xps_affinity_mask,
          coreNum
        );
        const rpsAffinityList = IrqDistUtil.getIrqList(
          portInfo.rps_affinity_mask,
          coreNum
        );

        // 聚合
        irqCountSumList = IrqDistUtil.reduceArray(irqCountList, irqCountSumList);
        irqAffinitySumList = IrqDistUtil.reduceArray(
          irqAffinityList,
          irqAffinitySumList
        );
        xpsAffinitySumList = IrqDistUtil.reduceArray(
          xpsAffinityList,
          xpsAffinitySumList
        );
        rpsAffinitySumList = IrqDistUtil.reduceArray(
          rpsAffinityList,
          rpsAffinitySumList
        );
      }
    });

    this.bodyTitle.irqCount = irqNum;

    const irqSumList = IrqDistUtil.createIrqList(
      irqCountSumList,
      irqAffinitySumList,
      xpsAffinitySumList,
      rpsAffinitySumList
    );
    this.numaCoreNum = numaNum ? irqSumList.length / numaNum : irqSumList.length / 4;
    return IrqDistUtil.groupByNum(irqSumList, this.numaCoreNum);
  }

  private createIrqOptionList(info: NetportIrqRaw): IrqOption[] {
    const list1 = Object.keys(info).map((key) => {
      return {
        label: info[key].irq_event_name,
        irqNum: key,
      };
    });

    const list = list1.filter((item: any) => {
      return item.label !== '--';
    });

    return list;
  }
}
