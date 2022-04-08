import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconStaticComponent } from './icon-static/icon-static.component';
import { IconReactComponent } from './icon-react/icon-react.component';
import { IconsRegistryService } from './services/icons-registry.service';

import {
  expandDownNormal, expandDownHover, expandDownActive, expandDownDisabled
} from './regedit/expand-down.regedit';
import {
  expandDownDarkNormal, expandDownDarkHover, expandDownDarkActive, expandDownDarkDisabled
} from './regedit/expand-down-dark.regedit';
import {
  expandUpNormal, expandUpHover, expandUpActive, expandUpDisabled
} from './regedit/expand-up.regedit';
import {
  expandUpDarkNormal, expandUpDarkHover, expandUpDarkActive, expandUpDarkDisabled
} from './regedit/expand-up-dark.regedit';
import {
  fullScreenActiveDark, fullScreenActiveLight, fullScreenHoverDark,
  fullScreenHoverLight, fullScreenNormalDark, fullScreenNormalLight
} from './regedit/full-screen.regedit';
import {
  exitFullActiveDark, exitFullActiveLight, exitFullHoverDark,
  exitFullHoverLight, exitFullNormalDark, exitFullNormalLight
} from './regedit/exit-full.regedit';

import {
  zoomInActiveDark, zoomInActiveLight, zoomInHoverDark,
  zoomInHoverLight, zoomInNormalDark, zoomInNormalLight
} from './regedit/zoom-in.regedit';

import {
  zoomOutActiveDark, zoomOutActiveLight, zoomOutHoverDark,
  zoomOutHoverLight, zoomOutNormalDark, zoomOutNormalLight
} from './regedit/zoom-out.regedit';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    IconStaticComponent,
    IconReactComponent
  ],
  declarations: [
    IconStaticComponent,
    IconReactComponent,
  ],
})
export class IconLibModule {
  constructor(
    private iconsRegistryService: IconsRegistryService,
  ) {
    this.iconsRegistryService.registerIcons([
      expandDownNormal, expandDownHover, expandDownActive, expandDownDisabled,
      expandDownDarkNormal, expandDownDarkHover, expandDownDarkActive, expandDownDarkDisabled,
      expandUpNormal, expandUpHover, expandUpActive, expandUpDisabled,
      expandUpDarkNormal, expandUpDarkHover, expandUpDarkActive, expandUpDarkDisabled,
      fullScreenActiveDark, fullScreenActiveLight, fullScreenHoverDark,
      fullScreenHoverLight, fullScreenNormalDark, fullScreenNormalLight,
      exitFullActiveDark, exitFullActiveLight, exitFullHoverDark,
      exitFullHoverLight, exitFullNormalDark, exitFullNormalLight,
      zoomInActiveDark, zoomInActiveLight, zoomInHoverDark,
      zoomInHoverLight, zoomInNormalDark, zoomInNormalLight,
      zoomOutActiveDark, zoomOutActiveLight, zoomOutHoverDark,
      zoomOutHoverLight, zoomOutNormalDark, zoomOutNormalLight
    ]);
  }
}
