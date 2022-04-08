import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ProgressComponent } from './component/progress/progress.component';


@NgModule({
  declarations: [
    HomeComponent,
    ProgressComponent
  ],
  imports: [
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
