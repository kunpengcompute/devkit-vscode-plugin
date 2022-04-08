import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminRouteGuard, VscodeAuthGuard } from './guard';

import { LoginComponent } from './login/login.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ConfigurationLogComponent } from './configuration-log/configuration-log.component';
import { FunctionDetailComponent } from './function-detail/function-detail.component';
import { FunctionInfoComponent } from './locktab-detail/function-info/function-info.component';
import { FunctionInfosComponent } from './components/function-infos/function-infos.component';
import { TimeChartComponent } from './app-restab-detail/time-chart/time-chart.component';
import { Home2Component } from './home2/home2.component';
import { NodeManagementComponent } from './node-management/node-management.component';
import { SysperfSettingComponent } from './sysperf-settings-all/sysperf-setting/sysperf-setting.component';
import { IndexComponent } from './mission-create/index/index.component';
import { ImportComponent } from './import/import.component';
import { ImportAndExportTaskListComponent } from './import-and-export-task-list/import-and-export-task-list.component';
import { TaskProcessComponent } from './home2/task-process/task-process.component';

import { ConfigComponent } from './config/config.component';
import { InstallComponent } from './install/install.component';
import { UninstallComponent } from './uninstall/uninstall.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { TunsetComponent } from './tun-setting/tun-setting.component';
import { CreateProjectComponent } from './project-management/create-project/create-project.component';
import { ModifyProjectComponent } from './project-management/modify-project/modify-project.component';
import { ViewProjectComponent } from './project-management/view-project/view-project.component';
import { MicarchComponent } from './micarch/micarch.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';
import { AdviceLinkErrorComponent } from './advice-link-error/advice-link-error.component';
import { MainHomeComponent } from './main-home/main-home.component';
import { CreateProjectLaterComponent } from './create-project-later/create-project-later.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { FreeRemoteEnvironmentComponent } from './free-remote-environment/free-remote-environment.component';
import { ProjectManagementComponent } from './diagnose/project-management/project-management.component';
import { TuninghelperTaskDetailComponent } from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/tuninghelper-task-detail/tuninghelper-task-detail.component';
import { TuninghelperProjectManageComponent } from './tuningHelper/tuninghelper-project-manage/tuninghelper-project-manage.component';
import { NetPortDisplayContainerComponent } from './diagnose/net-io-detail/net-port-diaplay/net-port-display-container.component';

import { TaskInfoLogComponent } from './tuning-assistant/task-info-log/task-info-log.component';
import { TuninghelperProcessPidDetailComponent } from './tuningHelper/tuninghelper-process-pid-detail/tuninghelper-process-pid-detail.component';
import { TuninghelperCompareProcessPidDetailComponent } from './tuningHelper/tuninghelper-compare-process-pid-detail/tuninghelper-compare-process-pid-detail.component';
import { NetCaptureSourceContainerComponent } from './diagnose/net-io-detail/net-capture-source/net-capture-source-container.component';
import { HelperDeleteComponent } from './components/helper-delete/helper-delete.component';

const routes: Routes = [
    { path: 'mainHome', component: MainHomeComponent, canActivate: [VscodeAuthGuard] },
    { path: 'microarchitecture', component: MicarchComponent, canActivate: [VscodeAuthGuard] },
    { path: 'config', component: ConfigComponent, canActivate: [VscodeAuthGuard] },
    { path: 'freeTrialProcessEnvironment', component: FreeRemoteEnvironmentComponent, canActivate: [VscodeAuthGuard] },
    { path: 'tunset', component: TunsetComponent, canActivate: [VscodeAuthGuard] },
    { path: 'install', component: InstallComponent, canActivate: [VscodeAuthGuard] },
    { path: 'uninstall', component: UninstallComponent, canActivate: [VscodeAuthGuard] },
    { path: 'disclaimer', component: DisclaimerComponent, canActivate: [VscodeAuthGuard] },
    { path: 'upgrade', component: UpgradeComponent, canActivate: [VscodeAuthGuard] },
    { path: '', component: LoginComponent, canActivate: [VscodeAuthGuard] },
    { path: 'home', component: Home2Component, canActivate: [VscodeAuthGuard] },
    { path: 'loading', component: TaskProcessComponent, canActivate: [VscodeAuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [VscodeAuthGuard] },
    { path: 'nodeManagement', component: NodeManagementComponent, canActivate: [AdminRouteGuard, VscodeAuthGuard] },
    { path: 'configuration', component: ConfigurationComponent, canActivate: [VscodeAuthGuard] },
    { path: 'configurationlog', component: ConfigurationLogComponent, canActivate: [VscodeAuthGuard] },
    { path: 'test', component: FunctionDetailComponent, canActivate: [VscodeAuthGuard] },
    { path: 'timeChart', component: TimeChartComponent, canActivate: [VscodeAuthGuard] },
    { path: 'sysperfSettings', component: SysperfSettingComponent, canActivate: [VscodeAuthGuard] },
    { path: 'mission-create', component: IndexComponent, canActivate: [VscodeAuthGuard] },
    { path: 'import', component: ImportComponent, canActivate: [VscodeAuthGuard] },
    { path: 'importAndExportTaskList', component: ImportAndExportTaskListComponent, canActivate: [VscodeAuthGuard] },
    { path: 'createProject', component: CreateProjectComponent, canActivate: [VscodeAuthGuard] },
    { path: 'createProjectLater', component: CreateProjectLaterComponent, canActivate: [VscodeAuthGuard] },
    { path: 'modifyProject', component: ModifyProjectComponent, canActivate: [VscodeAuthGuard] },
    { path: 'viewProject', component: ViewProjectComponent, canActivate: [VscodeAuthGuard] },
    { path: 'addfunctions', component: FunctionInfoComponent, canActivate: [VscodeAuthGuard] },
    { path: 'addfunction', component: FunctionInfosComponent, canActivate: [VscodeAuthGuard] },
    { path: 'TuninghelperDetail', component: TuninghelperTaskDetailComponent, canActivate: [VscodeAuthGuard] },
    { path: 'errorInstruction', component: ErrorInstructionComponent, canActivate: [VscodeAuthGuard] },
    { path: 'adviceLinkError', component: AdviceLinkErrorComponent, canActivate: [VscodeAuthGuard] },
    // diagnose start
    { path: 'diagnoseProjectManagement', component: ProjectManagementComponent, canActivate: [VscodeAuthGuard] },
    { path: 'netPortDisplay', component: NetPortDisplayContainerComponent, canActivate: [VscodeAuthGuard] },
    { path: 'netCaptureSource', component: NetCaptureSourceContainerComponent, canActivate: [VscodeAuthGuard] },
    // diagnose end

    // tuningHelper
    { path: 'tuningHelperCreatePro', component: TuninghelperProjectManageComponent, canActivate: [VscodeAuthGuard] },
    { path: 'tuningAssistantTaskInfoLog', component: TaskInfoLogComponent, canActivate: [VscodeAuthGuard]},
    {path: 'tuningHelperDelete', component: HelperDeleteComponent, canActivate: [VscodeAuthGuard]},
    { path: 'tuninghelperProcessPidDetail',
        component: TuninghelperProcessPidDetailComponent, canActivate: [VscodeAuthGuard]},
    { path: 'tuninghelperCompareProcessPidDetail',
        component: TuninghelperCompareProcessPidDetailComponent, canActivate: [VscodeAuthGuard]},
    { path: '**', component: Home2Component, canActivate: [VscodeAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
