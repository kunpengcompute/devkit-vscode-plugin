import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { MissionCreateModule } from 'projects/sys/src-web/app/mission-create/mission-create.module';
import { SysSettingRoutingModule } from './sys-setting-routing.module';

import { HeaderCertificateAgentComponent } from './header-certificate-agent/header-certificate-agent.component';
import { HeaderSystemSettingComponent } from './header-system-setting/header-system-setting.component';
import { SysSettingItemComponent } from './header-system-setting/component/sys-setting-item/sys-setting-item.component';
import { SysSettingItemSelectComponent } from './header-system-setting/component/sys-setting-item-select/sys-setting-item-select.component';
import { WeakPwdComponent } from './weak-pwd/weak-pwd.component';
import { LogManageComponent } from './log-manage/log-manage.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SysSettingItemTextareaComponent } from './header-system-setting/component/sys-setting-item-textarea/sys-setting-item-textarea.component';
import { ImportAndExportTaskListComponent } from './import-and-export-task-list/import-and-export-task-list.component';
import { SysOperateLogComponent } from './log-manage/components/sys-operate-log/sys-operate-log.component';
import { CommonOperateLogComponent } from './log-manage/components/common-operate-log/common-operate-log.component';
import { HeaderDownloadLogComponent } from './component/header-download-log/header-download-log.component';
import { LeftMenuConfigComponent } from './left-menu-config/left-menu-config.component';

@NgModule({
    imports: [
        SharedModule,
        MissionCreateModule,
        SysSettingRoutingModule
    ],
    declarations: [
        HeaderCertificateAgentComponent,
        HeaderSystemSettingComponent,
        SysSettingItemComponent,
        SysSettingItemSelectComponent,
        WeakPwdComponent,
        LogManageComponent,
        UserManagementComponent,
        SysSettingItemTextareaComponent,
        ImportAndExportTaskListComponent,
        SysOperateLogComponent,
        CommonOperateLogComponent,
        HeaderDownloadLogComponent,
        LeftMenuConfigComponent
    ],
    exports: [
        HeaderCertificateAgentComponent,
        SysSettingItemComponent,
    ]
})
export class SysSettingModule {
    constructor() {}
}
