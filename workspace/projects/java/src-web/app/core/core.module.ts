import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CoreRoutingModule } from './core-routing.module';


import { HomeModule } from './home/home.module';
import { NewHeaderModule } from './header-new/header/new-header/new-header.module';


@NgModule({
  declarations: [],
  imports: [
    CoreRoutingModule,
    SharedModule,
    HomeModule,
    NewHeaderModule
  ],
  exports: [
    SharedModule,
    NewHeaderModule,
    HomeModule
  ]
})
export class CoreModule { }
