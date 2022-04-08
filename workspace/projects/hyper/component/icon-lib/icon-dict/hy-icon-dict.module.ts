import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HyIconLibServiceModule } from '../services';
import { HyIconStaticModule } from '../icon-static';
import { HyIconReactModule } from '../icon-react';

import { HyIconDictComponent } from './hy-icon-dict.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HyIconLibServiceModule,
        HyIconStaticModule,
        HyIconReactModule
    ],
    declarations: [
        HyIconDictComponent
    ],
    exports: [
        HyIconDictComponent
    ]
})
export class HyIconDictModule {

    constructor() { }
}
