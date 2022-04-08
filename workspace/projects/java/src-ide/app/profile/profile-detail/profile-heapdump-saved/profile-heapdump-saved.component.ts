import { FormControl } from '@angular/forms';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TiModalRef, TiModalService, TiValidationConfig } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { MessageService } from '../../../service/message.service';
import { RegularVerify } from 'projects/java/src-com/app/utils/regular-verify';

@Component({
  selector: 'app-profile-heapdump-saved',
  templateUrl: './profile-heapdump-saved.component.html',
  styleUrls: ['./profile-heapdump-saved.component.scss'],
})
export class ProfileHeapdumpSavedComponent implements OnInit {
  /**
   * 实时数据限定设置弹窗
   */
  @ViewChild('profileHeapdumpSavedModal', { static: false })
  profileHeapdumpSavedModal: any;
  @Output() public getActive = new EventEmitter<any>();

  /**
   * 拦截active的setter方法，在active为true时打开弹窗
   */
  @Input()
  set active(active: boolean) {
    if (active) {
      this.show();
      const currentSelectJvm = (self as any).webviewSession.getItem('currentSelectJvm').split('/');
      this.reportNameControl = new FormControl(currentSelectJvm[currentSelectJvm.length - 1],
        this.regularVerify.reportNameValid(this.i18n));
      this.reportRemark = '';
      if (this.saveType === 'heapdump') {
        this.displayTip = this.i18nService.I18nReplace(this.i18n.plugins_common_report.display_tip, {
          0: this.i18n.plugins_common_report.memory_dump
        });
      } else if (this.saveType === 'gclog') {
        this.displayTip = this.i18nService.I18nReplace(this.i18n.plugins_common_report.display_tip, {
          0: this.i18n.plugins_common_report.gclog
        });
      }
    } else {
      if (this.modal) {
        this.modal.close();
      }
    }
  }
  @Input() saveType: any;
  private modal: TiModalRef;
  public copyActive: boolean;
  public reportRemark: string;
  public reportNameControl: FormControl;
  public reportRemarkControl: FormControl;
  public displayTip: string;
  // 表单验证部分
  public reportNameValidation: TiValidationConfig = {
    type: 'blur',
  };
  public reportRemarkValidation: TiValidationConfig = {
    type: 'blur',
  };

  /**
   * 弹窗关闭事件
   */
  @Output() dismiss = new EventEmitter<void>();

  public i18n: any;
  public tipActive = true;

  constructor(
    private tiModal: TiModalService,
    private i18nService: I18nService,
    public regularVerify: RegularVerify,
    private msgService: MessageService
  ) {
    this.i18n = this.i18nService.I18n();
    this.reportNameControl = new FormControl('', this.regularVerify.reportNameValid(this.i18n));
    this.reportRemarkControl = new FormControl('', this.regularVerify.reportRemarkValid(this.i18n));
  }

  /**
   * 初始化
   */
  ngOnInit() { }

  /**
   * 显示弹窗
   */
  private show() {
    // 打开弹窗
    this.modal = this.tiModal.open(this.profileHeapdumpSavedModal, {
      id: 'profileHeapdumpSavedModal',
      closeIcon: false,
      draggable: true,
      dismiss: () => {
        this.dismiss.emit();
      },
    });
  }

  /**
   * 保存报告
   */
  handleClickOk() {
    const param = {
      reportName: this.reportNameControl.value,
      reportRemark: this.reportRemark
    };
    if (this.saveType === 'heapdump') {
      this.msgService.sendMessage({
        type: 'savedHeapdumpReoprt',
        data: param
      });
    } else if (this.saveType === 'gclog') {
      this.msgService.sendMessage({
        type: 'savedGClogReoprt',
        data: param
      });
    }
    this.dismiss.emit();
    this.modal.close();
  }
}
