import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss']
})
/**
 * <app-divider [leftEle]="leftdiv" [rightEle]="rightdiv"></app-divider>
 */
export class DividerComponent implements OnInit {


  /** 鼠标按下时坐标 */
  public downPosition: { x: number, y: number };

  /** 左边元素的大小 */
  public leftSize: { width: number, height: number };

  /** 右边元素的大小 */
  public rightSize: { width: number, height: number };

  /** 鼠标是否按下 */
  public isMouseDown = false;

  /** 是否展开 */
  public expendState = false;
  /** 允许移动 */
  public onmouse = true;

  /** 是否单独显示分割组件功能 */
  @Input() showDivider: boolean;
  /** 左边元素 */
  @Input() leftEle: any;

  /** 右边元素 */
  @Input() rightEle: any;
  /** 触发展开收起以及拖拽事件 */
  @Output() public dividerEV = new EventEmitter<any>();

  /** 分隔组件 */
  @ViewChild('divider', { static: false }) divider: ElementRef;


  constructor() { }

  ngOnInit(): void {
    if (this.showDivider) {
      this.onDivider();
    }
  }
  public onDivider() {
    // 鼠标移动事件监听
    document.onmousemove = (ev: MouseEvent) => {
      if (this.onmouse) {
        this.divider.nativeElement.style.cursor = 'col-resize';
        if (this.isMouseDown) { // 如果鼠标是按下状态
          const width: number = this.leftSize.width + this.rightSize.width; // 计算左右元素宽度和
          const offsetX: number = ev.x - this.downPosition.x; // 计算鼠标相对偏移量
          const leftWidth = (this.leftSize.width + offsetX) * 100 / width; // 计算左元素的宽度占比
          const rightWidth = (this.rightSize.width - offsetX) * 100 / width; // 计算右元素的宽度占比
          this.leftEle.style.width = 'calc(' + leftWidth + '% - 5px)'; // 设置左元素的宽度
          this.rightEle.style.width = 'calc(' + rightWidth + '% - 5px)'; // 设置右元素的宽度
          this.dividerEV.emit(true);
        }
      } else {
        this.divider.nativeElement.style.cursor = 'default';
      }
      return false; // 必须返回false，否则会触发系统事件，导致功能异常
    };

    // 鼠标按下事件监听
    document.onmousedown = (ev: MouseEvent) => {
      if (!this.onmouse) { return; }
      if (this.divider.nativeElement === ev.target) { // 如果对象是分隔组件
        this.downPosition = { x: ev.x, y: ev.y }; // 记录下鼠标坐标
        this.leftSize = { width: this.leftEle.offsetWidth, height: this.leftEle.offsetHeight }; // 获取左元素大小
        this.rightSize = { width: this.rightEle.offsetWidth, height: this.rightEle.offsetHeight }; // 获取右元素大小
        this.isMouseDown = true; // 鼠标按下状态设置为true
      }
    };

    // 鼠标松开事件监听
    document.onmouseup = (ev: MouseEvent) => {
      if (!this.onmouse) { return; }
      this.isMouseDown = false; // 鼠标按下状态设置为false
    };
  }
  public toggleLeft() {
    this.expendState = !this.expendState;
    if (this.expendState) {
      this.expand();
      this.dividerEV.emit(true);
    } else {
      this.hide();
      this.dividerEV.emit(false);
    }
  }
  public expand() {
    this.expendState = true;
    this.rightEle.style.width = '560px';
    this.leftEle.style.width = 'calc(100% - 560px)';
    this.onmouse = true;
    this.onDivider();
  }
  public hide() {
    this.expendState = false;
    this.rightEle.style.width = '0px';
    this.leftEle.style.width = '100%';
    this.onmouse = false;
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}
