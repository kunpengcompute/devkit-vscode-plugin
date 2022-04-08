import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { SamplieDownloadService } from '../../service/samplie-cache.service';
@Component({
    selector: 'app-sample-storage',
    templateUrl: './sample-storage.component.html',
    styleUrls: ['./sample-storage.component.scss']
})
export class SampleStorageComponent implements OnInit {
    public i18n: any;
    constructor(
        private router: ActivatedRoute,
        private i18nService: I18nService,
        private downloadService: SamplieDownloadService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public tabs = 1;
    public show = true;
    /**
     * 初始化
     */
    ngOnInit() {
        this.router.queryParams.subscribe((val) => {
            this.show = val.enableOldObjectSample === 'true';
            this.updateWebViewPage();
        });
    }
    /**
     * 切换选项卡
     */
    public activeChange(index: number) {
        this.tabs = index;
        this.downloadService.downloadItems.env.suggestArr.forEach((suggest) => {
            suggest.state = false;
        });
        this.downloadService.downloadItems.gc.suggestArr.forEach((suggest) => {
            suggest.state = false;
        });
        this.downloadService.downloadItems.leak.suggestArr.forEach((suggest) => {
            suggest.state = false;
        });
        this.updateWebViewPage();
    }
    /**
     * intellij刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}
