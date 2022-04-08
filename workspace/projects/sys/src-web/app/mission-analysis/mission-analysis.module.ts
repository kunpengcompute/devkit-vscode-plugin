import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { MissionDetailModule } from 'sys/src-com/app/mission-detail/mission-detail.module';
import { PartModule } from 'sys/src-com/app/shared/part.module';

// HPC 分析
import { HpcMemInstructComponent } from './hpctab-detail/hpc-target/components/hpc-mem-instruct/hpc-mem-instruct.component';
import { HpcOpenMpComponent } from './hpctab-detail/hpc-target/components/hpc-open-mp/hpc-open-mp.component';
import { HpcPmuComponent } from './hpctab-detail/hpc-target/components/hpc-pmu/hpc-pmu.component';
import { HpcTopDownComponent } from './hpctab-detail/hpc-target/components/hpc-top-down/hpc-top-down.component';
import { HpcTargetComponent } from './hpctab-detail/hpc-target/hpc-target.component';
import { HpctabDetailComponent } from './hpctab-detail/hpctab-detail.component';

// 全景分析
import { SystabDetailComponent } from './systab-detail/systab-detail.component';
import { CpuDetailComponent } from './systab-detail/cpu-detail/cpu-detail.component';
import { TablesComponent } from './systab-detail/tables/tables.component';
import { MemoryDetailComponent } from './systab-detail/memory-detail/memory-detail.component';
import { SysSummuryComponent } from './systab-detail/sys-summury/sys-summury.component';
import { SysDiskComponent } from './systab-detail/sys-disk/sys-disk.component';
import { SysNetComponent } from './systab-detail/sys-net/sys-net.component';
import { PerformanceTableComponent } from './systab-detail/performance-detail/performance-table/performance-table.component';
import { PerformanceDetailComponent } from './systab-detail/performance-detail/performance-detail.component';
import { PanoramaAnalysisComponent } from './systab-detail/sys-summury/components/panorama-analysis/panorama-analysis.component';
import { StorageSubsystemComponent } from './systab-detail/sys-summury/components/storage-subsystem/storage-subsystem.component';
import { MemorySubsystemComponent } from './systab-detail/sys-summury/components/memory-subsystem/memory-subsystem.component';
import { NiceTooltipDirective } from './systab-detail/sys-summury/directives/nice-tooltip.directive';
import { CpuPackageComponent } from './systab-detail/sys-summury/cpu-package/cpu-package.component';
import { MemorySubsystemDataComponent } from './systab-detail/sys-summury/memory-subsystem-data/memory-subsystem-data.component';
import { StorageSubsystemDataComponent } from './systab-detail/sys-summury/storage-subsystem-data/storage-subsystem-data.component';
import { NetworkSubsystemDataComponent } from './systab-detail/sys-summury/network-subsystem-data/network-subsystem-data.component';
import { RuntimeInformationComponent } from './systab-detail/sys-summury/runtime-information/runtime-information.component';
import { NetworkConfigDataComponent } from './systab-detail/sys-summury/network-config-data/network-config-data.component';
import { StorageResourceConfigComponent } from './systab-detail/sys-summury/storage-resource-config/storage-resource-config.component';
import { AnalysisTimeChartComponent } from './systab-detail/analysis-time-chart/analysis-time-chart.component';
import { CpuPackageNumaComponent } from './systab-detail/sys-summury/components/cpu-package-numa/cpu-package-numa.component';
import { NetworkSubsystemChartComponent } from './systab-detail/sys-summury/components/network-subsystem-chart/network-subsystem-chart.component';
import { CpuPackageNumaTableComponent } from './systab-detail/sys-summury/components/cpu-package-numa-table/cpu-package-numa-table.component';
import { NetworkTableComponent } from './systab-detail/sys-summury/components/network-table/network-table.component';
import { MemoryTableComponent } from './systab-detail/sys-summury/components/memory-table/memory-table.component';
import { StorageTableComponent } from './systab-detail/sys-summury/components/storage-table/storage-table.component';
import { TypicalConfigComponent } from './systab-detail/typical-config/typical-config.component';
import { ConfigInformationComponent } from './systab-detail/typical-config/config-information/config-information.component';
import { ServerNodeGplotComponent } from './systab-detail/typical-config/server-node-gplot/server-node-gplot.component';
import { ServerNodeComponent } from './systab-detail/typical-config/server-node-gplot/components/server-node/server-node.component';
import { ConsumptionDetailComponent } from './systab-detail/consumption-detail/consumption-detail.component';
import { TopDataComponent } from './systab-detail/top-data/top-data.component';

