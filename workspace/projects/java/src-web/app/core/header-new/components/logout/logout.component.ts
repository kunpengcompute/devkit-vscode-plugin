import { Component, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { StompService } from 'projects/java/src-web/app/service/stomp.service';
import { ProfileDownloadService } from 'projects/java/src-web/app/service/profile-download.service';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  @ViewChild('modal') modal: any;
  constructor(
    public i18nServe: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService,
    public stompService: StompService,
    private downloadService: ProfileDownloadService
  ) {
    this.i18n = this.i18nServe.I18n();
  }

  public i18n: any;
  public isOpen = false;
  public hoverClose: any;
  ngOnInit() {
  }
  public open() {
    this.modal.open();
    this.isOpen = true;
    $('.toggleSpan').css({ display: 'none' });
  }
  public close() {
    this.modal.close();
    this.isOpen = false;
    this.hoverClose = '';
    $('.toggleSpan').css({ display: 'block' });
  }
  public confirm() {
    this.stompService.socketState = false;
    const roleId = sessionStorage.getItem('loginId');
    this.downloadService.downloadItems.profileInfo.nowTime = '';
    this.Axios.axios.delete('/users/session/' + encodeURIComponent(roleId) + '/',
     { baseURL: '../user-management/api/v2.2' })
    .then((data: any) => {
      this.myTip.alertInfo({ type: 'success', content: this.i18n.logout_ok, time: 3500 });
      setTimeout(() => {
        sessionStorage.setItem('role', '');
        sessionStorage.setItem('token', '');
        sessionStorage.setItem('username', '');
        sessionStorage.setItem('loginId', '');
        sessionStorage.setItem('topState', '');
        sessionStorage.removeItem('statementStatus');
        window.location.href = window.location.origin + '/' + 'user-management' + '/#/login';
      }, 1000);
    });
    this.stompService.disConnect();
    if (this.stompService.refreshClientSub) {
      this.stompService.refreshClientSub.forceDisconnect();
    }
    if (this.stompService.refreshSub) { this.stompService.refreshSub.unsubscribe(); }
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
}
