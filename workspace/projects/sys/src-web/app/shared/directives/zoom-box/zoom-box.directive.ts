import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

/**
 * 使绑定的dom可以通过鼠标滚轮缩放
 * 如果传递了targetZoomDom，则使targetZoomDom元素缩放
 */
@Directive({
  selector: '[appZoomBox]',
  exportAs: 'zoomBox'
})
export class ZoomBoxDirective implements OnInit {

  @Input('appZoomBox') targetZoomDom: HTMLElement;

  private selfDom: HTMLElement;
  private targetDom: HTMLElement;
  private regexp = /(scale\()-*[\d\.]+(,\s*)-*[\d\.]+(\))/;
  private zoom = 1;

  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.deltaY > 0) {
      // 向下滚
      this.zoom -= 0.05;
      if (this.zoom < 0.2) {
        this.zoom = 0.2;
      }
      this.replaceScaleValue(this.targetDom);
    } else {
      // 向上滚
      this.zoom += 0.05;
      this.replaceScaleValue(this.targetDom);
    }
  }

  constructor(el: ElementRef<HTMLElement>) {
    this.selfDom = el.nativeElement;
  }

  ngOnInit(): void {
    this.targetDom = this.targetZoomDom || this.selfDom;

    if (!this.regexp.test(this.targetDom.style.transform)) {
      this.targetDom.style.transform += ' scale(1, 1)';
    } else {
      const matched = /scale\((-*[\d\.]+),\s*(-*[\d\.]+)\)/.exec(this.targetDom.style.transform);
      this.zoom = Number(matched[1]);
    }
  }

  private replaceScaleValue(dom: HTMLElement) {
    dom.style.transform = dom.style.transform.replace(this.regexp, (match, p1, p2, p3) => {
      return p1 + this.zoom + p2 + this.zoom + p3;
    });
  }

  public zoomUp() {
    this.zoom += 0.2;
    this.replaceScaleValue(this.targetDom);
  }

  public zoomDown() {
    this.zoom -= 0.2;
    if (this.zoom < 0.2) {
      this.zoom = 0.2;
    }
    this.replaceScaleValue(this.targetDom);
  }

  public restore() {
    this.zoom = 1;
    this.replaceScaleValue(this.targetDom);
  }

}
