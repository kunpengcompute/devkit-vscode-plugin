import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportDiffComponent } from './report-diff.component';

const routes: Routes = [
  {
    path: '',
    component: ReportDiffComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportDiffRoutingModule { }
