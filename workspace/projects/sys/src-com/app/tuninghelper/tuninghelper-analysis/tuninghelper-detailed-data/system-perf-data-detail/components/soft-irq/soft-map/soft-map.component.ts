import { Component, Input, OnDestroy } from '@angular/core';
import { from, Observable, range, Subscription, zip } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { INetLoadRawData, SoftIrqInfo } from 'projects/sys/src-com/app/diagnose-analysis/net-io-detail/domain';
import { IrqDistUtil } from 'projects/sys/src-com/app/diagnose-analysis/net-io-detail/net-port-display/component/irq-dist.util';
type SoftirqCountList =
  INetLoadRawData['softirq_info']['NET_RX']['softirq_count_list'];
type KsoftirqdList = INetLoadRawData['ksoftirqd_list'];
type BodyTitle = {
  type: string,
  frequency: number;
  numaNum?: number;
};

@Component({
  selector: 'app-soft-map',
  templateUrl: './soft-map.component.html',
  styleUrls: ['./soft-map.component.scss']
})
export class SoftMapComponent implements OnDestroy {
  @Input()
  set softIrqData(val: { irqs: SoftirqCountList; ksofts: KsoftirqdList }) {
    if (val == null) {
      return;
    }
    setTimeout(() => {
      this.listSub = this.createSoftIrqList(val.irqs, val.ksofts).subscribe(
        (list) => {
          this.softIrqList = list;
        }
      );
    }, 10);
  }
  @Input()
  set bodyTitle(val: BodyTitle) {
    if (!val) { return; }
    this.titleMsg = val;
    this.numaNum = val.numaNum ? val.numaNum : 4;
  }
  softIrqList: SoftIrqInfo[][];
  private listSub: Subscription;
  public titleMsg: BodyTitle;
  public numaNum = 4;
  floor = Math.floor;
  constructor() { }

  ngOnDestroy() {
    this.listSub?.unsubscribe();
  }

  private createSoftIrqList(
    irq: SoftirqCountList,
    ksoft: KsoftirqdList
  ): Observable<SoftIrqInfo[][]> {
    return zip(range(0, irq.length), from(irq), from(ksoft)).pipe(
      map((val) => {
        return {
          coreId: val[0],
          irqCount: val[1],
          ksoft: val[2],
          opacity: val[1] ? (val[1] / this.titleMsg?.frequency) + 0.05 : 0,
        };
      }),
      toArray(),
      map((val) => {
        return IrqDistUtil.groupByNum(val,  val.length / this.numaNum);
      })
    );
  }
}
