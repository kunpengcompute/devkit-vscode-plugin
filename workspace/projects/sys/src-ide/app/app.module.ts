import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ValueProvider } from '@angular/core';
import {
    HyThemeContentModule, HyThemeServiceModule,
    HyNodataDirectiveModule, HyThemeService, HySpinnerBlurDirectiveModule,
    HyPopupSearchModule, HyThemeClassModule
} from 'hyper';

import { PartModule } from 'sys/src-com/app/shared/part.module';

// 业务公共组件
import { ComModule } from 'sys/src-com/app/com.module';
import { DiagnoseCreateModule } from 'sys/src-com/app/diagnose-create/diagnose-create.module';
import { MissionHpcModule } from 'sys/src-com/app/mission-create/mission-hpc/mission-hpc.module';
import { MyHttp, WebviewPanel, MyTip, DownloadFile } from 'sys/model';
import { HttpService, WebviewPanelService, TipService } from 'sys/src-ide/app/service';
// 系统分析任务详情及诊断调试任务详情
import { MissionAnalysisModule } from 'sys/src-com/app/mission-analysis/mission-analysis.module';
// 调优助手
import { CompareCreateModule } from 'sys/src-com/app/tuninghelper/compare-create/compare-create.module';
import { TuninghelperCreateModule } from 'sys/src-com/app/tuninghelper/tuninghelper-create/tuninghelper-create.module';
import { TuninghelperAnalysisModule } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-analysis.module';
import { NetIoDetailModule } from './diagnose/net-io-detail/net-io-detail.module';
import { DiagnoseAnalysisModule } from 'sys/src-com/app/diagnose-analysis/diagnose-analysis.module';

import { MissionDetailModule } from 'sys/src-com/app/mission-detail/mission-detail.module';
import { NodeManagementModule as NodeManagementModuleCom } from 'sys/src-com/app/node-management/node-management.module';

// 解决Miss事件 ddrFormElements 为许多组件派生的基本组件，使用 constructor 导入服务太过麻烦
import { Injector } from '@angular/core';
import { setAppInjector } from './app-injector';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MyInterceptor } from './service/http.interceptor';
// 表单
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// 解决打包后刷新404问题
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { BannerComponent } from './banner/banner.component';
import {
    TiButtonModule, TiSliderModule, TiRadioModule, TiLocale, TiAlertModule,
    TiMessageModule, TiTreeModule, TiUploadModule, TiTagModule
} from '@cloud/tiny3';
import {
    TiLeftmenuModule, TiOverflowModule, TiTableModule, TiPaginationModule, TiIconModule, TiCheckgroupModule
} from '@cloud/tiny3';
import { TiValidationModule, TiFormfieldModule, TiTextModule, TiSelectModule, TiSpinnerModule } from '@cloud/tiny3';
import {
    TiMenuModule, TiActionmenuModule, TiModalModule, TiTipModule, TiProgressbarModule, TiTimeModule,
    TiScrollModule
} from '@cloud/tiny3';
import { TiDateRangeModule, TiDatetimeModule, TiInputNumberModule } from '@cloud/tiny3';
import { TiCheckboxModule } from '@cloud/tiny3';
import { TiSearchboxModule, TiSwitchModule, TiTabModule, TiIpModule } from '@cloud/tiny3';
import { IconLibModule } from './components/icon-lib/icon-lib.module';
// 国际化
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService } from '@ngx-translate/core';
// 缓存路由
import { AppReuseStrategy } from './service/appReuseStrategy.service';
import { RouteReuseStrategy } from '@angular/router';
import { MaskComponent } from './mask/mask.component';

