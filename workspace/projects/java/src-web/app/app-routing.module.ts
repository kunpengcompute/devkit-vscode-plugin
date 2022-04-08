import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileDetailComponent } from './profile/profile-detail/profile-detail.component';
import { ProfileOverviewComponent } from './profile/profile-overview/profile-overview.component';
import { ProfileThreadComponent } from './profile/profile-thread/profile-thread.component';
import { ProfileMemoryComponent } from './profile/profile-memory/profile-memory.component';
import { ProfileJDBCComponent } from './profile/profile-jdbc/profile-jdbc.component';
import { DatabaseComponent } from './profile/database/database.component';
import { MongodbComponent } from './profile/database/mongodb/mongodb.component';
import { CassandraComponent } from './profile/database/cassandra/cassandra.component';
import { HbaseComponent } from './profile/database/hbase/hbase.component';
import { SocketIoComponent } from './profile/io/socket-io/socket-io.component';
import { FileIoComponent } from './profile/io/file-io/file-io.component';
import { IoDetailComponent } from './profile/io/io-detail/io-detail.component';
import { SpringBootComponent } from './profile/spring-boot/spring-boot.component';
import { WebDetailComponent } from './profile/web/web-detail.component';
import { ProfileHttpComponent } from './profile/profile-http/profile-http.component';
import { GcComponent } from './profile/gc/gcAnalysis/gc.component';
import { GcDetailComponent } from './profile/gc/gc-detail.component';
import { GcLogComponent } from './profile/gc/gcLog/gc-log.component';
import { JdbcpoolComponent } from './profile/database/jdbcpool/jdbcpool.component';
import { GclogDetailComponent } from './offline-report/gclog/gclog-detail/gclog-detail.component';
import { ProfileMemorydumpComponent } from './profile/profile-memorydump/profile-memorydump.component';
import { ProfileHotComponent } from './profile/profile-hot/profile-hot.component';
import { ProfileSnapshotComponent } from './profile/profile-snapshot/profile-snapshot.component';
import { HeapdumpDetailComponent } from './offline-report/heapdump/heapdump-detail/heapdump-detail.component';
import { OfflineMemorydumpComponent } from './offline-report/heapdump/offline-memorydump/offline-memorydump.component';
import { OfflineReportinforComponent } from './offline-report/heapdump/offline-reportinfor/offline-reportinfor.component';
import { ThreaddumpDetailComponent } from './offline-report/threaddump/threaddump-detail/threaddump-detail.component';
import { OfflineThreaddumpComponent } from './offline-report/threaddump/offline-threaddump/offline-threaddump.component';
import { OfflineGclogComponent } from './offline-report/gclog/offline-gclog/offline-gclog.component';
import { LoginGuard } from './login.guard';
import { environment } from '../environments/environment';
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./core/home/home.module').then(m => m.HomeModule),
    canActivate: [LoginGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    canActivate: [LoginGuard]
  },
  {
    path: '',
    loadChildren: () => import('./core/header-new/header/new-header/new-header.module').then(m => m.NewHeaderModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'sampling/:samplingName',
    loadChildren: () => import('./sample/sample.module').then(m => m.SampleModule),
    canActivate: [LoginGuard],
  },
  {
    path: 'profiling/:profileName',
    component: ProfileDetailComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        component: ProfileOverviewComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'overview',
        component: ProfileOverviewComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'thread',
        component: ProfileThreadComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'memoryDump',
        component: ProfileMemorydumpComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'hot',
        component: ProfileHotComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'database',
        component: DatabaseComponent,
        canActivate: [LoginGuard],
        children: [
          {
            path: '',
            component: ProfileJDBCComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'jdbc',
            component: ProfileJDBCComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'jdbcpool',
            component: JdbcpoolComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'mongodb',
            component: MongodbComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'cassandra',
            component: CassandraComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'hbase',
            component: HbaseComponent,
            canActivate: [LoginGuard]
          }
        ]
      },
      {
        path: 'io',
        component: IoDetailComponent,
        canActivate: [LoginGuard],
        children: [
          {
            path: '',
            component: FileIoComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'fileIo',
            component: FileIoComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'socketIo',
            component: SocketIoComponent,
            canActivate: [LoginGuard]
          },
        ]
      },
      {
        path: 'web',
        component: WebDetailComponent,
        canActivate: [LoginGuard],
        children: [
          {
            path: 'http',
            component: ProfileHttpComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'springBoot',
            component: SpringBootComponent,
            canActivate: [LoginGuard],
          },
        ]
      },
      {
        path: 'gc',
        component: GcDetailComponent,
        canActivate: [LoginGuard],
        children: [
          {
            path: 'gcAnalysis',
            component: GcComponent,
            canActivate: [LoginGuard]
          },
          {
            path: 'gcLog',
            component: GcLogComponent,
            canActivate: [LoginGuard]
          },
        ]
      },
      {
        path: 'snapshot',
        component: ProfileSnapshotComponent,
        canActivate: [LoginGuard]
      },
      {
        path: '**',
        component: ProfileOverviewComponent,
        canActivate: [LoginGuard]
      },
    ],
  },
  {
    path: 'offgclog/:GCLogName',
    component: GclogDetailComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        component: OfflineGclogComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'offgclog',
        component: OfflineGclogComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'reportInf',
        component: OfflineReportinforComponent,
        canActivate: [LoginGuard]
      },
    ]
  },
  {
    path: 'heapdump/:heapdumpName',
    component: HeapdumpDetailComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        component: OfflineMemorydumpComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'memorydump',
        component: OfflineMemorydumpComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'reportInf',
        component: OfflineReportinforComponent,
        canActivate: [LoginGuard]
      },
    ]
  },
  {
    path: 'threaddump/:threaddumpName',
    component: ThreaddumpDetailComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        component: OfflineThreaddumpComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'threaddump',
        component: OfflineThreaddumpComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'reportInf',
        component: OfflineReportinforComponent,
        canActivate: [LoginGuard]
      },
    ]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full', canActivate: [LoginGuard]},
];
if (!environment.production) {
  routes.unshift({
    path: 'login',
    loadChildren: () => import('projects/java/src-web/app/login/login.module').then(m => m.LoginModule)
  });
}
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
