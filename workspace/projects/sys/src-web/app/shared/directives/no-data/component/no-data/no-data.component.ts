import { Component, Input, Output } from '@angular/core';
import { I18nService } from '../../../../../service/i18n.service';
import { NoDataOption } from '../../reference';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss']
})
export class NoDataComponent {

  @Input()
  set option(val) {
    if (val != null) {
      this.optionCopy = val;
    }
  }
  get option() {
    return this.optionCopy;
  }
  /** 配置参数 */
  private optionCopy: NoDataOption = {};


  /** 组件内容是否显示 */
  @Input() nodataShow = true;

  // 其他参数
  public i18n: any;

  constructor(
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  /** 显示内容 */
  public show() {
    this.nodataShow = true;
  }

  /** 隐藏内容 */
  public hidden() {
    this.nodataShow = false;
  }
}
