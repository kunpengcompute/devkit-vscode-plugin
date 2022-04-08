import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';

@Component({
  selector: 'app-msg-suggestion',
  templateUrl: './msg-suggestion.component.html',
  styleUrls: ['./msg-suggestion.component.scss']
})
export class MsgSuggestionComponent implements OnInit {
  @Input() suggestMsg: any;
  @Input() showHeader = true;
  public i18n: any;
  public toggleFlag = true;
  public flag = false;
  constructor(
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {
    this.suggestMsg.map((item: any) => {
      item.isShow = false;
    });
  }
  public msgClick(item: any){
    item.isShow = !item.isShow;
  }
  /**
   * 优化建议 toggle
   */
  msgHeaderClick() {
    this.toggleFlag = !this.toggleFlag;
    $('.msg-main').toggle(300);
  }
}
