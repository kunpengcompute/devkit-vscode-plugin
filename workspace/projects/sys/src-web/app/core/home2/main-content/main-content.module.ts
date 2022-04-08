import { NgModule } from '@angular/core';
import { SharedModule } from 'sys/src-web/app/shared/shard.module';
import { MissionCreateModule } from 'sys/src-web/app/mission-create/mission-create.module';
import { MissionAnalysisModule } from 'sys/src-web/app/mission-analysis/mission-analysis.module';
import { MainContentRoutingModule } from './main-content-routing.module';
import { DiagnoseCreateModule } from 'sys/src-web/app/diagnose-create/diagnose-create.module';

import { MainContentComponent } from './main-content.component';
import { TaskProcessComponent } from './components/task-process/task-process.component';
import { FunctionInfoComponent } from './components/function-info/function-info.component';
import { LinkageAnalysisModule } from 'sys/src-web/app/linkage-analysis/linkage-analysis.module';

// 调优助手
import { TuninghelperCreateModule } from 'sys/src-com/app/tuninghelper/tuninghelper-create/tuninghelper-create.module';
import { TuninghelperAnalysisModule } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-analysis.module';
import { CompareCreateModule } from 'sys/src-com/app/tuninghelper/compare-create/compare-create.module';

// 诊断分析
import { DiagnoseAnalysisModule } from 'sys/src-com/app/diagnose-analysis/diagnose-analysis.module';

@NgModule({
    imports: [
        SharedModule,
        MissionCreateModule,
        MissionAnalysisModule,
        MainContentRoutingModule,
        DiagnoseCreateModule,
        LinkageAnalysisModule,

        // 调优助手
        TuninghelperCreateModule,
        TuninghelperAnalysisModule,
        CompareCreateModule,

        // 诊断分析
        DiagnoseAnalysisModule
    ],
    declarations: [
        MainContentComponent,
        TaskProcessComponent,
        FunctionInfoComponent
    ],
})
export class MainContentModule {
    constructor() {}
}
