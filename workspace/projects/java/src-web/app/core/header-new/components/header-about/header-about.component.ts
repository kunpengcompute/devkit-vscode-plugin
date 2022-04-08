import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
@Component({
  selector: 'app-header-about',
  templateUrl: './header-about.component.html',
  styleUrls: ['./header-about.component.scss']
})
export class HeaderAboutComponent implements OnInit {
  @ViewChild('modal') modal: any;
  constructor(public i18nServe: I18nService, public Axios: AxiosService) {
    this.i18n = this.i18nServe.I18n();
  }

  public i18n: any;
  public isOpen = false;
  public version = '';
  public updateTime = '';
  public hoverClose: any;
  ngOnInit() {
    this.Axios.axios.get('/users/version/', { baseURL: '../user-management/api/v2.2' })
      .then((data: any) => {
        this.version = 'V' + data.data.version;
        this.updateTime = data.data.update_time;
      });
  }
  public open() {
    this.modal.open();
    this.isOpen = true;
    $('.toggleSpan').css({ display: 'none' });
  }
  public close() {
    this.modal.close();
    $('.toggleSpan').css({ display: 'block' });
    this.isOpen = false;
    this.hoverClose = '';
  }
  public onHoverClose(msg?: any) {
    this.hoverClose = msg;
  }
}
