import { Component, Input } from '@angular/core';
import { IrqAffinityDetail, HardIrqAffinity } from '../../component/domain';
import { IrqDistUtil } from '../irq-dist.util';
import { I18n } from 'sys/locale';


type NetportIrqRaw = {
  [prop in string]: IrqAffinityDetail;
};

type IrqOption = {
  label: string;
  irqNum: string;
};

type bodyTitle = {
  ethName: IrqAffinityDetail['eth_name']
  irqCount: IrqAffinityDetail['irq_count'],
  numaNode: IrqAffinityDetail['numa_node']
};

@Component({
  selector: 'app-pcie-irq-affinity-dist',
  templateUrl: './pcie-irq-affinity-dist.component.html',
  styleUrls: ['./pcie-irq-affinity-dist.component.scss']
})
export class PcieIrqAffinityDistComponent {
  readonly NUMA_CORE_NUM = 32;

  @Input()
  set irqData(val: NetportIrqRaw) {
    if (!val) {
      return;
    }
    this.irqDataStash = val;
    this.netportIrqList = this.createNetportIrqList(val);
    this.netportIrqListArr = IrqDistUtil.groupByNum(
      this.netportIrqList,
      this.NUMA_CORE_NUM
    );
    this.irqOptionList = this.createIrqOptionList(val);
  }
  @Input() bodyTitle: bodyTitle;

  // 中断信息的一、二维数组
  netportIrqListArr: HardIrqAffinity[][];
  netportIrqList: HardIrqAffinity[];

  // 中断选择
  irqOptionList: IrqOption[];
  currIrqOption: IrqOption = {
    label: I18n.popInfo.allIrq,
    irqNum: 'ALL'
  };

  // 当前被选中的中断的中断数的信息(二维数组)
  currIrqCountList: number[] = [];

  private irqDataStash: NetportIrqRaw;

  floor = Math.floor;

  constructor() {}

  onIrqSelectChange(option: IrqOption) {
    if (option.irqNum === 'ALL') {
      this.currIrqCountList = [];
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
  }

  private createNetportIrqList(info: NetportIrqRaw): HardIrqAffinity[] {
    const irqNumList = Object.keys(info);

    // 数组汇集
    let irqCountSumList: number[];
    let irqAffinitySumList: number[];
    let xpsAffinitySumList: number[];
    let rpsAffinitySumList: number[];

    irqNumList.forEach((name) => {
      // 取值
      const portInfo = info[name];

      const irqAffinityList = IrqDistUtil.getIrqList(
        portInfo.irq_affinity_mask
      );

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
    });

    return IrqDistUtil.createIrqList(
      irqCountSumList,
      irqAffinitySumList,
      xpsAffinitySumList,
      rpsAffinitySumList
    );
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
    list.unshift({
      label: I18n.popInfo.allIrq,
      irqNum: 'ALL',
    });

    return list;
  }
}
