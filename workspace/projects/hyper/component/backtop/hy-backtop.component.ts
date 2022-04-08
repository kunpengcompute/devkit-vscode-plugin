import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { HyThemeService, HyTheme } from '../../theme';
import { BacktopUtil } from './hy-backtop.util';

export interface HyElementMatchFeature {
  id?: string;
  classes?: string[];
  tag?: string;
}

@Component({
  selector: 'hy-backtop',
  templateUrl: './backtop.component.html',
  styleUrls: ['./backtop.component.scss'],
})
export class HyBacktopComponent implements AfterViewInit, OnDestroy {
  /**
   * 当传入的值为真的时候，开启自动查找
   */
  @Input()
  set startup(start: boolean) {
    if (start) {
      this.scrollSub?.unsubscribe();
      this.initBacktop(true);
    }
  }
  /**
   * 需要回到顶部的元素:
   * 当类型为 HyElementMatchFeature 时： 向上查找
   * 当类型为 ElementRef 时：直接使用
   */
  @Input() target?: HyElementMatchFeature | HTMLElement;
  /**
   * 滚动高度达到此参数值才出现
   */
  @Input() visibilityHeight = 200;
  /**
   * 控制其显示位置, 距离页面右边距
   */
  @Input() right = 1;
  /**
   * 控制其显示位置, 距离页面右边距
   */
  @Input() bottom = 40;

  /**
   * 在自动查找模式下，没有找到 host 元素的话，触发此事件
   */
  @Output() notFound = new EventEmitter();
  /**
   * 点击 toTop 后，当页面回到顶部时，触发此事件
   */
  @Output() reachTop = new EventEmitter();
  /**
   * 点击按钮触发的事件
   */
  @Output() backClick = new EventEmitter();

  showBacktop = false;
  theme$: Observable<HyTheme>;

  private scrollableEle: HTMLElement;
  private scrollSub: Subscription;

  constructor(private eleRef: ElementRef, private themeServe: HyThemeService) {
    this.theme$ = this.themeServe.getObservable();
  }

  ngAfterViewInit() {
    this.initBacktop(false);
  }

  ngOnDestroy() {
    this.scrollSub?.unsubscribe();
  }

  initBacktop(startup: boolean) {
    switch (true) {
      case startup:
        this.scrollableEle = BacktopUtil.findScrollableEle(
          this.eleRef.nativeElement,
          this.target as any,
          startup
        ) as any;
        break;
      case this.target instanceof HTMLElement:
        this.scrollableEle = this.target as HTMLElement;
        break;
      case 'id' in this.target ||
        'classes' in this.target ||
        'tag' in this.target:
        this.scrollableEle = BacktopUtil.findScrollableEle(
          this.eleRef.nativeElement,
          this.target as any,
          startup
        ) as any;
        break;
      default:
        break;
    }
    if (!this.scrollableEle) {
      this.notFound.emit();
      return;
    }
    this.scrollSub = fromEvent(this.scrollableEle, 'scroll').subscribe(() => {
      const { scrollTop } = this.scrollableEle as HTMLElement;
      this.showBacktop = scrollTop > this.visibilityHeight;
    });
  }

  onClick(_: any) {
    this.backClick.emit();
    if (null == this.scrollableEle) {
      return;
    }
    BacktopUtil.scrollTopSmooth(
      this.scrollableEle as HTMLElement,
      0,
      this.reachTop
    );
  }
}
