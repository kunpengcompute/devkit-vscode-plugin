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
import { chartViewDarkClick, chartViewDarkDisabled, chartViewDarkHover, chartViewDarkNormal
 } from './regedit/micarch/chartViewDark.regedit';

// intellij图标
import { chartViewDarkIntellijClick, chartViewDarkIntellijDisabled,
  chartViewDarkIntellijHover, chartViewDarkIntellijNormal
} from './regedit/micarch/chartViewDarkIntellij.regedit';
import {
  chartViewSelectedDarkIntellijClick, chartViewSelectedDarkIntellijDisabled, chartViewSelectedDarkIntellijHover,
  chartViewSelectedDarkIntellijNormal
} from './regedit/micarch/chartViewSelectedDarkIntellij.regedit';
import {
  tableViewDarkIntellijNormal, tableViewDarkIntellijClick, tableViewDarkIntellijDisabled, tableViewDarkIntellijHover
} from './regedit/micarch/tableViewDarkIntellij.regedit';
import {
  tableViewSelectedDarkIntellijClick, tableViewSelectedDarkIntellijDisabled, tableViewSelectedDarkIntellijHover,
  tableViewSelectedDarkIntellijNormal
} from './regedit/micarch/tableViewSelectedDarkIntellij.regedit';
import {
  chartViewSelectedClick, chartViewSelectedDisabled, chartViewSelectedHover, chartViewSelectedNormal
} from './regedit/micarch/chartViewSelected.regedit';
import {
  chartViewSelectedDarkClick, chartViewSelectedDarkDisabled, chartViewSelectedDarkHover, chartViewSelectedDarkNormal
} from './regedit/micarch/chartViewSelectedDark.regedit';
import {
  tableViewClick, tableViewDisabled, tableViewHover, tableViewNormal
} from './regedit/micarch/tableView.regedit';
import { tableViewDarkClick, tableViewDarkDisabled, tableViewDarkHover, tableViewDarkNormal
 } from './regedit/micarch/tableViewDark.regedit';
