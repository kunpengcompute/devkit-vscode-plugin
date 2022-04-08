import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';
import { MytipService } from '../../service/mytip.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {


  @ViewChild('modal') modal: any;
  constructor(
    public i18nService: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public isOpen = false;
  ngOnInit() {
  }
  public open() {
    this.modal.Open();
    this.isOpen = true;
  }
  public close() {
    this.modal.Close();
    this.isOpen = false;
  }
  public confirm() {
    const roleId = sessionStorage.getItem('loginId');
    this.Axios.axios.delete(
      '/users/session/' + roleId + '/',
      { baseURL: '../user-management/api/v2.2' }
    ).then((data: any) => {
      this.myTip.alertInfo({ type: 'success', content: this.i18n.logout_ok, time: 3500 });
      setTimeout(() => {
        sessionStorage.setItem('role', '');
        sessionStorage.setItem('token', '');
        sessionStorage.setItem('username', '');
        sessionStorage.setItem('loginId', '');
        sessionStorage.setItem('topState', '');
        window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
      }, 1000);
    });
  }

}
