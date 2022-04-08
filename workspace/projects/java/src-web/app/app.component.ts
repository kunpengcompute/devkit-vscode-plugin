import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MessageService } from './service/message.service';
import { TranslateService } from '@ngx-translate/core';
import { AxiosService } from './service/axios.service';
import { Router, NavigationEnd } from '@angular/router';
import { I18nService } from './service/i18n.service';
import { ListenUserService } from './service/listen-user';
import { UserGuideService } from './service/user-guide.service';
import { StompService } from './service/stomp.service';
import { SamplieDownloadService } from './service/samplie-cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    public messageervice: MessageService,
    public translate: TranslateService,
    public Axios: AxiosService,
    public router: Router,
    public i18nService: I18nService,
    public listenUser: ListenUserService,
    public userGuide: UserGuideService,
    private stompService: StompService,
    private msgService: MessageService,
    private downloadService: SamplieDownloadService,
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public showHeader = false;
  public showAdviceIcon = false;
  public networkStatus = true;
  public netStatus = true;
  @ViewChild('adviceIcon', { static: false }) adviceIcon: any;
  @ViewChild('errorAlert', { static: false }) errorAlert: any;
  @ViewChild('loading', { static: false }) loading: any;

  ngOnInit() {
    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        const token = sessionStorage.getItem('token');
        (data.url === '/login' || !token) ? this.showHeader = false : this.showHeader = true;
        // 未登录需隐藏建议反馈按钮、英文环境下暂时隐藏建议反馈按钮
        sessionStorage.getItem('loginId') && sessionStorage.getItem('language') === 'zh-cn'
          ? this.showAdviceIcon = true : this.showAdviceIcon = false;

        if (data.url === '/home' && sessionStorage.getItem('sampleWsOpen')) {
          this.handleCleanCache();
          this.msgService.handleSampleFileIOClear();
          this.msgService.handleSampleSocketIOClear();
          this.msgService.handleSampleObjectClear();
          if (this.stompService.stompClient) {
            this.stompService.startStompRequest('/cmd/stop-record', {});
          }
          sessionStorage.removeItem('sampleWsOpen');
        }
      }
    });
  }

  /**
   * 点击建议反馈图标
   */
  public openAdvice(event: any) {

    this.Axios.axios.get('/users/version/',
      { baseURL: '../user-management/api/v2.2', timeout: 3000 })
      .then((resp: any) => {
        window.open(event, '_blank');
      }).catch((error: any) => {
        this.errorAlert.openWindow();
      });
  }


  ngAfterViewInit(): void {
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      // 初始化遮罩层 user-guide
      this.userGuide.userGuideMaskInit();
    }
  }
  private handleCleanCache() {
    this.downloadService.downloadItems = {
      env: {
        isFinish: false,
        cpuInofo: [],
        sysEnv: [],
        suggestArr: [],
        suggetSate: '',
        btnIcon: ''
      },
      fileIO: {
        isStackFinish: false,
        data: {},
        stackTraceMap: {}
      },
      socketIO: {
        isStackFinish: false,
        data: [],
        stackTraceMap: {}
      },
      object: {
        isFileFinish: false,
        isStackFinish: false,
        data: [],
        stackTraceMap: {}
      },
      gc: {
        isFinish: false,
        baseConfig: [],
        heapConfig: [],
        youngGenConfig: [],
        survivorConfig: [],
        tlabConfig: [],
        activity: [],
        activeData: {},
        timeData: [],
        suggestArr: [],
        suggetSate: '',
        btnIcon: ''
      },
      thread: {
        isFinish: false,
        data: []
      },
      lock: {
        isFinish: false,
        data: [],
        instances: [],
        lockThread: [],
        stackTraceMap: {}
      },
      method: {
        isFinishJava: false,
        isFinishNative: false,
        java: {},
        native: {}
      },
      leak: {
        isFinish: false,
        referPool: [],
        stackPool: [],
        oldSample: [],
        finishReport: false,
        suggestArr: [],
        suggetSate: '',
        btnIcon: ''
      }
    };
  }
}
