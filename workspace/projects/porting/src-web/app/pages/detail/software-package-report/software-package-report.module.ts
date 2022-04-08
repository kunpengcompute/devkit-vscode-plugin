import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { SoftwarePackageReportRoutingModule } from './software-package-report-routing.module';
import { SoftwarePackageReportComponent } from './software-package-report.component';
import { CommonReportDetailModule } from '../common-report-detail/common-report-detail.module';

@NgModule({
  declarations: [
    SoftwarePackageReportComponent
  ],
  imports: [
    SharedModule,
    SoftwarePackageReportRoutingModule,
    CommonReportDetailModule
  ]
})
export class SoftwarePackageReportModule { }
