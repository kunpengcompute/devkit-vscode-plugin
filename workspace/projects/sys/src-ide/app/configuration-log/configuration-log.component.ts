import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import {VscodeService, COLOR_THEME, currentTheme} from '../service/vscode.service';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { ToolType } from 'projects/domain';

@Component({
    selector: 'app-configuration-log',
    templateUrl: './configuration-log.component.html',
    styleUrls: ['./configuration-log.component.scss']
})
export class ConfigurationLogComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() status: any;
    @Input() get collectionLog() {
        return this.collectionLogs;
    }
    set collectionLog(val) {
        this.collectionLogs = val;
        if (this.collectionLogs.all !== undefined) {
            this.collectionLogs.all = this.splitLogInfo(this.collectionLogs.all);
        }
    }
    i18n: any;
    private url: any;
    public collectionLogs: any;
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private urlService: UrlService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
        this.url = this.urlService.Url();
    }

    public Acq: Array<any> = [];
    public Data: Array<any> = [];
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        const toolType = sessionStorage.getItem('toolType');
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 取消状态停止查询采集日志
        if (this.status === 'Cancelled') { return; }
        // 如果父组件已经处理过采集日志，停止查询
        if (this.collectionLog) {
            return;
        }
        let url = '';
        if (this.analysisType === 'task_contrast') {
            url = '/tasks/taskcontrast/collection-logs/?taskId=' + this.taskid;
        } else {
            url = this.url.toolTask +
                encodeURIComponent(this.taskid) +
                (toolType === ToolType.DIAGNOSE ? '' : '/common') +
                '/collection-logs/?node-id=' +
                this.nodeid +
                '&nav-name=Collection_Log';
        }
        this.vscodeService.get({ url }, (resp: any) => {
            if (resp.data && resp.data.process) {
                this.Data = this.splitLogInfo(resp.data.process);
            }
            if (resp.data && resp.data.Collect) {
                this.Acq = this.splitLogInfo(resp.data.Collect);
            }

            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private splitLogInfo(logInfo: any) {
        const data: any = [];
        logInfo.forEach((element: string) => {
            const index = element.indexOf('|');
            if (index > 0) {
                element = '[' + element.substring(0, index) + ']      ' + element.substring(index + 1);
            }
            data.push(element);
        });
        return data;
    }
}
