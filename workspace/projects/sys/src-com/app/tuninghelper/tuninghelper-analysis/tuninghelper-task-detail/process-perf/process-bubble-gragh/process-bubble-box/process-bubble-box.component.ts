import {
  Component,
  Input,
  OnInit,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  TemplateRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { AnalysisTarget } from 'sys/src-com/app/domain';
import { I18nService } from 'sys/src-com/app/service';
import { CpuTargetStatus, BubbleInfo } from '../../../domain';

@Component({
  selector: 'app-process-bubble-box',
  templateUrl: './process-bubble-box.component.html',
  styleUrls: ['./process-bubble-box.component.scss']
})
export class ProcessBubbleBoxComponent implements OnInit, AfterViewChecked {
  /** 包括外边距的气泡大小 */
  private readonly bubbleWidth = 24;
  private readonly bubbleHeight = 24;
  /** 气泡容器固定高度为96px，如有更新需要css里面同步修改 */
  private readonly containerHeight = 96;
  /** 气泡容器外包裹左右内边距之和 */
  private readonly wrapperPadding = 60;
  private readonly boxGradationWidth = 10;

  @ViewChild('bubbleBox') bubbleBox: ElementRef<HTMLDivElement>;

  @Input() status: CpuTargetStatus;
  @Input() active: boolean;
  @Input() threshold: {
    start: number;
    end: number;
  };
  @Input() currShowBubble: number;
  @Input() bubbleInfoTipContent: TemplateRef<any>;
  @Input() sysData: Array<BubbleInfo>;
  @Input() appData: Array<BubbleInfo>;
  @Input() shape: 'circle' | 'rect' | 'triangle';
  @Input() bubbleInfoMap: { [id: number]: any };
  @Input() type: 'core' | 'process' | 'thread';
  @Input() appTitle: string;

  @Output() bubbleClick = new EventEmitter<{ pid: number; type: 'sys' | 'app' }>();

  public i18n: any;
  public viewPageConfig: { [level in 'sys' | 'app']: any} = {
    sys: {
      pageSize: 0,
      pageNumber: 0,
      pageArr: [],
    },
    app: {
      pageSize: 0,
      pageNumber: 0,
      pageArr: [],
    }
  };

  private boxSize: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0,
  };

  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    this.listenResize();
  }

  private listenResize() {
    const rect = this.bubbleBox?.nativeElement.getBoundingClientRect();
    if (!rect || !this.sysData || !this.appData) { return; }
    // 两边都没有数据的时候不需要计算分页
    if (!this.sysData.length && !this.appData.length) { return; }
    if (rect.width !== this.boxSize.width || rect.height !== this.boxSize.height) {
      this.boxSize.width = rect.width;
      this.boxSize.height = rect.height;
      setTimeout(() => {
        this.computeViewPage(rect);
      }, 0);
    }
  }

  /**
   * 计算分页配置
   */
  private computeViewPage(rect: DOMRect) {
    // 在宽高无效时，直接返回
    if (!rect?.width || !rect?.height) {
      return;
    }
    // 计算出实际包裹气泡的container
    const containerWidth = (rect.width - this.boxGradationWidth) / 2 - this.wrapperPadding;
    const containerHeight = this.containerHeight;
    let rowNumber = Math.floor(containerWidth / this.bubbleWidth);
    let colNumber = Math.floor(containerHeight / this.bubbleHeight);

    const comWidth = rowNumber * this.bubbleWidth;
    if (comWidth > containerWidth) {
      rowNumber--;
    } else {
      const outNumber = Math.floor((containerWidth - comWidth) / this.bubbleWidth);
      rowNumber += outNumber;
    }

    const comHeight = colNumber * this.bubbleHeight;
    if (comHeight > containerHeight) {
      colNumber--;
    } else {
      const outNumber = Math.floor((containerHeight - comHeight) / this.bubbleHeight);
      colNumber += outNumber;
    }

    const pageConfig = {
      pageSize: rowNumber * colNumber,
      pageNumber: 1,
    };

    this.viewPageConfig.sys = {
      ...pageConfig,
      pageArr: this.getPageNumber(this.sysData.length, pageConfig.pageSize),
    };
    this.viewPageConfig.app = {
      ...pageConfig,
      pageArr: this.getPageNumber(this.appData.length, pageConfig.pageSize),
    };
  }

  /**
   * 根据总数和页大小计算页码数组
   */
  private getPageNumber(total: number, pageSize: number) {
    if (!total || !pageSize) {
      return [1];
    }
    const pageNumber = Math.ceil(total / pageSize);
    if (pageNumber === 1) {
      return [1];
    }
    const pageArr = [];
    for (let i = 1; i <= pageNumber; i++) {
      pageArr.push(i);
    }
    return pageArr;
  }

  public previousPage(level: 'sys' | 'app') {
    const pageConfig = this.viewPageConfig;
    if (pageConfig[level].pageNumber > 1) {
      pageConfig[level].pageNumber--;
    }
    // 再赋值一遍改变引用触发管道检测
    this.viewPageConfig[level] = { ...pageConfig[level] };
  }

  public nextPage(level: 'sys' | 'app') {
    const pageConfig = this.viewPageConfig;
    if (pageConfig[level].pageNumber < pageConfig[level].pageArr.length) {
      pageConfig[level].pageNumber++;
    }
    // 再赋值一遍改变引用触发管道检测
    this.viewPageConfig[level] = { ...pageConfig[level] };
  }

  public onBubbleClick(bubbleId: number, level: 'sys' | 'app') {
    this.bubbleClick.emit({
      pid: bubbleId,
      type: level
    });
  }
}
