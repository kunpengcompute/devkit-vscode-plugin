import {
  Component, OnInit, AfterViewInit,
  ChangeDetectorRef, ViewChild, ElementRef,
  TemplateRef, Input, EventEmitter, Output,
} from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { PanoramaAnalysisSvgElementInfo, MemorySubsystemSvgElementInfo } from '../../model/svg-model.model';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import {
  CpuDetailInfo, MemOverviewInfo, NetOverViewInfo,
  StorageOverViewInfo, MemDimmInfo,
} from '../../model/entity-model.model';

@Component({
  selector: 'app-panorama-analysis',
  templateUrl: './panorama-analysis.component.html',
  styleUrls: ['./panorama-analysis.component.scss']
})
export class PanoramaAnalysisComponent implements OnInit, AfterViewInit {
  static MEM_PIECE_NUM = 32;

  @ViewChild('panoramaWarpper', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild('cpuTip', { static: true, read: TemplateRef }) cpuTipTpl: TemplateRef<any>;
  @ViewChild('memoryTip', { static: true, read: TemplateRef }) memoryTipTpl: TemplateRef<any>;
  @ViewChild('storageTip', { static: true, read: TemplateRef }) storageTipTpl: TemplateRef<any>;
  @ViewChild('netTip', { static: true, read: TemplateRef }) netTipTpl: TemplateRef<any>;

  public panoramaDataCopy: any;
  @Input()
  set panoramaData(val) {
    this.panoramaDataCopy = val;
    this.renderSvgAction();
  }
  get panoramaData() {
    return this.panoramaDataCopy;
  }

  public memoryDataCopy: any;
  @Input()
  set memoryData(val) {
    this.memoryDataCopy = val;
    this.renderSvgAction();
  }
  get memoryData() {
    return this.memoryDataCopy;
  }

  @Output() clickElement =
  new EventEmitter<{ element: 'storage' | 'memory' | 'cpu' | 'network' | string, cpu: 'cpu0' | 'cpu1' | string }>();

  // 是否渲染
  @Input() isAllSvgChartShow: boolean;

  public i18n: any;

  // 记录被 mouseenter 事件污染（“触摸”）的元素对象
  public focusSvgElement: PanoramaAnalysisSvgElementInfo;

  // 存储所有SVG元素 和 其对应的信息的映射（map），便于提示引用
  // any ---- CpuPieceInfo | MemoryInfo | StoragePieceInfo | NetPieceInfo
  public panoramaPieceInfoMap: Map<PanoramaAnalysisSvgElementInfo, any>;
  public memoryPieceInfoMap: Map<MemorySubsystemSvgElementInfo, MemDimmInfo>;

  // SVG元素的数组，便于批量操作
  public panoramaAnalysisArray: Array<PanoramaAnalysisSvgElementInfo> = [];
  public memorySubsystemPieceArray: Array<MemorySubsystemSvgElementInfo> = [];

  // 所有有效的SVG元素的对象
  public storageSubsystemLeft = new PanoramaAnalysisSvgElementInfo(); // 存储子系统 左边
  public storageSubsystemRight = new PanoramaAnalysisSvgElementInfo(); // 存储子系统 右边

  public networkSubSystemLeft = new PanoramaAnalysisSvgElementInfo(); // 网络子系统 左边
  public networkSubSystemRight = new PanoramaAnalysisSvgElementInfo(); // 网络子系统 右边

  public cpuLeft = new PanoramaAnalysisSvgElementInfo(); // kunpeng 920 左边
  public cpuRight = new PanoramaAnalysisSvgElementInfo(); // kunpeng 920 右边

  public memorySubsystemModule = new PanoramaAnalysisSvgElementInfo(); // 内存子系统模块

  public memorySubsystemPieceLeft1 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 1
  public memorySubsystemPieceLeft2 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 2
  public memorySubsystemPieceLeft3 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 3
  public memorySubsystemPieceLeft4 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 4
  public memorySubsystemPieceLeft5 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 5
  public memorySubsystemPieceLeft6 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 6
  public memorySubsystemPieceLeft7 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 7
  public memorySubsystemPieceLeft8 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 8
  public memorySubsystemPieceLeft9 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 9
  public memorySubsystemPieceLeft10 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 10
  public memorySubsystemPieceLeft11 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 11
  public memorySubsystemPieceLeft12 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 12
  public memorySubsystemPieceLeft13 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 13
  public memorySubsystemPieceLeft14 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 14
  public memorySubsystemPieceLeft15 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 15
  public memorySubsystemPieceLeft16 = new MemorySubsystemSvgElementInfo(); // 内存子系统 左边 内存条 16

  public memorySubsystemPieceRight1 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 1
  public memorySubsystemPieceRight2 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 2
  public memorySubsystemPieceRight3 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 3
  public memorySubsystemPieceRight4 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 4
  public memorySubsystemPieceRight5 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 5
  public memorySubsystemPieceRight6 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 6
  public memorySubsystemPieceRight7 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 7
  public memorySubsystemPieceRight8 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 8
  public memorySubsystemPieceRight9 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 9
  public memorySubsystemPieceRight10 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 10
  public memorySubsystemPieceRight11 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 11
  public memorySubsystemPieceRight12 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 12
  public memorySubsystemPieceRight13 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 13
  public memorySubsystemPieceRight14 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 14
  public memorySubsystemPieceRight15 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 15
  public memorySubsystemPieceRight16 = new MemorySubsystemSvgElementInfo(); // 内存子系统 右边 内存条 16

  // tooltip 管理器
  private tooltipManager: TooltipManager;
  public niceTooltipInfo: {
    html: string | TemplateRef<any>,
    top: { pointX: number, pointY: number },
    bottom: { pointX: number, pointY: number },
    context: any,
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

    this.panoramaAnalysisArray.push(this.storageSubsystemLeft);
    this.panoramaAnalysisArray.push(this.storageSubsystemRight);

    this.panoramaAnalysisArray.push(this.networkSubSystemLeft);
    this.panoramaAnalysisArray.push(this.networkSubSystemRight);

    this.panoramaAnalysisArray.push(this.cpuLeft);
    this.panoramaAnalysisArray.push(this.cpuRight);

    this.panoramaAnalysisArray.push(this.memorySubsystemModule);
    const that: any = this;
    for (let i = 1; i < 17; i++) {
      this.memorySubsystemPieceArray.push(that['memorySubsystemPieceLeft' + i]);
    }

    for (let i = 1; i < 17; i++) {
      this.memorySubsystemPieceArray.push(that['memorySubsystemPieceRight' + i]);
    }
  }

  ngOnInit() { }

  ngAfterViewInit(): void {
    // 兼容IE11
    const doc: any = document;
    if (/*@cc_on!@*/false || !!doc.documentMode) {
      $(this.el.nativeElement.querySelector('svg')).attr({ width: 1480, height: 480 });
    }

    // 设置有效SVG元素选择器
    for (const item of this.panoramaAnalysisArray) {
      item.initSelectionById(this.el);
    }
    for (const item of this.memorySubsystemPieceArray) {
      item.initSelectionById(this.el);
    }

    // 设置渲染动作，并渲染(在设置完成有效SVG元素选择器之后)
    this.renderSvgAction = () => {
      if (!this.isAllSvgChartShow) {
        return;
      }
      if (this.panoramaDataCopy != null && Object.keys(this.panoramaDataCopy).length > 0
        && this.memoryDataCopy != null && Object.keys(this.memoryDataCopy).length > 0) {
        this.renderSVG(this.panoramaDataCopy, this.memoryDataCopy);
      }
    };
    this.renderSvgAction();

    this.tooltipManager = new TooltipManager(this);

    // 设置有效SVG元素的 mouseenter 、mouseleave 和 click 事件
    this.panoramaAnalysisArray.forEach((item: PanoramaAnalysisSvgElementInfo) => {
      item.selection
        .on('mouseenter', (evt) => {
          this.focusSvgElement = item;
          if (this.panoramaDataCopy != null && Object.keys(this.panoramaDataCopy).length > 0) {
            this.tooltipManager.show(item);
          }
          item.selection.attr('cursor', 'pointer');
          item.outSelection.attr('display', 'unset');
        })
        .on('mouseleave', (evt) => {
          this.tooltipManager.hidden();
          item.outSelection.attr('display', 'none');
        }).on('click', (evt) => { // emit 被点击元素
          let infoClicked = { element: '', cpu: '' };
          switch (item) {
            case this.storageSubsystemLeft:
              infoClicked = { element: 'storage', cpu: 'cpu0' };
              break;
            case this.storageSubsystemRight:
              infoClicked = { element: 'storage', cpu: 'cpu1' };
              break;
            case this.networkSubSystemLeft:
              infoClicked = { element: 'network', cpu: 'cpu0' };
              break;
            case this.networkSubSystemRight:
              infoClicked = { element: 'network', cpu: 'cpu1' };
              break;
            case this.cpuLeft:
              infoClicked = { element: 'cpu', cpu: 'cpu0' };
              break;
            case this.cpuRight:
              infoClicked = { element: 'cpu', cpu: 'cpu1' };
              break;
            case this.memorySubsystemModule:
              infoClicked = { element: 'memory', cpu: 'both' };
              break;
            default:
          }
          this.clickElement.emit(infoClicked);
        });
    });
  }

  public renderSVG(rawPanoramaData: any, rawMemData: any) {
    // 渲染全景
    const panorPieceInfoMap = this.convertPanoramaData(rawPanoramaData);
    this.panoramaPieceInfoMap = panorPieceInfoMap;
    [...panorPieceInfoMap.keys()].forEach((item: PanoramaAnalysisSvgElementInfo) => {
      const pieceInfo = panorPieceInfoMap.get(item);
      switch (pieceInfo.state) {
        case '1':
          break;
        case '0':
          item.selection.attr('display', 'none');
          item.textSelection.attr('display', 'none');
          item.fenceSelection.attr('display', 'none');
          item.pcieSelection.attr('display', 'none');
          break;
        default:
      }
    });

    // 渲染内存子系统
    const memPieceInfoMap = this.convertMemoryData(rawMemData);
    this.memoryPieceInfoMap = memPieceInfoMap;
    [...memPieceInfoMap.keys()].forEach((item: MemorySubsystemSvgElementInfo) => {
      const pieceState = memPieceInfoMap.get(item).pieceState;
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
  public convertPanoramaData(rawData: any): Map<PanoramaAnalysisSvgElementInfo, any> {
    const panoramaPieceInfoMap = new Map<PanoramaAnalysisSvgElementInfo, any>();

    const layoutInfo = rawData.relation.cpu;
    const cpu0 = layoutInfo.cpu0;
    const cpu1 = layoutInfo.cpu1;
    const memInfo = rawData.res_mem;

    if (memInfo != null && Object.keys(memInfo).length > 0) {
      const memoryInfo = new MemOverviewInfo('1', memInfo.dimm, parseInt(memInfo.max_capacity, 10), memInfo.null);
      panoramaPieceInfoMap.set(this.memorySubsystemModule, memoryInfo);
    } else {
      panoramaPieceInfoMap.set(this.memorySubsystemModule, new MemOverviewInfo('0'));
    }

    if (cpu0 != null && Object.keys(cpu0).length > 0) {
      const { res, storage, net } = cpu0;

      const cpuPieceInfo = new CpuDetailInfo('1', res.cpu_type, res.cpu_cores, res.current_freq, res.max_freq);
      panoramaPieceInfoMap.set(this.cpuLeft, cpuPieceInfo);

      if (storage != null && Object.keys(storage).length > 0) {
        const typeArr = [];
        const typeObj = storage.count_type;
        for (const item of Object.keys(typeObj)) {
          const typeItem = { type: item, size: typeObj[item].total, num: typeObj[item].num };
          typeArr.push(typeItem);
        }
        const storagePieceInfo = new StorageOverViewInfo('1', storage.count, typeArr);
        panoramaPieceInfoMap.set(this.storageSubsystemLeft, storagePieceInfo);
      } else {
        panoramaPieceInfoMap.set(this.storageSubsystemLeft, new StorageOverViewInfo('0'));
      }

      if (net != null && Object.keys(net).length > 0) {
        const netPieceInfo = new NetOverViewInfo('1', net.net_port);
        panoramaPieceInfoMap.set(this.networkSubSystemLeft, netPieceInfo);
      } else {
        panoramaPieceInfoMap.set(this.networkSubSystemLeft, new NetOverViewInfo('0'));
      }
    } else {
      panoramaPieceInfoMap.set(this.cpuLeft, new CpuDetailInfo('0'));
    }

    if (cpu1 != null && Object.keys(cpu1).length > 0) {
      const { res, storage, net } = cpu1;

      const cpuPieceInfo = new CpuDetailInfo('1', res.cpu_type, res.cpu_cores, res.current_freq, res.max_freq);
      panoramaPieceInfoMap.set(this.cpuRight, cpuPieceInfo);

      if (storage != null && Object.keys(storage).length > 0) {
        const typeArr = [];
        const typeObj = storage.count_type;
        for (const item of Object.keys(typeObj)) {
          const typeItem = { type: item, size: typeObj[item].total, num: typeObj[item].num };
          typeArr.push(typeItem);
        }
        const storagePieceInfo = new StorageOverViewInfo('1', storage.count, typeArr);
        panoramaPieceInfoMap.set(this.storageSubsystemRight, storagePieceInfo);
      } else {
        panoramaPieceInfoMap.set(this.storageSubsystemRight, new StorageOverViewInfo('0'));
      }

      if (net != null && Object.keys(net).length > 0) {
        const netPieceInfo = new NetOverViewInfo('1', net.net_port);
        panoramaPieceInfoMap.set(this.networkSubSystemRight, netPieceInfo);
      } else {
        panoramaPieceInfoMap.set(this.networkSubSystemRight, new NetOverViewInfo('0'));
      }
    } else {
      panoramaPieceInfoMap.set(this.cpuRight, new CpuDetailInfo('0'));
    }

    return panoramaPieceInfoMap;
  }

  /**
   * 处理接口数据并返回
   * @param rawData 接口数据
   */
  public convertMemoryData(rawData: any): Map<MemorySubsystemSvgElementInfo, MemDimmInfo> {
    const memPieceInfoMap = new Map<MemorySubsystemSvgElementInfo, MemDimmInfo>();

    const dimm = rawData.dimm;
    const posArr: string[] = dimm.pos;
    const capArr: string[] = dimm.cap;
    const cfgSpeedArr: string[] = dimm.cfg_speed;
    const maxSpeedArr: string[] = dimm.max_speed;

    const posArrLen = posArr.length;
    if (posArrLen === PanoramaAnalysisComponent.MEM_PIECE_NUM) { // 32 个插槽的情况
      for (let i = 0; i < PanoramaAnalysisComponent.MEM_PIECE_NUM; i++) {
        const pos = posArr[i].trim();
        const cap = capArr[i].trim();
        const cfgSpeed = cfgSpeedArr[i].trim();
        const maxSpeed = maxSpeedArr[i].trim();
        const pieceState = cap === 'No Module Installed' ? '10' : '11';

        const pieceInfo = new MemDimmInfo(pieceState, pos, cap, cfgSpeed, maxSpeed);
        memPieceInfoMap.set(this.memorySubsystemPieceArray[i], pieceInfo);
      }
    } else if (posArrLen === PanoramaAnalysisComponent.MEM_PIECE_NUM / 2) { // 16 个插槽的情况
      for (let i = 0; i < PanoramaAnalysisComponent.MEM_PIECE_NUM; i++) {
        let pieceInfo: MemDimmInfo;
        if (i % 2 === 0) {
          const pos = posArr[i / 2].trim();
          const cap = capArr[i / 2].trim();
          const cfgSpeed = cfgSpeedArr[i / 2].trim();
          const maxSpeed = maxSpeedArr[i / 2].trim();
          const pieceState = cap === 'No Module Installed' ? '10' : '11';
          pieceInfo = new MemDimmInfo(pieceState, pos, cap, cfgSpeed, maxSpeed);
        } else {
          const pieceState = '00';
          pieceInfo = new MemDimmInfo(pieceState);
        }
        memPieceInfoMap.set(this.memorySubsystemPieceArray[i], pieceInfo);
      }
    } else { // 虚拟机的情况
      const pos = posArr[0].trim();
      const cap = capArr[0].trim();
      const cfgSpeed = cfgSpeedArr[0].trim();
      const maxSpeed = maxSpeedArr[0].trim();
      const pieceState = cap === 'No Module Installed' ? '10' : '11';

      const pieceInfo = new MemDimmInfo(pieceState, pos, cap, cfgSpeed, maxSpeed);
      memPieceInfoMap.set(this.memorySubsystemPieceArray[0], pieceInfo);

      for (let i = 1; i < PanoramaAnalysisComponent.MEM_PIECE_NUM; i++) {
        const state = '10';
        const info = new MemDimmInfo(state);
        memPieceInfoMap.set(this.memorySubsystemPieceArray[i], info);
      }
    }

    return memPieceInfoMap;
  }
}

class TooltipManager {
  public ctx: PanoramaAnalysisComponent;

  constructor(ctx: PanoramaAnalysisComponent) {
    this.ctx = ctx;
  }

  public show(elementInfo: PanoramaAnalysisSvgElementInfo) {
    const selection = elementInfo.selection;
    if (selection.length === 0) {
      return;
    }

    // 计算 tooltip 提示的位置
    const clientRect = selection.get(0).getBoundingClientRect();
    const warpperRect = this.ctx.el.nativeElement.getBoundingClientRect();
    const top = clientRect.top - warpperRect.top;
    const left = clientRect.left - warpperRect.left;

    // 计算 tooltip 提示的内容
    const currentPieceInfo = this.ctx.panoramaPieceInfoMap.get(elementInfo);
    let html: TemplateRef<any>;
    switch (true) {
      case currentPieceInfo instanceof CpuDetailInfo:
        html = this.ctx.cpuTipTpl;
        break;
      case currentPieceInfo instanceof MemOverviewInfo:
        html = this.ctx.memoryTipTpl;
        break;
      case currentPieceInfo instanceof StorageOverViewInfo:
        html = this.ctx.storageTipTpl;
        break;
      case currentPieceInfo instanceof NetOverViewInfo:
        html = this.ctx.netTipTpl;
        break;
      default:
    }

    // 计算 tooltip 提示的位置 和 内容
    this.ctx.niceTooltipInfo = {
      top: {
        pointX: left + clientRect.width / 2,
        pointY: top
      },
      bottom: {
        pointX: left + clientRect.width / 2,
        pointY: top + clientRect.height
      },
      html,
      context: currentPieceInfo,
    };
    this.ctx.niceTooltipShow = true;
  }

  public hidden() {
    this.ctx.niceTooltipShow = false;
  }
}

