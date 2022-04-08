import { Component, OnInit, ViewChild, ElementRef, Input, Output,
  EventEmitter, AfterViewInit, HostListener } from '@angular/core';
import { HotPercentDomain } from '../../reference/index';
import { ExtrapositionAxisService } from '../../service/extraposition-axis.service';

enum HolderEuem {
  LEFT_VERNIER,
  RIGHT_VERNIER,
  HOTSPOT
}

interface HotspotTransformInfo {
  enable: boolean;
  left: number;
  width: number;
  hotDomain: HotPercentDomain;
}

@Component({
  selector: 'app-extraposition-axis-operation',
  templateUrl: './extraposition-axis-operation.component.html',
  styleUrls: ['./extraposition-axis-operation.component.scss']
})
export class ExtrapositionAxisOperationComponent implements OnInit, AfterViewInit {
  @ViewChild('warpper', { static: true, read: ElementRef }) warpperEl: ElementRef;
  @ViewChild('axisBox', { static: true, read: ElementRef }) axisBoxEl: ElementRef;
  @ViewChild('virtualHotspot', { static: true, read: ElementRef }) virtualHotspotEL: ElementRef;
  @ViewChild('essentialHotspot', { static: true, read: ElementRef }) essentialHotspotEl: ElementRef;
  @ViewChild('vernierLeft', { static: true, read: ElementRef }) vernierLeftEl: ElementRef;
  @ViewChild('vernierRight', { static: true, read: ElementRef }) vernierRightEl: ElementRef;

  /** 输入的“热点”区域的范围 */
  @Input()
  set hotDomain(val: HotPercentDomain) {
    if (val != null) {
      this.currentHotDomain = val;
    }
  }

  /** “热点区域”偏移事件 */
  @Output() axisTransform = new EventEmitter<HotPercentDomain>();

  /** 选择器 */
  private warpperSelection: JQuery;
  private axisBoxSelection: JQuery;
  private virtualHotspotSelection: JQuery;
  private essentialHotspotSelection: JQuery;
  private vernierLeftSelection: JQuery;
  private vernierRightSelection: JQuery;

  /** 当前鼠标移动事件的拥有者 */
  private mouseenterHolderStack: Array<HolderEuem> = [];
  private mousedownHolderStack: Array<HolderEuem> = [];

  /** 记录xxx FIXME */
  private prevClientX: number;

  private currentHotDomain: HotPercentDomain;

  private mousemoveThrottler: any = null;

  constructor(
    private axisService: ExtrapositionAxisService,
  ) { }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMousemove(evt: any) {
    evt.preventDefault();

    if (this.mousemoveThrottler != null) { return; }
    this.mousemoveThrottler = setTimeout(() => {
      // 取得 Mouusedown 事件的拥有者
      const stackLen = this.mousedownHolderStack.length;
      if (stackLen < 1) { return; }
      const holder = this.mousedownHolderStack[stackLen - 1];

      // 计算 Mousemove 事件的 “步进值”
      const nowClientX = evt.clientX;
      const progress = nowClientX - (this.prevClientX == null ? nowClientX : this.prevClientX);
      this.prevClientX = nowClientX;

      this.mousemoveThrottler = null;
    }, 200);
  }

  /**
   * 设置可操作元素的选择器
   */
  ngOnInit(): void {
    this.warpperSelection = $(this.warpperEl.nativeElement);
    this.axisBoxSelection = $(this.axisBoxEl.nativeElement);
    this.virtualHotspotSelection = $(this.virtualHotspotEL.nativeElement);
    this.essentialHotspotSelection = $(this.essentialHotspotEl.nativeElement);
    this.vernierLeftSelection = $(this.vernierLeftEl.nativeElement);
    this.vernierRightSelection = $(this.vernierRightEl.nativeElement);

    this.attachEvent();
  }

  ngAfterViewInit(): void { }

  /**
   * 绑定 “游标” 平移的相关事件； 计算平移的数据； 渲染 “热点区域” 的位置，并触发 axisTransform 事件
   * @param vLeftSlection 左边 “游标” 的DOM的选择器
   * @param vRightSelection 右边边 “游标” 的DOM的选择器
   */
  private attachEvent() {
    // mouseenter 事件
    this.vernierLeftSelection.on('mouseenter', (e) => {
      this.mouseenterHolderStack.push(HolderEuem.LEFT_VERNIER);
    });
    this.vernierRightSelection.on('mouseenter', (e) => {
      this.mouseenterHolderStack.push(HolderEuem.RIGHT_VERNIER);
    });
    this.essentialHotspotSelection.on('mouseenter', (e) => {
      this.mouseenterHolderStack.push(HolderEuem.HOTSPOT);
    });

    // mouseleave 事件
    this.vernierLeftSelection.on('mouseleave', (e) => {
      this.mouseenterHolderStack.pop();
    });
    this.vernierRightSelection.on('mouseleave', (e) => {
      this.mouseenterHolderStack.pop();
    });
    this.essentialHotspotSelection.on('mouseleave', (e) => {
      this.mouseenterHolderStack.pop();
    });
    this.warpperSelection.on('mouseleave', (e) => {
      const holder = this.mousedownHolderStack.pop();
      if (holder === HolderEuem.HOTSPOT) {
        this.mousedownHolderStack.push(holder);
      }
    });

    // mousedown 事件
    this.vernierLeftSelection.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.mousedownHolderStack.push(HolderEuem.LEFT_VERNIER);
    });
    this.vernierRightSelection.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.mousedownHolderStack.push(HolderEuem.RIGHT_VERNIER);
    });
    this.essentialHotspotSelection.on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.mousedownHolderStack.push(HolderEuem.HOTSPOT);
    });

    // mouseup 事件
    $(document).on('mouseup', (e) => {
      this.mousedownHolderStack.pop();
      this.prevClientX = null;
    });
  }

  /**
   * xxx
   */
  private precomputeHotspotTransformInfo(holder: HolderEuem, progress: number): HotspotTransformInfo {
    const axisBoxLeft = this.axisBoxSelection.offset().left;
    const axisBoxWidth = this.axisBoxSelection.width();
    const axisBoxRight = axisBoxLeft + axisBoxWidth;

    let virtualHotspotLeft = this.virtualHotspotSelection.offset().left;
    let virtualHotspotWidth = this.virtualHotspotSelection.width();
    let virtualHotspotRight = virtualHotspotLeft + virtualHotspotWidth;

    switch (holder) {
      case HolderEuem.LEFT_VERNIER:
        virtualHotspotLeft += progress;
        virtualHotspotWidth -= progress;
        break;
      case HolderEuem.RIGHT_VERNIER:
        virtualHotspotRight += progress;
        virtualHotspotWidth += progress;
        break;
      case HolderEuem.HOTSPOT:
        virtualHotspotLeft += progress;
        virtualHotspotRight += progress;
        break;
      default:
    }

    const enable = axisBoxLeft <= virtualHotspotLeft
      && virtualHotspotWidth > 30
      && virtualHotspotRight <= axisBoxRight;

    const leftPercent = (virtualHotspotLeft - axisBoxLeft) / (axisBoxWidth + 0.000001) * 100;
    const rightPercent = (virtualHotspotRight - axisBoxLeft) / (axisBoxWidth + 0.000001) * 100;

    return {
      enable,
      left: virtualHotspotLeft,
      width: virtualHotspotWidth,
      hotDomain: [leftPercent, rightPercent],
    };
  }
}