import { FreeRemoteEnvironmentComponent } from './free-remote-environment/free-remote-environment.component';
import { LoginComponent } from './login/login.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ConfigurationLogComponent } from './configuration-log/configuration-log.component';
import { ModalComponent } from './components/modal/modal.component';
import { FunctionDetailComponent } from './function-detail/function-detail.component';
import { FunctionDetailCopyComponent } from './function-detail-copy/function-detail-copy.component';
import { ModifyPwdComponent } from './modify-pwd/modify-pwd.component';
import { FirstLoginComponent } from './first-login/first-login.component';
import { SystabDetailComponent } from './systab-detail/systab-detail.component';
import { TracingComponent } from './systab-detail/tracing/tracing.component';
import { CpuDetailComponent } from './systab-detail/cpu-detail/cpu-detail.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { TablesComponent } from './tables/tables.component';
import { MemoryDetailComponent } from './systab-detail/memory-detail/memory-detail.component';
import { SysDiskComponent } from './systab-detail/sys-disk/sys-disk.component';
import { SysNetComponent } from './systab-detail/sys-net/sys-net.component';
import { TimeChartComponent } from './app-restab-detail/time-chart/time-chart.component';
import { AppConftabDetailComponent } from './app-conftab-detail/app-conftab-detail.component';
import { SystemConfigComponent } from './app-conftab-detail/system-config/system-config.component';
import { ProtabDetailComponent } from './protab-detail/protab-detail.component';
import { AppRestabDetailComponent } from './app-restab-detail/app-restab-detail.component';
import { ResSummuryComponent } from './app-restab-detail/res-summury/res-summury.component';
import { ResCpuScheComponent } from './app-restab-detail/res-cpu-sche/res-cpu-sche.component';
import { ResProcessScheComponent } from './app-restab-detail/res-process-sche/res-process-sche.component';
import { ProSummuryComponent } from './protab-detail/pro-summury/pro-summury.component';
import { ProCpuComponent } from './protab-detail/pro-cpu/pro-cpu.component';
import { CpuConfigComponent } from './app-conftab-detail/system-config/cpu-config/cpu-config.component';
import { RamConfigComponent } from './app-conftab-detail/system-config/ram-config/ram-config.component';
import { StorageConfigComponent } from './app-conftab-detail/system-config/storage-config/storage-config.component';
import { PcieConfigComponent } from './app-conftab-detail/system-config/pcie-config/pcie-config.component';
import { NetworkConfigComponent } from './app-conftab-detail/system-config/network-config/network-config.component';
import { RaidConfigComponent } from './app-conftab-detail/system-config/raid-config/raid-config.component';
import { BaseInfoConfigComponent } from './app-conftab-detail/system-config/base-info-config/base-info-config.component';
import { StorageInfoConfigComponent } from './app-conftab-detail/system-config/storage-info-config/storage-info-config.component';
import { FileConfigComponent } from './app-conftab-detail/system-config/file-config/file-config.component';
import { VirtualMachinConfigComponent } from './app-conftab-detail/system-config/virtual-machin-config/virtual-machin-config.component';

import { NumaDetailComponent } from './app-restab-detail/numa-detail/numa-detail.component';
import { TableProcessComponent } from './table-process/table-process.component';
import { RaidLevelComponent } from './app-conftab-detail/system-config/raid-level/raid-level.component';
import { ModalNumaComponent } from './components/modal-numa/modal-numa.component';
import { LocktabDetailComponent } from './locktab-detail/locktab-detail.component';
import { LockSummuryComponent } from './locktab-detail/lock-summury/lock-summury.component';
import { FunctionInfoComponent } from './locktab-detail/function-info/function-info.component';
import { TimingSummuryComponent } from './locktab-detail/timing-summury/timing-summury.component';


import { HtmlPipe } from './pipes/html.pipe';
import { NumFormat } from './pipes/num.pipe';
import { ThreePoint } from './pipes/threePoint.pipe';
import { TableSortComponent } from './table-sort/table-sort.component';
import { FirmwareComponent } from './app-conftab-detail/system-config/firmware/firmware.component';
import { ModalHeaderComponent } from './components/modal-header/modal-header/modal-header.component';

import { MissDetailComponent } from './task-details/miss-event/miss-detail.component';
import { MissStatisticsComponent } from './task-details/miss-event/miss-statistics/miss-statistics.component';
import { MissTimingComponent } from './task-details/miss-event/miss-timing/miss-timing.component';
import { FalseSharingComponent } from './task-details/false-sharing/false-sharing.component';
import { FSSummaryComponent } from './task-details/false-sharing/f-s-summary/f-s-summary.component';
import { SubModuleFunctionComponent } from './task-details/components/sub-module-function/sub-module-function.component';
import { TaskFormComponent } from './task-details/components/task-form/task-form.component';
import { SubModuleTableSortComponent } from './task-details/components/sub-module-table-sort/sub-module-table-sort.component';
import { TaskTmplComponent } from './mission-create/mission-components/task-tmpl/task-tmpl.component';

import { MicarchComponent } from './micarch/micarch.component';
import { MicarchSummuryComponent } from './micarch/micarch-summury/micarch-summury.component';
import { MicarchTimingComponent } from './micarch/micarch-timing/micarch-timing.component';
import { MicarchDetailsComponent } from './micarch/micarch-details/micarch-details.component';
import { Home2Component } from './home2/home2.component';

import { TaskProcessComponent } from './home2/task-process/task-process.component';

import { ImportComponent } from './import/import.component';
import { ImportAndExportTaskListComponent } from './import-and-export-task-list/import-and-export-task-list.component';
import { IndexComponent } from './mission-create/index/index.component';
import { MissionPerformanceComponent } from './mission-create/mission-performance/mission-performance.component';
import { MissionTemplateSaveComponent } from './mission-create/mission-components/mission-template-save/mission-template-save.component';
import { MissionTemplatesComponent } from './mission-create/mission-templates/mission-templates.component';
import { MissionProcessComponent } from './mission-create/mission-process/mission-process.component';
import { MissionReservationComponent } from './mission-create/mission-components/mission-reservation/mission-reservation.component';
import { MissionNodeConfigComponent } from './mission-create/mission-components/mission-node-config/mission-node-config.component';
import { MissionNodeThreadComponent } from './mission-create/mission-components/mission-node-thread/mission-node-thread.component';
import { MissionPanelComponent } from './mission-create/mission-components/mission-panel/mission-panel.component';
import { MissionModalComponent } from './mission-create/mission-components/mission-modal/mission-modal.component';

