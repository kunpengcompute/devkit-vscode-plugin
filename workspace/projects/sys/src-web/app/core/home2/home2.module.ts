import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { Home2RoutingModule } from './home2-routing.module';

import { Home2Component } from './home2.component';
import { ProjectManageComponent } from './project-manage/project-manage.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { LinkageManageComponent } from './linkage-manage/linkage-manage.component';
import { TuninghelperManageComponent } from './tuninghelper-manage/tuninghelper-manage.component';
import { CompareManageComponent } from './compare-manage/compare-manage.component';

@NgModule({
    imports: [
        SharedModule,
        Home2RoutingModule
    ],
    declarations: [
        Home2Component,
        ProjectManageComponent,
        AddProjectComponent,
        LinkageManageComponent,
        TuninghelperManageComponent,
        CompareManageComponent,
    ],
})
export class Home2Module {
    constructor() {}
}
