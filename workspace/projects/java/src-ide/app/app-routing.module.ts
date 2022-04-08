import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VscodeAuthGuard } from './guard';

import { HomeComponent } from './home/home.component';
import { ProfileDetailComponent } from './profile/profile-detail/profile-detail.component';
import { SampleDetailComponent } from './sample/sample-detail/sample-detail.component';
import { ProfileOverviewComponent } from './profile/profile-overview/profile-overview.component';
import { ProfileThreadComponent } from './profile/profile-thread/profile-thread.component';
import { ProfileJDBCComponent } from './profile/profile-jdbc/profile-jdbc.component';
import { ProfileHttpComponent } from './profile/profile-http/profile-http.component';
import { SampleEnvComponent } from './sample/sample-env/sample-env.component';
import { SampleMemoryComponent } from './sample/sample-memory/sample-memory.component';
import { SampleLockComponent } from './sample/sample-lock/sample-lock.component';
import { SampleThreadComponent } from './sample/sample-thread/sample-thread.component';
import { SampleMethodComponent } from './sample/sample-method/sample-method.component';
import { SampleObjectsComponent } from './sample/sample-objects/sample-objects.component';
import { DatabaseComponent } from './profile/database/database.component';
import { MongodbComponent } from './profile/database/mongodb/mongodb.component';
import { CassandraComponent } from './profile/database/cassandra/cassandra.component';
import { HbaseComponent } from './profile/database/hbase/hbase.component';
import { SocketIoComponent } from './profile/io/socket-io/socket-io.component';
import { FileIoComponent } from './profile/io/file-io/file-io.component';
import { IoDetailComponent } from './profile/io/io-detail/io-detail.component';
import { SpringBootComponent } from './profile/spring-boot/spring-boot.component';
import { GcComponent } from './profile/gc/gc.component';
import { SampleSocketIoComponent } from './sample/sample-io/sample-socket-io/sample-socket-io.component';
import { SampleFileIoComponent } from './sample/sample-io/sample-file-io/sample-file-io.component';
import { SampleIoDetailComponent } from './sample/sample-io/sample-io-detail/sample-io-detail.component';
import { JdbcpoolComponent } from './profile/database/jdbcpool/jdbcpool.component';
import { ProfileMemorydumpComponent } from './profile/profile-memorydump/profile-memorydump.component';
import { ProfileSnapshotComponent } from './profile/profile-snapshot/profile-snapshot.component';
import { JavaperfSettingsComponent } from './javaperf-settings-all/javaperf-settings/javaperf-settings.component';
import { RecordManageComponent } from './record-manage/record-manage.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';
import { SampleLeakComponent } from './sample/sample-leak/sample-leak.component';
import { SampleStorageComponent } from './sample/sample-storage/sample-storage.component';
import { TargetEnviromentComponent } from './javaperf-settings-all/target-enviroment/target-enviroment.component';
import { SampleCpuComponent } from './sample/sample-cpu/sample-cpu.component';
import { ProfileWebComponent } from './profile/profile-web/profile-web.component';
import { ProfileGcComponent } from './profile/profile-gc/profile-gc.component';
import { GcLogComponent } from './profile/profile-gc/gc-log/gc-log.component';
import { HeapdumpReportComponent } from './saved-report/heapdump-report/heapdump-report.component';
import { ThreaddumpReportComponent } from './saved-report/threaddump-report/threaddump-report.component';
import { GclogReportComponent } from './saved-report/gclog-report/gclog-report.component';
import { ProfileHotComponent } from './profile/profile-hot/profile-hot.component';
import { AdviceLinkErrorComponent } from './advice-link-error/advice-link-error.component';
const routes: Routes = [
    { path: 'errorInstruction', component: ErrorInstructionComponent, canActivate: [VscodeAuthGuard] },
    { path: 'adviceLinkError', component: AdviceLinkErrorComponent, canActivate: [VscodeAuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [VscodeAuthGuard] },
    { path: 'javaperfsetting', component: JavaperfSettingsComponent, canActivate: [VscodeAuthGuard] },
    { path: 'targetEnviroment', component: TargetEnviromentComponent, canActivate: [VscodeAuthGuard] },
    { path: 'recordmanage', component: RecordManageComponent, canActivate: [VscodeAuthGuard] },
    {
        path: 'profiling/:profileName',
        component: ProfileDetailComponent,
        children: [
            {
                path: '',
                component: ProfileOverviewComponent,
            },
            {
                path: 'overview',
                component: ProfileOverviewComponent,
            },
            {
                path: 'thread',
                component: ProfileThreadComponent,
            },
            {
                path: 'memoryDump',
                component: ProfileMemorydumpComponent,
            },
            {
                path: 'hot',
                component: ProfileHotComponent,
            },
            {
                path: 'database',
                component: DatabaseComponent,
                children: [
                    {
                        path: 'jdbc',
                        component: ProfileJDBCComponent
                    },
                    {
                        path: 'jdbcpool',
                        component: JdbcpoolComponent
                    },
                    {
                        path: 'mongodb',
                        component: MongodbComponent
                    },
                    {
                        path: 'cassandra',
                        component: CassandraComponent
                    },
                    {
                        path: 'hbase',
                        component: HbaseComponent
                    }
                ]
            },
            {
                path: 'web',
                component: ProfileWebComponent,
                children: [
                    {
                        path: 'httpRequest',
                        component: ProfileHttpComponent,
                    },
                    {
                        path: 'springBoot',
                        component: SpringBootComponent
                    },
                ]
            },
            {
                path: 'io',
                component: IoDetailComponent,
                children: [
                    {
                        path: 'fileIo',
                        component: FileIoComponent
                    },
                    {
                        path: 'socketIo',
                        component: SocketIoComponent
                    },
                ]
            },
            {
                path: 'gc',
                component: ProfileGcComponent,
                children: [
                    {
                        path: '',
                        component: GcComponent
                    },
                    {
                        path: 'analysis',
                        component: GcComponent
                    },
                    {
                        path: 'log',
                        component: GcLogComponent
                    }
                ]
            },
            {
                path: 'snapshot',
                component: ProfileSnapshotComponent
            },
            {
                path: '**',
                component: ProfileOverviewComponent,
            },
        ],
        canActivate: [VscodeAuthGuard],
        canActivateChild: [VscodeAuthGuard]
    },
    {
        path: 'sampling/:samplingName',
        component: SampleDetailComponent,
        children: [
            {
                path: '',
                component: SampleEnvComponent,
            },
            {
                path: 'env',
                component: SampleEnvComponent,
            },
            {
                path: 'cpu',
                component: SampleCpuComponent,
                children: [
                    {
                        path: 'thread',
                        component: SampleThreadComponent,
                    },
                    {
                        path: 'method',
                        component: SampleMethodComponent,
                    },
                    {
                        path: 'lock',
                        component: SampleLockComponent,
                    }
                ]
            },
            {
                path: 'gc',
                component: SampleMemoryComponent,
            },
            {
                path: 'objects',
                component: SampleStorageComponent,
                children: [
                    {
                        path: '',
                        component: SampleObjectsComponent
                    },
                    {
                        path: 'objects',
                        component: SampleObjectsComponent
                    },
                    {
                        path: 'leak',
                        component: SampleLeakComponent
                    }
                ]
            },
            {
                path: 'io',
                component: SampleIoDetailComponent,
                children: [
                    {
                        path: '',
                        component: SampleFileIoComponent
                    },
                    {
                        path: 'fileIo',
                        component: SampleFileIoComponent
                    },
                    {
                        path: 'socketIo',
                        component: SampleSocketIoComponent
                    },
                ]
            },
            {
                path: '**',
                component: SampleEnvComponent,
            },
        ],
        canActivate: [VscodeAuthGuard],
        canActivateChild: [VscodeAuthGuard]
    },
    { path: 'heapdumpReport', component: HeapdumpReportComponent, canActivate: [VscodeAuthGuard] },
    { path: 'threaddumpReport', component: ThreaddumpReportComponent, canActivate: [VscodeAuthGuard] },
    { path: 'gclogReport', component: GclogReportComponent, canActivate: [VscodeAuthGuard] },
    { path: '**', redirectTo: 'home', pathMatch: 'full', canActivate: [VscodeAuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
