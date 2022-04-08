import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { I18nService } from './service/i18n.service';
import { filter } from 'rxjs/internal/operators';
import { Util } from '@cloud/tiny3';
import { AxiosService, MessageService } from './service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    public router: Router,
    public i18nService: I18nService,
    private renderer2: Renderer2,
    private axiosServe: AxiosService,
    public messageServe: MessageService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.i18n = this.i18nService.I18n();
    (this.router.events
      .pipe(filter(event => event instanceof NavigationEnd)) as Observable<NavigationEnd>)
      .subscribe(routerEvent => {
        if (routerEvent.url === '/login') {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('nowUrl');
          sessionStorage.removeItem('packagePortingPathName');
          sessionStorage.removeItem('sourceCodePathName');
          sessionStorage.removeItem('softwarePackPathName');
          sessionStorage.removeItem('portingWorkloadMaximumTask');
          sessionStorage.removeItem('sourceMaximumTask');
          sessionStorage.removeItem('analysisMaximumTask');
          sessionStorage.removeItem('BcMaximumTask');
          sessionStorage.removeItem('memorySourceMaximumTask');
          sessionStorage.removeItem('precheckMaximumTask');
        } else if (routerEvent.url.indexOf('/setting') && routerEvent.url.indexOf('/reportDiff')) {
          sessionStorage.setItem('nowUrl', routerEvent.url);
        }
      }
    );
  }

  @ViewChild('tiSelectCon', { static: true }) private tiSelectConRef: ElementRef;
  public showAdviceIcon = false;
  public networkStatus = true;
  public netStatus = true;
  @ViewChild('adviceIcon', { static: false }) adviceIcon: any;
  @ViewChild('errorAlert', { static: false }) errorAlert: any;
  public showHeader1 = true;
  public i18n: any;
  public currLang: any;
  public chooseTab: any = '';
  public navShow = true;
  public bannerShow = false;
  public expired: string;

  public isClick: any = '0';
  public cateArr: any = [];
  public toggerShow = false;

  ngOnInit() {
    // 接收登录成功之后发送过来的消息以确认是否登录成功
    this.messageServe.getMessage().subscribe(msg => {
      if (msg.type === 'getLoginId') {
        setTimeout(() => {
          sessionStorage.getItem('language') === 'zh-cn'
            ? this.showAdviceIcon = true : this.showAdviceIcon = false;
        }, 1000);
      }
    });
    this.messageServe.getMessage().subscribe(msg => {
      if (msg.type === 'closeAdviceIcon') {
        this.showAdviceIcon = false;
      }
    });
    sessionStorage.getItem('token') && sessionStorage.getItem('language') === 'zh-cn'
    ? this.showAdviceIcon = true : this.showAdviceIcon = false;
    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        if (data.url.indexOf('login') > -1) {
          this.bannerShow = true;
        } else if (data.url.indexOf('homeNew') > -1 ) {
          this.bannerShow = JSON.parse(sessionStorage.getItem('bannerShow'));
        } else {
          this.bannerShow = false;
        }
      }
    });
    this.renderer2.listen(this.tiSelectConRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
    this.renderer2.listen(document.body, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
    this.currLang = sessionStorage.getItem('language');
    if (sessionStorage.getItem('toggerShow') === 'true') {
      this.toggerShow = true;
    } else if (sessionStorage.getItem('toggerShow') !== 'true') {
      this.toggerShow = false;
    }
    if (sessionStorage.getItem('navShow') === 'false') {
      this.navShow = false;
    } else {
      this.navShow = true;
    }
    if (sessionStorage.getItem('bannerShow') === 'false') {
      this.bannerShow = false;
    } else {
      this.bannerShow = true;
    }
    this.chooseTab = sessionStorage.getItem('chooseTab') || 'porting-workload';
    if (this.chooseTab === 'home') {
      sessionStorage.setItem('chooseTab', 'home');
    }
    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        if (data.url === '/login') {
          this.showHeader1 = false;
        } else {
          this.showHeader1 = true;
        }
      }
    });
  }

  /**
   * 点击建议反馈图标
   */
  public openAdvice(event: any) {
    this.messageServe.sendMessage({ type: 'closeTip' });
    this.axiosServe.axios.get(`/customize/`,
      { baseURL: 'api', timeout: 3000 }).then((resp: any) => {
        if (resp === 'timeout') {
          this.errorAlert.openWindow();
        } else {
          window.open(event, '_blank');
        }
    }).catch((error: any) => {
    });
  }

  // 隐藏头部箭头
  hideArrow(bool: any) {
    this.toggerShow = bool;
    if (bool) {
      sessionStorage.setItem('toggerShow', 'true');
    } else {
      sessionStorage.setItem('toggerShow', 'false');
    }
  }

  ngAfterViewInit(): void {
    sessionStorage.getItem('token') && sessionStorage.getItem('language') === 'zh-cn'
    ? this.showAdviceIcon = true : this.showAdviceIcon = false;
  }
}

