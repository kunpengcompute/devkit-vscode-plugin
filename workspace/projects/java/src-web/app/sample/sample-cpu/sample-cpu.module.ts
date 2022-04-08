import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { SampleCpuRoutingModule } from './sample-cpu-routing.module';
import { SampleThreadComponent } from '../sample-thread/sample-thread.component';
import { SampleMethodComponent } from '../sample-method/sample-method.component';
import { SampleLockComponent } from '../sample-lock/sample-lock.component';


@NgModule({
  declarations: [
    SampleThreadComponent,
    SampleMethodComponent,
    SampleLockComponent
  ],
  imports: [
    SharedModule,
    SampleCpuRoutingModule
  ]
})
export class SampleCpuModule { }
