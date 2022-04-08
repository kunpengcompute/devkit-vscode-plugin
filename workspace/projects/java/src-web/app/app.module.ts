import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';         // 解决打包后刷新404问题
import { TiLocale } from '@cloud/tiny3';
import { HttpClient } from '@angular/common/http'; // 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';   // 国际化
import { NgxEchartsModule } from 'ngx-echarts';
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; // 国际化
import { TranslateService } from '@ngx-translate/core'; // 国际化
import { AppReuseStrategy } from './service/appReuseStrategy.service';   // 缓存路由
import { RouteReuseStrategy } from '@angular/router';
import { ProfileDetailComponent } from './profile/profile-detail/profile-detail.component';
import { ProfileOverviewComponent } from './profile/profile-overview/profile-overview.component';
import { ProfileThreadComponent } from './profile/profile-thread/profile-thread.component';
import { ProfileMemoryComponent } from './profile/profile-memory/profile-memory.component';
import { ProfileJDBCComponent } from './profile/profile-jdbc/profile-jdbc.component';
import { SuggestionComponent } from './profile/suggestion/suggestion.component';
import { JDBCComponent } from './profile/jdbc/jdbc.component';
import { OverviewEchartsComponent } from './profile/profile-overview/overview-echarts/overview-echarts.component';
import { EchartsCommonComponent } from './profile/echarts-common/echarts-common.component';
import { DatabaseComponent } from './profile/database/database.component';
import { MongodbComponent } from './profile/database/mongodb/mongodb.component';
import { CassandraComponent } from './profile/database/cassandra/cassandra.component';
import { HbaseComponent } from './profile/database/hbase/hbase.component';
import { SocketIoComponent } from './profile/io/socket-io/socket-io.component';
import { FileIoComponent } from './profile/io/file-io/file-io.component';
import { IoDetailComponent } from './profile/io/io-detail/io-detail.component';
import { WebDetailComponent } from './profile/web/web-detail.component';
import { SpringBootComponent } from './profile/spring-boot/spring-boot.component';
import { ProfileHttpComponent } from './profile/profile-http/profile-http.component';
import { JdbcpoolComponent } from './profile/database/jdbcpool/jdbcpool.component';
import { GcDetailComponent } from './profile/gc/gc-detail.component';
import { GcLogComponent } from './profile/gc/gcLog/gc-log.component';
import { GcComponent } from './profile/gc/gcAnalysis/gc.component';
import { ProfileMemorydumpComponent } from './profile/profile-memorydump/profile-memorydump.component';
import { ProfileSnapshotComponent } from './profile/profile-snapshot/profile-snapshot.component';
import { HistogramTreeComponent } from './profile/profile-memorydump/components/histogram-tree/histogram-tree.component';
import { HistogramAllobjectComponent } from './profile/profile-memorydump/components/histogram-allobject/histogram-allobject.component';
import { ContrastSnapshotComponent } from './profile/profile-snapshot/components/contrast-snapshot/contrast-snapshot.component';
import { FileioCompareComponent } from './profile/profile-snapshot/components/fileio-compare/fileio-compare.component';
import { CassandraCompareComponent } from './profile/profile-snapshot/components/database/cassandra-compare/cassandra-compare.component';
import { JdbcpoolCompareComponent } from './profile/profile-snapshot/components/database/jdbcpool-compare/jdbcpool-compare.component';
import { HttpCompareComponent } from './profile/profile-snapshot/components/http-compare/http-compare.component';
import { EchartsCommComponent } from './profile/profile-snapshot/components/echarts-comm/echarts-comm.component';
import { SocketioCompareComponent } from './profile/profile-snapshot/components/socketio-compare/socketio-compare.component';
import { LoginGuard } from './login.guard';
import { HeapdumpDetailComponent } from './offline-report/heapdump/heapdump-detail/heapdump-detail.component';
import { OfflineMemorydumpComponent } from './offline-report/heapdump/offline-memorydump/offline-memorydump.component';
import { OfflineReportinforComponent } from './offline-report/heapdump/offline-reportinfor/offline-reportinfor.component';
import { ThreaddumpDetailComponent } from './offline-report/threaddump/threaddump-detail/threaddump-detail.component';
import { OfflineThreaddumpComponent } from './offline-report/threaddump/offline-threaddump/offline-threaddump.component';
import { OfflineGclogComponent } from './offline-report/gclog/offline-gclog/offline-gclog.component';
import { GclogDetailComponent } from './offline-report/gclog/gclog-detail/gclog-detail.component';
import { ProfileModule } from './profile/profile.module';
import { StackTipComponent } from './profile/stack-tip/stack-tip.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileDetailComponent,
    ProfileOverviewComponent,
    ProfileThreadComponent,
    ProfileMemoryComponent,
    ProfileJDBCComponent,
    ProfileHttpComponent,
    SuggestionComponent,
    JDBCComponent,
    OverviewEchartsComponent,
    EchartsCommonComponent,
    DatabaseComponent,
    MongodbComponent,
    CassandraComponent,
    HbaseComponent,
    SocketIoComponent,
    FileIoComponent,
    IoDetailComponent,
    SpringBootComponent,
    WebDetailComponent,
    JdbcpoolComponent,
    GcDetailComponent,
    GcLogComponent,
    GcComponent,
    ProfileMemorydumpComponent,
    ProfileSnapshotComponent,
    HistogramTreeComponent,
    HistogramAllobjectComponent,
    ContrastSnapshotComponent,
    FileioCompareComponent,
    CassandraCompareComponent,
    JdbcpoolCompareComponent,
    HttpCompareComponent,
    EchartsCommComponent,
    SocketioCompareComponent,
    HeapdumpDetailComponent,
    OfflineMemorydumpComponent,
    OfflineReportinforComponent,
    ThreaddumpDetailComponent,
    OfflineThreaddumpComponent,
    OfflineGclogComponent,
    GclogDetailComponent,
    StackTipComponent,
  ],
  imports: [
    CoreModule,
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
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ProfileModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },    // 解决打包后刷新404问题
    { provide: RouteReuseStrategy, useClass: AppReuseStrategy },       // 缓存路由
    LoginGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public translate: TranslateService) {
    // 配置Tiny国际化资源，默认为中文
    if (sessionStorage.getItem('language') === 'en-us') {
      sessionStorage.setItem('language', 'en-us');
      TiLocale.setLocale(TiLocale.EN_US);
    } else {
      sessionStorage.setItem('language', 'zh-cn');
      TiLocale.setLocale(TiLocale.ZH_CN);
    }
  }
}

