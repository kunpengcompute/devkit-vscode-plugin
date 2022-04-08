import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoftwareMigrationReportDetailComponent } from './software-migration-report-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SoftwareMigrationReportDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoftwareMigrationReportDetailRoutingModule { }
