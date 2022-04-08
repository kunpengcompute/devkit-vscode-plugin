import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SampleStorageComponent } from './sample-storage.component';
import { SampleObjectsComponent } from '../sample-objects/sample-objects.component';
import { SampleLeakComponent } from '../sample-leak/sample-leak.component';

const routes: Routes = [
  {
    path: '',
    component: SampleStorageComponent,
    children: [
      {
        path: '',
        component: SampleObjectsComponent,
      },
      {
        path: 'objects',
        component: SampleObjectsComponent,
      },
      {
        path: 'leak',
        component: SampleLeakComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleStorageRoutingModule { }
