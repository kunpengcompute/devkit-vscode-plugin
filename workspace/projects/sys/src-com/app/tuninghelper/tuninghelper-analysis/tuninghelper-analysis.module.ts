import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { MissionAnalysisModule } from 'sys/src-com/app/mission-analysis/mission-analysis.module';
import { TuninghelperCommonModule } from './components/tuninghelper-common.module';
import { TuninghelperCompareModule } from './tuninghelper-compare/tuninghelper-compare.module';

import { TuninghelperTaskDetailComponent } from './tuninghelper-task-detail/tuninghelper-task-detail.component';
import { SystemConfigComponent } from './tuninghelper-task-detail/system-config/system-config.component';
import { HotFunctionComponent } from './tuninghelper-task-detail/hot-function/hot-function.component';
import { SystemPerfComponent } from './tuninghelper-task-detail/system-perf/system-perf.component';
import { ProcessPerfComponent } from './tuninghelper-task-detail/process-perf/process-perf.component';
import { OptimizeSugCellComponent } from './tuninghelper-task-detail/components/optimize-sug-cell/optimize-sug-cell.component';
import { TuninghelperRecordDetailComponent } from './tuninghelper-record-detail/tuninghelper-record-detail.component';
import { SuggestionsBlockComponent } from './tuninghelper-record-detail/components/suggestions-block/suggestions-block.component';