// 资源调度分析
import { AppRestabDetailComponent } from './app-restab-detail/app-restab-detail.component';
import { ResSummaryComponent } from './app-restab-detail/res-summary/res-summary.component';
import { ResCpuScheComponent } from './app-restab-detail/res-cpu-sche/res-cpu-sche.component';
import { ResProcessScheComponent } from './app-restab-detail/res-process-sche/res-process-sche.component';
import { TPSwitchComponent } from './app-restab-detail/res-summary/components/tpswitch/tpswitch.component';
import { NumaNodeSwitchComponent } from './app-restab-detail/res-summary/components/numa-node-switch/numa-node-switch.component';
import { NumaNodeSwitchDetailComponent } from './app-restab-detail/res-summary/components/numa-node-switch-detail/numa-node-switch-detail.component';
import { SideModalComponent } from './app-restab-detail/components/side-modal/side-modal.component';

// 访存分析
import { DdrtabDetailComponent } from './ddrtab-detail/ddrtab-detail.component';
import { DdrSummuryComponent } from './ddrtab-detail/ddr-summury/ddr-summury.component';
import { DdrCatchDetailComponent } from './ddrtab-detail/ddr-catch-detail/ddr-catch-detail.component';
import { DdrDdrDetaililComponent } from './ddrtab-detail/ddr-ddr-detailil/ddr-ddr-detailil.component';
import { TableCatchComponent } from './ddrtab-detail/table-catch/table-catch.component';
import { DdrSummuryEchartComponent } from './ddrtab-detail/ddr-summury/component/ddr-summury-echart/ddr-summury-echart.component';
import { DdrCacheTableComponent } from './ddrtab-detail/ddr-catch-detail/ddr-cache-table/ddr-cache-table.component';
import { DdrDdrTableComponent } from './ddrtab-detail/ddr-ddr-detailil/ddr-ddr-table/ddr-ddr-table.component';
import { TlbFilterSliderComponent } from './ddrtab-detail/ddr-catch-detail/tlb-filter-slider/tlb-filter-slider.component';
import { DdrCacheEchartsComponent } from './ddrtab-detail/ddr-catch-detail/ddr-cache-echarts/ddr-cache-echarts.component';
import { DdrDdrEchartsComponent } from './ddrtab-detail/ddr-ddr-detailil/ddr-ddr-echarts/ddr-ddr-echarts.component';

// 锁与等待分析
import { LocktabDetailComponent } from './locktab-detail/locktab-detail.component';
import { LockSummuryComponent } from './locktab-detail/lock-summury/lock-summury.component';
import { TimingSummuryComponent } from './locktab-detail/timing-summury/timing-summury.component';

// 进程线程分析
import { ProtabDetailComponent } from './protab-detail/protab-detail.component';
import { ProSummuryComponent } from './protab-detail/pro-summury/pro-summury.component';
import { ProCpuComponent } from './protab-detail/pro-cpu/pro-cpu.component';
import { TableProcessComponent } from './protab-detail/table-process/table-process.component';

// 存储 IO 分析
import { StorageDetailComponent } from './storage-detail/storage-detail.component';
import { StorageSummuryComponent } from './storage-detail/storage-summury/storage-summury.component';
import { IoapisComponent } from './storage-detail/ioapis/ioapis.component';
import { DiskioComponent } from './storage-detail/diskio/diskio.component';
import { IoSequenceComponent } from './storage-detail/components/io-sequence/io-sequence.component';
import { BrushDetailsComponent } from './storage-detail/ioapis/components/brush-details/brush-details.component';
import { DiskDetailsComponent } from './storage-detail/diskio/components/disk-details/disk-details.component';
import { DataSizeChartComponent } from './storage-detail/components/data-size-chart/data-size-chart.component';
import { TableChartComponent } from './storage-detail/diskio/components/table-chart/table-chart.component';
import { DiskTableComponent } from './storage-detail/diskio/components/disk-table/disk-table.component';
import { DataBlockComponent } from './storage-detail/diskio/components/data-block/data-block.component';
import { DiskChartComponent } from './storage-detail/components/disk-chart/disk-chart.component';
import { NormalizeBlockComponent } from './storage-detail/components/normalize-block/normalize-block.component';
import { FollowTooltipDirective } from './storage-detail/components/normalize-block/directves/follow-tooltip.directive';
import { NormalizeBlockChartComponent } from './storage-detail/components/normalize-block/normalize-block-chart/normalize-block-chart.component';
import { BlockDisComponent } from './storage-detail/diskio/components/block-dis/block-dis.component';
import { BrushTipsComponent } from './storage-detail/components/brush-tips/brush-tips.component';

