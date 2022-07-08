import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../service/i18n.service';

import { VscodeService, COLOR_THEME } from '../service/vscode.service';
@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent implements OnInit {
    /**
     * 尺寸:
     *   1.min(默认值): 局部加载时使用小尺寸
     *   2.max: 全局加载时使用大尺寸
     */
    @Input() size = 'min';
    // loading下方的提示文本
    @Input() text: string;
    // 容器高度(默认值: '198px')
    @Input() height = '198px';
    // 背景颜色(默认值: '#161616')
    @Input() bgColor = '#161616';

    public i18n: any;
    public circleNum = 8;
    public circleBoxWidth: number;
    public circleItemWidth: number;
    public currTheme = COLOR_THEME.Dark;

    constructor(
        public i18nService: I18nService,
        private cdr: ChangeDetectorRef,
        private vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // vscode颜色主题适配
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        if (this.size === 'max') {
            if (this.bgColor === '#161616') {
                this.bgColor = '#1e1e1e';
            }
            this.circleBoxWidth = 100;
            this.circleItemWidth = 25;
        } else {
            this.circleBoxWidth = 56;
            this.circleItemWidth = 14;
        }

        if (this.currTheme === COLOR_THEME.Light && this.bgColor === '#161616') {
            this.bgColor = '#fff';
        }

        this.cdr.markForCheck();
    }
}
