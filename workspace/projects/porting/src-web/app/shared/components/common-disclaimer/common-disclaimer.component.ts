import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { I18nService } from '../../../service/i18n.service';

@Component({
  selector: 'app-common-disclaimer',
  templateUrl: './common-disclaimer.component.html',
  styleUrls: ['./common-disclaimer.component.scss']
})
export class CommonDisclaimerComponent implements OnInit {
  @Input() isConfirm: boolean;

  @Output() closeDisclaimer = new EventEmitter();
  @Output() confirmDisclaimer = new EventEmitter();

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public detailList: Array<string>;
  public checkbox = {
    label: '',
    id: '1',
    checked: false
  };

  ngOnInit(): void {
    this.detailList = [
      this.i18n.user_disclaimer.list10,
      this.i18n.user_disclaimer.list11,
      this.i18n.user_disclaimer.list2,
      this.i18n.user_disclaimer.list3,
      this.i18n.user_disclaimer.list4,
      this.i18n.user_disclaimer.list5,
      this.i18n.user_disclaimer.list6,
      this.i18n.user_disclaimer.list7
    ];

    this.checkbox.label =  this.i18n.common_term_migration_pre_tip.label;
  }

  // 关闭免责声明
  closeMoadl() {
    this.checkbox.checked = false;
    this.closeDisclaimer.emit();
  }
  // 确认免责声明
  confirmMoadl() {
    this.checkbox.checked = false;
    this.confirmDisclaimer.emit();
  }
}
