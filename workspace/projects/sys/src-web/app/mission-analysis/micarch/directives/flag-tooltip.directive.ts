import {
  Directive, Input, ElementRef, Renderer2, AfterViewInit,
  TemplateRef, EmbeddedViewRef, ApplicationRef
} from '@angular/core';

@Directive({
  selector: '[appFlagTooltip]'
})
export class FlagTooltipDirective implements AfterViewInit {
  public flagTooltipInfoCopy: {
    html: string | TemplateRef<any>,
    pos: { top: number, left: number },
    context?: any
  };
  @Input('appFlagTooltip')
  set flagTooltipInfo(val) {
    this.flagTooltipInfoCopy = val;
    if (this.tooltipElement) {
      this.setContent(this.flagTooltipInfoCopy.html, this.flagTooltipInfoCopy.context);
      this.setPosition(this.flagTooltipInfoCopy.pos);
    }
  }
  get flagTooltipInfo() {
    return this.flagTooltipInfoCopy;
  }

  public flagTooltipShowCopy = false;
  @Input()
  set flagTooltipShow(val: boolean) {
    this.flagTooltipShowCopy = val;
    if (this.tooltipElement) {
      this.flagTooltipShowCopy ? this.show() : this.hide();
    }
  }
  get flagTooltipShow() {
    return this.flagTooltipShowCopy;
  }

  public placement: 'right' | 'left' = 'right';
  public offset = 0;
  public tooltipElement: HTMLElement;
  public flagpoleElement: HTMLElement;

  constructor(
    private el?: ElementRef,
    private renderer?: Renderer2,
    private applicationRef?: ApplicationRef
  ) { }

  ngAfterViewInit(): void {
    this.createElement();
  }

  public show() {
    this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
    this.renderer.setStyle(this.flagpoleElement, 'opacity', '1');
  }

  public hide() {
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.flagpoleElement, 'opacity', '0');
  }

  private createElement() {
    if ($(this.el.nativeElement).css('position').trim() === 'static') {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    }

    // 在 host 中创建一个 tooltip 的节点
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.appendChild(this.el.nativeElement, this.tooltipElement);
    this.renderer.addClass(this.tooltipElement, 'flag-tooltip');
    this.renderer.setStyle(this.tooltipElement, 'opacity', 0);
    this.renderer.setStyle(this.tooltipElement, '-webkit-transition', `opacity 500ms ease 0ms, left 500ms linear 0ms`);
    this.renderer.setStyle(this.tooltipElement, '-moz-transition', `opacity 500ms ease 0ms, left 500ms linear 0ms`);
    this.renderer.setStyle(this.tooltipElement, '-o-transition', `opacity 500ms ease 0ms, left 500ms linear 0ms`);
    this.renderer.setStyle(this.tooltipElement, 'transition', `opacity 500ms ease 0ms, left 500ms linear 0ms`);
    this.renderer.setAttribute(this.tooltipElement, 'offset', this.offset.toString());
    this.renderer.setAttribute(this.tooltipElement, 'placement', this.placement);

    // 在 host 中创建一个 flagpole 的节点
    this.flagpoleElement = this.renderer.createElement('div');
    this.renderer.appendChild(this.el.nativeElement, this.flagpoleElement);
    this.renderer.addClass(this.flagpoleElement, 'flagpole');
    this.renderer.setStyle(this.flagpoleElement, 'opacity', 0);
  }

  // 更新 tooltip 的值
  private setContent(content: string | TemplateRef<any>, context?: any) {
    if (content == null) {
      return;
    }

    const tooltipSelection = $(this.tooltipElement);

    if (content instanceof TemplateRef) {
      const embeddedView: EmbeddedViewRef<any> = content.createEmbeddedView({ context });
      this.applicationRef.attachView(embeddedView); // 不做此处理，ng-template中的标签不会解析

      tooltipSelection.empty();
      for (const rootNode of embeddedView.rootNodes) {
        this.renderer.appendChild(this.tooltipElement, rootNode);
      }
    } else {
      tooltipSelection.empty();
      tooltipSelection.append($(content));
    }
  }

  // 设置 tooltip 的位置，所有的位置都是相对于指令所在的父组件
  private setPosition(pos: { top: number, left: number }) {
    if (pos == null) {
      return;
    }

    const { top, left } = pos;
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    // 设置提示框的朝向 TODO 处理魔法数字
    if (left + tooltipRect.width + 20 > hostRect.width / 1.2 ) {
      this.placement = 'left';
    } else {
      this.placement = 'right';
    }

    // 计算提示框的向上偏移量
    const tipBottom = top + tooltipRect.height;
    const offBottom = hostRect.height - tipBottom;
    if (offBottom < 0) {
      this.offset = Math.floor(Math.abs(offBottom) / tooltipRect.height * 100);
    } else {
      this.offset = 0;
    }

    // 设置提示框的位置、朝向、向上偏移量
    $(this.tooltipElement)
      .css({ top, left })
      .attr('placement', this.placement)
      .attr('offset', this.offset);

    // 设置旗杆（flagpole）的位置
    $(this.flagpoleElement)
      .css({ left });
  }
}
