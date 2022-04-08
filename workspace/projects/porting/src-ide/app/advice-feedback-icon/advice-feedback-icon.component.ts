import {
  Component, Output, EventEmitter, OnInit, ChangeDetectorRef,
  AfterViewInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TiDragService } from '@cloud/tiny3';

@Component({
  selector: 'app-advice-feedback-icon',
  templateUrl: './advice-feedback-icon.component.html',
  styleUrls: ['./advice-feedback-icon.component.scss']
})
export class AdviceFeedbackIconComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() openAdvice = new EventEmitter<any>();
  @ViewChild('draggable', { static: true }) private draggableEle: ElementRef;

  constructor(
    public i18nService: I18nService,
    private vscodeService: VscodeService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private dragService: TiDragService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public hoverAdvice: string;
  public language = 'zh-cn';
  public linkURL: any = '';
  public currentTheme = 1;
  public intelliJFlagDef: boolean;
  public isDraging = false;
  public timerHandle: any = null;


  ngOnInit(): void {
    this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
      this.linkURL = resp.kunpengSuggestions;
    });
    // vscode颜色主题
    if (document.body.className.indexOf('vscode-light') > -1) {
      this.currentTheme = COLOR_THEME.Light;
    }

    this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
      this.currentTheme = msg.colorTheme;
      if (this.intelliJFlagDef) {
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.detectChanges();
      }
    });
    this.route.queryParams.subscribe((data) => {
      if (typeof(data.intelliJFlag) === 'undefined'){
        this.intelliJFlagDef = data.intellijFlag === 'true';
      } else {
        this.intelliJFlagDef = data.intelliJFlag === 'true';
      }
    });
  }
  // 打开建议反馈
  public onImgClick() {
    // 图标拖拽时不打开页面
    if (this.isDraging) {
      return;
    }
    // 打开服务器配置页面
    if (this.intelliJFlagDef) {
      const cmdData = {
        cmd: 'showIntellijDialog',
        data: {
            intellijDialogType: 'noNetworkTipDialog',
        }
      };
      this.vscodeService.postMessage(cmdData, null);
    } else {
      this.openAdvice.emit(this.linkURL);
    }
  }
  public getSuggestTip() {
    return this.i18n.commonAdviceFeedback;
  }

  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
  }

  ngAfterViewInit(): void {
    const self = this;
    self.dragService.create({
      helper: self.draggableEle.nativeElement,
      drag() {
        self.isDraging = true;
      },
      stop() {
        self.timerHandle = setTimeout(() => {
          self.isDraging = false;
        }, 200);
      }
    });
  }

  /**
   * 销毁方法
   */
  ngOnDestroy() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
    }
  }


}
