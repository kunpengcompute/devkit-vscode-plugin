import { Component, Input, OnInit } from '@angular/core';
import { SuggestionList } from '../../../../domain/pocket-loss/pocket-loss-raw.type';

type SuggestionDetailList = {
  title: string,
  isActive: boolean;
};

@Component({
  selector: 'app-trouble-suggestion',
  templateUrl: './trouble-suggestion.component.html',
  styleUrls: ['./trouble-suggestion.component.scss']
})
export class TroubleSuggestionComponent implements OnInit {

  @Input() suggestionList: SuggestionList[];

  constructor() { }

  ngOnInit(): void {
  }

  // 显示对应列表详情
  showDetail(detail: SuggestionDetailList) {
    detail.isActive = !detail.isActive;
  }

}
