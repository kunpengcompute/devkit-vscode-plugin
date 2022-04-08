import {
  Directive, ElementRef, Input, Output, TemplateRef,
  EventEmitter, AfterViewInit, NgZone, Renderer2,
  ViewContainerRef
} from '@angular/core';
import { PartialObserver, Subject } from 'rxjs';
import { distinctUntilChanged, skip } from 'rxjs/operators';

interface IDOMRect {
  width: number;
  height: number;
  top: number;
  bottom: number;
}

interface IVisibleDropInfo {
  isDrop: boolean;
  direction: 'top' | 'bottom';
}

@Directive({
  selector: '[appDemandLoading]'
})
export class DemandLoadingDirective implements AfterViewInit {
  @Input('appDemandLoading') loadInfo: {
    container: ViewContainerRef;
    template: TemplateRef<any>;
    visibleArea: ElementRef;
  };

  @Output() demandData = new EventEmitter<Subject<any[]>>();
  @Output() relaseData = new EventEmitter<any[]>();

  private loadedData: any[] = [];

  private visibleDropSource = new Subject<IVisibleDropInfo>();
  private visibleDrop$ = this.visibleDropSource.asObservable();

  private demandDataSource = new Subject<any[]>();
  private demandData$ = this.demandDataSource.asObservable();

  private readonly criticalWidth = 10;

  private readonly visibleDropObserver: PartialObserver<IVisibleDropInfo> = {
    next: (item) => {
      if (item.isDrop && item.direction === 'bottom') {
        this.demandData.emit(this.demandDataSource);
      }
    }
  };

  private readonly demandDataObserver: PartialObserver<any[]> = {
    next: (item) => {
      // 发送一个假的通知
      this.visibleDropSource.next({ isDrop: false, direction: void 0 });
      this.loadedData = this.loadedData.concat(item || []);
      this.relaseData.emit(this.loadedData);
    }
  };

  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private renderer: Renderer2
  ) {
    // 订阅 “可是区域陷落” 的信息流
    this.visibleDrop$.pipe(
      distinctUntilChanged(
        (p: IVisibleDropInfo, q: IVisibleDropInfo) => p.isDrop === q.isDrop
      ), skip(1)
    ).subscribe(this.visibleDropObserver);

    // 订阅数据需求的数据流
    this.demandData$.subscribe(this.demandDataObserver);
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.renderer.listen(this.el.nativeElement, 'scroll', () => {
        const visibleRect = this.loadInfo.visibleArea.nativeElement.getBoundingClientRect();
        const contentRect = this.el.nativeElement.getBoundingClientRect();

        const dropInfo = this.detectVisibleDrop(visibleRect, contentRect);
        this.visibleDropSource.next(dropInfo);
      });
    });

    // 第一次发送数据数据需求
    this.demandData.emit(this.demandDataSource);
  }

  private detectVisibleDrop(visibleRect: DOMRect, contentRect: IDOMRect): IVisibleDropInfo {
    let isDrop = false;
    let direction: IVisibleDropInfo['direction'];
    const vi = visibleRect;
    const co = contentRect;

    if (co.top - vi.top < this.criticalWidth) {
      isDrop = true;
      direction = 'top';
    } else if (vi.bottom - co.bottom < this.criticalWidth) {
      isDrop = true;
      direction = 'bottom';
    }

    return {
      isDrop,
      direction
    };
  }
}