import { MissionMemComponent } from './mission-create/mission-mem/mission-mem.component';
import { MissionStructureComponent } from './mission-create/mission-structure/mission-structure.component';
import { MissionReservationListinfoComponent } from './mission-create/mission-reservation-listinfo/mission-reservation-listinfo.component';
import { MissionModalHeaderComponent } from './mission-create/mission-components/mission-modal-header/mission-modal-header.component';
import { MissionScheduleComponent } from './mission-create/mission-schedule/mission-schedule.component';

import { TimingNormalizedComponent } from './micarch/components/timing-normalized/timing-normalized.component';
import { IcicleSummaryComponent } from './micarch/components/icicle-summary/icicle-summary.component';
import { SaveThreePointPipe } from './pipes/save-three-point.pipe';
import { MsgSuggestionComponent } from './msg-suggestion/msg-suggestion.component';
import { PopMaskComponent } from './components/pop-mask/pop-mask.component';
import { ModifyScheduleComponent } from './mission-create/modify-schedule/modify-schedule.component';
import { PerformanceTableComponent } from './systab-detail/performance-table/performance-table.component';
import { PerformanceDetailComponent } from './systab-detail/performance-detail/performance-detail.component';
import { TimeLineComponent } from './systab-detail/performance-detail/time-line/time-line.component';
import { PanoramicMaskComponent } from './components/panoramic-mask/panoramic-mask.component';
// -- 节点管理 --
import { NodeManagementComponent } from './node-management/node-management.component';
import { NodeListComponent } from './node-management/components/node-list/node-list.component';
import { SysperfSettingComponent } from './sysperf-settings-all/sysperf-setting/sysperf-setting.component';
import { TaskTemplateManageComponent } from './sysperf-settings-all/task-template-manage/task-template-manage.component';
import { OperaLogManageComponent } from './sysperf-settings-all/operalog-manage/operalog-manage.component';
import { SysSummaryComponent } from './systab-detail/sys-summary/sys-summary.component';
import { NiceTooltipDirective } from './systab-detail/sys-summary/directives/nice-tooltip.directive';
import { ZoomBoxDirective } from './directives/zoom-box/zoom-box.directive';
import { DragBoxDirective } from './directives/drag-box/drag-box.directive';
import { PopDirective } from './directives/pop/pop.directive';
import { ConfigComponent } from './config/config.component';
import { InstallComponent } from './install/install.component';
import { UninstallComponent } from './uninstall/uninstall.component';
import { UpgradeComponent } from './upgrade/upgrade.component';

// -- Agent证书 --
import { HeaderCertificateAgentComponent } from './sysperf-settings-all/header-certificate-agent/header-certificate-agent.component';
// -- WebServer证书 --
import { WebcertficateComponent } from './tun-setting/header-web-cert-ficate/header-web-cert-ficate.component';
// -- 弱口令管理
import { WeakPwdComponent } from './tun-setting/weak-pwd/weak-pwd.component';

// -- 全景分析 --
import { NetworkConfigDataComponent } from './systab-detail/sys-summary/network-config-data/network-config-data.component';
import {
    CpuPackageNumaTableComponent
} from './systab-detail/sys-summary/components/cpu-package-numa-table/cpu-package-numa-table.component';
import { NetworkTableComponent } from './systab-detail/sys-summary/components/network-table/network-table.component';
import { MemoryTableComponent } from './systab-detail/sys-summary/components/memory-table/memory-table.component';
import { StorageTableComponent } from './systab-detail/sys-summary/components/storage-table/storage-table.component';
import { CpuPackageNumaComponent } from './systab-detail/sys-summary/components/cpu-package-numa/cpu-package-numa.component';
import { MemorySubsystemComponent } from './systab-detail/sys-summary/components/memory-subsystem/memory-subsystem.component';
import {
    NetworkSubsystemChartComponent
} from './systab-detail/sys-summary/components/network-subsystem-chart/network-subsystem-chart.component';
import { PanoramaAnalysisComponent } from './systab-detail/sys-summary/components/panorama-analysis/panorama-analysis.component';
import { StorageSubsystemComponent } from './systab-detail/sys-summary/components/storage-subsystem/storage-subsystem.component';
import { TunsetComponent } from './tun-setting/tun-setting.component';
import { MessageboxComponent } from './messagebox/messagebox.component';
import { CpuPackageComponent } from './systab-detail/sys-summary/cpu-package/cpu-package.component';
import { ConsumptionDetailComponent } from './systab-detail/consumption-detail/consumption-detail.component';
import { MemorySubsystemDataComponent } from './systab-detail/sys-summary/memory-subsystem-data/memory-subsystem-data.component';
import { NetworkSubsystemDataComponent } from './systab-detail/sys-summary/network-subsystem-data/network-subsystem-data.component';
import { RuntimeInformationComponent } from './systab-detail/sys-summary/runtime-information/runtime-information.component';
import { StorageResourceConfigComponent } from './systab-detail/sys-summary/storage-resource-config/storage-resource-config.component';
import { StorageSubsystemDataComponent } from './systab-detail/sys-summary/storage-subsystem-data/storage-subsystem-data.component';
import { TypicalConfigComponent } from './systab-detail/typical-config/typical-config.component';
import { ConfigInformationComponent } from './systab-detail/typical-config/config-information/config-information.component';
import { ServerNodeGplotComponent } from './systab-detail/typical-config/server-node-gplot/server-node-gplot.component';
import { ServerNodeComponent } from './systab-detail/typical-config/server-node-gplot/components/server-node/server-node.component';
import { TopDataComponent } from './systab-detail/top-data/top-data.component';

