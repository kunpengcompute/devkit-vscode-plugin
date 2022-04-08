import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { TuninghelperCommonModule } from '../../components/tuninghelper-common.module';
import { SysPerfCompareComponent } from './sys-perf-compare.component';
import { IrqDistributionEchartComponent } from './compare-cpu/irq-distribution-echart/irq-distribution-echart.component';
import { CompareCpuComponent } from './compare-cpu/compare-cpu.component';
import { CpuUsageCompareComponent } from './compare-cpu/cpu-usage-compare/cpu-usage-compare.component';
import { InterruptMsgCompareComponent } from './compare-cpu/interrupt-msg-compare/interrupt-msg-compare.component';
import { SysPerfMemoryCompareComponent } from './sys-perf-memory-compare/sys-perf-memory-compare.component';
import { SysPerfNetworkCompareComponent } from './sys-perf-network-compare/sys-perf-network-compare.component';
import { SysPerfStorageCompareComponent } from './sys-perf-storage-compare/sys-perf-storage-compare.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TuninghelperCommonModule,
  ],
  exports: [
    SysPerfCompareComponent,
  ],
  declarations: [
    SysPerfCompareComponent,
    IrqDistributionEchartComponent,
    CompareCpuComponent,
    CpuUsageCompareComponent,
    InterruptMsgCompareComponent,
    SysPerfMemoryCompareComponent,
    SysPerfNetworkCompareComponent,
    SysPerfStorageCompareComponent
  ],
})
export class SysPerfCompareModule {
  constructor() {}
}
