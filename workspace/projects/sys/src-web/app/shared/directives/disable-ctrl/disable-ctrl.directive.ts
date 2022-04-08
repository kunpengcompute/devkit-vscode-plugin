import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableCtrl]'
})
export class DisableCtrlDirective {

  constructor(public el: ElementRef) { }
  @HostListener('cut', ['$event'])
  oncut() { return false; }
  @HostListener('copy', ['$event'])
  oncopy() { return false; }
  @HostListener('contextmenu', ['$event'])
  oncontextmenu() { return false; }
  @HostListener('keydown', ['$event'])
  onkeydown(e: any): any {
    if (e.ctrlKey && e.keyCode === 90) { return false; }
  }
}
