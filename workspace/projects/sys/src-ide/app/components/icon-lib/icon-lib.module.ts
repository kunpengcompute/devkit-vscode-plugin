import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconStaticComponent } from './icon-static/icon-static.component';
import { IconReactComponent } from './icon-react/icon-react.component';
import { IconsRegistryService } from './services/icons-registry.service';

import {
  sortClick,
  sortDisabled,
  sortHover,
  sortNormal,
} from './regedit/memory-diagnosis/sort.regedit';
import {
  allMemoryLeakClick,
  allMemoryLeakDisabled,
  allMemoryLeakHover,
  allMemoryLeakNormal,
} from './regedit/memory-diagnosis/all-memory-leak.regedit';
import {
  selfMemoryLeakClick,
  selfMemoryLeakDisabled,
  selfMemoryLeakHover,
  selfMemoryLeakNormal,
} from './regedit/memory-diagnosis/self-memory-leak.regedit';
import {
  arrowDownDoubleClick,
  arrowDownDoubleDisabled,
  arrowDownDoubleHover,
  arrowDownDoubleNormal,
} from './regedit/memory-diagnosis/arrow-down-double.regedit';
import {
  codeViewClick,
  codeViewDisabled,
  codeViewHover,
  codeViewNormal,
} from './regedit/memory-diagnosis/exception-code.regedit';
import {
  codeViewSelectedClick,
  codeViewSelectedDisabled,
  codeViewSelectedHover,
  codeViewSelectedNormal,
} from './regedit/memory-diagnosis/exception-code-select.regedit';
import {
  chartViewClick,
  chartViewDisabled,
  chartViewHover,
  chartViewNormal,
} from './regedit/micarch/chartView.regedit';
import {
  chartViewDarkClick,
  chartViewDarkDisabled,
  chartViewDarkHover,
  chartViewDarkNormal,
} from './regedit/micarch/chartViewDark.regedit';
import {
  chartViewSelectedClick,
  chartViewSelectedDisabled,
  chartViewSelectedHover,
  chartViewSelectedNormal,
} from './regedit/micarch/chartViewSelected.regedit';
import {
  chartViewSelectedDarkClick,
  chartViewSelectedDarkDisabled,
  chartViewSelectedDarkHover,
  chartViewSelectedDarkNormal,
} from './regedit/micarch/chartViewSelectedDark.regedit';
import {
  tableViewClick,
  tableViewDisabled,
  tableViewHover,
  tableViewNormal,
} from './regedit/micarch/tableView.regedit';
import {
  tableViewDarkClick,
  tableViewDarkDisabled,
  tableViewDarkHover,
  tableViewDarkNormal,
} from './regedit/micarch/tableViewDark.regedit';
import {
  tableViewSelectedClick,
  tableViewSelectedDisabled,
  tableViewSelectedHover,
  tableViewSelectedNormal,
} from './regedit/micarch/tableViewSelected.regedit';
import {
  tableViewSelectedDarkClick,
  tableViewSelectedDarkDisabled,
  tableViewSelectedDarkHover,
  tableViewSelectedDarkNormal,
} from './regedit/micarch/tableViewSelectedDark.regedit';
import {
  filterClick,
  filterDisabled,
  filterHover,
  filterNormal,
} from './regedit/systab-detail/filter.regedit';
import {
  filterDarkClick,
  filterDarkDisabled,
  filterDarkHover,
  filterDarkNormal,
} from './regedit/systab-detail/filterDark.regedit';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [IconStaticComponent, IconReactComponent],
  declarations: [IconStaticComponent, IconReactComponent],
})
export class IconLibModule {
  constructor(private iconsRegistryService: IconsRegistryService) {
    this.iconsRegistryService.registerIcons([
      filterClick, filterDisabled, filterHover, filterNormal,
      filterDarkClick, filterDarkDisabled, filterDarkHover, filterDarkNormal,
      sortClick, sortDisabled, sortHover, sortNormal,
      allMemoryLeakClick, allMemoryLeakDisabled, allMemoryLeakHover, allMemoryLeakNormal,
      selfMemoryLeakClick, selfMemoryLeakDisabled, selfMemoryLeakHover, selfMemoryLeakNormal,
      arrowDownDoubleClick, arrowDownDoubleDisabled, arrowDownDoubleHover, arrowDownDoubleNormal,
      codeViewClick, codeViewDisabled, codeViewHover, codeViewNormal,
      codeViewSelectedClick, codeViewSelectedDisabled, codeViewSelectedHover, codeViewSelectedNormal,
      chartViewClick, chartViewDisabled, chartViewHover, chartViewNormal,
      chartViewDarkClick, chartViewDarkDisabled, chartViewDarkHover, chartViewDarkNormal,
      chartViewSelectedClick, chartViewSelectedDisabled, chartViewSelectedHover,
      chartViewSelectedNormal,
      chartViewSelectedDarkClick, chartViewSelectedDarkDisabled, chartViewSelectedDarkHover,
      chartViewSelectedDarkNormal, tableViewClick, tableViewDisabled, tableViewHover, tableViewNormal,
      tableViewDarkClick, tableViewDarkDisabled, tableViewDarkHover, tableViewDarkNormal,
      tableViewSelectedClick, tableViewSelectedDisabled, tableViewSelectedHover, tableViewSelectedNormal,
      tableViewSelectedDarkClick, tableViewSelectedDarkDisabled, tableViewSelectedDarkHover,
      tableViewSelectedDarkNormal,
    ]);
  }
}
