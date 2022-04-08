import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-heapdump-report',
  templateUrl: './heapdump-report.component.html',
  styleUrls: ['./heapdump-report.component.scss']
})
export class HeapdumpReportComponent implements OnInit {

    public heapdumpId: any;
    public tabList: Array<any> = [];
    public i18n: any;

    constructor(
        private route: ActivatedRoute,
        public changeDetectorRef: ChangeDetectorRef,
        public zone: NgZone,
        private i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.tabList = [
            {
              title: this.i18n.plugins_common_report.memory_dump,
              active: true
            },
            {
              title: this.i18n.plugins_common_report.report_info,
              active: false,
            }
        ];
        this.route.queryParams.subscribe(data => {
            this.heapdumpId = data.taskId;
        });
        this.updateWebViewPage();
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if ((self as any).webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
