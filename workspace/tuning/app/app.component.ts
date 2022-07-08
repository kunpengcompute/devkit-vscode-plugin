import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';

import { MessageService } from './service/message.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { VscodeService, COLOR_THEME } from './service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';
import { UtilsService } from './service/utils.service';

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
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

    public subscription: Subscription;
    public showAdviceIcon = false;
    @ViewChild('adviceIcon') adviceIcon: any;
    constructor(
        public messageervice: MessageService,
        public translate: TranslateService,
        public router: Router,
        public vscodeService: VscodeService,
        public utils: UtilsService,
        private themeServe: HyThemeService,
    ) { }

    ngOnInit() {
        // 此变量作为占位符，其内容值会被替换，用于页面第一次跳转
        const data = (self as any).navigatorPage.data as INavigatorPage;

        // 当 extension 新开一个 panel 时，它会把一些所需的参数放在路由的查询参数中
        // 查询参数有: id、
        data.webViewSearch = this.router.parseUrl(window.location?.search as unknown as string)?.queryParams ?? {};
        this.router.navigate([data.page], data.pageParams);

        // vscode颜色主题
        switch (document.body.className) {
            case 'vscode-light':
                this.themeServe.notify(HyTheme.Light);
                break;
            case 'vscode-dark':
                this.themeServe.notify(HyTheme.Dark);
                break;
            default:
                this.themeServe.notify(HyTheme.Dark);
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
          }
        });

    }

    ngOnDestroy() {
        // 每一个使用该服务的组件,在Destroy的时候,需要this.subscription.unsubscribe(),接触监听的作用
        this.subscription.unsubscribe();
    }
    ngAfterViewInit(): void {
      (self as any).webviewSession.getItem('language') === 'zh-cn'
        ? this.showAdviceIcon = true
        : this.showAdviceIcon = false;

      this.subscription = this.messageervice.getMessage().subscribe(
        msg => {
        });
    }

    /**
     * 点击建议反馈图标
     */
    public openAdvice(event: any) {
      this.utils.openVocAdvice(event);
    }
}
