import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AxiosService } from './service/axios.service';
import { Router, NavigationEnd } from '@angular/router';
import { I18nService } from './service/i18n.service';
import { MessageService } from './service/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    public Axios: AxiosService,
    public router: Router,
    public i18nService: I18nService,
    private msgService: MessageService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public showHeader = true;
  public showAdviceIcon = false;

  ngOnInit() {
    const show = sessionStorage.getItem('language') === 'zh-cn' ? 'block' : 'none';
    document.getElementById('advice-tip').style.display = show;

    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        data.url === '/login' ? this.showHeader = false : this.showHeader = true;
        this.Axios.axios.get('/users/version/', { headers: { showLoading: false } })
          .then((datas: any) => {
            const version = 'V' + datas.data.version;
            const time = datas.data.update_time;
            sessionStorage.setItem('version', version);
            sessionStorage.setItem('time', time);
          });
      }
    });
  }

  ngAfterViewInit(): void {
    sessionStorage.getItem('loginId') && sessionStorage.getItem('language') === 'zh-cn'
      ? this.showAdviceIcon = true : this.showAdviceIcon = false;
  }
}
