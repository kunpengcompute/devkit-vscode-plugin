import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { SoftwareMigrationReportDetailRoutingModule } from './software-migration-report-detail-routing.module';
import { SoftwareMigrationReportDetailComponent } from './software-migration-report-detail.component';

@NgModule({
  declarations: [SoftwareMigrationReportDetailComponent],
  imports: [
    SharedModule,
    SoftwareMigrationReportDetailRoutingModule
  ]
})
export class SoftwareMigrationReportDetailModule { }
