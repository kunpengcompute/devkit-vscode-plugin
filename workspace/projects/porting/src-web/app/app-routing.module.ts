import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home-new/home/home.component';
import { PortingWorkloadComponent } from './pages/home-new/porting-workload/porting-workload.component';
import { LoginComponent } from './pages/login/login.component';
import { MigrationCenterComponent } from './pages/home-new/migration-center/migration-center.component';
import { AnalysisCenterComponent } from './pages/home-new/analysis-center/analysis-center.component';
import {
  MemoryBarrierAnalysisComponent
} from './pages/home-new/memory-barrier-analysis/memory-barrier-analysis.component';
import { HomeNewComponent } from './pages/home-new/home-new.component';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
  { path: '', redirectTo: '/homeNew/porting-workload', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'softwareMigrationReport',
    loadChildren: () =>
      import('./pages/detail/software-migration-report-detail/software-migration-report-detail.module')
        .then(m => m.SoftwareMigrationReportDetailModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'SoftwarePackageReport',
    loadChildren: () => import('./pages/detail/software-package-report/software-package-report.module')
      .then(m => m.SoftwarePackageReportModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'report',
    loadChildren: () => import('./pages/detail/source-report/source-report.module').then(m => m.SourceReportModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'migrationDetail',
    loadChildren: () => import('./pages/detail/migration-detail/migration-detail.module')
      .then(m => m.MigrationDetailModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'reportDiff',
    loadChildren: () => import('./pages/detail/report-diff/report-diff.module').then(m => m.ReportDiffModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'reportDetail',
    loadChildren: () => import('./pages/detail/report-detail/report-detail.module').then(m => m.ReportDetailModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'BCReport',
    loadChildren: () => import('./pages/detail/bcfile-report/bcfile-report.module').then(m => m.BcfileReportModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'homeNew', component: HomeNewComponent, data: { keep: true }, canActivate: [LoginGuard],
    children: [
      { path: 'porting-workload', data: { keep: false },  component: PortingWorkloadComponent },
      { path: 'home', data: { keep: false },  component: HomeComponent },
      { path: 'analysisCenter', data: { keep: false },  component: AnalysisCenterComponent },
      { path: 'migrationCenter', data: { keep: false },  component: MigrationCenterComponent },
      { path: 'PortingPre-check', data: { keep: false },  component: MemoryBarrierAnalysisComponent },
    ],
  },
  {
    path: 'setting/:path',
    loadChildren: () => import('./pages/sys-setting/sys-setting.module').then(m => m.SysSettingModule),
    canActivate: [LoginGuard]
  },
  { path: '**', redirectTo: '/homeNew/porting-workload'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