// 工程管理
import { CreateProjectComponent } from './project-management/create-project/create-project.component';
import { ModifyProjectComponent } from './project-management/modify-project/modify-project.component';
import { ViewProjectComponent } from './project-management/view-project/view-project.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';
import { AdviceLinkErrorComponent } from './advice-link-error/advice-link-error.component';
import { SyperfRunLogManageComponent } from './sysperf-settings-all/sysperf-runlog-manage/sysperf-runlog-manage.component';
import { DownloadMaskComponent } from './components/download-mask/download-mask.component';
import { AdviceFeedbackIconComponent } from './components/advice-feedback-icon/advice-feedback-icon.component';
import { MainHomeComponent } from './main-home/main-home.component';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { MissionCplusplusComponent } from './mission-create/mission-cplusplus/mission-cplusplus.component';
import { TabDetailComponent } from './tab-detail/tab-detail.component';
import { FlameComponent } from './tab-detail/flame/flame.component';
import { FunctionComponent } from './tab-detail/function/function.component';
import { SummaryComponent } from './tab-detail/summary/summary.component';
import { ColorCheckboxComponent } from './micarch/components/color-checkbox/color-checkbox.component';
import { TimingBreadcrumbComponent } from './micarch/components/timing-breadcrumb/timing-breadcrumb.component';
import { TimingNormalizedAxisComponent } from './micarch/components/timing-normalized-axis/timing-normalized-axis.component';
import { TimingNormalizedChartComponent } from './micarch/components/timing-normalized-chart/timing-normalized-chart.component';
import { ExtrapositionAxisComponent } from './micarch/components/extraposition-axis/extraposition-axis.component';
import { FlagTooltipDirective } from './micarch/directives/flag-tooltip.directive';
import { MissionLockComponent } from './mission-create/mission-lock/mission-lock.component';
import { FunctionInfosComponent } from './components/function-infos/function-infos.component';
import { PadStartPipe } from './pipes/pad-start.pipe';
import { SysperfApplicationPathComponent } from './sysperf-settings-all/sysperf-application-path/sysperf-application-path.component';
import { CreateProjectLaterComponent } from './create-project-later/create-project-later.component';
import { NodataComponent } from './components/nodata/nodata.component';
import {
    MissionCreatePidProcessComponent
} from './mission-create/index/components/mission-create-pid-process/mission-create-pid-process.component';
import { MissionIoComponent } from './mission-create/mission-io/mission-io.component';
import { DefaultPageComponent } from './default-page/default-page.component';
import { StorageDetailComponent } from './storage-detail/storage-detail.component';
import { StorageSummuryComponent } from './storage-detail/storage-summury/storage-summury.component';
import { IoapisComponent } from './storage-detail/ioapis/ioapis.component';
import { DiskioComponent } from './storage-detail/diskio/diskio.component';
import { DataSizeChartComponent } from './storage-detail/components/data-size-chart/data-size-chart.component';
import { StatementComponent } from './statement/statement.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { IoSequenceComponent } from './storage-detail/components/io-sequence/io-sequence.component';
import { BrushDetailsComponent } from './storage-detail/ioapis/components/brush-details/brush-details.component';
import { BrushTipsComponent } from './storage-detail/components/brush-tips/brush-tips.component';
import { LoadingComponent } from './default-page/loading/loading.component';
import { DiskChartComponent } from './storage-detail/components/disk-chart/disk-chart.component';
import { BlockDisComponent } from './storage-detail/diskio/components/block-dis/block-dis.component';
import { NormalizeBlockComponent } from './storage-detail/components/normalize-block/normalize-block.component';
import { FollowTooltipDirective } from './storage-detail/components/normalize-block/directves/follow-tooltip.directive';
import { NormalizeBlockChartComponent } from './storage-detail/components/normalize-block-chart/normalize-block-chart.component';
import { DiskDetailsComponent } from './storage-detail/diskio/components/disk-details/disk-details.component';
import { DiskTableComponent } from './storage-detail/diskio/components/disk-table/disk-table.component';
import { TableChartComponent } from './storage-detail/diskio/components/table-chart/table-chart.component';
import { DataBlockComponent } from './storage-detail/diskio/components/data-block/data-block.component';
import { SysSettingItemComponent } from './sysperf-settings-all/sys-setting-item/sys-setting-item.component';
import { MessionIoDetailComponent } from './mission-create/mission-io/mession-io-detail/mession-io-detail.component';
import { LiquidFillGaugeComponent } from './components/liquid-fill-gauge/liquid-fill-gauge.component';
import { MissionHpcComponent } from './mission-create/mission-hpc/mission-hpc.component';
import { HpcDetailComponent } from './hpc-detail/hpc-detail.component';
import { HpcDetailTargetComponent } from './hpc-detail/hpc-detail-target/hpc-detail-target.component';
import { RamAndInstructionComponent } from './mission-create/ram-and-instruction/ram-and-instruction.component';
import { HpcTopDownComponent } from './hpc-detail/hpc-detail-target/components/hpc-top-down/hpc-top-down.component';
import { HpcOpenMpComponent } from './hpc-detail/hpc-detail-target/components/hpc-open-mp/hpc-open-mp.component';
import { HpcPmuComponent } from './hpc-detail/hpc-detail-target/components/hpc-pmu/hpc-pmu.component';
import { ZerosPipe } from './pipes/zeros.pipe';
import { SpinnerBlurDirective } from './components/directives/spinner-blur.directive';
import { MessageModalComponent } from './components/message-modal/message-modal.component';
import { TagBoxComponent } from './app-restab-detail/components/tag-box/tag-box.component';
import { SideModalComponent } from './app-restab-detail/components/side-modal/side-modal.component';
import { TableChartSwitchComponent } from './mission-analysis/diagnose-leak-detail/component/table-chart-switch/table-chart-switch.component';

