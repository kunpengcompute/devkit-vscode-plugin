import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { SourceReportRoutingModule } from './source-report-routing.module';
import { SourceReportComponent } from './source-report.component';
import { ReportDiffModule } from '../report-diff/report-diff.module';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { FileLockedComponent } from './file-locked/file-locked.component';
import { WeakCheckReportDetailComponent } from './weak-check-report-detail/weak-check-report-detail.component';
import { ReportDetailModule } from '../report-detail/report-detail.module';

@NgModule({
  declarations: [
    SourceReportComponent, DisclaimerComponent,
    FileLockedComponent, WeakCheckReportDetailComponent
  ],
  imports: [
    SharedModule,
    SourceReportRoutingModule,
    ReportDiffModule,
    ReportDetailModule
  ]
})
export class SourceReportModule { }
