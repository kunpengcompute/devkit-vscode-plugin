import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './guard/login.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LeftMenuConfigComponent } from './header/left-menu-config/left-menu-config.component';
const routes: Routes = [
 {path: '', component: HomeComponent, canActivate: [LoginGuard]},
 {path: 'configuration/:item', component: LeftMenuConfigComponent, canActivate: [LoginGuard]},
 {path: 'login', component: LoginComponent},
 {path: 'home', component: HomeComponent, canActivate: [LoginGuard]},
 {path: '**', redirectTo: 'home', canActivate: [LoginGuard]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