// 内存诊断
import { MemoryConsumptionComponent } from './mission-analysis/diagnose-leak-detail/memory-consumption/memory-consumption.component';
import { ConsumTableComponent } from './mission-analysis/diagnose-leak-detail/memory-consumption/consum-table/consum-table.component';
import { ConsumSequenceComponent } from './mission-analysis/diagnose-leak-detail/memory-consumption/consum-sequence/consum-sequence.component';
import { ConsumChartsComponent } from './mission-analysis/diagnose-leak-detail/memory-consumption/components/consum-charts/consum-charts.component';
import { DiagnoseLeakDetailComponent } from './mission-analysis/diagnose-leak-detail/diagnose-leak-detail.component';
import { OomDetailsComponent } from './mission-analysis/diagnose-leak-detail/oom-details/oom-details.component';
import { InformationDescriptionComponent } from './mission-analysis/diagnose-leak-detail/oom-details/information-description/information-description.component';
import { InformationTitleComponent } from './mission-analysis/diagnose-leak-detail/oom-details/information-title/information-title.component';
import { DetailsPopUpComponent } from './mission-analysis/diagnose-leak-detail/oom-details/details-pop-up/details-pop-up.component';
import { CallTreeComponent } from './mission-analysis/diagnose-leak-detail/call-tree/call-tree.component';
import { FunStackComponent } from './mission-analysis/diagnose-leak-detail/component/fun-stack/fun-stack.component';
import { SourceCodeComponent } from './mission-analysis/diagnose-leak-detail/source-code/source-code.component';
import {
    FunStackNodeComponent
} from './mission-analysis/diagnose-leak-detail/component/fun-stack/fun-stack-node/fun-stack-node.component';
import {
    SourceCodeViewerComponent
} from './mission-analysis/diagnose-leak-detail/component/source-code-viewer/source-code-viewer.component';
import { SearchKeyWordPipe } from './mission-analysis/diagnose-leak-detail/oom-details/search-key-word.pipe';
import {
    MemLeakFuncListComponent
} from './mission-analysis/diagnose-leak-detail/component/mem-leak-func-list/mem-leak-func-list.component';
import {
    MemReleaseSubTableComponent
} from './mission-analysis/diagnose-leak-detail/component/mem-release-sub-table/mem-release-sub-table.component';
import {
    MemReleaseTableComponent
} from './mission-analysis/diagnose-leak-detail/component/mem-release-table/mem-release-table.component';
import { MemLeakTableComponent } from './mission-analysis/diagnose-leak-detail/component/mem-leak-table/mem-leak-table.component';
import { SourceCodeViewerSliderComponent } from './mission-analysis/diagnose-leak-detail/component/source-code-viewer-slider/source-code-viewer-slider.component';
import { MemExceptionDetailComponent } from './mission-analysis/diagnose-leak-detail/mem-exception-detail/mem-exception-detail.component';
import { TabListDetailComponent } from './mission-analysis/diagnose-leak-detail/mem-exception-detail/components/tab-list-detail/tab-list-detail.component';