import { SystemBubbleGraghComponent } from './tuninghelper-task-detail/system-perf/system-bubble-gragh/system-bubble-gragh.component';
import { PercentInputComponent } from './tuninghelper-task-detail/components/percent-input/percent-input.component';
import { SystemPerfSugDetailComponent } from './tuninghelper-task-detail/system-perf/system-perf-sug-detail/system-perf-sug-detail.component';
import { ProcessPerfSugDetailComponent } from './tuninghelper-task-detail/process-perf/process-perf-sug-detail/process-perf-sug-detail.component';
import { CoreDetailComponent } from './tuninghelper-task-detail/system-perf/system-bubble-gragh/core-detail/core-detail.component';
import { SystemCpuTargetComponent } from './tuninghelper-task-detail/system-perf/system-cpu-target/system-cpu-target.component';
import { TuninghelperTaskInfoLogDetailComponent } from './tuninghelper-task-info-log-detail/tuninghelper-task-info-log-detail.component';
import { TopologyTreeDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-detail/topology-tree-detail.component';
import { SystemIndicatorDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/system-indicator-detail/system-indicator-detail.component';
import { ThresholdSettingComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/threshold-setting/threshold-setting.component';
import { TopologyTreeOptimizationSugComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/topology-tree-optimization-sug.component';
import { TreeRootDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/tree-root-detail/tree-root-detail.component';
import { TreeMiddleDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/tree-middle-detail/tree-middle-detail.component';
import { FormSugDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/form-sug-detail/form-sug-detail.component';
import { PidTargetComponent } from './tuninghelper-task-detail/components/pid-target/pid-target.component';
import { TreeLeafDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/tree-leaf-detail/tree-leaf-detail.component';
import { TuninghelperDetailedDataComponent } from './tuninghelper-detailed-data/tuninghelper-detailed-data.component';
import { ProcessPerfDataDetailComponent } from './tuninghelper-detailed-data/process-perf-data-detail/process-perf-data-detail.component';
import { SystemPerfDataDetailComponent } from './tuninghelper-detailed-data/system-perf-data-detail/system-perf-data-detail.component';
import { SysConfigDataDetailComponent } from './tuninghelper-detailed-data/sys-config-data-detail/sys-config-data-detail.component';
import { HotFuncDataDetailComponent } from './tuninghelper-detailed-data/hot-func-data-detail/hot-func-data-detail.component';
import { ProcessBubbleGraghComponent } from './tuninghelper-task-detail/process-perf/process-bubble-gragh/process-bubble-gragh.component';
import { ProcessCpuTargetComponent } from './tuninghelper-task-detail/process-perf/process-cpu-target/process-cpu-target.component';
import { BubbleBoxComponent } from './tuninghelper-task-detail/components/bubble-box/bubble-box.component';
import { BubbleComponent } from './tuninghelper-task-detail/components/bubble-box/bubble/bubble.component';
import { ProcessInfoDetailComponent } from './tuninghelper-task-detail/components/process-info-detail/process-info-detail.component';
import { ProcessIndicatorDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/process-indicator-detail/process-indicator-detail.component';
import { MemoryDetailedComponent } from './tuninghelper-detailed-data/system-perf-data-detail/memory-detailed/memory-detailed.component';
import { StorageDetailedComponent } from './tuninghelper-detailed-data/system-perf-data-detail/storage-detailed/storage-detailed.component';
import { NetworkDetailedComponent } from './tuninghelper-detailed-data/system-perf-data-detail/network-detailed/network-detailed.component';
import { CpuDetailedComponent } from './tuninghelper-detailed-data/system-perf-data-detail/cpu-detailed/cpu-detailed.component';
import { CpuUsageTableComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/cpu-usage-table/cpu-usage-table.component';
import { RuningProcessThreadComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/runing-process-thread/runing-process-thread.component';
import { CpuLoadTableComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/cpu-load-table/cpu-load-table.component';
import { InterruptMsgComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/interrupt-msg/interrupt-msg.component';
import { CreateAndContextSwitchComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/create-and-context-switch/create-and-context-switch.component';
import { SoftIrqComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/soft-irq/soft-irq.component';
import { CoreDetailsComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/core-details/core-details.component';
import { TableContainerComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/table-container/table-container.component';
import { InterruptionDistributionComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/interruption-distribution/interruption-distribution.component';
import { RuningProcessDetailComponent } from './tuninghelper-detailed-data/runing-process-detail/runing-process-detail.component';
import { ProcessIndicatorInfoComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-indicator-info/process-indicator-info.component';
import { ProcessAppPidDetailComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-app-pid-detail/process-app-pid-detail.component';
import { ProcessPidMicMetricsComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-mic-metrics/process-pid-mic-metrics.component';
import { ProcessPidMemoryaccessMetricsComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-memoryaccess-metrics/process-pid-memoryaccess-metrics.component';
import { ProcessPidCpuAffinityComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-cpu-affinity/process-pid-cpu-affinity.component';
import { ProcessPidMemoryAffinityComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-memory-affinity/process-pid-memory-affinity.component';
import { ProcessPidSystemCallComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-system-call/process-pid-system-call.component';
import { ProcessPidOperateNetworkComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-operate-network/process-pid-operate-network.component';
import { ProcessPidOperateFilesComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-operate-files/process-pid-operate-files.component';
import { ProcessPidNumaAllocationComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-numa-allocation/process-pid-numa-allocation.component';
import { ProcessPidHotFuncComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-hot-func/process-pid-hot-func.component';
import { ProcessBubbleBoxComponent } from './tuninghelper-task-detail/process-perf/process-bubble-gragh/process-bubble-box/process-bubble-box.component';
import { SysConfigCpuComponent } from './tuninghelper-detailed-data/sys-config-data-detail/sys-config-cpu/sys-config-cpu.component';
import { SysConfigMemComponent } from './tuninghelper-detailed-data/sys-config-data-detail/sys-config-mem/sys-config-mem.component';
import { SysConfigDiskComponent } from './tuninghelper-detailed-data/sys-config-data-detail/sys-config-disk/sys-config-disk.component';
import { SysConfigNetComponent } from './tuninghelper-detailed-data/sys-config-data-detail/sys-config-net/sys-config-net.component';
import { SysConfigOsComponent } from './tuninghelper-detailed-data/sys-config-data-detail/sys-config-os/sys-config-os.component';
import { HotSpotFuncFunctionComponent } from './tuninghelper-detailed-data/hot-func-data-detail/components/hot-spot-func-function/hot-spot-func-function.component';
import { HotSpotFuncModuleComponent } from './tuninghelper-detailed-data/hot-func-data-detail/components/hot-spot-func-module/hot-spot-func-module.component';
import { ProcessPidHotFuncModuleComponent } from './tuninghelper-detailed-data/process-perf-data-detail/components/process-pid-hot-func-module/process-pid-hot-func-module.component';
import { TreeHotfunctionDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/tree-hotfunction-detail/tree-hotfunction-detail.component';
import { HardIrqComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/hard-irq/hard-irq.component';
import { SoftMapComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/soft-irq/soft-map/soft-map.component';
import { MicMetricsTableComponent } from './tuninghelper-detailed-data/system-perf-data-detail/components/mic-metrics-table/mic-metrics-table.component';
import { TreeDoubleHeadTableComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/tree-double-head-table/tree-double-head-table.component';
import { TreeSugTableDetailComponent } from './tuninghelper-task-detail/components/topology-tree/topology-tree-optimization-sug/tree-sug-table-detail/tree-sug-table-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MissionAnalysisModule,
    TuninghelperCommonModule,
    TuninghelperCompareModule,
  ],
  exports: [
    TuninghelperCompareModule,
    TuninghelperTaskDetailComponent,
    TuninghelperRecordDetailComponent,
    TuninghelperTaskInfoLogDetailComponent,
    TuninghelperDetailedDataComponent,
    RuningProcessDetailComponent,
    ProcessAppPidDetailComponent,
  ],
  declarations: [
    TuninghelperTaskDetailComponent,
    SystemConfigComponent,
    HotFunctionComponent,
    SystemPerfComponent,
    ProcessPerfComponent,
    OptimizeSugCellComponent,
    TuninghelperRecordDetailComponent,
    SuggestionsBlockComponent,
    SystemBubbleGraghComponent,
    PercentInputComponent,
    SystemPerfSugDetailComponent,
    ProcessPerfSugDetailComponent,
    CoreDetailComponent,
    SystemCpuTargetComponent,
    TuninghelperTaskInfoLogDetailComponent,
    TopologyTreeDetailComponent,
    TopologyTreeOptimizationSugComponent,
    ThresholdSettingComponent,
    SystemIndicatorDetailComponent,
    ProcessIndicatorDetailComponent,
    TreeRootDetailComponent,
    TreeMiddleDetailComponent,
    FormSugDetailComponent,
    TreeLeafDetailComponent,
    PidTargetComponent,
    TuninghelperDetailedDataComponent,
    ProcessPerfDataDetailComponent,
    SystemPerfDataDetailComponent,
    SysConfigDataDetailComponent,
    HotFuncDataDetailComponent,
    ProcessBubbleGraghComponent,
    ProcessCpuTargetComponent,
    BubbleBoxComponent,
    BubbleComponent,
    ProcessInfoDetailComponent,
    MemoryDetailedComponent,
    StorageDetailedComponent,
    NetworkDetailedComponent,
    CpuDetailedComponent,
    CpuUsageTableComponent,
    RuningProcessThreadComponent,
    CpuLoadTableComponent,
    InterruptMsgComponent,
    CreateAndContextSwitchComponent,
    SoftIrqComponent,
    CoreDetailsComponent,
    TableContainerComponent,
    InterruptionDistributionComponent,
    RuningProcessDetailComponent,
    ProcessIndicatorInfoComponent,
    ProcessAppPidDetailComponent,
    ProcessPidMicMetricsComponent,
    ProcessPidMemoryaccessMetricsComponent,
    ProcessPidCpuAffinityComponent,
    ProcessPidMemoryAffinityComponent,
    ProcessPidSystemCallComponent,
    ProcessPidOperateNetworkComponent,
    ProcessPidOperateFilesComponent,
    ProcessPidNumaAllocationComponent,
    ProcessPidHotFuncComponent,
    ProcessBubbleBoxComponent,
    SysConfigCpuComponent,
    SysConfigMemComponent,
    SysConfigDiskComponent,
    SysConfigNetComponent,
    SysConfigOsComponent,
    HotSpotFuncFunctionComponent,
    HotSpotFuncModuleComponent,
    ProcessPidHotFuncModuleComponent,
    TreeHotfunctionDetailComponent,
    HardIrqComponent,
    SoftMapComponent,
    MicMetricsTableComponent,
    TreeDoubleHeadTableComponent,
    TreeSugTableDetailComponent,
  ],
})
export class TuninghelperAnalysisModule {
  constructor() { }
}
