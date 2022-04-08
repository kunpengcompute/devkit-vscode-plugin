import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconStaticComponent } from './icon-static/icon-static.component';
import { IconReactComponent } from './icon-react/icon-react.component';
import { IconsRegistryService } from './services/icons-registry.service';

import {
  deleteProjectClick, deleteProjectDisabled, deleteProjectHover,
  deleteProjectNormal
} from './regedit/project-management/deleteProject.regedit';
import {
  uploadHistoryClick, uploadHistoryDisabled, uploadHistoryHover,
  uploadHistoryNormal
} from './regedit/project-management/uploadHistory.regedit';
import { prevClick, prevDisabled, prevHover, prevNormal } from './regedit/project-management/prev.regedit';
import { nextClick, nextDisabled, nextHover, nextNormal } from './regedit/project-management/next.regedit';

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
      deleteProjectClick, deleteProjectDisabled, deleteProjectHover, deleteProjectNormal,
      uploadHistoryClick, uploadHistoryDisabled, uploadHistoryHover, uploadHistoryNormal,
      prevClick, prevDisabled, prevHover, prevNormal,
      nextClick, nextDisabled, nextHover, nextNormal,
    ]);
  }
}
