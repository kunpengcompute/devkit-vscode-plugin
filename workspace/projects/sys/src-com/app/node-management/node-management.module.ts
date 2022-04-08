import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BatchNodeOperationComponent } from './batch-import-node/batch-node-operation.component';
import { HyMiniModalModule } from 'hyper';

import { TemplateUpLoadComponent } from './component/template-up-load/template-up-load.component';
import { ExcelParseComponent } from './component/excel-parse/excel-parse.component';
import { TiUploadModule } from '@cloud/tiny3';
import { DataValidFailComponent } from './component/data-valid-fail/data-valid-fail.component';
import { ProjectRelationComponent } from './component/project-relation/project-relation.component';
import { BackValidFailComponent } from './component/back-valid-fail/back-valid-fail.component';
import { ConfirmFingerprintComponent } from './component/confirm-fingerprint/confirm-fingerprint.component';
import { NestedTableComponent } from './component/confirm-fingerprint/nested-table/nested-table.component';

@NgModule({
  imports: [CommonModule, SharedModule, TiUploadModule, HyMiniModalModule],
  exports: [BatchNodeOperationComponent],
  declarations: [
    BatchNodeOperationComponent,
    TemplateUpLoadComponent,
    ExcelParseComponent,
    DataValidFailComponent,
    ProjectRelationComponent,
    BackValidFailComponent,
    ConfirmFingerprintComponent,
    NestedTableComponent,
  ],
})
export class NodeManagementModule {
  constructor() {}
}
