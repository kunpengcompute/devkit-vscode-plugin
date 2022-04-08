import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TiLocale } from '@cloud/tiny3';
import { Router } from '@angular/router';
import { VscodeService, HTTP_STATUS_CODE, COLOR_THEME } from './service/vscode.service';
import { HyLocale, HyTheme, HyThemeService } from 'hyper';
import { ToolType } from 'projects/domain';
import { MessageService } from './service/message.service';
import { AxiosService } from './service/axios.service';
import { SysLocale } from 'sys/locale/sys-locale';

const THEME_DICT = new Map<COLOR_THEME, HyTheme>([
  [COLOR_THEME.Dark, HyTheme.Dark],
  [COLOR_THEME.Light, HyTheme.Light]
]);

interface INavigatorPage {
  page: string;
  pageParams?: {
    queryParams?: {},
    [key: string]: any
  };
  webSession?: {
    isFirst?: number, // 0 -- , 1--,
    language?: string,
    loginId?: number,
    role?: string,
    token?: string,
    username?: string,
    [key: string]: any
  };
  webViewSearch: {
    extensionId?: string,
    id?: string,
    platform?: string,
    swVersion?: string,
    'vscode-resource-base-authority'?: string,
    [key: string]: any
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private Axios: AxiosService,
    private vscodeService: VscodeService,
    private themeServe: HyThemeService,
    private msgService: MessageService,
  ) {
  }

  public showAdviceIcon = false;


  /**
   * ngOnInit
   */
  ngOnInit() {

    // 英文环境下隐藏该入口
    (self as any).webviewSession.getItem('language') === 'zh-cn'
      ? this.showAdviceIcon = true : this.showAdviceIcon = false;

    // 此变量作为占位符，其内容值会被替换，用于页面第一次跳转
    const data = (self as any).navigatorPage.data as INavigatorPage;

    // 当 extension 新开一个 panel 时，它会把一些所需的参数放在路由的查询参数中
    // 查询参数有: id、extensionId、platform、swVersion、vscode-resource-base-authority
    data.webViewSearch
      = this.router.parseUrl(window.location?.search as unknown as string)?.queryParams ?? {};

    this.router.navigate([data.page], data.pageParams);

    // vscode颜色主题
    switch (true) {
      case document.body.className.includes('vscode-light'):
        this.themeServe.notify(HyTheme.Light);
        this.themeServe.toLight();
        break;
      case document.body.className.includes('vscode-dark'):
        this.themeServe.notify(HyTheme.Dark);
        this.themeServe.toDark();
        break;
      default:
        this.themeServe.notify(HyTheme.Dark);
        this.themeServe.toDark();
        break;
    }
    // 保存session
    if (data.webSession) {
      const webSession = data.webSession;

      self.webviewSession.setItem('role', webSession.role);
      self.webviewSession.setItem('username', webSession.username);
      self.webviewSession.setItem('loginId', webSession.loginId);
      self.webviewSession.setItem('isFirst', webSession.isFirst);
      self.webviewSession.setItem('language', webSession.language);
      // 为了和web保持统一，能够提取业务公用组件。后续将会使用sessionStorage读写session
      // 前面的self.webviewSession读写session的逻辑将会延期删除
      sessionStorage.setItem('role', webSession.role);
      sessionStorage.setItem('username', webSession.username);
      sessionStorage.setItem('loginId', String(webSession.loginId));
      sessionStorage.setItem('isFirst', String(webSession.isFirst));
      sessionStorage.setItem('language', webSession.language);
      sessionStorage.setItem('toolType', webSession.toolType || ToolType.SYSPERF);

      if (webSession.language === 'zh-cn') {
        TiLocale.setLocale(TiLocale.ZH_CN);
        SysLocale.setLocale(SysLocale.ZH_CN);
        HyLocale.setLocale(HyLocale.ZH_CN);
      } else {
        TiLocale.setLocale(TiLocale.EN_US);
        SysLocale.setLocale(SysLocale.EN_US);
        HyLocale.setLocale(HyLocale.EN_US);
      }
    }

    /**
     * 添加页面监听事件来处理vscode 事件
     *
     */
    window.addEventListener('message', event => {
      /**
       * event.data 就是我们 panel.webview.postMessage(obj); 方法中的 obj 对象；
       * 参考样例： event.data = { cmd: "navigate", data: {page:"/home",pageParam:"",token:""}}
       */
      this.vscodeService.handleEvent(event.data);
      /**
       * 监听主题变化，切换hyper的主题
       */
      const type = event?.data?.type;
      if (type === 'colorTheme') {
        const rowTheme = event?.data?.data?.colorTheme;
        const hyTheme = THEME_DICT.get(rowTheme);
        this.themeServe.notify(hyTheme);
        this.themeServe.setTheme(hyTheme);
      }
    });
  }

  ngAfterViewInit(): void {
    // 刷新当前页面时显示建议反馈
    (self as any).webviewSession.getItem('language') === 'zh-cn'
      ? this.showAdviceIcon = true : this.showAdviceIcon = false;
  }

  /**
   * 点击建议反馈图标
   */
  public openAdvice(event: any) {
    const option = {
      url: '/users/admin-status/',
      noToken: true,
      timeout: 3000,
      moduleType: 'sysPerf',
      subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
    };
    this.vscodeService.get(option, (data: any) => {
      if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
        const a = document.createElement('a');
        a.setAttribute('href', event);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }
}
