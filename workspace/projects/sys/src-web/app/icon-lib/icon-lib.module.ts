import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconStaticComponent } from './icon-static/icon-static.component';
import { IconReactComponent } from './icon-react/icon-react.component';
import { IconsRegistryService } from './services/icons-registry.service';

import {
  addProjectClick, addProjectDisabled, addProjectHover, addProjectNormal
} from './regedit/project-management/addProject.regedit';
import {
  refreshProjectClick, refreshProjectDisabled, refreshProjectHover, refreshProjectNormal
} from './regedit/project-management/refreshProject.regedit';
import {
  importTaskClick, importTaskDisabled, importTaskHover, importTaskNormal
} from './regedit/project-management/importTask.regedit';
import {
  exportTaskClick, exportTaskDisabled, exportTaskHover, exportTaskNormal
} from './regedit/project-management/exportTask.regedit';
import {
  createTaskClick, createTaskDisabled, createTaskHover, createTaskNormal
} from './regedit/project-management/createTask.regedit';
import {
  deleteProjectClick, deleteProjectDisabled, deleteProjectHover, deleteProjectNormal
} from './regedit/project-management/deleteProject.regedit';
import {
  editProjectClick, editProjectDisabled, editProjectHover, editProjectNormal
} from './regedit/project-management/editProject.regedit';
import {
  restartTaskClick, restartTaskDisabled, restartTaskHover, restartTaskNormal
} from './regedit/project-management/restartTask.regedit';
import {
  startTaskClick, startTaskDisabled, startTaskHover, startTaskNormal
} from './regedit/project-management/startTask.regedit';
import {
  associationNodeNormal, associationNodeHover, associationNodeActive, associationNodeDisabled
} from './regedit/project-management/associationNode.regedit';
import {
  viewTaskDetailNormal, viewTaskDetailHover, viewTaskDetailActive, viewTaskDetailDisabled
} from './regedit/project-management/viewTaskDetail.regedit';
import {
  reanalyzeIconNormal, reanalyzeIconHover, reanalyzeIconActive, reanalyzeIconDisabled
} from './regedit/project-management/reanalyzeIcon.regedit';
import {
  stopTaskClick, stopTaskDisabled, stopTaskHover, stopTaskNormal
} from './regedit/project-management/stopTask.regedit';
import { filterClick, filterDisabled, filterHover, filterNormal } from './regedit/systab-detail/filter.regedit';
import { moreClick, moreDisabled, moreHover, moreNormal } from './regedit/restab-detail/more.regedit';
import {
  typicalConfigClick, typicalConfigDisabled, typicalConfigHover, typicalConfigNormal
} from './regedit/systab-detail/typicalConfig.regedit';
import {
  chartViewClick, chartViewDisabled, chartViewHover, chartViewNormal
} from './regedit/micarch/chartView.regedit';
import {
  chartViewSelectedClick, chartViewSelectedDisabled, chartViewSelectedHover, chartViewSelectedNormal
} from './regedit/micarch/chartViewSelected.regedit';
import {
  tableViewClick, tableViewDisabled, tableViewHover, tableViewNormal
} from './regedit/micarch/tableView.regedit';
import {
  tableViewSelectedClick, tableViewSelectedDisabled, tableViewSelectedHover, tableViewSelectedNormal
} from './regedit/micarch/tableViewSelected.regedit';
import { applicationDisabled, applicationHover, applicationNormal } from './regedit/create-task/application.regedit';
import {
  cplusAnalysisDisabled, cplusAnalysisHover, cplusAnalysisNormal } from './regedit/create-task/cplusAnalysis.regedit';
