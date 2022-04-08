import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { NewHeaderComponent } from './new-header.component';
import { NewHeaderRoutingModule } from './new-header-routing.module';
import { DictionaryComponent } from '../../components/dictionary/dictionary.component';
import { HeaderAboutComponent } from '../../components/header-about/header-about.component';
import { HeaderCertComponent } from '../../components/header-cert/header-cert.component';
import { InfoModalComponent } from '../../components/info-modal/info-modal.component';
import { LogComponent } from '../../components/log/log.component';
import { LogoutComponent } from '../../components/logout/logout.component';
import { ModifypwdComponent } from '../../components/modifypwd/modifypwd.component';
import { SettingComponent } from '../../components/setting/setting.component';
import { SettingItemComponent } from '../../components/setting/setting-item/setting-item.component';
import { StatementComponent } from '../../components/statement/statement.component';
import { ThresholdComponent } from '../../components/threshold/threshold.component';
import { UserManageComponent } from '../../components/user-manage/user-manage.component';
import { WebCertComponent } from '../../components/web-cert/web-cert.component';
import { WorkKeyComponent } from '../../components/work-key/work-key.component';

@NgModule({
  declarations: [
    DictionaryComponent, HeaderAboutComponent,
    HeaderCertComponent, InfoModalComponent, LogComponent, LogoutComponent, ModifypwdComponent,
    SettingComponent, SettingItemComponent, StatementComponent, ThresholdComponent,
    UserManageComponent, WebCertComponent, WorkKeyComponent, NewHeaderComponent
  ],
  imports: [
    NewHeaderRoutingModule,
    SharedModule
  ],
  exports: [
    NewHeaderComponent
  ]
})
export class NewHeaderModule { }
