import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoftwarePackageReportComponent } from './software-package-report.component';

const routes: Routes = [
  {
    path: '',
    component: SoftwarePackageReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoftwarePackageReportRoutingModule { }
