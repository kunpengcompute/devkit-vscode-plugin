import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { TiSearchboxComponent } from '@cloud/tiny3';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-focus-searchbox',
  template: `
    <div
      #tabIndex
      (click)="onClick($event)"
      (blur)="onBlur($event)"
      style="display: inline-block"
      tabindex="-1"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class FocusSearchboxComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tabIndex', { static: true }) tabIndexEl: ElementRef;
  @ContentChild(TiSearchboxComponent) tiSearchComp: TiSearchboxComponent;

  @Output() readonly focusEvent = new EventEmitter<Event>();
  @Output() readonly blurEvent = new EventEmitter<Event>();

  private timer: any;
  private isFocused = false;
  private blurSub: Subscription;

  ngAfterViewInit() {
    this.blurSub = this.tiSearchComp?.blurEvent?.subscribe((evt: any) => {
      this.onBlur(evt);
    });
  }

  ngOnDestroy() {
    this.blurSub?.unsubscribe();
  }

  onClick(evt: Event) {
    clearTimeout(this.timer);
    if ('INPUT' !== (evt as any).target.tagName) {
      this.tabIndexEl.nativeElement.focus();
    }

    if (!this.isFocused) {
      this.focusEvent.emit(evt);
      this.isFocused = true;
    }
  }

  onBlur(evt: Event) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.blurEvent.emit(evt);
      this.isFocused = false;
    }, 300);
  }
}
