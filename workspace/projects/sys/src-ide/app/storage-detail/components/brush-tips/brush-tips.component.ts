import { Component, Input, OnInit } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import {COLOR_THEME, currentTheme} from 'projects/sys/src-ide/app/service/vscode.service';

@Component({
    selector: 'app-brush-tips',
    templateUrl: './brush-tips.component.html',
    styleUrls: ['./brush-tips.component.scss'],
})
export class BrushTipsComponent implements OnInit {

    @Input() type: string;
    @Input() readChecked: boolean;

    public i18n: any;
    public tips = '';
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    public isIntellij = self.webviewSession.getItem('tuningOperation') === 'hypertuner';
    constructor(
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();
        if (this.type === 'iops') {
            this.tips = this.i18n.storageIO.apis_tips;
        } else {
            this.tips = this.i18n.storageIO.diskio_tips;
        }
    }

    /**
     * 下次不再提示
     */
    public changeBrushTip(e) {
        sessionStorage.setItem('brushTip', e);
    }
}
