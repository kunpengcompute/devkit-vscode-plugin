import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { BcfileReportRoutingModule } from './bcfile-report-routing.module';
import { BCFileReportComponent } from './bcfile-report.component';
import { CommonReportDetailModule } from '../common-report-detail/common-report-detail.module';

@NgModule({
  declarations: [
    BCFileReportComponent
  ],
  imports: [
    SharedModule,
    BcfileReportRoutingModule,
    CommonReportDetailModule
  ]
})
export class BcfileReportModule { }
