import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SourceReportComponent } from './source-report.component';

const routes: Routes = [
  {
    path: '',
    component: SourceReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SourceReportRoutingModule { }
