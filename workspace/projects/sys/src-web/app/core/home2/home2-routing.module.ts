import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Home2Component } from './home2.component';

const routes: Routes = [
    {
        path: '',
        component: Home2Component,
        children: [
            {
                path: '',
                loadChildren: () => import('./main-content/main-content.module').then(m => m.MainContentModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class Home2RoutingModule { }
