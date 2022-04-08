import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  RendererFactory2,
  OnDestroy,
} from '@angular/core';
import { HySpinnerBlurInfo } from '../../domain';
import { Cat } from '../../util';

@Directive({
  selector: '[hySpinnerBlur]',
})
export class HySpinnerBlurDirective implements OnDestroy {
  @Input('hySpinnerBlur')
  set spinnerInfo(info: HySpinnerBlurInfo) {
    if (Cat.isNil(info) || Cat.isEmpty(info)) {
      return;
    }

    const inputEle: HTMLInputElement =
      'INPUT' === this.hostEle.tagName
        ? (this.hostEle as HTMLInputElement)
        : this.hostEle.querySelector('input');
    this.unListenBlurFn?.();
    this.unListenBlurFn = this.render.listen(inputEle, 'blur', () => {
      this.setSpinnerInfo(info);
    });
  }

  private render: Renderer2;
  private hostEle: Element;
  private unListenBlurFn: () => void;

  constructor(
    private hostElRef: ElementRef,
    private rendererFactory: RendererFactory2
  ) {
    this.render = this.rendererFactory.createRenderer(null, null);
    this.hostEle = this.hostElRef.nativeElement;
  }

  ngOnDestroy() {
    this.unListenBlurFn?.();
  }

  /**
   * 设置spinner的值：
   * 1. 当控件的值为空设置为: 有默认值设置为默认值，没有默认值设置为最小值
   * 2. 当控件的值不为数字类型时设置为最小值
   * 3. 当控件的值小于最小值设置为最小值
   * 4. 当控件的值大于最大值设置为最大值
   *
   * @param info spinner参数
   */
  private setSpinnerInfo(info: HySpinnerBlurInfo) {
    const { control, min, max, defaultValue } = info;
    const value = control?.value; // number, NaN, null, '', '    '

    switch (true) {
      case null == value || String(value).trim() === '' || isNaN(value):
        control.setValue(defaultValue ?? min);
        break;
      case +value < min:
        control.setValue(min);
        break;
      case +value > max:
        control.setValue(max);
        break;
      default:
    }
  }
}
