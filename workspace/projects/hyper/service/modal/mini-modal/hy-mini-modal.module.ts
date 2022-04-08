import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiModalModule, TiButtonModule } from '@cloud/tiny3';
import { HyIconStaticModule } from '../../../component/icon-lib';
import { HyLocaleModule } from '../../../locale';

import { MiniModalComponent } from './mini-modal.component';

import {
  successIconLight, warnIconLight,
  errorIconLight, infoIconLight
} from './modal.static.regedit';

const TinyModule = [TiModalModule, TiButtonModule];

@NgModule({
  declarations: [MiniModalComponent],
  imports: [
    CommonModule, HyIconStaticModule, HyLocaleModule,
    ...TinyModule
  ]
})
export class HyMiniModalModule {
  constructor(
    private iconStaticModule: HyIconStaticModule
  ) {
    this.iconStaticModule.register([
      successIconLight, warnIconLight,
      errorIconLight, infoIconLight,
    ]);
  }
}
