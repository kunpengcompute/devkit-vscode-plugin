import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TiModalRef, TiModalService } from '@cloud/tiny3';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';
@Component({
  selector: 'app-infor-detail',
  templateUrl: './infor-detail.component.html',
  styleUrls: ['./infor-detail.component.scss']
})
export class InforDetailComponent implements OnInit {
  @Input() data: any;
  private modal: TiModalRef;
  constructor(
    private tiModal: TiModalService,
    public i18nService: CommonI18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  // 自定义弹出层组件
  @ViewChild('inforDetail', { static: false }) inforDetail: ElementRef;
  public i18n: any;
  public inforDetailItem: any;
  public inforDetailKey: any;
  public inforDetailValue: any;

  ngOnInit(): void {
  }
  /**
   * 打开弹框
   */
  show(): void {
    this.inforDetailKey = this.data.key;
    this.inforDetailValue = this.data.value;
    // 定义id防止同一页面出现多个相同弹框
    this.tiModal.open(this.inforDetail, {
      id: 'isInforDetail',
    });
  }
  hide() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }

}
