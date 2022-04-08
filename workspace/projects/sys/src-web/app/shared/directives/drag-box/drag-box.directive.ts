import { Directive, ElementRef, Input, OnInit } from '@angular/core';

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

  private selfDom: HTMLElement;
  private initTranslateXY: { x: number, y: number };

  constructor(el: ElementRef<HTMLElement>) {
    this.selfDom = el.nativeElement;
  }

  ngOnInit(): void {
    const targetDom = this.targetDragDom || this.selfDom;

    this.initTranslateXY = this.parseTranslate(targetDom.style.transform);
    let isMouseDown = false;
    this.selfDom.addEventListener('mousedown', () => {
      isMouseDown = true;
      this.selfDom.style.cursor = 'grabbing';
    });
    this.selfDom.addEventListener('mouseup', () => {
      isMouseDown = false;
      this.selfDom.style.cursor = 'grab';
    });
    this.selfDom.addEventListener('mouseleave', () => {
      isMouseDown = false;
      this.selfDom.style.cursor = 'grab';
    });
    const regexp = /(translate\()[-\.\d]+(px\,\s*)[-\.\d]+(px\))/;
    if (!regexp.test(targetDom.style.transform)) {
      targetDom.style.transform += ' translate(0px, 0px)';
    }
    this.selfDom.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        this.initTranslateXY.x += event.movementX;
        this.initTranslateXY.y += event.movementY;
        targetDom.style.transform = targetDom.style.transform.replace(regexp, (match, p1, p2, p3) => {
          return p1 + this.initTranslateXY.x + p2 + this.initTranslateXY.y + p3;
        });
      }
    });
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
    this.initTranslateXY = { x: 0, y: 0 };
  }

}
