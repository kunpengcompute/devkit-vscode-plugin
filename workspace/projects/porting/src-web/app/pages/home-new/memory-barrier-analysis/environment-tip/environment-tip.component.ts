import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { I18nService } from '../../../../service';

@Component({
  selector: 'app-environment-tip',
  templateUrl: './environment-tip.component.html',
  styleUrls: ['./environment-tip.component.scss']
})
export class EnvironmentTipComponent implements OnInit {
  @Input() headerTip: string;
  @Input() guideList: Array<string>; // 指导列表
  @Input() linkUrl: Array<any>; // 指导链接

  @Output() handleCloseGuide = new EventEmitter();

  constructor(public i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any; // 国际化
  public coolapse: boolean; // 是否展开

  ngOnInit(): void {
    this.coolapse = false;
  }

  // 关闭指导
  closeGuideTip() {
    this.handleCloseGuide.emit();
  }

}
