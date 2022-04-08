import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { MyInterceptor } from './service/http.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';         // 解决打包后刷新404问题

import { TiLocale } from '@cloud/tiny3';

import { HttpClient } from '@angular/common/http'; // 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';   // 国际化
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; // 国际化
import { TranslateService } from '@ngx-translate/core'; // 国际化
import { AppReuseStrategy } from './service/appReuseStrategy.service';   // 缓存路由
import { RouteReuseStrategy } from '@angular/router';
import { HomeComponent } from './pages/home-new/home/home.component';
import { PortingWorkloadComponent } from './pages/home-new/porting-workload/porting-workload.component';
import { MigrationCenterComponent } from './pages/home-new/migration-center/migration-center.component';
import { AnalysisCenterComponent } from './pages/home-new/analysis-center/analysis-center.component';
import { MemoryBarrierAnalysisComponent } from './pages/home-new/memory-barrier-analysis/memory-barrier-analysis.component';
import { UploadProgressComponent } from './pages/upload/upload-progress/upload-progress.component';
import { ZipProgressComponent } from './pages/upload/zip-progress/zip-progress.component';
import { CircleProgressComponent } from './pages/home-new/components/circle-progress/circle-progress.component';
import { HistoryListComponent } from './pages/home-new/memory-barrier-analysis/history-list/history-list.component';
import { AutoFixComponent } from './pages/home-new/memory-barrier-analysis/auto-fix/auto-fix.component';
import { LoginGuard } from './guard/login.guard';
import { BcUploadComponent } from './pages/home-new/memory-barrier-analysis/bc-upload/bc-upload.component';
import { CommonHistoryListComponent } from './pages/home-new/memory-barrier-analysis/history-list/common-history-list/common-history-list.component';
import { MultipleFileUploadComponent } from './pages/home-new/analysis-center/multiple-file-upload/multiple-file-upload.component';
import { EnvironmentTipComponent } from './pages/home-new/memory-barrier-analysis/environment-tip/environment-tip.component';
import { HomeNewComponent } from './pages/home-new/home-new.component';
import { LoginModule } from './pages/login/login.module';

import { HyLocale } from 'hyper';
import { BcDownloadComponent } from './pages/home-new/memory-barrier-analysis/bc-download/bc-download.component';
import { AdviceErrorAlertComponent } from './pages/header/advice-error-alert/advice-error-alert.component';
import { AdviceFeedbackIconComponent } from './pages/header/advice-feedback-icon/advice-feedback-icon.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PortingWorkloadComponent,
    MigrationCenterComponent,
    AnalysisCenterComponent,
    MemoryBarrierAnalysisComponent,
    UploadProgressComponent,
    ZipProgressComponent,
    CircleProgressComponent,
    HistoryListComponent,
    BcDownloadComponent,
    AutoFixComponent,
    BcUploadComponent,
    CommonHistoryListComponent,
    MultipleFileUploadComponent,
    EnvironmentTipComponent,
    HomeNewComponent,
    AdviceErrorAlertComponent,
    AdviceFeedbackIconComponent,
  ],
  imports: [
    CoreModule,
    LoginModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          // 如果需要使用angular内置国际化，需要配置国际化文件（json格式）
          // return new TranslateHttpLoader(http, './i18n/', '.json')
        },
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },    // 解决打包后刷新404问题
    { provide: RouteReuseStrategy, useClass: AppReuseStrategy },        // 缓存路由
    { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true },
    LoginGuard
    // tiny的服务
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public translate: TranslateService) {
    // 配置Tiny国际化资源，默认为中文
    const lang = sessionStorage.getItem('language');
    if (!lang) {
      sessionStorage.setItem('language', 'zh-cn');
      TiLocale.setLocale(TiLocale.ZH_CN);
      HyLocale.setLocale(HyLocale.ZH_CN);
    } else {
      if (lang === 'zh-cn') {
        TiLocale.setLocale(TiLocale.ZH_CN);
        HyLocale.setLocale(HyLocale.ZH_CN);
      } else {
        TiLocale.setLocale(TiLocale.EN_US);
        HyLocale.setLocale(HyLocale.EN_US);
      }
    }
  }
}

