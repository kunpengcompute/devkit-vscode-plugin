// 模块
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { LinkageCreateComponent } from './linkage-create.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [LinkageCreateComponent],
  declarations: [LinkageCreateComponent]
})
export class LinkageCreateModule {
  constructor() { }
}
