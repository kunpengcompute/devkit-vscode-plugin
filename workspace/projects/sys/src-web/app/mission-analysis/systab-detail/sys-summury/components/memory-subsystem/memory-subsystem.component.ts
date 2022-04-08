import { Component, OnInit, AfterViewInit, ChangeDetectorRef,
  TemplateRef, ElementRef, ViewChild, Input } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MemorySubsystemSvgElementInfo, PanoramaAnalysisSvgElementInfo } from '../../model/svg-model.model';
import { MemDimmInfo } from '../../model/entity-model.model';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-memory-subsystem',
  templateUrl: './memory-subsystem.component.html',
  styleUrls: ['./memory-subsystem.component.scss']
})
export class MemorySubsystemComponent implements OnInit, AfterViewInit {
  static MEM_PIECE_NUM = 32;
  public i18n: any;

  @ViewChild('memoryWarpper', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild('memoryTip', { static: true, read: TemplateRef }) memoryTipTpl: TemplateRef<any>;

  public memoryDataCopy: any;
  @Input()
  set memoryData(val) {
    this.memoryDataCopy = val;
    this.renderSvgAction();
  }
  get memoryData() {
    return this.memoryDataCopy;
  }

  // 是否渲染
  @Input() isAllSvgChartShow: boolean;

  // 头部的信息
  public headInfo = {
    dimm: 0,
    null: 0,
    totalMem: '0G',
    pswpin_sec: 0,
    pswpout_sec: 0,
    memused_percentage: 0,
  };

  // 记录被 mouseenter 事件污染（“触摸”）的元素对象
  public currentSvgElement: MemorySubsystemSvgElementInfo;

  // 存储所有SVG元素（MemorySubsystem）的数组，便于批量操作
  public memorySubsystemArray: Array<MemorySubsystemSvgElementInfo> = [];

  // 存储所有SVG元素（MemorySubsystem）和 其对应的内存条的信息的映射（map），便于提示引用
  public memoryPieceInfoMap: Map<MemorySubsystemSvgElementInfo, MemDimmInfo>;
  public cpuPieceInfoMap: Map<MemorySubsystemSvgElementInfo, MemDimmInfo>;

  // 所有有效的SVG元素的对象
  public SOCKET_0_CHANNEL_0_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_0_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_1_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_1_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_2_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_2_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_3_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_3_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_4_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_4_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_5_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_5_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_6_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_6_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_7_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_0_CHANNEL_7_DIMM_1 = new MemorySubsystemSvgElementInfo();

  public SOCKET_1_CHANNEL_0_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_0_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_1_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_1_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_2_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_2_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_3_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_3_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_4_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_4_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_5_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_5_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_6_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_6_DIMM_1 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_7_DIMM_0 = new MemorySubsystemSvgElementInfo();
  public SOCKET_1_CHANNEL_7_DIMM_1 = new MemorySubsystemSvgElementInfo();

  // 关于 tooltip
  private tooltipManager: TooltipShowManager;
  public niceTooltipInfo: {
    html: TemplateRef<any>,
    context: MemDimmInfo,
    bottom: { pointX: number, pointY: number, },
  };
  public niceTooltipShowCopy = false;
  set niceTooltipShow(val) {
    this.niceTooltipShowCopy = val;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
  get niceTooltipShow() {
    return this.niceTooltipShowCopy;
  }

  // 渲染动作
  public renderSvgAction = () => { };

  constructor(
    public axios: AxiosService,
    private cdr: ChangeDetectorRef,
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
    // 设置有效SVG元素的轮廓的选择器
    const that: any = this;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 8; j++) {
        for (let n = 0; n < 2; n++) {
          this.memorySubsystemArray.push(that['SOCKET_' + i + '_CHANNEL_' + j + '_DIMM_' + n]);
        }
      }
    }
  }

  ngOnInit() { }

  ngAfterViewInit(): void {
    // 兼容IE11
    const doc: any = document;
    if (/*@cc_on!@*/false || !!doc.documentMode) {
      $(this.el.nativeElement.querySelector('svg')).attr({ width: 1480, height: 480 });
    }

    for (const item of this.memorySubsystemArray) {
      item.initSelectionById(this.el);
    }

    // 渲染
    this.renderSvgAction = () => {
      if (!this.isAllSvgChartShow) {
        return;
      }

      if (this.memoryData != null && Object.keys(this.memoryData).length > 0) {
        this.renderSVG(this.memoryData);
        this.headInfo = {
          dimm: this.memoryData.dimm.dimm,
          null: this.memoryData.dimm.null,
          totalMem: this.memoryData.dimm.total_mem + 'G',
          pswpin_sec: this.memoryData.dimm.pswpin_sec,
          pswpout_sec: this.memoryData.dimm.pswpout_sec,
          memused_percentage: this.memoryData.dimm.memused_percentage,
        };
        this.cdr.detectChanges();
      }
    };
    this.renderSvgAction();

    this.memorySubsystemArray.forEach((item: MemorySubsystemSvgElementInfo) => {
      item.selection.on('mouseenter', () => {
        this.currentSvgElement = item;
        item.outSelection.attr('display', 'unset');
        if (this.memoryData != null && Object.keys(this.memoryData).length > 0) {
          this.tooltipManager.show(item);
        }
      }).on('mouseleave', () => {
        item.outSelection.attr('display', 'none');
        this.tooltipManager.hidden();
      });
    });

    this.tooltipManager = new TooltipShowManager(this);
  }

