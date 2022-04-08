// 模块
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule as SharedModuleCom } from 'sys/src-com/app/shared/shared.module';

// 组件
import { ModalComponent } from './components/modal/modal.component';
import { ModalNumaComponent } from './components/modal-numa/modal-numa.component';
import { ModalHeaderComponent } from './components/modal-header/modal-header/modal-header.component';
import { PopMaskComponent } from './components/pop-mask/pop-mask.component';
import { PanoramicMaskComponent } from './components/panoramic-mask/panoramic-mask.component';
import { ExtrapositionAxisTicksComponent } from './components/extraposition-axis/component/extraposition-axis-ticks/extraposition-axis-ticks.component';
import { ExtrapositionAxisOperationComponent } from './components/extraposition-axis/component/extraposition-axis-operation/extraposition-axis-operation.component';
import { MissionModalComponent } from './components/mission-modal/mission-modal.component';
import { MissionPanelComponent } from './components/mission-panel/mission-panel.component';
import { NodeListComponent } from './components/node-list/node-list.component';
import { LiquidFillGaugeComponent } from './components/node-list/component/liquid-fill-gauge/liquid-fill-gauge.component';
import { DownloadTaskModalComponent } from './components/download-task-modal/download-task-modal.component';
import { ExportTaskModalComponent } from './components/export-task-modal/export-task-modal.component';
import { ImportTaskModalComponent } from './components/import-task-modal/import-task-modal.component';
import { ViewTaskModalComponent } from './components/view-task-modal/view-task-modal.component';
import { MessageModalComponent } from './components/message-modal/message-modal.component';
import { LoadingComponent } from './directives/loading/component/loading/loading.component';
import { NoDataComponent } from './directives/no-data/component/no-data/no-data.component';
import { TopScrollComponent } from './directives/contentScroll/top-scroll/top-scroll.component';
import { AdviceErrorAlertComponent } from './components/advice-error-alert/advice-error-alert.component';
import { AdviceFeedbackIconComponent } from './components/advice-feedback-icon/advice-feedback-icon.component';

// 管道
import { HtmlPipe } from './pipes/html.pipe';
import { NumFormat } from './pipes/num.pipe';
import { ThreePoint } from './pipes/threePoint.pipe';
import { SaveThreePointPipe } from './pipes/save-three-point.pipe';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { PadStartPipe } from './pipes/pad-start.pipe';
import { ZerosPipe } from './pipes/zeros.pipe';
import { TimeProcessPipe } from './pipes/time-process.pipe';

// 指令
import { ContentScrollDirective } from './directives/contentScroll/content-scroll.directive';
import { NoDataDirective } from './directives/no-data/no-data.directive';
import { LoadingDirective } from './directives/loading/loading.directive';
import { DisableCtrlDirective } from './directives/disable-ctrl/disable-ctrl.directive';
import { DemandLoadingDirective } from './directives/demand-loading/demand-loading.directive';
import { SpinnerBlurDirective } from './directives/spinner-blur/spinner-blur.directive';
import { DragBoxDirective } from './directives/drag-box/drag-box.directive';
import { ZoomBoxDirective } from './directives/zoom-box/zoom-box.directive';


// tiny 组件
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

// hyper 组件
import {
    HyTiTipDirectiveModule,
    HyNodataDirectiveModule,
    HyThemeServiceModule,
    HyPopupSearchModule,
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
    TiCheckboxModule, TiScrollModule, TiTagModule,
];

const HYPER_MODULES = [
    HyTiTipDirectiveModule,
    HyNodataDirectiveModule,
    HyThemeServiceModule,
    HyPopupSearchModule
];

const COMMON_MODULES = [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxEchartsModule,
    SharedModuleCom,
    ...TINY_MODULES,
    ...HYPER_MODULES
];

// 导出
const EXPORT_COMPONENTS = [
    // 组件
    ModalComponent,
    ModalNumaComponent,
    ModalHeaderComponent,
    PopMaskComponent,
    PanoramicMaskComponent,
    MissionModalComponent,
    MissionPanelComponent,
    NodeListComponent,
    DownloadTaskModalComponent,
    ExportTaskModalComponent,
    ImportTaskModalComponent,
    ViewTaskModalComponent,
    AdviceErrorAlertComponent,
    AdviceFeedbackIconComponent,


    // 管道
    SaveThreePointPipe,
    ThousandSeparatorPipe,
    PadStartPipe,
    ZerosPipe,
    HtmlPipe,
    NumFormat,
    ThreePoint,
    TimeProcessPipe,

    // 指令
    ContentScrollDirective,
    NoDataDirective,
    LoadingDirective,
    DisableCtrlDirective,
    SpinnerBlurDirective,
    DemandLoadingDirective,
    DragBoxDirective,
    ZoomBoxDirective
];

// 只声明，不导出
const DECLARATIONS: any[] = [
    ...EXPORT_COMPONENTS,
    MessageModalComponent,
    ExtrapositionAxisTicksComponent,
    ExtrapositionAxisOperationComponent,
    LoadingComponent,
    NoDataComponent,
    TopScrollComponent,
    LiquidFillGaugeComponent
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
    entryComponents: [
        MessageModalComponent,
        TopScrollComponent,
        NoDataComponent,
        LoadingComponent
    ]
})
export class SharedModule {
    constructor() { }
}
