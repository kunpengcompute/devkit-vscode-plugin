import {
  Component, Input, ElementRef, OnDestroy, OnInit, NgZone,
  ChangeDetectionStrategy, Inject, Optional, ChangeDetectorRef
} from '@angular/core';
import {
  fromEvent, merge, Observable, PartialObserver, Subscription
} from 'rxjs';
import { mapTo, distinctUntilChanged } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { HyReactIcon, HyIconStatus, HyIconEvent } from '../domain';
import {
  HyStateMachineService, HyReactIconsRegistryService
} from '../services';
import { Cat } from '../../../util';

/**
 * 动态图标组件
 *
 * @Input name: 图标的名称
 * @Input freeze: icon 的冻结状态
 *
 * @example
 * <hy-icon-react [name]="'iconName'"></hy-icon-react>
 * <hy-icon-react
 *    [name]="'iconName'"
 *    [freeze]="'normal' | 'active' | 'normal' | 'disabled'">
 * </hy-icon-react>
 */
@Component({
  selector: 'hy-icon-react',
  templateUrl: './icon-react.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HyIconReactComponent implements OnInit, OnDestroy {

  @Input()
  set name(iconName: string) {

    if (Cat.isNil(iconName)) { return; }

    const iconData = this.reactRegistryService.getIcon(iconName);
    if (!Cat.isNil(iconData)) { this.reactIconData = iconData; }
  }

  @Input()
  set freeze(iStatus: HyIconStatus) {

    switch (iStatus) {
      case HyIconStatus.Normal:
      case HyIconStatus.Hover:
      case HyIconStatus.Active:
      case HyIconStatus.Disabled:
        this.allEvtSub.unsubscribe();
        this.currIconStatus = iStatus;
        break;
      default:
        this.allEvtSub.unsubscribe();
        this.allEvtSub = this.allEvent$.subscribe(this.allEvtObserver);
        this.currIconStatus = HyIconStatus.Normal;
    }
  }

  IconStatusEnum: typeof HyIconStatus = HyIconStatus;

  currIconStatus: HyIconStatus = HyIconStatus.Normal;
  reactIconData: HyReactIcon['data'];

  private allEvent$: Observable<HyIconEvent>;
  private allEvtSub: Subscription;
  private allEvtObserver: PartialObserver<HyIconEvent>;

  private hostEle: Element;

  constructor(
    @Optional() @Inject(DOCUMENT) private document: any,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private hostElRef: ElementRef,
    private stateService: HyStateMachineService,
    private reactRegistryService: HyReactIconsRegistryService
  ) {

    this.hostEle = this.hostElRef.nativeElement;

    this.allEvtObserver = {
      next: (evt: HyIconEvent) => {
        const tmpIconStatus
          = this.stateService.calcIconStatus(this.currIconStatus, evt);

        // 如果相关状态的数据缺失的话，默认当前状态为 Normal
        this.currIconStatus = Cat.isNil(this.reactIconData[tmpIconStatus])
          ? HyIconStatus.Normal
          : tmpIconStatus;

        this.cdr.markForCheck();
      }
    };
  }

  ngOnInit() {

    this.zone.runOutsideAngular(() => {

      const iconEnter$: Observable<Event> = fromEvent(this.hostEle, 'mouseenter');
      const iconLeave$: Observable<Event> = fromEvent(this.hostEle, 'mouseleave');
      const iconDown$: Observable<Event> = fromEvent(this.hostEle, 'mousedown');
      const iconUp$: Observable<Event> = fromEvent(this.hostEle, 'mouseup');
      const docuUp$: Observable<Event> = fromEvent(this.document, 'mouseup');

      this.allEvent$ = merge(
        iconEnter$.pipe(mapTo(HyIconEvent.IconEnter)),
        iconLeave$.pipe(mapTo(HyIconEvent.IconLeave)),
        iconDown$.pipe(mapTo(HyIconEvent.IconDown)),
        iconUp$.pipe(mapTo(HyIconEvent.IconUp)),
        docuUp$.pipe(mapTo(HyIconEvent.DocuUp))
      ).pipe(
        // 减少 HyIconEvent.DocuUp 事件的响应
        distinctUntilChanged((p, q) => p === q)
      );

      this.allEvtSub = this.allEvent$.subscribe(this.allEvtObserver);
    });
  }

  ngOnDestroy() {

    this.allEvtSub.unsubscribe();
  }
}
