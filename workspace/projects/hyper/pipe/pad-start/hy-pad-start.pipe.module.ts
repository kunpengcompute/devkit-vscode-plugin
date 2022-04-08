import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyPadStartPipe } from './hy-pad-start.pipe';

// 引用TiTipModule，可以使用Tip指令和Tip服务
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [HyPadStartPipe],
  declarations: [HyPadStartPipe]
})
export class HyPadStartPipeModule { }
