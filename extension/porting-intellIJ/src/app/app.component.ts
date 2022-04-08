import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { TiLeftmenuItem } from '@cloud/tiny3';
import { MessageService } from './service/message.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { VscodeService, COLOR_THEME } from './service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';
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
    public showHeader = true;
    public showAdviceIcon = false;

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

    constructor(
        public messageervice: MessageService, public translate: TranslateService,
        public router: Router, public vscodeService: VscodeService,
        private themeServe: HyThemeService) { }

    /**
     * 初始化
     */
    ngOnInit() {
        // 添加页面监听事件来处理java的事件
        windowJava.JavaMessageBridge = this.vscodeService.handleEvent;
        windowJava.switchTheme = this.vscodeService.handleSwitchTheme;

        // 此变量作为占位符，其内容值会被替换，用于页面第一次跳转
        const data = (top as any).navigatorPage.data;
        this.router.navigate([data.page], data.pageParams);

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
     * 左边距
     */
    public toggleClick(isHide: boolean): void {
        this.marginLeft = isHide ? '0' : '250px';
    }

    /**
     * level1
     */
    public clickLevel1(): void {
    }

    /**
     * level2
     */
    public clickLevel2(): void {
    }

    /**
     * ngOnDestroy钩子函数
     */
    ngOnDestroy() {
        // 每一个使用该服务的组件,在Destroy的时候,需要this.subscription.unsubscribe(),接触监听的作用
        this.subscription.unsubscribe();
    }

    /**
     * ngAfterViewInit钩子函数
     */
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
      const option = {
        url: '/customize/',
        timeout: 3000,
        advFeedback: true
      };
      this.vscodeService.get(option, (res: any) => {
        if (res === 'timeout') {
          const message = {
            cmd: 'openAdviceLinkError',
            data: {
                module: 'porting'
            }
          };
          this.vscodeService.postMessage(message, null);
        } else {
          const a = document.createElement('a');
          a.setAttribute('href', event);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }
}
