import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { ReportDetailRoutingModule } from './report-detail-routing.module';
import { ReportDetailComponent } from './report-detail.component';

@NgModule({
  declarations: [ReportDetailComponent],
  imports: [
    SharedModule,
    ReportDetailRoutingModule
  ],
  exports: [ReportDetailComponent]
})
export class ReportDetailModule { }
