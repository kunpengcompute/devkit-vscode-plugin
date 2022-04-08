import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HyDisableCtrlDirective } from './hy-disable-ctrl.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ HyDisableCtrlDirective],
  exports: [ HyDisableCtrlDirective]
})
export class HyDisableCtrlDirectiveModule { }
