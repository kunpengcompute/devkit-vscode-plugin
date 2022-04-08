import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[hyDisableCtrl]'
})
export class HyDisableCtrlDirective {

  constructor() { }

  @HostListener('cut')
  oncut() { return false; }

  @HostListener('copy')
  oncopy() { return false; }

  @HostListener('contextmenu')
  oncontextmenu() { return false; }

  @HostListener('keydown', ['$event'])
  onkeydown(e: any): boolean | void {
    if (e.ctrlKey && e.keyCode === 90) {
      return false;
    }
  }
}
