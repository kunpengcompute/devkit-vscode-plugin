import { Component, Input, AfterViewInit, OnChanges, SimpleChanges,
  ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { StackNode, MemLeakType, FuncProps } from '../../doman';
import { NodeStartEndPosition } from './doman';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { FunStackNodeComponent } from './fun-stack-node/fun-stack-node.component';
import { ZoomBoxDirective } from 'projects/sys/src-ide/app/directives/zoom-box/zoom-box.directive';
import { DragBoxDirective } from 'projects/sys/src-ide/app/directives/drag-box/drag-box.directive';
import html2canvas from 'html2canvas';
import { HyTheme, HyThemeService } from 'hyper';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';

@Component({
  selector: 'app-fun-stack',
  templateUrl: './fun-stack.component.html',
  styleUrls: ['./fun-stack.component.scss']
})
export class FunStackComponent implements OnChanges, AfterViewInit {

  private static readonly colorTheme: { [theme in HyTheme]: any } = {
    dark: {
      line: '#e8e8e8'
    },
    light: {
      line: '#979797'
    },
    grey: {
      line: '#e8e8e8'
    },
  };

  @ViewChild('zoomBox') zoomBox: ZoomBoxDirective;
  @ViewChild('dragBox') dragBox: DragBoxDirective;

  @Input() currActiveFunc: FuncProps;
  @Input() memLeakType: MemLeakType = MemLeakType.leakCount;
  @Input() stackNodeInfoList: Array<Array<StackNode>> = [];
  @Output() functionClick = new EventEmitter<FuncProps>();

  public i18n: any;
  public invocationDepthOptions: Array<any> = [];
  public invocationDepth: number | 'Unlimited' = 1;
  public beInvocationDepthOptions: Array<any> = [];
  public beInvocationDepth: number | 'Unlimited' = 4;

  public nodeNumInfo = '';

  private showNodeNum = 0;
  private nodeCount = 0;
  /** 当前激活函数所在行 */
  private currActiveFuncRow = 0;
  private nodeSEPositionList: { [funcName: string]: NodeStartEndPosition } = {};
  private canvasDom: HTMLCanvasElement;
  private lineCtx: CanvasRenderingContext2D;
  private nodeComponentMap: { [funcName: string]: FunStackNodeComponent } = {};
  private nodesLineColor: string;

  constructor(
    private i18nService: I18nService,
    private el: ElementRef<HTMLDivElement>,
    private themeServe: HyThemeService,
    public vscodeService: VscodeService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.invocationDepthOptions = [
        { label: 0, labelName: 0},
        { label: 1, labelName: 1},
        { label: 2, labelName: 2},
        { label: 3, labelName: 3},
        { label: 4, labelName: 4},
        { label: 5, labelName: 5},
        { label: 'Unlimited', labelName: this.i18n.diagnostic.stack.unlimited},
    ];
    this.beInvocationDepthOptions = [
        { label: 0, labelName: 0},
        { label: 1, labelName: 1},
        { label: 2, labelName: 2},
        { label: 3, labelName: 3},
        { label: 4, labelName: 4},
        { label: 5, labelName: 5},
        { label: 'Unlimited', labelName: this.i18n.diagnostic.stack.unlimited},
    ];

    if (document.body.className.includes('vscode-dark')) {
      this.nodesLineColor = FunStackComponent.colorTheme.dark.line;
    } else {
      this.nodesLineColor = FunStackComponent.colorTheme.light.line;
    }

    this.themeServe.subscribe((msg) => {
      if (this.nodesLineColor !== FunStackComponent.colorTheme[msg].line) {
        this.nodesLineColor = FunStackComponent.colorTheme[msg].line;
        this.refreshStack();
      }
    });
  }

  ngAfterViewInit(): void {
    this.canvasDom = (this.el.nativeElement.querySelector('#line-box') as HTMLCanvasElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stackNodeInfoList) {
      this.nodeCount = 0;
      // 统计节点个数
      this.stackNodeInfoList.forEach((row, rowIndex) => {
        row.forEach((nodeInfo) => {
          if (nodeInfo.funcName === this.currActiveFunc.funcName) {
            this.currActiveFuncRow = rowIndex;
          }
          this.nodeCount++;
        });
      });
      this.changeInvacationDepth(this.invocationDepth);
      this.changeBeInvacationDepth(this.beInvocationDepth);

      this.refreshStack();
    }
  }

  /**
   * 刷新调用栈图
   */
  private refreshStack() {
    this.zoomBox?.restore();
    this.dragBox?.restore();
    this.refreshNodeNumInfo();
    // 异步刷新当前显示节点起始点位置
    setTimeout(() => {
      this.refreshNodeSEPosition();
      this.drawLine();
    }, 0);
  }

  /**
   * 刷新节点显示数量文本
   */
  private refreshNodeNumInfo() {
    this.showNodeNum = 0;
    this.stackNodeInfoList.forEach((row) => {
      row.forEach((nodeInfo) => {
        if (nodeInfo.show) {
          this.showNodeNum++;
        }
      });
    });
    this.nodeNumInfo = this.i18nService.I18nReplace(this.i18n.diagnostic.stack.stackInfo, {
      0: this.showNodeNum,
      1: this.nodeCount,
    });
  }

  /**
   * 刷新当前显示的节点的起始点位置
   */
  private refreshNodeSEPosition() {
    this.nodeSEPositionList = {};
    this.stackNodeInfoList.forEach((row) => {
      row.forEach((nodeInfo) => {
        if (nodeInfo.show) {
          this.nodeSEPositionList[nodeInfo.funcName] = this.nodeComponentMap[nodeInfo.funcName].getStartEndPosition();
        }
      });
    });
  }

  public saveNodeComponent(funcName: string, nodeComponent: FunStackNodeComponent) {
    this.nodeComponentMap[funcName] = nodeComponent;
  }
  // 下载树图
  public downLandSvg(fileName: string) {
    this.zoomBox?.restore();
    html2canvas(document.getElementById('stack-box')).then((canvas: any) => {
      const img = canvas.toDataURL('image/png');
      const img1 = img.replace('data:image/png;base64,', '');
      const msg = {
        cmd: 'downloadFile',
        data: {
          fileName: fileName + '.png',
          fileContent: img1,
          contentType: 'base64',
          invokeLocalSave: true
        }
      };
      this.vscodeService.postMessage(msg, null);
    });

  }
  private drawLine() {
    const canvasClientRect = this.canvasDom.getBoundingClientRect();
    this.canvasDom.width = canvasClientRect.width;
    this.canvasDom.height = canvasClientRect.height;
    this.lineCtx = this.canvasDom.getContext('2d');
    this.lineCtx.strokeStyle = this.nodesLineColor;
    for (const funcName of Object.keys(this.nodeSEPositionList)) {
      const startPosition = this.nodeSEPositionList[funcName];
      if (startPosition.nextNodeFuncNames.length > 0) {
        for (const nextNodeFuncName of startPosition.nextNodeFuncNames) {
          const endPosition = this.nodeSEPositionList[nextNodeFuncName];
          if (!endPosition) { continue; }
          // 从下面往上面直指
          if ((endPosition.endArrowPosition.top < startPosition.startDotPosition.bottom)
            && Math.abs(startPosition.startDotPosition.x - endPosition.endArrowPosition.x) < 5) {
            this.lineCtx.beginPath();
            this.lineCtx.moveTo(startPosition.startDotPosition.x, startPosition.startDotPosition.bottom);
            this.lineCtx.bezierCurveTo(
              startPosition.startDotPosition.x + 50,
              startPosition.startDotPosition.bottom + 60,
              endPosition.endArrowPosition.x + 50,
              endPosition.endArrowPosition.top - 60,
              endPosition.endArrowPosition.x,
              endPosition.endArrowPosition.top);
            this.lineCtx.stroke();
          } else {
            this.lineCtx.beginPath();
            this.lineCtx.moveTo(startPosition.startDotPosition.x, startPosition.startDotPosition.bottom);
            this.lineCtx.bezierCurveTo(
              startPosition.startDotPosition.x,
              startPosition.startDotPosition.bottom + 60,
              endPosition.endArrowPosition.x,
              endPosition.endArrowPosition.top - 60,
              endPosition.endArrowPosition.x,
              endPosition.endArrowPosition.top);
            this.lineCtx.stroke();
          }
        }
      }
    }
  }

  public changeInvacationDepth(invacationDepth: number | 'Unlimited') {
    if (invacationDepth === 'Unlimited') {
      this.updateStackNodeInfoShowStatus(this.currActiveFuncRow + 1, this.stackNodeInfoList.length, true);
    } else if (invacationDepth === 0) {
      this.updateStackNodeInfoShowStatus(this.currActiveFuncRow + 1, this.stackNodeInfoList.length, false);
    } else {
      const showEndRow = Math.min(this.stackNodeInfoList.length, this.currActiveFuncRow + 1 + invacationDepth);
      this.updateStackNodeInfoShowStatus(this.currActiveFuncRow + 1, showEndRow, true);
      this.updateStackNodeInfoShowStatus(showEndRow, this.stackNodeInfoList.length, false);
    }
    this.refreshStack();
  }

  public changeBeInvacationDepth(beInvacationDepth: number | 'Unlimited') {
    if (beInvacationDepth === 'Unlimited') {
      this.updateStackNodeInfoShowStatus(0, this.currActiveFuncRow, true);
    } else if (beInvacationDepth === 0) {
      this.updateStackNodeInfoShowStatus(0, this.currActiveFuncRow, false);
    } else {
      const showStartRow = Math.max(0, this.currActiveFuncRow - beInvacationDepth);
      this.updateStackNodeInfoShowStatus(showStartRow, this.currActiveFuncRow, true);
      this.updateStackNodeInfoShowStatus(0, showStartRow, false);
    }
    this.refreshStack();
  }

  /**
   * 更新调用栈图中节点显示状态
   *
   * @param startRow 起始行
   * @param endRow 结束行
   * @param showStatus 显示状态
   */
  private updateStackNodeInfoShowStatus(startRow: number, endRow: number, showStatus: boolean) {
    if (startRow >= endRow) { return; }
    if (startRow >= 0 && endRow <= this.stackNodeInfoList.length) {
      for (let i = startRow; i < endRow; i++) {
        this.stackNodeInfoList[i].forEach(nodeInfo => {
          nodeInfo.show = showStatus;
        });
      }
    }
  }

  public handleNodeClick(nodeInfo: StackNode) {
    this.functionClick.emit({
      isSelf: false, // 随便给的一个值，不影响后续逻辑
      funcName: nodeInfo.funcName,
      moduleName: nodeInfo.moduleName
    });
  }

}
