import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnoseAnalysisModule } from 'sys/src-com/app/diagnose-analysis/diagnose-analysis.module';

import { NetPortDisplayContainerComponent } from './net-port-diaplay/net-port-display-container.component';
import { NetCaptureSourceContainerComponent } from './net-capture-source/net-capture-source-container.component';

@NgModule({
  imports: [
    CommonModule,
    DiagnoseAnalysisModule
  ],
  declarations: [
    NetPortDisplayContainerComponent,
    NetCaptureSourceContainerComponent
  ],
  exports: [
    NetPortDisplayContainerComponent,
    NetCaptureSourceContainerComponent
  ]
})
export class NetIoDetailModule {
  constructor() { }
}
