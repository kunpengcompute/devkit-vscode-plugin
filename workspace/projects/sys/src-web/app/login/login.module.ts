import { NgModule, Optional, SkipSelf } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { LoginRoutingModule } from './login-routing.module';

import { LoginComponent } from './login.component';

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        SharedModule,
        LoginRoutingModule
    ]
})
export class LoginModule {
    constructor() {}
}
