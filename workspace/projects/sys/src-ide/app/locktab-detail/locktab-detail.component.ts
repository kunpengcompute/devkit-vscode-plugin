import {Component, OnInit, Input, NgZone, ChangeDetectorRef} from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { LeftShowService } from './../service/left-show.service';

@Component({
    selector: 'app-locktab-detail',
    templateUrl: './locktab-detail.component.html',
    styleUrls: ['./locktab-detail.component.scss']
})
export class LocktabDetailComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() id: any;
    @Input() nodeid: any;
    i18n: any;
    public detailList: Array<any> = [];
    constructor(
        public i18nService: I18nService,
        public leftShowService: LeftShowService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_summary,
                    active: true,
                    disable: false,
                },
                {
                    title: this.i18n.lock.timing,
                    active: false,
                    disable: false,
                },
                {
                    title: this.i18n.common_term_task_tab_congration,
                    active: false,
                    disable: false,
                },
                {
                    title: this.i18n.common_term_task_tab_log,
                    active: false,
                    disable: false,
                }
            ];
        } else if (this.status === 'Created') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration,
                    active: true,
                    disable: false,
                }
            ];
        } else {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration,
                    active: true,
                    disable: false,
                },
                {
                    title: this.i18n.common_term_task_tab_log,
                    active: false,
                    disable: false,
                }
            ];
        }
        this.updateWebViewPage();
    }

    /**
     * 改变
     */
    public change() {
        this.leftShowService.leftIfShow.next();
    }

    /**
     * intellIj刷新webview页面
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
