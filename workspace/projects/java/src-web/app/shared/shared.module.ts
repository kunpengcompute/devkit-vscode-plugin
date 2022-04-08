import { NgModule } from '@angular/core';
import { CommonSharedModule } from 'projects/java/src-com/app/shared/common-shared.module';


// 组件
import {
  AlertMessageComponent,
  AlertModalComponent,
  AnalysisComponent,
  CircleProgressComponent,
  StackTreeComponent,
  MaskComponent,
  DataLimitComponent,
  LimitItemComponent,
} from './components';
import { LoadingComponent } from './directive/loading/component/loading/loading.component';

// 指令
import { LoadingDirective } from './directive/loading/loading.directive';


const COMMON_MODULES = [
  CommonSharedModule
];

// 导出
const EXPORT_COMPONENTS = [
  AlertMessageComponent,
  AlertModalComponent,
  AnalysisComponent,
  CircleProgressComponent,
  StackTreeComponent,
  MaskComponent,
  DataLimitComponent,
  LimitItemComponent,
  LoadingComponent,
  LoadingDirective
];

// 只声明，不导出
const DECLARATIONS: any[] = [
  ...EXPORT_COMPONENTS
];

@NgModule({
  declarations: DECLARATIONS,
  imports: COMMON_MODULES,
  exports: [...COMMON_MODULES, ...EXPORT_COMPONENTS],
  entryComponents: [
    LoadingComponent
  ]
})
export class SharedModule { }
