import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SampleRoutingModule } from './sample-routing.module';

import { SampleDetailComponent } from './sample-detail/sample-detail.component';
import { SampleEnvComponent } from './sample-env/sample-env.component';
import { SampleMemoryComponent } from './sample-memory/sample-memory.component';
import { SampleCpuComponent } from './sample-cpu/sample-cpu.component';
import { SampleCpuModule } from './sample-cpu/sample-cpu.module';
import { SampleIoModule } from './sample-io/sample-io.module';
import { SampleStorageModule } from './sample-storage/sample-storage.module';

@NgModule({
  declarations: [
    SampleDetailComponent,
    SampleEnvComponent,
    SampleMemoryComponent,
    SampleCpuComponent
  ],
  imports: [
    SampleRoutingModule,
    SharedModule,
    SampleCpuModule,
    SampleIoModule,
    SampleStorageModule
  ]
})
export class SampleModule { }
