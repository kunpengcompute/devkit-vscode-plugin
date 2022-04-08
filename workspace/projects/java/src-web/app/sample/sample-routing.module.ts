import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SampleDetailComponent } from './sample-detail/sample-detail.component';
import { SampleEnvComponent } from './sample-env/sample-env.component';
import { SampleMemoryComponent } from './sample-memory/sample-memory.component';

const routes: Routes = [
  {
    path: '',
    component: SampleDetailComponent,
    children: [
      {
        path: 'env',
        component: SampleEnvComponent,
      },
      {
        path: 'cpu',
        loadChildren: () => import('./sample-cpu/sample-cpu.module').then(m => m.SampleCpuModule)
      },
      {
        path: 'gc',
        component: SampleMemoryComponent,
      },
      {
        path: 'objects',
        loadChildren: () => import('./sample-storage/sample-storage.module').then(m => m.SampleStorageModule)
      },
      {
        path: 'io',
        loadChildren: () => import('./sample-io/sample-io.module').then(m => m.SampleIoModule)
      },
      {
        path: '**',
        component: SampleEnvComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleRoutingModule { }
