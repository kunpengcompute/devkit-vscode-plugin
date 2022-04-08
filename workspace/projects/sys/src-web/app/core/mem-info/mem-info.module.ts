import { NgModule } from '@angular/core';
import { SharedModule } from 'projects/sys/src-web/app/shared/shard.module';

import { MemInfoComponent } from './mem-info.component';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        MemInfoComponent
    ],
    exports: [
        MemInfoComponent
    ]
})
export class MemInfoModule {
    constructor() {}
}
