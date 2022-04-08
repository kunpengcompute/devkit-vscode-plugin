import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyThouSeparatorPipe } from './hy-thou-separator.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [HyThouSeparatorPipe],
  declarations: [HyThouSeparatorPipe]
})
export class HyThouSeparatorPipeModule {}
