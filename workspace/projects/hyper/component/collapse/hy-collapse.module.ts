import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiCollapseModule } from '@cloud/tiny3';
import { HyCollapseComponent } from './hy-collapse.component';

@NgModule({
  imports: [CommonModule, TiCollapseModule],
  exports: [HyCollapseComponent],
  declarations: [HyCollapseComponent],
})
class HyCollapseModule {}
export { HyCollapseModule, HyCollapseComponent };
