import { Component, OnInit, Input } from '@angular/core';
import { COLOR_THEME, VscodeService } from 'projects/sys/src-ide/app/service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { HyTheme, HyThemeService } from 'hyper';

@Component({
    selector: 'app-typical-config',
    templateUrl: './typical-config.component.html',
    styleUrls: ['./typical-config.component.scss']
})
export class TypicalConfigComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() tabShowing: boolean;
    @Input() sceneSolution: any;

    public i18n: any;
    public currTheme: HyTheme;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private themeServe: HyThemeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * 组件初始化
     */
    ngOnInit() {
        this.themeServe.subscribe(msg => {
            this.currTheme = msg;
        });
        if (document.body.className.includes('vscode-dark')) {
            this.currTheme = HyTheme.Dark;
        } else {
            this.currTheme = HyTheme.Light;
        }
    }
}
