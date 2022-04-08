import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { TaskListRoutingModule } from './task-list-routing.module';

import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FileDownloadComponent } from './components/file-download/file-download.component';
import { TaskListComponent } from './task-list.component';
import { StepLoadingComponent } from './components/step-loading/step-loading.component';

@NgModule({
    imports: [
        SharedModule,
        TaskListRoutingModule
    ],
    declarations: [
        FileUploadComponent,
        FileDownloadComponent,
        TaskListComponent,
        StepLoadingComponent
    ],
    exports: [
        TaskListComponent
    ],
})
export class TaskListModule {
    constructor() {}
}
