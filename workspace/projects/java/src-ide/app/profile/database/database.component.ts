import { Component, OnInit, OnDestroy } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { Subscription } from 'rxjs';
import { ProfileDownloadService } from '../../service/profile-download.service';
import { MessageService } from '../../service/message.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-database',
    templateUrl: './database.component.html',
    styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit, OnDestroy {

    public i18n: any;
    constructor(
        private i18nService: I18nService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService,
        private router: Router,
        private route: ActivatedRoute) {
        this.i18n = this.i18nService.I18n();
    }

    public showDatabaseTab: boolean;
    public databaseTabs: any[] = [];
    private showSourceSub: Subscription;

    /**
     * 初始化
     */
    ngOnInit() {
        this.showDatabaseTab = JSON.parse((self as any).webviewSession.getItem('showSourceCode'));
        const isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (isDownload) {
            this.downloadService.downloadItems.tabs.forEach((tab: any) => {
                if (tab.parentTabName === 'database') {
                    this.databaseTabs.push({
                        title: this.i18n.protalserver_profiling_tab[tab.tabName],
                        link: tab.link,
                        active: false
                    });
                }
            });
            this.databaseTabs[0].active = true;
        } else {
            const tabs = ['jdbc', 'jdbcpool', 'mongodb', 'cassandra', 'hbase'];
            tabs.forEach((tab, idx) => {
                this.databaseTabs.push({
                    title: this.i18n.protalserver_profiling_tab[tab],
                    link: tab,
                    active: idx === 0
                });
            });
        }
        this.router.navigate([this.databaseTabs[0].link], { relativeTo: this.route });
        this.showSourceSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'showDatabaseTab') {
                this.showDatabaseTab = msg.data;
            }
        });
    }
    /**
     * 销毁
     */
    ngOnDestroy(): void {
        if (this.showSourceSub) { this.showSourceSub.unsubscribe(); }
    }

    /**
     * 监听active
     */
    public activeChange(index: number) {
        this.databaseTabs.forEach((tab) => {
            tab.active = false;
        });
        this.databaseTabs[index].active = true;
        this.downloadService.downloadItems.currentTabPage =
        this.i18n.protalserver_profiling_tab[this.databaseTabs[index].link];
        this.downloadService.clearTabs.currentTabPage =
        this.i18n.protalserver_profiling_tab[this.databaseTabs[index].link];
    }
}
