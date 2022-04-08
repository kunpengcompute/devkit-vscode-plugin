import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { TuninghelperCommonModule } from '../../components/tuninghelper-common.module';
import { TuninghelperCompareCommonModule } from '../components/tuninghelper-compare-common.module';
import { SysConfigCompareComponent } from './sys-config-compare.component';
import { SysConfigCpuCompareComponent } from './sys-config-cpu-compare/sys-config-cpu-compare.component';
import { SysConfigMemCompareComponent } from './sys-config-mem-compare/sys-config-mem-compare.component';
import { SysConfigDiskCompareComponent } from './sys-config-disk-compare/sys-config-disk-compare.component';
import { SysConfigNetCompareComponent } from './sys-config-net-compare/sys-config-net-compare.component';
import { SysConfigOsCompareComponent } from './sys-config-os-compare/sys-config-os-compare.component';
import { DiffTdComponent } from './diff-td/diff-td.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TuninghelperCommonModule,
    TuninghelperCompareCommonModule,
  ],
  exports: [
    SysConfigCompareComponent,
    DiffTdComponent,
  ],
  declarations: [
    SysConfigCompareComponent,
    SysConfigCpuCompareComponent,
    SysConfigMemCompareComponent,
    SysConfigDiskCompareComponent,
    SysConfigNetCompareComponent,
    SysConfigOsCompareComponent,
    DiffTdComponent,
  ],
})
export class SysConfigCompareModule {
  constructor() {}
}
