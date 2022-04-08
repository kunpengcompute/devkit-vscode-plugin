import { Directive, Input, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[appNiceTooltip]'
})
export class NiceTooltipDirective implements AfterViewInit {
    static TOOLTIP_WIDTH = 300; // 单位: px
    static TOOLTIP_TOP_BOTTOM_OFFSET = 11; // 单位: px，与样式中的值相同
    @Input('appNiceTooltip') niceTooltipInfo: {
        html: string,
        top: { pointX: number, pointY: number },
        bottom: { pointX: number, pointY: number }
    };
    public niceTooltipShowCopy: false;
    @Input()
    set niceTooltipShow(val) {
        this.niceTooltipShowCopy = val;
        if (this.tooltipElement) {
            val ? this.show() : this.hide();
        }
    }
    get niceTooltipShow() {
        return this.niceTooltipShowCopy;
    }

    public placement: 'top' | 'bottom' = 'top';
    public offset = 50;
    public tooltipElement: HTMLElement;
    public timer: any;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    /**
     * AfterView
     */
    ngAfterViewInit(): void {
        this.create();
    }

    /**
     * 展示
     */
    show() {
        clearTimeout(this.timer);
        this.resetValue();
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        this.setPosition();
    }

    /**
     * 隐藏
     */
    hide() {
        this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    }

    /**
     * 在 host 中创建一个 tooltip 的节点
     */
    public create() {
        this.tooltipElement = this.renderer.createElement('div');
        this.renderer.appendChild(this.el.nativeElement, this.tooltipElement);
        this.renderer.addClass(this.tooltipElement, 'nice_tooltip');
        this.renderer.setStyle(this.tooltipElement, 'opacity', 0);
        this.renderer.setStyle(this.tooltipElement, '-webkit-transition', `opacity 500ms`);
        this.renderer.setStyle(this.tooltipElement, '-moz-transition', `opacity 500ms`);
        this.renderer.setStyle(this.tooltipElement, '-o-transition', `opacity 500ms`);
        this.renderer.setStyle(this.tooltipElement, 'transition', `opacity 500ms`);
        this.renderer.setAttribute(this.tooltipElement, 'offset', this.offset.toString());
        this.renderer.setAttribute(this.tooltipElement, 'placement', this.placement);
    }

    /**
     * 更新 tooltip 的值
     */
    public resetValue() {
        const tooltipSelection = $(this.tooltipElement);
        tooltipSelection.empty();
        tooltipSelection.append($(this.niceTooltipInfo.html));
    }

    /**
     * 设置 tooltip 的位置，所有的位置都是相对于指令所在的父组件
     */
    public setPosition() {
        if (!this.niceTooltipInfo) {
            return;
        }

        const hostRect = this.el.nativeElement.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();

        // 计算提示框的位置(上下)
        let finnalPos: { pointX: number, pointY: number };
        const hasTop = this.niceTooltipInfo.top && Object.keys(this.niceTooltipInfo.top).length > 0;
        const hasBottom = this.niceTooltipInfo.bottom && Object.keys(this.niceTooltipInfo.bottom).length > 0;
        if (!hasTop && !hasBottom) {
            return;
        } else if (hasTop && !hasBottom) {
            finnalPos = this.niceTooltipInfo.top;
            this.placement = 'top';
        } else if (!hasTop && hasBottom) {
            finnalPos = this.niceTooltipInfo.bottom;
            this.placement = 'bottom';
        } else {
            finnalPos = this.niceTooltipInfo.top;
            this.placement = 'top';
            const hasTopSpace =
              finnalPos.pointY >
              NiceTooltipDirective.TOOLTIP_TOP_BOTTOM_OFFSET +
                tooltipRect.height;
            if (!hasTopSpace) {
                finnalPos = this.niceTooltipInfo.bottom;
                this.placement = 'bottom';
            }
        }

        // 计算提示框的小尖位置（偏移量）
        const offLeft = finnalPos.pointX - tooltipRect.width / 2;  // 距离左边框的距离
        const offRight = hostRect.width - (tooltipRect.width / 2 + finnalPos.pointX); // 距离右边框的距离

        if (offLeft < 0) {
            this.offset = Math.floor(50 - Math.abs(offLeft) / tooltipRect.width * 100);
        } else if (offRight < 0) {
            this.offset = Math.ceil(50 + Math.abs(offRight) / tooltipRect.width * 100);
        } else {
            this.offset = 50;
        }

        // 设置提示框的位置、朝向和小尖的位置
        $(this.tooltipElement).stop()
            .animate({ left: finnalPos.pointX, top: finnalPos.pointY }, 500)
            .attr('placement', this.placement)
            .attr('offset', this.offset);
    }
}
