import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import {currentTheme, VscodeService} from '../service/vscode.service';

/**
 * 颜色主题常量定义
 */
export const enum COLOR_THEME {
    Dark = 1,
    Light = 2
}
@Component({
    selector: 'app-msg-suggestion',
    templateUrl: './msg-suggestion.component.html',
    styleUrls: ['./msg-suggestion.component.scss']
})

export class MsgSuggestionComponent implements OnInit {
    @Input() suggestMsg: any;
    // 部分任务（伪共享分析）只有一条优化建议，不用显示最外层的优化建议头部
    @Input() showHeader = true;
    public currTheme: any = COLOR_THEME.Dark;
    public i18n: any;
    public toggleFlag = true;
    public flag = false;
    public isIntellij = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.suggestMsg.map(item => {
            item.isShow = false;
        });
    }
    /**
     * msg点击事件
     * @param i number
     */
    public msgClick(i) {
        this.suggestMsg[i].isShow = !this.suggestMsg[i].isShow;
    }

    /**
     * 优化建议 toggle
     */
    msgHeaderClick() {
        this.toggleFlag = !this.toggleFlag;
        $('.msg-main').toggle(300);
    }
}

