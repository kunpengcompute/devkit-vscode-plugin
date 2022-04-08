import { Component, OnInit } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

@Component({
  selector: 'app-advice-link-error',
  templateUrl: './advice-link-error.component.html',
  styleUrls: ['./advice-link-error.component.scss']
})
export class AdviceLinkErrorComponent implements OnInit {

  constructor(
    public i18nService: I18nService,
    private vscodeService: VscodeService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public linkURL: any = '';
  public hoverAdvice: string;

  ngOnInit(): void {
    this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
      this.linkURL = resp.kunpengSuggestions;
    });
  }

  public onHoverSuggest(data: any) {
    this.hoverAdvice = data;
  }

}
