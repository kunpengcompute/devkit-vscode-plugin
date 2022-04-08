import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SampleIoDetailComponent } from './sample-io-detail/sample-io-detail.component';
import { SampleFileIoComponent } from './sample-file-io/sample-file-io.component';
import { SampleSocketIoComponent } from './sample-socket-io/sample-socket-io.component';

const routes: Routes = [
  {
    path: '',
    component: SampleIoDetailComponent,
    children: [
      {
        path: '',
        component: SampleFileIoComponent,
      },
      {
        path: 'fileIo',
        component: SampleFileIoComponent,
      },
      {
        path: 'socketIo',
        component: SampleSocketIoComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleIoRoutingModule { }
