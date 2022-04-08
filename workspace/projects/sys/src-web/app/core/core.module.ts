import { NgModule, Optional, SkipSelf } from '@angular/core';

import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';
import { CoreRoutingModule } from './core-routing.module';
import { HeaderModule } from './header/header.module';
import { Home2Module } from './home2/home2.module';
import { TaskListModule } from './task-list/task-list.module';
import { MemInfoModule } from './mem-info/mem-info.module';

import { AppComponent } from './container/app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CoreRoutingModule,
        HeaderModule,
        Home2Module,
        TaskListModule,
        SharedModule,
        MemInfoModule
    ],
    exports: [
        HeaderModule,
        TaskListModule,
        AppComponent
    ],
})
export class CoreModule {
    constructor(
        @Optional() @SkipSelf() parentModule: CoreModule,
    ) {
        if (parentModule) {
            throw new Error('CoreModule 已经装载，请仅在 AppModule 中引入该模块。');
        }
    }
}