// 微架构分析
import { MicarchComponent } from './micarch/micarch.component';
import { MicarchSummuryComponent } from './micarch/micarch-summury/micarch-summury.component';
import { MicarchTimingComponent } from './micarch/micarch-timing/micarch-timing.component';
import { MicarchDetailsComponent } from './micarch/micarch-details/micarch-details.component';
import { TimingNormalizedComponent } from './micarch/components/timing-normalized/timing-normalized.component';
import { IcicleSummaryComponent } from './micarch/components/icicle-summary/icicle-summary.component';
import { FlagTooltipDirective } from './micarch/directives/flag-tooltip.directive';
import { ColorCheckboxComponent } from './micarch/components/color-checkbox/color-checkbox.component';
import { TimingBreadcrumbComponent } from './micarch/components/timing-breadcrumb/timing-breadcrumb.component';
import { ExtrapositionAxisComponent } from './micarch/components/extraposition-axis/extraposition-axis.component';
import { TimingNormalizedAxisComponent } from './micarch/components/timing-normalized-axis/timing-normalized-axis.component';
import { TimingNormalizedChartComponent } from './micarch/components/timing-normalized-chart/timing-normalized-chart.component';

// C/C++ 分析
import { FunctionComponent } from './tab-detail/function/function.component';
import { FlameComponent } from './tab-detail/flame/flame.component';
import { TabDetailComponent } from './tab-detail/tab-detail.component';
import { SummaryComponent } from './tab-detail/summary/summary.component';

// Miss、 伪共存分析
import { MissDetailComponent } from './task-details/miss-event/miss-detail.component';
import { MissStatisticsComponent } from './task-details/miss-event/miss-statistics/miss-statistics.component';
import { MissTimingComponent } from './task-details/miss-event/miss-timing/miss-timing.component';
import { FalseSharingComponent } from './task-details/false-sharing/false-sharing.component';
import { FSSummaryComponent } from './task-details/false-sharing/f-s-summary/f-s-summary.component';
import { SubModuleFunctionComponent } from './task-details/components/sub-module-function/sub-module-function.component';

// 组件
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { ConfigurationLogComponent } from './components/configuration-log/configuration-log.component';
import { MsgSuggestionComponent } from './components/msg-suggestion/msg-suggestion.component';
import { TagBoxComponent } from './app-restab-detail/components/tag-box/tag-box.component';
import { TracingComponent } from './systab-detail/tracing/tracing.component';
import { PcieDetailComponent } from './systab-detail/pcie-detail/pcie-detail.component';
import { CpuTopologyComponent } from './systab-detail/pcie-detail/components/cpu-topology/cpu-topology.component';

