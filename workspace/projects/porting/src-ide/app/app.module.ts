import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';       // 表单
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';         // 解决打包后刷新404问题

import {
    TiButtonModule, TiLocale, TiAlertModule, TiMessageModule, TiTreeModule, TiRadioModule,
    TiLeftmenuModule, TiOverflowModule, TiTableModule, TiPaginationModule, TiIconModule
} from '@cloud/tiny3';
import {
    TiValidationModule, TiFormfieldModule, TiTextModule,
    TiSelectModule, TiSpinnerModule, TiMenuModule, TiCheckgroupModule,
    TiActionmenuModule, TiModalModule, TiTipModule, TiUploadModule,
    TiTipServiceModule
} from '@cloud/tiny3';

import { TiCheckboxModule } from '@cloud/tiny3';
import { TiSearchboxModule, TiSwitchModule, TiTabModule } from '@cloud/tiny3';

import { HttpClient } from '@angular/common/http'; // 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';   // 国际化
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; // 国际化
import { TranslateService } from '@ngx-translate/core'; // 国际化
import { MaskComponent } from './mask/mask.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ModalComponent } from './components/modal/modal.component';
import { ModifyPwdComponent } from './modify-pwd/modify-pwd.component';
import { FirstLoginComponent } from './first-login/first-login.component';
import { SuggestionComponent } from './suggestion/suggestion.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { ReportDepDetailComponent } from './report-depdetail/report-depdetail.component';
import { MigrationCenterComponent } from './migration-center/migration-center.component';
import { AnalysisCenterComponent } from './analysis-center/analysis-center.component';
import { MigrationAppraiseComponent } from './migration-appraise/migration-appraise.component';
import { MigrationDetailComponent } from './migration-detail/migration-detail.component';
import { MemoryBarrierAnalysisComponent } from './memory-barrier-analysis/memory-barrier-analysis.component';
import { AboutMaskComponent } from './about-mask/about-mask.component';
import { UploadProgressComponent } from './upload-progress/upload-progress.component';
import { ZipProgressComponent } from './zip-progress/zip-progress.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { FileLockedComponent } from './file-locked/file-locked.component';
import { InstallComponent } from './install/install.component';
import { UnInstallComponent } from './uninstall/uninstall.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { ConfigComponent } from './config/config.component';
import { MessageboxComponent } from './messagebox/messagebox.component';
import { PortsetComponent } from './port-setting/port-setting.component';
import { BannerComponent } from './banner/banner.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';
import { PassingListManagementComponent } from './passinglist-management/passinglist-management.component';
import { WebpackSituationComponent } from './webpack-situation/webpack-situation.component';
import { I18nService } from './service/i18n.service';
import { LogManagerComponent } from './log/logManager.component';
import { ByteShowComponent } from './byte-show/byte-show.component';
import { CodeMonacoShowComponent } from './byte-show/code-monaco-show/code-monaco-show.component';
import { StructAssignComponent } from './byte-show/struct-assign/struct-assign.component';
import { LogSituationComponent } from './log/log-situation/log-situation.component';
import { WebServerCertificateComponent } from './port-setting/web-server-certificate/web-server-certificate.component';
import { WeakPwdDictionaryComponent } from './port-setting/weak-pwd-dictionary/weak-pwd-dictionary.component';
import { EnhanceFunctionReportComponent } from './enhance-function-report/enhance-function-report.component';
import { AutoFixComponent } from './memory-barrier-analysis/auto-fix/auto-fix.component';
import { HistoryListComponent } from './memory-barrier-analysis/history-list/history-list.component';
import { SystemSettingComponent } from './port-setting/system-setting/system-setting.component';
import { DefaultPageComponent } from './components/default-page/default-page.component';
import { LoadingComponent } from './components/default-page/loading/loading.component';
import { ProgressComponent } from './components/progress/progress.component';
import { CommonReportDetailComponent } from './components/common-report-detail/common-report-detail.component';
import { SoftwarePackageReportComponent } from './software-package-report/software-package-report.component';
import { NestedTableComponent } from './enhance-function-report/nested-table/nested-table.component';
import { PortingPasswordComponent } from './components/porting-password/porting-password.component';
import { FreeRemoteEnvironmentComponent } from './free-remote-environment/free-remote-environment.component';
import { AboutMoreSystemComponent } from './components/about-more-system/about-more-system.component';
import { HyLocale, HyLocaleModule, HyNodataDirectiveModule, HyThemeServiceModule, HyMiniModalModule  } from 'hyper';
import { MaskDisclaimerComponent } from './mask-disclaimer/mask-disclaimer.component';
import { BcDownloadComponent } from './memory-barrier-analysis/bc-download/bc-download.component';
import { CertificateRevocationListComponent } from './port-setting/certificate-revocation-list/certificate-revocation-list.component';
import { CrlInfoComponent } from './port-setting/certificate-revocation-list/crl-info/crl-info.component';
import { AdviceLinkErrorComponent } from './advice-link-error/advice-link-error.component';
import { AdviceFeedbackIconComponent } from './advice-feedback-icon/advice-feedback-icon.component';