import {
  tableViewSelectedClick, tableViewSelectedDisabled, tableViewSelectedHover, tableViewSelectedNormal
} from './regedit/micarch/tableViewSelected.regedit';
import {
  tableViewSelectedDarkClick, tableViewSelectedDarkDisabled, tableViewSelectedDarkHover, tableViewSelectedDarkNormal
} from './regedit/micarch/tableViewSelectedDark.regedit';
import { applicationDisabled, applicationHover, applicationNormal } from './regedit/create-task/application.regedit';
import {
  cplusAnalysisDisabled, cplusAnalysisHover, cplusAnalysisNormal
} from './regedit/create-task/cplusAnalysis.regedit';
import {
  memAccessAnalysisDisabled, memAccessAnalysisHover, memAccessAnalysisNormal
} from './regedit/create-task/memAccessAnalysis.regedit';
import { ioAnalysisDisabled, ioAnalysisHover, ioAnalysisNormal } from './regedit/create-task/ioAnalysis.regedit';
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
import {
  settingClick, settingDisabled, settingHover, settingNormal
} from './regedit/common/setting.regedit';
import {
  settingDarkClick, settingDarkDisabled, settingDarkHover, settingDarkNormal
} from './regedit/common/settingDark.regedit';
import {
  viewSwitchClick, viewSwitchDisabled, viewSwitchHover, viewSwitchNormal
} from './regedit/tuninghelper/systemPerf/viewSwitch.regedit';
import {
  viewSwitchDarkClick, viewSwitchDarkDisabled, viewSwitchDarkHover, viewSwitchDarkNormal
} from './regedit/tuninghelper/systemPerf/viewSwitchDark.regedit';
import {
  sliderClick, sliderDisabled, sliderHover, sliderNormal
} from './regedit/common/slider.regedit';
import {
  sliderDarkClick, sliderDarkDisabled, sliderDarkHover, sliderDarkNormal
} from './regedit/common/sliderDark.regedit';
import {
  arrowLeftClick, arrowLeftDisabled, arrowLeftHover, arrowLeftNormal
} from './regedit/common/arrowLeft.regedit';
import {
  arrowLeftDarkClick, arrowLeftDarkDisabled, arrowLeftDarkHover, arrowLeftDarkNormal
} from './regedit/common/arrowLeftDark.regedit';
import {
  preBtnNormal, preBtnHover, preBtnClick, preBtnDisabled
} from './regedit/common/preBtn.regedit';
import {
  nextBtnNormal, nextBtnHover, nextBtnClick, nextBtnDisabled
} from './regedit/common/nextBtn.regedit';
import {
  preBtnDarkNormal, preBtnDarkHover, preBtnDarkClick, preBtnDarkDisabled
} from './regedit/common/preBtnDark.regedit';
import {
  nextBtnDarkNormal, nextBtnDarkHover, nextBtnDarkClick, nextBtnDarkDisabled
} from './regedit/common/nextBtnDark.regedit';
import {
  viewDetailsClick, viewDetailsDisabled, viewDetailsHover, viewDetailsNormal
} from './regedit/tuninghelper/viewDetails.regedit';
import {
  viewDetailsDarkClick, viewDetailsDarkDisabled, viewDetailsDarkHover, viewDetailsDarkNormal
} from './regedit/tuninghelper/viewDetailsDark.regedit';
import {
  toggleClick, toggleDisabled, toggleHover, toggleNormal
} from './regedit/tuninghelper/toggle.regedit';
import {
  toggleDarkClick, toggleDarkDisabled, toggleDarkHover, toggleDarkNormal
} from './regedit/tuninghelper/toggleDark.regedit';
import {
  exchangeClick, exchangeDisabled, exchangeHover, exchangeNormal
} from './regedit/tuninghelper/exchange.regedit';
import {
  exchangeDarkClick, exchangeDarkDisabled, exchangeDarkHover, exchangeDarkNormal
} from './regedit/tuninghelper/exchangeDark.regedit';
import { taskFailed } from './regedit/tuninghelper/taskFailed/taskFailed.regedit';
import { taskFailedDark } from './regedit/tuninghelper/taskFailed/taskFailedDark.regedit';
import { smallLightBuld } from './regedit/tuninghelper/smallLightBulb.regedit';
import { iconDifferenceDarkNormal } from './regedit/tuninghelper/iconDifferenceDark.regedit';
import { iconDifferenceNormal } from './regedit/tuninghelper/iconDifference.regedit';
import { questionMarkTipDark, questionMarkTipLight } from './regedit/icon-static/questionMaskTip.regedit';
import {
  ioLatencyFast,
  ioLatencyGood,
  ioLatencySlow,
  ioLatencySuggestion
} from './regedit/icon-static/diagnose-storage-io/ioLatency.regedit';

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
      chartViewDarkClick, chartViewDarkDisabled, chartViewDarkHover, chartViewDarkNormal,
      chartViewSelectedClick, chartViewSelectedDisabled, chartViewSelectedHover, chartViewSelectedNormal,
      chartViewSelectedDarkClick, chartViewSelectedDarkDisabled,
      chartViewSelectedDarkHover, chartViewSelectedDarkNormal,
      tableViewClick, tableViewDisabled, tableViewHover, tableViewNormal,
      tableViewDarkClick, tableViewDarkDisabled, tableViewDarkHover, tableViewDarkNormal,
      tableViewSelectedClick, tableViewSelectedDisabled, tableViewSelectedHover, tableViewSelectedNormal,
      tableViewSelectedDarkClick, tableViewSelectedDarkDisabled,
      tableViewSelectedDarkHover, tableViewSelectedDarkNormal,
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
      codeViewSelectedClick, codeViewSelectedDisabled, codeViewSelectedHover, codeViewSelectedNormal,
      settingClick, settingDisabled, settingHover, settingNormal,
      settingDarkClick, settingDarkDisabled, settingDarkHover, settingDarkNormal,
      viewSwitchClick, viewSwitchDisabled, viewSwitchHover, viewSwitchNormal,
      viewSwitchDarkClick, viewSwitchDarkDisabled, viewSwitchDarkHover, viewSwitchDarkNormal,
      sliderClick, sliderDisabled, sliderHover, sliderNormal,
      sliderDarkClick, sliderDarkDisabled, sliderDarkHover, sliderDarkNormal,
      arrowLeftClick, arrowLeftDisabled, arrowLeftHover, arrowLeftNormal,
      arrowLeftDarkClick, arrowLeftDarkDisabled, arrowLeftDarkHover, arrowLeftDarkNormal,
      viewDetailsClick, viewDetailsDisabled, viewDetailsHover, viewDetailsNormal,
      viewDetailsDarkClick, viewDetailsDarkDisabled, viewDetailsDarkHover, viewDetailsDarkNormal,
      toggleClick, toggleDisabled, toggleHover, toggleNormal,
      toggleDarkClick, toggleDarkDisabled, toggleDarkHover, toggleDarkNormal,
      exchangeClick, exchangeDisabled, exchangeHover, exchangeNormal,
      exchangeDarkClick, exchangeDarkDisabled, exchangeDarkHover, exchangeDarkNormal,
      taskFailed, taskFailedDark,
      smallLightBuld,
      chartViewDarkIntellijClick, chartViewDarkIntellijHover,
      chartViewDarkIntellijNormal, chartViewDarkIntellijDisabled,
      chartViewSelectedDarkIntellijClick, chartViewSelectedDarkIntellijHover, chartViewSelectedDarkIntellijNormal,
      chartViewSelectedDarkIntellijDisabled,
      tableViewDarkIntellijNormal, tableViewDarkIntellijClick,
      tableViewDarkIntellijDisabled, tableViewDarkIntellijHover,
      tableViewSelectedDarkIntellijClick, tableViewSelectedDarkIntellijDisabled, tableViewSelectedDarkIntellijHover,
      tableViewSelectedDarkIntellijNormal,
      preBtnNormal, preBtnHover, preBtnClick, preBtnDisabled,
      nextBtnNormal, nextBtnHover, nextBtnClick, nextBtnDisabled,
      preBtnDarkNormal, preBtnDarkHover, preBtnDarkClick, preBtnDarkDisabled,
      nextBtnDarkNormal, nextBtnDarkHover, nextBtnDarkClick, nextBtnDarkDisabled,
      iconDifferenceNormal, iconDifferenceDarkNormal,
      questionMarkTipLight, questionMarkTipDark,
      ioLatencyFast, ioLatencyGood, ioLatencySlow, ioLatencySuggestion,
    ]);
  }
}
