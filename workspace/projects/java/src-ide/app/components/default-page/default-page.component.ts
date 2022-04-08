import { Component, OnInit, Input, HostListener, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { I18nService } from '../../service/i18n.service';
import { COLOR_THEME, VscodeService } from '../../service/vscode.service';
import { Utils } from '../../service/utils.service';
import { createSvg } from '../../util';

@Component({
    selector: 'app-default-page',
    templateUrl: './default-page.component.html',
    styleUrls: ['./default-page.component.scss']
})
export class DefaultPageComponent implements OnInit, OnChanges {
    /**
     * 使用场景
     *   1.无数据(默认值): 'noData'
     *   2.错误代码: 'errorCode'
     *   3.网络中断: 'interrupt'
     *   4.采集中：'creatingTask'
     */
    @Input() scene = 'noData';
    // 提示文本
    @Input() text: string;
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
    public generateID: any;
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';

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
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        if (this.currTheme === COLOR_THEME.Light) {
            this.bgColor = '#fff';
        }

        if (this.errorCode) {
            this.errorCodeArr = this.errorCode.split('').map((item) => parseInt(item, 10));
        }
    }
    /**
     * 组件变化
     */
    ngOnChanges() {
        if (this.scene === 'creatingTask') {
            if (document.body.className.indexOf('vscode-light') !== -1) {
                this.currTheme = COLOR_THEME.Light;
            } else {
                this.currTheme = COLOR_THEME.Dark;
            }
            this.generateID = Utils.generateConversationId(8);
            const path = this.currTheme === COLOR_THEME.Dark ? './assets/img/collecting/dark/loading-dark.json' :
                './assets/img/collecting/light/loading-light.json';
            setTimeout(() => {
                createSvg('#' + this.generateID, path);
            }, 10);
        }
    }
}
