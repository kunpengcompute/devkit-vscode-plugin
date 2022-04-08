import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TiPopupModule, TiTipModule } from '@cloud/tiny3';
import { HyLocaleModule } from '../../locale';
import { HyThemeContentModule, HyThemeServiceModule } from '../../theme';
import {
  HyIconStaticModule,
  HyIconReactModule,
} from '../../component/icon-lib';
import {
  HyElementMatchFeature,
  HyBacktopComponent,
} from './hy-backtop.component';

import {
  toTopNormalLight,
  toTopHoverLight,
  toTopActiveLight,
  toTopNormalDark,
  toTopHoverDark,
  toTopActiveDark,
} from './icon-regedit/backtop.static.regedit';
import {
  toTopReactLight,
  toTopReactDark,
} from './icon-regedit/backtop.react.regedit';

@NgModule({
  imports: [
    CommonModule,
    TiPopupModule,
    TiTipModule,
    HyLocaleModule,
    HyThemeContentModule,
    HyThemeServiceModule,
    HyIconStaticModule,
    HyIconReactModule,
  ],
  exports: [HyBacktopComponent],
  declarations: [HyBacktopComponent],
})
export class HyBacktopModule {
  constructor(
    private iconStaticModule: HyIconStaticModule,
    private iconReactModule: HyIconReactModule
  ) {
    this.iconStaticModule.register([
      toTopNormalLight,
      toTopHoverLight,
      toTopActiveLight,
      toTopNormalDark,
      toTopHoverDark,
      toTopActiveDark,
    ]);
    this.iconReactModule.register([toTopReactLight, toTopReactDark]);
  }
}
export { HyElementMatchFeature, HyBacktopComponent };
