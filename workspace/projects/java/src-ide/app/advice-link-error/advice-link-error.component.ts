import { Component, OnInit } from '@angular/core';
const hardUrl: any = require('projects/java/src-com/assets/hard-coding/url.json');
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';

@Component({
  selector: 'app-advice-link-error',
  templateUrl: './advice-link-error.component.html',
  styleUrls: ['./advice-link-error.component.scss']
})
export class AdviceLinkErrorComponent implements OnInit {

  constructor(
    public i18nService: CommonI18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public linkURL: any = '';
  public hoverAdvice: string;

  ngOnInit(): void {
    this.linkURL = hardUrl.hikunpengUrl;
  }

  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
  }

}
