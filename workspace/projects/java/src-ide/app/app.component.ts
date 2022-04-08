import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MessageService } from './service/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { I18nService } from './service/i18n.service';
import { ListenUserService } from './service/listen-user';
import { UserGuideService } from './service/user-guide.service';
import { VscodeService, HTTP_STATUS_CODE, COLOR_THEME } from './service/vscode.service';
import { TiLocale } from '@cloud/tiny3';
import { HyTheme, HyThemeService } from 'hyper';

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
        public messageervice: MessageService,
        public translate: TranslateService,
        public router: Router,
        public i18nService: I18nService,
        public listenUser: ListenUserService,
        public userGuide: UserGuideService,
        public vscodeService: VscodeService,
        private themeServe: HyThemeService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public i18n: any;
    public showHeader = true;
    public showAdviceIcon = false;
    @ViewChild('adviceIcon', { static: false }) adviceIcon: any;

    /**
     * init
     */
    ngOnInit() {

        // 此变量作为占位符，其内容值会被替换，用于页面第一次跳转
        const data = (self as any).navigatorPage.data as INavigatorPage;

        // 当 extension 新开一个 panel 时，它会把一些所需的参数放在路由的查询参数中
        // 查询参数有: id、extensionId、platform、swVersion、vscode-resource-base-authority
        data.webViewSearch
            = this.router.parseUrl(window.location?.search as unknown as string)?.queryParams ?? {};

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
        if (data.webSession) {
            const webSession = data.webSession;
            ((self as any).webviewSession || {}).setItem('role', webSession.role);
            ((self as any).webviewSession || {}).setItem('username', webSession.username);
            ((self as any).webviewSession || {}).setItem('loginId', webSession.loginId);
            ((self as any).webviewSession || {}).setItem('isFirst', webSession.isFirst);
            ((self as any).webviewSession || {}).setItem('language', webSession.language);
            if (webSession.language === 'zh-cn') {
                TiLocale.setLocale(TiLocale.ZH_CN);
            } else {
                TiLocale.setLocale(TiLocale.EN_US);
            }
        }

        /**
         * 添加页面监听事件来处理vscode 事件
         *
         */
        window.addEventListener('message', (event) => {
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

    ngAfterViewInit() {
        // 英文环境下暂时隐藏建议反馈按钮

        (self as any).webviewSession.getItem('language')
            === 'zh-cn' ? this.showAdviceIcon = true : this.showAdviceIcon = false;
    }

    /**
     * 点击建议反馈图标
     */
    public openAdvice(event: any) {
        const option = {
            url: '/users/admin-status/',
            noToken: true,
            timeout: 3000,
            moduleType: 'javaPerf',
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
