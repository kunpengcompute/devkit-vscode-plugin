import { Component, OnInit, Input } from '@angular/core';
import {VscodeService, COLOR_THEME, currentTheme} from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';

@Component({
    selector: 'app-nodata',
    templateUrl: './nodata.component.html',
    styleUrls: ['./nodata.component.scss'],
})
export class NodataComponent implements OnInit {

    /**
     * 提示文字
     */
    @Input() tip: string;
    /**
     * 字体大小，请自带单位
     */
    @Input() fontSize: string;
    /**
     * 图片大小，请自带单位
     */
    @Input() imgSize: string;
    public i18n: any;
    public currTheme: any;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    constructor(
        private vscodeService: VscodeService,
        private i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
    }
}
