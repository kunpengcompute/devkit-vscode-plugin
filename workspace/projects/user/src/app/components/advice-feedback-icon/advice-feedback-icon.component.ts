import {
  Component, Input, Output, EventEmitter, OnInit, ViewChild,
  ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { I18nService } from '../../service/i18n.service';
const hardUrl: any = require('sys/src-web/assets/hard-coding/url.json');
import { TiDragService } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';

@Component({
  selector: 'app-advice-feedback-icon',
  templateUrl: './advice-feedback-icon.component.html',
  styleUrls: ['./advice-feedback-icon.component.scss']
})
export class AdviceFeedbackIconComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() openAdvice = new EventEmitter<any>();
  @ViewChild('errorAlert', { static: false }) errorAlert: any;
  @ViewChild('draggable', { static: true }) private draggableEle: ElementRef;

  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    private dragService: TiDragService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public hoverAdvice: string;
  public linkURL: any = '';
  public isDraging = false;
  public timerHandle: any = null;


  ngOnInit(): void {
    this.isDraging = false;
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

  // 打开建议反馈
  private onImgClick() {
    this.Axios.axios.get('/users/version/',
      { baseURL: '../user-management/api/v2.2', timeout: 3000 })
      .then((resp: any) => {
        window.open(this.linkURL, '_blank');
      }).catch((error: any) => {
        this.errorAlert.openWindow();
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

  public getSuggestTip() {
    return this.i18n.common_advice_feedback;
  }

  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
  }

}
