import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shard.module';
import { DiagnoseCreaetRoutingModule } from './diagnose-create-routing.module';
import { MissionCreateModule } from '../mission-create/mission-create.module';

import {
    DiagnoseTaskNodeConfigComponent
} from './mission-components/diagnose-task-node-config/diagnose-task-node-config.component';
import { CreateTaskComponent } from './create-task/create-task.component';
import {
    MissionDiagnosisLaunchComponent
} from './mission-components/mission-diagnosis-launch/mission-diagnosis-launch.component';
import { TaskInfoService } from './services/task-info.service';
import { MissionSlidingComponent } from './mission-components/mission-sliding/mission-sliding.component';
import { DiagnoseCreateComponent } from './diagnose-create.component';

import {
    DiagnoseCreateModule as DiagnoseCreateModuleCom
} from 'sys/src-com/app/diagnose-create/diagnose-create.module';
@NgModule({
    imports: [
        SharedModule,
        DiagnoseCreaetRoutingModule,
        MissionCreateModule,
        DiagnoseCreateModuleCom
    ],
    declarations: [
        DiagnoseTaskNodeConfigComponent,
        CreateTaskComponent,
        MissionDiagnosisLaunchComponent,
        MissionSlidingComponent,
        DiagnoseCreateComponent
    ],
    exports: [
        CreateTaskComponent,
    ],
    providers: [
        TaskInfoService
    ]
})
export class DiagnoseCreateModule { }
