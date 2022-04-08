import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HeaderComponent } from './header.component';
import { CreatingProgressComponent } from './creating-progress/creating-progress.component';
import { CreatingResultComponent } from './creating-result/creating-result.component';
import {
  LogManageProgressComponent, PackagePortingProgressComponent, PackageProgressComponent,
  BcCheckProgressComponent, ByteAlignmentProgressComponent, CheckWeakProgressComponent,
  PreCheckProgressComponent, WeakCompilerProgressComponent, SoftwarePortingProgressComponent,
  SourceCodeProgressComponent, UserGuideBarComponent, CacheLineProgressComponent
} from './components';

@NgModule({
  declarations: [
    HeaderComponent, CreatingProgressComponent, LogManageProgressComponent,
    PackagePortingProgressComponent, PackageProgressComponent, BcCheckProgressComponent,
    ByteAlignmentProgressComponent, CheckWeakProgressComponent, PreCheckProgressComponent,
    WeakCompilerProgressComponent, SoftwarePortingProgressComponent, SourceCodeProgressComponent,
    UserGuideBarComponent, CreatingResultComponent, CacheLineProgressComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [HeaderComponent]
})
export class HeaderModule { }
