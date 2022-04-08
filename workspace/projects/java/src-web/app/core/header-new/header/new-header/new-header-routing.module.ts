import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewHeaderComponent } from './new-header.component';

const routes: Routes = [
  {
    path: '',
    component: NewHeaderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewHeaderRoutingModule { }
