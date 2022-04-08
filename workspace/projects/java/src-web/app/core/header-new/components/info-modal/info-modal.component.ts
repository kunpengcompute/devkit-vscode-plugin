import { AfterViewInit, Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { Util } from '@cloud/tiny3';
@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent implements OnInit, AfterViewInit {
  @ViewChild('container') private containerRef: ElementRef;
  @ViewChild('appLog') appLog: any;
  public myMask = false;
  constructor(public i18nServe: I18nService, private renderer2: Renderer2) {
    this.i18n = this.i18nServe.I18n();
    this.role = sessionStorage.getItem('role');
    this.settingList = [
      {
        id: 1, title: this.i18n.common_term_admin_user, name: this.i18n.common_term_admin_user,
        isSelected: false, tip: '', role: 'Admin', type: 'userManage'
      },
      {
        id: 2, title: this.i18n.common_term_dictionary, name: this.i18n.common_term_dictionary,
        isSelected: false, tip: this.i18n.weakPassword.tip, role: 'User', type: 'dictionary'
      },
      {
        id: 3, title: this.i18n.common_term_work_key, name: this.i18n.common_term_work_key,
        isSelected: false, tip: this.i18n.newHeader.certificate.workingKey, role: 'Admin', type: 'certificate_work'
      },
      {
        id: 4, title: this.i18n.common_term_system_config, name: this.i18n.common_term_system_config,
        isSelected: false, role: 'User', type: 'sysConfig'
      },
      {
        id: 5, title: this.i18n.common_term_threshold, name: this.i18n.common_term_threshold,
        isSelected: false, tip: this.i18n.newHeader.certificate.threshold, role: 'User', type: 'threshold'
      },
      {
        id: 6, title: this.i18n.common_term_dataLimit, name: this.i18n.common_term_dataLimit,
        isSelected: false, tip: this.i18n.dataLimit.tip, role: 'User', type: 'dataLimit'
      },
      {
        id: 7,
        title: this.role === 'Admin'
          ? this.i18n.common_term_log_manage
          : this.i18n.common_term_admin_log,
        name: this.i18n.common_term_log_manage, isSelected: false, tip: '', role: 'User', type: 'log'
      },
      {
        id: 8, title: this.i18n.common_term_java_certificate, name: this.i18n.common_term_java_certificate,
        isSelected: false, tip: this.i18n.newHeader.certificate.internalCert, role: 'Admin', type: 'certificate_java'
      }
    ];
  }
  public i18n: any;
  public settingList: any = [];
  public currentHover: any;
  public oldSelectIndex: number;
  public currentTitle: string;
  public currentType: string;
  public currentTip: string;
  public role: string;
  public hasImgTip = ['certificate_work', 'certificate_java', 'dictionary', 'dataLimit'];
  ngOnInit() { }
  public close() {
    this.myMask = false;
    $('.toggleSpan').css({ display: 'block' });
  }
  public open(type: any) {
    this.myMask = true;
    $('.toggleSpan').css({ display: 'none' });
    this.settingList.forEach((item: any, index: any) => {
      if (item.type === type) {
        item.isSelected = true;
        this.oldSelectIndex = index + 1;
        this.currentTitle = item.title;
        this.currentType = item.type;
        this.currentTip = item.tip;
        if (this.currentType === 'log') {
          this.appLog.showLogList(1, 20);
          this.appLog.showPublicLog(1, 20);
        }
      } else {
        item.isSelected = false;
      }
    });
  }
  ngAfterViewInit(): void {
    // 监听容器滚动事件，触发tiScroll收起下拉
    this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
      // tiScroll 是tiny3的自定义事件，可以触发面板收起
      Util.trigger(document, 'tiScroll');
    });
  }
  public onSettingChange(item: any) {
    const i = item.id;
    if (!this.oldSelectIndex) {
      this.oldSelectIndex = i;
    }
    this.settingList[this.oldSelectIndex - 1].isSelected = false;
    this.settingList[i - 1].isSelected = true;
    this.oldSelectIndex = i;

    this.currentTitle = item.title;
    this.currentTip = item.tip;
    this.currentType = item.type;
  }
  public onHoverList(label?: any) {
    this.currentHover = label;
  }
}
