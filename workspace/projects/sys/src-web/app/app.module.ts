import { NgModule, ValueProvider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { LoginModule } from './login/login.module';
import { Injector } from '@angular/core';
import { setAppInjector } from './app-injector';
import { HashLocationStrategy, LocationStrategy } from '@angular/common'; // 解决打包后刷新404问题
import { TiLocale } from '@cloud/tiny3';
import { AppReuseStrategy } from './service/appReuseStrategy.service'; // 缓存路由
import { RouteReuseStrategy } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import { HyThemeServiceModule, HyThemeService, HyLocale } from 'hyper';
import { SysLocale } from 'sys/locale/sys-locale';

import { ComModule } from 'sys/src-com/app/com.module';
import { MyHttp, WebviewPanel, MyTip, DownloadFile } from 'sys/model';
import { WebviewPanelService } from './core/home2/service/webview-panel.service';
import { HttpService, MytipService } from './service';

import { AppComponent } from './core/container/app.component';
import { DownloadFileService } from './service/download-file.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    ComModule,
    CoreModule,
    LoginModule,
    HyThemeServiceModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }, // 解决打包后刷新404问题
    { provide: RouteReuseStrategy, useClass: AppReuseStrategy }, // 缓存路由
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private injector: Injector,
    private comModule: ComModule,
    private httpServe: HttpService,
    private hyThemeServe: HyThemeService,
    private tipServe: MytipService,
    private panelServe: WebviewPanelService,
    private downloadServe: DownloadFileService,
  ) {
    setAppInjector(this.injector);

    // 注入三端差异的实现
    const providers: ValueProvider[] = [
      { provide: MyHttp, useValue: this.httpServe },
      { provide: WebviewPanel, useValue: this.panelServe },
      { provide: MyTip, useValue: this.tipServe },
      { provide: DownloadFile, useValue: this.downloadServe }
    ];
    this.comModule.injectProvider(providers);

    // 设置默认主题
    this.hyThemeServe.toLight();

    // 设置本计划标识
    switch (sessionStorage.getItem('language')) {
      case 'en-us':
        TiLocale.setLocale(TiLocale.EN_US);
        SysLocale.setLocale(SysLocale.EN_US);
        HyLocale.setLocale(HyLocale.EN_US);
        break;
      case 'zh-cn':
        TiLocale.setLocale(TiLocale.ZH_CN);
        SysLocale.setLocale(SysLocale.ZH_CN);
        HyLocale.setLocale(HyLocale.ZH_CN);
        break;
      default:
        sessionStorage.setItem('language', 'zh-cn');
    }
  }
}