// 内存诊断
import { MemoryConsumptionComponent } from './diagnose-leak-detail/memory-consumption/memory-consumption.component';
import { ConsumTableComponent } from './diagnose-leak-detail/memory-consumption/consum-table/consum-table.component';
import { ConsumSequenceComponent } from './diagnose-leak-detail/memory-consumption/consum-sequence/consum-sequence.component';
import { ConsumChartsComponent } from './diagnose-leak-detail/memory-consumption/components/consum-charts/consum-charts.component';
import { DiagnoseLeakDetailComponent } from './diagnose-leak-detail/diagnose-leak-detail.component';
import { OomDetailsComponent } from './diagnose-leak-detail/oom-details/oom-details.component';
import { InformationDescriptionComponent } from './diagnose-leak-detail/oom-details/information-description/information-description.component';
import { InformationTitleComponent } from './diagnose-leak-detail/oom-details/information-title/information-title.component';
import { DetailsPopUpComponent } from './diagnose-leak-detail/oom-details/details-pop-up/details-pop-up.component';
import { CallTreeComponent } from './diagnose-leak-detail/call-tree/call-tree.component';
import { FunStackComponent } from './diagnose-leak-detail/component/fun-stack/fun-stack.component';
import { SourceCodeComponent } from './diagnose-leak-detail/source-code/source-code.component';
import { FunStackNodeComponent } from './diagnose-leak-detail/component/fun-stack/fun-stack-node/fun-stack-node.component';
import { SourceCodeViewerComponent } from './diagnose-leak-detail/component/source-code-viewer/source-code-viewer.component';
import { SearchKeyWordPipe } from './diagnose-leak-detail/oom-details/search-key-word.pipe';
import { MemLeakFuncListComponent } from './diagnose-leak-detail/component/mem-leak-func-list/mem-leak-func-list.component';
import { MemReleaseSubTableComponent } from './diagnose-leak-detail/component/mem-release-sub-table/mem-release-sub-table.component';
import { MemReleaseTableComponent } from './diagnose-leak-detail/component/mem-release-table/mem-release-table.component';
import { MemLeakTableComponent } from './diagnose-leak-detail/component/mem-leak-table/mem-leak-table.component';
import { SourceCodeViewerSliderComponent } from './diagnose-leak-detail/component/source-code-viewer-slider/source-code-viewer-slider.component';
import { MemExceptionDetailComponent } from './diagnose-leak-detail/mem-exception-detail/mem-exception-detail.component';
import { TabListDetailComponent } from './diagnose-leak-detail/mem-exception-detail/components/tab-list-detail/tab-list-detail.component';

// 联动分析
import { LinkageDetailComponent } from './linkage-detail/linkage-detail.component';
import { ConfigDataComponent } from './linkage-detail/config-data/config-data.component';
import { PerfDataComponent } from './linkage-detail/perf-data/perf-data.component';
import { PerfChartComponent } from './linkage-detail/perf-data/components/perf-chart/perf-chart.component';
import { MultipleRowsTableComponent } from './linkage-detail/components/multiple-rows-table/multiple-rows-table.component';
import { NodeInfoItemComponent } from './systab-detail/pcie-detail/components/node-info-item/node-info-item.component';
import { NodeInfoPanelComponent } from './systab-detail/pcie-detail/components/node-info-panel/node-info-panel.component';
import { TypicalDataComponent } from './linkage-detail/typical-data/typical-data.component';
import { DifferentialComponent } from './linkage-detail/differential/differential.component';
import { PcieIoDetailComponent } from './systab-detail/pcie-detail/components/pcie-io-detail/pcie-io-detail.component';
import { FocusSearchboxComponent } from './systab-detail/pcie-detail/components/focus-searchbox/focus-searchbox.component';

