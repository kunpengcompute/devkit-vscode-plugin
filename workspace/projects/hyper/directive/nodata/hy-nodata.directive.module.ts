import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HyIconStaticModule } from '../../component/icon-lib';
import { HyThemeServiceModule } from '../../theme';
import { HyLocaleModule } from '../../locale';

import { NodataComponent } from './nodata.component';
import { HyNodataDirective } from './hy-nodata.directive';
import { HyNodataService } from './hy-nodata.service';

import { nodataDark, nodataGery, nodataLight } from './nodata.static.regedit';

// 引用TiTipModule，可以使用Tip指令和Tip服务
@NgModule({
  imports: [
    CommonModule, HyIconStaticModule, HyLocaleModule,
    HyThemeServiceModule, FormsModule
  ],
  declarations: [NodataComponent, HyNodataDirective],
  exports: [HyNodataDirective],
  providers: [HyNodataService]
})
export class HyNodataDirectiveModule {
  constructor(
    private iconStaticModule: HyIconStaticModule
  ) {
    this.iconStaticModule.register([nodataDark, nodataGery, nodataLight]);
  }
}
