import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BCFileReportComponent } from './bcfile-report.component';

const routes: Routes = [
  {
    path: '',
    component: BCFileReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BcfileReportRoutingModule { }