  renderSVG(rawData: any) {
    const pieceInfoMap = this.convertMemoryData(rawData);
    this.memoryPieceInfoMap = pieceInfoMap;
    [...pieceInfoMap.keys()].forEach((item: MemorySubsystemSvgElementInfo) => {
      const pieceState = pieceInfoMap.get(item).pieceState;
      switch (pieceState) {
        case '11':
          break;
        case '10':
          item.selection.attr('display', 'none');
          break;
        case '00':
          item.selection.attr('display', 'none');
          item.slotSelection.attr('display', 'none');
          break;
      }
    });
  }

  /**
   * 处理接口数据并返回
   * @param rawData 接口数据
   */
  public convertMemoryData(rawData: any): Map<MemorySubsystemSvgElementInfo, MemDimmInfo> {
    const pieceInfoMap = new Map<MemorySubsystemSvgElementInfo, MemDimmInfo>();

    const dimm = rawData.dimm;
    const posArr: string[] = dimm.pos;
    const capArr: string[] = dimm.cap;
    const cfgSpeedArr: string[] = dimm.cfg_speed;
    const maxSpeedArr: string[] = dimm.max_speed;
    const memTypeArr: string[] = dimm.mem_type;

    const posArrLen = posArr.length;
    if (posArrLen === MemorySubsystemComponent.MEM_PIECE_NUM) { // 32 个插槽的情况
      for (let i = 0; i < MemorySubsystemComponent.MEM_PIECE_NUM; i++) {
        const pos = posArr[i].trim();
        const cap = capArr[i].trim();
        const cfgSpeed = cfgSpeedArr[i].trim();
        const maxSpeed = maxSpeedArr[i].trim();
        const pieceState = cap === 'No Module Installed' ? '10' : '11';
        const memType = memTypeArr[i].trim();

        const pieceInfo = new MemDimmInfo(pieceState, pos, cap, cfgSpeed, maxSpeed, memType);
        pieceInfoMap.set(this.memorySubsystemArray[i], pieceInfo);
      }
    } else if (posArrLen === MemorySubsystemComponent.MEM_PIECE_NUM / 2) { // 16 个插槽的情况
      for (let i = 0; i < MemorySubsystemComponent.MEM_PIECE_NUM; i++) {
        let pieceInfo: MemDimmInfo;
        if (i % 2 === 0) {
          const pos = posArr[i / 2].trim();
          const cap = capArr[i / 2].trim();
          const cfgSpeed = cfgSpeedArr[i / 2].trim();
          const maxSpeed = maxSpeedArr[i / 2].trim();
          const pieceState = cap === 'No Module Installed' ? '10' : '11';
          const memType = memTypeArr[i / 2].trim();
          pieceInfo = new MemDimmInfo(pieceState, pos, cap, cfgSpeed, maxSpeed, memType);
        } else {
          const pieceState = '00';
          pieceInfo = new MemDimmInfo(pieceState);
        }
        pieceInfoMap.set(this.memorySubsystemArray[i], pieceInfo);
      }
    } else { // 虚拟机的情况
      const pos = posArr[0].trim();
      const cap = capArr[0].trim();
      const cfgSpeed = cfgSpeedArr[0].trim();
      const maxSpeed = maxSpeedArr[0].trim();
      const pieceState = cap === 'No Module Installed' ? '10' : '11';
      const memType = memTypeArr[0].trim();

      const pieceInfo = new MemDimmInfo(pieceState, pos, cap, cfgSpeed, maxSpeed, memType);
      pieceInfoMap.set(this.memorySubsystemArray[0], pieceInfo);

      for (let i = 1; i < MemorySubsystemComponent.MEM_PIECE_NUM; i++) {
        const pieceState1 = '10';
        const pieceInfo1 = new MemDimmInfo(pieceState1);
        pieceInfoMap.set(this.memorySubsystemArray[i], pieceInfo1);
      }
    }

    return pieceInfoMap;
  }
}

/**
 * tooltip管理器
 */
class TooltipShowManager {
  public ctx: MemorySubsystemComponent;
  public leftElementInfoSet: Set<MemorySubsystemSvgElementInfo>;

  constructor(ctx: MemorySubsystemComponent) {
    this.ctx = ctx;
    const that: any = this;
    this.leftElementInfoSet = new Set();
    for (let j = 0; j < 8; j++) {
      for (let n = 0; n < 2; n++) {
        this.leftElementInfoSet.add(that.ctx['SOCKET_0_CHANNEL_' + j + '_DIMM_' + n]);
      }
    }
  }

  public show(elementInfo: MemorySubsystemSvgElementInfo) {
    const selection = elementInfo.selection;
    if (selection.length === 0) {
      return;
    }

    // 计算 tooltip 的位置
    const clientRect = selection.get(0).getBoundingClientRect();
    const warpperRect = this.ctx.el.nativeElement.getBoundingClientRect();
    const top = clientRect.top - warpperRect.top + clientRect.height;
    const left = clientRect.left - warpperRect.left;
    const pointX = this.leftElementInfoSet.has(elementInfo)
      ? left + 9
      : left + clientRect.width - 9;
    // 计算 tooltip 的内容
    const pieceInfo: MemDimmInfo = this.ctx.memoryPieceInfoMap.get(elementInfo);

    // 设置 tooltip 的位置和内容
    this.ctx.niceTooltipInfo = {
      bottom: {
        pointX,
        pointY: top
      },
      html: this.ctx.memoryTipTpl,
      context: pieceInfo,
    };
    this.ctx.niceTooltipShow = true;
  }

  public hidden() {
    this.ctx.niceTooltipShow = false;
  }
}
