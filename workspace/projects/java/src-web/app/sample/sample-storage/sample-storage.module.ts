import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { SampleStorageRoutingModule } from './sample-storage-routing.module';
import { SampleStorageComponent } from './sample-storage.component';
import { SampleObjectsComponent } from '../sample-objects/sample-objects.component';
import { SampleLeakComponent } from '../sample-leak/sample-leak.component';


@NgModule({
  declarations: [
    SampleStorageComponent,
    SampleObjectsComponent,
    SampleLeakComponent
  ],
  imports: [
    SharedModule,
    SampleStorageRoutingModule
  ]
})
export class SampleStorageModule { }
