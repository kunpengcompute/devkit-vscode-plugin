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

    if (sessionStorage.getItem('topState') !== undefined) { // 折叠面板状态记忆
      this.topState = sessionStorage.getItem('topState');
    } else {
      this.topState = 'active';
    }
    // 新手引导流程 banner 状态设置
    if (sessionStorage.getItem('userGuidStatus-sys-perf') === '0') {
      this.topState = 'active';
    }
    sessionStorage.setItem('topState', this.topState);
  }
  @ViewChild('mask3') mask3: any; // 修改密码弹窗
  @ViewChild('certificate') certificate: any; // 证书更换组件
  @ViewChild('operationLog') operationLog: any; // 操作日志组件
  @ViewChild('pretablelist') pretablelist: any; // 预约任务组件
  @ViewChild('templatesAll') templatesAll: any; // 模板列表组件
  @ViewChild('about') aboutMask: any; // 关于弹窗
  @ViewChild('logOutShow') logOutShow: any; // 退出确认弹窗
  @ViewChild('statement') statement: any; // 免责声明
  @ViewChild('errorAlert', { static: false }) errorAlert: any;


  public topState = 'active'; // 上下折叠面板状态, active:展开
  public lang: any; // 语言,zh-cn: 中文, 'en-us': 英文
  public leftState = true; // 左侧折叠面板状态,true:展开
  public leftMenuList: any = []; // 展示的左侧菜单栏选项
  public showBack = true; // 是否显示返回主页按钮
  public username: string; // 用户名
  public role: string; // 用户角色: 管理员,普通用户
  public loginUserId = sessionStorage.getItem('loginId'); // 登录用户的相关信息
  public loginPwd: any; // 确认当前用户的密码
  public refEyes = true; // 关闭弹窗之后,恢复密码小眼睛到关闭状态
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

  public label = { // 创建用户表单label
    Pwd: '',
    Cpwd: '',
    Role: '',
    Name: '',
    oldPwd: '',
    newPwd: '',
    managerPwd: '',
  };
  public create = true; // 用户管理表单状态: 创建,修改
  public mask2Title = 'Create User'; // 用户管理表单title
  public editPwd: FormGroup; // 修改密码表单校验
  public userPwd: FormGroup; // 创建密码表单校验
  /**
   * 校验触发方式设置
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

  public msg: any; // 确认退出提示信息
  public year = new Date().getFullYear(); // 关于弹窗信息
  public version: string;
  public time: string;
  // 通过发布订阅模式，获取预约任务更新的数量
  public preTaskLength = -1;
  public projectId: boolean;
  public getTaskLengthCode: any;
  public userGuideStep: Subscription;
  // 声明订阅对象
  rooterChange: Subscription;
  public toggleShow = true;
  // 是否内存诊断
  public isDiagnose = false;
  public isSysperf = true;
  // 工具类型 系统性能分析/诊断调试/调优助手
  public curToolType = sessionStorage.getItem('toolType');
  public toolTypeMenu = ToolType;

  // 主题相关属性
  hyTheme = HyTheme;
  themeSelected: HyTheme;
  isProd = environment.production;

  public statusFormat(status: string): string { // 日志状态指示
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
   * 语言切换
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
   * 返回主界面
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
      // 设置返回按钮是否显示
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

  // 监听路由变化
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
      // 调优助手系统配置管理
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
      // 系统配置管理
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
  // 用户配置页面
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
        // 滚动 父元素tree-box
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
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
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
   * 修改密码时的表单校验
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
   * 打开联机帮助
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
   * 新手引导
   */
  public userGuideLi() {
    // user-guide
    sessionStorage.setItem('userGuidStatus-sys-perf', '0');
    // 初始化 topState 新手引导有一步需要操作toggle按钮
    sessionStorage.setItem('topState', 'active');
    const hash = window.location.hash;
    // 如果当前页 在 home 页面 则刷新后返回
    if (hash.indexOf('/home') >= 0) {
      window.location.reload();
      return;
    }
    this.router.navigate(['/home']);
    // 需要延时
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  /**
   *  发布订阅模式，获取预约任务数量
   */
  public getTaskLength() {
    this.getTaskLengthCode = this.preTableTaskLength.preTaskLength.subscribe(
      (id) => {
        this.preTaskLength = id;
      }
    );
  }

  /**
   * 打开关于弹窗
   */
  public showAboutMask() {
    // user list
    this.aboutMask.Open();
  }

  /**
   * 关闭关于弹窗
   */
  public closeAbout() {
    this.aboutMask.Close();
  }

  onThemeChange(theme: HyTheme) {
    this.themeServe.setTheme(theme);
  }
  /**
   * 关闭banner弹窗
   */
  clossHeaderPop(){
    sessionStorage.setItem('topState', 'notActive');
    this.topState = 'notActive';
  }
}

/**
 * 自定义校验规则
 */
export class CustomValidators {
  /**
   * 密码校验
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
   * 用户名校验
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
