import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { ExplorerType } from 'sys/src-com/app/domain';
import * as Util from 'sys/src-com/app/util';

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
  private explorerType: ExplorerType = ExplorerType.Chrome;
  public zoom = 1;

  /** 兼容opera,chrome,safari,IE */
  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.wheelDelta < 0) {
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

  /** 兼容firefox */
  @HostListener('DOMMouseScroll', ['$event'])
  onDOMMouseScroll(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail < 0) {
      // 向上滚
      this.zoom += 0.05;
      this.replaceScaleValue(this.targetDom);
    } else {
      // 向下滚
      this.zoom -= 0.05;
      if (this.zoom < 0.2) {
        this.zoom = 0.2;
      }
      this.replaceScaleValue(this.targetDom);
    }
  }

  constructor(el: ElementRef<HTMLElement>) {
    this.selfDom = el.nativeElement;
  }

  ngOnInit(): void {
    this.targetDom = this.targetZoomDom || this.selfDom;
    this.explorerType = Util.judgeExplorer();

    if (this.explorerType === ExplorerType.IE || this.explorerType === ExplorerType.Firefox) {
      this.regexp = /(scale\()-*[\d\.]+(\))/;
      if (!this.regexp.test(this.targetDom.style.transform)) {
        this.targetDom.style.transform += ' scale(1)';
      } else {
        const matched = /scale\((-*[\d\.]+)\)/.exec(this.targetDom.style.transform);
        this.zoom = Number(matched[1]);
      }
    } else {
      this.regexp = /(scale\()-*[\d\.]+(,\s*)-*[\d\.]+(\))/;
      if (!this.regexp.test(this.targetDom.style.transform)) {
        this.targetDom.style.transform += ' scale(1, 1)';
      } else {
        const matched = /scale\((-*[\d\.]+),\s*(-*[\d\.]+)\)/.exec(this.targetDom.style.transform);
        this.zoom = Number(matched[1]);
      }
    }
  }

  private replaceScaleValue(dom: HTMLElement) {
    if (this.explorerType === ExplorerType.IE || this.explorerType === ExplorerType.Firefox) {
      dom.style.transform = dom.style.transform.replace(this.regexp, (match, p1, p2) => {
        return p1 + this.zoom + p2;
      });
    } else {
      dom.style.transform = dom.style.transform.replace(this.regexp, (match, p1, p2, p3) => {
        return p1 + this.zoom + p2 + this.zoom + p3;
      });
    }
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
