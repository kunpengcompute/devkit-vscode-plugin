import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'nodeManagement/:item',
        loadChildren: () => import('./node-management/node-management.module').then(m => m.NodeManagementModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HeaderRoutingModule { }
