import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ComponentRef,
  TemplateRef,
  Renderer2,
  RendererFactory2,
  HostListener,
} from '@angular/core';
import { TiPopUpRef, TiPopupService } from '@cloud/tiny3';
import { PopContainerComponent } from './pop-container/pop-container.component';

@Directive({
  selector: '[pop]',
  exportAs: 'pop',
})
export class PopDirective implements OnInit, OnDestroy {
  /**
   * 弹窗要显示的内容
   */
  @Input('pop') popContent: TemplateRef<any>;

  /**
   * 弹窗上下文
   */
  @Input() popContext: any = {};

  /**
   * 给tip弹窗添加类
   */
  @Input() popClass = '';

  /**
   * 基于绑定dom左上角的偏移
   */
  @Input() popOffset: {
    x?: number;
    y?: number;
  } = {};

  /**
   * 当前显示状态
   */
  public isShow = false;

  private render: Renderer2;
  private hostEl: HTMLElement;
  private popRef: TiPopUpRef;
  private popCompRef: ComponentRef<any>;

  private unlistenTiScroll: () => void;

  constructor(
    private el: ElementRef<HTMLElement>,
    private popupService: TiPopupService<PopContainerComponent>,
    private rendererFactory: RendererFactory2,
  ) {
    this.render = this.rendererFactory.createRenderer(document, null);
    this.hostEl = this.el.nativeElement;
    this.popRef = this.popupService.create(PopContainerComponent);
    // 监听tiny组件的tiScroll事件
    this.unlistenTiScroll = this.render.listen(document, 'tiScroll', () => {
      if (this.isShow) {
        this.hide();
      }
    });
  }

  ngOnInit(): void {
    if (this.popContent) {
      document.body.addEventListener('click', this.onClick.bind(this), true);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.hide();
  }

  private onClick(event: MouseEvent) {
    if (this.hostEl === event.target || this.hostEl.contains(event.target as Node)) {
      if (!this.isShow) {
        this.show();
      } else {
        this.hide();
      }
      return;
    }
    const popEl = this.popCompRef?.location.nativeElement;
    if (!popEl) { return; }
    if (popEl !== event.target && !popEl.contains(event.target)) {
      this.hide();
    }
  }

  public show() {
    this.isShow = true;
    this.popCompRef = this.popRef.show({
      content: this.popContent,
      contentContext: this.popContext,
      container: 'body'
    });
    // 绑定类
    const popEl = this.popCompRef.location.nativeElement.querySelector('.pop-container') as HTMLDivElement;
    const searchBox = this.popCompRef.location.nativeElement.querySelector(
      '.pop-container .ti3-searchbox-input') as HTMLDivElement;
    if (searchBox) { searchBox.focus(); }

    this.render.addClass(popEl, this.popClass || '');
    // 设置位置
    const hostRect = this.hostEl.getBoundingClientRect();
    let offsetX = (this.popOffset.x || 0) + hostRect.left;
    let offsetY = (this.popOffset.y || 0) + hostRect.top;
    // 位置修正
    const popRect = popEl.getBoundingClientRect();
    const outWidth = offsetX + popRect.width - document.body.clientWidth;
    if (outWidth > 0) {
      offsetX -= outWidth;
    }
    const outHeight = offsetY + popRect.height - document.body.clientHeight;
    if (outHeight > 0) {
      offsetY -= outHeight;
    }
    this.render.setStyle(popEl, 'left', offsetX + 'px');
    this.render.setStyle(popEl, 'top', offsetY + 'px');
  }

  public hide() {
    this.isShow = false;
    this.popRef.hide();
  }

  ngOnDestroy() {
    this.popRef.hide();
    document.body.removeEventListener('click', this.onClick.bind(this), true);
    this.unlistenTiScroll();
  }
}
