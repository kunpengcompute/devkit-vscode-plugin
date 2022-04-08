import { Component, Input } from '@angular/core';
import { I18nService, AxiosService, MytipService, CommonService } from '../../../service';

@Component({
  selector: 'app-xml-situation',
  templateUrl: './xml-situation.component.html',
  styleUrls: ['./xml-situation.component.scss']
})
export class XmlSituationComponent {
  @Input() xmlSituation: any;
  @Input() xmlinfo: any;
  public i18n: any;
  public currLang: string;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public mytip: MytipService,
    private commonService: CommonService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.currLang = sessionStorage.getItem('language');
  }

  public closeModal() {
    this.xmlSituation = -1;
    if (/migrationCenter/.test(window.location.hash)) {
      window.location.reload();
    }
  }

  /**
   * 跳转 对应的联机帮助
   * @param type 类型
   */
   public help(type: string) {
    this.commonService.goHelp(type);
  }
}
