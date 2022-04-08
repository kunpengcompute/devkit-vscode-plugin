import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MyInterceptor } from './service/http.interceptor';
import { CommonSharedModule } from 'projects/java/src-com/app/shared/common-shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';         // 解决打包后刷新404问题
import { TiLocale } from '@cloud/tiny3';

import { HttpClient } from '@angular/common/http'; // 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';   // 国际化
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; // 国际化
import { TranslateService } from '@ngx-translate/core'; // 国际化
import { AppReuseStrategy } from './service/appReuseStrategy.service';   // 缓存路由
import { RouteReuseStrategy } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import { MaskComponent } from './mask/mask.component';
import { HomeComponent } from './home/home.component';
import { ModalComponent } from './components/modal/modal.component';
import { ProgressComponent } from './progress/progress.component';
import { ProfileDetailComponent } from './profile/profile-detail/profile-detail.component';
import { SampleDetailComponent } from './sample/sample-detail/sample-detail.component';
import { ProfileOverviewComponent } from './profile/profile-overview/profile-overview.component';
import { ProfileThreadComponent } from './profile/profile-thread/profile-thread.component';
import { ProfileMemoryComponent } from './profile/profile-memory/profile-memory.component';
import { ProfileJDBCComponent } from './profile/profile-jdbc/profile-jdbc.component';
import { ProfileHttpComponent } from './profile/profile-http/profile-http.component';
import { SampleEnvComponent } from './sample/sample-env/sample-env.component';
import { SampleMemoryComponent } from './sample/sample-memory/sample-memory.component';
import { SampleLockComponent } from './sample/sample-lock/sample-lock.component';
import { SampleThreadComponent } from './sample/sample-thread/sample-thread.component';
import { SampleMethodComponent } from './sample/sample-method/sample-method.component';
import { SampleObjectsComponent } from './sample/sample-objects/sample-objects.component';
import { AlertMessageComponent } from './alert-message/alert-message.component';
import { SuggestionComponent } from './profile/suggestion/suggestion.component';
import { JDBCComponent } from './profile/jdbc/jdbc.component';
import { OverviewEchartsComponent } from './profile/profile-overview/overview-echarts/overview-echarts.component';
import { EchartsCommonComponent } from './profile/echarts-common/echarts-common.component';
import { AboutComponent } from './about/about.component';
import { CircleProgressComponent } from './components/circle-progress/circle-progress.component';
import { DatabaseComponent } from './profile/database/database.component';
import { MongodbComponent } from './profile/database/mongodb/mongodb.component';
import { CassandraComponent } from './profile/database/cassandra/cassandra.component';
import { HbaseComponent } from './profile/database/hbase/hbase.component';
import { SocketIoComponent } from './profile/io/socket-io/socket-io.component';
import { FileIoComponent } from './profile/io/file-io/file-io.component';
import { IoDetailComponent } from './profile/io/io-detail/io-detail.component';
import { SpringBootComponent } from './profile/spring-boot/spring-boot.component';
import { SampleSocketIoComponent } from './sample/sample-io/sample-socket-io/sample-socket-io.component';
import { SampleFileIoComponent } from './sample/sample-io/sample-file-io/sample-file-io.component';
import { SampleIoDetailComponent } from './sample/sample-io/sample-io-detail/sample-io-detail.component';
import { JdbcpoolComponent } from './profile/database/jdbcpool/jdbcpool.component';
import { ProfileEchartComponent } from './profile/database/jdbcpool/profile-echarts/profile-echart/profile-echart.component';
import { GcComponent } from './profile/gc/gc.component';
import { ProfileMemorydumpComponent } from './profile/profile-memorydump/profile-memorydump.component';
import { JavaperfSettingsComponent } from './javaperf-settings-all/javaperf-settings/javaperf-settings.component';
import { PopAlertModalComponent } from './javaperf-settings-all/popalert-modal/popalert-modal.component';
import { ThresholdComponent } from './javaperf-settings-all/threshold/threshold.component';
import { JavaOperalogManageComponent } from './javaperf-settings-all/javaoperalog-manage/javaoperalog-manage.component';
import { JavaRunlogManageComponent } from './javaperf-settings-all/javarunlog-manage/javarunlog-manage.component';
import { GuardianManageComponent } from './guardian-manage/guardian-manage.component';
import { GuardianCreateComponent } from './guardian-manage/guardian-create/guardian-create.component';
import { RecordManageComponent } from './record-manage/record-manage.component';
import { ProfilingManageComponent } from './profile/profiling-manage.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';
import { BannerComponent } from './components/banner/banner.component';
import { JavaperfSecretKeyComponent } from './javaperf-settings-all/javaperf-secret-key/javaperf-secret-key.component';
import { SettingItemComponent } from './javaperf-settings-all/setting-item/setting-item.component';
import { StackTreeComponent } from './components/stack-tree/stack-tree.component';
import { SampleStorageComponent } from './sample/sample-storage/sample-storage.component';
import { SampleLeakComponent } from './sample/sample-leak/sample-leak.component';
import { HistogramTreeComponent } from './profile/profile-memorydump/components/histogram-tree/histogram-tree.component';
import { HistogramAllobjectComponent } from './profile/profile-memorydump/components/histogram-allobject/histogram-allobject.component';
import { ProfileSettingComponent } from './profile/profile-detail/profile-setting/profile-setting.component';
import { ProfileSettingItemComponent } from './profile/profile-detail/profile-setting/profile-setting-item/profile-setting-item.component';
import { CaDownLoadComponent } from './home/ca-download/ca-download.component';
import { ProfileExportComponent } from './profile/profile-detail/profile-export/profile-export.component';
import { JavaperfWorkKeyComponent } from './javaperf-settings-all/javaperf-work-key/javaperf-work-key.component';
import {
    JavaProfilingConfigurationComponent
} from './javaperf-settings-all/java-profiling-configuration/java-profiling-configuration.component';
import { JavaperfAnalyzesSettingComponent } from './javaperf-settings-all/javaperf-analyzes-setting/javaperf-analyzes-setting.component';
import { StackTipComponent } from './profile/stack-tip/stack-tip.component';
import { TargetEnviromentComponent } from './javaperf-settings-all/target-enviroment/target-enviroment.component';
import { ProfileSnapshotComponent } from './profile/profile-snapshot/profile-snapshot.component';
import { AlertModalComponent } from './profile/profile-snapshot/components/alert-modal/alert-modal.component';
import { EchartsCommComponent } from './profile//profile-snapshot/components/echarts-comm/echarts-comm.component';
import { CassandraCompareComponent } from './profile/profile-snapshot/components/database/cassandra-compare/cassandra-compare.component';
import { JdbcpoolCompareComponent } from './profile/profile-snapshot/components/database/jdbcpool-compare/jdbcpool-compare.component';
import { DefaultPageComponent } from './components/default-page/default-page.component';
import { LoadingComponent } from './components/default-page/loading/loading.component';
import { HttpCompareComponent } from './profile/profile-snapshot/components/http-compare/http-compare.component';
import { FileioCompareComponent } from './profile/profile-snapshot/components/fileio-compare/fileio-compare.component';
import { ContrastSnapshotComponent } from './profile/profile-snapshot/components/contrast-snapshot/contrast-snapshot.component';
import { SocketioCompareComponent } from './profile/profile-snapshot/components/socketio-compare/socketio-compare.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { SampleSuggestComponent } from './sample/sample-suggest/sample-suggest.component';
import { SampleCpuComponent } from './sample/sample-cpu/sample-cpu.component';
import { ProfileWebComponent } from './profile/profile-web/profile-web.component';
import { ProfileHeapdumpSavedComponent } from './profile/profile-detail/profile-heapdump-saved/profile-heapdump-saved.component';
import { ProfileGcComponent } from './profile/profile-gc/profile-gc.component';
import { GcLogComponent } from './profile/profile-gc/gc-log/gc-log.component';
import { HeapdumpReportComponent } from './saved-report/heapdump-report/heapdump-report.component';
import { ReportConfigInfoComponent } from './saved-report/report-config-info/report-config-info.component';
import { ThreaddumpReportComponent } from './saved-report/threaddump-report/threaddump-report.component';
import { GclogReportComponent } from './saved-report/gclog-report/gclog-report.component';
import { ProfileHotComponent } from './profile/profile-hot/profile-hot.component';
import { AdviceLinkErrorComponent } from './advice-link-error/advice-link-error.component';

