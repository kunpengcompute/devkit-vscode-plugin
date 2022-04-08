import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { NodeManagementRoutingModule } from './node-managment-routing.module';
import { SysSettingModule } from '../../../sys-setting/sys-setting.module';
import { NodeManagementComponent } from './node-management.component';
import { NodeManagementModule as NodeManagementModuleCom } from 'sys/src-com/app/node-management/node-management.module';

@NgModule({
  imports: [
    SharedModule,
    NodeManagementRoutingModule,
    SysSettingModule,
    NodeManagementModuleCom,
  ],
  declarations: [NodeManagementComponent],
})
export class NodeManagementModule {
  constructor() {}
}
