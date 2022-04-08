import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TiFormfieldModule,
  TiSearchboxModule,
  TiIconModule,
} from '@cloud/tiny3';
import { HyTiTipDirectiveModule } from '../../directive/ti-tip';
import { HyPopupSearchComponent } from './hy-popup-search.component';

@NgModule({
  imports: [
    CommonModule,
    TiFormfieldModule,
    HyTiTipDirectiveModule,
    TiSearchboxModule,
    FormsModule,
    TiIconModule,
  ],
  exports: [HyPopupSearchComponent],
  declarations: [HyPopupSearchComponent],
})
class HyPopupSearchModule {}
export { HyPopupSearchModule, HyPopupSearchComponent };
