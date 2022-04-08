import { Component, Input, ElementRef, OnChanges } from '@angular/core';
import { I18nService, AxiosService, MytipService, CommonService } from '../../../service';
import lottie from 'lottie-web';
@Component({
  selector: 'app-so-situation',
  templateUrl: './so-situation.component.html',
  styleUrls: ['./so-situation.component.scss']
})
export class SoSituationComponent implements OnChanges {

  @Input() soSituation: any;
  @Input() soinfo: any;
  public i18n: any;
  public currLang: string;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public mytip: MytipService,
    private elementRef: ElementRef,
    private commonService: CommonService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.currLang = sessionStorage.getItem('language');
  }


  /**
   * 绑定数据改变执行
   */
  ngOnChanges() {
    if (this.soSituation === 1) {
      setTimeout(() => {
        this.createSvg();
      }, 0);
    }
  }
  public closeModal() {
    this.soSituation = 0;
  }

  private createSvg() {
    const sysSelection = this.elementRef.nativeElement.querySelector('.backup-loading');
    lottie.loadAnimation({
      container: sysSelection,
      renderer: 'svg',
      loop: true,
      path: './assets/json/backup-loading.json'
    });
  }

  /**
   * 跳转 对应的联机帮助
   * @param type 类型
   */
  public help(type: string) {
    this.commonService.goHelp(type);
  }
}
