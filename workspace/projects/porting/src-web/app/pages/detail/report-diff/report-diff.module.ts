import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { ReportDiffRoutingModule } from './report-diff-routing.module';
import { ReportDiffComponent } from './report-diff.component';
import { CodeMonacoComponent } from './code-monaco/code-monaco.component';
import { ByteShowComponent, CodeMonacoShowComponent, StructAssignComponent } from './byte-show';

@NgModule({
  declarations: [
    ReportDiffComponent, CodeMonacoComponent,
    ByteShowComponent, CodeMonacoShowComponent, StructAssignComponent
  ],
  imports: [
    SharedModule,
    ReportDiffRoutingModule
  ],
  exports: [ReportDiffComponent]
})
export class ReportDiffModule { }
