import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from 'projects/sys/src-web/app/guard/login.guard';
import { environment } from 'projects/sys/src-web/environments/environment';

const routes: Routes = [
    {
        path: 'home',
        loadChildren: () => import('./home2/home2.module').then(m => m.Home2Module),
        canActivate: [LoginGuard]
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
        canActivate: [LoginGuard]
    },
    {
        path: 'configuration/:item',
        loadChildren: () => import('projects/sys/src-web/app/sys-setting/sys-setting.module')
            .then(m => m.SysSettingModule),
        canActivate: [LoginGuard]
    },
    {
        path: '',
        loadChildren: () => import('./header/header.module').then(m => m.HeaderModule),
        canActivate: [LoginGuard]
    },
    {
        path: '**',
        redirectTo: 'home',
        canActivate: [LoginGuard]
    },
];

if (!environment.production) {
    routes.unshift({
        path: 'login',
        loadChildren: () => import('projects/sys/src-web/app/login/login.module').then(m => m.LoginModule)
    });
}

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class CoreRoutingModule { }
