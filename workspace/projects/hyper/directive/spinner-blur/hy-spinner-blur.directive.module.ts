import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HySpinnerBlurDirective } from './hy-spinner-blur.directive';

// 引用TiTipModule，可以使用Tip指令和Tip服务
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [HySpinnerBlurDirective],
  declarations: [HySpinnerBlurDirective]
})
export class HySpinnerBlurDirectiveModule { }
