// 模块
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { IconLibModule } from './icon-lib/icon-lib.module';

// 组件
import { StaticTipForIEComponent } from './components/static-tip-for-ie/static-tip-for-ie.component';
import { TimeLineComponent } from './components/time-line/time-line.component';
import { SubModuleTableSortComponent } from './components/sub-module-table-sort/sub-module-table-sort.component';
import { MessageModalComponent } from './components/message-modal/message-modal.component';
import { LoadingComponent } from './directives/loading/component/loading/loading.component';
import { MissionReservationPlusComponent } from './components/mission-reservation-plus/mission-reservation-plus.component';
import { CommonTableComponent } from './components/common-table/common-table.component';
import { HartNumberTableComponent } from './components//hart-number-table/hart-number-table.component';
import { HardIrqAffinityDistComponent } from './components/hard-irq-affinity-dist/hard-irq-affinity-dist.component';
import { NetportIrqAffinityDistComponent } from './components/netport-irq-affinity-dist/netport-irq-affinity-dist.component';
import { GeneralTableComponent } from './components/general-table/general-table.component';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { SwitchButtonComponent } from './components/switch-button/switch-button.component';

// 管道
import { TimeProcessPipe } from './pipes/time-process.pipe';
import { ThreePoint } from './pipes/three-point.pipe';
import { PagePipe } from './pipes/page.pipe';
import { I18nPipe } from './pipes/i18n.pipe';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';

// 指令
import { SpinnerBlurDirective } from './directives/spinner-blur/spinner-blur.directive';
import { LoadingDirective } from './directives/loading/loading.directive';
import { ZoomBoxDirective } from './directives/zoom-box/zoom-box.directive';
import { DragBoxDirective } from './directives/drag-box/drag-box.directive';
import { PopDirective } from './directives/pop/pop.directive';
import { NiceTooltipDirective } from './directives/nice-tooltip/nice-tooltip.directive';
import { ClickOutsideDirective } from './directives/click-outside/click-outside.directive';
import { DemandLoadingDirective } from './directives/demand-loading/demand-loading.directive';

// tiny 模块
import {
  TiButtonModule, TiRadioModule, TiSliderModule, TiAlertModule, TiMessageModule,
  TiIconModule, TiTreeModule, TiLeftmenuModule, TiOverflowModule, TiTableModule,
  TiPaginationModule, TiCheckgroupModule, TiValidationModule, TiFormfieldModule,
  TiTextModule, TiSelectModule, TiSpinnerModule, TiMenuModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiProgressbarModule, TiTimeModule,
  TiDateRangeModule, TiDatetimeModule, TiInputNumberModule, TiCheckboxModule,
  TiSearchboxModule, TiSwitchModule, TiTabModule, TiIpModule,
  TiScrollModule, TiTagModule
} from '@cloud/tiny3';

// hyper 模块
import {
  HyTiTipDirectiveModule,
  HyThemeContentModule,
  HyThemeServiceModule,
  HyNodataDirectiveModule,
  HyThouSeparatorPipeModule,
  HySpinnerBlurDirectiveModule,
  HyBacktopModule,
  HyThemeClassModule,
} from 'hyper';

const TINY_MODULES = [
  TiButtonModule, TiSliderModule, TiRadioModule,
  TiAlertModule, TiMessageModule, TiTreeModule, TiLeftmenuModule,
  TiOverflowModule, TiTableModule, TiPaginationModule, TiIconModule,
  TiCheckgroupModule, TiValidationModule, TiFormfieldModule,
  TiTextModule, TiSelectModule, TiSpinnerModule, TiMenuModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiProgressbarModule,
  TiTimeModule, TiDateRangeModule, TiDatetimeModule, TiInputNumberModule,
  TiSearchboxModule, TiSwitchModule, TiTabModule, TiIpModule,
  TiCheckboxModule, TiScrollModule, TiTagModule
];

const HYPER_MODULES = [
  HyTiTipDirectiveModule,
  HyThemeContentModule,
  HyThemeServiceModule,
  HyNodataDirectiveModule,
  HyThouSeparatorPipeModule,
  HySpinnerBlurDirectiveModule,
  HyBacktopModule,
  HyThemeClassModule,
];

const COMMON_MODULES = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  NgxEchartsModule,
  IconLibModule,
  ...TINY_MODULES,
  ...HYPER_MODULES
];

// 导出
const EXPORT_COMPONENTS = [
  // 组件
  SubModuleTableSortComponent,
  StaticTipForIEComponent,
  LoadingComponent,
  TimeLineComponent,
  MessageModalComponent,
  MissionReservationPlusComponent,
  CommonTableComponent,
  HartNumberTableComponent,
  HardIrqAffinityDistComponent,
  NetportIrqAffinityDistComponent,
  GeneralTableComponent,
  DeleteModalComponent,
  SwitchButtonComponent,

  // 管道
  TimeProcessPipe,
  ThreePoint,
  PagePipe,
  I18nPipe,
  ThousandSeparatorPipe,

  // 指令
  SpinnerBlurDirective,
  LoadingDirective,
  ZoomBoxDirective,
  DragBoxDirective,
  PopDirective,
  NiceTooltipDirective,
  ClickOutsideDirective,
  DemandLoadingDirective,
];

// 只声明，不导出
const DECLARATIONS: any[] = [
  ...EXPORT_COMPONENTS
];

@NgModule({
  imports: [
    ...COMMON_MODULES,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    })
  ],
  exports: [...COMMON_MODULES, ...EXPORT_COMPONENTS],
  declarations: DECLARATIONS,
})
export class SharedModule {
  constructor() { }
}
