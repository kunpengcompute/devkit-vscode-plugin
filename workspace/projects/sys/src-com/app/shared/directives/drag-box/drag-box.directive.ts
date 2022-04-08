import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExplorerType } from 'sys/src-com/app/domain';
import * as Util from 'sys/src-com/app/util';

/**
 * 使绑定的dom可以被拖动
 * 如果传递了targetDragDom，则使targetZoomDom的元素被拖动
 */
@Directive({
  selector: '[appDragBox]',
  exportAs: 'dragBox'
})
export class DragBoxDirective implements OnInit {

  /**
   * 指定被拖动的dom
   *
   * 默认拖动被指令绑定的dom
   */
  @Input('appDragBox') targetDragDom: HTMLElement;

  /**
   * 拖拽方向限制
   *
   * `horizontal`表示只可以横向拖拽
   *
   * `vertical`表示只可以纵向拖拽
   *
   * 默认不限制
   */
  @Input() direction?: 'horizontal' | 'vertical';

  /**
   * 是否改变鼠标手势
   *
   * 修改dom的`cursor`样式属性值
   *
   * 默认改变鼠标手势为`grabbing`和`grab`
   */
  @Input() cursorStyle = true;

  /**
   * 鼠标移动的盒子
   *
   * 开始拖动后，鼠标在`moveBox`里面移动可以改变被拖动dom的位置。
   * 即监听`moveBox`上的`mousemove`事件
   *
   * 默认监听指令绑定的dom上的`mousemove`时间来改变被拖动dom的位置
   */
  @Input() moveBox?: HTMLElement;

  /**
   * 拖动范围
   */
  @Input() range?: {
    min?: { x?: number; y?: number };
    max?: { x?: number; y?: number };
  };

  /**
   * dom位置改变事件
   *
   * 返回dom当前的translate值
   */
  @Output() positionChange = new EventEmitter<{ x: number, y: number }>();

  /** 指令绑定的dom */
  private selfDom: HTMLElement;
  /** 鼠标移动的盒子dom */
  private boxDom: HTMLElement;
  /** 最终会发生位置变化的dom */
  private targetDom: HTMLElement;
  private isMouseDown = false;
  /** 匹配translate的正则 */
  private regexp = /(translate\()[-\.\d]+(px[,\s]*)[-\.\d]+(px[,\s]*\))/;
  private regexpFirefox = /(translate\()[-\.\d]+(px)(\))/;

  /**
   * 被拖动的dom的translateXY值
   */
  public translateXY: { x: number, y: number };
  /** 浏览器类型 */
  private explorerType: ExplorerType = ExplorerType.Chrome;
  /** 鼠标指针到widow的X轴距离 */
  private distanceX: any;
  /** 鼠标指针到widow的Y轴距离 */
  private distanceY: any;
  /** 鼠标移动的X轴距离 */
  private moveX: any;
  /** 鼠标移动的Y轴距离 */
  private moveY: any;

  constructor(el: ElementRef<HTMLElement>) {
    this.selfDom = el.nativeElement;
  }

  ngOnInit(): void {
    this.targetDom = this.targetDragDom || this.selfDom;
    this.boxDom = this.moveBox || this.selfDom;
    this.explorerType = Util.judgeExplorer();

    // 解析初始偏移量
    this.translateXY = this.parseTranslate(this.targetDom.style.transform);
    // 如果初始没有translate属性，则添加
    if (!this.regexp.test(this.targetDom.style.transform)) {
      this.targetDom.style.transform += ' translate(0px, 0px)';
    }

    this.listenMousedown(this.selfDom);
    this.listenMouseup(this.selfDom);
    if (this.moveBox) {
      this.listenMouseup(this.moveBox);
    }
    this.listenMouseleave(this.boxDom);
    this.listenMousemove(this.boxDom);
  }

  private onMouseDown() {
    this.isMouseDown = true;
    if (this.cursorStyle) {
      this.selfDom.style.cursor = 'grabbing';
    }
  }

  private onMouseUp() {
    this.isMouseDown = false;
    if (this.cursorStyle) {
      this.selfDom.style.cursor = 'grab';
    }
  }

