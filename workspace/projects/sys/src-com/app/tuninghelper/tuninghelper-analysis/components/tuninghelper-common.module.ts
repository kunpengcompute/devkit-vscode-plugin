import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { TagButtonComponent } from './tag-button/tag-button.component';
import { PidExpandTableComponent } from './pid-expand-table/pid-expand-table.component';
import { ExpandTreeComponent } from './expand-tree/expand-tree.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    TagButtonComponent,
    PidExpandTableComponent,
    ExpandTreeComponent,
  ],
  declarations: [
    TagButtonComponent,
    PidExpandTableComponent,
    ExpandTreeComponent,
  ],
})
export class TuninghelperCommonModule {
  constructor() {}
}
