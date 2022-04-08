import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';

import { TuninghelperCreateProjectComponent } from './tuninghelper-create-project/tuninghelper-create-project.component';
import { TuninghelperCreateTaskComponent } from './tuninghelper-create-task/tuninghelper-create-task.component';
import { NodeTableInfoComponent } from './components/node-table-info/node-table-info.component';
import { ProcessPidInputComponent } from './components/process-pid-input/process-pid-input.component';
import { AppParamsFormComponent } from './components/app-params-form/app-params-form.component';
import { NodeListConfigComponent } from './components/node-list-config/node-list-config.component';
import { ServerTableComponent } from './tuninghelper-create-task/component/server-table/server-table.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [
    TuninghelperCreateProjectComponent,
    TuninghelperCreateTaskComponent,
    ProcessPidInputComponent
  ],
  declarations: [
    TuninghelperCreateProjectComponent,
    TuninghelperCreateTaskComponent,
    NodeTableInfoComponent,
    ProcessPidInputComponent,
    AppParamsFormComponent,
    NodeListConfigComponent,
    ServerTableComponent,
  ],
})
export class TuninghelperCreateModule {
  constructor() {}
}
