import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { PartModule } from '../../shared/part.module';
import { TiCollapseModule } from '@cloud/tiny3';
import { StorageIoDetailComponent } from './storage-io-detail.component';
import { PressureTestResultDetailComponent } from './pressure-test-result-detail/pressure-test-result-detail.component';
import { TestModelSummaryInfoComponent } from './pressure-test-result-detail/test-model-summary-info/test-model-summary-info.component';
import { BasicIndicatorsComponent } from './pressure-test-result-detail/basic-indicator/basic-indicator.component';
import { BasicLatencyComponent } from './pressure-test-result-detail/basic-latency/basic-latency.component';
import { LatencyDistributionComponent } from './pressure-test-result-detail/latency-distribution/latency-distribution.component';
import { IoDepthDistributionComponent } from './pressure-test-result-detail/io-depth-distribution/io-depth-distribution.component';
import { PressureTestProcessPerfComponent } from './pressure-test-result-detail/pressure-test-process-perf/pressure-test-process-perf.component';
import { StorageDevPerfComponent } from './pressure-test-result-detail/storage-dev-perf/storage-dev-perf.component';
import { IoTimeLineChartComponent } from './pressure-test-result-detail/component/io-time-line-chart/io-time-line-chart.component';
import { DistributionTableComponent } from './pressure-test-result-detail/component/distribution-table/distribution-table.component';
import { TaskInformationComponent } from './task-information/task-information.component';
import { TaskLogComponent } from './task-log/task-log.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PartModule,
    TiCollapseModule
  ],
  declarations: [
    StorageIoDetailComponent,
    PressureTestResultDetailComponent,
    TestModelSummaryInfoComponent,
    BasicIndicatorsComponent,
    BasicLatencyComponent,
    LatencyDistributionComponent,
    IoDepthDistributionComponent,
    PressureTestProcessPerfComponent,
    StorageDevPerfComponent,
    IoTimeLineChartComponent,
    DistributionTableComponent,
    TaskInformationComponent,
    TaskLogComponent,
  ],
  exports: [
    StorageIoDetailComponent,
  ],
})

export class StorageIoDetailModule {
  constructor() { }
}