import {
  memAccessAnalysisDisabled, memAccessAnalysisHover, memAccessAnalysisNormal
} from './regedit/create-task/memAccessAnalysis.regedit';
import {
  ioAnalysisDisabled, ioAnalysisHover, ioAnalysisNormal
} from './regedit/create-task/ioAnalysis.regedit';
import {
  lockAnalysisDisabled, lockAnalysisHover, lockAnalysisNormal
} from './regedit/create-task/lockAnalysis.regedit';
import {
  microAnalysisDisabled, microAnalysisHover, microAnalysisNormal
} from './regedit/create-task/microAnalysis.regedit';
import {
  panoramicAnalysisDisabled, panoramicAnalysisHover, panoramicAnalysisNormal
} from './regedit/create-task/panoramicAnalysis.regedit';
import {
  processAnalysisDisabled, processAnalysisHover, processAnalysisNormal
} from './regedit/create-task/processAnalysis.regedit';
import {
  resourceAnalysisDisabled, resourceAnalysisHover, resourceAnalysisNormal
} from './regedit/create-task/resourceAnalysis.regedit';
import { systemDisabled, systemHover, systemNormal } from './regedit/create-task/system.regedit';
import { hpcAnalysisDisabled, hpcAnalysisHover, hpcAnalysisNormal } from './regedit/create-task/hpcAnalysis.regedit';
import { sortClick, sortDisabled, sortHover, sortNormal } from './regedit/memory-diagnosis/sort.regedit';
import {
  allMemoryLeakClick, allMemoryLeakDisabled, allMemoryLeakHover, allMemoryLeakNormal
} from './regedit/memory-diagnosis/all-memory-leak.regedit';
import {
  selfMemoryLeakClick, selfMemoryLeakDisabled, selfMemoryLeakHover, selfMemoryLeakNormal
} from './regedit/memory-diagnosis/self-memory-leak.regedit';
import {
  arrowDownDoubleClick, arrowDownDoubleDisabled, arrowDownDoubleHover, arrowDownDoubleNormal
} from './regedit/memory-diagnosis/arrow-down-double.regedit';
import {
  codeViewClick, codeViewDisabled, codeViewHover, codeViewNormal
} from './regedit/memory-diagnosis/exception-code.regedit';
import {
  codeViewSelectedClick, codeViewSelectedDisabled, codeViewSelectedHover, codeViewSelectedNormal
} from './regedit/memory-diagnosis/exception-code-select.regedit';
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
      addProjectClick, addProjectDisabled, addProjectHover, addProjectNormal,
      refreshProjectClick, refreshProjectDisabled, refreshProjectHover, refreshProjectNormal,
      importTaskClick, importTaskDisabled, importTaskHover, importTaskNormal,
      exportTaskClick, exportTaskDisabled, exportTaskHover, exportTaskNormal,
      createTaskClick, createTaskDisabled, createTaskHover, createTaskNormal,
      deleteProjectClick, deleteProjectDisabled, deleteProjectHover, deleteProjectNormal,
      editProjectClick, editProjectDisabled, editProjectHover, editProjectNormal,
      restartTaskClick, restartTaskDisabled, restartTaskHover, restartTaskNormal,
      startTaskClick, startTaskDisabled, startTaskHover, startTaskNormal,
      associationNodeNormal, associationNodeHover, associationNodeActive, associationNodeDisabled,
      viewTaskDetailNormal, viewTaskDetailHover, viewTaskDetailActive, viewTaskDetailDisabled,
      reanalyzeIconNormal, reanalyzeIconHover, reanalyzeIconActive, reanalyzeIconDisabled,
      stopTaskClick, stopTaskDisabled, stopTaskHover, stopTaskNormal,
      moreClick, moreDisabled, moreHover, moreNormal,
      filterClick, filterDisabled, filterHover, filterNormal,
      typicalConfigClick, typicalConfigDisabled, typicalConfigHover, typicalConfigNormal,
      chartViewClick, chartViewDisabled, chartViewHover, chartViewNormal,
      chartViewSelectedClick, chartViewSelectedDisabled, chartViewSelectedHover, chartViewSelectedNormal,
      tableViewClick, tableViewDisabled, tableViewHover, tableViewNormal,
      tableViewSelectedClick, tableViewSelectedDisabled, tableViewSelectedHover, tableViewSelectedNormal,
      applicationDisabled, applicationHover, applicationNormal,
      cplusAnalysisDisabled, cplusAnalysisHover, cplusAnalysisNormal,
      memAccessAnalysisDisabled, memAccessAnalysisHover, memAccessAnalysisNormal,
      ioAnalysisDisabled, ioAnalysisHover, ioAnalysisNormal,
      lockAnalysisDisabled, lockAnalysisHover, lockAnalysisNormal,
      microAnalysisDisabled, microAnalysisHover, microAnalysisNormal,
      panoramicAnalysisDisabled, panoramicAnalysisHover, panoramicAnalysisNormal,
      processAnalysisDisabled, processAnalysisHover, processAnalysisNormal,
      resourceAnalysisDisabled, resourceAnalysisHover, resourceAnalysisNormal,
      systemDisabled, systemHover, systemNormal,
      hpcAnalysisDisabled, hpcAnalysisHover, hpcAnalysisNormal,
      sortClick, sortDisabled, sortHover, sortNormal,
      allMemoryLeakClick, allMemoryLeakDisabled, allMemoryLeakHover, allMemoryLeakNormal,
      selfMemoryLeakClick, selfMemoryLeakDisabled, selfMemoryLeakHover, selfMemoryLeakNormal,
      arrowDownDoubleClick, arrowDownDoubleDisabled, arrowDownDoubleHover, arrowDownDoubleNormal,
      codeViewClick, codeViewDisabled, codeViewHover, codeViewNormal,
      codeViewSelectedClick, codeViewSelectedDisabled, codeViewSelectedHover, codeViewSelectedNormal
    ]);
  }
}
