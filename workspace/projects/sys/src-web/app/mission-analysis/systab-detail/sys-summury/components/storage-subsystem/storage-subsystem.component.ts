import { Component, OnInit, AfterViewInit, ElementRef,
  ViewChild, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { StorageSubsystemSvgElementInfo } from '../../model/svg-model.model';
import { StoragePieceInfo } from '../../model/entity-model.model';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-storage-subsystem',
  templateUrl: './storage-subsystem.component.html',
  styleUrls: ['./storage-subsystem.component.scss']
})
export class StorageSubsystemComponent implements OnInit, AfterViewInit {
  static STORAGE_PIECE_NUM = 27;
  public i18n: any;

  @ViewChild('storageWarpper', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild('storageTip', { static: true, read: TemplateRef }) storageTipTpl: TemplateRef<any>;

  public storageDataCopy: any;
  @Input()
  set storageData(val) {
    this.storageDataCopy = val;
    this.renderSvgAction();
  }
  get storageData() {
    return this.storageDataCopy;
  }

  // 指明点击下转的cpu
  public currentCpuCopy: string;
  @Input()
  set currentCpu(val) {
    this.currentCpuCopy = val;
    this.renderSvgAction();
  }
  get currentCpu() {
    return this.currentCpuCopy;
  }

  // 是否渲染
  @Input() isAllSvgChartShow: boolean;

  // 头部的信息
  public headInfo: { diskNum: number, totalSize: number } = { diskNum: 0, totalSize: 0 };

  // 记录被 mouseenter 事件污染（“触摸”）的元素对象
  public currentSvgElement: StorageSubsystemSvgElementInfo;

  // 存储所有SVG元素的数组，便于批量操作
  public storageSubsystemArray: Array<StorageSubsystemSvgElementInfo> = [];

  // 存储所有SVG元素 和 其对应的内存条的信息的映射（map），便于提示引用
  public storagePieceInfoMap: Map<StorageSubsystemSvgElementInfo, StoragePieceInfo>;

  // 所有有效的SVG元素的对象
  public storageRow1Col1 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 1 列
  public storageRow1Col2 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 2 列
  public storageRow1Col3 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 3 列
  public storageRow1Col4 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 4 列
  public storageRow1Col5 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 5 列
  public storageRow1Col6 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 6 列
  public storageRow1Col7 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 7 列
  public storageRow1Col8 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 8 列
  public storageRow1Col9 = new StorageSubsystemSvgElementInfo(); // 第 1 行，第 9 列

  public storageRow2Col1 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 1 列
  public storageRow2Col2 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 2 列
  public storageRow2Col3 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 3 列
  public storageRow2Col4 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 4 列
  public storageRow2Col5 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 5 列
  public storageRow2Col6 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 6 列
  public storageRow2Col7 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 7 列
  public storageRow2Col8 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 8 列
  public storageRow2Col9 = new StorageSubsystemSvgElementInfo(); // 第 2 行，第 9 列

  public storageRow3Col1 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 1 列
  public storageRow3Col2 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 2 列
  public storageRow3Col3 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 3 列
  public storageRow3Col4 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 4 列
  public storageRow3Col5 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 5 列
  public storageRow3Col6 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 6 列
  public storageRow3Col7 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 7 列
  public storageRow3Col8 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 8 列
  public storageRow3Col9 = new StorageSubsystemSvgElementInfo(); // 第 3 行，第 9 列

  // tooltip
  private tooltipManager: TooltipManager;
  public niceTooltipInfo: {
    html: TemplateRef<any>,
    context: StoragePieceInfo,
    top: { pointX: number, pointY: number },
    bottom: { pointX: number, pointY: number }
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
    private cdr: ChangeDetectorRef,
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
    // 设置有效SVG元素的选择器
    const that: any = this;
    for (let i = 1; i < 4; i++) {
      for (let j = 1; j < 10; j++) {
        this.storageSubsystemArray.push(that['storageRow' + i + 'Col' + j]);
      }
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // 兼容IE11
    const doc: any = document;
    if (/*@cc_on!@*/false || !!doc.documentMode) {
      $(this.el.nativeElement.querySelector('svg')).attr({ width: 1480, height: 480 });
    }

    // 初始化选择器
    for (const item of this.storageSubsystemArray) {
      item.initSelectionById(this.el);
    }

    // 渲染
    this.renderSvgAction = () => {
      if (!this.isAllSvgChartShow) {
        return;
      }
      if (this.storageDataCopy != null && Object.keys(this.storageDataCopy).length > 0) {
        this.renderSVG(this.storageDataCopy);
      }
    };
    this.renderSvgAction();

    // 初始化tooltip管理器
    this.tooltipManager = new TooltipManager(this);

    // 设置有效SVG元素的 mouseenter 和 mouseleave 事件
    this.storageSubsystemArray.forEach((item: StorageSubsystemSvgElementInfo) => {
      item.selection
        .on('mouseenter', () => {
          this.currentSvgElement = item;
          if (this.storageDataCopy != null && Object.keys(this.storageDataCopy).length > 0) {
            this.tooltipManager.show(item);
          }
          item.outSelection.attr('display', 'unset');
        })
        .on('mouseleave', () => {
          this.tooltipManager.hidden();
          item.outSelection.attr('display', 'none');
        });
    });
  }

  renderSVG(rawData: any) {
    const pieceInfoMap = this.convertMemoryData(rawData);
    this.storagePieceInfoMap = pieceInfoMap;
    [...pieceInfoMap.keys()].forEach((item: StorageSubsystemSvgElementInfo) => {
      const pieceInfo = pieceInfoMap.get(item);
      switch (pieceInfo.state) {
        case '1':
          item.textSelection.find('tspan').text(pieceInfo.name);
          item.selection.attr('display', 'unset');
          item.textSelection.attr('display', 'unset');
          break;
        case '0':
          item.selection.attr('display', 'none');
          item.textSelection.attr('display', 'none');
          break;
        default:
      }
    });
  }

  /**
   * 处理接口数据并返回
   * @param rawData 接口数据
   */
  public convertMemoryData(rawData: any): Map<StorageSubsystemSvgElementInfo, StoragePieceInfo> {
    const targetCpnRawData = rawData[this.currentCpuCopy]; // 选择目标cpu
    const diskConfiglist = targetCpnRawData.storage;

    const storagePieceInfoMap = new Map<StorageSubsystemSvgElementInfo, StoragePieceInfo>();
    let actLen = diskConfiglist.length;
    for (let i = 0; i < StorageSubsystemComponent.STORAGE_PIECE_NUM; i++, actLen--) {
      let pieceInfo: StoragePieceInfo;
      if (actLen > 0) {
        const disk = diskConfiglist[i];
        pieceInfo = new StoragePieceInfo('1',
        disk.name, disk.type, disk.cap, disk.model, disk.avgqu_sz, disk.await, disk.svctm, disk.util);
      } else {
        pieceInfo = new StoragePieceInfo('0');
      }
      storagePieceInfoMap.set(this.storageSubsystemArray[i], pieceInfo);
    }

    this.headInfo = targetCpnRawData.introduction;
    this.cdr.detectChanges();

    return storagePieceInfoMap;
  }
}

class TooltipManager {
  public ctx: StorageSubsystemComponent;

  constructor(ctx: StorageSubsystemComponent) {
    this.ctx = ctx;
  }

  public show(elementInfo: StorageSubsystemSvgElementInfo) {
    const selection = elementInfo.selection;
    if (selection.length === 0) {
      return;
    }

    // 计算 tooltip 的位置
    const clientRect = selection.get(0).getBoundingClientRect();
    const warpperRect = this.ctx.el.nativeElement.getBoundingClientRect();
    const top = clientRect.top - warpperRect.top;
    const left = clientRect.left - warpperRect.left;

    // 计算 tooltip 的内容
    const pieceInfo: StoragePieceInfo = this.ctx.storagePieceInfoMap.get(elementInfo);

    this.ctx.niceTooltipInfo = {
      top: {
        pointX: left + clientRect.width / 2,
        pointY: top
      },
      bottom: {
        pointX: left + clientRect.width / 2,
        pointY: top + clientRect.height
      },
      html: this.ctx.storageTipTpl,
      context: pieceInfo,
    };
    this.ctx.niceTooltipShow = true;
  }

  public hidden() {
    this.ctx.niceTooltipShow = false;
  }
}
