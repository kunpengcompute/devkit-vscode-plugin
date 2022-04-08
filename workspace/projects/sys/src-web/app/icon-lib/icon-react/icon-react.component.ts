import {
  Component, Input, ElementRef, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Inject, Optional
} from '@angular/core';
import {
  fromEvent, merge, Observable, PartialObserver,
  Subscription
} from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { IReactIcon, IconStatus, IconEvent } from '../domain';
import { StateMachineService } from '../services';
import reactIcons from '../icons.react.regedit';

/**
 * 动态图标组件
 *
 * @Input name: 图标的名称
 * @Input freeze: icon 的冻结状态
 *
 * @example
 * <app-icon-react [name]="'iconName'"></app-icon-react>
 * <app-icon-react [name]="'iconName'" [freeze]="'normal' | 'active' | 'normal' | 'disabled'"></app-icon-react>
 */
@Component({
  selector: 'app-icon-react',
  templateUrl: './icon-react.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconReactComponent implements OnDestroy {

  @Input()
  set name(iconName: string) {
    const data = (reactIcons as any)?.[iconName]?.data;
    if (data != null) {
      this.iconData = data;
      this.cdr.markForCheck();
    }
  }

  @Input()
  set freeze(iStatus: IconStatus) {

    switch (iStatus) {
      case IconStatus.Normal:
      case IconStatus.Hover:
      case IconStatus.Active:
      case IconStatus.Disabled:
        this.allEvtSub.unsubscribe();
        this.iconStatus = iStatus;
        break;
      default:
        this.allEvtSub.unsubscribe(); // 取消
        this.allEvtSub = this.allEvent$.subscribe(this.allEvtObserver);
        this.iconStatus = IconStatus.Normal;
    }
    this.cdr.markForCheck();
  }

  IconStatusEnum: typeof IconStatus = IconStatus;
  iconStatus: IconStatus = IconStatus.Normal;
  tmpIconStatus: IconStatus = IconStatus.Normal;
  iconData: IReactIcon['data'];

  private allEvent$: Observable<IconEvent>;
  private allEvtSub: Subscription;
  private allEvtObserver: PartialObserver<IconEvent>;

  constructor(
    @Optional() @Inject(DOCUMENT) private document: any,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private stateService: StateMachineService,
  ) {

    const native: any = this.el.nativeElement;

    const iconEnter$: Observable<IconEvent> = fromEvent(native, 'mouseenter');
    const iconLeave$: Observable<IconEvent> = fromEvent(native, 'mouseleave');
    const iconDown$: Observable<IconEvent> = fromEvent(native, 'mousedown');
    const iconUp$: Observable<IconEvent> = fromEvent(native, 'mouseup');
    const docuUp$: Observable<IconEvent> = fromEvent(this.document, 'mouseup');

    this.allEvent$ = merge(
      iconEnter$.pipe(mapTo(IconEvent.IconEnter)),
      iconLeave$.pipe(mapTo(IconEvent.IconLeave)),
      iconDown$.pipe(mapTo(IconEvent.IconDown)),
      iconUp$.pipe(mapTo(IconEvent.IconUp)),
      docuUp$.pipe(mapTo(IconEvent.DocuUp))
    );

    this.allEvtObserver = {
      next: (evt: IconEvent) => {
        this.tmpIconStatus = this.stateService.calcIconStatus(this.tmpIconStatus, evt);

        // 如果相关状态的数据缺失的话，默认当前状态为 Normal
        if (this.iconData[this.tmpIconStatus]) {
          this.iconStatus = this.tmpIconStatus;
        } else {
          this.iconStatus = IconStatus.Normal;
        }
        this.cdr.markForCheck();
      },
    };

    this.allEvtSub = this.allEvent$.subscribe(this.allEvtObserver);
  }


  ngOnDestroy() {
    this.allEvtSub.unsubscribe();
  }
}
