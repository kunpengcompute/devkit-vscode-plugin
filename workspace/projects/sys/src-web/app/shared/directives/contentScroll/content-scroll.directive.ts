import {
  Directive, Injector, ElementRef, AfterViewInit, OnInit, Renderer2,
  HostListener, Input, ViewContainerRef, ApplicationRef, ComponentFactoryResolver, ComponentRef
} from '@angular/core';
import { TopScrollComponent } from './top-scroll/top-scroll.component';
@Directive({
  selector: '[appContentScroll]'
})
export class ContentScrollDirective implements AfterViewInit, OnInit {

  public componentRef: ComponentRef<any>;
  public hostScrollHeight: number;
  constructor(
    private el?: ElementRef,
    private injector?: Injector,
    private renderer2?: Renderer2,
    public viewContainerRef?: ViewContainerRef,
    private applicationRef?: ApplicationRef,
    private componentFactoryResolver?: ComponentFactoryResolver) { }
  @Input() toTop: boolean;
  @HostListener('scroll', ['$event'])
  onscroll = ($event: Event) => {
    this.hostScrollHeight = this.el.nativeElement.scrollTop;
    if (!this.componentRef || !this.hostScrollHeight) {
      return;
    }
    if (this.hostScrollHeight > 690) {
      this.componentRef.instance.show();
    } else {
      this.componentRef.instance.hide();
    }
  }
  ngOnInit() {

  }
  ngAfterViewInit() {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(TopScrollComponent);
    this.componentRef = factory.create(this.injector);
    const view = this.componentRef.hostView;
    this.viewContainerRef.insert(view, 0);

  }

}
