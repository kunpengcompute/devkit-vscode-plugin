import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { TuninghelperCommonModule } from '../../components/tuninghelper-common.module';
import { HotFunctionCompareComponent } from './hot-function-compare.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TuninghelperCommonModule,
  ],
  exports: [
    HotFunctionCompareComponent,
  ],
  declarations: [
    HotFunctionCompareComponent,
  ],
})
export class HotFunctionCompareModule {
  constructor() {}
}
