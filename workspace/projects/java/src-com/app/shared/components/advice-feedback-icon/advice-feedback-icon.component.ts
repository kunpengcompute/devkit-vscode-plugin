import {
  Component, Output, EventEmitter, OnInit, ViewChild,
  ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
import { TiDragService } from '@cloud/tiny3';
const hardUrl: any = require('projects/java/src-com/assets/hard-coding/url.json');

@Component({
  selector: 'app-advice-feedback-icon',
  templateUrl: './advice-feedback-icon.component.html',
  styleUrls: ['./advice-feedback-icon.component.scss']
})
export class AdviceFeedbackIconComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() openAdvice = new EventEmitter<any>();
  @ViewChild('draggable', { static: true }) private draggableEle: ElementRef;

  constructor(
    public i18nService: CommonI18nService,
    private dragService: TiDragService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public hoverAdvice: string;
  public language = 'zh-cn';
  public linkURL: any = '';
  public isDraging = false;
  public timerHandle: any = null;


  ngOnInit(): void {
    this.linkURL = hardUrl.hikunpengUrl;
  }
  ngAfterViewInit(): void {
    const self = this;
    self.dragService.create({
      helper: self.draggableEle.nativeElement,
      start() {
        self.timerHandle = setTimeout(() => {
          self.isDraging = true;
        }, 200);
      },
      stop() {
        if (!self.isDraging) {
          clearTimeout(self.timerHandle);
          self.onImgClick();
        } else {
          self.isDraging = false;
        }
      }
    });
  }
  // 打开
  // 打开建议反馈
  public onImgClick() {
    this.openAdvice.emit(this.linkURL);
  }
  public getSuggestTip() {
    return this.i18n.common_advice_feedback;
  }

  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
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
