import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';

@Component({
  selector: 'app-suggestion-tip',
  templateUrl: './suggestion-tip.component.html',
  styleUrls: ['./suggestion-tip.component.scss']
})
export class SuggestionTipComponent implements OnInit{
  @Input() suggetNum: any;
  @Input() ideType: any;
  @Input() type = 'tip';
  @Output() openSuggest = new EventEmitter<any>();
  constructor(
    public i18nService: CommonI18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public suggetSate: string;
  public btnIcon: string;
  public showSuggest = true;
  public hoverSuggest: string;

  ngOnInit(): void {
    if (sessionStorage.getItem('tuningOperation') === 'hypertuner'){
      this.ideType = 'intellij';
    } else {
      this.ideType = 'other';
    }
  }
  public closeReport() {
    this.showSuggest = false;
  }
  public onImgClick() {
    this.openSuggest.emit();
  }
  public getSuggestTip(type: string) {
    if (this.suggetNum > 1) {
      if (type === 'tip') {
        return this.i18nService.I18nReplace(this.i18n.protalserver_sampling_leak.btnIcons,
          { 0: this.suggetNum });
      } else {
        return this.i18nService.I18nReplace(this.i18n.protalserver_sampling_leak.suggetNumbers,
          { 0: this.suggetNum });
      }
    } else {
      if (type === 'tip') {
        return this.i18nService.I18nReplace(this.i18n.protalserver_sampling_leak.btnIcon,
          { 0: this.suggetNum });
      } else {
        return this.i18nService.I18nReplace(this.i18n.protalserver_sampling_leak.suggetNumber,
          { 0: this.suggetNum });
      }
    }
  }
  public onHoverSuggest(data: any) {
    this.hoverSuggest = data;
  }
}