  private onMouseLeave() {
    this.isMouseDown = false;
    if (this.cursorStyle) {
      this.selfDom.style.cursor = 'grab';
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isMouseDown) {
      this.translateXY = this.parseTranslate(this.targetDom.style.transform);
      const translateXYBak = { ...this.translateXY };
      // movementX IE浏览器不兼容
      this.moveX = this.explorerType === ExplorerType.IE ? (event.clientX - this.distanceX) : event.movementX;
      this.moveY = this.explorerType === ExplorerType.IE ? (event.clientY - this.distanceY) : event.movementY;
      switch (this.direction) {
        case 'horizontal':
          this.translateXY.x += this.moveX;
          break;
        case 'vertical':
          this.translateXY.y += this.moveY;
          break;
        default:
          this.translateXY.x += this.moveX;
          this.translateXY.y += this.moveY;
          break;
      }
      if (!this.isOutBox()) {
        this.changeTranslate(this.targetDom, this.translateXY.x, this.translateXY.y);
        this.positionChange.emit(this.translateXY);
      } else {
        this.translateXY = translateXYBak;
      }

      // 再次保存鼠标指针到x轴y轴距离
      this.distanceX = event.clientX;
      this.distanceY = event.clientY;
    }
  }

  private isOutBox() {
    if (!this.range) {
      return false;
    }
    this.range = {
      min: {
        x: this.isNullOrUndefined(this.range.min.x) ? -Infinity : this.range.min.x,
        y: this.isNullOrUndefined(this.range.min.y) ? -Infinity : this.range.min.y,
      },
      max: {
        x: this.isNullOrUndefined(this.range.max.x) ? Infinity : this.range.max.x,
        y: this.isNullOrUndefined(this.range.max.y) ? Infinity : this.range.max.y,
      }
    };
    if (
      this.translateXY.x < this.range.min.x
      || this.translateXY.y < this.range.min.y
      || this.translateXY.x > this.range.max.x
      || this.translateXY.y > this.range.max.y
    ) {
      return true;
    }
    return false;
  }

  private isNullOrUndefined(value: any) {
    return value === null || value === undefined;
  }

  private listenMousedown(target: HTMLElement) {
    target.addEventListener('mousedown', (e) => {
      // 鼠标按下的时候记录鼠标指针到window x，y轴距离
      this.distanceX = e.clientX;
      this.distanceY = e.clientY;
      this.onMouseDown();
    });
  }

  private listenMouseup(target: HTMLElement) {
    target.addEventListener('mouseup', () => {
      this.onMouseUp();
    });
  }

  private listenMouseleave(target: HTMLElement) {
    target.addEventListener('mouseleave', () => {
      this.onMouseLeave();
    });
  }

  private listenMousemove(target: HTMLElement) {
    target.addEventListener('mousemove', (event) => {
      this.onMouseMove(event);
    });
  }

  private parseTranslate(translateString: string) {
    const regexp = /translate\(([-\.\d]+)px[,\s]*([-\.\d]+)px[,\s]*\)/;
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

  private changeTranslate(dom: HTMLElement, x: number, y: number) {
    if (this.explorerType === ExplorerType.Firefox) {
      if (this.regexpFirefox.test(dom.style.transform)) {
        // Firefox  translate(0px, 0px)会转成translate(0px)
        dom.style.transform = dom.style.transform.replace(this.regexpFirefox, (match, p1, p2, p3) => {
          return p1 + x + p2 + ', ' + y + p2 + p3;
        });
      } else {
        dom.style.transform = dom.style.transform.replace(this.regexp, (match, p1, p2, p3) => {
          return p1 + x + p2 + y + p3;
        });
      }
    } else {
      dom.style.transform = dom.style.transform.replace(this.regexp, (match, p1, p2, p3) => {
        return p1 + x + p2 + y + p3;
      });
    }
  }

  public restore(pos?: { x?: number, y?: number }) {
    if (pos?.x === this.translateXY.x && pos?.y === this.translateXY.y) {
      return;
    }
    const x = pos?.x || 0;
    const y = pos?.y || 0;
    const targetDom = this.targetDragDom || this.selfDom;
    if (!this.regexp.test(targetDom.style.transform)) {
      targetDom.style.transform += ` translate(${x}px, ${y}px)`;
    } else {
      this.changeTranslate(targetDom, x, y);
    }
    this.translateXY = { x, y };
  }

}
