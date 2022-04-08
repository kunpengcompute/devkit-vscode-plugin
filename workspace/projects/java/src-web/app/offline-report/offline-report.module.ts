import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { OfflineReportRoutingModule } from './offline-report-routing.module';

import { HeapdumpDetailComponent } from './heapdump/heapdump-detail/heapdump-detail.component';
import { OfflineMemorydumpComponent } from './heapdump/offline-memorydump/offline-memorydump.component';
import { OfflineReportinforComponent } from './heapdump/offline-reportinfor/offline-reportinfor.component';
import { GclogDetailComponent } from './gclog/gclog-detail/gclog-detail.component';
import { OfflineGclogComponent } from './gclog/offline-gclog/offline-gclog.component';


@NgModule({
  declarations: [
    HeapdumpDetailComponent,
    OfflineMemorydumpComponent,
    OfflineReportinforComponent,
    GclogDetailComponent,
    OfflineGclogComponent
  ],
  imports: [
    SharedModule,
    OfflineReportRoutingModule
  ]
})
export class OfflineReportModule { }
