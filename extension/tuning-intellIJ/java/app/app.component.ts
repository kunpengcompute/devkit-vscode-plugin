import { Component, OnInit } from '@angular/core';
import { MessageService } from './service/message.service';
import { TranslateService } from '@ngx-translate/core';
import { AxiosService } from './service/axios.service';
import { Router, NavigationEnd } from '@angular/router';
import { I18nService } from './service/i18n.service';
import { ListenUserService } from './service/listen-user';
import { UserGuideService } from './service/user-guide.service';
import { VscodeService, COLOR_THEME } from './service/vscode.service';
import { TiLocale } from '@cloud/tiny3';
import { HyTheme, HyThemeService } from 'hyper';
import { ToolType } from '../../../domain';
const windowJava: any = window;
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

export class AppComponent implements OnInit {
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

    /**
     * init
     */
    ngOnInit() {
        // ?????????????????????????????????java?????????
        windowJava.JavaMessageBridge = this.vscodeService.handleEvent;
        windowJava.switchTheme = this.vscodeService.handleSwitchTheme;

        // ?????????????????????????????????????????????????????????????????????????????????
        const data = (top as any).navigatorPage.data as INavigatorPage;

        // ??? extension ???????????? panel ??????????????????????????????????????????????????????????????????
        // ???????????????: id???extensionId???platform???swVersion???vscode-resource-base-authority
        data.webViewSearch
            = this.router.parseUrl(window.location?.search as unknown as string)?.queryParams ?? {};

        this.router.navigate([data.page], data.pageParams);

        // vscode????????????
        switch (document.body.className) {
            case 'vscode-light':
            case 'vscode-light intellij-light':
                this.themeServe.notify(HyTheme.Light);
                break;
            case 'vscode-dark':
            case 'vscode-dark intellij-dark':
                this.themeServe.notify(HyTheme.Dark);
                break;
            default:
                this.themeServe.notify(HyTheme.Dark);
        }
        if (data.webSession) {
            const webSession = data.webSession;
            ((top as any).webviewSession || {}).setItem('role', webSession.role);
            ((top as any).webviewSession || {}).setItem('username', webSession.username);
            ((top as any).webviewSession || {}).setItem('loginId', webSession.loginId);
            ((top as any).webviewSession || {}).setItem('isFirst', webSession.isFirst);
            ((top as any).webviewSession || {}).setItem('language', webSession.language);
            ((top as any).webviewSession || {}).setItem('tuningOperation', webSession.tuningOperation);
            // ?????????web??????????????????????????????????????????????????????????????????sessionStorage??????session
            // ?????????self.webviewSession??????session???????????????????????????
            sessionStorage.setItem('role', webSession.role);
            sessionStorage.setItem('username', webSession.username);
            sessionStorage.setItem('loginId', String(webSession.loginId));
            sessionStorage.setItem('isFirst', String(webSession.isFirst));
            sessionStorage.setItem('language', webSession.language);
            sessionStorage.setItem('tuningOperation', webSession.tuningOperation);
            sessionStorage.setItem('toolType', webSession.toolType || ToolType.SYSPERF);
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
}
