import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonReportDetailComponent } from './common-report-detail.component';
import { NestedTableComponent } from './nested-table/nested-table.component';

@NgModule({
  declarations: [
    CommonReportDetailComponent, NestedTableComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [CommonReportDetailComponent]
})
export class CommonReportDetailModule { }
