import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-profile-gc',
  templateUrl: './profile-gc.component.html',
  styleUrls: ['./profile-gc.component.scss']
})
export class ProfileGcComponent implements OnInit {

    public i18n: any;
    constructor(
        private i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public gcTabs = [
        { label: 'gcAnalysis', selected: true, link: 'analysis' },
        { label: 'gcLog', selected: false, link: 'log' }
    ];
    private isDownload = false;
    /**
     * OnInit
     */
    ngOnInit() {
        this.isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (this.isDownload) {
            this.gcTabs.splice(1, 1);
        }
    }
    /**
     * toggleTab
     */
    public toggleTab(index: number) {
        this.gcTabs.forEach((tab, i) => {
            tab.selected = i === index;
        });
    }
}
