import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';       // 表单
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';         // 解决打包后刷新404问题


import { HttpClient } from '@angular/common/http'; // 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';   // 国际化
import { TranslateService } from '@ngx-translate/core'; // 国际化


import { ConfigComponent } from './config/config.component';
import { InstallComponent } from './install/install.component';
import { FreeRemoteEnvironmentComponent } from './free-remote-environment/free-remote-environment.component';
import { UnInstallComponent } from './uninstall/uninstall.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';

import { LoadingComponent } from './loading/loading.component';
import { BannerComponent } from './banner/banner.component';
import { MessageboxComponent } from './messagebox/messagebox.component';


import { I18nService } from './service/i18n.service';

import { HyLocale, HyLocaleModule, HyThemeServiceModule } from 'hyper';
import { NotificationBoxComponent } from './notification-box/notification-box.component';
import { NotificationWithActionComponent } from './notification-with-action/notification-with-action.component';

// ZH表示界面语言为中文
const LANGUAGE_TYPE_ZH = 0;

@NgModule({
    declarations: [
        AppComponent,
        ConfigComponent,
        InstallComponent,
        FreeRemoteEnvironmentComponent,
        UnInstallComponent,
        UpgradeComponent,
        ErrorInstructionComponent,
        BannerComponent,
        MessageboxComponent,
        LoadingComponent,
        NotificationBoxComponent,
        NotificationWithActionComponent
    ],
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient) => {
                },
                deps: [HttpClient]
            }
        }),
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule, ReactiveFormsModule,     // ng表单模块
        HyLocaleModule,
        HyThemeServiceModule
    ],
    providers: [
        // 解决打包后刷新404问题
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        // tiny的服务
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(public translate: TranslateService) {

        // 初始化tiny 语言
        const lang = I18nService.getLang();
        if (lang === LANGUAGE_TYPE_ZH) {
            HyLocale.setLocale(HyLocale.ZH_CN);
        } else {
            HyLocale.setLocale(HyLocale.EN_US);
        }
    }
}

