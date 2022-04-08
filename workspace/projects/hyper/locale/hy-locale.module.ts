import { NgModule } from '@angular/core';
import { HyTranslatePipe } from './hy-translate.pipe';

@NgModule({
  declarations: [ HyTranslatePipe ],
  exports: [ HyTranslatePipe ]
})
export class HyLocaleModule {}