@NgModule({
    declarations: [
        SampleLeakComponent,
        SampleStorageComponent,
        GuardianCreateComponent,
        GuardianManageComponent,
        JavaOperalogManageComponent,
        ThresholdComponent,
        JavaRunlogManageComponent,
        JavaperfSettingsComponent,
        PopAlertModalComponent,
        AppComponent,
        MaskComponent,
        HomeComponent,
        ModalComponent,
        ProgressComponent,
        ProfileDetailComponent,
        SampleDetailComponent,
        ProfileOverviewComponent,
        ProfileThreadComponent,
        ProfileMemoryComponent,
        ProfileJDBCComponent,
        ProfileHttpComponent,
        SampleEnvComponent,
        SampleMemoryComponent,
        SampleLockComponent,
        SampleThreadComponent,
        SampleMethodComponent,
        SampleObjectsComponent,
        AlertMessageComponent,
        SuggestionComponent,
        JDBCComponent,
        OverviewEchartsComponent,
        EchartsCommonComponent,
        AboutComponent,
        CircleProgressComponent,
        DatabaseComponent,
        MongodbComponent,
        CassandraComponent,
        HbaseComponent,
        SocketIoComponent,
        FileIoComponent,
        IoDetailComponent,
        SpringBootComponent,
        SampleSocketIoComponent,
        SampleFileIoComponent,
        SampleIoDetailComponent,
        JdbcpoolComponent,
        ProfileEchartComponent,
        GcComponent,
        ProfileMemorydumpComponent,
        RecordManageComponent,
        ProfilingManageComponent,
        ErrorInstructionComponent,
        BannerComponent,
        JavaperfSecretKeyComponent,
        SettingItemComponent,
        StackTreeComponent,
        HistogramTreeComponent,
        HistogramAllobjectComponent,
        ProfileSettingComponent,
        ProfileSettingItemComponent,
        CaDownLoadComponent,
        ProfileExportComponent,
        JavaperfWorkKeyComponent,
        JavaperfAnalyzesSettingComponent,
        StackTipComponent,
        JavaProfilingConfigurationComponent,
        JavaperfAnalyzesSettingComponent,
        TargetEnviromentComponent,
        ProfileSnapshotComponent,
        AlertModalComponent,
        EchartsCommComponent,
        CassandraCompareComponent,
        JdbcpoolCompareComponent,
        DefaultPageComponent,
        LoadingComponent,
        HttpCompareComponent,
        FileioCompareComponent,
        ContrastSnapshotComponent,
        SocketioCompareComponent,
        AnalysisComponent,
        SampleSuggestComponent,
        SampleCpuComponent,
        ProfileWebComponent,
        ProfileHeapdumpSavedComponent,
        ProfileGcComponent,
        GcLogComponent,
        HeapdumpReportComponent,
        ReportConfigInfoComponent,
        ThreaddumpReportComponent,
        GclogReportComponent,
        ProfileHotComponent,
        AdviceLinkErrorComponent,
    ],
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient) => {
                    // 国际化的文件地址
                    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
                },
                deps: [HttpClient]
            }
        }),
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        CommonSharedModule,
        NgxEchartsModule.forRoot({
          echarts: () => import('echarts'),
        }),
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },    // 解决打包后刷新404问题
        { provide: RouteReuseStrategy, useClass: AppReuseStrategy },        // 缓存路由
        { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(public translate: TranslateService) {
        // 配置Tiny国际化资源，默认为中文
        if ((self as any).webviewSession.getItem('language') === 'en-us') {
            (self as any).webviewSession.setItem('language', 'en-us');
            TiLocale.setLocale(TiLocale.EN_US);
        } else {
            (self as any).webviewSession.setItem('language', 'zh-cn');
            TiLocale.setLocale(TiLocale.ZH_CN);
        }
    }
}
