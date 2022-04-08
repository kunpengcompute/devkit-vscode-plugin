import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { ProfileDownloadService } from '../../../service/profile-download.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-io-detail',
    templateUrl: './io-detail.component.html',
    styleUrls: ['./io-detail.component.scss']
})
export class IoDetailComponent implements OnInit {
    public i18n: any;
    constructor(
        private i18nService: I18nService,
        private downloadService: ProfileDownloadService,
        private router: Router,
        private route: ActivatedRoute ) {
        this.i18n = this.i18nService.I18n();
    }

    public ioTabs: any[] = [];

    /**
     * ngOnInit
     */
    ngOnInit() {
        const isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (isDownload) {
            this.downloadService.downloadItems.tabs.forEach((tab: any) => {
                if (tab.parentTabName === 'io') {
                    this.ioTabs.push({ title: this.i18n.protalserver_profiling_tab[tab.tabName],
                       link: tab.link, active: false });
                }
            });
            this.ioTabs[0].active = true;
        } else {
            const tabs = ['fileIo', 'socketIo'];
            tabs.forEach((tab, idx) => {
                this.ioTabs.push({
                    title: this.i18n.protalserver_profiling_tab[tab],
                    link: tab,
                    active: idx === 0
                });
            });
        }
        this.router.navigate([this.ioTabs[0].link], { relativeTo: this.route });
    }

    /**
     * activeChange
     * @param index index
     */
    public activeChange(index: number) {
        this.ioTabs.forEach((tab, i) => {
            tab.active = i === index ? true : false;
        });
        this.downloadService.downloadItems.currentTabPage =
        this.i18n.protalserver_profiling_tab[this.ioTabs[index].link];
        this.downloadService.clearTabs.currentTabPage = this.i18n.protalserver_profiling_tab[this.ioTabs[index].link];
    }

}
