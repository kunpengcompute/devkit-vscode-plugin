import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TiLeftmenuItem } from '@cloud/tiny3';
import { TiLocale } from '@cloud/tiny3';
import { MessageService } from './service/message.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { I18nService } from './service/i18n.service';
import { VscodeService, COLOR_THEME } from './service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';
import { ToolType } from '../../../domain';
const windowJava: any = window;
const THEME_DICT = new Map<COLOR_THEME, HyTheme>([
    [COLOR_THEME.Dark, HyTheme.Dark],
    [COLOR_THEME.Light, HyTheme.Light]
]);
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    constructor(
        public messageervice: MessageService,
        public router: Router,
        public i18nService: I18nService,
        private themeServe: HyThemeService,
        public vscodeService: VscodeService,
        private msgService: MessageService) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('container', { static: true })
    public showAdviceIcon = false;
    private containerRef: ElementRef;
    public i18n;
    public showHeader = true;

    title = '第一个NG';
    public elementId = 'leftmenu';
    public headLabel = '头部区域（可定制）';
    public marginLeft = '250px';
    public collapsed = false; // 默认展开，当设置为true时会收起
    public toggleable = true;
    public reloadState = true; // 初始设置为true
    public items: Array<TiLeftmenuItem> = [

        {
            label: 'Tree',
            router: ['/home']
        },
        {
            label: '一级菜单',
            children: [{
                label: 'productList',
                router: ['./list']
            }, {
                label: 'productDetail',
                router: ['/productDetail', 'zhangjie']
            },
            {
                label: 'Table',
                router: ['/table']
            },
            {
                label: 'TreeTable',
                router: ['/treetable']
            },
            {
                label: 'routertest',
                router: ['/router']
            }]
        },

        {
            label: 'From',
            router: ['/form']
        }

    ];

    public active: TiLeftmenuItem = this.items[1].children[1];
    public subscription: Subscription;

    /**
     * ngOnInit
     */
    ngOnInit() {
        // 英文环境下隐藏该入口
        (self as any).webviewSession.getItem('language') === 'zh-cn'
            ? this.showAdviceIcon = true : this.showAdviceIcon = false;

        // 添加页面监听事件来处理java的事件
        windowJava.JavaMessageBridge = this.vscodeService.handleEvent;
        windowJava.switchTheme = this.vscodeService.handleSwitchTheme;

        // 此变量作为占位符，其内容值会被替换，用于页面第一次跳转
        const data = (top as any).navigatorPage.data;
        this.router.navigate([data.page], data.pageParams);
        if (data.webSession) {
            const webSession = data.webSession;
            ((top as any).webviewSession || {}).setItem('role', webSession.role);
            ((top as any).webviewSession || {}).setItem('username', webSession.username);
            ((top as any).webviewSession || {}).setItem('loginId', webSession.loginId);
            ((top as any).webviewSession || {}).setItem('isFirst', webSession.isFirst);
            ((top as any).webviewSession || {}).setItem('language', webSession.language);
            ((top as any).webviewSession || {}).setItem('tuningOperation', webSession.tuningOperation);
            // 为了和web保持统一，能够提取业务公用组件。后续将会使用sessionStorage读写session
            // 前面的self.webviewSession读写session的逻辑将会延期删除
            sessionStorage.setItem('role', webSession.role);
            sessionStorage.setItem('username', webSession.username);
            sessionStorage.setItem('loginId', String(webSession.loginId));
            sessionStorage.setItem('isFirst', String(webSession.isFirst));
            sessionStorage.setItem('language', webSession.language);
            sessionStorage.setItem('tuningOperation', webSession.tuningOperation);
            sessionStorage.setItem('toolType', webSession.toolType || ToolType.SYSPERF);
            if (webSession.language === 'zh-cn') {
                TiLocale.setLocale(TiLocale.ZH_CN);
                document.getElementsByTagName('html')[0].setAttribute('lang', 'zh');
            } else {
                TiLocale.setLocale(TiLocale.EN_US);
                document.getElementsByTagName('html')[0].setAttribute('lang', 'en');
            }
        }
        // vscode颜色主题
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

        /**
         * 添加页面监听事件来处理vscode 事件
         *
         */
        window.addEventListener('message', event => {
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
    /**
     * ngOnDestroy
     */
    ngOnDestroy() {
        this.subscription.unsubscribe(); // 每一个使用该服务的组件,在Destroy的时候,需要this.subscription.unsubscribe(),接触监听的作用
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        // 刷新当前页面时显示建议反馈
        (self as any).webviewSession.getItem('language') === 'zh-cn'
            ? this.showAdviceIcon = true : this.showAdviceIcon = false;
    }
    /**
     * 点击建议反馈图标
     */
    public openAdvice(event: any) {
        $.ajax({
            url: event,
            timeout: 3000,
            success: (() => {
                const a = document.createElement('a');
                a.setAttribute('href', event);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }),
            error: (() => {
                const message = {
                    cmd: 'openAdviceLinkError',
                    data: {
                        module: 'sysPerf'
                    }
                };
                this.vscodeService.postMessage(message, null);
            })
        });
    }
}