// 联动分析
import { LinkageDetailComponent } from './mission-analysis/linkage-detail/linkage-detail.component';
import { ConfigDataComponent } from './mission-analysis/linkage-detail/config-data/config-data.component';
import { PerfDataComponent } from './mission-analysis/linkage-detail/perf-data/perf-data.component';
import { PerfChartComponent } from './mission-analysis/linkage-detail/perf-data/components/perf-chart/perf-chart.component';
import {
    MultipleRowsTableComponent
} from './mission-analysis/linkage-detail/components/multiple-rows-table/multiple-rows-table.component';
import { PcieDetailComponent } from './app-conftab-detail/system-config/pcie-detail/pcie-detail.component';
import { CpuTopologyComponent } from './app-conftab-detail/system-config/pcie-detail/components/cpu-topology/cpu-topology.component';
import { NodeInfoItemComponent } from './app-conftab-detail/system-config/pcie-detail/components/node-info-item/node-info-item.component';
import { DiagnoseTemplateComponent } from './sysperf-settings-all/diagnose-template/diagnose-template.component';
import {
    MissionDiagnoseDetailComponent
} from './mission-create/mission-diagnose/mission-diagnose-detail/mission-diagnose-detail.component';
import { DiagnoseScheduleComponent } from './mission-create/mission-diagnose/diagnose-schedule/diagnose-schedule.component';

import { ProjectManagementComponent } from './diagnose/project-management/project-management.component';

// 内存诊断调试工具
import { CreateTaskComponent } from './mission-create/diagnose-create/create-task/create-task.component';
import { MissionDiagnosisLaunchComponent } from './mission-create/diagnose-create/mission-components/mission-diagnosis-launch/mission-diagnosis-launch.component';
import { LinkageCreateComponent } from './mission-create/linkage-create/linkage-create.component';
import { PidProcessInputComponent } from './mission-create/mission-components/pid-process-input/pid-process-input.component';
import { PathParameterComponent } from './mission-create/mission-components/path-parameter/path-parameter.component';
import { RunUserInputComponent } from './mission-create/mission-components/run-user-input/run-user-input.component';
import { AppParamsInputComponent } from './mission-create/mission-components/app-params-input/app-params-input.component';
import { TypicalDataComponent } from './mission-analysis/linkage-detail/typical-data/typical-data.component';
import { TuninghelperProjectManageComponent } from './tuningHelper/tuninghelper-project-manage/tuninghelper-project-manage.component';
import { TuninghelperTaskOperateComponent } from './tuningHelper/tuninghelper-task-operate/tuninghelper-task-operate.component';
import { TuninghelperDetaildataComponent } from './tuningHelper/tuninghelper-detaildata/tuninghelper-detaildata.component';
import { TaskInfoLogComponent } from './tuning-assistant/task-info-log/task-info-log.component';
import { DifferentialComponent } from './mission-analysis/linkage-detail/differential/differential.component';
import { NodeTableComponent } from './mission-create/mission-diagnose/components/node-table/node-table.component';
import { EditNodeDetailComponent } from './mission-create/mission-diagnose/components/edit-node-detail/edit-node-detail.component';
import { EditNodeModalComponent } from './mission-create/mission-diagnose/components/edit-node-modal/edit-node-modal.component';
import { PcieIoDetailComponent } from './app-conftab-detail/system-config/pcie-detail/components/pcie-io-detail/pcie-io-detail.component';
import { NodeInfoPanelComponent } from './app-conftab-detail/system-config/pcie-detail/components/node-info-panel/node-info-panel.component';
import { DiagnoseCreateComponent } from './mission-create/diagnose-create/diagnose-create.component';


import { TuninghelperProcessPidDetailComponent } from './tuningHelper/tuninghelper-process-pid-detail/tuninghelper-process-pid-detail.component';
import { DownloadFileService } from './service/download-file.service';
import { TuninghelperCompareProcessPidDetailComponent } from './tuningHelper/tuninghelper-compare-process-pid-detail/tuninghelper-compare-process-pid-detail.component';
import { GuideComponent } from './main-home/guide/guide.component';
import { RankNodeInfoComponent } from './mission-create/mission-hpc/control/rank-node-info/rank-node-info.component';
import { LargeModifyScheduleComponent } from './mission-create/large-modify-schedule/large-modify-schedule.component';
import { HelperDeleteComponent } from './components/helper-delete/helper-delete.component';
import { ClickOutsideDirective } from './directives/click-outside/click-outside.directive';

