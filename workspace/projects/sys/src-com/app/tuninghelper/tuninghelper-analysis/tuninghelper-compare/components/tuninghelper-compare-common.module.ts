import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { CompareParamsSelectComponent } from './compare-params-select/compare-params-select.component';
import { CompareTextItemComponent } from './compare-text-item/compare-text-item.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    CompareParamsSelectComponent,
    CompareTextItemComponent,
  ],
  declarations: [
    CompareParamsSelectComponent,
    CompareTextItemComponent,
  ],
})
export class TuninghelperCompareCommonModule {
  constructor() {}
}
