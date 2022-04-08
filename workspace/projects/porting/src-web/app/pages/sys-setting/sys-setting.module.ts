import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { SettingsRoutingModule } from './sys-settings-routing.module';

import { LayoutComponent } from './layout/layout.component';
import { NavBarComponent } from './layout/components/nav-bar/nav-bar.component';

import { CertificateComponent } from './certificate/certificate.component';
import { HistoryLabelComponent, HistoryLabelItemComponent } from './history-label';
import { LogManageComponent } from './log-manage/log-manage.component';
import { SettingLabelComponent, SettingLabelItemComponent } from './setting-label';
import { SoftwarePortTempComponent, SoftwarePortTempItemComponent } from './software-port-temp';
import { SystemSettingComponent, SysSettingItemComponent, SysSettingItemSelectComponent } from './system-setting';
import { UserComponent } from './user/user.component';
import { WeakPwdComponent } from './weak-pwd/weak-pwd.component';
import { WhitelistComponent, WhitelistItemComponent } from './whitelist';
import { CertificateRevocationListComponent } from './certificate-revocation-list/certificate-revocation-list.component';
import { CrlInfoComponent } from './certificate-revocation-list/crl-info/crl-info.component';
import { CrlUploadProgressComponent } from './certificate-revocation-list/crl-upload-progress/crl-upload-progress.component';

@NgModule({
  declarations: [
    UserComponent, LayoutComponent, NavBarComponent,
    CertificateComponent, HistoryLabelComponent, HistoryLabelItemComponent,
    LogManageComponent, SettingLabelComponent, SettingLabelItemComponent,
    SoftwarePortTempComponent, SoftwarePortTempItemComponent,
    SystemSettingComponent, SysSettingItemComponent, SysSettingItemSelectComponent,
    WeakPwdComponent, WhitelistComponent, WhitelistItemComponent, CertificateRevocationListComponent, CrlInfoComponent,
    CrlUploadProgressComponent
  ],
  imports: [
    SharedModule,
    SettingsRoutingModule
  ]
})
export class SysSettingModule { }
