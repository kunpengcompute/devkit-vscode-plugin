import { NgModule } from '@angular/core';
import { SharedModule } from './shared.module';
import { CommonModule } from '@angular/common';

import { InterDisStaticComponent } from './components/inter-dis-static/inter-dis-static.component';
import { I18nPipe } from './pipes/i18n.pipe';
import { CommonTableComponent } from './components/common-table/common-table.component';
import { SwitchButtonComponent } from './components/switch-button/switch-button.component';

// 导出
const EXPORT_COMPONENTS = [
  // 组件
  InterDisStaticComponent,
  CommonTableComponent,
  SwitchButtonComponent,

  // 管道
  I18nPipe,
];

/**
 * 若在 ide 中直接引入 com -> shared.module 会报很多 管道名，指令名等相同的错误
 * 因此重新建立一个 module 导出对应的组件，后期优化需删除该模块
 */

@NgModule({
  declarations: [InterDisStaticComponent],
  imports: [CommonModule, SharedModule],
  exports: [...EXPORT_COMPONENTS],
})
export class PartModule {}
