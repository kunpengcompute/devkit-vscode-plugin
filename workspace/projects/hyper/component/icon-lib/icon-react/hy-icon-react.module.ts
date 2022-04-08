import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyIconLibServiceModule } from '../services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HyIconStaticModule } from '../icon-static';

import { HyIconReactComponent } from './hy-icon-react.component';
import { HyReactIconsRegistryService } from '../services';
import { HyReactIcon } from '../domain';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HyIconLibServiceModule,
        HyIconStaticModule
    ],
    declarations: [
        HyIconReactComponent
    ],
    exports: [
        HyIconReactComponent
    ]
})
export class HyIconReactModule {

    constructor(
        private reactRegistryService: HyReactIconsRegistryService,
    ) { }

    register(icons: HyReactIcon[]) {
        this.reactRegistryService.registerIcons(icons);
    }
}
