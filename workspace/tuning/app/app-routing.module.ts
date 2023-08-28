import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigComponent } from './config/config.component';
import { InstallComponent } from './install/install.component';
import { FreeRemoteEnvironmentComponent } from './free-remote-environment/free-remote-environment.component';
import { UnInstallComponent } from './uninstall/uninstall.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { GuideComponent } from './guide/guide.component';
import { ErrorInstructionComponent } from './error-instruction/error-instruction.component';

import { VscodeAuthGuard } from './service/guard';

const routes: Routes = [
    { path: 'config', component: ConfigComponent, canActivate: [VscodeAuthGuard] },
    { path: 'install', component: InstallComponent, canActivate: [VscodeAuthGuard] },
    { path: 'freeTrialProcessEnvironment', component: FreeRemoteEnvironmentComponent, canActivate: [VscodeAuthGuard] },
    { path: 'upgrade', component: UpgradeComponent, canActivate: [VscodeAuthGuard] },
    { path: 'uninstall', component: UnInstallComponent, canActivate: [VscodeAuthGuard] },
    { path: 'guide', component: GuideComponent, canActivate: [VscodeAuthGuard] },
    { path: 'errorInstruction', component: ErrorInstructionComponent, canActivate: [VscodeAuthGuard] }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