// ZH表示界面语言为中文
const LANGUAGE_TYPE_ZH = 0;

@NgModule({
    declarations: [
        AppComponent,
        MaskComponent,
        HomeComponent,
        LoginComponent,
        ModalComponent,
        ModifyPwdComponent,
        FirstLoginComponent,
        SuggestionComponent,
        ReportDetailComponent,
        ReportDepDetailComponent,
        WebpackSituationComponent,
        MigrationCenterComponent,
        AnalysisCenterComponent,
        MigrationDetailComponent,
        MigrationAppraiseComponent,
        MemoryBarrierAnalysisComponent,
        AboutMaskComponent,
        UploadProgressComponent,
        ZipProgressComponent,
        DisclaimerComponent,
        FileLockedComponent,
        InstallComponent,
        UnInstallComponent,
        UpgradeComponent,
        ConfigComponent,
        MessageboxComponent,
        PortsetComponent,
        BannerComponent,
        ErrorInstructionComponent,
        PassingListManagementComponent,
        LogManagerComponent,
        ByteShowComponent,
        LogSituationComponent,
        CodeMonacoShowComponent,
        StructAssignComponent,
        WebServerCertificateComponent,
        WeakPwdDictionaryComponent,
        EnhanceFunctionReportComponent,
        AutoFixComponent,
        HistoryListComponent,
        BcDownloadComponent,
        SystemSettingComponent,
        DefaultPageComponent,
        LoadingComponent,
        ProgressComponent,
        CommonReportDetailComponent,
        SoftwarePackageReportComponent,
        NestedTableComponent,
        PortingPasswordComponent,
        AboutMoreSystemComponent,
        FreeRemoteEnvironmentComponent,
        MaskDisclaimerComponent,
        CertificateRevocationListComponent,
        CrlInfoComponent,
        AdviceLinkErrorComponent,
        AdviceFeedbackIconComponent
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
        TiAlertModule,
        BrowserAnimationsModule,
        TiMessageModule,
        TiTreeModule,
        TiLeftmenuModule,
        TiValidationModule,
        TiFormfieldModule,
        TiCheckgroupModule,
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
        TiSpinnerModule,
        TiSwitchModule,
        TiCheckboxModule,
        TiTabModule,
        TiModalModule,
        TiTipModule,
        TiUploadModule,
        TiTipServiceModule,
        TiRadioModule,
        HyMiniModalModule,
        HyNodataDirectiveModule,
        HyLocaleModule,
        HyThemeServiceModule
    ],
    providers: [
        // 解决打包后刷新404问题
        { provide: LocationStrategy, useClass: PathLocationStrategy }
        // tiny的服务
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(public translate: TranslateService) {

        // 初始化tiny 语言
        const lang = I18nService.getLang();
        if (lang === LANGUAGE_TYPE_ZH) {
            TiLocale.setLocale(TiLocale.ZH_CN);
            HyLocale.setLocale(HyLocale.ZH_CN);
        } else {
            TiLocale.setLocale(TiLocale.EN_US);
            HyLocale.setLocale(HyLocale.EN_US);
        }
    }
}

