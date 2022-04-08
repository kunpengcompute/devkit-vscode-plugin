import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Util } from '@cloud/tiny3';
import { StompService } from '../../service/stomp.service';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { Subscription } from 'rxjs';
import { MytipService } from '../../service/mytip.service';
import { AxiosService } from '../../service/axios.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { UserGuideService } from '../../service/user-guide.service';
import { ProfileCreateService } from '../../service/profile-create.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiTreeNode } from '@cloud/tiny3';
import { LibService } from '../../service/lib.service';
import { HomeHttpService } from '../../core/home/service';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss'],
})
export class ProfileDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stopAnalysisIns') stopAnalysisIns: any;
  @ViewChild('restartAnalysis') restartAnalysis: any;
  @ViewChild('dataLimit') dataLimit: any;
  @ViewChild('exportTabs') exportTabs: any;
  @ViewChild('deleteAll') deleteAll: any;
  @ViewChild('deleteOne') deleteOne: any;
  @ViewChild('deleteSnapshot') deleteSnapshot: any;
  @ViewChild('suggestion') suggestion: any;
  @ViewChild('leavePage') leavePage: any;
  @ViewChild('container') private containerRef: ElementRef;
  public currentTab: any = 0;
  public suggestNum: number;
  public hoverSuggest: string;
  public suggestArr: any = [];
  public sugtype = 1;
  public profileName: string;
  public profileGuardianName: string;
  public profileId: string;
  public showStopBtn = true;
  public jvmId = '';
  public guardianId = '';
  private guardianName = '';
  i18n: any;
  public currentLang: string;
  public currentHover: any;
  public userRole: string;
  public innerData: Array<TiTreeNode> = [];
  public configPoolSrcData: TiTableSrcData;
  public configPoolColumns: Array<TiTableColumns> = [];
  public configPoolDisplayed: Array<TiTableRowData> = [];
  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private stompService: StompService,
    public i18nService: I18nService,
    private msgService: MessageService,
    private homeHttpServe: HomeHttpService,
    private myTip: MytipService,
    private Axios: AxiosService,
    public downloadService: ProfileDownloadService,
    public userGuide: UserGuideService,
    public createProServise: ProfileCreateService,
    public libService: LibService,
    private renderer2: Renderer2
  ) {
    this.i18n = this.i18nService.I18n();
    this.formItems = {
      over_view: {
        id: '',
        timeValue: '',
      },
      jdbc: {
        id: '',
        timeValue: '',
      },
      pool_form: {
        id: '',
        dataValue: '',
      },
      mongodb: {
        id: '',
        timeValue: '',
      },
      cassandra: {
        id: '',
        timeValue: '',
      },
      hbase: {
        id: '',
        timeValue: '',
      },
      http: {
        id: '',
        timeValue: '',
      },
      file_io: {
        id: '',
        timeValue: '',
        dataValue: ''
      },
      socket_io: {
        id: '',
        timeValue: '',
        dataValue: ''
      },
      boot_metrics: {
        id: '',
        timeValue: '',
      },
      boot_traces: {
        id: '',
        timeValue: '',
        dataValue: ''
      },
      gc: {
        id: '',
        timeValue: '',
        dataValue: ''
      }
    };
  }
  public innerDataTabs: any = [];

  /**
   * 标识是否在profile页面有刷新网页的操作
   * 1：由home页跳入profile；
   * 0：刷新页面
   */
  public profileRoute = '1';
  public timerFlag: any;
  public guarTimer: any = null;
  public guardianList: any = [];
  public curGuardian: any = [];
  public refresh = true;
  public showTip = false;
  public selectedData: any[] = [];
  public showSuereBtn = false;
  public commonConfig: any = {};
  public dataTab = ['overview', 'database', 'httpRequest', 'io', 'springBoot', 'gc'];
  public databaseTab = ['jdbc', 'jdbcpool', 'mongodb', 'cassandra', 'hbase'];
  public formItems: any = {};
  public formItemsName = ['over_view', 'jdbc', 'pool_form', 'mongodb',
    'cassandra', 'hbase', 'http', 'file_io', 'socket_io',
    'boot_metrics', 'boot_traces', 'gc'];
  public typeOptions: any = {};
  public typeSelected: any;
  public isDownload = false;
  public suggestItem: any = [
    {
      tabName: 'overview',
      expend: false,
      show: false,
      label: 1,
      subLabel: false,
      suggest: [],
      object: ''
    },
    {
      tabName: 'gc',
      expend: false,
      show: false,
      label: 2,
      subLabel: false,
      suggest: [],
      object: ''
    },
    {
      tabName: 'database',
      expend: false,
      show: false,
      label: 4,
      subLabel: true,
      suggest: [],
      object: 'jdbcpool'
    },
    {
      tabName: 'gcLog',
      expend: false,
      show: false,
      label: 5,
      subLabel: false,
      suggest: [],
      object: ''
    }
  ];
  public exInnerDataTabs: any = [];
  public restartTip = '';
  public isProfiling = false;
  public timer: any = null;
  public suggestionsSub: Subscription;
  public deleteOneTab: Subscription;
  public refreshSub: Subscription;
  public changePage = false;
  public changeIndex: any;
  public nowPage: any;
  public downloadLanguage: any = '';
  public langTip: any = '';
  public reportData: any; // 暂存报告信息
  public profileInfo: any; // 暂存jvm信息
  public noExportWarnTip = true;

  public gcExpend = false;
  public overviewExpend = false;
  public ioExpend = false;
  public databaseExpend = false;
  public webExpend = false;
  ngOnInit() {
    this.configPoolColumns = [
      {
        title: 'key',
        width: '50%'
      },
      {
        title: 'value',
        width: '50%'
      }
    ];
    this.isDownload = JSON.parse(sessionStorage.getItem('download_profile'));
    this.suggestItem[0].suggest = this.downloadService.downloadItems.overview.suggestArr;
    this.suggestItem[1].suggest = this.downloadService.downloadItems.gc.suggestArr;
    this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr;
    this.suggestItem[3].suggest = this.downloadService.downloadItems.gclog.suggestArr;
    this.suggestNum = this.downloadService.downloadItems.gc.suggestArr.length +
      this.downloadService.downloadItems.jdbcpool.suggestArr.length +
      this.downloadService.downloadItems.overview.suggestArr.length +
      this.downloadService.downloadItems.gclog.suggestArr.length;
    if (this.isDownload) {
      this.downloadLanguage = this.downloadService.downloadItems.language;
      if (this.downloadLanguage !== sessionStorage.getItem('language')) {
        if (this.downloadLanguage === 'en-us') {
          this.langTip = this.i18n.langTipEn;
        } else if (this.downloadLanguage === 'zh-cn') {
          this.langTip = this.i18n.langTipCh;
        }
      } else {
        this.langTip = '';
      }
      this.innerDataTabs = this.downloadService.downloadItems.innerDataTabs;
      if (this.innerDataTabs[0]) {
        this.innerDataTabs[0].children.forEach((item: any, i: number) => {
          item.tabName = this.createProServise.innerDataTabs[0].children[i].tabName;
        });
      }
      if (this.innerDataTabs.length) {
        this.innerDataTabs[0].children.forEach((e: {
          link: string;
          children: { checked: boolean; }[]; checked: boolean;
        }) => {
          if (e.link === 'overview') {
            e.checked
              ? this.suggestItem[0].suggest = this.downloadService.downloadItems.overview.suggestArr
              : this.suggestItem[0].suggest = [];
          }
          if (e.link === 'memoryDump') {
            e.checked = false; // 导入时不显示
          }
          if (e.link === 'hot') {
            e.checked = false; // 导入时不显示
          }
          if (e.link === 'gc') {
            e.checked
              ? this.suggestItem[1].suggest = this.downloadService.downloadItems.gc.suggestArr
              : this.suggestItem[1].suggest = [];
            e.children[1].checked
              ? this.suggestItem[3].suggest = this.downloadService.downloadItems.gclog.suggestArr
              : this.suggestItem[3].suggest = [];
          }
          if (e.link === 'database') {
            e.children[1].checked
              ? this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr
              : this.suggestItem[2].suggest = [];
          }
          if (e.link === 'database') {
            e.children[1].checked
              ? this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr
              : this.suggestItem[2].suggest = [];
          }
        });
        this.suggestNum = this.suggestItem[0].suggest.length + this.suggestItem[1].suggest.length +
          this.suggestItem[2].suggest.length + this.suggestItem[3].suggest.length;
      }
      if (!this.innerDataTabs.length) {
        return this.goHome();
      }
      const checkedArr = this.innerDataTabs[0].children.filter((item: any) => {
        return item.checked;
      });
      this.innerDataTabs[0].children.forEach((item: any) => {
        item.active = false;
      });
      const index = this.innerDataTabs[0].children.findIndex((e: any) => e === checkedArr[0]);
      this.innerDataTabs[0].children[index].active = true;
    } else {
      this.innerDataTabs = this.createProServise.innerDataTabs;
      this.exInnerDataTabs = JSON.parse(JSON.stringify(this.createProServise.innerDataTabs));

      this.innerDataTabs[0].children.forEach((item: any) => {
        item.active = false;
      });
      this.innerDataTabs[0].children[0].active = true;
      this.innerDataTabs[0].children[0].styleId = 'user-guide-profile';
    }
    this.getInnerDataTabsExpend();
    this.typeOptions = [
      {
        label: this.i18n.common_term_clear_all,
        id: 'all'
      },
      {
        label: this.i18n.common_term_clear_one,
        id: 'one'
      }
    ];
    this.initCommonConfig();
    this.initDataValue();
    const sub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'dataLimit') {
        this.initDataValue();
      }
      if (msg.type === 'errorStopPro' || msg.type === 'errors') {
        if (msg.data.alarmLevel === 'STOP' || msg.data.type === 'STOP_PROFILE') {
          this.subStopAnalysis();
          this.stompService.disConnect();
          clearInterval(this.guarTimer);
          this.guarTimer = null;
        }
      }
      if (msg.type === 'error') {
        this.subStopAnalysis();
      }
    });
    this.deleteOneTab = this.msgService.getMessage().subscribe(msg => {
        if (msg.type === `getDeleteOne`) {
          if (msg.isNoData === 'true') {
            this.myTip.alertInfo({
              type: 'warn',
              content: this.i18n.protalserver_profiling_noData,
              time: 3500
            });
          } else if (msg.isNoData === 'false') {
            const page = this.downloadService.downloadItems.currentTabPage;
            if (page === this.i18n.protalserver_profiling_tab.snapshot) {
              this.deleteSnapshot.open();
              return;
            }
            this.deleteOne.content = this.i18nService.I18nReplace(
              this.i18n.protalserver_profiling_delOneTip,
              { 0: page }
            );
            this.deleteOne.alertTitle = this.i18n.protalserver_profiling_delOne;
            this.deleteOne.type = 'warn';
            this.deleteOne.deleteStatu = true;
            this.deleteOne.haveContent = false;
            this.deleteOne.alert_show();
          }
        } else if (msg.type === 'deleteGcLogSuggest') {
          this.downloadService.downloadItems.gclog.suggestArr = [];
          this.suggestItem[3].suggest = [];
          this.suggestNum = this.suggestItem[0].suggest.length +
            this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
        }
    });
    this.refreshSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'data') {
        if (msg.data.type === 'guardian') {
          this.queryGuardins();
        }
      }
      if (msg.type === 'data') {
        if (msg.data.type === 'REMOVE_GUARDIAN') {
          this.myTip.alertInfo({
            type: 'warn',
            content: msg.data.message,
            time: 3000,
          });
        }
      }
    });
    this.suggestionsSub = this.msgService.getMessage().subscribe(msg => {
      if (msg.type === 'suggestions') {
        this.suggestArr = this.downloadService.downloadItems.profileInfo.suggestArr;
        this.msgService.sendMessage({
          type: 'suggest',
          data: this.suggestArr
        });
        this.suggestNum = this.downloadService.downloadItems.profileInfo.suggestArr.length +
          this.downloadService.downloadItems.jdbcpool.suggestArr.length;
        this.parseData();
      }
      if (msg.type === 'connect-pool-suggest') {
        let sug = msg.data;
        this.suggestArr.push(sug);
        sug = [];
        this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr;
        this.suggestNum = this.suggestItem[0].suggest.length + this.suggestItem[1].suggest.length +
          this.suggestItem[2].suggest.length + this.suggestItem[3].suggest.length;
      }
    });
    $('.header').css({ background: '#061829' });
    this.userRole = sessionStorage.getItem('role');
    this.currentLang = sessionStorage.getItem('language');
    this.profileRoute = sessionStorage.getItem('profile_route');
    if (this.profileRoute === '0') {
      let tempTimer = setTimeout(() => {
        this.router.navigate(['home']);
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 300);
    }
    sessionStorage.setItem('showSourceCode', JSON.stringify(false));
    sessionStorage.setItem('profile_route', '0');
    sessionStorage.setItem('isProStop', 'false');
    this.jvmId = sessionStorage.getItem('jvmId');
    this.downloadService.downloadItems.profileInfo.jvmId = this.jvmId;
    this.guardianId = sessionStorage.getItem('guardianId');
    this.guardianName = sessionStorage.getItem('guardianName');
    this.route.children[0].url.subscribe((url) => {
      if (url[0]) {
        const index = this.innerDataTabs[0].children.findIndex((tab: any) => {
          return tab.link === url[0].path;
        });
        this.tabsToggle(index);
      }
    });
    /**
     * 跳转到分析页
     */
    this.route.params.subscribe((params) => {
      this.profileName = params.profileName;
      this.downloadService.downloadItems.profileInfo.jvmName = this.profileName;
      sessionStorage.setItem('reportName', this.profileName);
      this.profileGuardianName = params.profileGuardianName;
    });
    if (this.isDownload) {
      this.innerDataTabs[0].children.forEach((tab: any) => {
        if (tab.link === 'snapshot') {
          tab.show = false;
        }
      });
      let tempTimer = setTimeout(() => {
        sessionStorage.setItem('profile_route', '0');
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 100);
      this.subStopAnalysis();
      return;
    }
    if (this.suggestItem[2].suggest.length === 0) {
      this.suggestItem[2].suggest = this.downloadService.downloadItems.jdbcpool.suggestArr;
    }
    window.addEventListener('beforeunload', (event) => {
      sessionStorage.removeItem('snapShot');
    });
    this.initExpend();
  }
  /**
   * 获取指定tab的Expend
   */
  public getInnerDataTabsExpend() {
    this.innerDataTabs[0].children.forEach((e: { link: string; expend: any; }) => {
      if (e.link === 'overview') {
        this.overviewExpend = e.expend;
      }
      if (e.link === 'gc') {
        this.gcExpend = e.expend;
      }
      if (e.link === 'io') {
        this.ioExpend = e.expend;
      }
      if (e.link === 'database') {
        this.databaseExpend = e.expend;
      }
      if (e.link === 'web') {
        this.webExpend = e.expend;
      }
    });
  }
  ngAfterViewInit(): void {
    this.renderer2.listen(this.containerRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
    const proTitle = this.elementRef.nativeElement.querySelector('.pro-title');
    if (proTitle) {
      const proTitleWidth = proTitle.offsetWidth;
      if (proTitleWidth > 490) {
        this.showTip = true;
      }
    }

    // user-guide
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      this.userGuide.hideMask();
      let tempTimer = setTimeout(() => {
        this.userGuide.showMask('user-guide-profile');
        clearTimeout(tempTimer);
        tempTimer = null;
      }, 500);
    }
  }
  tabsToggle(index: any) {
    const nowPage = this.innerDataTabs[0].children.filter((item: any) => {
      return item.active === true;
    });
    this.nowPage = nowPage[0].link;
    this.changeIndex = index;
    if (this.innerDataTabs[0].children[index].link === this.nowPage) {
      return;
    }
    const currPage =
      nowPage[0].link === 'overview' ||
      nowPage[0].link === 'thread' ||
      (nowPage[0].link === 'gc' && nowPage[0].children[0].active === true) ||
      nowPage[0].link === 'http' && this.downloadService.dataSave.isHttpStart;
    const stop = JSON.parse(sessionStorage.getItem('isProStop'));
    if (!this.downloadService.leavePageCheck && !stop && !this.isDownload && currPage) {
      if (!this.leavePage) { return; }
      this.leavePage.type = 'prompt';
      this.leavePage.title = this.i18n.leavePage.leave_page_title;
      this.leavePage.alertTitle = this.i18n.leavePage.leave_page_title;
      this.leavePage.content = this.i18n.leavePage.leave_page_content;
      this.leavePage.alert_show();
    } else {
      this.confirmLeavePage(true);
    }
  }

  goHome() {
    const stop = JSON.parse(sessionStorage.getItem('isProStop'));
    if (stop) {
      this.stompService.clearTimeOut();
      this.downloadService.initDatabase();
      sessionStorage.removeItem('snapShot');
      sessionStorage.removeItem('currentJvmStatus');
      this.msgService.isClearProfile = false;
      this.msgService.isClearProSocket = false;
      this.msgService.clearProFileMessage();
      this.msgService.clearProSocketMessage();
    }
    // 获取当前时间存入服务
    const nowDataTime = new Date().getTime();
    this.downloadService.downloadItems.profileInfo.nowTime =
      this.libService.dateFormat(nowDataTime, 'yyyy/MM/dd hh:mm:ss');
    this.downloadService.downloadItems.profileInfo.toolTipDate = this.libService.dateFormat(nowDataTime, 'yyyy/MM/dd');
    this.router.navigate(['home']);
  }

  public initCommonConfig() {
    this.commonConfig = {
      over_view: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [1, 3]
      },
      jdbcTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      jdbcpoolTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [1, 3]
      },
      jdbcpoolData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [50, 100]
      },
      mongodbTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      cassandraTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      hbaseTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      httpTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      fileIoTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      fileIoData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [5000, 10000]
      },
      socketIoTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      socketIoData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [5000, 10000]
      },
      metricsTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [5, 10]
      },
      http_tracesTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [5, 10]
      },
      http_tracesData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [3000, 5000]
      },
      gcTime: {
        label: this.i18n.dataLimit.timeHorizon,
        range: [3, 10]
      },
      gcData: {
        label: this.i18n.dataLimit.countHorizon,
        range: [300, 500]
      },
    };
  }

  stopAnalysis() {
    if (this.downloadService.downloadItems.snapShot.snapshotTagState &&
      this.downloadService.downloadItems.snapShot.showSnapShotData) {
      this.stopAnalysisIns.type = 'warn';
      this.stopAnalysisIns.alert_show();
      this.stopAnalysisIns.alertTitle = this.i18n.protalserver_profiling_stop_analysis;
      this.stopAnalysisIns.haveContent = false;
      this.stopAnalysisIns.deleteStatu = true;
      this.stopAnalysisIns.content = this.i18n.common_term_has_profiling_stop_content;
    } else {
      this.stopAnalysisIns.type = 'warn';
      this.stopAnalysisIns.alert_show();
      this.stopAnalysisIns.alertTitle = this.i18n.protalserver_profiling_stop_analysis;
      this.stopAnalysisIns.haveContent = false;
      this.stopAnalysisIns.deleteStatu = true;
      this.stopAnalysisIns.content = this.i18n.common_term_has_profiling_stop_content;
    }
  }

  /**
   * 停止分析 弹框确认
   * params data 点击弹框确认为true，取消为false
   */
  public confirmHandle_stop(data: any) {
    if (data) {
      this.stompService.startStompRequest('/cmd/stop-profile', {
        jvmId: this.jvmId,
        guardianId: this.guardianId,
      });
      sessionStorage.removeItem('currentJvmStatus');
      this.subStopAnalysis();
      this.stompService.disConnect();
      this.stopAnalysisIns.alert_close();
      return;
    }
  }

  /**
   * 请求guaridan列表数据
   */
  public queryGuardins() {
    this.Axios.axios.get('/guardians').then((resp: any) => {
      if (resp.members.length) {
        this.guardianList = resp.members;
        this.curGuardian = this.guardianList.filter((item: any) => {
          return item.owner.username === sessionStorage.getItem('username') && item.id === this.guardianId;
        });
        if (!this.curGuardian.length) {
          this.myTip.alertInfo({
            type: 'warn',
            content: this.i18nService.I18nReplace(this.i18n.guardian_not_fount, { 0: this.guardianName }),
            time: 10000,
          });
          this.subStopAnalysis();
          this.stompService.disConnect();
          clearInterval(this.guarTimer);
          this.guarTimer = null;
        }
      } else {
        this.myTip.alertInfo({
          type: 'warn',
          content: this.i18nService.I18nReplace(this.i18n.guardian_not_fount, { 0: this.guardianName }),
          time: 10000,
        });
        this.subStopAnalysis();
        this.stompService.disConnect();
        clearInterval(this.guarTimer);
        this.guarTimer = null;
      }
    });
  }

  /**
   * 发布停止分析消息
   */
  private subStopAnalysis() {
    this.msgService.sendMessage({
      type: 'isStopPro',
      isStop: true,
    });
    sessionStorage.setItem('isProStop', 'true');
    this.showStopBtn = false;
  }

  ngOnDestroy(): void {
    if (sessionStorage.getItem('isProStop') === 'true') {
      sessionStorage.removeItem('springBootToken');
    }
    if (this.deleteOneTab) { this.deleteOneTab.unsubscribe(); }
    if (this.refreshSub) { this.refreshSub.unsubscribe(); }
    clearInterval(this.timer);
    this.timer = null;
    clearInterval(this.guarTimer);
    this.guarTimer = null;
  }

  public onHoverList(label?: any, flag?: any) {
    this.currentHover = label;
    if (flag) {
      if (sessionStorage.getItem('currentJvmStatus') === 'PROFILING'
        || sessionStorage.getItem('currentJvmStatus') === 'RECORDING') {
        this.restartTip = this.i18n.protalserver_profiling_re_tip;
        this.isProfiling = true;
      } else {
        this.restartTip = '';
        this.isProfiling = false;
      }
    }
  }

  public updateDataLimit() {
    const nowPage = this.innerDataTabs[0].children.filter((item: any) => {
      return item.active === true;
    });
    this.overviewExpend = false;
    this.gcExpend = false;
    this.ioExpend = false;
    this.databaseExpend = false;
    this.webExpend = false;
    this.innerDataTabs[0].children.forEach((e: { link: string; expend: any; }) => {
      if (nowPage[0].link === 'overview') {
        this.overviewExpend = nowPage[0].expend;
      }
      if (nowPage[0].link === 'gc') {
        this.gcExpend = nowPage[0].expend;
      }
      if (nowPage[0].link === 'io') {
        this.ioExpend = nowPage[0].expend;
      }
      if (nowPage[0].link === 'database') {
        this.databaseExpend = nowPage[0].expend;
      }
      if (nowPage[0].link === 'web') {
        this.webExpend = nowPage[0].expend;
      }
    });
    this.dataLimit.Open();
  }

  public closeDataLimit() {
    this.dataLimit.Close();
  }

  public initDataValue() {
    this.Axios.axios.get(`/limitation/`).then((resp: any) => {
      resp.data.forEach((res: any) => {
        this.formItemsName.forEach(item => {
          if (res.limitationType === item) {
            if (typeof (this.formItems[item].timeValue) !== undefined) {
              this.formItems[item].timeValue = res.limitationTimes;
              this.downloadService.dataLimit[item].timeValue = res.limitationTimes;
            }
            if (typeof (this.formItems[item].dataValue) !== undefined) {
              this.formItems[item].dataValue = res.limitationRecords;
              this.downloadService.dataLimit[item].dataValue = res.limitationRecords;
            }
            this.formItems[item].id = res.id;
          }
        });
      });
    });
  }

  public handleConfirm(val: any, type: any) {
    if (Number(val) === Number(this.downloadService.dataLimit[type].timeValue)
      || Number(val) === Number(this.downloadService.dataLimit[type].dataValue)) {
      return;
    }
    let params = {};
    if (val < 50) {
      params = {
        limitationType: type,
        limitationTimes: Number(val)
      };
    } else {
      params = {
        limitationType: type,
        limitationRecords: Number(val)
      };
    }
    if (this.formItems[type].id !== -1) {
      this.Axios.axios.post(`/limitation/${encodeURIComponent(this.formItems[type].id)}`, params).then((data: any) => {
        this.formItemsName.forEach(item => {
          if (item === type) {
            if (val < 50) {
              this.downloadService.dataLimit[item].timeValue = val;
            } else {
              this.downloadService.dataLimit[item].dataValue = val;
            }
            this.initDataValue();
            this.myTip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.edite_ok,
              time: 3500,
            });
          }
        });
        this.msgService.sendMessage({
          type: 'dataLimit',
          data: {
            type,
            value: val
          },
        });
      });
    } else {
      this.Axios.axios.post(`/limitation/`, params).then((data: any) => {
        this.formItemsName.forEach(item => {
          if (item === type) {
            if (val < 50) {
              this.downloadService.dataLimit[item].timeValue = val;
            } else {
              this.downloadService.dataLimit[item].dataValue = val;
            }
            this.initDataValue();
            this.myTip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.edite_ok,
              time: 3500,
            });
          }
        });
        this.msgService.sendMessage({
          type: 'dataLimit',
          data: {
            type,
            value: val
          },
        });
      });
    }
  }

  public handleRestore(val: any, type: any) {
    if (val === this.downloadService.dataLimit[type].timeValue ||
      val === this.downloadService.dataLimit[type].dataValue) {
      return;
    }
    let params = {};
    if (val < 50) {
      params = {
        limitationType: type,
        limitationTimes: Number(val)
      };
    } else {
      params = {
        limitationType: type,
        limitationRecords: Number(val)
      };
    }
    if (this.formItems[type].id !== -1) {
      this.Axios.axios.post(`/limitation/${this.formItems[type].id}`, params).then((data: any) => {
        this.formItemsName.forEach(item => {
          if (item === type) {
            if (val < 50) {
              this.downloadService.dataLimit[item].timeValue = val;
              this.formItems[item].timeValue = val;
            } else {
              this.downloadService.dataLimit[item].dataValue = val;
              this.formItems[item].dataValue = val;
            }
            this.myTip.alertInfo({
              type: 'success',
              content: this.i18n.tip_msg.edite_ok,
              time: 3500,
            });
          }
        });
        this.msgService.sendMessage({
          type: 'dataLimit',
          data: {
            type,
            value: val
          },
        });
      });
    }
  }

  public expend(type: any) {
    this.innerDataTabs[0].children.forEach((item: any) => {
      if (item.link === type) {
        const ele = document.getElementById(type);
        item.expend = !item.expend;
        if (ele) {
          ele.style.display = item.expend ? 'block' : 'none';
        }
      }
    });
    this.getInnerDataTabsExpend();
  }


  /**
   * 清除数据
   * @param data 选择清除数据的类型
   */
  public typeChange(data: any): void {
    if (data.id === 'all') {
      this.deleteAll.type = 'warn';
      this.deleteAll.alert_show();
      this.deleteAll.alertTitle = this.i18n.protalserver_profiling_delAll;
      this.deleteAll.haveContent = false;
      this.deleteAll.deleteStatu = true;
      this.deleteAll.content = this.i18n.protalserver_profiling_delAllTip;
    }
    if (data.id === 'one') {
      this.msgService.sendMessage({
        type: 'setDeleteOne',
        tabActive: this.downloadService.dataSave.isSpringBootTabActive
      });
    }
  }

  /**
   * 关闭删除快照提示弹框
   */
  public closeDelmodal() {
    this.deleteSnapshot.close();
  }

  /**
   * profiling重新启动确认弹框
   */
  public re_Profiling() {
    if (this.isProfiling) {
      return;
    }
    this.restartAnalysis.type = 'warn';
    this.restartAnalysis.alert_show();
    this.restartAnalysis.alertTitle = this.i18n.protalserver_profiling_re_title;
    this.restartAnalysis.haveContent = false;
    this.restartAnalysis.deleteStatu = true;
    this.restartAnalysis.content = this.i18n.protalserver_profiling_re_content;
  }

  /**
   * profiling重新启动执行
   */
  public confirmHandle_restart(data: any) {
    if (data) {
      this.reportData = this.downloadService.downloadItems.report;
      this.profileInfo = this.downloadService.downloadItems.profileInfo;
      this.stompService.clearTimeOut();
      this.msgService.isClearProfile = false;
      this.msgService.isClearProSocket = false;
      this.msgService.clearProFileMessage();
      this.msgService.clearProSocketMessage();
      this.msgService.sendMessage({
        type: 'isRestart',
        isStop: false,
      });
      this.suggestArr = [];
      this.suggestItem.forEach((el: any) => {
        el.suggest = [];
      });
      this.suggestNum = 0;
      sessionStorage.setItem('isProStop', 'false');
      // 清除缓存的GC日志采集信息
      sessionStorage.removeItem('gcLogState');
      this.downloadService.initDatabase();
      this.getHeapDumpLimit();
      this.getThreadDumpLimit();
      this.getGcLogLimit();
      // 清除优化建议
      let outTimer = setTimeout(() => {
        for (const key in this.downloadService.downloadItems) {
          if (Object.prototype.hasOwnProperty.call(this.downloadService.downloadItems, key)) {
            Object.keys(this.downloadService.downloadItems[key]).forEach((item: any) => {
              if (item === 'suggestArr'){
                this.downloadService.downloadItems[key][item] = [];
              }
            });
          }
        }
        clearTimeout(outTimer);
        outTimer = null;
      }, 1500);
      let tempTimer = setTimeout(() => {
        this.createProServise.createProfiling(this.jvmId, this.guardianId);
        this.showStopBtn = true;
        clearTimeout(tempTimer);
        tempTimer = null;
        this.saveDownload();
      }, 1000);
      this.initExpend();
    }
  }

  /**
   * 获取内存数据限定
   */
  async getHeapDumpLimit() {
    const heapDumpLimit = await this.homeHttpServe.getHeapDumpLimit();
    this.downloadService.downloadItems.report.alarmHeapCount = heapDumpLimit.alarmHeapCount;
    this.downloadService.downloadItems.report.maxHeapCount = heapDumpLimit.maxHeapCount;
    this.downloadService.downloadItems.report.maxHeapSize = heapDumpLimit.maxHeapSize;
  }
  /**
   * 获取线程转储数据限定
   */
   async getThreadDumpLimit() {
    const threadDumpLimit = await this.homeHttpServe.getThreadDumpLimit();
    this.downloadService.downloadItems.report.alarmThreadDumpCount = threadDumpLimit.alarmThreadDumpCount;
    this.downloadService.downloadItems.report.maxThreadDumpCount = threadDumpLimit.maxThreadDumpCount;
  }
  /**
   * 获取GCLogs数据限定
   */
   async getGcLogLimit() {
    const gcLogLimit = await this.homeHttpServe.getGcLogLimit();
    this.downloadService.downloadItems.report.alarmGCLogsCount = gcLogLimit.alarmGcLogCount;
    this.downloadService.downloadItems.report.maxGCLogsCount = gcLogLimit.maxGcLogCount;
  }
  /**
   * 保存报告数据
   */
  saveDownload() {
    this.downloadService.downloadItems.report = this.reportData;
    this.downloadService.downloadItems.profileInfo = this.profileInfo;
  }
  /**
   * 数据重置
   */
  public initExpend() {
    const nowPage = this.innerDataTabs[0].children.filter((item: any) => {
      return item.active === true;
    });
    this.innerDataTabs[0].children.forEach((item: any) => {
      item.expend = false;
      if (item.link === nowPage[0].link) {
        item.expend = true;
      }
    });
  }
  /**
   * 确认删除全部数据
   * params data Boolean true表示选择确定
   */
  public confirmHandle_delAll(data: any) {
    if (data) {
      clearInterval(this.timer);
      const currentPage = this.downloadService.downloadItems.currentTabPage;
      this.reportData = this.downloadService.downloadItems.report;
      this.profileInfo = this.downloadService.downloadItems.profileInfo;
      sessionStorage.removeItem('gcLogState');
      this.downloadService.initDatabase();
      this.downloadService.downloadItems.currentTabPage = currentPage;
      this.downloadService.downloadItems.profileInfo.suggestArr =
        this.suggestItem[0].suggest.concat(this.suggestItem[1].suggest,
          this.suggestItem[2].suggest);
      this.downloadService.downloadItems.overview.suggestArr = this.suggestItem[0].suggest;
      this.downloadService.downloadItems.gc.suggestArr = this.suggestItem[1].suggest;
      this.downloadService.downloadItems.jdbcpool.suggestArr = this.suggestItem[2].suggest;
      this.downloadService.downloadItems.report = this.reportData;
      this.downloadService.downloadItems.profileInfo = this.profileInfo;
      this.suggestItem[3].suggest = [];
      this.suggestNum = this.suggestItem[0].suggest.length +
        this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
      this.msgService.sendMessage({
        type: 'isClear',
        isClear: true,
      });
    }
  }

  /**
   * 确认删除当前页签
   * params data Boolean true表示选择确定
   */
  public confirmHandle_delOne(data: any) {
    if (data) {
      // 删除GC日志优化建议
      if (this.downloadService.downloadItems.currentTabPage === this.i18n.protalserver_profiling_tab.gcLog) {
        this.downloadService.downloadItems.gclog.suggestArr = [];
        this.suggestItem[3].suggest = [];
        this.suggestNum = this.suggestItem[0].suggest.length +
          this.suggestItem[1].suggest.length + this.suggestItem[2].suggest.length;
      }
      this.msgService.sendMessage({
        type: 'isClearOne',
        isClear: true,
      });
    }
  }

  /**
   * 选中
   */
  public selectFn(node: TiTreeNode): void {
    this.showSuereBtn = this.exInnerDataTabs[0].checked ? true : false;
  }


  /**
   * 显示导出报告多选侧滑框
   */
  public showReportView() {
    this.noExportWarnTip = true;
    this.exInnerDataTabs = this.createProServise.initTabsData(this.exInnerDataTabs);
    this.showSuereBtn = this.exInnerDataTabs[0].checked ? true : false;
    this.exInnerDataTabs[0].children.forEach((e: {
      link: string;
      expanded: any;
      children: { checked: boolean; }[]; checked: boolean;
    }) => {
      e.expanded = true;
      if (e.link === 'thread') {
        e.children[1].checked = false; // 禁止线程转储点击
      }
      if (e.link === 'memoryDump') {
        e.checked = false; // 导出时内存转储页签禁止disabled
      }
      if (e.link === 'hot') {
        e.checked = false; // 导出时热点页签禁止disabled
      }
      if (e.link === 'gc') {
        e.children[1].checked = false; // 导出时gc日志页签禁止disabled
      }
    });
    this.exportTabs.Open();
  }

  /**
   * 取消导出
   */
  public choose_cancel() {
    this.exportTabs.Close();
  }

  /**
   * 确认导出
   */
  public choose_ok() {
    this.msgService.sendMessage({
      type: 'exportData',
      isClear: true,
    });
    this.downloadService.downloadItems.innerDataTabs = this.exInnerDataTabs;
    this.createProServise.exportProfile();
    this.exportTabs.Close();
  }

  public onHoverSuggest(msg?: any) {
    this.hoverSuggest = msg;
  }

  public openModal() {
    this.suggestion.Open();
  }

  public closeSuggest() {
    this.suggestion.Close();
  }
  /**
   * 展开优化建议
   */
  public unfold(item: any) {
    item.expend = !item.expend;
  }

  public unfoldTitle(item: any) {
    item.show = !item.show;
  }

  public unfoldContent(item: any) {
    item.state = !item.state;
  }

  public parseData() {
    this.suggestItem[0].suggest = this.suggestArr.filter((item: any) => {
      return item.label === 1;
    });
    this.downloadService.downloadItems.overview.suggestArr = this.suggestItem[0].suggest;
    this.suggestItem[1].suggest = this.suggestArr.filter((item: any) => {
      return item.label === 2;
    });
    this.downloadService.downloadItems.gc.suggestArr = this.suggestItem[1].suggest;
    this.suggestItem[3].suggest = this.suggestArr.filter((item: any) => {
      return item.label === 5;
    });
    this.downloadService.downloadItems.gclog.suggestArr = this.suggestItem[3].suggest;
  }

  /**
   * confirmLeavePage
   * 离开当前页签弹出提示
   */
  public confirmLeavePage(flag: any) {
    this.changePage = flag;
    if (flag) {
      this.innerDataTabs[0].children.forEach((tab: any) => {
        tab.active = false;
        tab.expend = false;
      });
      this.innerDataTabs[0].children[this.changeIndex].active = true;
      this.innerDataTabs[0].children[this.changeIndex].expend = true;
      this.downloadService.downloadItems.currentTabPage =
        this.i18n.protalserver_profiling_tab[this.innerDataTabs[0].children[this.changeIndex].link];
      if (this.innerDataTabs[0].children[this.changeIndex].link === this.nowPage) {
        return;
      }
      this.router.navigate(['profiling', sessionStorage.getItem('currentSelectJvm'),
        `${this.innerDataTabs[0].children[this.changeIndex].link}`]);
    } else {
      this.downloadService.leavePageCheck = false;
    }
  }
  /**
   * 删除不能导出的提示
   */
  public closeWarnTip() {
    this.noExportWarnTip = false;
  }
}
