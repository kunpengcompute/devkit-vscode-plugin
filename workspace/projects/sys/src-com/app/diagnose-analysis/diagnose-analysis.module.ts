import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetIoDetailModule } from './net-io-detail/net-io-detail.module';
import { StorageIoDetailModule } from './storage-io-detail/storage-io-detail.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NetIoDetailModule,
    StorageIoDetailModule
  ],
  exports: [
    NetIoDetailModule,
    StorageIoDetailModule
  ],
})
export class DiagnoseAnalysisModule {}
