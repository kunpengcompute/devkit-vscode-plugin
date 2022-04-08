import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { SysConfigCompareModule } from './sys-config-compare/sys-config-compare.module';
import { SysPerfCompareModule } from './sys-perf-compare/sys-perf-compare.module';
import { ProcessPerfCompareModule } from './process-perf-compare/process-perf-compare.module';
import { HotFunctionCompareModule } from './hot-function-compare/hot-function-compare.module';
import { CompareInfoModule } from './compare-info/compare-info.module';
import { TuninghelperCompareComponent } from './tuninghelper-compare.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SysConfigCompareModule,
    SysPerfCompareModule,
    ProcessPerfCompareModule,
    HotFunctionCompareModule,
    CompareInfoModule,
  ],
  exports: [
    TuninghelperCompareComponent,
    ProcessPerfCompareModule
  ],
  declarations: [
    TuninghelperCompareComponent,
  ],
})
export class TuninghelperCompareModule {
  constructor() {}
}
