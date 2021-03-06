import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { TiValidators } from '@cloud/tiny3';
import { TiValidationConfig } from '@cloud/tiny3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { TiLocale } from '@cloud/tiny3';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { ScheduleTaskService } from 'projects/sys/src-web/app/service/schedule-task.service';
import { UserGuideService } from 'projects/sys/src-web/app/service/user-guide.service';
import { createSvg } from 'projects/sys/src-web/app/util';
import { Subscription } from 'rxjs';
import { ToolType } from 'projects/domain';
import { HyTheme, HyThemeService } from 'hyper';
import { environment } from 'sys/src-web/environments/environment';
const hardUrl: any = require('../../../assets/hard-coding/url.json');
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private elementRef: ElementRef,
    public Axios: AxiosService,
    public router: Router,
    public mytip: MytipService,
    public i18nService: I18nService,
    public preTableTaskLength: ScheduleTaskService,
    public userGuide: UserGuideService,
    private themeServe: HyThemeService
  ) {
    this.i18n = this.i18nService.I18n();
    this.kunpengsptmysqlpracticeUrl = hardUrl.kunpengsptmysqlpracticeUrl;
    this.kunpenggrowthUrl = hardUrl.kunpenggrowthUrl;
    this.kunpenggrowthUrlEn = hardUrl.kunpenggrowthUrlEn;
    this.kunpengjavaIntroductionUrl = hardUrl.kunpengjavaIntroductionUrl;
    this.kunpengsysIntroductionUrlEn = hardUrl.kunpengsysIntroductionUrlEn;
    this.kunpengUrl = hardUrl.kunpengUrl;
    this.kunpengUrlEn = hardUrl.kunpengUrlEn;
    this.kunpenExpertUrl = hardUrl.kunpenExpertUrl;
    this.lang = sessionStorage.getItem('language');
    this.validation2.errorMessage.required = this.i18n.validata.req;

    if (sessionStorage.getItem('topState') !== undefined) { // ????????????????????????
      this.topState = sessionStorage.getItem('topState');
    } else {
      this.topState = 'active';
    }
    // ?????????????????? banner ????????????
    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
      this.topState = 'active';
    }
    sessionStorage.setItem('topState', this.topState);
  }
  @ViewChild('mask3') mask3: any; // ??????????????????
  @ViewChild('certificate') certificate: any; // ??????????????????
  @ViewChild('operationLog') operationLog: any; // ??????????????????
  @ViewChild('pretablelist') pretablelist: any; // ??????????????????
  @ViewChild('templatesAll') templatesAll: any; // ??????????????????
  @ViewChild('about') aboutMask: any; // ????????????
  @ViewChild('logOutShow') logOutShow: any; // ??????????????????
  @ViewChild('statement') statement: any; // ????????????
  @ViewChild('errorAlert', { static: false }) errorAlert: any;


  public topState = 'active'; // ????????????????????????, active:??????
  public lang: any; // ??????,zh-cn: ??????, 'en-us': ??????
  public leftState = true; // ????????????????????????,true:??????
  public leftMenuList: any = []; // ??????????????????????????????
  public showBack = true; // ??????????????????????????????
  public username: string; // ?????????
  public role: string; // ????????????: ?????????,????????????
  public loginUserId = sessionStorage.getItem('loginId'); // ???????????????????????????
  public loginPwd: any; // ???????????????????????????
  public refEyes = true; // ??????????????????,????????????????????????????????????
  public kunpengsptmysqlpracticeUrl: any;
  public kunpengsptmysqlpracticeUrlEn: any;
  public kunpengjavaIntroductionUrl: any;
  public kunpengsysIntroductionUrlEn: any;
  public kunpenggrowthUrl: any;
  public kunpenggrowthUrlEn: any;
  public kunpengUrl: any;
  public kunpengUrlEn: any;
  public kunpenExpertUrl: any;
  public currentHover: any;
  public adviceUrl = '';

  public label = { // ??????????????????label
    Pwd: '',
    Cpwd: '',
    Role: '',
    Name: '',
    oldPwd: '',
    newPwd: '',
    managerPwd: '',
  };
  public create = true; // ????????????????????????: ??????,??????
  public mask2Title = 'Create User'; // ??????????????????title
  public editPwd: FormGroup; // ????????????????????????
  public userPwd: FormGroup; // ????????????????????????
  /**
   * ????????????????????????
   */
  public validation2: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {},
  };
  public setpwd = false;
  public userId: any;
  langSelected: any;
  i18n: any;

  public langOptions: Array<any> = [];
  public showPreBtn = false;

  public msg: any; // ????????????????????????
  public year = new Date().getFullYear(); // ??????????????????
  public version: string;
  public time: string;
  // ????????????????????????????????????????????????????????????
  public preTaskLength = -1;
  public projectId: boolean;
  public getTaskLengthCode: any;
  public userGuideStep: Subscription;
  // ??????????????????
  rooterChange: Subscription;
  public toggleShow = true;
  // ??????????????????
  public isDiagnose = false;
  public isSysperf = true;
  // ???????????? ??????????????????/????????????/????????????
  public curToolType = sessionStorage.getItem('toolType');
  public toolTypeMenu = ToolType;

  // ??????????????????
  hyTheme = HyTheme;
  themeSelected: HyTheme;
  isProd = environment.production;

  public statusFormat(status: string): string { // ??????????????????
    let statusClass = 'success-icon';
    switch (status) {
      case 'Successful':
        statusClass = 'success-icon';
        break;
      case 'Failed':
        statusClass = 'failed-icon';
        break;
      default:
        statusClass = 'success-icon';
    }
    return statusClass;
  }

  /**
   * ????????????
   */
  public langChange(data: any): void {
    if (data.id === 'zh-cn') {
      TiLocale.setLocale(TiLocale.ZH_CN);
      sessionStorage.setItem('language', 'zh-cn');
    } else {
      TiLocale.setLocale(TiLocale.EN_US);
      sessionStorage.setItem('language', 'en-us');
    }
    window.location.reload();
  }
  /**
   * ???????????????
   */
  public jumpHome() {
    window.location.href =
      window.location.origin + '/' + 'user-management' + '/#/';
  }
  public onStatementSet() {
    this.statement.openStatement();
  }

  public onHoverList(label?: any) {
    this.currentHover = label;
  }

  ngAfterViewInit(): void {
    createSvg('#animation-case', './assets/img/home/wenhao.json');

    this.router.events.subscribe((data) => {
      // ??????????????????????????????
      if (data instanceof NavigationEnd) {
        (data.url !== '/home' && data.url !== '/nodeManagement' &&
          data.url.indexOf('/configuration/') === -1) && data.url !== '/'
          ? (this.showBack = false)
          : (this.showBack = true);
      }
      const flag = window.location.hash.indexOf('projectlist');
      if (flag !== -1) {
        this.showPreBtn = true;
      } else {
        this.showPreBtn = false;
      }
    });
  }

  // ??????????????????
  listenRouterChange() {
    this.rooterChange = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects === '/home' || event.urlAfterRedirects === '/') {
          this.toggleShow = true;
        } else {
          this.toggleShow = false;
        }
      }
    });
  }
  ngOnInit() {
    this.isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
    this.isSysperf = sessionStorage.getItem('toolType') === ToolType.SYSPERF;
    this.adviceUrl = hardUrl.hikunpengUrl;
    this.toggleShow = this.router.url === '/home';
    this.listenRouterChange();
    this.Axios.axios.get('/users/version/', { baseURL: '../user-management/api/v2.2' })
      .then((data: any) => {
        this.version = 'V' + data.data.version;
        this.time = data.data.update_time;
        sessionStorage.setItem('version', this.version);
        sessionStorage.setItem('time', data.data.update_time);
      });

    this.username = sessionStorage.getItem('username');
    this.role = sessionStorage.getItem('role');

    this.label = {
      Name: this.i18n.common_term_user_label.name,
      Role: this.i18n.common_term_user_label.role,
      Pwd: this.i18n.common_term_user_label.password,
      Cpwd: this.i18n.common_term_user_label.confirmPwd,
      oldPwd: this.i18n.common_term_user_label.oldPwd,
      newPwd: this.i18n.common_term_user_label.newPwd,
      managerPwd: this.i18n.common_term_user_label.managerPwd,
    };
    this.validation.errorMessage.required = this.i18n.validata.req;

    this.langOptions = [
      {
        id: 'zh-cn',
        label: this.i18n.common_term_lang_info[0],
      },
      {
        id: 'en-us',
        label: this.i18n.common_term_lang_info[1],
      },
    ];
    if (sessionStorage.getItem('language') === 'zh-cn') {
      this.langSelected = this.langOptions[0];
    } else {
      this.langSelected = this.langOptions[1];
    }

    this.userPwd = new FormGroup({
      oldPwd: new FormControl('', [this.oldPassword]),
      pwd: new FormControl('', [this.resetPassword]),
      cpwd: new FormControl('', [this.userPwdConfirm]),
    });
    this.userPwd.get('oldPwd').valueChanges.subscribe(() => {
      this.userPwd.get('pwd').updateValueAndValidity();
    });

    this.getTaskLength();

    if (this.curToolType === ToolType.TUNINGHELPER) {
      // ??????????????????????????????
      this.leftMenuList = [
        { title: this.i18n.common_term_admin_user, params: 'userManage', status: true, admin: true },
        { title: this.i18n.passwordDic, params: 'passwordDic', status: false, admin: false },
        { title: this.i18n.sysSetting, params: 'sysConfig', status: false, admin: false },
        {
          title: this.role === 'Admin' ? this.i18n.log : this.i18n.common_term_admin_log,
          params: 'logManage', status: false, admin: false
        }
      ];
    } else {
      // ??????????????????
      this.leftMenuList = [
        { title: this.i18n.common_term_admin_user, params: 'userManage', status: true, admin: true },
        { title: this.i18n.passwordDic, params: 'passwordDic', status: false, admin: false },
        { title: this.i18n.sysSetting, params: 'sysConfig', status: false, admin: false },
        { title: this.i18n.preTable.perMission, params: 'ScheduledTasks', status: false, admin: false },
        {
          title: this.i18n.project.importAndExportTask,
          params: 'importAndExportTaskList', status: false, admin: false
        },
        { title: this.i18n.mission_modal.missionTemplate, params: 'missionTemplate', status: false, admin: false },
        {
          title: this.role === 'Admin' ? this.i18n.log : this.i18n.common_term_admin_log,
          params: 'logManage', status: false, admin: false
        }
      ];
    }

    this.userGuideStep = this.userGuide.userGuideStep.subscribe((str) => {
      if (str === 'user-guide-toggle') {
        this.toggleTop();
      }
    });
  }

  ngOnDestroy() {
    this.getTaskLengthCode.unsubscribe();
    this.userGuideStep.unsubscribe();
  }
  // ??????????????????
  public toggleLeft() {
    this.leftState = !this.leftState;
  }
  public feedback() {
    this.Axios.axios.get('/users/version/',
      { baseURL: '../user-management/api/v2.2', timeout: 3000 })
      .then((resp: any) => {
        window.open(hardUrl.hikunpengUrl, '_blank');
      }).catch((error: any) => {
        this.errorAlert.openWindow();
      });
  }
  public closeLeftMenu() {
    this.clossHeaderPop();
    this.leftMenuList.map((val: any) => {
      val.status = false;
    });
  }

  public toggleTop() {
    this.topState === 'active'
      ? (this.topState = 'notActive')
      : (this.topState = 'active');
    sessionStorage.setItem('topState', this.topState);

    // user-guide
    if (this.topState !== 'active') {
      const flogin = sessionStorage.getItem('userGuidStatus-sys-perf');
      if (flogin === '0') {
        // ?????? ?????????tree-box
        const selectScenes = document.querySelector('.tree-box');
        selectScenes.scrollTop = 0;
        this.userGuide.userGuideStep.next('wizarding');
        setTimeout(() => {
          this.userGuide.showMask('user-guide-add-task', 'class');
        }, 200);
      }
    }
  }

  public logOut() {
    const msg = this.i18n.logout_ok;
    const roleId = sessionStorage.getItem('loginId');
    const that = this;
    this.logOutShow.open();
  }

  public changepwdbtn() {
    if (!this.create && !this.setpwd) {
      this.editPwd.controls.pwd.setValue('');
      this.editPwd.controls.cpwd.setValue('');
    }
  }

  public setUserPwd(): any {
    const errors: ValidationErrors | null = TiValidators.check(this.userPwd);
    // ??????????????????????????????????????????????????????????????????????????????????????????
    if (errors) {
      // ??????????????????fb.group?????????FormControl??????????????????????????????dom??????????????????
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement
        .querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement
        .querySelector(`[formControlName=${firstError}]`)
        .blur();
      return false;
    }
    const params = {
      old_password: this.userPwd.get('oldPwd').value,
      new_password: this.userPwd.get('pwd').value,
      confirm_password: this.userPwd.get('cpwd').value,
    };
    this.Axios.axios
      .put('/users/' + this.loginUserId + '/password/', params, {
        baseURL: '../user-management/api/v2.2',
      })
      .then((data: any) => {
        this.userPwd.reset();
        this.logOut();
        this.mask3.Close();
      })
      .catch((error: any) => {
      });
  }
  public closeUserPwd() {
    this.userPwd.reset();
    this.mask3.Close();
    this.refEyes = false;
  }
  public updatePassward() {
    this.refEyes = true;
    this.userPwd.reset();
    this.mask3.Open();
  }

  public updateConfirmValidator2() {
    Promise.resolve().then(() => {
      this.userPwd.controls.cpwd.updateValueAndValidity();
    });
  }

  /**
   * ??????????????????????????????
   */
  resetPassword = (control: FormControl) => {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);

    if (!control.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.req } };
    }
    if (reg.test(control.value) === false
      || (/[\u4E00-\u9FA5]/i.test(control.value))
      || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i)
        .test(control.value)) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule } };
    }
    if (this.userPwd.controls.oldPwd.value &&
      control.value === this.userPwd.controls.oldPwd.value.split('').reverse().join('')) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule3 } };
    }
    if (control.value === this.userPwd.controls.oldPwd.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule4 } };
    }
    if (control.value === sessionStorage.getItem('username') || control.value === sessionStorage.getItem('username')
      .split('').reverse().join('')) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule2 } };
    } else {
      return null;
    }
  }

  oldPassword = (control: FormControl) => {
    if (!control.value) {
      return { oldPwd: { tiErrorMessage: this.i18n.validata.req } };
    }
    if (control.value === this.userPwd.controls.pwd.value) {
      return { pwd: { tiErrorMessage: this.i18n.validata.pwd_rule4 } };
    } else {
      return null;
    }
  }

  userPwdConfirm = (control: FormControl) => {
    if (!control.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.req,
        },
      };
    } else if (control.value !== this.userPwd.controls.pwd.value) {
      return {
        cpwd: {
          confirm: true,
          error: true,
          tiErrorMessage: this.i18n.validata.pwd_conf,
        },
      };
    }
    return {};
  }

  /**
   * ??????????????????
   */
  public openHelp() {
    let fileName = '';
    if (this.curToolType === ToolType.DIAGNOSE) {
      fileName = 'diagnose-help';
    } else if (this.curToolType === ToolType.TUNINGHELPER) {
      fileName = 'tuning-assistant-help';
    } else {
      fileName = 'help';
    }
    let url = window.location.origin + window.location.pathname;
    if (sessionStorage.getItem('language') === 'en-us') {
      url +=
        './assets/' + fileName + '/en/index.html';
    } else {
      url +=
        './assets/' + fileName + '/zh/index.html';
    }
    window.open(url, '_blank');
  }

  /**
   * ????????????
   */
  public userGuideLi() {
    // user-guide
    sessionStorage.setItem('userGuidStatus-sys-perf', '0');
    // ????????? topState ?????????????????????????????????toggle??????
    sessionStorage.setItem('topState', 'active');
    const hash = window.location.hash;
    // ??????????????? ??? home ?????? ??????????????????
    if (hash.indexOf('/home') >= 0) {
      window.location.reload();
      return;
    }
    this.router.navigate(['/home']);
    // ????????????
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  /**
   *  ?????????????????????????????????????????????
   */
  public getTaskLength() {
    this.getTaskLengthCode = this.preTableTaskLength.preTaskLength.subscribe(
      (id) => {
        this.preTaskLength = id;
      }
    );
  }

  /**
   * ??????????????????
   */
  public showAboutMask() {
    // user list
    this.aboutMask.Open();
  }

  /**
   * ??????????????????
   */
  public closeAbout() {
    this.aboutMask.Close();
  }

  onThemeChange(theme: HyTheme) {
    this.themeServe.setTheme(theme);
  }
  /**
   * ??????banner??????
   */
  clossHeaderPop(){
    sessionStorage.setItem('topState', 'notActive');
    this.topState = 'notActive';
  }
}

/**
 * ?????????????????????
 */
export class CustomValidators {
  /**
   * ????????????
   */
  public static password(i18n: any, editRole: any): ValidatorFn {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      if (reg.test(control.value) === false
        || (/[\u4E00-\u9FA5]/i.test(control.value))
        || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i)
          .test(control.value)) {
        return { pwd: { tiErrorMessage: i18n.validata.pwd_rule } };
      }

      if (control.value === editRole.get('name').value ||
        control.value === editRole.get('name').value.split('').reverse().join('')) {
        return { pwd: { tiErrorMessage: i18n.validata.pwd_rule2 } };
      } else {
        return null;
      }
    };
  }

  /**
   * ???????????????
   */
  public static username(i18n: any): ValidatorFn {
    const reg = new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{5,31}$/);
    return (control: AbstractControl): ValidationErrors | null => {
      return reg.test(control.value) === false
        ? { oldPwd: { tiErrorMessage: i18n } }
        : null;
    };
  }
}
