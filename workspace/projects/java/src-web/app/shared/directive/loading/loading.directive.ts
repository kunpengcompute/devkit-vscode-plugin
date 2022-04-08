import { Directive, ElementRef, Input, OnDestroy, ComponentRef } from '@angular/core';
import { LoadingComponent } from './component/loading/loading.component';
import { CreateLoadingRefService } from './service/create-loading-ref.service';
import { LoadingScene } from './domain/index';

@Directive({
  selector: '[appLoading]'
})
export class LoadingDirective implements OnDestroy {
  @Input('appLoading') set appLoading(isLoading: boolean) {
    if (isLoading) {
      this.destoryLoadingRef();
      this.createLoadingRef();
    } else {
      this.destoryLoadingRef();
    }
  }
  /** 全局 | 局部 */
  @Input() scene: LoadingScene = LoadingScene.LOCAL;
  /** loading 下方的字...” */
  @Input() loadingText: string;

  /** LoadingComponent 的组件引用 */
  private loadingRef: ComponentRef<LoadingComponent>;
  /** 父元素显示局部加载需要的最小高度 */
  private minHeightToShowLoading = '160px';
  /** nativeElement 原先的最小高度【关闭loading时需要将父元素原先的最小高度还原】 */
  private nativeElementMinHeight: string;

  constructor(
    private el: ElementRef,
    private createLoadingRefService: CreateLoadingRefService,
  ) {
    if (['static', '', null, undefined].includes(window.getComputedStyle(this.el.nativeElement).position)) {
      this.el.nativeElement.style.position = 'relative';
    }
  }

  ngOnDestroy() {
    this.destoryLoadingRef();
  }

  /**
   * 创建loading组件
   */
  private createLoadingRef() {
    if (this.el.nativeElement.offsetHeight < parseInt(this.minHeightToShowLoading, 10)) {
      this.nativeElementMinHeight = this.el.nativeElement.style.minHeight;
      this.el.nativeElement.style.minHeight = this.minHeightToShowLoading;
    }
    this.loadingRef = this.createLoadingRefService.createLoading(this.el.nativeElement, this.scene, this.loadingText);
  }

  /**
   * 销毁loading组件
   */
  private destoryLoadingRef() {
    if (this.nativeElementMinHeight !== undefined) {
      this.el.nativeElement.style.minHeight = this.nativeElementMinHeight;
      this.nativeElementMinHeight = undefined;
    }

    if (this.loadingRef) {
      this.createLoadingRefService.destroyLoading(this.loadingRef);
      this.loadingRef = null;
    }
  }
}
