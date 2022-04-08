import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NodeManagementComponent } from './node-management.component';

const routes: Routes = [
    {
        path: '',
        component: NodeManagementComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NodeManagementRoutingModule { }
