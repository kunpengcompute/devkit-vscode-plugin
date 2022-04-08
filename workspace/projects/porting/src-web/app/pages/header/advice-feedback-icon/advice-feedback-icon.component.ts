import {
   Component, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef
} from '@angular/core';
import { TiDragService } from '@cloud/tiny3';
import { I18nService } from '../../../service';
const hardUrl: any = require('../../../../assets/hard-coding/url.json');

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
    private dragService: TiDragService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public hoverAdvice: string;
  public language = 'zh-cn';
  public linkURL: any = '';
  public isDraging = false;
  public timerHandle: any = null;
  public imgLeft: any;
  public imgTop: any;


  ngOnInit(): void {
    this.linkURL = hardUrl.bannerUrlZn4;
  }
  // 打开建议反馈
  public onImgClick() {
    if (!this.isDraging){
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
    const voc = document.getElementById('advice-feedback');
    const evObj = document.createEvent('MouseEvents');
    evObj.initMouseEvent('mouseup', true, true, window, 1, 12, 345, 7, 220, false, false, true, false, 0, null);
    const self = this;
    self.dragService.create({
      helper: self.draggableEle.nativeElement,
      start() {
        self.imgTop = voc.offsetTop;
        self.imgLeft = voc.offsetLeft;
      },
      drag() {
        const left = voc.offsetLeft;
        const top = voc.offsetTop;
        if (self.imgTop !== top && self.imgLeft !== left) {
          self.isDraging = true;
        }
        const width = document.body.clientWidth - 52;
        const height = document.body.clientHeight - 122;
        if (parseInt(voc.style.left, 10) < -width){
          setTimeout(() => {
            voc.style.left = `-${width}px`;
          }, 200);
          setTimeout(() => {
            voc.dispatchEvent(evObj);
          }, 300);
        }
        if (parseInt(voc.style.left, 10) > 5){
          setTimeout(() => {
            voc.style.left = '5px';
          }, 200);
          setTimeout(() => {
            voc.dispatchEvent(evObj);
          }, 300);
        }
        if (parseInt(voc.style.top, 10) < -height){
          setTimeout(() => {
            voc.style.top = `-${height}px`;
          }, 200);
          setTimeout(() => {
            voc.dispatchEvent(evObj);
          }, 300);
        }
        if (parseInt(voc.style.top, 10) > 70){
          setTimeout(() => {
            voc.style.top = '70px';
          }, 200);
          setTimeout(() => {
            voc.dispatchEvent(evObj);
          }, 300);
        }
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
