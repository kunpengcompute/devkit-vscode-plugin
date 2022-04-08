import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

/**
 * 使绑定的dom可以被拖动
 * 如果传递了targetDragDom，则使targetZoomDom的元素被拖动
 */
@Directive({
  selector: '[appDragBox]',
  exportAs: 'dragBox'
})
export class DragBoxDirective implements OnInit {

  @Input('appDragBox') targetDragDom: HTMLElement;

  // 指令绑定的dom
  private selfDom: HTMLElement;
  // targetDragDom指定的dom
  private targetDom: HTMLElement;
  private translateXY: { x: number, y: number };
  private isMouseDown = false;
  // 匹配translate的正则
  private regexp = /(translate\()[-\.\d]+(px\,\s*)[-\.\d]+(px\))/;

  constructor(el: ElementRef<HTMLElement>) {
    this.selfDom = el.nativeElement;
  }

  @HostListener('mousedown')
  onMouseDown() {
    this.isMouseDown = true;
    this.selfDom.style.cursor = 'grabbing';
  }

  @HostListener('mouseup')
  onMouseUp() {
    this.isMouseDown = false;
    this.selfDom.style.cursor = 'grab';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isMouseDown = false;
    this.selfDom.style.cursor = 'grab';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isMouseDown) {
      this.translateXY.x += event.movementX;
      this.translateXY.y += event.movementY;
      this.targetDom.style.transform = this.targetDom.style.transform.replace(this.regexp, (match, p1, p2, p3) => {
        return p1 + this.translateXY.x + p2 + this.translateXY.y + p3;
      });
    }
  }

  ngOnInit(): void {
    this.targetDom = this.targetDragDom || this.selfDom;
    // 解析初始偏移量
    this.translateXY = this.parseTranslate(this.targetDom.style.transform);
    // 如果初始没有translate属性，则添加
    if (!this.regexp.test(this.targetDom.style.transform)) {
      this.targetDom.style.transform += ' translate(0px, 0px)';
    }

  }

  private parseTranslate(translateString: string) {
    const regexp = /translate\((\d)+px\,\s*(\d)+px\)/;
    const matched = regexp.exec(translateString);
    if (matched) {
      return {
        x: Number(matched[1]),
        y: Number(matched[2]),
      };
    }
    return {
      x: 0,
      y: 0,
    };
  }

  public restore() {
    const targetDom = this.targetDragDom || this.selfDom;
    const regexp = /(translate\()[-\.\d]+(px\,\s*)[-\.\d]+(px\))/;
    if (!regexp.test(targetDom.style.transform)) {
      targetDom.style.transform += ' translate(0px, 0px)';
    } else {
      targetDom.style.transform = targetDom.style.transform.replace(regexp, (match, p1, p2, p3) => {
        return p1 + 0 + p2 + 0 + p3;
      });
    }
    this.translateXY = { x: 0, y: 0 };
  }

}
