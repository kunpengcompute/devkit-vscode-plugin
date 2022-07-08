"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
const core_1 = require("@angular/core");
const hyper_1 = require("hyper");
const THEME_DICT = new Map([
    [1 /* Dark */, hyper_1.HyTheme.Dark],
    [2 /* Light */, hyper_1.HyTheme.Light]
]);
let AppComponent = class AppComponent {
    constructor(messageervice, translate, router, vscodeService, utils, themeServe) {
        this.messageervice = messageervice;
        this.translate = translate;
        this.router = router;
        this.vscodeService = vscodeService;
        this.utils = utils;
        this.themeServe = themeServe;
        this.showAdviceIcon = false;
    }
    ngOnInit() {
        // 此变量作为占位符，其内容值会被替换，用于页面第一次跳转
        const data = self.navigatorPage.data;
        // 当 extension 新开一个 panel 时，它会把一些所需的参数放在路由的查询参数中
        // 查询参数有: id、
       
        data.webViewSearch = this.router.parseUrl(window.location?.search)?.queryParams ?? {};
        this.router.navigate([data.page], data.pageParams);
        // vscode颜色主题
        switch (document.body.className) {
            case 'vscode-light':
                this.themeServe.notify(hyper_1.HyTheme.Light);
                break;
            case 'vscode-dark':
                this.themeServe.notify(hyper_1.HyTheme.Dark);
                break;
            default:
                this.themeServe.notify(hyper_1.HyTheme.Dark);
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
    ngAfterViewInit() {
        self.webviewSession.getItem('language') === 'zh-cn'
            ? this.showAdviceIcon = true
            : this.showAdviceIcon = false;
        this.subscription = this.messageervice.getMessage().subscribe(msg => {
        });
    }
    /**
     * 点击建议反馈图标
     */
    openAdvice(event) {
        this.utils.openVocAdvice(event);
    }
};
__decorate([
    (0, core_1.ViewChild)('adviceIcon')
], AppComponent.prototype, "adviceIcon", void 0);
AppComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss']
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map