import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { DiagnoseCreateModule } from 'projects/sys/src-com/app/diagnose-create/diagnose-create.module';
import { MissionHpcModule } from 'sys/src-com/app/mission-create/mission-hpc/mission-hpc.module';

import { MissionCreateComponent } from './mission-create.component';
import { MissionPerformanceComponent } from './mission-performance/mission-performance.component';
import { MissionScheduleComponent } from './mission-schedule/mission-schedule.component';
import { MissionProcessComponent } from './mission-process/mission-process.component';
import { MissionReservationComponent } from './mission-components/mission-reservation/mission-reservation.component';
import { MissionNodeConfigComponent } from './mission-components/mission-node-config/mission-node-config.component';
import { MissionNodeThreadComponent } from './mission-components/mission-node-thread/mission-node-thread.component';
import { MissionLockComponent } from './mission-lock/mission-lock.component';
import { MissionCplusplusComponent } from './mission-cplusplus/mission-cplusplus.component';
import { MissionMemComponent } from './mission-mem/mission-mem.component';
import { MissionStructureComponent } from './mission-structure/mission-structure.component';
import { MissionModalHeaderComponent } from './mission-components/mission-modal-header/mission-modal-header.component';
import { MissionCLaunchComponent } from './mission-components/mission-node-params/mission-c-launch/mission-c-launch.component';
import { MissionCAttachComponent } from './mission-components/mission-node-params/mission-c-attach/mission-c-attach.component';
import { MissionCProfileComponent } from './mission-components/mission-node-params/mission-c-profile/mission-c-profile.component';
import { MissionLAttachComponent } from './mission-components/mission-node-params/mission-l-attach/mission-l-attach.component';
import { MissionLLaunchComponent } from './mission-components/mission-node-params/mission-l-launch/mission-l-launch.component';
import { MissionMProfileComponent } from './mission-components/mission-node-params/mission-m-profile/mission-m-profile.component';
import { MissionMLaunchComponent } from './mission-components/mission-node-params/mission-m-launch/mission-m-launch.component';
import { MissionMAttachComponent } from './mission-components/mission-node-params/mission-m-attach/mission-m-attach.component';
import { MissionRAttachComponent } from './mission-components/mission-node-params/mission-r-attach/mission-r-attach.component';
import { MissionRLaunchComponent } from './mission-components/mission-node-params/mission-r-launch/mission-r-launch.component';
import { MissionRProfileComponent } from './mission-components/mission-node-params/mission-r-profile/mission-r-profile.component';
import { MissionSProfileComponent } from './mission-components/mission-node-params/mission-s-profile/mission-s-profile.component';
import { MissionSLaunchComponent } from './mission-components/mission-node-params/mission-s-launch/mission-s-launch.component';
import { MissionSAttachComponent } from './mission-components/mission-node-params/mission-s-attach/mission-s-attach.component';
import { MissionLProfileComponent } from './mission-components/mission-node-params/mission-l-profile/mission-l-profile.component';
import { MissionPublicComponent } from './mission-components/mission-node-params/mission-public/mission-public.component';
import { TaskTmplComponent } from './mission-components/task-tmpl/task-tmpl.component';
import { ProcessNodeConfigPidComponent } from './mission-process/components/process-node-config-pid/process-node-config-pid.component';
import { ProcessNodeConfigAppComponent } from './mission-process/components/process-node-config-app/process-node-config-app.component';
import { PidProcessInputComponent } from './mission-components/pid-process-input/pid-process-input.component';
import { MissionIoComponent } from './mission-io/views/mission-io-create/mission-io.component';
import { MissionIoNodeConfigComponent } from './mission-io/components/mission-io-node-config/mission-io-node-config.component';
import { MissionIoScheduleModifyComponent } from './mission-io/views/mission-io-schedule-modify/mission-io-schedule-modify.component';
import { AppParamsInputComponent } from './mission-components/app-params-input/app-params-input.component';
import { MissionIoDetailComponent } from './mission-io/views/mission-io-detail/mission-io-detail.component';
import { MissionHpcCreateComponent } from './mission-hpc/views/mission-hpc-create/mission-hpc-create.component';
import { MissionHpcScheduleComponent } from './mission-hpc/views/mission-hpc-schedule/mission-hpc-schedule.component';
import { MissionHpcDetailComponent } from './mission-hpc/views/mission-hpc-detail/mission-hpc-detail.component';
import { MissionHpcComponent } from './mission-hpc/mission-hpc.component';
import { TaskFormComponent } from './mission-components/task-form/task-form.component';
import { MissionReservationListinfoComponent } from './mission-components/mission-reservation-listinfo/mission-reservation-listinfo.component';
import { ModifyScheduleComponent } from './modify-schedule/modify-schedule.component';
import { MissionReservationListComponent } from './mission-reservation-list/mission-reservation-list.component';
import { MissionTemplatesAllComponent } from './mission-templates-all/mission-templates-all.component';
import { MissionTemplatesComponent } from './mission-templates/mission-templates.component';
import { MissionDProfileComponent } from './mission-components/mission-node-params/mission-d-profile/mission-d-profile.component';
import { DiagnoseTemplateComponent } from './diagnose-template/diagnose-template.component';
import { MissionDiagnoseDetailComponent } from './mission-diagnose/mission-diagnose-detail/mission-diagnose-detail.component';
import { DiagnoseScheduleComponent } from './diagnose-schedule/diagnose-schedule.component';
import { EditNodeSlidingComponent } from './diagnose-schedule/components/edit-node-sliding/edit-node-sliding.component';
import { NodeTableComponent } from './diagnose-schedule/components/node-table/node-table.component';
import { EditNodeDetailComponent } from './diagnose-schedule/components/edit-node-detail/edit-node-detail.component';
import { PathParameterComponent } from './mission-components/path-parameter/path-parameter.component';
import { RunUserInputComponent } from './mission-io/components/run-user-input/run-user-input.component';
import { MissionTemplateSaveComponent } from './mission-components/mission-template-save/mission-template-save.component';
import { MissionHpcNodeParamsComponent } from './mission-components/mission-node-params/mission-hpc-node-params/mission-hpc-node-params.component';

