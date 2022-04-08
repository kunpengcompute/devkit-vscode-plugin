import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { TuninghelperCommonModule } from '../../components/tuninghelper-common.module';
import { ProcessPerfCompareComponent } from './process-perf-compare.component';
import { CompareProcessIndicatorInfoComponent } from './components/compare-process-indicator-info/compare-process-indicator-info.component';
import { CompareProcessAppCommandDetailComponent } from './components/compare-process-app-command-detail/compare-process-app-command-detail.component';
import { CompareProcessMicMetricsComponent } from './components/compare-process-mic-metrics/compare-process-mic-metrics.component';
import { CompareProcessMemoryaccessMetricsComponent } from './components/compare-process-memoryaccess-metrics/compare-process-memoryaccess-metrics.component';
import { CompareProcessCpuAffinityComponent } from './components/compare-process-cpu-affinity/compare-process-cpu-affinity.component';
import { CompareProcessNumaAllocationComponent } from './components/compare-process-numa-allocation/compare-process-numa-allocation.component';
import { CompareProcessHotFuncComponent } from './components/compare-process-hot-func/compare-process-hot-func.component';
import { CompareProcessOperateFilesComponent } from './components/compare-process-operate-files/compare-process-operate-files.component';
import { CompareProcessOperateNetworkComponent } from './components/compare-process-operate-network/compare-process-operate-network.component';
import { CompareProcessSystemCallComponent } from './components/compare-process-system-call/compare-process-system-call.component';
import { CompareProcessMemoryAffinityComponent } from './components/compare-process-memory-affinity/compare-process-memory-affinity.component';
import { SysConfigCompareModule } from '../sys-config-compare/sys-config-compare.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TuninghelperCommonModule,
    SysConfigCompareModule,
  ],
  exports: [
    ProcessPerfCompareComponent,
    CompareProcessAppCommandDetailComponent
  ],
  declarations: [
    ProcessPerfCompareComponent,
    CompareProcessIndicatorInfoComponent,
    CompareProcessAppCommandDetailComponent,
    CompareProcessMicMetricsComponent,
    CompareProcessMemoryaccessMetricsComponent,
    CompareProcessCpuAffinityComponent,
    CompareProcessNumaAllocationComponent,
    CompareProcessHotFuncComponent,
    CompareProcessOperateFilesComponent,
    CompareProcessOperateNetworkComponent,
    CompareProcessSystemCallComponent,
    CompareProcessMemoryAffinityComponent,
  ],
})
export class ProcessPerfCompareModule {
  constructor() {}
}
