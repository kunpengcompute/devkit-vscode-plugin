import {
  Component, Input, Output, EventEmitter, OnInit,
  ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
const hardUrl: any = require('sys/src-web/assets/hard-coding/url.json');
import { AxiosService } from '../../../service/axios.service';
import { TiDragService } from '@cloud/tiny3';
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
    public i18nService: CommonI18nService,
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
    this.linkURL = hardUrl.hikunpengUrl;
  }
  // 打开建议反馈
  public onImgClick() {
    this.Axios.axios.get('/users/version/',
      { baseURL: '../user-management/api/v2.2', timeout: 3000 })
      .then((resp: any) => {
        window.open(this.linkURL, '_blank');
      }).catch((error: any) => {
        this.errorAlert.openWindow();
      });
  }
  public getSuggestTip() {
    return this.i18n.common_advice_feedback;
  }

  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
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

  /**
   * 销毁方法
   */
  ngOnDestroy() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
    }
  }

}
