import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';       // 表单
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';         // 解决打包后刷新404问题

import {
  TiButtonModule, TiSliderModule, TiRadioModule, TiLocale, TiAlertModule, TiMessageModule,
  TiTreeModule, TiLeftmenuModule, TiOverflowModule, TiTableModule, TiPaginationModule, TiIconModule,
  TiCheckgroupModule
} from '@cloud/tiny3';
import {
  TiValidationModule, TiFormfieldModule, TiTextModule, TiSelectModule, TiSpinnerModule, TiMenuModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiProgressbarModule
} from '@cloud/tiny3';

import { TiCheckboxModule } from '@cloud/tiny3';
import { TiSearchboxModule, TiSwitchModule, TiTabModule, TiUploadModule } from '@cloud/tiny3';

import { HttpClient } from '@angular/common/http'; // 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';   // 国际化
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; // 国际化
import { TranslateService } from '@ngx-translate/core'; // 国际化
import { AppReuseStrategy } from './service/appReuseStrategy.service';   // 缓存路由
import { RouteReuseStrategy } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MaskComponent } from './mask/mask.component';

import { LoginComponent } from './login/login.component';

import { ModalComponent } from './components/modal/modal.component';


import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { WebcertficateComponent } from './header/header-webCertFicate/header-webCertFicate.component';
import { ModalHeaderComponent } from './components/modal-header/modal-header.component';
import { ModifyPwdComponent } from './components/modify-pwd/modify-pwd.component';
import { PopMaskComponent } from './components/pop-mask/pop-mask.component';
import { LogManageComponent } from './header/log-manage/log-manage.component';
import { WeakPwdComponent } from './header/weak-pwd/weak-pwd.component';
import { HeaderSystemSettingComponent } from './header/header-system-setting/header-system-setting.component';
import { SysSettingItemComponent } from './header/header-system-setting/components/sys-setting-item/sys-setting-item.component';
import { SysSettingItemSelectComponent } from './header/header-system-setting/components/sys-setting-item-select/sys-setting-item-select.component';
import { UserManagementComponent } from './header/user-management/user-management.component';
import { LeftMenuConfigComponent } from './header/left-menu-config/left-menu-config.component';
import { LogoutComponent } from './header/logout/logout.component';
import { CommonOperateLogComponent } from './header/log-manage/components/common-operate-log/common-operate-log.component';
import { WorkLogComponent } from './header/log-manage/components/work-log/work-log.component';
import { DisableCtrlDirective } from './directive/disable-ctrl.directive';
import { LoadingDirective } from 'projects/user/src/app/directive/loading/loading.directive';
import { LoadingComponent } from 'projects/user/src/app/directive/loading/component/loading/loading.component';
import { TimeProcessPipe } from './pipes/time-process.pipe';
import { StaticTipForIEComponent } from './components/static-tip-for-ie/static-tip-for-ie.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AdviceFeedbackIconComponent } from './components/advice-feedback-icon/advice-feedback-icon.component';
import { AdviceErrorAlertComponent } from './components/advice-error-alert/advice-error-alert.component';
import { PopUpDialogComponent } from './home/pop-up-dialog/pop-up-dialog.component';

@NgModule({
  declarations: [

    AppComponent,

    HeaderComponent,

    MaskComponent,
    LoginComponent,
    ModalComponent,

    HomeComponent,
    AboutComponent,
    WebcertficateComponent,
    ModalHeaderComponent,
    ModifyPwdComponent,
    PopMaskComponent,
    LogManageComponent,
    WeakPwdComponent,
    HeaderSystemSettingComponent,
    SysSettingItemComponent,
    SysSettingItemSelectComponent,
    UserManagementComponent,
    LeftMenuConfigComponent,
    LogoutComponent,
    CommonOperateLogComponent,
    WorkLogComponent,
    DisableCtrlDirective,
    LoadingDirective,
    LoadingComponent,
    TimeProcessPipe,
    StaticTipForIEComponent,
    ChangePasswordComponent,
    AdviceFeedbackIconComponent,
    AdviceErrorAlertComponent,
    PopUpDialogComponent
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
    TiAlertModule,
    BrowserAnimationsModule,
    TiMessageModule,
    TiTreeModule,
    TiLeftmenuModule,
    TiValidationModule,
    TiFormfieldModule,
    TiTextModule,
    TiSelectModule,
    TiOverflowModule,                 // 表格组件
    TiTableModule,                     // 表格组件
    TiPaginationModule,               // 分页组件
    FormsModule, ReactiveFormsModule,     // ng表单模块
    TiIconModule,
    TiMenuModule,
    TiActionmenuModule,
    TiButtonModule,
    TiSearchboxModule,
    TiUploadModule,
    TiSpinnerModule,
    TiSwitchModule,
    TiCheckboxModule,
    TiTabModule,
    TiModalModule,
    TiTipModule,
    TiProgressbarModule,
    TiCheckgroupModule,
    TiRadioModule,
    TiSliderModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },    // 解决打包后刷新404问题
    { provide: RouteReuseStrategy, useClass: AppReuseStrategy },        // 缓存路由
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LoadingComponent
  ]
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

