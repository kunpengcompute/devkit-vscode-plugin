import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FuncProps, MemLeakType, StackNode } from '../../../doman';
import { NodeStartEndPosition } from '../doman';
import { I18nService } from 'projects/sys/src-web/app/service';
import { TabSwitchService } from '../../../service/tab-switch.service';

@Component({
  selector: 'app-fun-stack-node',
  templateUrl: './fun-stack-node.component.html',
  styleUrls: ['./fun-stack-node.component.scss']
})
export class FunStackNodeComponent implements OnInit, OnChanges {

  @ViewChild('endArrow') endArrow: ElementRef<HTMLElement>;
  @ViewChild('startDot') startDot: ElementRef<HTMLElement>;

  @Input() currFuncName: string;
  @Input() nodeInfo: StackNode;
  @Input() memLeakType: MemLeakType = MemLeakType.leakCount;
  /** 刷新节点的随机数 */
  @Input() refreshNumber: number;
  @Output() nodeInited = new EventEmitter<FunStackNodeComponent>();
  @Output() nodeClick = new EventEmitter<void>();

  /** 右侧显示文字数组 */
  public rightTextArray: Array<string | number> = [];
  public isSelf = false;
  public i18n: any;

  public hiddenEndArrow = false;
  public hiddenStartDot = false;

  constructor(
    private i18nService: I18nService,
    private tabSwitchService: TabSwitchService<FuncProps>,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    this.iniRightText();
    if (this.memLeakType === MemLeakType.leakCount) {
      this.isSelf = !!this.nodeInfo.selfLeakCount;
    } else if (this.memLeakType === MemLeakType.leakSize) {
      this.isSelf = !!this.nodeInfo.selfLeakSize;
    } else if (this.memLeakType === MemLeakType.abnormalRelease) {
      this.isSelf = !!this.nodeInfo.selfAbnormalReleaseCount;
    }

    this.nodeInited.emit(this);

    this.hiddenEndArrow = this.nodeInfo.parents.reduce((result, item) => (result && !item.show), true);
    this.hiddenStartDot = this.nodeInfo.children.reduce((result, item) => (result && !item.show), true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.refreshNumber) {
      this.hiddenEndArrow = this.nodeInfo.parents.reduce((result, item) => (result && !item.show), true);
      this.hiddenStartDot = this.nodeInfo.children.reduce((result, item) => (result && !item.show), true);
    }
  }

  private iniRightText() {
    let leakCount: string | number = '';
    let leakSize: string | number = '';
    let abnormalReleaseCount: string | number = '';
    if (this.nodeInfo.selfLeakCount && this.nodeInfo.childLeakCount) {
      leakCount = this.nodeInfo.selfLeakCount + '/' + this.nodeInfo.childLeakCount;
    } else {
      leakCount = this.nodeInfo.selfLeakCount || this.nodeInfo.childLeakCount;
    }
    if (this.nodeInfo.selfLeakSize && this.nodeInfo.childLeakSize) {
      leakSize = this.nodeInfo.selfLeakSize + '/' + this.nodeInfo.childLeakSize;
    } else {
      leakSize = this.nodeInfo.selfLeakSize || this.nodeInfo.childLeakSize;
    }
    if (this.nodeInfo.selfAbnormalReleaseCount && this.nodeInfo.childAbnormalReleaseCount) {
      abnormalReleaseCount = this.nodeInfo.selfAbnormalReleaseCount + '/' + this.nodeInfo.childAbnormalReleaseCount;
    } else {
      abnormalReleaseCount = this.nodeInfo.selfAbnormalReleaseCount || this.nodeInfo.childAbnormalReleaseCount;
    }
    this.rightTextArray = [
      leakCount,
      leakSize,
      abnormalReleaseCount,
    ];
  }

  /**
   * 有父级组件调用，返回节点起始点和结束箭头的位置
   */
  public getStartEndPosition(): NodeStartEndPosition {
    const startDotClientRect = this.startDot.nativeElement.getBoundingClientRect();
    const endArrowClientRect = this.endArrow.nativeElement.getBoundingClientRect();
    return {
      funcName: this.nodeInfo.funcName,
      startDotPosition: {
        width: startDotClientRect.width,
        height: startDotClientRect.height,
        left: this.startDot.nativeElement.offsetLeft,
        top: this.startDot.nativeElement.offsetTop,
        right: this.startDot.nativeElement.offsetLeft + startDotClientRect.width,
        bottom: this.startDot.nativeElement.offsetTop + startDotClientRect.height,
        x: this.startDot.nativeElement.offsetLeft + (startDotClientRect.width / 2),
      },
      endArrowPosition: {
        width: endArrowClientRect.width,
        height: endArrowClientRect.height,
        left: this.endArrow.nativeElement.offsetLeft,
        top: this.endArrow.nativeElement.offsetTop,
        right: this.endArrow.nativeElement.offsetLeft + endArrowClientRect.width,
        bottom: this.endArrow.nativeElement.offsetTop + endArrowClientRect.height,
        x: this.endArrow.nativeElement.offsetLeft + (endArrowClientRect.width / 2),
      },
      nextNodeFuncNames: this.nodeInfo.nextNodeFuncNames,
    };
  }

  public handleShowSourceBtnClick() {
    this.tabSwitchService.switchTab.next({
      tab: 'sourceCode',
      params: {
        isSelf: this.isSelf,
        funcName: this.nodeInfo.funcName,
        moduleName: this.nodeInfo.moduleName,
        memLeakType: this.memLeakType
      }
    });
  }

  public handleNodeClick() {
    this.nodeClick.emit();
  }

}
