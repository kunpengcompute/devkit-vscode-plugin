import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import {
  HyNodataDirectiveModule, HyMiniModalModule, HyThemeContentModule, HyThemeServiceModule,
  HySpinnerBlurDirectiveModule
} from 'hyper';

// 组件
import {
  TimeLineComponent,
  HotWordTableComponent,
  ZoomScreenComponent,
  SuggestionTipComponent,
  AdviceFeedbackIconComponent,
  AdviceErrorAlertComponent,
  TableSearchBoxComponent,
  ChartLegendComponent,
  InforCollectionComponent,
  InforDetailComponent,
  LockGraphComponent,
  DiffComponent,
  ComAlertMessageComponent,
  ComProgressComponent,
  InforTipComponent,
  DividerComponent,
  FullSelectComponent

} from './components';

// 管道
import { HtmlPipe } from './pipes/html.pipe';
import { SeparatorPipe } from './pipes/separator.pipe';

// 页面
import {
  HotAnalysisComponent
} from './profile';

// Tiny3
import {
  TiButtonModule, TiRadioModule, TiSliderModule, TiAlertModule, TiMessageModule,
  TiIconModule, TiTreeModule, TiLeftmenuModule, TiOverflowModule, TiTableModule,
  TiPaginationModule, TiCheckgroupModule, TiValidationModule, TiFormfieldModule,
  TiTextModule, TiSelectModule, TiSpinnerModule, TiMenuModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiProgressbarModule, TiTimeModule,
  TiDateRangeModule, TiDatetimeModule, TiInputNumberModule, TiCheckboxModule,
  TiSearchboxModule, TiSwitchModule, TiTabModule, TiIpModule,
  TiScrollModule, TiTagModule, TiUploadModule
} from '@cloud/tiny3';
import { IconLibModule } from './icon-lib/icon-lib.module';

const TINY_MODULES = [
  TiButtonModule, TiSliderModule, TiRadioModule,
  TiAlertModule, TiMessageModule, TiTreeModule, TiLeftmenuModule,
  TiOverflowModule, TiTableModule, TiPaginationModule, TiIconModule,
  TiCheckgroupModule, TiValidationModule, TiFormfieldModule,
  TiTextModule, TiSelectModule, TiSpinnerModule, TiMenuModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiProgressbarModule,
  TiTimeModule, TiDateRangeModule, TiDatetimeModule, TiInputNumberModule,
  TiSearchboxModule, TiSwitchModule, TiTabModule, TiIpModule,
  TiCheckboxModule, TiScrollModule, TiTagModule, TiUploadModule
];

const COMMON_MODULES = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  NgxEchartsModule,
  HyNodataDirectiveModule,
  HyMiniModalModule,
  HyThemeContentModule,
  HyThemeServiceModule,
  HySpinnerBlurDirectiveModule,
  IconLibModule,
  ...TINY_MODULES
];

// 导出
const EXPORT_COMPONENTS = [
  TimeLineComponent,
  HotWordTableComponent,
  ZoomScreenComponent,
  SuggestionTipComponent,
  AdviceFeedbackIconComponent,
  AdviceErrorAlertComponent,
  TableSearchBoxComponent,
  ChartLegendComponent,
  InforCollectionComponent,
  InforDetailComponent,
  LockGraphComponent,
  DiffComponent,
  ComAlertMessageComponent,
  ComProgressComponent,
  InforTipComponent,
  FullSelectComponent,

  HtmlPipe,
  SeparatorPipe,

  HotAnalysisComponent,
  DividerComponent
];

// 只声明，不导出
const DECLARATIONS: any[] = [
  ...EXPORT_COMPONENTS
];

@NgModule({
  declarations: DECLARATIONS,
  imports: [
    ...COMMON_MODULES,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    })
  ],
  exports: [...COMMON_MODULES, ...EXPORT_COMPONENTS],
})
export class CommonSharedModule { }
