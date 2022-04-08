import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../../service/i18n.service';

@Component({
    selector: 'app-sample-io-detail',
    templateUrl: './sample-io-detail.component.html',
    styleUrls: ['./sample-io-detail.component.scss']
})
export class SampleIoDetailComponent implements OnInit, OnDestroy {
    public i18n: any;
    constructor(
        private i18nService: I18nService,
        private router: Router, private route: ActivatedRoute) {
        this.i18n = this.i18nService.I18n();
    }
    public ioTabs: any[] = [];
    public showType: string;

    /**
     * ngOnInit
     */
    ngOnInit() {
        const tabs = [];
        const enableFileIO = (self as any).webviewSession.getItem('enableFileIO');
        const enableSocketIO = (self as any).webviewSession.getItem('enableSocketIO');
        if (enableFileIO) {
            tabs.push('fileIo');
        }
        if (enableSocketIO) {
            tabs.push('socketIo');
        }
        this.showType = tabs[0];
        tabs.forEach((tab) => {
            const flag = tab === 'fileIo' ? enableFileIO : enableSocketIO;
            this.ioTabs.push({
                title: this.i18n.protalserver_profiling_tab[tab],
                link: tab,
                active: false,
                show: flag
            });
        });
        this.ioTabs[0].active = true;
        const routerState = '_routerState';
        if (this.showType === 'socketIo' && (this.route.snapshot as any)[routerState].url.indexOf('socketIo') === -1) {
            this.router.navigate([`./${this.ioTabs[0].link}`], { relativeTo: this.route });
        }
    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy(): void {
    }

    /**
     * activeChange
     * @param index index
     */
    public activeChange(index: number) {
        this.ioTabs.forEach((tab, i) => {
            tab.active = i === index;
        });
    }

}
