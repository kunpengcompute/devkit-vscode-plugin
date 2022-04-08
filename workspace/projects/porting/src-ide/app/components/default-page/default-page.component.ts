import { Component, OnInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';

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
        dark: './assets/img/default-page/dark_nodata.png',
        light: './assets/img/default-page/light_nodata.png',
    };
    // 容器高度(默认值: '198px')
    @Input() height = '198px';
    // 背景颜色(默认值: '#161616')
    @Input() bgColor = '#161616';
    // 错误代码(如: 404)
    @Input() errorCode: string;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public sanitizer: DomSanitizer,
        public changeDetectorRef: ChangeDetectorRef,
        private route: ActivatedRoute,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public i18n: any;
    // 错误代码数组(如: [4, 0, 4])
    public errorCodeArr: number[];
    // 主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;

    public networkStatus = true;
    public intellijFlag = false;
    public noDataImage: {
        dark: string,
        light: string
    } = {
        dark: '',
        light: ''
    };
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
        this.route.queryParams.subscribe((data) => {
            this.intellijFlag = (data.intellijFlag) ? true : false;
            if (this.intellijFlag) {
                this.noDataImage.dark = './assets/img/default-page/dark-nodata-intellij.png';
                this.noDataImage.light = './assets/img/default-page/light-nodata-intellij.png';
            } else {
                this.noDataImage.dark = './assets/img/default-page/dark-nodata.svg';
                this.noDataImage.light = './assets/img/default-page/light-nodata.svg';
            }
        });
        // vscode颜色主题适配
        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            if (this.intellijFlag) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });

        if (this.currTheme === COLOR_THEME.Light) {
            this.bgColor = '#fff';
        }

        if (this.errorCode) {
            this.errorCodeArr = this.errorCode.split('').map((item) => parseInt(item, 10));
        }

    }
}
