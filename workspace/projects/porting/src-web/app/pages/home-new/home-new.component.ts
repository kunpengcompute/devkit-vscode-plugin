import {
  Component, OnInit, ViewChild, ElementRef,
  Renderer2, AfterViewInit, OnDestroy, TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {
  TiValidationConfig, TiModalService, TiTableRowData,
  TiTableSrcData, TiValidators, TiMessageService,
  Util, TiModalRef
} from '@cloud/tiny3';
import { Subscription, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import {
  CommonService, MessageService, AxiosService,
  I18nService, MytipService, LoginService
} from '../../service';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { filter } from 'rxjs/internal/operators';
import { HomeNewService } from './home-new.service';
import { VerifierUtil } from '../../../../../hyper';
const hardUrl: any = require('../../../assets/hard-coding/url.json');

@Component({
  selector: 'app-home-new',
  templateUrl: './home-new.component.html',
  styleUrls: ['./home-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeNewComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    public messageervice: MessageService,
    public Axios: AxiosService,
    public router: Router,
    public i18nService: I18nService,
    private tiModal: TiModalService,
    public mytip: MytipService,
    private elementRef: ElementRef,
    public timessage: TiMessageService,
    private renderer2: Renderer2,
    private loginService: LoginService,
    private commonService: CommonService,
    private homeService: HomeNewService
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
      }
    });
  }
  @ViewChild('pwd', { static: false }) pwdMask: any;
  @ViewChild('wed', { static: false }) wedMask: any;
  @ViewChild('firstLogin', { static: false }) firstLoginRef: TemplateRef<any>;
  @ViewChild('tiSelectCon', { static: true }) private tiSelectConRef: ElementRef;
  @ViewChild('disclaimer', { static: false }) disclaimer: any;
  @ViewChild('thinkModal', { static: false }) thinkModal: any;
  @ViewChild('errorAlert', { static: false }) errorAlert: any;

  public userName: string; // 当前用户名
  public tabLabel = '';
  public showHeader = true;
  public showDetail = false;
  public showReport = false;
  public showReportDiff = false;
  public isMain = true;
  public i18n: any;
  public currLang: any;
  public isCheck: any;
  public isChecked: any;
  public giveupfilename: any;
  public chooseTab: any = '';
  public preChooseTab = '';
  public infochinese: any = '';
  public info: any = '';
  public firstSortData: Array<any> = [];
  public firstSortPortPreData: Array<any> = [];
  public sortLabels: Array<any> = [];
  public sortLabelsPortPre: Array<any> = [];
  public isShow = false;
  public navShow = true;
  public bannerShow = true;
  public expired: string;
  public userPwd: FormGroup;
  public tipStr: string;
  public label: any;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {
      regExp: '',
      required: ''
    }
  };
  public validation2: TiValidationConfig = {
    type: 'blur'
  };
  public isLogin = true;
  public marginLeft = '250px';
  public collapsed = false; // 默认展开，当设置为true时会收起
  public toggleable = true;
  public reloadState = true; // 初始设置为true
  public isClick: any = '0';
  public firstSort = '';
  public secondSortData: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  public cateArr: any = [];
  public pwdReverse: string;
  public progressData: any = {};
  public isAlermOpt = false; // 告警时禁止操作
  public progressContext: any = {};
  public sampleBtnTip = '';
  public toggerShow = false;
  public bannerList: Array<any>;
  public bannerListEn: Array<any>;
  private closeTaskSub: Subscription;

  ngOnInit() {
    this.messageervice.getMessage().subscribe(msg => {
      if (msg.type === 'resfDisk') {
        this.queryDiskState();
      }
    });
    this.tabLabel = sessionStorage.getItem('chooseTab') || 'porting-workload';
    this.currLang = sessionStorage.getItem('language');
    this.isClick = sessionStorage.getItem('isClick');
    const tabType = sessionStorage.getItem('tabType') || 'DB';
    const idx = parseInt(this.isClick, 10);
    this.homeService.sendMessage({type: tabType});
    this.isShow = idx >= 0;
    this.renderer2.listen(this.tiSelectConRef.nativeElement, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
    this.renderer2.listen(document.body, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
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
    this.progressData = {
      id: 'disk',
      label: '',
      isShow: false,
      value: 0
    };
    this.chooseTab = sessionStorage.getItem('chooseTab') || 'porting-workload';
    if (this.chooseTab === 'home') {
      sessionStorage.setItem('chooseTab', 'home');
    }
    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        if (data.url === '/login') {
          this.isLogin = true;
          sessionStorage.setItem('isFirst', '0');
          sessionStorage.setItem('isExpired', '0');
          sessionStorage.setItem('isWillExpired', '0');
          sessionStorage.setItem('resultMsgList', '[]');
          this.isMain = false;
          setTimeout(() => {
            this.disclaimer.Close();
          }, 0);
          this.showHeader = false;
          this.bannerShow = false;
          this.navShow = false;
          this.toggerShow = true;
          sessionStorage.setItem('toggerShow', 'true');
        } else if (data.url.indexOf('/report') > -1 || data.url.indexOf('/BCReport') > -1) {
          this.bannerShow = false;
          this.navShow = false;
          this.toggerShow = true;
          this.isLogin = false;
          sessionStorage.setItem('toggerShow', 'true');
        } else if (data.url.indexOf('/reportDiff') > -1) {
          this.bannerShow = false;
          this.navShow = false;
          this.toggerShow = true;
          this.isLogin = false;
          sessionStorage.setItem('toggerShow', 'true');
        } else if (data.url.indexOf('/migrationDetail') > -1) {
          this.bannerShow = false;
          this.navShow = false;
          this.toggerShow = true;
          this.isLogin = false;
          sessionStorage.setItem('toggerShow', 'true');
        } else {
          if (sessionStorage.getItem('bannerShow') === 'false') {
            this.bannerShow = false;
          } else {
            this.bannerShow = true;
          }
          if (sessionStorage.getItem('navShow') === 'false') {
            this.navShow = false;
          } else {
            this.navShow = true;
          }
          this.showHeader = true;
          if (sessionStorage.getItem('ifLeftMenuShow') === 'false') {
            this.toggerShow = false;
            sessionStorage.setItem('toggerShow', 'false');
          }
        }
        this.isShow = false;
        if (data.url.indexOf('/homeNew/migrationCenter') >= 0 ) {
          this.chooseTab = 'migrationCenter';
          sessionStorage.setItem('chooseTab', 'migrationCenter');
          this.isClick = sessionStorage.getItem('isClick') || '0';
          this.isShow = parseInt(this.isClick, 10) >= 0;
          this.clearTip();
        } else if (data.url === '/homeNew/home' || data.url === '/homeNew/porting-workload') {
          this.chooseTab = data.url.slice(data.url.lastIndexOf('/') + 1);
          sessionStorage.setItem('chooseTab', this.chooseTab);
          this.isClick = -1;
          this.clearTip();
        } else if (
            data.url.indexOf('/softwareMigrationReport') > -1
            || data.url.indexOf('/SoftwarePackageReport') > -1
          ) {
          this.bannerShow = false;
          this.navShow = false;
          this.toggerShow = true;
          sessionStorage.setItem('toggerShow', 'true');
        } else if (data.url.indexOf('/homeNew/PortingPre-check') >= 0) {
          this.isClick = -1;
          sessionStorage.setItem('chooseTab', 'PortingPre-check');
          this.chooseTab = 'PortingPre-check';
          this.clearTip();
        } else if (data.url === '/homeNew/analysisCenter') {
          this.isClick = -1;
          sessionStorage.setItem('chooseTab', 'analysisCenter');
          this.chooseTab = 'analysisCenter';
          this.clearTip();
        }
        setTimeout(() => {
          if (this.cateArr.length !== 0) {
            this.cateArr.forEach((element: any, index: any) => {
              if (data.url.indexOf(element) > -1) {
                this.isClick = index;
              }
            });
          }
        }, 0);
      }
    });
    setTimeout(() => {
      if (
        sessionStorage.getItem('isFirst') !== '1'
        && sessionStorage.getItem('isExpired') !== '1'
        && sessionStorage.getItem('token')
      ) {
        this.firstSortData = [];
        this.firstSortPortPreData = [];
        this.queryDiskState();
        this.getFirstSort();
        this.isConfirmDisclaimer();
        this.Axios.axios.get('portadv/tasks/platform/').then((resp: any) => {
          if (this.commonService.handleStatus(resp) === 0) {
            this.isCheck = true;
            sessionStorage.setItem('isCheck', 'true');
          }
        });
      }
    }, 10);

    this.bannerList = [
      {
        link: hardUrl.bannerUrlZn5,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: '上鲲鹏社区，查看开发者新手成长路径'
      },
      {
        link: hardUrl.bannerUrlZn1,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: '上鲲鹏社区，学习使用开发套件'
      },
      {
        link: hardUrl.bannerUrlZn2,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: '查看鲲鹏代码迁移工具详细指导文档'
      },
      {
        link: hardUrl.bannerUrlZn3,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: '有疑问？向专家咨询'
      },
    ];
    this.bannerListEn = [
      {
        link: hardUrl.bannerUrlEn5,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: 'Visit the Kunpeng community to get skills for new developer growth'
      },
      {
        link: hardUrl.bannerUrlEn3,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: 'Visit the Kunpeng community to learn about Kunpeng DevKit'
      },
      {
        link: hardUrl.bannerUrlEn2,
        img: './assets/img/header/icon_header_arrow_down.svg',
        title: 'View the Kunpeng Porting Advisor documents'
      }
    ];
    this.sortLabels = [
      { label: this.i18n.common_term_migration_sort_BD },
      { label: this.i18n.common_term_migration_sort_MS },
      { label: this.i18n.common_term_migration_sort_DS },
      { label: this.i18n.common_term_migration_sort_DB },
      { label: this.i18n.common_term_migration_sort_NW },
      { label: this.i18n.common_term_migration_sort_RTL },
      { label: this.i18n.common_term_migration_sort_HPC },
      { label: this.i18n.common_term_migration_sort_SDS },
      { label: this.i18n.common_term_migration_sort_CLOUD },
      { label: this.i18n.common_term_migration_sort_NATIVE },
      { label: this.i18n.common_term_migration_sort_WEB }
    ];
    this.sortLabelsPortPre = [
      { label: this.i18n.compilation_preCheck_1 },
      { label: this.i18n.common_alignment_check.title }
    ];
    if (this.currLang === 'zh-cn') {
      this.tipStr = '工具密码有效期为90天，当前已过期，请修改密码后再使用。';
    } else {
      this.tipStr =
        'The validity period of the tool password is 90 days.\
        The password has expired. Please change the password before using the tool.';
    }
    this.userName = sessionStorage.getItem('username');
    this.label = {
      userName: this.i18n.common_term_login_name,
      Pwd: this.i18n.common_term_user_label.newPwd,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd
    };
    this.userPwd = new FormGroup({
      userName: new FormControl(''),
      oldPwd: new FormControl('', [this.oldPwd]),
      pwd: new FormControl('', [this.updateInitPwdConfirm]),
      cpwd: new FormControl('', [this.userPwdConfirm])
    });

    this.closeTaskSub = this.messageervice.getMessage().subscribe(msg => {
      if (msg.type === 'collapseBanner') {
        this.bannerShow = msg.data;
        sessionStorage.setItem('bannerShow', 'false');
        if (msg.subType === 'weak') {
          if (sessionStorage.getItem('weakTop')) {
            $('.router-content')[0].scrollTop = 0;
            sessionStorage.removeItem('weakTop');
          }
        }
      } else if (msg.type === 'queryDisk') {
        this.queryDiskState(msg.type);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
  }

  public toggleClick(isHide: boolean): void {
    this.marginLeft = isHide ? '0' : '250px';
  }

  /**
   * 改变图标颜色
   * @param index 下标索引
   * @param bool true: 移入  false: 移出
   */
  public changebannerImgSrcZh(index: number, bool: boolean): void {
    if (this.currLang === 'zh-cn') {
      this.bannerList[index].img = bool
        ? './assets/img/header/icon_header_arrow_down_hover.svg'
        : './assets/img/header/icon_header_arrow_down.svg';
    } else {
      this.bannerListEn[index].img = bool
        ? './assets/img/header/icon_header_arrow_down_hover.svg'
        : './assets/img/header/icon_header_arrow_down.svg';
    }
  }

  // 监听页签切换
  public onVoted(agreed: string) {
    this.tabLabel = agreed;
  }

  // 页签切换
  public goTab(item: any, modalTemplate?: any) {
    this.tabLabel = item;
    this.isShow = false;
    this.isClick = '';
    sessionStorage.setItem('isClick', '');
    sessionStorage.setItem('tabType', '');
    this.isChecked = sessionStorage.getItem('routerFile');
    this.giveupfilename = sessionStorage.getItem('currentfilename');
    const routerFile = sessionStorage.getItem('routerFile');
    sessionStorage.setItem('preChooseTab', sessionStorage.getItem('chooseTab'));
    if (this.router.url.indexOf('/report?report=') >= 0) {
      const flag = sessionStorage.getItem('editFlag');
      if (flag === 'true') {
        this.tiModal.open(modalTemplate, {
          id: 'changeWeb',
          modalClass: 'del-report',
          close: (): void => {
            sessionStorage.setItem('chooseTab', item);
            this.chooseTab = item;
          },
          dismiss: (): void => {}
        });
      } else {
        sessionStorage.setItem('chooseTab', item);
        this.chooseTab = item;
      }
    } else if (routerFile === 'true') {
      this.giveupfilename = this.i18n.common_term_sure_leave_tip1;
      this.tiModal.open(modalTemplate, {
        id: 'changeWeb',
        modalClass: 'del-report',
        close: (): void => {
          sessionStorage.setItem('chooseTab', item);
          this.chooseTab = item;
          sessionStorage.setItem('routerFile', 'false');
        },
        dismiss: (): void => {}
      });
    } else {
      sessionStorage.setItem('chooseTab', item);
      this.chooseTab = item;
    }
  }
  private clearTip() {
    const tips = $('.tip-box>.mytip .tip-close>.tip-toggle');
    tips.trigger('click');
  }

  /**
   * 查询磁盘空间
   * @param type 代表内存一致性确定检查
   */
  private queryDiskState(type?: string) {
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.Axios.axios.get('/space/').then((resp: any) => {
        if (type && (resp.partRemain < 1 || resp.softRemain < 1)) {
          this.messageervice.sendMessage({
            type: 'closeTaskMsg',
            data: {
              result: {
                subType: 'weakCheck'
              }
            }
          });
          this.mytip.alertInfo({ type: 'warn', content: this.i18n.disk_monitor.sample_opt_tip_disk, time: 10000 });
        }
        const diskInfo = {
          diskTotal: resp.partitionTotal, // 分区总容量，单位 GB
          workTotal: resp.softNeeded, // 工作空间预定容量
          alarmStatus: resp.alarm_status, // 状态报警
          maxPrecent: 95,
          minPrecent: 80,
          per_disk: resp.partitionPercent, // 分区使用百分比
          per_work: resp.softPercent, // 工作空间使用百分比
          diskRemain: resp.partRemain, // 分区剩余
          workRemain: resp.softRemain  // 工作空间剩余
        };
        this.showDisk(diskInfo);
      });
    }
  }

  private showDisk(data: any) {
    this.isAlermOpt = true;
    this.progressData = { ...data };
    this.progressData.isShow = this.progressData.alarmStatus !== 0;
    this.progressData.label = this.i18n.disk_monitor.label;
    let colorState = '';
    const per_disk = this.progressData.per_disk;
    if (this.progressData.alarmStatus === 2 || this.progressData.alarmStatus === 4) {
      this.progressData.recommand = (parseFloat(this.progressData.diskTotal) * 0.2).toFixed(1); // 建议工作空间(工作空间的20%)
      this.isAlermOpt = true;
      this.progressData.id = 'disk';
      this.progressData.percent = per_disk < 100 ? per_disk : 100;
      const diskRemain = this.progressData.diskRemain;
      this.progressData.value = diskRemain > 0 ? parseFloat(diskRemain.toFixed(2)) : 0;
      if (this.progressData.alarmStatus === 2) {
        colorState = '#f45c5e';
      } else {
        colorState = '#fdca5a'; // 黄色报警
      }
      this.progressContext.tipContents = [
        {
          label: this.i18n.disk_monitor.disk,
          value: parseInt(this.progressData.diskTotal.toFixed(), 10),
          color: '#fff'
        },
        {
          label: this.i18n.disk_monitor.disk_remain,
          value: this.progressData.value,
          color: colorState
        },
        {
          label: this.i18n.disk_monitor.recommend,
          value: this.progressData.recommand,
          color: '#fff'
        }
      ];
      this.progressContext.suggestion = this.i18n.disk_monitor.disk_full_tip;
      this.sampleBtnTip = this.i18n.disk_monitor.sample_opt_tip_disk;
    }
  }

  public getFirstSort() {
    this.Axios.axios.get('/portadv/solution/category/').then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        if (data.data.category.length) {
          this.cateArr = data.data.category;
          data.data.category.forEach((el: any) => {
            this.showLabel(el);
          });
        }
      } else {
        if (sessionStorage.getItem('language') === 'zh-cn') {
          this.mytip.alertInfo({ type: 'warn', content: data.infochinese, time: 10000, web: 'migration' });
        } else {
          this.mytip.alertInfo({ type: 'warn', content: data.info, time: 10000, web: 'migration' });
        }
      }
    });
  }
  showSecondData(tab: any, index: any) {
    this.isClick = index;
    sessionStorage.setItem('tabType', tab);
    if (index) {
      sessionStorage.setItem('isClick', index);
    } else {
      sessionStorage.setItem('isClick', '0');
    }
    this.homeService.sendMessage({type: tab});
    this.router.navigate(['homeNew/migrationCenter'], { queryParams: { type: tab } });
  }
  public showLabel(el: any) {
    switch (el) {
      case 'BD':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[0].label
        });
        break;
      case 'MS':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[1].label
        });
        break;
      case 'DS':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[2].label
        });
        break;
      case 'DB':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[3].label
        });
        break;
      case 'NW':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[4].label
        });
        break;
      case 'RTL':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[5].label
        });
        break;
      case 'HPC':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[6].label
        });
        break;
      case 'SDS':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[7].label
        });
        break;
      case 'CLOUD':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[8].label
        });
        break;
      case 'NATIVE':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[9].label
        });
        break;
      case 'WEB':
        this.firstSortData.push({
          key: el,
          label: this.sortLabels[10].label
        });
        break;
    }
  }
  public collapse() {
    sessionStorage.setItem('preChooseTab', sessionStorage.getItem('chooseTab'));
    this.chooseTab = 'migrationCenter';
    sessionStorage.setItem('chooseTab', 'migrationCenter');
    this.tabLabel = 'migrationCenter';
    this.isShow = !this.isShow;
    if (!this.isShow) { return; }
    let idx = parseInt(this.isClick, 10);
    idx = idx === -1 ? 0 : idx;
    this.showSecondData(this.cateArr[idx], idx);
  }
  public show() {
    this.chooseTab = 'migrationCenter';
    this.tabLabel = 'migrationCenter';
    sessionStorage.setItem('chooseTab', 'migrationCenter');
  }
  public toggleNav(data: any) {
    this.navShow = data;
    if (data) {
      sessionStorage.setItem('navShow', 'true');
    } else {
      sessionStorage.setItem('navShow', 'false');
    }
  }
  public topCollapse() {
    const isHeaderConfig = JSON.parse(sessionStorage.getItem('ifLeftMenuShow'));
    if (isHeaderConfig) { return; }
    this.bannerShow = !this.bannerShow;
    sessionStorage.setItem('bannerShow', JSON.stringify(this.bannerShow));
    this.messageervice.sendMessage({
        type: 'changeBannerBg',
        data: this.bannerShow
    });
  }
  public closeWed() {
    this.wedMask.Close();
    sessionStorage.setItem('expiredInfochinese', '');
    sessionStorage.setItem('expiredInfo', '');
  }
  public reLoad() {
    this.expired = sessionStorage.getItem('isExpired');
    this.currLang = sessionStorage.getItem('language');
    this.i18n = this.i18nService.I18n();
    if (sessionStorage.getItem('isFirst') === '1') {
      setTimeout(() => {
        this.showFirstLoginModal(this.firstLoginRef);
      }, 500);
    } else { // 用户是否签署免责声明
      setTimeout(() => {
        this.isConfirmDisclaimer();
      }, 500);
    }
    this.infochinese = sessionStorage.getItem('expiredInfochinese');
    this.info = sessionStorage.getItem('expiredInfo');
    if (sessionStorage.getItem('isWillExpired') === '1') {
      this.wedMask.Open();
    }
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      this.firstSortData = [];
      this.firstSortPortPreData = [];
      this.Axios.axios.get('portadv/tasks/platform/').then((resp: any) => {
        sessionStorage.setItem('isCheck',  JSON.stringify(this.commonService.handleStatus(resp) === 0));
      });
      this.getFirstSort();
    }
  }
  public returnMain() {
    this.isMain = true;
    if (sessionStorage.getItem('bannerShow') === 'false') {
      this.bannerShow = false;
    } else {
      this.bannerShow = true;
    }
  }
  public setUserPwd(modalRef: TiModalRef): boolean | void {
    const errors: ValidationErrors | null = TiValidators.check(this.userPwd);
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).focus();
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`).blur();
      return false;
    }
    const params = {
      old_password: this.userPwd.get('oldPwd').value,
      new_password: this.userPwd.get('pwd').value,
      confirm_password: this.userPwd.get('cpwd').value
    };
    this.Axios.axios.post('/users/' + encodeURIComponent(sessionStorage.getItem('loginId')) + '/resetpassword/', params)
    .then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.userPwd.reset();
        this.loginService.logout();
        modalRef.destroy(true);
      } else {
        const content  = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.mytip.alertInfo({ type: 'warn', content, time: 10000 });
      }
    });
  }

  // 查看用户是否签署免责声明
  isConfirmDisclaimer() {
    this.Axios.axios.get('/users/disclaimercounts/').then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        if (res.data.disclreadcounts === 0) {
          this.disclaimer.Open();
        }
      }
    });
  }
  // 关闭免责声明
  closeDisclaimer() {
    this.tiModal.open(this.thinkModal, {
      id: 'aarch64Modal',
      modalClass: 'modal400',
      close: (): void => {
        this.loginService.logout();
      }
    });
  }
  // 确认免责声明
  confirmDisclaimer() {
    this.Axios.axios.post('/users/firstdisclaimer/').then((res: any) => {
      this.disclaimer.Close();
     });
  }

  ngAfterViewInit(): void {
    this.expired = sessionStorage.getItem('isExpired');
    if (sessionStorage.getItem('isFirst') === '1') {
      setTimeout(() => {
        this.showFirstLoginModal(this.firstLoginRef);
      }, 500);
    }
  }

  /**
   * 显示修改初始密码弹框
   * @param templateRef 组件模板
   */
  showFirstLoginModal(templateRef: TemplateRef<any>): void {
    this.tiModal.open(templateRef, {
      modalClass: 'modal560',
      context: {
        title: this.expired === '1'
          ? this.i18n.common_term_change_initial1
          : this.i18n.common_term_change_initial
      },
      beforeClose: (modalRef: TiModalRef, reason: boolean): void => {
        if (reason) {
          this.setUserPwd(modalRef);
        } else {
          const language = sessionStorage.getItem('language');
          sessionStorage.clear();
          sessionStorage.setItem('language', language);
          this.router.navigate(['/login']);
          modalRef.destroy(false);
        }
      }
    });
  }

  // 旧密码校验
  oldPwd = (control: FormControl) => {
    let newPwd = '';
    if (this.userPwd?.controls) {
      newPwd = this.userPwd.controls.pwd.value;
    }
    if (!control.value) {
      return { oldPwd: {tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (newPwd) { // 如果新密码存在 则每次输入旧密码都去校验新密码规则
      this.userPwd.get('pwd').updateValueAndValidity();
      return null;
    }
    return null;
  }
  // 新密码校验
  updateInitPwdConfirm = (control: FormControl) => {
    let oldPwd = '';
    if (this.userPwd?.controls) {
      oldPwd = this.userPwd.controls.oldPwd.value;
    }
    if (!control.value) {
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_password } };
    } else if (control.value === oldPwd) { // 相同
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.different } };
    } else if (control.value === oldPwd.split('').reverse().join('')) { // 逆序
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.reverse } };
    } else if (!VerifierUtil.passwordVerification(control.value)) {
      return { pwd: { confirm: true, error: true, tiErrorMessage: this.i18n.reg_pwd.complex } };
    } else if (this.userPwd.controls.cpwd.value) {
      this.userPwd.get('cpwd').updateValueAndValidity();
      return {};
    }
    return {};
  }
  // 确认密码校验
  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_required_tip } };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return { cpwd: { confirm: true, error: true, tiErrorMessage: this.i18n.common_term_no_samepwd } };
    }
    return {};
  }

  /**
   * 建议反馈
   */
  public onJumpFeedback() {
    this.messageervice.sendMessage({ type: 'closeTip' });
    this.Axios.axios.get(`/customize/`,
      { baseURL: 'api', timeout: 3000 }).then((resp: any) => {
        if (resp === 'timeout') {
          this.errorAlert.openWindow();
        } else {
          window.open(hardUrl.bannerUrlZn4, '_blank');
        }
    }).catch((error: any) => {
    });
 }

}

