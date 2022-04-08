import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { TiLocale } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { KeyFunction } from 'projects/java/src-web/app/service/lib.service';
import { HeaderService } from 'java/src-web/app/service/header.service';
import { Subscription } from 'rxjs';
import { AxiosService } from '../../../../service/axios.service';
const hardUrl: any = require('projects/java/src-web/assets/hard-coding/url.json');

@Component({
  selector: 'app-new-header',
  templateUrl: './new-header.component.html',
  styleUrls: ['./new-header.component.scss']
})
export class NewHeaderComponent implements OnInit, OnDestroy {
  constructor(
    public i18nServe: I18nService,
    private headerService: HeaderService,
    public Axios: AxiosService,
    public router: Router
  ) {
    this.i18n = this.i18nServe.I18n();
    this.role = sessionStorage.getItem('role');
    this.userInfo = sessionStorage.getItem('username') || 'tunadmin';
    this.currentLang = sessionStorage.getItem('language');
    this.headerInforList[0].title = this.userInfo;
    this.userTipList = [
      { title: this.i18n.common_term_admin_change_pwd, type: 'pwd', isHover: false },
      { title: this.i18n.common_term_admin_log_out, type: 'logOut', isHover: false }
    ];
    this.backHomeTipList = [
      { title: this.i18n.common_term_return_home, type: 'backHome', isHover: false }
    ];
    this.settingTipList = [
      { title: this.i18n.common_term_user_info[0], type: 'userManage', role: 'Admin', isHover: false },
      { title: this.i18n.common_term_dictionary, type: 'dictionary', role: 'User', isHover: false },
      { title: this.i18n.common_term_work_key, type: 'certificate_work', role: 'Admin', isHover: false },
      { title: this.i18n.common_term_system_config, type: 'sysConfig', role: 'User', isHover: false },
      { title: this.i18n.common_term_threshold, type: 'threshold', role: 'User', isHover: false },
      { title: this.i18n.common_term_dataLimit, type: 'dataLimit', role: 'User', isHover: false },
      {
        title: this.role === 'Admin'
          ? this.i18n.common_term_log_manage
          : this.i18n.common_term_admin_log,
        type: 'log', role: 'User', isHover: false
      },
      { title: this.i18n.common_term_java_certificate, type: 'certificate_java', role: 'Admin', isHover: false }
    ];
    this.menuTipList = [
      {
        title: this.currentLang === 'zh-cn'
          ? this.i18n.common_term_lang_info[1]
          : this.i18n.common_term_lang_info[0],
        type: 'language', isHover: false
      },
      { title: this.i18n.common_term_guide, type: 'guide', isHover: false },
      { title: this.i18n.common_term_system_help, type: 'help', isHover: false },
      { title: this.i18n.common_term_statement, type: 'statement', isHover: false },
      { title: this.i18n.common_term_about, type: 'about', isHover: false }
    ];
    const feedbackObj = { title: this.i18n.common_term_system_feedback, type: 'feedback', isHover: false };
    // 只在中文环境下展示建议反馈
    if (this.currentLang === 'zh-cn') {
      this.menuTipList.splice(1, 0, feedbackObj);
    }
    this.tipType = this.headerInforList[0].type;
    this.headerSub = this.headerService.subscribe({
      next: (msg) => {
        if (msg.cmd === 'openJavaSetting') {
          this.onSettingChange('sysConfig');
        }
      }
    });
  }
  @ViewChild('logout') logout: any;
  @ViewChild('modifyPwd') modifyPwd: any;
  @ViewChild('infomodal') infomodal: any;
  @ViewChild('statement') statement: any;
  @ViewChild('about') about: any;
  @ViewChild('errorAlert', { static: false }) errorAlert: any;
  public i18n: any;
  public userInfo: string;
  public currentLang: string;
  public headerInforList = [{
    title: '',
    type: 'user',
    src: './assets/img/header/arr-down-7.svg',
    hoverSrc: './assets/img/header/arr-down-7-copy.svg',
    isHover: false,
    tipContent: 'tipUserInfo'
  },
  {
    title: '',
    type: 'home',
    src: './assets/img/header/returnHome-7.svg',
    hoverSrc: './assets/img/header/returnHome-7-blue.svg',
    isHover: false,
    tipContent: 'tipBackHome'
  },
  {
    title: '',
    type: 'setting',
    src: './assets/img/header/setting-7.svg',
    hoverSrc: './assets/img/header/setting-7-copy.svg',
    isHover: false,
    tipContent: 'tipSetting'
  }, {
    title: '',
    type: 'menu',
    src: './assets/img/header/menu-7.svg',
    hoverSrc: './assets/img/header/menu-7-copy.svg',
    isHover: false,
    tipContent: 'tipMenu'
  }];
  public userTipList: any = [];
  public backHomeTipList: any = [];
  public settingTipList: any = [];
  public menuTipList: any = [];
  public tipType: string;
  public role: any;
  private keyFunction = new KeyFunction();
  private headerSub: Subscription;
  ngOnInit() { }
  public movekeybordFun() {
    this.keyFunction.movekeybordFun();
  }
  /**
   * 新手指导 模拟点击事件 将 tipType 置为 menu
   */
  // user-guide
  public menuClick(info?: any) {
    if (sessionStorage.getItem('userGuidStatus-java-perf') === '0') {
      this.tipType = 'menu';
      this.headerInforList[this.headerInforList.length - 1].isHover =
        !this.headerInforList[this.headerInforList.length - 1].isHover;
    }
  }
  public onHeaderChange(i: any) {
    this.headerInforList[i].isHover = !this.headerInforList[i].isHover;
    this.tipType = this.headerInforList[i].type;
  }
  public onLogInfoChange(type: any) {
    if (type === 'logOut') {
      this.logout.open();
    } else {
      this.modifyPwd.open();
    }
  }
  public onJumpHome() {
    window.location.href = window.location.origin + '/' + 'user-management' + '/#/';
  }
  public onSettingChange(type: any) {
    this.infomodal.open(type);
  }
  public onStatementSet() {
    this.statement.openStatement();
  }
  public onOtherChange(type: any) {
    switch (type) {
      case 'language':
        this.onChangeLanguage();
        break;
      case 'feedback':
        this.onJumpFeedback();
        break;
      case 'about':
        this.onAbout();
        break;
      case 'help':
        this.openHelp();
        break;
      case 'statement':
        this.onStatementSet();
        break;
      case 'guide':
        this.userGuideLi();
        break;
      default:
        break;
    }
  }
  public onChangeLanguage(): void {
    if (this.currentLang === 'zh-cn') {
      TiLocale.setLocale(TiLocale.EN_US);
      sessionStorage.setItem('language', 'en-us');
    } else {
      TiLocale.setLocale(TiLocale.ZH_CN);
      sessionStorage.setItem('language', 'zh-cn');
    }
    window.location.reload();
  }
  public onAbout() {
    this.about.open();
  }
  public openHelp() {
    let url = window.location.origin + window.location.pathname;
    if (sessionStorage.getItem('language') === 'en-us') {
      url += './assets/help/en/index.html';
    } else {
      url += './assets/help/zh/index.html';
    }
    window.open(url, '_blank');
  }

  /**
   * 新手引导
   */
  public userGuideLi() {
    // user-guide
    if (sessionStorage.getItem('statementStatus') === 'true') {
      sessionStorage.setItem('toggleState', 'true');
      sessionStorage.setItem('userGuidStatus-java-perf', '0');
      sessionStorage.setItem('javaStep', '');
      this.router.navigate(['/home']);
      window.location.reload();
    } else {

    }
  }
  /**
   * 建议反馈
   */
  public onJumpFeedback() {
    this.Axios.axios.get('/users/version/',
      { baseURL: '../user-management/api/v2.2', timeout: 3000 })
      .then((resp: any) => {
        window.open(hardUrl.hikunpengUrl, '_blank');
      }).catch((error: any) => {
        this.errorAlert.openWindow();
      });
  }

  ngOnDestroy(): void {
    this.headerSub?.unsubscribe();
  }
}
