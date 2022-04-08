import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { MigrationDetailRoutingModule } from './migration-detail-routing.module';
import { MigrationDetailComponent } from './migration-detail.component';


@NgModule({
  declarations: [MigrationDetailComponent],
  imports: [
    SharedModule,
    MigrationDetailRoutingModule
  ]
})
export class MigrationDetailModule {
  constructor() {

  }
}
