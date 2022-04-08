import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MigrationDetailComponent } from './migration-detail.component';

const routes: Routes = [
  {
    path: '',
    component: MigrationDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MigrationDetailRoutingModule { }
