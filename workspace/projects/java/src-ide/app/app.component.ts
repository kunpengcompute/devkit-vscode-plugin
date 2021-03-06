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

        // ?????????????????????????????????????????????????????????????????????????????????
        const data = (self as any).navigatorPage.data as INavigatorPage;

        // ??? extension ???????????? panel ??????????????????????????????????????????????????????????????????
        // ???????????????: id???extensionId???platform???swVersion???vscode-resource-base-authority
        data.webViewSearch
            = this.router.parseUrl(window.location?.search as unknown as string)?.queryParams ?? {};

        this.router.navigate([data.page], data.pageParams);

        // vscode????????????
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
         * ?????????????????????????????????vscode ??????
         *
         */
        window.addEventListener('message', (event) => {
            /**
             * event.data ???????????? panel.webview.postMessage(obj); ???????????? obj ?????????
             * ??????????????? event.data = { cmd: "navigate", data: {page:"/home",pageParam:"",token:""}}
             */
            this.vscodeService.handleEvent(event.data);
            /**
             * ???????????????????????????hyper?????????
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
        // ?????????????????????????????????????????????

        (self as any).webviewSession.getItem('language')
            === 'zh-cn' ? this.showAdviceIcon = true : this.showAdviceIcon = false;
    }

    /**
     * ????????????????????????
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
