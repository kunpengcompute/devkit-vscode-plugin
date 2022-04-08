import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { TuninghelperCommonModule } from '../../components/tuninghelper-common.module';
import { CompareInfoComponent } from './compare-info.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TuninghelperCommonModule,
  ],
  exports: [
    CompareInfoComponent,
  ],
  declarations: [
    CompareInfoComponent,
  ],
})
export class CompareInfoModule {
  constructor() {}
}
