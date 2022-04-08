import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanDeactivate } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MigrationAppraiseComponent } from './migration-appraise/migration-appraise.component';
import { MigrationCenterComponent } from './migration-center/migration-center.component';
import { AnalysisCenterComponent } from './analysis-center/analysis-center.component';
import { MigrationDetailComponent } from './migration-detail/migration-detail.component';
import { MemoryBarrierAnalysisComponent } from './memory-barrier-analysis/memory-barrier-analysis.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { ReportDepDetailComponent } from './report-depdetail/report-depdetail.component';
import { InstallComponent } from './install/install.component';
import { ConfigComponent } from './config/config.component';
import { PortsetComponent } from './port-setting/port-setting.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';
import { UnInstallComponent } from './uninstall/uninstall.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { ByteShowComponent } from './byte-show/byte-show.component';
import { EnhanceFunctionReportComponent } from './enhance-function-report/enhance-function-report.component';
import { SoftwarePackageReportComponent } from './software-package-report/software-package-report.component';
import { FreeRemoteEnvironmentComponent } from './free-remote-environment/free-remote-environment.component';
import { VscodeAuthGuard } from './service/guard';
import { AdviceLinkErrorComponent } from './advice-link-error/advice-link-error.component';

const routes: Routes = [
    { path: 'config', component: ConfigComponent, canActivate: [VscodeAuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [VscodeAuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [VscodeAuthGuard] },
    { path: 'migrationCenter', component: MigrationCenterComponent, canActivate: [VscodeAuthGuard] },
    { path: 'migrationAppraise', component: MigrationAppraiseComponent, canActivate: [VscodeAuthGuard] },
    { path: 'analysisCenter', component: AnalysisCenterComponent, canActivate: [VscodeAuthGuard] },
    { path: 'migrationDetail', component: MigrationDetailComponent, canActivate: [VscodeAuthGuard] },
    { path: 'PortingPre-check', component: MemoryBarrierAnalysisComponent, canActivate: [VscodeAuthGuard] },
    { path: 'reportDetail', component: ReportDetailComponent, canActivate: [VscodeAuthGuard] },
    { path: 'reportDepDetail', component: ReportDepDetailComponent, canActivate: [VscodeAuthGuard] },
    { path: 'install', component: InstallComponent, canActivate: [VscodeAuthGuard] },
    { path: 'uninstall', component: UnInstallComponent, canActivate: [VscodeAuthGuard] },
    { path: 'upgrade', component: UpgradeComponent, canActivate: [VscodeAuthGuard] },
    { path: 'portsettings', component: PortsetComponent, canActivate: [VscodeAuthGuard] },
    { path: 'disclaimer', component: DisclaimerComponent, canActivate: [VscodeAuthGuard] },
    { path: 'errorInstruction', component: ErrorInstructionComponent, canActivate: [VscodeAuthGuard] },
    { path: 'bytereport', component: ByteShowComponent, canActivate: [VscodeAuthGuard] },
    { path: 'enchanceReport', component: EnhanceFunctionReportComponent, canActivate: [VscodeAuthGuard] },
    { path: 'SoftwarePackageReport', component: SoftwarePackageReportComponent, canActivate: [VscodeAuthGuard] },
    { path: 'freeTrialProcessEnvironment', component: FreeRemoteEnvironmentComponent, canActivate: [VscodeAuthGuard]},
    { path: 'adviceLinkError', component: AdviceLinkErrorComponent, canActivate: [VscodeAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
