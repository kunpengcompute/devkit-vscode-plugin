import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyTiTipDirective } from './hy-ti-tip.directive';
import { HyTiTipServiceModule } from '../../service/ti-tip';

// 引用TiTipModule，可以使用Tip指令和Tip服务
@NgModule({
  imports: [
    CommonModule,
    HyTiTipServiceModule
  ],
  exports: [HyTiTipDirective],
  declarations: [HyTiTipDirective]
})
export class HyTiTipDirectiveModule { }
