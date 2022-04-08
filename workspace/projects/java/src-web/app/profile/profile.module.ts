import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileHotComponent } from './profile-hot/profile-hot.component';

@NgModule({
  declarations: [ProfileHotComponent],
  imports: [
    ProfileRoutingModule,
    SharedModule
  ],
  exports: [
    ProfileRoutingModule,
    SharedModule
  ]
})
export class ProfileModule { }
