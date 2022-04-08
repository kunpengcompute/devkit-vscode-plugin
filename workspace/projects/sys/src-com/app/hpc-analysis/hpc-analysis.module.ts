import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HpcExpandTreeComponent } from './components/hpc-expand-tree/hpc-expand-tree.component';
import { HpcSummaryDetailComponent } from './hpc-summary-detail/hpc-summary-detail.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HpcExpandTreeComponent,
    HpcSummaryDetailComponent,
  ],
  exports: [
    HpcExpandTreeComponent,
    HpcSummaryDetailComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class HpcAnalysisModule { }
