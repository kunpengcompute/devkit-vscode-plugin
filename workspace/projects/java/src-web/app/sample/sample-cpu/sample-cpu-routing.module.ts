import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SampleCpuComponent } from './sample-cpu.component';
import { SampleThreadComponent } from '../sample-thread/sample-thread.component';
import { SampleMethodComponent } from '../sample-method/sample-method.component';
import { SampleLockComponent } from '../sample-lock/sample-lock.component';

const routes: Routes = [
  {
    path: '',
    component: SampleCpuComponent,
    children: [
      {
        path: 'thread',
        component: SampleThreadComponent,
      },
      {
        path: 'method',
        component: SampleMethodComponent,
      },
      {
        path: 'lock',
        component: SampleLockComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleCpuRoutingModule { }
