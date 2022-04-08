import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyIconLibServiceModule } from '../services';
import { HyIconStaticComponent } from './hy-icon-static.component';
import { HyStaticIconsRegistryService } from '../services';
import { HyStaticIcon } from '../domain';

@NgModule({
    imports: [
        CommonModule,
        HyIconLibServiceModule
    ],
    declarations: [
        HyIconStaticComponent
    ],
    exports: [
        HyIconStaticComponent
    ]
})
export class HyIconStaticModule {

    constructor(
        private staticRegistryService: HyStaticIconsRegistryService
    ) { }

    register(icons: HyStaticIcon[]) {
        this.staticRegistryService.registerIcons(icons);
    }
}