@NgModule({
    declarations: [
        BannerComponent,
        HtmlPipe,
        NumFormat,
        ThreePoint,
        AppComponent,
        MaskComponent,
        OperaLogManageComponent,
        LoginComponent,
        ConfigurationComponent,
        ConfigurationLogComponent,
        FunctionInfoComponent,
        ModalComponent,
        FunctionDetailComponent,
        FunctionDetailCopyComponent,
        ModifyPwdComponent,
        FirstLoginComponent,
        SystabDetailComponent,
        TracingComponent,
        CpuDetailComponent,
        TablesComponent,
        MemoryDetailComponent,
        SysDiskComponent,
        SysNetComponent,
        TimeChartComponent,
        AppConftabDetailComponent,
        SystemConfigComponent,
        ProtabDetailComponent,
        AppRestabDetailComponent,
        ResSummuryComponent,
        ResCpuScheComponent,
        ResProcessScheComponent,
        ProSummuryComponent,
        ProCpuComponent,
        NumaDetailComponent,
        TableProcessComponent,
        CpuConfigComponent,
        RamConfigComponent,
        StorageConfigComponent,
        PcieConfigComponent,
        NetworkConfigComponent,
        RaidConfigComponent,
        BaseInfoConfigComponent,
        StorageInfoConfigComponent,
        FileConfigComponent,
        VirtualMachinConfigComponent,
        ModalNumaComponent,
        RaidLevelComponent,
        LocktabDetailComponent,
        LockSummuryComponent,
        TimingSummuryComponent,

        MissDetailComponent,
        MissStatisticsComponent,
        MissTimingComponent,
        FalseSharingComponent,
        FSSummaryComponent,
        SubModuleFunctionComponent,
        TaskFormComponent,
        SubModuleTableSortComponent,
        TaskTmplComponent,

        TableSortComponent,
        FirmwareComponent,
        ModalHeaderComponent,
        MicarchComponent,
        MicarchSummuryComponent,
        MicarchTimingComponent,
        MicarchDetailsComponent,
        Home2Component,
        NodeListComponent,
        TaskProcessComponent,
        IndexComponent,
        ImportComponent,
        ImportAndExportTaskListComponent,
        MissionPerformanceComponent,
        MissionTemplateSaveComponent,
        MissionTemplatesComponent,
        MissionProcessComponent,
        MissionReservationComponent,
        MissionNodeConfigComponent,
        MissionNodeThreadComponent,
        MissionScheduleComponent,
        MissionPanelComponent,
        TaskTemplateManageComponent,
        MissionModalComponent,
        MissionMemComponent,
        MissionStructureComponent,
        MissionReservationListinfoComponent,
        MissionModalHeaderComponent,
        TimingNormalizedComponent,
        IcicleSummaryComponent,
        SaveThreePointPipe,
        MsgSuggestionComponent,
        PopMaskComponent,
        NodeManagementComponent,
        PopMaskComponent,
        ModifyScheduleComponent,
        SysperfSettingComponent,
        SysSummaryComponent,
        ClickOutsideDirective,
        NiceTooltipDirective,
        ZoomBoxDirective,
        DragBoxDirective,
        PopDirective,
        ConfigComponent,
        InstallComponent,
        UninstallComponent,
        UpgradeComponent,
        NetworkConfigDataComponent,
        HeaderCertificateAgentComponent,
        WebcertficateComponent,
        WeakPwdComponent,
        CpuPackageNumaTableComponent,
        NetworkTableComponent,
        MemoryTableComponent,
        StorageTableComponent,
        CpuPackageNumaComponent,
        MemorySubsystemComponent,
        NetworkSubsystemChartComponent,
        PanoramaAnalysisComponent,
        StorageSubsystemComponent,
        PerformanceTableComponent,
        PerformanceDetailComponent,
        TimeLineComponent,
        PanoramicMaskComponent,
        TunsetComponent,
        MessageboxComponent,
        CpuPackageComponent,
        ConsumptionDetailComponent,
        MemorySubsystemDataComponent,
        NetworkConfigDataComponent,
        NetworkSubsystemDataComponent,
        RuntimeInformationComponent,
        StorageResourceConfigComponent,
        StorageSubsystemDataComponent,
        CreateProjectComponent,
        ModifyProjectComponent,
        ViewProjectComponent,
        ErrorInstructionComponent,
        AdviceLinkErrorComponent,
        SyperfRunLogManageComponent,
        DownloadMaskComponent,
        AdviceFeedbackIconComponent,
        MainHomeComponent,
        ThousandSeparatorPipe,
        ColorCheckboxComponent,
        TimingBreadcrumbComponent,
        TimingNormalizedAxisComponent,
        TimingNormalizedChartComponent,
        FlagTooltipDirective,
        ExtrapositionAxisComponent,
        MissionLockComponent,
        MissionCplusplusComponent,
        TabDetailComponent,
        FlameComponent,
        FunctionComponent,
        SummaryComponent,
        ExtrapositionAxisComponent,
        ExtrapositionAxisComponent,
        FunctionInfosComponent,
        TypicalConfigComponent,
        ConfigInformationComponent,
        ServerNodeGplotComponent,
        ServerNodeComponent,
        PadStartPipe,
        TopDataComponent,
        SysperfApplicationPathComponent,
        CreateProjectLaterComponent,
        NodataComponent,
        MissionCreatePidProcessComponent,
        MissionIoComponent,
        DefaultPageComponent,
        StorageDetailComponent,
        StorageSummuryComponent,
        IoapisComponent,
        DiskioComponent,
        DataSizeChartComponent,
        IoSequenceComponent,
        BrushDetailsComponent,
        BrushTipsComponent,
        StatementComponent,
        DisclaimerComponent,
        IoSequenceComponent,
        LoadingComponent,
        DiskChartComponent,
        BlockDisComponent,
        NormalizeBlockComponent,
        FollowTooltipDirective,
        NormalizeBlockChartComponent,
        DiskDetailsComponent,
        DiskTableComponent,
        TableChartComponent,
        DataBlockComponent,
        SysSettingItemComponent,
        MessionIoDetailComponent,
        MissionHpcComponent,
        HpcDetailComponent,
        HpcDetailTargetComponent,
        LiquidFillGaugeComponent,
        RamAndInstructionComponent,
        HpcTopDownComponent,
        HpcOpenMpComponent,
        HpcPmuComponent,
        ZerosPipe,
        SpinnerBlurDirective,
        MessageModalComponent,
        TagBoxComponent,
        SideModalComponent,
        // 内存诊断
        TableChartSwitchComponent,
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

        // 联动分析
        LinkageDetailComponent,
        ConfigDataComponent,
        PerfDataComponent,
        PerfChartComponent,
        MultipleRowsTableComponent,
        ZoomBoxDirective,
        DragBoxDirective,
        PopDirective,

        PcieDetailComponent,
        CpuTopologyComponent,
        NodeInfoItemComponent,
        DiagnoseTemplateComponent,
        MissionDiagnoseDetailComponent,
        DiagnoseScheduleComponent,
        FreeRemoteEnvironmentComponent,
        ProjectManagementComponent,
        // 内存诊断调试工具
        CreateTaskComponent,
        MissionDiagnosisLaunchComponent,
        LinkageCreateComponent,
        PidProcessInputComponent,
        PathParameterComponent,
        RunUserInputComponent,
        AppParamsInputComponent,
        TypicalDataComponent,
        // 调优助手
        TuninghelperProjectManageComponent,
        TuninghelperTaskOperateComponent,
        TuninghelperDetaildataComponent,
        TuninghelperProcessPidDetailComponent,
        TuninghelperCompareProcessPidDetailComponent,
        TaskInfoLogComponent,
        DifferentialComponent,
        NodeTableComponent,
        EditNodeDetailComponent,
        EditNodeModalComponent,
        PcieIoDetailComponent,
        NodeInfoPanelComponent,
        // 网络IO诊断
        DiagnoseCreateComponent,
        GuideComponent,
        RankNodeInfoComponent,
        LargeModifyScheduleComponent,
        HelperDeleteComponent
    ],
    imports: [
        PartModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient) => {
                    // 国际化的文件地址 ,这种方式不会刷新页面
                    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
                },
                deps: [HttpClient]
            }
        }),
        TiTagModule,
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        TiAlertModule,
        BrowserAnimationsModule,
        TiMessageModule,
        TiTreeModule,
        TiUploadModule,
        TiLeftmenuModule,
        TiValidationModule,
        TiFormfieldModule,
        TiTextModule,
        TiSelectModule,
        TiOverflowModule,                 // 表格组件
        TiTableModule,                     // 表格组件
        TiPaginationModule,               // 分页组件
        FormsModule, ReactiveFormsModule,     // ng表单模块
        IconLibModule,
        TiIconModule,
        TiMenuModule,
        TiActionmenuModule,
        TiButtonModule,
        TiSearchboxModule,
        TiSpinnerModule,
        TiSwitchModule,
        TiCheckboxModule,
        TiTabModule,
        TiModalModule,
        TiTipModule,
        TiProgressbarModule,
        NgxEchartsModule.forRoot({
          echarts: () => import('echarts'),
        }),
        TiCheckgroupModule,
        TiRadioModule,
        TiSliderModule,
        TiTimeModule,
        TiScrollModule,
        TiDateRangeModule,
        TiDatetimeModule,
        TiIpModule,
        TiInputNumberModule,
        HyThemeContentModule,
        HyThemeServiceModule,
        HyNodataDirectiveModule,

        // 业务公共组件
        ComModule,
        // SharedModule,
        MissionAnalysisModule,

        // 调优助手
        TuninghelperCreateModule,
        TuninghelperAnalysisModule,
        CompareCreateModule,

        MissionDetailModule,

        // 诊断分析模块
        NetIoDetailModule,
        DiagnoseCreateModule,
        DiagnoseAnalysisModule,
        HySpinnerBlurDirectiveModule,
        MissionHpcModule,
        NodeManagementModuleCom,
        HyPopupSearchModule,
        HyThemeClassModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: RouteReuseStrategy, useClass: AppReuseStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        MessageModalComponent,
        ServerNodeComponent
    ]
})
export class AppModule {
    constructor(
        public translate: TranslateService,
        private injector: Injector,
        private comModule: ComModule,
        private httpServe: HttpService,
        private panelService: WebviewPanelService,
        private tipServe: TipService,
        private downloadServe: DownloadFileService,
        private hyThemeServe: HyThemeService,
    ) {

        setAppInjector(this.injector);

        // 注入三端差异的实现
        const providers: ValueProvider[] = [
            { provide: MyHttp, useValue: this.httpServe },
            { provide: WebviewPanel, useValue: this.panelService },
            { provide: MyTip, useValue: this.tipServe },
            { provide: DownloadFile, useValue: this.downloadServe }
        ];
        this.comModule.injectProvider(providers);

    }
}

