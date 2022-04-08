// 模块
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // 表单
import { IconLibModule } from './icon-lib/icon-lib.module';
import { HyNodataDirectiveModule, HyMiniModalModule } from 'hyper';

// 组件
import {
  SoSituationComponent, XmlSituationComponent, PopMaskComponent,
  CommonDisclaimerComponent, AboutMaskComponent, AboutMoreSystemComponent,
  AlertMessageComponent
} from './components';
import { ModifyPwdComponent } from '../pages/home-new/modify-pwd/modify-pwd.component';
import { LoadingComponent } from './directive/loading/component/loading/loading.component';

// 管道
import { HtmlPipe } from './pipes/html.pipe';
import { HandleBytePipe } from './pipes/handle-byte.pipe';

// Tiny3
import {
  TiButtonModule, TiAlertModule, TiCheckboxModule,
  TiMessageModule, TiTreeModule, TiLeftmenuModule,
  TiOverflowModule, TiTableModule, TiPaginationModule,
  TiIconModule, TiValidationModule, TiFormfieldModule, TiTextModule,
  TiSelectModule, TiSpinnerModule, TiMenuModule, TiCheckgroupModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiUploadModule,
  TiTipServiceModule, TiRadioModule, TiProgressbarModule,
  TiSearchboxModule, TiSwitchModule, TiTabModule, TiOverflowServiceModule
} from '@cloud/tiny3';

const TINY_MODULES = [
  TiButtonModule, TiAlertModule, TiCheckboxModule,
  TiMessageModule, TiTreeModule, TiLeftmenuModule,
  TiOverflowModule, TiTableModule, TiPaginationModule,
  TiIconModule, TiValidationModule, TiFormfieldModule, TiTextModule,
  TiSelectModule, TiSpinnerModule, TiMenuModule, TiCheckgroupModule,
  TiActionmenuModule, TiModalModule, TiTipModule, TiUploadModule,
  TiTipServiceModule, TiRadioModule, TiProgressbarModule,
  TiSearchboxModule, TiSwitchModule, TiTabModule, TiOverflowServiceModule
];

const COMMON_MODULES = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  IconLibModule,
  HyNodataDirectiveModule,
  HyMiniModalModule,
  ...TINY_MODULES
];

// 导出
const EXPORT_COMPONENTS = [
  AboutMaskComponent,
  CommonDisclaimerComponent,
  PopMaskComponent,
  ModifyPwdComponent,
  AlertMessageComponent,
  LoadingComponent,
  SoSituationComponent,
  XmlSituationComponent,
  AboutMoreSystemComponent,

  HtmlPipe,
  HandleBytePipe
];

// 只声明，不导出
const DECLARATIONS: any[] = [
  ...EXPORT_COMPONENTS
];

@NgModule({
  declarations: DECLARATIONS,
  imports: COMMON_MODULES,
  exports: [...COMMON_MODULES, ...EXPORT_COMPONENTS]
})

export class SharedModule { }
