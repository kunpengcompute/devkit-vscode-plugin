import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { SampleIoRoutingModule } from './sample-io-routing.module';
import { SampleIoDetailComponent } from './sample-io-detail/sample-io-detail.component';
import { SampleFileIoComponent } from './sample-file-io/sample-file-io.component';
import { SampleSocketIoComponent } from './sample-socket-io/sample-socket-io.component';

@NgModule({
  declarations: [
    SampleIoDetailComponent,
    SampleFileIoComponent,
    SampleSocketIoComponent
  ],
  imports: [
    SharedModule,
    SampleIoRoutingModule
  ]
})
export class SampleIoModule { }
