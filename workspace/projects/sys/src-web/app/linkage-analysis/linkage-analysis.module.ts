import { NgModule } from '@angular/core';
import { LinkageCreateContainerComponent } from './linkage-create/linkage-create-container.component';
import { LinkageCreateModule } from 'sys/src-com/app/linkage-create/linkage-create.module';

@NgModule({
  declarations: [LinkageCreateContainerComponent],
  imports: [LinkageCreateModule],
  exports: [LinkageCreateContainerComponent],
})
export class LinkageAnalysisModule { }
