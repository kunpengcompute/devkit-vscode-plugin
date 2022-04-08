import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BlockIoTraceComponent } from './storage-detail/block-io-trace/block-io-trace.component';
import { TraceDetailComponent } from './storage-detail/trace-detail/trace-detail.component';
import { PortHardInterComponent } from './port-hard-inter/port-hard-inter.component';
import { PcieHardIrqAffinityDistComponent } from './port-hard-inter/component/pcie-hard-irq-affinity-dist/pcie-hard-irq-affinity-dist.component';
import { PcieIrqAffinityDistComponent } from './port-hard-inter/component/pcie-irq-affinity-dist/pcie-irq-affinity-dist.component';
import { HardCpuTableComponent } from './port-hard-inter/hard-cpu-table/hard-cpu-table.component';
import { HardNumberTableComponent } from './port-hard-inter/hard-number-table/hard-number-table.component';
import { IrqModalTableComponent } from './port-hard-inter/hard-cpu-table/irq-modal-table/irq-modal-table.component';
import { HpcAnalysisModule } from '../hpc-analysis/hpc-analysis.module';
import { HpcMpiComComponent } from '../mission-analysis/hpc-mpi-com/hpc-mpi-com.component';


@NgModule({
  declarations: [
    BlockIoTraceComponent,
    TraceDetailComponent,
    PortHardInterComponent,
    PcieHardIrqAffinityDistComponent,
    PcieIrqAffinityDistComponent,
    HardCpuTableComponent,
    HardNumberTableComponent,
    IrqModalTableComponent,
    HpcMpiComComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    HpcAnalysisModule,
  ],
  exports: [
    BlockIoTraceComponent,
    PortHardInterComponent,
    PcieHardIrqAffinityDistComponent,
    PcieIrqAffinityDistComponent,
    HardCpuTableComponent,
    HardNumberTableComponent,
    IrqModalTableComponent,
    HpcMpiComComponent,
    HpcAnalysisModule,
  ]
})
export class MissionDetailModule { }
