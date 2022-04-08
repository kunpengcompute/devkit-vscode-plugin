import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeftMenuConfigComponent } from './left-menu-config/left-menu-config.component';

const routes: Routes = [
    {
        path: '',
        component: LeftMenuConfigComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SysSettingRoutingModule { }
