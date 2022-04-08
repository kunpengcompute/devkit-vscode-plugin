import {
    Directive, Input, ElementRef, OnInit,
    NgZone, Renderer2, RendererFactory2, OnDestroy
} from '@angular/core';

@Directive({
    selector: '[appSpinnerBlur]'
})
export class SpinnerBlurDirective implements OnInit, OnDestroy {
    @Input('appSpinnerBlur') spinnerInfo: any;

    private render: Renderer2;
    private hostEle: Element;
    private unListenBlurFn: () => void;

    constructor(
        private hostElRef: ElementRef,
        private zone: NgZone,
        private rendererFactory: RendererFactory2
    ) {
        this.render = this.rendererFactory.createRenderer(null, null);
        this.hostEle = this.hostElRef.nativeElement;
    }

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            const inputEle: HTMLInputElement = this.hostEle.querySelector('input');
            this.unListenBlurFn = this.render.listen(inputEle, 'blur', () => {
                this.setSpinnerInfo(this.spinnerInfo);
            });
        });
    }

    ngOnDestroy() {
        this.unListenBlurFn();
    }

    /**
     * 设置spinner的值：
     * 1. 当控件的值为空设置为最小值
     * 2. 当控件的值不为数字类型时设置为最小值
     * 3. 当控件的值小于最小值设置为最小值
     * 4. 当控件的值大于最大值设置为最大值
     *
     * @param info spinner参数
     */
    private setSpinnerInfo(info: any) {
        const { control, min, max } = info;
        const value = +control?.value; // number, NaN

        switch (true) {
            case value == null || isNaN(value):
                control.setValue(min);
                break;
            case value < min:
                control.setValue(min);
                break;
            case value > max:
                control.setValue(max);
                break;
            default:
        }
    }
}
