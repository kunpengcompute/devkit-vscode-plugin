import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { CompareCreateComponent } from './compare-create.component';


@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [
    CompareCreateComponent
  ],
  declarations: [
    CompareCreateComponent
  ],
})
export class CompareCreateModule { }
