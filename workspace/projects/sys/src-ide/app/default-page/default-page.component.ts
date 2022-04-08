import { Component, OnInit, Input, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';
import { HyThemeService, HyTheme } from 'hyper';

@Component({
    selector: 'app-default-page',
    templateUrl: './default-page.component.html',
    styleUrls: ['./default-page.component.scss']
})
export class DefaultPageComponent implements OnInit {
    /**
     * 使用场景
     *   1.无数据(默认值): 'noData'
     *   2.错误代码: 'errorCode'
     *   3.网络中断: 'interrupt'
     */
    @Input() scene = 'noData';
    // 提示文本
    @Input() text: string;
    // 图片
    @Input() image = {
        dark: './assets/img/projects/nodata-dark.png',
        light: './assets/img/projects/nodata-light.png',
    };
    // 容器高度(默认值: '198px')
    @Input() height = '198px';
    // 背景颜色(默认值: '#161616')
    @Input() bgColor = 'var(--table-color-background-nodata)';
    // 错误代码(如: 404)
    @Input() errorCode: string;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public sanitizer: DomSanitizer,
        private themeServe: HyThemeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public i18n: any;
    // 错误代码数组(如: [4, 0, 4])
    public errorCodeArr: number[];
    // 主题相关属性
    hyTheme = HyTheme;
    public currTheme = HyTheme.Dark;

    public networkStatus = true;
    /**
     * 监听网络连接事件
     */
    @HostListener('window:online')
    onLine() {
        this.networkStatus = true;
    }

    /**
     * 监听网络中断事件
     */
    @HostListener('window:offline')
    offLine() {
        this.networkStatus = false;
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        this.themeServe.subscribe((msg: HyTheme) => {
            this.currTheme = msg;
        });

        if (this.errorCode) {
            this.errorCodeArr = this.errorCode.split('').map((item) => parseInt(item, 10));
        }
    }
}