@NgModule({
    imports: [
        SharedModule,
        MissionDetailModule,
        PartModule
    ],
    entryComponents: [
        ServerNodeComponent,
    ],
    exports: [
        HpctabDetailComponent,
        SystabDetailComponent,
        AppRestabDetailComponent,
        DdrtabDetailComponent,
        LocktabDetailComponent,
        ProtabDetailComponent,
        StorageDetailComponent,
        MicarchComponent,
        TabDetailComponent,
        MissDetailComponent,
        FalseSharingComponent,
        LinkageDetailComponent,
        DiagnoseLeakDetailComponent,
        OomDetailsComponent
    ],
    declarations: [
        // HPC 分析
        HpctabDetailComponent,
        HpcTargetComponent,
        HpcMemInstructComponent,
        HpcPmuComponent,
        HpcTopDownComponent,
        HpcOpenMpComponent,

        // 全景分析
        SystabDetailComponent,
        CpuDetailComponent,
        TablesComponent,
        MemoryDetailComponent,
        SysSummuryComponent,
        SysDiskComponent,
        SysNetComponent,
        PerformanceTableComponent,
        PerformanceDetailComponent,
        PanoramaAnalysisComponent,
        StorageSubsystemComponent,
        MemorySubsystemComponent,
        NiceTooltipDirective,
        CpuPackageComponent,
        MemorySubsystemDataComponent,
        StorageSubsystemDataComponent,
        NetworkSubsystemDataComponent,
        RuntimeInformationComponent,
        NetworkConfigDataComponent,
        StorageResourceConfigComponent,
        AnalysisTimeChartComponent,
        CpuPackageNumaComponent,
        NetworkSubsystemChartComponent,
        CpuPackageNumaTableComponent,
        NetworkTableComponent,
        MemoryTableComponent,
        StorageTableComponent,
        TypicalConfigComponent,
        ConfigInformationComponent,
        ServerNodeGplotComponent,
        ServerNodeComponent,
        ConsumptionDetailComponent,
        TopDataComponent,
        PcieDetailComponent,
        CpuTopologyComponent,

        // 资源调度分析
        AppRestabDetailComponent,
        ResSummaryComponent,
        ResCpuScheComponent,
        ResProcessScheComponent,
        TPSwitchComponent,
        NumaNodeSwitchComponent,
        NumaNodeSwitchDetailComponent,

        // 访存分析
        DdrtabDetailComponent,
        DdrSummuryComponent,
        DdrSummuryEchartComponent,
        TableCatchComponent,
        DdrCatchDetailComponent,
        DdrCacheEchartsComponent,
        DdrCacheTableComponent,
        TlbFilterSliderComponent,
        DdrDdrDetaililComponent,
        DdrDdrTableComponent,
        DdrDdrEchartsComponent,

        // 锁与等待分析
        LocktabDetailComponent,
        LockSummuryComponent,
        TimingSummuryComponent,

        // 进程线程分析
        ProtabDetailComponent,
        ProSummuryComponent,
        ProCpuComponent,
        TableProcessComponent,

        // 存储 IO 分析
        StorageDetailComponent,
        StorageSummuryComponent,
        IoapisComponent,
        DiskioComponent,
        IoSequenceComponent,
        BrushDetailsComponent,
        DiskDetailsComponent,
        DataSizeChartComponent,
        TableChartComponent,
        DiskTableComponent,
        DataBlockComponent,
        DiskChartComponent,
        NormalizeBlockComponent,
        FollowTooltipDirective,
        NormalizeBlockChartComponent,
        BlockDisComponent,
        BrushTipsComponent,

        // 微架构分析
        MicarchComponent,
        MicarchSummuryComponent,
        MicarchTimingComponent,
        MicarchDetailsComponent,
        TimingNormalizedComponent,
        IcicleSummaryComponent,
        FlagTooltipDirective,
        ColorCheckboxComponent,
        TimingBreadcrumbComponent,
        ExtrapositionAxisComponent,
        TimingNormalizedAxisComponent,
        TimingNormalizedChartComponent,

        // C/C++ 分析
        FunctionComponent,
        FlameComponent,
        TabDetailComponent,
        SummaryComponent,

        // Miss、 伪共存分析
        MissDetailComponent,
        MissStatisticsComponent,
        SubModuleFunctionComponent,
        MissTimingComponent,
        FalseSharingComponent,
        FSSummaryComponent,

        // 组件
        ConfigurationComponent,
        ConfigurationLogComponent,
        MsgSuggestionComponent,
        SideModalComponent,
        TagBoxComponent,
        TracingComponent,
        PcieDetailComponent,
        CpuTopologyComponent,

        // 联动分析
        LinkageDetailComponent,
        ConfigDataComponent,
        PerfDataComponent,
        PerfChartComponent,
        MultipleRowsTableComponent,
        NodeInfoPanelComponent,
        // 内存诊断
        MemoryConsumptionComponent,
        ConsumTableComponent,
        ConsumSequenceComponent,
        ConsumChartsComponent,
        DiagnoseLeakDetailComponent,
        OomDetailsComponent,
        InformationDescriptionComponent,
        InformationTitleComponent,
        DetailsPopUpComponent,
        CallTreeComponent,
        FunStackComponent,
        SourceCodeComponent,
        FunStackNodeComponent,
        SourceCodeViewerComponent,
        SearchKeyWordPipe,
        MemLeakFuncListComponent,
        MemReleaseSubTableComponent,
        MemReleaseTableComponent,
        MemLeakTableComponent,
        SourceCodeViewerSliderComponent,
        MemExceptionDetailComponent,
        TabListDetailComponent,
        NodeInfoItemComponent,
        TypicalDataComponent,
        DifferentialComponent,
        PcieIoDetailComponent,
        FocusSearchboxComponent,
    ],
})
export class MissionAnalysisModule {
    constructor() { }
}
