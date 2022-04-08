import { Component, Input, OnDestroy } from '@angular/core';
import { INetLoadRawData, SoftIrqInfo } from '../../../domain';
import { from, Observable, range, Subscription, zip } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { IrqDistUtil } from '../irq-dist.util';
import { NetIoService } from '../../../service/net-io.service';

type SoftirqCountList =
  INetLoadRawData['softirq_info']['NET_RX']['softirq_count_list'];
type KsoftirqdList = INetLoadRawData['ksoftirqd_list'];

type BodyTitle = {
  type: string,
  frequency: number;
};

@Component({
  selector: 'app-soft-irq-dist',
  templateUrl: './soft-irq-dist.component.html',
  styleUrls: ['./soft-irq-dist.component.scss'],
})
export class SoftIrqDistComponent implements OnDestroy {
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
  @Input() bodyTitle: BodyTitle;

  softIrqList: SoftIrqInfo[][];
  private listSub: Subscription;
  floor = Math.floor;

  constructor(
    private netIoService: NetIoService
  ) { }

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
          opacity: val[1] ? (val[1] / this.bodyTitle?.frequency) + 0.05 : 0,
        };
      }),
      toArray(),
      map((val) => {
        const num = this.netIoService.numaNum ? this.netIoService.numaNum : 4;
        return IrqDistUtil.groupByNum(val, val.length / num);
      })
    );
  }
}
