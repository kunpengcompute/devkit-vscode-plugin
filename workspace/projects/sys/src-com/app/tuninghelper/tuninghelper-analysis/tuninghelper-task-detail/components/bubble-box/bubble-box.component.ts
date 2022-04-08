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
import { I18nService } from 'sys/src-com/app/service';
import { BubbleInfo, CpuTargetStatus } from '../../domain';

@Component({
  selector: 'app-bubble-box',
  templateUrl: './bubble-box.component.html',
  styleUrls: ['./bubble-box.component.scss'],
})
export class BubbleBoxComponent implements OnInit, AfterViewChecked {
  private readonly bubbleWidth = 24;
  private readonly bubbleHeight = 24;
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
  @Input() data: Array<BubbleInfo>;
  @Input() numaStatistic: {
    [numaId: number]: number;
  };
  @Input() shape: 'circle' | 'rect' | 'triangle';
  @Input() bubbleInfoMap: { [id: number]: any };
  @Input() type: 'core' | 'process' | 'thread';

  @Output() bubbleClick = new EventEmitter<number>();

  public i18n: any;
  public viewPageConfig: any = {
    pageSize: 0,
    pageNumber: 0,
    pageArr: [],
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
    if (!rect || !this.data) { return; }
    if (rect.width !== this.boxSize.width || rect.height !== this.boxSize.height) {
      this.boxSize.width = rect.width;
      this.boxSize.height = rect.height;
      setTimeout(() => {
        this.computeViewPage();
      }, 0);
    }
  }

  /**
   * 计算分页配置
   */
  private computeViewPage() {
    const rect = this.bubbleBox?.nativeElement.getBoundingClientRect();
    // 在宽高无效时，直接返回
    if (!rect?.width || !rect?.height) {
      return;
    }
    let boxWidth = rect.width;
    const boxHeight = rect.height;
    // 如果没有数据的话，右侧的渐变条也会隐藏掉，所以减去渐变条的宽度
    if (!this.data.length) {
      boxWidth -= this.boxGradationWidth;
    }
    let rowNumber = Math.floor(boxWidth / this.bubbleWidth);
    let colNumber = Math.floor(boxHeight / this.bubbleHeight);

    const comWidth = rowNumber * this.bubbleWidth;
    if (comWidth > boxWidth) {
      rowNumber--;
    } else {
      const outNumber = Math.floor((boxWidth - comWidth) / this.bubbleWidth);
      rowNumber += outNumber;
    }

    const comHeight = colNumber * this.bubbleHeight;
    if (comHeight > boxHeight) {
      colNumber--;
    } else {
      const outNumber = Math.floor((boxHeight - comHeight) / this.bubbleHeight);
      colNumber += outNumber;
    }

    const pageConfig = {
      pageSize: rowNumber * colNumber,
      pageNumber: 1,
    };

    this.viewPageConfig = {
      ...pageConfig,
      pageArr: this.getPageNumber(this.data.length, pageConfig.pageSize),
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

  public previousPage() {
    const pageConfig = this.viewPageConfig;
    if (pageConfig.pageNumber > 1) {
      pageConfig.pageNumber--;
    }
    // 再赋值一遍改变引用触发管道检测
    this.viewPageConfig = { ...pageConfig };
  }

  public nextPage() {
    const pageConfig = this.viewPageConfig;
    if (pageConfig.pageNumber < pageConfig.pageArr.length) {
      pageConfig.pageNumber++;
    }
    // 再赋值一遍改变引用触发管道检测
    this.viewPageConfig = { ...pageConfig };
  }

  public onBubbleClick(bubbleId: number) {
    this.bubbleClick.emit(bubbleId);
  }
}
