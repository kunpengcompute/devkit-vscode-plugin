import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  constructor(
    private elementRef: ElementRef) { }

  @Output()
  public clickOutside = new EventEmitter();

  @HostListener('window:mousedown', ['$event'])
  handleMouseDown(event: any) {
    const isClickInside = this.elementRef.nativeElement.contains(event.target);
    if (!isClickInside) {
      this.clickOutside.emit(null);
    }
  }
}
