import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-profile-web',
    templateUrl: './profile-web.component.html',
    styleUrls: ['./profile-web.component.scss']
})
export class ProfileWebComponent implements OnInit {
    public i18n: any;
    constructor(
        private i18nService: I18nService,
        private downloadService: ProfileDownloadService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public webTabs: any[] = [];
    /**
     * ngOnInit
     */
    ngOnInit() {
        const isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (isDownload) {
            this.downloadService.downloadItems.tabs.forEach((tab: any) => {
                if (tab.parentTabName === 'web') {
                    this.webTabs.push({ label: tab.tabName, link: tab.link, selected: false });
                }
            });
            this.webTabs[0].selected = true;
        } else {
            this.webTabs = [
                {
                    label: 'httpRequest',
                    selected: true,
                    link: 'httpRequest'
                },
                {
                    label: 'springBoot',
                    selected: false,
                    link: 'springBoot'
                }
            ];
        }
        this.router.navigate([this.webTabs[0].link], { relativeTo: this.route });
    }
    /**
     * toggleTab
     */
    public toggleTab(index: number) {
        this.webTabs.forEach((tab, i) => {
            tab.selected = i === index;
        });
    }
}