@NgModule({
    imports: [
        SharedModule,
        DiagnoseCreateModule,
        MissionHpcModule
    ],
    exports: [
        MissionCreateComponent,
        MissionIoDetailComponent,
        MissionTemplatesAllComponent,
        MissionReservationListComponent,
        MissionReservationComponent,
        MissionTemplatesComponent,
        PidProcessInputComponent,
        MissionTemplateSaveComponent
    ],
    declarations: [
        MissionPerformanceComponent,
        MissionScheduleComponent,
        MissionProcessComponent,
        MissionReservationComponent,
        MissionNodeConfigComponent,
        MissionNodeThreadComponent,
        MissionLockComponent,
        MissionCplusplusComponent,
        MissionMemComponent,
        MissionStructureComponent,
        MissionModalHeaderComponent,
        MissionCLaunchComponent,
        MissionCAttachComponent,
        MissionCProfileComponent,
        MissionLAttachComponent,
        MissionLLaunchComponent,
        MissionMProfileComponent,
        MissionMLaunchComponent,
        MissionMAttachComponent,
        MissionRAttachComponent,
        MissionRLaunchComponent,
        MissionRProfileComponent,
        MissionSProfileComponent,
        MissionSLaunchComponent,
        MissionSAttachComponent,
        MissionLProfileComponent,
        MissionPublicComponent,
        TaskTmplComponent,
        ProcessNodeConfigPidComponent,
        ProcessNodeConfigAppComponent,
        PidProcessInputComponent,
        MissionIoComponent,
        MissionIoNodeConfigComponent,
        MissionIoScheduleModifyComponent,
        AppParamsInputComponent,
        MissionIoDetailComponent,
        MissionHpcCreateComponent,
        MissionHpcScheduleComponent,
        MissionHpcDetailComponent,
        MissionHpcComponent,
        MissionCreateComponent,
        TaskFormComponent,
        MissionReservationListinfoComponent,
        MissionTemplatesAllComponent,
        MissionReservationListComponent,
        MissionTemplatesComponent,
        ModifyScheduleComponent,
        MissionDProfileComponent,
        DiagnoseTemplateComponent,
        MissionDiagnoseDetailComponent,
        DiagnoseScheduleComponent,
        EditNodeSlidingComponent,
        NodeTableComponent,
        EditNodeDetailComponent,
        PathParameterComponent,
        RunUserInputComponent,
        MissionTemplateSaveComponent,
        MissionHpcNodeParamsComponent
    ],
})
export class MissionCreateModule {
    constructor() { }
}
