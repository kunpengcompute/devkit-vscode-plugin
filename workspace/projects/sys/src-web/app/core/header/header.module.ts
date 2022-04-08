import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { HeaderRoutingModule } from './header-routing.module';

import { HeaderComponent } from './header.component';
import { AboutComponent } from './about/about.component';
import { LogoutComponent } from './logout/logout.component';
import { StatementComponent } from './statement/statement.component';

@NgModule({
    imports: [
        SharedModule,
        HeaderRoutingModule
    ],
    exports: [
        HeaderComponent
    ],
    declarations: [
        HeaderComponent,
        AboutComponent,
        LogoutComponent,
        StatementComponent
    ],
})
export class HeaderModule {
    constructor() {}
}
